const _=require('lodash');
const AV=require('leancloud-storage');

function tree_leancloud(cb){
  buildRootIfNotExist(cb);
  return {
    read_node,
    read_nodes,
    mk_son_by_data,
    mk_son_by_name,
    mk_brother_by_data,
    update_data,
    remove,
    move_as_son,
    move_as_brother,
    //for test
    buildRootIfNotExist
  }
}

module.exports=tree_leancloud;

var APP_ID = 'O5chE5oCrD64pIEimweTTno5-gzGzoHsz';
var APP_KEY = 'PmdSTHdJk2Iy887QWH0yxBPx';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
const AVNode = AV.Object.extend('Node');
const findAVNodeAsync=(key,value)=>{
  var query = new AV.Query('Node');
  query.equalTo(key, value);
  return query.first();
}
const findParentAVNodeAsync=(gid)=>{
  var query = new AV.Query('Node');
  query.contains("node._link.children", gid);
  return query.first();//找到新父节点
}
const findAVNodeByGidAsync= async (gid)=>{
  var avnode;
  var query = new AV.Query('Node');
  if(gid==='0'){//根节点的id放在node.gid中
    query.equalTo('node.gid', gid);
    try{
      avnode=await query.first();
    }catch(e){
      console.error(e);//找不到时会抛出错误
    }
  }else{
    avnode=await query.get(gid)//普通节点的id就是ObjectID
    if(avnode && avnode.get('_rm')){//rm表示节点已经删除
      return null;
    }
  }
  return avnode;
}

const findNodeByGidAsync= async (gid)=>{
  var avnode=await findAVNodeByGidAsync(gid);
  return t(avnode);
}

const updateAVNodeByGidAsync=async (gid,updater)=>{
  var avnode;
  if(gid==='0'){
    avnode = await findAVNodeByGidAsync(gid);
  }else{
    // 第一个参数是 className，第二个参数是 objectId
    avnode = AV.Object.createWithoutData('Node', gid);
  }
  // 修改属性
  updater(avnode);
  // 保存到云端
  var updatedNode= await avnode.save();
  return updatedNode;
}

const _createWithoutData=_.curry(AV.Object.createWithoutData);
const createAVNodeWithoutData=_createWithoutData('Node');//fn(id)
const updateAVNodesByGidsAsync=(gids,updater)=>{
  const nodes=gids.map(createAVNodeWithoutData);
  nodes.map(updater);
  return AV.Object.saveAll(nodes);
}

const insertNode=async (node)=>{
  // console.log("insertNode",node)
    var avnode =new AVNode();
    avnode.set('node',node);
    avnode=await avnode.save();
    return t(avnode);
}

const t=(avnode)=>{ //取出leancloud中的node数据，并把id附上
  if(!avnode){
    return null;
  }
  var node= avnode.get("node");
  if(node.gid==='0'){
    node._id='0'; //根节点
  }else{
    node._id=avnode.get("id");
  }
  return node;
}

function buildRootIfNotExist(cb){
  // console.log("buildRootIfNotExist")
  return (async ()=>{
    // console.log("buildRootIfNotExist begin")
    var root=await findNodeByGidAsync('0');
    console.log("root",root)
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
    return root;
  })();
}

function read_node(gid) {
  return findNodeByGidAsync(gid);
}

function read_nodes(gids) {
  return (async ()=>{
    const nodes=gids.map(createAVNodeWithoutData);
    const avnodes=await AV.Object.fetchAll(nodes);
    return avnodes.map(t);
  })();
}

function _mk_son_by_kv(pNode,key,value,bgid){
  return (async ()=>{
    // console.log(pNode);
    var newNode={
        _link: {
          p: pNode._id,
          children: []
        }
    };
    newNode[key]=value;
    newNode= await insertNode(newNode);//插入新节点
    var pos=0;
    var children=pNode._link.children;
    if(bgid){
      pos=children.indexOf(bgid)+1;
    }
    children.splice(pos,0,newNode._id);//把新节点的ID插入到父节点中
    await updateAVNodeByGidAsync(pNode._id,(avnode)=>{avnode.set('node._link.children',children)});
    return newNode;//返回新节点
  })();
}

function _mk_son_by_data(pNode,data,bgid){
  return _mk_son_by_kv(pNode,"_data",data,bgid);
}

