'use strict';

// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
// var Promise = require('bluebird');
var R = require('ramda');

var result = R.prop('result');

var db;
function tree_mongodb(_db, cb) {
  // db=Promise.promisifyAll(_db);
  db = _db;
  buildRootIfNotExist().then(typeof cb === 'function' ? cb() : null); //cb用于通知测试程序
  return {
    read_node: read_node,
    read_nodes: read_nodes,
    mk_son_by_data: mk_son_by_data,
    mk_son_by_name: mk_son_by_name,
    mk_brother_by_data: mk_brother_by_data,
    update_data: update_data,
    remove: remove,
    // move_as_son,
    // move_as_brother,
    //for test
    buildRootIfNotExist: buildRootIfNotExist
  };
}

module.exports = tree_mongodb;
//内部工具函数
var _insertAsync = function _insertAsync(node) {
  return db.insertOne(node).then(function (res) {
    node._id = res.insertedId;
    return node;
  });
};

var _insertChildren = function _insertChildren(pNode, gid, bgid) {
  var pos = 0;
  if (bgid) {
    pos = pNode._link.children.indexOf(bgid) + 1;
  }
  return db.updateOne({ _id: pNode._id }, {
    $push: {
      "_link.children": {
        $each: [gid],
        $position: pos
      }
    }
  });
};

function buildRootIfNotExist(cb) {
  var _this = this;

  // console.log("buildRootIfNotExist");
  return function _callee() {
    var root, defaultRoot;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(db.findOne({ _id: '0' }));

          case 2:
            root = _context.sent;

            if (root) {
              _context.next = 8;
              break;
            }

            defaultRoot = {
              _id: '0',
              _link: {
                p: '0',
                children: []
              }
            };
            _context.next = 7;
            return regeneratorRuntime.awrap(_insertAsync(defaultRoot));

          case 7:
            root = _context.sent;

          case 8:
            return _context.abrupt('return', root);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, null, _this);
  }();
}

function read_node(gid) {
  //rm标记表示节点已经被删除
  return db.findOne({ _id: gid, _rm: { $exists: false } });
}

function read_nodes(gids) {
  return db.find({ _id: { $in: gids }, _rm: { $exists: false } }).toArray();
}

function _mk_son_by_kv(pNode, key, value, bgid) {
  var _this2 = this;

  return function _callee2() {
    var _newNode, newNode;

    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // console.log(pNode);
            _newNode = {
              _link: {
                p: pNode._id,
                children: []
              }
            };

            _newNode[key] = value;
            _context2.next = 4;
            return regeneratorRuntime.awrap(_insertAsync(_newNode));

          case 4:
            newNode = _context2.sent;
            _context2.next = 7;
            return regeneratorRuntime.awrap(_insertChildren(pNode, newNode._id, bgid));

          case 7:
            return _context2.abrupt('return', newNode);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, null, _this2);
  }();
}

//返回新节点
function mk_son_by_data(pgid, data) {
  var _this3 = this;

  return function _callee3() {
    var pNode;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(db.findOne({ "_id": pgid }));

          case 2:
            pNode = _context3.sent;

            if (pNode) {
              _context3.next = 6;
              break;
            }

            throw 'cannot find parent node ' + pgid;

          case 6:
            return _context3.abrupt('return', _mk_son_by_kv(pNode, "_data", data));

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, null, _this3);
  }();
}

function mk_son_by_name(pgid, name) {
  var _this4 = this;

  return function _callee4() {
    var pNode, node;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return regeneratorRuntime.awrap(db.findOne({ "_id": pgid }));

          case 2:
            pNode = _context4.sent;

            if (pNode) {
              _context4.next = 6;
              break;
            }

            throw 'cannot find parent node ' + pgid;

          case 6:
            _context4.next = 8;
            return regeneratorRuntime.awrap(db.findOne({ "_name": name, "_link.p": pgid }));

          case 8:
            node = _context4.sent;

            if (!node) {
              _context4.next = 11;
              break;
            }

            return _context4.abrupt('return', node);

          case 11:
            return _context4.abrupt('return', _mk_son_by_kv(pNode, "_name", name));

          case 12:
          case 'end':
            return _context4.stop();
        }
      }
    }, null, _this4);
  }();
}

