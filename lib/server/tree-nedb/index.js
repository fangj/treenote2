'use strict';

// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
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
  var _this = this;

  return function _callee() {
    var root, defaultRoot;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(db.findOneAsync({ _id: '0' }));

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
            return regeneratorRuntime.awrap(db.insertAsync(defaultRoot));

          case 7:
            root = _context.sent;

          case 8:
            if (typeof cb == 'function') {
              cb(); //通知root构建完成
            }
            return _context.abrupt('return', root);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, null, _this);
  }();
}

function read_node(gid) {
  var _this2 = this;

  return function _callee2() {
    var node;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(db.findOneAsync({ _id: gid, _rm: { $exists: false } }));

          case 2:
            node = _context2.sent;
            return _context2.abrupt('return', node);

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, null, _this2);
  }();
}

function read_nodes(gids) {
  var _this3 = this;

  return function _callee3() {
    var nodes;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(db.findAsync({ _id: { $in: gids }, _rm: { $exists: false } }));

          case 2:
            nodes = _context3.sent;
            return _context3.abrupt('return', nodes);

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, null, _this3);
  }();
}

function _mk_son_by_data(pNode, data, bgid) {
  var _this4 = this;

  return function _callee4() {
    var newNode, _newNode, pos, children;

    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // console.log(pNode);
            newNode = {
              _link: {
                p: pNode._id,
                children: []
              },
              _data: data
            };
            _context4.next = 3;
            return regeneratorRuntime.awrap(db.insertAsync(newNode));

          case 3:
            _newNode = _context4.sent;
            //插入新节点
            pos = 0;
            children = pNode._link.children;

            if (bgid) {
              pos = children.indexOf(bgid) + 1;
            }
            children.splice(pos, 0, _newNode._id); //把新节点的ID插入到父节点中
            _context4.next = 10;
            return regeneratorRuntime.awrap(db.updateAsync({ _id: pNode._id }, pNode, {}));

          case 10:
            return _context4.abrupt('return', _newNode);

          case 11:
          case 'end':
            return _context4.stop();
        }
      }
    }, null, _this4);
  }();
}

//返回新节点
function _mk_son_by_name(pNode, name, bgid) {
  var _this5 = this;

  return function _callee5() {
    var newNode, _newNode, pos, children;

    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            // console.log(pNode);
            newNode = {
              _link: {
                p: pNode._id,
                children: []
              },
              _name: name
            };
            _context5.next = 3;
            return regeneratorRuntime.awrap(db.insertAsync(newNode));

          case 3:
            _newNode = _context5.sent;
            //插入新节点
            pos = 0;
            children = pNode._link.children;

            if (bgid) {
              pos = children.indexOf(bgid) + 1;
            }
            children.splice(pos, 0, _newNode._id); //把新节点的ID插入到父节点中
            _context5.next = 10;
            return regeneratorRuntime.awrap(db.updateAsync({ _id: pNode._id }, pNode, {}));

          case 10:
            return _context5.abrupt('return', _newNode);

          case 11:
          case 'end':
            return _context5.stop();
        }
      }
    }, null, _this5);
  }();
}

//返回新节点
function mk_son_by_data(pgid, data) {
  var _this6 = this;

  return function _callee6() {
    var pNode;
    return regeneratorRuntime.async(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return regeneratorRuntime.awrap(db.findOneAsync({ "_id": pgid }));

          case 2:
            pNode = _context6.sent;

            if (pNode) {
              _context6.next = 6;
              break;
            }

            throw 'cannot find parent node ' + pgid;

          case 6:
            return _context6.abrupt('return', _mk_son_by_data(pNode, data));

          case 7:
          case 'end':
            return _context6.stop();
        }
      }
    }, null, _this6);
  }();
}

function mk_son_by_name(pgid, name) {
  var _this7 = this;

  return function _callee7() {
    var pNode, node;
    return regeneratorRuntime.async(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return regeneratorRuntime.awrap(db.findOneAsync({ "_id": pgid }));

          case 2:
            pNode = _context7.sent;

            if (pNode) {
              _context7.next = 6;
              break;
            }

            throw 'cannot find parent node ' + pgid;

          case 6:
            _context7.next = 8;
            return regeneratorRuntime.awrap(db.findOneAsync({ "_name": name, "_link.p": pgid }));

          case 8:
            node = _context7.sent;

            if (!node) {
              _context7.next = 11;
              break;
            }

            return _context7.abrupt('return', node);

          case 11:
            return _context7.abrupt('return', _mk_son_by_name(pNode, name));

          case 12:
          case 'end':
            return _context7.stop();
        }
      }
    }, null, _this7);
  }();
}

