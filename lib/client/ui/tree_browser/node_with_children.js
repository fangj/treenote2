'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tree_node_reader = require('treenote2/lib/client/ui/tree_node_reader');

var _tree_node_reader2 = _interopRequireDefault(_tree_node_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Noder = function Noder(_node, props) {
  var render = props.render;
  var node = props.node;
  var tree = props.tree;
  var cur_col = props.cur_col;
  var cur_gid = props.cur_gid;
  var last_col = props.last_col;
  var root = props.root;

  return _react2.default.createElement(NodeWithChildren, { key: _node._id, node: _node, render: render, tree: tree, root: root, cur_col: cur_col, cur_gid: cur_gid, last_col: last_col });
};

var SimpleNoder = function SimpleNoder(node) {
  return _react2.default.createElement(
    'div',
    { key: node._id },
    JSON.stringify(node)
  );
};

var NodeWithChildren = function (_React$Component) {
  _inherits(NodeWithChildren, _React$Component);

  function NodeWithChildren(props) {
    _classCallCheck(this, NodeWithChildren);

    return _possibleConstructorReturn(this, (NodeWithChildren.__proto__ || Object.getPrototypeOf(NodeWithChildren)).call(this, props));
  }

  _createClass(NodeWithChildren, [{
    key: 'render',
    value: function render() {
      var me = this;
      var _me$props = me.props;
      var render = _me$props.render;
      var node = _me$props.node;

      var vnode = { _type: "vnode", _p: node._link.p };
      return _react2.default.createElement(
        'div',
        { className: 'node' },
        _react2.default.createElement(
          'div',
          { className: 'main' },
          render(node)
        ),
        _react2.default.createElement(
          'div',
          { className: 'children' },
          render(vnode),
          node._children.map(function (cnode) {
            return Noder(cnode, me.props);
          })
        )
      );
    }
  }]);

  return NodeWithChildren;
}(_react2.default.Component);

NodeWithChildren.propTypes = {
  node: _react2.default.PropTypes.object
};
exports.default = NodeWithChildren;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL25vZGVfd2l0aF9jaGlsZHJlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sUUFBTSxTQUFOLEtBQU0sQ0FBQyxLQUFELEVBQU8sS0FBUCxFQUFlO0FBQUEsTUFDbEIsTUFEa0IsR0FDOEIsS0FEOUIsQ0FDbEIsTUFEa0I7QUFBQSxNQUNYLElBRFcsR0FDOEIsS0FEOUIsQ0FDWCxJQURXO0FBQUEsTUFDTixJQURNLEdBQzhCLEtBRDlCLENBQ04sSUFETTtBQUFBLE1BQ0QsT0FEQyxHQUM4QixLQUQ5QixDQUNELE9BREM7QUFBQSxNQUNPLE9BRFAsR0FDOEIsS0FEOUIsQ0FDTyxPQURQO0FBQUEsTUFDZSxRQURmLEdBQzhCLEtBRDlCLENBQ2UsUUFEZjtBQUFBLE1BQ3dCLElBRHhCLEdBQzhCLEtBRDlCLENBQ3dCLElBRHhCOztBQUV6QixTQUFPLDhCQUFDLGdCQUFELElBQW1CLEtBQUssTUFBTSxHQUE5QixFQUFvQyxNQUFNLEtBQTFDLEVBQWtELFFBQVEsTUFBMUQsRUFBa0UsTUFBTSxJQUF4RSxFQUE4RSxNQUFNLElBQXBGLEVBQTBGLFNBQVMsT0FBbkcsRUFBNEcsU0FBUyxPQUFySCxFQUE4SCxVQUFVLFFBQXhJLEdBQVA7QUFDRCxDQUhEOztBQUtBLElBQU0sY0FBWSxTQUFaLFdBQVksQ0FBQyxJQUFEO0FBQUEsU0FBUTtBQUFBO0FBQUEsTUFBSyxLQUFLLEtBQUssR0FBZjtBQUFxQixTQUFLLFNBQUwsQ0FBZSxJQUFmO0FBQXJCLEdBQVI7QUFBQSxDQUFsQjs7SUFFcUIsZ0I7OztBQUtuQiw0QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsK0hBQ1gsS0FEVztBQUVsQjs7Ozs2QkFFUTtBQUNQLFVBQU0sS0FBRyxJQUFUO0FBRE8sc0JBRWEsR0FBRyxLQUZoQjtBQUFBLFVBRUEsTUFGQSxhQUVBLE1BRkE7QUFBQSxVQUVPLElBRlAsYUFFTyxJQUZQOztBQUdQLFVBQU0sUUFBTSxFQUFDLE9BQU0sT0FBUCxFQUFlLElBQUcsS0FBSyxLQUFMLENBQVcsQ0FBN0IsRUFBWjtBQUNBLGFBQ0k7QUFBQTtBQUFBLFVBQUssV0FBVSxNQUFmO0FBQ0U7QUFBQTtBQUFBLFlBQUssV0FBVSxNQUFmO0FBQXVCLGlCQUFPLElBQVA7QUFBdkIsU0FERjtBQUVFO0FBQUE7QUFBQSxZQUFLLFdBQVUsVUFBZjtBQUEyQixpQkFBTyxLQUFQLENBQTNCO0FBQTBDLGVBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUI7QUFBQSxtQkFBTyxNQUFNLEtBQU4sRUFBWSxHQUFHLEtBQWYsQ0FBUDtBQUFBLFdBQW5CO0FBQTFDO0FBRkYsT0FESjtBQU9EOzs7O0VBcEIyQyxnQkFBTSxTOztBQUEvQixnQixDQUNaLFMsR0FBWTtBQUNqQixRQUFNLGdCQUFNLFNBQU4sQ0FBZ0I7QUFETCxDO2tCQURBLGdCIiwiZmlsZSI6Im5vZGVfd2l0aF9jaGlsZHJlbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBUcmVlTm9kZVJlYWRlciBmcm9tICd0cmVlbm90ZTIvbGliL2NsaWVudC91aS90cmVlX25vZGVfcmVhZGVyJztcclxuXHJcbmNvbnN0IE5vZGVyPShfbm9kZSxwcm9wcyk9PntcclxuICBjb25zdCB7cmVuZGVyLG5vZGUsdHJlZSxjdXJfY29sLGN1cl9naWQsbGFzdF9jb2wscm9vdH09cHJvcHM7XHJcbiAgcmV0dXJuIDxOb2RlV2l0aENoaWxkcmVuICBrZXk9e19ub2RlLl9pZH0gIG5vZGU9e19ub2RlfSAgcmVuZGVyPXtyZW5kZXJ9IHRyZWU9e3RyZWV9IHJvb3Q9e3Jvb3R9IGN1cl9jb2w9e2N1cl9jb2x9IGN1cl9naWQ9e2N1cl9naWR9IGxhc3RfY29sPXtsYXN0X2NvbH0vPlxyXG59XHJcblxyXG5jb25zdCBTaW1wbGVOb2Rlcj0obm9kZSk9PjxkaXYga2V5PXtub2RlLl9pZH0+e0pTT04uc3RyaW5naWZ5KG5vZGUpfTwvZGl2PlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9kZVdpdGhDaGlsZHJlbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcclxuICAgIG5vZGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXHJcbiAgfTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzKTtcclxuICB9XHJcblxyXG4gIHJlbmRlcigpIHtcclxuICAgIGNvbnN0IG1lPXRoaXM7XHJcbiAgICBjb25zdCB7cmVuZGVyLG5vZGV9PW1lLnByb3BzO1xyXG4gICAgY29uc3Qgdm5vZGU9e190eXBlOlwidm5vZGVcIixfcDpub2RlLl9saW5rLnB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibm9kZVwiID5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWFpblwiPntyZW5kZXIobm9kZSl9PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoaWxkcmVuXCI+e3JlbmRlcih2bm9kZSl9e25vZGUuX2NoaWxkcmVuLm1hcChjbm9kZT0+Tm9kZXIoY25vZGUsbWUucHJvcHMpKX08L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICBcclxuICAgICk7XHJcbiAgfVxyXG59XHJcbiJdfQ==