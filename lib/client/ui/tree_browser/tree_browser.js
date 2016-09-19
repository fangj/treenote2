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
        return { root: root, render: render, last_col: pgid, cur_col: pgid, cur_gid: gid };
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

      return _react2.default.createElement(_tree_node_reader2.default, _extends({ tree: tree, gid: this.state.root, view: _node_with_children2.default }, this.state));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFHQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7OztBQUhBLFFBQVEscUJBQVI7QUFDQSxJQUFJLFNBQVEsUUFBUSxXQUFSLENBQVo7O0lBS3FCLFc7OztBQUtuQix1QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsMEhBQ1gsS0FEVzs7QUFFakIsVUFBSyxLQUFMLEdBQVcsTUFBSyxpQkFBTCxDQUF1QixLQUF2QixDQUFYO0FBRmlCO0FBR2xCOzs7O3NDQUVpQixLLEVBQU07QUFBQSxVQUNmLElBRGUsR0FDUSxLQURSLENBQ2YsSUFEZTtBQUFBLFVBQ1YsSUFEVSxHQUNRLEtBRFIsQ0FDVixJQURVO0FBQUEsVUFDTCxNQURLLEdBQ1EsS0FEUixDQUNMLE1BREs7QUFBQSxVQUNFLElBREYsR0FDUSxLQURSLENBQ0UsSUFERjs7QUFFdEIsVUFBRyxDQUFDLElBQUQsSUFBUyxDQUFDLElBQVYsSUFBZ0IsQ0FBQyxNQUFwQixFQUEyQjtBQUFDO0FBQVE7QUFDcEMsVUFBRyxRQUFNLFNBQVQsRUFBbUI7QUFDakIsZUFBTyxFQUFDLE1BQUssSUFBTixFQUFXLFFBQU8sTUFBbEIsRUFBeUIsVUFBUyxJQUFsQyxFQUF1QyxTQUFRLElBQS9DLEVBQW9ELFNBQVEsSUFBNUQsRUFBUDtBQUNELE9BRkQsTUFFSztBQUNILFlBQU0sT0FBSyxLQUFLLEtBQUwsQ0FBVyxDQUF0QjtBQUNBLGVBQU8sRUFBQyxNQUFLLElBQU4sRUFBVyxRQUFPLE1BQWxCLEVBQXlCLFVBQVMsSUFBbEMsRUFBdUMsU0FBUSxJQUEvQyxFQUFvRCxTQUFRLEdBQTVELEVBQVA7QUFDRDtBQUNGOzs7d0NBRW1CO0FBQ2xCLFVBQU0sS0FBRyxJQUFUO0FBQ0EsZUFBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEtBQTFCLEVBQWdDO0FBQUEsd0JBQ1AsR0FBRyxLQURJO0FBQUEsWUFDdkIsSUFEdUIsYUFDdkIsSUFEdUI7O0FBQUEsWUFDZixNQURlOztBQUU5QixZQUFNLFFBQU0sS0FBSyxpQkFBTCxZQUF3QixNQUFLLEtBQTdCLElBQXNDLE1BQXRDLEVBQVo7QUFDQSxZQUFHLEtBQUgsRUFBUztBQUFDLGFBQUcsUUFBSCxDQUFZLEtBQVo7QUFBb0I7QUFDL0I7QUFDRCxXQUFLLEtBQUwsR0FBVyxPQUFPLFNBQVAsQ0FBaUIsWUFBakIsRUFBOEIsWUFBOUIsQ0FBWDtBQUNEOzs7OENBRXlCLFMsRUFBVztBQUNuQyxVQUFNLFFBQU0sS0FBSyxpQkFBTCxDQUF1QixTQUF2QixDQUFaO0FBQ0EsVUFBRyxLQUFILEVBQVM7QUFBQyxXQUFHLFFBQUgsQ0FBWSxLQUFaO0FBQW9CO0FBQy9COzs7NkJBRVE7QUFDUCxVQUFHLENBQUMsS0FBSyxLQUFULEVBQWU7QUFBQyxlQUFPLElBQVA7QUFBYTtBQUR0QixVQUVBLElBRkEsR0FFTSxLQUFLLEtBRlgsQ0FFQSxJQUZBOztBQUdQLGFBQ0UscUVBQWdCLE1BQU0sSUFBdEIsRUFBNEIsS0FBSyxLQUFLLEtBQUwsQ0FBVyxJQUE1QyxFQUFrRCxrQ0FBbEQsSUFBOEUsS0FBSyxLQUFuRixFQURGO0FBR0Q7Ozs4QkFFUTtBQUNQLGNBQVEsR0FBUixDQUFZLE9BQVo7QUFETyxVQUVBLElBRkEsR0FFTSxLQUFLLEtBRlgsQ0FFQSxJQUZBOztBQUdQLFdBQUssSUFBTCxDQUFVLGtCQUFWLEVBQThCLElBQTlCLENBQW1DLGdCQUFNO0FBQ3ZDLGVBQU8sT0FBUCxDQUFlLFlBQWYsRUFBNEIsSUFBNUI7QUFDRCxPQUZEO0FBR0Q7OzsyQ0FDc0I7QUFDckIsYUFBTyxXQUFQLENBQW1CLEtBQUssS0FBeEI7QUFDRDs7OztFQXJEc0MsZ0JBQU0sUzs7QUFBMUIsVyxDQUNaLFMsR0FBWTtBQUNqQixRQUFNLGdCQUFNLFNBQU4sQ0FBZ0I7QUFETCxDO2tCQURBLFciLCJmaWxlIjoidHJlZV9icm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxucmVxdWlyZSgnLi90cmVlX2Jyb3dzZXIubGVzcycpO1xyXG52YXIgUHViU3ViID1yZXF1aXJlKCdwdWJzdWItanMnKTtcclxuaW1wb3J0IE5vZGVXaXRoQ2hpbGRyZW4gZnJvbSAnLi9ub2RlX3dpdGhfY2hpbGRyZW4nO1xyXG5pbXBvcnQgVHJlZU5vZGVSZWFkZXIgZnJvbSAndHJlZW5vdGUyL2xpYi9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlcic7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJlZUJyb3dzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XHJcbiAgICBuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgICB0aGlzLnN0YXRlPXRoaXMuYnVpbGRTdGF0ZUJ5UHJvcHMocHJvcHMpO1xyXG4gIH1cclxuXHJcbiAgYnVpbGRTdGF0ZUJ5UHJvcHMocHJvcHMpe1xyXG4gICAgY29uc3Qge3RyZWUscm9vdCxyZW5kZXIsbm9kZX09cHJvcHM7XHJcbiAgICBpZighdHJlZSB8fCAhcm9vdHx8IXJlbmRlcil7cmV0dXJuO31cclxuICAgIGlmKG5vZGU9PXVuZGVmaW5lZCl7XHJcbiAgICAgIHJldHVybiB7cm9vdDpyb290LHJlbmRlcjpyZW5kZXIsbGFzdF9jb2w6cm9vdCxjdXJfY29sOnJvb3QsY3VyX2dpZDpudWxsfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGNvbnN0IHBnaWQ9bm9kZS5fbGluay5wO1xyXG4gICAgICByZXR1cm4ge3Jvb3Q6cm9vdCxyZW5kZXI6cmVuZGVyLGxhc3RfY29sOnBnaWQsY3VyX2NvbDpwZ2lkLGN1cl9naWQ6Z2lkfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgZnVuY3Rpb24gbXlTdWJzY3JpYmVyKG1zZyxfbm9kZSl7XHJcbiAgICAgIGNvbnN0IHtub2RlLC4uLm90aGVyc309bWUucHJvcHM7XHJcbiAgICAgIGNvbnN0IHN0YXRlPXRoaXMuYnVpbGRTdGF0ZUJ5UHJvcHMoe25vZGU6X25vZGUsLi4ub3RoZXJzfSk7XHJcbiAgICAgIGlmKHN0YXRlKXttZS5zZXRTdGF0ZShzdGF0ZSk7fVxyXG4gICAgfVxyXG4gICAgdGhpcy50b2tlbj1QdWJTdWIuc3Vic2NyaWJlKCdjbGljay1ub2RlJyxteVN1YnNjcmliZXIpO1xyXG4gIH1cclxuXHJcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgIGNvbnN0IHN0YXRlPXRoaXMuYnVpbGRTdGF0ZUJ5UHJvcHMobmV4dFByb3BzKTtcclxuICAgIGlmKHN0YXRlKXttZS5zZXRTdGF0ZShzdGF0ZSk7fVxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgaWYoIXRoaXMuc3RhdGUpe3JldHVybiBudWxsO31cclxuICAgIGNvbnN0IHt0cmVlfT10aGlzLnByb3BzO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPFRyZWVOb2RlUmVhZGVyIHRyZWU9e3RyZWV9IGdpZD17dGhpcy5zdGF0ZS5yb290fSB2aWV3PXtOb2RlV2l0aENoaWxkcmVufSB7Li4udGhpcy5zdGF0ZX0vPlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIG9uQ2xpY2soKXtcclxuICAgIGNvbnNvbGUubG9nKCdjbGljaycpXHJcbiAgICBjb25zdCB7dHJlZX09dGhpcy5wcm9wcztcclxuICAgIHRyZWUucmVhZChcIkt0ODV6UDVDRlZzSHRseGNcIikudGhlbihub2RlPT57XHJcbiAgICAgIFB1YlN1Yi5wdWJsaXNoKCdjbGljay1ub2RlJyxub2RlKVxyXG4gICAgfSlcclxuICB9XHJcbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XHJcbiAgICBQdWJTdWIudW5zdWJzY3JpYmUodGhpcy50b2tlbik7XHJcbiAgfVxyXG59XHJcbiJdfQ==