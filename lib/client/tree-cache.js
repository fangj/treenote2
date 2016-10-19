'use strict';

var LRU = require('lru-cache'),
    cache = LRU(5000);
var _ = require('lodash');

var _api;
var api = {
  read: read,
  read_nodes: read_nodes,
  mk_son_by_data: mk_son_by_data,
  mk_son_by_name: mk_son_by_name,
  mk_brother_by_data: mk_brother_by_data,
  remove: remove,
  update: update,
  mv_as_son: mv_as_son,
  mv_as_brother: mv_as_brother,
  read_big_node: read_big_node
};
function factory(_prefix) {
  _api = require('./tree')(_prefix);
  return api;
}
module.exports = factory;

function clone(obj) {
  if (!obj) {
    return null;
  }
  return JSON.parse(JSON.stringify(obj));
}

function read(gid) {
  var force = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  if (!gid) {
    console.warn('read:invalid param', gid);
    return Promise.resolve(null);
  }
  if (!force && cache.has(gid)) {
    return Promise.resolve(cache.get(gid));
  }
  return _api.read(gid).then(function (node) {
    cache.set(node._id, node);
    return node;
  });
}

function read_nodes(gids) {
  if (!gids || gids.length === 0) {
    return Promise.resolve([]);
  }
  var cachedNodes = [];
  var unCachedGids = [];
  gids.map(function (gid) {
    if (cache.has(gid)) {
      cachedNodes.push(cache.get(gid));
    } else {
      unCachedGids.push(gid);
    }
  });
  if (unCachedGids.length === 0) {
    return Promise.resolve(cachedNodes.map(clone)); //全在cache中直接返回 //返回克隆避免缓存被修改
  }
  //否则合并返回
  return _api.read_nodes(unCachedGids).then(function (new_nodes) {
    new_nodes.map(function (node) {
      return cache.set(node._id, node);
    }); //更新nodes cache
    // 调整顺序
    var tmp = {};
    cachedNodes.map(function (node) {
      return tmp[node._id] = node;
    });
    new_nodes.map(function (node) {
      return tmp[node._id] = node;
    });
    var nodes = gids.map(function (gid) {
      return clone(tmp[gid]);
    }); //返回克隆避免缓存被修改
    return _.compact(nodes);
  });
}

function mk_son_by_data(pgid, data) {
  return _api.mk_son_by_data(pgid, data).then(function (node) {
    cache.set(node._id, node); //更新子节点
    cache.del(pgid); //删除旧的父节点
    return node; //返回新的子节点
  });
}

function mk_son_by_name(pgid, name) {
  return _api.mk_son_by_name(pgid, name).then(function (node) {
    cache.set(node._id, node); //更新子节点
    cache.del(pgid); //删除旧的父节点
    return node; //返回新的子节点
  });
}

function _remove_parent_from_cache(gid) {
  return api.read(gid).then(function (node) {
    cache.del(node._link.p);
  });
}

function mk_brother_by_data(bgid, data) {
  return _remove_parent_from_cache(bgid).then(function (_) {
    return _api.mk_brother_by_data(bgid, data);
  });
}

/**
 * 删除节点，并刷新父节点和删除子节点，返回被删除的节点
 * 注意，返回值与api.remove不一致
 */
function remove(gid) {
  //删除某节点后，缓存中该节点的父节点要更新，后续子节点都要删除
  return read(gid).then(function (node) {
    return (//删除前先取出。待会儿还有用。
      //删除节点
      _api.remove(gid).then(function (res) {
        if (node) {
          //如果删除前没有取到当前节点，父节点将无法刷新。
          //递归删除cache中所有子节点
          _remove_all_children(node._link.children);
          cache.del(node._link.p); //刷新父节点
          return node; //返回被删除的节点
        }
        return null;
      })
    );
  });
}

//递归删除cache中所有子节点
function _remove_all_children(gids) {
  if (!gids) {
    return;
  }
  gids.map(function (gid) {
    if (cache.has(gid)) {
      _remove_all_children(cache.get(gid)._link.chilren);
      cache.del(gid);
    }
  });
}

function update(gid, data) {
  return _api.update(gid, data).then(function (node) {
    return cache.set(node._id, node);
  });
}

function mv_as_son(sgid, dgid) {
  cache.del(dgid);
  return _remove_parent_from_cache(sgid).then(function (_) {
    return _api.mv_as_son(sgid, dgid).then(function (node) {
      cache.set(node._id, node);
      return node;
    });
  });
}

function mv_as_brother(sgid, dgid) {
  return _remove_parent_from_cache(sgid).then(function (_) {
    return _remove_parent_from_cache(dgid);
  }).then(function (_) {
    return _api.mv_as_brother(sgid, dgid).then(function (node) {
      cache.set(node._id, node);
      return node;
    });
  });
}

//not cached
function read_big_node(gid) {
  var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  return _api.read_big_node(gid, level);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdHJlZS1jYWNoZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksTUFBTSxRQUFRLFdBQVIsQ0FBVjtBQUFBLElBQ0ksUUFBTyxJQUFJLElBQUosQ0FEWDtBQUVBLElBQUksSUFBRSxRQUFRLFFBQVIsQ0FBTjs7QUFFQSxJQUFJLElBQUo7QUFDQSxJQUFNLE1BQU07QUFDVixZQURVO0FBRVYsd0JBRlU7QUFHVixnQ0FIVTtBQUlWLGdDQUpVO0FBS1Ysd0NBTFU7QUFNVixnQkFOVTtBQU9WLGdCQVBVO0FBUVYsc0JBUlU7QUFTViw4QkFUVTtBQVVWO0FBVlUsQ0FBWjtBQVlBLFNBQVMsT0FBVCxDQUFpQixPQUFqQixFQUEwQjtBQUN4QixTQUFLLFFBQVEsUUFBUixFQUFrQixPQUFsQixDQUFMO0FBQ0EsU0FBTyxHQUFQO0FBQ0Q7QUFDRCxPQUFPLE9BQVAsR0FBaUIsT0FBakI7O0FBRUEsU0FBUyxLQUFULENBQWUsR0FBZixFQUFtQjtBQUNqQixNQUFHLENBQUMsR0FBSixFQUFRO0FBQUMsV0FBTyxJQUFQO0FBQWE7QUFDdEIsU0FBTyxLQUFLLEtBQUwsQ0FBVyxLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQVgsQ0FBUDtBQUNEOztBQUVELFNBQVMsSUFBVCxDQUFjLEdBQWQsRUFBK0I7QUFBQSxNQUFiLEtBQWEseURBQVAsS0FBTzs7QUFDN0IsTUFBRyxDQUFDLEdBQUosRUFBUTtBQUNOLFlBQVEsSUFBUixDQUFhLG9CQUFiLEVBQWtDLEdBQWxDO0FBQ0EsV0FBTyxRQUFRLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBUDtBQUNEO0FBQ0QsTUFBSSxDQUFDLEtBQUQsSUFBVSxNQUFNLEdBQU4sQ0FBVSxHQUFWLENBQWQsRUFBOEI7QUFBQyxXQUFPLFFBQVEsT0FBUixDQUFnQixNQUFNLEdBQU4sQ0FBVSxHQUFWLENBQWhCLENBQVA7QUFBd0M7QUFDdkUsU0FBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLEVBQWUsSUFBZixD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QixFQUFnQyxJQUFoQyxDQUFxQztBQUFBLFdBQUcsS0FBSyxTQUFMLENBQWUsSUFBZixFQUFvQixJQUFwQixFQUEwQixJQUExQixDQUErQixnQkFBTTtBQUNsRixZQUFNLEdBQU4sQ0FBVSxLQUFLLEdBQWYsRUFBbUIsSUFBbkI7QUFDQSxhQUFPLElBQVA7QUFDRCxLQUg4QyxDQUFIO0FBQUEsR0FBckMsQ0FBUDtBQUlEOztBQUVELFNBQVUsYUFBVixDQUF3QixJQUF4QixFQUE2QixJQUE3QixFQUFrQztBQUNoQyxTQUFPLDBCQUEwQixJQUExQixFQUNOLElBRE0sQ0FDRDtBQUFBLFdBQUcsMEJBQTBCLElBQTFCLENBQUg7QUFBQSxHQURDLEVBRU4sSUFGTSxDQUVEO0FBQUEsV0FBRyxLQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBd0IsSUFBeEIsRUFBOEIsSUFBOUIsQ0FBbUMsZ0JBQU07QUFDaEQsWUFBTSxHQUFOLENBQVUsS0FBSyxHQUFmLEVBQW1CLElBQW5CO0FBQ0EsYUFBTyxJQUFQO0FBQ0QsS0FIUSxDQUFIO0FBQUEsR0FGQyxDQUFQO0FBTUQ7O0FBRUQ7QUFDQSxTQUFTLGFBQVQsQ0FBdUIsR0FBdkIsRUFBb0M7QUFBQSxNQUFULEtBQVMseURBQUgsQ0FBRzs7QUFDbEMsU0FBTyxLQUFLLGFBQUwsQ0FBbUIsR0FBbkIsRUFBdUIsS0FBdkIsQ0FBUDtBQUNEIiwiZmlsZSI6InRyZWUtY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgTFJVID0gcmVxdWlyZSgnbHJ1LWNhY2hlJylcclxuICAsIGNhY2hlPSBMUlUoNTAwMCk7XHJcbnZhciBfPXJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxudmFyIF9hcGk7XHJcbmNvbnN0IGFwaSA9IHtcclxuICByZWFkLFxyXG4gIHJlYWRfbm9kZXMsXHJcbiAgbWtfc29uX2J5X2RhdGEsXHJcbiAgbWtfc29uX2J5X25hbWUsXHJcbiAgbWtfYnJvdGhlcl9ieV9kYXRhLFxyXG4gIHJlbW92ZSxcclxuICB1cGRhdGUsXHJcbiAgbXZfYXNfc29uLFxyXG4gIG12X2FzX2Jyb3RoZXIsXHJcbiAgcmVhZF9iaWdfbm9kZSxcclxufTtcclxuZnVuY3Rpb24gZmFjdG9yeShfcHJlZml4KSB7XHJcbiAgX2FwaT1yZXF1aXJlKCcuL3RyZWUnKShfcHJlZml4KTtcclxuICByZXR1cm4gYXBpO1xyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcclxuXHJcbmZ1bmN0aW9uIGNsb25lKG9iail7XHJcbiAgaWYoIW9iail7cmV0dXJuIG51bGw7fVxyXG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkKGdpZCxmb3JjZT1mYWxzZSkge1xyXG4gIGlmKCFnaWQpe1xyXG4gICAgY29uc29sZS53YXJuKCdyZWFkOmludmFsaWQgcGFyYW0nLGdpZCk7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xyXG4gIH1cclxuICBpZiAoIWZvcmNlICYmIGNhY2hlLmhhcyhnaWQpKSB7cmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZS5nZXQoZ2lkKSk7fVxyXG4gIHJldHVybiBfYXBpLnJlYWQoZ2lkKS50aGVuKG5vZGUgPT4ge1xyXG4gICAgY2FjaGUuc2V0KG5vZGUuX2lkLG5vZGUpO1xyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xyXG4gIGlmICghZ2lkcyB8fCBnaWRzLmxlbmd0aCA9PT0gMCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoW10pO31cclxuICBsZXQgY2FjaGVkTm9kZXMgPSBbXTtcclxuICBsZXQgdW5DYWNoZWRHaWRzID0gW107XHJcbiAgZ2lkcy5tYXAoZ2lkID0+IHtcclxuICAgIGlmIChjYWNoZS5oYXMoZ2lkKSkge1xyXG4gICAgICBjYWNoZWROb2Rlcy5wdXNoKGNhY2hlLmdldChnaWQpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHVuQ2FjaGVkR2lkcy5wdXNoKGdpZCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgaWYgKHVuQ2FjaGVkR2lkcy5sZW5ndGggPT09IDApIHtcclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVkTm9kZXMubWFwKGNsb25lKSk7IC8v5YWo5ZyoY2FjaGXkuK3nm7TmjqXov5Tlm54gLy/ov5Tlm57lhYvpmobpgb/lhY3nvJPlrZjooqvkv67mlLlcclxuICB9XHJcbiAgLy/lkKbliJnlkIjlubbov5Tlm55cclxuICByZXR1cm4gX2FwaS5yZWFkX25vZGVzKHVuQ2FjaGVkR2lkcykudGhlbihuZXdfbm9kZXMgPT4ge1xyXG4gICAgbmV3X25vZGVzLm1hcChub2RlID0+IGNhY2hlLnNldChub2RlLl9pZCxub2RlKSk7IC8v5pu05pawbm9kZXMgY2FjaGVcclxuICAgIC8vIOiwg+aVtOmhuuW6j1xyXG4gICAgdmFyIHRtcD17fTtcclxuICAgIGNhY2hlZE5vZGVzLm1hcChub2RlPT50bXBbbm9kZS5faWRdPW5vZGUpO1xyXG4gICAgbmV3X25vZGVzLm1hcChub2RlPT50bXBbbm9kZS5faWRdPW5vZGUpO1xyXG4gICAgdmFyIG5vZGVzPSBnaWRzLm1hcChnaWQ9PmNsb25lKHRtcFtnaWRdKSk7IC8v6L+U5Zue5YWL6ZqG6YG/5YWN57yT5a2Y6KKr5L+u5pS5XHJcbiAgICByZXR1cm4gXy5jb21wYWN0KG5vZGVzKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBfYXBpLm1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpLnRoZW4obm9kZSA9PntcclxuICAgIGNhY2hlLnNldChub2RlLl9pZCxub2RlKTsvL+abtOaWsOWtkOiKgueCuVxyXG4gICAgY2FjaGUuZGVsKHBnaWQpOy8v5Yig6Zmk5pen55qE54i26IqC54K5XHJcbiAgICByZXR1cm4gbm9kZTsvL+i/lOWbnuaWsOeahOWtkOiKgueCuVxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XHJcbiAgcmV0dXJuIF9hcGkubWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkudGhlbihub2RlID0+e1xyXG4gICAgY2FjaGUuc2V0KG5vZGUuX2lkLG5vZGUpOy8v5pu05paw5a2Q6IqC54K5XHJcbiAgICBjYWNoZS5kZWwocGdpZCk7Ly/liKDpmaTml6fnmoTniLboioLngrlcclxuICAgIHJldHVybiBub2RlOy8v6L+U5Zue5paw55qE5a2Q6IqC54K5XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZW1vdmVfcGFyZW50X2Zyb21fY2FjaGUoZ2lkKXtcclxuICByZXR1cm4gYXBpLnJlYWQoZ2lkKS50aGVuKG5vZGU9PntcclxuICAgIGNhY2hlLmRlbChub2RlLl9saW5rLnApO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBfcmVtb3ZlX3BhcmVudF9mcm9tX2NhY2hlKGJnaWQpLnRoZW4oXz0+X2FwaS5ta19icm90aGVyX2J5X2RhdGEoYmdpZCwgZGF0YSkpO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIOWIoOmZpOiKgueCue+8jOW5tuWIt+aWsOeItuiKgueCueWSjOWIoOmZpOWtkOiKgueCue+8jOi/lOWbnuiiq+WIoOmZpOeahOiKgueCuVxyXG4gKiDms6jmhI/vvIzov5Tlm57lgLzkuI5hcGkucmVtb3Zl5LiN5LiA6Ie0XHJcbiAqL1xyXG5mdW5jdGlvbiByZW1vdmUoZ2lkKSB7XHJcbiAgLy/liKDpmaTmn5DoioLngrnlkI7vvIznvJPlrZjkuK3or6XoioLngrnnmoTniLboioLngrnopoHmm7TmlrDvvIzlkI7nu63lrZDoioLngrnpg73opoHliKDpmaRcclxuICByZXR1cm4gcmVhZChnaWQpLnRoZW4obm9kZSA9PiAvL+WIoOmZpOWJjeWFiOWPluWHuuOAguW+heS8muWEv+i/mOacieeUqOOAglxyXG4gICAgLy/liKDpmaToioLngrlcclxuICAgIF9hcGkucmVtb3ZlKGdpZCkudGhlbihyZXMgPT4ge1xyXG4gICAgICBpZiAobm9kZSkgeyAvL+WmguaenOWIoOmZpOWJjeayoeacieWPluWIsOW9k+WJjeiKgueCue+8jOeItuiKgueCueWwhuaXoOazleWIt+aWsOOAglxyXG4gICAgICAgIC8v6YCS5b2S5Yig6ZmkY2FjaGXkuK3miYDmnInlrZDoioLngrlcclxuICAgICAgICBfcmVtb3ZlX2FsbF9jaGlsZHJlbihub2RlLl9saW5rLmNoaWxkcmVuKTtcclxuICAgICAgICBjYWNoZS5kZWwobm9kZS5fbGluay5wKTsvL+WIt+aWsOeItuiKgueCuVxyXG4gICAgICAgIHJldHVybiBub2RlOy8v6L+U5Zue6KKr5Yig6Zmk55qE6IqC54K5XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9KVxyXG4gICk7XHJcbn1cclxuXHJcbi8v6YCS5b2S5Yig6ZmkY2FjaGXkuK3miYDmnInlrZDoioLngrlcclxuZnVuY3Rpb24gX3JlbW92ZV9hbGxfY2hpbGRyZW4oZ2lkcykge1xyXG4gIGlmICghZ2lkcykge3JldHVybjt9XHJcbiAgZ2lkcy5tYXAoZ2lkID0+IHtcclxuICAgIGlmIChjYWNoZS5oYXMoZ2lkKSkge1xyXG4gICAgICBfcmVtb3ZlX2FsbF9jaGlsZHJlbihjYWNoZS5nZXQoZ2lkKS5fbGluay5jaGlscmVuKTtcclxuICAgICAgY2FjaGUuZGVsKGdpZCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZShnaWQsIGRhdGEpIHtcclxuIHJldHVybiBfYXBpLnVwZGF0ZShnaWQsIGRhdGEpLnRoZW4obm9kZSA9PiBjYWNoZS5zZXQobm9kZS5faWQsIG5vZGUpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gIG12X2FzX3NvbihzZ2lkLGRnaWQpe1xyXG4gIGNhY2hlLmRlbChkZ2lkKTtcclxuICByZXR1cm4gX3JlbW92ZV9wYXJlbnRfZnJvbV9jYWNoZShzZ2lkKS50aGVuKF89Pl9hcGkubXZfYXNfc29uKHNnaWQsZGdpZCkudGhlbihub2RlPT57XHJcbiAgICBjYWNoZS5zZXQobm9kZS5faWQsbm9kZSk7XHJcbiAgICByZXR1cm4gbm9kZTtcclxuICB9KSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uICBtdl9hc19icm90aGVyKHNnaWQsZGdpZCl7XHJcbiAgcmV0dXJuIF9yZW1vdmVfcGFyZW50X2Zyb21fY2FjaGUoc2dpZClcclxuICAudGhlbihfPT5fcmVtb3ZlX3BhcmVudF9mcm9tX2NhY2hlKGRnaWQpKVxyXG4gIC50aGVuKF89Pl9hcGkubXZfYXNfYnJvdGhlcihzZ2lkLGRnaWQpLnRoZW4obm9kZT0+e1xyXG4gICAgY2FjaGUuc2V0KG5vZGUuX2lkLG5vZGUpO1xyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfSkpO1xyXG59XHJcblxyXG4vL25vdCBjYWNoZWRcclxuZnVuY3Rpb24gcmVhZF9iaWdfbm9kZShnaWQsbGV2ZWw9MCkge1xyXG4gIHJldHVybiBfYXBpLnJlYWRfYmlnX25vZGUoZ2lkLGxldmVsKTtcclxufSJdfQ==