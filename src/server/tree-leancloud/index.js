var APP_ID = 'O5chE5oCrD64pIEimweTTno5-gzGzoHsz';
var APP_KEY = 'PmdSTHdJk2Iy887QWH0yxBPx';
const AV=require('leancloud-storage');
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
const Node = AV.Object.extend('Node');

const findNodeByGidAsync= async (gid)=>{
  var query = new AV.Query('Node');
  var id_query = new AV.Query('Node');
  var gid_query = new AV.Query('Node');
  id_query.equalTo('id', gid);
  gid_query.equalTo('node.gid', gid);
  var query = AV.Query.or(id_query, gid_query);
  var node,NotFound=false;
  try{
    node=await query.first();
  }catch(e){
    if(e.code==101){
      NotFound=true;//{ [Error: Class or object doesn't exists.] code: 101 }
    }
    console.error(e);
  }
  return node;
}

const updateNodeByGidAsync=async (gid,_node)=>{
  // 第一个参数是 className，第二个参数是 objectId
  var node = AV.Object.createWithoutData('Node', gid);
  // 修改属性
  node.set('node', _node);
  // 保存到云端
  node.save();
}

const insertNode=async (_node)=>{
  console.log("insertNode",_node)
    var node =new Node();
    node.set('node',_node);
    return node.save();
}

const getNode=(node)=>{
  var _node= node.get("node");
  var id=_node.gid||node.get("id");
  _node._id=id;
  return _node;
}


function tree_leancloud(cb){
  buildRootIfNotExist(cb);
  return {
    // read_node,
    // read_nodes,
    mk_son_by_data,
    // mk_son_by_name,
    // mk_brother_by_data,
    // update_data,
    // remove,
    // move_as_son,
    // move_as_brother,
    //for test
    buildRootIfNotExist
  }
}

module.exports=tree_leancloud;

function buildRootIfNotExist(cb){
  return (async ()=>{
    var root=await findNodeByGidAsync('0');
    if(!root){
      console.log('no root')
      var defaultRoot={
        gid:'0', 
        _link: {
          p: '0',
          children: []
        }
      };
      try{
        root=await insertNode(defaultRoot);
      }catch(e){
        console.log(e)
      }
    }
    if(typeof cb =='function'){
      cb(); //通知root构建完成
    }
    return getNode(root);
  })();
}

// function read_node(gid) {
//   return async(function(){
//     // console.log('read_node',gid);
//     var node=await(db.findOneAsync({_id:gid, _rm: { $exists: false }})); //rm标记表示节点已经被删除
//     return node;
//   })();
// }

// function read_nodes(gids) {
//   return async(function(){
//     var nodes=await(db.findAsync({_id:{$in:gids},_rm: { $exists: false }}));
//     return nodes;
//   })();
// }

function _mk_son_by_data(pNode,data,bgid){
  return (async ()=>{
    // console.log(pNode);
    var newNode={
        _link: {
          p: pNode._id,
          children: []
        },
        _data:data
    };
    var _newNode= await insertNode(newNode);//插入新节点
    newNode=getNode(_newNode);
    var pos=0;
    var children=pNode._link.children;
    if(bgid){
      pos=children.indexOf(bgid)+1;
    }
    children.splice(pos,0,_newNode._id);//把新节点的ID插入到父节点中
    await updateNodeByGidAsync(pNode._id,pNode);
    return newNode;//返回新节点
  })();
}

// function _mk_son_by_name(pNode,name,bgid){
//   return async(function(){
//     // console.log(pNode);
//     var newNode={
//         _link: {
//           p: pNode._id,
//           children: []
//         },
//         _name:name
//     };
//     var _newNode= await(db.insertAsync(newNode));//插入新节点
//     var pos=0;
//     var children=pNode._link.children;
//     if(bgid){
//       pos=children.indexOf(bgid)+1;
//     }
//     children.splice(pos,0,_newNode._id);//把新节点的ID插入到父节点中
//     await(db.updateAsync({_id:pNode._id}, pNode, {}));//插入父节点
//     return _newNode;//返回新节点
//   })();
// }

