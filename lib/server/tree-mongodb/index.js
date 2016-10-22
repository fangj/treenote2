"use strict";

// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
// var Promise = require('bluebird');

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
    move_as_son: move_as_son,
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
  return db.findOne({ "_link.children": sgid });
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
            return _context.abrupt("return", root);

          case 9:
          case "end":
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
            return regeneratorRuntime.awrap(_insertChildrenAsync(pNode, newNode._id, bgid));

          case 7:
            return _context2.abrupt("return", newNode);

          case 8:
          case "end":
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
            return _context3.abrupt("return", _mk_son_by_kv(pNode, "_data", data));

          case 7:
          case "end":
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

            return _context4.abrupt("return", node);

          case 11:
            return _context4.abrupt("return", _mk_son_by_kv(pNode, "_name", name));

          case 12:
          case "end":
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
            return regeneratorRuntime.awrap(findParentAsync(bgid));

          case 2:
            pNode = _context5.sent;

            if (pNode) {
              _context5.next = 6;
              break;
            }

            throw 'cannot find parent node of brother ' + bgid;

          case 6:
            return _context5.abrupt("return", _mk_son_by_kv(pNode, "_data", data, bgid));

          case 7:
          case "end":
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

            return _context6.abrupt("return");

          case 2:
            _context6.next = 4;
            return regeneratorRuntime.awrap(read_node(gid));

          case 4:
            node = _context6.sent;

            if (node) {
              _context6.next = 7;
              break;
            }

            return _context6.abrupt("return");

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
            return _context6.abrupt("return", gidsforRemove);

          case 16:
          case "end":
            return _context6.stop();
        }
      }
    }, null, _this6);
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
            _context7.next = 11;
            return regeneratorRuntime.awrap(db.updateOne({ _id: pNode._id }, { $pull: { "_link.children": gid } }, {}));

          case 11:
            if (!(npNode._id !== pNode._id)) {
              _context7.next = 14;
              break;
            }

            _context7.next = 14;
            return regeneratorRuntime.awrap(db.updateOne({ _id: gid }, { $set: { "_link.p": npNode._id } }, {}));

          case 14:
            _context7.next = 16;
            return regeneratorRuntime.awrap(_insertChildrenAsync(npNode, gid, bgid));

          case 16:
            _context7.next = 18;
            return regeneratorRuntime.awrap(read_node(gid));

          case 18:
            return _context7.abrupt("return", _context7.sent);

          case 19:
          case "end":
            return _context7.stop();
        }
      }
    }, null, _this7);
  }();
}

// //把gid节点移动为pgid的子节点
// //包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
// //移动前需要做检查。祖先节点不能移动为后辈的子节点
function move_as_son(gid, pgid) {
  var _this8 = this;

  return function _callee8() {
    var npNode;
    return regeneratorRuntime.async(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return regeneratorRuntime.awrap(read_node(pgid));

          case 2:
            npNode = _context8.sent;
            return _context8.abrupt("return", _move_as_son(gid, npNode));

          case 4:
          case "end":
            return _context8.stop();
        }
      }
    }, null, _this8);
  }();
}

