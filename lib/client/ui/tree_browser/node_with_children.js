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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL25vZGVfd2l0aF9jaGlsZHJlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sUUFBTSxTQUFOLEtBQU0sQ0FBQyxLQUFELEVBQU8sS0FBUCxFQUFlO0FBQUEsTUFDbEIsTUFEa0IsR0FDOEIsS0FEOUIsQ0FDbEIsTUFEa0I7QUFBQSxNQUNYLElBRFcsR0FDOEIsS0FEOUIsQ0FDWCxJQURXO0FBQUEsTUFDTixJQURNLEdBQzhCLEtBRDlCLENBQ04sSUFETTtBQUFBLE1BQ0QsT0FEQyxHQUM4QixLQUQ5QixDQUNELE9BREM7QUFBQSxNQUNPLE9BRFAsR0FDOEIsS0FEOUIsQ0FDTyxPQURQO0FBQUEsTUFDZSxRQURmLEdBQzhCLEtBRDlCLENBQ2UsUUFEZjtBQUFBLE1BQ3dCLElBRHhCLEdBQzhCLEtBRDlCLENBQ3dCLElBRHhCOztBQUV6QixTQUFPLDhCQUFDLGdCQUFELElBQW1CLEtBQUssTUFBTSxHQUE5QixFQUFvQyxNQUFNLEtBQTFDLEVBQWtELFFBQVEsTUFBMUQsRUFBa0UsTUFBTSxJQUF4RSxFQUE4RSxNQUFNLElBQXBGLEVBQTBGLFNBQVMsT0FBbkcsRUFBNEcsU0FBUyxPQUFySCxFQUE4SCxVQUFVLFFBQXhJLEdBQVA7QUFDRCxDQUhEOztBQUtBLElBQU0sY0FBWSxTQUFaLFdBQVksQ0FBQyxJQUFEO0FBQUEsU0FBUTtBQUFBO0FBQUEsTUFBSyxLQUFLLEtBQUssR0FBZjtBQUFxQixTQUFLLFNBQUwsQ0FBZSxJQUFmO0FBQXJCLEdBQVI7QUFBQSxDQUFsQjs7SUFFcUIsZ0I7OztBQUtuQiw0QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsK0hBQ1gsS0FEVztBQUVsQjs7Ozs2QkFFUTtBQUNQLFVBQU0sS0FBRyxJQUFUO0FBRE8sc0JBRWEsR0FBRyxLQUZoQjtBQUFBLFVBRUEsTUFGQSxhQUVBLE1BRkE7QUFBQSxVQUVPLElBRlAsYUFFTyxJQUZQOztBQUdQLGFBQ0k7QUFBQTtBQUFBLFVBQUssV0FBVSxNQUFmO0FBQ0U7QUFBQTtBQUFBLFlBQUssV0FBVSxNQUFmO0FBQXVCLGlCQUFPLElBQVA7QUFBdkIsU0FERjtBQUVFO0FBQUE7QUFBQSxZQUFLLFdBQVUsVUFBZjtBQUEyQixlQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CO0FBQUEsbUJBQU8sTUFBTSxLQUFOLEVBQVksR0FBRyxLQUFmLENBQVA7QUFBQSxXQUFuQjtBQUEzQjtBQUZGLE9BREo7QUFPRDs7OztFQW5CMkMsZ0JBQU0sUzs7QUFBL0IsZ0IsQ0FDWixTLEdBQVk7QUFDakIsUUFBTSxnQkFBTSxTQUFOLENBQWdCO0FBREwsQztrQkFEQSxnQiIsImZpbGUiOiJub2RlX3dpdGhfY2hpbGRyZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgVHJlZU5vZGVSZWFkZXIgZnJvbSAndHJlZW5vdGUyL2xpYi9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlcic7XHJcblxyXG5jb25zdCBOb2Rlcj0oX25vZGUscHJvcHMpPT57XHJcbiAgY29uc3Qge3JlbmRlcixub2RlLHRyZWUsY3VyX2NvbCxjdXJfZ2lkLGxhc3RfY29sLHJvb3R9PXByb3BzO1xyXG4gIHJldHVybiA8Tm9kZVdpdGhDaGlsZHJlbiAga2V5PXtfbm9kZS5faWR9ICBub2RlPXtfbm9kZX0gIHJlbmRlcj17cmVuZGVyfSB0cmVlPXt0cmVlfSByb290PXtyb290fSBjdXJfY29sPXtjdXJfY29sfSBjdXJfZ2lkPXtjdXJfZ2lkfSBsYXN0X2NvbD17bGFzdF9jb2x9Lz5cclxufVxyXG5cclxuY29uc3QgU2ltcGxlTm9kZXI9KG5vZGUpPT48ZGl2IGtleT17bm9kZS5faWR9PntKU09OLnN0cmluZ2lmeShub2RlKX08L2Rpdj5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vZGVXaXRoQ2hpbGRyZW4gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XHJcbiAgICBub2RlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgfVxyXG5cclxuICByZW5kZXIoKSB7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgY29uc3Qge3JlbmRlcixub2RlfT1tZS5wcm9wcztcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJub2RlXCIgPlxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYWluXCI+e3JlbmRlcihub2RlKX08L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hpbGRyZW5cIj57bm9kZS5fY2hpbGRyZW4ubWFwKGNub2RlPT5Ob2Rlcihjbm9kZSxtZS5wcm9wcykpfTwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIFxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuIl19