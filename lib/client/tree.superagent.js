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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdHJlZS5zdXBlcmFnZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxRQUFRLFFBQVEsb0JBQVIsRUFBOEIsUUFBUSxZQUFSLENBQTlCLEVBQXFELE9BQXJELENBQVo7O0FBR0EsSUFBSSxNQUFKO0FBQ0EsSUFBTSxNQUFNO0FBQ1YsWUFEVTtBQUVWLHdCQUZVO0FBR1YsZ0NBSFU7QUFJVixnQ0FKVTtBQUtWLHdDQUxVO0FBTVYsZ0JBTlU7QUFPVixnQkFQVTtBQVFWLHNCQVJVO0FBU1YsOEJBVFU7QUFVVjtBQVZVLENBQVo7QUFZQSxTQUFTLE9BQVQsQ0FBaUIsT0FBakIsRUFBMEI7QUFDeEIsV0FBUyxPQUFUO0FBQ0EsU0FBTyxHQUFQO0FBQ0Q7QUFDRCxPQUFPLE9BQVAsR0FBaUIsT0FBakI7O0FBRUEsU0FBUyxJQUFULENBQWMsR0FBZCxFQUFtQjtBQUNqQixTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsR0FBVCxHQUFlLEdBQXpCLEVBQThCLElBQTlCLENBQW1DO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUFuQyxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxVQUFULENBQW9CLElBQXBCLEVBQTBCO0FBQ3hCLFNBQU8sTUFBTSxJQUFOLENBQVcsU0FBUyxTQUFwQixFQUErQixJQUEvQixFQUFxQyxJQUFyQyxDQUEwQztBQUFBLFdBQU8sSUFBSSxJQUFYO0FBQUEsR0FBMUMsQ0FBUDtBQUNEOztBQUVELFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQztBQUNsQyxTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVMsVUFBVCxHQUFzQixJQUFqQyxFQUF1QyxJQUF2QyxFQUE2QyxJQUE3QyxDQUFrRDtBQUFBLFdBQU8sSUFBSSxJQUFYO0FBQUEsR0FBbEQsQ0FBUDtBQUNEOztBQUVELFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQztBQUNsQyxTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVMsZUFBVCxHQUEyQixJQUF0QyxFQUE0QyxFQUFDLFVBQUQsRUFBNUMsRUFBb0QsSUFBcEQsQ0FBeUQ7QUFBQSxXQUFPLElBQUksSUFBWDtBQUFBLEdBQXpELENBQVA7QUFDRDs7QUFFRCxTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWtDLElBQWxDLEVBQXdDO0FBQ3RDLFNBQU8sTUFBTSxJQUFOLENBQVcsU0FBUyxjQUFULEdBQTBCLElBQXJDLEVBQTJDLElBQTNDLEVBQWlELElBQWpELENBQXNEO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUF0RCxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQXFCO0FBQ25CLFNBQU8sTUFBTSxHQUFOLENBQVUsU0FBUyxHQUFULEdBQWUsR0FBekIsRUFBOEIsSUFBOUIsQ0FBbUM7QUFBQSxXQUFPLElBQUksSUFBWDtBQUFBLEdBQW5DLENBQVA7QUFDRDs7QUFFRCxTQUFTLE1BQVQsQ0FBZ0IsR0FBaEIsRUFBcUIsSUFBckIsRUFBMkI7QUFDekIsU0FBTyxNQUFNLEdBQU4sQ0FBVSxTQUFTLEdBQVQsR0FBZSxHQUF6QixFQUE4QixJQUE5QixFQUFvQyxJQUFwQyxDQUF5QztBQUFBLFdBQU8sSUFBSSxJQUFYO0FBQUEsR0FBekMsQ0FBUDtBQUNEOztBQUVELFNBQVUsU0FBVixDQUFvQixJQUFwQixFQUF5QixJQUF6QixFQUE4QjtBQUM1QixTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVEsTUFBUixHQUFlLElBQWYsR0FBb0IsT0FBcEIsR0FBNEIsSUFBdkMsRUFBNkMsSUFBN0MsQ0FBa0Q7QUFBQSxXQUFPLElBQUksSUFBWDtBQUFBLEdBQWxELENBQVA7QUFDRDs7QUFFRCxTQUFVLGFBQVYsQ0FBd0IsSUFBeEIsRUFBNkIsSUFBN0IsRUFBa0M7QUFDaEMsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFRLE1BQVIsR0FBZSxJQUFmLEdBQW9CLFdBQXBCLEdBQWdDLElBQTNDLEVBQWlELElBQWpELENBQXNEO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUF0RCxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxhQUFULENBQXVCLEdBQXZCLEVBQW9DO0FBQUEsTUFBVCxLQUFTLHlEQUFILENBQUc7O0FBQ2xDLFNBQU8sTUFBTSxHQUFOLENBQVUsU0FBUyxXQUFULEdBQXVCLEdBQXZCLEdBQTJCLEdBQTNCLEdBQStCLEtBQXpDLEVBQWdELElBQWhELENBQXFEO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUFyRCxDQUFQO0FBQ0QiLCJmaWxlIjoidHJlZS5zdXBlcmFnZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFnZW50ID0gcmVxdWlyZSgnc3VwZXJhZ2VudC1wcm9taXNlJykocmVxdWlyZSgnc3VwZXJhZ2VudCcpLCBQcm9taXNlKTtcclxuXHJcblxyXG52YXIgcHJlZml4O1xyXG5jb25zdCBhcGkgPSB7XHJcbiAgcmVhZCxcclxuICByZWFkX25vZGVzLFxyXG4gIG1rX3Nvbl9ieV9kYXRhLFxyXG4gIG1rX3Nvbl9ieV9uYW1lLFxyXG4gIG1rX2Jyb3RoZXJfYnlfZGF0YSxcclxuICByZW1vdmUsXHJcbiAgdXBkYXRlLFxyXG4gIG12X2FzX3NvbixcclxuICBtdl9hc19icm90aGVyLFxyXG4gIHJlYWRfYmlnX25vZGUsXHJcbn07XHJcbmZ1bmN0aW9uIGZhY3RvcnkoX3ByZWZpeCkge1xyXG4gIHByZWZpeCA9IF9wcmVmaXg7XHJcbiAgcmV0dXJuIGFwaTtcclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XHJcblxyXG5mdW5jdGlvbiByZWFkKGdpZCkge1xyXG4gIHJldHVybiBhZ2VudC5nZXQocHJlZml4ICsgJy8nICsgZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbm9kZXMvJywgZ2lkcykudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XHJcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9zb24vJyArIHBnaWQsIGRhdGEpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbWsvc29uX25hbWUvJyArIHBnaWQsIHtuYW1lfSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbWsvYnJvdGhlci8nICsgYmdpZCwgZGF0YSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmUoZ2lkKSB7XHJcbiAgcmV0dXJuIGFnZW50LmRlbChwcmVmaXggKyAnLycgKyBnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlKGdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBhZ2VudC5wdXQocHJlZml4ICsgJy8nICsgZ2lkLCBkYXRhKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uICBtdl9hc19zb24oc2dpZCxkZ2lkKXtcclxuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKycvbXYvJytzZ2lkKycvc29uLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiAgbXZfYXNfYnJvdGhlcihzZ2lkLGRnaWQpe1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9icm90aGVyLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX2JpZ19ub2RlKGdpZCxsZXZlbD0wKSB7XHJcbiAgcmV0dXJuIGFnZW50LmdldChwcmVmaXggKyAnL2JpZ25vZGUvJyArIGdpZCsnLycrbGV2ZWwpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufSJdfQ==