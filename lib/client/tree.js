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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdHJlZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksUUFBUSxRQUFRLG9CQUFSLEVBQThCLFFBQVEsWUFBUixDQUE5QixFQUFxRCxPQUFyRCxDQUFSOztBQUVKLElBQUksTUFBSjtBQUNBLElBQU0sTUFBTTtBQUNWLFlBRFU7QUFFVix3QkFGVTtBQUdWLGdDQUhVO0FBSVYsZ0NBSlU7QUFLVix3Q0FMVTtBQU1WLGdCQU5VO0FBT1YsZ0JBUFU7QUFRVixzQkFSVTtBQVNWLDhCQVRVO0FBVVYsOEJBVlU7Q0FBTjtBQVlOLFNBQVMsT0FBVCxDQUFpQixPQUFqQixFQUEwQjtBQUN4QixXQUFTLE9BQVQsQ0FEd0I7QUFFeEIsU0FBTyxHQUFQLENBRndCO0NBQTFCO0FBSUEsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOztBQUVBLFNBQVMsSUFBVCxDQUFjLEdBQWQsRUFBbUI7QUFDakIsU0FBTyxNQUFNLEdBQU4sQ0FBVSxTQUFTLEdBQVQsR0FBZSxHQUFmLENBQVYsQ0FBOEIsSUFBOUIsQ0FBbUM7V0FBTyxJQUFJLElBQUo7R0FBUCxDQUExQyxDQURpQjtDQUFuQjs7QUFJQSxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEI7QUFDeEIsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFTLFNBQVQsRUFBb0IsSUFBL0IsRUFBcUMsSUFBckMsQ0FBMEM7V0FBTyxJQUFJLElBQUo7R0FBUCxDQUFqRCxDQUR3QjtDQUExQjs7QUFJQSxTQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0M7QUFDbEMsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFTLFVBQVQsR0FBc0IsSUFBdEIsRUFBNEIsSUFBdkMsRUFBNkMsSUFBN0MsQ0FBa0Q7V0FBTyxJQUFJLElBQUo7R0FBUCxDQUF6RCxDQURrQztDQUFwQzs7QUFJQSxTQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0M7QUFDbEMsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFTLGVBQVQsR0FBMkIsSUFBM0IsRUFBaUMsRUFBQyxVQUFELEVBQTVDLEVBQW9ELElBQXBELENBQXlEO1dBQU8sSUFBSSxJQUFKO0dBQVAsQ0FBaEUsQ0FEa0M7Q0FBcEM7O0FBSUEsU0FBUyxrQkFBVCxDQUE0QixJQUE1QixFQUFrQyxJQUFsQyxFQUF3QztBQUN0QyxTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVMsY0FBVCxHQUEwQixJQUExQixFQUFnQyxJQUEzQyxFQUFpRCxJQUFqRCxDQUFzRDtXQUFPLElBQUksSUFBSjtHQUFQLENBQTdELENBRHNDO0NBQXhDOztBQUlBLFNBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQjtBQUNuQixTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsR0FBVCxHQUFlLEdBQWYsQ0FBVixDQUE4QixJQUE5QixDQUFtQztXQUFPLElBQUksSUFBSjtHQUFQLENBQTFDLENBRG1CO0NBQXJCOztBQUlBLFNBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixJQUFyQixFQUEyQjtBQUN6QixTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsR0FBVCxHQUFlLEdBQWYsRUFBb0IsSUFBOUIsRUFBb0MsSUFBcEMsQ0FBeUM7V0FBTyxJQUFJLElBQUo7R0FBUCxDQUFoRCxDQUR5QjtDQUEzQjs7QUFJQSxTQUFVLFNBQVYsQ0FBb0IsSUFBcEIsRUFBeUIsSUFBekIsRUFBOEI7QUFDNUIsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFRLE1BQVIsR0FBZSxJQUFmLEdBQW9CLE9BQXBCLEdBQTRCLElBQTVCLENBQVgsQ0FBNkMsSUFBN0MsQ0FBa0Q7V0FBTyxJQUFJLElBQUo7R0FBUCxDQUF6RCxDQUQ0QjtDQUE5Qjs7QUFJQSxTQUFVLGFBQVYsQ0FBd0IsSUFBeEIsRUFBNkIsSUFBN0IsRUFBa0M7QUFDaEMsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFRLE1BQVIsR0FBZSxJQUFmLEdBQW9CLFdBQXBCLEdBQWdDLElBQWhDLENBQVgsQ0FBaUQsSUFBakQsQ0FBc0Q7V0FBTyxJQUFJLElBQUo7R0FBUCxDQUE3RCxDQURnQztDQUFsQzs7QUFJQSxTQUFTLGFBQVQsQ0FBdUIsR0FBdkIsRUFBb0M7TUFBVCw0RUFBTSxFQUFHOztBQUNsQyxTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsV0FBVCxHQUF1QixHQUF2QixHQUEyQixHQUEzQixHQUErQixLQUEvQixDQUFWLENBQWdELElBQWhELENBQXFEO1dBQU8sSUFBSSxJQUFKO0dBQVAsQ0FBNUQsQ0FEa0M7Q0FBcEMiLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQtcHJvbWlzZScpKHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSwgUHJvbWlzZSk7XG5cbnZhciBwcmVmaXg7XG5jb25zdCBhcGkgPSB7XG4gIHJlYWQsXG4gIHJlYWRfbm9kZXMsXG4gIG1rX3Nvbl9ieV9kYXRhLFxuICBta19zb25fYnlfbmFtZSxcbiAgbWtfYnJvdGhlcl9ieV9kYXRhLFxuICByZW1vdmUsXG4gIHVwZGF0ZSxcbiAgbXZfYXNfc29uLFxuICBtdl9hc19icm90aGVyLFxuICByZWFkX2JpZ19ub2RlLFxufTtcbmZ1bmN0aW9uIGZhY3RvcnkoX3ByZWZpeCkge1xuICBwcmVmaXggPSBfcHJlZml4O1xuICByZXR1cm4gYXBpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuXG5mdW5jdGlvbiByZWFkKGdpZCkge1xuICByZXR1cm4gYWdlbnQuZ2V0KHByZWZpeCArICcvJyArIGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9ub2Rlcy8nLCBnaWRzKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9kYXRhKHBnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9zb24vJyArIHBnaWQsIGRhdGEpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcbn1cblxuZnVuY3Rpb24gbWtfc29uX2J5X25hbWUocGdpZCwgbmFtZSkge1xuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKyAnL21rL3Nvbl9uYW1lLycgKyBwZ2lkLCB7bmFtZX0pLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcbn1cblxuZnVuY3Rpb24gbWtfYnJvdGhlcl9ieV9kYXRhKGJnaWQsIGRhdGEpIHtcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9icm90aGVyLycgKyBiZ2lkLCBkYXRhKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbiAgcmV0dXJuIGFnZW50LmRlbChwcmVmaXggKyAnLycgKyBnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlKGdpZCwgZGF0YSkge1xuICByZXR1cm4gYWdlbnQucHV0KHByZWZpeCArICcvJyArIGdpZCwgZGF0YSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiAgbXZfYXNfc29uKHNnaWQsZGdpZCl7XG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9zb24vJytkZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uICBtdl9hc19icm90aGVyKHNnaWQsZGdpZCl7XG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9icm90aGVyLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiByZWFkX2JpZ19ub2RlKGdpZCxsZXZlbD0wKSB7XG4gIHJldHVybiBhZ2VudC5nZXQocHJlZml4ICsgJy9iaWdub2RlLycgKyBnaWQrJy8nK2xldmVsKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59Il19