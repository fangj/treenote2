'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
// var Promise = require('bluebird');
var _ = require('lodash');
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
    pos = _.findIndex(pNode._link.children, function (o) {
      return bgid.equals(o);
    });
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
  // console.log("read_node",gid);
  return db.findOne({ _id: gid, _rm: { $exists: false } });
}

function _read_nodes(gids) {
  // console.log("read_nodes",gids);
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

  // console.log("mk_son_by_name")
  return function _callee4() {
    var pNode, _newNode, node, newNode;

    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return regeneratorRuntime.awrap(_read_node(pgid));

          case 2:
            pNode = _context4.sent;

            if (pNode) {
              _context4.next = 6;
              break;
            }

            throw 'cannot find parent node ' + pgid;

          case 6:
            //父节点不存在，无法插入，返回null
            _newNode = {
              _link: {
                p: pNode._id,
                children: []
              },
              _name: name
            };
            _context4.next = 9;
            return regeneratorRuntime.awrap(db.findAndModify({ "_name": name, "_link.p": pgid }, [['_name', 'asc']], { "$setOnInsert": _newNode }, { new: true, upsert: true }));

          case 9:
            node = _context4.sent;

            // console.log(node)
            newNode = node.value;
            //如果是新增的节点插入父节点

            if (node.lastErrorObject.updatedExisting) {
              _context4.next = 14;
              break;
            }

            _context4.next = 14;
            return regeneratorRuntime.awrap(_insertChildrenAsync(pNode, newNode._id));

          case 14:
            return _context4.abrupt('return', newNode);

          case 15:
          case 'end':
            return _context4.stop();
        }
      }
    }, null, _this4);
  }();
}

