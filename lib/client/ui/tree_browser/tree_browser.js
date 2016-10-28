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
    ),
    _react2.default.createElement(
      'button',
      { className: 'btn btn-default btn-xs', onClick: function onClick() {
          PubSub.publish("TreeBrowser", { msg: "edit", gid: node._id });
        } },
      _react2.default.createElement('i', { className: 'fa fa-edit' })
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
  var edit = props.edit;

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
  var isEdit = edit === node._id;
  return _react2.default.createElement(
    'div',
    { className: cx("node", { focus: isFocus }, { hideRoot: isHideRoot }), id: node._id,
      'data-level': level },
    isHideRoot ? null : _react2.default.createElement(
      'div',
      { className: cx("main", { edit: isEdit }), onDrop: d.drop, onDragOver: d.dragover },
      render(node, { levelDiff: levelDiff, isFocus: isFocus, isEdit: isEdit }),
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
        } else if (data.msg = "edit") {
          me.setState({ edit: data.gid });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFJLFFBQVMsWUFBVCxDQUFSO0FBQ0EsSUFBSSxJQUFFLFFBQVEsUUFBUixDQUFOO0FBQ0EsUUFBUSxxQkFBUjtBQUNBLElBQUksU0FBUSxRQUFTLFdBQVQsQ0FBWjtBQUNBLElBQUksSUFBRSxRQUFRLGlCQUFSLENBQU47QUFDQSxJQUFJLFNBQUosQyxDQUFjOzs7QUFJZCxTQUFTLFlBQVQsQ0FBc0IsTUFBdEIsRUFBNkIsTUFBN0IsRUFBb0MsUUFBcEMsRUFBNkM7QUFBRTtBQUM3QyxTQUFPLFNBQVMsWUFBVCxDQUFzQixDQUFDLE1BQUQsQ0FBdEIsRUFBK0IsTUFBL0IsRUFBdUMsSUFBdkMsQ0FBNEMsa0JBQVE7QUFDekQsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFmLElBQXVCLENBQUMsQ0FBL0I7QUFDRCxHQUZNLENBQVA7QUFHRDs7QUFFRCxTQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQW9CLEVBQXBCLEVBQXVCLElBQXZCLEVBQTRCLFFBQTVCLEVBQXFDO0FBQ25DLGVBQWEsRUFBYixFQUFnQixJQUFoQixFQUFxQixRQUFyQixFQUErQixJQUEvQixDQUFvQyxrQkFBUTtBQUMxQyxRQUFHLE1BQUgsRUFBVTtBQUNSLFlBQU0sdUJBQXNCLElBQXRCLEdBQTJCLE1BQTNCLEdBQWtDLEVBQXhDO0FBQ0QsS0FGRCxNQUVLO0FBQ0g7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBd0IsRUFBeEIsRUFBNEIsSUFBNUIsQ0FBaUMsYUFBRztBQUNsQyxvQkFBVSxJQUFWO0FBQ0EsZUFBTyxPQUFQLENBQWUsYUFBZixFQUE2QixFQUFDLEtBQUksU0FBTCxFQUE3QjtBQUNELE9BSEQ7QUFJRDtBQUNGLEdBVkQ7QUFXRDs7QUFF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VCxRQUFTLENBQUMsR0FBRDtBQUFBLFNBQU8sSUFBSSxPQUFKLENBQVksR0FBWixJQUFpQixDQUFDLENBQXpCO0FBQUEsQ0FBZjs7QUFFQSxTQUFTLFFBQVQsQ0FBa0IsUUFBbEIsRUFBMkIsU0FBM0IsRUFBcUM7QUFDbkMsU0FBTyxTQUFTLFNBQVQsSUFBb0IsU0FBUyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxJQUFyQyxDQUEwQztBQUFBLFdBQU0sS0FBSyxHQUFYO0FBQUEsR0FBMUMsQ0FBcEIsR0FBOEUsUUFBUSxPQUFSLENBQWdCLFNBQWhCLENBQXJGLENBRG1DLENBQzZFO0FBQ2pIOztBQUVELFNBQVMscUJBQVQsQ0FBK0IsT0FBL0IsRUFBdUMsS0FBdkMsRUFBNkMsSUFBN0MsRUFBbUQ7QUFDakQsTUFBSSxNQUFJLFFBQVEsT0FBUixDQUFnQixJQUFoQixDQUFSO0FBQ0EsTUFBRyxNQUFJLENBQVAsRUFBUztBQUFDLFdBQU8sT0FBUDtBQUFnQixHQUZ1QixDQUV2QjtBQUMxQixZQUFRLFFBQVEsS0FBUixDQUFjLENBQWQsRUFBZ0IsTUFBSSxDQUFwQixDQUFSLENBSGlELENBR2xCO0FBQy9CLFVBQVEsSUFBUixDQUFhLEtBQWIsRUFKaUQsQ0FJN0I7QUFDcEIsU0FBTyxPQUFQO0FBQ0QiLCJmaWxlIjoidHJlZV9icm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IFRyZWVOb2RlUmVhZGVyIGZyb20gJ3RyZWVub3RlMi9zcmMvY2xpZW50L3VpL3RyZWVfbm9kZV9yZWFkZXInO1xyXG52YXIgY3ggPXJlcXVpcmUgKFwiY2xhc3NuYW1lc1wiKTtcclxudmFyIF89cmVxdWlyZShcImxvZGFzaFwiKTtcclxucmVxdWlyZSgnLi90cmVlX2Jyb3dzZXIubGVzcycpO1xyXG52YXIgUHViU3ViID1yZXF1aXJlIChcInB1YnN1Yi1qc1wiKTtcclxudmFyIGQ9cmVxdWlyZSgnLi9kb21fb3BlcmF0aW9uJyk7XHJcbnZhciBjbGlwYm9hcmQ7Ly/liarotLTmnb/vvIznlKjkuo7lrZjmlL7lvZPliY3liarliIfnmoRub2RlIGlkXHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGlzRGVzY2VuZGFudCh0YXJnZXQsc291cmNlLHRyZWV0b29sKXsgLy9jaGVjayB3aGV0aGVyIHRhcmdldCBpcyAgZGVzY2VuZGFudCBvZiBzb3VyY2VcclxuICByZXR1cm4gdHJlZXRvb2wuZXhwYW5kVG9Sb290KFt0YXJnZXRdLHNvdXJjZSkudGhlbihpZHBhdGg9PntcclxuICAgIHJldHVybiBpZHBhdGguaW5kZXhPZihzb3VyY2UpPi0xO1xyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhc3RlKGZyb20sdG8sdHJlZSx0cmVldG9vbCl7XHJcbiAgaXNEZXNjZW5kYW50KHRvLGZyb20sdHJlZXRvb2wpLnRoZW4oY2Fubm90PT57XHJcbiAgICBpZihjYW5ub3Qpe1xyXG4gICAgICBhbGVydChcImNhbm5vdCBwYXN0ZSBmcm9tIFwiICtmcm9tK1wiIHRvIFwiK3RvKVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdsZXRzIHBhc3RlJyxmcm9tLFwidG9cIix0bylcclxuICAgICAgdHJlZS5tdl9hc19icm90aGVyKGZyb20sdG8pLnRoZW4oXz0+e1xyXG4gICAgICAgIGNsaXBib2FyZD1udWxsO1xyXG4gICAgICAgIFB1YlN1Yi5wdWJsaXNoKFwiVHJlZUJyb3dzZXJcIix7bXNnOlwicmVmcmVzaFwifSk7XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG5cclxuY29uc3QgbWVudT0obm9kZSx0cmVlLHRyZWV0b29sKT0+e1xyXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibWVudVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiXHJcbiAgICAgICAgICAgICAgZHJhZ2dhYmxlPVwidHJ1ZVwiIG9uRHJhZ1N0YXJ0PXtkLmRyYWd9IG9uRHJhZ0VuZD17ZC5kcmFnRW5kfVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWFycm93c1wiPjwvaT5cclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgY2xpcGJvYXJkPW5vZGUuX2lkO1xyXG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLWN1dFwiPjwvaT48L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiAgb25DbGljaz17KCk9PntcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaXBib2FyZClcclxuICAgICAgICAgICAgICAgIHBhc3RlKGNsaXBib2FyZCxub2RlLl9pZCx0cmVlLHRyZWV0b29sKTtcclxuICAgICAgICAgICAgICB9fT48aSBjbGFzc05hbWU9XCJmYSBmYS1wYXN0ZVwiPjwvaT48L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiAgb25DbGljaz17KCk9PntcclxuICAgICAgICAgICAgICAgIHZhciBzdXJlPWNvbmZpcm0oXCJhcmUgeW91IHN1cmU/XCIpXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzdXJlKTtcclxuICAgICAgICAgICAgICAgIGlmKHN1cmUpe1xyXG4gICAgICAgICAgICAgICAgICB0cmVlLnJlbW92ZShub2RlLl9pZCkudGhlbihfPT57XHJcbiAgICAgICAgICAgICAgICAgICAgUHViU3ViLnB1Ymxpc2goXCJUcmVlQnJvd3NlclwiLHttc2c6XCJyZWZyZXNoXCJ9KTtcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9fT48aSBjbGFzc05hbWU9XCJmYSBmYS10cmFzaFwiPjwvaT48L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgUHViU3ViLnB1Ymxpc2goXCJUcmVlQnJvd3NlclwiLHttc2c6XCJlZGl0XCIsZ2lkOm5vZGUuX2lkfSk7XHJcbiAgICAgICAgICAgICAgfX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtZWRpdFwiPjwvaT48L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbn1cclxuXHJcbmNvbnN0IFRyZWVCcm93c2VyPShwcm9wcyk9PntcclxuICAgIGNvbnN0IHtub2RlLC4uLm90aGVyc309cHJvcHM7XHJcbiAgICBjb25zdCB7cmVuZGVyLGZvY3VzLGV4cGFuZHMsdHJlZSxsZXZlbCxoaWRlUm9vdCxlZGl0fT1wcm9wcztcclxuICAgIGNvbnN0IHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcclxuICAgIGNvbnN0IHZub2RlPXtfdHlwZTpcInZub2RlXCIsX3A6bm9kZS5faWR9XHJcbiAgICAvL3Rlc3QgYmVnaW5cclxuICAgIC8vIGlmKG5vZGUuX2lkPT0nMCcpe1xyXG4gICAgLy8gICBjb25zb2xlLmxvZygnVHJlZUJyb3dzZXInLG5vZGUpO1xyXG4gICAgLy8gfVxyXG4gICAgLy90ZXN0IGVuZFxyXG4gICAgdmFyIGlzSGlkZVJvb3Q9aGlkZVJvb3QmJmxldmVsPT09MTsvL+makOiXj+esrOS4gOWIl1xyXG4gICAgdmFyIGZvY3VzTGV2ZWw9MDtcclxuICAgIGlmKGxldmVsPT09MSl7XHJcbiAgICAgIGZvY3VzTGV2ZWw9dHJlZXRvb2wuZmluZExldmVsKG5vZGUsZm9jdXMpO1xyXG4gICAgICBjb25zb2xlLmxvZyhcImZvY3VzTGV2ZWxcIixmb2N1c0xldmVsKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBmb2N1c0xldmVsPXByb3BzLmZvY3VzTGV2ZWw7XHJcbiAgICB9XHJcbiAgICBjb25zdCBsZXZlbERpZmY9bGV2ZWwtZm9jdXNMZXZlbDsvL+W9k+WJjee6p+WIq+S4jueEpueCuee6p+WIq+eahOi3neemu1xyXG4gICAgY29uc3QgaXNGb2N1cz0oZm9jdXM9PT1ub2RlLl9pZCk7XHJcbiAgICBjb25zdCBpc0VkaXQ9KGVkaXQ9PT1ub2RlLl9pZCk7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeChcIm5vZGVcIix7Zm9jdXM6aXNGb2N1c30se2hpZGVSb290OmlzSGlkZVJvb3R9KX0gaWQ9e25vZGUuX2lkfVxyXG4gICAgICAgIGRhdGEtbGV2ZWw9e2xldmVsfT5cclxuICAgICAgICB7aXNIaWRlUm9vdD9udWxsOjxkaXYgY2xhc3NOYW1lPXtjeChcIm1haW5cIix7ZWRpdDppc0VkaXR9KX0gb25Ecm9wPXtkLmRyb3B9IG9uRHJhZ092ZXI9e2QuZHJhZ292ZXJ9ID5cclxuICAgICAgICAgICAge3JlbmRlcihub2RlLHtsZXZlbERpZmYsaXNGb2N1cyxpc0VkaXR9KX1cclxuICAgICAgICAgICAge21lbnUobm9kZSx0cmVlLHRyZWV0b29sKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIH1cclxuICAgICAgICAgIHshXy5pbmNsdWRlcyhleHBhbmRzLG5vZGUuX2lkKT9udWxsOjxkaXYgY2xhc3NOYW1lPXtjeChcImNoaWxkcmVuXCIsXCJmb2N1c1wiK2xldmVsRGlmZil9PlxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ2bm9kZVwiID5cclxuICAgICAgICAgICAgPGRpdiAgY2xhc3NOYW1lPVwibWFpblwiPlxyXG4gICAgICAgICAgICB7cmVuZGVyKHZub2RlLHtsZXZlbERpZmZ9KX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIHtub2RlLl9jaGlsZHJlbi5tYXAobm9kZT0+PFRyZWVCcm93c2VyIGtleT17bm9kZS5faWR9IG5vZGU9e25vZGV9IHsuLi5vdGhlcnN9IGxldmVsPXtsZXZlbCsxfSBmb2N1c0xldmVsPXtmb2N1c0xldmVsfS8+KX1cclxuICAgICAgICAgIDwvZGl2Pn1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICBcclxuICAgICk7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyB0cmVlX2Jyb3dzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgICB0aGlzLnN0YXRlPXByb3BzO1xyXG4gICAgY29uc3Qge3RyZWV9PXByb3BzO1xyXG4gIH1cclxuICByZW5kZXIoKSB7XHJcbiAgXHR2YXIge3Jvb3QsLi4ub3RoZXJzfT10aGlzLnN0YXRlO1xyXG4gICAgdmFyIHtmb2N1cyxleHBhbmRzfT10aGlzLnN0YXRlO1xyXG4gICAgaWYoaGFzU2xhc2gocm9vdCl8fGhhc1NsYXNoKHJvb3QpfHxfLnNvbWUoZXhwYW5kcywgaGFzU2xhc2gpKXsgXHJcbiAgICAgIHJldHVybiBudWxsOy8v5aaC5p6c5pyJ55So6Lev5b6E6KGo56S655qE6IqC54K577yM6ZyA6KaB6L2s5YyW5Li6Z2lk5b2i5byP5YaN5pi+56S6XHJcbiAgICB9XHJcbiAgXHRyZXR1cm4gPFRyZWVOb2RlUmVhZGVyIGdpZD17cm9vdH0gIHZpZXc9e1RyZWVCcm93c2VyfSAgey4uLm90aGVyc30gbGV2ZWw9ezF9Lz5cclxuICB9XHJcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgY29uc3Qge25vZGUsdHJlZX09dGhpcy5wcm9wcztcclxuICAgIGNvbnN0IHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcclxuXHJcbiAgICAvL+WkhOeQhueCueWHu+WNoeeJh+WQjuaUtuWIsOeahOa2iOaBr1xyXG4gICAgZnVuY3Rpb24gbXlzdWJzY3JpYmVyKHRhcmdldCxkYXRhKXtcclxuICAgICBjb25zb2xlLmxvZygnZ290Jyx0YXJnZXQsZGF0YSk7XHJcbiAgICAgaWYoZGF0YS5tc2c9PSdmb2N1cycpeyAvL+iuvue9rueEpueCuVxyXG4gICAgICAgY29uc3QgZm9jdXM9ZGF0YS5naWQ7XHJcbiAgICAgICBjb25zdCBwZ2lkPWRhdGEucGdpZDtcclxuICAgICAgIHZhciB7ZXhwYW5kc309bWUuc3RhdGU7XHJcbiAgICAgICBleHBhbmRzPWJ1aWxkRXhwYW5kc1dpdGhGb2N1cyhleHBhbmRzLGZvY3VzLHBnaWQpO1xyXG4gICAgICAgbWUuc2V0U3RhdGUoe2ZvY3VzLGV4cGFuZHN9KTtcclxuICAgICB9ZWxzZSBpZihkYXRhLm1zZz09J3JlZnJlc2gnKXsgLy/liLfmlrDop4blm75cclxuICAgICAgbWUuZm9yY2VVcGRhdGUoKTtcclxuICAgICB9ZWxzZSBpZihkYXRhLm1zZz09J21vdmUnKXsgLy/np7vliqjljaHniYdcclxuICAgICAgcGFzdGUoZGF0YS5naWQsZGF0YS5iZ2lkLHRyZWUsdHJlZXRvb2wpO1xyXG4gICAgIH1lbHNlIGlmKGRhdGEubXNnPVwiZWRpdFwiKXtcclxuICAgICAgbWUuc2V0U3RhdGUoe2VkaXQ6ZGF0YS5naWR9KVxyXG4gICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudG9rZW49UHViU3ViLnN1YnNjcmliZShcIlRyZWVCcm93c2VyXCIsbXlzdWJzY3JpYmVyKVxyXG5cclxuICAgIC8v5oqK6Lev5b6E6L2s5o2i5Li6Z2lk5b2i5byPXHJcbiAgICB2YXIge3Jvb3QsZm9jdXMsZXhwYW5kc309dGhpcy5zdGF0ZTtcclxuICAgIGNvbnN0IF9wYXRoMmdpZD1fLmN1cnJ5KHBhdGgyZ2lkKSh0cmVldG9vbCk7Ly/ljZXlj4LmlbDlh73mlbBmbihnaWRPclBhdGgpXHJcbiAgICBjb25zdCB0b2dldGhlcj1bcm9vdCxmb2N1cywuLi5leHBhbmRzXTsvL+WQiOW5tuS4gOS4i+aWueS+v+WkhOeQhlxyXG4gICAgUHJvbWlzZS5hbGwodG9nZXRoZXIubWFwKF9wYXRoMmdpZCkpLnRoZW4oKFtyb290LGZvY3VzLC4uLmV4cGFuZHNdKT0+e1xyXG4gICAgICBtZS5zZXRTdGF0ZSh7cm9vdCxmb2N1cyxleHBhbmRzfSk7XHJcbiAgICB9KVxyXG5cclxuICB9XHJcbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XHJcbiAgICBjb25zdCB7Zm9jdXN9PXRoaXMuc3RhdGU7XHJcbiAgICBkLnNjcm9sbDJjYXJkKGZvY3VzKTtcclxuICAgIGQuZW5zdXJlRm9jdXNDb2x1bW4oZm9jdXMpO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgaGFzU2xhc2g9KHN0cik9PnN0ci5pbmRleE9mKCcvJyk+LTE7XHJcblxyXG5mdW5jdGlvbiBwYXRoMmdpZCh0cmVldG9vbCxnaWRPclBhdGgpe1xyXG4gIHJldHVybiBoYXNTbGFzaChnaWRPclBhdGgpP3RyZWV0b29sLmNyZWF0ZU5vZGVCeVBhdGgoZ2lkT3JQYXRoKS50aGVuKG5vZGU9Pm5vZGUuX2lkKTpQcm9taXNlLnJlc29sdmUoZ2lkT3JQYXRoKTsvL+acieaWnOadoOeahOinhuS4uui3r+W+hO+8jOayoeacieeahOinhuS4umdpZOebtOaOpei/lOWbnlxyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZEV4cGFuZHNXaXRoRm9jdXMoZXhwYW5kcyxmb2N1cyxwZ2lkKSB7XHJcbiAgdmFyIGlkeD1leHBhbmRzLmluZGV4T2YocGdpZCk7XHJcbiAgaWYoaWR4PDApe3JldHVybiBleHBhbmRzO30vL+ayoeaJvuWIsOebtOaOpei/lOWbnlxyXG4gIGV4cGFuZHM9ZXhwYW5kcy5zbGljZSgwLGlkeCsxKTsvL+eItuiKgueCueS5i+WJjVxyXG4gIGV4cGFuZHMucHVzaChmb2N1cyk7Ly/liqDlhaXmlrDnmoToioLngrlcclxuICByZXR1cm4gZXhwYW5kcztcclxufSJdfQ==