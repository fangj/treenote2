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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvdHJlZS1tb25nb2RiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsSUFBSSxJQUFFLFFBQVEsT0FBUixDQUFGOztBQUVKLElBQU0sU0FBTyxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVA7O0FBRU4sSUFBSSxFQUFKO0FBQ0EsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEVBQTFCLEVBQTZCOztBQUUzQixPQUFHLEdBQUgsQ0FGMkI7QUFHM0Isd0JBQXNCLElBQXRCLENBQTJCLE9BQVEsRUFBUCxLQUFhLFVBQWIsR0FBeUIsSUFBMUIsR0FBK0IsSUFBL0IsQ0FBM0I7QUFIMkIsU0FJcEI7OztBQUdMLGtDQUhLO0FBSUwsa0NBSks7Ozs7Ozs7QUFXTCw0Q0FYSztHQUFQLENBSjJCO0NBQTdCOztBQW1CQSxPQUFPLE9BQVAsR0FBZSxZQUFmOztBQUVBLElBQU0sZUFBYSxTQUFiLFlBQWEsQ0FBQyxJQUFELEVBQVE7QUFDekIsU0FBTyxHQUFHLFNBQUgsQ0FBYSxJQUFiLEVBQW1CLElBQW5CLENBQXdCLGVBQUs7QUFDbEMsU0FBSyxHQUFMLEdBQVMsSUFBSSxVQUFKLENBRHlCO0FBRWxDLFdBQU8sSUFBUCxDQUZrQztHQUFMLENBQS9CLENBRHlCO0NBQVI7O0FBT25CLElBQU0sa0JBQWdCLFNBQWhCLGVBQWdCLENBQUMsUUFBRCxFQUFVLEdBQVYsRUFBYyxJQUFkLEVBQXFCO0FBQ3ZDLE1BQUksTUFBSSxDQUFKLENBRG1DO0FBRXZDLE1BQUcsSUFBSCxFQUFRO0FBQ04sVUFBSSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsSUFBdUIsQ0FBdkIsQ0FERTtHQUFSO0FBR0MsV0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQW9CLENBQXBCLEVBQXNCLEdBQXRCO0FBTHNDLFNBTS9CLFFBQVAsQ0FOc0M7Q0FBckI7O0FBU3RCLFNBQVMsbUJBQVQsQ0FBNkIsRUFBN0IsRUFBZ0M7Ozs7QUFFOUIsU0FBTyxnQkFBQzs7Ozs7Ozs0Q0FFUyxHQUFHLE9BQUgsQ0FBVyxFQUFDLEtBQUksR0FBSixFQUFaOzs7QUFBWDs7Z0JBRUE7Ozs7O0FBQ0UsMEJBQVk7QUFDZCxtQkFBSSxHQUFKO0FBQ0EscUJBQU87QUFDTCxtQkFBRyxHQUFIO0FBQ0EsMEJBQVUsRUFBVjtlQUZGOzs7NENBS1MsYUFBYSxXQUFiOzs7QUFBWDs7OzZDQUdLOzs7Ozs7OztHQWZELEVBQVIsQ0FGOEI7Q0FBaEM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBNkIsR0FBN0IsRUFBaUMsS0FBakMsRUFBdUMsSUFBdkMsRUFBNEM7OztBQUMxQyxTQUFPLGlCQUFDOzs7Ozs7OztBQUVGLHVCQUFTO0FBQ1QscUJBQU87QUFDTCxtQkFBRyxNQUFNLEdBQU47QUFDSCwwQkFBVSxFQUFWO2VBRkY7OztBQUtKLHFCQUFTLEdBQVQsSUFBYyxLQUFkOzs0Q0FDbUIsYUFBYSxRQUFiOzs7QUFBZjs7O0FBRUEsdUJBQVMsZ0JBQWdCLE1BQU0sS0FBTixDQUFZLFFBQVosRUFBcUIsUUFBUSxHQUFSLEVBQVksSUFBakQ7OzRDQUNQLEdBQUcsU0FBSCxDQUFhLEVBQUMsS0FBSSxNQUFNLEdBQU4sRUFBbEIsRUFBOEIsRUFBQyxNQUFNLEVBQUMsa0JBQWtCLFFBQWxCLEVBQVAsRUFBL0I7Ozs4Q0FDQzs7Ozs7Ozs7R0FiRCxFQUFSLENBRDBDO0NBQTVDOzs7QUFrQkEsU0FBUyxjQUFULENBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DOzs7QUFDbEMsU0FBTyxpQkFBQzs7Ozs7Ozs0Q0FDVSxHQUFHLE9BQUgsQ0FBVyxFQUFDLE9BQU0sSUFBTixFQUFaOzs7QUFBWjs7Z0JBQ0E7Ozs7O2tCQUNLLDZCQUEyQixJQUEzQjs7OzhDQUdGLGNBQWMsS0FBZCxFQUFvQixPQUFwQixFQUE0QixJQUE1Qjs7Ozs7Ozs7R0FORCxFQUFSLENBRGtDO0NBQXBDOztBQVdBLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQzs7O0FBQ2xDLFNBQU8saUJBQUM7Ozs7Ozs7NENBQ1UsR0FBRyxPQUFILENBQVcsRUFBQyxPQUFNLElBQU4sRUFBWjs7O0FBQVo7O2dCQUNBOzs7OztrQkFDSyw2QkFBMkIsSUFBM0I7Ozs7NENBR00sR0FBRyxPQUFILENBQVcsRUFBQyxTQUFRLElBQVIsRUFBYSxXQUFVLElBQVYsRUFBekI7OztBQUFYOztpQkFDRDs7Ozs7OENBQ007Ozs4Q0FFRixjQUFjLEtBQWQsRUFBb0IsT0FBcEIsRUFBNEIsSUFBNUI7Ozs7Ozs7O0dBVkQsRUFBUixDQURrQztDQUFwQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXN5bmMnKTtcbi8vIHZhciBhd2FpdCA9IHJlcXVpcmUoJ2FzeW5jYXdhaXQvYXdhaXQnKTtcbi8vIHZhciBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbnZhciBSPXJlcXVpcmUoJ3JhbWRhJyk7XG5cbmNvbnN0IHJlc3VsdD1SLnByb3AoJ3Jlc3VsdCcpO1xuXG52YXIgZGI7IFxuZnVuY3Rpb24gdHJlZV9tb25nb2RiKF9kYixjYil7XG4gIC8vIGRiPVByb21pc2UucHJvbWlzaWZ5QWxsKF9kYik7XG4gIGRiPV9kYjtcbiAgYnVpbGRSb290SWZOb3RFeGlzdCgpLnRoZW4oKHR5cGVvZiBjYiA9PT0nZnVuY3Rpb24nKT9jYigpOm51bGwpOyAvL2Ni55So5LqO6YCa55+l5rWL6K+V56iL5bqPXG4gIHJldHVybiB7XG4gICAgLy8gcmVhZF9ub2RlLFxuICAgIC8vIHJlYWRfbm9kZXMsXG4gICAgbWtfc29uX2J5X2RhdGEsXG4gICAgbWtfc29uX2J5X25hbWUsXG4gICAgLy8gbWtfYnJvdGhlcl9ieV9kYXRhLFxuICAgIC8vIHVwZGF0ZV9kYXRhLFxuICAgIC8vIHJlbW92ZSxcbiAgICAvLyBtb3ZlX2FzX3NvbixcbiAgICAvLyBtb3ZlX2FzX2Jyb3RoZXIsXG4gICAgLy9mb3IgdGVzdFxuICAgIGJ1aWxkUm9vdElmTm90RXhpc3RcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cz10cmVlX21vbmdvZGI7XG4vL+WGhemDqOW3peWFt+WHveaVsFxuY29uc3QgX2luc2VydEFzeW5jPShub2RlKT0+e1xuICByZXR1cm4gZGIuaW5zZXJ0T25lKG5vZGUpLnRoZW4ocmVzPT57XG4gICAgbm9kZS5faWQ9cmVzLmluc2VydGVkSWQ7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH0pXG59XG4vL+aPkuWFpWdpZOWIsGNoaWxkcmVu5pWw57uE5Lit77yM5o+S5YWl54K55ZyoYmdpZOS5i+WQju+8jOWmguaenOayoeaciWJnaWTvvIzmj5LlhaXlnKjnrKzkuIDkuKpcbmNvbnN0IF9pbnNlcnRDaGlsZHJlbj0oY2hpbGRyZW4sZ2lkLGJnaWQpPT57XG4gICAgdmFyIHBvcz0wO1xuICAgIGlmKGJnaWQpe1xuICAgICAgcG9zPWNoaWxkcmVuLmluZGV4T2YoYmdpZCkrMTtcbiAgICB9XG4gICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxnaWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cbiAgICAgcmV0dXJuIGNoaWxkcmVuO1xufVxuXG5mdW5jdGlvbiBidWlsZFJvb3RJZk5vdEV4aXN0KGNiKXtcbiAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0XCIpO1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZFJvb3RJZk5vdEV4aXN0IGJlZ2luXCIpO1xuICAgIHZhciByb290PWF3YWl0IGRiLmZpbmRPbmUoe19pZDonMCd9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhcImZvdW5kIHJvb3RcIixyb290KTtcbiAgICBpZighcm9vdCl7XG4gICAgICB2YXIgZGVmYXVsdFJvb3Q9e1xuICAgICAgICBfaWQ6JzAnLCBcbiAgICAgICAgX2xpbms6IHtcbiAgICAgICAgICBwOiAnMCcsXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByb290PWF3YWl0IF9pbnNlcnRBc3luYyhkZWZhdWx0Um9vdCk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGRSb290SWZOb3RFeGlzdFwiLHJvb3QpO1xuICAgIHJldHVybiByb290O1xuICB9KSgpO1xufVxuXG4vLyBmdW5jdGlvbiByZWFkX25vZGUoZ2lkKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICAvLyBjb25zb2xlLmxvZygncmVhZF9ub2RlJyxnaWQpO1xuLy8gICAgIHZhciBub2RlPWF3YWl0IGRiLmZpbmRPbmUoe19pZDpnaWQsIF9ybTogeyAkZXhpc3RzOiBmYWxzZSB9fSk7IC8vcm3moIforrDooajnpLroioLngrnlt7Lnu4/ooqvliKDpmaRcbi8vICAgICByZXR1cm4gbm9kZTtcbi8vICAgfSkoKTtcbi8vIH1cblxuLy8gZnVuY3Rpb24gcmVhZF9ub2RlcyhnaWRzKSB7XG4vLyAgIHJldHVybiAoYXN5bmMgKCk9Pntcbi8vICAgICB2YXIgbm9kZXM9YXdhaXQgZGIuZmluZEFzeW5jKHtfaWQ6eyRpbjpnaWRzfSxfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pO1xuLy8gICAgIHJldHVybiBub2Rlcztcbi8vICAgfSkoKTtcbi8vIH1cbi8vIFxuXG5mdW5jdGlvbiBfbWtfc29uX2J5X2t2KHBOb2RlLGtleSx2YWx1ZSxiZ2lkKXtcbiAgcmV0dXJuIChhc3luYyAoKT0+e1xuICAgIC8vIGNvbnNvbGUubG9nKHBOb2RlKTtcbiAgICB2YXIgX25ld05vZGU9e1xuICAgICAgICBfbGluazoge1xuICAgICAgICAgIHA6IHBOb2RlLl9pZCxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfVxuICAgIH07XG4gICAgX25ld05vZGVba2V5XT12YWx1ZTtcbiAgICB2YXIgbmV3Tm9kZT0gYXdhaXQgX2luc2VydEFzeW5jKF9uZXdOb2RlKSA7Ly/mj5LlhaXmlrDoioLngrlcbiAgICAvL+W+l+WIsOaPkuWFpeaWsOiKgueCueeahGNoaWxkcmVuXG4gICAgdmFyIGNoaWxkcmVuPV9pbnNlcnRDaGlsZHJlbihwTm9kZS5fbGluay5jaGlsZHJlbixuZXdOb2RlLl9pZCxiZ2lkKTtcbiAgICBhd2FpdCBkYi51cGRhdGVPbmUoe19pZDpwTm9kZS5faWR9LCB7JHNldDoge1wiX2xpbmsuY2hpbGRyZW5cIjogY2hpbGRyZW59fSk7Ly/mj5LlhaXniLboioLngrlcbiAgICByZXR1cm4gbmV3Tm9kZTsvL+i/lOWbnuaWsOiKgueCuVxuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XG4gIHJldHVybiAoYXN5bmMgKCk9PntcbiAgICB2YXIgcE5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfaWRcIjpwZ2lkfSk7Ly/mib7liLDniLboioLngrlcbiAgICBpZighcE5vZGUpe1xuICAgICAgdGhyb3cgKCdjYW5ub3QgZmluZCBwYXJlbnQgbm9kZSAnK3BnaWQpO1xuICAgICAgcmV0dXJuIG51bGw7Ly/niLboioLngrnkuI3lrZjlnKjvvIzml6Dms5Xmj5LlhaXvvIzov5Tlm55udWxsXG4gICAgfVxuICAgIHJldHVybiBfbWtfc29uX2J5X2t2KHBOb2RlLFwiX2RhdGFcIixkYXRhKTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICByZXR1cm4gKGFzeW5jICgpPT57XG4gICAgdmFyIHBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe1wiX2lkXCI6cGdpZH0pIDsvL+aJvuWIsOeItuiKgueCuVxuICAgIGlmKCFwTm9kZSl7XG4gICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlICcrcGdpZCk7XG4gICAgICByZXR1cm4gbnVsbDsvL+eItuiKgueCueS4jeWtmOWcqO+8jOaXoOazleaPkuWFpe+8jOi/lOWbnm51bGxcbiAgICB9XG4gICAgdmFyIG5vZGU9YXdhaXQgZGIuZmluZE9uZSh7XCJfbmFtZVwiOm5hbWUsXCJfbGluay5wXCI6cGdpZH0pOy8v5piv5ZCm5bey5pyJ5ZCM5ZCN6IqC54K5XG4gICAgaWYobm9kZSl7XG4gICAgICByZXR1cm4gbm9kZTsvL+WmguacieebtOaOpei/lOWbnlxuICAgIH1cbiAgICByZXR1cm4gX21rX3Nvbl9ieV9rdihwTm9kZSxcIl9uYW1lXCIsbmFtZSk7XG4gIH0pKCk7XG59XG5cbi8vIGZ1bmN0aW9uIG1rX2Jyb3RoZXJfYnlfZGF0YShiZ2lkLGRhdGEpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9saW5rLmNoaWxkcmVuXCI6eyRlbGVtTWF0Y2g6YmdpZH19KTsvL+aJvuWIsOeItuiKgueCuVxuLy8gICAgIGlmKCFwTm9kZSl7XG4vLyAgICAgICB0aHJvdyAoJ2Nhbm5vdCBmaW5kIHBhcmVudCBub2RlIG9mIGJyb3RoZXIgJytiZ2lkKTtcbi8vICAgICAgIHJldHVybiBudWxsOy8v54i26IqC54K55LiN5a2Y5Zyo77yM5peg5rOV5o+S5YWl77yM6L+U5ZuebnVsbFxuLy8gICAgIH1cbiAgICAvLyByZXR1cm4gX21rX3Nvbl9ieV9kYXRhKHBOb2RlLGRhdGEsYmdpZCk7XG4vLyAgIH0pKCk7XG4vLyB9XG5cblxuLy8gZnVuY3Rpb24gX3VwZGF0ZShkYixxdWVyeSx1cGRhdGUsY2FsbGJhY2speyBcbi8vICAgICB2YXIgY2I9ZnVuY3Rpb24oZXJyLCBudW1BZmZlY3RlZCwgYWZmZWN0ZWREb2N1bWVudHMsIHVwc2VydCl7XG4vLyAgICAgICBjYWxsYmFjayhlcnIsYWZmZWN0ZWREb2N1bWVudHMpOy8v5L+u5pS5Y2FsbGJhY2vnmoTnrb7lkI3vvIzkvb/lvpfnrKzkuozkuKrlj4LmlbDkuLrmm7TmlrDov4fnmoRkb2Ncbi8vICAgICB9O1xuLy8gICAgIHZhciBvcHRpb25zPXsgbXVsdGk6IGZhbHNlLHJldHVyblVwZGF0ZWREb2NzOnRydWUgfTtcbi8vICAgICBkYi51cGRhdGUocXVlcnksIHVwZGF0ZSwgb3B0aW9ucyxjYik7XG4vLyB9XG5cbi8vIGNvbnN0IHVwZGF0ZT1Qcm9taXNlLnByb21pc2lmeShfdXBkYXRlKTsvL+S/ruaUuWNhbGxiYWNr562+5ZCN5ZCO5bCx5Y+v5LulcHJvbWlzaWZ5XG5cbi8vIGZ1bmN0aW9uIHVwZGF0ZV9kYXRhKGdpZCwgZGF0YSkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIG5vZGU9YXdhaXQgdXBkYXRlKGRiLHtfaWQ6Z2lkfSwgeyAkc2V0OiB7IF9kYXRhOiBkYXRhIH0gfSk7Ly/mm7TmlrDoioLngrnlubbov5Tlm57mm7TmlrDlkI7nmoToioLngrlcbi8vICAgICByZXR1cm4gbm9kZTtcbi8vICAgfSkoKTtcbi8vIH1cblxuXG4vLyAvL+mAkuW9kumBjeWOhuaJgOacieWtkOiKgueCuVxuLy8gLy9naWRz5piv6KaB6K6/6Zeu55qE6IqC54K5aWTnmoTliJfooahcbi8vIC8vdmlzaXTmmK/kuIDkuKrlh73mlbDjgILorr/pl67oioLngrnnmoTliqjkvZzjgIJcbi8vIGZ1bmN0aW9uIF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKGdpZHMsdmlzaXQpIHtcbi8vICAgaWYgKCFnaWRzfHxnaWRzLmxlbmd0aD09MCkge3JldHVybiBQcm9taXNlLnJlc29sdmUoKTt9Ly/pnIDopoHov5Tlm57kuIDkuKpwcm9taXNlIFxuLy8gICByZXR1cm4gUHJvbWlzZS5hbGwoZ2lkcy5tYXAoZ2lkID0+IHtcbi8vICAgICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57IC8v6K+75Y+W5b2T5YmN6IqC54K5XG4vLyAgICAgICByZXR1cm4gX3RyYXZlcnNhbF9hbGxfY2hpbGRyZW4obm9kZS5fbGluay5jaGlsZHJlbix2aXNpdCkudGhlbigoKT0+eyAvL+iuv+mXruaJgOacieWtkOiKgueCuVxuLy8gICAgICAgICByZXR1cm4gdmlzaXQobm9kZSk7IC8v54S25ZCO6K6/6Zeu5b2T5YmN6IqC54K5XG4vLyAgICAgICB9KVxuLy8gICAgIH0pXG4vLyAgIH0pKTtcbi8vIH1cblxuLy8gLy/moIforrDliKDpmaToioLngrnkuI7miYDmnInlrZDlrZnoioLngrlcbi8vIGZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbi8vICAgcmV0dXJuIChhc3luYyAoKT0+e1xuLy8gICAgICBpZihnaWQ9PScwJylyZXR1cm47Ly/moLnoioLngrnkuI3og73liKDpmaTjgIJcbi8vICAgICAgdmFyIG5vZGU9YXdhaXQgcmVhZF9ub2RlKGdpZCk7IC8v5YWI6K+75Y+W6KaB5Yig6Zmk55qE6IqC54K5XG4vLyAgICAgIGlmKCFub2RlKXJldHVybjsvL+W3sue7j+S4jeWtmOWcqO+8jOi/lOWbnlxuLy8gICAgICAvL+aUtumbhuaJgOacieWtkOiKgueCuVxuLy8gICAgICB2YXIgZ2lkc2ZvclJlbW92ZT1bXTtcbi8vICAgICAgY29uc3Qgcm09KG5vZGUpPT57Z2lkc2ZvclJlbW92ZS5wdXNoKG5vZGUuX2lkKX07XG4vLyAgICAgIGF3YWl0IF90cmF2ZXJzYWxfYWxsX2NoaWxkcmVuKFtnaWRdLHJtKTtcbi8vICAgICAgLy/mibnph4/liKDpmaRcbi8vICAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDp7JGluOmdpZHNmb3JSZW1vdmV9fSwgIHsgJHNldDogeyBfcm06dHJ1ZSAgfSB9LCB7fSk7Ly/moIforrDkuLrliKDpmaRcbi8vICAgICAgYXdhaXQgZGIudXBkYXRlQXN5bmMoe19pZDpub2RlLl9saW5rLnB9LCAgeyAkcHVsbDogeyBcIl9saW5rLmNoaWxkcmVuXCI6IGdpZCB9IH0gLCB7fSkgOy8v5LuO5Y6f54i26IqC54K55Yig6ZmkXG4vLyAgICAgIHJldHVybiBnaWRzZm9yUmVtb3ZlO1xuLy8gICB9KSgpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBfaXNBbmNlc3RvcihwZ2lkLGdpZCl7XG4vLyAgIGlmKGdpZD09JzAnKXJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyAvLycwJ+S4uuagueiKgueCueOAguS7u+S9leiKgueCuemDveS4jeaYrycwJ+eahOeItuiKgueCuVxuLy8gICByZXR1cm4gcmVhZF9ub2RlKGdpZCkudGhlbihub2RlPT57XG4vLyAgICAgLy8gY29uc29sZS5sb2coJ2NoZWNrJyxwZ2lkLG5vZGUuX2xpbmsucCxub2RlKVxuLy8gICAgIGlmKG5vZGUuX2xpbmsucD09PXBnaWQpe1xuLy8gICAgICAgcmV0dXJuIHRydWU7XG4vLyAgICAgfWVsc2V7XG4vLyAgICAgICByZXR1cm4gX2lzQW5jZXN0b3IocGdpZCxub2RlLl9saW5rLnApO1xuLy8gICAgIH1cbi8vICAgfSlcbi8vIH1cblxuLy8gZnVuY3Rpb24gX21vdmVfYXNfc29uKGdpZCwgbnBOb2RlLGJnaWQpe1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGU9YXdhaXQgX2lzQW5jZXN0b3IoZ2lkLG5wTm9kZS5faWQpO1xuLy8gICAgIGlmKGdpZElzQW5jZXN0b3JPZk5ld1BhcmVudE5vZGUpe1xuLy8gICAgICAgY29uc29sZS5sb2coZ2lkLCdpcyBhbmNlc3RvciBvZicsbnBOb2RlLl9pZClcbi8vICAgICAgIHJldHVybiBudWxsOy8v6KaB56e75Yqo55qE6IqC54K55LiN6IO95piv55uu5qCH54i26IqC54K555qE6ZW/6L6I6IqC54K5XG4vLyAgICAgfVxuLy8gICAgIHZhciBwTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9saW5rLmNoaWxkcmVuXCI6eyRlbGVtTWF0Y2g6Z2lkfX0pOy8v5om+5Yiw5Y6f54i26IqC54K5XG5cbi8vICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOnBOb2RlLl9pZH0sICB7ICRwdWxsOiB7IFwiX2xpbmsuY2hpbGRyZW5cIjogZ2lkIH0gfSAsIHt9KSA7Ly/ku47ljp/niLboioLngrnliKDpmaRcbi8vICAgICBpZihucE5vZGUuX2lkPT09cE5vZGUuX2lkKXsvL+WmguaenOaWsOeahOeItuiKgueCueS4juaXp+eahOeItuiKgueCueebuOWQjOOAguimgeabtOaWsOeItuiKgueCuVxuLy8gICAgICAgbnBOb2RlPWF3YWl0IGRiLmZpbmRPbmUoe19pZDpucE5vZGUuX2lkLCBfcm06IHsgJGV4aXN0czogZmFsc2UgfX0pOyBcbi8vICAgICB9ZWxzZXtcbi8vICAgICAgIGF3YWl0IGRiLnVwZGF0ZUFzeW5jKHtfaWQ6Z2lkfSwgIHsgJHNldDogeyBcIl9saW5rLnBcIjogbnBOb2RlLl9pZCB9IH0sIHt9KTsvL+aUueWPmGdpZOeahOeItuiKgueCueS4uuaWsOeItuiKgueCuVxuLy8gICAgIH1cbi8vICAgICB2YXIgcG9zPTA7XG4vLyAgICAgdmFyIGNoaWxkcmVuPW5wTm9kZS5fbGluay5jaGlsZHJlbjtcbi8vICAgICBpZihiZ2lkKXtcbi8vICAgICAgIHBvcz1jaGlsZHJlbi5pbmRleE9mKGJnaWQpKzE7XG4vLyAgICAgfVxuLy8gICAgIGNoaWxkcmVuLnNwbGljZShwb3MsMCxnaWQpOy8v5oqK5paw6IqC54K555qESUTmj5LlhaXliLDniLboioLngrnkuK1cbi8vICAgICBhd2FpdCBkYi51cGRhdGVBc3luYyh7X2lkOm5wTm9kZS5faWR9LCBucE5vZGUsIHt9KTsvL+aPkuWFpeeItuiKgueCuVxuLy8gICAgIHJldHVybiBhd2FpdCByZWFkX25vZGUoZ2lkKTtcbi8vICAgfSkoKTsgIFxuLy8gfVxuXG4vLyAvL+aKimdpZOiKgueCueenu+WKqOS4unBnaWTnmoTlrZDoioLngrlcbi8vIC8v5YyF5ZCrM+atpeOAgiAxLuS7jmdpZOeahOWOn+eItuiKgueCueWIoOmZpOOAgjLmlLnlj5hnaWTnmoTlvZPliY3niLboioLngrnjgIIgM+OAguazqOWGjOWIsOaWsOeItuiKgueCuVxuLy8gLy/np7vliqjliY3pnIDopoHlgZrmo4Dmn6XjgILnpZblhYjoioLngrnkuI3og73np7vliqjkuLrlkI7ovojnmoTlrZDoioLngrlcbi8vIGZ1bmN0aW9uIG1vdmVfYXNfc29uKGdpZCwgcGdpZCkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9pZFwiOnBnaWR9KTsvL+aJvuWIsOaWsOeItuiKgueCuVxuLy8gICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSk7XG4vLyAgIH0pKCk7ICBcbi8vIH1cblxuLy8gZnVuY3Rpb24gbW92ZV9hc19icm90aGVyKGdpZCwgYmdpZCkge1xuLy8gICByZXR1cm4gKGFzeW5jICgpPT57XG4vLyAgICAgdmFyIG5wTm9kZT1hd2FpdCBkYi5maW5kT25lKHtcIl9saW5rLmNoaWxkcmVuXCI6eyRlbGVtTWF0Y2g6YmdpZH19KTsvL+aJvuWIsOaWsOeItuiKgueCuVxuLy8gICAgIHJldHVybiBfbW92ZV9hc19zb24oZ2lkLG5wTm9kZSxiZ2lkKTtcbi8vICAgfSkoKTsgXG4vLyB9Il19