function _mk_son_by_name(pNode,name,bgid){
  return _mk_son_by_kv(pNode,"_name",name,bgid);
}

function mk_son_by_data(pgid, data) {
  return (async ()=>{
    var pNode=await findNodeByGidAsync(pgid) ;//找到父节点
    if(!pNode){
      throw ('cannot find parent node '+pgid);
      return null;//父节点不存在，无法插入，返回null
    }
    return await _mk_son_by_data(pNode,data);
  })();
}

function mk_son_by_name(pgid, name) {
  return (async ()=>{
    var pNode=await findNodeByGidAsync(pgid) ;//找到父节点
    if(!pNode){
      throw ('cannot find parent node '+pgid);
      return null;//父节点不存在，无法插入，返回null
    }
    var avnode=await findAVNodeAsync("node._name",name);
    if(avnode){
      return t(avnode);//如有直接返回
    }
    return await _mk_son_by_name(pNode,name);
  })();
}

function mk_brother_by_data(bgid,data) {
  return (async ()=>{
    var query = new AV.Query('Node');
    query.contains('node._link.children',bgid);
    var pAVNode=await query.first();//找到父节点
    const pNode=t(pAVNode);
    if(!pNode){
      throw ('cannot find parent node of brother '+bgid);
      return null;//父节点不存在，无法插入，返回null
    }
    const node=await _mk_son_by_data(pNode,data,bgid);
    return node;
  })();
}


function update_data(gid, data) {
  return updateAVNodeByGidAsync(gid,avnode=>avnode.set("node.data",data)).then(t);
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

// //标记删除节点与所有子孙节点
function remove(gid) {
  return (async ()=>{
     if(gid=='0')return;//根节点不能删除。
     var node=await read_node(gid); //先读取要删除的节点
     if(!node)return;//已经不存在，返回
     //收集所有子节点
     var gidsforRemove=[];
     const rm=(node)=>{gidsforRemove.push(node._id)};
     await _traversal_all_children([gid],rm);
     //批量删除//标记为删除
     const setRm=(avnode)=>{avnode.set("_rm",true);}
     await updateAVNodesByGidsAsync(gidsforRemove,setRm);
     await updateAVNodeByGidAsync(node._link.p,(avnode)=>{avnode.remove("node._link.children",gid)})
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

function _move_as_son(gid, npAVNode,bgid){
  return (async ()=>{
    var gidIsAncestorOfNewParentNode=await _isAncestor(gid,npAVNode.id) ;
    if(gidIsAncestorOfNewParentNode){
      console.log(gid,'is ancestor of',npAVNode.id)
      return null;//要移动的节点不能是目标父节点的长辈节点
    }
    var pAVNode=await findParentAVNodeAsync(gid)//找到原父节点
    pAVNode.remove('node._link.children', gid);//从原父节点删除
    await pAVNode.save();

    if(npAVNode.id===pAVNode.id){//如果新的父节点与旧的父节点相同。要更新父节点
      npAVNode=pAVNode; 
    }else{
      await updateAVNodeByGidAsync(gid,avnode=>{avnode.set("node._link.p",npAVNode.id)})//改变gid的父节点为新父节点
    }
    var pos=0;
    var npNode=t(npAVNode);
    var children=npNode._link.children;
    console.log('before',children)
    if(bgid){
      pos=children.indexOf(bgid)+1;
    }
    children.splice(pos,0,gid);//把新节点的ID插入到父节点中
    console.log('after',children,npNode)
    await updateAVNodeByGidAsync(npNode._id,avnode=>{avnode.set("node._link.children",children)})//插入父节点
    return await read_node(gid);
  })();  
}

//把gid节点移动为pgid的子节点
//包含3步。 1.从gid的原父节点删除。2改变gid的当前父节点。 3。注册到新父节点
//移动前需要做检查。祖先节点不能移动为后辈的子节点
function move_as_son(gid, pgid) {
  return (async ()=>{
    var npAVNode=await findAVNodeByGidAsync(pgid); //找到新父节点
    return _move_as_son(gid,npAVNode);
  })();  
}

function move_as_brother(gid, bgid) {
  return (async ()=>{
    var npAVNode=await findParentAVNodeAsync(bgid);//找到新父节点
    return _move_as_son(gid,npAVNode,bgid);
  })(); 
}