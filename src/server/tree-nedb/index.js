var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');


var db;
function tree_nedb(_db){
  db=Promise.promisifyAll(_db);
  buildRootIfNotExist(db);
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

function buildRootIfNotExist(){
  return async(function(){
    var root=await(db.findOneAsync({_id:'0'}));
    console.log(root)
    return {hello:'world'}
  })();
}

function read_node(gid) {

}

function read_nodes(gids) {

}

function mk_son_by_data(gid, data) {

}

function mk_brother_by_data(data, bgid) {

}

function update_data(gid, data) {

}

function remove(gid) {

}

function move_as_son(gid, pgid) {

}

function move_as_brother(gid, bgid) {

}