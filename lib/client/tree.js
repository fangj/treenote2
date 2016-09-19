'use strict';

var agent = require('superagent-promise')(require('superagent'), Promise);
var api = {
  read: read,
  read_nodes: read_nodes,
  mk_son_by_data: mk_son_by_data,
  mk_brother_by_data: mk_brother_by_data,
  remove: remove,
  update: update,
  mv_as_son: mv_as_son,
  mv_as_brother: mv_as_brother,
  read_big_node: read_big_node
};
module.exports = factory;

var prefix;

function factory(_prefix) {
  prefix = _prefix;
  return api;
}

function read(gid) {
  return agent.get(prefix + '/' + gid).then(function (res) {
    return res.body;
  });
}

function read_nodes(gids) {
  return agent.post(prefix + '/nodes/', gids).then(function (res) {
    return res.body;
  });
}

function mk_son_by_data(pgid, data) {
  return agent.post(prefix + '/mk/son/' + pgid, data).then(function (res) {
    return res.body;
  });
}

function mk_brother_by_data(bgid, data) {
  return agent.post(prefix + '/mk/brother/' + bgid, data).then(function (res) {
    return res.body;
  });
}

function remove(gid) {
  return agent.del(prefix + '/' + gid).then(function (res) {
    return res.body;
  });
}

function update(gid, data) {
  return agent.put(prefix + '/' + gid, data).then(function (res) {
    return res.body;
  });
}

function mv_as_son(sgid, dgid) {
  return agent.post(prefix + '/mv/' + sgid + '/son/' + dgid).then(function (res) {
    return res.body;
  });
}

function mv_as_brother(sgid, dgid) {
  return agent.post(prefix + '/mv/' + sgid + '/brother/' + dgid).then(function (res) {
    return res.body;
  });
}

function read_big_node(gid) {
  var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  return agent.get(prefix + '/bignode/' + gid + '/' + level).then(function (res) {
    return res.body;
  });
}
//# sourceMappingURL=data:application/json;base64,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QUksSUFBWDtBQUFBLEdBQXJELENBQVA7QUFDRCIsImZpbGUiOiJ0cmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFnZW50ID0gcmVxdWlyZSgnc3VwZXJhZ2VudC1wcm9taXNlJykocmVxdWlyZSgnc3VwZXJhZ2VudCcpLCBQcm9taXNlKTtcclxuY29uc3QgYXBpID0ge1xyXG4gIHJlYWQsXHJcbiAgcmVhZF9ub2RlcyxcclxuICBta19zb25fYnlfZGF0YSxcclxuICBta19icm90aGVyX2J5X2RhdGEsXHJcbiAgcmVtb3ZlLFxyXG4gIHVwZGF0ZSxcclxuICBtdl9hc19zb24sXHJcbiAgbXZfYXNfYnJvdGhlcixcclxuICByZWFkX2JpZ19ub2RlXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcclxuXHJcbnZhciBwcmVmaXg7XHJcblxyXG5mdW5jdGlvbiBmYWN0b3J5KF9wcmVmaXgpIHtcclxuICBwcmVmaXggPSBfcHJlZml4O1xyXG4gIHJldHVybiBhcGk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWQoZ2lkKSB7XHJcbiAgcmV0dXJuIGFnZW50LmdldChwcmVmaXggKyAnLycgKyBnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZF9ub2RlcyhnaWRzKSB7XHJcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9ub2Rlcy8nLCBnaWRzKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcclxuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKyAnL21rL3Nvbi8nICsgcGdpZCwgZGF0YSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbWsvYnJvdGhlci8nICsgYmdpZCwgZGF0YSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmUoZ2lkKSB7XHJcbiAgcmV0dXJuIGFnZW50LmRlbChwcmVmaXggKyAnLycgKyBnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlKGdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBhZ2VudC5wdXQocHJlZml4ICsgJy8nICsgZ2lkLCBkYXRhKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uICBtdl9hc19zb24oc2dpZCxkZ2lkKXtcclxuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKycvbXYvJytzZ2lkKycvc29uLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiAgbXZfYXNfYnJvdGhlcihzZ2lkLGRnaWQpe1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9icm90aGVyLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX2JpZ19ub2RlKGdpZCxsZXZlbD0wKSB7XHJcbiAgcmV0dXJuIGFnZW50LmdldChwcmVmaXggKyAnL2JpZ25vZGUvJyArIGdpZCsnLycrbGV2ZWwpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufSJdfQ==