'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tree = require('treenote/lib/client/tree-cache')('_api');
var treetool = require('treenote/src/client/tool')(tree);

var util = require('../util');

var Reader = function (_React$Component) {
    _inherits(Reader, _React$Component);

    function Reader(props) {
        _classCallCheck(this, Reader);

        var _this = _possibleConstructorReturn(this, (Reader.__proto__ || Object.getPrototypeOf(Reader)).call(this, props));

        _this.state = {};
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
                return tree.lidpath2gid(path).then(function (gid) {
                    return _this3.fetchDataByGid(gid, level);
                });
            }
        }
    }, {
        key: '_fetchDataByGid',
        value: function _fetchDataByGid(gid, level) {
            //服务器端展开，没有缓存。未来可以拆解到缓存中
            return tree.read_big_node(Number(gid), level);
        }
    }, {
        key: 'fetchDataByGid',
        value: function fetchDataByGid(gid, level) {
            //客户端展开，可利用缓存
            // debugger;
            return tree.read(Number(gid)).then(function (node) {
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
    view: _react.PropTypes.func.isRequired,
    gid: _react.PropTypes.number,
    path: _react.PropTypes.string,
    level: _react.PropTypes.number, //展开的层次，0为不展开
    subscribe: _react.PropTypes.array
};


module.exports = Reader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvcmVhZGVyL1JlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7Ozs7OztBQUNBLElBQU0sT0FBSyxRQUFRLGdDQUFSLEVBQTBDLE1BQTFDLENBQVg7QUFDQSxJQUFNLFdBQVMsUUFBUSwwQkFBUixFQUFvQyxJQUFwQyxDQUFmOztBQUVBLElBQUksT0FBSyxRQUFRLFNBQVIsQ0FBVDs7SUFHTSxNOzs7QUFXRixvQkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsb0hBQ1QsS0FEUzs7QUFFZixjQUFLLEtBQUwsR0FBYSxFQUFiO0FBRmU7QUFJbEI7Ozs7aUNBRVE7QUFDTDtBQUNBLGdCQUFJLEtBQUssSUFBVDtBQUZLLGdCQUdFLElBSEYsR0FHUSxLQUFLLEtBSGIsQ0FHRSxJQUhGOztBQUlMLGdCQUFHLENBQUMsSUFBSixFQUFTO0FBQ0wsdUJBQU8sSUFBUDtBQUNILGFBRkQsTUFFSztBQUFBLDZCQUNzQixLQUFLLEtBRDNCO0FBQUEsb0JBQ00sSUFETixVQUNNLElBRE47O0FBQUEsb0JBQ2MsTUFEZDs7QUFFRCxvQkFBTSxPQUFLLElBQVg7QUFDQSx1QkFBTyxvQkFBQyxJQUFELGFBQU0sTUFBTSxJQUFaLElBQXNCLE1BQXRCLEVBQVA7QUFDSDtBQUNKOzs7NkNBRW9CLENBQ3BCOzs7NENBRW1CO0FBQ2hCLGlCQUFLLFNBQUwsQ0FBZSxLQUFLLEtBQXBCO0FBQ0EsZ0JBQU0sS0FBRyxJQUFUO0FBQ0EsZ0JBQUksZUFBZSxTQUFmLFlBQWUsQ0FBVSxHQUFWLEVBQWUsSUFBZixFQUFxQjtBQUNwQyx3QkFBUSxHQUFSLENBQWEsR0FBYixFQUFrQixJQUFsQjtBQUNBO0FBQ0EsbUJBQUcsU0FBSDtBQUNILGFBSkQ7QUFLQSxnQkFBTSxZQUFVLEtBQUssS0FBTCxDQUFXLFNBQVgsSUFBc0IsRUFBdEM7QUFDQSxpQkFBSyxNQUFMLEdBQVksVUFBVSxHQUFWLENBQWMsZUFBSztBQUMzQix3QkFBUSxHQUFSLENBQVksZUFBWixFQUE0QixHQUE1QjtBQUNBLHVCQUFPLE9BQU8sU0FBUCxDQUFrQixHQUFsQixFQUF1QixZQUF2QixDQUFQO0FBQ0gsYUFIVyxDQUFaO0FBSUg7OztrQ0FHUyxLLEVBQU07QUFBQTs7QUFDWixnQkFBRyxLQUFLLGlCQUFSLEVBQTBCO0FBQ3RCLHFCQUFLLGlCQUFMLENBQXVCLE1BQXZCO0FBQ0g7QUFDRCxpQkFBSyxpQkFBTCxHQUF5QixLQUFLLGNBQUwsQ0FDdkIsS0FBSyxVQUFMLENBQWdCLEtBQWhCLENBRHVCLENBQXpCO0FBR0EsaUJBQUssaUJBQUwsQ0FDRyxPQURILENBRUcsSUFGSCxDQUVRLGdCQUFNO0FBQUMsdUJBQUssUUFBTCxDQUFjLEVBQUMsVUFBRCxFQUFkO0FBQXVCLGFBRnRDLEVBR0csS0FISCxDQUdTLFVBQUMsTUFBRCxFQUFZO0FBQ2pCO0FBQ0Esb0JBQUcsQ0FBQyxPQUFPLFVBQVgsRUFBc0I7QUFDbEIsNEJBQVEsTUFBUixDQUFlLE1BQWY7QUFDSDtBQUNOLGFBUkM7QUFTSDs7O21DQUVVLEssRUFBTTtBQUFBOztBQUFBLGdCQUNOLEdBRE0sR0FDVSxLQURWLENBQ04sR0FETTtBQUFBLGdCQUNGLEtBREUsR0FDVSxLQURWLENBQ0YsS0FERTtBQUFBLGdCQUNJLElBREosR0FDVSxLQURWLENBQ0ksSUFESjs7QUFFYixnQkFBRyxRQUFNLFNBQVQsRUFBbUI7QUFDZix1QkFBTyxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBd0IsS0FBeEIsQ0FBUDtBQUNILGFBRkQsTUFFTSxJQUFHLElBQUgsRUFBUTtBQUNWLHVCQUFPLEtBQUssV0FBTCxDQUFpQixJQUFqQixFQUF1QixJQUF2QixDQUE0QjtBQUFBLDJCQUFLLE9BQUssY0FBTCxDQUFvQixHQUFwQixFQUF3QixLQUF4QixDQUFMO0FBQUEsaUJBQTVCLENBQVA7QUFDSDtBQUNKOzs7d0NBRWUsRyxFQUFJLEssRUFBTTtBQUFFO0FBQ3hCLG1CQUFPLEtBQUssYUFBTCxDQUFtQixPQUFPLEdBQVAsQ0FBbkIsRUFBK0IsS0FBL0IsQ0FBUDtBQUNIOzs7dUNBRWMsRyxFQUFJLEssRUFBTTtBQUFFO0FBQ3ZCO0FBQ0EsbUJBQU8sS0FBSyxJQUFMLENBQVUsT0FBTyxHQUFQLENBQVYsRUFBdUIsSUFBdkIsQ0FBNEIsZ0JBQU07QUFDakMsb0JBQUcsQ0FBQyxLQUFKLEVBQVU7QUFDTiwyQkFBTyxJQUFQO0FBQ0gsaUJBRkQsTUFFSztBQUNELDJCQUFPLFNBQVMsTUFBVCxDQUFnQixJQUFoQixFQUFxQixLQUFyQixDQUFQO0FBQ0g7QUFFSixhQVBFLENBQVA7QUFRSDs7O2tEQUl5QixTLEVBQVc7QUFDakMsaUJBQUssU0FBTCxDQUFlLFNBQWY7QUFDSDs7OzhDQUVxQixTLEVBQVcsUyxFQUFXO0FBQ3hDLG1CQUFPLElBQVA7QUFDSDs7OzRDQUVtQixTLEVBQVcsUyxFQUFXLENBQ3pDOzs7MkNBRWtCLFMsRUFBVyxTLEVBQVcsQ0FDeEM7OzsrQ0FHc0I7QUFDbkIsaUJBQUssaUJBQUwsQ0FBdUIsTUFBdkI7QUFDQSxpQkFBSyxNQUFMLENBQVksR0FBWixDQUFnQixpQkFBTztBQUNuQix1QkFBTyxXQUFQLENBQW9CLEtBQXBCO0FBQ0Esd0JBQVEsR0FBUixDQUFZLGFBQVosRUFBMEIsS0FBMUI7QUFDSCxhQUhEO0FBSUg7Ozs7RUFuSGdCLE1BQU0sUzs7QUFBckIsTSxDQUVLLFMsR0FBWTtBQUNmLFVBQU0saUJBQVUsSUFBVixDQUFlLFVBRE47QUFFZixTQUFLLGlCQUFVLE1BRkE7QUFHZixVQUFNLGlCQUFVLE1BSEQ7QUFJZixXQUFNLGlCQUFVLE1BSkQsRUFJUztBQUN4QixlQUFXLGlCQUFVO0FBTE4sQzs7O0FBb0h2QixPQUFPLE9BQVAsR0FBaUIsTUFBakIiLCJmaWxlIjoiUmVhZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvcFR5cGVzIH0gZnJvbSBcInJlYWN0XCI7XHJcbmNvbnN0IHRyZWU9cmVxdWlyZSgndHJlZW5vdGUvbGliL2NsaWVudC90cmVlLWNhY2hlJykoJ19hcGknKTtcclxuY29uc3QgdHJlZXRvb2w9cmVxdWlyZSgndHJlZW5vdGUvc3JjL2NsaWVudC90b29sJykodHJlZSk7XHJcblxyXG52YXIgdXRpbD1yZXF1aXJlKCcuLi91dGlsJyk7XHJcblxyXG5cclxuY2xhc3MgUmVhZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuXHJcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgICAgIHZpZXc6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXHJcbiAgICAgICAgZ2lkOiBQcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcsXHJcbiAgICAgICAgbGV2ZWw6UHJvcFR5cGVzLm51bWJlciwgLy/lsZXlvIDnmoTlsYLmrKHvvIww5Li65LiN5bGV5byAXHJcbiAgICAgICAgc3Vic2NyaWJlOiBQcm9wVHlwZXMuYXJyYXlcclxuICAgIH1cclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgICAgICBzdXBlcihwcm9wcyk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygncmVuZGVyIHJlYWRlcicpXHJcbiAgICAgICAgbGV0IG1lID0gdGhpcztcclxuICAgICAgICBjb25zdCB7bm9kZX09dGhpcy5zdGF0ZTtcclxuICAgICAgICBpZighbm9kZSl7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zdCB7dmlldywuLi5vdGhlcnN9PXRoaXMucHJvcHM7XHJcbiAgICAgICAgICAgIGNvbnN0IFZpZXc9dmlldztcclxuICAgICAgICAgICAgcmV0dXJuIDxWaWV3IG5vZGU9e25vZGV9IHsuLi5vdGhlcnN9Lz5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gICAgICAgIHRoaXMuZmV0Y2hEYXRhKHRoaXMucHJvcHMpO1xyXG4gICAgICAgIGNvbnN0IG1lPXRoaXM7XHJcbiAgICAgICAgdmFyIG15U3Vic2NyaWJlciA9IGZ1bmN0aW9uKCBtc2csIGRhdGEgKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coIG1zZywgZGF0YSApO1xyXG4gICAgICAgICAgICAvLyBtZS5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBtZS5mZXRjaERhdGEoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHN1YnNjcmliZT10aGlzLnByb3BzLnN1YnNjcmliZXx8W107XHJcbiAgICAgICAgdGhpcy50b2tlbnM9c3Vic2NyaWJlLm1hcChtc2c9PntcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3N1YnNjcmliZSBtc2cnLG1zZyk7XHJcbiAgICAgICAgICAgIHJldHVybiBQdWJTdWIuc3Vic2NyaWJlKCBtc2csIG15U3Vic2NyaWJlciApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmZXRjaERhdGEocHJvcHMpe1xyXG4gICAgICAgIGlmKHRoaXMuY2FuY2VsYWJsZVByb21pc2Upe1xyXG4gICAgICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlID0gdXRpbC5tYWtlQ2FuY2VsYWJsZShcclxuICAgICAgICAgIHRoaXMuX2ZldGNoRGF0YShwcm9wcylcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuY2FuY2VsYWJsZVByb21pc2VcclxuICAgICAgICAgIC5wcm9taXNlXHJcbiAgICAgICAgICAudGhlbihub2RlPT57dGhpcy5zZXRTdGF0ZSh7bm9kZX0pO30pXHJcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4ge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdpc0NhbmNlbGVkJywgcmVhc29uLmlzQ2FuY2VsZWQpXHJcbiAgICAgICAgICAgIGlmKCFyZWFzb24uaXNDYW5jZWxlZCl7XHJcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9mZXRjaERhdGEocHJvcHMpe1xyXG4gICAgICAgIGNvbnN0IHtnaWQsbGV2ZWwscGF0aH09cHJvcHM7XHJcbiAgICAgICAgaWYoZ2lkIT09dW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hEYXRhQnlHaWQoZ2lkLGxldmVsKTtcclxuICAgICAgICB9ZWxzZSBpZihwYXRoKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRyZWUubGlkcGF0aDJnaWQocGF0aCkudGhlbihnaWQ9PnRoaXMuZmV0Y2hEYXRhQnlHaWQoZ2lkLGxldmVsKSk7XHJcbiAgICAgICAgfSAgIFxyXG4gICAgfVxyXG5cclxuICAgIF9mZXRjaERhdGFCeUdpZChnaWQsbGV2ZWwpeyAvL+acjeWKoeWZqOerr+WxleW8gO+8jOayoeaciee8k+WtmOOAguacquadpeWPr+S7peaLhuino+WIsOe8k+WtmOS4rVxyXG4gICAgICAgIHJldHVybiB0cmVlLnJlYWRfYmlnX25vZGUoTnVtYmVyKGdpZCksbGV2ZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGZldGNoRGF0YUJ5R2lkKGdpZCxsZXZlbCl7IC8v5a6i5oi356uv5bGV5byA77yM5Y+v5Yip55So57yT5a2YXHJcbiAgICAgICAgLy8gZGVidWdnZXI7XHJcbiAgICAgICAgcmV0dXJuIHRyZWUucmVhZChOdW1iZXIoZ2lkKSkudGhlbihub2RlPT57XHJcbiAgICAgICAgICAgICAgICBpZighbGV2ZWwpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyZWV0b29sLmV4cGFuZChub2RlLGxldmVsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgICAgICB0aGlzLmZldGNoRGF0YShuZXh0UHJvcHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcclxuICAgIH1cclxuXHJcbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XHJcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZS5jYW5jZWwoKTtcclxuICAgICAgICB0aGlzLnRva2Vucy5tYXAodG9rZW49PntcclxuICAgICAgICAgICAgUHViU3ViLnVuc3Vic2NyaWJlKCB0b2tlbiApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndW5zdWJzY3JpYmUnLHRva2VuKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWFkZXI7XHJcbiJdfQ==