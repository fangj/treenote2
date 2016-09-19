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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlci9SZWFkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7QUFDQSxJQUFNLE9BQUssUUFBUSxnQ0FBUixFQUEwQyxNQUExQyxDQUFYO0FBQ0EsSUFBTSxXQUFTLFFBQVEsMEJBQVIsRUFBb0MsSUFBcEMsQ0FBZjs7QUFFQSxJQUFJLE9BQUssUUFBUSxTQUFSLENBQVQ7O0lBR00sTTs7O0FBV0Ysb0JBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBLG9IQUNULEtBRFM7O0FBRWYsY0FBSyxLQUFMLEdBQWEsRUFBYjtBQUZlO0FBSWxCOzs7O2lDQUVRO0FBQ0w7QUFDQSxnQkFBSSxLQUFLLElBQVQ7QUFGSyxnQkFHRSxJQUhGLEdBR1EsS0FBSyxLQUhiLENBR0UsSUFIRjs7QUFJTCxnQkFBRyxDQUFDLElBQUosRUFBUztBQUNMLHVCQUFPLElBQVA7QUFDSCxhQUZELE1BRUs7QUFBQSw2QkFDc0IsS0FBSyxLQUQzQjtBQUFBLG9CQUNNLElBRE4sVUFDTSxJQUROOztBQUFBLG9CQUNjLE1BRGQ7O0FBRUQsb0JBQU0sT0FBSyxJQUFYO0FBQ0EsdUJBQU8sb0JBQUMsSUFBRCxhQUFNLE1BQU0sSUFBWixJQUFzQixNQUF0QixFQUFQO0FBQ0g7QUFDSjs7OzZDQUVvQixDQUNwQjs7OzRDQUVtQjtBQUNoQixpQkFBSyxTQUFMLENBQWUsS0FBSyxLQUFwQjtBQUNBLGdCQUFNLEtBQUcsSUFBVDtBQUNBLGdCQUFJLGVBQWUsU0FBZixZQUFlLENBQVUsR0FBVixFQUFlLElBQWYsRUFBcUI7QUFDcEMsd0JBQVEsR0FBUixDQUFhLEdBQWIsRUFBa0IsSUFBbEI7QUFDQTtBQUNBLG1CQUFHLFNBQUg7QUFDSCxhQUpEO0FBS0EsZ0JBQU0sWUFBVSxLQUFLLEtBQUwsQ0FBVyxTQUFYLElBQXNCLEVBQXRDO0FBQ0EsaUJBQUssTUFBTCxHQUFZLFVBQVUsR0FBVixDQUFjLGVBQUs7QUFDM0Isd0JBQVEsR0FBUixDQUFZLGVBQVosRUFBNEIsR0FBNUI7QUFDQSx1QkFBTyxPQUFPLFNBQVAsQ0FBa0IsR0FBbEIsRUFBdUIsWUFBdkIsQ0FBUDtBQUNILGFBSFcsQ0FBWjtBQUlIOzs7a0NBR1MsSyxFQUFNO0FBQUE7O0FBQ1osZ0JBQUcsS0FBSyxpQkFBUixFQUEwQjtBQUN0QixxQkFBSyxpQkFBTCxDQUF1QixNQUF2QjtBQUNIO0FBQ0QsaUJBQUssaUJBQUwsR0FBeUIsS0FBSyxjQUFMLENBQ3ZCLEtBQUssVUFBTCxDQUFnQixLQUFoQixDQUR1QixDQUF6QjtBQUdBLGlCQUFLLGlCQUFMLENBQ0csT0FESCxDQUVHLElBRkgsQ0FFUSxnQkFBTTtBQUFDLHVCQUFLLFFBQUwsQ0FBYyxFQUFDLFVBQUQsRUFBZDtBQUF1QixhQUZ0QyxFQUdHLEtBSEgsQ0FHUyxVQUFDLE1BQUQsRUFBWTtBQUNqQjtBQUNBLG9CQUFHLENBQUMsT0FBTyxVQUFYLEVBQXNCO0FBQ2xCLDRCQUFRLE1BQVIsQ0FBZSxNQUFmO0FBQ0g7QUFDTixhQVJDO0FBU0g7OzttQ0FFVSxLLEVBQU07QUFBQTs7QUFBQSxnQkFDTixHQURNLEdBQ1UsS0FEVixDQUNOLEdBRE07QUFBQSxnQkFDRixLQURFLEdBQ1UsS0FEVixDQUNGLEtBREU7QUFBQSxnQkFDSSxJQURKLEdBQ1UsS0FEVixDQUNJLElBREo7O0FBRWIsZ0JBQUcsUUFBTSxTQUFULEVBQW1CO0FBQ2YsdUJBQU8sS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQXdCLEtBQXhCLENBQVA7QUFDSCxhQUZELE1BRU0sSUFBRyxJQUFILEVBQVE7QUFDVix1QkFBTyxLQUFLLFdBQUwsQ0FBaUIsSUFBakIsRUFBdUIsSUFBdkIsQ0FBNEI7QUFBQSwyQkFBSyxPQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBd0IsS0FBeEIsQ0FBTDtBQUFBLGlCQUE1QixDQUFQO0FBQ0g7QUFDSjs7O3dDQUVlLEcsRUFBSSxLLEVBQU07QUFBRTtBQUN4QixtQkFBTyxLQUFLLGFBQUwsQ0FBbUIsT0FBTyxHQUFQLENBQW5CLEVBQStCLEtBQS9CLENBQVA7QUFDSDs7O3VDQUVjLEcsRUFBSSxLLEVBQU07QUFBRTtBQUN2QjtBQUNBLG1CQUFPLEtBQUssSUFBTCxDQUFVLE9BQU8sR0FBUCxDQUFWLEVBQXVCLElBQXZCLENBQTRCLGdCQUFNO0FBQ2pDLG9CQUFHLENBQUMsS0FBSixFQUFVO0FBQ04sMkJBQU8sSUFBUDtBQUNILGlCQUZELE1BRUs7QUFDRCwyQkFBTyxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBcUIsS0FBckIsQ0FBUDtBQUNIO0FBRUosYUFQRSxDQUFQO0FBUUg7OztrREFJeUIsUyxFQUFXO0FBQ2pDLGlCQUFLLFNBQUwsQ0FBZSxTQUFmO0FBQ0g7Ozs4Q0FFcUIsUyxFQUFXLFMsRUFBVztBQUN4QyxtQkFBTyxJQUFQO0FBQ0g7Ozs0Q0FFbUIsUyxFQUFXLFMsRUFBVyxDQUN6Qzs7OzJDQUVrQixTLEVBQVcsUyxFQUFXLENBQ3hDOzs7K0NBR3NCO0FBQ25CLGlCQUFLLGlCQUFMLENBQXVCLE1BQXZCO0FBQ0EsaUJBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsaUJBQU87QUFDbkIsdUJBQU8sV0FBUCxDQUFvQixLQUFwQjtBQUNBLHdCQUFRLEdBQVIsQ0FBWSxhQUFaLEVBQTBCLEtBQTFCO0FBQ0gsYUFIRDtBQUlIOzs7O0VBbkhnQixNQUFNLFM7O0FBQXJCLE0sQ0FFSyxTLEdBQVk7QUFDZixVQUFNLGlCQUFVLElBQVYsQ0FBZSxVQUROO0FBRWYsU0FBSyxpQkFBVSxNQUZBO0FBR2YsVUFBTSxpQkFBVSxNQUhEO0FBSWYsV0FBTSxpQkFBVSxNQUpELEVBSVM7QUFDeEIsZUFBVyxpQkFBVTtBQUxOLEM7OztBQW9IdkIsT0FBTyxPQUFQLEdBQWlCLE1BQWpCIiwiZmlsZSI6IlJlYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByb3BUeXBlcyB9IGZyb20gXCJyZWFjdFwiO1xyXG5jb25zdCB0cmVlPXJlcXVpcmUoJ3RyZWVub3RlL2xpYi9jbGllbnQvdHJlZS1jYWNoZScpKCdfYXBpJyk7XHJcbmNvbnN0IHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlL3NyYy9jbGllbnQvdG9vbCcpKHRyZWUpO1xyXG5cclxudmFyIHV0aWw9cmVxdWlyZSgnLi4vdXRpbCcpO1xyXG5cclxuXHJcbmNsYXNzIFJlYWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcblxyXG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcclxuICAgICAgICB2aWV3OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxyXG4gICAgICAgIGdpZDogUHJvcFR5cGVzLm51bWJlcixcclxuICAgICAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxyXG4gICAgICAgIGxldmVsOlByb3BUeXBlcy5udW1iZXIsIC8v5bGV5byA55qE5bGC5qyh77yMMOS4uuS4jeWxleW8gFxyXG4gICAgICAgIHN1YnNjcmliZTogUHJvcFR5cGVzLmFycmF5XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbmRlciByZWFkZXInKVxyXG4gICAgICAgIGxldCBtZSA9IHRoaXM7XHJcbiAgICAgICAgY29uc3Qge25vZGV9PXRoaXMuc3RhdGU7XHJcbiAgICAgICAgaWYoIW5vZGUpe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc3Qge3ZpZXcsLi4ub3RoZXJzfT10aGlzLnByb3BzO1xyXG4gICAgICAgICAgICBjb25zdCBWaWV3PXZpZXc7XHJcbiAgICAgICAgICAgIHJldHVybiA8VmlldyBub2RlPXtub2RlfSB7Li4ub3RoZXJzfS8+XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcclxuICAgIH1cclxuXHJcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcclxuICAgICAgICB0aGlzLmZldGNoRGF0YSh0aGlzLnByb3BzKTtcclxuICAgICAgICBjb25zdCBtZT10aGlzO1xyXG4gICAgICAgIHZhciBteVN1YnNjcmliZXIgPSBmdW5jdGlvbiggbXNnLCBkYXRhICl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBtc2csIGRhdGEgKTtcclxuICAgICAgICAgICAgLy8gbWUuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICAgICAgbWUuZmV0Y2hEYXRhKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzdWJzY3JpYmU9dGhpcy5wcm9wcy5zdWJzY3JpYmV8fFtdO1xyXG4gICAgICAgIHRoaXMudG9rZW5zPXN1YnNjcmliZS5tYXAobXNnPT57XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWJzY3JpYmUgbXNnJyxtc2cpO1xyXG4gICAgICAgICAgICByZXR1cm4gUHViU3ViLnN1YnNjcmliZSggbXNnLCBteVN1YnNjcmliZXIgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZmV0Y2hEYXRhKHByb3BzKXtcclxuICAgICAgICBpZih0aGlzLmNhbmNlbGFibGVQcm9taXNlKXtcclxuICAgICAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZS5jYW5jZWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZSA9IHV0aWwubWFrZUNhbmNlbGFibGUoXHJcbiAgICAgICAgICB0aGlzLl9mZXRjaERhdGEocHJvcHMpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlXHJcbiAgICAgICAgICAucHJvbWlzZVxyXG4gICAgICAgICAgLnRoZW4obm9kZT0+e3RoaXMuc2V0U3RhdGUoe25vZGV9KTt9KVxyXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnaXNDYW5jZWxlZCcsIHJlYXNvbi5pc0NhbmNlbGVkKVxyXG4gICAgICAgICAgICBpZighcmVhc29uLmlzQ2FuY2VsZWQpe1xyXG4gICAgICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfZmV0Y2hEYXRhKHByb3BzKXtcclxuICAgICAgICBjb25zdCB7Z2lkLGxldmVsLHBhdGh9PXByb3BzO1xyXG4gICAgICAgIGlmKGdpZCE9PXVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoRGF0YUJ5R2lkKGdpZCxsZXZlbCk7XHJcbiAgICAgICAgfWVsc2UgaWYocGF0aCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0cmVlLmxpZHBhdGgyZ2lkKHBhdGgpLnRoZW4oZ2lkPT50aGlzLmZldGNoRGF0YUJ5R2lkKGdpZCxsZXZlbCkpO1xyXG4gICAgICAgIH0gICBcclxuICAgIH1cclxuXHJcbiAgICBfZmV0Y2hEYXRhQnlHaWQoZ2lkLGxldmVsKXsgLy/mnI3liqHlmajnq6/lsZXlvIDvvIzmsqHmnInnvJPlrZjjgILmnKrmnaXlj6/ku6Xmi4bop6PliLDnvJPlrZjkuK1cclxuICAgICAgICByZXR1cm4gdHJlZS5yZWFkX2JpZ19ub2RlKE51bWJlcihnaWQpLGxldmVsKTtcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaERhdGFCeUdpZChnaWQsbGV2ZWwpeyAvL+WuouaIt+err+WxleW8gO+8jOWPr+WIqeeUqOe8k+WtmFxyXG4gICAgICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgICAgIHJldHVybiB0cmVlLnJlYWQoTnVtYmVyKGdpZCkpLnRoZW4obm9kZT0+e1xyXG4gICAgICAgICAgICAgICAgaWYoIWxldmVsKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmVldG9vbC5leHBhbmQobm9kZSxsZXZlbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSlcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XHJcbiAgICAgICAgdGhpcy5mZXRjaERhdGEobmV4dFByb3BzKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb21wb25lbnRXaWxsVXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XHJcbiAgICB9XHJcblxyXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gICAgICAgIHRoaXMuY2FuY2VsYWJsZVByb21pc2UuY2FuY2VsKCk7XHJcbiAgICAgICAgdGhpcy50b2tlbnMubWFwKHRva2VuPT57XHJcbiAgICAgICAgICAgIFB1YlN1Yi51bnN1YnNjcmliZSggdG9rZW4gKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vuc3Vic2NyaWJlJyx0b2tlbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVhZGVyO1xyXG4iXX0=