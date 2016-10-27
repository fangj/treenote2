// var agent = require('superagent-promise')(require('superagent'), Promise);

import Frisbee from 'frisbee';

// create a new instance of Frisbee
const agent = new Frisbee({
  baseURI: '/',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

var prefix;
const api = {
  read,
  read_nodes,
  mk_son_by_data,
  mk_son_by_name,
  mk_brother_by_data,
  remove,
  update,
  mv_as_son,
  mv_as_brother,
  read_big_node,
};
function factory(_prefix) {
  prefix = _prefix;
  return api;
}
module.exports = factory;

function read(gid) {
  return agent.get(prefix + '/' + gid).then(res => res.body);
}

function read_nodes(gids) {
  return agent.post(prefix + '/nodes/', {body:gids}).then(res => res.body);
}

function mk_son_by_data(pgid, data) {
  if(data===null){
    data={}
  }else if( typeof data!=="object"){
    data={data}
  }
  return agent.post(prefix + '/mk/son/' + pgid, {body:data}).then(res => res.body);
}

function mk_son_by_name(pgid, name) {
  return agent.post(prefix + '/mk/son_name/' + pgid, {body:{name}}).then(res => res.body);
}

function mk_brother_by_data(bgid, data) {
  return agent.post(prefix + '/mk/brother/' + bgid, {body:data}).then(res => res.body);
}

function remove(gid) {
  return agent.del(prefix + '/' + gid).then(res => res.body);
}

function update(gid, data) {
  if(data===null){
    data={}
  }else if( typeof data!=="object"){
    data={data}
  }
  return agent.put(prefix + '/' + gid, {body:data}).then(res => res.body);
}

function  mv_as_son(sgid,dgid){
  return agent.post(prefix +'/mv/'+sgid+'/son/'+dgid).then(res => res.body);
}

function  mv_as_brother(sgid,dgid){
  return agent.post(prefix +'/mv/'+sgid+'/brother/'+dgid).then(res => res.body);
}

function read_big_node(gid,level=0) {
  return agent.get(prefix + '/bignode/' + gid+'/'+level).then(res => res.body);
}