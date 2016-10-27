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
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return agent.get(prefix + '/bignode/' + gid + '/' + level).then(function (res) {
    return res.body;
  });
}
//# sourceMappingURL=data:application/json;base64,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QWdEO1dBQU8sSUFBSSxJQUFKO0dBQVAsQ0FBdkQsQ0FOeUI7Q0FBM0I7O0FBU0EsU0FBVSxTQUFWLENBQW9CLElBQXBCLEVBQXlCLElBQXpCLEVBQThCO0FBQzVCLFNBQU8sTUFBTSxJQUFOLENBQVcsU0FBUSxNQUFSLEdBQWUsSUFBZixHQUFvQixPQUFwQixHQUE0QixJQUE1QixDQUFYLENBQTZDLElBQTdDLENBQWtEO1dBQU8sSUFBSSxJQUFKO0dBQVAsQ0FBekQsQ0FENEI7Q0FBOUI7O0FBSUEsU0FBVSxhQUFWLENBQXdCLElBQXhCLEVBQTZCLElBQTdCLEVBQWtDO0FBQ2hDLFNBQU8sTUFBTSxJQUFOLENBQVcsU0FBUSxNQUFSLEdBQWUsSUFBZixHQUFvQixXQUFwQixHQUFnQyxJQUFoQyxDQUFYLENBQWlELElBQWpELENBQXNEO1dBQU8sSUFBSSxJQUFKO0dBQVAsQ0FBN0QsQ0FEZ0M7Q0FBbEM7O0FBSUEsU0FBUyxhQUFULENBQXVCLEdBQXZCLEVBQW9DO01BQVQsNEVBQU0sRUFBRzs7QUFDbEMsU0FBTyxNQUFNLEdBQU4sQ0FBVSxTQUFTLFdBQVQsR0FBdUIsR0FBdkIsR0FBMkIsR0FBM0IsR0FBK0IsS0FBL0IsQ0FBVixDQUFnRCxJQUFoRCxDQUFxRDtXQUFPLElBQUksSUFBSjtHQUFQLENBQTVELENBRGtDO0NBQXBDIiwiZmlsZSI6InRyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2YXIgYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50LXByb21pc2UnKShyZXF1aXJlKCdzdXBlcmFnZW50JyksIFByb21pc2UpO1xuXG5pbXBvcnQgRnJpc2JlZSBmcm9tICdmcmlzYmVlJztcblxuLy8gY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEZyaXNiZWVcbmNvbnN0IGFnZW50ID0gbmV3IEZyaXNiZWUoe1xuICBiYXNlVVJJOiAnLycsXG4gIGhlYWRlcnM6IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgfVxufSk7XG5cbnZhciBwcmVmaXg7XG5jb25zdCBhcGkgPSB7XG4gIHJlYWQsXG4gIHJlYWRfbm9kZXMsXG4gIG1rX3Nvbl9ieV9kYXRhLFxuICBta19zb25fYnlfbmFtZSxcbiAgbWtfYnJvdGhlcl9ieV9kYXRhLFxuICByZW1vdmUsXG4gIHVwZGF0ZSxcbiAgbXZfYXNfc29uLFxuICBtdl9hc19icm90aGVyLFxuICByZWFkX2JpZ19ub2RlLFxufTtcbmZ1bmN0aW9uIGZhY3RvcnkoX3ByZWZpeCkge1xuICBwcmVmaXggPSBfcHJlZml4O1xuICByZXR1cm4gYXBpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuXG5mdW5jdGlvbiByZWFkKGdpZCkge1xuICByZXR1cm4gYWdlbnQuZ2V0KHByZWZpeCArICcvJyArIGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiByZWFkX25vZGVzKGdpZHMpIHtcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9ub2Rlcy8nLCB7Ym9keTpnaWRzfSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiBta19zb25fYnlfZGF0YShwZ2lkLCBkYXRhKSB7XG4gIGlmKGRhdGE9PT1udWxsKXtcbiAgICBkYXRhPXt9XG4gIH1lbHNlIGlmKCB0eXBlb2YgZGF0YSE9PVwib2JqZWN0XCIpe1xuICAgIGRhdGE9e2RhdGF9XG4gIH1cbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9zb24vJyArIHBnaWQsIHtib2R5OmRhdGF9KS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uIG1rX3Nvbl9ieV9uYW1lKHBnaWQsIG5hbWUpIHtcbiAgcmV0dXJuIGFnZW50LnBvc3QocHJlZml4ICsgJy9tay9zb25fbmFtZS8nICsgcGdpZCwge2JvZHk6e25hbWV9fSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiBta19icm90aGVyX2J5X2RhdGEoYmdpZCwgZGF0YSkge1xuICByZXR1cm4gYWdlbnQucG9zdChwcmVmaXggKyAnL21rL2Jyb3RoZXIvJyArIGJnaWQsIHtib2R5OmRhdGF9KS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShnaWQpIHtcbiAgcmV0dXJuIGFnZW50LmRlbChwcmVmaXggKyAnLycgKyBnaWQpLnRoZW4ocmVzID0+IHJlcy5ib2R5KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlKGdpZCwgZGF0YSkge1xuICBpZihkYXRhPT09bnVsbCl7XG4gICAgZGF0YT17fVxuICB9ZWxzZSBpZiggdHlwZW9mIGRhdGEhPT1cIm9iamVjdFwiKXtcbiAgICBkYXRhPXtkYXRhfVxuICB9XG4gIHJldHVybiBhZ2VudC5wdXQocHJlZml4ICsgJy8nICsgZ2lkLCB7Ym9keTpkYXRhfSkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiAgbXZfYXNfc29uKHNnaWQsZGdpZCl7XG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9zb24vJytkZ2lkKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59XG5cbmZ1bmN0aW9uICBtdl9hc19icm90aGVyKHNnaWQsZGdpZCl7XG4gIHJldHVybiBhZ2VudC5wb3N0KHByZWZpeCArJy9tdi8nK3NnaWQrJy9icm90aGVyLycrZGdpZCkudGhlbihyZXMgPT4gcmVzLmJvZHkpO1xufVxuXG5mdW5jdGlvbiByZWFkX2JpZ19ub2RlKGdpZCxsZXZlbD0wKSB7XG4gIHJldHVybiBhZ2VudC5nZXQocHJlZml4ICsgJy9iaWdub2RlLycgKyBnaWQrJy8nK2xldmVsKS50aGVuKHJlcyA9PiByZXMuYm9keSk7XG59Il19