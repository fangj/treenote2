'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _node_with_children = require('./node_with_children');

var _node_with_children2 = _interopRequireDefault(_node_with_children);

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
      return _react2.default.createElement(_node_with_children2.default, this.state);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyL3RyZWVfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBR0E7Ozs7Ozs7Ozs7OztBQUZBLFFBQVEscUJBQVI7QUFDQSxJQUFJLFNBQVEsUUFBUSxXQUFSLENBQVo7O0lBRXFCLFc7OztBQUtuQix1QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEscUhBQ1gsS0FEVztBQUVsQjs7Ozt3Q0FHbUI7QUFDbEIsV0FBSyxPQUFMLENBQWEsS0FBSyxLQUFsQjtBQUNBLFVBQU0sS0FBRyxJQUFUO0FBQ0EsZUFBUyxZQUFULENBQXNCLEdBQXRCLEVBQTBCLEdBQTFCLEVBQThCO0FBQUEsd0JBQ0gsR0FBRyxLQURBO0FBQUEsWUFDckIsSUFEcUIsYUFDckIsSUFEcUI7QUFBQSxZQUNoQixJQURnQixhQUNoQixJQURnQjtBQUFBLFlBQ1gsTUFEVyxhQUNYLE1BRFc7O0FBRTVCLFdBQUcsT0FBSCxDQUFXLEVBQUMsVUFBRCxFQUFNLFVBQU4sRUFBVyxjQUFYLEVBQWtCLFFBQWxCLEVBQVg7QUFDRDtBQUNELFdBQUssS0FBTCxHQUFXLE9BQU8sU0FBUCxDQUFpQixZQUFqQixFQUE4QixZQUE5QixDQUFYO0FBQ0Q7Ozs4Q0FDeUIsUyxFQUFXO0FBQ25DLFdBQUssT0FBTCxDQUFhLFNBQWI7QUFDRDs7OzRCQUVPLEssRUFBTTtBQUNaLFVBQU0sS0FBRyxJQUFUO0FBRFksVUFFTCxJQUZLLEdBRWlCLEtBRmpCLENBRUwsSUFGSztBQUFBLFVBRUEsSUFGQSxHQUVpQixLQUZqQixDQUVBLElBRkE7QUFBQSxVQUVLLE1BRkwsR0FFaUIsS0FGakIsQ0FFSyxNQUZMO0FBQUEsVUFFWSxHQUZaLEdBRWlCLEtBRmpCLENBRVksR0FGWjs7QUFHWixVQUFHLENBQUMsSUFBRCxJQUFTLENBQUMsSUFBVixJQUFnQixDQUFDLE1BQXBCLEVBQTJCO0FBQUM7QUFBUTtBQUNwQyxVQUFJLEtBQUo7QUFDQSxVQUFHLE9BQUssU0FBUixFQUFrQjtBQUNoQixnQkFBTSxFQUFDLE1BQUssSUFBTixFQUFXLFFBQU8sTUFBbEIsRUFBeUIsVUFBUyxJQUFsQyxFQUF1QyxTQUFRLElBQS9DLEVBQW9ELFNBQVEsSUFBNUQsRUFBTjtBQUNBLGFBQUssUUFBTCxDQUFjLEtBQWQ7QUFDRCxPQUhELE1BR0s7QUFDSCxhQUFLLElBQUwsQ0FBVSxHQUFWLEVBQWUsSUFBZixDQUFvQixnQkFBTTtBQUN4QixjQUFNLE9BQUssS0FBSyxLQUFMLENBQVcsQ0FBdEI7QUFDQSxrQkFBTSxFQUFDLE1BQUssSUFBTixFQUFXLFFBQU8sTUFBbEIsRUFBeUIsVUFBUyxJQUFsQyxFQUF1QyxTQUFRLElBQS9DLEVBQW9ELFNBQVEsR0FBNUQsRUFBTjtBQUNBLGFBQUcsUUFBSCxDQUFZLEtBQVo7QUFDRCxTQUpEO0FBS0Q7QUFDRjs7OzZCQUVRO0FBQ1AsVUFBRyxDQUFDLEtBQUssS0FBVCxFQUFlO0FBQUMsZUFBTyxJQUFQO0FBQWE7QUFDN0IsYUFDRSw0REFBc0IsS0FBSyxLQUEzQixDQURGO0FBR0Q7Ozs4QkFFUTtBQUNQLGNBQVEsR0FBUixDQUFZLE9BQVo7QUFDQSxhQUFPLE9BQVAsQ0FBZSxZQUFmLEVBQTRCLGtCQUE1QjtBQUNEOzs7MkNBQ3NCO0FBQ3JCLGFBQU8sV0FBUCxDQUFtQixLQUFLLEtBQXhCO0FBQ0Q7Ozs7RUFyRHNDLGdCQUFNLFM7O0FBQTFCLFcsQ0FDWixTLEdBQVk7QUFDakIsUUFBTSxnQkFBTSxTQUFOLENBQWdCO0FBREwsQztrQkFEQSxXIiwiZmlsZSI6InRyZWVfYnJvd3Nlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbnJlcXVpcmUoJy4vdHJlZV9icm93c2VyLmxlc3MnKTtcclxudmFyIFB1YlN1YiA9cmVxdWlyZSgncHVic3ViLWpzJyk7XHJcbmltcG9ydCBOb2RlV2l0aENoaWxkcmVuIGZyb20gJy4vbm9kZV93aXRoX2NoaWxkcmVuJztcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJlZUJyb3dzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XHJcbiAgICBuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgICB0aGlzLnJlZnJlc2godGhpcy5wcm9wcyk7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgZnVuY3Rpb24gbXlTdWJzY3JpYmVyKG1zZyxnaWQpe1xyXG4gICAgICBjb25zdCB7dHJlZSxyb290LHJlbmRlcn09bWUucHJvcHM7XHJcbiAgICAgIG1lLnJlZnJlc2goe3RyZWUscm9vdCxyZW5kZXIsZ2lkfSlcclxuICAgIH1cclxuICAgIHRoaXMudG9rZW49UHViU3ViLnN1YnNjcmliZSgnY2xpY2stbm9kZScsbXlTdWJzY3JpYmVyKTtcclxuICB9XHJcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgIHRoaXMucmVmcmVzaChuZXh0UHJvcHMpO1xyXG4gIH1cclxuXHJcbiAgcmVmcmVzaChwcm9wcyl7XHJcbiAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgY29uc3Qge3RyZWUscm9vdCxyZW5kZXIsZ2lkfT1wcm9wcztcclxuICAgIGlmKCF0cmVlIHx8ICFyb290fHwhcmVuZGVyKXtyZXR1cm47fVxyXG4gICAgdmFyIHN0YXRlO1xyXG4gICAgaWYoZ2lkPT11bmRlZmluZWQpe1xyXG4gICAgICBzdGF0ZT17cm9vdDpyb290LHJlbmRlcjpyZW5kZXIsbGFzdF9jb2w6cm9vdCxjdXJfY29sOnJvb3QsY3VyX2dpZDpudWxsfVxyXG4gICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgIH1lbHNle1xyXG4gICAgICB0cmVlLnJlYWQoZ2lkKS50aGVuKG5vZGU9PntcclxuICAgICAgICBjb25zdCBwZ2lkPW5vZGUuX2xpbmsucDtcclxuICAgICAgICBzdGF0ZT17cm9vdDpyb290LHJlbmRlcjpyZW5kZXIsbGFzdF9jb2w6cGdpZCxjdXJfY29sOnBnaWQsY3VyX2dpZDpnaWR9XHJcbiAgICAgICAgbWUuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgaWYoIXRoaXMuc3RhdGUpe3JldHVybiBudWxsO31cclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxOb2RlV2l0aENoaWxkcmVuIHsuLi50aGlzLnN0YXRlfS8+XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgb25DbGljaygpe1xyXG4gICAgY29uc29sZS5sb2coJ2NsaWNrJylcclxuICAgIFB1YlN1Yi5wdWJsaXNoKCdjbGljay1ub2RlJyxcIkt0ODV6UDVDRlZzSHRseGNcIilcclxuICB9XHJcbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XHJcbiAgICBQdWJTdWIudW5zdWJzY3JpYmUodGhpcy50b2tlbik7XHJcbiAgfVxyXG59XHJcbiJdfQ==