function mk_brother_by_data(bgid, data) {
  var _this8 = this;

  return function _callee8() {
    var pNode;
    return regeneratorRuntime.async(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return regeneratorRuntime.awrap(db.findOneAsync({ "_link.children": { $elemMatch: bgid } }));

          case 2:
            pNode = _context8.sent;

            if (pNode) {
              _context8.next = 6;
              break;
            }

            throw 'cannot find parent node of brother ' + bgid;

          case 6:
            return _context8.abrupt('return', _mk_son_by_data(pNode, data, bgid));

          case 7:
          case 'end':
            return _context8.stop();
        }
      }
    }, null, _this8);
  }();
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
  var _this9 = this;

  return function _callee9() {
    var node;
    return regeneratorRuntime.async(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return regeneratorRuntime.awrap(update(db, { _id: gid }, { $set: { _data: data } }));

          case 2:
            node = _context9.sent;
            return _context9.abrupt('return', node);

          case 4:
          case 'end':
            return _context9.stop();
        }
      }
    }, null, _this9);
  }();
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
  var _this10 = this;

  return function _callee10() {
    var node, gidsforRemove, rm;
    return regeneratorRuntime.async(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!(gid == '0')) {
              _context10.next = 2;
              break;
            }

            return _context10.abrupt('return');

          case 2:
            _context10.next = 4;
            return regeneratorRuntime.awrap(read_node(gid));

          case 4:
            node = _context10.sent;

            if (node) {
              _context10.next = 7;
              break;
            }

            return _context10.abrupt('return');

          case 7:
            //已经不存在，返回
            //收集所有子节点
            gidsforRemove = [];

            rm = function rm(node) {
              gidsforRemove.push(node._id);
            };

            _context10.next = 11;
            return regeneratorRuntime.awrap(_traversal_all_children([gid], rm));

          case 11:
            _context10.next = 13;
            return regeneratorRuntime.awrap(db.updateAsync({ _id: { $in: gidsforRemove } }, { $set: { _rm: true } }, {}));

          case 13:
            _context10.next = 15;
            return regeneratorRuntime.awrap(db.updateAsync({ _id: node._link.p }, { $pull: { "_link.children": gid } }, {}));

          case 15:
            return _context10.abrupt('return', gidsforRemove);

          case 16:
          case 'end':
            return _context10.stop();
        }
      }
    }, null, _this10);
  }();
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
  var _this11 = this;

  return function _callee11() {
    var gidIsAncestorOfNewParentNode, pNode, pos, children;
    return regeneratorRuntime.async(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return regeneratorRuntime.awrap(_isAncestor(gid, npNode._id));

          case 2:
            gidIsAncestorOfNewParentNode = _context11.sent;

            if (!gidIsAncestorOfNewParentNode) {
              _context11.next = 6;
              break;
            }

            console.log(gid, 'is ancestor of', npNode._id);
            return _context11.abrupt('return', null);

          case 6:
            _context11.next = 8;
            return regeneratorRuntime.awrap(db.findOneAsync({ "_link.children": { $elemMatch: gid } }));

          case 8:
            pNode = _context11.sent;
            _context11.next = 11;
            return regeneratorRuntime.awrap(db.updateAsync({ _id: pNode._id }, { $pull: { "_link.children": gid } }, {}));

          case 11:
            if (!(npNode._id === pNode._id)) {
              _context11.next = 17;
              break;
            }

            _context11.next = 14;
            return regeneratorRuntime.awrap(db.findOneAsync({ _id: npNode._id, _rm: { $exists: false } }));

          case 14:
            npNode = _context11.sent;
            _context11.next = 19;
            break;

          case 17:
            _context11.next = 19;
            return regeneratorRuntime.awrap(db.updateAsync({ _id: gid }, { $set: { "_link.p": npNode._id } }, {}));

          case 19:
            //改变gid的父节点为新父节点
            pos = 0;
            children = npNode._link.children;

            if (bgid) {
              pos = children.indexOf(bgid) + 1;
            }
            children.splice(pos, 0, gid); //把新节点的ID插入到父节点中
            _context11.next = 25;
            return regeneratorRuntime.awrap(db.updateAsync({ _id: npNode._id }, npNode, {}));

          case 25:
            _context11.next = 27;
            return regeneratorRuntime.awrap(read_node(gid));

          case 27:
            return _context11.abrupt('return', _context11.sent);

          case 28:
          case 'end':
            return _context11.stop();
        }
      }
    }, null, _this11);
  }();
}

//把gid节点移动为pgid的子节点
//包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
//移动前需要做检查。祖先节点不能移动为后辈的子节点
function move_as_son(gid, pgid) {
  var _this12 = this;

  return function _callee12() {
    var npNode;
    return regeneratorRuntime.async(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return regeneratorRuntime.awrap(db.findOneAsync({ "_id": pgid }));

          case 2:
            npNode = _context12.sent;
            return _context12.abrupt('return', _move_as_son(gid, npNode));

          case 4:
          case 'end':
            return _context12.stop();
        }
      }
    }, null, _this12);
  }();
}

