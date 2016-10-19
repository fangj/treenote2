'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tree_node_reader = require('treenote2/src/client/ui/tree_node_reader');

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

      var vnode = { _type: "vnode", _p: node._id };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL25vZGVfd2l0aF9jaGlsZHJlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sUUFBTSxTQUFOLEtBQU0sQ0FBQyxLQUFELEVBQU8sS0FBUCxFQUFlO0FBQUEsTUFDbEIsTUFEa0IsR0FDOEIsS0FEOUIsQ0FDbEIsTUFEa0I7QUFBQSxNQUNYLElBRFcsR0FDOEIsS0FEOUIsQ0FDWCxJQURXO0FBQUEsTUFDTixJQURNLEdBQzhCLEtBRDlCLENBQ04sSUFETTtBQUFBLE1BQ0QsT0FEQyxHQUM4QixLQUQ5QixDQUNELE9BREM7QUFBQSxNQUNPLE9BRFAsR0FDOEIsS0FEOUIsQ0FDTyxPQURQO0FBQUEsTUFDZSxRQURmLEdBQzhCLEtBRDlCLENBQ2UsUUFEZjtBQUFBLE1BQ3dCLElBRHhCLEdBQzhCLEtBRDlCLENBQ3dCLElBRHhCOztBQUV6QixTQUFPLDhCQUFDLGdCQUFELElBQW1CLEtBQUssTUFBTSxHQUE5QixFQUFvQyxNQUFNLEtBQTFDLEVBQWtELFFBQVEsTUFBMUQsRUFBa0UsTUFBTSxJQUF4RSxFQUE4RSxNQUFNLElBQXBGLEVBQTBGLFNBQVMsT0FBbkcsRUFBNEcsU0FBUyxPQUFySCxFQUE4SCxVQUFVLFFBQXhJLEdBQVA7QUFDRCxDQUhEOztBQUtBLElBQU0sY0FBWSxTQUFaLFdBQVksQ0FBQyxJQUFEO0FBQUEsU0FBUTtBQUFBO0FBQUEsTUFBSyxLQUFLLEtBQUssR0FBZjtBQUFxQixTQUFLLFNBQUwsQ0FBZSxJQUFmO0FBQXJCLEdBQVI7QUFBQSxDQUFsQjs7SUFFcUIsZ0I7OztBQUtuQiw0QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsK0hBQ1gsS0FEVztBQUVsQjs7Ozs2QkFFUTtBQUNQLFVBQU0sS0FBRyxJQUFUO0FBRE8sc0JBRWEsR0FBRyxLQUZoQjtBQUFBLFVBRUEsTUFGQSxhQUVBLE1BRkE7QUFBQSxVQUVPLElBRlAsYUFFTyxJQUZQOztBQUdQLFVBQU0sUUFBTSxFQUFDLE9BQU0sT0FBUCxFQUFlLElBQUcsS0FBSyxHQUF2QixFQUFaO0FBQ0EsYUFDSTtBQUFBO0FBQUEsVUFBSyxXQUFVLE1BQWY7QUFDRTtBQUFBO0FBQUEsWUFBSyxXQUFVLE1BQWY7QUFBdUIsaUJBQU8sSUFBUDtBQUF2QixTQURGO0FBRUU7QUFBQTtBQUFBLFlBQUssV0FBVSxVQUFmO0FBQTJCLGlCQUFPLEtBQVAsQ0FBM0I7QUFBMEMsZUFBSyxTQUFMLENBQWUsR0FBZixDQUFtQjtBQUFBLG1CQUFPLE1BQU0sS0FBTixFQUFZLEdBQUcsS0FBZixDQUFQO0FBQUEsV0FBbkI7QUFBMUM7QUFGRixPQURKO0FBT0Q7Ozs7RUFwQjJDLGdCQUFNLFM7O0FBQS9CLGdCLENBQ1osUyxHQUFZO0FBQ2pCLFFBQU0sZ0JBQU0sU0FBTixDQUFnQjtBQURMLEM7a0JBREEsZ0IiLCJmaWxlIjoibm9kZV93aXRoX2NoaWxkcmVuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IFRyZWVOb2RlUmVhZGVyIGZyb20gJ3RyZWVub3RlMi9zcmMvY2xpZW50L3VpL3RyZWVfbm9kZV9yZWFkZXInO1xyXG5cclxuY29uc3QgTm9kZXI9KF9ub2RlLHByb3BzKT0+e1xyXG4gIGNvbnN0IHtyZW5kZXIsbm9kZSx0cmVlLGN1cl9jb2wsY3VyX2dpZCxsYXN0X2NvbCxyb290fT1wcm9wcztcclxuICByZXR1cm4gPE5vZGVXaXRoQ2hpbGRyZW4gIGtleT17X25vZGUuX2lkfSAgbm9kZT17X25vZGV9ICByZW5kZXI9e3JlbmRlcn0gdHJlZT17dHJlZX0gcm9vdD17cm9vdH0gY3VyX2NvbD17Y3VyX2NvbH0gY3VyX2dpZD17Y3VyX2dpZH0gbGFzdF9jb2w9e2xhc3RfY29sfS8+XHJcbn1cclxuXHJcbmNvbnN0IFNpbXBsZU5vZGVyPShub2RlKT0+PGRpdiBrZXk9e25vZGUuX2lkfT57SlNPTi5zdHJpbmdpZnkobm9kZSl9PC9kaXY+XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb2RlV2l0aENoaWxkcmVuIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgbm9kZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgY29uc3QgbWU9dGhpcztcclxuICAgIGNvbnN0IHtyZW5kZXIsbm9kZX09bWUucHJvcHM7XHJcbiAgICBjb25zdCB2bm9kZT17X3R5cGU6XCJ2bm9kZVwiLF9wOm5vZGUuX2lkfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm5vZGVcIiA+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1haW5cIj57cmVuZGVyKG5vZGUpfTwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGlsZHJlblwiPntyZW5kZXIodm5vZGUpfXtub2RlLl9jaGlsZHJlbi5tYXAoY25vZGU9Pk5vZGVyKGNub2RlLG1lLnByb3BzKSl9PC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG4iXX0=