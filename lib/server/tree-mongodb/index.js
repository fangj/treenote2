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
    move_as_brother: move_as_brother,
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
            return regeneratorRuntime.awrap(read_node(gid));

          case 21:
            return _context7.abrupt("return", _context7.sent);

          case 22:
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

            if (npNode) {
              _context9.next = 6;
              break;
            }

            throw 'cannot find parent node of brother ' + bgid;

          case 6:
            return _context9.abrupt("return", _move_as_son(gid, npNode, bgid));

          case 7:
          case "end":
            return _context9.stop();
        }
      }
    }, null, _this9);
  }();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUlBLElBQUksRUFBSjtBQUNBLFNBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEwQixFQUExQixFQUE2Qjs7QUFFM0IsT0FBRyxHQUFILENBRjJCO0FBRzNCLHdCQUFzQixJQUF0QixDQUEyQixPQUFRLEVBQVAsS0FBYSxVQUFiLEdBQXlCLElBQTFCLEdBQStCLElBQS9CLENBQTNCO0FBSDJCLFNBSXBCO0FBQ0wsd0JBREs7QUFFTCwwQkFGSztBQUdMLGtDQUhLO0FBSUwsa0NBSks7QUFLTCwwQ0FMSztBQU1MLDRCQU5LO0FBT0wsa0JBUEs7QUFRTCw0QkFSSztBQVNMLG9DQVRLOztBQVdMLDRDQVhLO0dBQVAsQ0FKMkI7Q0FBN0I7O0FBbUJBLE9BQU8sT0FBUCxHQUFlLFlBQWY7O0FBRUEsSUFBTSxlQUFhLFNBQWIsWUFBYSxDQUFDLElBQUQsRUFBUTtBQUN6QixTQUFPLEdBQUcsU0FBSCxDQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBd0IsZUFBSztBQUNsQyxTQUFLLEdBQUwsR0FBUyxJQUFJLFVBQUosQ0FEeUI7QUFFbEMsV0FBTyxJQUFQLENBRmtDO0dBQUwsQ0FBL0IsQ0FEeUI7Q0FBUjs7QUFRbkIsSUFBTSx1QkFBcUIsU0FBckIsb0JBQXFCLENBQUMsS0FBRCxFQUFPLEdBQVAsRUFBVyxJQUFYLEVBQWtCO0FBQzNDLE1BQUksTUFBSSxDQUFKLENBRHVDO0FBRXpDLE1BQUcsSUFBSCxFQUFRO0FBQ04sVUFBSSxNQUFNLEtBQU4sQ0FBWSxRQUFaLENBQXFCLE9BQXJCLENBQTZCLElBQTdCLElBQW1DLENBQW5DLENBREU7R0FBUjtBQUdELFNBQU8sR0FBRyxTQUFILENBQWEsRUFBQyxLQUFJLE1BQU0sR0FBTixFQUFsQixFQUE4QjtBQUNuQyxXQUFPO0FBQ0osd0JBQWtCO0FBQ2YsZUFBTyxDQUFDLEdBQUQsQ0FBUDtBQUNB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QWEsRUFBQyxLQUFJLEdBQUosRUFBZCxFQUF5QixFQUFFLE1BQU0sRUFBRSxXQUFXLE9BQU8sR0FBUCxFQUFuQixFQUEzQixFQUE4RCxFQUE5RDs7Ozs0Q0FFRixxQkFBcUIsTUFBckIsRUFBNEIsR0FBNUIsRUFBZ0MsSUFBaEM7Ozs7NENBQ08sVUFBVSxHQUFWOzs7Ozs7Ozs7OztHQWhCUCxFQUFSLENBRHFDO0NBQXZDOzs7OztBQXdCQSxTQUFTLFdBQVQsQ0FBcUIsR0FBckIsRUFBMEIsSUFBMUIsRUFBZ0M7OztBQUM5QixTQUFPLGlCQUFDOzs7Ozs7OzRDQUNXLFVBQVUsSUFBVjs7O0FBQWI7OENBQ0csYUFBYSxHQUFiLEVBQWlCLE1BQWpCOzs7Ozs7OztHQUZELEVBQVIsQ0FEOEI7Q0FBaEM7O0FBT0EsU0FBUyxlQUFULENBQXlCLEdBQXpCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVyxnQkFBZ0IsSUFBaEI7OztBQUFiOztnQkFDQTs7Ozs7a0JBQ0ssd0NBQXNDLElBQXRDOzs7OENBR0YsYUFBYSxHQUFiLEVBQWlCLE1BQWpCLEVBQXdCLElBQXhCOzs7Ozs7OztHQU5ELEVBQVIsQ0FEa0M7Q0FBcEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2YXIgYXN5bmMgPSByZXF1aXJlKCdhc3luY2F3YWl0L2FzeW5jJyk7XG4vLyB2YXIgYXdhaXQgPSByZXF1aXJlKCdhc3luY2F3YWl0L2F3YWl0Jyk7XG4vLyB2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5cbnZhciBkYjsgXG5mdW5jdGlvbiB0cmVlX21vbmdvZGIoX2RiLGNiKXtcbiAgLy8gZGI9UHJvbWlzZS5wcm9taXNpZnlBbGwoX2RiKTtcbiAgZGI9X2RiO1xuICBidWlsZFJvb3RJZk5vdEV4aXN0KCkudGhlbigodHlwZW9mIGNiID09PSdmdW5jdGlvbicpP2NiKCk6bnVsbCk7IC8vY2LnlKjkuo7pgJrnn6XmtYvor5XnqIvluo9cbiAgcmV0dXJuIHtcbiAgICByZWFkX25vZGUsXG4gICAgcmVhZF9ub2RlcyxcbiAgICBta19zb25fYnlfZGF0YSxcbiAgICBta19zb25fYnlfbmFtZSxcbiAgICBta19icm90aGVyX2J5X2RhdGEsXG4gICAgdXBkYXRlX2RhdGEsXG4gICAgcmVtb3ZlLFxuICAgIG1vdmVfYXNfc29uLFxuICAgIG1vdmVfYXNfYnJvdGhlcixcbiAgICAvL2ZvciB0ZXN0XG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzPXRyZWVfbW9uZ29kYjtcbi8v5YaF6YOo5bel5YW35Ye95pWwXG5jb25zdCBfaW5zZXJ0QXN5bmM9KG5vZGUpPT57XG4gIHJldHVybiBkYi5pbnNlcnRPbmUobm9kZSkudGhlbihyZXM9PntcbiAgICBub2RlLl9pZD1yZXMuaW5zZXJ0ZWRJZDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSlcbn1cblxuXG5jb25zdCBfaW5zZXJ0Q2hpbGRyZW5Bc3luYz0ocE5vZGUsZ2lkLGJnaWQpPT57XG4gIHZhciBwb3M9MDtcbiAgICBpZihiZ2lkKXtcbiAgICAgIHBvcz1wTm9kZS5fbGluay5jaGlsZHJlbi5pbmRleE9mKGJnaWQpKzE7XG4gICAgfVxuICAgcmV0dXJuIGRiLnVwZGF0ZU9uZSh7X2lkOnBOb2RlLl9pZH0sIHtcbiAgICAgJHB1c2g6IHtcbiAgICAgICAgXCJfbGluay5jaGlsZHJlblwiOiB7XG4gICAgICAgICAgICRlYWNoOiBbZ2lkXSxcbiAgICAgICAgICAgJHBvc2l0aW9uOiBwb3NcbiAgICAgICAgfVxuICAgICB9XG4gICB9KTsgXG59XG5cbmNvbnN0IGZpbmRQYXJlbnRBc3luYz0oc2dpZCk9PiBkYi5maW5kT25lKHtcIl9saW5rLmNoaWxkcmVuXCI6c2dpZCxfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pO1xuXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcbiAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIpO1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0IGJlZ2luXCIpO1xuICAgIHZhciByb290PWF3YWl0IGRiLmZpbmRPbmUoe19pZDonMCd9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhcImZvdW5kIHJvb3RcIixyb290KTtcbiAgICBpZighcm9vdCl7XG4gICAgICB2YXIgZGVmYXVsdFJvb3Q9e1xuICAgICAgICBfaWQ6JzAnLCBcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiAnMCcsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByb290PWF3YWl0IF9pbnNlcnRBc3luYyhkZWZhdWx0Um9vdCk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiLHJvb3QpO1xuICAgIHJldHVybiByb290O1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGUoZ2lkKSB7XG4gIC8vcm3moIforrDooajnpLroioLngrnlt7Lnu4/ooqvliKDpmaRcbiAgcmV0dXJuIGRiLmZpbmRPbmUoe19pZDpnaWQsIF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xuICByZXR1cm4gZGIuZmluZCh7X2lkOnskaW46Z2lkc30sX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KS50b0FycmF5KCk7XG59XG5cblxuZnVuY3Rpb24gX21rX3Nvbl9ieV9rdihwTm9kZSxrZXksdmFsdWUsYmdpZCl7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhwTm9kZSk7XG4gICAgdmFyIF9uZXdOb2RlPXtcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiBwTm9kZS5faWQsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICB9O1xuICAgIF9uZXdOb2RlW2tleV09dmFsdWU7XG4gICAgdmFyIG5ld05vZGU9IGF3YWl0IF9pbnNlcnRBc3luYyhfbmV3Tm9kZSkgOy8v5o+S5YWl5paw6IqC54K5XG4gICAgLy/mj5LlhaXniLboioLngrlcbiAgICBhd2FpdCBfaW5zZXJ0Q2hpbGRyZW5Bc3luYyhwTm9kZSxuZXdOb2RlLl9pZCxiZ2lkKTtcbiAgICByZXR1cm4gbmV3Tm9kZTsvL+i/lOWbnuaWsOiKgueCuVxuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfaWRcIjpwZ2lkfSk7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX2RhdGFcIixkYXRhKTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pIDsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgdmFyIG5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbmFtZVwiOm5hbWUsXCJfbGluay5wXCI6cGdpZH0pOy8v5piv5ZCm5bey5pyJ5ZCM5ZCN6IqC54K5XG4gICAgaWYobm9kZSl7XG4gICAgICByZXR1cm4gbm9kZTsvL+WmguacieebtOaOpei/lOWbnlxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9uYW1lXCIsbmFtZSk7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLGRhdGEpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoYmdpZCk7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfZGF0YVwiLGRhdGEsYmdpZCk7XG4gIH0pKCk7XG59XG5cblxuLy8gZnVuY3Rpb24gX3VwZGF0ZShkYixxdWVyeSx1cGRhdGUsY2FsbGJhY2speyBcbi8vICAgICB2YXIgY2I9ZnVuY3Rpb24oZXJyLCBudW1BZmZlY3RlZCwgYWZmZWN0ZWREb2N1bWVudHMsIHVwc2VydCl7XG4vLyAgICAgICBjYWxsYmFjayhlcnIsYWZmZWN0ZWREb2N1bWVudHMpOy8v5L+u5pS5Y2FsbGJhY2vnmoTnrb7lkI3vvIzkvb/lvpfnrKzkuozkuKrlj4LmlbDkuLrmm7TmlrDov4fnmoRkb2Ncbi8vICAgICB9O1xuLy8gICAgIHZhciBvcHRpb25zPXsgbXVsdGk6IGZhbHNlLHJldHVyblVwZGF0ZWREb2NzOnRydWUgfTtcbi8vICAgICBkYi51cGRhdGUocXVlcnksIHVwZGF0ZSwgb3B0aW9ucyxjYik7XG4vLyB9XG5cbi8vIGNvbnN0IHVwZGF0ZT1Qcm9taXNlLnByb21pc2lmeShfdXBkYXRlKTsvL+S/ruaUuWNhbGxiYWNr562+5ZCN5ZCO5bCx5Y+v5LulcHJvbWlzaWZ5XG5cbmZ1bmN0aW9uIHVwZGF0ZV9kYXRhKGdpZCwgZGF0YSkge1xuICByZXR1cm4gZGIudXBkYXRlT25lKHtfaWQ6Z2lkfSwgeyAkc2V0OiB7IF9kYXRhOiBkYXRhIH0gfSlcbiAgLnRoZW4oXz0+ZGIuZmluZE9uZSh7X2lkOmdpZH0pKTtcbn1cblxuXG4vL+mAkuW9kumBjeWOhuaJgOacieWtkOiKgueCuVxuLy9naWRz5piv6KaB6K6/6Zeu55qE6IqC54K5aWTnmoTliJfooahcbi8vdmlzaXTmmK/kuIDkuKrlh73mlbDjgILorr/pl67oioLngrnnmoTliqjkvZzjgIJcbmZ1bmN0aW9uIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKGdpZHMsdmlzaXQpIHtcbiAgaWYgKCFnaWRzfHxnaWRzLmxlbmd0aD09MCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoKTt9Ly/pnIDopoHov5Tlm57kuIDkuKpwcm9taXNlIFxuICByZXR1cm4gUHJvbWlzZS5hbGwoZ2lkcy5tYXAoZ2lkID0+IHtcbiAgICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57IC8v6K+75Y+W5b2T5YmN6IqC54K5XG4gICAgICByZXR1cm4gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4obm9kZS5fbGluay5jaGlsZHJlbix2aXNpdCkudGhlbigoKT0+eyAvL+iuv+mXruaJgOacieWtkOiKgueCuVxuICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XG4gICAgICB9KVxuICAgIH0pXG4gIH0pKTtcbn1cblxuLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcbmZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgICBpZihnaWQ9PT0nMCcpcmV0dXJuOy8v5qC56IqC54K55LiN6IO95Yig6Zmk44CCXG4gICAgIHZhciBub2RlPWF3YWl0IHJlYWRfbm9kZShnaWQpOyAvL+WFiOivu+WPluimgeWIoOmZpOeahOiKgueCuVxuICAgICBpZighbm9kZSlyZXR1cm47Ly/lt7Lnu4/kuI3lrZjlnKjvvIzov5Tlm55cbiAgICAgLy/mlLbpm4bmiYDmnInlrZDoioLngrlcbiAgICAgdmFyIGdpZHNmb3JSZW1vdmU9W107XG4gICAgIGNvbnN0IHJtPShub2RlKT0+e2dpZHNmb3JSZW1vdmUucHVzaChub2RlLl9pZCl9O1xuICAgICBhd2FpdCBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihbZ2lkXSxybSk7XG4gICAgIC8v5om56YeP5Yig6ZmkXG4gICAgIGF3YWl0IGRiLnVwZGF0ZU1hbnkoe19pZDp7JGluOmdpZHNmb3JSZW1vdmV9fSwgIHsgJHNldDogeyBfcm06dHJ1ZSAgfSB9LCB7fSk7Ly/moIforrDkuLrliKDpmaRcbiAgICAgYXdhaXQgZGIudXBkYXRlT25lKHtfaWQ6bm9kZS5fbGluay5wfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuICAgICByZXR1cm4gZ2lkc2ZvclJlbW92ZTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xuICBpZihnaWQ9PScwJylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgLy8nMCfkuLrmoLnoioLngrnjgILku7vkvZXoioLngrnpg73kuI3mmK8nMCfnmoTniLboioLngrlcbiAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcbiAgICBpZihub2RlLl9saW5rLnA9PT1wZ2lkKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIF9pc0FuY2VzdG9yKHBnaWQsbm9kZS5fbGluay5wKTtcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlPWF3YWl0IF9pc0FuY2VzdG9yKGdpZCxucE5vZGUuX2lkKTtcbiAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcbiAgICAgIHRocm93IChnaWQrJ2lzIGFuY2VzdG9yIG9mJytucE5vZGUuX2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v6KaB56e75Yqo55qE6IqC54K55LiN6IO95piv55uu5qCH54i26IqC54K555qE6ZW/6L6I6IqC54K5XG4gICAgfVxuICAgIHZhciBwTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoZ2lkKTsvL+aJvuWIsOWOn+eItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlIG9mIGJyb3RoZXIgJytiZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4gICAgaWYobnBOb2RlLl9pZCE9PXBOb2RlLl9pZCl7XG4gICAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpnaWR9LCAgeyAkc2V0OiB7IFwiX2xpbmsucFwiOiBucE5vZGUuX2lkIH0gfSwge30pOy8v5pS55Y+YZ2lk55qE54i26IqC54K55Li65paw54i26IqC54K5XG4gICAgfVxuICAgIGF3YWl0IF9pbnNlcnRDaGlsZHJlbkFzeW5jKG5wTm9kZSxnaWQsYmdpZCk7XG4gICAgcmV0dXJuIGF3YWl0IHJlYWRfbm9kZShnaWQpO1xuICB9KSgpOyAgXG59XG5cbi8vIC8v5oqKZ2lk6IqC54K556e75Yqo5Li6cGdpZOeahOWtkOiKgueCuVxuLy8gLy/ljIXlkKsz5q2l44CCIDEu5LuOZ2lk55qE5Y6f54i26IqC54K55Yig6Zmk44CCMuaUueWPmGdpZOeahOW9k+WJjeeItuiKgueCueOAgiAz44CC5rOo5YaM5Yiw5paw54i26IqC54K5XG4vLyAvL+enu+WKqOWJjemcgOimgeWBmuajgOafpeOAguelluWFiOiKgueCueS4jeiDveenu+WKqOS4uuWQjui+iOeahOWtkOiKgueCuVxuZnVuY3Rpb24gbW92ZV9hc19zb24oZ2lkLCBwZ2lkKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgbnBOb2RlPWF3YWl0IHJlYWRfbm9kZShwZ2lkKTsvL+aJvuWIsOaWsOeItuiKgueCuVxuICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSk7XG4gIH0pKCk7ICBcbn1cblxuZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIG5wTm9kZT1hd2FpdCBmaW5kUGFyZW50QXN5bmMoYmdpZCk7Ly/mib7liLDmlrDniLboioLngrlcbiAgICBpZighbnBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgb2YgYnJvdGhlciAnK2JnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSxiZ2lkKTtcbiAgfSkoKTsgXG59Il19