'use strict';

var _ = require('lodash');
var AV = require('leancloud-storage');

function tree_leancloud(cb) {
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

module.exports = tree_leancloud;

var APP_ID = 'O5chE5oCrD64pIEimweTTno5-gzGzoHsz';
var APP_KEY = 'PmdSTHdJk2Iy887QWH0yxBPx';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
var AVNode = AV.Object.extend('Node');
var findAVNodeAsync = function findAVNodeAsync(key, value) {
  var query = new AV.Query('Node');
  query.equalTo(key, value);
  return query.first();
};
var findParentAVNodeAsync = function findParentAVNodeAsync(gid) {
  var query = new AV.Query('Node');
  query.contains("node._link.children", gid);
  return query.first(); //找到新父节点
};
var findAVNodeByGidAsync = function _callee(gid) {
  var avnode, query;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          query = new AV.Query('Node');

          if (!(gid === '0')) {
            _context.next = 14;
            break;
          }

          //根节点的id放在node.gid中
          query.equalTo('node.gid', gid);
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(query.first());

        case 6:
          avnode = _context.sent;
          _context.next = 12;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context['catch'](3);

          console.error(_context.t0); //找不到时会抛出错误

        case 12:
          _context.next = 19;
          break;

        case 14:
          _context.next = 16;
          return regeneratorRuntime.awrap(query.get(gid));

        case 16:
          avnode = _context.sent;

          if (!(avnode && avnode.get('_rm'))) {
            _context.next = 19;
            break;
          }

          return _context.abrupt('return', null);

        case 19:
          return _context.abrupt('return', avnode);

        case 20:
        case 'end':
          return _context.stop();
      }
    }
  }, null, undefined, [[3, 9]]);
};

var findNodeByGidAsync = function _callee2(gid) {
  var avnode;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(findAVNodeByGidAsync(gid));

        case 2:
          avnode = _context2.sent;
          return _context2.abrupt('return', t(avnode));

        case 4:
        case 'end':
          return _context2.stop();
      }
    }
  }, null, undefined);
};

var updateAVNodeByGidAsync = function _callee3(gid, updater) {
  var avnode, updatedNode;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!(gid === '0')) {
            _context3.next = 6;
            break;
          }

          _context3.next = 3;
          return regeneratorRuntime.awrap(findAVNodeByGidAsync(gid));

        case 3:
          avnode = _context3.sent;
          _context3.next = 7;
          break;

        case 6:
          // 第一个参数是 className，第二个参数是 objectId
          avnode = AV.Object.createWithoutData('Node', gid);

        case 7:
          // 修改属性
          updater(avnode);
          // 保存到云端
          _context3.next = 10;
          return regeneratorRuntime.awrap(avnode.save());

        case 10:
          updatedNode = _context3.sent;
          return _context3.abrupt('return', updatedNode);

        case 12:
        case 'end':
          return _context3.stop();
      }
    }
  }, null, undefined);
};

var _createWithoutData = _.curry(AV.Object.createWithoutData);
var createAVNodeWithoutData = _createWithoutData('Node'); //fn(id)
var updateAVNodesByGidsAsync = function updateAVNodesByGidsAsync(gids, updater) {
  var nodes = gids.map(createAVNodeWithoutData);
  nodes.map(updater);
  return AV.Object.saveAll(nodes);
};

var insertNode = function _callee4(node) {
  var avnode;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // console.log("insertNode",node)
          avnode = new AVNode();

          avnode.set('node', node);
          _context4.next = 4;
          return regeneratorRuntime.awrap(avnode.save());

        case 4:
          avnode = _context4.sent;
          return _context4.abrupt('return', t(avnode));

        case 6:
        case 'end':
          return _context4.stop();
      }
    }
  }, null, undefined);
};

var t = function t(avnode) {
  //取出leancloud中的node数据，并把id附上
  if (!avnode) {
    return null;
  }
  var node = avnode.get("node");
  if (node.gid === '0') {
    node._id = '0'; //根节点
  } else {
      node._id = avnode.get("id");
    }
  return node;
};

function buildRootIfNotExist(cb) {
  var _this = this;

  // console.log("buildRootIfNotExist")
  return function _callee5() {
    var root, defaultRoot;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return regeneratorRuntime.awrap(findNodeByGidAsync('0'));

          case 2:
            root = _context5.sent;

            console.log("root", root);

            if (root) {
              _context5.next = 16;
              break;
            }

            console.log('no root');
            defaultRoot = {
              gid: '0',
              _link: {
                p: '0',
                children: []
              }
            };
            _context5.prev = 7;
            _context5.next = 10;
            return regeneratorRuntime.awrap(insertNode(defaultRoot));

          case 10:
            root = _context5.sent;
            _context5.next = 16;
            break;

          case 13:
            _context5.prev = 13;
            _context5.t0 = _context5['catch'](7);

            console.log(_context5.t0);

          case 16:
            if (typeof cb == 'function') {
              cb(); //通知root构建完成
            }
            return _context5.abrupt('return', root);

          case 18:
          case 'end':
            return _context5.stop();
        }
      }
    }, null, _this, [[7, 13]]);
  }();
}

