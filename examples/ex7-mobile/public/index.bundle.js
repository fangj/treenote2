webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(2);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _classnames = __webpack_require__(11);

	var _classnames2 = _interopRequireDefault(_classnames);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var width = window.innerWidth;
	var height = window.innerHeight;
	__webpack_require__(57);

	var containerStyle = {
	  position: "relative",
	  backgroundColor: '#F5FCFF',
	  height: height,
	  width: width * 3
	};
	var styles = {
	  leftlist: {
	    position: "absolute",
	    backgroundColor: 'lightpink',
	    width: width,
	    height: height,
	    flex: 1,
	    justifyContent: 'center',
	    alignItems: 'center'
	  },
	  middlelist: {
	    position: "absolute",
	    backgroundColor: 'lightgreen',
	    width: width,
	    height: height,
	    flex: 1,
	    justifyContent: 'center',
	    alignItems: 'center'
	  },
	  rightlist: {
	    position: "absolute",
	    backgroundColor: 'lightblue',
	    width: width,
	    height: height,
	    flex: 1,
	    justifyContent: 'center',
	    alignItems: 'center'
	  },
	  card: {
	    width: width,
	    height: height * 2 / 3,
	    borderWidth: 2,
	    borderColor: 'gray',
	    borderStyle: 'dashed',
	    flex: 1,
	    justifyContent: 'center',
	    alignItems: 'center'
	  },
	  text: {
	    fontSize: 72
	  }
	};

	var TreeViewMobile = function (_React$Component) {
	  _inherits(TreeViewMobile, _React$Component);

	  function TreeViewMobile(props) {
	    _classCallCheck(this, TreeViewMobile);

	    var _this = _possibleConstructorReturn(this, (TreeViewMobile.__proto__ || Object.getPrototypeOf(TreeViewMobile)).call(this, props));

	    _this.state = { contX: 0, leftX: 0, middleX: width, rightX: 2 * width,
	      llist: 0, mlist: 1, rlist: 2,
	      mlist_y: 0, rlist_y: 0 };
	    _this.accept = _this.accept.bind(_this);
	    _this.handleTouchStart = _this.handleTouchStart.bind(_this);
	    _this.handleTouchMove = _this.handleTouchMove.bind(_this);
	    _this.handleTouchEnd = _this.handleTouchEnd.bind(_this);
	    _this.handleTouchCancel = _this.handleTouchCancel.bind(_this);
	    return _this;
	  }

	  _createClass(TreeViewMobile, [{
	    key: 'render',
	    value: function render() {
	      var contX = this.state.contX;

	      return _react2.default.createElement(
	        'div',
	        { className: 'tree-container', style: { left: contX } },
	        _react2.default.createElement(
	          'div',
	          { className: 'list leftlist' },
	          'left'
	        ),
	        _react2.default.createElement(
	          'div',
	          { className: 'list middlelist', ref: 'middlelist' },
	          'middle',
	          _react2.default.createElement('div', { className: 'card' }),
	          _react2.default.createElement('div', { className: 'card' }),
	          _react2.default.createElement('div', { className: 'card' }),
	          _react2.default.createElement('div', { className: 'card' })
	        ),
	        _react2.default.createElement(
	          'div',
	          { className: 'list rightlist' },
	          'right'
	        )
	      );
	    }
	  }, {
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      var el = this.refs.middlelist;
	      el.addEventListener('touchstart', this.handleTouchStart, false);
	      el.addEventListener("touchend", this.handleTouchEnd, false);
	      el.addEventListener("touchcancel", this.handleTouchCancel, false);
	      el.addEventListener("touchmove", this.handleTouchMove, false);
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      var el = this.refs.middlelist;
	      el.removeEventListener('touchstart', this.handleTouchStart, false);
	      el.removeEventListener("touchend", this.handleTouchEnd, false);
	      el.removeEventListener("touchcancel", this.handleTouchCancel, false);
	      el.removeEventListener("touchmove", this.handleTouchMove, false);
	    }
	  }, {
	    key: 'handleTouchStart',
	    value: function handleTouchStart(e) {
	      console.log('touchstart', e.changedTouches[0].pageX);
	      var x = e.changedTouches[0].pageX;
	      this.startX = x; //开始touch时的x位置
	    }
	  }, {
	    key: 'handleTouchMove',
	    value: function handleTouchMove(e) {
	      console.log('touchmove', e.changedTouches[0].pageX);
	      var x = e.changedTouches[0].pageX;
	      var dx = x - this.startX;
	      if (Math.abs(dx) > 20) {
	        e.preventDefault(); //接管移动
	        this.accept("contX", dx);
	      }
	    }
	  }, {
	    key: 'handleTouchEnd',
	    value: function handleTouchEnd(e) {
	      console.log('touchend', e.changedTouches[0].pageX);
	      me.accept("panEnd", dx);
	    }
	  }, {
	    key: 'handleTouchCancel',
	    value: function handleTouchCancel(e) {
	      console.log('touchcancel', e.changedTouches[0].pageX);
	    }
	  }, {
	    key: 'accept',
	    value: function accept(msg, data) {
	      var state = this.state || {}; //获取当前的state值
	      var fns = {
	        "contX": setContainerX //响应msg的函数列表
	        // "panEnd":panEnd,
	        // "panStart":panStart,
	        // "measureCard":measureCard,
	        // "recordScrollY":recordScrollY //记录滚动位置
	      };
	      if (fns[msg]) {
	        //如果有响应函数，用响应函数处理state后刷新组件
	        state = fns[msg](state, data, msg, this);
	        if (state) {
	          this.setState(state);
	        }
	      }
	    }
	  }]);

	  return TreeViewMobile;
	}(_react2.default.Component);

	TreeViewMobile.propTypes = {
	  name: _react2.default.PropTypes.string
	};
	exports.default = TreeViewMobile;
	; //end class

	function setContainerX(state, dx, msg) {
	  state.contX = dx;
	  return state;
	}

	function panStart(state, dx, msg, me) {
	  me.panStartTime = Date.now(); //开始移动时间
	  var layout = me.layouts[2]; //取得2号卡片的位置，假设2号卡片是拖动的卡片
	  var scrollY = me.scrollY || 0;
	  var posY = layout.y - scrollY; //减去滚动的相对位置，得到相对于屏幕的距离
	  state.rlist_y = Math.max(posY, 0);
	  // state.rlist_y=layout.y;
	}

	function panEnd(state, dx, msg, me) {
	  console.log("panEnd");
	  if (Math.abs(dx) < 20) {
	    //不移动
	    state.contX = -width;
	    me.setState(state);
	  } else {
	    var panEndTime = Date.now();
	    var v = (width - Math.abs(dx)) / (panEndTime - me.panStartTime);
	    if (dx < -20) {
	      //左移
	      state.contX = dx;
	      state.llist = state.mlist;
	      state.mlist = state.rlist;
	      state.mlist_y = state.rlist_y; //拷贝右侧位置
	      state.rlist_y = 0; //恢复
	      state.rlist = state.mlist + 1;
	      me._scrollView.scrollTo({ x: 0, y: 0, animated: false });
	      tweenH(me, state, v).chain(tweenUp(me, state)).start(); //左移后还需上移
	    } else {
	      //右移
	      state.contX = -2 * width + dx;
	      state.rlist = state.mlist;
	      state.mlist = state.llist;
	      state.llist = state.mlist - 1;
	      tweenH(me, state, v).start();
	    }
	  }
	  return null;
	}

	//横向移动动画
	var tweenH = function tweenH(me, state, v) {
	  return new TWEEN.Tween(state).easing(TWEEN.Easing.Quadratic.In).to({ contX: -width }, Math.abs(state.contX - -width) / v).onUpdate(function () {
	    me.setState(state);
	  });
	};

	var tweenUp = function tweenUp(me, state) {
	  return new TWEEN.Tween(state).to({ mlist_y: 0 }, 300).onUpdate(function () {
	    me.setState(state);
	  });
	};

	_reactDom2.default.render(_react2.default.createElement(TreeViewMobile, null), document.getElementById('root'));

/***/ },

/***/ 57:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }

});