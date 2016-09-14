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
    var root=await(db.findOneAsync({_id:gid}));
    return root;
  })();
}

function read_nodes(gids) {
  return async(function(){
    var root=await(db.findOneAsync({_id:{$in:gids}}));
    return root;
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

function update_data(gid, data) {

}

function remove(gid) {

}

function move_as_son(gid, pgid) {

}

function move_as_brother(gid, bgid) {

}