function read_node(gid) {
  return findNodeByGidAsync(gid);
}

function read_nodes(gids) {
  var _this2 = this;

  return function _callee6() {
    var nodes, avnodes;
    return regeneratorRuntime.async(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            nodes = gids.map(createAVNodeWithoutData);
            _context6.next = 3;
            return regeneratorRuntime.awrap(AV.Object.fetchAll(nodes));

          case 3:
            avnodes = _context6.sent;
            return _context6.abrupt('return', avnodes.map(t));

          case 5:
          case 'end':
            return _context6.stop();
        }
      }
    }, null, _this2);
  }();
}

function _mk_son_by_kv(pNode, key, value, bgid) {
  var _this3 = this;

  return function _callee7() {
    var newNode, pos, children;
    return regeneratorRuntime.async(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            // console.log(pNode);
            newNode = {
              _link: {
                p: pNode._id,
                children: []
              }
            };

            newNode[key] = value;
            _context7.next = 4;
            return regeneratorRuntime.awrap(insertNode(newNode));

          case 4:
            newNode = _context7.sent;
            //插入新节点
            pos = 0;
            children = pNode._link.children;

            if (bgid) {
              pos = children.indexOf(bgid) + 1;
            }
            children.splice(pos, 0, newNode._id); //把新节点的ID插入到父节点中
            _context7.next = 11;
            return regeneratorRuntime.awrap(updateAVNodeByGidAsync(pNode._id, function (avnode) {
              avnode.set('node._link.children', children);
            }));

          case 11:
            return _context7.abrupt('return', newNode);

          case 12:
          case 'end':
            return _context7.stop();
        }
      }
    }, null, _this3);
  }();
}

//返回新节点
function _mk_son_by_data(pNode, data, bgid) {
  return _mk_son_by_kv(pNode, "_data", data, bgid);
}

function _mk_son_by_name(pNode, name, bgid) {
  return _mk_son_by_kv(pNode, "_name", name, bgid);
}

function mk_son_by_data(pgid, data) {
  var _this4 = this;

  return function _callee8() {
    var pNode;
    return regeneratorRuntime.async(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return regeneratorRuntime.awrap(findNodeByGidAsync(pgid));

          case 2:
            pNode = _context8.sent;

            if (pNode) {
              _context8.next = 6;
              break;
            }

            throw 'cannot find parent node ' + pgid;

          case 6:
            _context8.next = 8;
            return regeneratorRuntime.awrap(_mk_son_by_data(pNode, data));

          case 8:
            return _context8.abrupt('return', _context8.sent);

          case 9:
          case 'end':
            return _context8.stop();
        }
      }
    }, null, _this4);
  }();
}

function mk_son_by_name(pgid, name) {
  var _this5 = this;

  return function _callee9() {
    var pNode, avnode;
    return regeneratorRuntime.async(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return regeneratorRuntime.awrap(findNodeByGidAsync(pgid));

          case 2:
            pNode = _context9.sent;

            if (pNode) {
              _context9.next = 6;
              break;
            }

            throw 'cannot find parent node ' + pgid;

          case 6:
            _context9.next = 8;
            return regeneratorRuntime.awrap(findAVNodeAsync("node._name", name));

          case 8:
            avnode = _context9.sent;

            if (!avnode) {
              _context9.next = 11;
              break;
            }

            return _context9.abrupt('return', t(avnode));

          case 11:
            _context9.next = 13;
            return regeneratorRuntime.awrap(_mk_son_by_name(pNode, name));

          case 13:
            return _context9.abrupt('return', _context9.sent);

          case 14:
          case 'end':
            return _context9.stop();
        }
      }
    }, null, _this5);
  }();
}

function mk_brother_by_data(bgid, data) {
  var _this6 = this;

  return function _callee10() {
    var query, pAVNode, pNode, node;
    return regeneratorRuntime.async(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            query = new AV.Query('Node');

            query.contains('node._link.children', bgid);
            _context10.next = 4;
            return regeneratorRuntime.awrap(query.first());

          case 4:
            pAVNode = _context10.sent;
            //找到父节点
            pNode = t(pAVNode);

            if (pNode) {
              _context10.next = 9;
              break;
            }

            throw 'cannot find parent node of brother ' + bgid;

          case 9:
            _context10.next = 11;
            return regeneratorRuntime.awrap(_mk_son_by_data(pNode, data, bgid));

          case 11:
            node = _context10.sent;
            return _context10.abrupt('return', node);

          case 13:
          case 'end':
            return _context10.stop();
        }
      }
    }, null, _this6);
  }();
}