function _mk_brother_by_data(bgid, data) {
  var _this5 = this;

  // console.log("mk_brother_by_data")

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
  // console.log("_traversal_all_children",gids);
  if (!gids || gids.length == 0) {
    return Promise.resolve();
  } //需要返回一个promise
  return Promise.all(gids.map(function (gid) {
    return _read_node(gid).then(function (node) {
      //读取当前节点
      // console.log(node,node._link.children)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFHQSxJQUFJLElBQUUsUUFBUSxRQUFSLENBQUY7QUFDSixJQUFJLFdBQVcsUUFBUSxTQUFSLEVBQW1CLFFBQW5CO0FBQ2YsSUFBTSxLQUFHLFNBQUgsRUFBRyxDQUFDLEdBQUQ7U0FBUSxRQUFPLGlEQUFQLEtBQWEsUUFBYixHQUFzQixFQUF0QixHQUEwQixRQUFNLEdBQU4sR0FBVSxHQUFWLEdBQWMsU0FBUyxHQUFULENBQWQ7Q0FBbEM7QUFDVCxJQUFJLEVBQUo7QUFDQSxTQUFTLFlBQVQsQ0FBc0IsR0FBdEIsRUFBMEIsRUFBMUIsRUFBNkI7O0FBRTNCLE9BQUcsR0FBSCxDQUYyQjtBQUczQix3QkFBc0IsSUFBdEIsQ0FBMkIsT0FBUSxFQUFQLEtBQWEsVUFBYixHQUF5QixJQUExQixHQUErQixJQUEvQixDQUEzQjtBQUgyQixTQUlwQjtBQUNMLGVBQVUsbUJBQUMsR0FBRDthQUFPLFdBQVUsR0FBRyxHQUFILENBQVY7S0FBUDtBQUNWLGdCQUFXLG9CQUFDLElBQUQ7YUFBUSxZQUFXLEtBQUssR0FBTCxDQUFTLEVBQVQsQ0FBWDtLQUFSO0FBQ1gsb0JBQWUsd0JBQUMsSUFBRCxFQUFNLElBQU47YUFBYSxnQkFBZSxHQUFHLElBQUgsQ0FBZixFQUF3QixJQUF4QjtLQUFiO0FBQ2Ysb0JBQWUsd0JBQUMsSUFBRCxFQUFPLElBQVA7YUFBYyxnQkFBZSxHQUFHLElBQUgsQ0FBZixFQUF3QixJQUF4QjtLQUFkO0FBQ2Ysd0JBQW1CLDRCQUFDLElBQUQsRUFBTSxJQUFOO2FBQWEsb0JBQW1CLEdBQUcsSUFBSCxDQUFuQixFQUE0QixJQUE1QjtLQUFiO0FBQ25CLGlCQUFZLHFCQUFDLEdBQUQsRUFBTSxJQUFOO2FBQWEsYUFBWSxHQUFHLEdBQUgsQ0FBWixFQUFvQixJQUFwQjtLQUFiO0FBQ1osWUFBTyxnQkFBQyxHQUFEO2FB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LEdBQU47Ozs7Ozs0Q0FDUixHQUFHLFNBQUgsQ0FBYSxFQUFDLEtBQUksR0FBSixFQUFkLEVBQXlCLEVBQUUsTUFBTSxFQUFFLFdBQVcsT0FBTyxHQUFQLEVBQW5CLEVBQTNCLEVBQThELEVBQTlEOzs7OzRDQUVGLHFCQUFxQixNQUFyQixFQUE0QixHQUE1QixFQUFnQyxJQUFoQzs7Ozs0Q0FDTyxXQUFVLEdBQVY7Ozs7Ozs7Ozs7O0dBaEJQLEVBQVIsQ0FEcUM7Q0FBdkM7Ozs7O0FBd0JBLFNBQVMsYUFBVCxDQUFxQixHQUFyQixFQUEwQixJQUExQixFQUFnQzs7O0FBQzlCLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1csV0FBVSxJQUFWOzs7QUFBYjs4Q0FDRyxhQUFhLEdBQWIsRUFBaUIsTUFBakI7Ozs7Ozs7O0dBRkQsRUFBUixDQUQ4QjtDQUFoQzs7QUFPQSxTQUFTLGdCQUFULENBQXlCLEdBQXpCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVyxnQkFBZ0IsSUFBaEI7OztBQUFiOztnQkFDQTs7Ozs7a0JBQ0ssd0NBQXNDLElBQXRDOzs7OENBR0YsYUFBYSxHQUFiLEVBQWlCLE1BQWpCLEVBQXdCLElBQXhCOzs7Ozs7OztHQU5ELEVBQVIsQ0FEa0M7Q0FBcEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2YXIgYXN5bmMgPSByZXF1aXJlKCdhc3luY2F3YWl0L2FzeW5jJyk7XG4vLyB2YXIgYXdhaXQgPSByZXF1aXJlKCdhc3luY2F3YWl0L2F3YWl0Jyk7XG4vLyB2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG52YXIgXz1yZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBPYmplY3RJZCA9IHJlcXVpcmUoJ21vbmdvZGInKS5PYmplY3RJZDtcbmNvbnN0IGlkPShfaWQpPT4odHlwZW9mIF9pZD09PVwib2JqZWN0XCI/aWQ6KF9pZD09PScwJz8nMCc6T2JqZWN0SWQoX2lkKSkpO1xudmFyIGRiOyBcbmZ1bmN0aW9uIHRyZWVfbW9uZ29kYihfZGIsY2Ipe1xuICAvLyBkYj1Qcm9taXNlLnByb21pc2lmeUFsbChfZGIpO1xuICBkYj1fZGI7XG4gIGJ1aWxkUm9vdElmTm90RXhpc3QoKS50aGVuKCh0eXBlb2YgY2IgPT09J2Z1bmN0aW9uJyk/Y2IoKTpudWxsKTsgLy9jYueUqOS6jumAmuefpea1i+ivleeoi+W6j1xuICByZXR1cm4ge1xuICAgIHJlYWRfbm9kZTooZ2lkKT0+cmVhZF9ub2RlKGlkKGdpZCkpLFxuICAgIHJlYWRfbm9kZXM6KGdpZHMpPT5yZWFkX25vZGVzKGdpZHMubWFwKGlkKSksXG4gICAgbWtfc29uX2J5X2RhdGE6KHBnaWQsZGF0YSk9Pm1rX3Nvbl9ieV9kYXRhKGlkKHBnaWQpLGRhdGEpLFxuICAgIG1rX3Nvbl9ieV9uYW1lOihwZ2lkLCBuYW1lKT0+bWtfc29uX2J5X25hbWUoaWQocGdpZCksbmFtZSksXG4gICAgbWtfYnJvdGhlcl9ieV9kYXRhOihiZ2lkLGRhdGEpPT5ta19icm90aGVyX2J5X2RhdGEoaWQoYmdpZCksZGF0YSksXG4gICAgdXBkYXRlX2RhdGE6KGdpZCwgZGF0YSk9PnVwZGF0ZV9kYXRhKGlkKGdpZCksZGF0YSksXG4gICAgcmVtb3ZlOihnaWQpPT5yZW1vdmUoaWQoZ2lkKSksXG4gICAgbW92ZV9hc19zb246KGdpZCwgcGdpZCkgPT5tb3ZlX2FzX3NvbihpZChnaWQpLCBpZChwZ2lkKSksXG4gICAgbW92ZV9hc19icm90aGVyOihnaWQsIGJnaWQpPT5tb3ZlX2FzX2Jyb3RoZXIoaWQoZ2lkKSwgaWQoYmdpZCkpLFxuICAgIC8vZm9yIHRlc3RcbiAgICBidWlsZFJvb3RJZk5vdEV4aXN0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHM9dHJlZV9tb25nb2RiO1xuLy/lhoXpg6jlt6Xlhbflh73mlbBcbmNvbnN0IF9pbnNlcnRBc3luYz0obm9kZSk9PntcbiAgcmV0dXJuIGRiLmluc2VydE9uZShub2RlKS50aGVuKHJlcz0+e1xuICAgIG5vZGUuX2lkPXJlcy5pbnNlcnRlZElkO1xuICAgIHJldHVybiBub2RlO1xuICB9KVxufVxuXG5cbmNvbnN0IF9pbnNlcnRDaGlsZHJlbkFzeW5jPShwTm9kZSxnaWQsYmdpZCk9PntcbiAgICB2YXIgcG9zPTA7XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9Xy5maW5kSW5kZXgocE5vZGUuX2xpbmsuY2hpbGRyZW4sIG89PiBiZ2lkLmVxdWFscyhvKSk7XG4gICAgfVxuICAgcmV0dXJuIGRiLnVwZGF0ZU9uZSh7X2lkOnBOb2RlLl9pZH0sIHtcbiAgICAgJHB1c2g6IHtcbiAgICAgICAgXCJfbGluay5jaGlsZHJlblwiOiB7XG4gICAgICAgICAgICRlYWNoOiBbZ2lkXSxcbiAgICAgICAgICAgJHBvc2l0aW9uOiBwb3NcbiAgICAgICAgfVxuICAgICB9XG4gICB9KTsgXG59XG5cbmNvbnN0IGZpbmRQYXJlbnRBc3luYz0oc2dpZCk9PiBkYi5maW5kT25lKHtcIl9saW5rLmNoaWxkcmVuXCI6c2dpZCxfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pO1xuXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcbiAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIpO1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0IGJlZ2luXCIpO1xuICAgIHZhciByb290PWF3YWl0IGRiLmZpbmRPbmUoe19pZDonMCd9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhcImZvdW5kIHJvb3RcIixyb290KTtcbiAgICBpZighcm9vdCl7XG4gICAgICB2YXIgZGVmYXVsdFJvb3Q9e1xuICAgICAgICBfaWQ6JzAnLCBcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiAnMCcsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByb290PWF3YWl0IF9pbnNlcnRBc3luYyhkZWZhdWx0Um9vdCk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiLHJvb3QpO1xuICAgIHJldHVybiByb290O1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGUoZ2lkKSB7XG4gIC8vcm3moIforrDooajnpLroioLngrnlt7Lnu4/ooqvliKDpmaRcbiAgLy8gY29uc29sZS5sb2coXCJyZWFkX25vZGVcIixnaWQpO1xuICByZXR1cm4gZGIuZmluZE9uZSh7X2lkOmdpZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTtcbn1cblxuZnVuY3Rpb24gcmVhZF9ub2RlcyhnaWRzKSB7XG4gIC8vIGNvbnNvbGUubG9nKFwicmVhZF9ub2Rlc1wiLGdpZHMpO1xuICByZXR1cm4gZGIuZmluZCh7X2lkOnskaW46Z2lkc30sX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KS50b0FycmF5KCk7XG59XG5cblxuZnVuY3Rpb24gX21rX3Nvbl9ieV9rdihwTm9kZSxrZXksdmFsdWUsYmdpZCl7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhwTm9kZSk7XG4gICAgdmFyIF9uZXdOb2RlPXtcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiBwTm9kZS5faWQsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICB9O1xuICAgIF9uZXdOb2RlW2tleV09dmFsdWU7XG4gICAgdmFyIG5ld05vZGU9IGF3YWl0IF9pbnNlcnRBc3luYyhfbmV3Tm9kZSkgOy8v5o+S5YWl5paw6IqC54K5XG4gICAgLy/mj5LlhaXniLboioLngrlcbiAgICBhd2FpdCBfaW5zZXJ0Q2hpbGRyZW5Bc3luYyhwTm9kZSxuZXdOb2RlLl9pZCxiZ2lkKTtcbiAgICByZXR1cm4gbmV3Tm9kZTsvL+i/lOWbnuaWsOiKgueCuVxuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgcmVhZF9ub2RlKHBnaWQpOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSk7XG4gIH0pKCk7XG59XG5cbi8vIGZ1bmN0aW9uIF9fbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgY29uc29sZS5sb2coXCJta19zb25fYnlfbmFtZVwiLHBnaWQsbmFtZSlcbi8vICAgICB2YXIgcE5vZGU9YXdhaXQgIHJlYWRfbm9kZShwZ2lkKSA7Ly/mib7liLDniLboioLngrlcbi8vICAgICBpZighcE5vZGUpe1xuLy8gICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuLy8gICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4vLyAgICAgfVxuLy8gICAgIHZhciBub2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX25hbWVcIjpuYW1lLFwiX2xpbmsucFwiOnBnaWR9KTsvL+aYr+WQpuW3suacieWQjOWQjeiKgueCuVxuLy8gICAgIGlmKG5vZGUpe1xuLy8gICAgICAgcmV0dXJuIG5vZGU7Ly/lpoLmnInnm7TmjqXov5Tlm55cbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfbmFtZVwiLG5hbWUpO1xuLy8gICB9KSgpO1xuLy8gfVxuXG5mdW5jdGlvbiBta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XG4gIC8vIGNvbnNvbGUubG9nKFwibWtfc29uX2J5X25hbWVcIilcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKFwibWtfc29uX2J5X25hbWVcIixwZ2lkLG5hbWUpXG4gICAgdmFyIHBOb2RlPWF3YWl0ICByZWFkX25vZGUocGdpZCkgOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICB2YXIgX25ld05vZGU9e1xuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfSxcbiAgICAgICAgX25hbWU6bmFtZVxuICAgIH07XG4gICAgY29uc3Qgbm9kZT1hd2FpdCBkYi5maW5kQW5kTW9kaWZ5KHtcIl9uYW1lXCI6bmFtZSxcIl9saW5rLnBcIjpwZ2lkfSxcbiAgICBbWydfbmFtZScsJ2FzYyddXSxcbiAgICB7IFwiJHNldE9uSW5zZXJ0XCI6IF9uZXdOb2RlIH0sXG4gICAge25ldzogdHJ1ZSwgdXBzZXJ0OiB0cnVlfSk7XG4gICAgLy8gY29uc29sZS5sb2cobm9kZSlcbiAgICBjb25zdCBuZXdOb2RlPW5vZGUudmFsdWU7XG4gICAgLy/lpoLmnpzmmK/mlrDlop7nmoToioLngrnmj5LlhaXniLboioLngrlcbiAgICBpZighbm9kZS5sYXN0RXJyb3JPYmplY3QudXBkYXRlZEV4aXN0aW5nKXtcbiAgICAgIGF3YWl0IF9pbnNlcnRDaGlsZHJlbkFzeW5jKHBOb2RlLG5ld05vZGUuX2lkKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld05vZGU7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLGRhdGEpIHtcbiAgLy8gY29uc29sZS5sb2coXCJta19icm90aGVyX2J5X2RhdGFcIilcblxuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGZpbmRQYXJlbnRBc3luYyhiZ2lkKTsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlIG9mIGJyb3RoZXIgJytiZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSxiZ2lkKTtcbiAgfSkoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVfZGF0YShnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIGRiLnVwZGF0ZU9uZSh7X2lkOmdpZH0sIHsgJHNldDogeyBfZGF0YTogZGF0YSB9IH0pXG4gIC50aGVuKHJlYWRfbm9kZShnaWQpKTtcbn1cblxuXG4vL+mAkuW9kumBjeWOhuaJgOacieWtkOiKgueCuVxuLy9naWRz5piv6KaB6K6/6Zeu55qE6IqC54K5aWTnmoTliJfooahcbi8vdmlzaXTmmK/kuIDkuKrlh73mlbDjgILorr/pl67oioLngrnnmoTliqjkvZzjgIJcbmZ1bmN0aW9uIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKGdpZHMsdmlzaXQpIHtcbiAgLy8gY29uc29sZS5sb2coXCJfdHJhdmVyc2FsX2FsbF9jaGlsZHJlblwiLGdpZHMpO1xuICBpZiAoIWdpZHN8fGdpZHMubGVuZ3RoPT0wKSB7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO30vL+mcgOimgei/lOWbnuS4gOS4qnByb21pc2UgXG4gIHJldHVybiBQcm9taXNlLmFsbChnaWRzLm1hcChnaWQgPT4ge1xuICAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PnsgLy/or7vlj5blvZPliY3oioLngrlcbiAgICAgIC8vIGNvbnNvbGUubG9nKG5vZGUsbm9kZS5fbGluay5jaGlsZHJlbilcbiAgICAgIHJldHVybiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihub2RlLl9saW5rLmNoaWxkcmVuLHZpc2l0KS50aGVuKCgpPT57IC8v6K6/6Zeu5omA5pyJ5a2Q6IqC54K5XG4gICAgICAgIHJldHVybiB2aXNpdChub2RlKTsgLy/nhLblkI7orr/pl67lvZPliY3oioLngrlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSkpO1xufVxuXG4vL+agh+iusOWIoOmZpOiKgueCueS4juaJgOacieWtkOWtmeiKgueCuVxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgIGlmKGdpZD09PScwJylyZXR1cm47Ly/moLnoioLngrnkuI3og73liKDpmaTjgIJcbiAgICAgdmFyIG5vZGU9YXdhaXQgcmVhZF9ub2RlKGdpZCk7IC8v5YWI6K+75Y+W6KaB5Yig6Zmk55qE6IqC54K5XG4gICAgIGlmKCFub2RlKXJldHVybjsvL+W3sue7j+S4jeWtmOWcqO+8jOi/lOWbnlxuICAgICAvL+aUtumbhuaJgOacieWtkOiKgueCuVxuICAgICB2YXIgZ2lkc2ZvclJlbW92ZT1bXTtcbiAgICAgY29uc3Qgcm09KG5vZGUpPT57Z2lkc2ZvclJlbW92ZS5wdXNoKG5vZGUuX2lkKX07XG4gICAgIGF3YWl0IF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKFtnaWRdLHJtKTtcbiAgICAgLy/mibnph4/liKDpmaRcbiAgICAgYXdhaXQgZGIudXBkYXRlTWFueSh7X2lkOnskaW46Z2lkc2ZvclJlbW92ZX19LCAgeyAkc2V0OiB7IF9ybTp0cnVlICB9IH0sIHt9KTsvL+agh+iusOS4uuWIoOmZpFxuICAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpub2RlLl9saW5rLnB9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4gICAgIHJldHVybiBnaWRzZm9yUmVtb3ZlO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBfaXNBbmNlc3RvcihwZ2lkLGdpZCl7XG4gIGlmKGdpZD09JzAnKXJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyAvLycwJ+S4uuagueiKgueCueOAguS7u+S9leiKgueCuemDveS4jeaYrycwJ+eahOeItuiKgueCuVxuICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57XG4gICAgLy8gY29uc29sZS5sb2coJ2NoZWNrJyxwZ2lkLG5vZGUuX2xpbmsucCxub2RlKVxuICAgIGlmKG5vZGUuX2xpbmsucD09PXBnaWQpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gX2lzQW5jZXN0b3IocGdpZCxub2RlLl9saW5rLnApO1xuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gX21vdmVfYXNfc29uKGdpZCwgbnBOb2RlLGJnaWQpe1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGU9YXdhaXQgX2lzQW5jZXN0b3IoZ2lkLG5wTm9kZS5faWQpO1xuICAgIGlmKGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGUpe1xuICAgICAgdGhyb3cgKGdpZCsnaXMgYW5jZXN0b3Igb2YnK25wTm9kZS5faWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/opoHnp7vliqjnmoToioLngrnkuI3og73mmK/nm67moIfniLboioLngrnnmoTplb/ovojoioLngrlcbiAgICB9XG4gICAgdmFyIHBOb2RlPWF3YWl0IGZpbmRQYXJlbnRBc3luYyhnaWQpOy8v5om+5Yiw5Y6f54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgb2YgYnJvdGhlciAnK2JnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIGF3YWl0IGRiLnVwZGF0ZU9uZSh7X2lkOnBOb2RlLl9pZH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSA7Ly/ku47ljp/niLboioLngrnliKDpmaRcbiAgICBpZihucE5vZGUuX2lkIT09cE5vZGUuX2lkKXtcbiAgICAgIGF3YWl0IGRiLnVwZGF0ZU9uZSh7X2lkOmdpZH0sICB7ICRzZXQ6IHsgXCJfbGluay5wXCI6IG5wTm9kZS5faWQgfSB9LCB7fSk7Ly/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcbiAgICB9XG4gICAgYXdhaXQgX2luc2VydENoaWxkcmVuQXN5bmMobnBOb2RlLGdpZCxiZ2lkKTtcbiAgICByZXR1cm4gYXdhaXQgcmVhZF9ub2RlKGdpZCk7XG4gIH0pKCk7ICBcbn1cblxuLy8gLy/miopnaWToioLngrnnp7vliqjkuLpwZ2lk55qE5a2Q6IqC54K5XG4vLyAvL+WMheWQqzPmraXjgIIgMS7ku45naWTnmoTljp/niLboioLngrnliKDpmaTjgIIy5pS55Y+YZ2lk55qE5b2T5YmN54i26IqC54K544CCIDPjgILms6jlhozliLDmlrDniLboioLngrlcbi8vIC8v56e75Yqo5YmN6ZyA6KaB5YGa5qOA5p+l44CC56WW5YWI6IqC54K55LiN6IO956e75Yqo5Li65ZCO6L6I55qE5a2Q6IqC54K5XG5mdW5jdGlvbiBtb3ZlX2FzX3NvbihnaWQsIHBnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBucE5vZGU9YXdhaXQgcmVhZF9ub2RlKHBnaWQpOy8v5om+5Yiw5paw54i26IqC54K5XG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlKTtcbiAgfSkoKTsgIFxufVxuXG5mdW5jdGlvbiBtb3ZlX2FzX2Jyb3RoZXIoZ2lkLCBiZ2lkKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgbnBOb2RlPWF3YWl0IGZpbmRQYXJlbnRBc3luYyhiZ2lkKTsvL+aJvuWIsOaWsOeItuiKgueCuVxuICAgIGlmKCFucE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlLGJnaWQpO1xuICB9KSgpOyBcbn0iXX0=