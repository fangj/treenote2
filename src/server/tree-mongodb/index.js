// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
// var Promise = require('bluebird');
var _=require('lodash');
var ObjectId = require('mongodb').ObjectId;
const id=(_id)=>(typeof _id==="object"?id:(_id==='0'?'0':ObjectId(_id)));
var db; 
function tree_mongodb(_db,cb){
  // db=Promise.promisifyAll(_db);
  db=_db;
  buildRootIfNotExist().then((typeof cb ==='function')?cb():null); //cb用于通知测试程序
  return {
    read_node:(gid)=>read_node(id(gid)),
    read_nodes:(gids)=>read_nodes(gids.map(id)),
    mk_son_by_data:(pgid,data)=>mk_son_by_data(id(pgid),data),
    mk_son_by_name:(pgid, name)=>mk_son_by_name(id(pgid),name),
    mk_brother_by_data:(bgid,data)=>mk_brother_by_data(id(bgid),data),
    update_data:(gid, data)=>update_data(id(gid),data),
    remove:(gid)=>remove(id(gid)),
    move_as_son:(gid, pgid) =>move_as_son(id(gid), id(pgid)),
    move_as_brother:(gid, bgid)=>move_as_brother(id(gid), id(bgid)),
    //for test
    buildRootIfNotExist
  }
}

module.exports=tree_mongodb;
//内部工具函数
const _insertAsync=(node)=>{
  return db.insertOne(node).then(res=>{
    node._id=res.insertedId;
    return node;
  })
}


const _insertChildrenAsync=(pNode,gid,bgid)=>{
    var pos=0;
    if(bgid){
      pos=_.findIndex(pNode._link.children, o=> bgid.equals(o));
    }
   return db.updateOne({_id:pNode._id}, {
     $push: {
        "_link.children": {
           $each: [gid],
           $position: pos
        }
     }
   }); 
}

const findParentAsync=(sgid)=> db.findOne({"_link.children":sgid,_rm: { $exists: false }});

function buildRootIfNotExist(cb){
  // console.log("buildRootIfNotExist");
  return (async ()=>{
    // console.log("buildRootIfNotExist begin");
    var root=await db.findOne({_id:'0'});
    // console.log("found root",root);
    if(!root){
      var defaultRoot={
        _id:'0', 
        _link: {
          p: '0',
          children: []
        }
      };
      root=await _insertAsync(defaultRoot);
    }
    // console.log("buildRootIfNotExist",root);
    return root;
  })();
}

function read_node(gid) {
  //rm标记表示节点已经被删除
  // console.log("read_node",gid);
  return db.findOne({_id:gid, _rm: { $exists: false }});
}

function read_nodes(gids) {
  // console.log("read_nodes",gids);
  return db.find({_id:{$in:gids},_rm: { $exists: false }}).toArray();
}


function _mk_son_by_kv(pNode,key,value,bgid){
  return (async ()=>{
    // console.log(pNode);
    var _newNode={
        _link: {
          p: pNode._id,
          children: []
        }
    };
    _newNode[key]=value;
    var newNode= await _insertAsync(_newNode) ;//插入新节点
    //插入父节点
    await _insertChildrenAsync(pNode,newNode._id,bgid);
    return newNode;//返回新节点
  })();
}

function mk_son_by_data(pgid, data) {
  return (async ()=>{
    var pNode=await read_node(pgid);//找到父节点
    if(!pNode){
      throw ('cannot find parent node '+pgid);
      return null;//父节点不存在，无法插入，返回null
    }
    return _mk_son_by_kv(pNode,"_data",data);
  })();
}

// function __mk_son_by_name(pgid, name) {
//   return (async ()=>{
//     console.log("mk_son_by_name",pgid,name)
//     var pNode=await  read_node(pgid) ;//找到父节点
//     if(!pNode){
//       throw ('cannot find parent node '+pgid);
//       return null;//父节点不存在，无法插入，返回null
//     }
//     var node=await db.findOne({"_name":name,"_link.p":pgid});//是否已有同名节点
//     if(node){
//       return node;//如有直接返回
//     }
//     return _mk_son_by_kv(pNode,"_name",name);
//   })();
// }

