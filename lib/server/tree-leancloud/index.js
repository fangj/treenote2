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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1sZWFuY2xvdWQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNLElBQUUsUUFBUSxRQUFSLENBQVI7QUFDQSxJQUFNLEtBQUcsUUFBUSxtQkFBUixDQUFUOztBQUVBLFNBQVMsY0FBVCxDQUF3QixFQUF4QixFQUEyQjtBQUN6QixzQkFBb0IsRUFBcEI7QUFDQSxTQUFPO0FBQ0wsd0JBREs7QUFFTCwwQkFGSztBQUdMLGtDQUhLO0FBSUwsa0NBSks7QUFLTCwwQ0FMSztBQU1MLDRCQU5LO0FBT0wsa0JBUEs7QUFRTCw0QkFSSztBQVNMLG9DQVRLO0FBVUw7QUFDQTtBQVhLLEdBQVA7QUFhRDs7QUFFRCxPQUFPLE9BQVAsR0FBZSxjQUFmOztBQUVBLElBQUksU0FBUyxtQ0FBYjtBQUNBLElBQUksVUFBVSwwQkFBZDtBQUNBLEdBQUcsSUFBSCxDQUFRO0FBQ04sU0FBTyxNQUREO0FBRU4sVUFBUTtBQUZGLENBQVI7QUFJQSxJQUFNLFNBQVMsR0FBRyxNQUFILENBQVUsTUFBVixDQUFpQixNQUFqQixDQUFmO0FBQ0EsSUFBTSxrQkFBZ0IsU0FBaEIsZUFBZ0IsQ0FBQyxHQUFELEVBQUssS0FBTCxFQUFhO0FBQ2pDLE1BQUksUUFBUSxJQUFJLEdBQUcsS0FBUCxDQUFhLE1BQWIsQ0FBWjtBQUNBLFFBQU0sT0FBTixDQUFjLEdBQWQsRUFBbUIsS0FBbkI7QUFDQSxTQUFPLE1BQU0sS0FBTixFQUFQO0FBQ0QsQ0FKRDtBQUtBLElBQU0sd0JBQXNCLFNBQXRCLHFCQUFzQixDQUFDLEdBQUQsRUFBTztBQUNqQyxNQUFJLFFBQVEsSUFBSSxHQUFHLEtBQVAsQ0FBYSxNQUFiLENBQVo7QUFDQSxRQUFNLFFBQU4sQ0FBZSxxQkFBZixFQUFzQyxHQUF0QztBQUNBLFNBQU8sTUFBTSxLQUFOLEVBQVAsQ0FIaUMsQ0FHWjtBQUN0QixDQUpEO0FBS0EsSUFBTSx1QkFBc0IsaUJBQU8sR0FBUDtBQUFB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QVA7QUFJRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IF89cmVxdWlyZSgnbG9kYXNoJyk7XHJcbmNvbnN0IEFWPXJlcXVpcmUoJ2xlYW5jbG91ZC1zdG9yYWdlJyk7XHJcblxyXG5mdW5jdGlvbiB0cmVlX2xlYW5jbG91ZChjYil7XHJcbiAgYnVpbGRSb290SWZOb3RFeGlzdChjYik7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlYWRfbm9kZSxcclxuICAgIHJlYWRfbm9kZXMsXHJcbiAgICBta19zb25fYnlfZGF0YSxcclxuICAgIG1rX3Nvbl9ieV9uYW1lLFxyXG4gICAgbWtfYnJvdGhlcl9ieV9kYXRhLFxyXG4gICAgdXBkYXRlX2RhdGEsXHJcbiAgICByZW1vdmUsXHJcbiAgICBtb3ZlX2FzX3NvbixcclxuICAgIG1vdmVfYXNfYnJvdGhlcixcclxuICAgIC8vZm9yIHRlc3RcclxuICAgIGJ1aWxkUm9vdElmTm90RXhpc3RcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPXRyZWVfbGVhbmNsb3VkO1xyXG5cclxudmFyIEFQUF9JRCA9ICdPNWNoRTVvQ3JENjRwSUVpbXdlVFRubzUtZ3pHem9Ic3onO1xyXG52YXIgQVBQX0tFWSA9ICdQbWRTVEhkSmsySXk4ODdRV0gweXhCUHgnO1xyXG5BVi5pbml0KHtcclxuICBhcHBJZDogQVBQX0lELFxyXG4gIGFwcEtleTogQVBQX0tFWVxyXG59KTtcclxuY29uc3QgQVZOb2RlID0gQVYuT2JqZWN0LmV4dGVuZCgnTm9kZScpO1xyXG5jb25zdCBmaW5kQVZOb2RlQXN5bmM9KGtleSx2YWx1ZSk9PntcclxuICB2YXIgcXVlcnkgPSBuZXcgQVYuUXVlcnkoJ05vZGUnKTtcclxuICBxdWVyeS5lcXVhbFRvKGtleSwgdmFsdWUpO1xyXG4gIHJldHVybiBxdWVyeS5maXJzdCgpO1xyXG59XHJcbmNvbnN0IGZpbmRQYXJlbnRBVk5vZGVBc3luYz0oZ2lkKT0+e1xyXG4gIHZhciBxdWVyeSA9IG5ldyBBVi5RdWVyeSgnTm9kZScpO1xyXG4gIHF1ZXJ5LmNvbnRhaW5zKFwibm9kZS5fbGluay5jaGlsZHJlblwiLCBnaWQpO1xyXG4gIHJldHVybiBxdWVyeS5maXJzdCgpOy8v5om+5Yiw5paw54i26IqC54K5XHJcbn1cclxuY29uc3QgZmluZEFWTm9kZUJ5R2lkQXN5bmM9IGFzeW5jIChnaWQpPT57XHJcbiAgdmFyIGF2bm9kZTtcclxuICB2YXIgcXVlcnkgPSBuZXcgQVYuUXVlcnkoJ05vZGUnKTtcclxuICBpZihnaWQ9PT0nMCcpey8v5qC56IqC54K555qEaWTmlL7lnKhub2RlLmdpZOS4rVxyXG4gICAgcXVlcnkuZXF1YWxUbygnbm9kZS5naWQnLCBnaWQpO1xyXG4gICAgdHJ5e1xyXG4gICAgICBhdm5vZGU9YXdhaXQgcXVlcnkuZmlyc3QoKTtcclxuICAgIH1jYXRjaChlKXtcclxuICAgICAgY29uc29sZS5lcnJvcihlKTsvL+aJvuS4jeWIsOaXtuS8muaKm+WHuumUmeivr1xyXG4gICAgfVxyXG4gIH1lbHNle1xyXG4gICAgYXZub2RlPWF3YWl0IHF1ZXJ5LmdldChnaWQpLy/mma7pgJroioLngrnnmoRpZOWwseaYr09iamVjdElEXHJcbiAgICBpZihhdm5vZGUgJiYgYXZub2RlLmdldCgnX3JtJykpey8vcm3ooajnpLroioLngrnlt7Lnu4/liKDpmaRcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBhdm5vZGU7XHJcbn1cclxuXHJcbmNvbnN0IGZpbmROb2RlQnlHaWRBc3luYz0gYXN5bmMgKGdpZCk9PntcclxuICB2YXIgYXZub2RlPWF3YWl0IGZpbmRBVk5vZGVCeUdpZEFzeW5jKGdpZCk7XHJcbiAgcmV0dXJuIHQoYXZub2RlKTtcclxufVxyXG5cclxuY29uc3QgdXBkYXRlQVZOb2RlQnlHaWRBc3luYz1hc3luYyAoZ2lkLHVwZGF0ZXIpPT57XHJcbiAgdmFyIGF2bm9kZTtcclxuICBpZihnaWQ9PT0nMCcpe1xyXG4gICAgYXZub2RlID0gYXdhaXQgZmluZEFWTm9kZUJ5R2lkQXN5bmMoZ2lkKTtcclxuICB9ZWxzZXtcclxuICAgIC8vIOesrOS4gOS4quWPguaVsOaYryBjbGFzc05hbWXvvIznrKzkuozkuKrlj4LmlbDmmK8gb2JqZWN0SWRcclxuICAgIGF2bm9kZSA9IEFWLk9iamVjdC5jcmVhdGVXaXRob3V0RGF0YSgnTm9kZScsIGdpZCk7XHJcbiAgfVxyXG4gIC8vIOS/ruaUueWxnuaAp1xyXG4gIHVwZGF0ZXIoYXZub2RlKTtcclxuICAvLyDkv53lrZjliLDkupHnq69cclxuICB2YXIgdXBkYXRlZE5vZGU9IGF3YWl0IGF2bm9kZS5zYXZlKCk7XHJcbiAgcmV0dXJuIHVwZGF0ZWROb2RlO1xyXG59XHJcblxyXG5jb25zdCBfY3JlYXRlV2l0aG91dERhdGE9Xy5jdXJyeShBVi5PYmplY3QuY3JlYXRlV2l0aG91dERhdGEpO1xyXG5jb25zdCBjcmVhdGVBVk5vZGVXaXRob3V0RGF0YT1fY3JlYXRlV2l0aG91dERhdGEoJ05vZGUnKTsvL2ZuKGlkKVxyXG5jb25zdCB1cGRhdGVBVk5vZGVzQnlHaWRzQXN5bmM9KGdpZHMsdXBkYXRlcik9PntcclxuICBjb25zdCBub2Rlcz1naWRzLm1hcChjcmVhdGVBVk5vZGVXaXRob3V0RGF0YSk7XHJcbiAgbm9kZXMubWFwKHVwZGF0ZXIpO1xyXG4gIHJldHVybiBBVi5PYmplY3Quc2F2ZUFsbChub2Rlcyk7XHJcbn1cclxuXHJcbmNvbnN0IGluc2VydE5vZGU9YXN5bmMgKG5vZGUpPT57XHJcbiAgLy8gY29uc29sZS5sb2coXCJpbnNlcnROb2RlXCIsbm9kZSlcclxuICAgIHZhciBhdm5vZGUgPW5ldyBBVk5vZGUoKTtcclxuICAgIGF2bm9kZS5zZXQoJ25vZGUnLG5vZGUpO1xyXG4gICAgYXZub2RlPWF3YWl0IGF2bm9kZS5zYXZlKCk7XHJcbiAgICByZXR1cm4gdChhdm5vZGUpO1xyXG59XHJcblxyXG5jb25zdCB0PShhdm5vZGUpPT57IC8v5Y+W5Ye6bGVhbmNsb3Vk5Lit55qEbm9kZeaVsOaNru+8jOW5tuaKimlk6ZmE5LiKXHJcbiAgaWYoIWF2bm9kZSl7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgdmFyIG5vZGU9IGF2bm9kZS5nZXQoXCJub2RlXCIpO1xyXG4gIGlmKG5vZGUuZ2lkPT09JzAnKXtcclxuICAgIG5vZGUuX2lkPScwJzsgLy/moLnoioLngrlcclxuICB9ZWxzZXtcclxuICAgIG5vZGUuX2lkPWF2bm9kZS5nZXQoXCJpZFwiKTtcclxuICB9XHJcbiAgcmV0dXJuIG5vZGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkUm9vdElmTm90RXhpc3QoY2Ipe1xyXG4gIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiKVxyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdCBiZWdpblwiKVxyXG4gICAgdmFyIHJvb3Q9YXdhaXQgZmluZE5vZGVCeUdpZEFzeW5jKCcwJyk7XHJcbiAgICBjb25zb2xlLmxvZyhcInJvb3RcIixyb290KVxyXG4gICAgaWYoIXJvb3Qpe1xyXG4gICAgICBjb25zb2xlLmxvZygnbm8gcm9vdCcpXHJcbiAgICAgIHZhciBkZWZhdWx0Um9vdD17XHJcbiAgICAgICAgZ2lkOicwJywgXHJcbiAgICAgICAgX2xpbms6IHtcclxuICAgICAgICAgIHA6ICcwJyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgdHJ5e1xyXG4gICAgICAgIHJvb3Q9YXdhaXQgaW5zZXJ0Tm9kZShkZWZhdWx0Um9vdCk7XHJcbiAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZih0eXBlb2YgY2IgPT0nZnVuY3Rpb24nKXtcclxuICAgICAgY2IoKTsgLy/pgJrnn6Vyb2905p6E5bu65a6M5oiQXHJcbiAgICB9XHJcbiAgICByZXR1cm4gcm9vdDtcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX25vZGUoZ2lkKSB7XHJcbiAgcmV0dXJuIGZpbmROb2RlQnlHaWRBc3luYyhnaWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICBjb25zdCBub2Rlcz1naWRzLm1hcChjcmVhdGVBVk5vZGVXaXRob3V0RGF0YSk7XHJcbiAgICBjb25zdCBhdm5vZGVzPWF3YWl0IEFWLk9iamVjdC5mZXRjaEFsbChub2Rlcyk7XHJcbiAgICByZXR1cm4gYXZub2Rlcy5tYXAodCk7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX21rX3Nvbl9ieV9rdihwTm9kZSxrZXksdmFsdWUsYmdpZCl7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgLy8gY29uc29sZS5sb2cocE5vZGUpO1xyXG4gICAgdmFyIG5ld05vZGU9e1xyXG4gICAgICAgIF9saW5rOiB7XHJcbiAgICAgICAgICBwOiBwTm9kZS5faWQsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW11cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgbmV3Tm9kZVtrZXldPXZhbHVlO1xyXG4gICAgbmV3Tm9kZT0gYXdhaXQgaW5zZXJ0Tm9kZShuZXdOb2RlKTsvL+aPkuWFpeaWsOiKgueCuVxyXG4gICAgdmFyIHBvcz0wO1xyXG4gICAgdmFyIGNoaWxkcmVuPXBOb2RlLl9saW5rLmNoaWxkcmVuO1xyXG4gICAgaWYoYmdpZCl7XHJcbiAgICAgIHBvcz1jaGlsZHJlbi5pbmRleE9mKGJnaWQpKzE7XHJcbiAgICB9XHJcbiAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsbmV3Tm9kZS5faWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cclxuICAgIGF3YWl0IHVwZGF0ZUFWTm9kZUJ5R2lkQXN5bmMocE5vZGUuX2lkLChhdm5vZGUpPT57YXZub2RlLnNldCgnbm9kZS5fbGluay5jaGlsZHJlbicsY2hpbGRyZW4pfSk7XHJcbiAgICByZXR1cm4gbmV3Tm9kZTsvL+i/lOWbnuaWsOiKgueCuVxyXG4gIH0pKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpe1xyXG4gIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX2RhdGFcIixkYXRhLGJnaWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfbWtfc29uX2J5X25hbWUocE5vZGUsbmFtZSxiZ2lkKXtcclxuICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9uYW1lXCIsbmFtZSxiZ2lkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgIHZhciBwTm9kZT1hd2FpdCBmaW5kTm9kZUJ5R2lkQXN5bmMocGdpZCkgOy8v5om+5Yiw54i26IqC54K5XHJcbiAgICBpZighcE5vZGUpe1xyXG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XHJcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGF3YWl0IF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhKTtcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgdmFyIHBOb2RlPWF3YWl0IGZpbmROb2RlQnlHaWRBc3luYyhwZ2lkKSA7Ly/mib7liLDniLboioLngrlcclxuICAgIGlmKCFwTm9kZSl7XHJcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcclxuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXHJcbiAgICB9XHJcbiAgICB2YXIgYXZub2RlPWF3YWl0IGZpbmRBVk5vZGVBc3luYyhcIm5vZGUuX25hbWVcIixuYW1lKTtcclxuICAgIGlmKGF2bm9kZSl7XHJcbiAgICAgIHJldHVybiB0KGF2bm9kZSk7Ly/lpoLmnInnm7TmjqXov5Tlm55cclxuICAgIH1cclxuICAgIHJldHVybiBhd2FpdCBfbWtfc29uX2J5X25hbWUocE5vZGUsbmFtZSk7XHJcbiAgfSkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfYnJvdGhlcl9ieV9kYXRhKGJnaWQsZGF0YSkge1xyXG4gIHJldHVybiAoYXN5bmMgKCk9PntcclxuICAgIHZhciBxdWVyeSA9IG5ldyBBVi5RdWVyeSgnTm9kZScpO1xyXG4gICAgcXVlcnkuY29udGFpbnMoJ25vZGUuX2xpbmsuY2hpbGRyZW4nLGJnaWQpO1xyXG4gICAgdmFyIHBBVk5vZGU9YXdhaXQgcXVlcnkuZmlyc3QoKTsvL+aJvuWIsOeItuiKgueCuVxyXG4gICAgY29uc3QgcE5vZGU9dChwQVZOb2RlKTtcclxuICAgIGlmKCFwTm9kZSl7XHJcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgb2YgYnJvdGhlciAnK2JnaWQpO1xyXG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcclxuICAgIH1cclxuICAgIGNvbnN0IG5vZGU9YXdhaXQgX21rX3Nvbl9ieV9kYXRhKHBOb2RlLGRhdGEsYmdpZCk7XHJcbiAgICByZXR1cm4gbm9kZTtcclxuICB9KSgpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlX2RhdGEoZ2lkLCBkYXRhKSB7XHJcbiAgcmV0dXJuIHVwZGF0ZUFWTm9kZUJ5R2lkQXN5bmMoZ2lkLGF2bm9kZT0+YXZub2RlLnNldChcIm5vZGUuZGF0YVwiLGRhdGEpKS50aGVuKHQpO1xyXG59XHJcblxyXG5cclxuLy/pgJLlvZLpgY3ljobmiYDmnInlrZDoioLngrlcclxuLy9naWRz5piv6KaB6K6/6Zeu55qE6IqC54K5aWTnmoTliJfooahcclxuLy92aXNpdOaYr+S4gOS4quWHveaVsOOAguiuv+mXruiKgueCueeahOWKqOS9nOOAglxyXG5mdW5jdGlvbiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihnaWRzLHZpc2l0KSB7XHJcbiAgaWYgKCFnaWRzfHxnaWRzLmxlbmd0aD09MCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoKTt9Ly/pnIDopoHov5Tlm57kuIDkuKpwcm9taXNlIFxyXG4gIHJldHVybiBQcm9taXNlLmFsbChnaWRzLm1hcChnaWQgPT4ge1xyXG4gICAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+eyAvL+ivu+WPluW9k+WJjeiKgueCuVxyXG4gICAgICByZXR1cm4gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4obm9kZS5fbGluay5jaGlsZHJlbix2aXNpdCkudGhlbigoKT0+eyAvL+iuv+mXruaJgOacieWtkOiKgueCuVxyXG4gICAgICAgIHJldHVybiB2aXNpdChub2RlKTsgLy/nhLblkI7orr/pl67lvZPliY3oioLngrlcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfSkpO1xyXG59XHJcblxyXG4vLyAvL+agh+iusOWIoOmZpOiKgueCueS4juaJgOacieWtkOWtmeiKgueCuVxyXG5mdW5jdGlvbiByZW1vdmUoZ2lkKSB7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgIGlmKGdpZD09JzAnKXJldHVybjsvL+agueiKgueCueS4jeiDveWIoOmZpOOAglxyXG4gICAgIHZhciBub2RlPWF3YWl0IHJlYWRfbm9kZShnaWQpOyAvL+WFiOivu+WPluimgeWIoOmZpOeahOiKgueCuVxyXG4gICAgIGlmKCFub2RlKXJldHVybjsvL+W3sue7j+S4jeWtmOWcqO+8jOi/lOWbnlxyXG4gICAgIC8v5pS26ZuG5omA5pyJ5a2Q6IqC54K5XHJcbiAgICAgdmFyIGdpZHNmb3JSZW1vdmU9W107XHJcbiAgICAgY29uc3Qgcm09KG5vZGUpPT57Z2lkc2ZvclJlbW92ZS5wdXNoKG5vZGUuX2lkKX07XHJcbiAgICAgYXdhaXQgX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oW2dpZF0scm0pO1xyXG4gICAgIC8v5om56YeP5Yig6ZmkLy/moIforrDkuLrliKDpmaRcclxuICAgICBjb25zdCBzZXRSbT0oYXZub2RlKT0+e2F2bm9kZS5zZXQoXCJfcm1cIix0cnVlKTt9XHJcbiAgICAgYXdhaXQgdXBkYXRlQVZOb2Rlc0J5R2lkc0FzeW5jKGdpZHNmb3JSZW1vdmUsc2V0Um0pO1xyXG4gICAgIGF3YWl0IHVwZGF0ZUFWTm9kZUJ5R2lkQXN5bmMobm9kZS5fbGluay5wLChhdm5vZGUpPT57YXZub2RlLnJlbW92ZShcIm5vZGUuX2xpbmsuY2hpbGRyZW5cIixnaWQpfSlcclxuICAgICByZXR1cm4gZ2lkc2ZvclJlbW92ZTtcclxuICB9KSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfaXNBbmNlc3RvcihwZ2lkLGdpZCl7XHJcbiAgaWYoZ2lkPT0nMCcpcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7IC8vJzAn5Li65qC56IqC54K544CC5Lu75L2V6IqC54K56YO95LiN5pivJzAn55qE54i26IqC54K5XHJcbiAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+e1xyXG4gICAgLy8gY29uc29sZS5sb2coJ2NoZWNrJyxwZ2lkLG5vZGUuX2xpbmsucCxub2RlKVxyXG4gICAgaWYobm9kZS5fbGluay5wPT09cGdpZCl7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHJldHVybiBfaXNBbmNlc3RvcihwZ2lkLG5vZGUuX2xpbmsucCk7XHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gX21vdmVfYXNfc29uKGdpZCwgbnBBVk5vZGUsYmdpZCl7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgdmFyIGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGU9YXdhaXQgX2lzQW5jZXN0b3IoZ2lkLG5wQVZOb2RlLmlkKSA7XHJcbiAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcclxuICAgICAgY29uc29sZS5sb2coZ2lkLCdpcyBhbmNlc3RvciBvZicsbnBBVk5vZGUuaWQpXHJcbiAgICAgIHJldHVybiBudWxsOy8v6KaB56e75Yqo55qE6IqC54K55LiN6IO95piv55uu5qCH54i26IqC54K555qE6ZW/6L6I6IqC54K5XHJcbiAgICB9XHJcbiAgICB2YXIgcEFWTm9kZT1hd2FpdCBmaW5kUGFyZW50QVZOb2RlQXN5bmMoZ2lkKS8v5om+5Yiw5Y6f54i26IqC54K5XHJcbiAgICBwQVZOb2RlLnJlbW92ZSgnbm9kZS5fbGluay5jaGlsZHJlbicsIGdpZCk7Ly/ku47ljp/niLboioLngrnliKDpmaRcclxuICAgIGF3YWl0IHBBVk5vZGUuc2F2ZSgpO1xyXG5cclxuICAgIGlmKG5wQVZOb2RlLmlkPT09cEFWTm9kZS5pZCl7Ly/lpoLmnpzmlrDnmoTniLboioLngrnkuI7ml6fnmoTniLboioLngrnnm7jlkIzjgILopoHmm7TmlrDniLboioLngrlcclxuICAgICAgbnBBVk5vZGU9cEFWTm9kZTsgXHJcbiAgICB9ZWxzZXtcclxuICAgICAgYXdhaXQgdXBkYXRlQVZOb2RlQnlHaWRBc3luYyhnaWQsYXZub2RlPT57YXZub2RlLnNldChcIm5vZGUuX2xpbmsucFwiLG5wQVZOb2RlLmlkKX0pLy/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcclxuICAgIH1cclxuICAgIHZhciBwb3M9MDtcclxuICAgIHZhciBucE5vZGU9dChucEFWTm9kZSk7XHJcbiAgICB2YXIgY2hpbGRyZW49bnBOb2RlLl9saW5rLmNoaWxkcmVuO1xyXG4gICAgLy8gY29uc29sZS5sb2coJ2JlZm9yZScsY2hpbGRyZW4pXHJcbiAgICBpZihiZ2lkKXtcclxuICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcclxuICAgIH1cclxuICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxnaWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cclxuICAgIC8vIGNvbnNvbGUubG9nKCdhZnRlcicsY2hpbGRyZW4sbnBOb2RlKVxyXG4gICAgYXdhaXQgdXBkYXRlQVZOb2RlQnlHaWRBc3luYyhucE5vZGUuX2lkLGF2bm9kZT0+e2F2bm9kZS5zZXQoXCJub2RlLl9saW5rLmNoaWxkcmVuXCIsY2hpbGRyZW4pfSkvL+aPkuWFpeeItuiKgueCuVxyXG4gICAgcmV0dXJuIGF3YWl0IHJlYWRfbm9kZShnaWQpO1xyXG4gIH0pKCk7ICBcclxufVxyXG5cclxuLy/miopnaWToioLngrnnp7vliqjkuLpwZ2lk55qE5a2Q6IqC54K5XHJcbi8v5YyF5ZCrM+atpeOAgiAxLuS7jmdpZOeahOWOn+eItuiKgueCueWIoOmZpOOAgjLmlLnlj5hnaWTnmoTlvZPliY3niLboioLngrnjgIIgM+OAguazqOWGjOWIsOaWsOeItuiKgueCuVxyXG4vL+enu+WKqOWJjemcgOimgeWBmuajgOafpeOAguelluWFiOiKgueCueS4jeiDveenu+WKqOS4uuWQjui+iOeahOWtkOiKgueCuVxyXG5mdW5jdGlvbiBtb3ZlX2FzX3NvbihnaWQsIHBnaWQpIHtcclxuICByZXR1cm4gKGFzeW5jICgpPT57XHJcbiAgICB2YXIgbnBBVk5vZGU9YXdhaXQgZmluZEFWTm9kZUJ5R2lkQXN5bmMocGdpZCk7IC8v5om+5Yiw5paw54i26IqC54K5XHJcbiAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucEFWTm9kZSk7XHJcbiAgfSkoKTsgIFxyXG59XHJcblxyXG5mdW5jdGlvbiBtb3ZlX2FzX2Jyb3RoZXIoZ2lkLCBiZ2lkKSB7XHJcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xyXG4gICAgdmFyIG5wQVZOb2RlPWF3YWl0IGZpbmRQYXJlbnRBVk5vZGVBc3luYyhiZ2lkKTsvL+aJvuWIsOaWsOeItuiKgueCuVxyXG4gICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBBVk5vZGUsYmdpZCk7XHJcbiAgfSkoKTsgXHJcbn0iXX0=