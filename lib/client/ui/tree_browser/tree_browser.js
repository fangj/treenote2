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
  var focusLevel;
  if (level === 1) {
    focusLevel = treetool.findLevel(node, focus);
    console.log("focusLevel", focusLevel);
  }
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
      { className: cx("children", { focus: level + 1 === focusLevel }) },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFJLFFBQVMsWUFBVCxDQUFKO0FBQ0osSUFBSSxJQUFFLFFBQVEsUUFBUixDQUFGO0FBQ0osUUFBUSxxQkFBUjtBQUNBLElBQUksU0FBUSxRQUFTLFdBQVQsQ0FBUjtBQUNKLElBQUksSUFBRSxRQUFRLGlCQUFSLENBQUY7QUFDSixJQUFJLFNBQUo7O0FBSUEsU0FBUyxZQUFULENBQXNCLE1BQXRCLEVBQTZCLE1BQTdCLEVBQW9DLFFBQXBDLEVBQTZDOztBQUMzQyxTQUFPLFNBQVMsWUFBVCxDQUFzQixDQUFDLE1BQUQsQ0FBdEIsRUFBK0IsTUFBL0IsRUFBdUMsSUFBdkMsQ0FBNEMsa0JBQVE7QUFDekQsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFmLElBQXVCLENBQUMsQ0FBRCxDQUQyQjtHQUFSLENBQW5ELENBRDJDO0NBQTdDOztBQU1BLFNBQVMsS0FBVCxDQUFlLElBQWYsRUFBb0IsRUFBcEIsRUFBdUIsSUFBdkIsRUFBNEIsUUFBNUIsRUFBcUM7QUFDbkMsZUFBYSxFQUFiLEVBQWdCLElBQWhCLEVBQXFCLFFBQXJCLEVBQStCLElBQS9CLENBQW9DLGtCQUFRO0FBQzFDLFFBQUcsTUFBSCxFQUFVO0FBQ1IsWUFBTSx1QkFBc0IsSUFBdEIsR0FBMkIsTUFBM0IsR0FBa0MsRUFBbEMsQ0FBTixDQURRO0tBQVYsTUFFSzs7QUFFSCxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBd0IsRUFBeEIsRUFBNEIsSUFBNUIsQ0FBaUMsYUFBRztBQUNsQyxvQkFBVSxJQUFWLENBRGtDO0FBRWxDLGVBQU8sT0FBUCxDQUFlLGFBQWYsRUFBNkIsRUFBQyxLQUFJLFNBQUosRUFBOUIsRUFGa0M7T0FBSCxDQUFqQyxDQUZHO0tBRkw7R0FE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RUE3Q0QsZ0JBQU0sU0FBTjs7a0JBQXJCOztBQW9EckIsSUFBTSxXQUFTLFNBQVQsUUFBUyxDQUFDLEdBQUQ7U0FBTyxJQUFJLE9BQUosQ0FBWSxHQUFaLElBQWlCLENBQUMsQ0FBRDtDQUF4Qjs7QUFFZixTQUFTLFFBQVQsQ0FBa0IsUUFBbEIsRUFBMkIsU0FBM0IsRUFBcUM7QUFDbkMsU0FBTyxTQUFTLFNBQVQsSUFBb0IsU0FBUyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxJQUFyQyxDQUEwQztXQUFNLEtBQUssR0FBTDtHQUFOLENBQTlELEdBQThFLFFBQVEsT0FBUixDQUFnQixTQUFoQixDQUE5RTtBQUQ0QixDQUFyQzs7QUFJQSxTQUFTLHFCQUFULENBQStCLE9BQS9CLEVBQXVDLEtBQXZDLEVBQTZDLElBQTdDLEVBQW1EO0FBQ2pELE1BQUksTUFBSSxRQUFRLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBSixDQUQ2QztBQUVqRCxNQUFHLE1BQUksQ0FBSixFQUFNO0FBQUMsV0FBTyxPQUFQLENBQUQ7R0FBVDtBQUZpRCxTQUdqRCxHQUFRLFFBQVEsS0FBUixDQUFjLENBQWQsRUFBZ0IsTUFBSSxDQUFKLENBQXhCO0FBSGlELFNBSWpELENBQVEsSUFBUixDQUFhLEtBQWI7QUFKaUQsU0FLMUMsT0FBUCxDQUxpRDtDQUFuRCIsImZpbGUiOiJ0cmVlX2Jyb3dzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFRyZWVOb2RlUmVhZGVyIGZyb20gJ3RyZWVub3RlMi9zcmMvY2xpZW50L3VpL3RyZWVfbm9kZV9yZWFkZXInO1xudmFyIGN4ID1yZXF1aXJlIChcImNsYXNzbmFtZXNcIik7XG52YXIgXz1yZXF1aXJlKFwibG9kYXNoXCIpO1xucmVxdWlyZSgnLi90cmVlX2Jyb3dzZXIubGVzcycpO1xudmFyIFB1YlN1YiA9cmVxdWlyZSAoXCJwdWJzdWItanNcIik7XG52YXIgZD1yZXF1aXJlKCcuL2RvbV9vcGVyYXRpb24nKTtcbnZhciBjbGlwYm9hcmQ7Ly/liarotLTmnb/vvIznlKjkuo7lrZjmlL7lvZPliY3liarliIfnmoRub2RlIGlkXG5cblxuXG5mdW5jdGlvbiBpc0Rlc2NlbmRhbnQodGFyZ2V0LHNvdXJjZSx0cmVldG9vbCl7IC8vY2hlY2sgd2hldGhlciB0YXJnZXQgaXMgIGRlc2NlbmRhbnQgb2Ygc291cmNlXG4gIHJldHVybiB0cmVldG9vbC5leHBhbmRUb1Jvb3QoW3RhcmdldF0sc291cmNlKS50aGVuKGlkcGF0aD0+e1xuICAgIHJldHVybiBpZHBhdGguaW5kZXhPZihzb3VyY2UpPi0xO1xuICB9KVxufVxuXG5mdW5jdGlvbiBwYXN0ZShmcm9tLHRvLHRyZWUsdHJlZXRvb2wpe1xuICBpc0Rlc2NlbmRhbnQodG8sZnJvbSx0cmVldG9vbCkudGhlbihjYW5ub3Q9PntcbiAgICBpZihjYW5ub3Qpe1xuICAgICAgYWxlcnQoXCJjYW5ub3QgcGFzdGUgZnJvbSBcIiArZnJvbStcIiB0byBcIit0bylcbiAgICB9ZWxzZXtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdsZXRzIHBhc3RlJyxmcm9tLFwidG9cIix0bylcbiAgICAgIHRyZWUubXZfYXNfYnJvdGhlcihmcm9tLHRvKS50aGVuKF89PntcbiAgICAgICAgY2xpcGJvYXJkPW51bGw7XG4gICAgICAgIFB1YlN1Yi5wdWJsaXNoKFwiVHJlZUJyb3dzZXJcIix7bXNnOlwicmVmcmVzaFwifSk7XG4gICAgICB9KVxuICAgIH1cbiAgfSlcbn1cblxuY29uc3QgbWVudT0obm9kZSx0cmVlLHRyZWV0b29sKT0+e1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm1lbnVcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCJcbiAgICAgICAgICAgICAgZHJhZ2dhYmxlPVwidHJ1ZVwiIG9uRHJhZ1N0YXJ0PXtkLmRyYWd9IG9uRHJhZ0VuZD17ZC5kcmFnRW5kfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtYXJyb3dzXCI+PC9pPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCIgb25DbGljaz17KCk9PntcbiAgICAgICAgICAgICAgICBjbGlwYm9hcmQ9bm9kZS5faWQ7XG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLWN1dFwiPjwvaT48L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCIgIG9uQ2xpY2s9eygpPT57XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY2xpcGJvYXJkKVxuICAgICAgICAgICAgICAgIHBhc3RlKGNsaXBib2FyZCxub2RlLl9pZCx0cmVlLHRyZWV0b29sKTtcbiAgICAgICAgICAgICAgfX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtcGFzdGVcIj48L2k+PC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xuICAgICAgICAgICAgICAgIHZhciBzdXJlPWNvbmZpcm0oXCJhcmUgeW91IHN1cmU/XCIpXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc3VyZSk7XG4gICAgICAgICAgICAgICAgaWYoc3VyZSl7XG4gICAgICAgICAgICAgICAgICB0cmVlLnJlbW92ZShub2RlLl9pZCkudGhlbihfPT57XG4gICAgICAgICAgICAgICAgICAgIFB1YlN1Yi5wdWJsaXNoKFwiVHJlZUJyb3dzZXJcIix7bXNnOlwicmVmcmVzaFwifSk7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtdHJhc2hcIj48L2k+PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbn1cblxuY29uc3QgVHJlZUJyb3dzZXI9KHByb3BzKT0+e1xuICAgIGNvbnN0IHtub2RlLC4uLm90aGVyc309cHJvcHM7XG4gICAgY29uc3Qge3JlbmRlcixmb2N1cyxleHBhbmRzLHRyZWUsbGV2ZWwsaGlkZVJvb3R9PXByb3BzO1xuICAgIGNvbnN0IHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcbiAgICBjb25zdCB2bm9kZT17X3R5cGU6XCJ2bm9kZVwiLF9wOm5vZGUuX2lkfVxuICAgIC8vdGVzdCBiZWdpblxuICAgIC8vIGlmKG5vZGUuX2lkPT0nMCcpe1xuICAgIC8vICAgY29uc29sZS5sb2coJ1RyZWVCcm93c2VyJyxub2RlKTtcbiAgICAvLyB9XG4gICAgLy90ZXN0IGVuZFxuICAgIHZhciBpc0hpZGVSb290PWhpZGVSb290JiZsZXZlbD09PTE7Ly/pmpDol4/nrKzkuIDliJdcbiAgICB2YXIgZm9jdXNMZXZlbDtcbiAgICBpZihsZXZlbD09PTEpe1xuICAgICAgZm9jdXNMZXZlbD10cmVldG9vbC5maW5kTGV2ZWwobm9kZSxmb2N1cyk7XG4gICAgICBjb25zb2xlLmxvZyhcImZvY3VzTGV2ZWxcIixmb2N1c0xldmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2N4KFwibm9kZVwiLHtmb2N1czpmb2N1cz09PW5vZGUuX2lkfSx7aGlkZVJvb3Q6aXNIaWRlUm9vdH0pfSBpZD17bm9kZS5faWR9XG4gICAgICAgIGRhdGEtbGV2ZWw9e2xldmVsfT5cbiAgICAgICAge2lzSGlkZVJvb3Q/bnVsbDo8ZGl2IGNsYXNzTmFtZT1cIm1haW5cIiBvbkRyb3A9e2QuZHJvcH0gb25EcmFnT3Zlcj17ZC5kcmFnb3Zlcn0+XG4gICAgICAgICAgICB7cmVuZGVyKG5vZGUpfVxuICAgICAgICAgICAge21lbnUobm9kZSx0cmVlLHRyZWV0b29sKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgfVxuICAgICAgICAgIHshXy5pbmNsdWRlcyhleHBhbmRzLG5vZGUuX2lkKT9udWxsOjxkaXYgY2xhc3NOYW1lPXtjeChcImNoaWxkcmVuXCIse2ZvY3VzOigobGV2ZWwrMSk9PT1mb2N1c0xldmVsKX0pfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInZub2RlXCIgPlxuICAgICAgICAgICAgPGRpdiAgY2xhc3NOYW1lPVwibWFpblwiPlxuICAgICAgICAgICAge3JlbmRlcih2bm9kZSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7bm9kZS5fY2hpbGRyZW4ubWFwKG5vZGU9PjxUcmVlQnJvd3NlciBrZXk9e25vZGUuX2lkfSBub2RlPXtub2RlfSB7Li4ub3RoZXJzfSBsZXZlbD17bGV2ZWwrMX0gZm9jdXNMZXZlbD17Zm9jdXNMZXZlbH0vPil9XG4gICAgICAgICAgPC9kaXY+fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgKTtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyB0cmVlX2Jyb3dzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlPXByb3BzO1xuICAgIGNvbnN0IHt0cmVlfT1wcm9wcztcbiAgfVxuICByZW5kZXIoKSB7XG4gIFx0dmFyIHtyb290LC4uLm90aGVyc309dGhpcy5zdGF0ZTtcbiAgICB2YXIge2ZvY3VzLGV4cGFuZHN9PXRoaXMuc3RhdGU7XG4gICAgaWYoaGFzU2xhc2gocm9vdCl8fGhhc1NsYXNoKHJvb3QpfHxfLnNvbWUoZXhwYW5kcywgaGFzU2xhc2gpKXsgXG4gICAgICByZXR1cm4gbnVsbDsvL+WmguaenOacieeUqOi3r+W+hOihqOekuueahOiKgueCue+8jOmcgOimgei9rOWMluS4umdpZOW9ouW8j+WGjeaYvuekulxuICAgIH1cbiAgXHRyZXR1cm4gPFRyZWVOb2RlUmVhZGVyIGdpZD17cm9vdH0gIHZpZXc9e1RyZWVCcm93c2VyfSAgey4uLm90aGVyc30gbGV2ZWw9ezF9Lz5cbiAgfVxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBtZT10aGlzO1xuICAgIGNvbnN0IHtub2RlLHRyZWV9PXRoaXMucHJvcHM7XG4gICAgY29uc3QgdHJlZXRvb2w9cmVxdWlyZSgndHJlZW5vdGUyL3NyYy9jbGllbnQvdG9vbCcpKHRyZWUpO1xuXG4gICAgLy/lpITnkIbngrnlh7vljaHniYflkI7mlLbliLDnmoTmtojmga9cbiAgICBmdW5jdGlvbiBteXN1YnNjcmliZXIodGFyZ2V0LGRhdGEpe1xuICAgICBjb25zb2xlLmxvZygnZ290Jyx0YXJnZXQsZGF0YSk7XG4gICAgIGlmKGRhdGEubXNnPT0nZm9jdXMnKXsgLy/orr7nva7nhKbngrlcbiAgICAgICBjb25zdCBmb2N1cz1kYXRhLmdpZDtcbiAgICAgICBjb25zdCBwZ2lkPWRhdGEucGdpZDtcbiAgICAgICB2YXIge2V4cGFuZHN9PW1lLnN0YXRlO1xuICAgICAgIGV4cGFuZHM9YnVpbGRFeHBhbmRzV2l0aEZvY3VzKGV4cGFuZHMsZm9jdXMscGdpZCk7XG4gICAgICAgbWUuc2V0U3RhdGUoe2ZvY3VzLGV4cGFuZHN9KTtcbiAgICAgfWVsc2UgaWYoZGF0YS5tc2c9PSdyZWZyZXNoJyl7IC8v5Yi35paw6KeG5Zu+XG4gICAgICBtZS5mb3JjZVVwZGF0ZSgpO1xuICAgICB9ZWxzZSBpZihkYXRhLm1zZz09J21vdmUnKXsgLy/np7vliqjljaHniYdcbiAgICAgIHBhc3RlKGRhdGEuZ2lkLGRhdGEuYmdpZCx0cmVlLHRyZWV0b29sKTtcbiAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRva2VuPVB1YlN1Yi5zdWJzY3JpYmUoXCJUcmVlQnJvd3NlclwiLG15c3Vic2NyaWJlcilcblxuICAgIC8v5oqK6Lev5b6E6L2s5o2i5Li6Z2lk5b2i5byPXG4gICAgdmFyIHtyb290LGZvY3VzLGV4cGFuZHN9PXRoaXMuc3RhdGU7XG4gICAgY29uc3QgX3BhdGgyZ2lkPV8uY3VycnkocGF0aDJnaWQpKHRyZWV0b29sKTsvL+WNleWPguaVsOWHveaVsGZuKGdpZE9yUGF0aClcbiAgICBjb25zdCB0b2dldGhlcj1bcm9vdCxmb2N1cywuLi5leHBhbmRzXTsvL+WQiOW5tuS4gOS4i+aWueS+v+WkhOeQhlxuICAgIFByb21pc2UuYWxsKHRvZ2V0aGVyLm1hcChfcGF0aDJnaWQpKS50aGVuKChbcm9vdCxmb2N1cywuLi5leHBhbmRzXSk9PntcbiAgICAgIG1lLnNldFN0YXRlKHtyb290LGZvY3VzLGV4cGFuZHN9KTtcbiAgICB9KVxuXG4gIH1cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgY29uc3Qge2ZvY3VzfT10aGlzLnN0YXRlO1xuICAgIGQuc2Nyb2xsMmNhcmQoZm9jdXMpO1xuICAgIGQuZW5zdXJlRm9jdXNDb2x1bW4oZm9jdXMpO1xuICB9XG59XG5cbmNvbnN0IGhhc1NsYXNoPShzdHIpPT5zdHIuaW5kZXhPZignLycpPi0xO1xuXG5mdW5jdGlvbiBwYXRoMmdpZCh0cmVldG9vbCxnaWRPclBhdGgpe1xuICByZXR1cm4gaGFzU2xhc2goZ2lkT3JQYXRoKT90cmVldG9vbC5jcmVhdGVOb2RlQnlQYXRoKGdpZE9yUGF0aCkudGhlbihub2RlPT5ub2RlLl9pZCk6UHJvbWlzZS5yZXNvbHZlKGdpZE9yUGF0aCk7Ly/mnInmlpzmnaDnmoTop4bkuLrot6/lvoTvvIzmsqHmnInnmoTop4bkuLpnaWTnm7TmjqXov5Tlm55cbn1cblxuZnVuY3Rpb24gYnVpbGRFeHBhbmRzV2l0aEZvY3VzKGV4cGFuZHMsZm9jdXMscGdpZCkge1xuICB2YXIgaWR4PWV4cGFuZHMuaW5kZXhPZihwZ2lkKTtcbiAgaWYoaWR4PDApe3JldHVybiBleHBhbmRzO30vL+ayoeaJvuWIsOebtOaOpei/lOWbnlxuICBleHBhbmRzPWV4cGFuZHMuc2xpY2UoMCxpZHgrMSk7Ly/niLboioLngrnkuYvliY1cbiAgZXhwYW5kcy5wdXNoKGZvY3VzKTsvL+WKoOWFpeaWsOeahOiKgueCuVxuICByZXR1cm4gZXhwYW5kcztcbn0iXX0=