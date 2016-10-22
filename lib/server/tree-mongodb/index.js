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
    // read_node,
    // read_nodes,
    mk_son_by_data: mk_son_by_data,
    mk_son_by_name: mk_son_by_name,
    // mk_brother_by_data,
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

// function read_node(gid) {
//   return (async ()=>{
//     // console.log('read_node',gid);
//     var node=await db.findOne({_id:gid, _rm: { $exists: false }}); //rm标记表示节点已经被删除
//     return node;
//   })();
// }

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
function _mk_son_by_data(pNode, data, bgid) {
  return _mk_son_by_kv(pNode, "_data", data, bgid);
}

function _mk_son_by_name(pNode, name, bgid) {
  return _mk_son_by_kv(pNode, "_name", name, bgid);
}

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
            return _context3.abrupt('return', _mk_son_by_data(pNode, data));

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
            return regeneratorRuntime.awrap(db.findOne({ "_name": name }));

          case 8:
            node = _context4.sent;

            if (!node) {
              _context4.next = 11;
              break;
            }

            return _context4.abrupt('return', node);

          case 11:
            return _context4.abrupt('return', _mk_son_by_name(pNode, name));

          case 12:
          case 'end':
            return _context4.stop();
        }
      }
    }, null, _this4);
  }();
}

