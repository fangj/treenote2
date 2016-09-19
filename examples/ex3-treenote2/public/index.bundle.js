webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(2);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var RestfulTable = __webpack_require__(3);

	var selectRowProp = {
	          mode: "radio",
	          clickToSelect: true,
	          bgColor: "rgb(238, 193, 213)"
	};

	_reactDom2.default.render(_react2.default.createElement(
	          RestfulTable,
	          { url: '/api/post', keyField: '_id',
	                    insertRow: true, deleteRow: true, selectRow: selectRowProp },
	          _react2.default.createElement(
	                    TableHeaderColumn,
	                    { dataField: 'title' },
	                    'title'
	          ),
	          _react2.default.createElement(
	                    TableHeaderColumn,
	                    { dataField: 'content' },
	                    'content'
	          )
	), document.getElementById('root'));

/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }return target;
	};

	var _createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	  };
	}();

	function _objectWithoutProperties(obj, keys) {
	  var target = {};for (var i in obj) {
	    if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];
	  }return target;
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _possibleConstructorReturn(self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	var ReactBSTable = __webpack_require__(4);
	var BootstrapTable = ReactBSTable.BootstrapTable;
	var TableHeaderColumn = ReactBSTable.TableHeaderColumn;
	// var Promise=require('bluebird');
	var agent = __webpack_require__(52)(__webpack_require__(53), Promise);

	var RestfulTable = function (_React$Component) {
	  _inherits(RestfulTable, _React$Component);

	  function RestfulTable(props) {
	    _classCallCheck(this, RestfulTable);

	    var _this = _possibleConstructorReturn(this, (RestfulTable.__proto__ || Object.getPrototypeOf(RestfulTable)).call(this, props));

	    _this.state = {
	      data: []
	    };
	    return _this;
	  }

	  _createClass(RestfulTable, [{
	    key: 'render',
	    value: function render() {
	      var me = this;
	      var optionsProp = {
	        afterTableComplete: me.onAfterTableComplete.bind(me), // A hook for after table render complete.
	        afterDeleteRow: me.onAfterDeleteRow.bind(me), // A hook for after droping rows.
	        afterInsertRow: me.onAfterInsertRow.bind(me) // A hook for after insert rows
	      };
	      var cellEditProp = {
	        mode: "click",
	        blurToSave: true,
	        afterSaveCell: me.onAfterSaveCell.bind(me)
	      };

	      var _props = this.props;
	      var data = _props.data;
	      var keyField = _props.keyField;
	      var cellEdit = _props.cellEdit;
	      var options = _props.options;

	      var others = _objectWithoutProperties(_props, ['data', 'keyField', 'cellEdit', 'options']);

	      cellEditProp = Object.assign({}, cellEdit, cellEditProp);
	      optionsProp = Object.assign({}, options, optionsProp);
	      var remote = this.props.remote;
	      if (remote === undefined) {
	        remote = true;
	      }
	      return React.createElement(BootstrapTable, _extends({
	        data: this.state.data, keyField: keyField, remote: remote, cellEdit: cellEditProp, options: optionsProp }, others), this.props.children);
	    }
	  }, {
	    key: 'onAfterTableComplete',
	    value: function onAfterTableComplete() {}
	  }, {
	    key: 'onAfterDeleteRow',
	    value: function onAfterDeleteRow(rowKeys) {
	      var _this2 = this;

	      var me = this;
	      console.log('delete', rowKeys);
	      var key = rowKeys[0]; //目前只删除第一行
	      var url = this.props.url;

	      agent.del(url + '/' + key).then(function (resp) {
	        console.log(resp.body);
	        var data = me.state.data;

	        data = data.filter(function (product) {
	          return product._id !== key;
	        });

	        _this2.setState({
	          data: data
	        });
	      });
	    }
	  }, {
	    key: 'onAfterInsertRow',
	    value: function onAfterInsertRow(row) {
	      var _this3 = this;

	      var _props2 = this.props;
	      var url = _props2.url;
	      var keyField = _props2.keyField;

	      agent.post(url, row).then(function (resp) {
	        console.log(resp.body);
	        var data = _this3.state.data;

	        data.push(resp.body);
	        _this3.setState({ data: data });
	      });
	    }
	  }, {
	    key: 'onAfterSaveCell',
	    value: function onAfterSaveCell(row, cellName, cellValue) {
	      var _props3 = this.props;
	      var url = _props3.url;
	      var keyField = _props3.keyField;

	      agent.put(url + '/' + row[keyField], row).then(function (resp) {});
	    }
	  }, {
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      var _this4 = this;

	      var url = this.props.url;

	      agent.get(url).then(function (resp) {
	        var data = resp.body;
	        _this4.setState({ data: data });
	      });
	    }
	  }]);

	  return RestfulTable;
	}(React.Component);

	RestfulTable.propTypes = {
	  url: React.PropTypes.string.isRequired,
	  keyField: React.PropTypes.string.isRequired
	};

	module.exports = RestfulTable;

/***/ }
]);