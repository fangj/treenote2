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
            var expands = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdHJlZV9ub2RlX3JlYWRlci90cmVlX25vZGVfcmVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7Ozs7O0FBQ0EsSUFBSSxPQUFLLFFBQVEsU0FBUixDQUFUO0FBQ0EsSUFBSSxLQUFKLEVBQVUsUUFBVjtBQUNBLElBQUksU0FBUSxRQUFRLFdBQVIsQ0FBWjs7SUFJTSxNOzs7QUFZRixvQkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsb0hBQ1QsS0FEUzs7QUFFZixjQUFLLEtBQUwsR0FBYSxFQUFiO0FBRmUsWUFJUixJQUpRLEdBSUYsS0FKRSxDQUlSLElBSlE7O0FBS2YsZ0JBQU0sSUFBTjtBQUNBLG1CQUFTLFFBQVEsMkJBQVIsRUFBcUMsSUFBckMsQ0FBVDtBQU5lO0FBT2xCOzs7O2lDQUVRO0FBQ0w7QUFDQSxnQkFBSSxLQUFLLElBQVQ7QUFGSyxnQkFHRSxJQUhGLEdBR1EsS0FBSyxLQUhiLENBR0UsSUFIRjs7QUFJTCxnQkFBRyxDQUFDLElBQUosRUFBUztBQUNMLHVCQUFPLElBQVA7QUFDSCxhQUZELE1BRUs7QUFBQSw2QkFDMEIsS0FBSyxLQUQvQjtBQUFBLG9CQUNNLElBRE4sVUFDTSxJQUROO0FBQUEsb0JBQ1csR0FEWCxVQUNXLEdBRFg7O0FBQUEsb0JBQ2tCLE1BRGxCOztBQUVELG9CQUFNLE9BQUssSUFBWDtBQUNBLHVCQUFPLG9CQUFDLElBQUQsYUFBTSxNQUFNLElBQVosSUFBc0IsTUFBdEIsRUFBUDtBQUNIO0FBQ0o7Ozs2Q0FFb0IsQ0FDcEI7Ozs0Q0FFbUI7QUFDaEIsaUJBQUssU0FBTCxDQUFlLEtBQUssS0FBcEI7QUFDQSxnQkFBTSxLQUFHLElBQVQ7QUFDQSxnQkFBSSxlQUFlLFNBQWYsWUFBZSxDQUFVLEdBQVYsRUFBZSxJQUFmLEVBQXFCO0FBQ3BDLHdCQUFRLEdBQVIsQ0FBYSxHQUFiLEVBQWtCLElBQWxCO0FBQ0E7QUFDQSxtQkFBRyxT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LFMsRUFBVyxTLEVBQVcsQ0FDeEM7OzsrQ0FHc0I7QUFDbkIsaUJBQUssaUJBQUwsQ0FBdUIsTUFBdkI7QUFDQSxpQkFBSyxNQUFMLENBQVksR0FBWixDQUFnQixpQkFBTztBQUNuQix1QkFBTyxXQUFQLENBQW9CLEtBQXBCO0FBQ0Esd0JBQVEsR0FBUixDQUFZLGFBQVosRUFBMEIsS0FBMUI7QUFDSCxhQUhEO0FBSUg7Ozs7RUFySWdCLE1BQU0sUzs7QUFBckIsTSxDQUVLLFMsR0FBWTtBQUNmLFVBQUssaUJBQVUsTUFBVixDQUFpQixVQURQO0FBRWYsVUFBTSxpQkFBVSxJQUFWLENBQWUsVUFGTjtBQUdmLFNBQUssaUJBQVUsTUFIQTtBQUlmLFVBQU0saUJBQVUsTUFKRCxFQUlRO0FBQ3ZCLFdBQU0saUJBQVUsTUFMRCxFQUtTO0FBQ3hCLGVBQVcsaUJBQVU7QUFOTixDOzs7QUFzSXZCLE9BQU8sT0FBUCxHQUFpQixNQUFqQiIsImZpbGUiOiJ0cmVlX25vZGVfcmVhZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvcFR5cGVzIH0gZnJvbSBcInJlYWN0XCI7XHJcbnZhciB1dGlsPXJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIF90cmVlLHRyZWV0b29sO1xyXG52YXIgUHViU3ViID1yZXF1aXJlKCdwdWJzdWItanMnKTtcclxuXHJcblxyXG5cclxuY2xhc3MgUmVhZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuXHJcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgICAgIHRyZWU6UHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxyXG4gICAgICAgIHZpZXc6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXHJcbiAgICAgICAgZ2lkOiBQcm9wVHlwZXMuc3RyaW5nLFxyXG4gICAgICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcsLy/mmoLlup/pmaRcclxuICAgICAgICBsZXZlbDpQcm9wVHlwZXMubnVtYmVyLCAvL+WxleW8gOeahOWxguasoe+8jDDkuLrkuI3lsZXlvIBcclxuICAgICAgICBzdWJzY3JpYmU6IFByb3BUeXBlcy5hcnJheVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgICAgICBzdXBlcihwcm9wcyk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHt0cmVlfT1wcm9wcztcclxuICAgICAgICBfdHJlZT10cmVlO1xyXG4gICAgICAgIHRyZWV0b29sPXJlcXVpcmUoJ3RyZWVub3RlMi9zcmMvY2xpZW50L3Rvb2wnKSh0cmVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbmRlciByZWFkZXInKVxyXG4gICAgICAgIGxldCBtZSA9IHRoaXM7XHJcbiAgICAgICAgY29uc3Qge25vZGV9PXRoaXMuc3RhdGU7XHJcbiAgICAgICAgaWYoIW5vZGUpe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc3Qge3ZpZXcsZ2lkLC4uLm90aGVyc309dGhpcy5wcm9wcztcclxuICAgICAgICAgICAgY29uc3QgVmlldz12aWV3O1xyXG4gICAgICAgICAgICByZXR1cm4gPFZpZXcgbm9kZT17bm9kZX0gey4uLm90aGVyc30vPlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgICAgICAgdGhpcy5mZXRjaERhdGEodGhpcy5wcm9wcyk7XHJcbiAgICAgICAgY29uc3QgbWU9dGhpcztcclxuICAgICAgICB2YXIgbXlTdWJzY3JpYmVyID0gZnVuY3Rpb24oIG1zZywgZGF0YSApe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyggbXNnLCBkYXRhICk7XHJcbiAgICAgICAgICAgIC8vIG1lLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgICAgIG1lLmZldGNoRGF0YShtZS5wcm9wcyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzdWJzY3JpYmU9dGhpcy5wcm9wcy5zdWJzY3JpYmV8fFtdO1xyXG4gICAgICAgIHRoaXMudG9rZW5zPXN1YnNjcmliZS5tYXAobXNnPT57XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWJzY3JpYmUgbXNnJyxtc2cpO1xyXG4gICAgICAgICAgICByZXR1cm4gUHViU3ViLnN1YnNjcmliZSggbXNnLCBteVN1YnNjcmliZXIgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZmV0Y2hEYXRhKHByb3BzKXtcclxuICAgICAgICBpZih0aGlzLmNhbmNlbGFibGVQcm9taXNlKXtcclxuICAgICAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZS5jYW5jZWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZSA9IHV0aWwubWFrZUNhbmNlbGFibGUoXHJcbiAgICAgICAgICB0aGlzLl9mZXRjaERhdGEocHJvcHMpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLmNhbmNlbGFibGVQcm9taXNlXHJcbiAgICAgICAgICAucHJvbWlzZVxyXG4gICAgICAgICAgLnRoZW4obm9kZT0+e3RoaXMuc2V0U3RhdGUoe25vZGV9KTt9KVxyXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnaXNDYW5jZWxlZCcsIHJlYXNvbi5pc0NhbmNlbGVkKVxyXG4gICAgICAgICAgICBpZighcmVhc29uLmlzQ2FuY2VsZWQpe1xyXG4gICAgICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfZmV0Y2hEYXRhKHByb3BzKXtcclxuICAgICAgICBjb25zdCB7Z2lkLGxldmVsLHBhdGgsZXhwYW5kc309cHJvcHM7XHJcbiAgICAgICAgaWYoZ2lkIT09dW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgaWYoZXhwYW5kcyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaEJpZ05vZGUyKGdpZCxleHBhbmRzKTsvL+aciWV4cGFuZHPliJnlv73nlaVsZXZlbFxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoQmlnTm9kZShnaWQsbGV2ZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2UgaWYocGF0aCl7XHJcbiAgICAgICAgICAgIHJldHVybiBfdHJlZS5saWRwYXRoMmdpZChwYXRoKS50aGVuKGdpZD0+dGhpcy5mZXRjaEJpZ05vZGUoZ2lkLGxldmVsKSk7XHJcbiAgICAgICAgfSAgIFxyXG4gICAgfVxyXG5cclxuICAgIF9mZXRjaEJpZ05vZGUoZ2lkLGxldmVsKXsgLy/mnI3liqHlmajnq6/lsZXlvIDvvIzmsqHmnInnvJPlrZjjgILmnKrmnaXlj6/ku6Xmi4bop6PliLDnvJPlrZjkuK1cclxuICAgICAgICByZXR1cm4gX3RyZWUucmVhZF9iaWdfbm9kZShnaWQsbGV2ZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGZldGNoQmlnTm9kZShnaWQsbGV2ZWwpeyAvL+WuouaIt+err+WxleW8gO+8jOWPr+WIqeeUqOe8k+WtmFxyXG4gICAgICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgICAgIHJldHVybiBfdHJlZS5yZWFkKGdpZCkudGhlbihub2RlPT57XHJcbiAgICAgICAgICAgICAgICBpZighbGV2ZWwpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyZWV0b29sLmV4cGFuZChub2RlLGxldmVsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZmV0Y2hCaWdOb2RlMihnaWQsZXhwYW5kcz1bXSl7IC8v5a6i5oi356uv5bGV5byA77yM5Y+v5Yip55So57yT5a2YLOeUqGV4cGFuZHPmlbDnu4TmjIfnpLropoHlsZXlvIDnmoToioLngrlcclxuICAgICAgICAvLyBkZWJ1Z2dlcjtcclxuICAgICAgICByZXR1cm4gX3RyZWUucmVhZChnaWQpLnRoZW4obm9kZT0+e1xyXG4gICAgICAgICAgICAgICAgaWYoZXhwYW5kcy5sZW5ndGg9PT0wKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmVldG9vbC5leHBhbmQyKG5vZGUsZXhwYW5kcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgICAgICB0aGlzLmZldGNoRGF0YShuZXh0UHJvcHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcclxuICAgIH1cclxuXHJcbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XHJcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlUHJvbWlzZS5jYW5jZWwoKTtcclxuICAgICAgICB0aGlzLnRva2Vucy5tYXAodG9rZW49PntcclxuICAgICAgICAgICAgUHViU3ViLnVuc3Vic2NyaWJlKCB0b2tlbiApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndW5zdWJzY3JpYmUnLHRva2VuKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWFkZXI7XHJcbiJdfQ==