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
    // mk_son_by_name,
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

function _mk_son_by_data(pNode, data, bgid) {
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
              },
              _data: data
            };
            _context2.next = 3;
            return regeneratorRuntime.awrap(_insertAsync(_newNode));

          case 3:
            newNode = _context2.sent;
            //插入新节点
            //得到插入新节点的children
            children = _insertChildren(pNode._link.children, newNode._id, bgid);
            _context2.next = 7;
            return regeneratorRuntime.awrap(db.updateOne({ _id: pNode._id }, { $set: { "_link.children": children } }));

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

// function _mk_son_by_name(pNode,name,bgid){
//   return (async ()=>{
//     // console.log(pNode);
//     var newNode={
//         _link: {
//           p: pNode._id,
//           children: []
//         },
//         _name:name
//     };
//     var _newNode= await db.insertAsync(newNode);//插入新节点
//     var pos=0;
//     var children=pNode._link.children;
//     if(bgid){
//       pos=children.indexOf(bgid)+1;
//     }
//     children.splice(pos,0,_newNode._id);//把新节点的ID插入到父节点中
//     await db.updateAsync({_id:pNode._id}, pNode, {});//插入父节点
//     return _newNode;//返回新节点
//   })();
// }

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
            return _context3.abrupt('return', _mk_son_by_data(pNode, data));

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, null, _this3);
  }();
}

