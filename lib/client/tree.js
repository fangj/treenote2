'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; // var agent = require('superagent-promise')(require('superagent'), Promise);

var _frisbee = require('frisbee');

var _frisbee2 = _interopRequireDefault(_frisbee);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// create a new instance of Frisbee
var agent = new _frisbee2.default({
  baseURI: '/',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

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
  return agent.post(prefix + '/nodes/', { body: gids }).then(function (res) {
    return res.body;
  });
}

function mk_son_by_data(pgid, data) {
  if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== "object") {
    data = { data: data };
  }
  return agent.post(prefix + '/mk/son/' + pgid, { body: data }).then(function (res) {
    return res.body;
  });
}

function mk_son_by_name(pgid, name) {
  return agent.post(prefix + '/mk/son_name/' + pgid, { body: { name: name } }).then(function (res) {
    return res.body;
  });
}

function mk_brother_by_data(bgid, data) {
  return agent.post(prefix + '/mk/brother/' + bgid, { body: data }).then(function (res) {
    return res.body;
  });
}

function remove(gid) {
  return agent.del(prefix + '/' + gid).then(function (res) {
    return res.body;
  });
}

function update(gid, data) {
  if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== "object") {
    data = { data: data };
  }
  return agent.put(prefix + '/' + gid, { body: data }).then(function (res) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdHJlZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztrUEFBQTs7QUFFQTs7Ozs7O0FBRUE7QUFDQSxJQUFNLFFBQVEsc0JBQVk7QUFDeEIsV0FBUyxHQURlO0FBRXhCLFdBQVM7QUFDUCxjQUFVLGtCQURIO0FBRVAsb0JBQWdCO0FBRlQ7QUFGZSxDQUFaLENBQWQ7O0FBUUEsSUFBSSxNQUFKO0FBQ0EsSUFBTSxNQUFNO0FBQ1YsWUFEVTtBQUVWLHdCQUZVO0FBR1YsZ0NBSFU7QUFJVixnQ0FKVTtBQUtWLHdDQUxVO0FBTVYsZ0JBTlU7QUFPVixnQkFQVTtBQVFWLHNCQVJVO0FBU1YsOEJBVFU7QUFVVjtBQVZVLENBQVo7QUFZQSxTQUFTLE9BQVQsQ0FBaUIsT0FBakIsRUFBMEI7QUFDeEIsV0FBUyxPQUFUO0FBQ0EsU0FBTyxHQUFQO0FBQ0Q7QUFDRCxPQUFPLE9BQVAsR0FBaUIsT0FBakI7O0FBRUEsU0FBUyxJQUFULENBQWMsR0FBZCxFQUFtQjtBQUNqQixTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsR0FBVCxHQUFlLEdBQXpCLEVBQThCLElBQTlCLENBQW1DO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUFuQyxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxVQUFULENBQW9CLElBQXBCLEVBQTBCO0FBQ3hCLFNBQU8sTUFBTSxJQUFOLENBQVcsU0FBUyxTQUFwQixFQUErQixFQUFDLE1BQUssSUFBTixFQUEvQixFQUE0QyxJQUE1QyxDQUFpRDtBQUFBLFdBQU8sSUFBSSxJQUFYO0FBQUEsR0FBakQsQ0FBUDtBQUNEOztBQUVELFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQztBQUNsQyxNQUFHLFFBQU8sSUFBUCx5Q0FBTyxJQUFQLE9BQWMsUUFBakIsRUFBMEI7QUFDeEIsV0FBSyxFQUFDLFVBQUQsRUFBTDtBQUNEO0FBQ0QsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFTLFVBQVQsR0FBc0IsSUFBakMsRUFBdUMsRUFBQyxNQUFLLElBQU4sRUFBdkMsRUFBb0QsSUFBcEQsQ0FBeUQ7QUFBQSxXQUFPLElBQUksSUFBWDtBQUFBLEdBQXpELENBQVA7QUFDRDs7QUFFRCxTQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0M7QUFDbEMsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFTLGVBQVQsR0FBMkIsSUFBdEMsRUFBNEMsRUFBQyxNQUFLLEVBQUMsVUFBRCxFQUFOLEVBQTVDLEVBQTJELElBQTNELENBQWdFO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUFoRSxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxrQkFBVCxDQUE0QixJQUE1QixFQUFrQyxJQUFsQyxFQUF3QztBQUN0QyxTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVMsY0FBVCxHQUEwQixJQUFyQyxFQUEyQyxFQUFDLE1BQUssSUFBTixFQUEzQyxFQUF3RCxJQUF4RCxDQUE2RDtBQUFBLFdBQU8sSUFBSSxJQUFYO0FBQUEsR0FBN0QsQ0FBUDtBQUNEOztBQUVELFNBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQjtBQUNuQixTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsR0FBVCxHQUFlLEdBQXpCLEVBQThCLElBQTlCLENBQW1DO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUFuQyxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQXFCLElBQXJCLEVBQTJCO0FBQ3pCLE1BQUcsUUFBTyxJQUFQLHlDQUFPLElBQVAsT0FBYyxRQUFqQixFQUEwQjtBQUN4QixXQUFLLEVBQUMsVUFBRCxFQUFMO0FBQ0Q7QUFDRCxTQUFPLE1BQU0sR0FBTixDQUFVLFNBQVMsR0FBVCxHQUFlLEdBQXpCLEVBQThCLEVBQUMsTUFBSyxJQUFOLEVBQTlCLEVBQTJDLElBQTNDLENBQWdEO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUFoRCxDQUFQO0FBQ0Q7O0FBRUQsU0FBVSxTQUFWLENBQW9CLElBQXBCLEVBQXlCLElBQXpCLEVBQThCO0FBQzVCLFNBQU8sTUFBTSxJQUFOLENBQVcsU0FBUSxNQUFSLEdBQWUsSUFBZixHQUFvQixPQUFwQixHQUE0QixJQUF2QyxFQUE2QyxJQUE3QyxDQUFrRDtBQUFBLFdBQU8sSUFBSSxJQUFYO0FBQUEsR0FBbEQsQ0FBUDtBQUNEOztBQUVELFNBQVUsYUFBVixDQUF3QixJQUF4QixFQUE2QixJQUE3QixFQUFrQztBQUNoQyxTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVEsTUFBUixHQUFlLElBQWYsR0FBb0IsV0FBcEIsR0FBZ0MsSUFBM0MsRUFBaUQsSUFBakQsQ0FBc0Q7QUFBQSxXQUFPLElBQUksSUFBWDtBQUFBLEdBQXRELENBQVA7QUFDRDs7QUFFRCxTQUFTLGFBQVQsQ0FBdUIsR0FBdkIsRUFBb0M7QUFBQSxNQUFULEtBQVMseURBQUgsQ0FBRzs7QUFDbEMsU0FBTyxNQUFNLEdBQU4sQ0FBVSxTQUFTLFdBQVQsR0FBdUIsR0FBdkIsR0FBMkIsR0FBM0IsR0FBK0IsS0FBekMsRUFBZ0QsSUFBaEQsQ0FBcUQ7QUFBQSxXQUFPLElBQUksSUFBWDtBQUFBLEdBQXJELENBQVA7QUFDRCIsImZpbGUiOiJ0cmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmFyIGFnZW50ID0gcmVxdWlyZSgnc3VwZXJhZ2VudC1wcm9taXNlJykocmVxdWlyZSgnc3VwZXJhZ2VudCcpLCBQcm9taXNlKTtcclxuXHJcbmltcG9ydCBGcmlzYmVlIGZyb20gJ2ZyaXNiZWUnO1xyXG5cclxuLy8gY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEZyaXNiZWVcclxuY29uc3QgYWdlbnQgPSBuZXcgRnJpc2JlZSh7XHJcbiAgYmFzZVVSSTogJy8nLFxyXG4gIGhlYWRlcnM6IHtcclxuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgfVxyXG59KTtcclxuXHJcbnZhciBwcmVmaXg7XHJcbmNvbnN0IGFwaSA9IHtcclxuICByZWFkLFxyXG4gIHJlYWRfbm9kZXMsXHJcbiAgbWtfc29uX2J5X2RhdGEsXHJcbiAgbWtfc29uX2J5X25hbWUsXHJcbiAgbWtfYnJvdGhlcl9ieV9kYXRhLFxyXG4gIHJlbW92ZSxcclxuICB1cGRhdGUsXHJcbiAgbXZfYXNfc29uLFxyXG4gIG12X2FzX2Jyb3RoZXIsXHJcbiAgcmVhZF9iaWdfbm9kZSxcclxufTtcclxuZnVuY3Rpb24gZmFjdG9yeShfcHJlZml4KSB7XHJcbiAgcHJlZml4ID0gX3ByZWZpeDtcclxuICByZXR1cm4gYXBpO1xyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcclxuXHJcbmZ1bmN0aW9uIHJlYWQoZ2lkKSB7XHJcbiAgcmV0dXJuIGFnZW50LmdldChwcmVmaXggKyAnLycgKyBnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZF9ub2RlcyhnaWRzKSB7XHJcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9ub2Rlcy8nLCB7Ym9keTpnaWRzfSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XHJcbiAgaWYodHlwZW9mIGRhdGEhPT1cIm9iamVjdFwiKXtcclxuICAgIGRhdGE9e2RhdGF9XHJcbiAgfVxyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbWsvc29uLycgKyBwZ2lkLCB7Ym9keTpkYXRhfSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XHJcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9zb25fbmFtZS8nICsgcGdpZCwge2JvZHk6e25hbWV9fSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbWsvYnJvdGhlci8nICsgYmdpZCwge2JvZHk6ZGF0YX0pLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xyXG4gIHJldHVybiBhZ2VudC5kZWwocHJlZml4ICsgJy8nICsgZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZShnaWQsIGRhdGEpIHtcclxuICBpZih0eXBlb2YgZGF0YSE9PVwib2JqZWN0XCIpe1xyXG4gICAgZGF0YT17ZGF0YX1cclxuICB9XHJcbiAgcmV0dXJuIGFnZW50LnB1dChwcmVmaXggKyAnLycgKyBnaWQsIHtib2R5OmRhdGF9KS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uICBtdl9hc19zb24oc2dpZCxkZ2lkKXtcclxuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKycvbXYvJytzZ2lkKycvc29uLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiAgbXZfYXNfYnJvdGhlcihzZ2lkLGRnaWQpe1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9icm90aGVyLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX2JpZ19ub2RlKGdpZCxsZXZlbD0wKSB7XHJcbiAgcmV0dXJuIGFnZW50LmdldChwcmVmaXggKyAnL2JpZ25vZGUvJyArIGdpZCsnLycrbGV2ZWwpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufSJdfQ==