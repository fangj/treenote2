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
  console.log("_insertChildrenAsync,pNode,gid,bgid,pos", pNode, gid, bgid, pos);
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

  console.log("_move_as_son gid, npNode,bgid", gid, npNode, bgid);
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

  console.log("move_as_son,gid, pgid", gid, pgid);
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

  console.log("move_as_brother,gid, pgid", gid, bgid);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFHQSxJQUFJLElBQUUsUUFBUSxRQUFSLENBQUY7QUFDSixJQUFJLFdBQVcsUUFBUSxTQUFSLEVBQW1CLFFBQW5CO0FBQ2YsSUFBTSxLQUFHLFNBQUgsRUFBRyxDQUFDLEdBQUQ7U0FBUSxRQUFPLGlEQUFQLEtBQWEsUUFBYixHQUFzQixFQUF0QixHQUEwQixRQUFNLEdBQU4sR0FBVSxHQUFWLEdBQWMsU0FBUyxHQUFULENBQWQ7Q0FBbEM7QUFDVCxJQUFJLEVBQUo7QUFDQSxTQUFTLFlBQVQsQ0FBc0IsR0FBdEIsRUFBMEIsRUFBMUIsRUFBNkI7O0FBRTNCLE9BQUcsR0FBSCxDQUYyQjtBQUczQix3QkFBc0IsSUFBdEIsQ0FBMkIsT0FBUSxFQUFQLEtBQWEsVUFBYixHQUF5QixJQUExQixHQUErQixJQUEvQixDQUEzQjtBQUgyQixTQUlwQjtBQUNMLGVBQVUsbUJBQUMsR0FBRDthQUFPLFdBQVUsR0FBRyxHQUFILENBQVY7S0FBUDtBQUNWLGdCQUFXLG9CQUFDLElBQUQ7YUFBUSxZQUFXLEtBQUssR0FBTCxDQUFTLEVBQVQsQ0FBWDtLQUFSO0FBQ1gsb0JBQWUsd0JBQUMsSUFBRCxFQUFNLElBQU47YUFBYSxnQkFBZSxHQUFHLElBQUgsQ0FBZixFQUF3QixJQUF4QjtLQUFiO0FBQ2Ysb0JBQWUsd0JBQUMsSUFBRCxFQUFPLElBQVA7YUFBYyxnQkFBZSxHQUFHLElBQUgsQ0FBZixFQUF3QixJQUF4QjtLQUFkO0FBQ2Ysd0JBQW1CLDRCQUFDLElBQUQsRUFBTSxJQUFOO2FBQWEsb0JBQW1CLEdBQUcsSUFBSCxDQUFuQixFQUE0QixJQUE1QjtLQUFiO0FBQ25CLGlCQUFZLHFCQUFDLEdBQUQsRUFBTSxJQUFOO2FBQWEsYUFBWSxHQUFHLEdBQUgsQ0FBWixFQUFvQixJQUFwQjtLQUFiO0FBQ1osWUFBTyxnQkFBQyxHQUFEO2FB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QUNLLHdDQUFzQyxJQUF0Qzs7Ozs0Q0FHSCxHQUFHLFNBQUgsQ0FBYSxFQUFDLEtBQUksTUFBTSxHQUFOLEVBQWxCLEVBQStCLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixHQUFsQixFQUFULEVBQWpDLEVBQXNFLEVBQXRFOzs7a0JBQ0gsT0FBTyxHQUFQLEtBQWEsTUFBTSxHQUFOOzs7Ozs7NENBQ1IsR0FBRyxTQUFILENBQWEsRUFBQyxLQUFJLEdBQUosRUFBZCxFQUF5QixFQUFFLE1BQU0sRUFBRSxXQUFXLE9BQU8sR0FBUCxFQUFuQixFQUEzQixFQUE4RCxFQUE5RDs7Ozs0Q0FFRixxQkFBcUIsTUFBckIsRUFBNEIsR0FBNUIsRUFBZ0MsSUFBaEM7Ozs7NENBQ08sV0FBVSxHQUFWOzs7Ozs7Ozs7OztHQWhCUCxFQUFSLENBRnFDO0NBQXZDOzs7OztBQXlCQSxTQUFTLGFBQVQsQ0FBcUIsR0FBckIsRUFBMEIsSUFBMUIsRUFBZ0M7OztBQUM5QixVQUFRLEdBQVIsQ0FBWSx1QkFBWixFQUFvQyxHQUFwQyxFQUF3QyxJQUF4QyxFQUQ4QjtBQUU5QixTQUFPLGlCQUFDOzs7Ozs7OzRDQUNXLFdBQVUsSUFBVjs7O0FBQWI7OENBQ0csYUFBYSxHQUFiLEVBQWlCLE1BQWpCOzs7Ozs7OztHQUZELEVBQVIsQ0FGOEI7Q0FBaEM7O0FBUUEsU0FBUyxnQkFBVCxDQUF5QixHQUF6QixFQUE4QixJQUE5QixFQUFvQzs7O0FBQ2xDLFVBQVEsR0FBUixDQUFZLDJCQUFaLEVBQXdDLEdBQXhDLEVBQTRDLElBQTVDLEVBRGtDO0FBRWxDLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1csZ0JBQWdCLElBQWhCOzs7QUFBYjs7Z0JBQ0E7Ozs7O2tCQUNLLHdDQUFzQyxJQUF0Qzs7OzhDQUdGLGFBQWEsR0FBYixFQUFpQixNQUFqQixFQUF3QixJQUF4Qjs7Ozs7Ozs7R0FORCxFQUFSLENBRmtDO0NBQXBDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hc3luYycpO1xuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xuLy8gdmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xudmFyIF89cmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgT2JqZWN0SWQgPSByZXF1aXJlKCdtb25nb2RiJykuT2JqZWN0SWQ7XG5jb25zdCBpZD0oX2lkKT0+KHR5cGVvZiBfaWQ9PT1cIm9iamVjdFwiP2lkOihfaWQ9PT0nMCc/JzAnOk9iamVjdElkKF9pZCkpKTtcbnZhciBkYjsgXG5mdW5jdGlvbiB0cmVlX21vbmdvZGIoX2RiLGNiKXtcbiAgLy8gZGI9UHJvbWlzZS5wcm9taXNpZnlBbGwoX2RiKTtcbiAgZGI9X2RiO1xuICBidWlsZFJvb3RJZk5vdEV4aXN0KCkudGhlbigodHlwZW9mIGNiID09PSdmdW5jdGlvbicpP2NiKCk6bnVsbCk7IC8vY2LnlKjkuo7pgJrnn6XmtYvor5XnqIvluo9cbiAgcmV0dXJuIHtcbiAgICByZWFkX25vZGU6KGdpZCk9PnJlYWRfbm9kZShpZChnaWQpKSxcbiAgICByZWFkX25vZGVzOihnaWRzKT0+cmVhZF9ub2RlcyhnaWRzLm1hcChpZCkpLFxuICAgIG1rX3Nvbl9ieV9kYXRhOihwZ2lkLGRhdGEpPT5ta19zb25fYnlfZGF0YShpZChwZ2lkKSxkYXRhKSxcbiAgICBta19zb25fYnlfbmFtZToocGdpZCwgbmFtZSk9Pm1rX3Nvbl9ieV9uYW1lKGlkKHBnaWQpLG5hbWUpLFxuICAgIG1rX2Jyb3RoZXJfYnlfZGF0YTooYmdpZCxkYXRhKT0+bWtfYnJvdGhlcl9ieV9kYXRhKGlkKGJnaWQpLGRhdGEpLFxuICAgIHVwZGF0ZV9kYXRhOihnaWQsIGRhdGEpPT51cGRhdGVfZGF0YShpZChnaWQpLGRhdGEpLFxuICAgIHJlbW92ZTooZ2lkKT0+cmVtb3ZlKGlkKGdpZCkpLFxuICAgIG1vdmVfYXNfc29uOihnaWQsIHBnaWQpID0+bW92ZV9hc19zb24oaWQoZ2lkKSwgaWQocGdpZCkpLFxuICAgIG1vdmVfYXNfYnJvdGhlcjooZ2lkLCBiZ2lkKT0+bW92ZV9hc19icm90aGVyKGlkKGdpZCksIGlkKGJnaWQpKSxcbiAgICAvL2ZvciB0ZXN0XG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzPXRyZWVfbW9uZ29kYjtcbi8v5YaF6YOo5bel5YW35Ye95pWwXG5jb25zdCBfaW5zZXJ0QXN5bmM9KG5vZGUpPT57XG4gIHJldHVybiBkYi5pbnNlcnRPbmUobm9kZSkudGhlbihyZXM9PntcbiAgICBub2RlLl9pZD1yZXMuaW5zZXJ0ZWRJZDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSlcbn1cblxuXG5jb25zdCBfaW5zZXJ0Q2hpbGRyZW5Bc3luYz0ocE5vZGUsZ2lkLGJnaWQpPT57XG4gICAgdmFyIHBvcz0wO1xuICAgIGlmKGJnaWQpe1xuICAgICAgcG9zPV8uZmluZEluZGV4KHBOb2RlLl9saW5rLmNoaWxkcmVuLCBvPT4gYmdpZC5lcXVhbHMobykpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIl9pbnNlcnRDaGlsZHJlbkFzeW5jLHBOb2RlLGdpZCxiZ2lkLHBvc1wiLHBOb2RlLGdpZCxiZ2lkLHBvcylcbiAgIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCB7XG4gICAgICRwdXNoOiB7XG4gICAgICAgIFwiX2xpbmsuY2hpbGRyZW5cIjoge1xuICAgICAgICAgICAkZWFjaDogW2dpZF0sXG4gICAgICAgICAgICRwb3NpdGlvbjogcG9zXG4gICAgICAgIH1cbiAgICAgfVxuICAgfSk7IFxufVxuXG5jb25zdCBmaW5kUGFyZW50QXN5bmM9KHNnaWQpPT4gZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnNnaWQsX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTtcblxuZnVuY3Rpb24gYnVpbGRSb290SWZOb3RFeGlzdChjYil7XG4gIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiKTtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdCBiZWdpblwiKTtcbiAgICB2YXIgcm9vdD1hd2FpdCBkYi5maW5kT25lKHtfaWQ6JzAnfSk7XG4gICAgLy8gY29uc29sZS5sb2coXCJmb3VuZCByb290XCIscm9vdCk7XG4gICAgaWYoIXJvb3Qpe1xuICAgICAgdmFyIGRlZmF1bHRSb290PXtcbiAgICAgICAgX2lkOicwJywgXG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogJzAnLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcm9vdD1hd2FpdCBfaW5zZXJ0QXN5bmMoZGVmYXVsdFJvb3QpO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3RcIixyb290KTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gcmVhZF9ub2RlKGdpZCkge1xuICAvL3Jt5qCH6K6w6KGo56S66IqC54K55bey57uP6KKr5Yig6ZmkXG4gIC8vIGNvbnNvbGUubG9nKFwicmVhZF9ub2RlXCIsZ2lkKTtcbiAgcmV0dXJuIGRiLmZpbmRPbmUoe19pZDpnaWQsIF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xuICAvLyBjb25zb2xlLmxvZyhcInJlYWRfbm9kZXNcIixnaWRzKTtcbiAgcmV0dXJuIGRiLmZpbmQoe19pZDp7JGluOmdpZHN9LF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSkudG9BcnJheSgpO1xufVxuXG5cbmZ1bmN0aW9uIF9ta19zb25fYnlfa3YocE5vZGUsa2V5LHZhbHVlLGJnaWQpe1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2cocE5vZGUpO1xuICAgIHZhciBfbmV3Tm9kZT17XG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgfTtcbiAgICBfbmV3Tm9kZVtrZXldPXZhbHVlO1xuICAgIHZhciBuZXdOb2RlPSBhd2FpdCBfaW5zZXJ0QXN5bmMoX25ld05vZGUpIDsvL+aPkuWFpeaWsOiKgueCuVxuICAgIC8v5o+S5YWl54i26IqC54K5XG4gICAgYXdhaXQgX2luc2VydENoaWxkcmVuQXN5bmMocE5vZGUsbmV3Tm9kZS5faWQsYmdpZCk7XG4gICAgcmV0dXJuIG5ld05vZGU7Ly/ov5Tlm57mlrDoioLngrlcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IHJlYWRfbm9kZShwZ2lkKTsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfZGF0YVwiLGRhdGEpO1xuICB9KSgpO1xufVxuXG4vLyBmdW5jdGlvbiBfX21rX3Nvbl9ieV9uYW1lKHBnaWQsIG5hbWUpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIGNvbnNvbGUubG9nKFwibWtfc29uX2J5X25hbWVcIixwZ2lkLG5hbWUpXG4vLyAgICAgdmFyIHBOb2RlPWF3YWl0ICByZWFkX25vZGUocGdpZCkgOy8v5om+5Yiw54i26IqC54K5XG4vLyAgICAgaWYoIXBOb2RlKXtcbi8vICAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbi8vICAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuLy8gICAgIH1cbi8vICAgICB2YXIgbm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9uYW1lXCI6bmFtZSxcIl9saW5rLnBcIjpwZ2lkfSk7Ly/mmK/lkKblt7LmnInlkIzlkI3oioLngrlcbi8vICAgICBpZihub2RlKXtcbi8vICAgICAgIHJldHVybiBub2RlOy8v5aaC5pyJ55u05o6l6L+U5ZueXG4vLyAgICAgfVxuLy8gICAgIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX25hbWVcIixuYW1lKTtcbi8vICAgfSkoKTtcbi8vIH1cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICAvLyBjb25zb2xlLmxvZyhcIm1rX3Nvbl9ieV9uYW1lXCIpXG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1rX3Nvbl9ieV9uYW1lXCIscGdpZCxuYW1lKVxuICAgIHZhciBwTm9kZT1hd2FpdCAgcmVhZF9ub2RlKHBnaWQpIDsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgdmFyIF9uZXdOb2RlPXtcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiBwTm9kZS5faWQsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH0sXG4gICAgICAgIF9uYW1lOm5hbWVcbiAgICB9O1xuICAgIGNvbnN0IG5vZGU9YXdhaXQgZGIuZmluZEFuZE1vZGlmeSh7XCJfbmFtZVwiOm5hbWUsXCJfbGluay5wXCI6cGdpZH0sXG4gICAgW1snX25hbWUnLCdhc2MnXV0sXG4gICAgeyBcIiRzZXRPbkluc2VydFwiOiBfbmV3Tm9kZSB9LFxuICAgIHtuZXc6IHRydWUsIHVwc2VydDogdHJ1ZX0pO1xuICAgIC8vIGNvbnNvbGUubG9nKG5vZGUpXG4gICAgY29uc3QgbmV3Tm9kZT1ub2RlLnZhbHVlO1xuICAgIC8v5aaC5p6c5piv5paw5aKe55qE6IqC54K55o+S5YWl54i26IqC54K5XG4gICAgaWYoIW5vZGUubGFzdEVycm9yT2JqZWN0LnVwZGF0ZWRFeGlzdGluZyl7XG4gICAgICBhd2FpdCBfaW5zZXJ0Q2hpbGRyZW5Bc3luYyhwTm9kZSxuZXdOb2RlLl9pZCk7XG4gICAgfVxuICAgIHJldHVybiBuZXdOb2RlO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCxkYXRhKSB7XG4gIC8vIGNvbnNvbGUubG9nKFwibWtfYnJvdGhlcl9ieV9kYXRhXCIpXG5cbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoYmdpZCk7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfZGF0YVwiLGRhdGEsYmdpZCk7XG4gIH0pKCk7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlX2RhdGEoZ2lkLCBkYXRhKSB7XG4gIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpnaWR9LCB7ICRzZXQ6IHsgX2RhdGE6IGRhdGEgfSB9KVxuICAudGhlbihyZWFkX25vZGUoZ2lkKSk7XG59XG5cblxuLy/pgJLlvZLpgY3ljobmiYDmnInlrZDoioLngrlcbi8vZ2lkc+aYr+imgeiuv+mXrueahOiKgueCuWlk55qE5YiX6KGoXG4vL3Zpc2l05piv5LiA5Liq5Ye95pWw44CC6K6/6Zeu6IqC54K555qE5Yqo5L2c44CCXG5mdW5jdGlvbiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihnaWRzLHZpc2l0KSB7XG4gIC8vIGNvbnNvbGUubG9nKFwiX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW5cIixnaWRzKTtcbiAgaWYgKCFnaWRzfHxnaWRzLmxlbmd0aD09MCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoKTt9Ly/pnIDopoHov5Tlm57kuIDkuKpwcm9taXNlIFxuICByZXR1cm4gUHJvbWlzZS5hbGwoZ2lkcy5tYXAoZ2lkID0+IHtcbiAgICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57IC8v6K+75Y+W5b2T5YmN6IqC54K5XG4gICAgICAvLyBjb25zb2xlLmxvZyhub2RlLG5vZGUuX2xpbmsuY2hpbGRyZW4pXG4gICAgICByZXR1cm4gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4obm9kZS5fbGluay5jaGlsZHJlbix2aXNpdCkudGhlbigoKT0+eyAvL+iuv+mXruaJgOacieWtkOiKgueCuVxuICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XG4gICAgICB9KVxuICAgIH0pXG4gIH0pKTtcbn1cblxuLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcbmZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgICBpZihnaWQ9PT0nMCcpcmV0dXJuOy8v5qC56IqC54K55LiN6IO95Yig6Zmk44CCXG4gICAgIHZhciBub2RlPWF3YWl0IHJlYWRfbm9kZShnaWQpOyAvL+WFiOivu+WPluimgeWIoOmZpOeahOiKgueCuVxuICAgICBpZighbm9kZSlyZXR1cm47Ly/lt7Lnu4/kuI3lrZjlnKjvvIzov5Tlm55cbiAgICAgLy/mlLbpm4bmiYDmnInlrZDoioLngrlcbiAgICAgdmFyIGdpZHNmb3JSZW1vdmU9W107XG4gICAgIGNvbnN0IHJtPShub2RlKT0+e2dpZHNmb3JSZW1vdmUucHVzaChub2RlLl9pZCl9O1xuICAgICBhd2FpdCBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihbZ2lkXSxybSk7XG4gICAgIC8v5om56YeP5Yig6ZmkXG4gICAgIGF3YWl0IGRiLnVwZGF0ZU1hbnkoe19pZDp7JGluOmdpZHNmb3JSZW1vdmV9fSwgIHsgJHNldDogeyBfcm06dHJ1ZSAgfSB9LCB7fSk7Ly/moIforrDkuLrliKDpmaRcbiAgICAgYXdhaXQgZGIudXBkYXRlT25lKHtfaWQ6bm9kZS5fbGluay5wfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuICAgICByZXR1cm4gZ2lkc2ZvclJlbW92ZTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xuICBpZihnaWQ9PScwJylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgLy8nMCfkuLrmoLnoioLngrnjgILku7vkvZXoioLngrnpg73kuI3mmK8nMCfnmoTniLboioLngrlcbiAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcbiAgICBpZihub2RlLl9saW5rLnA9PT1wZ2lkKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIF9pc0FuY2VzdG9yKHBnaWQsbm9kZS5fbGluay5wKTtcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcbiAgY29uc29sZS5sb2coXCJfbW92ZV9hc19zb24gZ2lkLCBucE5vZGUsYmdpZFwiLGdpZCwgbnBOb2RlLGJnaWQpXG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZT1hd2FpdCBfaXNBbmNlc3RvcihnaWQsbnBOb2RlLl9pZCk7XG4gICAgaWYoZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZSl7XG4gICAgICB0aHJvdyAoZ2lkKydpcyBhbmNlc3RvciBvZicrbnBOb2RlLl9pZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+imgeenu+WKqOeahOiKgueCueS4jeiDveaYr+ebruagh+eItuiKgueCueeahOmVv+i+iOiKgueCuVxuICAgIH1cbiAgICB2YXIgcE5vZGU9YXdhaXQgZmluZFBhcmVudEFzeW5jKGdpZCk7Ly/mib7liLDljp/niLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgYXdhaXQgZGIudXBkYXRlT25lKHtfaWQ6cE5vZGUuX2lkfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuICAgIGlmKG5wTm9kZS5faWQhPT1wTm9kZS5faWQpe1xuICAgICAgYXdhaXQgZGIudXBkYXRlT25lKHtfaWQ6Z2lkfSwgIHsgJHNldDogeyBcIl9saW5rLnBcIjogbnBOb2RlLl9pZCB9IH0sIHt9KTsvL+aUueWPmGdpZOeahOeItuiKgueCueS4uuaWsOeItuiKgueCuVxuICAgIH1cbiAgICBhd2FpdCBfaW5zZXJ0Q2hpbGRyZW5Bc3luYyhucE5vZGUsZ2lkLGJnaWQpO1xuICAgIHJldHVybiBhd2FpdCByZWFkX25vZGUoZ2lkKTtcbiAgfSkoKTsgIFxufVxuXG4vLyAvL+aKimdpZOiKgueCueenu+WKqOS4unBnaWTnmoTlrZDoioLngrlcbi8vIC8v5YyF5ZCrM+atpeOAgiAxLuS7jmdpZOeahOWOn+eItuiKgueCueWIoOmZpOOAgjLmlLnlj5hnaWTnmoTlvZPliY3niLboioLngrnjgIIgM+OAguazqOWGjOWIsOaWsOeItuiKgueCuVxuLy8gLy/np7vliqjliY3pnIDopoHlgZrmo4Dmn6XjgILnpZblhYjoioLngrnkuI3og73np7vliqjkuLrlkI7ovojnmoTlrZDoioLngrlcbmZ1bmN0aW9uIG1vdmVfYXNfc29uKGdpZCwgcGdpZCkge1xuICBjb25zb2xlLmxvZyhcIm1vdmVfYXNfc29uLGdpZCwgcGdpZFwiLGdpZCxwZ2lkKVxuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIG5wTm9kZT1hd2FpdCByZWFkX25vZGUocGdpZCk7Ly/mib7liLDmlrDniLboioLngrlcbiAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUpO1xuICB9KSgpOyAgXG59XG5cbmZ1bmN0aW9uIG1vdmVfYXNfYnJvdGhlcihnaWQsIGJnaWQpIHtcbiAgY29uc29sZS5sb2coXCJtb3ZlX2FzX2Jyb3RoZXIsZ2lkLCBwZ2lkXCIsZ2lkLGJnaWQpXG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgbnBOb2RlPWF3YWl0IGZpbmRQYXJlbnRBc3luYyhiZ2lkKTsvL+aJvuWIsOaWsOeItuiKgueCuVxuICAgIGlmKCFucE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlLGJnaWQpO1xuICB9KSgpOyBcbn0iXX0=