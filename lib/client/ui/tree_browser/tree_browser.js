'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tree_node_reader = require('treenote2/src/client/ui/tree_node_reader');

var _tree_node_reader2 = _interopRequireDefault(_tree_node_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var cx = require("classnames");
var _ = require("lodash");
require('./tree_browser.less');
var PubSub = require("pubsub-js");
var d = require('./dom_operation');
var clipboard; //剪贴板，用于存放当前剪切的node id


function isDescendant(target, source, treetool) {
  //check whether target is  descendant of source
  return treetool.expandToRoot([target], source).then(function (idpath) {
    return idpath.indexOf(source) > -1;
  });
}

function paste(from, to, tree, treetool) {
  isDescendant(to, from, treetool).then(function (cannot) {
    if (cannot) {
      alert("cannot paste from " + from + " to " + to);
    } else {
      // console.log('lets paste',from,"to",to)
      tree.mv_as_brother(from, to).then(function (_) {
        clipboard = null;
        PubSub.publish("TreeBrowser", { msg: "refresh" });
      });
    }
  });
}

var menu = function menu(node, tree, treetool) {
  return _react2.default.createElement(
    'div',
    { className: 'menu' },
    _react2.default.createElement(
      'button',
      { className: 'btn btn-default btn-xs',
        draggable: 'true', onDragStart: d.drag, onDragEnd: d.dragEnd
      },
      _react2.default.createElement('i', { className: 'fa fa-arrows' })
    ),
    _react2.default.createElement(
      'button',
      { className: 'btn btn-default btn-xs', onClick: function onClick() {
          clipboard = node._id;
        } },
      _react2.default.createElement('i', { className: 'fa fa-cut' })
    ),
    _react2.default.createElement(
      'button',
      { className: 'btn btn-default btn-xs', onClick: function onClick() {
          // console.log(clipboard)
          paste(clipboard, node._id, tree, treetool);
        } },
      _react2.default.createElement('i', { className: 'fa fa-paste' })
    ),
    _react2.default.createElement(
      'button',
      { className: 'btn btn-default btn-xs', onClick: function onClick() {
          var sure = confirm("are you sure?");
          // console.log(sure);
          if (sure) {
            tree.remove(node._id).then(function (_) {
              PubSub.publish("TreeBrowser", { msg: "refresh" });
            });
          }
        } },
      _react2.default.createElement('i', { className: 'fa fa-trash' })
    )
  );
};

var TreeBrowser = function TreeBrowser(props) {
  var node = props.node;

  var others = _objectWithoutProperties(props, ['node']);

  var render = props.render;
  var focus = props.focus;
  var expands = props.expands;
  var tree = props.tree;
  var level = props.level;
  var hideRoot = props.hideRoot;

  var treetool = require('treenote2/src/client/tool')(tree);
  var vnode = { _type: "vnode", _p: node._id };
  //test begin
  // if(node._id=='0'){
  //   console.log('TreeBrowser',node);
  // }
  //test end
  var isHideRoot = hideRoot && level === 1;
  return _react2.default.createElement(
    'div',
    { className: cx("node", { focus: focus === node._id }, { hideRoot: isHideRoot }), id: node._id,
      'data-level': level },
    isHideRoot ? null : _react2.default.createElement(
      'div',
      { className: 'main', onDrop: d.drop, onDragOver: d.dragover },
      render(node),
      menu(node, tree, treetool)
    ),
    !_.includes(expands, node._id) ? null : _react2.default.createElement(
      'div',
      { className: cx("children", { focus: _.includes(node._link.children, focus) }) },
      _react2.default.createElement(
        'div',
        { className: 'vnode' },
        _react2.default.createElement(
          'div',
          { className: 'main' },
          render(vnode)
        )
      ),
      node._children.map(function (node) {
        return _react2.default.createElement(TreeBrowser, _extends({ key: node._id, node: node }, others, { level: level + 1 }));
      })
    )
  );
};

var tree_browser = function (_React$Component) {
  _inherits(tree_browser, _React$Component);

  function tree_browser(props) {
    _classCallCheck(this, tree_browser);

    var _this = _possibleConstructorReturn(this, (tree_browser.__proto__ || Object.getPrototypeOf(tree_browser)).call(this, props));

    _this.state = props;
    var tree = props.tree;
    return _this;
  }

  _createClass(tree_browser, [{
    key: 'render',
    value: function render() {
      var _state = this.state;
      var root = _state.root;

      var others = _objectWithoutProperties(_state, ['root']);

      var _state2 = this.state;
      var focus = _state2.focus;
      var expands = _state2.expands;

      if (hasSlash(root) || hasSlash(root) || _.some(expands, hasSlash)) {
        return null; //如果有用路径表示的节点，需要转化为gid形式再显示
      }
      return _react2.default.createElement(_tree_node_reader2.default, _extends({ gid: root, view: TreeBrowser }, others, { level: 1 }));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var me = this;
      var _props = this.props;
      var node = _props.node;
      var tree = _props.tree;

      var treetool = require('treenote2/src/client/tool')(tree);

      //处理点击卡片后收到的消息
      function mysubscriber(target, data) {
        console.log('got', target, data);
        if (data.msg == 'focus') {
          //设置焦点
          var _focus = data.gid;
          var pgid = data.pgid;
          var expands = me.state.expands;

          expands = buildExpandsWithFocus(expands, _focus, pgid);
          me.setState({ focus: _focus, expands: expands });
        } else if (data.msg == 'refresh') {
          //刷新视图
          me.forceUpdate();
        } else if (data.msg == 'move') {
          //移动卡片
          paste(data.gid, data.bgid, tree, treetool);
        }
      }
      this.token = PubSub.subscribe("TreeBrowser", mysubscriber);

      //把路径转换为gid形式
      var _state3 = this.state;
      var root = _state3.root;
      var focus = _state3.focus;
      var expands = _state3.expands;

      var _path2gid = _.curry(path2gid)(treetool); //单参数函数fn(gidOrPath)
      var together = [root, focus].concat(_toConsumableArray(expands)); //合并一下方便处理
      Promise.all(together.map(_path2gid)).then(function (_ref) {
        var _ref2 = _toArray(_ref);

        var root = _ref2[0];
        var focus = _ref2[1];

        var expands = _ref2.slice(2);

        me.setState({ root: root, focus: focus, expands: expands });
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var focus = this.state.focus;

      d.scroll2card(focus);
      d.ensureFocusColumn(focus);
    }
  }]);

  return tree_browser;
}(_react2.default.Component);

exports.default = tree_browser;


var hasSlash = function hasSlash(str) {
  return str.indexOf('/') > -1;
};

function path2gid(treetool, gidOrPath) {
  return hasSlash(gidOrPath) ? treetool.createNodeByPath(gidOrPath).then(function (node) {
    return node._id;
  }) : Promise.resolve(gidOrPath); //有斜杠的视为路径，没有的视为gid直接返回
}

function buildExpandsWithFocus(expands, focus, pgid) {
  var idx = expands.indexOf(pgid);
  if (idx < 0) {
    return expands;
  } //没找到直接返回
  expands = expands.slice(0, idx + 1); //父节点之前
  expands.push(focus); //加入新的节点
  return expands;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFJLFFBQVMsWUFBVCxDQUFSO0FBQ0EsSUFBSSxJQUFFLFFBQVEsUUFBUixDQUFOO0FBQ0EsUUFBUSxxQkFBUjtBQUNBLElBQUksU0FBUSxRQUFTLFdBQVQsQ0FBWjtBQUNBLElBQUksSUFBRSxRQUFRLGlCQUFSLENBQU47QUFDQSxJQUFJLFNBQUosQyxDQUFjOzs7QUFJZCxTQUFTLFlBQVQsQ0FBc0IsTUFBdEIsRUFBNkIsTUFBN0IsRUFBb0MsUUFBcEMsRUFBNkM7QUFBRTtBQUM3QyxTQUFPLFNBQVMsWUFBVCxDQUFzQixDQUFDLE1BQUQsQ0FBdEIsRUFBK0IsTUFBL0IsRUFBdUMsSUFBdkMsQ0FBNEMsa0JBQVE7QUFDekQsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFmLElBQXVCLENBQUMsQ0FBL0I7QUFDRCxHQUZNLENBQVA7QUFHRDs7QUFFRCxTQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQW9CLEVBQXBCLEVBQXVCLElBQXZCLEVBQTRCLFFBQTVCLEVBQXFDO0FBQ25DLGVBQWEsRUFBYixFQUFnQixJQUFoQixFQUFxQixRQUFyQixFQUErQixJQUEvQixDQUFvQyxrQkFBUTtBQUMxQyxRQUFHLE1BQUgsRUFBVTtBQUNSLFlBQU0sdUJBQXNCLElBQXRCLEdBQTJCLE1BQTNCLEdBQWtDLEVBQXhDO0FBQ0QsS0FGRCxNQUVLO0FBQ0g7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBd0IsRUFBeEIsRUFBNEIsSUFBNUIsQ0FBaUMsYUFBRztBQUNsQyxvQkFBVSxJQUFWO0FBQ0EsZUFBTyxPQUFQLENBQWUsYUFBZixFQUE2QixFQUFDLEtBQUksU0FBTCxFQUE3QjtBQUNELE9BSEQ7QUFJRDtBQUNGLEdBVkQ7QUFXRDs7QUFFRCxJQUFNLE9BQUssU0FBTCxJQUFLLENBQUMsSUFBRCxFQUFNLElBQU4sRUFBVyxRQUFYLEVBQXNCO0FBQzdCLFNBQU87QUFBQTtBQUFBLE1BQUssV0FBVSxNQUFmO0FBQ0c7QUFBQTtBQUFBLFFBQVEsV0FBVSx3QkFBbEI7QUFDQSxtQkFBVSxNQURWLEVBQ2lCLGFBQWEsRUFBRSxJQURoQyxFQUNzQyxXQUFXLEVBQUU7QUFEbkQ7QUFHRSwyQ0FBRyxXQUFVLGNBQWI7QUFIRixLQURIO0FBTUc7QUFBQTtBQUFBLFFBQVEsV0FBVSx3QkFBbEIsRUFBMkMsU0FBUyxtQkFBSTtBQUN0RCxzQkFBVSxLQUFLLEdBQWY7QUFDRCxTQUZEO0FBRUcsMkNBQUcsV0FBVSxXQUFiO0FBRkgsS0FOSDtBQVNHO0FBQUE7QUFBQSxRQUFRLFdBQVUsd0JBQWxCLEVBQTRDLFNBQVMsbUJBQUk7QUFDdkQ7QUFDQSxnQkFBTSxTQUFOLEVBQWdCLEtBQUssR0FBckIsRUFBeUIsSUFBekIsRUFBOEIsUUFBOUI7QUFDRCxTQUhEO0FBR0csMkNBQUcsV0FBVSxhQUFiO0FBSEgsS0FUSDtBQWFHO0FBQUE7QUFBQSxRQUFRLFdBQVUsd0JBQWxCLEVBQTRDLFNBQVMsbUJBQUk7QUFDdkQsY0FBSSxPQUFLLFFBQVEsZUFBUixDQUFUO0FBQ0E7QUFDQSxjQUFHLElBQUgsRUFBUTtBQUNOLGlCQUFLLE1BQUwsQ0FBWSxLQUFLLEdBQWpCLEVBQXNCLElBQXRCLENBQTJCLGFBQUc7QUFDNUIscUJBQU8sT0FBUCxDQUFlLGFBQWYsRUFBNkIsRUFBQyxLQUFJLFNBQUwsRUFBN0I7QUFDRCxhQUZEO0FBR0Q7QUFDRixTQVJEO0FBUUcsMkNBQUcsV0FBVSxhQUFiO0FBUkg7QUFiSCxHQUFQO0FBdUJILENBeEJEOztBQTBCQSxJQUFNLGNBQVksU0FBWixXQUFZLENBQUMsS0FBRCxFQUFTO0FBQUEsTUFDaEIsSUFEZ0IsR0FDQSxLQURBLENBQ2hCLElBRGdCOztBQUFBLE1BQ1IsTUFEUSw0QkFDQSxLQURBOztBQUFBLE1BRWhCLE1BRmdCLEdBRTBCLEtBRjFCLENBRWhCLE1BRmdCO0FBQUEsTUFFVCxLQUZTLEdBRTBCLEtBRjFCLENBRVQsS0FGUztBQUFBLE1BRUgsT0FGRyxHQUUwQixLQUYxQixDQUVILE9BRkc7QUFBQSxNQUVLLElBRkwsR0FFMEIsS0FGMUIsQ0FFSyxJQUZMO0FBQUEsTUFFVSxLQUZWLEdBRTBCLEtBRjFCLENBRVUsS0FGVjtBQUFBLE1BRWdCLFFBRmhCLEdBRTBCLEtBRjFCLENBRWdCLFFBRmhCOztBQUd2QixNQUFNLFdBQVMsUUFBUSwyQkFBUixFQUFxQyxJQUFyQyxDQUFmO0FBQ0EsTUFBTSxRQUFNLEVBQUMsT0FBTSxPQUFQLEVBQWUsSUFBRyxLQUFLLEdBQXZCLEVBQVo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSSxhQUFXLFlBQVUsVUFBUSxDQUFqQztBQUNBLFNBQ0k7QUFBQTtBQUFBLE1BQUssV0FBVyxHQUFHLE1BQUgsRUFBVSxFQUFDLE9BQU0sVUFBUSxLQUFLLEdBQXBCLEVBQVYsRUFBbUMsRUFBQyxVQUFTLFVBQVYsRUFBbkMsQ0FBaEIsRUFBMkUsSUFBSSxLQUFLLEdBQXBGO0FBQ0Esb0JBQVksS0FEWjtBQUVDLGlCQUFXLElBQVgsR0FBZ0I7QUFBQTtBQUFBLFFBQUssV0FBVSxNQUFmLEVBQXNCLFFBQVEsRUFBRSxJQUFoQyxFQUFzQyxZQUFZLEVBQUUsUUFBcEQ7QUFDWixhQUFPLElBQVAsQ0FEWTtBQUVaLFdBQUssSUFBTCxFQUFVLElBQVYsRUFBZSxRQUFmO0FBRlksS0FGakI7QUFPRyxLQUFDLEVBQUUsUUFBRixDQUFXLE9BQVgsRUFBbUIsS0FBSyxHQUF4QixDQUFELEdBQThCLElBQTlCLEdBQW1DO0FBQUE7QUFBQSxRQUFLLFdBQVcsR0FBRyxVQUFILEVBQWMsRUFBQyxPQUFNLEVBQUUsUUFBRixDQUFXLEtBQUssS0FBTCxDQUFXLFFBQXRCLEVBQWdDLEtBQWhDLENBQVAsRUFBZCxDQUFoQjtBQUNwQztBQUFBO0FBQUEsVUFBSyxXQUFVLE9BQWY7QUFDRTtBQUFBO0FBQUEsWUFBTSxXQUFVLE1BQWhCO0FBQ0MsaUJBQU8sS0FBUDtBQUREO0FBREYsT0FEb0M7QUFNbkMsV0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQjtBQUFBLGVBQU0sOEJBQUMsV0FBRCxhQUFhLEtBQUssS0FBSyxHQUF2QixFQUE0QixNQUFNLElBQWxDLElBQTRDLE1BQTVDLElBQW9ELE9BQU8sUUFBTSxDQUFqRSxJQUFOO0FBQUEsT0FBbkI7QUFObUM7QUFQdEMsR0FESjtBQW1CSCxDQTlCRDs7SUFpQ3FCLFk7OztBQUNuQix3QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsNEhBQ1gsS0FEVzs7QUFFakIsVUFBSyxLQUFMLEdBQVcsS0FBWDtBQUZpQixRQUdWLElBSFUsR0FHSixLQUhJLENBR1YsSUFIVTtBQUFBO0FBSWxCOzs7OzZCQUNRO0FBQUEsbUJBQ2EsS0FBSyxLQURsQjtBQUFBLFVBQ0gsSUFERyxVQUNILElBREc7O0FBQUEsVUFDSyxNQURMOztBQUFBLG9CQUVhLEtBQUssS0FGbEI7QUFBQSxVQUVGLEtBRkUsV0FFRixLQUZFO0FBQUEsVUFFSSxPQUZKLFdBRUksT0FGSjs7QUFHUCxVQUFHLFNBQVMsSUFBVCxLQUFnQixTQUFTLElBQVQsQ0FBaEIsSUFBZ0MsRUFBRSxJQUFGLENBQU8sT0FBUCxFQUFnQixRQUFoQixDQUFuQyxFQUE2RDtBQUMzRCxlQUFPLElBQVAsQ0FEMkQsQ0FDL0M7QUFDYjtBQUNGLGFBQU8scUVBQWdCLEtBQUssSUFBckIsRUFBNEIsTUFBTSxXQUFsQyxJQUFvRCxNQUFwRCxJQUE0RCxPQUFPLENBQW5FLElBQVA7QUFDQTs7O3dDQUNtQjtBQUNsQixVQUFNLEtBQUcsSUFBVDtBQURrQixtQkFFQSxLQUFLLEtBRkw7QUFBQSxVQUVYLElBRlcsVUFFWCxJQUZXO0FBQUEsVUFFTixJQUZNLFVBRU4sSUFGTTs7QUFHbEIsVUFBTSxXQUFTLFFBQVEsMkJBQVIsRUFBcUMsSUFBckMsQ0FBZjs7QUFFQTtBQUNBLGVBQVMsWUFBVCxDQUFzQixNQUF0QixFQUE2QixJQUE3QixFQUFrQztBQUNqQyxnQkFBUSxHQUFSLENBQVksS0FBWixFQUFrQixNQUFsQixFQUF5QixJQUF6QjtBQUNBLFlBQUcsS0FBSyxHQUFMLElBQVUsT0FBYixFQUFxQjtBQUFFO0FBQ3JCLGNBQU0sU0FBTSxLQUFLLEdBQWpCO0FBQ0EsY0FBTSxPQUFLLEtBQUssSUFBaEI7QUFGbUIsY0FHZCxPQUhjLEdBR0wsR0FBRyxLQUhFLENBR2QsT0FIYzs7QUFJbkIsb0JBQVEsc0JBQXNCLE9BQXRCLEVBQThCLE1BQTlCLEVBQW9DLElBQXBDLENBQVI7QUFDQSxhQUFHLFFBQUgsQ0FBWSxFQUFDLGFBQUQsRUFBTyxnQkFBUCxFQUFaO0FBQ0QsU0FORCxNQU1NLElBQUcsS0FBSyxHQUFMLElBQVUsU0FBYixFQUF1QjtBQUFFO0FBQzlCLGFBQUcsV0FBSDtBQUNBLFNBRkssTUFFQSxJQUFHLEtBQUssR0FBTCxJQUFVLE1BQWIsRUFBb0I7QUFBRTtBQUMzQixnQkFBTSxLQUFLLEdBQVgsRUFBZSxLQUFLLElBQXBCLEVBQXlCLElBQXpCLEVBQThCLFFBQTlCO0FBQ0E7QUFDRDtBQUNELFdBQUssS0FBTCxHQUFXLE9BQU8sU0FBUCxDQUFpQixhQUFqQixFQUErQixZQUEvQixDQUFYOztBQUVBO0FBdEJrQixvQkF1Qk8sS0FBSyxLQXZCWjtBQUFBLFVBdUJiLElBdkJhLFdBdUJiLElBdkJhO0FBQUEsVUF1QlIsS0F2QlEsV0F1QlIsS0F2QlE7QUFBQSxVQXVCRixPQXZCRSxXQXVCRixPQXZCRTs7QUF3QmxCLFVBQU0sWUFBVSxFQUFFLEtBQUYsQ0FBUSxRQUFSLEVBQWtCLFFBQWxCLENBQWhCLENBeEJrQixDQXdCMEI7QUFDNUMsVUFBTSxZQUFVLElBQVYsRUFBZSxLQUFmLDRCQUF3QixPQUF4QixFQUFOLENBekJrQixDQXlCcUI7QUFDdkMsY0FBUSxHQUFSLENBQVksU0FBUyxHQUFULENBQWEsU0FBYixDQUFaLEVBQXFDLElBQXJDLENBQTBDLGdCQUEyQjtBQUFBOztBQUFBLFlBQXpCLElBQXlCO0FBQUEsWUFBcEIsS0FBb0I7O0FBQUEsWUFBWCxPQUFXOztBQUNuRSxXQUFHLFFBQUgsQ0FBWSxFQUFDLFVBQUQsRUFBTSxZQUFOLEVBQVksZ0JBQVosRUFBWjtBQUNELE9BRkQ7QUFJRDs7O3VDQUNrQixTLEVBQVcsUyxFQUFXO0FBQUEsVUFDaEMsS0FEZ0MsR0FDekIsS0FBSyxLQURvQixDQUNoQyxLQURnQzs7QUFFdkMsUUFBRSxXQUFGLENBQWMsS0FBZDtBQUNBLFFBQUUsaUJBQUYsQ0FBb0IsS0FBcEI7QUFDRDs7OztFQWpEdUMsZ0JBQU0sUzs7a0JBQTNCLFk7OztBQW9EckIsSUFBTSxXQUFTLFNBQVQsUUFBUyxDQUFDLEdBQUQ7QUFBQSxTQUFPLElBQUksT0FBSixDQUFZLEdBQVosSUFBaUIsQ0FBQyxDQUF6QjtBQUFBLENBQWY7O0FBRUEsU0FBUyxRQUFULENBQWtCLFFBQWxCLEVBQTJCLFNBQTNCLEVBQXFDO0FBQ25DLFNBQU8sU0FBUyxTQUFULElBQW9CLFNBQVMsZ0JBQVQsQ0FBMEIsU0FBMUIsRUFBcUMsSUFBckMsQ0FBMEM7QUFBQSxXQUFNLEtBQUssR0FBWDtBQUFBLEdBQTFDLENBQXBCLEdBQThFLFFBQVEsT0FBUixDQUFnQixTQUFoQixDQUFyRixDQURtQyxDQUM2RTtBQUNqSDs7QUFFRCxTQUFTLHFCQUFULENBQStCLE9BQS9CLEVBQXVDLEtBQXZDLEVBQTZDLElBQTdDLEVBQW1EO0FBQ2pELE1BQUksTUFBSSxRQUFRLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBUjtBQUNBLE1BQUcsTUFBSSxDQUFQLEVBQVM7QUFBQyxXQUFPLE9BQVA7QUFBZ0IsR0FGdUIsQ0FFdkI7QUFDMUIsWUFBUSxRQUFRLEtBQVIsQ0FBYyxDQUFkLEVBQWdCLE1BQUksQ0FBcEIsQ0FBUixDQUhpRCxDQUdsQjtBQUMvQixVQUFRLElBQVIsQ0FBYSxLQUFiLEVBSmlELENBSTdCO0FBQ3BCLFNBQU8sT0FBUDtBQUNEIiwiZmlsZSI6InRyZWVfYnJvd3Nlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBUcmVlTm9kZVJlYWRlciBmcm9tICd0cmVlbm90ZTIvc3JjL2NsaWVudC91aS90cmVlX25vZGVfcmVhZGVyJztcclxudmFyIGN4ID1yZXF1aXJlIChcImNsYXNzbmFtZXNcIik7XHJcbnZhciBfPXJlcXVpcmUoXCJsb2Rhc2hcIik7XHJcbnJlcXVpcmUoJy4vdHJlZV9icm93c2VyLmxlc3MnKTtcclxudmFyIFB1YlN1YiA9cmVxdWlyZSAoXCJwdWJzdWItanNcIik7XHJcbnZhciBkPXJlcXVpcmUoJy4vZG9tX29wZXJhdGlvbicpO1xyXG52YXIgY2xpcGJvYXJkOy8v5Ymq6LS05p2/77yM55So5LqO5a2Y5pS+5b2T5YmN5Ymq5YiH55qEbm9kZSBpZFxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBpc0Rlc2NlbmRhbnQodGFyZ2V0LHNvdXJjZSx0cmVldG9vbCl7IC8vY2hlY2sgd2hldGhlciB0YXJnZXQgaXMgIGRlc2NlbmRhbnQgb2Ygc291cmNlXHJcbiAgcmV0dXJuIHRyZWV0b29sLmV4cGFuZFRvUm9vdChbdGFyZ2V0XSxzb3VyY2UpLnRoZW4oaWRwYXRoPT57XHJcbiAgICByZXR1cm4gaWRwYXRoLmluZGV4T2Yoc291cmNlKT4tMTtcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXN0ZShmcm9tLHRvLHRyZWUsdHJlZXRvb2wpe1xyXG4gIGlzRGVzY2VuZGFudCh0byxmcm9tLHRyZWV0b29sKS50aGVuKGNhbm5vdD0+e1xyXG4gICAgaWYoY2Fubm90KXtcclxuICAgICAgYWxlcnQoXCJjYW5ub3QgcGFzdGUgZnJvbSBcIiArZnJvbStcIiB0byBcIit0bylcclxuICAgIH1lbHNle1xyXG4gICAgICAvLyBjb25zb2xlLmxvZygnbGV0cyBwYXN0ZScsZnJvbSxcInRvXCIsdG8pXHJcbiAgICAgIHRyZWUubXZfYXNfYnJvdGhlcihmcm9tLHRvKS50aGVuKF89PntcclxuICAgICAgICBjbGlwYm9hcmQ9bnVsbDtcclxuICAgICAgICBQdWJTdWIucHVibGlzaChcIlRyZWVCcm93c2VyXCIse21zZzpcInJlZnJlc2hcIn0pO1xyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuXHJcbmNvbnN0IG1lbnU9KG5vZGUsdHJlZSx0cmVldG9vbCk9PntcclxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm1lbnVcIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIlxyXG4gICAgICAgICAgICAgIGRyYWdnYWJsZT1cInRydWVcIiBvbkRyYWdTdGFydD17ZC5kcmFnfSBvbkRyYWdFbmQ9e2QuZHJhZ0VuZH1cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1hcnJvd3NcIj48L2k+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCIgb25DbGljaz17KCk9PntcclxuICAgICAgICAgICAgICAgIGNsaXBib2FyZD1ub2RlLl9pZDtcclxuICAgICAgICAgICAgICB9fT48aSBjbGFzc05hbWU9XCJmYSBmYS1jdXRcIj48L2k+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCIgIG9uQ2xpY2s9eygpPT57XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhjbGlwYm9hcmQpXHJcbiAgICAgICAgICAgICAgICBwYXN0ZShjbGlwYm9hcmQsbm9kZS5faWQsdHJlZSx0cmVldG9vbCk7XHJcbiAgICAgICAgICAgICAgfX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtcGFzdGVcIj48L2k+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCIgIG9uQ2xpY2s9eygpPT57XHJcbiAgICAgICAgICAgICAgICB2YXIgc3VyZT1jb25maXJtKFwiYXJlIHlvdSBzdXJlP1wiKVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc3VyZSk7XHJcbiAgICAgICAgICAgICAgICBpZihzdXJlKXtcclxuICAgICAgICAgICAgICAgICAgdHJlZS5yZW1vdmUobm9kZS5faWQpLnRoZW4oXz0+e1xyXG4gICAgICAgICAgICAgICAgICAgIFB1YlN1Yi5wdWJsaXNoKFwiVHJlZUJyb3dzZXJcIix7bXNnOlwicmVmcmVzaFwifSk7XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtdHJhc2hcIj48L2k+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG59XHJcblxyXG5jb25zdCBUcmVlQnJvd3Nlcj0ocHJvcHMpPT57XHJcbiAgICBjb25zdCB7bm9kZSwuLi5vdGhlcnN9PXByb3BzO1xyXG4gICAgY29uc3Qge3JlbmRlcixmb2N1cyxleHBhbmRzLHRyZWUsbGV2ZWwsaGlkZVJvb3R9PXByb3BzO1xyXG4gICAgY29uc3QgdHJlZXRvb2w9cmVxdWlyZSgndHJlZW5vdGUyL3NyYy9jbGllbnQvdG9vbCcpKHRyZWUpO1xyXG4gICAgY29uc3Qgdm5vZGU9e190eXBlOlwidm5vZGVcIixfcDpub2RlLl9pZH1cclxuICAgIC8vdGVzdCBiZWdpblxyXG4gICAgLy8gaWYobm9kZS5faWQ9PScwJyl7XHJcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdUcmVlQnJvd3Nlcicsbm9kZSk7XHJcbiAgICAvLyB9XHJcbiAgICAvL3Rlc3QgZW5kXHJcbiAgICB2YXIgaXNIaWRlUm9vdD1oaWRlUm9vdCYmbGV2ZWw9PT0xO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y3goXCJub2RlXCIse2ZvY3VzOmZvY3VzPT09bm9kZS5faWR9LHtoaWRlUm9vdDppc0hpZGVSb290fSl9IGlkPXtub2RlLl9pZH1cclxuICAgICAgICBkYXRhLWxldmVsPXtsZXZlbH0+XHJcbiAgICAgICAge2lzSGlkZVJvb3Q/bnVsbDo8ZGl2IGNsYXNzTmFtZT1cIm1haW5cIiBvbkRyb3A9e2QuZHJvcH0gb25EcmFnT3Zlcj17ZC5kcmFnb3Zlcn0+XHJcbiAgICAgICAgICAgIHtyZW5kZXIobm9kZSl9XHJcbiAgICAgICAgICAgIHttZW51KG5vZGUsdHJlZSx0cmVldG9vbCl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICB9XHJcbiAgICAgICAgICB7IV8uaW5jbHVkZXMoZXhwYW5kcyxub2RlLl9pZCk/bnVsbDo8ZGl2IGNsYXNzTmFtZT17Y3goXCJjaGlsZHJlblwiLHtmb2N1czpfLmluY2x1ZGVzKG5vZGUuX2xpbmsuY2hpbGRyZW4sIGZvY3VzKX0pfT5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidm5vZGVcIiA+XHJcbiAgICAgICAgICAgIDxkaXYgIGNsYXNzTmFtZT1cIm1haW5cIj5cclxuICAgICAgICAgICAge3JlbmRlcih2bm9kZSl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7bm9kZS5fY2hpbGRyZW4ubWFwKG5vZGU9PjxUcmVlQnJvd3NlciBrZXk9e25vZGUuX2lkfSBub2RlPXtub2RlfSB7Li4ub3RoZXJzfSBsZXZlbD17bGV2ZWwrMX0vPil9XHJcbiAgICAgICAgICA8L2Rpdj59XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgXHJcbiAgICApO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgdHJlZV9icm93c2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gICAgdGhpcy5zdGF0ZT1wcm9wcztcclxuICAgIGNvbnN0IHt0cmVlfT1wcm9wcztcclxuICB9XHJcbiAgcmVuZGVyKCkge1xyXG4gIFx0dmFyIHtyb290LC4uLm90aGVyc309dGhpcy5zdGF0ZTtcclxuICAgIHZhciB7Zm9jdXMsZXhwYW5kc309dGhpcy5zdGF0ZTtcclxuICAgIGlmKGhhc1NsYXNoKHJvb3QpfHxoYXNTbGFzaChyb290KXx8Xy5zb21lKGV4cGFuZHMsIGhhc1NsYXNoKSl7IFxyXG4gICAgICByZXR1cm4gbnVsbDsvL+WmguaenOacieeUqOi3r+W+hOihqOekuueahOiKgueCue+8jOmcgOimgei9rOWMluS4umdpZOW9ouW8j+WGjeaYvuekulxyXG4gICAgfVxyXG4gIFx0cmV0dXJuIDxUcmVlTm9kZVJlYWRlciBnaWQ9e3Jvb3R9ICB2aWV3PXtUcmVlQnJvd3Nlcn0gIHsuLi5vdGhlcnN9IGxldmVsPXsxfS8+XHJcbiAgfVxyXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gICAgY29uc3QgbWU9dGhpcztcclxuICAgIGNvbnN0IHtub2RlLHRyZWV9PXRoaXMucHJvcHM7XHJcbiAgICBjb25zdCB0cmVldG9vbD1yZXF1aXJlKCd0cmVlbm90ZTIvc3JjL2NsaWVudC90b29sJykodHJlZSk7XHJcblxyXG4gICAgLy/lpITnkIbngrnlh7vljaHniYflkI7mlLbliLDnmoTmtojmga9cclxuICAgIGZ1bmN0aW9uIG15c3Vic2NyaWJlcih0YXJnZXQsZGF0YSl7XHJcbiAgICAgY29uc29sZS5sb2coJ2dvdCcsdGFyZ2V0LGRhdGEpO1xyXG4gICAgIGlmKGRhdGEubXNnPT0nZm9jdXMnKXsgLy/orr7nva7nhKbngrlcclxuICAgICAgIGNvbnN0IGZvY3VzPWRhdGEuZ2lkO1xyXG4gICAgICAgY29uc3QgcGdpZD1kYXRhLnBnaWQ7XHJcbiAgICAgICB2YXIge2V4cGFuZHN9PW1lLnN0YXRlO1xyXG4gICAgICAgZXhwYW5kcz1idWlsZEV4cGFuZHNXaXRoRm9jdXMoZXhwYW5kcyxmb2N1cyxwZ2lkKTtcclxuICAgICAgIG1lLnNldFN0YXRlKHtmb2N1cyxleHBhbmRzfSk7XHJcbiAgICAgfWVsc2UgaWYoZGF0YS5tc2c9PSdyZWZyZXNoJyl7IC8v5Yi35paw6KeG5Zu+XHJcbiAgICAgIG1lLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgfWVsc2UgaWYoZGF0YS5tc2c9PSdtb3ZlJyl7IC8v56e75Yqo5Y2h54mHXHJcbiAgICAgIHBhc3RlKGRhdGEuZ2lkLGRhdGEuYmdpZCx0cmVlLHRyZWV0b29sKTtcclxuICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnRva2VuPVB1YlN1Yi5zdWJzY3JpYmUoXCJUcmVlQnJvd3NlclwiLG15c3Vic2NyaWJlcilcclxuXHJcbiAgICAvL+aKiui3r+W+hOi9rOaNouS4umdpZOW9ouW8j1xyXG4gICAgdmFyIHtyb290LGZvY3VzLGV4cGFuZHN9PXRoaXMuc3RhdGU7XHJcbiAgICBjb25zdCBfcGF0aDJnaWQ9Xy5jdXJyeShwYXRoMmdpZCkodHJlZXRvb2wpOy8v5Y2V5Y+C5pWw5Ye95pWwZm4oZ2lkT3JQYXRoKVxyXG4gICAgY29uc3QgdG9nZXRoZXI9W3Jvb3QsZm9jdXMsLi4uZXhwYW5kc107Ly/lkIjlubbkuIDkuIvmlrnkvr/lpITnkIZcclxuICAgIFByb21pc2UuYWxsKHRvZ2V0aGVyLm1hcChfcGF0aDJnaWQpKS50aGVuKChbcm9vdCxmb2N1cywuLi5leHBhbmRzXSk9PntcclxuICAgICAgbWUuc2V0U3RhdGUoe3Jvb3QsZm9jdXMsZXhwYW5kc30pO1xyXG4gICAgfSlcclxuXHJcbiAgfVxyXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xyXG4gICAgY29uc3Qge2ZvY3VzfT10aGlzLnN0YXRlO1xyXG4gICAgZC5zY3JvbGwyY2FyZChmb2N1cyk7XHJcbiAgICBkLmVuc3VyZUZvY3VzQ29sdW1uKGZvY3VzKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IGhhc1NsYXNoPShzdHIpPT5zdHIuaW5kZXhPZignLycpPi0xO1xyXG5cclxuZnVuY3Rpb24gcGF0aDJnaWQodHJlZXRvb2wsZ2lkT3JQYXRoKXtcclxuICByZXR1cm4gaGFzU2xhc2goZ2lkT3JQYXRoKT90cmVldG9vbC5jcmVhdGVOb2RlQnlQYXRoKGdpZE9yUGF0aCkudGhlbihub2RlPT5ub2RlLl9pZCk6UHJvbWlzZS5yZXNvbHZlKGdpZE9yUGF0aCk7Ly/mnInmlpzmnaDnmoTop4bkuLrot6/lvoTvvIzmsqHmnInnmoTop4bkuLpnaWTnm7TmjqXov5Tlm55cclxufVxyXG5cclxuZnVuY3Rpb24gYnVpbGRFeHBhbmRzV2l0aEZvY3VzKGV4cGFuZHMsZm9jdXMscGdpZCkge1xyXG4gIHZhciBpZHg9ZXhwYW5kcy5pbmRleE9mKHBnaWQpO1xyXG4gIGlmKGlkeDwwKXtyZXR1cm4gZXhwYW5kczt9Ly/msqHmib7liLDnm7TmjqXov5Tlm55cclxuICBleHBhbmRzPWV4cGFuZHMuc2xpY2UoMCxpZHgrMSk7Ly/niLboioLngrnkuYvliY1cclxuICBleHBhbmRzLnB1c2goZm9jdXMpOy8v5Yqg5YWl5paw55qE6IqC54K5XHJcbiAgcmV0dXJuIGV4cGFuZHM7XHJcbn0iXX0=