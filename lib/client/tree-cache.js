'use strict';

var LRU = require('lru-cache'),
    cache = LRU(5000);
var _ = require('lodash');
// var cache=require('./cache');//LRU cache没有问题，是删除sgid父节点后又误读取了父节点（dgid）
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
  var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

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
  console.log('read_nodes', gids, 'unCachedGids', unCachedGids);
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
    console.log("_remove_parent_from_cache", node._link.p);
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
  return _remove_parent_from_cache(dgid) //顺序重要！要先删除目标节点dgid的父节点，因为目标节点dgid可能是sgid的父节点
  .then(function (_) {
    return _remove_parent_from_cache(sgid);
  }).then(function (_) {
    return _api.mv_as_brother(sgid, dgid).then(function (node) {
      cache.set(node._id, node);
      return node;
    });
  });
}

//not cached
function read_big_node(gid) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return _api.read_big_node(gid, level);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdHJlZS1jYWNoZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksTUFBTSxRQUFRLFdBQVIsQ0FBTjtJQUE2QixRQUFPLElBQUksSUFBSixDQUFQO0FBQ2pDLElBQUksSUFBRSxRQUFRLFFBQVIsQ0FBRjs7QUFFSixJQUFJLElBQUo7QUFDQSxJQUFNLE1BQU07QUFDVixZQURVO0FBRVYsd0JBRlU7QUFHVixnQ0FIVTtBQUlWLGdDQUpVO0FBS1Ysd0NBTFU7QUFNVixnQkFOVTtBQU9WLGdCQVBVO0FBUVYsc0JBUlU7QUFTViw4QkFUVTtBQVVWLDhCQVZVO0NBQU47QUFZTixTQUFTLE9BQVQsQ0FBaUIsT0FBakIsRUFBMEI7QUFDeEIsU0FBSyxRQUFRLFFBQVIsRUFBa0IsT0FBbEIsQ0FBTCxDQUR3QjtBQUV4QixTQUFPLEdBQVAsQ0FGd0I7Q0FBMUI7QUFJQSxPQUFPLE9BQVAsR0FBaUIsT0FBakI7O0FBRUEsU0FBUyxLQUFULENBQWUsR0FBZixFQUFtQjtBQUNqQixNQUFHLENBQUMsR0FBRCxFQUFLO0FBQUMsV0FBTyxJQUFQLENBQUQ7R0FBUjtBQUNBLFNBQU8sS0FBSyxLQUFMLENBQVcsS0FBSyxTQUFMLENBQWUsR0FBZixDQUFYLENBQVAsQ0FGaUI7Q0FBbkI7O0FBS0EsU0FBUyxJQUFULENBQWMsR0FBZCxFQUErQjtNQUFiLDRFQUFNLE1BQU87O0FBQzdCLE1BQUcsQ0FBQyxHQUFELEVBQUs7QUFDTixZQUFRLElBQVIsQ0FBYSxvQkFBYixFQUFrQyxHQUFsQyxFQURNO0FBRU4sV0FBTyxRQUFRLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBUCxDQUZNO0dBQVI7QUFJQSxNQUFJLENBQUMsS0FBRCxJQUFVLE1BQU0sR0FBTixDQUFVLEdBQVYsQ0FBVixFQUEwQjtBQUFDLFdBQU8sUUFBUSxPQUFSLENBQWdCLE1BQU0sR0FBTixDQUFVLEdBQVYsQ0FBaEIsQ0FBUCxDQUFEO0dBQTlCO0FBQ0EsU0FBTyxLQUFL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LEVBQVUsSUFBcEI7R0FBUixDQUFuQyxDQUQwQjtDQUEzQjs7QUFJQSxTQUFVLFNBQVYsQ0FBb0IsSUFBcEIsRUFBeUIsSUFBekIsRUFBOEI7QUFDNUIsUUFBTSxHQUFOLENBQVUsSUFBVixFQUQ0QjtBQUU1QixTQUFPLDBCQUEwQixJQUExQixFQUFnQyxJQUFoQyxDQUFxQztXQUFHLEtBQUssU0FBTCxDQUFlLElBQWYsRUFBb0IsSUFBcEIsRUFBMEIsSUFBMUIsQ0FBK0IsZ0JBQU07QUFDbEYsWUFBTSxHQUFOLENBQVUsS0FBSyxHQUFMLEVBQVMsSUFBbkIsRUFEa0Y7QUFFbEYsYUFBTyxJQUFQLENBRmtGO0tBQU47R0FBbEMsQ0FBNUMsQ0FGNEI7Q0FBOUI7O0FBUUEsU0FBVSxhQUFWLENBQXdCLElBQXhCLEVBQTZCLElBQTdCLEVBQWtDO0FBQ2hDLFNBQU8sMEJBQTBCLElBQTFCO0dBQ04sSUFETSxDQUNEO1dBQUcsMEJBQTBCLElBQTFCO0dBQUgsQ0FEQyxDQUVOLElBRk0sQ0FFRDtXQUFHLEtBQUssYUFBTCxDQUFtQixJQUFuQixFQUF3QixJQUF4QixFQUE4QixJQUE5QixDQUFtQyxnQkFBTTtBQUNoRCxZQUFNLEdBQU4sQ0FBVSxLQUFLLEdBQUwsRUFBUyxJQUFuQixFQURnRDtBQUVoRCxhQUFPLElBQVAsQ0FGZ0Q7S0FBTjtHQUF0QyxDQUZOLENBRGdDO0NBQWxDOzs7QUFVQSxTQUFTLGFBQVQsQ0FBdUIsR0FBdkIsRUFBb0M7TUFBVCw0RUFBTSxFQUFHOztBQUNsQyxTQUFPLEtBQUssYUFBTCxDQUFtQixHQUFuQixFQUF1QixLQUF2QixDQUFQLENBRGtDO0NBQXBDIiwiZmlsZSI6InRyZWUtY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgTFJVID0gcmVxdWlyZSgnbHJ1LWNhY2hlJykgLCBjYWNoZT0gTFJVKDUwMDApOyBcbnZhciBfPXJlcXVpcmUoJ2xvZGFzaCcpO1xuLy8gdmFyIGNhY2hlPXJlcXVpcmUoJy4vY2FjaGUnKTsvL0xSVSBjYWNoZeayoeaciemXrumimO+8jOaYr+WIoOmZpHNnaWTniLboioLngrnlkI7lj4jor6/or7vlj5bkuobniLboioLngrnvvIhkZ2lk77yJXG52YXIgX2FwaTtcbmNvbnN0IGFwaSA9IHtcbiAgcmVhZCxcbiAgcmVhZF9ub2RlcyxcbiAgbWtfc29uX2J5X2RhdGEsXG4gIG1rX3Nvbl9ieV9uYW1lLFxuICBta19icm90aGVyX2J5X2RhdGEsXG4gIHJlbW92ZSxcbiAgdXBkYXRlLFxuICBtdl9hc19zb24sXG4gIG12X2FzX2Jyb3RoZXIsXG4gIHJlYWRfYmlnX25vZGUsXG59O1xuZnVuY3Rpb24gZmFjdG9yeShfcHJlZml4KSB7XG4gIF9hcGk9cmVxdWlyZSgnLi90cmVlJykoX3ByZWZpeCk7XG4gIHJldHVybiBhcGk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG5cbmZ1bmN0aW9uIGNsb25lKG9iail7XG4gIGlmKCFvYmope3JldHVybiBudWxsO31cbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG59XG5cbmZ1bmN0aW9uIHJlYWQoZ2lkLGZvcmNlPWZhbHNlKSB7XG4gIGlmKCFnaWQpe1xuICAgIGNvbnNvbGUud2FybigncmVhZDppbnZhbGlkIHBhcmFtJyxnaWQpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gIH1cbiAgaWYgKCFmb3JjZSAmJiBjYWNoZS5oYXMoZ2lkKSkge3JldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGUuZ2V0KGdpZCkpO31cbiAgcmV0dXJuIF9hcGkucmVhZChnaWQpLnRoZW4obm9kZSA9PiB7XG4gICAgY2FjaGUuc2V0KG5vZGUuX2lkLG5vZGUpO1xuICAgIHJldHVybiBub2RlO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVhZF9ub2RlcyhnaWRzKSB7XG4gIGlmICghZ2lkcyB8fCBnaWRzLmxlbmd0aCA9PT0gMCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoW10pO31cbiAgbGV0IGNhY2hlZE5vZGVzID0gW107XG4gIGxldCB1bkNhY2hlZEdpZHMgPSBbXTtcbiAgZ2lkcy5tYXAoZ2lkID0+IHtcbiAgICBpZiAoY2FjaGUuaGFzKGdpZCkpIHtcbiAgICAgIGNhY2hlZE5vZGVzLnB1c2goY2FjaGUuZ2V0KGdpZCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bkNhY2hlZEdpZHMucHVzaChnaWQpO1xuICAgIH1cbiAgfSk7XG4gIGNvbnNvbGUubG9nKCdyZWFkX25vZGVzJyxnaWRzLCd1bkNhY2hlZEdpZHMnLHVuQ2FjaGVkR2lkcylcbiAgaWYgKHVuQ2FjaGVkR2lkcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZE5vZGVzLm1hcChjbG9uZSkpOyAvL+WFqOWcqGNhY2hl5Lit55u05o6l6L+U5ZueIC8v6L+U5Zue5YWL6ZqG6YG/5YWN57yT5a2Y6KKr5L+u5pS5XG4gIH1cbiAgLy/lkKbliJnlkIjlubbov5Tlm55cbiAgcmV0dXJuIF9hcGkucmVhZF9ub2Rlcyh1bkNhY2hlZEdpZHMpLnRoZW4obmV3X25vZGVzID0+IHtcbiAgICBuZXdfbm9kZXMubWFwKG5vZGUgPT4gY2FjaGUuc2V0KG5vZGUuX2lkLG5vZGUpKTsgLy/mm7TmlrBub2RlcyBjYWNoZVxuICAgIC8vIOiwg+aVtOmhuuW6j1xuICAgIHZhciB0bXA9e307XG4gICAgY2FjaGVkTm9kZXMubWFwKG5vZGU9PnRtcFtub2RlLl9pZF09bm9kZSk7XG4gICAgbmV3X25vZGVzLm1hcChub2RlPT50bXBbbm9kZS5faWRdPW5vZGUpO1xuICAgIHZhciBub2Rlcz0gZ2lkcy5tYXAoZ2lkPT5jbG9uZSh0bXBbZ2lkXSkpOyAvL+i/lOWbnuWFi+mahumBv+WFjee8k+WtmOiiq+S/ruaUuVxuICAgIHJldHVybiBfLmNvbXBhY3Qobm9kZXMpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xuICByZXR1cm4gX2FwaS5ta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKS50aGVuKG5vZGUgPT57XG4gICAgY2FjaGUuc2V0KG5vZGUuX2lkLG5vZGUpOy8v5pu05paw5a2Q6IqC54K5XG4gICAgY2FjaGUuZGVsKHBnaWQpOy8v5Yig6Zmk5pen55qE54i26IqC54K5XG4gICAgcmV0dXJuIG5vZGU7Ly/ov5Tlm57mlrDnmoTlrZDoioLngrlcbiAgfSk7XG59XG5cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICByZXR1cm4gX2FwaS5ta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKS50aGVuKG5vZGUgPT57XG4gICAgY2FjaGUuc2V0KG5vZGUuX2lkLG5vZGUpOy8v5pu05paw5a2Q6IqC54K5XG4gICAgY2FjaGUuZGVsKHBnaWQpOy8v5Yig6Zmk5pen55qE54i26IqC54K5XG4gICAgcmV0dXJuIG5vZGU7Ly/ov5Tlm57mlrDnmoTlrZDoioLngrlcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF9yZW1vdmVfcGFyZW50X2Zyb21fY2FjaGUoZ2lkKXtcbiAgcmV0dXJuIGFwaS5yZWFkKGdpZCkudGhlbihub2RlPT57XG4gICAgY29uc29sZS5sb2coXCJfcmVtb3ZlX3BhcmVudF9mcm9tX2NhY2hlXCIsbm9kZS5fbGluay5wKVxuICAgIGNhY2hlLmRlbChub2RlLl9saW5rLnApO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbWtfYnJvdGhlcl9ieV9kYXRhKGJnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIF9yZW1vdmVfcGFyZW50X2Zyb21fY2FjaGUoYmdpZCkudGhlbihfPT5fYXBpLm1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLCBkYXRhKSk7XG59XG5cblxuLyoqXG4gKiDliKDpmaToioLngrnvvIzlubbliLfmlrDniLboioLngrnlkozliKDpmaTlrZDoioLngrnvvIzov5Tlm57ooqvliKDpmaTnmoToioLngrlcbiAqIOazqOaEj++8jOi/lOWbnuWAvOS4jmFwaS5yZW1vdmXkuI3kuIDoh7RcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xuICAvL+WIoOmZpOafkOiKgueCueWQju+8jOe8k+WtmOS4reivpeiKgueCueeahOeItuiKgueCueimgeabtOaWsO+8jOWQjue7reWtkOiKgueCuemDveimgeWIoOmZpFxuICByZXR1cm4gcmVhZChnaWQpLnRoZW4obm9kZSA9PiAvL+WIoOmZpOWJjeWFiOWPluWHuuOAguW+heS8muWEv+i/mOacieeUqOOAglxuICAgIC8v5Yig6Zmk6IqC54K5XG4gICAgX2FwaS5yZW1vdmUoZ2lkKS50aGVuKHJlcyA9PiB7XG4gICAgICBpZiAobm9kZSkgeyAvL+WmguaenOWIoOmZpOWJjeayoeacieWPluWIsOW9k+WJjeiKgueCue+8jOeItuiKgueCueWwhuaXoOazleWIt+aWsOOAglxuICAgICAgICAvL+mAkuW9kuWIoOmZpGNhY2hl5Lit5omA5pyJ5a2Q6IqC54K5XG4gICAgICAgIF9yZW1vdmVfYWxsX2NoaWxkcmVuKG5vZGUuX2xpbmsuY2hpbGRyZW4pO1xuICAgICAgICBjYWNoZS5kZWwobm9kZS5fbGluay5wKTsvL+WIt+aWsOeItuiKgueCuVxuICAgICAgICByZXR1cm4gbm9kZTsvL+i/lOWbnuiiq+WIoOmZpOeahOiKgueCuVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSlcbiAgKTtcbn1cblxuLy/pgJLlvZLliKDpmaRjYWNoZeS4reaJgOacieWtkOiKgueCuVxuZnVuY3Rpb24gX3JlbW92ZV9hbGxfY2hpbGRyZW4oZ2lkcykge1xuICBpZiAoIWdpZHMpIHtyZXR1cm47fVxuICBnaWRzLm1hcChnaWQgPT4ge1xuICAgIGlmIChjYWNoZS5oYXMoZ2lkKSkge1xuICAgICAgX3JlbW92ZV9hbGxfY2hpbGRyZW4oY2FjaGUuZ2V0KGdpZCkuX2xpbmsuY2hpbHJlbik7XG4gICAgICBjYWNoZS5kZWwoZ2lkKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUoZ2lkLCBkYXRhKSB7XG4gcmV0dXJuIF9hcGkudXBkYXRlKGdpZCwgZGF0YSkudGhlbihub2RlID0+IGNhY2hlLnNldChub2RlLl9pZCwgbm9kZSkpO1xufVxuXG5mdW5jdGlvbiAgbXZfYXNfc29uKHNnaWQsZGdpZCl7XG4gIGNhY2hlLmRlbChkZ2lkKTtcbiAgcmV0dXJuIF9yZW1vdmVfcGFyZW50X2Zyb21fY2FjaGUoc2dpZCkudGhlbihfPT5fYXBpLm12X2FzX3NvbihzZ2lkLGRnaWQpLnRoZW4obm9kZT0+e1xuICAgIGNhY2hlLnNldChub2RlLl9pZCxub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiAgbXZfYXNfYnJvdGhlcihzZ2lkLGRnaWQpe1xuICByZXR1cm4gX3JlbW92ZV9wYXJlbnRfZnJvbV9jYWNoZShkZ2lkKSAvL+mhuuW6j+mHjeimge+8geimgeWFiOWIoOmZpOebruagh+iKgueCuWRnaWTnmoTniLboioLngrnvvIzlm6DkuLrnm67moIfoioLngrlkZ2lk5Y+v6IO95pivc2dpZOeahOeItuiKgueCuVxuICAudGhlbihfPT5fcmVtb3ZlX3BhcmVudF9mcm9tX2NhY2hlKHNnaWQpKVxuICAudGhlbihfPT5fYXBpLm12X2FzX2Jyb3RoZXIoc2dpZCxkZ2lkKS50aGVuKG5vZGU9PntcbiAgICBjYWNoZS5zZXQobm9kZS5faWQsbm9kZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH0pKTtcbn1cblxuLy9ub3QgY2FjaGVkXG5mdW5jdGlvbiByZWFkX2JpZ19ub2RlKGdpZCxsZXZlbD0wKSB7XG4gIHJldHVybiBfYXBpLnJlYWRfYmlnX25vZGUoZ2lkLGxldmVsKTtcbn0iXX0=