function mk_brother_by_data(bgid, data) {
  var _this5 = this;

  return function _callee5() {
    var pNode;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return regeneratorRuntime.awrap(db.findOne({ "_link.children": bgid }));

          case 2:
            pNode = _context5.sent;

            if (pNode) {
              _context5.next = 6;
              break;
            }

            throw 'cannot find parent node of brother ' + bgid;

          case 6:
            return _context5.abrupt('return', _mk_son_by_kv(pNode, "_data", data, bgid));

          case 7:
          case 'end':
            return _context5.stop();
        }
      }
    }, null, _this5);
  }();
}

// function _update(db,query,update,callback){
//     var cb=function(err, numAffected, affectedDocuments, upsert){
//       callback(err,affectedDocuments);//修改callback的签名，使得第二个参数为更新过的doc
//     };
//     var options={ multi: false,returnUpdatedDocs:true };
//     db.update(query, update, options,cb);
// }

// const update=Promise.promisify(_update);//修改callback签名后就可以promisify

function update_data(gid, data) {
  return db.updateOne({ _id: gid }, { $set: { _data: data } }).then(function (_) {
    return db.findOne({ _id: gid });
  });
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
  var _this6 = this;

  return function _callee6() {
    var node, gidsforRemove, rm;
    return regeneratorRuntime.async(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!(gid === '0')) {
              _context6.next = 2;
              break;
            }

            return _context6.abrupt('return');

          case 2:
            _context6.next = 4;
            return regeneratorRuntime.awrap(read_node(gid));

          case 4:
            node = _context6.sent;

            if (node) {
              _context6.next = 7;
              break;
            }

            return _context6.abrupt('return');

          case 7:
            //已经不存在，返回
            //收集所有子节点
            gidsforRemove = [];

            rm = function rm(node) {
              gidsforRemove.push(node._id);
            };

            _context6.next = 11;
            return regeneratorRuntime.awrap(_traversal_all_children([gid], rm));

          case 11:
            _context6.next = 13;
            return regeneratorRuntime.awrap(db.updateMany({ _id: { $in: gidsforRemove } }, { $set: { _rm: true } }, {}));

          case 13:
            _context6.next = 15;
            return regeneratorRuntime.awrap(db.updateOne({ _id: node._link.p }, { $pull: { "_link.children": gid } }, {}));

          case 15:
            return _context6.abrupt('return', gidsforRemove);

          case 16:
          case 'end':
            return _context6.stop();
        }
      }
    }, null, _this6);
  }();
}

// function _isAncestor(pgid,gid){
//   if(gid=='0')return Promise.resolve(false); //'0'为根节点。任何节点都不是'0'的父节点
//   return read_node(gid).then(node=>{
//     // console.log('check',pgid,node._link.p,node)
//     if(node._link.p===pgid){
//       return true;
//     }else{
//       return _isAncestor(pgid,node._link.p);
//     }
//   })
// }

// function _move_as_son(gid, npNode,bgid){
//   return (async ()=>{
//     var gidIsAncestorOfNewParentNode=await _isAncestor(gid,npNode._id);
//     if(gidIsAncestorOfNewParentNode){
//       console.log(gid,'is ancestor of',npNode._id)
//       return null;//要移动的节点不能是目标父节点的长辈节点
//     }
//     var pNode=await db.findOne({"_link.children":{$elemMatch:gid}});//找到原父节点

//     await db.updateAsync({_id:pNode._id},  { $pull: { "_link.children": gid } } , {}) ;//从原父节点删除
//     if(npNode._id===pNode._id){//如果新的父节点与旧的父节点相同。要更新父节点
//       npNode=await db.findOne({_id:npNode._id, _rm: { $exists: false }});
//     }else{
//       await db.updateAsync({_id:gid},  { $set: { "_link.p": npNode._id } }, {});//改变gid的父节点为新父节点
//     }
//     var pos=0;
//     var children=npNode._link.children;
//     if(bgid){
//       pos=children.indexOf(bgid)+1;
//     }
//     children.splice(pos,0,gid);//把新节点的ID插入到父节点中
//     await db.updateAsync({_id:npNode._id}, npNode, {});//插入父节点
// return await read_node(gid);
//   })(); 
// }

// //把gid节点移动为pgid的子节点
// //包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
// //移动前需要做检查。祖先节点不能移动为后辈的子节点
// function move_as_son(gid, pgid) {
//   return (async ()=>{
//     var npNode=await db.findOne({"_id":pgid});//找到新父节点
//     return _move_as_son(gid,npNode);
//   })(); 
// }

