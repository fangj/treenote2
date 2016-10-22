'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
// var Promise = require('bluebird');
var ObjectId = require('mongodb').ObjectId;
var id = function id(_id) {
  return (typeof _id === 'undefined' ? 'undefined' : _typeof(_id)) === "object" ? id : _id === '0' ? '0' : ObjectId(_id);
};
var db;
function tree_mongodb(_db, cb) {
  // db=Promise.promisifyAll(_db);
  db = _db;
  buildRootIfNotExist().then(typeof cb === 'function' ? cb() : null); //cb用于通知测试程序
  return {
    read_node: function read_node(gid) {
      return _read_node(id(gid));
    },
    read_nodes: function read_nodes(gids) {
      return _read_nodes(gids.map(id));
    },
    mk_son_by_data: function mk_son_by_data(pgid, data) {
      return _mk_son_by_data(id(pgid), data);
    },
    mk_son_by_name: function mk_son_by_name(pgid, name) {
      return _mk_son_by_name(id(pgid), name);
    },
    mk_brother_by_data: function mk_brother_by_data(bgid, data) {
      return _mk_brother_by_data(id(bgid), data);
    },
    update_data: function update_data(gid, data) {
      return _update_data(id(gid), data);
    },
    remove: function remove(gid) {
      return _remove(id(gid));
    },
    move_as_son: function move_as_son(gid, pgid) {
      return _move_as_son2(id(gid), id(pgid));
    },
    move_as_brother: function move_as_brother(gid, bgid) {
      return _move_as_brother(id(gid), id(bgid));
    },
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

var _insertChildrenAsync = function _insertChildrenAsync(pNode, gid, bgid) {
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

var findParentAsync = function findParentAsync(sgid) {
  return db.findOne({ "_link.children": sgid, _rm: { $exists: false } });
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

function _read_node(gid) {
  //rm标记表示节点已经被删除
  console.log("read_node", gid);
  return db.findOne({ _id: gid, _rm: { $exists: false } });
}

function _read_nodes(gids) {
  console.log("read_nodes", gids);
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
            return regeneratorRuntime.awrap(_insertChildrenAsync(pNode, newNode._id, bgid));

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
function _mk_son_by_data(pgid, data) {
  var _this3 = this;

  return function _callee3() {
    var pNode;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(_read_node(pgid));

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

// function __mk_son_by_name(pgid, name) {
//   return (async ()=>{
//     console.log("mk_son_by_name",pgid,name)
//     var pNode=await  read_node(pgid) ;//找到父节点
//     if(!pNode){
//       throw ('cannot find parent node '+pgid);
//       return null;//父节点不存在，无法插入，返回null
//     }
//     var node=await db.findOne({"_name":name,"_link.p":pgid});//是否已有同名节点
//     if(node){
//       return node;//如有直接返回
//     }
//     return _mk_son_by_kv(pNode,"_name",name);
//   })();
// }

function _mk_son_by_name(pgid, name) {
  var _this4 = this;

  return function _callee4() {
    var pNode, _newNode, node, newNode;

    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            console.log("mk_son_by_name", pgid, name);
            _context4.next = 3;
            return regeneratorRuntime.awrap(_read_node(pgid));

          case 3:
            pNode = _context4.sent;

            if (pNode) {
              _context4.next = 7;
              break;
            }

            throw 'cannot find parent node ' + pgid;

          case 7:
            //父节点不存在，无法插入，返回null
            _newNode = {
              _link: {
                p: pNode._id,
                children: []
              },
              _name: name
            };
            _context4.next = 10;
            return regeneratorRuntime.awrap(db.findAndModify({ "_name": name, "_link.p": pgid }, [['_name', 'asc']], { "$setOnInsert": _newNode }, { new: true, upsert: true }));

          case 10:
            node = _context4.sent;

            // console.log(node)
            newNode = node.value;
            //如果是新增的节点插入父节点

            if (node.lastErrorObject.updatedExisting) {
              _context4.next = 15;
              break;
            }

            _context4.next = 15;
            return regeneratorRuntime.awrap(_insertChildrenAsync(pNode, newNode._id));

          case 15:
            return _context4.abrupt('return', newNode);

          case 16:
          case 'end':
            return _context4.stop();
        }
      }
    }, null, _this4);
  }();
}

function _mk_brother_by_data(bgid, data) {
  var _this5 = this;

  return function _callee5() {
    var pNode;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return regeneratorRuntime.awrap(findParentAsync(bgid));

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

function _update_data(gid, data) {
  return db.updateOne({ _id: gid }, { $set: { _data: data } }).then(_read_node(gid));
}

//递归遍历所有子节点
//gids是要访问的节点id的列表
//visit是一个函数。访问节点的动作。
function _traversal_all_children(gids, visit) {
  console.log("_traversal_all_children", gids);
  if (!gids || gids.length == 0) {
    return Promise.resolve();
  } //需要返回一个promise
  return Promise.all(gids.map(function (gid) {
    return _read_node(gid).then(function (node) {
      //读取当前节点
      console.log(node, node._link.children);
      return _traversal_all_children(node._link.children, visit).then(function () {
        //访问所有子节点
        return visit(node); //然后访问当前节点
      });
    });
  }));
}

//标记删除节点与所有子孙节点
function _remove(gid) {
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
            return regeneratorRuntime.awrap(_read_node(gid));

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

function _isAncestor(pgid, gid) {
  if (gid == '0') return Promise.resolve(false); //'0'为根节点。任何节点都不是'0'的父节点
  return _read_node(gid).then(function (node) {
    // console.log('check',pgid,node._link.p,node)
    if (node._link.p === pgid) {
      return true;
    } else {
      return _isAncestor(pgid, node._link.p);
    }
  });
}

function _move_as_son(gid, npNode, bgid) {
  var _this7 = this;

  return function _callee7() {
    var gidIsAncestorOfNewParentNode, pNode;
    return regeneratorRuntime.async(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return regeneratorRuntime.awrap(_isAncestor(gid, npNode._id));

          case 2:
            gidIsAncestorOfNewParentNode = _context7.sent;

            if (!gidIsAncestorOfNewParentNode) {
              _context7.next = 6;
              break;
            }

            throw gid + 'is ancestor of' + npNode._id;

          case 6:
            _context7.next = 8;
            return regeneratorRuntime.awrap(findParentAsync(gid));

          case 8:
            pNode = _context7.sent;

            if (pNode) {
              _context7.next = 12;
              break;
            }

            throw 'cannot find parent node of brother ' + bgid;

          case 12:
            _context7.next = 14;
            return regeneratorRuntime.awrap(db.updateOne({ _id: pNode._id }, { $pull: { "_link.children": gid } }, {}));

          case 14:
            if (!(npNode._id !== pNode._id)) {
              _context7.next = 17;
              break;
            }

            _context7.next = 17;
            return regeneratorRuntime.awrap(db.updateOne({ _id: gid }, { $set: { "_link.p": npNode._id } }, {}));

          case 17:
            _context7.next = 19;
            return regeneratorRuntime.awrap(_insertChildrenAsync(npNode, gid, bgid));

          case 19:
            _context7.next = 21;
            return regeneratorRuntime.awrap(_read_node(gid));

          case 21:
            return _context7.abrupt('return', _context7.sent);

          case 22:
          case 'end':
            return _context7.stop();
        }
      }
    }, null, _this7);
  }();
}

// //把gid节点移动为pgid的子节点
// //包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
// //移动前需要做检查。祖先节点不能移动为后辈的子节点
function _move_as_son2(gid, pgid) {
  var _this8 = this;

  return function _callee8() {
    var npNode;
    return regeneratorRuntime.async(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return regeneratorRuntime.awrap(_read_node(pgid));

          case 2:
            npNode = _context8.sent;
            return _context8.abrupt('return', _move_as_son(gid, npNode));

          case 4:
          case 'end':
            return _context8.stop();
        }
      }
    }, null, _this8);
  }();
}