function move_as_brother(gid, bgid) {
  var _this13 = this;

  return function _callee13() {
    var npNode;
    return regeneratorRuntime.async(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return regeneratorRuntime.awrap(db.findOneAsync({ "_link.children": { $elemMatch: bgid } }));

          case 2:
            npNode = _context13.sent;
            return _context13.abrupt('return', _move_as_son(gid, npNode, bgid));

          case 4:
          case 'end':
            return _context13.stop();
        }
      }
    }, null, _this13);
  }();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1uZWRiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQSxJQUFJLFVBQVUsUUFBUSxVQUFSLENBQVY7O0FBR0osSUFBSSxFQUFKO0FBQ0EsU0FBUyxTQUFULENBQW1CLEdBQW5CLEVBQXVCLEVBQXZCLEVBQTBCO0FBQ3hCLE9BQUcsUUFBUSxZQUFSLENBQXFCLEdBQXJCLENBQUgsQ0FEd0I7QUFFeEIsc0JBQW9CLEVBQXBCLEVBRndCO0FBR3hCLFNBQU87QUFDTCx3QkFESztBQUVMLDBCQUZLO0FBR0wsa0NBSEs7QUFJTCxrQ0FKSztBQUtMLDBDQUxLO0FBTUwsNEJBTks7QUFPTCxrQkFQSztBQVFMLDRCQVJLO0FBU0wsb0NBVEs7O0FBV0wsNENBWEs7R0FBUCxDQUh3QjtDQUExQjs7QUFrQkEsT0FBTyxPQUFQLEdBQWUsU0FBZjs7QUFFQSxTQUFTLG1CQUFULENBQTZCLEVBQTdCLEVBQWdDOzs7QUFDOUIsU0FBTyxnQkFBQzs7Ozs7Ozs0Q0FDUyxHQUFHLFlBQUgsQ0FBZ0IsRUFBQyxLQUFJLEdBQUosRUFBakI7OztBQUFYOztnQkFDQTs7Ozs7QUFDRSwwQkFBWTtBQUNkLG1CQUFJLEdBQUo7QUFDQSxxQkFBTztBQUNMLG1CQUFHLEdBQUg7QUFDQSwwQkFBVSxFQUFWO2VBRkY7Ozs0Q0FLUyxHQUFHLFdBQUgsQ0FBZSxXQUFmOzs7QUFBWDs7O0FBRUYsZ0JBQUcsT0FBTyxFQUFQLElBQVksVUFBWixFQUF1QjtBQUN4QjtBQUR3QixhQUExQjs2Q0FHTzs7Ozs7Ozs7R0FmRCxFQUFSLENBRDhCO0NBQWhDOztBQW9CQSxTQUFTLFNBQVQsQ0FBbUIsR0FBbkIsRUFBd0I7OztBQUN0QixTQUFPLGlCQUFDOzs7Ozs7OzRDQUVTLEdBQUcsWUFBSCxDQUFnQixFQUFDLEtBQUksR0FBSixFQUFTLEtBQUssRUFBRSxTQUFTLEtBQVQsRUFBUCxFQUExQjs7O0FBQVg7OENBQ0c7Ozs7Ozs7O0dBSEQsRUFBUixDQURzQjtDQUF4Qjs7QUFRQSxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEI7OztBQUN4QixTQUFPLGlCQUFDOzs7Ozs7OzRDQUNVLEdBQUcsU0FBSCxDQUFhLEVBQUMsS0FBSSxFQUFDLEtBQUksSUFBSixFQUFMLEVBQWUsS0FBSyxFQUFFLFNBQVMsS0FBVCxFQUFQLEVBQTdCOzs7QUFBWjs4Q0FDRzs7Ozs7Ozs7R0FGRCxFQUFSLENBRHdCO0NBQTFCOztBQU9BLFNBQVMsZUFBVCxDQUF5QixLQUF6QixFQUErQixJQUEvQixFQUFvQyxJQUFwQyxFQUF5Qzs7O0FBQ3ZDLFNBQU8saUJBQUM7Ozs7Ozs7O0FBRUYsc0JBQVE7QUFDUixxQkFBTztBQUNMLG1CQUFHLE1BQU0sR0FBTjtBQUNILDBCQUFVLEVBQVY7ZUFGRjtBQUlBLHFCQUFNLElBQU47Ozs0Q0FFZ0IsR0FBRyxXQUFILENBQWUsT0FBZjs7O0FBQWhCOztBQUNBLGtCQUFJO0FBQ0osdUJBQVMsTUFBTSxLQUFOLENBQVksUUFBWjs7QUFDYixnQkFBRyxJQUFILEVBQVE7QUFDTixvQkFBSSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsSUFBdUIsQ0FBdkIsQ0FERTthQUFSO0FBR0EscUJBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFvQixDQUFwQixFQUFzQixTQUFTLEdBQVQsQ0FBdEI7OzRDQUNNLEdBQUcsV0FBSCxDQUFlLEVBQUMsS0FBSSxNQUFNLEdBQU4sRUFBcEIsRUFBZ0MsS0FBaEMsRUFBdUMsRUFBdkM7Ozs4Q0FDQzs7Ozs7Ozs7R0FqQkQsRUFBUixDQUR1QztDQUF6Qzs7O0FBc0JBLFNBQVMsZUFBVCxDQUF5QixLQUF6QixFQUErQixJQUEvQixFQUFvQyxJQUFwQyxFQUF5Qzs7O0FBQ3ZDLFNBQU8saUJBQUM7Ozs7Ozs7O0FBRUYsc0JBQVE7QUFDUixxQkFBTztBQUNMLG1CQUFHLE1BQU0sR0FBTjtBQUNILDBCQUFVLEVBQVY7ZUFGRjtBQUlBLHFCQUFNLElBQU47Ozs0Q0FFZ0IsR0FBRyxXQUFILENBQWUsT0FBZjs7O0FBQWhCOztBQUNBLGtCQUFJO0FBQ0osdUJBQVMsTUFBTSxLQUFOLENBQVksUUFBWjs7QUFDYixnQkFBRyxJQUFILEVBQVE7QUFDTixvQkFBSSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsSUFBdUIsQ0FBdkIsQ0FERTthQUFSO0FBR0EscUJBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFvQixDQUFwQixFQUFzQixTQUFTLEdBQVQsQ0FBdEI7OzRDQUNNLEdBQUcsV0FBSCxDQUFlLEVBQUMsS0FBSSxNQUFNLEdBQU4sRUFBcEIsRUFBZ0MsS0FBaEMsRUFBdUMsRUFBdkM7Ozs4Q0FDQzs7Ozs7Ozs7R0FqQkQsRUFBUixDQUR1QztDQUF6Qzs7O0FBc0JBLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQzs7O0FBQ2xDLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1UsR0FBRyxZQUFILENBQWdCLEVBQUMsT0FBTSxJQUFOLEVBQWpCOzs7QUFBWjs7Z0JBQ0E7Ozs7O2tCQUNLLDZCQUEyQixJQUEzQjs7OzhDQUdGLGdCQUFnQixLQUFoQixFQUFzQixJQUF0Qjs7Ozs7Ozs7R0FORCxFQUFSLENBRGtDO0NBQXBDOztBQVdBLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQzs7O0FBQ2xDLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1UsR0FBRyxZQUFILENBQWdCLEVBQUMsT0FBTSxJQUFOLEVBQWpCOzs7QUFBWjs7Z0JBQ0E7Ozs7O2tCQUNLLDZCQUEyQixJQUEzQjs7Ozs0Q0FHTSxHQUFHLFlBQUgsQ0FBZ0IsRUFBQyxTQUFRLElBQVIsRUFBYSxXQUFVLElBQVYsRUFBOUI7OztBQUFYOztpQkFDRDs7Ozs7OENBQ007Ozs4Q0FFRixnQkFBZ0IsS0FBaEIsRUFBc0IsSUFBdEI7Ozs7Ozs7O0dBVkQsRUFBUixDQURrQztDQUFwQzs7QUFlQSxTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWlDLElBQWpDLEVBQXVDOzs7QUFDckMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVSxHQUFHLFlBQUgsQ0FBZ0IsRUFBQyxrQkFBaUIsRUFBQyxZQUFXLElBQVgsRUFBbEIsRUFBakI7OztBQUFaOztnQkFDQTs7Ozs7a0JBQ0ssd0NBQXNDLElBQXRDOzs7OENBR0YsZ0JBQWdCLEtBQWhCLEVBQXNCLElBQXRCLEVBQTJCLElBQTNCOzs7Ozs7OztHQU5ELEVBQVIsQ0FEcUM7Q0FBdkM7O0FBWUEsU0FBUyxPQUFULENBQWlCLEVBQWpCLEVBQW9CLEtBQXBCLEVBQTBCLE1BQTFCLEVBQWlDLFFBQWpDLEVBQTBDO0FBQ3RDLE1BQUksS0FBRyxTQUFILEVBQUcsQ0FBUyxHQUFULEVBQWMsV0FBZCxFQUEyQixpQkFBM0IsRUFBOEMsTUFBOUMsRUFBcUQ7QUFDMUQsYUFBUyxHQUFULEVBQWEsaUJBQWI7QUFEMEQsR0FBckQsQ0FEK0I7QUFJdEMsTUFBSSxVQUFRLEVBQUUsT0FBTyxLQUFQLEVBQWEsbUJBQWtCLElBQWxCLEVBQXZCLENBSmtDO0FBS3RDLEtBQUcsTUFBSCxDQUFVLEtBQVYsRUFBaUIsTUFBakIsRUFBeUIsT0FBekIsRUFBaUMsRUFBakMsRUFMc0M7Q0FBMUM7O0FBUUEsSUFBTSxTQUFPLFFBQVEsU0FBUixDQUFrQixPQUFsQixDQUFQOztBQUVOLFNBQVMsV0FBVCxDQUFxQixHQUFyQixFQUEwQixJQUExQixFQUFnQzs7O0FBQzlCLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1MsT0FBTyxFQUFQLEVBQVUsRUFBQyxLQUFJLEdBQUosRUFBWCxFQUFxQixFQUFFLE1BQU0sRUFBRSxPQUFPLElBQVAsRUFBUixFQUF2Qjs7O0FBQVg7OENBQ0c7Ozs7Ozs7O0dBRkQsRUFBUixDQUQ4QjtDQUFoQzs7Ozs7QUFXQSxTQUFTLHVCQUFULENBQWlDLElBQWpDLEVBQXNDLEtBQXRDLEVBQTZDO0FBQzNDLE1BQUksQ0FBQyxJQUFELElBQU8sS0FBSyxNQUFMLElBQWEsQ0FBYixFQUFnQjtBQUFDLFdBQU8sUUFBUSxPQUFSLEVBQVAsQ0FBRDtHQUEzQjtBQUQyQyxTQUVwQyxRQUFRLEdBQVIsQ0FBWSxLQUFLLEdBQUwsQ0FBUyxlQUFPO0FBQ2pDLFdBQU8sVUFBVSxHQUFWLEVBQWUsSUFBZixDQUFvQixnQkFBTTs7QUFDL0IsYUFBTyx3QkFBd0IsS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFvQixLQUE1QyxFQUFtRCxJQUFuRCxDQUF3RCxZQUFJOztBQUNqRSxlQUFPLE1BQU0sSUFBTixDQUFQO0FBRGlFLE9BQUosQ0FBL0QsQ0FEK0I7S0FBTixDQUEzQixDQURpQztHQUFQLENBQXJCLENBQVAsQ0FGMkM7Q0FBN0M7OztBQVlBLFNBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQjs7O0FBQ25CLFNBQU8sa0JBQUM7Ozs7OztrQkFDRixPQUFLLEdBQUw7Ozs7Ozs7Ozs0Q0FDWSxVQUFVLEdBQVY7OztBQUFYOztnQkFDQTs7Ozs7Ozs7OztBQUVBLDRCQUFjOztBQUNaLGlCQUFHLFNBQUgsRUFBRyxDQUFDLElBQUQsRUFBUTtBQUFDLDRCQUFjLElBQWQsQ0FBbUIsS0FBSyxHQUFMLENBQW5CLENBQUQ7YUFBUjs7OzRDQUNILHdCQUF3QixDQUFDLEdBQUQsQ0FBeEIsRUFBOEIsRUFBOUI7Ozs7NENBRUEsR0FBRyxXQUFILENBQWUsRUFBQyxLQUFJLEVBQUMsS0FBSSxhQUFKLEVBQUwsRUFBaEIsRUFBMkMsRUFBRSxNQUFNLEVBQUUsS0FBSSxJQUFKLEVBQVIsRUFBN0MsRUFBb0UsRUFBcEU7Ozs7NENBQ0EsR0FBRyxXQUFILENBQWUsRUFBQyxLQUFJLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBcEIsRUFBb0MsRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEdBQWxCLEVBQVQsRUFBdEMsRUFBMkUsRUFBM0U7OzsrQ0FDQzs7Ozs7Ozs7R0FYRixFQUFSLENBRG1CO0NBQXJCOztBQWdCQSxTQUFTLFdBQVQsQ0FBcUIsSUFBckIsRUFBMEIsR0FBMUIsRUFBOEI7QUFDNUIsTUFBRyxPQUFLLEdBQUwsRUFBUyxPQUFPLFFBQVEsT0FBUixDQUFnQixLQUFoQixDQUFQLENBQVo7QUFENEIsU0FFckIsVUFBVSxHQUFWLEVBQWUsSUFBZixDQUFvQixnQkFBTTs7QUFFL0IsUUFBRyxLQUFLLEtBQUwsQ0FBVyxDQUFYLEtBQWUsSUFBZixFQUFvQjtBQUNyQixhQUFPLElBQVAsQ0FEcUI7S0FBdkIsTUFFSztBQUNILGFBQU8sWUFBWSxJQUFaLEVBQWlCLEtBQUssS0FBTCxDQUFXLENBQVgsQ0FBeEIsQ0FERztLQUZMO0dBRnlCLENBQTNCLENBRjRCO0NBQTlCOztBQVlBLFNBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEyQixNQUEzQixFQUFrQyxJQUFsQyxFQUF1Qzs7O0FBQ3JDLFNBQU8sa0JBQUM7Ozs7Ozs7NENBQ2lDLFlBQVksR0FBWixFQUFnQixPQUFPLEdBQVA7OztBQUFuRDs7aUJBQ0Q7Ozs7O0FBQ0Qsb0JBQVEsR0FBUixDQUFZLEdBQVosRUFBZ0IsZ0JBQWhCLEVBQWlDLE9BQU8sR0FBUCxDQUFqQzsrQ0FDTzs7Ozs0Q0FFTyxHQUFHLFlBQUgsQ0FBZ0IsRUFBQyxrQkFBaUIsRUFBQyxZQUFXLEdBQVgsRUFBbEIsRUFBakI7OztBQUFaOzs0Q0FFRSxHQUFHLFdBQUgsQ0FBZSxFQUFDLEtBQUksTUFBTSxHQUFOLEVBQXBCLEVBQWlDLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixHQUFsQixFQUFULEVBQW5DLEVBQXdFLEVBQXhFOzs7a0JBQ0gsT0FBTyxHQUFQLEtBQWEsTUFBTSxHQUFOOzs7Ozs7NENBQ0QsR0FBRyxZQUFILENBQWdCLEVBQUMsS0FBSSxPQUFPLEdBQVAsRUFBWSxLQUFLLEVBQUUsU0FBUyxLQUFULEVBQVAsRUFBakM7OztBQUFiOzs7Ozs7NENBRU0sR0FBRyxXQUFILENBQWUsRUFBQyxLQUFJLEdBQUosRUFBaEIsRUFBMkIsRUFBRSxNQUFNLEVBQUUsV0FBVyxPQUFPLEdBQVAsRUFBbkIsRUFBN0IsRUFBZ0UsRUFBaEU7Ozs7QUFFSixrQkFBSTtBQUNKLHVCQUFTLE9BQU8sS0FBUCxDQUFhLFFBQWI7O0FBQ2IsZ0JBQUcsSUFBSCxFQUFRO0FBQ04sb0JBQUksU0FBUyxPQUFULENBQWlCLElBQWpCLElBQXVCLENBQXZCLENBREU7YUFBUjtBQUdBLHFCQUFTLE1BQVQsQ0FBZ0IsR0FBaEIsRUFBb0IsQ0FBcEIsRUFBc0IsR0FBdEI7OzRDQUNNLEdBQUcsV0FBSCxDQUFlLEVBQUMsS0FBSSxPQUFPLEdBQVAsRUFBcEIsRUFBaUMsTUFBakMsRUFBeUMsRUFBekM7Ozs7NENBQ08sVUFBVSxHQUFWOzs7Ozs7Ozs7OztHQXJCUCxFQUFSLENBRHFDO0NBQXZDOzs7OztBQTZCQSxTQUFTLFdBQVQsQ0FBcUIsR0FBckIsRUFBMEIsSUFBMUIsRUFBZ0M7OztBQUM5QixTQUFPLGtCQUFDOzs7Ozs7OzRDQUNXLEdBQUcsWUFBSCxDQUFnQixFQUFDLE9BQU0sSUFBTixFQUFqQjs7O0FBQWI7K0NBQ0csYUFBYSxHQUFiLEVBQWlCLE1BQWpCOzs7Ozs7OztHQUZELEVBQVIsQ0FEOEI7Q0FBaEM7O0FBT0EsU0FBUyxlQUFULENBQXlCLEdBQXpCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxrQkFBQzs7Ozs7Ozs0Q0FDVyxHQUFHLFlBQUgsQ0FBZ0IsRUFBQyxrQkFBaUIsRUFBQyxZQUFXLElBQVgsRUFBbEIsRUFBakI7OztBQUFiOytDQUNHLGFBQWEsR0FBYixFQUFpQixNQUFqQixFQUF3QixJQUF4Qjs7Ozs7Ozs7R0FGRCxFQUFSLENBRGtDO0NBQXBDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hc3luYycpO1xuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xudmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5cbnZhciBkYjtcbmZ1bmN0aW9uIHRyZWVfbmVkYihfZGIsY2Ipe1xuICBkYj1Qcm9taXNlLnByb21pc2lmeUFsbChfZGIpO1xuICBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKTtcbiAgcmV0dXJuIHtcbiAgICByZWFkX25vZGUsXG4gICAgcmVhZF9ub2RlcyxcbiAgICBta19zb25fYnlfZGF0YSxcbiAgICBta19zb25fYnlfbmFtZSxcbiAgICBta19icm90aGVyX2J5X2RhdGEsXG4gICAgdXBkYXRlX2RhdGEsXG4gICAgcmVtb3ZlLFxuICAgIG1vdmVfYXNfc29uLFxuICAgIG1vdmVfYXNfYnJvdGhlcixcbiAgICAvL2ZvciB0ZXN0XG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzPXRyZWVfbmVkYjtcblxuZnVuY3Rpb24gYnVpbGRSb290SWZOb3RFeGlzdChjYil7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcm9vdD1hd2FpdCBkYi5maW5kT25lQXN5bmMoe19pZDonMCd9KTtcbiAgICBpZighcm9vdCl7XG4gICAgICB2YXIgZGVmYXVsdFJvb3Q9e1xuICAgICAgICBfaWQ6JzAnLCBcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiAnMCcsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByb290PWF3YWl0IGRiLmluc2VydEFzeW5jKGRlZmF1bHRSb290KTtcbiAgICB9XG4gICAgaWYodHlwZW9mIGNiID09J2Z1bmN0aW9uJyl7XG4gICAgICBjYigpOyAvL+mAmuefpXJvb3TmnoTlu7rlrozmiJBcbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIHJlYWRfbm9kZShnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKCdyZWFkX25vZGUnLGdpZCk7XG4gICAgdmFyIG5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtfaWQ6Z2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pOyAvL3Jt5qCH6K6w6KGo56S66IqC54K55bey57uP6KKr5Yig6ZmkXG4gICAgcmV0dXJuIG5vZGU7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIG5vZGVzPWF3YWl0IGRiLmZpbmRBc3luYyh7X2lkOnskaW46Z2lkc30sX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTtcbiAgICByZXR1cm4gbm9kZXM7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpe1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2cocE5vZGUpO1xuICAgIHZhciBuZXdOb2RlPXtcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiBwTm9kZS5faWQsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH0sXG4gICAgICAgIF9kYXRhOmRhdGFcbiAgICB9O1xuICAgIHZhciBfbmV3Tm9kZT0gYXdhaXQgZGIuaW5zZXJ0QXN5bmMobmV3Tm9kZSkgOy8v5o+S5YWl5paw6IqC54K5XG4gICAgdmFyIHBvcz0wO1xuICAgIHZhciBjaGlsZHJlbj1wTm9kZS5fbGluay5jaGlsZHJlbjtcbiAgICBpZihiZ2lkKXtcbiAgICAgIHBvcz1jaGlsZHJlbi5pbmRleE9mKGJnaWQpKzE7XG4gICAgfVxuICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxfbmV3Tm9kZS5faWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cbiAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOnBOb2RlLl9pZH0sIHBOb2RlLCB7fSk7Ly/mj5LlhaXniLboioLngrlcbiAgICByZXR1cm4gX25ld05vZGU7Ly/ov5Tlm57mlrDoioLngrlcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gX21rX3Nvbl9ieV9uYW1lKHBOb2RlLG5hbWUsYmdpZCl7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhwTm9kZSk7XG4gICAgdmFyIG5ld05vZGU9e1xuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfSxcbiAgICAgICAgX25hbWU6bmFtZVxuICAgIH07XG4gICAgdmFyIF9uZXdOb2RlPSBhd2FpdCBkYi5pbnNlcnRBc3luYyhuZXdOb2RlKTsvL+aPkuWFpeaWsOiKgueCuVxuICAgIHZhciBwb3M9MDtcbiAgICB2YXIgY2hpbGRyZW49cE5vZGUuX2xpbmsuY2hpbGRyZW47XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuICAgIH1cbiAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsX25ld05vZGUuX2lkKTsvL+aKiuaWsOiKgueCueeahElE5o+S5YWl5Yiw54i26IqC54K55LitXG4gICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpwTm9kZS5faWR9LCBwTm9kZSwge30pOy8v5o+S5YWl54i26IqC54K5XG4gICAgcmV0dXJuIF9uZXdOb2RlOy8v6L+U5Zue5paw6IqC54K5XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lQXN5bmMoe1wiX2lkXCI6cGdpZH0pOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9kYXRhKHBOb2RlLGRhdGEpO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtcIl9pZFwiOnBnaWR9KSA7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHZhciBub2RlPWF3YWl0IGRiLmZpbmRPbmVBc3luYyh7XCJfbmFtZVwiOm5hbWUsXCJfbGluay5wXCI6cGdpZH0pOy8v5piv5ZCm5bey5pyJ5ZCM5ZCN6IqC54K5XG4gICAgaWYobm9kZSl7XG4gICAgICByZXR1cm4gbm9kZTsvL+WmguacieebtOaOpei/lOWbnlxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9uYW1lKHBOb2RlLG5hbWUpO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCxkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtcIl9saW5rLmNoaWxkcmVuXCI6eyRlbGVtTWF0Y2g6YmdpZH19KTsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlIG9mIGJyb3RoZXIgJytiZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9kYXRhKHBOb2RlLGRhdGEsYmdpZCk7XG4gIH0pKCk7XG59XG5cblxuZnVuY3Rpb24gX3VwZGF0ZShkYixxdWVyeSx1cGRhdGUsY2FsbGJhY2speyBcbiAgICB2YXIgY2I9ZnVuY3Rpb24oZXJyLCBudW1BZmZlY3RlZCwgYWZmZWN0ZWREb2N1bWVudHMsIHVwc2VydCl7XG4gICAgICBjYWxsYmFjayhlcnIsYWZmZWN0ZWREb2N1bWVudHMpOy8v5L+u5pS5Y2FsbGJhY2vnmoTnrb7lkI3vvIzkvb/lvpfnrKzkuozkuKrlj4LmlbDkuLrmm7TmlrDov4fnmoRkb2NcbiAgICB9O1xuICAgIHZhciBvcHRpb25zPXsgbXVsdGk6IGZhbHNlLHJldHVyblVwZGF0ZWREb2NzOnRydWUgfTtcbiAgICBkYi51cGRhdGUocXVlcnksIHVwZGF0ZSwgb3B0aW9ucyxjYik7XG59XG5cbmNvbnN0IHVwZGF0ZT1Qcm9taXNlLnByb21pc2lmeShfdXBkYXRlKTsvL+S/ruaUuWNhbGxiYWNr562+5ZCN5ZCO5bCx5Y+v5LulcHJvbWlzaWZ5XG5cbmZ1bmN0aW9uIHVwZGF0ZV9kYXRhKGdpZCwgZGF0YSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIG5vZGU9YXdhaXQgdXBkYXRlKGRiLHtfaWQ6Z2lkfSwgeyAkc2V0OiB7IF9kYXRhOiBkYXRhIH0gfSk7Ly/mm7TmlrDoioLngrnlubbov5Tlm57mm7TmlrDlkI7nmoToioLngrlcbiAgICByZXR1cm4gbm9kZTtcbiAgfSkoKTtcbn1cblxuXG4vL+mAkuW9kumBjeWOhuaJgOacieWtkOiKgueCuVxuLy9naWRz5piv6KaB6K6/6Zeu55qE6IqC54K5aWTnmoTliJfooahcbi8vdmlzaXTmmK/kuIDkuKrlh73mlbDjgILorr/pl67oioLngrnnmoTliqjkvZzjgIJcbmZ1bmN0aW9uIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKGdpZHMsdmlzaXQpIHtcbiAgaWYgKCFnaWRzfHxnaWRzLmxlbmd0aD09MCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoKTt9Ly/pnIDopoHov5Tlm57kuIDkuKpwcm9taXNlIFxuICByZXR1cm4gUHJvbWlzZS5hbGwoZ2lkcy5tYXAoZ2lkID0+IHtcbiAgICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57IC8v6K+75Y+W5b2T5YmN6IqC54K5XG4gICAgICByZXR1cm4gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4obm9kZS5fbGluay5jaGlsZHJlbix2aXNpdCkudGhlbigoKT0+eyAvL+iuv+mXruaJgOacieWtkOiKgueCuVxuICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XG4gICAgICB9KVxuICAgIH0pXG4gIH0pKTtcbn1cblxuLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcbmZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgICBpZihnaWQ9PScwJylyZXR1cm47Ly/moLnoioLngrnkuI3og73liKDpmaTjgIJcbiAgICAgdmFyIG5vZGU9YXdhaXQgcmVhZF9ub2RlKGdpZCk7IC8v5YWI6K+75Y+W6KaB5Yig6Zmk55qE6IqC54K5XG4gICAgIGlmKCFub2RlKXJldHVybjsvL+W3sue7j+S4jeWtmOWcqO+8jOi/lOWbnlxuICAgICAvL+aUtumbhuaJgOacieWtkOiKgueCuVxuICAgICB2YXIgZ2lkc2ZvclJlbW92ZT1bXTtcbiAgICAgY29uc3Qgcm09KG5vZGUpPT57Z2lkc2ZvclJlbW92ZS5wdXNoKG5vZGUuX2lkKX07XG4gICAgIGF3YWl0IF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKFtnaWRdLHJtKTtcbiAgICAgLy/mibnph4/liKDpmaRcbiAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDp7JGluOmdpZHNmb3JSZW1vdmV9fSwgIHsgJHNldDogeyBfcm06dHJ1ZSAgfSB9LCB7fSk7Ly/moIforrDkuLrliKDpmaRcbiAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpub2RlLl9saW5rLnB9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4gICAgIHJldHVybiBnaWRzZm9yUmVtb3ZlO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBfaXNBbmNlc3RvcihwZ2lkLGdpZCl7XG4gIGlmKGdpZD09JzAnKXJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyAvLycwJ+S4uuagueiKgueCueOAguS7u+S9leiKgueCuemDveS4jeaYrycwJ+eahOeItuiKgueCuVxuICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57XG4gICAgLy8gY29uc29sZS5sb2coJ2NoZWNrJyxwZ2lkLG5vZGUuX2xpbmsucCxub2RlKVxuICAgIGlmKG5vZGUuX2xpbmsucD09PXBnaWQpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gX2lzQW5jZXN0b3IocGdpZCxub2RlLl9saW5rLnApO1xuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gX21vdmVfYXNfc29uKGdpZCwgbnBOb2RlLGJnaWQpe1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGU9YXdhaXQgX2lzQW5jZXN0b3IoZ2lkLG5wTm9kZS5faWQpO1xuICAgIGlmKGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGUpe1xuICAgICAgY29uc29sZS5sb2coZ2lkLCdpcyBhbmNlc3RvciBvZicsbnBOb2RlLl9pZClcbiAgICAgIHJldHVybiBudWxsOy8v6KaB56e75Yqo55qE6IqC54K55LiN6IO95piv55uu5qCH54i26IqC54K555qE6ZW/6L6I6IqC54K5XG4gICAgfVxuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lQXN5bmMoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpnaWR9fSk7Ly/mib7liLDljp/niLboioLngrlcblxuICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6cE5vZGUuX2lkfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuICAgIGlmKG5wTm9kZS5faWQ9PT1wTm9kZS5faWQpey8v5aaC5p6c5paw55qE54i26IqC54K55LiO5pen55qE54i26IqC54K555u45ZCM44CC6KaB5pu05paw54i26IqC54K5XG4gICAgICBucE5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtfaWQ6bnBOb2RlLl9pZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTsgXG4gICAgfWVsc2V7XG4gICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOmdpZH0sICB7ICRzZXQ6IHsgXCJfbGluay5wXCI6IG5wTm9kZS5faWQgfSB9LCB7fSk7Ly/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcbiAgICB9XG4gICAgdmFyIHBvcz0wO1xuICAgIHZhciBjaGlsZHJlbj1ucE5vZGUuX2xpbmsuY2hpbGRyZW47XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuICAgIH1cbiAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsZ2lkKTsvL+aKiuaWsOiKgueCueeahElE5o+S5YWl5Yiw54i26IqC54K55LitXG4gICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpucE5vZGUuX2lkfSwgbnBOb2RlLCB7fSk7Ly/mj5LlhaXniLboioLngrlcbiAgICByZXR1cm4gYXdhaXQgcmVhZF9ub2RlKGdpZCk7XG4gIH0pKCk7ICBcbn1cblxuLy/miopnaWToioLngrnnp7vliqjkuLpwZ2lk55qE5a2Q6IqC54K5XG4vL+WMheWQqzPmraXjgIIgMS7ku45naWTnmoTljp/niLboioLngrnliKDpmaTjgIIy5pS55Y+YZ2lk55qE5b2T5YmN54i26IqC54K544CCIDPjgILms6jlhozliLDmlrDniLboioLngrlcbi8v56e75Yqo5YmN6ZyA6KaB5YGa5qOA5p+l44CC56WW5YWI6IqC54K55LiN6IO956e75Yqo5Li65ZCO6L6I55qE5a2Q6IqC54K5XG5mdW5jdGlvbiBtb3ZlX2FzX3NvbihnaWQsIHBnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBucE5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtcIl9pZFwiOnBnaWR9KTsvL+aJvuWIsOaWsOeItuiKgueCuVxuICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSk7XG4gIH0pKCk7ICBcbn1cblxuZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lQXN5bmMoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpiZ2lkfX0pOy8v5om+5Yiw5paw54i26IqC54K5XG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlLGJnaWQpO1xuICB9KSgpOyBcbn0iXX0=