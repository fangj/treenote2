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
    //收集所有子节点
    var gidsforRemove = [];
    var rm = function rm(node) {
      gidsforRemove.push(node._id);
    };
    await(_traversal_all_children([gid], rm));
    //批量删除
    await(db.updateAsync({ _id: { $in: gidsforRemove } }, { $set: { _rm: true } }, {})); //标记为删除
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
    await(db.updateAsync({ _id: gid }, { $set: { "_link.p": npNode._id } }, {})); //改变gid的父节点为新父节点
    var pos = 0;
    var children = npNode._link.children;
    if (bgid) {
      pos = children.indexOf(bgid) + 1;
    }
    children.splice(pos, 0, gid); //把新节点的ID插入到父节点中
    await(db.updateAsync({ _id: npNode._id }, npNode, {})); //插入父节点
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1uZWRiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxRQUFRLFFBQVEsa0JBQVIsQ0FBWjtBQUNBLElBQUksUUFBUSxRQUFRLGtCQUFSLENBQVo7QUFDQSxJQUFJLFVBQVUsUUFBUSxVQUFSLENBQWQ7O0FBR0EsSUFBSSxFQUFKO0FBQ0EsU0FBUyxTQUFULENBQW1CLEdBQW5CLEVBQXVCLEVBQXZCLEVBQTBCO0FBQ3hCLE9BQUcsUUFBUSxZQUFSLENBQXFCLEdBQXJCLENBQUg7QUFDQSxzQkFBb0IsRUFBcEI7QUFDQSxTQUFPO0FBQ0wsd0JBREs7QUFFTCwwQkFGSztBQUdMLGtDQUhLO0FBSUwsMENBSks7QUFLTCw0QkFMSztBQU1MLGtCQU5LO0FBT0wsNEJBUEs7QUFRTCxvQ0FSSztBQVNMO0FBQ0E7QUFWSyxHQUFQO0FBWUQ7O0FBRUQsT0FBTyxPQUFQLEdBQWUsU0FBZjs7QUFFQSxTQUFTLG1CQUFULENBQTZCLEVBQTdCLEVBQWdDO0FBQzlCLFNBQU8sTUFBTSxZQUFVO0FBQ3JCLFFBQUksT0FBSyxNQUFNLEdBQUcsWUFBSCxDQUFnQixFQUFDLEtBQUksR0FBTCxFQUFoQixDQUFOLENBQVQ7QUFDQSxRQUFHLENBQUMsSUFBSixFQUFTO0FBQ1AsVUFBSSxjQUFZO0FBQ2QsYUFBSSxHQURVO0FBRWQsZUFBTztBQUNMLGFBQUcsR0FERTtBQUVMLG9CQUFVO0FBRkw7QUFGTyxPQUFoQjtBQU9BLGFBQUssTUFBTSxHQUFHLFdBQUgsQ0FBZSxXQUFmLENBQU4sQ0FBTDtBQUNEO0FBQ0QsUUFBRyxPQUFPLEVBQVAsSUFBWSxVQUFmLEVBQTBCO0FBQ3hCLFdBRHdCLENBQ2xCO0FBQ1A7QUFDRCxXQUFPLElBQVA7QUFDRCxHQWhCTSxHQUFQO0FBaUJEOztBQUVELFNBQVMsU0FBVCxDQUFtQixHQUFuQixFQUF3QjtBQUN0QixTQUFPLE1BQU0sWUFBVTtBQUNyQjtBQUNBLFFBQUksT0FB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QyxrQkFBaUIsRUFBQyxZQUFXLElBQVosRUFBbEIsRUFBaEIsQ0FBTixDQUFYLENBRHFCLENBQ21EO0FBQ3hFLFdBQU8sYUFBYSxHQUFiLEVBQWlCLE1BQWpCLEVBQXdCLElBQXhCLENBQVA7QUFDRCxHQUhNLEdBQVA7QUFJRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXN5bmMnKTtcclxudmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xyXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XHJcblxyXG5cclxudmFyIGRiO1xyXG5mdW5jdGlvbiB0cmVlX25lZGIoX2RiLGNiKXtcclxuICBkYj1Qcm9taXNlLnByb21pc2lmeUFsbChfZGIpO1xyXG4gIGJ1aWxkUm9vdElmTm90RXhpc3QoY2IpO1xyXG4gIHJldHVybiB7XHJcbiAgICByZWFkX25vZGUsXHJcbiAgICByZWFkX25vZGVzLFxyXG4gICAgbWtfc29uX2J5X2RhdGEsXHJcbiAgICBta19icm90aGVyX2J5X2RhdGEsXHJcbiAgICB1cGRhdGVfZGF0YSxcclxuICAgIHJlbW92ZSxcclxuICAgIG1vdmVfYXNfc29uLFxyXG4gICAgbW92ZV9hc19icm90aGVyLFxyXG4gICAgLy9mb3IgdGVzdFxyXG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9dHJlZV9uZWRiO1xyXG5cclxuZnVuY3Rpb24gYnVpbGRSb290SWZOb3RFeGlzdChjYil7XHJcbiAgcmV0dXJuIGFzeW5jKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgcm9vdD1hd2FpdChkYi5maW5kT25lQXN5bmMoe19pZDonMCd9KSk7XHJcbiAgICBpZighcm9vdCl7XHJcbiAgICAgIHZhciBkZWZhdWx0Um9vdD17XHJcbiAgICAgICAgX2lkOicwJywgXHJcbiAgICAgICAgX2xpbms6IHtcclxuICAgICAgICAgIHA6ICcwJyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgcm9vdD1hd2FpdChkYi5pbnNlcnRBc3luYyhkZWZhdWx0Um9vdCkpO1xyXG4gICAgfVxyXG4gICAgaWYodHlwZW9mIGNiID09J2Z1bmN0aW9uJyl7XHJcbiAgICAgIGNiKCk7IC8v6YCa55+lcm9vdOaehOW7uuWujOaIkFxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJvb3Q7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZF9ub2RlKGdpZCkge1xyXG4gIHJldHVybiBhc3luYyhmdW5jdGlvbigpe1xyXG4gICAgLy8gY29uc29sZS5sb2coJ3JlYWRfbm9kZScsZ2lkKTtcclxuICAgIHZhciBub2RlPWF3YWl0KGRiLmZpbmRPbmVBc3luYyh7X2lkOmdpZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KSk7IC8vcm3moIforrDooajnpLroioLngrnlt7Lnu4/ooqvliKDpmaRcclxuICAgIHJldHVybiBub2RlO1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xyXG4gIHJldHVybiBhc3luYyhmdW5jdGlvbigpe1xyXG4gICAgdmFyIG5vZGVzPWF3YWl0KGRiLmZpbmRBc3luYyh7X2lkOnskaW46Z2lkc30sX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KSk7XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX21rX3Nvbl9ieV9kYXRhKHBOb2RlLGRhdGEsYmdpZCl7XHJcbiAgcmV0dXJuIGFzeW5jKGZ1bmN0aW9uKCl7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhwTm9kZSk7XHJcbiAgICB2YXIgbmV3Tm9kZT17XHJcbiAgICAgICAgX2xpbms6IHtcclxuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX2RhdGE6ZGF0YVxyXG4gICAgfTtcclxuICAgIHZhciBfbmV3Tm9kZT0gYXdhaXQoZGIuaW5zZXJ0QXN5bmMobmV3Tm9kZSkpOy8v5o+S5YWl5paw6IqC54K5XHJcbiAgICB2YXIgcG9zPTA7XHJcbiAgICB2YXIgY2hpbGRyZW49cE5vZGUuX2xpbmsuY2hpbGRyZW47XHJcbiAgICBpZihiZ2lkKXtcclxuICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcclxuICAgIH1cclxuICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxfbmV3Tm9kZS5faWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cclxuICAgIGF3YWl0KGRiLnVwZGF0ZUFzeW5jKHtfaWQ6cE5vZGUuX2lkfSwgcE5vZGUsIHt9KSk7Ly/mj5LlhaXniLboioLngrlcclxuICAgIHJldHVybiBfbmV3Tm9kZTsvL+i/lOWbnuaWsOiKgueCuVxyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcclxuICByZXR1cm4gYXN5bmMoZnVuY3Rpb24oKXtcclxuICAgIHZhciBwTm9kZT1hd2FpdChkYi5maW5kT25lQXN5bmMoe1wiX2lkXCI6cGdpZH0pKTsvL+aJvuWIsOeItuiKgueCuVxyXG4gICAgaWYoIXBOb2RlKXtcclxuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xyXG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcclxuICAgIH1cclxuICAgIHJldHVybiBfbWtfc29uX2J5X2RhdGEocE5vZGUsZGF0YSk7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfYnJvdGhlcl9ieV9kYXRhKGJnaWQsZGF0YSkge1xyXG4gIHJldHVybiBhc3luYyhmdW5jdGlvbigpe1xyXG4gICAgdmFyIHBOb2RlPWF3YWl0KGRiLmZpbmRPbmVBc3luYyh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmJnaWR9fSkpOy8v5om+5Yiw54i26IqC54K5XHJcbiAgICBpZighcE5vZGUpe1xyXG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlIG9mIGJyb3RoZXIgJytiZ2lkKTtcclxuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXHJcbiAgICB9XHJcbiAgICByZXR1cm4gX21rX3Nvbl9ieV9kYXRhKHBOb2RlLGRhdGEsYmdpZCk7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIF91cGRhdGUoZGIscXVlcnksdXBkYXRlLGNhbGxiYWNrKXsgXHJcbiAgICB2YXIgY2I9ZnVuY3Rpb24oZXJyLCBudW1BZmZlY3RlZCwgYWZmZWN0ZWREb2N1bWVudHMsIHVwc2VydCl7XHJcbiAgICAgIGNhbGxiYWNrKGVycixhZmZlY3RlZERvY3VtZW50cyk7Ly/kv67mlLljYWxsYmFja+eahOetvuWQje+8jOS9v+W+l+esrOS6jOS4quWPguaVsOS4uuabtOaWsOi/h+eahGRvY1xyXG4gICAgfTtcclxuICAgIHZhciBvcHRpb25zPXsgbXVsdGk6IGZhbHNlLHJldHVyblVwZGF0ZWREb2NzOnRydWUgfTtcclxuICAgIGRiLnVwZGF0ZShxdWVyeSwgdXBkYXRlLCBvcHRpb25zLGNiKTtcclxufVxyXG5cclxuY29uc3QgdXBkYXRlPVByb21pc2UucHJvbWlzaWZ5KF91cGRhdGUpOy8v5L+u5pS5Y2FsbGJhY2vnrb7lkI3lkI7lsLHlj6/ku6Vwcm9taXNpZnlcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZV9kYXRhKGdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBhc3luYyhmdW5jdGlvbigpe1xyXG4gICAgdmFyIG5vZGU9YXdhaXQodXBkYXRlKGRiLHtfaWQ6Z2lkfSwgeyAkc2V0OiB7IF9kYXRhOiBkYXRhIH0gfSkpOy8v5pu05paw6IqC54K55bm26L+U5Zue5pu05paw5ZCO55qE6IqC54K5XHJcbiAgICByZXR1cm4gbm9kZTtcclxuICB9KSgpO1xyXG59XHJcblxyXG5cclxuLy/pgJLlvZLpgY3ljobmiYDmnInlrZDoioLngrlcclxuLy9naWRz5piv6KaB6K6/6Zeu55qE6IqC54K5aWTnmoTliJfooahcclxuLy92aXNpdOaYr+S4gOS4quWHveaVsOOAguiuv+mXruiKgueCueeahOWKqOS9nOOAglxyXG5mdW5jdGlvbiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihnaWRzLHZpc2l0KSB7XHJcbiAgaWYgKCFnaWRzfHxnaWRzLmxlbmd0aD09MCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoKTt9Ly/pnIDopoHov5Tlm57kuIDkuKpwcm9taXNlIFxyXG4gIHJldHVybiBQcm9taXNlLmFsbChnaWRzLm1hcChnaWQgPT4ge1xyXG4gICAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+eyAvL+ivu+WPluW9k+WJjeiKgueCuVxyXG4gICAgICByZXR1cm4gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4obm9kZS5fbGluay5jaGlsZHJlbix2aXNpdCkudGhlbigoKT0+eyAvL+iuv+mXruaJgOacieWtkOiKgueCuVxyXG4gICAgICAgIHJldHVybiB2aXNpdChub2RlKTsgLy/nhLblkI7orr/pl67lvZPliY3oioLngrlcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfSkpO1xyXG59XHJcblxyXG4vL+agh+iusOWIoOmZpOiKgueCueS4juaJgOacieWtkOWtmeiKgueCuVxyXG5mdW5jdGlvbiByZW1vdmUoZ2lkKSB7XHJcbiAgcmV0dXJuIGFzeW5jKGZ1bmN0aW9uKCl7XHJcbiAgICAgaWYoZ2lkPT0nMCcpcmV0dXJuOy8v5qC56IqC54K55LiN6IO95Yig6Zmk44CCXHJcbiAgICAgLy/mlLbpm4bmiYDmnInlrZDoioLngrlcclxuICAgICB2YXIgZ2lkc2ZvclJlbW92ZT1bXTtcclxuICAgICBjb25zdCBybT0obm9kZSk9PntnaWRzZm9yUmVtb3ZlLnB1c2gobm9kZS5faWQpfTtcclxuICAgICBhd2FpdChfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihbZ2lkXSxybSkpO1xyXG4gICAgIC8v5om56YeP5Yig6ZmkXHJcbiAgICAgYXdhaXQoZGIudXBkYXRlQXN5bmMoe19pZDp7JGluOmdpZHNmb3JSZW1vdmV9fSwgIHsgJHNldDogeyBfcm06dHJ1ZSAgfSB9LCB7fSkpOy8v5qCH6K6w5Li65Yig6ZmkXHJcbiAgICAgcmV0dXJuIGdpZHNmb3JSZW1vdmU7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xyXG4gIGlmKGdpZD09JzAnKXJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyAvLycwJ+S4uuagueiKgueCueOAguS7u+S9leiKgueCuemDveS4jeaYrycwJ+eahOeItuiKgueCuVxyXG4gIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PntcclxuICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcclxuICAgIGlmKG5vZGUuX2xpbmsucD09PXBnaWQpe1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1lbHNle1xyXG4gICAgICByZXR1cm4gX2lzQW5jZXN0b3IocGdpZCxub2RlLl9saW5rLnApO1xyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcclxuICByZXR1cm4gYXN5bmMoZnVuY3Rpb24oKXtcclxuICAgIHZhciBnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlPWF3YWl0KF9pc0FuY2VzdG9yKGdpZCxucE5vZGUuX2lkKSk7XHJcbiAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcclxuICAgICAgY29uc29sZS5sb2coZ2lkLCdpcyBhbmNlc3RvciBvZicsbnBOb2RlLl9pZClcclxuICAgICAgcmV0dXJuIG51bGw7Ly/opoHnp7vliqjnmoToioLngrnkuI3og73mmK/nm67moIfniLboioLngrnnmoTplb/ovojoioLngrlcclxuICAgIH1cclxuICAgIHZhciBwTm9kZT1hd2FpdChkYi5maW5kT25lQXN5bmMoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpnaWR9fSkpOy8v5om+5Yiw5Y6f54i26IqC54K5XHJcbiAgICBhd2FpdChkYi51cGRhdGVBc3luYyh7X2lkOnBOb2RlLl9pZH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSApOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXHJcbiAgICBhd2FpdChkYi51cGRhdGVBc3luYyh7X2lkOmdpZH0sICB7ICRzZXQ6IHsgXCJfbGluay5wXCI6IG5wTm9kZS5faWQgfSB9LCB7fSkpOy8v5pS55Y+YZ2lk55qE54i26IqC54K55Li65paw54i26IqC54K5XHJcbiAgICB2YXIgcG9zPTA7XHJcbiAgICB2YXIgY2hpbGRyZW49bnBOb2RlLl9saW5rLmNoaWxkcmVuO1xyXG4gICAgaWYoYmdpZCl7XHJcbiAgICAgIHBvcz1jaGlsZHJlbi5pbmRleE9mKGJnaWQpKzE7XHJcbiAgICB9XHJcbiAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsZ2lkKTsvL+aKiuaWsOiKgueCueeahElE5o+S5YWl5Yiw54i26IqC54K55LitXHJcbiAgICBhd2FpdChkYi51cGRhdGVBc3luYyh7X2lkOm5wTm9kZS5faWR9LCBucE5vZGUsIHt9KSk7Ly/mj5LlhaXniLboioLngrlcclxuICB9KSgpOyAgXHJcbn1cclxuXHJcbi8v5oqKZ2lk6IqC54K556e75Yqo5Li6cGdpZOeahOWtkOiKgueCuVxyXG4vL+WMheWQqzPmraXjgIIgMS7ku45naWTnmoTljp/niLboioLngrnliKDpmaTjgIIy5pS55Y+YZ2lk55qE5b2T5YmN54i26IqC54K544CCIDPjgILms6jlhozliLDmlrDniLboioLngrlcclxuLy/np7vliqjliY3pnIDopoHlgZrmo4Dmn6XjgILnpZblhYjoioLngrnkuI3og73np7vliqjkuLrlkI7ovojnmoTlrZDoioLngrlcclxuZnVuY3Rpb24gbW92ZV9hc19zb24oZ2lkLCBwZ2lkKSB7XHJcbiAgcmV0dXJuIGFzeW5jKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbnBOb2RlPWF3YWl0KGRiLmZpbmRPbmVBc3luYyh7XCJfaWRcIjpwZ2lkfSkpOy8v5om+5Yiw5paw54i26IqC54K5XHJcbiAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUpO1xyXG4gIH0pKCk7ICBcclxufVxyXG5cclxuZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xyXG4gIHJldHVybiBhc3luYyhmdW5jdGlvbigpe1xyXG4gICAgdmFyIG5wTm9kZT1hd2FpdChkYi5maW5kT25lQXN5bmMoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpiZ2lkfX0pKTsvL+aJvuWIsOaWsOeItuiKgueCuVxyXG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlLGJnaWQpO1xyXG4gIH0pKCk7IFxyXG59Il19