// function move_as_brother(gid, bgid) {
//   return (async ()=>{
//     var npNode=await db.findOne({"_link.children":{$elemMatch:bgid}});//找到新父节点
//     return _move_as_son(gid,npNode,bgid);
//   })();
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsSUFBSSxJQUFFLFFBQVEsT0FBUixDQUFGOztBQUVKLElBQU0sU0FBTyxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVA7O0FBRU4sSUFBSSxFQUFKO0FBQ0EsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEVBQTFCLEVBQTZCOztBQUUzQixPQUFHLEdBQUgsQ0FGMkI7QUFHM0Isd0JBQXNCLElBQXRCLENBQTJCLE9BQVEsRUFBUCxLQUFhLFVBQWIsR0FBeUIsSUFBMUIsR0FBK0IsSUFBL0IsQ0FBM0I7QUFIMkIsU0FJcEI7QUFDTCx3QkFESztBQUVMLDBCQUZLO0FBR0wsa0NBSEs7QUFJTCxrQ0FKSztBQUtMLDBDQUxLO0FBTUwsNEJBTks7QUFPTCxrQkFQSzs7OztBQVdMLDRDQVhLO0dBQVAsQ0FKMkI7Q0FBN0I7O0FBbUJBLE9BQU8sT0FBUCxHQUFlLFlBQWY7O0FBRUEsSUFBTSxlQUFhLFNBQWIsWUFBYSxDQUFDLElBQUQsRUFBUTtBQUN6QixTQUFPLEdBQUcsU0FBSCxDQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBd0IsZUFBSztBQUNsQyxTQUFLLEdBQUwsR0FBUyxJQUFJLFVBQUosQ0FEeUI7QUFFbEMsV0FBTyxJQUFQLENBRmtDO0dBQUwsQ0FBL0IsQ0FEeUI7Q0FBUjs7QUFRbkIsSUFBTSxrQkFBZ0IsU0FBaEIsZUFBZ0IsQ0FBQyxLQUFELEVBQU8sR0FBUCxFQUFXLElBQVgsRUFBa0I7QUFDdEMsTUFBSSxNQUFJLENBQUosQ0FEa0M7QUFFcEMsTUFBRyxJQUFILEVBQVE7QUFDTixVQUFJLE1BQU0sS0FBTixDQUFZLFFBQVosQ0FBcUIsT0FBckIsQ0FBNkIsSUFBN0IsSUFBbUMsQ0FBbkMsQ0FERTtHQUFSO0FBR0QsU0FBTyxHQUFHLFNBQUgsQ0FBYSxFQUFDLEtBQUksTUFBTSxHQUFOLEVBQWxCLEVBQThCO0FB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QUcsU0FBSCxDQUFhLEVBQUMsS0FBSSxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWxCLEVBQWtDLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixHQUFsQixFQUFULEVBQXBDLEVBQXlFLEVBQXpFOzs7OENBQ0M7Ozs7Ozs7O0dBWEYsRUFBUixDQURtQjtDQUFyQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXN5bmMnKTtcbi8vIHZhciBhd2FpdCA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXdhaXQnKTtcbi8vIHZhciBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbnZhciBSPXJlcXVpcmUoJ3JhbWRhJyk7XG5cbmNvbnN0IHJlc3VsdD1SLnByb3AoJ3Jlc3VsdCcpO1xuXG52YXIgZGI7IFxuZnVuY3Rpb24gdHJlZV9tb25nb2RiKF9kYixjYil7XG4gIC8vIGRiPVByb21pc2UucHJvbWlzaWZ5QWxsKF9kYik7XG4gIGRiPV9kYjtcbiAgYnVpbGRSb290SWZOb3RFeGlzdCgpLnRoZW4oKHR5cGVvZiBjYiA9PT0nZnVuY3Rpb24nKT9jYigpOm51bGwpOyAvL2Ni55So5LqO6YCa55+l5rWL6K+V56iL5bqPXG4gIHJldHVybiB7XG4gICAgcmVhZF9ub2RlLFxuICAgIHJlYWRfbm9kZXMsXG4gICAgbWtfc29uX2J5X2RhdGEsXG4gICAgbWtfc29uX2J5X25hbWUsXG4gICAgbWtfYnJvdGhlcl9ieV9kYXRhLFxuICAgIHVwZGF0ZV9kYXRhLFxuICAgIHJlbW92ZSxcbiAgICAvLyBtb3ZlX2FzX3NvbixcbiAgICAvLyBtb3ZlX2FzX2Jyb3RoZXIsXG4gICAgLy9mb3IgdGVzdFxuICAgIGJ1aWxkUm9vdElmTm90RXhpc3RcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cz10cmVlX21vbmdvZGI7XG4vL+WGhemDqOW3peWFt+WHveaVsFxuY29uc3QgX2luc2VydEFzeW5jPShub2RlKT0+e1xuICByZXR1cm4gZGIuaW5zZXJ0T25lKG5vZGUpLnRoZW4ocmVzPT57XG4gICAgbm9kZS5faWQ9cmVzLmluc2VydGVkSWQ7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH0pXG59XG5cblxuY29uc3QgX2luc2VydENoaWxkcmVuPShwTm9kZSxnaWQsYmdpZCk9PntcbiAgdmFyIHBvcz0wO1xuICAgIGlmKGJnaWQpe1xuICAgICAgcG9zPXBOb2RlLl9saW5rLmNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcbiAgICB9XG4gICByZXR1cm4gZGIudXBkYXRlT25lKHtfaWQ6cE5vZGUuX2lkfSwge1xuICAgICAkcHVzaDoge1xuICAgICAgICBcIl9saW5rLmNoaWxkcmVuXCI6IHtcbiAgICAgICAgICAgJGVhY2g6IFtnaWRdLFxuICAgICAgICAgICAkcG9zaXRpb246IHBvc1xuICAgICAgICB9XG4gICAgIH1cbiAgIH0pOyBcbn1cblxuZnVuY3Rpb24gYnVpbGRSb290SWZOb3RFeGlzdChjYil7XG4gIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiKTtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdCBiZWdpblwiKTtcbiAgICB2YXIgcm9vdD1hd2FpdCBkYi5maW5kT25lKHtfaWQ6JzAnfSk7XG4gICAgLy8gY29uc29sZS5sb2coXCJmb3VuZCByb290XCIscm9vdCk7XG4gICAgaWYoIXJvb3Qpe1xuICAgICAgdmFyIGRlZmF1bHRSb290PXtcbiAgICAgICAgX2lkOicwJywgXG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogJzAnLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcm9vdD1hd2FpdCBfaW5zZXJ0QXN5bmMoZGVmYXVsdFJvb3QpO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3RcIixyb290KTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gcmVhZF9ub2RlKGdpZCkge1xuICAvL3Jt5qCH6K6w6KGo56S66IqC54K55bey57uP6KKr5Yig6ZmkXG4gIHJldHVybiBkYi5maW5kT25lKHtfaWQ6Z2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcbiAgcmV0dXJuIGRiLmZpbmQoe19pZDp7JGluOmdpZHN9LF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSkudG9BcnJheSgpO1xufVxuXG5cbmZ1bmN0aW9uIF9ta19zb25fYnlfa3YocE5vZGUsa2V5LHZhbHVlLGJnaWQpe1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2cocE5vZGUpO1xuICAgIHZhciBfbmV3Tm9kZT17XG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgfTtcbiAgICBfbmV3Tm9kZVtrZXldPXZhbHVlO1xuICAgIHZhciBuZXdOb2RlPSBhd2FpdCBfaW5zZXJ0QXN5bmMoX25ld05vZGUpIDsvL+aPkuWFpeaWsOiKgueCuVxuICAgIC8v5o+S5YWl54i26IqC54K5XG4gICAgYXdhaXQgX2luc2VydENoaWxkcmVuKHBOb2RlLG5ld05vZGUuX2lkLGJnaWQpO1xuICAgIHJldHVybiBuZXdOb2RlOy8v6L+U5Zue5paw6IqC54K5XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9pZFwiOnBnaWR9KTsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfZGF0YVwiLGRhdGEpO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfaWRcIjpwZ2lkfSkgOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICB2YXIgbm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9uYW1lXCI6bmFtZSxcIl9saW5rLnBcIjpwZ2lkfSk7Ly/mmK/lkKblt7LmnInlkIzlkI3oioLngrlcbiAgICBpZihub2RlKXtcbiAgICAgIHJldHVybiBub2RlOy8v5aaC5pyJ55u05o6l6L+U5ZueXG4gICAgfVxuICAgIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX25hbWVcIixuYW1lKTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfYnJvdGhlcl9ieV9kYXRhKGJnaWQsZGF0YSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2xpbmsuY2hpbGRyZW5cIjpiZ2lkfSk7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfZGF0YVwiLGRhdGEsYmdpZCk7XG4gIH0pKCk7XG59XG5cblxuLy8gZnVuY3Rpb24gX3VwZGF0ZShkYixxdWVyeSx1cGRhdGUsY2FsbGJhY2speyBcbi8vICAgICB2YXIgY2I9ZnVuY3Rpb24oZXJyLCBudW1BZmZlY3RlZCwgYWZmZWN0ZWREb2N1bWVudHMsIHVwc2VydCl7XG4vLyAgICAgICBjYWxsYmFjayhlcnIsYWZmZWN0ZWREb2N1bWVudHMpOy8v5L+u5pS5Y2FsbGJhY2vnmoTnrb7lkI3vvIzkvb/lvpfnrKzkuozkuKrlj4LmlbDkuLrmm7TmlrDov4fnmoRkb2Ncbi8vICAgICB9O1xuLy8gICAgIHZhciBvcHRpb25zPXsgbXVsdGk6IGZhbHNlLHJldHVyblVwZGF0ZWREb2NzOnRydWUgfTtcbi8vICAgICBkYi51cGRhdGUocXVlcnksIHVwZGF0ZSwgb3B0aW9ucyxjYik7XG4vLyB9XG5cbi8vIGNvbnN0IHVwZGF0ZT1Qcm9taXNlLnByb21pc2lmeShfdXBkYXRlKTsvL+S/ruaUuWNhbGxiYWNr562+5ZCN5ZCO5bCx5Y+v5LulcHJvbWlzaWZ5XG5cbmZ1bmN0aW9uIHVwZGF0ZV9kYXRhKGdpZCwgZGF0YSkge1xuICByZXR1cm4gZGIudXBkYXRlT25lKHtfaWQ6Z2lkfSwgeyAkc2V0OiB7IF9kYXRhOiBkYXRhIH0gfSlcbiAgLnRoZW4oXz0+ZGIuZmluZE9uZSh7X2lkOmdpZH0pKTtcbn1cblxuXG4vL+mAkuW9kumBjeWOhuaJgOacieWtkOiKgueCuVxuLy9naWRz5piv6KaB6K6/6Zeu55qE6IqC54K5aWTnmoTliJfooahcbi8vdmlzaXTmmK/kuIDkuKrlh73mlbDjgILorr/pl67oioLngrnnmoTliqjkvZzjgIJcbmZ1bmN0aW9uIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKGdpZHMsdmlzaXQpIHtcbiAgaWYgKCFnaWRzfHxnaWRzLmxlbmd0aD09MCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoKTt9Ly/pnIDopoHov5Tlm57kuIDkuKpwcm9taXNlIFxuICByZXR1cm4gUHJvbWlzZS5hbGwoZ2lkcy5tYXAoZ2lkID0+IHtcbiAgICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57IC8v6K+75Y+W5b2T5YmN6IqC54K5XG4gICAgICByZXR1cm4gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4obm9kZS5fbGluay5jaGlsZHJlbix2aXNpdCkudGhlbigoKT0+eyAvL+iuv+mXruaJgOacieWtkOiKgueCuVxuICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XG4gICAgICB9KVxuICAgIH0pXG4gIH0pKTtcbn1cblxuLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcbmZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgICBpZihnaWQ9PT0nMCcpcmV0dXJuOy8v5qC56IqC54K55LiN6IO95Yig6Zmk44CCXG4gICAgIHZhciBub2RlPWF3YWl0IHJlYWRfbm9kZShnaWQpOyAvL+WFiOivu+WPluimgeWIoOmZpOeahOiKgueCuVxuICAgICBpZighbm9kZSlyZXR1cm47Ly/lt7Lnu4/kuI3lrZjlnKjvvIzov5Tlm55cbiAgICAgLy/mlLbpm4bmiYDmnInlrZDoioLngrlcbiAgICAgdmFyIGdpZHNmb3JSZW1vdmU9W107XG4gICAgIGNvbnN0IHJtPShub2RlKT0+e2dpZHNmb3JSZW1vdmUucHVzaChub2RlLl9pZCl9O1xuICAgICBhd2FpdCBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihbZ2lkXSxybSk7XG4gICAgIC8v5om56YeP5Yig6ZmkXG4gICAgIGF3YWl0IGRiLnVwZGF0ZU1hbnkoe19pZDp7JGluOmdpZHNmb3JSZW1vdmV9fSwgIHsgJHNldDogeyBfcm06dHJ1ZSAgfSB9LCB7fSk7Ly/moIforrDkuLrliKDpmaRcbiAgICAgYXdhaXQgZGIudXBkYXRlT25lKHtfaWQ6bm9kZS5fbGluay5wfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuICAgICByZXR1cm4gZ2lkc2ZvclJlbW92ZTtcbiAgfSkoKTtcbn1cblxuLy8gZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xuLy8gICBpZihnaWQ9PScwJylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgLy8nMCfkuLrmoLnoioLngrnjgILku7vkvZXoioLngrnpg73kuI3mmK8nMCfnmoTniLboioLngrlcbi8vICAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+e1xuLy8gICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcbi8vICAgICBpZihub2RlLl9saW5rLnA9PT1wZ2lkKXtcbi8vICAgICAgIHJldHVybiB0cnVlO1xuLy8gICAgIH1lbHNle1xuLy8gICAgICAgcmV0dXJuIF9pc0FuY2VzdG9yKHBnaWQsbm9kZS5fbGluay5wKTtcbi8vICAgICB9XG4vLyAgIH0pXG4vLyB9XG5cbi8vIGZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlPWF3YWl0IF9pc0FuY2VzdG9yKGdpZCxucE5vZGUuX2lkKTtcbi8vICAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcbi8vICAgICAgIGNvbnNvbGUubG9nKGdpZCwnaXMgYW5jZXN0b3Igb2YnLG5wTm9kZS5faWQpXG4vLyAgICAgICByZXR1cm4gbnVsbDsvL+imgeenu+WKqOeahOiKgueCueS4jeiDveaYr+ebruagh+eItuiKgueCueeahOmVv+i+iOiKgueCuVxuLy8gICAgIH1cbi8vICAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmdpZH19KTsvL+aJvuWIsOWOn+eItuiKgueCuVxuXG4vLyAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpwTm9kZS5faWR9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4vLyAgICAgaWYobnBOb2RlLl9pZD09PXBOb2RlLl9pZCl7Ly/lpoLmnpzmlrDnmoTniLboioLngrnkuI7ml6fnmoTniLboioLngrnnm7jlkIzjgILopoHmm7TmlrDniLboioLngrlcbi8vICAgICAgIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lKHtfaWQ6bnBOb2RlLl9pZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTsgXG4vLyAgICAgfWVsc2V7XG4vLyAgICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOmdpZH0sICB7ICRzZXQ6IHsgXCJfbGluay5wXCI6IG5wTm9kZS5faWQgfSB9LCB7fSk7Ly/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcbi8vICAgICB9XG4vLyAgICAgdmFyIHBvcz0wO1xuLy8gICAgIHZhciBjaGlsZHJlbj1ucE5vZGUuX2xpbmsuY2hpbGRyZW47XG4vLyAgICAgaWYoYmdpZCl7XG4vLyAgICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuLy8gICAgIH1cbi8vICAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsZ2lkKTsvL+aKiuaWsOiKgueCueeahElE5o+S5YWl5Yiw54i26IqC54K55LitXG4vLyAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpucE5vZGUuX2lkfSwgbnBOb2RlLCB7fSk7Ly/mj5LlhaXniLboioLngrlcbiAgICAvLyByZXR1cm4gYXdhaXQgcmVhZF9ub2RlKGdpZCk7XG4vLyAgIH0pKCk7ICBcbi8vIH1cblxuLy8gLy/miopnaWToioLngrnnp7vliqjkuLpwZ2lk55qE5a2Q6IqC54K5XG4vLyAvL+WMheWQqzPmraXjgIIgMS7ku45naWTnmoTljp/niLboioLngrnliKDpmaTjgIIy5pS55Y+YZ2lk55qE5b2T5YmN54i26IqC54K544CCIDPjgILms6jlhozliLDmlrDniLboioLngrlcbi8vIC8v56e75Yqo5YmN6ZyA6KaB5YGa5qOA5p+l44CC56WW5YWI6IqC54K55LiN6IO956e75Yqo5Li65ZCO6L6I55qE5a2Q6IqC54K5XG4vLyBmdW5jdGlvbiBtb3ZlX2FzX3NvbihnaWQsIHBnaWQpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBucE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfaWRcIjpwZ2lkfSk7Ly/mib7liLDmlrDniLboioLngrlcbi8vICAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUpO1xuLy8gICB9KSgpOyAgXG4vLyB9XG5cbi8vIGZ1bmN0aW9uIG1vdmVfYXNfYnJvdGhlcihnaWQsIGJnaWQpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBucE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmJnaWR9fSk7Ly/mib7liLDmlrDniLboioLngrlcbi8vICAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUsYmdpZCk7XG4vLyAgIH0pKCk7IFxuLy8gfSJdfQ==