function mk_son_by_data(pgid, data) {
  return (async ()=>{
    var pNode=await findNodeByGidAsync(pgid) ;//找到父节点
    if(!pNode){
      throw ('cannot find parent node '+pgid);
      return null;//父节点不存在，无法插入，返回null
    }
    return _mk_son_by_data(pNode,data);
  })();
}

// function mk_son_by_name(pgid, name) {
//   return async(function(){
//     var pNode=await(db.findOneAsync({"_id":pgid}));//找到父节点
//     if(!pNode){
//       throw ('cannot find parent node '+pgid);
//       return null;//父节点不存在，无法插入，返回null
//     }
//     var node=await(db.findOneAsync({"_name":name}));//是否已有同名节点
//     if(node){
//       return node;//如有直接返回
//     }
//     return _mk_son_by_name(pNode,name);
//   })();
// }

// function mk_brother_by_data(bgid,data) {
//   return async(function(){
//     var pNode=await(db.findOneAsync({"_link.children":{$elemMatch:bgid}}));//找到父节点
//     if(!pNode){
//       throw ('cannot find parent node of brother '+bgid);
//       return null;//父节点不存在，无法插入，返回null
//     }
//     return _mk_son_by_data(pNode,data,bgid);
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
//   return async(function(){
//     var node=await(update(db,{_id:gid}, { $set: { _data: data } }));//更新节点并返回更新后的节点
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
//   return async(function(){
//      if(gid=='0')return;//根节点不能删除。
//      var node=await(read_node(gid)); //先读取要删除的节点
//      if(!node)return;//已经不存在，返回
//      //收集所有子节点
//      var gidsforRemove=[];
//      const rm=(node)=>{gidsforRemove.push(node._id)};
//      await(_traversal_all_children([gid],rm));
//      //批量删除
//      await(db.updateAsync({_id:{$in:gidsforRemove}},  { $set: { _rm:true  } }, {}));//标记为删除
//      await(db.updateAsync({_id:node._link.p},  { $pull: { "_link.children": gid } } , {}) );//从原父节点删除
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
//   return async(function(){
//     var gidIsAncestorOfNewParentNode=await(_isAncestor(gid,npNode._id));
//     if(gidIsAncestorOfNewParentNode){
//       console.log(gid,'is ancestor of',npNode._id)
//       return null;//要移动的节点不能是目标父节点的长辈节点
//     }
//     var pNode=await(db.findOneAsync({"_link.children":{$elemMatch:gid}}));//找到原父节点

//     await(db.updateAsync({_id:pNode._id},  { $pull: { "_link.children": gid } } , {}) );//从原父节点删除
//     if(npNode._id===pNode._id){//如果新的父节点与旧的父节点相同。要更新父节点
//       npNode=await(db.findOneAsync({_id:pNode._id, _rm: { $exists: false }})); 
//     }

//     await(db.updateAsync({_id:gid},  { $set: { "_link.p": npNode._id } }, {}));//改变gid的父节点为新父节点
//     var pos=0;
//     var children=npNode._link.children;
//     if(bgid){
//       pos=children.indexOf(bgid)+1;
//     }
//     children.splice(pos,0,gid);//把新节点的ID插入到父节点中
//     await(db.updateAsync({_id:npNode._id}, npNode, {}));//插入父节点
//     return await(read_node(gid));
//   })();  
// }

// //把gid节点移动为pgid的子节点
// //包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
// //移动前需要做检查。祖先节点不能移动为后辈的子节点
// function move_as_son(gid, pgid) {
//   return async(function(){
//     var npNode=await(db.findOneAsync({"_id":pgid}));//找到新父节点
//     return _move_as_son(gid,npNode);
//   })();  
// }

// function move_as_brother(gid, bgid) {
//   return async(function(){
//     var npNode=await(db.findOneAsync({"_link.children":{$elemMatch:bgid}}));//找到新父节点
//     return _move_as_son(gid,npNode,bgid);
//   })(); 
// }