// function mk_brother_by_data(bgid,data) {
//   return (async ()=>{
//     var pNode=await db.findOne({"_link.children":{$elemMatch:bgid}});//找到父节点
//     if(!pNode){
//       throw ('cannot find parent node of brother '+bgid);
//       return null;//父节点不存在，无法插入，返回null
//     }
// return _mk_son_by_data(pNode,data,bgid);
//   })();
// }

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
//     return await read_node(gid);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsSUFBSSxJQUFFLFFBQVEsT0FBUixDQUFGOztBQUVKLElBQU0sU0FBTyxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVA7O0FBRU4sSUFBSSxFQUFKO0FBQ0EsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEVBQTFCLEVBQTZCOztBQUUzQixPQUFHLEdBQUgsQ0FGMkI7QUFHM0Isd0JBQXNCLElBQXRCLENBQTJCLE9BQVEsRUFBUCxLQUFhLFVBQWIsR0FBeUIsSUFBMUIsR0FBK0IsSUFBL0IsQ0FBM0I7QUFIMkIsU0FJcEI7OztBQUdMLGtDQUhLO0FBSUwsa0NBSks7Ozs7Ozs7QUFXTCw0Q0FYSztHQUFQLENBSjJCO0NBQTdCOztBQW1CQSxPQUFPLE9BQVAsR0FBZSxZQUFmOztBQUVBLElBQU0sZUFBYSxTQUFiLFlBQWEsQ0FBQyxJQUFELEVBQVE7QUFDekIsU0FBTyxHQUFHLFNBQUgsQ0FBYSxJQUFiLEVBQW1CLElBQW5CLENBQXdCLGVBQUs7QUFDbEMsU0FBSyxHQUFMLEdBQVMsSUFBSSxVQUFKLENBRHlCO0FBRWxDLFdBQU8sSUFBUCxDQUZrQztHQUFMLENBQS9CLENBRHlCO0NBQVI7O0FBT25CLElBQU0sa0JBQWdCLFNBQWhCLGVBQWdCLENBQUMsUUFBRCxFQUFVLEdBQVYsRUFBYyxJQUFkLEVBQXFCO0FBQ3ZDLE1BQUksTUFBSSxDQUFKLENBRG1DO0FBRXZDLE1BQUcsSUFBSCxFQUFRO0FBQ04sVUFBSSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsSUFBdUIsQ0FBdkIsQ0FERTtHQUFSO0FBR0MsV0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQW9CLENBQXBCLEVBQXNCLEdBQXRCO0FBTHNDLFNBTS9CLFFBQVAsQ0FOc0M7Q0FBckI7O0FBU3RCLFNBQVMsbUJBQVQsQ0FBNkIsRUFBN0IsRUFBZ0M7Ozs7QUFFOUIsU0FBTyxnQkFBQzs7Ozs7Ozs0Q0FFUyxHQUFHLE9BQUgsQ0FBVyxFQUFDLEtBQUksR0FBSixFQUFaOzs7QUFBWDs7Z0JBRUE7Ozs7O0FBQ0UsMEJBQVk7QUFDZCxtQkFBSSxHQUFKO0FBQ0EscUJBQU87QUFDTCxtQkFBRyxHQUFIO0FBQ0EsMEJBQVUsRUFBVjtlQUZGOzs7NENBS1MsYUFBYSxXQUFiOzs7QUFBWDs7OzZDQUdLOzs7Ozs7OztHQWZELEVBQVIsQ0FGOEI7Q0FBaEM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBNkIsR0FBN0IsRUFBaUMsS0FBakMsRUFBdUMsSUFBdkMsRUFBNEM7OztBQUMxQyxTQUFPLGlCQUFDOzs7Ozs7OztBQUVGLHVCQUFTO0FBQ1QscUJBQU87QUFDTCxtQkFBRyxNQUFNLEdBQU47QUFDSCwwQkFBVSxFQUFWO2VBRkY7OztBQUtKLHFCQUFTLEdBQVQsSUFBYyxLQUFkOzs0Q0FDbUIsYUFBYSxRQUFiOzs7QUFBZjs7O0FBRUEsdUJBQVMsZ0JBQWdCLE1BQU0sS0FBTixDQUFZLFFBQVosRUFBcUIsUUFBUSxHQUFSLEVBQVksSUFBakQ7OzRDQUNQLEdBQUcsU0FBSCxDQUFhLEVBQUMsS0FBSSxNQUFNLEdBQU4sRUFBbEIsRUFBOEIsRUFBQyxNQUFNLEVBQUMsa0JBQWtCLFFBQWxCLEVBQVAsRUFBL0I7Ozs4Q0FDQzs7Ozs7Ozs7R0FiRCxFQUFSLENBRDBDO0NBQTVDOzs7QUFrQkEsU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQStCLElBQS9CLEVBQW9DLElBQXBDLEVBQXlDO0FBQ3ZDLFNBQU8sY0FBYyxLQUFkLEVBQW9CLE9BQXBCLEVBQTRCLElBQTVCLEVBQWlDLElBQWpDLENBQVAsQ0FEdUM7Q0FBekM7O0FBSUEsU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQStCLElBQS9CLEVBQW9DLElBQXBDLEVBQXlDO0FBQ3ZDLFNBQU8sY0FBYyxLQUFkLEVBQW9CLE9BQXBCLEVBQTRCLElBQTVCLEVBQWlDLElBQWpDLENBQVAsQ0FEdUM7Q0FBekM7O0FBS0EsU0FBUyxjQUFULENBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVSxHQUFHLE9BQUgsQ0FBVyxFQUFDLE9BQU0sSUFBTixFQUFaOzs7QUFBWjs7Z0JBQ0E7Ozs7O2tCQUNLLDZCQUEyQixJQUEzQjs7OzhDQUdGLGdCQUFnQixLQUFoQixFQUFzQixJQUF0Qjs7Ozs7Ozs7R0FORCxFQUFSLENBRGtDO0NBQXBDOztBQVdBLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQzs7O0FBQ2xDLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1UsR0FBRyxPQUFILENBQVcsRUFBQyxPQUFNLElBQU4sRUFBWjs7O0FBQVo7O2dCQUNBOzs7OztrQkFDSyw2QkFBMkIsSUFBM0I7Ozs7NENBR00sR0FBRyxPQUFILENBQVcsRUFBQyxTQUFRLElBQVIsRUFBWjs7O0FBQVg7O2lCQUNEOzs7Ozs4Q0FDTTs7OzhDQUVGLGdCQUFnQixLQUFoQixFQUFzQixJQUF0Qjs7Ozs7Ozs7R0FWRCxFQUFSLENBRGtDO0NBQXBDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hc3luYycpO1xuLy8gdmFyIGF3YWl0ID0gcmVxdWlyZSgnYXN5bmNhd2FpdC9hd2FpdCcpO1xuLy8gdmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xudmFyIFI9cmVxdWlyZSgncmFtZGEnKTtcblxuY29uc3QgcmVzdWx0PVIucHJvcCgncmVzdWx0Jyk7XG5cbnZhciBkYjsgXG5mdW5jdGlvbiB0cmVlX21vbmdvZGIoX2RiLGNiKXtcbiAgLy8gZGI9UHJvbWlzZS5wcm9taXNpZnlBbGwoX2RiKTtcbiAgZGI9X2RiO1xuICBidWlsZFJvb3RJZk5vdEV4aXN0KCkudGhlbigodHlwZW9mIGNiID09PSdmdW5jdGlvbicpP2NiKCk6bnVsbCk7IC8vY2LnlKjkuo7pgJrnn6XmtYvor5XnqIvluo9cbiAgcmV0dXJuIHtcbiAgICAvLyByZWFkX25vZGUsXG4gICAgLy8gcmVhZF9ub2RlcyxcbiAgICBta19zb25fYnlfZGF0YSxcbiAgICBta19zb25fYnlfbmFtZSxcbiAgICAvLyBta19icm90aGVyX2J5X2RhdGEsXG4gICAgLy8gdXBkYXRlX2RhdGEsXG4gICAgLy8gcmVtb3ZlLFxuICAgIC8vIG1vdmVfYXNfc29uLFxuICAgIC8vIG1vdmVfYXNfYnJvdGhlcixcbiAgICAvL2ZvciB0ZXN0XG4gICAgYnVpbGRSb290SWZOb3RFeGlzdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzPXRyZWVfbW9uZ29kYjtcbi8v5YaF6YOo5bel5YW35Ye95pWwXG5jb25zdCBfaW5zZXJ0QXN5bmM9KG5vZGUpPT57XG4gIHJldHVybiBkYi5pbnNlcnRPbmUobm9kZSkudGhlbihyZXM9PntcbiAgICBub2RlLl9pZD1yZXMuaW5zZXJ0ZWRJZDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSlcbn1cbi8v5o+S5YWlZ2lk5YiwY2hpbGRyZW7mlbDnu4TkuK3vvIzmj5LlhaXngrnlnKhiZ2lk5LmL5ZCO77yM5aaC5p6c5rKh5pyJYmdpZO+8jOaPkuWFpeWcqOesrOS4gOS4qlxuY29uc3QgX2luc2VydENoaWxkcmVuPShjaGlsZHJlbixnaWQsYmdpZCk9PntcbiAgICB2YXIgcG9zPTA7XG4gICAgaWYoYmdpZCl7XG4gICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuICAgIH1cbiAgICAgY2hpbGRyZW4uc3BsaWNlKHBvcywwLGdpZCk7Ly/miormlrDoioLngrnnmoRJROaPkuWFpeWIsOeItuiKgueCueS4rVxuICAgICByZXR1cm4gY2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUm9vdElmTm90RXhpc3QoY2Ipe1xuICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3RcIik7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3QgYmVnaW5cIik7XG4gICAgdmFyIHJvb3Q9YXdhaXQgZGIuZmluZE9uZSh7X2lkOicwJ30pO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiZm91bmQgcm9vdFwiLHJvb3QpO1xuICAgIGlmKCFyb290KXtcbiAgICAgIHZhciBkZWZhdWx0Um9vdD17XG4gICAgICAgIF9pZDonMCcsIFxuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6ICcwJyxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJvb3Q9YXdhaXQgX2luc2VydEFzeW5jKGRlZmF1bHRSb290KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIscm9vdCk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH0pKCk7XG59XG5cbi8vIGZ1bmN0aW9uIHJlYWRfbm9kZShnaWQpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIC8vIGNvbnNvbGUubG9nKCdyZWFkX25vZGUnLGdpZCk7XG4vLyAgICAgdmFyIG5vZGU9YXdhaXQgZGIuZmluZE9uZSh7X2lkOmdpZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTsgLy9ybeagh+iusOihqOekuuiKgueCueW3sue7j+iiq+WIoOmZpFxuLy8gICAgIHJldHVybiBub2RlO1xuLy8gICB9KSgpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBub2Rlcz1hd2FpdCBkYi5maW5kQXN5bmMoe19pZDp7JGluOmdpZHN9LF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7XG4vLyAgICAgcmV0dXJuIG5vZGVzO1xuLy8gICB9KSgpO1xuLy8gfVxuLy8gXG5cbmZ1bmN0aW9uIF9ta19zb25fYnlfa3YocE5vZGUsa2V5LHZhbHVlLGJnaWQpe1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2cocE5vZGUpO1xuICAgIHZhciBfbmV3Tm9kZT17XG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgfTtcbiAgICBfbmV3Tm9kZVtrZXldPXZhbHVlO1xuICAgIHZhciBuZXdOb2RlPSBhd2FpdCBfaW5zZXJ0QXN5bmMoX25ld05vZGUpIDsvL+aPkuWFpeaWsOiKgueCuVxuICAgIC8v5b6X5Yiw5o+S5YWl5paw6IqC54K555qEY2hpbGRyZW5cbiAgICB2YXIgY2hpbGRyZW49X2luc2VydENoaWxkcmVuKHBOb2RlLl9saW5rLmNoaWxkcmVuLG5ld05vZGUuX2lkLGJnaWQpO1xuICAgIGF3YWl0IGRiLnVwZGF0ZU9uZSh7X2lkOnBOb2RlLl9pZH0sIHskc2V0OiB7XCJfbGluay5jaGlsZHJlblwiOiBjaGlsZHJlbn19KTsvL+aPkuWFpeeItuiKgueCuVxuICAgIHJldHVybiBuZXdOb2RlOy8v6L+U5Zue5paw6IqC54K5XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpe1xuICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9kYXRhXCIsZGF0YSxiZ2lkKTtcbn1cblxuZnVuY3Rpb24gX21rX3Nvbl9ieV9uYW1lKHBOb2RlLG5hbWUsYmdpZCl7XG4gIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX25hbWVcIixuYW1lLGJnaWQpO1xufVxuXG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9pZFwiOnBnaWR9KTsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhKTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pIDsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgdmFyIG5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbmFtZVwiOm5hbWV9KTsvL+aYr+WQpuW3suacieWQjOWQjeiKgueCuVxuICAgIGlmKG5vZGUpe1xuICAgICAgcmV0dXJuIG5vZGU7Ly/lpoLmnInnm7TmjqXov5Tlm55cbiAgICB9XG4gICAgcmV0dXJuIF9ta19zb25fYnlfbmFtZShwTm9kZSxuYW1lKTtcbiAgfSkoKTtcbn1cblxuLy8gZnVuY3Rpb24gbWtfYnJvdGhlcl9ieV9kYXRhKGJnaWQsZGF0YSkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpiZ2lkfX0pOy8v5om+5Yiw54i26IqC54K5XG4vLyAgICAgaWYoIXBOb2RlKXtcbi8vICAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgb2YgYnJvdGhlciAnK2JnaWQpO1xuLy8gICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4vLyAgICAgfVxuICAgIC8vIHJldHVybiBfbWtfc29uX2J5X2RhdGEocE5vZGUsZGF0YSxiZ2lkKTtcbi8vICAgfSkoKTtcbi8vIH1cblxuXG4vLyBmdW5jdGlvbiBfdXBkYXRlKGRiLHF1ZXJ5LHVwZGF0ZSxjYWxsYmFjayl7IFxuLy8gICAgIHZhciBjYj1mdW5jdGlvbihlcnIsIG51bUFmZmVjdGVkLCBhZmZlY3RlZERvY3VtZW50cywgdXBzZXJ0KXtcbi8vICAgICAgIGNhbGxiYWNrKGVycixhZmZlY3RlZERvY3VtZW50cyk7Ly/kv67mlLljYWxsYmFja+eahOetvuWQje+8jOS9v+W+l+esrOS6jOS4quWPguaVsOS4uuabtOaWsOi/h+eahGRvY1xuLy8gICAgIH07XG4vLyAgICAgdmFyIG9wdGlvbnM9eyBtdWx0aTogZmFsc2UscmV0dXJuVXBkYXRlZERvY3M6dHJ1ZSB9O1xuLy8gICAgIGRiLnVwZGF0ZShxdWVyeSwgdXBkYXRlLCBvcHRpb25zLGNiKTtcbi8vIH1cblxuLy8gY29uc3QgdXBkYXRlPVByb21pc2UucHJvbWlzaWZ5KF91cGRhdGUpOy8v5L+u5pS5Y2FsbGJhY2vnrb7lkI3lkI7lsLHlj6/ku6Vwcm9taXNpZnlcblxuLy8gZnVuY3Rpb24gdXBkYXRlX2RhdGEoZ2lkLCBkYXRhKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgbm9kZT1hd2FpdCB1cGRhdGUoZGIse19pZDpnaWR9LCB7ICRzZXQ6IHsgX2RhdGE6IGRhdGEgfSB9KTsvL+abtOaWsOiKgueCueW5tui/lOWbnuabtOaWsOWQjueahOiKgueCuVxuLy8gICAgIHJldHVybiBub2RlO1xuLy8gICB9KSgpO1xuLy8gfVxuXG5cbi8vIC8v6YCS5b2S6YGN5Y6G5omA5pyJ5a2Q6IqC54K5XG4vLyAvL2dpZHPmmK/opoHorr/pl67nmoToioLngrlpZOeahOWIl+ihqFxuLy8gLy92aXNpdOaYr+S4gOS4quWHveaVsOOAguiuv+mXruiKgueCueeahOWKqOS9nOOAglxuLy8gZnVuY3Rpb24gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oZ2lkcyx2aXNpdCkge1xuLy8gICBpZiAoIWdpZHN8fGdpZHMubGVuZ3RoPT0wKSB7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO30vL+mcgOimgei/lOWbnuS4gOS4qnByb21pc2UgXG4vLyAgIHJldHVybiBQcm9taXNlLmFsbChnaWRzLm1hcChnaWQgPT4ge1xuLy8gICAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9PnsgLy/or7vlj5blvZPliY3oioLngrlcbi8vICAgICAgIHJldHVybiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihub2RlLl9saW5rLmNoaWxkcmVuLHZpc2l0KS50aGVuKCgpPT57IC8v6K6/6Zeu5omA5pyJ5a2Q6IqC54K5XG4vLyAgICAgICAgIHJldHVybiB2aXNpdChub2RlKTsgLy/nhLblkI7orr/pl67lvZPliY3oioLngrlcbi8vICAgICAgIH0pXG4vLyAgICAgfSlcbi8vICAgfSkpO1xuLy8gfVxuXG4vLyAvL+agh+iusOWIoOmZpOiKgueCueS4juaJgOacieWtkOWtmeiKgueCuVxuLy8gZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgIGlmKGdpZD09JzAnKXJldHVybjsvL+agueiKgueCueS4jeiDveWIoOmZpOOAglxuLy8gICAgICB2YXIgbm9kZT1hd2FpdCByZWFkX25vZGUoZ2lkKTsgLy/lhYjor7vlj5bopoHliKDpmaTnmoToioLngrlcbi8vICAgICAgaWYoIW5vZGUpcmV0dXJuOy8v5bey57uP5LiN5a2Y5Zyo77yM6L+U5ZueXG4vLyAgICAgIC8v5pS26ZuG5omA5pyJ5a2Q6IqC54K5XG4vLyAgICAgIHZhciBnaWRzZm9yUmVtb3ZlPVtdO1xuLy8gICAgICBjb25zdCBybT0obm9kZSk9PntnaWRzZm9yUmVtb3ZlLnB1c2gobm9kZS5faWQpfTtcbi8vICAgICAgYXdhaXQgX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4oW2dpZF0scm0pO1xuLy8gICAgICAvL+aJuemHj+WIoOmZpFxuLy8gICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOnskaW46Z2lkc2ZvclJlbW92ZX19LCAgeyAkc2V0OiB7IF9ybTp0cnVlICB9IH0sIHt9KTsvL+agh+iusOS4uuWIoOmZpFxuLy8gICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOm5vZGUuX2xpbmsucH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSA7Ly/ku47ljp/niLboioLngrnliKDpmaRcbi8vICAgICAgcmV0dXJuIGdpZHNmb3JSZW1vdmU7XG4vLyAgIH0pKCk7XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIF9pc0FuY2VzdG9yKHBnaWQsZ2lkKXtcbi8vICAgaWYoZ2lkPT0nMCcpcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7IC8vJzAn5Li65qC56IqC54K544CC5Lu75L2V6IqC54K56YO95LiN5pivJzAn55qE54i26IqC54K5XG4vLyAgIHJldHVybiByZWFkX25vZGUoZ2lkKS50aGVuKG5vZGU9Pntcbi8vICAgICAvLyBjb25zb2xlLmxvZygnY2hlY2snLHBnaWQsbm9kZS5fbGluay5wLG5vZGUpXG4vLyAgICAgaWYobm9kZS5fbGluay5wPT09cGdpZCl7XG4vLyAgICAgICByZXR1cm4gdHJ1ZTtcbi8vICAgICB9ZWxzZXtcbi8vICAgICAgIHJldHVybiBfaXNBbmNlc3RvcihwZ2lkLG5vZGUuX2xpbmsucCk7XG4vLyAgICAgfVxuLy8gICB9KVxuLy8gfVxuXG4vLyBmdW5jdGlvbiBfbW92ZV9hc19zb24oZ2lkLCBucE5vZGUsYmdpZCl7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZT1hd2FpdCBfaXNBbmNlc3RvcihnaWQsbnBOb2RlLl9pZCk7XG4vLyAgICAgaWYoZ2lkSXNBbmNlc3Rvck9mTmV3UGFyZW50Tm9kZSl7XG4vLyAgICAgICBjb25zb2xlLmxvZyhnaWQsJ2lzIGFuY2VzdG9yIG9mJyxucE5vZGUuX2lkKVxuLy8gICAgICAgcmV0dXJuIG51bGw7Ly/opoHnp7vliqjnmoToioLngrnkuI3og73mmK/nm67moIfniLboioLngrnnmoTplb/ovojoioLngrlcbi8vICAgICB9XG4vLyAgICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpnaWR9fSk7Ly/mib7liLDljp/niLboioLngrlcblxuLy8gICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6cE5vZGUuX2lkfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuLy8gICAgIGlmKG5wTm9kZS5faWQ9PT1wTm9kZS5faWQpey8v5aaC5p6c5paw55qE54i26IqC54K55LiO5pen55qE54i26IqC54K555u45ZCM44CC6KaB5pu05paw54i26IqC54K5XG4vLyAgICAgICBucE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7X2lkOm5wTm9kZS5faWQsIF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7IFxuLy8gICAgIH1lbHNle1xuLy8gICAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpnaWR9LCAgeyAkc2V0OiB7IFwiX2xpbmsucFwiOiBucE5vZGUuX2lkIH0gfSwge30pOy8v5pS55Y+YZ2lk55qE54i26IqC54K55Li65paw54i26IqC54K5XG4vLyAgICAgfVxuLy8gICAgIHZhciBwb3M9MDtcbi8vICAgICB2YXIgY2hpbGRyZW49bnBOb2RlLl9saW5rLmNoaWxkcmVuO1xuLy8gICAgIGlmKGJnaWQpe1xuLy8gICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcbi8vICAgICB9XG4vLyAgICAgY2hpbGRyZW4uc3BsaWNlKHBvcywwLGdpZCk7Ly/miormlrDoioLngrnnmoRJROaPkuWFpeWIsOeItuiKgueCueS4rVxuLy8gICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6bnBOb2RlLl9pZH0sIG5wTm9kZSwge30pOy8v5o+S5YWl54i26IqC54K5XG4vLyAgICAgcmV0dXJuIGF3YWl0IHJlYWRfbm9kZShnaWQpO1xuLy8gICB9KSgpOyAgXG4vLyB9XG5cbi8vIC8v5oqKZ2lk6IqC54K556e75Yqo5Li6cGdpZOeahOWtkOiKgueCuVxuLy8gLy/ljIXlkKsz5q2l44CCIDEu5LuOZ2lk55qE5Y6f54i26IqC54K55Yig6Zmk44CCMuaUueWPmGdpZOeahOW9k+WJjeeItuiKgueCueOAgiAz44CC5rOo5YaM5Yiw5paw54i26IqC54K5XG4vLyAvL+enu+WKqOWJjemcgOimgeWBmuajgOafpeOAguelluWFiOiKgueCueS4jeiDveenu+WKqOS4uuWQjui+iOeahOWtkOiKgueCuVxuLy8gZnVuY3Rpb24gbW92ZV9hc19zb24oZ2lkLCBwZ2lkKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgbnBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pOy8v5om+5Yiw5paw54i26IqC54K5XG4vLyAgICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlKTtcbi8vICAgfSkoKTsgIFxuLy8gfVxuXG4vLyBmdW5jdGlvbiBtb3ZlX2FzX2Jyb3RoZXIoZ2lkLCBiZ2lkKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgbnBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2xpbmsuY2hpbGRyZW5cIjp7JGVsZW1NYXRjaDpiZ2lkfX0pOy8v5om+5Yiw5paw54i26IqC54K5XG4vLyAgICAgcmV0dXJuIF9tb3ZlX2FzX3NvbihnaWQsbnBOb2RlLGJnaWQpO1xuLy8gICB9KSgpOyBcbi8vIH0iXX0=