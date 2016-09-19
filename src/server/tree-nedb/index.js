var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');


var db;
function tree_nedb(_db,cb){
  db=Promise.promisifyAll(_db);
  buildRootIfNotExist(cb);
  return {
    read_node,
    read_nodes,
    mk_son_by_data,
    mk_brother_by_data,
    update_data,
    remove,
    move_as_son,
    move_as_brother,
    //for test
    buildRootIfNotExist
  }
}

module.exports=tree_nedb;

function buildRootIfNotExist(cb){
  return async(function(){
    var root=await(db.findOneAsync({_id:'0'}));
    if(!root){
      var defaultRoot={
        _id:'0', 
        _link: {
          p: '0',
          children: []
        }
      };
      root=await(db.insertAsync(defaultRoot));
    }
    if(typeof cb =='function'){
      cb(); //通知root构建完成
    }
    return root;
  })();
}

function read_node(gid) {
  return async(function(){
    // console.log('read_node',gid);
    var node=await(db.findOneAsync({_id:gid, _rm: { $exists: false }})); //rm标记表示节点已经被删除
    return node;
  })();
}

function read_nodes(gids) {
  return async(function(){
    var nodes=await(db.findOneAsync({_id:{$in:gids},_rm: { $exists: false }}));
    return nodes;
  })();
}

function _mk_son_by_data(pNode,data,bgid){
  return async(function(){
    // console.log(pNode);
    var newNode={
        _link: {
          p: pNode._id,
          children: []
        },
        _data:data
    };
    var _newNode= await(db.insertAsync(newNode));//插入新节点
    var pos=0;
    var children=pNode._link.children;
    if(bgid){
      pos=children.indexOf(bgid)+1;
    }
    children.splice(pos,0,_newNode._id);//把新节点的ID插入到父节点中
    await(db.updateAsync({_id:pNode._id}, pNode, {}));//插入父节点
    return _newNode;//返回新节点
  })();
}

function mk_son_by_data(pgid, data) {
  return async(function(){
    var pNode=await(db.findOneAsync({"_id":pgid}));//找到父节点
    if(!pNode){
      throw ('cannot find parent node '+pgid);
      return null;//父节点不存在，无法插入，返回null
    }
    return _mk_son_by_data(pNode,data);
  })();
}

function mk_brother_by_data(bgid,data) {
  return async(function(){
    var pNode=await(db.findOneAsync({"_link.children":{$elemMatch:bgid}}));//找到父节点
    if(!pNode){
      throw ('cannot find parent node of brother '+bgid);
      return null;//父节点不存在，无法插入，返回null
    }
    return _mk_son_by_data(pNode,data,bgid);
  })();
}


function _update(db,query,update,callback){ 
    var cb=function(err, numAffected, affectedDocuments, upsert){
      callback(err,affectedDocuments);//修改callback的签名，使得第二个参数为更新过的doc
    };
    var options={ multi: false,returnUpdatedDocs:true };
    db.update(query, update, options,cb);
}

const update=Promise.promisify(_update);//修改callback签名后就可以promisify

function update_data(gid, data) {
  return async(function(){
    var node=await(update(db,{_id:gid}, { $set: { _data: data } }));//更新节点并返回更新后的节点
    return node;
  })();
}


//递归遍历所有子节点
//gids是要访问的节点id的列表
//visit是一个函数。访问节点的动作。
function _traversal_all_children(gids,visit) {
  if (!gids||gids.length==0) {return Promise.resolve();}//需要返回一个promise 
  return Promise.all(gids.map(gid => {
    return read_node(gid).then(node=>{ //读取当前节点
      return _traversal_all_children(node._link.children,visit).then(()=>{ //访问所有子节点
        return visit(node); //然后访问当前节点
      })
    })
  }));
}

//标记删除节点与所有子孙节点
function remove(gid) {
  return async(function(){
     if(gid=='0')return;//根节点不能删除。
     //收集所有子节点
     var gidsforRemove=[];
     const rm=(node)=>{gidsforRemove.push(node._id)};
     await(_traversal_all_children([gid],rm));
     //批量删除
     await(db.updateAsync({_id:{$in:gidsforRemove}},  { $set: { _rm:true  } }, {}));//标记为删除
     return gidsforRemove;
  })();
}

function move_as_son(gid, pgid) {

}

function move_as_brother(gid, bgid) {

}