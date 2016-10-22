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
    // update_data,
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
//插入gid到children数组中，插入点在bgid之后，如果没有bgid，插入在第一个
var _insertChildren = function _insertChildren(children, gid, bgid) {
  var pos = 0;
  if (bgid) {
    pos = children.indexOf(bgid) + 1;
  }
  children.splice(pos, 0, gid); //把新节点的ID插入到父节点中
  return children;
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
    var _newNode, newNode, children;

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
            //插入新节点
            //得到插入新节点的children
            children = _insertChildren(pNode._link.children, newNode._id, bgid);
            _context2.next = 8;
            return regeneratorRuntime.awrap(db.updateOne({ _id: pNode._id }, { $set: { "_link.children": children } }));

          case 8:
            return _context2.abrupt('return', newNode);

          case 9:
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

// function update_data(gid, data) {
//   return (async ()=>{
//     var node=await update(db,{_id:gid}, { $set: { _data: data } });//更新节点并返回更新后的节点
//     return node;
//   })();
// }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsSUFBSSxJQUFFLFFBQVEsT0FBUixDQUFGOztBQUVKLElBQU0sU0FBTyxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVA7O0FBRU4sSUFBSSxFQUFKO0FBQ0EsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEVBQTFCLEVBQTZCOztBQUUzQixPQUFHLEdBQUgsQ0FGMkI7QUFHM0Isd0JBQXNCLElBQXRCLENBQTJCLE9BQVEsRUFBUCxLQUFhLFVBQWIsR0FBeUIsSUFBMUIsR0FBK0IsSUFBL0IsQ0FBM0I7QUFIMkIsU0FJcEI7QUFDTCx3QkFESzs7QUFHTCxrQ0FISztBQUlMLGtDQUpLO0FBS0wsMENBTEs7Ozs7OztBQVdMLDRDQVhLO0dBQVAsQ0FKMkI7Q0FBN0I7O0FBbUJBLE9BQU8sT0FBUCxHQUFlLFlBQWY7O0FBRUEsSUFBTSxlQUFhLFNBQWIsWUFBYSxDQUFDLElBQUQsRUFBUTtBQUN6QixTQUFPLEdBQUcsU0FBSCxDQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBd0IsZUFBSztBQUNsQyxTQUFLLEdBQUwsR0FBUyxJQUFJLFVBQUosQ0FEeUI7QUFFbEMsV0FBTyxJQUFQLENBRmtDO0dBQUwsQ0FBL0IsQ0FEeUI7Q0FBUjs7QUFPbkIsSUFBTSxrQkFBZ0IsU0FBaEIsZUFBZ0IsQ0FBQyxRQUFELEVBQVUsR0FBVixFQUFjLElBQWQsRUFBcUI7QUFDdkMsTUFBSSxNQUFJLENBQUosQ0FEbUM7QUFFdkMsTUFBRyxJQUFILEVBQVE7QUFDTixVQUFJLFNBQVMsT0FBVCxDQUFpQixJQUFqQixJQUF1QixDQUF2QixDQURFO0dBQVI7QUFHQyxXQUFTLE1BQVQsQ0FBZ0IsR0FBaEIsRUFBb0IsQ0FBcEIsRUFBc0IsR0FBdEI7QUFMc0MsU0FNL0IsUUFBUCxDQU5zQztDQUFyQjs7QUFTdEIsU0FBUyxtQkFBVCxDQUE2QixFQUE3QixFQUFnQzs7OztBQUU5QixTQUFPLGdCQUFDOzs7Ozs7OzRDQUVTLEdBQUcsT0FBSCxDQUFXLEVBQUMsS0FBSSxHQUFKLEVBQVo7OztBQUFYOztnQkFFQTs7Ozs7QUFDRSwwQkFBWTtBQUNkLG1CQUFJLEdBQUo7QUFDQSxxQkFBTztBQUNMLG1CQUFHLEdBQUg7QUFDQSwwQkFBVSxFQUFWO2VBRkY7Ozs0Q0FLUyxhQUFhLFdBQWI7OztBQUFYOzs7NkNBR0s7Ozs7Ozs7O0dBZkQsRUFBUixDQUY4QjtDQUFoQzs7QUFxQkEsU0FBUyxTQUFULENBQW1CLEdBQW5CLEVBQXdCOztBQUV0QixTQUFPLEdBQUcsT0FBSCxDQUFXLEVBQUMsS0FBSSxHQUFKLEVBQVMsS0FBSyxFQUFFLFNBQVMsS0FBVCxFQUFQLEVBQXJCLENBQVAsQ0FGc0I7Q0FBeEI7Ozs7Ozs7Ozs7QUFhQSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBNkIsR0FBN0IsRUFBaUMsS0FBakMsRUFBdUMsSUFBdkMsRUFBNEM7OztBQUMxQyxTQUFPLGlCQUFDOzs7Ozs7OztBQUVGLHVCQUFTO0FBQ1QscUJBQU87QUFDTCxtQkFBRyxNQUFNLEdBQU47QUFDSCwwQkFBVSxFQUFWO2VBRkY7OztBQUtKLHFCQUFTLEdBQVQsSUFBYyxLQUFkOzs0Q0FDbUIsYUFBYSxRQUFiOzs7QUFBZjs7O0FBRUEsdUJBQVMsZ0JBQWdCLE1BQU0sS0FBTixDQUFZLFFBQVosRUFBcUIsUUFBUSxHQUFSLEVBQVksSUFBakQ7OzRDQUNQLEdBQUcsU0FBSCxDQUFhLEVBQUMsS0FBSSxNQUFNLEdBQU4sRUFBbEIsRUFBOEIsRUFBQyxNQUFNLEVBQUMsa0JBQWtCLFFBQWxCLEVBQVAsRUFBL0I7Ozs4Q0FDQzs7Ozs7Ozs7R0FiRCxFQUFSLENBRDBDO0NBQTVDOzs7QUFrQkEsU0FBUyxjQUFULENBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVSxHQUFHLE9BQUgsQ0FBVyxFQUFDLE9BQU0sSUFBTixFQUFaOzs7QUFBWjs7Z0JBQ0E7Ozs7O2tCQUNLLDZCQUEyQixJQUEzQjs7OzhDQUdGLGNBQWMsS0FBZCxFQUFvQixPQUFwQixFQUE0QixJQUE1Qjs7Ozs7Ozs7R0FORCxFQUFSLENBRGtDO0NBQXBDOztBQVdBLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQzs7O0FBQ2xDLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1UsR0FBRyxPQUFILENBQVcsRUFBQyxPQUFNLElBQU4sRUFBWjs7O0FBQVo7O2dCQUNBOzs7OztrQkFDSyw2QkFBMkIsSUFBM0I7Ozs7NENBR00sR0FBRyxPQUFILENBQVcsRUFBQyxTQUFRLElBQVIsRUFBYSxXQUFVLElBQVYsRUFBekI7OztBQUFYOztpQkFDRDs7Ozs7OENBQ007Ozs4Q0FFRixjQUFjLEtBQWQsRUFBb0IsT0FBcEIsRUFBNEIsSUFBNUI7Ozs7Ozs7O0dBVkQsRUFBUixDQURrQztDQUFwQzs7QUFlQSxTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWlDLElBQWpDLEVBQXVDOzs7QUFDckMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVSxHQUFHLE9BQUgsQ0FBVyxFQUFDLGtCQUFpQixJQUFqQixFQUFaOzs7QUFBWjs7Z0JBQ0E7Ozs7O2tCQUNLLHdDQUFzQyxJQUF0Qzs7OzhDQUdGLGNBQWMsS0FBZCxFQUFvQixPQUFwQixFQUE0QixJQUE1QixFQUFpQyxJQUFqQzs7Ozs7Ozs7R0FORCxFQUFSLENBRHFDO0NBQXZDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hc3luYycpO1xuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xuLy8gdmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xudmFyIFI9cmVxdWlyZSgncmFtZGEnKTtcblxuY29uc3QgcmVzdWx0PVIucHJvcCgncmVzdWx0Jyk7XG5cbnZhciBkYjsgXG5mdW5jdGlvbiB0cmVlX21vbmdvZGIoX2RiLGNiKXtcbiAgLy8gZGI9UHJvbWlzZS5wcm9taXNpZnlBbGwoX2RiKTtcbiAgZGI9X2RiO1xuICBidWlsZFJvb3RJZk5vdEV4aXN0KCkudGhlbigodHlwZW9mIGNiID09PSdmdW5jdGlvbicpP2NiKCk6bnVsbCk7IC8vY2LnlKjkuo7pgJrnn6XmtYvor5XnqIvluo9cbiAgcmV0dXJuIHtcbiAgICByZWFkX25vZGUsXG4gICAgLy8gcmVhZF9ub2RlcyxcbiAgICBta19zb25fYnlfZGF0YSxcbiAgICBta19zb25fYnlfbmFtZSxcbiAgICBta19icm90aGVyX2J5X2RhdGEsXG4gICAgLy8gdXBkYXRlX2RhdGEsXG4gICAgLy8gcmVtb3ZlLFxuICAgIC8vIG1vdmVfYXNfc29uLFxuICAgIC8vIG1vdmVfYXNfYnJvdGhlcixcbiAgICAvL2ZvciB0ZXN0XG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzPXRyZWVfbW9uZ29kYjtcbi8v5YaF6YOo5bel5YW35Ye95pWwXG5jb25zdCBfaW5zZXJ0QXN5bmM9KG5vZGUpPT57XG4gIHJldHVybiBkYi5pbnNlcnRPbmUobm9kZSkudGhlbihyZXM9PntcbiAgICBub2RlLl9pZD1yZXMuaW5zZXJ0ZWRJZDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSlcbn1cbi8v5o+S5YWlZ2lk5YiwY2hpbGRyZW7mlbDnu4TkuK3vvIzmj5LlhaXngrnlnKhiZ2lk5LmL5ZCO77yM5aaC5p6c5rKh5pyJYmdpZO+8jOaPkuWFpeWcqOesrOS4gOS4qlxuY29uc3QgX2luc2VydENoaWxkcmVuPShjaGlsZHJlbixnaWQsYmdpZCk9PntcbiAgICB2YXIgcG9zPTA7XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuICAgIH1cbiAgICAgY2hpbGRyZW4uc3BsaWNlKHBvcywwLGdpZCk7Ly/miormlrDoioLngrnnmoRJROaPkuWFpeWIsOeItuiKgueCueS4rVxuICAgICByZXR1cm4gY2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUm9vdElmTm90RXhpc3QoY2Ipe1xuICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3RcIik7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3QgYmVnaW5cIik7XG4gICAgdmFyIHJvb3Q9YXdhaXQgZGIuZmluZE9uZSh7X2lkOicwJ30pO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiZm91bmQgcm9vdFwiLHJvb3QpO1xuICAgIGlmKCFyb290KXtcbiAgICAgIHZhciBkZWZhdWx0Um9vdD17XG4gICAgICAgIF9pZDonMCcsIFxuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6ICcwJyxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJvb3Q9YXdhaXQgX2luc2VydEFzeW5jKGRlZmF1bHRSb290KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIscm9vdCk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIHJlYWRfbm9kZShnaWQpIHtcbiAgLy9ybeagh+iusOihqOekuuiKgueCueW3sue7j+iiq+WIoOmZpFxuICByZXR1cm4gZGIuZmluZE9uZSh7X2lkOmdpZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTtcbn1cblxuLy8gZnVuY3Rpb24gcmVhZF9ub2RlcyhnaWRzKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgbm9kZXM9YXdhaXQgZGIuZmluZEFzeW5jKHtfaWQ6eyRpbjpnaWRzfSxfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pO1xuLy8gICAgIHJldHVybiBub2Rlcztcbi8vICAgfSkoKTtcbi8vIH1cbi8vIFxuXG5mdW5jdGlvbiBfbWtfc29uX2J5X2t2KHBOb2RlLGtleSx2YWx1ZSxiZ2lkKXtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKHBOb2RlKTtcbiAgICB2YXIgX25ld05vZGU9e1xuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfVxuICAgIH07XG4gICAgX25ld05vZGVba2V5XT12YWx1ZTtcbiAgICB2YXIgbmV3Tm9kZT0gYXdhaXQgX2luc2VydEFzeW5jKF9uZXdOb2RlKSA7Ly/mj5LlhaXmlrDoioLngrlcbiAgICAvL+W+l+WIsOaPkuWFpeaWsOiKgueCueeahGNoaWxkcmVuXG4gICAgdmFyIGNoaWxkcmVuPV9pbnNlcnRDaGlsZHJlbihwTm9kZS5fbGluay5jaGlsZHJlbixuZXdOb2RlLl9pZCxiZ2lkKTtcbiAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCB7JHNldDoge1wiX2xpbmsuY2hpbGRyZW5cIjogY2hpbGRyZW59fSk7Ly/mj5LlhaXniLboioLngrlcbiAgICByZXR1cm4gbmV3Tm9kZTsvL+i/lOWbnuaWsOiKgueCuVxuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfaWRcIjpwZ2lkfSk7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX2RhdGFcIixkYXRhKTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pIDsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgdmFyIG5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbmFtZVwiOm5hbWUsXCJfbGluay5wXCI6cGdpZH0pOy8v5piv5ZCm5bey5pyJ5ZCM5ZCN6IqC54K5XG4gICAgaWYobm9kZSl7XG4gICAgICByZXR1cm4gbm9kZTsvL+WmguacieebtOaOpei/lOWbnlxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9uYW1lXCIsbmFtZSk7XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIG1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLGRhdGEpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9saW5rLmNoaWxkcmVuXCI6YmdpZH0pOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgb2YgYnJvdGhlciAnK2JnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX2RhdGFcIixkYXRhLGJnaWQpO1xuICB9KSgpO1xufVxuXG5cbi8vIGZ1bmN0aW9uIF91cGRhdGUoZGIscXVlcnksdXBkYXRlLGNhbGxiYWNrKXsgXG4vLyAgICAgdmFyIGNiPWZ1bmN0aW9uKGVyciwgbnVtQWZmZWN0ZWQsIGFmZmVjdGVkRG9jdW1lbnRzLCB1cHNlcnQpe1xuLy8gICAgICAgY2FsbGJhY2soZXJyLGFmZmVjdGVkRG9jdW1lbnRzKTsvL+S/ruaUuWNhbGxiYWNr55qE562+5ZCN77yM5L2/5b6X56ys5LqM5Liq5Y+C5pWw5Li65pu05paw6L+H55qEZG9jXG4vLyAgICAgfTtcbi8vICAgICB2YXIgb3B0aW9ucz17IG11bHRpOiBmYWxzZSxyZXR1cm5VcGRhdGVkRG9jczp0cnVlIH07XG4vLyAgICAgZGIudXBkYXRlKHF1ZXJ5LCB1cGRhdGUsIG9wdGlvbnMsY2IpO1xuLy8gfVxuXG4vLyBjb25zdCB1cGRhdGU9UHJvbWlzZS5wcm9taXNpZnkoX3VwZGF0ZSk7Ly/kv67mlLljYWxsYmFja+etvuWQjeWQjuWwseWPr+S7pXByb21pc2lmeVxuXG4vLyBmdW5jdGlvbiB1cGRhdGVfZGF0YShnaWQsIGRhdGEpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBub2RlPWF3YWl0IHVwZGF0ZShkYix7X2lkOmdpZH0sIHsgJHNldDogeyBfZGF0YTogZGF0YSB9IH0pOy8v5pu05paw6IqC54K55bm26L+U5Zue5pu05paw5ZCO55qE6IqC54K5XG4vLyAgICAgcmV0dXJuIG5vZGU7XG4vLyAgIH0pKCk7XG4vLyB9XG5cblxuLy8gLy/pgJLlvZLpgY3ljobmiYDmnInlrZDoioLngrlcbi8vIC8vZ2lkc+aYr+imgeiuv+mXrueahOiKgueCuWlk55qE5YiX6KGoXG4vLyAvL3Zpc2l05piv5LiA5Liq5Ye95pWw44CC6K6/6Zeu6IqC54K555qE5Yqo5L2c44CCXG4vLyBmdW5jdGlvbiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihnaWRzLHZpc2l0KSB7XG4vLyAgIGlmICghZ2lkc3x8Z2lkcy5sZW5ndGg9PTApIHtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7fS8v6ZyA6KaB6L+U5Zue5LiA5LiqcHJvbWlzZSBcbi8vICAgcmV0dXJuIFByb21pc2UuYWxsKGdpZHMubWFwKGdpZCA9PiB7XG4vLyAgICAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+eyAvL+ivu+WPluW9k+WJjeiKgueCuVxuLy8gICAgICAgcmV0dXJuIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKG5vZGUuX2xpbmsuY2hpbGRyZW4sdmlzaXQpLnRoZW4oKCk9PnsgLy/orr/pl67miYDmnInlrZDoioLngrlcbi8vICAgICAgICAgcmV0dXJuIHZpc2l0KG5vZGUpOyAvL+eEtuWQjuiuv+mXruW9k+WJjeiKgueCuVxuLy8gICAgICAgfSlcbi8vICAgICB9KVxuLy8gICB9KSk7XG4vLyB9XG5cbi8vIC8v5qCH6K6w5Yig6Zmk6IqC54K55LiO5omA5pyJ5a2Q5a2Z6IqC54K5XG4vLyBmdW5jdGlvbiByZW1vdmUoZ2lkKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICAgaWYoZ2lkPT0nMCcpcmV0dXJuOy8v5qC56IqC54K55LiN6IO95Yig6Zmk44CCXG4vLyAgICAgIHZhciBub2RlPWF3YWl0IHJlYWRfbm9kZShnaWQpOyAvL+WFiOivu+WPluimgeWIoOmZpOeahOiKgueCuVxuLy8gICAgICBpZighbm9kZSlyZXR1cm47Ly/lt7Lnu4/kuI3lrZjlnKjvvIzov5Tlm55cbi8vICAgICAgLy/mlLbpm4bmiYDmnInlrZDoioLngrlcbi8vICAgICAgdmFyIGdpZHNmb3JSZW1vdmU9W107XG4vLyAgICAgIGNvbnN0IHJtPShub2RlKT0+e2dpZHNmb3JSZW1vdmUucHVzaChub2RlLl9pZCl9O1xuLy8gICAgICBhd2FpdCBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihbZ2lkXSxybSk7XG4vLyAgICAgIC8v5om56YeP5Yig6ZmkXG4vLyAgICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6eyRpbjpnaWRzZm9yUmVtb3ZlfX0sICB7ICRzZXQ6IHsgX3JtOnRydWUgIH0gfSwge30pOy8v5qCH6K6w5Li65Yig6ZmkXG4vLyAgICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6bm9kZS5fbGluay5wfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuLy8gICAgICByZXR1cm4gZ2lkc2ZvclJlbW92ZTtcbi8vICAgfSkoKTtcbi8vIH1cblxuLy8gZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xuLy8gICBpZihnaWQ9PScwJylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgLy8nMCfkuLrmoLnoioLngrnjgILku7vkvZXoioLngrnpg73kuI3mmK8nMCfnmoTniLboioLngrlcbi8vICAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+e1xuLy8gICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcbi8vICAgICBpZihub2RlLl9saW5rLnA9PT1wZ2lkKXtcbi8vICAgICAgIHJldHVybiB0cnVlO1xuLy8gICAgIH1lbHNle1xuLy8gICAgICAgcmV0dXJuIF9pc0FuY2VzdG9yKHBnaWQsbm9kZS5fbGluay5wKTtcbi8vICAgICB9XG4vLyAgIH0pXG4vLyB9XG5cbi8vIGZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlPWF3YWl0IF9pc0FuY2VzdG9yKGdpZCxucE5vZGUuX2lkKTtcbi8vICAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcbi8vICAgICAgIGNvbnNvbGUubG9nKGdpZCwnaXMgYW5jZXN0b3Igb2YnLG5wTm9kZS5faWQpXG4vLyAgICAgICByZXR1cm4gbnVsbDsvL+imgeenu+WKqOeahOiKgueCueS4jeiDveaYr+ebruagh+eItuiKgueCueeahOmVv+i+iOiKgueCuVxuLy8gICAgIH1cbi8vICAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmdpZH19KTsvL+aJvuWIsOWOn+eItuiKgueCuVxuXG4vLyAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpwTm9kZS5faWR9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4vLyAgICAgaWYobnBOb2RlLl9pZD09PXBOb2RlLl9pZCl7Ly/lpoLmnpzmlrDnmoTniLboioLngrnkuI7ml6fnmoTniLboioLngrnnm7jlkIzjgILopoHmm7TmlrDniLboioLngrlcbi8vICAgICAgIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lKHtfaWQ6bnBOb2RlLl9pZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTsgXG4vLyAgICAgfWVsc2V7XG4vLyAgICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOmdpZH0sICB7ICRzZXQ6IHsgXCJfbGluay5wXCI6IG5wTm9kZS5faWQgfSB9LCB7fSk7Ly/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcbi8vICAgICB9XG4vLyAgICAgdmFyIHBvcz0wO1xuLy8gICAgIHZhciBjaGlsZHJlbj1ucE5vZGUuX2xpbmsuY2hpbGRyZW47XG4vLyAgICAgaWYoYmdpZCl7XG4vLyAgICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuLy8gICAgIH1cbi8vICAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsZ2lkKTsvL+aKiuaWsOiKgueCueeahElE5o+S5YWl5Yiw54i26IqC54K55LitXG4vLyAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpucE5vZGUuX2lkfSwgbnBOb2RlLCB7fSk7Ly/mj5LlhaXniLboioLngrlcbiAgICAvLyByZXR1cm4gYXdhaXQgcmVhZF9ub2RlKGdpZCk7XG4vLyAgIH0pKCk7ICBcbi8vIH1cblxuLy8gLy/miopnaWToioLngrnnp7vliqjkuLpwZ2lk55qE5a2Q6IqC54K5XG4vLyAvL+WMheWQqzPmraXjgIIgMS7ku45naWTnmoTljp/niLboioLngrnliKDpmaTjgIIy5pS55Y+YZ2lk55qE5b2T5YmN54i26IqC54K544CCIDPjgILms6jlhozliLDmlrDniLboioLngrlcbi8vIC8v56e75Yqo5YmN6ZyA6KaB5YGa5qOA5p+l44CC56WW5YWI6IqC54K55LiN6IO956e75Yqo5Li65ZCO6L6I55qE5a2Q6IqC54K5XG4vLyBmdW5jdGlvbiBtb3ZlX2FzX3NvbihnaWQsIHBnaWQpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBucE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfaWRcIjpwZ2lkfSk7Ly/mib7liLDmlrDniLboioLngrlcbi8vICAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUpO1xuLy8gICB9KSgpOyAgXG4vLyB9XG5cbi8vIGZ1bmN0aW9uIG1vdmVfYXNfYnJvdGhlcihnaWQsIGJnaWQpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBucE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmJnaWR9fSk7Ly/mib7liLDmlrDniLboioLngrlcbi8vICAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUsYmdpZCk7XG4vLyAgIH0pKCk7IFxuLy8gfSJdfQ==