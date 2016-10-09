webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(2);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _tree_browser = __webpack_require__(3);

	var _tree_browser2 = _interopRequireDefault(_tree_browser);

	var _tree_node_reader = __webpack_require__(5);

	var _tree_node_reader2 = _interopRequireDefault(_tree_node_reader);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// import TreeBrowser from 'treenote2/src/client/ui/tree_browser';
	var PubSub = __webpack_require__(8);

	var tree = __webpack_require__(12)("_api");

	function render(node, vtype) {
	  if (node._type == 'vnode') {
	    //虚节点,{_type:"vnode",_p:"pgid"}
	    return _react2.default.createElement(
	      'div',
	      { className: 'node', onClick: function onClick() {
	          tree.mk_son_by_data(node._p, "new").then(function (_) {
	            console.log("publish updated ");
	            // PubSub.publish('updated');
	            PubSub.publish(node._p, { msg: "refresh" });
	          });
	        } },
	      _react2.default.createElement(
	        'div',
	        { className: 'main' },
	        '+',
	        node._p
	      )
	    );
	  }
	  return _react2.default.createElement(
	    'div',
	    { className: vtype, onClick: function onClick() {
	        PubSub.publish(node._link.p, { msg: 'focus', gid: node._id });
	      } },
	    _react2.default.createElement(
	      'pre',
	      null,
	      JSON.stringify(node, null, 2)
	    )
	  );
	}

	// ReactDOM.render(
	//    <div>
	//    <TreeNodeReader tree={tree} view={props=><div>xx</div>} gid='0' level={1}/>
	//    <TreeNodeReader tree={tree} view={TreeBrowser} root='0' gid='0' render={render} subscribe={["updated"]} expands={['0']}/>
	//    </div>,
	//   document.getElementById('root')
	// );

	_reactDom2.default.render(_react2.default.createElement(
	  'div',
	  null,
	  _react2.default.createElement(_tree_browser2.default, { tree: tree, render: render, root: '0', gid: 'aEPi425BJDu0Nw3O', expands: ['0', 'aEPi425BJDu0Nw3O', 'fp9rDCkZC4qekBRg', 'e5jEsZ9cf31Vy7T5'] })
	), document.getElementById('root'));

/***/ },

/***/ 3:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(4);

/***/ },

/***/ 4:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _tree_node_reader = __webpack_require__(5);

	var _tree_node_reader2 = _interopRequireDefault(_tree_node_reader);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var cx = __webpack_require__(21);
	var _ = __webpack_require__(46);
	__webpack_require__(66);
	var PubSub = __webpack_require__(8);

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

/***/ },

/***/ 5:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(6);

/***/ },

/***/ 6:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(1);

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var util = __webpack_require__(7);
	var _tree, treetool;
	var PubSub = __webpack_require__(8);

	var Reader = function (_React$Component) {
	    _inherits(Reader, _React$Component);

	    function Reader(props) {
	        _classCallCheck(this, Reader);

	        var _this = _possibleConstructorReturn(this, (Reader.__proto__ || Object.getPrototypeOf(Reader)).call(this, props));

	        _this.state = {};
	        var tree = props.tree;

	        _tree = tree;
	        treetool = __webpack_require__(9)(tree);
	        return _this;
	    }

	    _createClass(Reader, [{
	        key: 'render',
	        value: function render() {
	            // console.log('render reader')
	            var me = this;
	            var node = this.state.node;

	            if (!node) {
	                return null;
	            } else {
	                var _props = this.props;
	                var view = _props.view;

	                var others = _objectWithoutProperties(_props, ['view']);

	                var View = view;
	                return React.createElement(View, _extends({ node: node }, others));
	            }
	        }
	    }, {
	        key: 'componentWillMount',
	        value: function componentWillMount() {}
	    }, {
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            this.fetchData(this.props);
	            var me = this;
	            var mySubscriber = function mySubscriber(msg, data) {
	                console.log(msg, data);
	                // me.forceUpdate();
	                me.fetchData(me.props);
	            };
	            var subscribe = this.props.subscribe || [];
	            this.tokens = subscribe.map(function (msg) {
	                console.log('subscribe msg', msg);
	                return PubSub.subscribe(msg, mySubscriber);
	            });
	        }
	    }, {
	        key: 'fetchData',
	        value: function fetchData(props) {
	            var _this2 = this;

	            if (this.cancelablePromise) {
	                this.cancelablePromise.cancel();
	            }
	            this.cancelablePromise = util.makeCancelable(this._fetchData(props));
	            this.cancelablePromise.promise.then(function (node) {
	                _this2.setState({ node: node });
	            }).catch(function (reason) {
	                //console.log('isCanceled', reason.isCanceled)
	                if (!reason.isCanceled) {
	                    Promise.reject(reason);
	                }
	            });
	        }
	    }, {
	        key: '_fetchData',
	        value: function _fetchData(props) {
	            var _this3 = this;

	            var gid = props.gid;
	            var level = props.level;
	            var path = props.path;

	            if (gid !== undefined) {
	                return this.fetchDataByGid(gid, level);
	            } else if (path) {
	                return _tree.lidpath2gid(path).then(function (gid) {
	                    return _this3.fetchDataByGid(gid, level);
	                });
	            }
	        }
	    }, {
	        key: 'fetchDataByGid',
	        value: function fetchDataByGid(gid, level) {
	            //服务器端展开，没有缓存。未来可以拆解到缓存中
	            return _tree.read_big_node(gid, level);
	        }
	    }, {
	        key: '_fetchDataByGid',
	        value: function _fetchDataByGid(gid, level) {
	            //客户端展开，可利用缓存
	            // debugger;
	            return _tree.read(gid).then(function (node) {
	                if (!level) {
	                    return node;
	                } else {
	                    return treetool.expand(node, level);
	                }
	            });
	        }
	    }, {
	        key: 'componentWillReceiveProps',
	        value: function componentWillReceiveProps(nextProps) {
	            this.fetchData(nextProps);
	        }
	    }, {
	        key: 'shouldComponentUpdate',
	        value: function shouldComponentUpdate(nextProps, nextState) {
	            return true;
	        }
	    }, {
	        key: 'componentWillUpdate',
	        value: function componentWillUpdate(nextProps, nextState) {}
	    }, {
	        key: 'componentDidUpdate',
	        value: function componentDidUpdate(prevProps, prevState) {}
	    }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {
	            this.cancelablePromise.cancel();
	            this.tokens.map(function (token) {
	                PubSub.unsubscribe(token);
	                console.log('unsubscribe', token);
	            });
	        }
	    }]);

	    return Reader;
	}(React.Component);

	Reader.propTypes = {
	    tree: _react.PropTypes.object.isRequired,
	    view: _react.PropTypes.func.isRequired,
	    gid: _react.PropTypes.string,
	    path: _react.PropTypes.string, //暂废除
	    level: _react.PropTypes.number, //展开的层次，0为不展开
	    subscribe: _react.PropTypes.array
	};


	module.exports = Reader;

