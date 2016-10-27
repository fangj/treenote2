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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUUsUUFBUSxRQUFSLENBQU47QUFDQSxJQUFJLFdBQVcsUUFBUSxTQUFSLEVBQW1CLFFBQWxDO0FBQ0EsSUFBTSxLQUFHLFNBQUgsRUFBRyxDQUFDLEdBQUQ7QUFBQSxTQUFRLFFBQU8sR0FBUCx5Q0FBTyxHQUFQLE9BQWEsUUFBYixHQUFzQixFQUF0QixHQUEwQixRQUFNLEdBQU4sR0FBVSxHQUFWLEdBQWMsU0FBUyxHQUFULENBQWhEO0FBQUEsQ0FBVDtBQUNBLElBQUksRUFBSjtBQUNBLFNBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEwQixFQUExQixFQUE2QjtBQUMzQjtBQUNBLE9BQUcsR0FBSDtBQUNBLHdCQUFzQixJQUF0QixDQUE0QixPQUFPLEVBQVAsS0FBYSxVQUFkLEdBQTBCLElBQTFCLEdBQStCLElBQTFELEVBSDJCLENBR3NDO0FBQ2pFLFNBQU87QUFDTCxlQUFVLG1CQUFDLEdBQUQ7QUFBQSxhQUFPLFdBQVUsR0FBRyxHQUFILENBQVYsQ0FBUDtBQUFBLEtBREw7QUFFTCxnQkFBVyxvQkFBQyxJQUFEO0FBQUEsYUFBUSxZQUFXLEtBQUssR0FBTCxDQUFTLEVBQVQsQ0FBWCxDQUFSO0FBQUEsS0FGTjtBQUdMLG9CQUFlLHdCQUFDLElBQUQsRUFBTSxJQUFOO0FBQUEsYUFBYSxnQkFBZSxHQUFHLElBQUgsQ0FBZixFQUF3QixJQUF4QixDQUFiO0FBQUEsS0FIVjtBQUlMLG9CQUFlLHdCQUFDLElBQUQsRUFBTyxJQUFQO0FBQUEsYUFBYyxnQkFBZSxHQUFHLElBQUgsQ0FBZixFQUF3QixJQUF4QixDQUFkO0FBQUEsS0FKVjtBQUtMLHdCQUFtQiw0QkFBQyxJQUFELEVBQU0sSUFBTjtBQUFBLGFBQWEsb0JBQW1CLEdBQUcsSUFBSCxDQUFuQixFQUE0QixJQUE1QixDQUFi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QUFBLEdBQUQsRUFBUDtBQUlEOztBQUVELFNBQVMsZ0JBQVQsQ0FBeUIsR0FBekIsRUFBOEIsSUFBOUIsRUFBb0M7QUFBQTs7QUFDbEMsU0FBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDRDQUNXLGdCQUFnQixJQUFoQixDQURYOztBQUFBO0FBQ0Ysa0JBREU7O0FBQUEsZ0JBRUYsTUFGRTtBQUFBO0FBQUE7QUFBQTs7QUFBQSxrQkFHRyx3Q0FBc0MsSUFIekM7O0FBQUE7QUFBQSw4Q0FNQyxhQUFhLEdBQWIsRUFBaUIsTUFBakIsRUFBd0IsSUFBeEIsQ0FORDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFELEVBQVA7QUFRRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXN5bmMnKTtcclxuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xyXG4vLyB2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XHJcbnZhciBfPXJlcXVpcmUoJ2xvZGFzaCcpO1xyXG52YXIgT2JqZWN0SWQgPSByZXF1aXJlKCdtb25nb2RiJykuT2JqZWN0SWQ7XHJcbmNvbnN0IGlkPShfaWQpPT4odHlwZW9mIF9pZD09PVwib2JqZWN0XCI/aWQ6KF9pZD09PScwJz8nMCc6T2JqZWN0SWQoX2lkKSkpO1xyXG52YXIgZGI7IFxyXG5mdW5jdGlvbiB0cmVlX21vbmdvZGIoX2RiLGNiKXtcclxuICAvLyBkYj1Qcm9taXNlLnByb21pc2lmeUFsbChfZGIpO1xyXG4gIGRiPV9kYjtcclxuICBidWlsZFJvb3RJZk5vdEV4aXN0KCkudGhlbigodHlwZW9mIGNiID09PSdmdW5jdGlvbicpP2NiKCk6bnVsbCk7IC8vY2LnlKjkuo7pgJrnn6XmtYvor5XnqIvluo9cclxuICByZXR1cm4ge1xyXG4gICAgcmVhZF9ub2RlOihnaWQpPT5yZWFkX25vZGUoaWQoZ2lkKSksXHJcbiAgICByZWFkX25vZGVzOihnaWRzKT0+cmVhZF9ub2RlcyhnaWRzLm1hcChpZCkpLFxyXG4gICAgbWtfc29uX2J5X2RhdGE6KHBnaWQsZGF0YSk9Pm1rX3Nvbl9ieV9kYXRhKGlkKHBnaWQpLGRhdGEpLFxyXG4gICAgbWtfc29uX2J5X25hbWU6KHBnaWQsIG5hbWUpPT5ta19zb25fYnlfbmFtZShpZChwZ2lkKSxuYW1lKSxcclxuICAgIG1rX2Jyb3RoZXJfYnlfZGF0YTooYmdpZCxkYXRhKT0+bWtfYnJvdGhlcl9ieV9kYXRhKGlkKGJnaWQpLGRhdGEpLFxyXG4gICAgdXBkYXRlX2RhdGE6KGdpZCwgZGF0YSk9PnVwZGF0ZV9kYXRhKGlkKGdpZCksZGF0YSksXHJcbiAgICByZW1vdmU6KGdpZCk9PnJlbW92ZShpZChnaWQpKSxcclxuICAgIG1vdmVfYXNfc29uOihnaWQsIHBnaWQpID0+bW92ZV9hc19zb24oaWQoZ2lkKSwgaWQocGdpZCkpLFxyXG4gICAgbW92ZV9hc19icm90aGVyOihnaWQsIGJnaWQpPT5tb3ZlX2FzX2Jyb3RoZXIoaWQoZ2lkKSwgaWQoYmdpZCkpLFxyXG4gICAgLy9mb3IgdGVzdFxyXG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9dHJlZV9tb25nb2RiO1xyXG4vL+WGhemDqOW3peWFt+WHveaVsFxyXG5jb25zdCBfaW5zZXJ0QXN5bmM9KG5vZGUpPT57XHJcbiAgcmV0dXJuIGRiLmluc2VydE9uZShub2RlKS50aGVuKHJlcz0+e1xyXG4gICAgbm9kZS5faWQ9cmVzLmluc2VydGVkSWQ7XHJcbiAgICByZXR1cm4gbm9kZTtcclxuICB9KVxyXG59XHJcblxyXG5cclxuY29uc3QgX2luc2VydENoaWxkcmVuQXN5bmM9KHBOb2RlLGdpZCxiZ2lkKT0+e1xyXG4gICAgdmFyIHBvcz0wO1xyXG4gICAgaWYoYmdpZCl7XHJcbiAgICAgIHBvcz1fLmZpbmRJbmRleChwTm9kZS5fbGluay5jaGlsZHJlbiwgbz0+IGJnaWQuZXF1YWxzKG8pKTtcclxuICAgIH1cclxuICAgcmV0dXJuIGRiLnVwZGF0ZU9uZSh7X2lkOnBOb2RlLl9pZH0sIHtcclxuICAgICAkcHVzaDoge1xyXG4gICAgICAgIFwiX2xpbmsuY2hpbGRyZW5cIjoge1xyXG4gICAgICAgICAgICRlYWNoOiBbZ2lkXSxcclxuICAgICAgICAgICAkcG9zaXRpb246IHBvc1xyXG4gICAgICAgIH1cclxuICAgICB9XHJcbiAgIH0pOyBcclxufVxyXG5cclxuY29uc3QgZmluZFBhcmVudEFzeW5jPShzZ2lkKT0+IGRiLmZpbmRPbmUoe1wiX2xpbmsuY2hpbGRyZW5cIjpzZ2lkLF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7XHJcblxyXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcclxuICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3RcIik7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0IGJlZ2luXCIpO1xyXG4gICAgdmFyIHJvb3Q9YXdhaXQgZGIuZmluZE9uZSh7X2lkOicwJ30pO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJmb3VuZCByb290XCIscm9vdCk7XHJcbiAgICBpZighcm9vdCl7XHJcbiAgICAgIHZhciBkZWZhdWx0Um9vdD17XHJcbiAgICAgICAgX2lkOicwJywgXHJcbiAgICAgICAgX2xpbms6IHtcclxuICAgICAgICAgIHA6ICcwJyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgcm9vdD1hd2FpdCBfaW5zZXJ0QXN5bmMoZGVmYXVsdFJvb3QpO1xyXG4gICAgfVxyXG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIscm9vdCk7XHJcbiAgICByZXR1cm4gcm9vdDtcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX25vZGUoZ2lkKSB7XHJcbiAgLy9ybeagh+iusOihqOekuuiKgueCueW3sue7j+iiq+WIoOmZpFxyXG4gIC8vIGNvbnNvbGUubG9nKFwicmVhZF9ub2RlXCIsZ2lkKTtcclxuICByZXR1cm4gZGIuZmluZE9uZSh7X2lkOmdpZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZF9ub2RlcyhnaWRzKSB7XHJcbiAgLy8gY29uc29sZS5sb2coXCJyZWFkX25vZGVzXCIsZ2lkcyk7XHJcbiAgcmV0dXJuIGRiLmZpbmQoe19pZDp7JGluOmdpZHN9LF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSkudG9BcnJheSgpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gX21rX3Nvbl9ieV9rdihwTm9kZSxrZXksdmFsdWUsYmdpZCl7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgLy8gY29uc29sZS5sb2cocE5vZGUpO1xyXG4gICAgdmFyIF9uZXdOb2RlPXtcclxuICAgICAgICBfbGluazoge1xyXG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIF9uZXdOb2RlW2tleV09dmFsdWU7XHJcbiAgICB2YXIgbmV3Tm9kZT0gYXdhaXQgX2luc2VydEFzeW5jKF9uZXdOb2RlKSA7Ly/mj5LlhaXmlrDoioLngrlcclxuICAgIC8v5o+S5YWl54i26IqC54K5XHJcbiAgICBhd2FpdCBfaW5zZXJ0Q2hpbGRyZW5Bc3luYyhwTm9kZSxuZXdOb2RlLl9pZCxiZ2lkKTtcclxuICAgIHJldHVybiBuZXdOb2RlOy8v6L+U5Zue5paw6IqC54K5XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgIHZhciBwTm9kZT1hd2FpdCByZWFkX25vZGUocGdpZCk7Ly/mib7liLDniLboioLngrlcclxuICAgIGlmKCFwTm9kZSl7XHJcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcclxuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXHJcbiAgICB9XHJcbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSk7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuLy8gZnVuY3Rpb24gX19ta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XHJcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4vLyAgICAgY29uc29sZS5sb2coXCJta19zb25fYnlfbmFtZVwiLHBnaWQsbmFtZSlcclxuLy8gICAgIHZhciBwTm9kZT1hd2FpdCAgcmVhZF9ub2RlKHBnaWQpIDsvL+aJvuWIsOeItuiKgueCuVxyXG4vLyAgICAgaWYoIXBOb2RlKXtcclxuLy8gICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xyXG4vLyAgICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcclxuLy8gICAgIH1cclxuLy8gICAgIHZhciBub2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX25hbWVcIjpuYW1lLFwiX2xpbmsucFwiOnBnaWR9KTsvL+aYr+WQpuW3suacieWQjOWQjeiKgueCuVxyXG4vLyAgICAgaWYobm9kZSl7XHJcbi8vICAgICAgIHJldHVybiBub2RlOy8v5aaC5pyJ55u05o6l6L+U5ZueXHJcbi8vICAgICB9XHJcbi8vICAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9uYW1lXCIsbmFtZSk7XHJcbi8vICAgfSkoKTtcclxuLy8gfVxyXG5cclxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xyXG4gIC8vIGNvbnNvbGUubG9nKFwibWtfc29uX2J5X25hbWVcIilcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1rX3Nvbl9ieV9uYW1lXCIscGdpZCxuYW1lKVxyXG4gICAgdmFyIHBOb2RlPWF3YWl0ICByZWFkX25vZGUocGdpZCkgOy8v5om+5Yiw54i26IqC54K5XHJcbiAgICBpZighcE5vZGUpe1xyXG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XHJcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG4gICAgdmFyIF9uZXdOb2RlPXtcclxuICAgICAgICBfbGluazoge1xyXG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBfbmFtZTpuYW1lXHJcbiAgICB9O1xyXG4gICAgY29uc3Qgbm9kZT1hd2FpdCBkYi5maW5kQW5kTW9kaWZ5KHtcIl9uYW1lXCI6bmFtZSxcIl9saW5rLnBcIjpwZ2lkfSxcclxuICAgIFtbJ19uYW1lJywnYXNjJ11dLFxyXG4gICAgeyBcIiRzZXRPbkluc2VydFwiOiBfbmV3Tm9kZSB9LFxyXG4gICAge25ldzogdHJ1ZSwgdXBzZXJ0OiB0cnVlfSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhub2RlKVxyXG4gICAgY29uc3QgbmV3Tm9kZT1ub2RlLnZhbHVlO1xyXG4gICAgLy/lpoLmnpzmmK/mlrDlop7nmoToioLngrnmj5LlhaXniLboioLngrlcclxuICAgIGlmKCFub2RlLmxhc3RFcnJvck9iamVjdC51cGRhdGVkRXhpc3Rpbmcpe1xyXG4gICAgICBhd2FpdCBfaW5zZXJ0Q2hpbGRyZW5Bc3luYyhwTm9kZSxuZXdOb2RlLl9pZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3Tm9kZTtcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCxkYXRhKSB7XHJcbiAgLy8gY29uc29sZS5sb2coXCJta19icm90aGVyX2J5X2RhdGFcIilcclxuXHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgdmFyIHBOb2RlPWF3YWl0IGZpbmRQYXJlbnRBc3luYyhiZ2lkKTsvL+aJvuWIsOeItuiKgueCuVxyXG4gICAgaWYoIXBOb2RlKXtcclxuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XHJcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfZGF0YVwiLGRhdGEsYmdpZCk7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZV9kYXRhKGdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpnaWR9LCB7ICRzZXQ6IHsgX2RhdGE6IGRhdGEgfSB9KVxyXG4gIC50aGVuKHJlYWRfbm9kZShnaWQpKTtcclxufVxyXG5cclxuXHJcbi8v6YCS5b2S6YGN5Y6G5omA5pyJ5a2Q6IqC54K5XHJcbi8vZ2lkc+aYr+imgeiuv+mXrueahOiKgueCuWlk55qE5YiX6KGoXHJcbi8vdmlzaXTmmK/kuIDkuKrlh73mlbDjgILorr/pl67oioLngrnnmoTliqjkvZzjgIJcclxuZnVuY3Rpb24gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oZ2lkcyx2aXNpdCkge1xyXG4gIC8vIGNvbnNvbGUubG9nKFwiX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW5cIixnaWRzKTtcclxuICBpZiAoIWdpZHN8fGdpZHMubGVuZ3RoPT0wKSB7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO30vL+mcgOimgei/lOWbnuS4gOS4qnByb21pc2UgXHJcbiAgcmV0dXJuIFByb21pc2UuYWxsKGdpZHMubWFwKGdpZCA9PiB7XHJcbiAgICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57IC8v6K+75Y+W5b2T5YmN6IqC54K5XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKG5vZGUsbm9kZS5fbGluay5jaGlsZHJlbilcclxuICAgICAgcmV0dXJuIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKG5vZGUuX2xpbmsuY2hpbGRyZW4sdmlzaXQpLnRoZW4oKCk9PnsgLy/orr/pl67miYDmnInlrZDoioLngrlcclxuICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH0pKTtcclxufVxyXG5cclxuLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcclxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgICBpZihnaWQ9PT0nMCcpcmV0dXJuOy8v5qC56IqC54K55LiN6IO95Yig6Zmk44CCXHJcbiAgICAgdmFyIG5vZGU9YXdhaXQgcmVhZF9ub2RlKGdpZCk7IC8v5YWI6K+75Y+W6KaB5Yig6Zmk55qE6IqC54K5XHJcbiAgICAgaWYoIW5vZGUpcmV0dXJuOy8v5bey57uP5LiN5a2Y5Zyo77yM6L+U5ZueXHJcbiAgICAgLy/mlLbpm4bmiYDmnInlrZDoioLngrlcclxuICAgICB2YXIgZ2lkc2ZvclJlbW92ZT1bXTtcclxuICAgICBjb25zdCBybT0obm9kZSk9PntnaWRzZm9yUmVtb3ZlLnB1c2gobm9kZS5faWQpfTtcclxuICAgICBhd2FpdCBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihbZ2lkXSxybSk7XHJcbiAgICAgLy/mibnph4/liKDpmaRcclxuICAgICBhd2FpdCBkYi51cGRhdGVNYW55KHtfaWQ6eyRpbjpnaWRzZm9yUmVtb3ZlfX0sICB7ICRzZXQ6IHsgX3JtOnRydWUgIH0gfSwge30pOy8v5qCH6K6w5Li65Yig6ZmkXHJcbiAgICAgYXdhaXQgZGIudXBkYXRlT25lKHtfaWQ6bm9kZS5fbGluay5wfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxyXG4gICAgIHJldHVybiBnaWRzZm9yUmVtb3ZlO1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9pc0FuY2VzdG9yKHBnaWQsZ2lkKXtcclxuICBpZihnaWQ9PScwJylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgLy8nMCfkuLrmoLnoioLngrnjgILku7vkvZXoioLngrnpg73kuI3mmK8nMCfnmoTniLboioLngrlcclxuICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57XHJcbiAgICAvLyBjb25zb2xlLmxvZygnY2hlY2snLHBnaWQsbm9kZS5fbGluay5wLG5vZGUpXHJcbiAgICBpZihub2RlLl9saW5rLnA9PT1wZ2lkKXtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgcmV0dXJuIF9pc0FuY2VzdG9yKHBnaWQsbm9kZS5fbGluay5wKTtcclxuICAgIH1cclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfbW92ZV9hc19zb24oZ2lkLCBucE5vZGUsYmdpZCl7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgdmFyIGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGU9YXdhaXQgX2lzQW5jZXN0b3IoZ2lkLG5wTm9kZS5faWQpO1xyXG4gICAgaWYoZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZSl7XHJcbiAgICAgIHRocm93IChnaWQrJ2lzIGFuY2VzdG9yIG9mJytucE5vZGUuX2lkKTtcclxuICAgICAgcmV0dXJuIG51bGw7Ly/opoHnp7vliqjnmoToioLngrnkuI3og73mmK/nm67moIfniLboioLngrnnmoTplb/ovojoioLngrlcclxuICAgIH1cclxuICAgIHZhciBwTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoZ2lkKTsvL+aJvuWIsOWOn+eItuiKgueCuVxyXG4gICAgaWYoIXBOb2RlKXtcclxuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XHJcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG4gICAgYXdhaXQgZGIudXBkYXRlT25lKHtfaWQ6cE5vZGUuX2lkfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxyXG4gICAgaWYobnBOb2RlLl9pZCE9PXBOb2RlLl9pZCl7XHJcbiAgICAgIGF3YWl0IGRiLnVwZGF0ZU9uZSh7X2lkOmdpZH0sICB7ICRzZXQ6IHsgXCJfbGluay5wXCI6IG5wTm9kZS5faWQgfSB9LCB7fSk7Ly/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcclxuICAgIH1cclxuICAgIGF3YWl0IF9pbnNlcnRDaGlsZHJlbkFzeW5jKG5wTm9kZSxnaWQsYmdpZCk7XHJcbiAgICByZXR1cm4gYXdhaXQgcmVhZF9ub2RlKGdpZCk7XHJcbiAgfSkoKTsgIFxyXG59XHJcblxyXG4vLyAvL+aKimdpZOiKgueCueenu+WKqOS4unBnaWTnmoTlrZDoioLngrlcclxuLy8gLy/ljIXlkKsz5q2l44CCIDEu5LuOZ2lk55qE5Y6f54i26IqC54K55Yig6Zmk44CCMuaUueWPmGdpZOeahOW9k+WJjeeItuiKgueCueOAgiAz44CC5rOo5YaM5Yiw5paw54i26IqC54K5XHJcbi8vIC8v56e75Yqo5YmN6ZyA6KaB5YGa5qOA5p+l44CC56WW5YWI6IqC54K55LiN6IO956e75Yqo5Li65ZCO6L6I55qE5a2Q6IqC54K5XHJcbmZ1bmN0aW9uIG1vdmVfYXNfc29uKGdpZCwgcGdpZCkge1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgIHZhciBucE5vZGU9YXdhaXQgcmVhZF9ub2RlKHBnaWQpOy8v5om+5Yiw5paw54i26IqC54K5XHJcbiAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUpO1xyXG4gIH0pKCk7ICBcclxufVxyXG5cclxuZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgIHZhciBucE5vZGU9YXdhaXQgZmluZFBhcmVudEFzeW5jKGJnaWQpOy8v5om+5Yiw5paw54i26IqC54K5XHJcbiAgICBpZighbnBOb2RlKXtcclxuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XHJcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlLGJnaWQpO1xyXG4gIH0pKCk7IFxyXG59Il19