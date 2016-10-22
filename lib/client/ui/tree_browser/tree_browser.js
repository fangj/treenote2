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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFJLFFBQVMsWUFBVCxDQUFKO0FBQ0osSUFBSSxJQUFFLFFBQVEsUUFBUixDQUFGO0FBQ0osUUFBUSxxQkFBUjtBQUNBLElBQUksU0FBUSxRQUFTLFdBQVQsQ0FBUjtBQUNKLElBQUksSUFBRSxRQUFRLGlCQUFSLENBQUY7QUFDSixJQUFJLFNBQUo7O0FBSUEsU0FBUyxZQUFULENBQXNCLE1BQXRCLEVBQTZCLE1BQTdCLEVBQW9DLFFBQXBDLEVBQTZDOztBQUMzQyxTQUFPLFNBQVMsWUFBVCxDQUFzQixDQUFDLE1BQUQsQ0FBdEIsRUFBK0IsTUFBL0IsRUFBdUMsSUFBdkMsQ0FBNEMsa0JBQVE7QUFDekQsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFmLElBQXVCLENBQUMsQ0FBRCxDQUQyQjtHQUFSLENBQW5ELENBRDJDO0NBQTdDOztBQU1BLFNBQVMsS0FBVCxDQUFlLElBQWYsRUFBb0IsRUFBcEIsRUFBdUIsSUFBdkIsRUFBNEIsUUFBNUIsRUFBcUM7QUFDbkMsZUFBYSxFQUFiLEVBQWdCLElBQWhCLEVBQXFCLFFBQXJCLEVBQStCLElBQS9CLENBQW9DLGtCQUFRO0FBQzFDLFFBQUcsTUFBSCxFQUFVO0FBQ1IsWUFBTSx1QkFBc0IsSUFBdEIsR0FBMkIsTUFBM0IsR0FBa0MsRUFBbEMsQ0FBTixDQURRO0tBQVYsTUFFSzs7QUFFSCxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBd0IsRUFBeEIsRUFBNEIsSUFBNUIsQ0FBaUMsYUFBRztBQUNsQyxvQkFBVSxJQUFWLENBRGtDO0FBRWxDLGVBQU8sT0FBUCxDQUFlLGFBQWYsRUFBNkIsRUFBQyxLQUFJLFNBQUosRUFBOUIsRUFGa0M7T0FBSCxDQUFqQyxDQUZHO0tBRkw7R0FE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QWxCLEVBQTJCLFNBQTNCLEVBQXFDO0FBQ25DLFNBQU8sU0FBUyxTQUFULElBQW9CLFNBQVMsZ0JBQVQsQ0FBMEIsU0FBMUIsRUFBcUMsSUFBckMsQ0FBMEM7V0FBTSxLQUFLLEdBQUw7R0FBTixDQUE5RCxHQUE4RSxRQUFRLE9BQVIsQ0FBZ0IsU0FBaEIsQ0FBOUU7QUFENEIsQ0FBckM7O0FBSUEsU0FBUyxxQkFBVCxDQUErQixPQUEvQixFQUF1QyxLQUF2QyxFQUE2QyxJQUE3QyxFQUFtRDtBQUNqRCxNQUFJLE1BQUksUUFBUSxPQUFSLENBQWdCLElBQWhCLENBQUosQ0FENkM7QUFFakQsTUFBRyxNQUFJLENBQUosRUFBTTtBQUFDLFdBQU8sT0FBUCxDQUFEO0dBQVQ7QUFGaUQsU0FHakQsR0FBUSxRQUFRLEtBQVIsQ0FBYyxDQUFkLEVBQWdCLE1BQUksQ0FBSixDQUF4QjtBQUhpRCxTQUlqRCxDQUFRLElBQVIsQ0FBYSxLQUFiO0FBSmlELFNBSzFDLE9BQVAsQ0FMaUQ7Q0FBbkQiLCJmaWxlIjoidHJlZV9icm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBUcmVlTm9kZVJlYWRlciBmcm9tICd0cmVlbm90ZTIvc3JjL2NsaWVudC91aS90cmVlX25vZGVfcmVhZGVyJztcbnZhciBjeCA9cmVxdWlyZSAoXCJjbGFzc25hbWVzXCIpO1xudmFyIF89cmVxdWlyZShcImxvZGFzaFwiKTtcbnJlcXVpcmUoJy4vdHJlZV9icm93c2VyLmxlc3MnKTtcbnZhciBQdWJTdWIgPXJlcXVpcmUgKFwicHVic3ViLWpzXCIpO1xudmFyIGQ9cmVxdWlyZSgnLi9kb21fb3BlcmF0aW9uJyk7XG52YXIgY2xpcGJvYXJkOy8v5Ymq6LS05p2/77yM55So5LqO5a2Y5pS+5b2T5YmN5Ymq5YiH55qEbm9kZSBpZFxuXG5cblxuZnVuY3Rpb24gaXNEZXNjZW5kYW50KHRhcmdldCxzb3VyY2UsdHJlZXRvb2wpeyAvL2NoZWNrIHdoZXRoZXIgdGFyZ2V0IGlzICBkZXNjZW5kYW50IG9mIHNvdXJjZVxuICByZXR1cm4gdHJlZXRvb2wuZXhwYW5kVG9Sb290KFt0YXJnZXRdLHNvdXJjZSkudGhlbihpZHBhdGg9PntcbiAgICByZXR1cm4gaWRwYXRoLmluZGV4T2Yoc291cmNlKT4tMTtcbiAgfSlcbn1cblxuZnVuY3Rpb24gcGFzdGUoZnJvbSx0byx0cmVlLHRyZWV0b29sKXtcbiAgaXNEZXNjZW5kYW50KHRvLGZyb20sdHJlZXRvb2wpLnRoZW4oY2Fubm90PT57XG4gICAgaWYoY2Fubm90KXtcbiAgICAgIGFsZXJ0KFwiY2Fubm90IHBhc3RlIGZyb20gXCIgK2Zyb20rXCIgdG8gXCIrdG8pXG4gICAgfWVsc2V7XG4gICAgICAvLyBjb25zb2xlLmxvZygnbGV0cyBwYXN0ZScsZnJvbSxcInRvXCIsdG8pXG4gICAgICB0cmVlLm12X2FzX2Jyb3RoZXIoZnJvbSx0bykudGhlbihfPT57XG4gICAgICAgIGNsaXBib2FyZD1udWxsO1xuICAgICAgICBQdWJTdWIucHVibGlzaChcIlRyZWVCcm93c2VyXCIse21zZzpcInJlZnJlc2hcIn0pO1xuICAgICAgfSlcbiAgICB9XG4gIH0pXG59XG5cbmNvbnN0IG1lbnU9KG5vZGUsdHJlZSx0cmVldG9vbCk9PntcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJtZW51XCI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiXG4gICAgICAgICAgICAgIGRyYWdnYWJsZT1cInRydWVcIiBvbkRyYWdTdGFydD17ZC5kcmFnfSBvbkRyYWdFbmQ9e2QuZHJhZ0VuZH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWFycm93c1wiPjwvaT5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiIG9uQ2xpY2s9eygpPT57XG4gICAgICAgICAgICAgICAgY2xpcGJvYXJkPW5vZGUuX2lkO1xuICAgICAgICAgICAgICB9fT48aSBjbGFzc05hbWU9XCJmYSBmYS1jdXRcIj48L2k+PC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaXBib2FyZClcbiAgICAgICAgICAgICAgICBwYXN0ZShjbGlwYm9hcmQsbm9kZS5faWQsdHJlZSx0cmVldG9vbCk7XG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXBhc3RlXCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiAgb25DbGljaz17KCk9PntcbiAgICAgICAgICAgICAgICB2YXIgc3VyZT1jb25maXJtKFwiYXJlIHlvdSBzdXJlP1wiKVxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHN1cmUpO1xuICAgICAgICAgICAgICAgIGlmKHN1cmUpe1xuICAgICAgICAgICAgICAgICAgdHJlZS5yZW1vdmUobm9kZS5faWQpLnRoZW4oXz0+e1xuICAgICAgICAgICAgICAgICAgICBQdWJTdWIucHVibGlzaChcIlRyZWVCcm93c2VyXCIse21zZzpcInJlZnJlc2hcIn0pO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXRyYXNoXCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG59XG5cbmNvbnN0IFRyZWVCcm93c2VyPShwcm9wcyk9PntcbiAgICBjb25zdCB7bm9kZSwuLi5vdGhlcnN9PXByb3BzO1xuICAgIGNvbnN0IHtyZW5kZXIsZm9jdXMsZXhwYW5kcyx0cmVlLGxldmVsLGhpZGVSb290fT1wcm9wcztcbiAgICBjb25zdCB0cmVldG9vbD1yZXF1aXJlKCd0cmVlbm90ZTIvc3JjL2NsaWVudC90b29sJykodHJlZSk7XG4gICAgY29uc3Qgdm5vZGU9e190eXBlOlwidm5vZGVcIixfcDpub2RlLl9pZH1cbiAgICAvL3Rlc3QgYmVnaW5cbiAgICAvLyBpZihub2RlLl9pZD09JzAnKXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdUcmVlQnJvd3Nlcicsbm9kZSk7XG4gICAgLy8gfVxuICAgIC8vdGVzdCBlbmRcbiAgICB2YXIgaXNIaWRlUm9vdD1oaWRlUm9vdCYmbGV2ZWw9PT0xO1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeChcIm5vZGVcIix7Zm9jdXM6Zm9jdXM9PT1ub2RlLl9pZH0se2hpZGVSb290OmlzSGlkZVJvb3R9KX0gaWQ9e25vZGUuX2lkfVxuICAgICAgICBkYXRhLWxldmVsPXtsZXZlbH0+XG4gICAgICAgIHtpc0hpZGVSb290P251bGw6PGRpdiBjbGFzc05hbWU9XCJtYWluXCIgb25Ecm9wPXtkLmRyb3B9IG9uRHJhZ092ZXI9e2QuZHJhZ292ZXJ9PlxuICAgICAgICAgICAge3JlbmRlcihub2RlKX1cbiAgICAgICAgICAgIHttZW51KG5vZGUsdHJlZSx0cmVldG9vbCl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIH1cbiAgICAgICAgICB7IV8uaW5jbHVkZXMoZXhwYW5kcyxub2RlLl9pZCk/bnVsbDo8ZGl2IGNsYXNzTmFtZT17Y3goXCJjaGlsZHJlblwiLHtmb2N1czpfLmluY2x1ZGVzKG5vZGUuX2xpbmsuY2hpbGRyZW4sIGZvY3VzKX0pfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInZub2RlXCIgPlxuICAgICAgICAgICAgPGRpdiAgY2xhc3NOYW1lPVwibWFpblwiPlxuICAgICAgICAgICAge3JlbmRlcih2bm9kZSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7bm9kZS5fY2hpbGRyZW4ubWFwKG5vZGU9PjxUcmVlQnJvd3NlciBrZXk9e25vZGUuX2lkfSBub2RlPXtub2RlfSB7Li4ub3RoZXJzfSBsZXZlbD17bGV2ZWwrMX0vPil9XG4gICAgICAgICAgPC9kaXY+fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgKTtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyB0cmVlX2Jyb3dzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlPXByb3BzO1xuICAgIGNvbnN0IHt0cmVlfT1wcm9wcztcbiAgfVxuICByZW5kZXIoKSB7XG4gIFx0dmFyIHtyb290LC4uLm90aGVyc309dGhpcy5zdGF0ZTtcbiAgICB2YXIge2ZvY3VzLGV4cGFuZHN9PXRoaXMuc3RhdGU7XG4gICAgaWYoaGFzU2xhc2gocm9vdCl8fGhhc1NsYXNoKHJvb3QpfHxfLnNvbWUoZXhwYW5kcywgaGFzU2xhc2gpKXsgXG4gICAgICByZXR1cm4gbnVsbDsvL+WmguaenOacieeUqOi3r+W+hOihqOekuueahOiKgueCue+8jOmcgOimgei9rOWMluS4umdpZOW9ouW8j+WGjeaYvuekulxuICAgIH1cbiAgXHRyZXR1cm4gPFRyZWVOb2RlUmVhZGVyIGdpZD17cm9vdH0gIHZpZXc9e1RyZWVCcm93c2VyfSAgey4uLm90aGVyc30gbGV2ZWw9ezF9Lz5cbiAgfVxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBtZT10aGlzO1xuICAgIGNvbnN0IHtub2RlLHRyZWV9PXRoaXMucHJvcHM7XG4gICAgY29uc3QgdHJlZXRvb2w9cmVxdWlyZSgndHJlZW5vdGUyL3NyYy9jbGllbnQvdG9vbCcpKHRyZWUpO1xuXG4gICAgLy/lpITnkIbngrnlh7vljaHniYflkI7mlLbliLDnmoTmtojmga9cbiAgICBmdW5jdGlvbiBteXN1YnNjcmliZXIodGFyZ2V0LGRhdGEpe1xuICAgICBjb25zb2xlLmxvZygnZ290Jyx0YXJnZXQsZGF0YSk7XG4gICAgIGlmKGRhdGEubXNnPT0nZm9jdXMnKXsgLy/orr7nva7nhKbngrlcbiAgICAgICBjb25zdCBmb2N1cz1kYXRhLmdpZDtcbiAgICAgICBjb25zdCBwZ2lkPWRhdGEucGdpZDtcbiAgICAgICB2YXIge2V4cGFuZHN9PW1lLnN0YXRlO1xuICAgICAgIGV4cGFuZHM9YnVpbGRFeHBhbmRzV2l0aEZvY3VzKGV4cGFuZHMsZm9jdXMscGdpZCk7XG4gICAgICAgbWUuc2V0U3RhdGUoe2ZvY3VzLGV4cGFuZHN9KTtcbiAgICAgfWVsc2UgaWYoZGF0YS5tc2c9PSdyZWZyZXNoJyl7IC8v5Yi35paw6KeG5Zu+XG4gICAgICBtZS5mb3JjZVVwZGF0ZSgpO1xuICAgICB9ZWxzZSBpZihkYXRhLm1zZz09J21vdmUnKXsgLy/np7vliqjljaHniYdcbiAgICAgIHBhc3RlKGRhdGEuZ2lkLGRhdGEuYmdpZCx0cmVlLHRyZWV0b29sKTtcbiAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRva2VuPVB1YlN1Yi5zdWJzY3JpYmUoXCJUcmVlQnJvd3NlclwiLG15c3Vic2NyaWJlcilcblxuICAgIC8v5oqK6Lev5b6E6L2s5o2i5Li6Z2lk5b2i5byPXG4gICAgdmFyIHtyb290LGZvY3VzLGV4cGFuZHN9PXRoaXMuc3RhdGU7XG4gICAgY29uc3QgX3BhdGgyZ2lkPV8uY3VycnkocGF0aDJnaWQpKHRyZWV0b29sKTsvL+WNleWPguaVsOWHveaVsGZuKGdpZE9yUGF0aClcbiAgICBjb25zdCB0b2dldGhlcj1bcm9vdCxmb2N1cywuLi5leHBhbmRzXTsvL+WQiOW5tuS4gOS4i+aWueS+v+WkhOeQhlxuICAgIFByb21pc2UuYWxsKHRvZ2V0aGVyLm1hcChfcGF0aDJnaWQpKS50aGVuKChbcm9vdCxmb2N1cywuLi5leHBhbmRzXSk9PntcbiAgICAgIG1lLnNldFN0YXRlKHtyb290LGZvY3VzLGV4cGFuZHN9KTtcbiAgICB9KVxuXG4gIH1cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgY29uc3Qge2ZvY3VzfT10aGlzLnN0YXRlO1xuICAgIGQuc2Nyb2xsMmNhcmQoZm9jdXMpO1xuICAgIGQuZW5zdXJlRm9jdXNDb2x1bW4oZm9jdXMpO1xuICB9XG59XG5cbmNvbnN0IGhhc1NsYXNoPShzdHIpPT5zdHIuaW5kZXhPZignLycpPi0xO1xuXG5mdW5jdGlvbiBwYXRoMmdpZCh0cmVldG9vbCxnaWRPclBhdGgpe1xuICByZXR1cm4gaGFzU2xhc2goZ2lkT3JQYXRoKT90cmVldG9vbC5jcmVhdGVOb2RlQnlQYXRoKGdpZE9yUGF0aCkudGhlbihub2RlPT5ub2RlLl9pZCk6UHJvbWlzZS5yZXNvbHZlKGdpZE9yUGF0aCk7Ly/mnInmlpzmnaDnmoTop4bkuLrot6/lvoTvvIzmsqHmnInnmoTop4bkuLpnaWTnm7TmjqXov5Tlm55cbn1cblxuZnVuY3Rpb24gYnVpbGRFeHBhbmRzV2l0aEZvY3VzKGV4cGFuZHMsZm9jdXMscGdpZCkge1xuICB2YXIgaWR4PWV4cGFuZHMuaW5kZXhPZihwZ2lkKTtcbiAgaWYoaWR4PDApe3JldHVybiBleHBhbmRzO30vL+ayoeaJvuWIsOebtOaOpei/lOWbnlxuICBleHBhbmRzPWV4cGFuZHMuc2xpY2UoMCxpZHgrMSk7Ly/niLboioLngrnkuYvliY1cbiAgZXhwYW5kcy5wdXNoKGZvY3VzKTsvL+WKoOWFpeaWsOeahOiKgueCuVxuICByZXR1cm4gZXhwYW5kcztcbn0iXX0=