function move_as_brother(gid, bgid) {
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
            return _context9.abrupt("return", _move_as_son(gid, npNode, bgid));

          case 4:
          case "end":
            return _context9.stop();
        }
      }
    }, null, _this9);
  }();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUlBLElBQUksRUFBSjtBQUNBLFNBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEwQixFQUExQixFQUE2Qjs7QUFFM0IsT0FBRyxHQUFILENBRjJCO0FBRzNCLHdCQUFzQixJQUF0QixDQUEyQixPQUFRLEVBQVAsS0FBYSxVQUFiLEdBQXlCLElBQTFCLEdBQStCLElBQS9CLENBQTNCO0FBSDJCLFNBSXBCO0FBQ0wsd0JBREs7QUFFTCwwQkFGSztBQUdMLGtDQUhLO0FBSUwsa0NBSks7QUFLTCwwQ0FMSztBQU1MLDRCQU5LO0FBT0wsa0JBUEs7QUFRTCw0QkFSSzs7O0FBV0wsNENBWEs7R0FBUCxDQUoyQjtDQUE3Qjs7QUFtQkEsT0FBTyxPQUFQLEdBQWUsWUFBZjs7QUFFQSxJQUFNLGVBQWEsU0FBYixZQUFhLENBQUMsSUFBRCxFQUFRO0FBQ3pCLFNBQU8sR0FBRyxTQUFILENBQWEsSUFBYixFQUFtQixJQUFuQixDQUF3QixlQUFLO0FBQ2xDLFNBQUssR0FBTCxHQUFTLElBQUksVUFBSixDQUR5QjtBQUVsQyxXQUFPLElBQVAsQ0FGa0M7R0FBTCxDQUEvQixDQUR5QjtDQUFSOztBQVFuQixJQUFNLHVCQUFxQixTQUFyQixvQkFBcUIsQ0FBQyxLQUFELEVBQU8sR0FBUCxFQUFXLElBQVgsRUFBa0I7QUFDM0MsTUFBSSxNQUFJLENBQUosQ0FEdUM7QUFFekMsTUFBRyxJQUFILEVBQVE7QUFDTixVQUFJLE1BQU0sS0FBTixDQUFZLFFBQVosQ0FBcUIsT0FBckIsQ0FBNkIsSUFBN0IsSUFBbUMsQ0FBbkMsQ0FERTtHQUFSO0FBR0QsU0FBTyxHQUFHLFNBQUgsQ0FBYSxFQUFDLEtBQUksTUFBTSxHQUFOLEVBQWxCLEVBQThCO0FBQ25DLFdBQU87QUFDSix3QkFBa0I7QUFDZixlQUFPLENBQUMsR0FBRCxDQUFQO0FBQ0EsbUJBQVcsR0FB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OEQsRUFBOUQ7Ozs7NENBRUYscUJBQXFCLE1BQXJCLEVBQTRCLEdBQTVCLEVBQWdDLElBQWhDOzs7OzRDQUNPLFVBQVUsR0FBVjs7Ozs7Ozs7Ozs7R0FaUCxFQUFSLENBRHFDO0NBQXZDOzs7OztBQW9CQSxTQUFTLFdBQVQsQ0FBcUIsR0FBckIsRUFBMEIsSUFBMUIsRUFBZ0M7OztBQUM5QixTQUFPLGlCQUFDOzs7Ozs7OzRDQUNXLFVBQVUsSUFBVjs7O0FBQWI7OENBQ0csYUFBYSxHQUFiLEVBQWlCLE1BQWpCOzs7Ozs7OztHQUZELEVBQVIsQ0FEOEI7Q0FBaEM7O0FBT0EsU0FBUyxlQUFULENBQXlCLEdBQXpCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVyxnQkFBZ0IsSUFBaEI7OztBQUFiOzhDQUNHLGFBQWEsR0FBYixFQUFpQixNQUFqQixFQUF3QixJQUF4Qjs7Ozs7Ozs7R0FGRCxFQUFSLENBRGtDO0NBQXBDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hc3luYycpO1xuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xuLy8gdmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG52YXIgZGI7IFxuZnVuY3Rpb24gdHJlZV9tb25nb2RiKF9kYixjYil7XG4gIC8vIGRiPVByb21pc2UucHJvbWlzaWZ5QWxsKF9kYik7XG4gIGRiPV9kYjtcbiAgYnVpbGRSb290SWZOb3RFeGlzdCgpLnRoZW4oKHR5cGVvZiBjYiA9PT0nZnVuY3Rpb24nKT9jYigpOm51bGwpOyAvL2Ni55So5LqO6YCa55+l5rWL6K+V56iL5bqPXG4gIHJldHVybiB7XG4gICAgcmVhZF9ub2RlLFxuICAgIHJlYWRfbm9kZXMsXG4gICAgbWtfc29uX2J5X2RhdGEsXG4gICAgbWtfc29uX2J5X25hbWUsXG4gICAgbWtfYnJvdGhlcl9ieV9kYXRhLFxuICAgIHVwZGF0ZV9kYXRhLFxuICAgIHJlbW92ZSxcbiAgICBtb3ZlX2FzX3NvbixcbiAgICAvLyBtb3ZlX2FzX2Jyb3RoZXIsXG4gICAgLy9mb3IgdGVzdFxuICAgIGJ1aWxkUm9vdElmTm90RXhpc3RcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cz10cmVlX21vbmdvZGI7XG4vL+WGhemDqOW3peWFt+WHveaVsFxuY29uc3QgX2luc2VydEFzeW5jPShub2RlKT0+e1xuICByZXR1cm4gZGIuaW5zZXJ0T25lKG5vZGUpLnRoZW4ocmVzPT57XG4gICAgbm9kZS5faWQ9cmVzLmluc2VydGVkSWQ7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH0pXG59XG5cblxuY29uc3QgX2luc2VydENoaWxkcmVuQXN5bmM9KHBOb2RlLGdpZCxiZ2lkKT0+e1xuICB2YXIgcG9zPTA7XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9cE5vZGUuX2xpbmsuY2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuICAgIH1cbiAgIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCB7XG4gICAgICRwdXNoOiB7XG4gICAgICAgIFwiX2xpbmsuY2hpbGRyZW5cIjoge1xuICAgICAgICAgICAkZWFjaDogW2dpZF0sXG4gICAgICAgICAgICRwb3NpdGlvbjogcG9zXG4gICAgICAgIH1cbiAgICAgfVxuICAgfSk7IFxufVxuXG5jb25zdCBmaW5kUGFyZW50QXN5bmM9KHNnaWQpPT4gZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnNnaWR9KTtcblxuZnVuY3Rpb24gYnVpbGRSb290SWZOb3RFeGlzdChjYil7XG4gIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiKTtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdCBiZWdpblwiKTtcbiAgICB2YXIgcm9vdD1hd2FpdCBkYi5maW5kT25lKHtfaWQ6JzAnfSk7XG4gICAgLy8gY29uc29sZS5sb2coXCJmb3VuZCByb290XCIscm9vdCk7XG4gICAgaWYoIXJvb3Qpe1xuICAgICAgdmFyIGRlZmF1bHRSb290PXtcbiAgICAgICAgX2lkOicwJywgXG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogJzAnLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcm9vdD1hd2FpdCBfaW5zZXJ0QXN5bmMoZGVmYXVsdFJvb3QpO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3RcIixyb290KTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gcmVhZF9ub2RlKGdpZCkge1xuICAvL3Jt5qCH6K6w6KGo56S66IqC54K55bey57uP6KKr5Yig6ZmkXG4gIHJldHVybiBkYi5maW5kT25lKHtfaWQ6Z2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcbiAgcmV0dXJuIGRiLmZpbmQoe19pZDp7JGluOmdpZHN9LF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSkudG9BcnJheSgpO1xufVxuXG5cbmZ1bmN0aW9uIF9ta19zb25fYnlfa3YocE5vZGUsa2V5LHZhbHVlLGJnaWQpe1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2cocE5vZGUpO1xuICAgIHZhciBfbmV3Tm9kZT17XG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgfTtcbiAgICBfbmV3Tm9kZVtrZXldPXZhbHVlO1xuICAgIHZhciBuZXdOb2RlPSBhd2FpdCBfaW5zZXJ0QXN5bmMoX25ld05vZGUpIDsvL+aPkuWFpeaWsOiKgueCuVxuICAgIC8v5o+S5YWl54i26IqC54K5XG4gICAgYXdhaXQgX2luc2VydENoaWxkcmVuQXN5bmMocE5vZGUsbmV3Tm9kZS5faWQsYmdpZCk7XG4gICAgcmV0dXJuIG5ld05vZGU7Ly/ov5Tlm57mlrDoioLngrlcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSk7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9uYW1lKHBnaWQsIG5hbWUpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9pZFwiOnBnaWR9KSA7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHZhciBub2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX25hbWVcIjpuYW1lLFwiX2xpbmsucFwiOnBnaWR9KTsvL+aYr+WQpuW3suacieWQjOWQjeiKgueCuVxuICAgIGlmKG5vZGUpe1xuICAgICAgcmV0dXJuIG5vZGU7Ly/lpoLmnInnm7TmjqXov5Tlm55cbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfbmFtZVwiLG5hbWUpO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCxkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZmluZFBhcmVudEFzeW5jKGJnaWQpOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgb2YgYnJvdGhlciAnK2JnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX2RhdGFcIixkYXRhLGJnaWQpO1xuICB9KSgpO1xufVxuXG5cbi8vIGZ1bmN0aW9uIF91cGRhdGUoZGIscXVlcnksdXBkYXRlLGNhbGxiYWNrKXsgXG4vLyAgICAgdmFyIGNiPWZ1bmN0aW9uKGVyciwgbnVtQWZmZWN0ZWQsIGFmZmVjdGVkRG9jdW1lbnRzLCB1cHNlcnQpe1xuLy8gICAgICAgY2FsbGJhY2soZXJyLGFmZmVjdGVkRG9jdW1lbnRzKTsvL+S/ruaUuWNhbGxiYWNr55qE562+5ZCN77yM5L2/5b6X56ys5LqM5Liq5Y+C5pWw5Li65pu05paw6L+H55qEZG9jXG4vLyAgICAgfTtcbi8vICAgICB2YXIgb3B0aW9ucz17IG11bHRpOiBmYWxzZSxyZXR1cm5VcGRhdGVkRG9jczp0cnVlIH07XG4vLyAgICAgZGIudXBkYXRlKHF1ZXJ5LCB1cGRhdGUsIG9wdGlvbnMsY2IpO1xuLy8gfVxuXG4vLyBjb25zdCB1cGRhdGU9UHJvbWlzZS5wcm9taXNpZnkoX3VwZGF0ZSk7Ly/kv67mlLljYWxsYmFja+etvuWQjeWQjuWwseWPr+S7pXByb21pc2lmeVxuXG5mdW5jdGlvbiB1cGRhdGVfZGF0YShnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIGRiLnVwZGF0ZU9uZSh7X2lkOmdpZH0sIHsgJHNldDogeyBfZGF0YTogZGF0YSB9IH0pXG4gIC50aGVuKF89PmRiLmZpbmRPbmUoe19pZDpnaWR9KSk7XG59XG5cblxuLy/pgJLlvZLpgY3ljobmiYDmnInlrZDoioLngrlcbi8vZ2lkc+aYr+imgeiuv+mXrueahOiKgueCuWlk55qE5YiX6KGoXG4vL3Zpc2l05piv5LiA5Liq5Ye95pWw44CC6K6/6Zeu6IqC54K555qE5Yqo5L2c44CCXG5mdW5jdGlvbiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihnaWRzLHZpc2l0KSB7XG4gIGlmICghZ2lkc3x8Z2lkcy5sZW5ndGg9PTApIHtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7fS8v6ZyA6KaB6L+U5Zue5LiA5LiqcHJvbWlzZSBcbiAgcmV0dXJuIFByb21pc2UuYWxsKGdpZHMubWFwKGdpZCA9PiB7XG4gICAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+eyAvL+ivu+WPluW9k+WJjeiKgueCuVxuICAgICAgcmV0dXJuIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKG5vZGUuX2xpbmsuY2hpbGRyZW4sdmlzaXQpLnRoZW4oKCk9PnsgLy/orr/pl67miYDmnInlrZDoioLngrlcbiAgICAgICAgcmV0dXJuIHZpc2l0KG5vZGUpOyAvL+eEtuWQjuiuv+mXruW9k+WJjeiKgueCuVxuICAgICAgfSlcbiAgICB9KVxuICB9KSk7XG59XG5cbi8v5qCH6K6w5Yig6Zmk6IqC54K55LiO5omA5pyJ5a2Q5a2Z6IqC54K5XG5mdW5jdGlvbiByZW1vdmUoZ2lkKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAgaWYoZ2lkPT09JzAnKXJldHVybjsvL+agueiKgueCueS4jeiDveWIoOmZpOOAglxuICAgICB2YXIgbm9kZT1hd2FpdCByZWFkX25vZGUoZ2lkKTsgLy/lhYjor7vlj5bopoHliKDpmaTnmoToioLngrlcbiAgICAgaWYoIW5vZGUpcmV0dXJuOy8v5bey57uP5LiN5a2Y5Zyo77yM6L+U5ZueXG4gICAgIC8v5pS26ZuG5omA5pyJ5a2Q6IqC54K5XG4gICAgIHZhciBnaWRzZm9yUmVtb3ZlPVtdO1xuICAgICBjb25zdCBybT0obm9kZSk9PntnaWRzZm9yUmVtb3ZlLnB1c2gobm9kZS5faWQpfTtcbiAgICAgYXdhaXQgX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oW2dpZF0scm0pO1xuICAgICAvL+aJuemHj+WIoOmZpFxuICAgICBhd2FpdCBkYi51cGRhdGVNYW55KHtfaWQ6eyRpbjpnaWRzZm9yUmVtb3ZlfX0sICB7ICRzZXQ6IHsgX3JtOnRydWUgIH0gfSwge30pOy8v5qCH6K6w5Li65Yig6ZmkXG4gICAgIGF3YWl0IGRiLnVwZGF0ZU9uZSh7X2lkOm5vZGUuX2xpbmsucH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSA7Ly/ku47ljp/niLboioLngrnliKDpmaRcbiAgICAgcmV0dXJuIGdpZHNmb3JSZW1vdmU7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIF9pc0FuY2VzdG9yKHBnaWQsZ2lkKXtcbiAgaWYoZ2lkPT0nMCcpcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7IC8vJzAn5Li65qC56IqC54K544CC5Lu75L2V6IqC54K56YO95LiN5pivJzAn55qE54i26IqC54K5XG4gIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PntcbiAgICAvLyBjb25zb2xlLmxvZygnY2hlY2snLHBnaWQsbm9kZS5fbGluay5wLG5vZGUpXG4gICAgaWYobm9kZS5fbGluay5wPT09cGdpZCl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBfaXNBbmNlc3RvcihwZ2lkLG5vZGUuX2xpbmsucCk7XG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBfbW92ZV9hc19zb24oZ2lkLCBucE5vZGUsYmdpZCl7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZT1hd2FpdCBfaXNBbmNlc3RvcihnaWQsbnBOb2RlLl9pZCk7XG4gICAgaWYoZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZSl7XG4gICAgICB0aHJvdyAoZ2lkKydpcyBhbmNlc3RvciBvZicrbnBOb2RlLl9pZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+imgeenu+WKqOeahOiKgueCueS4jeiDveaYr+ebruagh+eItuiKgueCueeahOmVv+i+iOiKgueCuVxuICAgIH1cbiAgICB2YXIgcE5vZGU9YXdhaXQgZmluZFBhcmVudEFzeW5jKGdpZCk7Ly/mib7liLDljp/niLboioLngrlcbiAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4gICAgaWYobnBOb2RlLl9pZCE9PXBOb2RlLl9pZCl7XG4gICAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpnaWR9LCAgeyAkc2V0OiB7IFwiX2xpbmsucFwiOiBucE5vZGUuX2lkIH0gfSwge30pOy8v5pS55Y+YZ2lk55qE54i26IqC54K55Li65paw54i26IqC54K5XG4gICAgfVxuICAgIGF3YWl0IF9pbnNlcnRDaGlsZHJlbkFzeW5jKG5wTm9kZSxnaWQsYmdpZCk7XG4gICAgcmV0dXJuIGF3YWl0IHJlYWRfbm9kZShnaWQpO1xuICB9KSgpOyAgXG59XG5cbi8vIC8v5oqKZ2lk6IqC54K556e75Yqo5Li6cGdpZOeahOWtkOiKgueCuVxuLy8gLy/ljIXlkKsz5q2l44CCIDEu5LuOZ2lk55qE5Y6f54i26IqC54K55Yig6Zmk44CCMuaUueWPmGdpZOeahOW9k+WJjeeItuiKgueCueOAgiAz44CC5rOo5YaM5Yiw5paw54i26IqC54K5XG4vLyAvL+enu+WKqOWJjemcgOimgeWBmuajgOafpeOAguelluWFiOiKgueCueS4jeiDveenu+WKqOS4uuWQjui+iOeahOWtkOiKgueCuVxuZnVuY3Rpb24gbW92ZV9hc19zb24oZ2lkLCBwZ2lkKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgbnBOb2RlPWF3YWl0IHJlYWRfbm9kZShwZ2lkKTsvL+aJvuWIsOaWsOeItuiKgueCuVxuICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSk7XG4gIH0pKCk7ICBcbn1cblxuZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIG5wTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoYmdpZCk7Ly/mib7liLDmlrDniLboioLngrlcbiAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUsYmdpZCk7XG4gIH0pKCk7IFxufSJdfQ==