// function mk_son_by_name(pgid, name) {
//   return (async ()=>{
//     var pNode=await db.findOne({"_id":pgid}) ;//找到父节点
//     if(!pNode){
//       throw ('cannot find parent node '+pgid);
//       return null;//父节点不存在，无法插入，返回null
//     }
//     var node=await db.findOne({"_name":name});//是否已有同名节点
//     if(node){
//       return node;//如有直接返回
//     }
//     return _mk_son_by_name(pNode,name);
//   })();
// }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsSUFBSSxJQUFFLFFBQVEsT0FBUixDQUFGOztBQUVKLElBQU0sU0FBTyxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVA7O0FBRU4sSUFBSSxFQUFKO0FBQ0EsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEVBQTFCLEVBQTZCOztBQUUzQixPQUFHLEdBQUgsQ0FGMkI7QUFHM0Isd0JBQXNCLElBQXRCLENBQTJCLE9BQVEsRUFBUCxLQUFhLFVBQWIsR0FBeUIsSUFBMUIsR0FBK0IsSUFBL0IsQ0FBM0I7QUFIMkIsU0FJcEI7OztBQUdMLGtDQUhLOzs7Ozs7OztBQVdMLDRDQVhLO0dBQVAsQ0FKMkI7Q0FBN0I7O0FBbUJBLE9BQU8sT0FBUCxHQUFlLFlBQWY7O0FBRUEsSUFBTSxlQUFhLFNBQWIsWUFBYSxDQUFDLElBQUQsRUFBUTtBQUN6QixTQUFPLEdBQUcsU0FBSCxDQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBd0IsZUFBSztBQUNsQyxTQUFLLEdBQUwsR0FBUyxJQUFJLFVBQUosQ0FEeUI7QUFFbEMsV0FBTyxJQUFQLENBRmtDO0dBQUwsQ0FBL0IsQ0FEeUI7Q0FBUjs7QUFPbkIsSUFBTSxrQkFBZ0IsU0FBaEIsZUFBZ0IsQ0FBQyxRQUFELEVBQVUsR0FBVixFQUFjLElBQWQsRUFBcUI7QUFDdkMsTUFBSSxNQUFJLENBQUosQ0FEbUM7QUFFdkMsTUFBRyxJQUFILEVBQVE7QUFDTixVQUFJLFNBQVMsT0FBVCxDQUFpQixJQUFqQixJQUF1QixDQUF2QixDQURFO0dBQVI7QUFHQyxXQUFTLE1BQVQsQ0FBZ0IsR0FBaEIsRUFBb0IsQ0FBcEIsRUFBc0IsR0FBdEI7QUFMc0MsU0FNL0IsUUFBUCxDQU5zQztDQUFyQjs7QUFTdEIsU0FBUyxtQkFBVCxDQUE2QixFQUE3QixFQUFnQzs7OztBQUU5QixTQUFPLGdCQUFDOzs7Ozs7OzRDQUVTLEdBQUcsT0FBSCxDQUFXLEVBQUMsS0FBSSxHQUFKLEVBQVo7OztBQUFYOztnQkFFQTs7Ozs7QUFDRSwwQkFBWTtBQUNkLG1CQUFJLEdBQUo7QUFDQSxxQkFBTztBQUNMLG1CQUFHLEdBQUg7QUFDQSwwQkFBVSxFQUFWO2VBRkY7Ozs0Q0FLUyxhQUFhLFdBQWI7OztBQUFYOzs7NkNBR0s7Ozs7Ozs7O0dBZkQsRUFBUixDQUY4QjtDQUFoQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQ0EsU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQStCLElBQS9CLEVBQW9DLElBQXBDLEVBQXlDOzs7QUFDdkMsU0FBTyxpQkFBQzs7Ozs7Ozs7QUFFRix1QkFBUztBQUNULHFCQUFPO0FBQ0wsbUJBQUcsTUFBTSxHQUFOO0FBQ0gsMEJBQVUsRUFBVjtlQUZGO0FBSUEscUJBQU0sSUFBTjs7OzRDQUVlLGFBQWEsUUFBYjs7O0FBQWY7OztBQUVBLHVCQUFTLGdCQUFnQixNQUFNLEtBQU4sQ0FBWSxRQUFaLEVBQXFCLFFBQVEsR0FBUixFQUFZLElBQWpEOzs0Q0FDUCxHQUFHLFNBQUgsQ0FBYSxFQUFDLEtBQUksTUFBTSxHQUFOLEVBQWxCLEVBQThCLEVBQUMsTUFBTSxFQUFDLGtCQUFrQixRQUFsQixFQUFQLEVBQS9COzs7OENBQ0M7Ozs7Ozs7O0dBYkQsRUFBUixDQUR1QztDQUF6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdDQSxTQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0M7OztBQUNsQyxTQUFPLGlCQUFDOzs7Ozs7OzRDQUNVLEdBQUcsT0FBSCxDQUFXLEVBQUMsT0FBTSxJQUFOLEVBQVo7OztBQUFaOztnQkFDQTs7Ozs7a0JBQ0ssNkJBQTJCLElBQTNCOzs7OENBR0YsZ0JBQWdCLEtBQWhCLEVBQXNCLElBQXRCOzs7Ozs7OztHQU5ELEVBQVIsQ0FEa0M7Q0FBcEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2YXIgYXN5bmMgPSByZXF1aXJlKCdhc3luY2F3YWl0L2FzeW5jJyk7XG4vLyB2YXIgYXdhaXQgPSByZXF1aXJlKCdhc3luY2F3YWl0L2F3YWl0Jyk7XG4vLyB2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG52YXIgUj1yZXF1aXJlKCdyYW1kYScpO1xuXG5jb25zdCByZXN1bHQ9Ui5wcm9wKCdyZXN1bHQnKTtcblxudmFyIGRiOyBcbmZ1bmN0aW9uIHRyZWVfbW9uZ29kYihfZGIsY2Ipe1xuICAvLyBkYj1Qcm9taXNlLnByb21pc2lmeUFsbChfZGIpO1xuICBkYj1fZGI7XG4gIGJ1aWxkUm9vdElmTm90RXhpc3QoKS50aGVuKCh0eXBlb2YgY2IgPT09J2Z1bmN0aW9uJyk/Y2IoKTpudWxsKTsgLy9jYueUqOS6jumAmuefpea1i+ivleeoi+W6j1xuICByZXR1cm4ge1xuICAgIC8vIHJlYWRfbm9kZSxcbiAgICAvLyByZWFkX25vZGVzLFxuICAgIG1rX3Nvbl9ieV9kYXRhLFxuICAgIC8vIG1rX3Nvbl9ieV9uYW1lLFxuICAgIC8vIG1rX2Jyb3RoZXJfYnlfZGF0YSxcbiAgICAvLyB1cGRhdGVfZGF0YSxcbiAgICAvLyByZW1vdmUsXG4gICAgLy8gbW92ZV9hc19zb24sXG4gICAgLy8gbW92ZV9hc19icm90aGVyLFxuICAgIC8vZm9yIHRlc3RcbiAgICBidWlsZFJvb3RJZk5vdEV4aXN0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHM9dHJlZV9tb25nb2RiO1xuLy/lhoXpg6jlt6Xlhbflh73mlbBcbmNvbnN0IF9pbnNlcnRBc3luYz0obm9kZSk9PntcbiAgcmV0dXJuIGRiLmluc2VydE9uZShub2RlKS50aGVuKHJlcz0+e1xuICAgIG5vZGUuX2lkPXJlcy5pbnNlcnRlZElkO1xuICAgIHJldHVybiBub2RlO1xuICB9KVxufVxuLy/mj5LlhaVnaWTliLBjaGlsZHJlbuaVsOe7hOS4re+8jOaPkuWFpeeCueWcqGJnaWTkuYvlkI7vvIzlpoLmnpzmsqHmnIliZ2lk77yM5o+S5YWl5Zyo56ys5LiA5LiqXG5jb25zdCBfaW5zZXJ0Q2hpbGRyZW49KGNoaWxkcmVuLGdpZCxiZ2lkKT0+e1xuICAgIHZhciBwb3M9MDtcbiAgICBpZihiZ2lkKXtcbiAgICAgIHBvcz1jaGlsZHJlbi5pbmRleE9mKGJnaWQpKzE7XG4gICAgfVxuICAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsZ2lkKTsvL+aKiuaWsOiKgueCueeahElE5o+S5YWl5Yiw54i26IqC54K55LitXG4gICAgIHJldHVybiBjaGlsZHJlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRSb290SWZOb3RFeGlzdChjYil7XG4gIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiKTtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdCBiZWdpblwiKTtcbiAgICB2YXIgcm9vdD1hd2FpdCBkYi5maW5kT25lKHtfaWQ6JzAnfSk7XG4gICAgLy8gY29uc29sZS5sb2coXCJmb3VuZCByb290XCIscm9vdCk7XG4gICAgaWYoIXJvb3Qpe1xuICAgICAgdmFyIGRlZmF1bHRSb290PXtcbiAgICAgICAgX2lkOicwJywgXG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogJzAnLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcm9vdD1hd2FpdCBfaW5zZXJ0QXN5bmMoZGVmYXVsdFJvb3QpO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkUm9vdElmTm90RXhpc3RcIixyb290KTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfSkoKTtcbn1cblxuLy8gZnVuY3Rpb24gcmVhZF9ub2RlKGdpZCkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgLy8gY29uc29sZS5sb2coJ3JlYWRfbm9kZScsZ2lkKTtcbi8vICAgICB2YXIgbm9kZT1hd2FpdCBkYi5maW5kT25lKHtfaWQ6Z2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pOyAvL3Jt5qCH6K6w6KGo56S66IqC54K55bey57uP6KKr5Yig6ZmkXG4vLyAgICAgcmV0dXJuIG5vZGU7XG4vLyAgIH0pKCk7XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIG5vZGVzPWF3YWl0IGRiLmZpbmRBc3luYyh7X2lkOnskaW46Z2lkc30sX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTtcbi8vICAgICByZXR1cm4gbm9kZXM7XG4vLyAgIH0pKCk7XG4vLyB9XG5cbmZ1bmN0aW9uIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpe1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2cocE5vZGUpO1xuICAgIHZhciBfbmV3Tm9kZT17XG4gICAgICAgIF9saW5rOiB7XG4gICAgICAgICAgcDogcE5vZGUuX2lkLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9LFxuICAgICAgICBfZGF0YTpkYXRhXG4gICAgfTtcbiAgICB2YXIgbmV3Tm9kZT0gYXdhaXQgX2luc2VydEFzeW5jKF9uZXdOb2RlKSA7Ly/mj5LlhaXmlrDoioLngrlcbiAgICAvL+W+l+WIsOaPkuWFpeaWsOiKgueCueeahGNoaWxkcmVuXG4gICAgdmFyIGNoaWxkcmVuPV9pbnNlcnRDaGlsZHJlbihwTm9kZS5fbGluay5jaGlsZHJlbixuZXdOb2RlLl9pZCxiZ2lkKTtcbiAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCB7JHNldDoge1wiX2xpbmsuY2hpbGRyZW5cIjogY2hpbGRyZW59fSk7Ly/mj5LlhaXniLboioLngrlcbiAgICByZXR1cm4gbmV3Tm9kZTsvL+i/lOWbnuaWsOiKgueCuVxuICB9KSgpO1xufVxuXG4vLyBmdW5jdGlvbiBfbWtfc29uX2J5X25hbWUocE5vZGUsbmFtZSxiZ2lkKXtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIC8vIGNvbnNvbGUubG9nKHBOb2RlKTtcbi8vICAgICB2YXIgbmV3Tm9kZT17XG4vLyAgICAgICAgIF9saW5rOiB7XG4vLyAgICAgICAgICAgcDogcE5vZGUuX2lkLFxuLy8gICAgICAgICAgIGNoaWxkcmVuOiBbXVxuLy8gICAgICAgICB9LFxuLy8gICAgICAgICBfbmFtZTpuYW1lXG4vLyAgICAgfTtcbi8vICAgICB2YXIgX25ld05vZGU9IGF3YWl0IGRiLmluc2VydEFzeW5jKG5ld05vZGUpOy8v5o+S5YWl5paw6IqC54K5XG4vLyAgICAgdmFyIHBvcz0wO1xuLy8gICAgIHZhciBjaGlsZHJlbj1wTm9kZS5fbGluay5jaGlsZHJlbjtcbi8vICAgICBpZihiZ2lkKXtcbi8vICAgICAgIHBvcz1jaGlsZHJlbi5pbmRleE9mKGJnaWQpKzE7XG4vLyAgICAgfVxuLy8gICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxfbmV3Tm9kZS5faWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cbi8vICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOnBOb2RlLl9pZH0sIHBOb2RlLCB7fSk7Ly/mj5LlhaXniLboioLngrlcbi8vICAgICByZXR1cm4gX25ld05vZGU7Ly/ov5Tlm57mlrDoioLngrlcbi8vICAgfSkoKTtcbi8vIH1cblxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pOy8v5om+5Yiw54i26IqC54K5XG4gICAgaWYoIXBOb2RlKXtcbiAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbiAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9kYXRhKHBOb2RlLGRhdGEpO1xuICB9KSgpO1xufVxuXG4vLyBmdW5jdGlvbiBta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfaWRcIjpwZ2lkfSkgOy8v5om+5Yiw54i26IqC54K5XG4vLyAgICAgaWYoIXBOb2RlKXtcbi8vICAgICAgIHRocm93ICgnY2Fubm90IGZpbmQgcGFyZW50IG5vZGUgJytwZ2lkKTtcbi8vICAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuLy8gICAgIH1cbi8vICAgICB2YXIgbm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9uYW1lXCI6bmFtZX0pOy8v5piv5ZCm5bey5pyJ5ZCM5ZCN6IqC54K5XG4vLyAgICAgaWYobm9kZSl7XG4vLyAgICAgICByZXR1cm4gbm9kZTsvL+WmguacieebtOaOpei/lOWbnlxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gX21rX3Nvbl9ieV9uYW1lKHBOb2RlLG5hbWUpO1xuLy8gICB9KSgpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCxkYXRhKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmJnaWR9fSk7Ly/mib7liLDniLboioLngrlcbi8vICAgICBpZighcE5vZGUpe1xuLy8gICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSBvZiBicm90aGVyICcrYmdpZCk7XG4vLyAgICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbi8vICAgICB9XG4gICAgLy8gcmV0dXJuIF9ta19zb25fYnlfZGF0YShwTm9kZSxkYXRhLGJnaWQpO1xuLy8gICB9KSgpO1xuLy8gfVxuXG5cbi8vIGZ1bmN0aW9uIF91cGRhdGUoZGIscXVlcnksdXBkYXRlLGNhbGxiYWNrKXsgXG4vLyAgICAgdmFyIGNiPWZ1bmN0aW9uKGVyciwgbnVtQWZmZWN0ZWQsIGFmZmVjdGVkRG9jdW1lbnRzLCB1cHNlcnQpe1xuLy8gICAgICAgY2FsbGJhY2soZXJyLGFmZmVjdGVkRG9jdW1lbnRzKTsvL+S/ruaUuWNhbGxiYWNr55qE562+5ZCN77yM5L2/5b6X56ys5LqM5Liq5Y+C5pWw5Li65pu05paw6L+H55qEZG9jXG4vLyAgICAgfTtcbi8vICAgICB2YXIgb3B0aW9ucz17IG11bHRpOiBmYWxzZSxyZXR1cm5VcGRhdGVkRG9jczp0cnVlIH07XG4vLyAgICAgZGIudXBkYXRlKHF1ZXJ5LCB1cGRhdGUsIG9wdGlvbnMsY2IpO1xuLy8gfVxuXG4vLyBjb25zdCB1cGRhdGU9UHJvbWlzZS5wcm9taXNpZnkoX3VwZGF0ZSk7Ly/kv67mlLljYWxsYmFja+etvuWQjeWQjuWwseWPr+S7pXByb21pc2lmeVxuXG4vLyBmdW5jdGlvbiB1cGRhdGVfZGF0YShnaWQsIGRhdGEpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBub2RlPWF3YWl0IHVwZGF0ZShkYix7X2lkOmdpZH0sIHsgJHNldDogeyBfZGF0YTogZGF0YSB9IH0pOy8v5pu05paw6IqC54K55bm26L+U5Zue5pu05paw5ZCO55qE6IqC54K5XG4vLyAgICAgcmV0dXJuIG5vZGU7XG4vLyAgIH0pKCk7XG4vLyB9XG5cblxuLy8gLy/pgJLlvZLpgY3ljobmiYDmnInlrZDoioLngrlcbi8vIC8vZ2lkc+aYr+imgeiuv+mXrueahOiKgueCuWlk55qE5YiX6KGoXG4vLyAvL3Zpc2l05piv5LiA5Liq5Ye95pWw44CC6K6/6Zeu6IqC54K555qE5Yqo5L2c44CCXG4vLyBmdW5jdGlvbiBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihnaWRzLHZpc2l0KSB7XG4vLyAgIGlmICghZ2lkc3x8Z2lkcy5sZW5ndGg9PTApIHtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7fS8v6ZyA6KaB6L+U5Zue5LiA5LiqcHJvbWlzZSBcbi8vICAgcmV0dXJuIFByb21pc2UuYWxsKGdpZHMubWFwKGdpZCA9PiB7XG4vLyAgICAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+eyAvL+ivu+WPluW9k+WJjeiKgueCuVxuLy8gICAgICAgcmV0dXJuIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKG5vZGUuX2xpbmsuY2hpbGRyZW4sdmlzaXQpLnRoZW4oKCk9PnsgLy/orr/pl67miYDmnInlrZDoioLngrlcbi8vICAgICAgICAgcmV0dXJuIHZpc2l0KG5vZGUpOyAvL+eEtuWQjuiuv+mXruW9k+WJjeiKgueCuVxuLy8gICAgICAgfSlcbi8vICAgICB9KVxuLy8gICB9KSk7XG4vLyB9XG5cbi8vIC8v5qCH6K6w5Yig6Zmk6IqC54K55LiO5omA5pyJ5a2Q5a2Z6IqC54K5XG4vLyBmdW5jdGlvbiByZW1vdmUoZ2lkKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICAgaWYoZ2lkPT0nMCcpcmV0dXJuOy8v5qC56IqC54K55LiN6IO95Yig6Zmk44CCXG4vLyAgICAgIHZhciBub2RlPWF3YWl0IHJlYWRfbm9kZShnaWQpOyAvL+WFiOivu+WPluimgeWIoOmZpOeahOiKgueCuVxuLy8gICAgICBpZighbm9kZSlyZXR1cm47Ly/lt7Lnu4/kuI3lrZjlnKjvvIzov5Tlm55cbi8vICAgICAgLy/mlLbpm4bmiYDmnInlrZDoioLngrlcbi8vICAgICAgdmFyIGdpZHNmb3JSZW1vdmU9W107XG4vLyAgICAgIGNvbnN0IHJtPShub2RlKT0+e2dpZHNmb3JSZW1vdmUucHVzaChub2RlLl9pZCl9O1xuLy8gICAgICBhd2FpdCBfdHJhdmVyc2FsX2FsbF9jaGlsZHJlbihbZ2lkXSxybSk7XG4vLyAgICAgIC8v5om56YeP5Yig6ZmkXG4vLyAgICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6eyRpbjpnaWRzZm9yUmVtb3ZlfX0sICB7ICRzZXQ6IHsgX3JtOnRydWUgIH0gfSwge30pOy8v5qCH6K6w5Li65Yig6ZmkXG4vLyAgICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6bm9kZS5fbGluay5wfSwgIHsgJHB1bGw6IHsgXCJfbGluay5jaGlsZHJlblwiOiBnaWQgfSB9ICwge30pIDsvL+S7juWOn+eItuiKgueCueWIoOmZpFxuLy8gICAgICByZXR1cm4gZ2lkc2ZvclJlbW92ZTtcbi8vICAgfSkoKTtcbi8vIH1cblxuLy8gZnVuY3Rpb24gX2lzQW5jZXN0b3IocGdpZCxnaWQpe1xuLy8gICBpZihnaWQ9PScwJylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgLy8nMCfkuLrmoLnoioLngrnjgILku7vkvZXoioLngrnpg73kuI3mmK8nMCfnmoTniLboioLngrlcbi8vICAgcmV0dXJuIHJlYWRfbm9kZShnaWQpLnRoZW4obm9kZT0+e1xuLy8gICAgIC8vIGNvbnNvbGUubG9nKCdjaGVjaycscGdpZCxub2RlLl9saW5rLnAsbm9kZSlcbi8vICAgICBpZihub2RlLl9saW5rLnA9PT1wZ2lkKXtcbi8vICAgICAgIHJldHVybiB0cnVlO1xuLy8gICAgIH1lbHNle1xuLy8gICAgICAgcmV0dXJuIF9pc0FuY2VzdG9yKHBnaWQsbm9kZS5fbGluay5wKTtcbi8vICAgICB9XG4vLyAgIH0pXG4vLyB9XG5cbi8vIGZ1bmN0aW9uIF9tb3ZlX2FzX3NvbihnaWQsIG5wTm9kZSxiZ2lkKXtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlPWF3YWl0IF9pc0FuY2VzdG9yKGdpZCxucE5vZGUuX2lkKTtcbi8vICAgICBpZihnaWRJc0FuY2VzdG9yT2ZOZXdQYXJlbnROb2RlKXtcbi8vICAgICAgIGNvbnNvbGUubG9nKGdpZCwnaXMgYW5jZXN0b3Igb2YnLG5wTm9kZS5faWQpXG4vLyAgICAgICByZXR1cm4gbnVsbDsvL+imgeenu+WKqOeahOiKgueCueS4jeiDveaYr+ebruagh+eItuiKgueCueeahOmVv+i+iOiKgueCuVxuLy8gICAgIH1cbi8vICAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmdpZH19KTsvL+aJvuWIsOWOn+eItuiKgueCuVxuXG4vLyAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpwTm9kZS5faWR9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4vLyAgICAgaWYobnBOb2RlLl9pZD09PXBOb2RlLl9pZCl7Ly/lpoLmnpzmlrDnmoTniLboioLngrnkuI7ml6fnmoTniLboioLngrnnm7jlkIzjgILopoHmm7TmlrDniLboioLngrlcbi8vICAgICAgIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lKHtfaWQ6bnBOb2RlLl9pZCwgX3JtOiB7ICRleGlzdHM6IGZhbHNlIH19KTsgXG4vLyAgICAgfWVsc2V7XG4vLyAgICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOmdpZH0sICB7ICRzZXQ6IHsgXCJfbGluay5wXCI6IG5wTm9kZS5faWQgfSB9LCB7fSk7Ly/mlLnlj5hnaWTnmoTniLboioLngrnkuLrmlrDniLboioLngrlcbi8vICAgICB9XG4vLyAgICAgdmFyIHBvcz0wO1xuLy8gICAgIHZhciBjaGlsZHJlbj1ucE5vZGUuX2xpbmsuY2hpbGRyZW47XG4vLyAgICAgaWYoYmdpZCl7XG4vLyAgICAgICBwb3M9Y2hpbGRyZW4uaW5kZXhPZihiZ2lkKSsxO1xuLy8gICAgIH1cbi8vICAgICBjaGlsZHJlbi5zcGxpY2UocG9zLDAsZ2lkKTsvL+aKiuaWsOiKgueCueeahElE5o+S5YWl5Yiw54i26IqC54K55LitXG4vLyAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpucE5vZGUuX2lkfSwgbnBOb2RlLCB7fSk7Ly/mj5LlhaXniLboioLngrlcbi8vICAgICByZXR1cm4gYXdhaXQgcmVhZF9ub2RlKGdpZCk7XG4vLyAgIH0pKCk7ICBcbi8vIH1cblxuLy8gLy/miopnaWToioLngrnnp7vliqjkuLpwZ2lk55qE5a2Q6IqC54K5XG4vLyAvL+WMheWQqzPmraXjgIIgMS7ku45naWTnmoTljp/niLboioLngrnliKDpmaTjgIIy5pS55Y+YZ2lk55qE5b2T5YmN54i26IqC54K544CCIDPjgILms6jlhozliLDmlrDniLboioLngrlcbi8vIC8v56e75Yqo5YmN6ZyA6KaB5YGa5qOA5p+l44CC56WW5YWI6IqC54K55LiN6IO956e75Yqo5Li65ZCO6L6I55qE5a2Q6IqC54K5XG4vLyBmdW5jdGlvbiBtb3ZlX2FzX3NvbihnaWQsIHBnaWQpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBucE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfaWRcIjpwZ2lkfSk7Ly/mib7liLDmlrDniLboioLngrlcbi8vICAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUpO1xuLy8gICB9KSgpOyAgXG4vLyB9XG5cbi8vIGZ1bmN0aW9uIG1vdmVfYXNfYnJvdGhlcihnaWQsIGJnaWQpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBucE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbGluay5jaGlsZHJlblwiOnskZWxlbU1hdGNoOmJnaWR9fSk7Ly/mib7liLDmlrDniLboioLngrlcbi8vICAgICByZXR1cm4gX21vdmVfYXNfc29uKGdpZCxucE5vZGUsYmdpZCk7XG4vLyAgIH0pKCk7IFxuLy8gfSJdfQ==