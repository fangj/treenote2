'use strict';

var agent = require('superagent-promise')(require('superagent'), Promise);

var prefix;
var api = {
  read: read,
  read_nodes: read_nodes,
  mk_son_by_data: mk_son_by_data,
  mk_son_by_name: mk_son_by_name,
  mk_brother_by_data: mk_brother_by_data,
  remove: remove,
  update: update,
  mv_as_son: mv_as_son,
  mv_as_brother: mv_as_brother,
  read_big_node: read_big_node
};
function factory(_prefix) {
  prefix = _prefix;
  return api;
}
module.exports = factory;

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

function mk_son_by_name(pgid, name) {
  return agent.post(prefix + '/mk/son_name/' + pgid, { name: name }).then(function (res) {
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
//# sourceMappingURL=data:application/json;base64,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O0FBQUEsR0FBdEQsQ0FBUDtBQUNEOztBQUVELFNBQVMsYUFBVCxDQUF1QixHQUF2QixFQUFvQztBQUFBLE1BQVQsS0FBUyx5REFBSCxDQUFHOztBQUNsQyxTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsV0FBVCxHQUF1QixHQUF2QixHQUEyQixHQUEzQixHQUErQixLQUF6QyxFQUFnRCxJQUFoRCxDQUFxRDtBQUFBLFdBQU8sSUFBSSxJQUFYO0FBQUEsR0FBckQsQ0FBUDtBQUNEIiwiZmlsZSI6InRyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50LXByb21pc2UnKShyZXF1aXJlKCdzdXBlcmFnZW50JyksIFByb21pc2UpO1xyXG5cclxudmFyIHByZWZpeDtcclxuY29uc3QgYXBpID0ge1xyXG4gIHJlYWQsXHJcbiAgcmVhZF9ub2RlcyxcclxuICBta19zb25fYnlfZGF0YSxcclxuICBta19zb25fYnlfbmFtZSxcclxuICBta19icm90aGVyX2J5X2RhdGEsXHJcbiAgcmVtb3ZlLFxyXG4gIHVwZGF0ZSxcclxuICBtdl9hc19zb24sXHJcbiAgbXZfYXNfYnJvdGhlcixcclxuICByZWFkX2JpZ19ub2RlLFxyXG59O1xyXG5mdW5jdGlvbiBmYWN0b3J5KF9wcmVmaXgpIHtcclxuICBwcmVmaXggPSBfcHJlZml4O1xyXG4gIHJldHVybiBhcGk7XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xyXG5cclxuZnVuY3Rpb24gcmVhZChnaWQpIHtcclxuICByZXR1cm4gYWdlbnQuZ2V0KHByZWZpeCArICcvJyArIGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcclxuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKyAnL25vZGVzLycsIGdpZHMpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbWsvc29uLycgKyBwZ2lkLCBkYXRhKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1rX3Nvbl9ieV9uYW1lKHBnaWQsIG5hbWUpIHtcclxuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKyAnL21rL3Nvbl9uYW1lLycgKyBwZ2lkLCB7bmFtZX0pLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfYnJvdGhlcl9ieV9kYXRhKGJnaWQsIGRhdGEpIHtcclxuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKyAnL21rL2Jyb3RoZXIvJyArIGJnaWQsIGRhdGEpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xyXG4gIHJldHVybiBhZ2VudC5kZWwocHJlZml4ICsgJy8nICsgZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZShnaWQsIGRhdGEpIHtcclxuICByZXR1cm4gYWdlbnQucHV0KHByZWZpeCArICcvJyArIGdpZCwgZGF0YSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiAgbXZfYXNfc29uKHNnaWQsZGdpZCl7XHJcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsnL212Lycrc2dpZCsnL3Nvbi8nK2RnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gIG12X2FzX2Jyb3RoZXIoc2dpZCxkZ2lkKXtcclxuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKycvbXYvJytzZ2lkKycvYnJvdGhlci8nK2RnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZF9iaWdfbm9kZShnaWQsbGV2ZWw9MCkge1xyXG4gIHJldHVybiBhZ2VudC5nZXQocHJlZml4ICsgJy9iaWdub2RlLycgKyBnaWQrJy8nK2xldmVsKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn0iXX0=