function update_data(gid, data) {
  return updateAVNodeByGidAsync(gid, function (avnode) {
    return avnode.set("node.data", data);
  }).then(t);
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

// //标记删除节点与所有子孙节点
function remove(gid) {
  var _this7 = this;

  return function _callee11() {
    var node, gidsforRemove, rm, setRm;
    return regeneratorRuntime.async(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!(gid == '0')) {
              _context11.next = 2;
              break;
            }

            return _context11.abrupt('return');

          case 2:
            _context11.next = 4;
            return regeneratorRuntime.awrap(read_node(gid));

          case 4:
            node = _context11.sent;

            if (node) {
              _context11.next = 7;
              break;
            }

            return _context11.abrupt('return');

          case 7:
            //已经不存在，返回
            //收集所有子节点
            gidsforRemove = [];

            rm = function rm(node) {
              gidsforRemove.push(node._id);
            };

            _context11.next = 11;
            return regeneratorRuntime.awrap(_traversal_all_children([gid], rm));

          case 11:
            //批量删除//标记为删除

            setRm = function setRm(avnode) {
              avnode.set("_rm", true);
            };

            _context11.next = 14;
            return regeneratorRuntime.awrap(updateAVNodesByGidsAsync(gidsforRemove, setRm));

          case 14:
            _context11.next = 16;
            return regeneratorRuntime.awrap(updateAVNodeByGidAsync(node._link.p, function (avnode) {
              avnode.remove("node._link.children", gid);
            }));

          case 16:
            return _context11.abrupt('return', gidsforRemove);

          case 17:
          case 'end':
            return _context11.stop();
        }
      }
    }, null, _this7);
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

function _move_as_son(gid, npAVNode, bgid) {
  var _this8 = this;

  return function _callee12() {
    var gidIsAncestorOfNewParentNode, pAVNode, pos, npNode, children;
    return regeneratorRuntime.async(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return regeneratorRuntime.awrap(_isAncestor(gid, npAVNode.id));

          case 2:
            gidIsAncestorOfNewParentNode = _context12.sent;

            if (!gidIsAncestorOfNewParentNode) {
              _context12.next = 6;
              break;
            }

            console.log(gid, 'is ancestor of', npAVNode.id);
            return _context12.abrupt('return', null);

          case 6:
            _context12.next = 8;
            return regeneratorRuntime.awrap(findParentAVNodeAsync(gid));

          case 8:
            pAVNode = _context12.sent;
            //找到原父节点
            pAVNode.remove('node._link.children', gid); //从原父节点删除
            _context12.next = 12;
            return regeneratorRuntime.awrap(pAVNode.save());

          case 12:
            if (!(npAVNode.id === pAVNode.id)) {
              _context12.next = 16;
              break;
            }

            //如果新的父节点与旧的父节点相同。要更新父节点
            npAVNode = pAVNode;
            _context12.next = 18;
            break;

          case 16:
            _context12.next = 18;
            return regeneratorRuntime.awrap(updateAVNodeByGidAsync(gid, function (avnode) {
              avnode.set("node._link.p", npAVNode.id);
            }));

          case 18:
            //改变gid的父节点为新父节点
            pos = 0;
            npNode = t(npAVNode);
            children = npNode._link.children;
            // console.log('before',children)

            if (bgid) {
              pos = children.indexOf(bgid) + 1;
            }
            children.splice(pos, 0, gid); //把新节点的ID插入到父节点中
            // console.log('after',children,npNode)
            _context12.next = 25;
            return regeneratorRuntime.awrap(updateAVNodeByGidAsync(npNode._id, function (avnode) {
              avnode.set("node._link.children", children);
            }));

          case 25:
            _context12.next = 27;
            return regeneratorRuntime.awrap(read_node(gid));

          case 27:
            return _context12.abrupt('return', _context12.sent);

          case 28:
          case 'end':
            return _context12.stop();
        }
      }
    }, null, _this8);
  }();
}

//把gid节点移动为pgid的子节点
//包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
//移动前需要做检查。祖先节点不能移动为后辈的子节点
function move_as_son(gid, pgid) {
  var _this9 = this;

  return function _callee13() {
    var npAVNode;
    return regeneratorRuntime.async(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return regeneratorRuntime.awrap(findAVNodeByGidAsync(pgid));

          case 2:
            npAVNode = _context13.sent;
            return _context13.abrupt('return', _move_as_son(gid, npAVNode));

          case 4:
          case 'end':
            return _context13.stop();
        }
      }
    }, null, _this9);
  }();
}

function move_as_brother(gid, bgid) {
  var _this10 = this;

  return function _callee14() {
    var npAVNode;
    return regeneratorRuntime.async(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return regeneratorRuntime.awrap(findParentAVNodeAsync(bgid));

          case 2:
            npAVNode = _context14.sent;
            return _context14.abrupt('return', _move_as_son(gid, npAVNode, bgid));

          case 4:
          case 'end':
            return _context14.stop();
        }
      }
    }, null, _this10);
  }();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1sZWFuY2xvdWQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNLElBQUUsUUFBUSxRQUFSLENBQUY7QUFDTixJQUFNLEtBQUcsUUFBUSxtQkFBUixDQUFIOztBQUVOLFNBQVMsY0FBVCxDQUF3QixFQUF4QixFQUEyQjtBQUN6QixzQkFBb0IsRUFBcEIsRUFEeUI7QUFFekIsU0FBTztBQUNMLHdCQURLO0FBRUwsMEJBRks7QUFHTCxrQ0FISztBQUlMLGtDQUpLO0FBS0wsMENBTEs7QUFNTCw0QkFOSztBQU9MLGtCQVBLO0FBUUwsNEJBUks7QUFTTCxvQ0FUSzs7QUFXTCw0Q0FYSztHQUFQLENBRnlCO0NBQTNCOztBQWlCQSxPQUFPLE9BQVAsR0FBZSxjQUFmOztBQUVBLElBQUksU0FBUyxtQ0FBVDtBQUNKLElBQUksVUFBVSwwQkFBVjtBQUNKLEdBQUcsSUFBSCxDQUFRO0FBQ04sU0FBTyxNQUFQO0FBQ0EsVUFBUSxPQUFSO0NBRkY7QUFJQSxJQUFNLFNBQVMsR0FBRyxNQUFILENBQVUsTUFBVixDQUFpQixNQUFqQixDQUFUO0FBQ04sSUFBTSxrQkFBZ0IsU0FBaEIsZUFBZ0IsQ0FBQyxHQUFELEVBQUssS0FBTCxFQUFhO0FBQ2pDLE1BQUksUUFBUSxJQUFJLEdBQUcsS0FBSCxDQUFTLE1BQWIsQ0FBUixDQUQ2QjtBQUVqQyxRQUFNLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLEtBQW5CLEVBRmlDO0FBR2pDLFNBQU8sTUFBTSxLQUFOLEVBQVAsQ0FIaUM7Q0FBYjtBQUt0QixJQUFNLHdCQUFzQixTQUF0QixxQkFBc0IsQ0FBQyxHQUFELEVBQU87QUFDakMsTUFBSSxRQUFRLElBQUksR0FBRyxLQUFILENBQVMsTUFBYixDQUFSLENBRDZCO0FBRWpDLFFBQU0sUUFBTixDQUFlLHFCQUFmLEVBQXNDLEdBQXRDLEVBRmlDO0FBR2pDLFNBQU8sTUFBTSxLQUFOLEVBQVA7QUFIaUMsQ0FBUDtB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QkFBSTtBQUNKLHFCQUFPLEVBQUUsUUFBRjtBQUNQLHVCQUFTLE9BQU8sS0FBUCxDQUFhLFFBQWI7OztBQUViLGdCQUFHLElBQUgsRUFBUTtBQUNOLG9CQUFJLFNBQVMsT0FBVCxDQUFpQixJQUFqQixJQUF1QixDQUF2QixDQURFO2FBQVI7QUFHQSxxQkFBUyxNQUFULENBQWdCLEdBQWhCLEVBQW9CLENBQXBCLEVBQXNCLEdBQXRCOzs7NENBRU0sdUJBQXVCLE9BQU8sR0FBUCxFQUFXLGtCQUFRO0FBQUMscUJBQU8sR0FBUCxDQUFXLHFCQUFYLEVBQWlDLFFBQWpDLEVBQUQ7YUFBUjs7Ozs0Q0FDM0IsVUFBVSxHQUFWOzs7Ozs7Ozs7OztHQXpCUCxFQUFSLENBRHVDO0NBQXpDOzs7OztBQWlDQSxTQUFTLFdBQVQsQ0FBcUIsR0FBckIsRUFBMEIsSUFBMUIsRUFBZ0M7OztBQUM5QixTQUFPLGtCQUFDOzs7Ozs7OzRDQUNhLHFCQUFxQixJQUFyQjs7O0FBQWY7K0NBQ0csYUFBYSxHQUFiLEVBQWlCLFFBQWpCOzs7Ozs7OztHQUZELEVBQVIsQ0FEOEI7Q0FBaEM7O0FBT0EsU0FBUyxlQUFULENBQXlCLEdBQXpCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxrQkFBQzs7Ozs7Ozs0Q0FDYSxzQkFBc0IsSUFBdEI7OztBQUFmOytDQUNHLGFBQWEsR0FBYixFQUFpQixRQUFqQixFQUEwQixJQUExQjs7Ozs7Ozs7R0FGRCxFQUFSLENBRGtDO0NBQXBDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgXz1yZXF1aXJlKCdsb2Rhc2gnKTtcbmNvbnN0IEFWPXJlcXVpcmUoJ2xlYW5jbG91ZC1zdG9yYWdlJyk7XG5cbmZ1bmN0aW9uIHRyZWVfbGVhbmNsb3VkKGNiKXtcbiAgYnVpbGRSb290SWZOb3RFeGlzdChjYik7XG4gIHJldHVybiB7XG4gICAgcmVhZF9ub2RlLFxuICAgIHJlYWRfbm9kZXMsXG4gICAgbWtfc29uX2J5X2RhdGEsXG4gICAgbWtfc29uX2J5X25hbWUsXG4gICAgbWtfYnJvdGhlcl9ieV9kYXRhLFxuICAgIHVwZGF0ZV9kYXRhLFxuICAgIHJlbW92ZSxcbiAgICBtb3ZlX2FzX3NvbixcbiAgICBtb3ZlX2FzX2Jyb3RoZXIsXG4gICAgLy9mb3IgdGVzdFxuICAgIGJ1aWxkUm9vdElmTm90RXhpc3RcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cz10cmVlX2xlYW5jbG91ZDtcblxudmFyIEFQUF9JRCA9ICdPNWNoRTVvQ3JENjRwSUVpbXdlVFRubzUtZ3pHem9Ic3onO1xudmFyIEFQUF9LRVkgPSAnUG1kU1RIZEprMkl5ODg3UVdIMHl4QlB4JztcbkFWLmluaXQoe1xuICBhcHBJZDogQVBQX0lELFxuICBhcHBLZXk6IEFQUF9LRVlcbn0pO1xuY29uc3QgQVZOb2RlID0gQVYuT2JqZWN0LmV4dGVuZCgnTm9kZScpO1xuY29uc3QgZmluZEFWTm9kZUFzeW5jPShrZXksdmFsdWUpPT57XG4gIHZhciBxdWVyeSA9IG5ldyBBVi5RdWVyeSgnTm9kZScpO1xuICBxdWVyeS5lcXVhbFRvKGtleSwgdmFsdWUpO1xuICByZXR1cm4gcXVlcnkuZmlyc3QoKTtcbn1cbmNvbnN0IGZpbmRQYXJlbnRBVk5vZGVBc3luYz0oZ2lkKT0+e1xuICB2YXIgcXVlcnkgPSBuZXcgQVYuUXVlcnkoJ05vZGUnKTtcbiAgcXVlcnkuY29udGFpbnMoXCJub2RlLl9saW5rLmNoaWxkcmVuXCIsIGdpZCk7XG4gIHJldHVybiBxdWVyeS5maXJzdCgpOy8v5om+5Yiw5paw54i26IqC54K5XG59XG5jb25zdCBmaW5kQVZOb2RlQnlHaWRBc3luYz0gYXN5bmMgKGdpZCk9PntcbiAgdmFyIGF2bm9kZTtcbiAgdmFyIHF1ZXJ5ID0gbmV3IEFWLlF1ZXJ5KCdOb2RlJyk7XG4gIGlmKGdpZD09PScwJyl7Ly/moLnoioLngrnnmoRpZOaUvuWcqG5vZGUuZ2lk5LitXG4gICAgcXVlcnkuZXF1YWxUbygnbm9kZS5naWQnLCBnaWQpO1xuICAgIHRyeXtcbiAgICAgIGF2bm9kZT1hd2FpdCBxdWVyeS5maXJzdCgpO1xuICAgIH1jYXRjaChlKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7Ly/mib7kuI3liLDml7bkvJrmipvlh7rplJnor69cbiAgICB9XG4gIH1lbHNle1xuICAgIGF2bm9kZT1hd2FpdCBxdWVyeS5nZXQoZ2lkKS8v5pmu6YCa6IqC54K555qEaWTlsLHmmK9PYmplY3RJRFxuICAgIGlmKGF2bm9kZSAmJiBhdm5vZGUuZ2V0KCdfcm0nKSl7Ly9ybeihqOekuuiKgueCueW3sue7j+WIoOmZpFxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIHJldHVybiBhdm5vZGU7XG59XG5cbmNvbnN0IGZpbmROb2RlQnlHaWRBc3luYz0gYXN5bmMgKGdpZCk9PntcbiAgdmFyIGF2bm9kZT1hd2FpdCBmaW5kQVZOb2RlQnlHaWRBc3luYyhnaWQpO1xuICByZXR1cm4gdChhdm5vZGUpO1xufVxuXG5jb25zdCB1cGRhdGVBVk5vZGVCeUdpZEFzeW5jPWFzeW5jIChnaWQsdXBkYXRlcik9PntcbiAgdmFyIGF2bm9kZTtcbiAgaWYoZ2lkPT09JzAnKXtcbiAgICBhdm5vZGUgPSBhd2FpdCBmaW5kQVZOb2RlQnlHaWRBc3luYyhnaWQpO1xuICB9ZWxzZXtcbiAgICAvLyDnrKzkuIDkuKrlj4LmlbDmmK8gY2xhc3NOYW1l77yM56ys5LqM5Liq5Y+C5pWw5pivIG9iamVjdElkXG4gICAgYXZub2RlID0gQVYuT2JqZWN0LmNyZWF0ZVdpdGhvdXREYXRhKCdOb2RlJywgZ2lkKTtcbiAgfVxuICAvLyDkv67mlLnlsZ7mgKdcbiAgdXBkYXRlcihhdm5vZGUpO1xuICAvLyDkv53lrZjliLDkupHnq69cbiAgdmFyIHVwZGF0ZWROb2RlPSBhd2FpdCBhdm5vZGUuc2F2ZSgpO1xuICByZXR1cm4gdXBkYXRlZE5vZGU7XG59XG5cbmNvbnN0IF9jcmVhdGVXaXRob3V0RGF0YT1fLmN1cnJ5KEFWLk9iamVjdC5jcmVhdGVXaXRob3V0RGF0YSk7XG5jb25zdCBjcmVhdGVBVk5vZGVXaXRob3V0RGF0YT1fY3JlYXRlV2l0aG91dERhdGEoJ05vZGUnKTsvL2ZuKGlkKVxuY29uc3QgdXBkYXRlQVZOb2Rlc0J5R2lkc0FzeW5jPShnaWRzLHVwZGF0ZXIpPT57XG4gIGNvbnN0IG5vZGVzPWdpZHMubWFwKGNyZWF0ZUFWTm9kZVdpdGhvdXREYXRhKTtcbiAgbm9kZXMubWFwKHVwZGF0ZXIpO1xuICByZXR1cm4gQVYuT2JqZWN0LnNhdmVBbGwobm9kZXMpO1xufVxuXG5jb25zdCBpbnNlcnROb2RlPWFzeW5jIChub2RlKT0+e1xuICAvLyBjb25zb2xlLmxvZyhcImluc2VydE5vZGVcIixub2RlKVxuICAgIHZhciBhdm5vZGUgPW5ldyBBVk5vZGUoKTtcbiAgICBhdm5vZGUuc2V0KCdub2RlJyxub2RlKTtcbiAgICBhdm5vZGU9YXdhaXQgYXZub2RlLnNhdmUoKTtcbiAgICByZXR1cm4gdChhdm5vZGUpO1xufVxuXG5jb25zdCB0PShhdm5vZGUpPT57IC8v5Y+W5Ye6bGVhbmNsb3Vk5Lit55qEbm9kZeaVsOaNru+8jOW5tuaKimlk6ZmE5LiKXG4gIGlmKCFhdm5vZGUpe1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBub2RlPSBhdm5vZGUuZ2V0KFwibm9kZVwiKTtcbiAgaWYobm9kZS5naWQ9PT0nMCcpe1xuICAgIG5vZGUuX2lkPScwJzsgLy/moLnoioLngrlcbiAgfWVsc2V7XG4gICAgbm9kZS5faWQ9YXZub2RlLmdldChcImlkXCIpO1xuICB9XG4gIHJldHVybiBub2RlO1xufVxuXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcbiAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIpXG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3QgYmVnaW5cIilcbiAgICB2YXIgcm9vdD1hd2FpdCBmaW5kTm9kZUJ5R2lkQXN5bmMoJzAnKTtcbiAgICBjb25zb2xlLmxvZyhcInJvb3RcIixyb290KVxuICAgIGlmKCFyb290KXtcbiAgICAgIGNvbnNvbGUubG9nKCdubyByb290JylcbiAgICAgIHZhciBkZWZhdWx0Um9vdD17XG4gICAgICAgIGdpZDonMCcsIFxuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6ICcwJyxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRyeXtcbiAgICAgICAgcm9vdD1hd2FpdCBpbnNlcnROb2RlKGRlZmF1bHRSb290KTtcbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodHlwZW9mIGNiID09J2Z1bmN0aW9uJyl7XG4gICAgICBjYigpOyAvL+mAmuefpXJvb3TmnoTlu7rlrozmiJBcbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIHJlYWRfbm9kZShnaWQpIHtcbiAgcmV0dXJuIGZpbmROb2RlQnlHaWRBc3luYyhnaWQpO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIGNvbnN0IG5vZGVzPWdpZHMubWFwKGNyZWF0ZUFWTm9kZVdpdGhvdXREYXRhKTtcbiAgICBjb25zdCBhdm5vZGVzPWF3YWl0IEFWLk9iamVjdC5mZXRjaEFsbChub2Rlcyk7XG4gICAgcmV0dXJuIGF2bm9kZXMubWFwKHQpO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBfbWtfc29uX2J5X2t2KHBOb2RlLGtleSx2YWx1ZSxiZ2lkKXtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKHBOb2RlKTtcbiAgICB2YXIgbmV3Tm9kZT17XG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgfTtcbiAgICBuZXdOb2RlW2tleV09dmFsdWU7XG4gICAgbmV3Tm9kZT0gYXdhaXQgaW5zZXJ0Tm9kZShuZXdOb2RlKTsvL+aPkuWFpeaWsOiKgueCuVxuICAgIHZhciBwb3M9MDtcbiAgICB2YXIgY2hpbGRyZW49cE5vZGUuX2xpbmsuY2hpbGRyZW47XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuICAgIH1cbiAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsbmV3Tm9kZS5faWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cbiAgICBhd2FpdCB1cGRhdGVBVk5vZGVCeUdpZEFzeW5jKHBOb2RlLl9pZCwoYXZub2RlKT0+e2F2bm9kZS5zZXQoJ25vZGUuX2xpbmsuY2hpbGRyZW4nLGNoaWxkcmVuKX0pO1xuICAgIHJldHVybiBuZXdOb2RlOy8v6L+U5Zue5paw6IqC54K5XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpe1xuICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSxiZ2lkKTtcbn1cblxuZnVuY3Rpb24gX21rX3Nvbl9ieV9uYW1lKHBOb2RlLG5hbWUsYmdpZCl7XG4gIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX25hbWVcIixuYW1lLGJnaWQpO1xufVxuXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZmluZE5vZGVCeUdpZEFzeW5jKHBnaWQpIDsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhKTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGZpbmROb2RlQnlHaWRBc3luYyhwZ2lkKSA7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHZhciBhdm5vZGU9YXdhaXQgZmluZEFWTm9kZUFzeW5jKFwibm9kZS5fbmFtZVwiLG5hbWUpO1xuICAgIGlmKGF2bm9kZSl7XG4gICAgICByZXR1cm4gdChhdm5vZGUpOy8v5aaC5pyJ55u05o6l6L+U5ZueXG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBfbWtfc29uX2J5X25hbWUocE5vZGUsbmFtZSk7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLGRhdGEpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBxdWVyeSA9IG5ldyBBVi5RdWVyeSgnTm9kZScpO1xuICAgIHF1ZXJ5LmNvbnRhaW5zKCdub2RlLl9saW5rLmNoaWxkcmVuJyxiZ2lkKTtcbiAgICB2YXIgcEFWTm9kZT1hd2FpdCBxdWVyeS5maXJzdCgpOy8v5om+5Yiw54i26IqC54K5XG4gICAgY29uc3QgcE5vZGU9dChwQVZOb2RlKTtcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgY29uc3Qgbm9kZT1hd2FpdCBfbWtfc29uX2J5X2RhdGEocE5vZGUsZGF0YSxiZ2lkKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSkoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVfZGF0YShnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIHVwZGF0ZUFWTm9kZUJ5R2lkQXN5bmMoZ2lkLGF2bm9kZT0+YXZub2RlLnNldChcIm5vZGUuZGF0YVwiLGRhdGEpKS50aGVuKHQpO1xufVxuXG5cbi8v6YCS5b2S6YGN5Y6G5omA5pyJ5a2Q6IqC54K5XG4vL2dpZHPmmK/opoHorr/pl67nmoToioLngrlpZOeahOWIl+ihqFxuLy92aXNpdOaYr+S4gOS4quWHveaVsOOAguiuv+mXruiKgueCueeahOWKqOS9nOOAglxuZnVuY3Rpb24gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oZ2lkcyx2aXNpdCkge1xuICBpZiAoIWdpZHN8fGdpZHMubGVuZ3RoPT0wKSB7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO30vL+mcgOimgei/lOWbnuS4gOS4qnByb21pc2UgXG4gIHJldHVybiBQcm9taXNlLmFsbChnaWRzLm1hcChnaWQgPT4ge1xuICAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PnsgLy/or7vlj5blvZPliY3oioLngrlcbiAgICAgIHJldHVybiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihub2RlLl9saW5rLmNoaWxkcmVuLHZpc2l0KS50aGVuKCgpPT57IC8v6K6/6Zeu5omA5pyJ5a2Q6IqC54K5XG4gICAgICAgIHJldHVybiB2aXNpdChub2RlKTsgLy/nhLblkI7orr/pl67lvZPliY3oioLngrlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSkpO1xufVxuXG4vLyAvL+agh+iusOWIoOmZpOiKgueCueS4juaJgOacieWtkOWtmeiKgueCuVxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgIGlmKGdpZD09JzAnKXJldHVybjsvL+agueiKgueCueS4jeiDveWIoOmZpOOAglxuICAgICB2YXIgbm9kZT1hd2FpdCByZWFkX25vZGUoZ2lkKTsgLy/lhYjor7vlj5bopoHliKDpmaTnmoToioLngrlcbiAgICAgaWYoIW5vZGUpcmV0dXJuOy8v5bey57uP5LiN5a2Y5Zyo77yM6L+U5ZueXG4gICAgIC8v5pS26ZuG5omA5pyJ5a2Q6IqC54K5XG4gICAgIHZhciBnaWRzZm9yUmVtb3ZlPVtdO1xuICAgICBjb25zdCBybT0obm9kZSk9PntnaWRzZm9yUmVtb3ZlLnB1c2gobm9kZS5faWQpfTtcbiAgICAgYXdhaXQgX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oW2dpZF0scm0pO1xuICAgICAvL+aJuemHj+WIoOmZpC8v5qCH6K6w5Li65Yig6ZmkXG4gICAgIGNvbnN0IHNldFJtPShhdm5vZGUpPT57YXZub2RlLnNldChcIl9ybVwiLHRydWUpO31cbiAgICAgYXdhaXQgdXBkYXRlQVZOb2Rlc0J5R2lkc0FzeW5jKGdpZHNmb3JSZW1vdmUsc2V0Um0pO1xuICAgICBhd2FpdCB1cGRhdGVBVk5vZGVCeUdpZEFzeW5jKG5vZGUuX2xpbmsucCwoYXZub2RlKT0+e2F2bm9kZS5yZW1vdmUoXCJub2RlLl9saW5rLmNoaWxkcmVuXCIsZ2lkKX0pXG4gICAgIHJldHVybiBnaWRzZm9yUmVtb3ZlO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBfaXNBbmNlc3RvcihwZ2lkLGdpZCl7XG4gIGlmKGdpZD09JzAnKXJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyAvLycwJ+S4uuagueiKgueCueOAguS7u+S9leiKgueCuemDveS4jeaYrycwJ+eahOeItuiKgueCuVxuICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57XG4gICAgLy8gY29uc29sZS5sb2coJ2NoZWNrJyxwZ2lkLG5vZGUuX2xpbmsucCxub2RlKVxuICAgIGlmKG5vZGUuX2xpbmsucD09PXBnaWQpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gX2lzQW5jZXN0b3IocGdpZCxub2RlLl9saW5rLnApO1xuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gX21vdmVfYXNfc29uKGdpZCwgbnBBVk5vZGUsYmdpZCl7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZT1hd2FpdCBfaXNBbmNlc3RvcihnaWQsbnBBVk5vZGUuaWQpIDtcbiAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcbiAgICAgIGNvbnNvbGUubG9nKGdpZCwnaXMgYW5jZXN0b3Igb2YnLG5wQVZOb2RlLmlkKVxuICAgICAgcmV0dXJuIG51bGw7Ly/opoHnp7vliqjnmoToioLngrnkuI3og73mmK/nm67moIfniLboioLngrnnmoTplb/ovojoioLngrlcbiAgICB9XG4gICAgdmFyIHBBVk5vZGU9YXdhaXQgZmluZFBhcmVudEFWTm9kZUFzeW5jKGdpZCkvL+aJvuWIsOWOn+eItuiKgueCuVxuICAgIHBBVk5vZGUucmVtb3ZlKCdub2RlLl9saW5rLmNoaWxkcmVuJywgZ2lkKTsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuICAgIGF3YWl0IHBBVk5vZGUuc2F2ZSgpO1xuXG4gICAgaWYobnBBVk5vZGUuaWQ9PT1wQVZOb2RlLmlkKXsvL+WmguaenOaWsOeahOeItuiKgueCueS4juaXp+eahOeItuiKgueCueebuOWQjOOAguimgeabtOaWsOeItuiKgueCuVxuICAgICAgbnBBVk5vZGU9cEFWTm9kZTsgXG4gICAgfWVsc2V7XG4gICAgICBhd2FpdCB1cGRhdGVBVk5vZGVCeUdpZEFzeW5jKGdpZCxhdm5vZGU9Pnthdm5vZGUuc2V0KFwibm9kZS5fbGluay5wXCIsbnBBVk5vZGUuaWQpfSkvL+aUueWPmGdpZOeahOeItuiKgueCueS4uuaWsOeItuiKgueCuVxuICAgIH1cbiAgICB2YXIgcG9zPTA7XG4gICAgdmFyIG5wTm9kZT10KG5wQVZOb2RlKTtcbiAgICB2YXIgY2hpbGRyZW49bnBOb2RlLl9saW5rLmNoaWxkcmVuO1xuICAgIC8vIGNvbnNvbGUubG9nKCdiZWZvcmUnLGNoaWxkcmVuKVxuICAgIGlmKGJnaWQpe1xuICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcbiAgICB9XG4gICAgY2hpbGRyZW4uc3BsaWNlKHBvcywwLGdpZCk7Ly/miormlrDoioLngrnnmoRJROaPkuWFpeWIsOeItuiKgueCueS4rVxuICAgIC8vIGNvbnNvbGUubG9nKCdhZnRlcicsY2hpbGRyZW4sbnBOb2RlKVxuICAgIGF3YWl0IHVwZGF0ZUFWTm9kZUJ5R2lkQXN5bmMobnBOb2RlLl9pZCxhdm5vZGU9Pnthdm5vZGUuc2V0KFwibm9kZS5fbGluay5jaGlsZHJlblwiLGNoaWxkcmVuKX0pLy/mj5LlhaXniLboioLngrlcbiAgICByZXR1cm4gYXdhaXQgcmVhZF9ub2RlKGdpZCk7XG4gIH0pKCk7ICBcbn1cblxuLy/miopnaWToioLngrnnp7vliqjkuLpwZ2lk55qE5a2Q6IqC54K5XG4vL+WMheWQqzPmraXjgIIgMS7ku45naWTnmoTljp/niLboioLngrnliKDpmaTjgIIy5pS55Y+YZ2lk55qE5b2T5YmN54i26IqC54K544CCIDPjgILms6jlhozliLDmlrDniLboioLngrlcbi8v56e75Yqo5YmN6ZyA6KaB5YGa5qOA5p+l44CC56WW5YWI6IqC54K55LiN6IO956e75Yqo5Li65ZCO6L6I55qE5a2Q6IqC54K5XG5mdW5jdGlvbiBtb3ZlX2FzX3NvbihnaWQsIHBnaWQpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBucEFWTm9kZT1hd2FpdCBmaW5kQVZOb2RlQnlHaWRBc3luYyhwZ2lkKTsgLy/mib7liLDmlrDniLboioLngrlcbiAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucEFWTm9kZSk7XG4gIH0pKCk7ICBcbn1cblxuZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIG5wQVZOb2RlPWF3YWl0IGZpbmRQYXJlbnRBVk5vZGVBc3luYyhiZ2lkKTsvL+aJvuWIsOaWsOeItuiKgueCuVxuICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wQVZOb2RlLGJnaWQpO1xuICB9KSgpOyBcbn0iXX0=