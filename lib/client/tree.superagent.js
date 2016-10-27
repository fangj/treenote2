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
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return agent.get(prefix + '/bignode/' + gid + '/' + level).then(function (res) {
    return res.body;
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdHJlZS5zdXBlcmFnZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxRQUFRLFFBQVEsb0JBQVIsRUFBOEIsUUFBUSxZQUFSLENBQTlCLEVBQXFELE9BQXJELENBQVI7O0FBR0osSUFBSSxNQUFKO0FBQ0EsSUFBTSxNQUFNO0FBQ1YsWUFEVTtBQUVWLHdCQUZVO0FBR1YsZ0NBSFU7QUFJVixnQ0FKVTtBQUtWLHdDQUxVO0FBTVYsZ0JBTlU7QUFPVixnQkFQVTtBQVFWLHNCQVJVO0FBU1YsOEJBVFU7QUFVViw4QkFWVTtDQUFOO0FBWU4sU0FBUyxPQUFULENBQWlCLE9BQWpCLEVBQTBCO0FBQ3hCLFdBQVMsT0FBVCxDQUR3QjtBQUV4QixTQUFPLEdBQVAsQ0FGd0I7Q0FBMUI7QUFJQSxPQUFPLE9BQVAsR0FBaUIsT0FBakI7O0FBRUEsU0FBUyxJQUFULENBQWMsR0FBZCxFQUFtQjtBQUNqQixTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsR0FBVCxHQUFlLEdBQWYsQ0FBVixDQUE4QixJQUE5QixDQUFtQztXQUFPLElBQUksSUFBSjtHQUFQLENBQTFDLENBRGlCO0NBQW5COztBQUlBLFNBQVMsVUFBVCxDQUFvQixJQUFwQixFQUEwQjtBQUN4QixTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVMsU0FBVCxFQUFvQixJQUEvQixFQUFxQyxJQUFyQyxDQUEwQztXQUFPLElBQUksSUFBSjtHQUFQLENBQWpELENBRHdCO0NBQTFCOztBQUlBLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQztBQUNsQyxTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVMsVUFBVCxHQUFzQixJQUF0QixFQUE0QixJQUF2QyxFQUE2QyxJQUE3QyxDQUFrRDtXQUFPLElBQUksSUFBSjtHQUFQLENBQXpELENBRGtDO0NBQXBDOztBQUlBLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQztBQUNsQyxTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVMsZUFBVCxHQUEyQixJQUEzQixFQUFpQyxFQUFDLFVBQUQsRUFBNUMsRUFBb0QsSUFBcEQsQ0FBeUQ7V0FBTyxJQUFJLElBQUo7R0FBUCxDQUFoRSxDQURrQztDQUFwQzs7QUFJQSxTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWtDLElBQWxDLEVBQXdDO0FBQ3RDLFNBQU8sTUFBTSxJQUFOLENBQVcsU0FBUyxjQUFULEdBQTBCLElBQTFCLEVBQWdDLElBQTNDLEVBQWlELElBQWpELENBQXNEO1dBQU8sSUFBSSxJQUFKO0dBQVAsQ0FBN0QsQ0FEc0M7Q0FBeEM7O0FBSUEsU0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQXFCO0FBQ25CLFNBQU8sTUFBTSxHQUFOLENBQVUsU0FBUyxHQUFULEdBQWUsR0FBZixDQUFWLENBQThCLElBQTlCLENBQW1DO1dBQU8sSUFBSSxJQUFKO0dBQVAsQ0FBMUMsQ0FEbUI7Q0FBckI7O0FBSUEsU0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQXFCLElBQXJCLEVBQTJCO0FBQ3pCLFNBQU8sTUFBTSxHQUFOLENBQVUsU0FBUyxHQUFULEdBQWUsR0FBZixFQUFvQixJQUE5QixFQUFvQyxJQUFwQyxDQUF5QztXQUFPLElBQUksSUFBSjtHQUFQLENBQWhELENBRHlCO0NBQTNCOztBQUlBLFNBQVUsU0FBVixDQUFvQixJQUFwQixFQUF5QixJQUF6QixFQUE4QjtBQUM1QixTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVEsTUFBUixHQUFlLElBQWYsR0FBb0IsT0FBcEIsR0FBNEIsSUFBNUIsQ0FBWCxDQUE2QyxJQUE3QyxDQUFrRDtXQUFPLElBQUksSUFBSjtHQUFQLENBQXpELENBRDRCO0NBQTlCOztBQUlBLFNBQVUsYUFBVixDQUF3QixJQUF4QixFQUE2QixJQUE3QixFQUFrQztBQUNoQyxTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVEsTUFBUixHQUFlLElBQWYsR0FBb0IsV0FBcEIsR0FBZ0MsSUFBaEMsQ0FBWCxDQUFpRCxJQUFqRCxDQUFzRDtXQUFPLElBQUksSUFBSjtHQUFQLENBQTdELENBRGdDO0NBQWxDOztBQUlBLFNBQVMsYUFBVCxDQUF1QixHQUF2QixFQUFvQztNQUFULDRFQUFNLEVBQUc7O0FBQ2xDLFNBQU8sTUFBTSxHQUFOLENBQVUsU0FBUyxXQUFULEdBQXVCLEdBQXZCLEdBQTJCLEdBQTNCLEdBQStCLEtBQS9CLENBQVYsQ0FBZ0QsSUFBaEQsQ0FBcUQ7V0FBTyxJQUFJLElBQUo7R0FBUCxDQUE1RCxDQURrQztDQUFwQyIsImZpbGUiOiJ0cmVlLnN1cGVyYWdlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50LXByb21pc2UnKShyZXF1aXJlKCdzdXBlcmFnZW50JyksIFByb21pc2UpO1xuXG5cbnZhciBwcmVmaXg7XG5jb25zdCBhcGkgPSB7XG4gIHJlYWQsXG4gIHJlYWRfbm9kZXMsXG4gIG1rX3Nvbl9ieV9kYXRhLFxuICBta19zb25fYnlfbmFtZSxcbiAgbWtfYnJvdGhlcl9ieV9kYXRhLFxuICByZW1vdmUsXG4gIHVwZGF0ZSxcbiAgbXZfYXNfc29uLFxuICBtdl9hc19icm90aGVyLFxuICByZWFkX2JpZ19ub2RlLFxufTtcbmZ1bmN0aW9uIGZhY3RvcnkoX3ByZWZpeCkge1xuICBwcmVmaXggPSBfcHJlZml4O1xuICByZXR1cm4gYXBpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuXG5mdW5jdGlvbiByZWFkKGdpZCkge1xuICByZXR1cm4gYWdlbnQuZ2V0KHByZWZpeCArICcvJyArIGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9ub2Rlcy8nLCBnaWRzKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9zb24vJyArIHBnaWQsIGRhdGEpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKyAnL21rL3Nvbl9uYW1lLycgKyBwZ2lkLCB7bmFtZX0pLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcbn1cblxuZnVuY3Rpb24gbWtfYnJvdGhlcl9ieV9kYXRhKGJnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9icm90aGVyLycgKyBiZ2lkLCBkYXRhKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbiAgcmV0dXJuIGFnZW50LmRlbChwcmVmaXggKyAnLycgKyBnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlKGdpZCwgZGF0YSkge1xuICByZXR1cm4gYWdlbnQucHV0KHByZWZpeCArICcvJyArIGdpZCwgZGF0YSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiAgbXZfYXNfc29uKHNnaWQsZGdpZCl7XG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9zb24vJytkZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uICBtdl9hc19icm90aGVyKHNnaWQsZGdpZCl7XG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9icm90aGVyLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiByZWFkX2JpZ19ub2RlKGdpZCxsZXZlbD0wKSB7XG4gIHJldHVybiBhZ2VudC5nZXQocHJlZml4ICsgJy9iaWdub2RlLycgKyBnaWQrJy8nK2xldmVsKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59Il19