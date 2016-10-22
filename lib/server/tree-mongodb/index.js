'use strict';

// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
// var Promise = require('bluebird');
var R = require('ramda');

var result = R.prop('result');

var db;
function tree_mongodb(_db, cb) {
  // db=Promise.promisifyAll(_db);
  db = _db;
  buildRootIfNotExist().then(typeof cb === 'function' ? cb() : null); //cb用于通知测试程序
  return {
    read_node: read_node,
    // read_nodes,
    mk_son_by_data: mk_son_by_data,
    mk_son_by_name: mk_son_by_name,
    mk_brother_by_data: mk_brother_by_data,
    update_data: update_data,
    remove: remove,
    // move_as_son,
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

var _insertChildren = function _insertChildren(pNode, gid, bgid) {
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

function read_node(gid) {
  //rm标记表示节点已经被删除
  return db.findOne({ _id: gid, _rm: { $exists: false } });
}

// function read_nodes(gids) {
//   return (async ()=>{
//     var nodes=await db.findAsync({_id:{$in:gids},_rm: { $exists: false }});
//     return nodes;
//   })();
// }
//

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
            return regeneratorRuntime.awrap(_insertChildren(pNode, newNode._id, bgid));

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
            return _context3.abrupt('return', _mk_son_by_kv(pNode, "_data", data));

          case 7:
          case 'end':
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

            return _context4.abrupt('return', node);

          case 11:
            return _context4.abrupt('return', _mk_son_by_kv(pNode, "_name", name));

          case 12:
          case 'end':
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
            return regeneratorRuntime.awrap(db.findOne({ "_link.children": bgid }));

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

            return _context6.abrupt('return');

          case 2:
            _context6.next = 4;
            return regeneratorRuntime.awrap(read_node(gid));

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

// function _isAncestor(pgid,gid){
//   if(gid=='0')return Promise.resolve(false); //'0'为根节点。任何节点都不是'0'的父节点
//   return read_node(gid).then(node=>{
//     // console.log('check',pgid,node._link.p,node)
//     if(node._link.p===pgid){
//       return true;
//     }else{
//       return _isAncestor(pgid,node._link.p);
//     }
//   })
// }

// function _move_as_son(gid, npNode,bgid){
//   return (async ()=>{
//     var gidIsAncestorOfNewParentNode=await _isAncestor(gid,npNode._id);
//     if(gidIsAncestorOfNewParentNode){
//       console.log(gid,'is ancestor of',npNode._id)
//       return null;//要移动的节点不能是目标父节点的长辈节点
//     }
//     var pNode=await db.findOne({"_link.children":{$elemMatch:gid}});//找到原父节点

//     await db.updateAsync({_id:pNode._id},  { $pull: { "_link.children": gid } } , {}) ;//从原父节点删除
//     if(npNode._id===pNode._id){//如果新的父节点与旧的父节点相同。要更新父节点
//       npNode=await db.findOne({_id:npNode._id, _rm: { $exists: false }});
//     }else{
//       await db.updateAsync({_id:gid},  { $set: { "_link.p": npNode._id } }, {});//改变gid的父节点为新父节点
//     }
//     var pos=0;
//     var children=npNode._link.children;
//     if(bgid){
//       pos=children.indexOf(bgid)+1;
//     }
//     children.splice(pos,0,gid);//把新节点的ID插入到父节点中
//     await db.updateAsync({_id:npNode._id}, npNode, {});//插入父节点
// return await read_node(gid);
//   })(); 
// }

// //把gid节点移动为pgid的子节点
// //包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
// //移动前需要做检查。祖先节点不能移动为后辈的子节点
// function move_as_son(gid, pgid) {
//   return (async ()=>{
//     var npNode=await db.findOne({"_id":pgid});//找到新父节点
//     return _move_as_son(gid,npNode);
//   })(); 
// }

// function move_as_brother(gid, bgid) {
//   return (async ()=>{
//     var npNode=await db.findOne({"_link.children":{$elemMatch:bgid}});//找到新父节点
//     return _move_as_son(gid,npNode,bgid);
//   })();
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsSUFBSSxJQUFFLFFBQVEsT0FBUixDQUFGOztBQUVKLElBQU0sU0FBTyxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVA7O0FBRU4sSUFBSSxFQUFKO0FBQ0EsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEVBQTFCLEVBQTZCOztBQUUzQixPQUFHLEdBQUgsQ0FGMkI7QUFHM0Isd0JBQXNCLElBQXRCLENBQTJCLE9BQVEsRUFBUCxLQUFhLFVBQWIsR0FBeUIsSUFBMUIsR0FBK0IsSUFBL0IsQ0FBM0I7QUFIMkIsU0FJcEI7QUFDTCx3QkFESzs7QUFHTCxrQ0FISztBQUlMLGtDQUpLO0FBS0wsMENBTEs7QUFNTCw0QkFOSztBQU9MLGtCQVBLOzs7O0FBV0wsNENBWEs7R0FBUCxDQUoyQjtDQUE3Qjs7QUFtQkEsT0FBTyxPQUFQLEdBQWUsWUFBZjs7QUFFQSxJQUFNLGVBQWEsU0FBYixZQUFhLENBQUMsSUFBRCxFQUFRO0FBQ3pCLFNBQU8sR0FBRyxTQUFILENBQWEsSUFBYixFQUFtQixJQUFuQixDQUF3QixlQUFLO0FBQ2xDLFNBQUssR0FBTCxHQUFTLElBQUksVUFBSixDQUR5QjtBQUVsQyxXQUFPLElBQVAsQ0FGa0M7R0FBTCxDQUEvQixDQUR5QjtDQUFSOztBQVFuQixJQUFNLGtCQUFnQixTQUFoQixlQUFnQixDQUFDLEtBQUQsRUFBTyxHQUFQLEVBQVcsSUFBWCxFQUFrQjtBQUN0QyxNQUFJLE1BQUksQ0FBSixDQURrQztBQUVwQyxNQUFHLElBQUgsRUFBUTtBQUNOLFVBQUksTUFBTSxLQUFOLENBQVksUUFBWixDQUFxQixPQUFyQixDQUE2QixJQUE3QixJQUFtQyxDQUFuQyxDQURFO0dBQVI7QUFHRCxTQUFPLEdBQUcsU0FBSCxDQUFhLEVBQUMsS0FBSSxNQUFNLEdBQU4sRUFBbEIsRUFBOEI7QUFDbkMsV0FBTztB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LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hc3luYycpO1xuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xuLy8gdmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xudmFyIFI9cmVxdWlyZSgncmFtZGEnKTtcblxuY29uc3QgcmVzdWx0PVIucHJvcCgncmVzdWx0Jyk7XG5cbnZhciBkYjsgXG5mdW5jdGlvbiB0cmVlX21vbmdvZGIoX2RiLGNiKXtcbiAgLy8gZGI9UHJvbWlzZS5wcm9taXNpZnlBbGwoX2RiKTtcbiAgZGI9X2RiO1xuICBidWlsZFJvb3RJZk5vdEV4aXN0KCkudGhlbigodHlwZW9mIGNiID09PSdmdW5jdGlvbicpP2NiKCk6bnVsbCk7IC8vY2LnlKjkuo7pgJrnn6XmtYvor5XnqIvluo9cbiAgcmV0dXJuIHtcbiAgICByZWFkX25vZGUsXG4gICAgLy8gcmVhZF9ub2RlcyxcbiAgICBta19zb25fYnlfZGF0YSxcbiAgICBta19zb25fYnlfbmFtZSxcbiAgICBta19icm90aGVyX2J5X2RhdGEsXG4gICAgdXBkYXRlX2RhdGEsXG4gICAgcmVtb3ZlLFxuICAgIC8vIG1vdmVfYXNfc29uLFxuICAgIC8vIG1vdmVfYXNfYnJvdGhlcixcbiAgICAvL2ZvciB0ZXN0XG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzPXRyZWVfbW9uZ29kYjtcbi8v5YaF6YOo5bel5YW35Ye95pWwXG5jb25zdCBfaW5zZXJ0QXN5bmM9KG5vZGUpPT57XG4gIHJldHVybiBkYi5pbnNlcnRPbmUobm9kZSkudGhlbihyZXM9PntcbiAgICBub2RlLl9pZD1yZXMuaW5zZXJ0ZWRJZDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSlcbn1cblxuXG5jb25zdCBfaW5zZXJ0Q2hpbGRyZW49KHBOb2RlLGdpZCxiZ2lkKT0+e1xuICB2YXIgcG9zPTA7XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9cE5vZGUuX2xpbmsuY2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuICAgIH1cbiAgIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCB7XG4gICAgICRwdXNoOiB7XG4gICAgICAgIFwiX2xpbmsuY2hpbGRyZW5cIjoge1xuICAgICAgICAgICAkZWFjaDogW2dpZF0sXG4gICAgICAgICAgICRwb3NpdGlvbjogcG9zXG4gICAgICAgIH1cbiAgICAgfVxuICAgfSk7IFxufVxuXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcbiAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIpO1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0IGJlZ2luXCIpO1xuICAgIHZhciByb290PWF3YWl0IGRiLmZpbmRPbmUoe19pZDonMCd9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhcImZvdW5kIHJvb3RcIixyb290KTtcbiAgICBpZighcm9vdCl7XG4gICAgICB2YXIgZGVmYXVsdFJvb3Q9e1xuICAgICAgICBfaWQ6JzAnLCBcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiAnMCcsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByb290PWF3YWl0IF9pbnNlcnRBc3luYyhkZWZhdWx0Um9vdCk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiLHJvb3QpO1xuICAgIHJldHVybiByb290O1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGUoZ2lkKSB7XG4gIC8vcm3moIforrDooajnpLroioLngrnlt7Lnu4/ooqvliKDpmaRcbiAgcmV0dXJuIGRiLmZpbmRPbmUoe19pZDpnaWQsIF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7XG59XG5cbi8vIGZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIG5vZGVzPWF3YWl0IGRiLmZpbmRBc3luYyh7X2lkOnskaW46Z2lkc30sX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTtcbi8vICAgICByZXR1cm4gbm9kZXM7XG4vLyAgIH0pKCk7XG4vLyB9XG4vLyBcblxuZnVuY3Rpb24gX21rX3Nvbl9ieV9rdihwTm9kZSxrZXksdmFsdWUsYmdpZCl7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhwTm9kZSk7XG4gICAgdmFyIF9uZXdOb2RlPXtcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiBwTm9kZS5faWQsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICB9O1xuICAgIF9uZXdOb2RlW2tleV09dmFsdWU7XG4gICAgdmFyIG5ld05vZGU9IGF3YWl0IF9pbnNlcnRBc3luYyhfbmV3Tm9kZSkgOy8v5o+S5YWl5paw6IqC54K5XG4gICAgLy/mj5LlhaXniLboioLngrlcbiAgICBhd2FpdCBfaW5zZXJ0Q2hpbGRyZW4ocE5vZGUsbmV3Tm9kZS5faWQsYmdpZCk7XG4gICAgcmV0dXJuIG5ld05vZGU7Ly/ov5Tlm57mlrDoioLngrlcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSk7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9uYW1lKHBnaWQsIG5hbWUpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9pZFwiOnBnaWR9KSA7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHZhciBub2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX25hbWVcIjpuYW1lLFwiX2xpbmsucFwiOnBnaWR9KTsvL+aYr+WQpuW3suacieWQjOWQjeiKgueCuVxuICAgIGlmKG5vZGUpe1xuICAgICAgcmV0dXJuIG5vZGU7Ly/lpoLmnInnm7TmjqXov5Tlm55cbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfbmFtZVwiLG5hbWUpO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCxkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOmJnaWR9KTsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlIG9mIGJyb3RoZXIgJytiZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSxiZ2lkKTtcbiAgfSkoKTtcbn1cblxuXG4vLyBmdW5jdGlvbiBfdXBkYXRlKGRiLHF1ZXJ5LHVwZGF0ZSxjYWxsYmFjayl7IFxuLy8gICAgIHZhciBjYj1mdW5jdGlvbihlcnIsIG51bUFmZmVjdGVkLCBhZmZlY3RlZERvY3VtZW50cywgdXBzZXJ0KXtcbi8vICAgICAgIGNhbGxiYWNrKGVycixhZmZlY3RlZERvY3VtZW50cyk7Ly/kv67mlLljYWxsYmFja+eahOetvuWQje+8jOS9v+W+l+esrOS6jOS4quWPguaVsOS4uuabtOaWsOi/h+eahGRvY1xuLy8gICAgIH07XG4vLyAgICAgdmFyIG9wdGlvbnM9eyBtdWx0aTogZmFsc2UscmV0dXJuVXBkYXRlZERvY3M6dHJ1ZSB9O1xuLy8gICAgIGRiLnVwZGF0ZShxdWVyeSwgdXBkYXRlLCBvcHRpb25zLGNiKTtcbi8vIH1cblxuLy8gY29uc3QgdXBkYXRlPVByb21pc2UucHJvbWlzaWZ5KF91cGRhdGUpOy8v5L+u5pS5Y2FsbGJhY2vnrb7lkI3lkI7lsLHlj6/ku6Vwcm9taXNpZnlcblxuZnVuY3Rpb24gdXBkYXRlX2RhdGEoZ2lkLCBkYXRhKSB7XG4gIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpnaWR9LCB7ICRzZXQ6IHsgX2RhdGE6IGRhdGEgfSB9KVxuICAudGhlbihfPT5kYi5maW5kT25lKHtfaWQ6Z2lkfSkpO1xufVxuXG5cbi8v6YCS5b2S6YGN5Y6G5omA5pyJ5a2Q6IqC54K5XG4vL2dpZHPmmK/opoHorr/pl67nmoToioLngrlpZOeahOWIl+ihqFxuLy92aXNpdOaYr+S4gOS4quWHveaVsOOAguiuv+mXruiKgueCueeahOWKqOS9nOOAglxuZnVuY3Rpb24gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oZ2lkcyx2aXNpdCkge1xuICBpZiAoIWdpZHN8fGdpZHMubGVuZ3RoPT0wKSB7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO30vL+mcgOimgei/lOWbnuS4gOS4qnByb21pc2UgXG4gIHJldHVybiBQcm9taXNlLmFsbChnaWRzLm1hcChnaWQgPT4ge1xuICAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PnsgLy/or7vlj5blvZPliY3oioLngrlcbiAgICAgIHJldHVybiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihub2RlLl9saW5rLmNoaWxkcmVuLHZpc2l0KS50aGVuKCgpPT57IC8v6K6/6Zeu5omA5pyJ5a2Q6IqC54K5XG4gICAgICAgIHJldHVybiB2aXNpdChub2RlKTsgLy/nhLblkI7orr/pl67lvZPliY3oioLngrlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSkpO1xufVxuXG4vL+agh+iusOWIoOmZpOiKgueCueS4juaJgOacieWtkOWtmeiKgueCuVxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgIGlmKGdpZD09PScwJylyZXR1cm47Ly/moLnoioLngrnkuI3og73liKDpmaTjgIJcbiAgICAgdmFyIG5vZGU9YXdhaXQgcmVhZF9ub2RlKGdpZCk7IC8v5YWI6K+75Y+W6KaB5Yig6Zmk55qE6IqC54K5XG4gICAgIGlmKCFub2RlKXJldHVybjsvL+W3sue7j+S4jeWtmOWcqO+8jOi/lOWbnlxuICAgICAvL+aUtumbhuaJgOacieWtkOiKgueCuVxuICAgICB2YXIgZ2lkc2ZvclJlbW92ZT1bXTtcbiAgICAgY29uc3Qgcm09KG5vZGUpPT57Z2lkc2ZvclJlbW92ZS5wdXNoKG5vZGUuX2lkKX07XG4gICAgIGF3YWl0IF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKFtnaWRdLHJtKTtcbiAgICAgLy/mibnph4/liKDpmaRcbiAgICAgYXdhaXQgZGIudXBkYXRlTWFueSh7X2lkOnskaW46Z2lkc2ZvclJlbW92ZX19LCAgeyAkc2V0OiB7IF9ybTp0cnVlICB9IH0sIHt9KTsvL+agh+iusOS4uuWIoOmZpFxuICAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpub2RlLl9saW5rLnB9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4gICAgIHJldHVybiBnaWRzZm9yUmVtb3ZlO1xuICB9KSgpO1xufVxuXG4vLyBmdW5jdGlvbiBfaXNBbmNlc3RvcihwZ2lkLGdpZCl7XG4vLyAgIGlmKGdpZD09JzAnKXJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyAvLycwJ+S4uuagueiKgueCueOAguS7u+S9leiKgueCuemDveS4jeaYrycwJ+eahOeItuiKgueCuVxuLy8gICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57XG4vLyAgICAgLy8gY29uc29sZS5sb2coJ2NoZWNrJyxwZ2lkLG5vZGUuX2xpbmsucCxub2RlKVxuLy8gICAgIGlmKG5vZGUuX2xpbmsucD09PXBnaWQpe1xuLy8gICAgICAgcmV0dXJuIHRydWU7XG4vLyAgICAgfWVsc2V7XG4vLyAgICAgICByZXR1cm4gX2lzQW5jZXN0b3IocGdpZCxub2RlLl9saW5rLnApO1xuLy8gICAgIH1cbi8vICAgfSlcbi8vIH1cblxuLy8gZnVuY3Rpb24gX21vdmVfYXNfc29uKGdpZCwgbnBOb2RlLGJnaWQpe1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGU9YXdhaXQgX2lzQW5jZXN0b3IoZ2lkLG5wTm9kZS5faWQpO1xuLy8gICAgIGlmKGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGUpe1xuLy8gICAgICAgY29uc29sZS5sb2coZ2lkLCdpcyBhbmNlc3RvciBvZicsbnBOb2RlLl9pZClcbi8vICAgICAgIHJldHVybiBudWxsOy8v6KaB56e75Yqo55qE6IqC54K55LiN6IO95piv55uu5qCH54i26IqC54K555qE6ZW/6L6I6IqC54K5XG4vLyAgICAgfVxuLy8gICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9saW5rLmNoaWxkcmVuXCI6eyRlbGVtTWF0Y2g6Z2lkfX0pOy8v5om+5Yiw5Y6f54i26IqC54K5XG5cbi8vICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOnBOb2RlLl9pZH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSA7Ly/ku47ljp/niLboioLngrnliKDpmaRcbi8vICAgICBpZihucE5vZGUuX2lkPT09cE5vZGUuX2lkKXsvL+WmguaenOaWsOeahOeItuiKgueCueS4juaXp+eahOeItuiKgueCueebuOWQjOOAguimgeabtOaWsOeItuiKgueCuVxuLy8gICAgICAgbnBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe19pZDpucE5vZGUuX2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pOyBcbi8vICAgICB9ZWxzZXtcbi8vICAgICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6Z2lkfSwgIHsgJHNldDogeyBcIl9saW5rLnBcIjogbnBOb2RlLl9pZCB9IH0sIHt9KTsvL+aUueWPmGdpZOeahOeItuiKgueCueS4uuaWsOeItuiKgueCuVxuLy8gICAgIH1cbi8vICAgICB2YXIgcG9zPTA7XG4vLyAgICAgdmFyIGNoaWxkcmVuPW5wTm9kZS5fbGluay5jaGlsZHJlbjtcbi8vICAgICBpZihiZ2lkKXtcbi8vICAgICAgIHBvcz1jaGlsZHJlbi5pbmRleE9mKGJnaWQpKzE7XG4vLyAgICAgfVxuLy8gICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxnaWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cbi8vICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOm5wTm9kZS5faWR9LCBucE5vZGUsIHt9KTsvL+aPkuWFpeeItuiKgueCuVxuICAgIC8vIHJldHVybiBhd2FpdCByZWFkX25vZGUoZ2lkKTtcbi8vICAgfSkoKTsgIFxuLy8gfVxuXG4vLyAvL+aKimdpZOiKgueCueenu+WKqOS4unBnaWTnmoTlrZDoioLngrlcbi8vIC8v5YyF5ZCrM+atpeOAgiAxLuS7jmdpZOeahOWOn+eItuiKgueCueWIoOmZpOOAgjLmlLnlj5hnaWTnmoTlvZPliY3niLboioLngrnjgIIgM+OAguazqOWGjOWIsOaWsOeItuiKgueCuVxuLy8gLy/np7vliqjliY3pnIDopoHlgZrmo4Dmn6XjgILnpZblhYjoioLngrnkuI3og73np7vliqjkuLrlkI7ovojnmoTlrZDoioLngrlcbi8vIGZ1bmN0aW9uIG1vdmVfYXNfc29uKGdpZCwgcGdpZCkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9pZFwiOnBnaWR9KTsvL+aJvuWIsOaWsOeItuiKgueCuVxuLy8gICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSk7XG4vLyAgIH0pKCk7ICBcbi8vIH1cblxuLy8gZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9saW5rLmNoaWxkcmVuXCI6eyRlbGVtTWF0Y2g6YmdpZH19KTsvL+aJvuWIsOaWsOeItuiKgueCuVxuLy8gICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSxiZ2lkKTtcbi8vICAgfSkoKTsgXG4vLyB9Il19