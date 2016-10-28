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
  var isHideRoot = hideRoot && level === 1; //隐藏第一列
  var focusLevel = 0;
  if (level === 1) {
    focusLevel = treetool.findLevel(node, focus);
    console.log("focusLevel", focusLevel);
  } else {
    focusLevel = props.focusLevel;
  }
  var levelDiff = level - focusLevel; //当前级别与焦点级别的距离
  var isFocus = focus === node._id;
  return _react2.default.createElement(
    'div',
    { className: cx("node", { focus: isFocus }, { hideRoot: isHideRoot }), id: node._id,
      'data-level': level },
    isHideRoot ? null : _react2.default.createElement(
      'div',
      { className: 'main', onDrop: d.drop, onDragOver: d.dragover },
      render(node, { levelDiff: levelDiff, isFocus: isFocus }),
      menu(node, tree, treetool)
    ),
    !_.includes(expands, node._id) ? null : _react2.default.createElement(
      'div',
      { className: cx("children", "focus" + levelDiff) },
      _react2.default.createElement(
        'div',
        { className: 'vnode' },
        _react2.default.createElement(
          'div',
          { className: 'main' },
          render(vnode, { levelDiff: levelDiff })
        )
      ),
      node._children.map(function (node) {
        return _react2.default.createElement(TreeBrowser, _extends({ key: node._id, node: node }, others, { level: level + 1, focusLevel: focusLevel }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFJLFFBQVMsWUFBVCxDQUFSO0FBQ0EsSUFBSSxJQUFFLFFBQVEsUUFBUixDQUFOO0FBQ0EsUUFBUSxxQkFBUjtBQUNBLElBQUksU0FBUSxRQUFTLFdBQVQsQ0FBWjtBQUNBLElBQUksSUFBRSxRQUFRLGlCQUFSLENBQU47QUFDQSxJQUFJLFNBQUosQyxDQUFjOzs7QUFJZCxTQUFTLFlBQVQsQ0FBc0IsTUFBdEIsRUFBNkIsTUFBN0IsRUFBb0MsUUFBcEMsRUFBNkM7QUFBRTtBQUM3QyxTQUFPLFNBQVMsWUFBVCxDQUFzQixDQUFDLE1BQUQsQ0FBdEIsRUFBK0IsTUFBL0IsRUFBdUMsSUFBdkMsQ0FBNEMsa0JBQVE7QUFDekQsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFmLElBQXVCLENBQUMsQ0FBL0I7QUFDRCxHQUZNLENBQVA7QUFHRDs7QUFFRCxTQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQW9CLEVBQXBCLEVBQXVCLElBQXZCLEVBQTRCLFFBQTVCLEVBQXFDO0FBQ25DLGVBQWEsRUFBYixFQUFnQixJQUFoQixFQUFxQixRQUFyQixFQUErQixJQUEvQixDQUFvQyxrQkFBUTtBQUMxQyxRQUFHLE1BQUgsRUFBVTtBQUNSLFlBQU0sdUJBQXNCLElBQXRCLEdBQTJCLE1BQTNCLEdBQWtDLEVBQXhDO0FBQ0QsS0FGRCxNQUVLO0FBQ0g7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBd0IsRUFBeEIsRUFBNEIsSUFBNUIsQ0FBaUMsYUFBRztBQUNsQyxvQkFBVSxJQUFWO0FBQ0EsZUFBTyxPQUFQLENBQWUsYUFBZixFQUE2QixFQUFDLEtBQUksU0FBTCxFQUE3QjtBQUNELE9BSEQ7QUFJRDtBQUNGLEdBVkQ7QUFXRDs7QUFF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QUFDQSxNQUFHLE1BQUksQ0FBUCxFQUFTO0FBQUMsV0FBTyxPQUFQO0FBQWdCLEdBRnVCLENBRXZCO0FBQzFCLFlBQVEsUUFBUSxLQUFSLENBQWMsQ0FBZCxFQUFnQixNQUFJLENBQXBCLENBQVIsQ0FIaUQsQ0FHbEI7QUFDL0IsVUFBUSxJQUFSLENBQWEsS0FBYixFQUppRCxDQUk3QjtBQUNwQixTQUFPLE9BQVA7QUFDRCIsImZpbGUiOiJ0cmVlX2Jyb3dzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgVHJlZU5vZGVSZWFkZXIgZnJvbSAndHJlZW5vdGUyL3NyYy9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlcic7XHJcbnZhciBjeCA9cmVxdWlyZSAoXCJjbGFzc25hbWVzXCIpO1xyXG52YXIgXz1yZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5yZXF1aXJlKCcuL3RyZWVfYnJvd3Nlci5sZXNzJyk7XHJcbnZhciBQdWJTdWIgPXJlcXVpcmUgKFwicHVic3ViLWpzXCIpO1xyXG52YXIgZD1yZXF1aXJlKCcuL2RvbV9vcGVyYXRpb24nKTtcclxudmFyIGNsaXBib2FyZDsvL+WJqui0tOadv++8jOeUqOS6juWtmOaUvuW9k+WJjeWJquWIh+eahG5vZGUgaWRcclxuXHJcblxyXG5cclxuZnVuY3Rpb24gaXNEZXNjZW5kYW50KHRhcmdldCxzb3VyY2UsdHJlZXRvb2wpeyAvL2NoZWNrIHdoZXRoZXIgdGFyZ2V0IGlzICBkZXNjZW5kYW50IG9mIHNvdXJjZVxyXG4gIHJldHVybiB0cmVldG9vbC5leHBhbmRUb1Jvb3QoW3RhcmdldF0sc291cmNlKS50aGVuKGlkcGF0aD0+e1xyXG4gICAgcmV0dXJuIGlkcGF0aC5pbmRleE9mKHNvdXJjZSk+LTE7XHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gcGFzdGUoZnJvbSx0byx0cmVlLHRyZWV0b29sKXtcclxuICBpc0Rlc2NlbmRhbnQodG8sZnJvbSx0cmVldG9vbCkudGhlbihjYW5ub3Q9PntcclxuICAgIGlmKGNhbm5vdCl7XHJcbiAgICAgIGFsZXJ0KFwiY2Fubm90IHBhc3RlIGZyb20gXCIgK2Zyb20rXCIgdG8gXCIrdG8pXHJcbiAgICB9ZWxzZXtcclxuICAgICAgLy8gY29uc29sZS5sb2coJ2xldHMgcGFzdGUnLGZyb20sXCJ0b1wiLHRvKVxyXG4gICAgICB0cmVlLm12X2FzX2Jyb3RoZXIoZnJvbSx0bykudGhlbihfPT57XHJcbiAgICAgICAgY2xpcGJvYXJkPW51bGw7XHJcbiAgICAgICAgUHViU3ViLnB1Ymxpc2goXCJUcmVlQnJvd3NlclwiLHttc2c6XCJyZWZyZXNoXCJ9KTtcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9KVxyXG59XHJcblxyXG5jb25zdCBtZW51PShub2RlLHRyZWUsdHJlZXRvb2wpPT57XHJcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJtZW51XCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCJcclxuICAgICAgICAgICAgICBkcmFnZ2FibGU9XCJ0cnVlXCIgb25EcmFnU3RhcnQ9e2QuZHJhZ30gb25EcmFnRW5kPXtkLmRyYWdFbmR9XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtYXJyb3dzXCI+PC9pPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiIG9uQ2xpY2s9eygpPT57XHJcbiAgICAgICAgICAgICAgICBjbGlwYm9hcmQ9bm9kZS5faWQ7XHJcbiAgICAgICAgICAgICAgfX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtY3V0XCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY2xpcGJvYXJkKVxyXG4gICAgICAgICAgICAgICAgcGFzdGUoY2xpcGJvYXJkLG5vZGUuX2lkLHRyZWUsdHJlZXRvb2wpO1xyXG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXBhc3RlXCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgdmFyIHN1cmU9Y29uZmlybShcImFyZSB5b3Ugc3VyZT9cIilcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHN1cmUpO1xyXG4gICAgICAgICAgICAgICAgaWYoc3VyZSl7XHJcbiAgICAgICAgICAgICAgICAgIHRyZWUucmVtb3ZlKG5vZGUuX2lkKS50aGVuKF89PntcclxuICAgICAgICAgICAgICAgICAgICBQdWJTdWIucHVibGlzaChcIlRyZWVCcm93c2VyXCIse21zZzpcInJlZnJlc2hcIn0pO1xyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXRyYXNoXCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxufVxyXG5cclxuY29uc3QgVHJlZUJyb3dzZXI9KHByb3BzKT0+e1xyXG4gICAgY29uc3Qge25vZGUsLi4ub3RoZXJzfT1wcm9wcztcclxuICAgIGNvbnN0IHtyZW5kZXIsZm9jdXMsZXhwYW5kcyx0cmVlLGxldmVsLGhpZGVSb290fT1wcm9wcztcclxuICAgIGNvbnN0IHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcclxuICAgIGNvbnN0IHZub2RlPXtfdHlwZTpcInZub2RlXCIsX3A6bm9kZS5faWR9XHJcbiAgICAvL3Rlc3QgYmVnaW5cclxuICAgIC8vIGlmKG5vZGUuX2lkPT0nMCcpe1xyXG4gICAgLy8gICBjb25zb2xlLmxvZygnVHJlZUJyb3dzZXInLG5vZGUpO1xyXG4gICAgLy8gfVxyXG4gICAgLy90ZXN0IGVuZFxyXG4gICAgdmFyIGlzSGlkZVJvb3Q9aGlkZVJvb3QmJmxldmVsPT09MTsvL+makOiXj+esrOS4gOWIl1xyXG4gICAgdmFyIGZvY3VzTGV2ZWw9MDtcclxuICAgIGlmKGxldmVsPT09MSl7XHJcbiAgICAgIGZvY3VzTGV2ZWw9dHJlZXRvb2wuZmluZExldmVsKG5vZGUsZm9jdXMpO1xyXG4gICAgICBjb25zb2xlLmxvZyhcImZvY3VzTGV2ZWxcIixmb2N1c0xldmVsKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBmb2N1c0xldmVsPXByb3BzLmZvY3VzTGV2ZWw7XHJcbiAgICB9XHJcbiAgICBjb25zdCBsZXZlbERpZmY9bGV2ZWwtZm9jdXNMZXZlbDsvL+W9k+WJjee6p+WIq+S4jueEpueCuee6p+WIq+eahOi3neemu1xyXG4gICAgY29uc3QgaXNGb2N1cz0oZm9jdXM9PT1ub2RlLl9pZCk7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeChcIm5vZGVcIix7Zm9jdXM6aXNGb2N1c30se2hpZGVSb290OmlzSGlkZVJvb3R9KX0gaWQ9e25vZGUuX2lkfVxyXG4gICAgICAgIGRhdGEtbGV2ZWw9e2xldmVsfT5cclxuICAgICAgICB7aXNIaWRlUm9vdD9udWxsOjxkaXYgY2xhc3NOYW1lPVwibWFpblwiIG9uRHJvcD17ZC5kcm9wfSBvbkRyYWdPdmVyPXtkLmRyYWdvdmVyfT5cclxuICAgICAgICAgICAge3JlbmRlcihub2RlLHtsZXZlbERpZmYsaXNGb2N1c30pfVxyXG4gICAgICAgICAgICB7bWVudShub2RlLHRyZWUsdHJlZXRvb2wpfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgeyFfLmluY2x1ZGVzKGV4cGFuZHMsbm9kZS5faWQpP251bGw6PGRpdiBjbGFzc05hbWU9e2N4KFwiY2hpbGRyZW5cIixcImZvY3VzXCIrbGV2ZWxEaWZmKX0+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInZub2RlXCIgPlxyXG4gICAgICAgICAgICA8ZGl2ICBjbGFzc05hbWU9XCJtYWluXCI+XHJcbiAgICAgICAgICAgIHtyZW5kZXIodm5vZGUse2xldmVsRGlmZn0pfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAge25vZGUuX2NoaWxkcmVuLm1hcChub2RlPT48VHJlZUJyb3dzZXIga2V5PXtub2RlLl9pZH0gbm9kZT17bm9kZX0gey4uLm90aGVyc30gbGV2ZWw9e2xldmVsKzF9IGZvY3VzTGV2ZWw9e2ZvY3VzTGV2ZWx9Lz4pfVxyXG4gICAgICAgICAgPC9kaXY+fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIFxyXG4gICAgKTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHRyZWVfYnJvd3NlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzKTtcclxuICAgIHRoaXMuc3RhdGU9cHJvcHM7XHJcbiAgICBjb25zdCB7dHJlZX09cHJvcHM7XHJcbiAgfVxyXG4gIHJlbmRlcigpIHtcclxuICBcdHZhciB7cm9vdCwuLi5vdGhlcnN9PXRoaXMuc3RhdGU7XHJcbiAgICB2YXIge2ZvY3VzLGV4cGFuZHN9PXRoaXMuc3RhdGU7XHJcbiAgICBpZihoYXNTbGFzaChyb290KXx8aGFzU2xhc2gocm9vdCl8fF8uc29tZShleHBhbmRzLCBoYXNTbGFzaCkpeyBcclxuICAgICAgcmV0dXJuIG51bGw7Ly/lpoLmnpzmnInnlKjot6/lvoTooajnpLrnmoToioLngrnvvIzpnIDopoHovazljJbkuLpnaWTlvaLlvI/lho3mmL7npLpcclxuICAgIH1cclxuICBcdHJldHVybiA8VHJlZU5vZGVSZWFkZXIgZ2lkPXtyb290fSAgdmlldz17VHJlZUJyb3dzZXJ9ICB7Li4ub3RoZXJzfSBsZXZlbD17MX0vPlxyXG4gIH1cclxuICBjb21wb25lbnREaWRNb3VudCgpIHtcclxuICAgIGNvbnN0IG1lPXRoaXM7XHJcbiAgICBjb25zdCB7bm9kZSx0cmVlfT10aGlzLnByb3BzO1xyXG4gICAgY29uc3QgdHJlZXRvb2w9cmVxdWlyZSgndHJlZW5vdGUyL3NyYy9jbGllbnQvdG9vbCcpKHRyZWUpO1xyXG5cclxuICAgIC8v5aSE55CG54K55Ye75Y2h54mH5ZCO5pS25Yiw55qE5raI5oGvXHJcbiAgICBmdW5jdGlvbiBteXN1YnNjcmliZXIodGFyZ2V0LGRhdGEpe1xyXG4gICAgIGNvbnNvbGUubG9nKCdnb3QnLHRhcmdldCxkYXRhKTtcclxuICAgICBpZihkYXRhLm1zZz09J2ZvY3VzJyl7IC8v6K6+572u54Sm54K5XHJcbiAgICAgICBjb25zdCBmb2N1cz1kYXRhLmdpZDtcclxuICAgICAgIGNvbnN0IHBnaWQ9ZGF0YS5wZ2lkO1xyXG4gICAgICAgdmFyIHtleHBhbmRzfT1tZS5zdGF0ZTtcclxuICAgICAgIGV4cGFuZHM9YnVpbGRFeHBhbmRzV2l0aEZvY3VzKGV4cGFuZHMsZm9jdXMscGdpZCk7XHJcbiAgICAgICBtZS5zZXRTdGF0ZSh7Zm9jdXMsZXhwYW5kc30pO1xyXG4gICAgIH1lbHNlIGlmKGRhdGEubXNnPT0ncmVmcmVzaCcpeyAvL+WIt+aWsOinhuWbvlxyXG4gICAgICBtZS5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgIH1lbHNlIGlmKGRhdGEubXNnPT0nbW92ZScpeyAvL+enu+WKqOWNoeeJh1xyXG4gICAgICBwYXN0ZShkYXRhLmdpZCxkYXRhLmJnaWQsdHJlZSx0cmVldG9vbCk7XHJcbiAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50b2tlbj1QdWJTdWIuc3Vic2NyaWJlKFwiVHJlZUJyb3dzZXJcIixteXN1YnNjcmliZXIpXHJcblxyXG4gICAgLy/miorot6/lvoTovazmjaLkuLpnaWTlvaLlvI9cclxuICAgIHZhciB7cm9vdCxmb2N1cyxleHBhbmRzfT10aGlzLnN0YXRlO1xyXG4gICAgY29uc3QgX3BhdGgyZ2lkPV8uY3VycnkocGF0aDJnaWQpKHRyZWV0b29sKTsvL+WNleWPguaVsOWHveaVsGZuKGdpZE9yUGF0aClcclxuICAgIGNvbnN0IHRvZ2V0aGVyPVtyb290LGZvY3VzLC4uLmV4cGFuZHNdOy8v5ZCI5bm25LiA5LiL5pa55L6/5aSE55CGXHJcbiAgICBQcm9taXNlLmFsbCh0b2dldGhlci5tYXAoX3BhdGgyZ2lkKSkudGhlbigoW3Jvb3QsZm9jdXMsLi4uZXhwYW5kc10pPT57XHJcbiAgICAgIG1lLnNldFN0YXRlKHtyb290LGZvY3VzLGV4cGFuZHN9KTtcclxuICAgIH0pXHJcblxyXG4gIH1cclxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcclxuICAgIGNvbnN0IHtmb2N1c309dGhpcy5zdGF0ZTtcclxuICAgIGQuc2Nyb2xsMmNhcmQoZm9jdXMpO1xyXG4gICAgZC5lbnN1cmVGb2N1c0NvbHVtbihmb2N1cyk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBoYXNTbGFzaD0oc3RyKT0+c3RyLmluZGV4T2YoJy8nKT4tMTtcclxuXHJcbmZ1bmN0aW9uIHBhdGgyZ2lkKHRyZWV0b29sLGdpZE9yUGF0aCl7XHJcbiAgcmV0dXJuIGhhc1NsYXNoKGdpZE9yUGF0aCk/dHJlZXRvb2wuY3JlYXRlTm9kZUJ5UGF0aChnaWRPclBhdGgpLnRoZW4obm9kZT0+bm9kZS5faWQpOlByb21pc2UucmVzb2x2ZShnaWRPclBhdGgpOy8v5pyJ5pac5p2g55qE6KeG5Li66Lev5b6E77yM5rKh5pyJ55qE6KeG5Li6Z2lk55u05o6l6L+U5ZueXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkRXhwYW5kc1dpdGhGb2N1cyhleHBhbmRzLGZvY3VzLHBnaWQpIHtcclxuICB2YXIgaWR4PWV4cGFuZHMuaW5kZXhPZihwZ2lkKTtcclxuICBpZihpZHg8MCl7cmV0dXJuIGV4cGFuZHM7fS8v5rKh5om+5Yiw55u05o6l6L+U5ZueXHJcbiAgZXhwYW5kcz1leHBhbmRzLnNsaWNlKDAsaWR4KzEpOy8v54i26IqC54K55LmL5YmNXHJcbiAgZXhwYW5kcy5wdXNoKGZvY3VzKTsvL+WKoOWFpeaWsOeahOiKgueCuVxyXG4gIHJldHVybiBleHBhbmRzO1xyXG59Il19