function _move_as_brother(gid, bgid) {
  var _this9 = this;

  return function _callee9() {
    var npNode;
    return regeneratorRuntime.async(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return regeneratorRuntime.awrap(findParentAsync(bgid));

          case 2:
            npNode = _context9.sent;

            if (npNode) {
              _context9.next = 6;
              break;
            }

            throw 'cannot find parent node of brother ' + bgid;

          case 6:
            return _context9.abrupt('return', _move_as_son(gid, npNode, bgid));

          case 7:
          case 'end':
            return _context9.stop();
        }
      }
    }, null, _this9);
  }();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFHQSxJQUFJLFdBQVcsUUFBUSxTQUFSLEVBQW1CLFFBQW5CO0FBQ2YsSUFBTSxLQUFHLFNBQUgsRUFBRyxDQUFDLEdBQUQ7U0FBUSxRQUFPLGlEQUFQLEtBQWEsUUFBYixHQUFzQixFQUF0QixHQUEwQixRQUFNLEdBQU4sR0FBVSxHQUFWLEdBQWMsU0FBUyxHQUFULENBQWQ7Q0FBbEM7QUFDVCxJQUFJLEVBQUo7QUFDQSxTQUFTLFlBQVQsQ0FBc0IsR0FBdEIsRUFBMEIsRUFBMUIsRUFBNkI7O0FBRTNCLE9BQUcsR0FBSCxDQUYyQjtBQUczQix3QkFBc0IsSUFBdEIsQ0FBMkIsT0FBUSxFQUFQLEtBQWEsVUFBYixHQUF5QixJQUExQixHQUErQixJQUEvQixDQUEzQjtBQUgyQixTQUlwQjtBQUNMLGVBQVUsbUJBQUMsR0FBRDthQUFPLFdBQVUsR0FBRyxHQUFILENBQVY7S0FBUDtBQUNWLGdCQUFXLG9CQUFDLElBQUQ7YUFBUSxZQUFXLEtBQUssR0FBTCxDQUFTLEVBQVQsQ0FBWDtLQUFSO0FBQ1gsb0JBQWUsd0JBQUMsSUFBRCxFQUFNLElBQU47YUFBYSxnQkFBZSxHQUFHLElBQUgsQ0FBZixFQUF3QixJQUF4QjtLQUFiO0FBQ2Ysb0JBQWUsd0JBQUMsSUFBRCxFQUFPLElBQVA7YUFBYyxnQkFBZSxHQUFHLElBQUgsQ0FBZixFQUF3QixJQUF4QjtLQUFkO0FBQ2Ysd0JBQW1CLDRCQUFDLElBQUQsRUFBTSxJQUFOO2FBQWEsb0JBQW1CLEdBQUcsSUFBSCxDQUFuQixFQUE0QixJQUE1QjtLQUFiO0FBQ25CLGlCQUFZLHFCQUFDLEdBQUQsRUFBTSxJQUFOO2FBQWEsYUFBWSxHQUFHLEdBQUgsQ0FBWixFQUFvQixJQUFwQjtLQUFiO0FBQ1osWUFBTyxnQkFBQyxHQUFEO2FBQU8sUUFBTyxHQUFHLEdBQUgsQ0FBUDtLQUFQO0FB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OzRDQUdkLGdCQUFnQixHQUFoQjs7O0FBQVo7O2dCQUNBOzs7OztrQkFDSyx3Q0FBc0MsSUFBdEM7Ozs7NENBR0gsR0FBRyxTQUFILENBQWEsRUFBQyxLQUFJLE1BQU0sR0FBTixFQUFsQixFQUErQixFQUFFLE9BQU8sRUFBRSxrQkFBa0IsR0FBbEIsRUFBVCxFQUFqQyxFQUFzRSxFQUF0RTs7O2tCQUNILE9BQU8sR0FBUCxLQUFhLE1BQU0sR0FBTjs7Ozs7OzRDQUNSLEdBQUcsU0FBSCxDQUFhLEVBQUMsS0FBSSxHQUFKLEVBQWQsRUFBeUIsRUFBRSxNQUFNLEVBQUUsV0FBVyxPQUFPLEdBQVAsRUFBbkIsRUFBM0IsRUFBOEQsRUFBOUQ7Ozs7NENBRUYscUJBQXFCLE1BQXJCLEVBQTRCLEdBQTVCLEVBQWdDLElBQWhDOzs7OzRDQUNPLFdBQVUsR0FBVjs7Ozs7Ozs7Ozs7R0FoQlAsRUFBUixDQURxQztDQUF2Qzs7Ozs7QUF3QkEsU0FBUyxhQUFULENBQXFCLEdBQXJCLEVBQTBCLElBQTFCLEVBQWdDOzs7QUFDOUIsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVyxXQUFVLElBQVY7OztBQUFiOzhDQUNHLGFBQWEsR0FBYixFQUFpQixNQUFqQjs7Ozs7Ozs7R0FGRCxFQUFSLENBRDhCO0NBQWhDOztBQU9BLFNBQVMsZ0JBQVQsQ0FBeUIsR0FBekIsRUFBOEIsSUFBOUIsRUFBb0M7OztBQUNsQyxTQUFPLGlCQUFDOzs7Ozs7OzRDQUNXLGdCQUFnQixJQUFoQjs7O0FBQWI7O2dCQUNBOzs7OztrQkFDSyx3Q0FBc0MsSUFBdEM7Ozs4Q0FHRixhQUFhLEdBQWIsRUFBaUIsTUFBakIsRUFBd0IsSUFBeEI7Ozs7Ozs7O0dBTkQsRUFBUixDQURrQztDQUFwQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXN5bmMnKTtcbi8vIHZhciBhd2FpdCA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXdhaXQnKTtcbi8vIHZhciBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbnZhciBPYmplY3RJZCA9IHJlcXVpcmUoJ21vbmdvZGInKS5PYmplY3RJZDtcbmNvbnN0IGlkPShfaWQpPT4odHlwZW9mIF9pZD09PVwib2JqZWN0XCI/aWQ6KF9pZD09PScwJz8nMCc6T2JqZWN0SWQoX2lkKSkpO1xudmFyIGRiOyBcbmZ1bmN0aW9uIHRyZWVfbW9uZ29kYihfZGIsY2Ipe1xuICAvLyBkYj1Qcm9taXNlLnByb21pc2lmeUFsbChfZGIpO1xuICBkYj1fZGI7XG4gIGJ1aWxkUm9vdElmTm90RXhpc3QoKS50aGVuKCh0eXBlb2YgY2IgPT09J2Z1bmN0aW9uJyk/Y2IoKTpudWxsKTsgLy9jYueUqOS6jumAmuefpea1i+ivleeoi+W6j1xuICByZXR1cm4ge1xuICAgIHJlYWRfbm9kZTooZ2lkKT0+cmVhZF9ub2RlKGlkKGdpZCkpLFxuICAgIHJlYWRfbm9kZXM6KGdpZHMpPT5yZWFkX25vZGVzKGdpZHMubWFwKGlkKSksXG4gICAgbWtfc29uX2J5X2RhdGE6KHBnaWQsZGF0YSk9Pm1rX3Nvbl9ieV9kYXRhKGlkKHBnaWQpLGRhdGEpLFxuICAgIG1rX3Nvbl9ieV9uYW1lOihwZ2lkLCBuYW1lKT0+bWtfc29uX2J5X25hbWUoaWQocGdpZCksbmFtZSksXG4gICAgbWtfYnJvdGhlcl9ieV9kYXRhOihiZ2lkLGRhdGEpPT5ta19icm90aGVyX2J5X2RhdGEoaWQoYmdpZCksZGF0YSksXG4gICAgdXBkYXRlX2RhdGE6KGdpZCwgZGF0YSk9PnVwZGF0ZV9kYXRhKGlkKGdpZCksZGF0YSksXG4gICAgcmVtb3ZlOihnaWQpPT5yZW1vdmUoaWQoZ2lkKSksXG4gICAgbW92ZV9hc19zb246KGdpZCwgcGdpZCkgPT5tb3ZlX2FzX3NvbihpZChnaWQpLCBpZChwZ2lkKSksXG4gICAgbW92ZV9hc19icm90aGVyOihnaWQsIGJnaWQpPT5tb3ZlX2FzX2Jyb3RoZXIoaWQoZ2lkKSwgaWQoYmdpZCkpLFxuICAgIC8vZm9yIHRlc3RcbiAgICBidWlsZFJvb3RJZk5vdEV4aXN0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHM9dHJlZV9tb25nb2RiO1xuLy/lhoXpg6jlt6Xlhbflh73mlbBcbmNvbnN0IF9pbnNlcnRBc3luYz0obm9kZSk9PntcbiAgcmV0dXJuIGRiLmluc2VydE9uZShub2RlKS50aGVuKHJlcz0+e1xuICAgIG5vZGUuX2lkPXJlcy5pbnNlcnRlZElkO1xuICAgIHJldHVybiBub2RlO1xuICB9KVxufVxuXG5cbmNvbnN0IF9pbnNlcnRDaGlsZHJlbkFzeW5jPShwTm9kZSxnaWQsYmdpZCk9PntcbiAgdmFyIHBvcz0wO1xuICAgIGlmKGJnaWQpe1xuICAgICAgcG9zPXBOb2RlLl9saW5rLmNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcbiAgICB9XG4gICByZXR1cm4gZGIudXBkYXRlT25lKHtfaWQ6cE5vZGUuX2lkfSwge1xuICAgICAkcHVzaDoge1xuICAgICAgICBcIl9saW5rLmNoaWxkcmVuXCI6IHtcbiAgICAgICAgICAgJGVhY2g6IFtnaWRdLFxuICAgICAgICAgICAkcG9zaXRpb246IHBvc1xuICAgICAgICB9XG4gICAgIH1cbiAgIH0pOyBcbn1cblxuY29uc3QgZmluZFBhcmVudEFzeW5jPShzZ2lkKT0+IGRiLmZpbmRPbmUoe1wiX2xpbmsuY2hpbGRyZW5cIjpzZ2lkLF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7XG5cbmZ1bmN0aW9uIGJ1aWxkUm9vdElmTm90RXhpc3QoY2Ipe1xuICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3RcIik7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3QgYmVnaW5cIik7XG4gICAgdmFyIHJvb3Q9YXdhaXQgZGIuZmluZE9uZSh7X2lkOicwJ30pO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiZm91bmQgcm9vdFwiLHJvb3QpO1xuICAgIGlmKCFyb290KXtcbiAgICAgIHZhciBkZWZhdWx0Um9vdD17XG4gICAgICAgIF9pZDonMCcsIFxuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6ICcwJyxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJvb3Q9YXdhaXQgX2luc2VydEFzeW5jKGRlZmF1bHRSb290KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIscm9vdCk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIHJlYWRfbm9kZShnaWQpIHtcbiAgLy9ybeagh+iusOihqOekuuiKgueCueW3sue7j+iiq+WIoOmZpFxuICBjb25zb2xlLmxvZyhcInJlYWRfbm9kZVwiLGdpZCk7XG4gIHJldHVybiBkYi5maW5kT25lKHtfaWQ6Z2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcbiAgY29uc29sZS5sb2coXCJyZWFkX25vZGVzXCIsZ2lkcyk7XG4gIHJldHVybiBkYi5maW5kKHtfaWQ6eyRpbjpnaWRzfSxfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pLnRvQXJyYXkoKTtcbn1cblxuXG5mdW5jdGlvbiBfbWtfc29uX2J5X2t2KHBOb2RlLGtleSx2YWx1ZSxiZ2lkKXtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKHBOb2RlKTtcbiAgICB2YXIgX25ld05vZGU9e1xuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfVxuICAgIH07XG4gICAgX25ld05vZGVba2V5XT12YWx1ZTtcbiAgICB2YXIgbmV3Tm9kZT0gYXdhaXQgX2luc2VydEFzeW5jKF9uZXdOb2RlKSA7Ly/mj5LlhaXmlrDoioLngrlcbiAgICAvL+aPkuWFpeeItuiKgueCuVxuICAgIGF3YWl0IF9pbnNlcnRDaGlsZHJlbkFzeW5jKHBOb2RlLG5ld05vZGUuX2lkLGJnaWQpO1xuICAgIHJldHVybiBuZXdOb2RlOy8v6L+U5Zue5paw6IqC54K5XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCByZWFkX25vZGUocGdpZCk7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX2RhdGFcIixkYXRhKTtcbiAgfSkoKTtcbn1cblxuLy8gZnVuY3Rpb24gX19ta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICBjb25zb2xlLmxvZyhcIm1rX3Nvbl9ieV9uYW1lXCIscGdpZCxuYW1lKVxuLy8gICAgIHZhciBwTm9kZT1hd2FpdCAgcmVhZF9ub2RlKHBnaWQpIDsvL+aJvuWIsOeItuiKgueCuVxuLy8gICAgIGlmKCFwTm9kZSl7XG4vLyAgICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4vLyAgICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbi8vICAgICB9XG4vLyAgICAgdmFyIG5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbmFtZVwiOm5hbWUsXCJfbGluay5wXCI6cGdpZH0pOy8v5piv5ZCm5bey5pyJ5ZCM5ZCN6IqC54K5XG4vLyAgICAgaWYobm9kZSl7XG4vLyAgICAgICByZXR1cm4gbm9kZTsvL+WmguacieebtOaOpei/lOWbnlxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9uYW1lXCIsbmFtZSk7XG4vLyAgIH0pKCk7XG4vLyB9XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9uYW1lKHBnaWQsIG5hbWUpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIGNvbnNvbGUubG9nKFwibWtfc29uX2J5X25hbWVcIixwZ2lkLG5hbWUpXG4gICAgdmFyIHBOb2RlPWF3YWl0ICByZWFkX25vZGUocGdpZCkgOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICB2YXIgX25ld05vZGU9e1xuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfSxcbiAgICAgICAgX25hbWU6bmFtZVxuICAgIH07XG4gICAgY29uc3Qgbm9kZT1hd2FpdCBkYi5maW5kQW5kTW9kaWZ5KHtcIl9uYW1lXCI6bmFtZSxcIl9saW5rLnBcIjpwZ2lkfSxcbiAgICBbWydfbmFtZScsJ2FzYyddXSxcbiAgICB7IFwiJHNldE9uSW5zZXJ0XCI6IF9uZXdOb2RlIH0sXG4gICAge25ldzogdHJ1ZSwgdXBzZXJ0OiB0cnVlfSk7XG4gICAgLy8gY29uc29sZS5sb2cobm9kZSlcbiAgICBjb25zdCBuZXdOb2RlPW5vZGUudmFsdWU7XG4gICAgLy/lpoLmnpzmmK/mlrDlop7nmoToioLngrnmj5LlhaXniLboioLngrlcbiAgICBpZighbm9kZS5sYXN0RXJyb3JPYmplY3QudXBkYXRlZEV4aXN0aW5nKXtcbiAgICAgIGF3YWl0IF9pbnNlcnRDaGlsZHJlbkFzeW5jKHBOb2RlLG5ld05vZGUuX2lkKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld05vZGU7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLGRhdGEpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoYmdpZCk7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfZGF0YVwiLGRhdGEsYmdpZCk7XG4gIH0pKCk7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlX2RhdGEoZ2lkLCBkYXRhKSB7XG4gIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpnaWR9LCB7ICRzZXQ6IHsgX2RhdGE6IGRhdGEgfSB9KVxuICAudGhlbihyZWFkX25vZGUoZ2lkKSk7XG59XG5cblxuLy/pgJLlvZLpgY3ljobmiYDmnInlrZDoioLngrlcbi8vZ2lkc+aYr+imgeiuv+mXrueahOiKgueCuWlk55qE5YiX6KGoXG4vL3Zpc2l05piv5LiA5Liq5Ye95pWw44CC6K6/6Zeu6IqC54K555qE5Yqo5L2c44CCXG5mdW5jdGlvbiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihnaWRzLHZpc2l0KSB7XG4gIGNvbnNvbGUubG9nKFwiX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW5cIixnaWRzKTtcbiAgaWYgKCFnaWRzfHxnaWRzLmxlbmd0aD09MCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoKTt9Ly/pnIDopoHov5Tlm57kuIDkuKpwcm9taXNlIFxuICByZXR1cm4gUHJvbWlzZS5hbGwoZ2lkcy5tYXAoZ2lkID0+IHtcbiAgICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57IC8v6K+75Y+W5b2T5YmN6IqC54K5XG4gICAgICBjb25zb2xlLmxvZyhub2RlLG5vZGUuX2xpbmsuY2hpbGRyZW4pXG4gICAgICByZXR1cm4gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4obm9kZS5fbGluay5jaGlsZHJlbix2aXNpdCkudGhlbigoKT0+eyAvL+iuv+mXruaJgOacieWtkOiKgueCuVxuICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XG4gICAgICB9KVxuICAgIH0pXG4gIH0pKTtcbn1cblxuLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcbmZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgICBpZihnaWQ9PT0nMCcpcmV0dXJuOy8v5qC56IqC54K55LiN6IO95Yig6Zmk44CCXG4gICAgIHZhciBub2RlPWF3YWl0IHJlYWRfbm9kZShnaWQpOyAvL+WFiOivu+WPluimgeWIoOmZpOeahOiKgueCuVxuICAgICBpZighbm9kZSlyZXR1cm47Ly/lt7Lnu4/kuI3lrZjlnKjvvIzov5Tlm55cbiAgICAgLy/mlLbpm4bmiYDmnInlrZDoioLngrlcbiAgICAgdmFyIGdpZHNmb3JSZW1vdmU9W107XG4gICAgIGNvbnN0IHJtPShub2RlKT0+e2dpZHNmb3JSZW1vdmUucHVzaChub2RlLl9pZCl9O1xuICAgICBhd2FpdCBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihbZ2lkXSxybSk7XG4gICAgIC8v5om56YeP5Yig6ZmkXG4gICAgIGF3YWl0IGRiLnVwZGF0ZU1hbnkoe19pZDp7JGluOmdpZHNmb3JSZW1vdmV9fSwgIHsgJHNldDogeyBfcm06dHJ1ZSAgfSB9LCB7fSk7Ly/moIforrDkuLrliKDpmaRcbiAgICAgYXdhaXQgZGIudXBkYXRlT25lKHtfaWQ6bm9kZS5fbGluay5wfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuICAgICByZXR1cm4gZ2lkc2ZvclJlbW92ZTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xuICBpZihnaWQ9PScwJylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgLy8nMCfkuLrmoLnoioLngrnjgILku7vkvZXoioLngrnpg73kuI3mmK8nMCfnmoTniLboioLngrlcbiAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcbiAgICBpZihub2RlLl9saW5rLnA9PT1wZ2lkKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIF9pc0FuY2VzdG9yKHBnaWQsbm9kZS5fbGluay5wKTtcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlPWF3YWl0IF9pc0FuY2VzdG9yKGdpZCxucE5vZGUuX2lkKTtcbiAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcbiAgICAgIHRocm93IChnaWQrJ2lzIGFuY2VzdG9yIG9mJytucE5vZGUuX2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v6KaB56e75Yqo55qE6IqC54K55LiN6IO95piv55uu5qCH54i26IqC54K555qE6ZW/6L6I6IqC54K5XG4gICAgfVxuICAgIHZhciBwTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoZ2lkKTsvL+aJvuWIsOWOn+eItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlIG9mIGJyb3RoZXIgJytiZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4gICAgaWYobnBOb2RlLl9pZCE9PXBOb2RlLl9pZCl7XG4gICAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpnaWR9LCAgeyAkc2V0OiB7IFwiX2xpbmsucFwiOiBucE5vZGUuX2lkIH0gfSwge30pOy8v5pS55Y+YZ2lk55qE54i26IqC54K55Li65paw54i26IqC54K5XG4gICAgfVxuICAgIGF3YWl0IF9pbnNlcnRDaGlsZHJlbkFzeW5jKG5wTm9kZSxnaWQsYmdpZCk7XG4gICAgcmV0dXJuIGF3YWl0IHJlYWRfbm9kZShnaWQpO1xuICB9KSgpOyAgXG59XG5cbi8vIC8v5oqKZ2lk6IqC54K556e75Yqo5Li6cGdpZOeahOWtkOiKgueCuVxuLy8gLy/ljIXlkKsz5q2l44CCIDEu5LuOZ2lk55qE5Y6f54i26IqC54K55Yig6Zmk44CCMuaUueWPmGdpZOeahOW9k+WJjeeItuiKgueCueOAgiAz44CC5rOo5YaM5Yiw5paw54i26IqC54K5XG4vLyAvL+enu+WKqOWJjemcgOimgeWBmuajgOafpeOAguelluWFiOiKgueCueS4jeiDveenu+WKqOS4uuWQjui+iOeahOWtkOiKgueCuVxuZnVuY3Rpb24gbW92ZV9hc19zb24oZ2lkLCBwZ2lkKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgbnBOb2RlPWF3YWl0IHJlYWRfbm9kZShwZ2lkKTsvL+aJvuWIsOaWsOeItuiKgueCuVxuICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSk7XG4gIH0pKCk7ICBcbn1cblxuZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIG5wTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoYmdpZCk7Ly/mib7liLDmlrDniLboioLngrlcbiAgICBpZighbnBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgb2YgYnJvdGhlciAnK2JnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSxiZ2lkKTtcbiAgfSkoKTsgXG59Il19