/***/ },

/***/ 7:
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var makeCancelable = exports.makeCancelable = function makeCancelable(promise) {
	  var hasCanceled_ = false;

	  var wrappedPromise = new Promise(function (resolve, reject) {
	    promise.then(function (val) {
	      return hasCanceled_ ? reject({ isCanceled: true }) : resolve(val);
	    });
	    promise.catch(function (error) {
	      return hasCanceled_ ? reject({ isCanceled: true }) : reject(error);
	    });
	  });

	  return {
	    promise: wrappedPromise,
	    cancel: function cancel() {
	      hasCanceled_ = true;
	    }
	  };
	};

/***/ },

/***/ 8:
/***/ function(module, exports) {

	module.exports = PubSub;

/***/ },

/***/ 9:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// const tree=require('treenote/lib/client/tree-cache')('_api');
	var tree;
	var path = __webpack_require__(10);
	var cache = {}; //walkaround,由于连续两个相同的tree.lidpath2gid(ppath)调用会导致第二个不执行。所以放到缓存中。

	function clone(obj) {
	    return JSON.parse(JSON.stringify(obj));
	}
	function expand(node, level) {
	    //level用于控制展开的层级
	    if (node._link.children.length == 0 || level <= 0) {
	        //不做展开的2种情况。1.没有子节点。2，展开层级小于0
	        var cloneNode = clone(node);
	        cloneNode._children = [];
	        return Promise.resolve(cloneNode);
	    } else {
	        return tree.read_nodes(node._link.children).then(function (nodes) {
	            var fnodes = nodes.map(function (node) {
	                return expand(node, level - 1);
	            });
	            return Promise.all(fnodes).then(function (nodes) {
	                var cloneNode = clone(node);
	                cloneNode._children = nodes || []; //展开的节点放到_children中
	                return cloneNode;
	            });
	        });
	    }
	}

	//填充父节点直到根节点,包含根节点 
	//[19]==>[0,1,17,19]
	function expandToRoot(gids) {
	    var _this = this;

	    var root = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	    var gid = gids[0];
	    return tree.read(gid).then(function (node) {
	        var p = node._link.p;
	        gids.unshift(p);
	        if (p === root) {
	            return gids;
	        } else {
	            return _this.expandToRoot(gids, root);
	        }
	    });
	}

	module.exports = function (_tree) {
	    tree = _tree;
	    return {
	        expand: expand,
	        expandToRoot: expandToRoot
	    };
	};

/***/ },

/***/ 10:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var agent = __webpack_require__(13)(__webpack_require__(14), Promise);
	var api = {
	  read: read,
	  read_nodes: read_nodes,
	  mk_son_by_data: mk_son_by_data,
	  mk_brother_by_data: mk_brother_by_data,
	  remove: remove,
	  update: update,
	  mv_as_son: mv_as_son,
	  mv_as_brother: mv_as_brother,
	  read_big_node: read_big_node
	};
	module.exports = factory;

	var prefix;

	function factory(_prefix) {
	  prefix = _prefix;
	  return api;
	}

	function read(gid) {
	  return agent.get(prefix + '/' + gid).then(function (res) {
	    return res.body;
	  });
	}

	function read_nodes(gids) {
	  return agent.post(prefix + '/nodes/', gids).then(function (res) {
	    return res.body;
	  });
	}

	function mk_son_by_data(pgid, data) {
	  return agent.post(prefix + '/mk/son/' + pgid, data).then(function (res) {
	    return res.body;
	  });
	}

	function mk_brother_by_data(bgid, data) {
	  return agent.post(prefix + '/mk/brother/' + bgid, data).then(function (res) {
	    return res.body;
	  });
	}

	function remove(gid) {
	  return agent.del(prefix + '/' + gid).then(function (res) {
	    return res.body;
	  });
	}

	function update(gid, data) {
	  return agent.put(prefix + '/' + gid, data).then(function (res) {
	    return res.body;
	  });
	}

	function mv_as_son(sgid, dgid) {
	  return agent.post(prefix + '/mv/' + sgid + '/son/' + dgid).then(function (res) {
	    return res.body;
	  });
	}

	function mv_as_brother(sgid, dgid) {
	  return agent.post(prefix + '/mv/' + sgid + '/brother/' + dgid).then(function (res) {
	    return res.body;
	  });
	}

	function read_big_node(gid) {
	  var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	  return agent.get(prefix + '/bignode/' + gid + '/' + level).then(function (res) {
	    return res.body;
	  });
	}

/***/ },

/***/ 66:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }

});