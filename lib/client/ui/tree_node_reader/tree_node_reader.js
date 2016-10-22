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
var PubSub = require('pubsub-js');

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
                var gid = _props.gid;

                var others = _objectWithoutProperties(_props, ['view', 'gid']);

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
            var expands = props.expands;

            if (gid !== undefined) {
                if (expands) {
                    return this.fetchBigNode2(gid, expands); //有expands则忽略level
                } else {
                        return this.fetchBigNode(gid, level);
                    }
            } else if (path) {
                return _tree.lidpath2gid(path).then(function (gid) {
                    return _this3.fetchBigNode(gid, level);
                });
            }
        }
    }, {
        key: '_fetchBigNode',
        value: function _fetchBigNode(gid, level) {
            //服务器端展开，没有缓存。未来可以拆解到缓存中
            return _tree.read_big_node(gid, level);
        }
    }, {
        key: 'fetchBigNode',
        value: function fetchBigNode(gid, level) {
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
        key: 'fetchBigNode2',
        value: function fetchBigNode2(gid) {
            var expands = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
            //客户端展开，可利用缓存,用expands数组指示要展开的节点
            // debugger;
            return _tree.read(gid).then(function (node) {
                if (expands.length === 0) {
                    return node;
                } else {
                    return treetool.expand2(node, expands);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlci90cmVlX25vZGVfcmVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7Ozs7O0FBQ0EsSUFBSSxPQUFLLFFBQVEsU0FBUixDQUFMO0FBQ0osSUFBSSxLQUFKLEVBQVUsUUFBVjtBQUNBLElBQUksU0FBUSxRQUFRLFdBQVIsQ0FBUjs7SUFJRTs7O0FBWUYsb0JBQVksS0FBWixFQUFtQjs7O29IQUNULFFBRFM7O0FBRWYsY0FBSyxLQUFMLEdBQWEsRUFBYixDQUZlO1lBSVIsT0FBTSxNQUFOLEtBSlE7O0FBS2YsZ0JBQU0sSUFBTixDQUxlO0FBTWYsbUJBQVMsUUFBUSwyQkFBUixFQUFxQyxJQUFyQyxDQUFULENBTmU7O0tBQW5COzs7O2lDQVNTOztBQUVMLGdCQUFJLEtBQUssSUFBTCxDQUZDO2dCQUdFLE9BQU0sS0FBSyxLQUFMLENBQU4sS0FIRjs7QUFJTCxnQkFBRyxDQUFDLElBQUQsRUFBTTtBQUNMLHVCQUFPLElBQVAsQ0FESzthQUFULE1BRUs7NkJBQzBCLEtBQUssS0FBTCxDQUQxQjtvQkFDTSxtQkFETjtvQkFDVyxpQkFEWDs7b0JBQ2tCLDJEQURsQjs7QUFFRCxvQkFBTSxPQUFLLElBQUwsQ0FGTDtBQUdELHVCQUFPLG9CQUFDLElBQUQsYUFBTSxNQUFNLElBQU4sSUFBZ0IsT0FBdEIsQ0FBUCxDQUhDO2FBRkw7Ozs7NkNBU2lCOzs7NENBR0Q7QUFDaEIsaUJBQUssU0FBTCxDQUFlLEtBQUssS0FBTCxDQUFmLENBRGdCO0FBRWhCLGdCQUFNLEtBQUcsSUFBSCxDQUZVO0FBR2hCLGdCQUFJLGVBQWUsU0FBZixZQUFlLENBQVUsR0FBVixFQUFlLElBQWYsRUFBcUI7QUFDcEMsd0JBQVEsR0FBUixDQUFhLEdBQWIsRUFBa0IsSUFBbEI7O0FBRG9DLGtCQUdwQyxDQUFHLFNBQUgsQ0FBYSxHQUFHLEtBQUgsQ0FBYixDQUhvQzthQUFyQixD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bUI7QUFFbkIsd0JBQVEsR0FBUixDQUFZLGFBQVosRUFBMEIsS0FBMUIsRUFGbUI7YUFBUCxDQUFoQixDQUZtQjs7Ozs7RUEvSE4sTUFBTSxTQUFOOztBQUFmLE9BRUssWUFBWTtBQUNmLFVBQUssaUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNMLFVBQU0saUJBQVUsSUFBVixDQUFlLFVBQWY7QUFDTixTQUFLLGlCQUFVLE1BQVY7QUFDTCxVQUFNLGlCQUFVLE1BQVY7QUFDTixXQUFNLGlCQUFVLE1BQVY7QUFDTixlQUFXLGlCQUFVLEtBQVY7OztBQWdJbkIsT0FBTyxPQUFQLEdBQWlCLE1BQWpCIiwiZmlsZSI6InRyZWVfbm9kZV9yZWFkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcm9wVHlwZXMgfSBmcm9tIFwicmVhY3RcIjtcbnZhciB1dGlsPXJlcXVpcmUoJy4uL3V0aWwnKTtcbnZhciBfdHJlZSx0cmVldG9vbDtcbnZhciBQdWJTdWIgPXJlcXVpcmUoJ3B1YnN1Yi1qcycpO1xuXG5cblxuY2xhc3MgUmVhZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHRyZWU6UHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICB2aWV3OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBnaWQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcsLy/mmoLlup/pmaRcbiAgICAgICAgbGV2ZWw6UHJvcFR5cGVzLm51bWJlciwgLy/lsZXlvIDnmoTlsYLmrKHvvIww5Li65LiN5bGV5byAXG4gICAgICAgIHN1YnNjcmliZTogUHJvcFR5cGVzLmFycmF5XG4gICAgfTtcblxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCB7dHJlZX09cHJvcHM7XG4gICAgICAgIF90cmVlPXRyZWU7XG4gICAgICAgIHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZW5kZXIgcmVhZGVyJylcbiAgICAgICAgbGV0IG1lID0gdGhpcztcbiAgICAgICAgY29uc3Qge25vZGV9PXRoaXMuc3RhdGU7XG4gICAgICAgIGlmKCFub2RlKXtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnN0IHt2aWV3LGdpZCwuLi5vdGhlcnN9PXRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBWaWV3PXZpZXc7XG4gICAgICAgICAgICByZXR1cm4gPFZpZXcgbm9kZT17bm9kZX0gey4uLm90aGVyc30vPlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmZldGNoRGF0YSh0aGlzLnByb3BzKTtcbiAgICAgICAgY29uc3QgbWU9dGhpcztcbiAgICAgICAgdmFyIG15U3Vic2NyaWJlciA9IGZ1bmN0aW9uKCBtc2csIGRhdGEgKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBtc2csIGRhdGEgKTtcbiAgICAgICAgICAgIC8vIG1lLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICBtZS5mZXRjaERhdGEobWUucHJvcHMpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWJzY3JpYmU9dGhpcy5wcm9wcy5zdWJzY3JpYmV8fFtdO1xuICAgICAgICB0aGlzLnRva2Vucz1zdWJzY3JpYmUubWFwKG1zZz0+e1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3N1YnNjcmliZSBtc2cnLG1zZyk7XG4gICAgICAgICAgICByZXR1cm4gUHViU3ViLnN1YnNjcmliZSggbXNnLCBteVN1YnNjcmliZXIgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBmZXRjaERhdGEocHJvcHMpe1xuICAgICAgICBpZih0aGlzLmNhbmNlbGFibGVQcm9taXNlKXtcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsYWJsZVByb21pc2UuY2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZSA9IHV0aWwubWFrZUNhbmNlbGFibGUoXG4gICAgICAgICAgdGhpcy5fZmV0Y2hEYXRhKHByb3BzKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlXG4gICAgICAgICAgLnByb21pc2VcbiAgICAgICAgICAudGhlbihub2RlPT57dGhpcy5zZXRTdGF0ZSh7bm9kZX0pO30pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2lzQ2FuY2VsZWQnLCByZWFzb24uaXNDYW5jZWxlZClcbiAgICAgICAgICAgIGlmKCFyZWFzb24uaXNDYW5jZWxlZCl7XG4gICAgICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9mZXRjaERhdGEocHJvcHMpe1xuICAgICAgICBjb25zdCB7Z2lkLGxldmVsLHBhdGgsZXhwYW5kc309cHJvcHM7XG4gICAgICAgIGlmKGdpZCE9PXVuZGVmaW5lZCl7XG4gICAgICAgICAgICBpZihleHBhbmRzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaEJpZ05vZGUyKGdpZCxleHBhbmRzKTsvL+aciWV4cGFuZHPliJnlv73nlaVsZXZlbFxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hCaWdOb2RlKGdpZCxsZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIGlmKHBhdGgpe1xuICAgICAgICAgICAgcmV0dXJuIF90cmVlLmxpZHBhdGgyZ2lkKHBhdGgpLnRoZW4oZ2lkPT50aGlzLmZldGNoQmlnTm9kZShnaWQsbGV2ZWwpKTtcbiAgICAgICAgfSAgIFxuICAgIH1cblxuICAgIF9mZXRjaEJpZ05vZGUoZ2lkLGxldmVsKXsgLy/mnI3liqHlmajnq6/lsZXlvIDvvIzmsqHmnInnvJPlrZjjgILmnKrmnaXlj6/ku6Xmi4bop6PliLDnvJPlrZjkuK1cbiAgICAgICAgcmV0dXJuIF90cmVlLnJlYWRfYmlnX25vZGUoZ2lkLGxldmVsKTtcbiAgICB9XG5cbiAgICBmZXRjaEJpZ05vZGUoZ2lkLGxldmVsKXsgLy/lrqLmiLfnq6/lsZXlvIDvvIzlj6/liKnnlKjnvJPlrZhcbiAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgIHJldHVybiBfdHJlZS5yZWFkKGdpZCkudGhlbihub2RlPT57XG4gICAgICAgICAgICAgICAgaWYoIWxldmVsKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmVldG9vbC5leHBhbmQobm9kZSxsZXZlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmV0Y2hCaWdOb2RlMihnaWQsZXhwYW5kcz1bXSl7IC8v5a6i5oi356uv5bGV5byA77yM5Y+v5Yip55So57yT5a2YLOeUqGV4cGFuZHPmlbDnu4TmjIfnpLropoHlsZXlvIDnmoToioLngrlcbiAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgIHJldHVybiBfdHJlZS5yZWFkKGdpZCkudGhlbihub2RlPT57XG4gICAgICAgICAgICAgICAgaWYoZXhwYW5kcy5sZW5ndGg9PT0wKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmVldG9vbC5leHBhbmQyKG5vZGUsZXhwYW5kcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG5cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hEYXRhKG5leHRQcm9wcyk7XG4gICAgfVxuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICB9XG5cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlLmNhbmNlbCgpO1xuICAgICAgICB0aGlzLnRva2Vucy5tYXAodG9rZW49PntcbiAgICAgICAgICAgIFB1YlN1Yi51bnN1YnNjcmliZSggdG9rZW4gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bnN1YnNjcmliZScsdG9rZW4pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhZGVyO1xuIl19