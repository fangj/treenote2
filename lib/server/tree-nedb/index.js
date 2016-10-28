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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1uZWRiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBLElBQUksVUFBVSxRQUFRLFVBQVIsQ0FBZDs7QUFHQSxJQUFJLEVBQUo7QUFDQSxTQUFTLFNBQVQsQ0FBbUIsR0FBbkIsRUFBdUIsRUFBdkIsRUFBMEI7QUFDeEIsT0FBRyxRQUFRLFlBQVIsQ0FBcUIsR0FBckIsQ0FBSDtBQUNBLHNCQUFvQixFQUFwQjtBQUNBLFNBQU87QUFDTCx3QkFESztBQUVMLDBCQUZLO0FBR0wsa0NBSEs7QUFJTCxrQ0FKSztBQUtMLDBDQUxLO0FBTUwsNEJBTks7QUFPTCxrQkFQSztBQVFMLDRCQVJLO0FBU0wsb0NBVEs7QUFVTDtBQUNBO0FBWEssR0FBUDtBQWFEOztBQUVELE9BQU8sT0FBUCxHQUFlLFNBQWY7O0FBRUEsU0FBUyxtQkFBVCxDQUE2QixFQUE3QixFQUFnQztBQUFBOztBQUM5QixTQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsNENBQ1MsR0FBRyxZQUFILENBQWdCLEVBQUMsS0FBSSxHQUFMLEVBQWhCLENBRFQ7O0FBQUE7QUFDRixnQkFERTs7QUFBQSxnQkFFRixJQUZFO0FBQUE7QUFBQTtBQUFBOztBQUdBLHVCQUhBLEdBR1k7QUFDZCxtQkFBSSxHQURVO0FBRWQscUJBQU87QUFDTCxtQkFBRyxHQURFO0FBRUwsMEJBQVU7QUFGTDtBQUZPLGFBSFo7QUFBQTtBQUFBLDRDQVVPLEdBQUcsV0FBSCxDQUFlLFdBQWYsQ0FWUDs7QUFBQTtBQVVKLGdCQVZJOztBQUFBO0FBWU4sZ0JBQUcsT0FBTyxFQUFQLElBQVksVUFBZixFQUEwQjtBQUN4QixtQkFEd0IsQ0FDbEI7QUFDUDtBQWRLLDZDQWVDLElBZkQ7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBRCxFQUFQO0FBaUJEOztBQUVELFNBQVMsU0FBVCxDQUFtQixHQUFuQixF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QU0sSUFBUCxFQUFoQixDQURYOztBQUFBO0FBQ0Ysa0JBREU7QUFBQSwrQ0FFQyxhQUFhLEdBQWIsRUFBaUIsTUFBakIsQ0FGRDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFELEVBQVA7QUFJRDs7QUFFRCxTQUFTLGVBQVQsQ0FBeUIsR0FBekIsRUFBOEIsSUFBOUIsRUFBb0M7QUFBQTs7QUFDbEMsU0FBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDRDQUNXLEdBQUcsWUFBSCxDQUFnQixFQUFDLGtCQUFpQixFQUFDLFlBQVcsSUFBWixFQUFsQixFQUFoQixDQURYOztBQUFBO0FBQ0Ysa0JBREU7QUFBQSwrQ0FFQyxhQUFhLEdBQWIsRUFBaUIsTUFBakIsRUFBd0IsSUFBeEIsQ0FGRDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFELEVBQVA7QUFJRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXN5bmMnKTtcclxuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xyXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XHJcblxyXG5cclxudmFyIGRiO1xyXG5mdW5jdGlvbiB0cmVlX25lZGIoX2RiLGNiKXtcclxuICBkYj1Qcm9taXNlLnByb21pc2lmeUFsbChfZGIpO1xyXG4gIGJ1aWxkUm9vdElmTm90RXhpc3QoY2IpO1xyXG4gIHJldHVybiB7XHJcbiAgICByZWFkX25vZGUsXHJcbiAgICByZWFkX25vZGVzLFxyXG4gICAgbWtfc29uX2J5X2RhdGEsXHJcbiAgICBta19zb25fYnlfbmFtZSxcclxuICAgIG1rX2Jyb3RoZXJfYnlfZGF0YSxcclxuICAgIHVwZGF0ZV9kYXRhLFxyXG4gICAgcmVtb3ZlLFxyXG4gICAgbW92ZV9hc19zb24sXHJcbiAgICBtb3ZlX2FzX2Jyb3RoZXIsXHJcbiAgICAvL2ZvciB0ZXN0XHJcbiAgICBidWlsZFJvb3RJZk5vdEV4aXN0XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz10cmVlX25lZGI7XHJcblxyXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICB2YXIgcm9vdD1hd2FpdCBkYi5maW5kT25lQXN5bmMoe19pZDonMCd9KTtcclxuICAgIGlmKCFyb290KXtcclxuICAgICAgdmFyIGRlZmF1bHRSb290PXtcclxuICAgICAgICBfaWQ6JzAnLCBcclxuICAgICAgICBfbGluazoge1xyXG4gICAgICAgICAgcDogJzAnLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICByb290PWF3YWl0IGRiLmluc2VydEFzeW5jKGRlZmF1bHRSb290KTtcclxuICAgIH1cclxuICAgIGlmKHR5cGVvZiBjYiA9PSdmdW5jdGlvbicpe1xyXG4gICAgICBjYigpOyAvL+mAmuefpXJvb3TmnoTlu7rlrozmiJBcclxuICAgIH1cclxuICAgIHJldHVybiByb290O1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRfbm9kZShnaWQpIHtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICAvLyBjb25zb2xlLmxvZygncmVhZF9ub2RlJyxnaWQpO1xyXG4gICAgdmFyIG5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtfaWQ6Z2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pOyAvL3Jt5qCH6K6w6KGo56S66IqC54K55bey57uP6KKr5Yig6ZmkXHJcbiAgICByZXR1cm4gbm9kZTtcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICB2YXIgbm9kZXM9YXdhaXQgZGIuZmluZEFzeW5jKHtfaWQ6eyRpbjpnaWRzfSxfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pO1xyXG4gICAgcmV0dXJuIG5vZGVzO1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpe1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgIC8vIGNvbnNvbGUubG9nKHBOb2RlKTtcclxuICAgIHZhciBuZXdOb2RlPXtcclxuICAgICAgICBfbGluazoge1xyXG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBfZGF0YTpkYXRhXHJcbiAgICB9O1xyXG4gICAgdmFyIF9uZXdOb2RlPSBhd2FpdCBkYi5pbnNlcnRBc3luYyhuZXdOb2RlKSA7Ly/mj5LlhaXmlrDoioLngrlcclxuICAgIHZhciBwb3M9MDtcclxuICAgIHZhciBjaGlsZHJlbj1wTm9kZS5fbGluay5jaGlsZHJlbjtcclxuICAgIGlmKGJnaWQpe1xyXG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xyXG4gICAgfVxyXG4gICAgY2hpbGRyZW4uc3BsaWNlKHBvcywwLF9uZXdOb2RlLl9pZCk7Ly/miormlrDoioLngrnnmoRJROaPkuWFpeWIsOeItuiKgueCueS4rVxyXG4gICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpwTm9kZS5faWR9LCBwTm9kZSwge30pOy8v5o+S5YWl54i26IqC54K5XHJcbiAgICByZXR1cm4gX25ld05vZGU7Ly/ov5Tlm57mlrDoioLngrlcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfbWtfc29uX2J5X25hbWUocE5vZGUsbmFtZSxiZ2lkKXtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICAvLyBjb25zb2xlLmxvZyhwTm9kZSk7XHJcbiAgICB2YXIgbmV3Tm9kZT17XHJcbiAgICAgICAgX2xpbms6IHtcclxuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX25hbWU6bmFtZVxyXG4gICAgfTtcclxuICAgIHZhciBfbmV3Tm9kZT0gYXdhaXQgZGIuaW5zZXJ0QXN5bmMobmV3Tm9kZSk7Ly/mj5LlhaXmlrDoioLngrlcclxuICAgIHZhciBwb3M9MDtcclxuICAgIHZhciBjaGlsZHJlbj1wTm9kZS5fbGluay5jaGlsZHJlbjtcclxuICAgIGlmKGJnaWQpe1xyXG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xyXG4gICAgfVxyXG4gICAgY2hpbGRyZW4uc3BsaWNlKHBvcywwLF9uZXdOb2RlLl9pZCk7Ly/miormlrDoioLngrnnmoRJROaPkuWFpeWIsOeItuiKgueCueS4rVxyXG4gICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpwTm9kZS5faWR9LCBwTm9kZSwge30pOy8v5o+S5YWl54i26IqC54K5XHJcbiAgICByZXR1cm4gX25ld05vZGU7Ly/ov5Tlm57mlrDoioLngrlcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmVBc3luYyh7XCJfaWRcIjpwZ2lkfSk7Ly/mib7liLDniLboioLngrlcclxuICAgIGlmKCFwTm9kZSl7XHJcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcclxuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXHJcbiAgICB9XHJcbiAgICByZXR1cm4gX21rX3Nvbl9ieV9kYXRhKHBOb2RlLGRhdGEpO1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1rX3Nvbl9ieV9uYW1lKHBnaWQsIG5hbWUpIHtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtcIl9pZFwiOnBnaWR9KSA7Ly/mib7liLDniLboioLngrlcclxuICAgIGlmKCFwTm9kZSl7XHJcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcclxuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXHJcbiAgICB9XHJcbiAgICB2YXIgbm9kZT1hd2FpdCBkYi5maW5kT25lQXN5bmMoe1wiX25hbWVcIjpuYW1lLFwiX2xpbmsucFwiOnBnaWR9KTsvL+aYr+WQpuW3suacieWQjOWQjeiKgueCuVxyXG4gICAgaWYobm9kZSl7XHJcbiAgICAgIHJldHVybiBub2RlOy8v5aaC5pyJ55u05o6l6L+U5ZueXHJcbiAgICB9XHJcbiAgICByZXR1cm4gX21rX3Nvbl9ieV9uYW1lKHBOb2RlLG5hbWUpO1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLGRhdGEpIHtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtcIl9saW5rLmNoaWxkcmVuXCI6eyRlbGVtTWF0Y2g6YmdpZH19KTsvL+aJvuWIsOeItuiKgueCuVxyXG4gICAgaWYoIXBOb2RlKXtcclxuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XHJcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpO1xyXG4gIH0pKCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBfdXBkYXRlKGRiLHF1ZXJ5LHVwZGF0ZSxjYWxsYmFjayl7IFxyXG4gICAgdmFyIGNiPWZ1bmN0aW9uKGVyciwgbnVtQWZmZWN0ZWQsIGFmZmVjdGVkRG9jdW1lbnRzLCB1cHNlcnQpe1xyXG4gICAgICBjYWxsYmFjayhlcnIsYWZmZWN0ZWREb2N1bWVudHMpOy8v5L+u5pS5Y2FsbGJhY2vnmoTnrb7lkI3vvIzkvb/lvpfnrKzkuozkuKrlj4LmlbDkuLrmm7TmlrDov4fnmoRkb2NcclxuICAgIH07XHJcbiAgICB2YXIgb3B0aW9ucz17IG11bHRpOiBmYWxzZSxyZXR1cm5VcGRhdGVkRG9jczp0cnVlIH07XHJcbiAgICBkYi51cGRhdGUocXVlcnksIHVwZGF0ZSwgb3B0aW9ucyxjYik7XHJcbn1cclxuXHJcbmNvbnN0IHVwZGF0ZT1Qcm9taXNlLnByb21pc2lmeShfdXBkYXRlKTsvL+S/ruaUuWNhbGxiYWNr562+5ZCN5ZCO5bCx5Y+v5LulcHJvbWlzaWZ5XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVfZGF0YShnaWQsIGRhdGEpIHtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICB2YXIgbm9kZT1hd2FpdCB1cGRhdGUoZGIse19pZDpnaWR9LCB7ICRzZXQ6IHsgX2RhdGE6IGRhdGEgfSB9KTsvL+abtOaWsOiKgueCueW5tui/lOWbnuabtOaWsOWQjueahOiKgueCuVxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuXHJcbi8v6YCS5b2S6YGN5Y6G5omA5pyJ5a2Q6IqC54K5XHJcbi8vZ2lkc+aYr+imgeiuv+mXrueahOiKgueCuWlk55qE5YiX6KGoXHJcbi8vdmlzaXTmmK/kuIDkuKrlh73mlbDjgILorr/pl67oioLngrnnmoTliqjkvZzjgIJcclxuZnVuY3Rpb24gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oZ2lkcyx2aXNpdCkge1xyXG4gIGlmICghZ2lkc3x8Z2lkcy5sZW5ndGg9PTApIHtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7fS8v6ZyA6KaB6L+U5Zue5LiA5LiqcHJvbWlzZSBcclxuICByZXR1cm4gUHJvbWlzZS5hbGwoZ2lkcy5tYXAoZ2lkID0+IHtcclxuICAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PnsgLy/or7vlj5blvZPliY3oioLngrlcclxuICAgICAgcmV0dXJuIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKG5vZGUuX2xpbmsuY2hpbGRyZW4sdmlzaXQpLnRoZW4oKCk9PnsgLy/orr/pl67miYDmnInlrZDoioLngrlcclxuICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH0pKTtcclxufVxyXG5cclxuLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcclxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgICBpZihnaWQ9PScwJylyZXR1cm47Ly/moLnoioLngrnkuI3og73liKDpmaTjgIJcclxuICAgICB2YXIgbm9kZT1hd2FpdCByZWFkX25vZGUoZ2lkKTsgLy/lhYjor7vlj5bopoHliKDpmaTnmoToioLngrlcclxuICAgICBpZighbm9kZSlyZXR1cm47Ly/lt7Lnu4/kuI3lrZjlnKjvvIzov5Tlm55cclxuICAgICAvL+aUtumbhuaJgOacieWtkOiKgueCuVxyXG4gICAgIHZhciBnaWRzZm9yUmVtb3ZlPVtdO1xyXG4gICAgIGNvbnN0IHJtPShub2RlKT0+e2dpZHNmb3JSZW1vdmUucHVzaChub2RlLl9pZCl9O1xyXG4gICAgIGF3YWl0IF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKFtnaWRdLHJtKTtcclxuICAgICAvL+aJuemHj+WIoOmZpFxyXG4gICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6eyRpbjpnaWRzZm9yUmVtb3ZlfX0sICB7ICRzZXQ6IHsgX3JtOnRydWUgIH0gfSwge30pOy8v5qCH6K6w5Li65Yig6ZmkXHJcbiAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpub2RlLl9saW5rLnB9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXHJcbiAgICAgcmV0dXJuIGdpZHNmb3JSZW1vdmU7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xyXG4gIGlmKGdpZD09JzAnKXJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyAvLycwJ+S4uuagueiKgueCueOAguS7u+S9leiKgueCuemDveS4jeaYrycwJ+eahOeItuiKgueCuVxyXG4gIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PntcclxuICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcclxuICAgIGlmKG5vZGUuX2xpbmsucD09PXBnaWQpe1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1lbHNle1xyXG4gICAgICByZXR1cm4gX2lzQW5jZXN0b3IocGdpZCxub2RlLl9saW5rLnApO1xyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICB2YXIgZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZT1hd2FpdCBfaXNBbmNlc3RvcihnaWQsbnBOb2RlLl9pZCk7XHJcbiAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcclxuICAgICAgY29uc29sZS5sb2coZ2lkLCdpcyBhbmNlc3RvciBvZicsbnBOb2RlLl9pZClcclxuICAgICAgcmV0dXJuIG51bGw7Ly/opoHnp7vliqjnmoToioLngrnkuI3og73mmK/nm67moIfniLboioLngrnnmoTplb/ovojoioLngrlcclxuICAgIH1cclxuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lQXN5bmMoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpnaWR9fSk7Ly/mib7liLDljp/niLboioLngrlcclxuXHJcbiAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOnBOb2RlLl9pZH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSA7Ly/ku47ljp/niLboioLngrnliKDpmaRcclxuICAgIGlmKG5wTm9kZS5faWQ9PT1wTm9kZS5faWQpey8v5aaC5p6c5paw55qE54i26IqC54K55LiO5pen55qE54i26IqC54K555u45ZCM44CC6KaB5pu05paw54i26IqC54K5XHJcbiAgICAgIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lQXN5bmMoe19pZDpucE5vZGUuX2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pOyBcclxuICAgIH1lbHNle1xyXG4gICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOmdpZH0sICB7ICRzZXQ6IHsgXCJfbGluay5wXCI6IG5wTm9kZS5faWQgfSB9LCB7fSk7Ly/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcclxuICAgIH1cclxuICAgIHZhciBwb3M9MDtcclxuICAgIHZhciBjaGlsZHJlbj1ucE5vZGUuX2xpbmsuY2hpbGRyZW47XHJcbiAgICBpZihiZ2lkKXtcclxuICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcclxuICAgIH1cclxuICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxnaWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cclxuICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6bnBOb2RlLl9pZH0sIG5wTm9kZSwge30pOy8v5o+S5YWl54i26IqC54K5XHJcbiAgICByZXR1cm4gYXdhaXQgcmVhZF9ub2RlKGdpZCk7XHJcbiAgfSkoKTsgIFxyXG59XHJcblxyXG4vL+aKimdpZOiKgueCueenu+WKqOS4unBnaWTnmoTlrZDoioLngrlcclxuLy/ljIXlkKsz5q2l44CCIDEu5LuOZ2lk55qE5Y6f54i26IqC54K55Yig6Zmk44CCMuaUueWPmGdpZOeahOW9k+WJjeeItuiKgueCueOAgiAz44CC5rOo5YaM5Yiw5paw54i26IqC54K5XHJcbi8v56e75Yqo5YmN6ZyA6KaB5YGa5qOA5p+l44CC56WW5YWI6IqC54K55LiN6IO956e75Yqo5Li65ZCO6L6I55qE5a2Q6IqC54K5XHJcbmZ1bmN0aW9uIG1vdmVfYXNfc29uKGdpZCwgcGdpZCkge1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgIHZhciBucE5vZGU9YXdhaXQgZGIuZmluZE9uZUFzeW5jKHtcIl9pZFwiOnBnaWR9KTsvL+aJvuWIsOaWsOeItuiKgueCuVxyXG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlKTtcclxuICB9KSgpOyAgXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdmVfYXNfYnJvdGhlcihnaWQsIGJnaWQpIHtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICB2YXIgbnBOb2RlPWF3YWl0IGRiLmZpbmRPbmVBc3luYyh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmJnaWR9fSk7Ly/mib7liLDmlrDniLboioLngrlcclxuICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSxiZ2lkKTtcclxuICB9KSgpOyBcclxufSJdfQ==