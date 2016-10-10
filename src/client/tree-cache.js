var LRU = require('lru-cache')
  , cache= LRU(5000);
var _=require('lodash');

var _api;
const api = {
  read,
  read_nodes,
  mk_son_by_data,
  mk_brother_by_data,
  remove,
  update,
  mv_as_son,
  mv_as_brother,
  read_big_node
};
function factory(_prefix) {
  _api=require('./tree')(_prefix);
  return api;
}
module.exports = factory;

function clone(obj){
  if(!obj){return null;}
  return JSON.parse(JSON.stringify(obj));
}

function read(gid) {
  return _api.read(gid).then(node => {
    cache.set(node._id,node);
    return node;
  });
}

function read_nodes(gids) {
  if (!gids || gids.length === 0) {return Promise.resolve([]);}
  let cachedNodes = [];
  let unCachedGids = [];
  gids.map(gid => {
    if (cache.has(gid)) {
      cachedNodes.push(cache.get(gid));
    } else {
      unCachedGids.push(gid);
    }
  });
  if (unCachedGids.length === 0) {
    return Promise.resolve(cachedNodes.map(clone)); //全在cache中直接返回 //返回克隆避免缓存被修改
  }
  //否则合并返回
  return _api.read_nodes(unCachedGids).then(new_nodes => {
    new_nodes.map(node => cache.set(node._id,node)); //更新nodes cache
    // 调整顺序
    var tmp={};
    cachedNodes.map(node=>tmp[node._id]=node);
    new_nodes.map(node=>tmp[node._id]=node);
    var nodes= gids.map(gid=>clone(tmp[gid])); //返回克隆避免缓存被修改
    return _.compact(nodes);
  });
}

function mk_son_by_data(pgid, data) {
  return _api.mk_son_by_data(pgid, data).then(node =>{
    cache.set(node._id,node);//更新子节点
    cache.del(pgid);//删除旧的父节点
    return node;//返回新的子节点
  });
}

function _remove_parent_from_cache(gid){
  return api.read(gid).then(node=>{
    cache.del(node._link.p);
  });
}

function mk_brother_by_data(bgid, data) {
  return _remove_parent_from_cache(bgid).then(_=>_api.mk_brother_by_data(bgid, data));
}


/**
 * 删除节点，并刷新父节点和删除子节点，返回被删除的节点
 * 注意，返回值与api.remove不一致
 */
function remove(gid) {
  //删除某节点后，缓存中该节点的父节点要更新，后续子节点都要删除
  return read(gid).then(node => //删除前先取出。待会儿还有用。
    //删除节点
    _api.remove(gid).then(res => {
      if (node) { //如果删除前没有取到当前节点，父节点将无法刷新。
        //递归删除所有子节点
        return _remove_all_children(node._link.children).then(_=>{
          cache.del(node._link.p);//刷新父节点
          return node;//返回被删除的节点
        })
      }
      return null;
    })
  );
}

//递归删除所有子节点
function _remove_all_children(gids) {
  if (!gids) {return;}
  gids.map(gid => {
    if (cache.has(gid)) {
      _remove_all_children(cache.get(gid)._link.chilren);
      cache.del(gid);
    }
  });
}

function update(gid, data) {
 return _api.update(gid, data).then(node => cache.set(node._id, node));
}

function  mv_as_son(sgid,dgid){
  cache.del(dgid);
  return _remove_parent_from_cache(sgid).then(_=>_api.mv_as_son(sgid,dgid).then(node=>{
    cache.set(node._id,node);
    return node;
  }));
}

function  mv_as_brother(sgid,dgid){
  return _remove_parent_from_cache(sgid)
  .then(_=>_remove_parent_from_cache(dgid))
  .then(_=>_api.mv_as_brother(sgid,dgid).then(node=>{
    cache.set(node._id,node);
    return node;
  }));
}

//not cached
function read_big_node(gid,level=0) {
  return _api.read_big_node(gid,level);
}