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
    // remove,
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
    pos = children.indexOf(bgid) + 1;
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

// //递归遍历所有子节点
// //gids是要访问的节点id的列表
// //visit是一个函数。访问节点的动作。
// function _traversal_all_children(gids,visit) {
//   if (!gids||gids.length==0) {return Promise.resolve();}//需要返回一个promise
//   return Promise.all(gids.map(gid => {
//     return read_node(gid).then(node=>{ //读取当前节点
//       return _traversal_all_children(node._link.children,visit).then(()=>{ //访问所有子节点
//         return visit(node); //然后访问当前节点
//       })
//     })
//   }));
// }

// //标记删除节点与所有子孙节点
// function remove(gid) {
//   return (async ()=>{
//      if(gid=='0')return;//根节点不能删除。
//      var node=await read_node(gid); //先读取要删除的节点
//      if(!node)return;//已经不存在，返回
//      //收集所有子节点
//      var gidsforRemove=[];
//      const rm=(node)=>{gidsforRemove.push(node._id)};
//      await _traversal_all_children([gid],rm);
//      //批量删除
//      await db.updateAsync({_id:{$in:gidsforRemove}},  { $set: { _rm:true  } }, {});//标记为删除
//      await db.updateAsync({_id:node._link.p},  { $pull: { "_link.children": gid } } , {}) ;//从原父节点删除
//      return gidsforRemove;
//   })();
// }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsSUFBSSxJQUFFLFFBQVEsT0FBUixDQUFGOztBQUVKLElBQU0sU0FBTyxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVA7O0FBRU4sSUFBSSxFQUFKO0FBQ0EsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEVBQTFCLEVBQTZCOztBQUUzQixPQUFHLEdBQUgsQ0FGMkI7QUFHM0Isd0JBQXNCLElBQXRCLENBQTJCLE9BQVEsRUFBUCxLQUFhLFVBQWIsR0FBeUIsSUFBMUIsR0FBK0IsSUFBL0IsQ0FBM0I7QUFIMkIsU0FJcEI7QUFDTCx3QkFESzs7QUFHTCxrQ0FISztBQUlMLGtDQUpLO0FBS0wsMENBTEs7QUFNTCw0QkFOSzs7Ozs7QUFXTCw0Q0FYSztHQUFQLENBSjJCO0NBQTdCOztBQW1CQSxPQUFPLE9BQVAsR0FBZSxZQUFmOztBQUVBLElBQU0sZUFBYSxTQUFiLFlBQWEsQ0FBQyxJQUFELEVBQVE7QUFDekIsU0FBTyxHQUFHLFNBQUgsQ0FBYSxJQUFiLEVBQW1CLElBQW5CLENBQXdCLGVBQUs7QUFDbEMsU0FBSyxHQUFMLEdBQVMsSUFBSSxVQUFKLENBRHlCO0FBRWxDLFdBQU8sSUFBUCxDQUZrQztHQUFMLENBQS9CLENBRHlCO0NBQVI7O0FBUW5CLElBQU0sa0JBQWdCLFNBQWhCLGVBQWdCLENBQUMsS0FBRCxFQUFPLEdBQVAsRUFBVyxJQUFYLEVBQWtCO0FBQ3RDLE1BQUksTUFBSSxDQUFKLENBRGtDO0FBRXBDLE1BQUcsSUFBSCxFQUFRO0FBQ04sVUFBSSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsSUFBdUIsQ0FBdkIsQ0FERTtHQUFSO0FBR0QsU0FBTyxHQUFHLFNBQUgsQ0FBYSxFQUFDLEtBQUksTUFBTSxHQUFOLEVBQWxCLEVBQThCO0FBQ25DLFdBQU87QUFDSix3QkFBa0I7QUFDZixlQUFPLENBQUMsR0FBRCxDQUFQO0FBQ0EsbUJBQVcsR0FBWDtPQUZIO0tBREg7R0FESyxDQUFQLENBTHFDO0NBQWxCOztBQWV0QixTQUFTLG1CQUFULENBQTZCLEVBQTdCLEVBQWdDOzs7O0FBRTlCLFNBQU8sZ0JBQUM7Ozs7Ozs7NENBRVMsR0FBRyxPQUFILENBQVcsRUFBQyxLQUFJLEdBQUosRUFBWjs7O0FBQVg7O2dCQUVBOzs7OztBQUNFLDBCQUFZO0FBQ2QsbUJBQUksR0FBSjtBQUNBLHFCQUFPO0FBQ0wsbUJBQUcsR0FBSDtBQUNBLDBCQUFVLEVBQVY7ZUFGRjs7OzRDQUtTLGFBQWEsV0FBYjs7O0FBQVg7Ozs2Q0FHSzs7Ozs7Ozs7R0FmRCxFQUFSLENBRjhCO0NBQWhDOztBQXFCQSxTQUFTLFNBQVQsQ0FBbUIsR0FBbkIsRUFBd0I7O0FBRXRCLFNBQU8sR0FBRyxPQUFILENBQVcsRUFBQyxLQUFJLEdBQUosRUFBUyxLQUFLLEVBQUUsU0FBUyxLQUFULEVBQVAsRUFBckIsQ0FBUCxDQUZzQjtDQUF4Qjs7Ozs7Ozs7OztBQWFBLFNBQVMsYUFBVCxDQUF1QixLQUF2QixFQUE2QixHQUE3QixFQUFpQyxLQUFqQyxFQUF1QyxJQUF2QyxFQUE0Qzs7O0FBQzFDLFNBQU8saUJBQUM7Ozs7Ozs7O0FBRUYsdUJBQVM7QUFDVCxxQkFBTztBQUNMLG1CQUFHLE1BQU0sR0FBTjtBQUNILDBCQUFVLEVBQVY7ZUFGRjs7O0FBS0oscUJBQVMsR0FBVCxJQUFjLEtBQWQ7OzRDQUNtQixhQUFhLFFBQWI7OztBQUFmOzs0Q0FFRSxnQkFBZ0IsS0FBaEIsRUFBc0IsUUFBUSxHQUFSLEVBQVksSUFBbEM7Ozs4Q0FDQzs7Ozs7Ozs7R0FaRCxFQUFSLENBRDBDO0NBQTVDOzs7QUFpQkEsU0FBUyxjQUFULENBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVSxHQUFHLE9BQUgsQ0FBVyxFQUFDLE9BQU0sSUFBTixFQUFaOzs7QUFBWjs7Z0JBQ0E7Ozs7O2tCQUNLLDZCQUEyQixJQUEzQjs7OzhDQUdGLGNBQWMsS0FBZCxFQUFvQixPQUFwQixFQUE0QixJQUE1Qjs7Ozs7Ozs7R0FORCxFQUFSLENBRGtDO0NBQXBDOztBQVdBLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQzs7O0FBQ2xDLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1UsR0FBRyxPQUFILENBQVcsRUFBQyxPQUFNLElBQU4sRUFBWjs7O0FBQVo7O2dCQUNBOzs7OztrQkFDSyw2QkFBMkIsSUFBM0I7Ozs7NENBR00sR0FBRyxPQUFILENBQVcsRUFBQyxTQUFRLElBQVIsRUFBYSxXQUFVLElBQVYsRUFBekI7OztBQUFYOztpQkFDRDs7Ozs7OENBQ007Ozs4Q0FFRixjQUFjLEtBQWQsRUFBb0IsT0FBcEIsRUFBNEIsSUFBNUI7Ozs7Ozs7O0dBVkQsRUFBUixDQURrQztDQUFwQzs7QUFlQSxTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWlDLElBQWpDLEVBQXVDOzs7QUFDckMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVSxHQUFHLE9BQUgsQ0FBVyxFQUFDLGtCQUFpQixJQUFqQixFQUFaOzs7QUFBWjs7Z0JBQ0E7Ozs7O2tCQUNLLHdDQUFzQyxJQUF0Qzs7OzhDQUdGLGNBQWMsS0FBZCxFQUFvQixPQUFwQixFQUE0QixJQUE1QixFQUFpQyxJQUFqQzs7Ozs7Ozs7R0FORCxFQUFSLENBRHFDO0NBQXZDOzs7Ozs7Ozs7Ozs7QUFzQkEsU0FBUyxXQUFULENBQXFCLEdBQXJCLEVBQTBCLElBQTFCLEVBQWdDO0FBQzlCLFNBQU8sR0FBRyxTQUFILENBQWEsRUFBQyxLQUFJLEdBQUosRUFBZCxFQUF3QixFQUFFLE1BQU0sRUFBRSxPQUFPLElBQVAsRUFBUixFQUExQixFQUNOLElBRE0sQ0FDRDtXQUFHLEdBQUcsT0FBSCxDQUFXLEVBQUMsS0FBSSxHQUFKLEVBQVo7R0FBSCxDQUROLENBRDhCO0NBQWhDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hc3luYycpO1xuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xuLy8gdmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xudmFyIFI9cmVxdWlyZSgncmFtZGEnKTtcblxuY29uc3QgcmVzdWx0PVIucHJvcCgncmVzdWx0Jyk7XG5cbnZhciBkYjsgXG5mdW5jdGlvbiB0cmVlX21vbmdvZGIoX2RiLGNiKXtcbiAgLy8gZGI9UHJvbWlzZS5wcm9taXNpZnlBbGwoX2RiKTtcbiAgZGI9X2RiO1xuICBidWlsZFJvb3RJZk5vdEV4aXN0KCkudGhlbigodHlwZW9mIGNiID09PSdmdW5jdGlvbicpP2NiKCk6bnVsbCk7IC8vY2LnlKjkuo7pgJrnn6XmtYvor5XnqIvluo9cbiAgcmV0dXJuIHtcbiAgICByZWFkX25vZGUsXG4gICAgLy8gcmVhZF9ub2RlcyxcbiAgICBta19zb25fYnlfZGF0YSxcbiAgICBta19zb25fYnlfbmFtZSxcbiAgICBta19icm90aGVyX2J5X2RhdGEsXG4gICAgdXBkYXRlX2RhdGEsXG4gICAgLy8gcmVtb3ZlLFxuICAgIC8vIG1vdmVfYXNfc29uLFxuICAgIC8vIG1vdmVfYXNfYnJvdGhlcixcbiAgICAvL2ZvciB0ZXN0XG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzPXRyZWVfbW9uZ29kYjtcbi8v5YaF6YOo5bel5YW35Ye95pWwXG5jb25zdCBfaW5zZXJ0QXN5bmM9KG5vZGUpPT57XG4gIHJldHVybiBkYi5pbnNlcnRPbmUobm9kZSkudGhlbihyZXM9PntcbiAgICBub2RlLl9pZD1yZXMuaW5zZXJ0ZWRJZDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSlcbn1cblxuXG5jb25zdCBfaW5zZXJ0Q2hpbGRyZW49KHBOb2RlLGdpZCxiZ2lkKT0+e1xuICB2YXIgcG9zPTA7XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuICAgIH1cbiAgIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCB7XG4gICAgICRwdXNoOiB7XG4gICAgICAgIFwiX2xpbmsuY2hpbGRyZW5cIjoge1xuICAgICAgICAgICAkZWFjaDogW2dpZF0sXG4gICAgICAgICAgICRwb3NpdGlvbjogcG9zXG4gICAgICAgIH1cbiAgICAgfVxuICAgfSk7IFxufVxuXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcbiAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIpO1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0IGJlZ2luXCIpO1xuICAgIHZhciByb290PWF3YWl0IGRiLmZpbmRPbmUoe19pZDonMCd9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhcImZvdW5kIHJvb3RcIixyb290KTtcbiAgICBpZighcm9vdCl7XG4gICAgICB2YXIgZGVmYXVsdFJvb3Q9e1xuICAgICAgICBfaWQ6JzAnLCBcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiAnMCcsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByb290PWF3YWl0IF9pbnNlcnRBc3luYyhkZWZhdWx0Um9vdCk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiLHJvb3QpO1xuICAgIHJldHVybiByb290O1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGUoZ2lkKSB7XG4gIC8vcm3moIforrDooajnpLroioLngrnlt7Lnu4/ooqvliKDpmaRcbiAgcmV0dXJuIGRiLmZpbmRPbmUoe19pZDpnaWQsIF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7XG59XG5cbi8vIGZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIG5vZGVzPWF3YWl0IGRiLmZpbmRBc3luYyh7X2lkOnskaW46Z2lkc30sX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTtcbi8vICAgICByZXR1cm4gbm9kZXM7XG4vLyAgIH0pKCk7XG4vLyB9XG4vLyBcblxuZnVuY3Rpb24gX21rX3Nvbl9ieV9rdihwTm9kZSxrZXksdmFsdWUsYmdpZCl7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhwTm9kZSk7XG4gICAgdmFyIF9uZXdOb2RlPXtcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiBwTm9kZS5faWQsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICB9O1xuICAgIF9uZXdOb2RlW2tleV09dmFsdWU7XG4gICAgdmFyIG5ld05vZGU9IGF3YWl0IF9pbnNlcnRBc3luYyhfbmV3Tm9kZSkgOy8v5o+S5YWl5paw6IqC54K5XG4gICAgLy/mj5LlhaXniLboioLngrlcbiAgICBhd2FpdCBfaW5zZXJ0Q2hpbGRyZW4ocE5vZGUsbmV3Tm9kZS5faWQsYmdpZCk7XG4gICAgcmV0dXJuIG5ld05vZGU7Ly/ov5Tlm57mlrDoioLngrlcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSk7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9uYW1lKHBnaWQsIG5hbWUpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9pZFwiOnBnaWR9KSA7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHZhciBub2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX25hbWVcIjpuYW1lLFwiX2xpbmsucFwiOnBnaWR9KTsvL+aYr+WQpuW3suacieWQjOWQjeiKgueCuVxuICAgIGlmKG5vZGUpe1xuICAgICAgcmV0dXJuIG5vZGU7Ly/lpoLmnInnm7TmjqXov5Tlm55cbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfa3YocE5vZGUsXCJfbmFtZVwiLG5hbWUpO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCxkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOmJnaWR9KTsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlIG9mIGJyb3RoZXIgJytiZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSxiZ2lkKTtcbiAgfSkoKTtcbn1cblxuXG4vLyBmdW5jdGlvbiBfdXBkYXRlKGRiLHF1ZXJ5LHVwZGF0ZSxjYWxsYmFjayl7IFxuLy8gICAgIHZhciBjYj1mdW5jdGlvbihlcnIsIG51bUFmZmVjdGVkLCBhZmZlY3RlZERvY3VtZW50cywgdXBzZXJ0KXtcbi8vICAgICAgIGNhbGxiYWNrKGVycixhZmZlY3RlZERvY3VtZW50cyk7Ly/kv67mlLljYWxsYmFja+eahOetvuWQje+8jOS9v+W+l+esrOS6jOS4quWPguaVsOS4uuabtOaWsOi/h+eahGRvY1xuLy8gICAgIH07XG4vLyAgICAgdmFyIG9wdGlvbnM9eyBtdWx0aTogZmFsc2UscmV0dXJuVXBkYXRlZERvY3M6dHJ1ZSB9O1xuLy8gICAgIGRiLnVwZGF0ZShxdWVyeSwgdXBkYXRlLCBvcHRpb25zLGNiKTtcbi8vIH1cblxuLy8gY29uc3QgdXBkYXRlPVByb21pc2UucHJvbWlzaWZ5KF91cGRhdGUpOy8v5L+u5pS5Y2FsbGJhY2vnrb7lkI3lkI7lsLHlj6/ku6Vwcm9taXNpZnlcblxuZnVuY3Rpb24gdXBkYXRlX2RhdGEoZ2lkLCBkYXRhKSB7XG4gIHJldHVybiBkYi51cGRhdGVPbmUoe19pZDpnaWR9LCB7ICRzZXQ6IHsgX2RhdGE6IGRhdGEgfSB9KVxuICAudGhlbihfPT5kYi5maW5kT25lKHtfaWQ6Z2lkfSkpO1xufVxuXG5cbi8vIC8v6YCS5b2S6YGN5Y6G5omA5pyJ5a2Q6IqC54K5XG4vLyAvL2dpZHPmmK/opoHorr/pl67nmoToioLngrlpZOeahOWIl+ihqFxuLy8gLy92aXNpdOaYr+S4gOS4quWHveaVsOOAguiuv+mXruiKgueCueeahOWKqOS9nOOAglxuLy8gZnVuY3Rpb24gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oZ2lkcyx2aXNpdCkge1xuLy8gICBpZiAoIWdpZHN8fGdpZHMubGVuZ3RoPT0wKSB7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO30vL+mcgOimgei/lOWbnuS4gOS4qnByb21pc2UgXG4vLyAgIHJldHVybiBQcm9taXNlLmFsbChnaWRzLm1hcChnaWQgPT4ge1xuLy8gICAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PnsgLy/or7vlj5blvZPliY3oioLngrlcbi8vICAgICAgIHJldHVybiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihub2RlLl9saW5rLmNoaWxkcmVuLHZpc2l0KS50aGVuKCgpPT57IC8v6K6/6Zeu5omA5pyJ5a2Q6IqC54K5XG4vLyAgICAgICAgIHJldHVybiB2aXNpdChub2RlKTsgLy/nhLblkI7orr/pl67lvZPliY3oioLngrlcbi8vICAgICAgIH0pXG4vLyAgICAgfSlcbi8vICAgfSkpO1xuLy8gfVxuXG4vLyAvL+agh+iusOWIoOmZpOiKgueCueS4juaJgOacieWtkOWtmeiKgueCuVxuLy8gZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgIGlmKGdpZD09JzAnKXJldHVybjsvL+agueiKgueCueS4jeiDveWIoOmZpOOAglxuLy8gICAgICB2YXIgbm9kZT1hd2FpdCByZWFkX25vZGUoZ2lkKTsgLy/lhYjor7vlj5bopoHliKDpmaTnmoToioLngrlcbi8vICAgICAgaWYoIW5vZGUpcmV0dXJuOy8v5bey57uP5LiN5a2Y5Zyo77yM6L+U5ZueXG4vLyAgICAgIC8v5pS26ZuG5omA5pyJ5a2Q6IqC54K5XG4vLyAgICAgIHZhciBnaWRzZm9yUmVtb3ZlPVtdO1xuLy8gICAgICBjb25zdCBybT0obm9kZSk9PntnaWRzZm9yUmVtb3ZlLnB1c2gobm9kZS5faWQpfTtcbi8vICAgICAgYXdhaXQgX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oW2dpZF0scm0pO1xuLy8gICAgICAvL+aJuemHj+WIoOmZpFxuLy8gICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOnskaW46Z2lkc2ZvclJlbW92ZX19LCAgeyAkc2V0OiB7IF9ybTp0cnVlICB9IH0sIHt9KTsvL+agh+iusOS4uuWIoOmZpFxuLy8gICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOm5vZGUuX2xpbmsucH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSA7Ly/ku47ljp/niLboioLngrnliKDpmaRcbi8vICAgICAgcmV0dXJuIGdpZHNmb3JSZW1vdmU7XG4vLyAgIH0pKCk7XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIF9pc0FuY2VzdG9yKHBnaWQsZ2lkKXtcbi8vICAgaWYoZ2lkPT0nMCcpcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7IC8vJzAn5Li65qC56IqC54K544CC5Lu75L2V6IqC54K56YO95LiN5pivJzAn55qE54i26IqC54K5XG4vLyAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9Pntcbi8vICAgICAvLyBjb25zb2xlLmxvZygnY2hlY2snLHBnaWQsbm9kZS5fbGluay5wLG5vZGUpXG4vLyAgICAgaWYobm9kZS5fbGluay5wPT09cGdpZCl7XG4vLyAgICAgICByZXR1cm4gdHJ1ZTtcbi8vICAgICB9ZWxzZXtcbi8vICAgICAgIHJldHVybiBfaXNBbmNlc3RvcihwZ2lkLG5vZGUuX2xpbmsucCk7XG4vLyAgICAgfVxuLy8gICB9KVxuLy8gfVxuXG4vLyBmdW5jdGlvbiBfbW92ZV9hc19zb24oZ2lkLCBucE5vZGUsYmdpZCl7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZT1hd2FpdCBfaXNBbmNlc3RvcihnaWQsbnBOb2RlLl9pZCk7XG4vLyAgICAgaWYoZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZSl7XG4vLyAgICAgICBjb25zb2xlLmxvZyhnaWQsJ2lzIGFuY2VzdG9yIG9mJyxucE5vZGUuX2lkKVxuLy8gICAgICAgcmV0dXJuIG51bGw7Ly/opoHnp7vliqjnmoToioLngrnkuI3og73mmK/nm67moIfniLboioLngrnnmoTplb/ovojoioLngrlcbi8vICAgICB9XG4vLyAgICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpnaWR9fSk7Ly/mib7liLDljp/niLboioLngrlcblxuLy8gICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6cE5vZGUuX2lkfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuLy8gICAgIGlmKG5wTm9kZS5faWQ9PT1wTm9kZS5faWQpey8v5aaC5p6c5paw55qE54i26IqC54K55LiO5pen55qE54i26IqC54K555u45ZCM44CC6KaB5pu05paw54i26IqC54K5XG4vLyAgICAgICBucE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7X2lkOm5wTm9kZS5faWQsIF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7IFxuLy8gICAgIH1lbHNle1xuLy8gICAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpnaWR9LCAgeyAkc2V0OiB7IFwiX2xpbmsucFwiOiBucE5vZGUuX2lkIH0gfSwge30pOy8v5pS55Y+YZ2lk55qE54i26IqC54K55Li65paw54i26IqC54K5XG4vLyAgICAgfVxuLy8gICAgIHZhciBwb3M9MDtcbi8vICAgICB2YXIgY2hpbGRyZW49bnBOb2RlLl9saW5rLmNoaWxkcmVuO1xuLy8gICAgIGlmKGJnaWQpe1xuLy8gICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcbi8vICAgICB9XG4vLyAgICAgY2hpbGRyZW4uc3BsaWNlKHBvcywwLGdpZCk7Ly/miormlrDoioLngrnnmoRJROaPkuWFpeWIsOeItuiKgueCueS4rVxuLy8gICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6bnBOb2RlLl9pZH0sIG5wTm9kZSwge30pOy8v5o+S5YWl54i26IqC54K5XG4gICAgLy8gcmV0dXJuIGF3YWl0IHJlYWRfbm9kZShnaWQpO1xuLy8gICB9KSgpOyAgXG4vLyB9XG5cbi8vIC8v5oqKZ2lk6IqC54K556e75Yqo5Li6cGdpZOeahOWtkOiKgueCuVxuLy8gLy/ljIXlkKsz5q2l44CCIDEu5LuOZ2lk55qE5Y6f54i26IqC54K55Yig6Zmk44CCMuaUueWPmGdpZOeahOW9k+WJjeeItuiKgueCueOAgiAz44CC5rOo5YaM5Yiw5paw54i26IqC54K5XG4vLyAvL+enu+WKqOWJjemcgOimgeWBmuajgOafpeOAguelluWFiOiKgueCueS4jeiDveenu+WKqOS4uuWQjui+iOeahOWtkOiKgueCuVxuLy8gZnVuY3Rpb24gbW92ZV9hc19zb24oZ2lkLCBwZ2lkKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgbnBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pOy8v5om+5Yiw5paw54i26IqC54K5XG4vLyAgICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlKTtcbi8vICAgfSkoKTsgIFxuLy8gfVxuXG4vLyBmdW5jdGlvbiBtb3ZlX2FzX2Jyb3RoZXIoZ2lkLCBiZ2lkKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgbnBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpiZ2lkfX0pOy8v5om+5Yiw5paw54i26IqC54K5XG4vLyAgICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlLGJnaWQpO1xuLy8gICB9KSgpOyBcbi8vIH0iXX0=