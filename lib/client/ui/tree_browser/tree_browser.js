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
      function mysubscriber(target, data) {
        console.log('got', target, data);
        if (data.msg == 'focus') {
          var focus = data.gid;
          var pgid = data.pgid;
          var expands = me.state.expands;

          expands = buildExpandsWithFocus(expands, focus, pgid);
          me.setState({ focus: focus, expands: expands });
        } else if (data.msg == 'refresh') {
          me.forceUpdate();
        } else if (data.msg == 'move') {
          paste(data.gid, data.bgid, tree, treetool);
        }
      }
      this.token = PubSub.subscribe("TreeBrowser", mysubscriber);
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


function buildExpandsWithFocus(expands, focus, pgid) {
  var idx = expands.indexOf(pgid);
  if (idx < 0) {
    return expands;
  } //没找到直接返回
  expands = expands.slice(0, idx + 1); //父节点之前
  expands.push(focus); //加入新的节点
  return expands;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFJLEtBQUksUUFBUyxZQUFULENBQVI7QUFDQSxJQUFJLElBQUUsUUFBUSxRQUFSLENBQU47QUFDQSxRQUFRLHFCQUFSO0FBQ0EsSUFBSSxTQUFRLFFBQVMsV0FBVCxDQUFaO0FBQ0EsSUFBSSxJQUFFLFFBQVEsaUJBQVIsQ0FBTjtBQUNBLElBQUksU0FBSixDLENBQWM7OztBQUlkLFNBQVMsWUFBVCxDQUFzQixNQUF0QixFQUE2QixNQUE3QixFQUFvQyxRQUFwQyxFQUE2QztBQUFFO0FBQzdDLFNBQU8sU0FBUyxZQUFULENBQXNCLENBQUMsTUFBRCxDQUF0QixFQUErQixNQUEvQixFQUF1QyxJQUF2QyxDQUE0QyxrQkFBUTtBQUN6RCxXQUFPLE9BQU8sT0FBUCxDQUFlLE1BQWYsSUFBdUIsQ0FBQyxDQUEvQjtBQUNELEdBRk0sQ0FBUDtBQUdEOztBQUVELFNBQVMsS0FBVCxDQUFlLElBQWYsRUFBb0IsRUFBcEIsRUFBdUIsSUFBdkIsRUFBNEIsUUFBNUIsRUFBcUM7QUFDbkMsZUFBYSxFQUFiLEVBQWdCLElBQWhCLEVBQXFCLFFBQXJCLEVBQStCLElBQS9CLENBQW9DLGtCQUFRO0FBQzFDLFFBQUcsTUFBSCxFQUFVO0FBQ1IsWUFBTSx1QkFBc0IsSUFBdEIsR0FBMkIsTUFBM0IsR0FBa0MsRUFBeEM7QUFDRCxLQUZELE1BRUs7QUFDSDtBQUNBLFdBQUssYUFBTCxDQUFtQixJQUFuQixFQUF3QixFQUF4QixFQUE0QixJQUE1QixDQUFpQyxhQUFHO0FBQ2xDLG9CQUFVLElBQVY7QUFDQSxlQUFPLE9BQVAsQ0FBZSxhQUFmLEVBQTZCLEVBQUMsS0FBSSxTQUFMLEVBQTdCO0FBQ0QsT0FIRDtBQUlEO0FBQ0YsR0FWRDtBQVdEOztBQUVELElBQU0sT0FBSyxTQUFMLElBQUssQ0FBQyxJQUFELEVBQU0sSUFBTixFQUFXLFFBQVgsRUFBc0I7QUFDN0IsU0FBTztBQUFBO0FBQUEsTUFBSyxXQUFVLE1BQWY7QUFDRztBQUFBO0FBQUEsUUFBUSxXQUFVLHdCQUFsQjtBQUNBLG1CQUFVLE1BRFYsRUFDaUIsYUFBYSxFQUFFLElBRGhDLEVBQ3NDLFdBQVcsRUFBRTtBQURuRDtBQUdFLDJDQUFHLFdBQVUsY0FBYjtBQUhGLEtBREg7QUFNRztBQUFBO0FBQUEsUUFBUSxXQUFVLHdCQUFsQixFQUEyQyxTQUFTLG1CQUFJO0FBQ3RELHNCQUFVLEtBQUssR0FBZjtBQUNELFNBRkQ7QUFFRywyQ0FBRyxXQUFVLFdBQWI7QUFGSCxLQU5IO0FBU0c7QUFBQTtBQUFBLFFBQVEsV0FBVSx3QkFBbEIsRUFBNEMsU0FBUyxtQkFBSTtBQUN2RDtBQUNBLGdCQUFNLFNBQU4sRUFBZ0IsS0FBSyxHQUFyQixFQUF5QixJQUF6QixFQUE4QixRQUE5QjtBQUNELFNBSEQ7QUFHRywyQ0FBRyxXQUFVLGFBQWI7QUFISCxLQVRIO0FBYUc7QUFBQTtBQUFBLFFBQVEsV0FBVSx3QkFBbEIsRUFBNEMsU0FBUyxtQkFBSTtBQUN2RCxjQUFJLE9BQUssUUFBUSxlQUFSLENBQVQ7QUFDQTtBQUNBLGNBQUcsSUFBSCxFQUFRO0FBQ04saUJBQUssTUFBTCxDQUFZLEtBQUssR0FBakIsRUFBc0IsSUFBdEIsQ0FBMkIsYUFBRztBQUM1QixxQkFBTyxPQUFQLENBQWUsYUFBZixFQUE2QixFQUFDLEtBQUksU0FBTCxFQUE3QjtBQUNELGFBRkQ7QUFHRDtBQUNGLFNBUkQ7QUFRRywyQ0FBRyxXQUFVLGFBQWI7QUFSSDtBQWJILEdBQVA7QUF1QkgsQ0F4QkQ7O0FBMEJBLElBQU0sY0FBWSxTQUFaLFdBQVksQ0FBQyxLQUFELEVBQVM7QUFBQSxNQUNoQixJQURnQixHQUNBLEtBREEsQ0FDaEIsSUFEZ0I7O0FBQUEsTUFDUixNQURRLDRCQUNBLEtBREE7O0FBQUEsTUFFaEIsTUFGZ0IsR0FFMEIsS0FGMUIsQ0FFaEIsTUFGZ0I7QUFBQSxNQUVULEtBRlMsR0FFMEIsS0FGMUIsQ0FFVCxLQUZTO0FBQUEsTUFFSCxPQUZHLEdBRTBCLEtBRjFCLENBRUgsT0FGRztBQUFBLE1BRUssSUFGTCxHQUUwQixLQUYxQixDQUVLLElBRkw7QUFBQSxNQUVVLEtBRlYsR0FFMEIsS0FGMUIsQ0FFVSxLQUZWO0FBQUEsTUFFZ0IsUUFGaEIsR0FFMEIsS0FGMUIsQ0FFZ0IsUUFGaEI7O0FBR3ZCLE1BQU0sV0FBUyxRQUFRLDJCQUFSLEVBQXFDLElBQXJDLENBQWY7QUFDQSxNQUFNLFFBQU0sRUFBQyxPQUFNLE9BQVAsRUFBZSxJQUFHLEtBQUssR0FBdkIsRUFBWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFJLGFBQVcsWUFBVSxVQUFRLENBQWpDO0FBQ0EsU0FDSTtBQUFBO0FBQUEsTUFBSyxXQUFXLEdBQUcsTUFBSCxFQUFVLEVBQUMsT0FBTSxVQUFRLEtBQUssR0FBcEIsRUFBVixFQUFtQyxFQUFDLFVBQVMsVUFBVixFQUFuQyxDQUFoQixFQUEyRSxJQUFJLEtBQUssR0FBcEY7QUFDQSxvQkFBWSxLQURaO0FBRUMsaUJBQVcsSUFBWCxHQUFnQjtBQUFBO0FBQUEsUUFBSyxXQUFVLE1BQWYsRUFBc0IsUUFBUSxFQUFFLElBQWhDLEVBQXNDLFlBQVksRUFBRSxRQUFwRDtBQUNaLGFBQU8sSUFBUCxDQURZO0FBRVosV0FBSyxJQUFMLEVBQVUsSUFBVixFQUFlLFFBQWY7QUFGWSxLQUZqQjtBQU9HLEtBQUMsRUFBRSxRQUFGLENBQVcsT0FBWCxFQUFtQixLQUFLLEdBQXhCLENBQUQsR0FBOEIsSUFBOUIsR0FBbUM7QUFBQTtBQUFBLFFBQUssV0FBVyxHQUFHLFVBQUgsRUFBYyxFQUFDLE9BQU0sRUFBRSxRQUFGLENBQVcsS0FBSyxLQUFMLENBQVcsUUFBdEIsRUFBZ0MsS0FBaEMsQ0FBUCxFQUFkLENBQWhCO0FBQ3BDO0FBQUE7QUFBQSxVQUFLLFdBQVUsT0FBZjtBQUNFO0FBQUE7QUFBQSxZQUFNLFdBQVUsTUFBaEI7QUFDQyxpQkFBTyxLQUFQO0FBREQ7QUFERixPQURvQztBQU1uQyxXQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CO0FBQUEsZUFBTSw4QkFBQyxXQUFELGFBQWEsS0FBSyxLQUFLLEdBQXZCLEVBQTRCLE1BQU0sSUFBbEMsSUFBNEMsTUFBNUMsSUFBb0QsT0FBTyxRQUFNLENBQWpFLElBQU47QUFBQSxPQUFuQjtBQU5tQztBQVB0QyxHQURKO0FBbUJILENBOUJEOztJQWlDcUIsWTs7O0FBQ25CLHdCQUFZLEtBQVosRUFBbUI7QUFBQTs7QUFBQSw0SEFDWCxLQURXOztBQUVqQixVQUFLLEtBQUwsR0FBVyxLQUFYO0FBRmlCLFFBR1YsSUFIVSxHQUdKLEtBSEksQ0FHVixJQUhVO0FBQUE7QUFJbEI7Ozs7NkJBQ1E7QUFBQSxtQkFDYSxLQUFLLEtBRGxCO0FBQUEsVUFDSCxJQURHLFVBQ0gsSUFERzs7QUFBQSxVQUNLLE1BREw7O0FBRVIsYUFBTyxxRUFBZ0IsS0FBSyxJQUFyQixFQUE0QixNQUFNLFdBQWxDLElBQW9ELE1BQXBELElBQTRELE9BQU8sQ0FBbkUsSUFBUDtBQUNBOzs7d0NBQ21CO0FBQ2xCLFVBQU0sS0FBRyxJQUFUO0FBRGtCLG1CQUVBLEtBQUssS0FGTDtBQUFBLFVBRVgsSUFGVyxVQUVYLElBRlc7QUFBQSxVQUVOLElBRk0sVUFFTixJQUZNOztBQUdsQixVQUFNLFdBQVMsUUFBUSwyQkFBUixFQUFxQyxJQUFyQyxDQUFmO0FBQ0EsZUFBUyxZQUFULENBQXNCLE1BQXRCLEVBQTZCLElBQTdCLEVBQWtDO0FBQ2pDLGdCQUFRLEdBQVIsQ0FBWSxLQUFaLEVBQWtCLE1BQWxCLEVBQXlCLElBQXpCO0FBQ0EsWUFBRyxLQUFLLEdBQUwsSUFBVSxPQUFiLEVBQXFCO0FBQ25CLGNBQU0sUUFBTSxLQUFLLEdBQWpCO0FBQ0EsY0FBTSxPQUFLLEtBQUssSUFBaEI7QUFGbUIsY0FHZCxPQUhjLEdBR0wsR0FBRyxLQUhFLENBR2QsT0FIYzs7QUFJbkIsb0JBQVEsc0JBQXNCLE9BQXRCLEVBQThCLEtBQTlCLEVBQW9DLElBQXBDLENBQVI7QUFDQSxhQUFHLFFBQUgsQ0FBWSxFQUFDLFlBQUQsRUFBTyxnQkFBUCxFQUFaO0FBQ0QsU0FORCxNQU1NLElBQUcsS0FBSyxHQUFMLElBQVUsU0FBYixFQUF1QjtBQUM1QixhQUFHLFdBQUg7QUFDQSxTQUZLLE1BRUEsSUFBRyxLQUFLLEdBQUwsSUFBVSxNQUFiLEVBQW9CO0FBQ3pCLGdCQUFNLEtBQUssR0FBWCxFQUFlLEtBQUssSUFBcEIsRUFBeUIsSUFBekIsRUFBOEIsUUFBOUI7QUFDQTtBQUNEO0FBQ0QsV0FBSyxLQUFMLEdBQVcsT0FBTyxTQUFQLENBQWlCLGFBQWpCLEVBQStCLFlBQS9CLENBQVg7QUFDRDs7O3VDQUNrQixTLEVBQVcsUyxFQUFXO0FBQUEsVUFDaEMsS0FEZ0MsR0FDekIsS0FBSyxLQURvQixDQUNoQyxLQURnQzs7QUFFdkMsUUFBRSxXQUFGLENBQWMsS0FBZDtBQUNBLFFBQUUsaUJBQUYsQ0FBb0IsS0FBcEI7QUFDRDs7OztFQWxDdUMsZ0JBQU0sUzs7a0JBQTNCLFk7OztBQXFDckIsU0FBUyxxQkFBVCxDQUErQixPQUEvQixFQUF1QyxLQUF2QyxFQUE2QyxJQUE3QyxFQUFtRDtBQUNqRCxNQUFJLE1BQUksUUFBUSxPQUFSLENBQWdCLElBQWhCLENBQVI7QUFDQSxNQUFHLE1BQUksQ0FBUCxFQUFTO0FBQUMsV0FBTyxPQUFQO0FBQWdCLEdBRnVCLENBRXZCO0FBQzFCLFlBQVEsUUFBUSxLQUFSLENBQWMsQ0FBZCxFQUFnQixNQUFJLENBQXBCLENBQVIsQ0FIaUQsQ0FHbEI7QUFDL0IsVUFBUSxJQUFSLENBQWEsS0FBYixFQUppRCxDQUk3QjtBQUNwQixTQUFPLE9BQVA7QUFDRCIsImZpbGUiOiJ0cmVlX2Jyb3dzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgVHJlZU5vZGVSZWFkZXIgZnJvbSAndHJlZW5vdGUyL3NyYy9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlcic7XHJcbnZhciBjeCA9cmVxdWlyZSAoXCJjbGFzc25hbWVzXCIpO1xyXG52YXIgXz1yZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5yZXF1aXJlKCcuL3RyZWVfYnJvd3Nlci5sZXNzJyk7XHJcbnZhciBQdWJTdWIgPXJlcXVpcmUgKFwicHVic3ViLWpzXCIpO1xyXG52YXIgZD1yZXF1aXJlKCcuL2RvbV9vcGVyYXRpb24nKTtcclxudmFyIGNsaXBib2FyZDsvL+WJqui0tOadv++8jOeUqOS6juWtmOaUvuW9k+WJjeWJquWIh+eahG5vZGUgaWRcclxuXHJcblxyXG5cclxuZnVuY3Rpb24gaXNEZXNjZW5kYW50KHRhcmdldCxzb3VyY2UsdHJlZXRvb2wpeyAvL2NoZWNrIHdoZXRoZXIgdGFyZ2V0IGlzICBkZXNjZW5kYW50IG9mIHNvdXJjZVxyXG4gIHJldHVybiB0cmVldG9vbC5leHBhbmRUb1Jvb3QoW3RhcmdldF0sc291cmNlKS50aGVuKGlkcGF0aD0+e1xyXG4gICAgcmV0dXJuIGlkcGF0aC5pbmRleE9mKHNvdXJjZSk+LTE7XHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gcGFzdGUoZnJvbSx0byx0cmVlLHRyZWV0b29sKXtcclxuICBpc0Rlc2NlbmRhbnQodG8sZnJvbSx0cmVldG9vbCkudGhlbihjYW5ub3Q9PntcclxuICAgIGlmKGNhbm5vdCl7XHJcbiAgICAgIGFsZXJ0KFwiY2Fubm90IHBhc3RlIGZyb20gXCIgK2Zyb20rXCIgdG8gXCIrdG8pXHJcbiAgICB9ZWxzZXtcclxuICAgICAgLy8gY29uc29sZS5sb2coJ2xldHMgcGFzdGUnLGZyb20sXCJ0b1wiLHRvKVxyXG4gICAgICB0cmVlLm12X2FzX2Jyb3RoZXIoZnJvbSx0bykudGhlbihfPT57XHJcbiAgICAgICAgY2xpcGJvYXJkPW51bGw7XHJcbiAgICAgICAgUHViU3ViLnB1Ymxpc2goXCJUcmVlQnJvd3NlclwiLHttc2c6XCJyZWZyZXNoXCJ9KTtcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9KVxyXG59XHJcblxyXG5jb25zdCBtZW51PShub2RlLHRyZWUsdHJlZXRvb2wpPT57XHJcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJtZW51XCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCJcclxuICAgICAgICAgICAgICBkcmFnZ2FibGU9XCJ0cnVlXCIgb25EcmFnU3RhcnQ9e2QuZHJhZ30gb25EcmFnRW5kPXtkLmRyYWdFbmR9XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtYXJyb3dzXCI+PC9pPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiIG9uQ2xpY2s9eygpPT57XHJcbiAgICAgICAgICAgICAgICBjbGlwYm9hcmQ9bm9kZS5faWQ7XHJcbiAgICAgICAgICAgICAgfX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtY3V0XCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY2xpcGJvYXJkKVxyXG4gICAgICAgICAgICAgICAgcGFzdGUoY2xpcGJvYXJkLG5vZGUuX2lkLHRyZWUsdHJlZXRvb2wpO1xyXG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXBhc3RlXCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgdmFyIHN1cmU9Y29uZmlybShcImFyZSB5b3Ugc3VyZT9cIilcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHN1cmUpO1xyXG4gICAgICAgICAgICAgICAgaWYoc3VyZSl7XHJcbiAgICAgICAgICAgICAgICAgIHRyZWUucmVtb3ZlKG5vZGUuX2lkKS50aGVuKF89PntcclxuICAgICAgICAgICAgICAgICAgICBQdWJTdWIucHVibGlzaChcIlRyZWVCcm93c2VyXCIse21zZzpcInJlZnJlc2hcIn0pO1xyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXRyYXNoXCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxufVxyXG5cclxuY29uc3QgVHJlZUJyb3dzZXI9KHByb3BzKT0+e1xyXG4gICAgY29uc3Qge25vZGUsLi4ub3RoZXJzfT1wcm9wcztcclxuICAgIGNvbnN0IHtyZW5kZXIsZm9jdXMsZXhwYW5kcyx0cmVlLGxldmVsLGhpZGVSb290fT1wcm9wcztcclxuICAgIGNvbnN0IHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcclxuICAgIGNvbnN0IHZub2RlPXtfdHlwZTpcInZub2RlXCIsX3A6bm9kZS5faWR9XHJcbiAgICAvL3Rlc3QgYmVnaW5cclxuICAgIC8vIGlmKG5vZGUuX2lkPT0nMCcpe1xyXG4gICAgLy8gICBjb25zb2xlLmxvZygnVHJlZUJyb3dzZXInLG5vZGUpO1xyXG4gICAgLy8gfVxyXG4gICAgLy90ZXN0IGVuZFxyXG4gICAgdmFyIGlzSGlkZVJvb3Q9aGlkZVJvb3QmJmxldmVsPT09MTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2N4KFwibm9kZVwiLHtmb2N1czpmb2N1cz09PW5vZGUuX2lkfSx7aGlkZVJvb3Q6aXNIaWRlUm9vdH0pfSBpZD17bm9kZS5faWR9XHJcbiAgICAgICAgZGF0YS1sZXZlbD17bGV2ZWx9PlxyXG4gICAgICAgIHtpc0hpZGVSb290P251bGw6PGRpdiBjbGFzc05hbWU9XCJtYWluXCIgb25Ecm9wPXtkLmRyb3B9IG9uRHJhZ092ZXI9e2QuZHJhZ292ZXJ9PlxyXG4gICAgICAgICAgICB7cmVuZGVyKG5vZGUpfVxyXG4gICAgICAgICAgICB7bWVudShub2RlLHRyZWUsdHJlZXRvb2wpfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgeyFfLmluY2x1ZGVzKGV4cGFuZHMsbm9kZS5faWQpP251bGw6PGRpdiBjbGFzc05hbWU9e2N4KFwiY2hpbGRyZW5cIix7Zm9jdXM6Xy5pbmNsdWRlcyhub2RlLl9saW5rLmNoaWxkcmVuLCBmb2N1cyl9KX0+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInZub2RlXCIgPlxyXG4gICAgICAgICAgICA8ZGl2ICBjbGFzc05hbWU9XCJtYWluXCI+XHJcbiAgICAgICAgICAgIHtyZW5kZXIodm5vZGUpfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAge25vZGUuX2NoaWxkcmVuLm1hcChub2RlPT48VHJlZUJyb3dzZXIga2V5PXtub2RlLl9pZH0gbm9kZT17bm9kZX0gey4uLm90aGVyc30gbGV2ZWw9e2xldmVsKzF9Lz4pfVxyXG4gICAgICAgICAgPC9kaXY+fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIFxyXG4gICAgKTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHRyZWVfYnJvd3NlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzKTtcclxuICAgIHRoaXMuc3RhdGU9cHJvcHM7XHJcbiAgICBjb25zdCB7dHJlZX09cHJvcHM7XHJcbiAgfVxyXG4gIHJlbmRlcigpIHtcclxuICBcdHZhciB7cm9vdCwuLi5vdGhlcnN9PXRoaXMuc3RhdGU7XHJcbiAgXHRyZXR1cm4gPFRyZWVOb2RlUmVhZGVyIGdpZD17cm9vdH0gIHZpZXc9e1RyZWVCcm93c2VyfSAgey4uLm90aGVyc30gbGV2ZWw9ezF9Lz5cclxuICB9XHJcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgY29uc3Qge25vZGUsdHJlZX09dGhpcy5wcm9wcztcclxuICAgIGNvbnN0IHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcclxuICAgIGZ1bmN0aW9uIG15c3Vic2NyaWJlcih0YXJnZXQsZGF0YSl7XHJcbiAgICAgY29uc29sZS5sb2coJ2dvdCcsdGFyZ2V0LGRhdGEpO1xyXG4gICAgIGlmKGRhdGEubXNnPT0nZm9jdXMnKXtcclxuICAgICAgIGNvbnN0IGZvY3VzPWRhdGEuZ2lkO1xyXG4gICAgICAgY29uc3QgcGdpZD1kYXRhLnBnaWQ7XHJcbiAgICAgICB2YXIge2V4cGFuZHN9PW1lLnN0YXRlO1xyXG4gICAgICAgZXhwYW5kcz1idWlsZEV4cGFuZHNXaXRoRm9jdXMoZXhwYW5kcyxmb2N1cyxwZ2lkKTtcclxuICAgICAgIG1lLnNldFN0YXRlKHtmb2N1cyxleHBhbmRzfSk7XHJcbiAgICAgfWVsc2UgaWYoZGF0YS5tc2c9PSdyZWZyZXNoJyl7XHJcbiAgICAgIG1lLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgfWVsc2UgaWYoZGF0YS5tc2c9PSdtb3ZlJyl7XHJcbiAgICAgIHBhc3RlKGRhdGEuZ2lkLGRhdGEuYmdpZCx0cmVlLHRyZWV0b29sKTtcclxuICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnRva2VuPVB1YlN1Yi5zdWJzY3JpYmUoXCJUcmVlQnJvd3NlclwiLG15c3Vic2NyaWJlcilcclxuICB9XHJcbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XHJcbiAgICBjb25zdCB7Zm9jdXN9PXRoaXMuc3RhdGU7XHJcbiAgICBkLnNjcm9sbDJjYXJkKGZvY3VzKTtcclxuICAgIGQuZW5zdXJlRm9jdXNDb2x1bW4oZm9jdXMpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYnVpbGRFeHBhbmRzV2l0aEZvY3VzKGV4cGFuZHMsZm9jdXMscGdpZCkge1xyXG4gIHZhciBpZHg9ZXhwYW5kcy5pbmRleE9mKHBnaWQpO1xyXG4gIGlmKGlkeDwwKXtyZXR1cm4gZXhwYW5kczt9Ly/msqHmib7liLDnm7TmjqXov5Tlm55cclxuICBleHBhbmRzPWV4cGFuZHMuc2xpY2UoMCxpZHgrMSk7Ly/niLboioLngrnkuYvliY1cclxuICBleHBhbmRzLnB1c2goZm9jdXMpOy8v5Yqg5YWl5paw55qE6IqC54K5XHJcbiAgcmV0dXJuIGV4cGFuZHM7XHJcbn0iXX0=