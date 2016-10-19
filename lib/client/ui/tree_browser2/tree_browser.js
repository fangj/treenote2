'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tree_node_reader = require('treenote2/src/client/ui/tree_node_reader');

var _tree_node_reader2 = _interopRequireDefault(_tree_node_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cx = require("classnames");
var _ = require("lodash");
require('./tree_browser.less');
var PubSub = require("pubsub-js");

var NodeWrapper = function (_React$Component) {
  _inherits(NodeWrapper, _React$Component);

  function NodeWrapper(props) {
    _classCallCheck(this, NodeWrapper);

    var _this = _possibleConstructorReturn(this, (NodeWrapper.__proto__ || Object.getPrototypeOf(NodeWrapper)).call(this, props));

    var _this$props = _this.props;
    var expands = _this$props.expands;
    var focus = _this$props.focus;

    _this.state = { expands: expands || [], focus: focus };
    return _this;
  }

  _createClass(NodeWrapper, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var gid = _props.gid;
      var node = _props.node;
      var render = _props.render;
      var tree = _props.tree;
      var _state = this.state;
      var expands = _state.expands;
      var focus = _state.focus;

      var expand = false; //是否要展开当前节点？默认不展开
      if (expands.length > 0) {
        var _expands = _toArray(expands);

        var first = _expands[0];

        var remain = _expands.slice(1);

        if (first === node._id) {
          expand = true; //当前结点在要展开的节点中，展开
        }
      }
      this.state.expand = expand;
      if (expand) {
        return _react2.default.createElement(_tree_node_reader2.default, { tree: tree, gid: node._id, view: NodeWithChildren, render: render, focus: focus, level: 1, expands: remain });
      } else {
        return _react2.default.createElement(Noder, { tree: tree, node: node, render: render, focus: focus });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var me = this;
      var node = this.props.node;

      function mysubscriber(gid, data) {
        console.log('got', gid, data);
        if (data.msg == 'focus') {
          var focus = data.gid;

          console.log('old state', me.state);
          console.log('new state', {
            expands: [node._id, focus],
            focus: focus
          });

          me.setState({
            expands: [node._id, focus],
            focus: focus
          });
        }
      }
      this.token = PubSub.subscribe(node._id, mysubscriber);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      PubSub.unsubscribe(this.token);
    }
  }]);

  return NodeWrapper;
}(_react2.default.Component);

var NodeWithChildren = function NodeWithChildren(props) {
  console.log('NodeWithChildren render');
  var render = props.render;
  var node = props.node;
  var focus = props.focus;

  var others = _objectWithoutProperties(props, ['render', 'node', 'focus']);

  var vnode = { _type: "vnode", _p: node._id };
  return _react2.default.createElement(
    'div',
    { className: 'node' },
    _react2.default.createElement(
      'div',
      { className: cx("main", { focus: focus === node._id }) },
      render(node)
    ),
    _react2.default.createElement(
      'div',
      { className: cx("children", { focus: _.includes(node._link.children, focus) }) },
      render(vnode),
      node._children.map(function (cnode) {
        return _react2.default.createElement(NodeWrapper, _extends({ key: cnode._id, node: cnode, render: render, focus: focus }, others));
      })
    )
  );
};

// class NodeWithChildren extends React.Component {
//   static propTypes = {
//     node: React.PropTypes.object,
//   };

//   constructor(props) {
//     super(props);
//   }

//   render() {
//   	console.log('NodeWithChildren render')
//     const me=this;
//     const {render,node,focus,...others}=me.props;
//     const vnode={_type:"vnode",_p:node._id};
//     return (
//         <div className="node" >
//           <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
//           <div className={cx("children",{focus:_.includes(node._link.children, focus)})}>{render(vnode)}{node._children.map(cnode=><NodeWrapper key={cnode._id} node={cnode} render={render}  focus={focus}  {...others} />)}</div>
//         </div>

//     );
//   }
// }

// class Noder extends React.Component {
//   static propTypes = {
//     node: React.PropTypes.object,
//   };

//   constructor(props) {
//     super(props);
//   }

//   render() {
//     const me=this;
//     const {render,node,expands,focus}=me.props;
//     return (
//         <div className="node" >
//           <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
//         </div>

