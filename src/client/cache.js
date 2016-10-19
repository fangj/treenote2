var nodes={}
module.exports={
  has,get,set,del
}

function set(id,node){
  // if(id==="6ktbpkCcURvOR8mj"){debugger;}
  nodes[id]=node;
}
function get(id){
  return nodes[id];
}
function has(id){
  return nodes[id]!==undefined;
}
function del(id){
  // if(id==="6ktbpkCcURvOR8mj"){debugger;}
  delete nodes[id];
}