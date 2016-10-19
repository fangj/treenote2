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
      console.log('lets paste', from, "to", to);
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
      { className: 'btn btn-default btn-xs', onClick: function onClick() {
          clipboard = node._id;
        } },
      _react2.default.createElement('i', { className: 'fa fa-cut' })
    ),
    _react2.default.createElement(
      'button',
      { className: 'btn btn-default btn-xs', onClick: function onClick() {
          console.log(clipboard);
          paste(clipboard, node._id, tree, treetool);
        } },
      _react2.default.createElement('i', { className: 'fa fa-paste' })
    ),
    _react2.default.createElement(
      'button',
      { className: 'btn btn-default btn-xs', onClick: function onClick() {
          var sure = confirm("are you sure?");
          console.log(sure);
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

  var treetool = require('treenote2/src/client/tool')(tree);
  var vnode = { _type: "vnode", _p: node._id };
  return _react2.default.createElement(
    'div',
    { className: cx("node", { focus: focus === node._id }) },
    _react2.default.createElement(
      'div',
      { className: 'main' },
      render(node),
      menu(node, tree, treetool)
    ),
    !_.includes(expands, node._id) ? null : _react2.default.createElement(
      'div',
      { className: cx("children", { focus: _.includes(node._link.children, focus) }) },
      render(vnode),
      node._children.map(function (node) {
        return _react2.default.createElement(TreeBrowser, _extends({ key: node._id, node: node }, others));
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
    return _this;
  }

  _createClass(tree_browser, [{
    key: 'render',
    value: function render() {
      var _state = this.state;
      var root = _state.root;

      var others = _objectWithoutProperties(_state, ['root']);

      return _react2.default.createElement(_tree_node_reader2.default, _extends({ gid: root, view: TreeBrowser }, others));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var me = this;
      var node = this.props.node;

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
        }
      }
      this.token = PubSub.subscribe("TreeBrowser", mysubscriber);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyMy90cmVlX2Jyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFJLFFBQVMsWUFBVCxDQUFSO0FBQ0EsSUFBSSxJQUFFLFFBQVEsUUFBUixDQUFOO0FBQ0EsUUFBUSxxQkFBUjtBQUNBLElBQUksU0FBUSxRQUFTLFdBQVQsQ0FBWjs7QUFFQSxJQUFJLFNBQUosQyxDQUFjOztBQUVkLFNBQVMsWUFBVCxDQUFzQixNQUF0QixFQUE2QixNQUE3QixFQUFvQyxRQUFwQyxFQUE2QztBQUFFO0FBQzdDLFNBQU8sU0FBUyxZQUFULENBQXNCLENBQUMsTUFBRCxDQUF0QixFQUErQixNQUEvQixFQUF1QyxJQUF2QyxDQUE0QyxrQkFBUTtBQUN6RCxXQUFPLE9BQU8sT0FBUCxDQUFlLE1BQWYsSUFBdUIsQ0FBQyxDQUEvQjtBQUNELEdBRk0sQ0FBUDtBQUdEOztBQUVELFNBQVMsS0FBVCxDQUFlLElBQWYsRUFBb0IsRUFBcEIsRUFBdUIsSUFBdkIsRUFBNEIsUUFBNUIsRUFBcUM7QUFDbkMsZUFBYSxFQUFiLEVBQWdCLElBQWhCLEVBQXFCLFFBQXJCLEVBQStCLElBQS9CLENBQW9DLGtCQUFRO0FBQzFDLFFBQUcsTUFBSCxFQUFVO0FBQ1IsWUFBTSx1QkFBc0IsSUFBdEIsR0FBMkIsTUFBM0IsR0FBa0MsRUFBeEM7QUFDRCxLQUZELE1BRUs7QUFDSCxjQUFRLEdBQVIsQ0FBWSxZQUFaLEVBQXlCLElBQXpCLEVBQThCLElBQTlCLEVBQW1DLEVBQW5DO0FBQ0EsV0FBSyxhQUFMLENBQW1CLElBQW5CLEVBQXdCLEVBQXhCLEVBQTRCLElBQTVCLENBQWlDLGFBQUc7QUFDbEMsb0JBQVUsSUFBVjtBQUNBLGVBQU8sT0FBUCxDQUFlLGFBQWYsRUFBNkIsRUFBQyxLQUFJLFNBQUwsRUFBN0I7QUFDRCxPQUhEO0FB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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgVHJlZU5vZGVSZWFkZXIgZnJvbSAndHJlZW5vdGUyL3NyYy9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlcic7XHJcbnZhciBjeCA9cmVxdWlyZSAoXCJjbGFzc25hbWVzXCIpO1xyXG52YXIgXz1yZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5yZXF1aXJlKCcuL3RyZWVfYnJvd3Nlci5sZXNzJyk7XHJcbnZhciBQdWJTdWIgPXJlcXVpcmUgKFwicHVic3ViLWpzXCIpO1xyXG5cclxudmFyIGNsaXBib2FyZDsvL+WJqui0tOadv++8jOeUqOS6juWtmOaUvuW9k+WJjeWJquWIh+eahG5vZGUgaWRcclxuXHJcbmZ1bmN0aW9uIGlzRGVzY2VuZGFudCh0YXJnZXQsc291cmNlLHRyZWV0b29sKXsgLy9jaGVjayB3aGV0aGVyIHRhcmdldCBpcyAgZGVzY2VuZGFudCBvZiBzb3VyY2VcclxuICByZXR1cm4gdHJlZXRvb2wuZXhwYW5kVG9Sb290KFt0YXJnZXRdLHNvdXJjZSkudGhlbihpZHBhdGg9PntcclxuICAgIHJldHVybiBpZHBhdGguaW5kZXhPZihzb3VyY2UpPi0xO1xyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhc3RlKGZyb20sdG8sdHJlZSx0cmVldG9vbCl7XHJcbiAgaXNEZXNjZW5kYW50KHRvLGZyb20sdHJlZXRvb2wpLnRoZW4oY2Fubm90PT57XHJcbiAgICBpZihjYW5ub3Qpe1xyXG4gICAgICBhbGVydChcImNhbm5vdCBwYXN0ZSBmcm9tIFwiICtmcm9tK1wiIHRvIFwiK3RvKVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdsZXRzIHBhc3RlJyxmcm9tLFwidG9cIix0bylcclxuICAgICAgdHJlZS5tdl9hc19icm90aGVyKGZyb20sdG8pLnRoZW4oXz0+e1xyXG4gICAgICAgIGNsaXBib2FyZD1udWxsO1xyXG4gICAgICAgIFB1YlN1Yi5wdWJsaXNoKFwiVHJlZUJyb3dzZXJcIix7bXNnOlwicmVmcmVzaFwifSk7XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG5cclxuY29uc3QgbWVudT0obm9kZSx0cmVlLHRyZWV0b29sKT0+e1xyXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibWVudVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiIG9uQ2xpY2s9eygpPT57XHJcbiAgICAgICAgICAgICAgICBjbGlwYm9hcmQ9bm9kZS5faWQ7XHJcbiAgICAgICAgICAgICAgfX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtY3V0XCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2xpcGJvYXJkKVxyXG4gICAgICAgICAgICAgICAgcGFzdGUoY2xpcGJvYXJkLG5vZGUuX2lkLHRyZWUsdHJlZXRvb2wpO1xyXG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXBhc3RlXCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1wiICBvbkNsaWNrPXsoKT0+e1xyXG4gICAgICAgICAgICAgICAgdmFyIHN1cmU9Y29uZmlybShcImFyZSB5b3Ugc3VyZT9cIilcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN1cmUpO1xyXG4gICAgICAgICAgICAgICAgaWYoc3VyZSl7XHJcbiAgICAgICAgICAgICAgICAgIHRyZWUucmVtb3ZlKG5vZGUuX2lkKS50aGVuKF89PntcclxuICAgICAgICAgICAgICAgICAgICBQdWJTdWIucHVibGlzaChcIlRyZWVCcm93c2VyXCIse21zZzpcInJlZnJlc2hcIn0pO1xyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH19PjxpIGNsYXNzTmFtZT1cImZhIGZhLXRyYXNoXCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxufVxyXG5cclxuY29uc3QgVHJlZUJyb3dzZXI9KHByb3BzKT0+e1xyXG4gICAgY29uc3Qge25vZGUsLi4ub3RoZXJzfT1wcm9wcztcclxuICAgIGNvbnN0IHtyZW5kZXIsZm9jdXMsZXhwYW5kcyx0cmVlfT1wcm9wcztcclxuICAgIGNvbnN0IHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcclxuICAgIGNvbnN0IHZub2RlPXtfdHlwZTpcInZub2RlXCIsX3A6bm9kZS5faWR9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeChcIm5vZGVcIix7Zm9jdXM6Zm9jdXM9PT1ub2RlLl9pZH0pfSA+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1haW5cIj5cclxuICAgICAgICAgICAge3JlbmRlcihub2RlKX1cclxuICAgICAgICAgICAge21lbnUobm9kZSx0cmVlLHRyZWV0b29sKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgeyFfLmluY2x1ZGVzKGV4cGFuZHMsbm9kZS5faWQpP251bGw6PGRpdiBjbGFzc05hbWU9e2N4KFwiY2hpbGRyZW5cIix7Zm9jdXM6Xy5pbmNsdWRlcyhub2RlLl9saW5rLmNoaWxkcmVuLCBmb2N1cyl9KX0+e3JlbmRlcih2bm9kZSl9e25vZGUuX2NoaWxkcmVuLm1hcChub2RlPT48VHJlZUJyb3dzZXIga2V5PXtub2RlLl9pZH0gbm9kZT17bm9kZX0gey4uLm90aGVyc30vPil9PC9kaXY+fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIFxyXG4gICAgKTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHRyZWVfYnJvd3NlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzKTtcclxuICAgIHRoaXMuc3RhdGU9cHJvcHM7XHJcbiAgfVxyXG4gIHJlbmRlcigpIHtcclxuICBcdHZhciB7cm9vdCwuLi5vdGhlcnN9PXRoaXMuc3RhdGU7XHJcbiAgXHRyZXR1cm4gPFRyZWVOb2RlUmVhZGVyIGdpZD17cm9vdH0gIHZpZXc9e1RyZWVCcm93c2VyfSAgey4uLm90aGVyc30vPlxyXG4gIH1cclxuICBjb21wb25lbnREaWRNb3VudCgpIHtcclxuICAgIGNvbnN0IG1lPXRoaXM7XHJcbiAgICBjb25zdCB7bm9kZX09dGhpcy5wcm9wcztcclxuICAgIGZ1bmN0aW9uIG15c3Vic2NyaWJlcih0YXJnZXQsZGF0YSl7XHJcbiAgICAgY29uc29sZS5sb2coJ2dvdCcsdGFyZ2V0LGRhdGEpO1xyXG4gICAgIGlmKGRhdGEubXNnPT0nZm9jdXMnKXtcclxuICAgICAgIGNvbnN0IGZvY3VzPWRhdGEuZ2lkO1xyXG4gICAgICAgY29uc3QgcGdpZD1kYXRhLnBnaWQ7XHJcbiAgICAgICB2YXIge2V4cGFuZHN9PW1lLnN0YXRlO1xyXG4gICAgICAgZXhwYW5kcz1idWlsZEV4cGFuZHNXaXRoRm9jdXMoZXhwYW5kcyxmb2N1cyxwZ2lkKTtcclxuICAgICAgIG1lLnNldFN0YXRlKHtmb2N1cyxleHBhbmRzfSk7XHJcbiAgICAgfWVsc2UgaWYoZGF0YS5tc2c9PSdyZWZyZXNoJyl7XHJcbiAgICAgIG1lLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50b2tlbj1QdWJTdWIuc3Vic2NyaWJlKFwiVHJlZUJyb3dzZXJcIixteXN1YnNjcmliZXIpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZEV4cGFuZHNXaXRoRm9jdXMoZXhwYW5kcyxmb2N1cyxwZ2lkKSB7XHJcbiAgdmFyIGlkeD1leHBhbmRzLmluZGV4T2YocGdpZCk7XHJcbiAgaWYoaWR4PDApe3JldHVybiBleHBhbmRzO30vL+ayoeaJvuWIsOebtOaOpei/lOWbnlxyXG4gIGV4cGFuZHM9ZXhwYW5kcy5zbGljZSgwLGlkeCsxKTsvL+eItuiKgueCueS5i+WJjVxyXG4gIGV4cGFuZHMucHVzaChmb2N1cyk7Ly/liqDlhaXmlrDnmoToioLngrlcclxuICByZXR1cm4gZXhwYW5kcztcclxufSJdfQ==