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
            return _tree.read_big_node(Number(gid), level);
        }
    }, {
        key: '_fetchDataByGid',
        value: function _fetchDataByGid(gid, level) {
            //客户端展开，可利用缓存
            // debugger;
            return _tree.read(Number(gid)).then(function (node) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlci90cmVlX25vZGVfcmVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7Ozs7O0FBQ0EsSUFBSSxPQUFLLFFBQVEsU0FBUixDQUFUO0FBQ0EsSUFBSSxLQUFKLEVBQVUsUUFBVjs7SUFJTSxNOzs7QUFZRixvQkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsb0hBQ1QsS0FEUzs7QUFFZixjQUFLLEtBQUwsR0FBYSxFQUFiO0FBRmUsWUFJUixJQUpRLEdBSUYsS0FKRSxDQUlSLElBSlE7O0FBS2YsZ0JBQU0sSUFBTjtBQUNBLG1CQUFTLFFBQVEsMkJBQVIsRUFBcUMsSUFBckMsQ0FBVDtBQU5lO0FBT2xCOzs7O2lDQUVRO0FBQ0w7QUFDQSxnQkFBSSxLQUFLLElBQVQ7QUFGSyxnQkFHRSxJQUhGLEdBR1EsS0FBSyxLQUhiLENBR0UsSUFIRjs7QUFJTCxnQkFBRyxDQUFDLElBQUosRUFBUztBQUNMLHVCQUFPLElBQVA7QUFDSCxhQUZELE1BRUs7QUFBQSw2QkFDc0IsS0FBSyxLQUQzQjtBQUFBLG9CQUNNLElBRE4sVUFDTSxJQUROOztBQUFBLG9CQUNjLE1BRGQ7O0FBRUQsb0JBQU0sT0FBSyxJQUFYO0FBQ0EsdUJBQU8sb0JBQUMsSUFBRCxhQUFNLE1BQU0sSUFBWixJQUFzQixNQUF0QixFQUFQO0FBQ0g7QUFDSjs7OzZDQUVvQixDQUNwQjs7OzRDQUVtQjtBQUNoQixpQkFBSyxTQUFMLENBQWUsS0FBSyxLQUFwQjtBQUNBLGdCQUFNLEtBQUcsSUFBVDtBQUNBLGdCQUFJLGVBQWUsU0FBZixZQUFlLENBQVUsR0FBVixFQUFlLElBQWYsRUFBcUI7QUFDcEMsd0JBQVEsR0FBUixDQUFhLEdBQWIsRUFBa0IsSUFBbEI7QUFDQTtBQUNBLG1CQUFHLFNBQUg7QUFDSCxhQUpEO0FBS0EsZ0JBQU0sWUFBVSxLQUFLLEtBQUwsQ0FBVyxTQUFYLElBQXNCLEVB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ImltcG9ydCB7IFByb3BUeXBlcyB9IGZyb20gXCJyZWFjdFwiO1xyXG52YXIgdXRpbD1yZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBfdHJlZSx0cmVldG9vbDtcclxuXHJcblxyXG5cclxuY2xhc3MgUmVhZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuXHJcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgICAgIHRyZWU6UHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxyXG4gICAgICAgIHZpZXc6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXHJcbiAgICAgICAgZ2lkOiBQcm9wVHlwZXMuc3RyaW5nLFxyXG4gICAgICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcsLy/mmoLlup/pmaRcclxuICAgICAgICBsZXZlbDpQcm9wVHlwZXMubnVtYmVyLCAvL+WxleW8gOeahOWxguasoe+8jDDkuLrkuI3lsZXlvIBcclxuICAgICAgICBzdWJzY3JpYmU6IFByb3BUeXBlcy5hcnJheVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgICAgIHN1cGVyKHByb3BzKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0ge1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qge3RyZWV9PXByb3BzO1xyXG4gICAgICAgIF90cmVlPXRyZWU7XHJcbiAgICAgICAgdHJlZXRvb2w9cmVxdWlyZSgndHJlZW5vdGUyL3NyYy9jbGllbnQvdG9vbCcpKHRyZWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygncmVuZGVyIHJlYWRlcicpXHJcbiAgICAgICAgbGV0IG1lID0gdGhpcztcclxuICAgICAgICBjb25zdCB7bm9kZX09dGhpcy5zdGF0ZTtcclxuICAgICAgICBpZighbm9kZSl7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zdCB7dmlldywuLi5vdGhlcnN9PXRoaXMucHJvcHM7XHJcbiAgICAgICAgICAgIGNvbnN0IFZpZXc9dmlldztcclxuICAgICAgICAgICAgcmV0dXJuIDxWaWV3IG5vZGU9e25vZGV9IHsuLi5vdGhlcnN9Lz5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gICAgICAgIHRoaXMuZmV0Y2hEYXRhKHRoaXMucHJvcHMpO1xyXG4gICAgICAgIGNvbnN0IG1lPXRoaXM7XHJcbiAgICAgICAgdmFyIG15U3Vic2NyaWJlciA9IGZ1bmN0aW9uKCBtc2csIGRhdGEgKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coIG1zZywgZGF0YSApO1xyXG4gICAgICAgICAgICAvLyBtZS5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBtZS5mZXRjaERhdGEoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHN1YnNjcmliZT10aGlzLnByb3BzLnN1YnNjcmliZXx8W107XHJcbiAgICAgICAgdGhpcy50b2tlbnM9c3Vic2NyaWJlLm1hcChtc2c9PntcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3N1YnNjcmliZSBtc2cnLG1zZyk7XHJcbiAgICAgICAgICAgIHJldHVybiBQdWJTdWIuc3Vic2NyaWJlKCBtc2csIG15U3Vic2NyaWJlciApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmZXRjaERhdGEocHJvcHMpe1xyXG4gICAgICAgIGlmKHRoaXMuY2FuY2VsYWJsZVByb21pc2Upe1xyXG4gICAgICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlID0gdXRpbC5tYWtlQ2FuY2VsYWJsZShcclxuICAgICAgICAgIHRoaXMuX2ZldGNoRGF0YShwcm9wcylcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuY2FuY2VsYWJsZVByb21pc2VcclxuICAgICAgICAgIC5wcm9taXNlXHJcbiAgICAgICAgICAudGhlbihub2RlPT57dGhpcy5zZXRTdGF0ZSh7bm9kZX0pO30pXHJcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4ge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdpc0NhbmNlbGVkJywgcmVhc29uLmlzQ2FuY2VsZWQpXHJcbiAgICAgICAgICAgIGlmKCFyZWFzb24uaXNDYW5jZWxlZCl7XHJcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9mZXRjaERhdGEocHJvcHMpe1xyXG4gICAgICAgIGNvbnN0IHtnaWQsbGV2ZWwscGF0aH09cHJvcHM7XHJcbiAgICAgICAgaWYoZ2lkIT09dW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hEYXRhQnlHaWQoZ2lkLGxldmVsKTtcclxuICAgICAgICB9ZWxzZSBpZihwYXRoKXtcclxuICAgICAgICAgICAgcmV0dXJuIF90cmVlLmxpZHBhdGgyZ2lkKHBhdGgpLnRoZW4oZ2lkPT50aGlzLmZldGNoRGF0YUJ5R2lkKGdpZCxsZXZlbCkpO1xyXG4gICAgICAgIH0gICBcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaERhdGFCeUdpZChnaWQsbGV2ZWwpeyAvL+acjeWKoeWZqOerr+WxleW8gO+8jOayoeaciee8k+WtmOOAguacquadpeWPr+S7peaLhuino+WIsOe8k+WtmOS4rVxyXG4gICAgICAgIHJldHVybiBfdHJlZS5yZWFkX2JpZ19ub2RlKE51bWJlcihnaWQpLGxldmVsKTtcclxuICAgIH1cclxuXHJcbiAgICBfZmV0Y2hEYXRhQnlHaWQoZ2lkLGxldmVsKXsgLy/lrqLmiLfnq6/lsZXlvIDvvIzlj6/liKnnlKjnvJPlrZhcclxuICAgICAgICAvLyBkZWJ1Z2dlcjtcclxuICAgICAgICByZXR1cm4gX3RyZWUucmVhZChOdW1iZXIoZ2lkKSkudGhlbihub2RlPT57XHJcbiAgICAgICAgICAgICAgICBpZighbGV2ZWwpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyZWV0b29sLmV4cGFuZChub2RlLGxldmVsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgICAgICB0aGlzLmZldGNoRGF0YShuZXh0UHJvcHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcclxuICAgIH1cclxuXHJcbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XHJcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZS5jYW5jZWwoKTtcclxuICAgICAgICB0aGlzLnRva2Vucy5tYXAodG9rZW49PntcclxuICAgICAgICAgICAgUHViU3ViLnVuc3Vic2NyaWJlKCB0b2tlbiApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndW5zdWJzY3JpYmUnLHRva2VuKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWFkZXI7XHJcbiJdfQ==