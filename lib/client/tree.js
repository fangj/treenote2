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
  if (data === null) {
    data = {};
  } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== "object") {
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
  if (data === null) {
    data = {};
  } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== "object") {
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
//# sourceMappingURL=data:application/json;base64,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QUEyQyxJQUEzQyxDQUFnRDtBQUFBLFdBQU8sSUFBSSxJQUFYO0FBQUEsR0FBaEQsQ0FBUDtBQUNEOztBQUVELFNBQVUsU0FBVixDQUFvQixJQUFwQixFQUF5QixJQUF6QixFQUE4QjtBQUM1QixTQUFPLE1BQU0sSUFBTixDQUFXLFNBQVEsTUFBUixHQUFlLElBQWYsR0FBb0IsT0FBcEIsR0FBNEIsSUFBdkMsRUFBNkMsSUFBN0MsQ0FBa0Q7QUFBQSxXQUFPLElBQUksSUFBWDtBQUFBLEdBQWxELENBQVA7QUFDRDs7QUFFRCxTQUFVLGFBQVYsQ0FBd0IsSUFBeEIsRUFBNkIsSUFBN0IsRUFBa0M7QUFDaEMsU0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFRLE1BQVIsR0FBZSxJQUFmLEdBQW9CLFdBQXBCLEdBQWdDLElBQTNDLEVBQWlELElBQWpELENBQXNEO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUF0RCxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxhQUFULENBQXVCLEdBQXZCLEVBQW9DO0FBQUEsTUFBVCxLQUFTLHlEQUFILENBQUc7O0FBQ2xDLFNBQU8sTUFBTSxHQUFOLENBQVUsU0FBUyxXQUFULEdBQXVCLEdBQXZCLEdBQTJCLEdBQTNCLEdBQStCLEtBQXpDLEVBQWdELElBQWhELENBQXFEO0FBQUEsV0FBTyxJQUFJLElBQVg7QUFBQSxHQUFyRCxDQUFQO0FBQ0QiLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZhciBhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQtcHJvbWlzZScpKHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSwgUHJvbWlzZSk7XHJcblxyXG5pbXBvcnQgRnJpc2JlZSBmcm9tICdmcmlzYmVlJztcclxuXHJcbi8vIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBGcmlzYmVlXHJcbmNvbnN0IGFnZW50ID0gbmV3IEZyaXNiZWUoe1xyXG4gIGJhc2VVUkk6ICcvJyxcclxuICBoZWFkZXJzOiB7XHJcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG4gIH1cclxufSk7XHJcblxyXG52YXIgcHJlZml4O1xyXG5jb25zdCBhcGkgPSB7XHJcbiAgcmVhZCxcclxuICByZWFkX25vZGVzLFxyXG4gIG1rX3Nvbl9ieV9kYXRhLFxyXG4gIG1rX3Nvbl9ieV9uYW1lLFxyXG4gIG1rX2Jyb3RoZXJfYnlfZGF0YSxcclxuICByZW1vdmUsXHJcbiAgdXBkYXRlLFxyXG4gIG12X2FzX3NvbixcclxuICBtdl9hc19icm90aGVyLFxyXG4gIHJlYWRfYmlnX25vZGUsXHJcbn07XHJcbmZ1bmN0aW9uIGZhY3RvcnkoX3ByZWZpeCkge1xyXG4gIHByZWZpeCA9IF9wcmVmaXg7XHJcbiAgcmV0dXJuIGFwaTtcclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XHJcblxyXG5mdW5jdGlvbiByZWFkKGdpZCkge1xyXG4gIHJldHVybiBhZ2VudC5nZXQocHJlZml4ICsgJy8nICsgZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRfbm9kZXMoZ2lkcykge1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbm9kZXMvJywge2JvZHk6Z2lkc30pLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWtfc29uX2J5X2RhdGEocGdpZCwgZGF0YSkge1xyXG4gIGlmKGRhdGE9PT1udWxsKXtcclxuICAgIGRhdGE9e31cclxuICB9ZWxzZSBpZiggdHlwZW9mIGRhdGEhPT1cIm9iamVjdFwiKXtcclxuICAgIGRhdGE9e2RhdGF9XHJcbiAgfVxyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbWsvc29uLycgKyBwZ2lkLCB7Ym9keTpkYXRhfSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19zb25fYnlfbmFtZShwZ2lkLCBuYW1lKSB7XHJcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9zb25fbmFtZS8nICsgcGdpZCwge2JvZHk6e25hbWV9fSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCwgZGF0YSkge1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArICcvbWsvYnJvdGhlci8nICsgYmdpZCwge2JvZHk6ZGF0YX0pLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlKGdpZCkge1xyXG4gIHJldHVybiBhZ2VudC5kZWwocHJlZml4ICsgJy8nICsgZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZShnaWQsIGRhdGEpIHtcclxuICBpZihkYXRhPT09bnVsbCl7XHJcbiAgICBkYXRhPXt9XHJcbiAgfWVsc2UgaWYoIHR5cGVvZiBkYXRhIT09XCJvYmplY3RcIil7XHJcbiAgICBkYXRhPXtkYXRhfVxyXG4gIH1cclxuICByZXR1cm4gYWdlbnQucHV0KHByZWZpeCArICcvJyArIGdpZCwge2JvZHk6ZGF0YX0pLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gIG12X2FzX3NvbihzZ2lkLGRnaWQpe1xyXG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9zb24vJytkZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uICBtdl9hc19icm90aGVyKHNnaWQsZGdpZCl7XHJcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsnL212Lycrc2dpZCsnL2Jyb3RoZXIvJytkZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRfYmlnX25vZGUoZ2lkLGxldmVsPTApIHtcclxuICByZXR1cm4gYWdlbnQuZ2V0KHByZWZpeCArICcvYmlnbm9kZS8nICsgZ2lkKycvJytsZXZlbCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xyXG59Il19