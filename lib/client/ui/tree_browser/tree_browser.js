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
        var render = _me$props.render;

        me.refresh({ tree: tree, root: root, render: render, gid: gid });
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
      var render = props.render;
      var gid = props.gid;

      if (!tree || !root || !render) {
        return;
      }
      var state;
      if (gid == undefined) {
        state = { root: root, render: render, last_col: root, cur_col: root, cur_gid: null };
        this.setState(state);
      } else {
        tree.read(gid).then(function (node) {
          var pgid = node._link.p;
          state = { root: root, render: render, last_col: pgid, cur_col: pgid, cur_gid: gid };
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
      var tree = this.props.tree;

      return _react2.default.createElement(_tree_node_reader2.default, _extends({ tree: tree, gid: this.state.root, view: _node_with_children2.default }, this.state));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFHQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFIQSxRQUFRLHFCQUFSO0FBQ0EsSUFBSSxTQUFRLFFBQVEsV0FBUixDQUFaOztJQUtxQixXOzs7QUFLbkIsdUJBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBLHFIQUNYLEtBRFc7QUFFbEI7Ozs7d0NBR21CO0FBQ2xCLFdBQUssT0FBTCxDQUFhLEtBQUssS0FBbEI7QUFDQSxVQUFNLEtBQUcsSUFBVDtBQUNBLGVBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEwQixHQUExQixFQUE4QjtBQUFBLHdCQUNILEdBQUcsS0FEQTtBQUFBLFlBQ3JCLElBRHFCLGFBQ3JCLElBRHFCO0FBQUEsWUFDaEIsSUFEZ0IsYUFDaEIsSUFEZ0I7QUFBQSxZQUNYLE1BRFcsYUFDWCxNQURXOztBQUU1QixXQUFHLE9BQUgsQ0FBVyxFQUFDLFVBQUQsRUFBTSxVQUFOLEVBQVcsY0FBWCxFQUFrQixRQUFsQixFQUFYO0FBQ0Q7QUFDRCxXQUFLLEtBQUwsR0FBVyxPQUFPLFNBQVAsQ0FBaUIsWUFBakIsRUFBOEIsWUFBOUIsQ0FBWDtBQUNEOzs7OENBQ3lCLFMsRUFBVztBQUNuQyxXQUFLLE9BQUwsQ0FBYSxTQUFiO0FBQ0Q7Ozs0QkFFTyxLLEVBQU07QUFDWixVQUFNLEtBQUcsSUFBVDtBQURZLFVBRUwsSUFGSyxHQUVpQixLQUZqQixDQUVMLElBRks7QUFBQSxVQUVBLElBRkEsR0FFaUIsS0FGakIsQ0FFQSxJQUZBO0FBQUEsVUFFSyxNQUZMLEdBRWlCLEtBRmpCLENBRUssTUFGTDtBQUFBLFVBRVksR0FGWixHQUVpQixLQUZqQixDQUVZLEdBRlo7O0FBR1osVUFBRyxDQUFDLElBQUQsSUFBUyxDQUFDLElBQVYsSUFBZ0IsQ0FBQyxNQUFwQixFQUEyQjtBQUFDO0FBQVE7QUFDcEMsVUFBSSxLQUFKO0FBQ0EsVUFBRyxPQUFLLFNBQVIsRUFBa0I7QUFDaEIsZ0JBQU0sRUFBQyxNQUFLLElBQU4sRUFBVyxRQUFPLE1BQWxCLEVBQXlCLFVBQVMsSUFBbEMsRUFBdUMsU0FBUSxJQUEvQyxFQUFvRCxTQUFRLElBQTVELEVBQU47QUFDQSxhQUFLLFFBQUwsQ0FBYyxLQUFkO0FBQ0QsT0FIRCxNQUdLO0FBQ0gsYUFBSyxJQUFMLENBQVUsR0FBVixFQUFlLElBQWYsQ0FBb0IsZ0JBQU07QUFDeEIsY0FBTSxPQUFLLEtBQUssS0FBTCxDQUFXLENBQXRCO0FBQ0Esa0JBQU0sRUFBQyxNQUFLLElBQU4sRUFBVyxRQUFPLE1BQWxCLEVBQXlCLFVBQVMsSUFBbEMsRUFBdUMsU0FBUSxJQUEvQyxFQUFvRCxTQUFRLEdBQTVELEVBQU47QUFDQSxhQUFHLFFBQUgsQ0FBWSxLQUFaO0FBQ0QsU0FKRDtBQUtEO0FBQ0Y7Ozs2QkFFUTtBQUNQLFVBQUcsQ0FBQyxLQUFLLEtBQVQsRUFBZTtBQUFDLGVBQU8sSUFBUDtBQUFhO0FBRHRCLFVBRUEsSUFGQSxHQUVNLEtBQUssS0FGWCxDQUVBLElBRkE7O0FBR1AsYUFDRSxxRUFBZ0IsTUFBTSxJQUF0QixFQUE0QixLQUFLLEtBQUssS0FBTCxDQUFXLElBQTVDLEVBQWtELGtDQUFsRCxJQUE4RSxLQUFLLEtBQW5GLEVBREY7QUFHRDs7OzhCQUVRO0FBQ1AsY0FBUSxHQUFSLENBQVksT0FBWjtBQUNBLGFBQU8sT0FBUCxDQUFlLFlBQWYsRUFBNEIsa0JBQTVCO0FBQ0Q7OzsyQ0FDc0I7QUFDckIsYUFBTyxXQUFQLENBQW1CLEtBQUssS0FBeEI7QUFDRDs7OztFQXREc0MsZ0JBQU0sUzs7QUFBMUIsVyxDQUNaLFMsR0FBWTtBQUNqQixRQUFNLGdCQUFNLFNBQU4sQ0FBZ0I7QUFETCxDO2tCQURBLFciLCJmaWxlIjoidHJlZV9icm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxucmVxdWlyZSgnLi90cmVlX2Jyb3dzZXIubGVzcycpO1xyXG52YXIgUHViU3ViID1yZXF1aXJlKCdwdWJzdWItanMnKTtcclxuaW1wb3J0IE5vZGVXaXRoQ2hpbGRyZW4gZnJvbSAnLi9ub2RlX3dpdGhfY2hpbGRyZW4nO1xyXG5pbXBvcnQgVHJlZU5vZGVSZWFkZXIgZnJvbSAndHJlZW5vdGUyL2xpYi9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlcic7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJlZUJyb3dzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XHJcbiAgICBuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgICB0aGlzLnJlZnJlc2godGhpcy5wcm9wcyk7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgZnVuY3Rpb24gbXlTdWJzY3JpYmVyKG1zZyxnaWQpe1xyXG4gICAgICBjb25zdCB7dHJlZSxyb290LHJlbmRlcn09bWUucHJvcHM7XHJcbiAgICAgIG1lLnJlZnJlc2goe3RyZWUscm9vdCxyZW5kZXIsZ2lkfSlcclxuICAgIH1cclxuICAgIHRoaXMudG9rZW49UHViU3ViLnN1YnNjcmliZSgnY2xpY2stbm9kZScsbXlTdWJzY3JpYmVyKTtcclxuICB9XHJcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgIHRoaXMucmVmcmVzaChuZXh0UHJvcHMpO1xyXG4gIH1cclxuXHJcbiAgcmVmcmVzaChwcm9wcyl7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgY29uc3Qge3RyZWUscm9vdCxyZW5kZXIsZ2lkfT1wcm9wcztcclxuICAgIGlmKCF0cmVlIHx8ICFyb290fHwhcmVuZGVyKXtyZXR1cm47fVxyXG4gICAgdmFyIHN0YXRlO1xyXG4gICAgaWYoZ2lkPT11bmRlZmluZWQpe1xyXG4gICAgICBzdGF0ZT17cm9vdDpyb290LHJlbmRlcjpyZW5kZXIsbGFzdF9jb2w6cm9vdCxjdXJfY29sOnJvb3QsY3VyX2dpZDpudWxsfVxyXG4gICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgIH1lbHNle1xyXG4gICAgICB0cmVlLnJlYWQoZ2lkKS50aGVuKG5vZGU9PntcclxuICAgICAgICBjb25zdCBwZ2lkPW5vZGUuX2xpbmsucDtcclxuICAgICAgICBzdGF0ZT17cm9vdDpyb290LHJlbmRlcjpyZW5kZXIsbGFzdF9jb2w6cGdpZCxjdXJfY29sOnBnaWQsY3VyX2dpZDpnaWR9XHJcbiAgICAgICAgbWUuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgaWYoIXRoaXMuc3RhdGUpe3JldHVybiBudWxsO31cclxuICAgIGNvbnN0IHt0cmVlfT10aGlzLnByb3BzO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPFRyZWVOb2RlUmVhZGVyIHRyZWU9e3RyZWV9IGdpZD17dGhpcy5zdGF0ZS5yb290fSB2aWV3PXtOb2RlV2l0aENoaWxkcmVufSB7Li4udGhpcy5zdGF0ZX0vPlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIG9uQ2xpY2soKXtcclxuICAgIGNvbnNvbGUubG9nKCdjbGljaycpXHJcbiAgICBQdWJTdWIucHVibGlzaCgnY2xpY2stbm9kZScsXCJLdDg1elA1Q0ZWc0h0bHhjXCIpXHJcbiAgfVxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gICAgUHViU3ViLnVuc3Vic2NyaWJlKHRoaXMudG9rZW4pO1xyXG4gIH1cclxufVxyXG4iXX0=