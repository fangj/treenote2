'use strict';

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');

var db;
function tree_nedb(_db, cb) {
  db = Promise.promisifyAll(_db);
  buildRootIfNotExist(cb);
  return {
    read_node: read_node,
    read_nodes: read_nodes,
    mk_son_by_data: mk_son_by_data,
    mk_son_by_name: mk_son_by_name,
    mk_brother_by_data: mk_brother_by_data,
    update_data: update_data,
    remove: remove,
    move_as_son: move_as_son,
    move_as_brother: move_as_brother,
    //for test
    buildRootIfNotExist: buildRootIfNotExist
  };
}

module.exports = tree_nedb;

function buildRootIfNotExist(cb) {
  return async(function () {
    var root = await(db.findOneAsync({ _id: '0' }));
    if (!root) {
      var defaultRoot = {
        _id: '0',
        _link: {
          p: '0',
          children: []
        }
      };
      root = await(db.insertAsync(defaultRoot));
    }
    if (typeof cb == 'function') {
      cb(); //通知root构建完成
    }
    return root;
  })();
}

function read_node(gid) {
  return async(function () {
    // console.log('read_node',gid);
    var node = await(db.findOneAsync({ _id: gid, _rm: { $exists: false } })); //rm标记表示节点已经被删除
    return node;
  })();
}

function read_nodes(gids) {
  return async(function () {
    var nodes = await(db.findAsync({ _id: { $in: gids }, _rm: { $exists: false } }));
    return nodes;
  })();
}

function _mk_son_by_data(pNode, data, bgid) {
  return async(function () {
    // console.log(pNode);
    var newNode = {
      _link: {
        p: pNode._id,
        children: []
      },
      _data: data
    };
    var _newNode = await(db.insertAsync(newNode)); //插入新节点
    var pos = 0;
    var children = pNode._link.children;
    if (bgid) {
      pos = children.indexOf(bgid) + 1;
    }
    children.splice(pos, 0, _newNode._id); //把新节点的ID插入到父节点中
    await(db.updateAsync({ _id: pNode._id }, pNode, {})); //插入父节点
    return _newNode; //返回新节点
  })();
}

function _mk_son_by_name(pNode, name, bgid) {
  return async(function () {
    // console.log(pNode);
    var newNode = {
      _link: {
        p: pNode._id,
        children: []
      },
      _name: name
    };
    var _newNode = await(db.insertAsync(newNode)); //插入新节点
    var pos = 0;
    var children = pNode._link.children;
    if (bgid) {
      pos = children.indexOf(bgid) + 1;
    }
    children.splice(pos, 0, _newNode._id); //把新节点的ID插入到父节点中
    await(db.updateAsync({ _id: pNode._id }, pNode, {})); //插入父节点
    return _newNode; //返回新节点
  })();
}

function mk_son_by_data(pgid, data) {
  return async(function () {
    var pNode = await(db.findOneAsync({ "_id": pgid })); //找到父节点
    if (!pNode) {
      throw 'cannot find parent node ' + pgid;
      return null; //父节点不存在，无法插入，返回null
    }
    return _mk_son_by_data(pNode, data);
  })();
}

function mk_son_by_name(pgid, name) {
  return async(function () {
    var pNode = await(db.findOneAsync({ "_id": pgid })); //找到父节点
    if (!pNode) {
      throw 'cannot find parent node ' + pgid;
      return null; //父节点不存在，无法插入，返回null
    }
    var node = await(db.findOneAsync({ "_name": name })); //是否已有同名节点
    if (node) {
      return node; //如有直接返回
    }
    return _mk_son_by_name(pNode, name);
  })();
}

function mk_brother_by_data(bgid, data) {
  return async(function () {
    var pNode = await(db.findOneAsync({ "_link.children": { $elemMatch: bgid } })); //找到父节点
    if (!pNode) {
      throw 'cannot find parent node of brother ' + bgid;
      return null; //父节点不存在，无法插入，返回null
    }
    return _mk_son_by_data(pNode, data, bgid);
  })();
}

function _update(db, query, update, callback) {
  var cb = function cb(err, numAffected, affectedDocuments, upsert) {
    callback(err, affectedDocuments); //修改callback的签名，使得第二个参数为更新过的doc
  };
  var options = { multi: false, returnUpdatedDocs: true };
  db.update(query, update, options, cb);
}

var update = Promise.promisify(_update); //修改callback签名后就可以promisify

