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

var _tree_node_reader = require('treenote2/lib/client/ui/tree_node_reader');

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

      if (!tree || !root || !render) {
        return;
      }
      if (node == undefined) {
        return { root: root, render: render, last_col: root, cur_col: root, cur_gid: null };
      } else {
        var pgid = node._link.p;
        return { root: root, render: render, last_col: pgid, cur_col: pgid, cur_gid: node._id };
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
        me.setState(state);
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
  name: _react2.default.PropTypes.string
};
exports.default = TreeBrowser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFHQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7OztBQUhBLFFBQVEscUJBQVI7QUFDQSxJQUFJLFNBQVEsUUFBUSxXQUFSLENBQVo7O0lBS3FCLFc7OztBQUtuQix1QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsMEhBQ1gsS0FEVzs7QUFFakIsVUFBSyxLQUFMLEdBQVcsTUFBSyxpQkFBTCxDQUF1QixLQUF2QixDQUFYO0FBRmlCO0FBR2xCOzs7O3NDQUVpQixLLEVBQU07QUFBQSxVQUNmLElBRGUsR0FDUSxLQURSLENBQ2YsSUFEZTtBQUFBLFVBQ1YsSUFEVSxHQUNRLEtBRFIsQ0FDVixJQURVO0FBQUEsVUFDTCxNQURLLEdBQ1EsS0FEUixDQUNMLE1BREs7QUFBQSxVQUNFLElBREYsR0FDUSxLQURSLENBQ0UsSUFERjs7QUFFdEIsVUFBRyxDQUFDLElBQUQsSUFBUyxDQUFDLElBQVYsSUFBZ0IsQ0FBQyxNQUFwQixFQUEyQjtBQUFDO0FBQVE7QUFDcEMsVUFBRyxRQUFNLFNBQVQsRUFBbUI7QUFDakIsZUFBTyxFQUFDLE1BQUssSUFBTixFQUFXLFFBQU8sTUFBbEIsRUFBeUIsVUFBUyxJQUFsQyxFQUF1QyxTQUFRLElBQS9DLEVBQW9ELFNBQVEsSUFBNUQsRUFBUDtBQUNELE9BRkQsTUFFSztBQUNILFlBQU0sT0FBSyxLQUFLLEtBQUwsQ0FBVyxDQUF0QjtBQUNBLGVBQU8sRUFBQyxNQUFLLElBQU4sRUFBVyxRQUFPLE1BQWxCLEVBQXlCLFVBQVMsSUFBbEMsRUFBdUMsU0FBUSxJQUEvQyxFQUFvRCxTQUFRLEtBQUssR0FBakUsRUFBUDtBQUNEO0FBQ0Y7Ozt3Q0FFbUI7QUFDbEIsVUFBTSxLQUFHLElBQVQ7QUFDQSxlQUFTLFlBQVQsQ0FBc0IsR0FBdEIsRUFBMEIsS0FBMUIsRUFBZ0M7QUFBQSx3QkFDUCxHQUFHLEtBREk7QUFBQSxZQUN2QixJQUR1QixhQUN2QixJQUR1Qjs7QUFBQSxZQUNmLE1BRGU7O0FBRTlCLFlBQU0sUUFBTSxLQUFLLGlCQUFMLFlBQXdCLE1BQUssS0FBN0IsSUFBc0MsTUFBdEMsRUFBWjtBQUNBLFlBQUcsS0FBSCxFQUFTO0FBQUMsYUFBRyxRQUFILENBQVksS0FBWjtBQUFvQjtBQUMvQjtBQUNELFdBQUssS0FBTCxHQUFXLE9BQU8sU0FBUCxDQUFpQixZQUFqQixFQUE4QixZQUE5QixDQUFYO0FBQ0Q7Ozs4Q0FFeUIsUyxFQUFXO0FBQ25DLFVBQU0sUUFBTSxLQUFLLGlCQUFMLENBQXVCLFNBQXZCLENBQVo7QUFDQSxVQUFHLEtBQUgsRUFBUztBQUFDLFdBQUcsUUFBSCxDQUFZLEtBQVo7QUFBb0I7QUFDL0I7Ozs2QkFFUTtBQUNQLFVBQUcsQ0FBQyxLQUFLLEtBQVQsRUFBZTtBQUFDLGVBQU8sSUFBUDtBQUFhO0FBRHRCLFVBRUEsSUFGQSxHQUVNLEtBQUssS0FGWCxDQUVBLElBRkE7O0FBR1AsYUFDRSxxRUFBZ0IsTUFBTSxJQUF0QixFQUE0QixLQUFLLEtBQUssS0FBTCxDQUFXLElBQTVDLEVBQWtELE9BQU8sQ0FBekQsRUFBNEQsa0NBQTVELElBQXdGLEtBQUssS0FBN0YsRUFERjtBQUdEOzs7OEJBRVE7QUFDUCxjQUFRLEdBQVIsQ0FBWSxPQUFaO0FBRE8sVUFFQSxJQUZBLEdBRU0sS0FBSyxLQUZYLENBRUEsSUFGQTs7QUFHUCxXQUFLLElBQUwsQ0FBVSxrQkFBVixFQUE4QixJQUE5QixDQUFtQyxnQkFBTTtBQUN2QyxlQUFPLE9BQVAsQ0FBZSxZQUFmLEVBQTRCLElBQTVCO0FBQ0QsT0FGRDtBQUdEOzs7MkNBQ3NCO0FBQ3JCLGFBQU8sV0FBUCxDQUFtQixLQUFLLEtBQXhCO0FBQ0Q7Ozs7RUFyRHNDLGdCQUFNLFM7O0FBQTFCLFcsQ0FDWixTLEdBQVk7QUFDakIsUUFBTSxnQkFBTSxTQUFOLENBQWdCO0FBREwsQztrQkFEQSxXIiwiZmlsZSI6InRyZWVfYnJvd3Nlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbnJlcXVpcmUoJy4vdHJlZV9icm93c2VyLmxlc3MnKTtcclxudmFyIFB1YlN1YiA9cmVxdWlyZSgncHVic3ViLWpzJyk7XHJcbmltcG9ydCBOb2RlV2l0aENoaWxkcmVuIGZyb20gJy4vbm9kZV93aXRoX2NoaWxkcmVuJztcclxuaW1wb3J0IFRyZWVOb2RlUmVhZGVyIGZyb20gJ3RyZWVub3RlMi9saWIvY2xpZW50L3VpL3RyZWVfbm9kZV9yZWFkZXInO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyZWVCcm93c2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gICAgdGhpcy5zdGF0ZT10aGlzLmJ1aWxkU3RhdGVCeVByb3BzKHByb3BzKTtcclxuICB9XHJcblxyXG4gIGJ1aWxkU3RhdGVCeVByb3BzKHByb3BzKXtcclxuICAgIGNvbnN0IHt0cmVlLHJvb3QscmVuZGVyLG5vZGV9PXByb3BzO1xyXG4gICAgaWYoIXRyZWUgfHwgIXJvb3R8fCFyZW5kZXIpe3JldHVybjt9XHJcbiAgICBpZihub2RlPT11bmRlZmluZWQpe1xyXG4gICAgICByZXR1cm4ge3Jvb3Q6cm9vdCxyZW5kZXI6cmVuZGVyLGxhc3RfY29sOnJvb3QsY3VyX2NvbDpyb290LGN1cl9naWQ6bnVsbH1cclxuICAgIH1lbHNle1xyXG4gICAgICBjb25zdCBwZ2lkPW5vZGUuX2xpbmsucDtcclxuICAgICAgcmV0dXJuIHtyb290OnJvb3QscmVuZGVyOnJlbmRlcixsYXN0X2NvbDpwZ2lkLGN1cl9jb2w6cGdpZCxjdXJfZ2lkOm5vZGUuX2lkfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgZnVuY3Rpb24gbXlTdWJzY3JpYmVyKG1zZyxfbm9kZSl7XHJcbiAgICAgIGNvbnN0IHtub2RlLC4uLm90aGVyc309bWUucHJvcHM7XHJcbiAgICAgIGNvbnN0IHN0YXRlPXRoaXMuYnVpbGRTdGF0ZUJ5UHJvcHMoe25vZGU6X25vZGUsLi4ub3RoZXJzfSk7XHJcbiAgICAgIGlmKHN0YXRlKXttZS5zZXRTdGF0ZShzdGF0ZSk7fVxyXG4gICAgfVxyXG4gICAgdGhpcy50b2tlbj1QdWJTdWIuc3Vic2NyaWJlKCdjbGljay1ub2RlJyxteVN1YnNjcmliZXIpO1xyXG4gIH1cclxuXHJcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgIGNvbnN0IHN0YXRlPXRoaXMuYnVpbGRTdGF0ZUJ5UHJvcHMobmV4dFByb3BzKTtcclxuICAgIGlmKHN0YXRlKXttZS5zZXRTdGF0ZShzdGF0ZSk7fVxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgaWYoIXRoaXMuc3RhdGUpe3JldHVybiBudWxsO31cclxuICAgIGNvbnN0IHt0cmVlfT10aGlzLnByb3BzO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPFRyZWVOb2RlUmVhZGVyIHRyZWU9e3RyZWV9IGdpZD17dGhpcy5zdGF0ZS5yb290fSBsZXZlbD17MX0gdmlldz17Tm9kZVdpdGhDaGlsZHJlbn0gey4uLnRoaXMuc3RhdGV9Lz5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBvbkNsaWNrKCl7XHJcbiAgICBjb25zb2xlLmxvZygnY2xpY2snKVxyXG4gICAgY29uc3Qge3RyZWV9PXRoaXMucHJvcHM7XHJcbiAgICB0cmVlLnJlYWQoXCJLdDg1elA1Q0ZWc0h0bHhjXCIpLnRoZW4obm9kZT0+e1xyXG4gICAgICBQdWJTdWIucHVibGlzaCgnY2xpY2stbm9kZScsbm9kZSlcclxuICAgIH0pXHJcbiAgfVxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gICAgUHViU3ViLnVuc3Vic2NyaWJlKHRoaXMudG9rZW4pO1xyXG4gIH1cclxufVxyXG4iXX0=