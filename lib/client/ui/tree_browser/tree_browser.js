'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _node_with_children = require('./node_with_children');

var _node_with_children2 = _interopRequireDefault(_node_with_children);

var _tree_node_reader = require('treenote2/src/client/ui/tree_node_reader');

var _tree_node_reader2 = _interopRequireDefault(_tree_node_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('./tree_browser.less');
var PubSub = require('pubsub-js');

var TreeBrowser = function (_React$Component) {
  _inherits(TreeBrowser, _React$Component);

  function TreeBrowser(props) {
    _classCallCheck(this, TreeBrowser);

    var _this = _possibleConstructorReturn(this, (TreeBrowser.__proto__ || Object.getPrototypeOf(TreeBrowser)).call(this, props));

    _this.state = _this.buildStateByProps(props);
    return _this;
  }

  _createClass(TreeBrowser, [{
    key: 'buildStateByProps',
    value: function buildStateByProps(props) {
      var tree = props.tree;
      var root = props.root;
      var render = props.render;
      var node = props.node;
      var expands = props.expands;

      if (!tree || !root || !render) {
        return;
      }
      if (!expands) {
        expands = [];
      }
      if (node == undefined) {
        return { root: root, render: render, expands: expands, cur_col: root, cur_gid: null };
      } else {
        var pgid = node._link.p;
        return { root: root, render: render, expands: expands, cur_col: pgid, cur_gid: node._id };
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var me = this;
      function mySubscriber(msg, _node) {
        var _me$props = me.props;
        var node = _me$props.node;

        var others = _objectWithoutProperties(_me$props, ['node']);

        var state = this.buildStateByProps(_extends({ node: _node }, others));
        if (state) {
          me.setState(state);
        }
      }
      this.token = PubSub.subscribe('click-node', mySubscriber);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var state = this.buildStateByProps(nextProps);
      if (state) {
        this.setState(state);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state) {
        return null;
      }
      var tree = this.props.tree;

      return _react2.default.createElement(_tree_node_reader2.default, _extends({ tree: tree, gid: this.state.root, level: 1, view: _node_with_children2.default }, this.state));
    }
  }, {
    key: 'onClick',
    value: function onClick() {
      console.log('click');
      var tree = this.props.tree;

      tree.read("Kt85zP5CFVsHtlxc").then(function (node) {
        PubSub.publish('click-node', node);
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      PubSub.unsubscribe(this.token);
    }
  }]);

  return TreeBrowser;
}(_react2.default.Component);

TreeBrowser.propTypes = {
  expands: _react2.default.PropTypes.array };
exports.default = TreeBrowser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFHQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7OztBQUhBLFFBQVEscUJBQVI7QUFDQSxJQUFJLFNBQVEsUUFBUSxXQUFSLENBQVo7O0lBS3FCLFc7OztBQUtuQix1QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsMEhBQ1gsS0FEVzs7QUFFakIsVUFBSyxLQUFMLEdBQVcsTUFBSyxpQkFBTCxDQUF1QixLQUF2QixDQUFYO0FBRmlCO0FBR2xCOzs7O3NDQUVpQixLLEVBQU07QUFBQSxVQUNqQixJQURpQixHQUNjLEtBRGQsQ0FDakIsSUFEaUI7QUFBQSxVQUNaLElBRFksR0FDYyxLQURkLENBQ1osSUFEWTtBQUFBLFVBQ1AsTUFETyxHQUNjLEtBRGQsQ0FDUCxNQURPO0FBQUEsVUFDQSxJQURBLEdBQ2MsS0FEZCxDQUNBLElBREE7QUFBQSxVQUNLLE9BREwsR0FDYyxLQURkLENBQ0ssT0FETDs7QUFFdEIsVUFBRyxDQUFDLElBQUQsSUFBUyxDQUFDLElBQVYsSUFBZ0IsQ0FBQyxNQUFwQixFQUEyQjtBQUFDO0FBQVE7QUFDcEMsVUFBRyxDQUFDLE9BQUosRUFBWTtBQUNWLGtCQUFRLEVBQVI7QUFDRDtBQUNELFVBQUcsUUFBTSxTQUFULEVBQW1CO0FBQ2pCLGVBQU8sRUFBQyxVQUFELEVBQU0sY0FBTixFQUFhLGdCQUFiLEVBQXFCLFNBQVEsSUFBN0IsRUFBa0MsU0FBUSxJQUExQyxFQUFQO0FBQ0QsT0FGRCxNQUVLO0FBQ0gsWUFBTSxPQUFLLEtBQUssS0FBTCxDQUFXLENBQXRCO0FBQ0EsZUFBTyxFQUFDLFVBQUQsRUFBTSxjQUFOLEVBQWEsZ0JBQWIsRUFBcUIsU0FBUSxJQUE3QixFQUFrQyxTQUFRLEtBQUssR0FBL0MsRUFBUDtBQUNEO0FBQ0Y7Ozt3Q0FFbUI7QUFDbEIsVUFBTSxLQUFHLElBQVQ7QUFDQSxlQUFTLFlBQVQsQ0FBc0IsR0FBdEIsRUFBMEIsS0FBMUIsRUFBZ0M7QUFBQSx3QkFDUCxHQUFHLEtBREk7QUFBQSxZQUN2QixJQUR1QixhQUN2QixJQUR1Qjs7QUFBQSxZQUNmLE1BRGU7O0FBRTlCLFlBQU0sUUFBTSxLQUFLLGlCQUFMLFlBQXdCLE1BQUssS0FBN0IsSUFBc0MsTUFBdEMsRUFBWjtBQUNBLFlBQUcsS0FBSCxFQUFTO0FBQUMsYUFBRyxRQUFILENBQVksS0FBWjtBQUFvQjtBQUMvQjtBQUNELFdBQUssS0FBTCxHQUFXLE9BQU8sU0FBUCxDQUFpQixZQUFqQixFQUE4QixZQUE5QixDQUFYO0FBQ0Q7Ozs4Q0FFeUIsUyxFQUFXO0FBQ25DLFVBQU0sUUFBTSxLQUFLLGlCQUFMLENBQXVCLFNBQXZCLENBQVo7QUFDQSxVQUFHLEtBQUgsRUFBUztBQUFDLGFBQUssUUFBTCxDQUFjLEtBQWQ7QUFBc0I7QUFDakM7Ozs2QkFFUTtBQUNQLFVBQUcsQ0FBQyxLQUFLLEtBQVQsRUFBZTtBQUFDLGVBQU8sSUFBUDtBQUFhO0FBRHRCLFVBRUEsSUFGQSxHQUVNLEtBQUssS0FGWCxDQUVBLElBRkE7O0FBR1AsYUFDRSxxRUFBZ0IsTUFBTSxJQUF0QixFQUE0QixLQUFLLEtBQUssS0FBTCxDQUFXLElBQTVDLEVBQWtELE9BQU8sQ0FBekQsRUFBNEQsa0NBQTVELElBQXdGLEtBQUssS0FBN0YsRUFERjtBQUdEOzs7OEJBRVE7QUFDUCxjQUFRLEdBQVIsQ0FBWSxPQUFaO0FBRE8sVUFFQSxJQUZBLEdBRU0sS0FBSyxLQUZYLENBRUEsSUFGQTs7QUFHUCxXQUFLLElBQUwsQ0FBVSxrQkFBVixFQUE4QixJQUE5QixDQUFtQyxnQkFBTTtBQUN2QyxlQUFPLE9BQVAsQ0FBZSxZQUFmLEVBQTRCLElBQTVCO0FBQ0QsT0FGRDtBQUdEOzs7MkNBQ3NCO0FBQ3JCLGFBQU8sV0FBUCxDQUFtQixLQUFLLEtBQXhCO0FBQ0Q7Ozs7RUF4RHNDLGdCQUFNLFM7O0FBQTFCLFcsQ0FDWixTLEdBQVk7QUFDakIsV0FBUyxnQkFBTSxTQUFOLENBQWdCLEtBRFIsRTtrQkFEQSxXIiwiZmlsZSI6InRyZWVfYnJvd3Nlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbnJlcXVpcmUoJy4vdHJlZV9icm93c2VyLmxlc3MnKTtcclxudmFyIFB1YlN1YiA9cmVxdWlyZSgncHVic3ViLWpzJyk7XHJcbmltcG9ydCBOb2RlV2l0aENoaWxkcmVuIGZyb20gJy4vbm9kZV93aXRoX2NoaWxkcmVuJztcclxuaW1wb3J0IFRyZWVOb2RlUmVhZGVyIGZyb20gJ3RyZWVub3RlMi9zcmMvY2xpZW50L3VpL3RyZWVfbm9kZV9yZWFkZXInO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyZWVCcm93c2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgZXhwYW5kczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LCAvL+WTquS6m+iKgueCueimgeWxleW8gFxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgICB0aGlzLnN0YXRlPXRoaXMuYnVpbGRTdGF0ZUJ5UHJvcHMocHJvcHMpO1xyXG4gIH1cclxuXHJcbiAgYnVpbGRTdGF0ZUJ5UHJvcHMocHJvcHMpe1xyXG4gICAgdmFyIHt0cmVlLHJvb3QscmVuZGVyLG5vZGUsZXhwYW5kc309cHJvcHM7XHJcbiAgICBpZighdHJlZSB8fCAhcm9vdHx8IXJlbmRlcil7cmV0dXJuO31cclxuICAgIGlmKCFleHBhbmRzKXtcclxuICAgICAgZXhwYW5kcz1bXTtcclxuICAgIH1cclxuICAgIGlmKG5vZGU9PXVuZGVmaW5lZCl7XHJcbiAgICAgIHJldHVybiB7cm9vdCxyZW5kZXIsZXhwYW5kcyxjdXJfY29sOnJvb3QsY3VyX2dpZDpudWxsfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGNvbnN0IHBnaWQ9bm9kZS5fbGluay5wO1xyXG4gICAgICByZXR1cm4ge3Jvb3QscmVuZGVyLGV4cGFuZHMsY3VyX2NvbDpwZ2lkLGN1cl9naWQ6bm9kZS5faWR9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb21wb25lbnREaWRNb3VudCgpIHtcclxuICAgIGNvbnN0IG1lPXRoaXM7XHJcbiAgICBmdW5jdGlvbiBteVN1YnNjcmliZXIobXNnLF9ub2RlKXtcclxuICAgICAgY29uc3Qge25vZGUsLi4ub3RoZXJzfT1tZS5wcm9wcztcclxuICAgICAgY29uc3Qgc3RhdGU9dGhpcy5idWlsZFN0YXRlQnlQcm9wcyh7bm9kZTpfbm9kZSwuLi5vdGhlcnN9KTtcclxuICAgICAgaWYoc3RhdGUpe21lLnNldFN0YXRlKHN0YXRlKTt9XHJcbiAgICB9XHJcbiAgICB0aGlzLnRva2VuPVB1YlN1Yi5zdWJzY3JpYmUoJ2NsaWNrLW5vZGUnLG15U3Vic2NyaWJlcik7XHJcbiAgfVxyXG5cclxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xyXG4gICAgY29uc3Qgc3RhdGU9dGhpcy5idWlsZFN0YXRlQnlQcm9wcyhuZXh0UHJvcHMpO1xyXG4gICAgaWYoc3RhdGUpe3RoaXMuc2V0U3RhdGUoc3RhdGUpO31cclxuICB9XHJcblxyXG4gIHJlbmRlcigpIHtcclxuICAgIGlmKCF0aGlzLnN0YXRlKXtyZXR1cm4gbnVsbDt9XHJcbiAgICBjb25zdCB7dHJlZX09dGhpcy5wcm9wcztcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxUcmVlTm9kZVJlYWRlciB0cmVlPXt0cmVlfSBnaWQ9e3RoaXMuc3RhdGUucm9vdH0gbGV2ZWw9ezF9IHZpZXc9e05vZGVXaXRoQ2hpbGRyZW59IHsuLi50aGlzLnN0YXRlfS8+XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgb25DbGljaygpe1xyXG4gICAgY29uc29sZS5sb2coJ2NsaWNrJylcclxuICAgIGNvbnN0IHt0cmVlfT10aGlzLnByb3BzO1xyXG4gICAgdHJlZS5yZWFkKFwiS3Q4NXpQNUNGVnNIdGx4Y1wiKS50aGVuKG5vZGU9PntcclxuICAgICAgUHViU3ViLnB1Ymxpc2goJ2NsaWNrLW5vZGUnLG5vZGUpXHJcbiAgICB9KVxyXG4gIH1cclxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcclxuICAgIFB1YlN1Yi51bnN1YnNjcmliZSh0aGlzLnRva2VuKTtcclxuICB9XHJcbn1cclxuIl19