function update_data(gid, data) {
  return async(function () {
    var node = await(update(db, { _id: gid }, { $set: { _data: data } })); //更新节点并返回更新后的节点
    return node;
  })();
}

//递归遍历所有子节点
//gids是要访问的节点id的列表
//visit是一个函数。访问节点的动作。
function _traversal_all_children(gids, visit) {
  if (!gids || gids.length == 0) {
    return Promise.resolve();
  } //需要返回一个promise 
  return Promise.all(gids.map(function (gid) {
    return read_node(gid).then(function (node) {
      //读取当前节点
      return _traversal_all_children(node._link.children, visit).then(function () {
        //访问所有子节点
        return visit(node); //然后访问当前节点
      });
    });
  }));
}

//标记删除节点与所有子孙节点
function remove(gid) {
  return async(function () {
    if (gid == '0') return; //根节点不能删除。
    var node = await(read_node(gid)); //先读取要删除的节点
    if (!node) return; //已经不存在，返回
    //收集所有子节点
    var gidsforRemove = [];
    var rm = function rm(node) {
      gidsforRemove.push(node._id);
    };
    await(_traversal_all_children([gid], rm));
    //批量删除
    await(db.updateAsync({ _id: { $in: gidsforRemove } }, { $set: { _rm: true } }, {})); //标记为删除
    await(db.updateAsync({ _id: node._link.p }, { $pull: { "_link.children": gid } }, {})); //从原父节点删除
    return gidsforRemove;
  })();
}

function _isAncestor(pgid, gid) {
  if (gid == '0') return Promise.resolve(false); //'0'为根节点。任何节点都不是'0'的父节点
  return read_node(gid).then(function (node) {
    // console.log('check',pgid,node._link.p,node)
    if (node._link.p === pgid) {
      return true;
    } else {
      return _isAncestor(pgid, node._link.p);
    }
  });
}

function _move_as_son(gid, npNode, bgid) {
  return async(function () {
    var gidIsAncestorOfNewParentNode = await(_isAncestor(gid, npNode._id));
    if (gidIsAncestorOfNewParentNode) {
      console.log(gid, 'is ancestor of', npNode._id);
      return null; //要移动的节点不能是目标父节点的长辈节点
    }
    var pNode = await(db.findOneAsync({ "_link.children": { $elemMatch: gid } })); //找到原父节点

    await(db.updateAsync({ _id: pNode._id }, { $pull: { "_link.children": gid } }, {})); //从原父节点删除
    if (npNode._id === pNode._id) {
      //如果新的父节点与旧的父节点相同。要更新父节点
      npNode = await(db.findOneAsync({ _id: pNode._id, _rm: { $exists: false } }));
    }

    await(db.updateAsync({ _id: gid }, { $set: { "_link.p": npNode._id } }, {})); //改变gid的父节点为新父节点
    var pos = 0;
    var children = npNode._link.children;
    if (bgid) {
      pos = children.indexOf(bgid) + 1;
    }
    children.splice(pos, 0, gid); //把新节点的ID插入到父节点中
    await(db.updateAsync({ _id: npNode._id }, npNode, {})); //插入父节点
    return await(read_node(gid));
  })();
}

//把gid节点移动为pgid的子节点
//包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
//移动前需要做检查。祖先节点不能移动为后辈的子节点
function move_as_son(gid, pgid) {
  return async(function () {
    var npNode = await(db.findOneAsync({ "_id": pgid })); //找到新父节点
    return _move_as_son(gid, npNode);
  })();
}