function mk_son_by_name(pgid, name) {
  // console.log("mk_son_by_name")
  return (async ()=>{
    // console.log("mk_son_by_name",pgid,name)
    var pNode=await  read_node(pgid) ;//找到父节点
    if(!pNode){
      throw ('cannot find parent node '+pgid);
      return null;//父节点不存在，无法插入，返回null
    }
    var _newNode={
        _link: {
          p: pNode._id,
          children: []
        },
        _name:name
    };
    const node=await db.findAndModify({"_name":name,"_link.p":pgid},
    [['_name','asc']],
    { "$setOnInsert": _newNode },
    {new: true, upsert: true});
    // console.log(node)
    const newNode=node.value;
    //如果是新增的节点插入父节点
    if(!node.lastErrorObject.updatedExisting){
      await _insertChildrenAsync(pNode,newNode._id);
    }
    return newNode;
  })();
}

function mk_brother_by_data(bgid,data) {
  // console.log("mk_brother_by_data")

  return (async ()=>{
    var pNode=await findParentAsync(bgid);//找到父节点
    if(!pNode){
      throw ('cannot find parent node of brother '+bgid);
      return null;//父节点不存在，无法插入，返回null
    }
    return _mk_son_by_kv(pNode,"_data",data,bgid);
  })();
}


function update_data(gid, data) {
  return db.updateOne({_id:gid}, { $set: { _data: data } })
  .then(read_node(gid));
}


//递归遍历所有子节点
//gids是要访问的节点id的列表
//visit是一个函数。访问节点的动作。
function _traversal_all_children(gids,visit) {
  // console.log("_traversal_all_children",gids);
  if (!gids||gids.length==0) {return Promise.resolve();}//需要返回一个promise 
  return Promise.all(gids.map(gid => {
    return read_node(gid).then(node=>{ //读取当前节点
      // console.log(node,node._link.children)
      return _traversal_all_children(node._link.children,visit).then(()=>{ //访问所有子节点
        return visit(node); //然后访问当前节点
      })
    })
  }));
}

//标记删除节点与所有子孙节点
function remove(gid) {
  return (async ()=>{
     if(gid==='0')return;//根节点不能删除。
     var node=await read_node(gid); //先读取要删除的节点
     if(!node)return;//已经不存在，返回
     //收集所有子节点
     var gidsforRemove=[];
     const rm=(node)=>{gidsforRemove.push(node._id)};
     await _traversal_all_children([gid],rm);
     //批量删除
     await db.updateMany({_id:{$in:gidsforRemove}},  { $set: { _rm:true  } }, {});//标记为删除
     await db.updateOne({_id:node._link.p},  { $pull: { "_link.children": gid } } , {}) ;//从原父节点删除
     return gidsforRemove;
  })();
}

function _isAncestor(pgid,gid){
  if(gid=='0')return Promise.resolve(false); //'0'为根节点。任何节点都不是'0'的父节点
  return read_node(gid).then(node=>{
    // console.log('check',pgid,node._link.p,node)
    if(node._link.p===pgid){
      return true;
    }else{
      return _isAncestor(pgid,node._link.p);
    }
  })
}

function _move_as_son(gid, npNode,bgid){
  return (async ()=>{
    var gidIsAncestorOfNewParentNode=await _isAncestor(gid,npNode._id);
    if(gidIsAncestorOfNewParentNode){
      throw (gid+'is ancestor of'+npNode._id);
      return null;//要移动的节点不能是目标父节点的长辈节点
    }
    var pNode=await findParentAsync(gid);//找到原父节点
    if(!pNode){
      throw ('cannot find parent node of brother '+bgid);
      return null;//父节点不存在，无法插入，返回null
    }
    await db.updateOne({_id:pNode._id},  { $pull: { "_link.children": gid } } , {}) ;//从原父节点删除
    if(npNode._id!==pNode._id){
      await db.updateOne({_id:gid},  { $set: { "_link.p": npNode._id } }, {});//改变gid的父节点为新父节点
    }
    await _insertChildrenAsync(npNode,gid,bgid);
    return await read_node(gid);
  })();  
}

// //把gid节点移动为pgid的子节点
// //包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
// //移动前需要做检查。祖先节点不能移动为后辈的子节点
function move_as_son(gid, pgid) {
  return (async ()=>{
    var npNode=await read_node(pgid);//找到新父节点
    return _move_as_son(gid,npNode);
  })();  
}

function move_as_brother(gid, bgid) {
  return (async ()=>{
    var npNode=await findParentAsync(bgid);//找到新父节点
    if(!npNode){
      throw ('cannot find parent node of brother '+bgid);
      return null;//父节点不存在，无法插入，返回null
    }
    return _move_as_son(gid,npNode,bgid);
  })(); 
}