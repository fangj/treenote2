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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyMy90cmVlX2Jyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFJLFFBQVMsWUFBVCxDQUFSO0FBQ0EsSUFBSSxJQUFFLFFBQVEsUUFBUixDQUFOO0FBQ0EsUUFBUSxxQkFBUjtBQUNBLElBQUksU0FBUSxRQUFTLFdBQVQsQ0FBWjtBQUNBLElBQUksSUFBRSxRQUFRLGlCQUFSLENBQU47QUFDQSxJQUFJLFNBQUosQyxDQUFjOzs7QUFJZCxTQUFTLFlBQVQsQ0FBc0IsTUFBdEIsRUFBNkIsTUFBN0IsRUFBb0MsUUFBcEMsRUFBNkM7QUFBRTtBQUM3QyxTQUFPLFNBQVMsWUFBVCxDQUFzQixDQUFDLE1BQUQsQ0FBdEIsRUFBK0IsTUFBL0IsRUFBdUMsSUFBdkMsQ0FBNEMsa0JBQVE7QUFDekQsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFmLElBQXVCLENBQUMsQ0FBL0I7QUFDRCxHQUZNLENBQVA7QUFHRDs7QUFFRCxTQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQW9CLEVBQXBCLEVBQXVCLElBQXZCLEVBQTRCLFFBQTVCLEVBQXFDO0FBQ25DLGVBQWEsRUFBYixFQUFnQixJQUFoQixFQUFxQixRQUFyQixFQUErQixJQUEvQixDQUFvQyxrQkFBUTtBQUMxQyxRQUFHLE1BQUgsRUFBVTtBQUNSLFlBQU0sdUJBQXNCLElBQXRCLEdBQTJCLE1BQTNCLEdBQWtDLEVBQXhDO0FBQ0QsS0FGRCxNQUVLO0FBQ0g7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBd0IsRUFBeEIsRUFBNEIsSUFBNUIsQ0FBaUMsYUFBRztBQUNsQyxvQkFBVSxJQUFWO0FBQ0EsZUFBTyxPQUFQLENBQWUsYUFBZixFQUE2QixFQUFDLEtBQUksU0FBTCxFQUE3QjtBQUNELE9BSEQ7QUFJRDtBQUNGLEdBVkQ7QUFXRDs7QUFFRCxJ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QixLQUE5QixFQUFvQyxJQUFwQyxDQUFSO0FBQ0EsYUFBRyxRQUFILENBQVksRUFBQyxZQUFELEVBQU8sZ0JBQVAsRUFBWjtBQUNELFNBTkQsTUFNTSxJQUFHLEtBQUssR0FBTCxJQUFVLFNBQWIsRUFBdUI7QUFDNUIsYUFBRyxXQUFIO0FBQ0EsU0FGSyxNQUVBLElBQUcsS0FBSyxHQUFMLElBQVUsTUFBYixFQUFvQjtBQUN6QixnQkFBTSxLQUFLLEdBQVgsRUFBZSxLQUFLLElBQXBCLEVBQXlCLElBQXpCLEVBQThCLFFBQTlCO0FBQ0E7QUFDRDtBQUNELFdBQUssS0FBTCxHQUFXLE9BQU8sU0FBUCxDQUFpQixhQUFqQixFQUErQixZQUEvQixDQUFYO0FBQ0Q7Ozt1Q0FDa0IsUyxFQUFXLFMsRUFBVztBQUFBLFVBQ2hDLEtBRGdDLEdBQ3pCLEtBQUssS0FEb0IsQ0FDaEMsS0FEZ0M7O0FBRXZDLFFBQUUsV0FBRixDQUFjLEtBQWQ7QUFDQSxRQUFFLGlCQUFGLENBQW9CLEtBQXBCO0FBQ0Q7Ozs7RUFsQ3VDLGdCQUFNLFM7O2tCQUEzQixZOzs7QUFxQ3JCLFNBQVMscUJBQVQsQ0FBK0IsT0FBL0IsRUFBdUMsS0FBdkMsRUFBNkMsSUFBN0MsRUFBbUQ7QUFDakQsTUFBSSxNQUFJLFFBQVEsT0FBUixDQUFnQixJQUFoQixDQUFSO0FBQ0EsTUFBRyxNQUFJLENBQVAsRUFBUztBQUFDLFdBQU8sT0FBUDtBQUFnQixHQUZ1QixDQUV2QjtBQUMxQixZQUFRLFFBQVEsS0FBUixDQUFjLENBQWQsRUFBZ0IsTUFBSSxDQUFwQixDQUFSLENBSGlELENBR2xCO0FBQy9CLFVBQVEsSUFBUixDQUFhLEtBQWIsRUFKaUQsQ0FJN0I7QUFDcEIsU0FBTyxPQUFQO0FBQ0QiLCJmaWxlIjoidHJlZV9icm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IFRyZWVOb2RlUmVhZGVyIGZyb20gJ3RyZWVub3RlMi9zcmMvY2xpZW50L3VpL3RyZWVfbm9kZV9yZWFkZXInO1xyXG52YXIgY3ggPXJlcXVpcmUgKFwiY2xhc3NuYW1lc1wiKTtcclxudmFyIF89cmVxdWlyZShcImxvZGFzaFwiKTtcclxucmVxdWlyZSgnLi90cmVlX2Jyb3dzZXIubGVzcycpO1xyXG52YXIgUHViU3ViID1yZXF1aXJlIChcInB1YnN1Yi1qc1wiKTtcclxudmFyIGQ9cmVxdWlyZSgnLi9kb21fb3BlcmF0aW9uJyk7XHJcbnZhciBjbGlwYm9hcmQ7Ly/liarotLTmnb/vvIznlKjkuo7lrZjmlL7lvZPliY3liarliIfnmoRub2RlIGlkXHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGlzRGVzY2VuZGFudCh0YXJnZXQsc291cmNlLHRyZWV0b29sKXsgLy9jaGVjayB3aGV0aGVyIHRhcmdldCBpcyAgZGVzY2VuZGFudCBvZiBzb3VyY2VcclxuICByZXR1cm4gdHJlZXRvb2wuZXhwYW5kVG9Sb290KFt0YXJnZXRdLHNvdXJjZSkudGhlbihpZHBhdGg9PntcclxuICAgIHJldHVybiBpZHBhdGguaW5kZXhPZihzb3VyY2UpPi0xO1xyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhc3RlKGZyb20sdG8sdHJlZSx0cmVldG9vbCl7XHJcbiAgaXNEZXNjZW5kYW50KHRvLGZyb20sdHJlZXRvb2wpLnRoZW4oY2Fubm90PT57XHJcbiAgICBpZihjYW5ub3Qpe1xyXG4gICAgICBhbGVydChcImNhbm5vdCBwYXN0ZSBmcm9tIFwiICtmcm9tK1wiIHRvIFwiK3RvKVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdsZXRzIHBhc3RlJyxmcm9tLFwidG9cIix0bylcclxuICAgICAgdHJlZS5tdl9hc19icm90aGVyKGZyb20sdG8pLnRoZW4oXz0+e1xyXG4gICAgICAgIGNsaXBib2FyZD1udWxsO1xyXG4gICAgICAgIFB1YlN1Yi5wdWJsaXNoKFwiVHJlZUJyb3dzZXJcIix7bXNnOlwicmVmcmVzaFwifSk7XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG5cclxuY29uc3QgbWVudT0obm9kZSx0cmVlLHRyZWV0b29sKT0+e1xyXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibWVudVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiXHJcbiAgICAgICAgICAgICAgZHJhZ2dhYmxlPVwidHJ1ZVwiIG9uRHJhZ1N0YXJ0PXtkLmRyYWd9IG9uRHJhZ0VuZD17ZC5kcmFnRW5kfVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWFycm93c1wiPjwvaT5cclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgY2xpcGJvYXJkPW5vZGUuX2lkO1xyXG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLWN1dFwiPjwvaT48L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiAgb25DbGljaz17KCk9PntcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaXBib2FyZClcclxuICAgICAgICAgICAgICAgIHBhc3RlKGNsaXBib2FyZCxub2RlLl9pZCx0cmVlLHRyZWV0b29sKTtcclxuICAgICAgICAgICAgICB9fT48aSBjbGFzc05hbWU9XCJmYSBmYS1wYXN0ZVwiPjwvaT48L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4teHNcIiAgb25DbGljaz17KCk9PntcclxuICAgICAgICAgICAgICAgIHZhciBzdXJlPWNvbmZpcm0oXCJhcmUgeW91IHN1cmU/XCIpXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzdXJlKTtcclxuICAgICAgICAgICAgICAgIGlmKHN1cmUpe1xyXG4gICAgICAgICAgICAgICAgICB0cmVlLnJlbW92ZShub2RlLl9pZCkudGhlbihfPT57XHJcbiAgICAgICAgICAgICAgICAgICAgUHViU3ViLnB1Ymxpc2goXCJUcmVlQnJvd3NlclwiLHttc2c6XCJyZWZyZXNoXCJ9KTtcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9fT48aSBjbGFzc05hbWU9XCJmYSBmYS10cmFzaFwiPjwvaT48L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbn1cclxuXHJcbmNvbnN0IFRyZWVCcm93c2VyPShwcm9wcyk9PntcclxuICAgIGNvbnN0IHtub2RlLC4uLm90aGVyc309cHJvcHM7XHJcbiAgICBjb25zdCB7cmVuZGVyLGZvY3VzLGV4cGFuZHMsdHJlZSxsZXZlbCxoaWRlUm9vdH09cHJvcHM7XHJcbiAgICBjb25zdCB0cmVldG9vbD1yZXF1aXJlKCd0cmVlbm90ZTIvc3JjL2NsaWVudC90b29sJykodHJlZSk7XHJcbiAgICBjb25zdCB2bm9kZT17X3R5cGU6XCJ2bm9kZVwiLF9wOm5vZGUuX2lkfVxyXG4gICAgLy90ZXN0IGJlZ2luXHJcbiAgICAvLyBpZihub2RlLl9pZD09JzAnKXtcclxuICAgIC8vICAgY29uc29sZS5sb2coJ1RyZWVCcm93c2VyJyxub2RlKTtcclxuICAgIC8vIH1cclxuICAgIC8vdGVzdCBlbmRcclxuICAgIHZhciBpc0hpZGVSb290PWhpZGVSb290JiZsZXZlbD09PTE7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeChcIm5vZGVcIix7Zm9jdXM6Zm9jdXM9PT1ub2RlLl9pZH0se2hpZGVSb290OmlzSGlkZVJvb3R9KX0gaWQ9e25vZGUuX2lkfVxyXG4gICAgICAgIGRhdGEtbGV2ZWw9e2xldmVsfT5cclxuICAgICAgICB7aXNIaWRlUm9vdD9udWxsOjxkaXYgY2xhc3NOYW1lPVwibWFpblwiIG9uRHJvcD17ZC5kcm9wfSBvbkRyYWdPdmVyPXtkLmRyYWdvdmVyfT5cclxuICAgICAgICAgICAge3JlbmRlcihub2RlKX1cclxuICAgICAgICAgICAge21lbnUobm9kZSx0cmVlLHRyZWV0b29sKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIH1cclxuICAgICAgICAgIHshXy5pbmNsdWRlcyhleHBhbmRzLG5vZGUuX2lkKT9udWxsOjxkaXYgY2xhc3NOYW1lPXtjeChcImNoaWxkcmVuXCIse2ZvY3VzOl8uaW5jbHVkZXMobm9kZS5fbGluay5jaGlsZHJlbiwgZm9jdXMpfSl9PlxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ2bm9kZVwiID5cclxuICAgICAgICAgICAgPGRpdiAgY2xhc3NOYW1lPVwibWFpblwiPlxyXG4gICAgICAgICAgICB7cmVuZGVyKHZub2RlKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIHtub2RlLl9jaGlsZHJlbi5tYXAobm9kZT0+PFRyZWVCcm93c2VyIGtleT17bm9kZS5faWR9IG5vZGU9e25vZGV9IHsuLi5vdGhlcnN9IGxldmVsPXtsZXZlbCsxfS8+KX1cclxuICAgICAgICAgIDwvZGl2Pn1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICBcclxuICAgICk7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyB0cmVlX2Jyb3dzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgICB0aGlzLnN0YXRlPXByb3BzO1xyXG4gICAgY29uc3Qge3RyZWV9PXByb3BzO1xyXG4gIH1cclxuICByZW5kZXIoKSB7XHJcbiAgXHR2YXIge3Jvb3QsLi4ub3RoZXJzfT10aGlzLnN0YXRlO1xyXG4gIFx0cmV0dXJuIDxUcmVlTm9kZVJlYWRlciBnaWQ9e3Jvb3R9ICB2aWV3PXtUcmVlQnJvd3Nlcn0gIHsuLi5vdGhlcnN9IGxldmVsPXsxfS8+XHJcbiAgfVxyXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gICAgY29uc3QgbWU9dGhpcztcclxuICAgIGNvbnN0IHtub2RlLHRyZWV9PXRoaXMucHJvcHM7XHJcbiAgICBjb25zdCB0cmVldG9vbD1yZXF1aXJlKCd0cmVlbm90ZTIvc3JjL2NsaWVudC90b29sJykodHJlZSk7XHJcbiAgICBmdW5jdGlvbiBteXN1YnNjcmliZXIodGFyZ2V0LGRhdGEpe1xyXG4gICAgIGNvbnNvbGUubG9nKCdnb3QnLHRhcmdldCxkYXRhKTtcclxuICAgICBpZihkYXRhLm1zZz09J2ZvY3VzJyl7XHJcbiAgICAgICBjb25zdCBmb2N1cz1kYXRhLmdpZDtcclxuICAgICAgIGNvbnN0IHBnaWQ9ZGF0YS5wZ2lkO1xyXG4gICAgICAgdmFyIHtleHBhbmRzfT1tZS5zdGF0ZTtcclxuICAgICAgIGV4cGFuZHM9YnVpbGRFeHBhbmRzV2l0aEZvY3VzKGV4cGFuZHMsZm9jdXMscGdpZCk7XHJcbiAgICAgICBtZS5zZXRTdGF0ZSh7Zm9jdXMsZXhwYW5kc30pO1xyXG4gICAgIH1lbHNlIGlmKGRhdGEubXNnPT0ncmVmcmVzaCcpe1xyXG4gICAgICBtZS5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgIH1lbHNlIGlmKGRhdGEubXNnPT0nbW92ZScpe1xyXG4gICAgICBwYXN0ZShkYXRhLmdpZCxkYXRhLmJnaWQsdHJlZSx0cmVldG9vbCk7XHJcbiAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50b2tlbj1QdWJTdWIuc3Vic2NyaWJlKFwiVHJlZUJyb3dzZXJcIixteXN1YnNjcmliZXIpXHJcbiAgfVxyXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xyXG4gICAgY29uc3Qge2ZvY3VzfT10aGlzLnN0YXRlO1xyXG4gICAgZC5zY3JvbGwyY2FyZChmb2N1cyk7XHJcbiAgICBkLmVuc3VyZUZvY3VzQ29sdW1uKGZvY3VzKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkRXhwYW5kc1dpdGhGb2N1cyhleHBhbmRzLGZvY3VzLHBnaWQpIHtcclxuICB2YXIgaWR4PWV4cGFuZHMuaW5kZXhPZihwZ2lkKTtcclxuICBpZihpZHg8MCl7cmV0dXJuIGV4cGFuZHM7fS8v5rKh5om+5Yiw55u05o6l6L+U5ZueXHJcbiAgZXhwYW5kcz1leHBhbmRzLnNsaWNlKDAsaWR4KzEpOy8v54i26IqC54K55LmL5YmNXHJcbiAgZXhwYW5kcy5wdXNoKGZvY3VzKTsvL+WKoOWFpeaWsOeahOiKgueCuVxyXG4gIHJldHVybiBleHBhbmRzO1xyXG59Il19