function move_as_brother(gid, bgid) {
  return async(function () {
    var npNode = await(db.findOneAsync({ "_link.children": { $elemMatch: bgid } })); //找到新父节点
    return _move_as_son(gid, npNode, bgid);
  })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1uZWRiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxRQUFRLFFBQVEsa0JBQVIsQ0FBWjtBQUNBLElBQUksUUFBUSxRQUFRLGtCQUFSLENBQVo7QUFDQSxJQUFJLFVBQVUsUUFBUSxVQUFSLENBQWQ7O0FBR0EsSUFBSSxFQUFKO0FBQ0EsU0FBUyxTQUFULENBQW1CLEdBQW5CLEVBQXVCLEVBQXZCLEVBQTBCO0FBQ3hCLE9BQUcsUUFBUSxZQUFSLENBQXFCLEdBQXJCLENBQUg7QUFDQSxzQkFBb0IsRUFBcEI7QUFDQSxTQUFPO0FBQ0wsd0JBREs7QUFFTCwwQkFGSztBQUdMLGtDQUhLO0FBSUwsa0NBSks7QUFLTCwwQ0FMSztBQU1MLDRCQU5LO0FBT0wsa0JBUEs7QUFRTCw0QkFSSztBQVNMLG9DQVRLO0FBVUw7QUFDQTtBQVhLLEdBQVA7QUFhRDs7QUFFRCxPQUFPLE9BQVAsR0FBZSxTQUFmOztBQUVBLFNBQVMsbUJBQVQsQ0FBNkIsRUFBN0IsRUFBZ0M7QUFDOUIsU0FBTyxNQUFNLFlBQVU7QUFDckIsUUFBSSxPQUFLLE1BQU0sR0FBRyxZQUFILENBQWdCLEVBQUMsS0FBSSxHQUFMLEVBQWhCLENBQU4sQ0FBVDtBQUNBLFFBQUcsQ0FBQyxJQUFKLEVBQVM7QUFDUCxVQUFJLGNBQVk7QUFDZCxhQUFJLEdBRFU7QUFFZCxlQUFPO0FBQ0wsYUFBRyxHQURFO0FBRUwsb0JBQVU7QUFGTDtBQUZPLE9BQWhCO0FBT0EsYUFBSyxNQUFNLEdBQUcsV0FBSCxDQUFlLFdBQWYsQ0FBTixDQUFMO0FBQ0Q7QUFDRCxRQUFHLE9BQU8sRUFBUCxJQUFZLFVBQWYsRUFBMEI7QUFDeEIsV0FEd0IsQ0FDbEI7QUFDUDtBQUNELFdBQU8sSUFBUDtBQUNELEdBaEJNLEdBQVA7QUFpQkQ7O0FBRUQsU0FBUyxTQUFULENBQW1CLEdBQW5CLEVBQXdCO0FBQ3RCLFNBQU8sTUFBTSxZQUFVO0FBQ3JCO0FB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RUFBb0IsQ0FBcEIsRUFBc0IsR0FBdEIsRUFuQnFCLENBbUJNO0FBQzNCLFVBQU0sR0FBRyxXQUFILENBQWUsRUFBQyxLQUFJLE9BQU8sR0FBWixFQUFmLEVBQWlDLE1BQWpDLEVBQXlDLEVBQXpDLENBQU4sRUFwQnFCLENBb0IrQjtBQUNwRCxXQUFPLE1BQU0sVUFBVSxHQUFWLENBQU4sQ0FBUDtBQUNELEdBdEJNLEdBQVA7QUF1QkQ7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsU0FBUyxXQUFULENBQXFCLEdBQXJCLEVBQTBCLElBQTFCLEVBQWdDO0FBQzlCLFNBQU8sTUFBTSxZQUFVO0FBQ3JCLFFBQUksU0FBTyxNQUFNLEdBQUcsWUFBSCxDQUFnQixFQUFDLE9BQU0sSUFBUCxFQUFoQixDQUFOLENBQVgsQ0FEcUIsQ0FDMkI7QUFDaEQsV0FBTyxhQUFhLEdBQWIsRUFBaUIsTUFBakIsQ0FBUDtBQUNELEdBSE0sR0FBUDtBQUlEOztBQUVELFNBQVMsZUFBVCxDQUF5QixHQUF6QixFQUE4QixJQUE5QixFQUFvQztBQUNsQyxTQUFPLE1BQU0sWUFBVTtBQUNyQixRQUFJLFNBQU8sTUFBTSxHQUFHLFlBQUgsQ0FBZ0IsRUFBQyxrQkFBaUIsRUFBQyxZQUFXLElBQVosRUFBbEIsRUFBaEIsQ0FBTixDQUFYLENBRHFCLENBQ21EO0FBQ3hFLFdBQU8sYUFBYSxHQUFiLEVBQWlCLE1BQWpCLEVBQXdCLElBQXhCLENBQVA7QUFDRCxHQUhNLEdBQVA7QUFJRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXN5bmMnKTtcclxudmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xyXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XHJcblxyXG5cclxudmFyIGRiO1xyXG5mdW5jdGlvbiB0cmVlX25lZGIoX2RiLGNiKXtcclxuICBkYj1Qcm9taXNlLnByb21pc2lmeUFsbChfZGIpO1xyXG4gIGJ1aWxkUm9vdElmTm90RXhpc3QoY2IpO1xyXG4gIHJldHVybiB7XHJcbiAgICByZWFkX25vZGUsXHJcbiAgICByZWFkX25vZGVzLFxyXG4gICAgbWtfc29uX2J5X2RhdGEsXHJcbiAgICBta19zb25fYnlfbmFtZSxcclxuICAgIG1rX2Jyb3RoZXJfYnlfZGF0YSxcclxuICAgIHVwZGF0ZV9kYXRhLFxyXG4gICAgcmVtb3ZlLFxyXG4gICAgbW92ZV9hc19zb24sXHJcbiAgICBtb3ZlX2FzX2Jyb3RoZXIsXHJcbiAgICAvL2ZvciB0ZXN0XHJcbiAgICBidWlsZFJvb3RJZk5vdEV4aXN0XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz10cmVlX25lZGI7XHJcblxyXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcclxuICByZXR1cm4gYXN5bmMoZnVuY3Rpb24oKXtcclxuICAgIHZhciByb290PWF3YWl0KGRiLmZpbmRPbmVBc3luYyh7X2lkOicwJ30pKTtcclxuICAgIGlmKCFyb290KXtcclxuICAgICAgdmFyIGRlZmF1bHRSb290PXtcclxuICAgICAgICBfaWQ6JzAnLCBcclxuICAgICAgICBfbGluazoge1xyXG4gICAgICAgICAgcDogJzAnLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICByb290PWF3YWl0KGRiLmluc2VydEFzeW5jKGRlZmF1bHRSb290KSk7XHJcbiAgICB9XHJcbiAgICBpZih0eXBlb2YgY2IgPT0nZnVuY3Rpb24nKXtcclxuICAgICAgY2IoKTsgLy/pgJrnn6Vyb2905p6E5bu65a6M5oiQXHJcbiAgICB9XHJcbiAgICByZXR1cm4gcm9vdDtcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX25vZGUoZ2lkKSB7XHJcbiAgcmV0dXJuIGFzeW5jKGZ1bmN0aW9uKCl7XHJcbiAgICAvLyBjb25zb2xlLmxvZygncmVhZF9ub2RlJyxnaWQpO1xyXG4gICAgdmFyIG5vZGU9YXdhaXQoZGIuZmluZE9uZUFzeW5jKHtfaWQ6Z2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pKTsgLy9ybeagh+iusOihqOekuuiKgueCueW3sue7j+iiq+WIoOmZpFxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZF9ub2RlcyhnaWRzKSB7XHJcbiAgcmV0dXJuIGFzeW5jKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbm9kZXM9YXdhaXQoZGIuZmluZEFzeW5jKHtfaWQ6eyRpbjpnaWRzfSxfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pKTtcclxuICAgIHJldHVybiBub2RlcztcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfbWtfc29uX2J5X2RhdGEocE5vZGUsZGF0YSxiZ2lkKXtcclxuICByZXR1cm4gYXN5bmMoZnVuY3Rpb24oKXtcclxuICAgIC8vIGNvbnNvbGUubG9nKHBOb2RlKTtcclxuICAgIHZhciBuZXdOb2RlPXtcclxuICAgICAgICBfbGluazoge1xyXG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBfZGF0YTpkYXRhXHJcbiAgICB9O1xyXG4gICAgdmFyIF9uZXdOb2RlPSBhd2FpdChkYi5pbnNlcnRBc3luYyhuZXdOb2RlKSk7Ly/mj5LlhaXmlrDoioLngrlcclxuICAgIHZhciBwb3M9MDtcclxuICAgIHZhciBjaGlsZHJlbj1wTm9kZS5fbGluay5jaGlsZHJlbjtcclxuICAgIGlmKGJnaWQpe1xyXG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xyXG4gICAgfVxyXG4gICAgY2hpbGRyZW4uc3BsaWNlKHBvcywwLF9uZXdOb2RlLl9pZCk7Ly/miormlrDoioLngrnnmoRJROaPkuWFpeWIsOeItuiKgueCueS4rVxyXG4gICAgYXdhaXQoZGIudXBkYXRlQXN5bmMoe19pZDpwTm9kZS5faWR9LCBwTm9kZSwge30pKTsvL+aPkuWFpeeItuiKgueCuVxyXG4gICAgcmV0dXJuIF9uZXdOb2RlOy8v6L+U5Zue5paw6IqC54K5XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX21rX3Nvbl9ieV9uYW1lKHBOb2RlLG5hbWUsYmdpZCl7XHJcbiAgcmV0dXJuIGFzeW5jKGZ1bmN0aW9uKCl7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhwTm9kZSk7XHJcbiAgICB2YXIgbmV3Tm9kZT17XHJcbiAgICAgICAgX2xpbms6IHtcclxuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX25hbWU6bmFtZVxyXG4gICAgfTtcclxuICAgIHZhciBfbmV3Tm9kZT0gYXdhaXQoZGIuaW5zZXJ0QXN5bmMobmV3Tm9kZSkpOy8v5o+S5YWl5paw6IqC54K5XHJcbiAgICB2YXIgcG9zPTA7XHJcbiAgICB2YXIgY2hpbGRyZW49cE5vZGUuX2xpbmsuY2hpbGRyZW47XHJcbiAgICBpZihiZ2lkKXtcclxuICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcclxuICAgIH1cclxuICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxfbmV3Tm9kZS5faWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cclxuICAgIGF3YWl0KGRiLnVwZGF0ZUFzeW5jKHtfaWQ6cE5vZGUuX2lkfSwgcE5vZGUsIHt9KSk7Ly/mj5LlhaXniLboioLngrlcclxuICAgIHJldHVybiBfbmV3Tm9kZTsvL+i/lOWbnuaWsOiKgueCuVxyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcclxuICByZXR1cm4gYXN5bmMoZnVuY3Rpb24oKXtcclxuICAgIHZhciBwTm9kZT1hd2FpdChkYi5maW5kT25lQXN5bmMoe1wiX2lkXCI6cGdpZH0pKTsvL+aJvuWIsOeItuiKgueCuVxyXG4gICAgaWYoIXBOb2RlKXtcclxuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xyXG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcclxuICAgIH1cclxuICAgIHJldHVybiBfbWtfc29uX2J5X2RhdGEocE5vZGUsZGF0YSk7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xyXG4gIHJldHVybiBhc3luYyhmdW5jdGlvbigpe1xyXG4gICAgdmFyIHBOb2RlPWF3YWl0KGRiLmZpbmRPbmVBc3luYyh7XCJfaWRcIjpwZ2lkfSkpOy8v5om+5Yiw54i26IqC54K5XHJcbiAgICBpZighcE5vZGUpe1xyXG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XHJcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG4gICAgdmFyIG5vZGU9YXdhaXQoZGIuZmluZE9uZUFzeW5jKHtcIl9uYW1lXCI6bmFtZX0pKTsvL+aYr+WQpuW3suacieWQjOWQjeiKgueCuVxyXG4gICAgaWYobm9kZSl7XHJcbiAgICAgIHJldHVybiBub2RlOy8v5aaC5pyJ55u05o6l6L+U5ZueXHJcbiAgICB9XHJcbiAgICByZXR1cm4gX21rX3Nvbl9ieV9uYW1lKHBOb2RlLG5hbWUpO1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLGRhdGEpIHtcclxuICByZXR1cm4gYXN5bmMoZnVuY3Rpb24oKXtcclxuICAgIHZhciBwTm9kZT1hd2FpdChkYi5maW5kT25lQXN5bmMoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpiZ2lkfX0pKTsvL+aJvuWIsOeItuiKgueCuVxyXG4gICAgaWYoIXBOb2RlKXtcclxuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XHJcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpO1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBfdXBkYXRlKGRiLHF1ZXJ5LHVwZGF0ZSxjYWxsYmFjayl7IFxyXG4gICAgdmFyIGNiPWZ1bmN0aW9uKGVyciwgbnVtQWZmZWN0ZWQsIGFmZmVjdGVkRG9jdW1lbnRzLCB1cHNlcnQpe1xyXG4gICAgICBjYWxsYmFjayhlcnIsYWZmZWN0ZWREb2N1bWVudHMpOy8v5L+u5pS5Y2FsbGJhY2vnmoTnrb7lkI3vvIzkvb/lvpfnrKzkuozkuKrlj4LmlbDkuLrmm7TmlrDov4fnmoRkb2NcclxuICAgIH07XHJcbiAgICB2YXIgb3B0aW9ucz17IG11bHRpOiBmYWxzZSxyZXR1cm5VcGRhdGVkRG9jczp0cnVlIH07XHJcbiAgICBkYi51cGRhdGUocXVlcnksIHVwZGF0ZSwgb3B0aW9ucyxjYik7XHJcbn1cclxuXHJcbmNvbnN0IHVwZGF0ZT1Qcm9taXNlLnByb21pc2lmeShfdXBkYXRlKTsvL+S/ruaUuWNhbGxiYWNr562+5ZCN5ZCO5bCx5Y+v5LulcHJvbWlzaWZ5XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVfZGF0YShnaWQsIGRhdGEpIHtcclxuICByZXR1cm4gYXN5bmMoZnVuY3Rpb24oKXtcclxuICAgIHZhciBub2RlPWF3YWl0KHVwZGF0ZShkYix7X2lkOmdpZH0sIHsgJHNldDogeyBfZGF0YTogZGF0YSB9IH0pKTsvL+abtOaWsOiKgueCueW5tui/lOWbnuabtOaWsOWQjueahOiKgueCuVxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuXHJcbi8v6YCS5b2S6YGN5Y6G5omA5pyJ5a2Q6IqC54K5XHJcbi8vZ2lkc+aYr+imgeiuv+mXrueahOiKgueCuWlk55qE5YiX6KGoXHJcbi8vdmlzaXTmmK/kuIDkuKrlh73mlbDjgILorr/pl67oioLngrnnmoTliqjkvZzjgIJcclxuZnVuY3Rpb24gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oZ2lkcyx2aXNpdCkge1xyXG4gIGlmICghZ2lkc3x8Z2lkcy5sZW5ndGg9PTApIHtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7fS8v6ZyA6KaB6L+U5Zue5LiA5LiqcHJvbWlzZSBcclxuICByZXR1cm4gUHJvbWlzZS5hbGwoZ2lkcy5tYXAoZ2lkID0+IHtcclxuICAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PnsgLy/or7vlj5blvZPliY3oioLngrlcclxuICAgICAgcmV0dXJuIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKG5vZGUuX2xpbmsuY2hpbGRyZW4sdmlzaXQpLnRoZW4oKCk9PnsgLy/orr/pl67miYDmnInlrZDoioLngrlcclxuICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH0pKTtcclxufVxyXG5cclxuLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcclxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xyXG4gIHJldHVybiBhc3luYyhmdW5jdGlvbigpe1xyXG4gICAgIGlmKGdpZD09JzAnKXJldHVybjsvL+agueiKgueCueS4jeiDveWIoOmZpOOAglxyXG4gICAgIHZhciBub2RlPWF3YWl0KHJlYWRfbm9kZShnaWQpKTsgLy/lhYjor7vlj5bopoHliKDpmaTnmoToioLngrlcclxuICAgICBpZighbm9kZSlyZXR1cm47Ly/lt7Lnu4/kuI3lrZjlnKjvvIzov5Tlm55cclxuICAgICAvL+aUtumbhuaJgOacieWtkOiKgueCuVxyXG4gICAgIHZhciBnaWRzZm9yUmVtb3ZlPVtdO1xyXG4gICAgIGNvbnN0IHJtPShub2RlKT0+e2dpZHNmb3JSZW1vdmUucHVzaChub2RlLl9pZCl9O1xyXG4gICAgIGF3YWl0KF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKFtnaWRdLHJtKSk7XHJcbiAgICAgLy/mibnph4/liKDpmaRcclxuICAgICBhd2FpdChkYi51cGRhdGVBc3luYyh7X2lkOnskaW46Z2lkc2ZvclJlbW92ZX19LCAgeyAkc2V0OiB7IF9ybTp0cnVlICB9IH0sIHt9KSk7Ly/moIforrDkuLrliKDpmaRcclxuICAgICBhd2FpdChkYi51cGRhdGVBc3luYyh7X2lkOm5vZGUuX2xpbmsucH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSApOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXHJcbiAgICAgcmV0dXJuIGdpZHNmb3JSZW1vdmU7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xyXG4gIGlmKGdpZD09JzAnKXJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyAvLycwJ+S4uuagueiKgueCueOAguS7u+S9leiKgueCuemDveS4jeaYrycwJ+eahOeItuiKgueCuVxyXG4gIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PntcclxuICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcclxuICAgIGlmKG5vZGUuX2xpbmsucD09PXBnaWQpe1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1lbHNle1xyXG4gICAgICByZXR1cm4gX2lzQW5jZXN0b3IocGdpZCxub2RlLl9saW5rLnApO1xyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcclxuICByZXR1cm4gYXN5bmMoZnVuY3Rpb24oKXtcclxuICAgIHZhciBnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlPWF3YWl0KF9pc0FuY2VzdG9yKGdpZCxucE5vZGUuX2lkKSk7XHJcbiAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcclxuICAgICAgY29uc29sZS5sb2coZ2lkLCdpcyBhbmNlc3RvciBvZicsbnBOb2RlLl9pZClcclxuICAgICAgcmV0dXJuIG51bGw7Ly/opoHnp7vliqjnmoToioLngrnkuI3og73mmK/nm67moIfniLboioLngrnnmoTplb/ovojoioLngrlcclxuICAgIH1cclxuICAgIHZhciBwTm9kZT1hd2FpdChkYi5maW5kT25lQXN5bmMoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpnaWR9fSkpOy8v5om+5Yiw5Y6f54i26IqC54K5XHJcblxyXG4gICAgYXdhaXQoZGIudXBkYXRlQXN5bmMoe19pZDpwTm9kZS5faWR9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgKTsvL+S7juWOn+eItuiKgueCueWIoOmZpFxyXG4gICAgaWYobnBOb2RlLl9pZD09PXBOb2RlLl9pZCl7Ly/lpoLmnpzmlrDnmoTniLboioLngrnkuI7ml6fnmoTniLboioLngrnnm7jlkIzjgILopoHmm7TmlrDniLboioLngrlcclxuICAgICAgbnBOb2RlPWF3YWl0KGRiLmZpbmRPbmVBc3luYyh7X2lkOnBOb2RlLl9pZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KSk7IFxyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0KGRiLnVwZGF0ZUFzeW5jKHtfaWQ6Z2lkfSwgIHsgJHNldDogeyBcIl9saW5rLnBcIjogbnBOb2RlLl9pZCB9IH0sIHt9KSk7Ly/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcclxuICAgIHZhciBwb3M9MDtcclxuICAgIHZhciBjaGlsZHJlbj1ucE5vZGUuX2xpbmsuY2hpbGRyZW47XHJcbiAgICBpZihiZ2lkKXtcclxuICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcclxuICAgIH1cclxuICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxnaWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cclxuICAgIGF3YWl0KGRiLnVwZGF0ZUFzeW5jKHtfaWQ6bnBOb2RlLl9pZH0sIG5wTm9kZSwge30pKTsvL+aPkuWFpeeItuiKgueCuVxyXG4gICAgcmV0dXJuIGF3YWl0KHJlYWRfbm9kZShnaWQpKTtcclxuICB9KSgpOyAgXHJcbn1cclxuXHJcbi8v5oqKZ2lk6IqC54K556e75Yqo5Li6cGdpZOeahOWtkOiKgueCuVxyXG4vL+WMheWQqzPmraXjgIIgMS7ku45naWTnmoTljp/niLboioLngrnliKDpmaTjgIIy5pS55Y+YZ2lk55qE5b2T5YmN54i26IqC54K544CCIDPjgILms6jlhozliLDmlrDniLboioLngrlcclxuLy/np7vliqjliY3pnIDopoHlgZrmo4Dmn6XjgILnpZblhYjoioLngrnkuI3og73np7vliqjkuLrlkI7ovojnmoTlrZDoioLngrlcclxuZnVuY3Rpb24gbW92ZV9hc19zb24oZ2lkLCBwZ2lkKSB7XHJcbiAgcmV0dXJuIGFzeW5jKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbnBOb2RlPWF3YWl0KGRiLmZpbmRPbmVBc3luYyh7XCJfaWRcIjpwZ2lkfSkpOy8v5om+5Yiw5paw54i26IqC54K5XHJcbiAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUpO1xyXG4gIH0pKCk7ICBcclxufVxyXG5cclxuZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xyXG4gIHJldHVybiBhc3luYyhmdW5jdGlvbigpe1xyXG4gICAgdmFyIG5wTm9kZT1hd2FpdChkYi5maW5kT25lQXN5bmMoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpiZ2lkfX0pKTsvL+aJvuWIsOaWsOeItuiKgueCuVxyXG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlLGJnaWQpO1xyXG4gIH0pKCk7IFxyXG59Il19