'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require('../util');
var _tree, treetool;

var Reader = function (_React$Component) {
    _inherits(Reader, _React$Component);

    function Reader(props) {
        _classCallCheck(this, Reader);

        var _this = _possibleConstructorReturn(this, (Reader.__proto__ || Object.getPrototypeOf(Reader)).call(this, props));

        _this.state = {};
        var tree = props.tree;

        _tree = tree;
        treetool = require('treenote2/src/client/tool')(tree);
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
                me.fetchData();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlci90cmVlX25vZGVfcmVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7Ozs7O0FBQ0EsSUFBSSxPQUFLLFFBQVEsU0FBUixDQUFUO0FBQ0EsSUFBSSxLQUFKLEVBQVUsUUFBVjs7SUFJTSxNOzs7QUFZRixvQkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsb0hBQ1QsS0FEUzs7QUFFZixjQUFLLEtBQUwsR0FBYSxFQUFiO0FBRmUsWUFJUixJQUpRLEdBSUYsS0FKRSxDQUlSLElBSlE7O0FBS2YsZ0JBQU0sSUFBTjtBQUNBLG1CQUFTLFFBQVEsMkJBQVIsRUFBcUMsSUFBckMsQ0FBVDtBQU5lO0FBT2xCOzs7O2lDQUVRO0FBQ0w7QUFDQSxnQkFBSSxLQUFLLElBQVQ7QUFGSyxnQkFHRSxJQUhGLEdBR1EsS0FBSyxLQUhiLENBR0UsSUFIRjs7QUFJTCxnQkFBRyxDQUFDLElBQUosRUFBUztBQUNMLHVCQUFPLElBQVA7QUFDSCxhQUZELE1BRUs7QUFBQSw2QkFDc0IsS0FBSyxLQUQzQjtBQUFBLG9CQUNNLElBRE4sVUFDTSxJQUROOztBQUFBLG9CQUNjLE1BRGQ7O0FBRUQsb0JBQU0sT0FBSyxJQUFYO0FBQ0EsdUJBQU8sb0JBQUMsSUFBRCxhQUFNLE1BQU0sSUFBWixJQUFzQixNQUF0QixFQUFQO0FBQ0g7QUFDSjs7OzZDQUVvQixDQUNwQjs7OzRDQUVtQjtBQUNoQixpQkFBSyxTQUFMLENBQWUsS0FBSyxLQUFwQjtBQUNBLGdCQUFNLEtBQUcsSUFBVDtBQUNBLGdCQUFJLGVBQWUsU0FBZixZQUFlLENBQVUsR0FBVixFQUFlLElBQWYsRUFBcUI7QUFDcEMsd0JBQVEsR0FBUixDQUFhLEdBQWIsRUFBa0IsSUFBbEI7QUFDQTtBQUNBLG1CQUFHLFNBQUg7QUFDSCxhQUpEO0FBS0EsZ0JBQU0sWUFBVSxLQUFLLEtBQUwsQ0FBVyxTQUFYLElBQXNCLEVB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fSBmcm9tIFwicmVhY3RcIjtcclxudmFyIHV0aWw9cmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgX3RyZWUsdHJlZXRvb2w7XHJcblxyXG5cclxuXHJcbmNsYXNzIFJlYWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcblxyXG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcclxuICAgICAgICB0cmVlOlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcclxuICAgICAgICB2aWV3OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxyXG4gICAgICAgIGdpZDogUHJvcFR5cGVzLnN0cmluZyxcclxuICAgICAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLC8v5pqC5bqf6ZmkXHJcbiAgICAgICAgbGV2ZWw6UHJvcFR5cGVzLm51bWJlciwgLy/lsZXlvIDnmoTlsYLmrKHvvIww5Li65LiN5bGV5byAXHJcbiAgICAgICAgc3Vic2NyaWJlOiBQcm9wVHlwZXMuYXJyYXlcclxuICAgIH1cclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgICAgICBzdXBlcihwcm9wcyk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHt0cmVlfT1wcm9wcztcclxuICAgICAgICBfdHJlZT10cmVlO1xyXG4gICAgICAgIHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbmRlciByZWFkZXInKVxyXG4gICAgICAgIGxldCBtZSA9IHRoaXM7XHJcbiAgICAgICAgY29uc3Qge25vZGV9PXRoaXMuc3RhdGU7XHJcbiAgICAgICAgaWYoIW5vZGUpe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc3Qge3ZpZXcsLi4ub3RoZXJzfT10aGlzLnByb3BzO1xyXG4gICAgICAgICAgICBjb25zdCBWaWV3PXZpZXc7XHJcbiAgICAgICAgICAgIHJldHVybiA8VmlldyBub2RlPXtub2RlfSB7Li4ub3RoZXJzfS8+XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcclxuICAgIH1cclxuXHJcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcclxuICAgICAgICB0aGlzLmZldGNoRGF0YSh0aGlzLnByb3BzKTtcclxuICAgICAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgICAgIHZhciBteVN1YnNjcmliZXIgPSBmdW5jdGlvbiggbXNnLCBkYXRhICl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBtc2csIGRhdGEgKTtcclxuICAgICAgICAgICAgLy8gbWUuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICAgICAgbWUuZmV0Y2hEYXRhKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzdWJzY3JpYmU9dGhpcy5wcm9wcy5zdWJzY3JpYmV8fFtdO1xyXG4gICAgICAgIHRoaXMudG9rZW5zPXN1YnNjcmliZS5tYXAobXNnPT57XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWJzY3JpYmUgbXNnJyxtc2cpO1xyXG4gICAgICAgICAgICByZXR1cm4gUHViU3ViLnN1YnNjcmliZSggbXNnLCBteVN1YnNjcmliZXIgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZmV0Y2hEYXRhKHByb3BzKXtcclxuICAgICAgICBpZih0aGlzLmNhbmNlbGFibGVQcm9taXNlKXtcclxuICAgICAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZS5jYW5jZWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZSA9IHV0aWwubWFrZUNhbmNlbGFibGUoXHJcbiAgICAgICAgICB0aGlzLl9mZXRjaERhdGEocHJvcHMpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlXHJcbiAgICAgICAgICAucHJvbWlzZVxyXG4gICAgICAgICAgLnRoZW4obm9kZT0+e3RoaXMuc2V0U3RhdGUoe25vZGV9KTt9KVxyXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnaXNDYW5jZWxlZCcsIHJlYXNvbi5pc0NhbmNlbGVkKVxyXG4gICAgICAgICAgICBpZighcmVhc29uLmlzQ2FuY2VsZWQpe1xyXG4gICAgICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfZmV0Y2hEYXRhKHByb3BzKXtcclxuICAgICAgICBjb25zdCB7Z2lkLGxldmVsLHBhdGh9PXByb3BzO1xyXG4gICAgICAgIGlmKGdpZCE9PXVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoRGF0YUJ5R2lkKGdpZCxsZXZlbCk7XHJcbiAgICAgICAgfWVsc2UgaWYocGF0aCl7XHJcbiAgICAgICAgICAgIHJldHVybiBfdHJlZS5saWRwYXRoMmdpZChwYXRoKS50aGVuKGdpZD0+dGhpcy5mZXRjaERhdGFCeUdpZChnaWQsbGV2ZWwpKTtcclxuICAgICAgICB9ICAgXHJcbiAgICB9XHJcblxyXG4gICAgZmV0Y2hEYXRhQnlHaWQoZ2lkLGxldmVsKXsgLy/mnI3liqHlmajnq6/lsZXlvIDvvIzmsqHmnInnvJPlrZjjgILmnKrmnaXlj6/ku6Xmi4bop6PliLDnvJPlrZjkuK1cclxuICAgICAgICByZXR1cm4gX3RyZWUucmVhZF9iaWdfbm9kZShnaWQsbGV2ZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIF9mZXRjaERhdGFCeUdpZChnaWQsbGV2ZWwpeyAvL+WuouaIt+err+WxleW8gO+8jOWPr+WIqeeUqOe8k+WtmFxyXG4gICAgICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgICAgIHJldHVybiBfdHJlZS5yZWFkKGdpZCkudGhlbihub2RlPT57XHJcbiAgICAgICAgICAgICAgICBpZighbGV2ZWwpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyZWV0b29sLmV4cGFuZChub2RlLGxldmVsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgICAgICB0aGlzLmZldGNoRGF0YShuZXh0UHJvcHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcclxuICAgIH1cclxuXHJcbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XHJcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZS5jYW5jZWwoKTtcclxuICAgICAgICB0aGlzLnRva2Vucy5tYXAodG9rZW49PntcclxuICAgICAgICAgICAgUHViU3ViLnVuc3Vic2NyaWJlKCB0b2tlbiApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndW5zdWJzY3JpYmUnLHRva2VuKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWFkZXI7XHJcbiJdfQ==