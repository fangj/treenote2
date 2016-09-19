'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('./tree_browser.less');
var PubSub = require('pubsub-js');

var TreeBrowser = function (_React$Component) {
  _inherits(TreeBrowser, _React$Component);

  function TreeBrowser(props) {
    _classCallCheck(this, TreeBrowser);

    return _possibleConstructorReturn(this, (TreeBrowser.__proto__ || Object.getPrototypeOf(TreeBrowser)).call(this, props));
  }

  _createClass(TreeBrowser, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.refresh(this.props);
      var me = this;
      function mySubscriber(msg, gid) {
        var _me$props = me.props;
        var tree = _me$props.tree;
        var root = _me$props.root;

        me.refresh({ tree: tree, root: root, gid: gid });
      }
      this.token = PubSub.subscribe('click-node', mySubscriber);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.refresh(nextProps);
    }
  }, {
    key: 'refresh',
    value: function refresh(props) {
      var me = this;
      var tree = props.tree;
      var root = props.root;
      var gid = props.gid;

      if (!tree || !root) {
        return;
      }
      var state;
      if (gid == undefined) {
        state = { root: root, last_col: root, cur_col: root, cur_gid: null };
        this.setState(state);
      } else {
        tree.read(gid).then(function (node) {
          var pgid = node._link.p;
          state = { root: root, last_col: pgid, cur_col: pgid, cur_gid: gid };
          me.setState(state);
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state) {
        return null;
      }
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'pre',
          null,
          JSON.stringify(this.state)
        ),
        _react2.default.createElement(
          'button',
          { onClick: this.onClick.bind(this) },
          'click'
        )
      );
    }
  }, {
    key: 'onClick',
    value: function onClick() {
      console.log('click');
      PubSub.publish('click-node', "Kt85zP5CFVsHtlxc");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7QUFDQSxRQUFRLHFCQUFSO0FBQ0EsSUFBSSxTQUFRLFFBQVEsV0FBUixDQUFaOztJQUVxQixXOzs7QUFLbkIsdUJBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBLHFIQUNYLEtBRFc7QUFFbEI7Ozs7d0NBR21CO0FBQ2xCLFdBQUssT0FBTCxDQUFhLEtBQUssS0FBbEI7QUFDQSxVQUFNLEtBQUcsSUFBVDtBQUNBLGVBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEwQixHQUExQixFQUE4QjtBQUFBLHdCQUNWLEdBQUcsS0FETztBQUFBLFlBQ3JCLElBRHFCLGFBQ3JCLElBRHFCO0FBQUEsWUFDaEIsSUFEZ0IsYUFDaEIsSUFEZ0I7O0FBRTVCLFdBQUcsT0FBSCxDQUFXLEVBQUMsVUFBRCxFQUFNLFVBQU4sRUFBVyxRQUFYLEVBQVg7QUFDRDtBQUNELFdBQUssS0FBTCxHQUFXLE9BQU8sU0FBUCxDQUFpQixZQUFqQixFQUE4QixZQUE5QixDQUFYO0FBQ0Q7Ozs4Q0FDeUIsUyxFQUFXO0FBQ25DLFdBQUssT0FBTCxDQUFhLFNBQWI7QUFDRDs7OzRCQUVPLEssRUFBTTtBQUNaLFVBQU0sS0FBRyxJQUFUO0FBRFksVUFFTCxJQUZLLEdBRVUsS0FGVixDQUVMLElBRks7QUFBQSxVQUVBLElBRkEsR0FFVSxLQUZWLENBRUEsSUFGQTtBQUFBLFVBRUssR0FGTCxHQUVVLEtBRlYsQ0FFSyxHQUZMOztBQUdaLFVBQUcsQ0FBQyxJQUFELElBQVMsQ0FBQyxJQUFiLEVBQWtCO0FBQUM7QUFBUTtBQUMzQixVQUFJLEtBQUo7QUFDQSxVQUFHLE9BQUssU0FBUixFQUFrQjtBQUNoQixnQkFBTSxFQUFDLE1BQUssSUFBTixFQUFXLFVBQVMsSUFBcEIsRUFBeUIsU0FBUSxJQUFqQyxFQUFzQyxTQUFRLElBQTlDLEVBQU47QUFDQSxhQUFLLFFBQUwsQ0FBYyxLQUFkO0FBQ0QsT0FIRCxNQUdLO0FBQ0gsYUFBSyxJQUFMLENBQVUsR0FBVixFQUFlLElBQWYsQ0FBb0IsZ0JBQU07QUFDeEIsY0FBTSxPQUFLLEtBQUssS0FBTCxDQUFXLENBQXRCO0FBQ0Esa0JBQU0sRUFBQyxNQUFLLElBQU4sRUFBVyxVQUFTLElBQXBCLEVBQXlCLFNBQVEsSUFBakMsRUFBc0MsU0FBUSxHQUE5QyxFQUFOO0FBQ0EsYUFBRyxRQUFILENBQVksS0FBWjtBQUNELFNBSkQ7QUFLRDtBQUNGOzs7NkJBRVE7QUFDUCxVQUFHLENBQUMsS0FBSyxLQUFULEVBQWU7QUFBQyxlQUFPLElBQVA7QUFBYTtBQUM3QixhQUNFO0FBQUE7QUFBQTtBQUFLO0FBQUE7QUFBQTtBQUFNLGVBQUssU0FBTCxDQUFlLEtBQUssS0FBcEI7QUFBTixTQUFMO0FBQ0E7QUFBQTtBQUFBLFlBQVEsU0FBUyxLQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLElBQWxCLENBQWpCO0FBQUE7QUFBQTtBQURBLE9BREY7QUFLRDs7OzhCQUVRO0FBQ1AsY0FBUSxHQUFSLENBQVksT0FBWjtBQUNBLGFBQU8sT0FBUCxDQUFlLFlBQWYsRUFBNEIsa0JBQTVCO0FBQ0Q7OzsyQ0FDc0I7QUFDckIsYUFBTyxXQUFQLENBQW1CLEtBQUssS0FBeEI7QUFDRDs7OztFQXZEc0MsZ0JBQU0sUzs7QUFBMUIsVyxDQUNaLFMsR0FBWTtBQUNqQixRQUFNLGdCQUFNLFNBQU4sQ0FBZ0I7QUFETCxDO2tCQURBLFciLCJmaWxlIjoidHJlZV9icm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxucmVxdWlyZSgnLi90cmVlX2Jyb3dzZXIubGVzcycpO1xyXG52YXIgUHViU3ViID1yZXF1aXJlKCdwdWJzdWItanMnKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyZWVCcm93c2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gIH1cclxuXHJcblxyXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gICAgdGhpcy5yZWZyZXNoKHRoaXMucHJvcHMpO1xyXG4gICAgY29uc3QgbWU9dGhpcztcclxuICAgIGZ1bmN0aW9uIG15U3Vic2NyaWJlcihtc2csZ2lkKXtcclxuICAgICAgY29uc3Qge3RyZWUscm9vdH09bWUucHJvcHM7XHJcbiAgICAgIG1lLnJlZnJlc2goe3RyZWUscm9vdCxnaWR9KVxyXG4gICAgfVxyXG4gICAgdGhpcy50b2tlbj1QdWJTdWIuc3Vic2NyaWJlKCdjbGljay1ub2RlJyxteVN1YnNjcmliZXIpO1xyXG4gIH1cclxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xyXG4gICAgdGhpcy5yZWZyZXNoKG5leHRQcm9wcyk7XHJcbiAgfVxyXG5cclxuICByZWZyZXNoKHByb3BzKXtcclxuICAgIGNvbnN0IG1lPXRoaXM7XHJcbiAgICBjb25zdCB7dHJlZSxyb290LGdpZH09cHJvcHM7XHJcbiAgICBpZighdHJlZSB8fCAhcm9vdCl7cmV0dXJuO31cclxuICAgIHZhciBzdGF0ZTtcclxuICAgIGlmKGdpZD09dW5kZWZpbmVkKXtcclxuICAgICAgc3RhdGU9e3Jvb3Q6cm9vdCxsYXN0X2NvbDpyb290LGN1cl9jb2w6cm9vdCxjdXJfZ2lkOm51bGx9XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHRyZWUucmVhZChnaWQpLnRoZW4obm9kZT0+e1xyXG4gICAgICAgIGNvbnN0IHBnaWQ9bm9kZS5fbGluay5wO1xyXG4gICAgICAgIHN0YXRlPXtyb290OnJvb3QsbGFzdF9jb2w6cGdpZCxjdXJfY29sOnBnaWQsY3VyX2dpZDpnaWR9XHJcbiAgICAgICAgbWUuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgaWYoIXRoaXMuc3RhdGUpe3JldHVybiBudWxsO31cclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXY+PHByZT57SlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZSl9PC9wcmU+XHJcbiAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkNsaWNrLmJpbmQodGhpcyl9PmNsaWNrPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIG9uQ2xpY2soKXtcclxuICAgIGNvbnNvbGUubG9nKCdjbGljaycpXHJcbiAgICBQdWJTdWIucHVibGlzaCgnY2xpY2stbm9kZScsXCJLdDg1elA1Q0ZWc0h0bHhjXCIpXHJcbiAgfVxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gICAgUHViU3ViLnVuc3Vic2NyaWJlKHRoaXMudG9rZW4pO1xyXG4gIH1cclxufVxyXG4iXX0=