//     );
//   }
// }

var Noder = function Noder(props) {
  var render = props.render;
  var node = props.node;
  var expands = props.expands;
  var focus = props.focus;

  return _react2.default.createElement(
    'div',
    { className: 'node' },
    _react2.default.createElement(
      'div',
      { className: cx("main", { focus: focus === node._id }) },
      render(node)
    )
  );
};

var tree_browser = function (_React$Component2) {
  _inherits(tree_browser, _React$Component2);

  function tree_browser() {
    _classCallCheck(this, tree_browser);

    return _possibleConstructorReturn(this, (tree_browser.__proto__ || Object.getPrototypeOf(tree_browser)).apply(this, arguments));
  }

  _createClass(tree_browser, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var tree = _props2.tree;
      var root = _props2.root;
      var gid = _props2.gid;

      var others = _objectWithoutProperties(_props2, ['tree', 'root', 'gid']);

      return _react2.default.createElement(_tree_node_reader2.default, _extends({ tree: tree, gid: root, level: 0, view: NodeWrapper, focus: gid }, others));
    }
  }]);

  return tree_browser;
}(_react2.default.Component);

exports.default = tree_browser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9icm93c2VyMi90cmVlX2Jyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFJLEtBQUksUUFBUyxZQUFULENBQVI7QUFDQSxJQUFJLElBQUUsUUFBUSxRQUFSLENBQU47QUFDQSxRQUFRLHFCQUFSO0FBQ0EsSUFBSSxTQUFRLFFBQVMsV0FBVCxDQUFaOztJQUVNLFc7OztBQUNKLHVCQUFZLEtBQVosRUFBbUI7QUFBQTs7QUFBQSwwSEFDWCxLQURXOztBQUFBLHNCQUVLLE1BQUssS0FGVjtBQUFBLFFBRVYsT0FGVSxlQUVWLE9BRlU7QUFBQSxRQUVGLEtBRkUsZUFFRixLQUZFOztBQUdqQixVQUFLLEtBQUwsR0FBVyxFQUFDLFNBQVEsV0FBUyxFQUFsQixFQUFxQixZQUFyQixFQUFYO0FBSGlCO0FBSWxCOzs7OzZCQUVRO0FBQUEsbUJBQ3FCLEtBQUssS0FEMUI7QUFBQSxVQUNELEdBREMsVUFDRCxHQURDO0FBQUEsVUFDRyxJQURILFVBQ0csSUFESDtBQUFBLFVBQ1EsTUFEUixVQUNRLE1BRFI7QUFBQSxVQUNlLElBRGYsVUFDZSxJQURmO0FBQUEsbUJBRWMsS0FBSyxLQUZuQjtBQUFBLFVBRUQsT0FGQyxVQUVELE9BRkM7QUFBQSxVQUVPLEtBRlAsVUFFTyxLQUZQOztBQUdULFVBQUksU0FBTyxLQUFYLENBSFMsQ0FHUTtBQUNqQixVQUFHLFFBQVEsTUFBUixHQUFlLENBQWxCLEVBQW9CO0FBQUEsZ0NBQ0csT0FESDs7QUFBQSxZQUNkLEtBRGM7O0FBQUEsWUFDTCxNQURLOztBQUVuQixZQUFHLFVBQVEsS0FBSyxHQUFoQixFQUFvQjtBQUNuQixtQkFBTyxJQUFQLENBRG1CLENBQ1A7QUFDWjtBQUNEO0FBQ0QsV0FBSyxLQUFMLENBQVcsTUFBWCxHQUFrQixNQUFsQjtBQUNDLFVBQUcsTUFBSCxFQUFVO0FB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QVM7QUFBQSxNQUNWLE1BRFUsR0FDaUIsS0FEakIsQ0FDVixNQURVO0FBQUEsTUFDSCxJQURHLEdBQ2lCLEtBRGpCLENBQ0gsSUFERztBQUFBLE1BQ0UsT0FERixHQUNpQixLQURqQixDQUNFLE9BREY7QUFBQSxNQUNVLEtBRFYsR0FDaUIsS0FEakIsQ0FDVSxLQURWOztBQUVqQixTQUNJO0FBQUE7QUFBQSxNQUFLLFdBQVUsTUFBZjtBQUNFO0FBQUE7QUFBQSxRQUFLLFdBQVcsR0FBRyxNQUFILEVBQVUsRUFBQyxPQUFNLFVBQVEsS0FBSyxHQUFwQixFQUFWLENBQWhCO0FBQXNELGFBQU8sSUFBUDtBQUF0RDtBQURGLEdBREo7QUFNSCxDQVJEOztJQVlxQixZOzs7Ozs7Ozs7Ozs2QkFDVjtBQUFBLG9CQUNzQixLQUFLLEtBRDNCO0FBQUEsVUFDSCxJQURHLFdBQ0gsSUFERztBQUFBLFVBQ0UsSUFERixXQUNFLElBREY7QUFBQSxVQUNPLEdBRFAsV0FDTyxHQURQOztBQUFBLFVBQ2MsTUFEZDs7QUFFUixhQUFPLHFFQUFnQixNQUFNLElBQXRCLEVBQTRCLEtBQUssSUFBakMsRUFBdUMsT0FBTyxDQUE5QyxFQUFpRCxNQUFNLFdBQXZELEVBQW9FLE9BQU8sR0FBM0UsSUFBb0YsTUFBcEYsRUFBUDtBQUNBOzs7O0VBSnVDLGdCQUFNLFM7O2tCQUEzQixZIiwiZmlsZSI6InRyZWVfYnJvd3Nlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBUcmVlTm9kZVJlYWRlciBmcm9tICd0cmVlbm90ZTIvc3JjL2NsaWVudC91aS90cmVlX25vZGVfcmVhZGVyJztcclxudmFyIGN4ID1yZXF1aXJlIChcImNsYXNzbmFtZXNcIik7XHJcbnZhciBfPXJlcXVpcmUoXCJsb2Rhc2hcIik7XHJcbnJlcXVpcmUoJy4vdHJlZV9icm93c2VyLmxlc3MnKTtcclxudmFyIFB1YlN1YiA9cmVxdWlyZSAoXCJwdWJzdWItanNcIik7XHJcblxyXG5jbGFzcyBOb2RlV3JhcHBlciBleHRlbmRzICBSZWFjdC5Db21wb25lbnQge1xyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgICBjb25zdCB7ZXhwYW5kcyxmb2N1c309dGhpcy5wcm9wcztcclxuICAgIHRoaXMuc3RhdGU9e2V4cGFuZHM6ZXhwYW5kc3x8W10sZm9jdXN9XHJcbiAgfVxyXG5cclxuICByZW5kZXIoKSB7XHJcblx0ICBjb25zdCB7Z2lkLG5vZGUscmVuZGVyLHRyZWV9PXRoaXMucHJvcHM7XHJcblx0ICBjb25zdCB7ZXhwYW5kcyxmb2N1c309dGhpcy5zdGF0ZTtcclxuXHRcdHZhciBleHBhbmQ9ZmFsc2U7Ly/mmK/lkKbopoHlsZXlvIDlvZPliY3oioLngrnvvJ/pu5jorqTkuI3lsZXlvIBcclxuXHRcdGlmKGV4cGFuZHMubGVuZ3RoPjApe1xyXG5cdFx0XHR2YXIgW2ZpcnN0LC4uLnJlbWFpbl09ZXhwYW5kcztcclxuXHRcdFx0aWYoZmlyc3Q9PT1ub2RlLl9pZCl7XHJcblx0XHRcdFx0ZXhwYW5kPXRydWU7Ly/lvZPliY3nu5PngrnlnKjopoHlsZXlvIDnmoToioLngrnkuK3vvIzlsZXlvIBcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dGhpcy5zdGF0ZS5leHBhbmQ9ZXhwYW5kO1xyXG5cdCAgaWYoZXhwYW5kKXtcclxuXHQgIFx0cmV0dXJuIDxUcmVlTm9kZVJlYWRlciAgdHJlZT17dHJlZX0gZ2lkPXtub2RlLl9pZH0gdmlldz17Tm9kZVdpdGhDaGlsZHJlbn0gIHJlbmRlcj17cmVuZGVyfSBmb2N1cz17Zm9jdXN9IGxldmVsPXsxfSBleHBhbmRzPXtyZW1haW59Lz5cclxuXHQgIH1lbHNle1xyXG5cdCAgXHRyZXR1cm4gPE5vZGVyICB0cmVlPXt0cmVlfSBub2RlPXtub2RlfSAgcmVuZGVyPXtyZW5kZXJ9ICBmb2N1cz17Zm9jdXN9IC8+XHJcblx0ICB9XHJcbiAgfVx0XHJcblxyXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gIFx0Y29uc3QgbWU9dGhpcztcclxuICBcdGNvbnN0IHtub2RlfT10aGlzLnByb3BzO1xyXG4gIFx0ZnVuY3Rpb24gbXlzdWJzY3JpYmVyKGdpZCxkYXRhKXtcclxuICBcdFx0Y29uc29sZS5sb2coJ2dvdCcsZ2lkLGRhdGEpO1xyXG4gIFx0XHRpZihkYXRhLm1zZz09J2ZvY3VzJyl7XHJcbiAgXHRcdFx0Y29uc3QgZm9jdXM9ZGF0YS5naWQ7XHJcbiAgXHRcdFxyXG4gIFx0XHRcdGNvbnNvbGUubG9nKCdvbGQgc3RhdGUnLG1lLnN0YXRlKTtcclxuICBcdFx0XHRjb25zb2xlLmxvZygnbmV3IHN0YXRlJyx7XHJcbiAgXHRcdFx0XHRleHBhbmRzOltub2RlLl9pZCxmb2N1c10sXHJcbiAgXHRcdFx0XHRmb2N1c1xyXG4gIFx0XHRcdH0pO1xyXG5cclxuICBcdFx0XHRtZS5zZXRTdGF0ZSh7XHJcbiAgXHRcdFx0XHRleHBhbmRzOltub2RlLl9pZCxmb2N1c10sXHJcbiAgXHRcdFx0XHRmb2N1c1xyXG4gIFx0XHRcdH0pXHJcbiAgXHRcdH1cclxuICBcdH1cclxuICBcdHRoaXMudG9rZW49UHViU3ViLnN1YnNjcmliZShub2RlLl9pZCxteXN1YnNjcmliZXIpXHJcbiAgfVxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gIFx0UHViU3ViLnVuc3Vic2NyaWJlKHRoaXMudG9rZW4pO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmNvbnN0IE5vZGVXaXRoQ2hpbGRyZW49KHByb3BzKT0+e1xyXG5cdGNvbnNvbGUubG9nKCdOb2RlV2l0aENoaWxkcmVuIHJlbmRlcicpXHJcbiAgICBjb25zdCB7cmVuZGVyLG5vZGUsZm9jdXMsLi4ub3RoZXJzfT1wcm9wcztcclxuICAgIGNvbnN0IHZub2RlPXtfdHlwZTpcInZub2RlXCIsX3A6bm9kZS5faWR9O1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm5vZGVcIiA+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y3goXCJtYWluXCIse2ZvY3VzOmZvY3VzPT09bm9kZS5faWR9KX0+e3JlbmRlcihub2RlKX08L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeChcImNoaWxkcmVuXCIse2ZvY3VzOl8uaW5jbHVkZXMobm9kZS5fbGluay5jaGlsZHJlbiwgZm9jdXMpfSl9PntyZW5kZXIodm5vZGUpfXtub2RlLl9jaGlsZHJlbi5tYXAoY25vZGU9PjxOb2RlV3JhcHBlciBrZXk9e2Nub2RlLl9pZH0gbm9kZT17Y25vZGV9IHJlbmRlcj17cmVuZGVyfSAgZm9jdXM9e2ZvY3VzfSAgey4uLm90aGVyc30gLz4pfTwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIFxyXG4gICAgKTtcclxufVxyXG5cclxuLy8gY2xhc3MgTm9kZVdpdGhDaGlsZHJlbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbi8vICAgc3RhdGljIHByb3BUeXBlcyA9IHtcclxuLy8gICAgIG5vZGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXHJcbi8vICAgfTtcclxuXHJcbi8vICAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuLy8gICAgIHN1cGVyKHByb3BzKTtcclxuLy8gICB9XHJcblxyXG4vLyAgIHJlbmRlcigpIHtcclxuLy8gICBcdGNvbnNvbGUubG9nKCdOb2RlV2l0aENoaWxkcmVuIHJlbmRlcicpXHJcbi8vICAgICBjb25zdCBtZT10aGlzO1xyXG4vLyAgICAgY29uc3Qge3JlbmRlcixub2RlLGZvY3VzLC4uLm90aGVyc309bWUucHJvcHM7XHJcbi8vICAgICBjb25zdCB2bm9kZT17X3R5cGU6XCJ2bm9kZVwiLF9wOm5vZGUuX2lkfTtcclxuLy8gICAgIHJldHVybiAoXHJcbi8vICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJub2RlXCIgPlxyXG4vLyAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2N4KFwibWFpblwiLHtmb2N1czpmb2N1cz09PW5vZGUuX2lkfSl9PntyZW5kZXIobm9kZSl9PC9kaXY+XHJcbi8vICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y3goXCJjaGlsZHJlblwiLHtmb2N1czpfLmluY2x1ZGVzKG5vZGUuX2xpbmsuY2hpbGRyZW4sIGZvY3VzKX0pfT57cmVuZGVyKHZub2RlKX17bm9kZS5fY2hpbGRyZW4ubWFwKGNub2RlPT48Tm9kZVdyYXBwZXIga2V5PXtjbm9kZS5faWR9IG5vZGU9e2Nub2RlfSByZW5kZXI9e3JlbmRlcn0gIGZvY3VzPXtmb2N1c30gIHsuLi5vdGhlcnN9IC8+KX08L2Rpdj5cclxuLy8gICAgICAgICA8L2Rpdj5cclxuICAgICAgICBcclxuLy8gICAgICk7XHJcbi8vICAgfVxyXG4vLyB9XHJcblxyXG4vLyBjbGFzcyBOb2RlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbi8vICAgc3RhdGljIHByb3BUeXBlcyA9IHtcclxuLy8gICAgIG5vZGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXHJcbi8vICAgfTtcclxuXHJcbi8vICAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuLy8gICAgIHN1cGVyKHByb3BzKTtcclxuLy8gICB9XHJcblxyXG4vLyAgIHJlbmRlcigpIHtcclxuLy8gICAgIGNvbnN0IG1lPXRoaXM7XHJcbi8vICAgICBjb25zdCB7cmVuZGVyLG5vZGUsZXhwYW5kcyxmb2N1c309bWUucHJvcHM7XHJcbi8vICAgICByZXR1cm4gKFxyXG4vLyAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibm9kZVwiID5cclxuLy8gICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeChcIm1haW5cIix7Zm9jdXM6Zm9jdXM9PT1ub2RlLl9pZH0pfT57cmVuZGVyKG5vZGUpfTwvZGl2PlxyXG4vLyAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIFxyXG4vLyAgICAgKTtcclxuLy8gICB9XHJcbi8vIH1cclxuXHJcbmNvbnN0IE5vZGVyPShwcm9wcyk9PntcclxuICAgIGNvbnN0IHtyZW5kZXIsbm9kZSxleHBhbmRzLGZvY3VzfT1wcm9wcztcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJub2RlXCIgPlxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2N4KFwibWFpblwiLHtmb2N1czpmb2N1cz09PW5vZGUuX2lkfSl9PntyZW5kZXIobm9kZSl9PC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgXHJcbiAgICApO1xyXG59XHJcblxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHRyZWVfYnJvd3NlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgcmVuZGVyKCkge1xyXG4gIFx0dmFyIHt0cmVlLHJvb3QsZ2lkLC4uLm90aGVyc309dGhpcy5wcm9wcztcclxuICBcdHJldHVybiA8VHJlZU5vZGVSZWFkZXIgdHJlZT17dHJlZX0gZ2lkPXtyb290fSBsZXZlbD17MH0gdmlldz17Tm9kZVdyYXBwZXJ9IGZvY3VzPXtnaWR9IHsuLi5vdGhlcnN9Lz5cclxuICB9XHJcbn0iXX0=