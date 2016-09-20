var agent = require('superagent-promise')(require('superagent'), Promise);
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
module.exports = factory;

var prefix;

function factory(_prefix) {
  prefix = _prefix;
  return api;
}

function read(gid) {
  return agent.get(prefix + '/' + gid).then(res => res.body);
}

function read_nodes(gids) {
  return agent.post(prefix + '/nodes/', gids).then(res => res.body);
}

function mk_son_by_data(pgid, data) {
  return agent.post(prefix + '/mk/son/' + pgid, data).then(res => res.body);
}

function mk_brother_by_data(bgid, data) {
  return agent.post(prefix + '/mk/brother/' + bgid, data).then(res => res.body);
}

function remove(gid) {
  return agent.del(prefix + '/' + gid).then(res => res.body);
}

function update(gid, data) {
  return agent.put(prefix + '/' + gid, data).then(res => res.body);
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