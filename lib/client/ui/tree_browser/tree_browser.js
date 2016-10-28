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
      { className: cx("children", "focus" + levelDiff) },
      _react2.default.createElement(
        'div',
        { className: 'vnode' },
        _react2.default.createElement(
          'div',
          { className: 'main' },
          render(vnode, levelDiff, focus)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFJLFFBQVMsWUFBVCxDQUFKO0FBQ0osSUFBSSxJQUFFLFFBQVEsUUFBUixDQUFGO0FBQ0osUUFBUSxxQkFBUjtBQUNBLElBQUksU0FBUSxRQUFTLFdBQVQsQ0FBUjtBQUNKLElBQUksSUFBRSxRQUFRLGlCQUFSLENBQUY7QUFDSixJQUFJLFNBQUo7O0FBSUEsU0FBUyxZQUFULENBQXNCLE1BQXRCLEVBQTZCLE1BQTdCLEVBQW9DLFFBQXBDLEVBQTZDOztBQUMzQyxTQUFPLFNBQVMsWUFBVCxDQUFzQixDQUFDLE1BQUQsQ0FBdEIsRUFBK0IsTUFBL0IsRUFBdUMsSUFBdkMsQ0FBNEMsa0JBQVE7QUFDekQsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFmLElBQXVCLENBQUMsQ0FBRCxDQUQyQjtHQUFSLENBQW5ELENBRDJDO0NBQTdDOztBQU1BLFNBQVMsS0FBVCxDQUFlLElBQWYsRUFBb0IsRUFBcEIsRUFBdUIsSUFBdkIsRUFBNEIsUUFBNUIsRUFBcUM7QUFDbkMsZUFBYSxFQUFiLEVBQWdCLElBQWhCLEVBQXFCLFFBQXJCLEVBQStCLElBQS9CLENBQW9DLGtCQUFRO0FBQzFDLFFBQUcsTUFBSCxFQUFVO0FBQ1IsWUFBTSx1QkFBc0IsSUFBdEIsR0FBMkIsTUFBM0IsR0FBa0MsRUFBbEMsQ0FBTixDQURRO0tBQVYsTUFFSzs7QUFFSCxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBd0IsRUFBeEIsRUFBNEIsSUFBNUIsQ0FBaUMsYUFBRztBQUNsQyxvQkFBVSxJQUFWLENBRGtDO0FBRWxDLGVBQU8sT0FBUCxDQUFlLGFBQWYsRUFBNkIsRUFBQyxLQUFJLFNBQUosRUFBOUIsRUFGa0M7T0FBSCxDQUFqQyxDQUZHO0tBRkw7R0FEa0MsQ0FBcEMsQ0FEbUM7Q0FBckM7O0FBY0EsSUFBTSxPQUFLLFNBQUwsSUFBSyxDQUFDLElBQUQsRUFBTSxJQUFOLEVBQVcsUUFBWCxFQUFzQjtBQUM3QixTQUFPOztNQUFLLFdBQVUsTUFBVixFQUFMO0lBQ0c7O1FBQVEsV0FBVSx3QkFBVjtBQUNSLG1CQUFVLE1BQVYsRUFBaUIsYUFBYSxFQUFFLElBQUYsRUFBUSxXQUFXLEVBQUUsT0FBRjtPQURqRDtNQUdFLHFDQUFHLFdBQVUsY0FBVixFQUFILENBSEY7S0FESDtJQU1HOztRQUFRLFdBQVUsd0JBQVYsRUFBbUMsU0FBUyxtQkFBSTtBQUN0RCxzQkFBVSxLQUFLLEdBQUwsQ0FENEM7U0FBSixFQUFwRDtNQUVHLHFDQUFHLFdBQVUsV0FBVixFQUFILENBRkg7S0FOSDtJQVNHOztRQUFRLFdBQVUsd0JBQVYsRUFBb0MsU0FBUyxtQkFBSTs7QUFFdkQsZ0JBQU0sU0FBTixFQUFnQixLQUFLLEdBQUwsRUFBUyxJQUF6QixFQUE4QixRQUE5QixFQUZ1RDtTQUFKLEVBQXJEO01BR0cscUNBQUcsV0FBVSxhQUFWLEVBQUgsQ0FISDtLQVRIO0lBYUc7O1FBQVEsV0FBVSx3QkFBVixFQUFvQyxTQUFTLG1CQUFJO0FBQ3ZELGNBQUksT0FBSyxRQUFRLGVBQVIsQ0FBTDs7QUFEbUQsY0FHcEQsSUFBSCxFQUFRO0FBQ04saUJBQUssTUFBTCxDQUFZLEtBQUssR0FBTCxDQUFaLENBQXNCLElBQXRCLENBQTJCLGFBQUc7QUFDNUIscUJBQU8sT0FBUCxDQUFlLGFBQWYsRUFBNkIsRUFBQyxLQUFJLFNBQUosRUFBOUIsRUFENEI7YUFBSCxDQUEzQixDQURNO1dBQVI7U0FIbUQsRUFBckQ7TUFRRyxxQ0FBRyxXQUFVLGFBQVYsRUFBSCxDQVJIO0tBYkg7R0FBUCxDQUQ2QjtDQUF0Qjs7QUEwQlgsSUFBTSxjQUFZLFNBQVosV0FBWSxDQUFDLEtBQUQsRUFBUztNQUNoQixPQUFnQixNQUFoQixLQURnQjs7TUFDUixrQ0FBUSxpQkFEQTs7TUFFaEIsU0FBMEMsTUFBMUMsT0FGZ0I7TUFFVCxRQUFtQyxNQUFuQyxNQUZTO01BRUgsVUFBNkIsTUFBN0IsUUFGRztNQUVLLE9BQXFCLE1BQXJCLEtBRkw7TUFFVSxRQUFnQixNQUFoQixNQUZWO01BRWdCLFdBQVUsTUFBVixTQUZoQjs7QUFHdkIsTUFBTSxXQUFTLFFBQVEsMkJBQVIsRUFBcUMsSUFBckMsQ0FBVCxDQUhpQjtBQUl2QixNQUFNLFFBQU0sRUFBQyxPQUFNLE9BQU4sRUFBYyxJQUFHLEtBQUssR0FBTCxFQUF4Qjs7Ozs7O0FBSmlCLE1BVW5CLGFBQVcsWUFBVSxVQUFRLENBQVI7QUFWRixNQVduQixhQUFXLENBQVgsQ0FYbUI7QUFZdkIsTUFBRyxVQUFRLENBQVIsRUFBVTtBQUNYLGlCQUFXLFNBQVMsU0FBVCxDQUFtQixJQUFuQixFQUF3QixLQUF4QixDQUFYLENBRFc7QUFFWCxZQUFRLEdBQVIsQ0FBWSxZQUFaLEVBQXlCLFVBQXpCLEVBRlc7R0FBYixNQUdLO0FBQ0gsaUJBQVcsTUFBTSxVQUFOLENBRFI7R0FITDtBQU1BLE1BQU0sWUFBVSxRQUFNLFVBQU47QUFsQk8sU0FvQm5COztNQUFLLFdBQVcsR0FBRyxNQUFILEVBQVUsRUFBQyxPQUFNLFVBQVEsS0FBSyxHQUFMLEVBQXpCLEVBQW1DLEVBQUMsVUFBUyxVQUFULEVBQXBDLENBQVgsRUFBc0UsSUFBSSxLQUFLLEdBQUw7QUFDL0Usb0JBQVksS0FBWixFQURBO0lBRUMsYUFBVyxJQUFYLEdBQWdCOztRQUFLLFdBQVUsTUFBVixFQUFpQixRQUFRLEVBQUUsSUFBRixFQUFRLFlBQVksRUFBRSxRQUFGLEVBQWxEO01BQ1osT0FBTyxJQUFQLENBRFk7TUFFWixLQUFLLElBQUwsRUFBVSxJQUFWLEVBQWUsUUFBZixDQUZZO0tBQWhCO0lBS0UsQ0FBQyxFQUFFLFFBQUYsQ0FBVyxPQUFYLEVBQW1CLEtBQUssR0FBTCxDQUFwQixHQUE4QixJQUE5QixHQUFtQzs7UUFBSyxXQUFXLEdBQUcsVUFBSCxFQUFjLFVBQVEsU0FBUixDQUF6QixFQUFMO01BQ3BDOztVQUFLLFdBQVUsT0FBVixFQUFMO1FBQ0U7O1lBQU0sV0FBVSxNQUFWLEVBQU47VUFDQyxPQUFPLEtBQVAsRUFBYSxTQUFiLEVBQXVCLEtBQXZCLENBREQ7U0FERjtPQURvQztNQU1uQyxLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CO2VBQU0sOEJBQUMsV0FBRCxhQUFhLEtBQUssS0FBSyxHQUFMLEVBQVUsTUFBTSxJQUFOLElBQWdCLFVBQVEsT0FBTyxRQUFNLENBQU4sRUFBUyxZQUFZLFVBQVosR0FBcEU7T0FBTixDQU5nQjtLQUFuQztHQVJQLENBbkJ1QjtDQUFUOztJQXlDRzs7O0FBQ25CLHdCQUFZLEtBQVosRUFBbUI7Ozs0SEFDWCxRQURXOztBQUVqQixVQUFLLEtBQUwsR0FBVyxLQUFYLENBRmlCO1FBR1YsT0FBTSxNQUFOLEtBSFU7O0dBQW5COzs7OzZCQUtTO21CQUNhLEtBQUssS0FBTCxDQURiO1VBQ0gsbUJBREc7O1VBQ0ssb0RBREw7O29CQUVhLEtBQUssS0FBTCxDQUZiO1VBRUYsc0JBRkU7VUFFSSwwQkFGSjs7QUFHUCxVQUFHLFNBQVMsSUFBVCxLQUFnQixTQUFTLElBQVQsQ0FBaEIsSUFBZ0MsRUFBRSxJQUFGLENBQU8sT0FBUCxFQUFnQixRQUFoQixDQUFoQyxFQUEwRDtBQUMzRCxlQUFPLElBQVA7QUFEMkQsT0FBN0Q7QUFHRCxhQUFPLHFFQUFnQixLQUFLLElBQUwsRUFBWSxNQUFNLFdBQU4sSUFBd0IsVUFBUSxPQUFPLENBQVAsR0FBNUQsQ0FBUCxDQU5ROzs7O3dDQVFXO0FBQ2xCLFVBQU0sS0FBRyxJQUFILENBRFk7bUJBRUEsS0FBSyxLQUFMLENBRkE7VUFFWCxtQkFGVztVQUVOLG1CQUZNOztBQUdsQixVQUFNLFdBQVMsUUFBUSwyQkFBUixFQUFxQyxJQUFyQyxDQUFUOzs7QUFIWSxlQU1ULFlBQVQsQ0FBc0IsTUFBdEIsRUFBNkIsSUFBN0IsRUFBa0M7QUFDakMsZ0JBQVEsR0FBUixDQUFZLEtBQVosRUFBa0IsTUFBbEIsRUFBeUIsSUFBekIsRUFEaUM7QUFFakMsWUFBRyxLQUFLLEdBQUwsSUFBVSxPQUFWLEVBQWtCOztBQUNuQixjQUFNLFNBQU0sS0FBSyxHQUFMLENBRE87QUFFbkIsY0FBTSxPQUFLLEtBQUssSUFBTCxDQUZRO2NBR2QsVUFBUyxHQUFHLEtBQUgsQ0FBVCxRQUhjOztBQUluQixvQkFBUSxzQkFBc0IsT0FBdEIsRUFBOEIsTUFBOUIsRUFBb0MsSUFBcEMsQ0FBUixDQUptQjtBQUtuQixhQUFHLFFBQUgsQ0FBWSxFQUFDLGFBQUQsRUFBTyxnQkFBUCxFQUFaLEVBTG1CO1NBQXJCLE1BTU0sSUFBRyxLQUFLLEdBQUwsSUFBVSxTQUFWLEVBQW9COztBQUM1QixhQUFHLFdBQUgsR0FENEI7U0FBdkIsTUFFQSxJQUFHLEtBQUssR0FBTCxJQUFVLE1BQVYsRUFBaUI7O0FBQ3pCLGdCQUFNLEtBQUssR0FBTCxFQUFTLEtBQUssSUFBTCxFQUFVLElBQXpCLEVBQThCLFFBQTlCLEVBRHlCO1NBQXBCO09BVlA7QUFjQSxXQUFLLEtBQUwsR0FBVyxPQUFPLFNBQVAsQ0FBaUIsYUFBakIsRUFBK0IsWUFBL0IsQ0FBWDs7O0FBcEJrQixvQkF1Qk8sS0FBSyxLQUFMLENBdkJQO1VBdUJiLG9CQXZCYTtVQXVCUixzQkF2QlE7VUF1QkYsMEJBdkJFOztBQXdCbEIsVUFBTSxZQUFVLEVBQUUsS0FBRixDQUFRLFFBQVIsRUFBa0IsUUFBbEIsQ0FBVjtBQXhCWSxVQXlCWixZQUFVLE1BQUssaUNBQVMsU0FBeEI7QUF6QlksYUEwQmxCLENBQVEsR0FBUixDQUFZLFNBQVMsR0FBVCxDQUFhLFNBQWIsQ0FBWixFQUFxQyxJQUFyQyxDQUEwQyxnQkFBMkI7OztZQUF6QixnQkFBeUI7WUFBcEIsaUJBQW9COztZQUFYLHlCQUFXOztBQUNuRSxXQUFHLFFBQUgsQ0FBWSxFQUFDLFVBQUQsRUFBTSxZQUFOLEVBQVksZ0JBQVosRUFBWixFQURtRTtPQUEzQixDQUExQyxDQTFCa0I7Ozs7dUNBK0JELFdBQVcsV0FBVztVQUNoQyxRQUFPLEtBQUssS0FBTCxDQUFQLE1BRGdDOztBQUV2QyxRQUFFLFdBQUYsQ0FBYyxLQUFkLEVBRnVDO0FBR3ZDLFFBQUUsaUJBQUYsQ0FBb0IsS0FBcEIsRUFIdUM7Ozs7O0VBN0NELGdCQUFNLFNBQU47O2tCQUFyQjs7QUFvRHJCLElBQU0sV0FBUyxTQUFULFFBQVMsQ0FBQyxHQUFEO1NBQU8sSUFBSSxPQUFKLENBQVksR0FBWixJQUFpQixDQUFDLENBQUQ7Q0FBeEI7O0FBRWYsU0FBUyxRQUFULENBQWtCLFFBQWxCLEVBQTJCLFNBQTNCLEVBQXFDO0FBQ25DLFNBQU8sU0FBUyxTQUFULElBQW9CLFNBQVMsZ0JBQVQsQ0FBMEIsU0FBMUIsRUFBcUMsSUFBckMsQ0FBMEM7V0FBTSxLQUFLLEdBQUw7R0FBTixDQUE5RCxHQUE4RSxRQUFRLE9BQVIsQ0FBZ0IsU0FBaEIsQ0FBOUU7QUFENEIsQ0FBckM7O0FBSUEsU0FBUyxxQkFBVCxDQUErQixPQUEvQixFQUF1QyxLQUF2QyxFQUE2QyxJQUE3QyxFQUFtRDtBQUNqRCxNQUFJLE1BQUksUUFBUSxPQUFSLENBQWdCLElBQWhCLENBQUosQ0FENkM7QUFFakQsTUFBRyxNQUFJLENBQUosRUFBTTtBQUFDLFdBQU8sT0FBUCxDQUFEO0dBQVQ7QUFGaUQsU0FHakQsR0FBUSxRQUFRLEtBQVIsQ0FBYyxDQUFkLEVBQWdCLE1BQUksQ0FBSixDQUF4QjtBQUhpRCxTQUlqRCxDQUFRLElBQVIsQ0FBYSxLQUFiO0FBSmlELFNBSzFDLE9BQVAsQ0FMaUQ7Q0FBbkQiLCJmaWxlIjoidHJlZV9icm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBUcmVlTm9kZVJlYWRlciBmcm9tICd0cmVlbm90ZTIvc3JjL2NsaWVudC91aS90cmVlX25vZGVfcmVhZGVyJztcbnZhciBjeCA9cmVxdWlyZSAoXCJjbGFzc25hbWVzXCIpO1xudmFyIF89cmVxdWlyZShcImxvZGFzaFwiKTtcbnJlcXVpcmUoJy4vdHJlZV9icm93c2VyLmxlc3MnKTtcbnZhciBQdWJTdWIgPXJlcXVpcmUgKFwicHVic3ViLWpzXCIpO1xudmFyIGQ9cmVxdWlyZSgnLi9kb21fb3BlcmF0aW9uJyk7XG52YXIgY2xpcGJvYXJkOy8v5Ymq6LS05p2/77yM55So5LqO5a2Y5pS+5b2T5YmN5Ymq5YiH55qEbm9kZSBpZFxuXG5cblxuZnVuY3Rpb24gaXNEZXNjZW5kYW50KHRhcmdldCxzb3VyY2UsdHJlZXRvb2wpeyAvL2NoZWNrIHdoZXRoZXIgdGFyZ2V0IGlzICBkZXNjZW5kYW50IG9mIHNvdXJjZVxuICByZXR1cm4gdHJlZXRvb2wuZXhwYW5kVG9Sb290KFt0YXJnZXRdLHNvdXJjZSkudGhlbihpZHBhdGg9PntcbiAgICByZXR1cm4gaWRwYXRoLmluZGV4T2Yoc291cmNlKT4tMTtcbiAgfSlcbn1cblxuZnVuY3Rpb24gcGFzdGUoZnJvbSx0byx0cmVlLHRyZWV0b29sKXtcbiAgaXNEZXNjZW5kYW50KHRvLGZyb20sdHJlZXRvb2wpLnRoZW4oY2Fubm90PT57XG4gICAgaWYoY2Fubm90KXtcbiAgICAgIGFsZXJ0KFwiY2Fubm90IHBhc3RlIGZyb20gXCIgK2Zyb20rXCIgdG8gXCIrdG8pXG4gICAgfWVsc2V7XG4gICAgICAvLyBjb25zb2xlLmxvZygnbGV0cyBwYXN0ZScsZnJvbSxcInRvXCIsdG8pXG4gICAgICB0cmVlLm12X2FzX2Jyb3RoZXIoZnJvbSx0bykudGhlbihfPT57XG4gICAgICAgIGNsaXBib2FyZD1udWxsO1xuICAgICAgICBQdWJTdWIucHVibGlzaChcIlRyZWVCcm93c2VyXCIse21zZzpcInJlZnJlc2hcIn0pO1xuICAgICAgfSlcbiAgICB9XG4gIH0pXG59XG5cbmNvbnN0IG1lbnU9KG5vZGUsdHJlZSx0cmVldG9vbCk9PntcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJtZW51XCI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiXG4gICAgICAgICAgICAgIGRyYWdnYWJsZT1cInRydWVcIiBvbkRyYWdTdGFydD17ZC5kcmFnfSBvbkRyYWdFbmQ9e2QuZHJhZ0VuZH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWFycm93c1wiPjwvaT5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiIG9uQ2xpY2s9eygpPT57XG4gICAgICAgICAgICAgICAgY2xpcGJvYXJkPW5vZGUuX2lkO1xuICAgICAgICAgICAgICB9fT48aSBjbGFzc05hbWU9XCJmYSBmYS1jdXRcIj48L2k+PC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaXBib2FyZClcbiAgICAgICAgICAgICAgICBwYXN0ZShjbGlwYm9hcmQsbm9kZS5faWQsdHJlZSx0cmVldG9vbCk7XG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXBhc3RlXCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiAgb25DbGljaz17KCk9PntcbiAgICAgICAgICAgICAgICB2YXIgc3VyZT1jb25maXJtKFwiYXJlIHlvdSBzdXJlP1wiKVxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHN1cmUpO1xuICAgICAgICAgICAgICAgIGlmKHN1cmUpe1xuICAgICAgICAgICAgICAgICAgdHJlZS5yZW1vdmUobm9kZS5faWQpLnRoZW4oXz0+e1xuICAgICAgICAgICAgICAgICAgICBQdWJTdWIucHVibGlzaChcIlRyZWVCcm93c2VyXCIse21zZzpcInJlZnJlc2hcIn0pO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXRyYXNoXCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG59XG5cbmNvbnN0IFRyZWVCcm93c2VyPShwcm9wcyk9PntcbiAgICBjb25zdCB7bm9kZSwuLi5vdGhlcnN9PXByb3BzO1xuICAgIGNvbnN0IHtyZW5kZXIsZm9jdXMsZXhwYW5kcyx0cmVlLGxldmVsLGhpZGVSb290fT1wcm9wcztcbiAgICBjb25zdCB0cmVldG9vbD1yZXF1aXJlKCd0cmVlbm90ZTIvc3JjL2NsaWVudC90b29sJykodHJlZSk7XG4gICAgY29uc3Qgdm5vZGU9e190eXBlOlwidm5vZGVcIixfcDpub2RlLl9pZH1cbiAgICAvL3Rlc3QgYmVnaW5cbiAgICAvLyBpZihub2RlLl9pZD09JzAnKXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdUcmVlQnJvd3Nlcicsbm9kZSk7XG4gICAgLy8gfVxuICAgIC8vdGVzdCBlbmRcbiAgICB2YXIgaXNIaWRlUm9vdD1oaWRlUm9vdCYmbGV2ZWw9PT0xOy8v6ZqQ6JeP56ys5LiA5YiXXG4gICAgdmFyIGZvY3VzTGV2ZWw9MDtcbiAgICBpZihsZXZlbD09PTEpe1xuICAgICAgZm9jdXNMZXZlbD10cmVldG9vbC5maW5kTGV2ZWwobm9kZSxmb2N1cyk7XG4gICAgICBjb25zb2xlLmxvZyhcImZvY3VzTGV2ZWxcIixmb2N1c0xldmVsKTtcbiAgICB9ZWxzZXtcbiAgICAgIGZvY3VzTGV2ZWw9cHJvcHMuZm9jdXNMZXZlbDtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxEaWZmPWxldmVsLWZvY3VzTGV2ZWw7Ly/lvZPliY3nuqfliKvkuI7nhKbngrnnuqfliKvnmoTot53nprtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y3goXCJub2RlXCIse2ZvY3VzOmZvY3VzPT09bm9kZS5faWR9LHtoaWRlUm9vdDppc0hpZGVSb290fSl9IGlkPXtub2RlLl9pZH1cbiAgICAgICAgZGF0YS1sZXZlbD17bGV2ZWx9PlxuICAgICAgICB7aXNIaWRlUm9vdD9udWxsOjxkaXYgY2xhc3NOYW1lPVwibWFpblwiIG9uRHJvcD17ZC5kcm9wfSBvbkRyYWdPdmVyPXtkLmRyYWdvdmVyfT5cbiAgICAgICAgICAgIHtyZW5kZXIobm9kZSl9XG4gICAgICAgICAgICB7bWVudShub2RlLHRyZWUsdHJlZXRvb2wpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICB9XG4gICAgICAgICAgeyFfLmluY2x1ZGVzKGV4cGFuZHMsbm9kZS5faWQpP251bGw6PGRpdiBjbGFzc05hbWU9e2N4KFwiY2hpbGRyZW5cIixcImZvY3VzXCIrbGV2ZWxEaWZmKX0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ2bm9kZVwiID5cbiAgICAgICAgICAgIDxkaXYgIGNsYXNzTmFtZT1cIm1haW5cIj5cbiAgICAgICAgICAgIHtyZW5kZXIodm5vZGUsbGV2ZWxEaWZmLGZvY3VzKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtub2RlLl9jaGlsZHJlbi5tYXAobm9kZT0+PFRyZWVCcm93c2VyIGtleT17bm9kZS5faWR9IG5vZGU9e25vZGV9IHsuLi5vdGhlcnN9IGxldmVsPXtsZXZlbCsxfSBmb2N1c0xldmVsPXtmb2N1c0xldmVsfS8+KX1cbiAgICAgICAgICA8L2Rpdj59XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICApO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHRyZWVfYnJvd3NlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGU9cHJvcHM7XG4gICAgY29uc3Qge3RyZWV9PXByb3BzO1xuICB9XG4gIHJlbmRlcigpIHtcbiAgXHR2YXIge3Jvb3QsLi4ub3RoZXJzfT10aGlzLnN0YXRlO1xuICAgIHZhciB7Zm9jdXMsZXhwYW5kc309dGhpcy5zdGF0ZTtcbiAgICBpZihoYXNTbGFzaChyb290KXx8aGFzU2xhc2gocm9vdCl8fF8uc29tZShleHBhbmRzLCBoYXNTbGFzaCkpeyBcbiAgICAgIHJldHVybiBudWxsOy8v5aaC5p6c5pyJ55So6Lev5b6E6KGo56S655qE6IqC54K577yM6ZyA6KaB6L2s5YyW5Li6Z2lk5b2i5byP5YaN5pi+56S6XG4gICAgfVxuICBcdHJldHVybiA8VHJlZU5vZGVSZWFkZXIgZ2lkPXtyb290fSAgdmlldz17VHJlZUJyb3dzZXJ9ICB7Li4ub3RoZXJzfSBsZXZlbD17MX0vPlxuICB9XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IG1lPXRoaXM7XG4gICAgY29uc3Qge25vZGUsdHJlZX09dGhpcy5wcm9wcztcbiAgICBjb25zdCB0cmVldG9vbD1yZXF1aXJlKCd0cmVlbm90ZTIvc3JjL2NsaWVudC90b29sJykodHJlZSk7XG5cbiAgICAvL+WkhOeQhueCueWHu+WNoeeJh+WQjuaUtuWIsOeahOa2iOaBr1xuICAgIGZ1bmN0aW9uIG15c3Vic2NyaWJlcih0YXJnZXQsZGF0YSl7XG4gICAgIGNvbnNvbGUubG9nKCdnb3QnLHRhcmdldCxkYXRhKTtcbiAgICAgaWYoZGF0YS5tc2c9PSdmb2N1cycpeyAvL+iuvue9rueEpueCuVxuICAgICAgIGNvbnN0IGZvY3VzPWRhdGEuZ2lkO1xuICAgICAgIGNvbnN0IHBnaWQ9ZGF0YS5wZ2lkO1xuICAgICAgIHZhciB7ZXhwYW5kc309bWUuc3RhdGU7XG4gICAgICAgZXhwYW5kcz1idWlsZEV4cGFuZHNXaXRoRm9jdXMoZXhwYW5kcyxmb2N1cyxwZ2lkKTtcbiAgICAgICBtZS5zZXRTdGF0ZSh7Zm9jdXMsZXhwYW5kc30pO1xuICAgICB9ZWxzZSBpZihkYXRhLm1zZz09J3JlZnJlc2gnKXsgLy/liLfmlrDop4blm75cbiAgICAgIG1lLmZvcmNlVXBkYXRlKCk7XG4gICAgIH1lbHNlIGlmKGRhdGEubXNnPT0nbW92ZScpeyAvL+enu+WKqOWNoeeJh1xuICAgICAgcGFzdGUoZGF0YS5naWQsZGF0YS5iZ2lkLHRyZWUsdHJlZXRvb2wpO1xuICAgICB9XG4gICAgfVxuICAgIHRoaXMudG9rZW49UHViU3ViLnN1YnNjcmliZShcIlRyZWVCcm93c2VyXCIsbXlzdWJzY3JpYmVyKVxuXG4gICAgLy/miorot6/lvoTovazmjaLkuLpnaWTlvaLlvI9cbiAgICB2YXIge3Jvb3QsZm9jdXMsZXhwYW5kc309dGhpcy5zdGF0ZTtcbiAgICBjb25zdCBfcGF0aDJnaWQ9Xy5jdXJyeShwYXRoMmdpZCkodHJlZXRvb2wpOy8v5Y2V5Y+C5pWw5Ye95pWwZm4oZ2lkT3JQYXRoKVxuICAgIGNvbnN0IHRvZ2V0aGVyPVtyb290LGZvY3VzLC4uLmV4cGFuZHNdOy8v5ZCI5bm25LiA5LiL5pa55L6/5aSE55CGXG4gICAgUHJvbWlzZS5hbGwodG9nZXRoZXIubWFwKF9wYXRoMmdpZCkpLnRoZW4oKFtyb290LGZvY3VzLC4uLmV4cGFuZHNdKT0+e1xuICAgICAgbWUuc2V0U3RhdGUoe3Jvb3QsZm9jdXMsZXhwYW5kc30pO1xuICAgIH0pXG5cbiAgfVxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICBjb25zdCB7Zm9jdXN9PXRoaXMuc3RhdGU7XG4gICAgZC5zY3JvbGwyY2FyZChmb2N1cyk7XG4gICAgZC5lbnN1cmVGb2N1c0NvbHVtbihmb2N1cyk7XG4gIH1cbn1cblxuY29uc3QgaGFzU2xhc2g9KHN0cik9PnN0ci5pbmRleE9mKCcvJyk+LTE7XG5cbmZ1bmN0aW9uIHBhdGgyZ2lkKHRyZWV0b29sLGdpZE9yUGF0aCl7XG4gIHJldHVybiBoYXNTbGFzaChnaWRPclBhdGgpP3RyZWV0b29sLmNyZWF0ZU5vZGVCeVBhdGgoZ2lkT3JQYXRoKS50aGVuKG5vZGU9Pm5vZGUuX2lkKTpQcm9taXNlLnJlc29sdmUoZ2lkT3JQYXRoKTsvL+acieaWnOadoOeahOinhuS4uui3r+W+hO+8jOayoeacieeahOinhuS4umdpZOebtOaOpei/lOWbnlxufVxuXG5mdW5jdGlvbiBidWlsZEV4cGFuZHNXaXRoRm9jdXMoZXhwYW5kcyxmb2N1cyxwZ2lkKSB7XG4gIHZhciBpZHg9ZXhwYW5kcy5pbmRleE9mKHBnaWQpO1xuICBpZihpZHg8MCl7cmV0dXJuIGV4cGFuZHM7fS8v5rKh5om+5Yiw55u05o6l6L+U5ZueXG4gIGV4cGFuZHM9ZXhwYW5kcy5zbGljZSgwLGlkeCsxKTsvL+eItuiKgueCueS5i+WJjVxuICBleHBhbmRzLnB1c2goZm9jdXMpOy8v5Yqg5YWl5paw55qE6IqC54K5XG4gIHJldHVybiBleHBhbmRzO1xufSJdfQ==