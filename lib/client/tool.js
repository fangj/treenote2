'use strict';

// const tree=require('treenote/lib/client/tree-cache')('_api');
var tree;
var path = require('path');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdG9vbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBSSxJQUFKO0FBQ0EsSUFBSSxPQUFLLFFBQVEsTUFBUixDQUFUO0FBQ0EsSUFBSSxRQUFNLEVBQVYsQyxDQUFhOztBQUViLFNBQVMsS0FBVCxDQUFlLEdBQWYsRUFBbUI7QUFDZixXQUFPLEtBQUssS0FBTCxDQUFXLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBWCxDQUFQO0FBQ0g7QUFDRCxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBcUIsS0FBckIsRUFBMkI7QUFBRTtBQUN6QixRQUFHLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsSUFBNEIsQ0FBNUIsSUFBaUMsU0FBTyxDQUEzQyxFQUE4QztBQUFFO0FBQzVDLFlBQUksWUFBVSxNQUFNLElBQU4sQ0FBZDtBQUNBLGtCQUFVLFNBQVYsR0FBb0IsRUFBcEI7QUFDQSxlQUFPLFFBQVEsT0FBUixDQUFnQixTQUFoQixDQUFQO0FBQ0gsS0FKRCxNQUlLO0FBQ0QsZUFBTyxLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxLQUFMLENBQVcsUUFBM0IsRUFDTixJQURNLENBQ0QsaUJBQU87QUFDVCxnQkFBTSxTQUFPLE1BQU0sR0FBTixDQUFVO0FBQUEsdUJBQU0sT0FBTyxJQUFQLEVBQVksUUFBTSxDQUFsQixDQUFOO0FBQUEsYUFBVixDQUFiO0FBQ0EsbUJBQU8sUUFBUSxHQUFSLENBQVksTUFBWixFQUFvQixJQUFwQixDQUF5QixpQkFBTztBQUNuQyxvQkFBSSxZQUFVLE1BQU0sSUFBTixDQUFkO0FBQ0EsMEJBQVUsU0FBVixHQUFvQixTQUFPLEVBQTNCLENBRm1DLENBRUo7QUFDL0IsdUJBQU8sU0FBUDtBQUNILGFBSk0sQ0FBUDtBQUtILFNBUk0sQ0FBUDtBQVNIO0FBQ0o7O0FBR0Q7QUFDQTtBQUNBLFNBQVUsWUFBVixDQUF1QixJQUF2QixFQUFtQztBQUFBOztBQUFBLFFBQVAsSUFBTyx5REFBRixDQUFFOztBQUMvQixRQUFNLE1BQUksS0FBSyxDQUFMLENBQVY7QUFDQSxXQUFPLEtBQUssSUFBTCxDQUFVLEdBQVYsRUFBZSxJQUFmLENBQW9CLGdCQUFNO0FBQzdCLFlBQU0sSUFBRSxLQUFLLEtBQUwsQ0FBVyxDQUFuQjtBQUNBLGFBQUssT0FBTCxDQUFhLENBQWI7QUFDQSxZQUFHLE1BQUksSUFBUCxFQUFZO0FBQ1IsbUJBQU8sSUFBUDtBQUNILFNBRkQsTUFFSztBQUNELG1CQUFPLE1BQUssWUFBTCxDQUFrQixJQUFsQixFQUF1QixJQUF2QixDQUFQO0FBQ0g7QUFDSixLQVJNLENBQVA7QUFTRDs7QUFFSCxPQUFPLE9BQVAsR0FBZSxVQUFTLEtBQVQsRUFBZTtBQUMxQixXQUFLLEtBQUw7QUFDQSxXQUFPO0FBQ0gsc0JBREc7QUFFSDtBQUZHLEtBQVA7QUFJSCxDQU5EIiwiZmlsZSI6InRvb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb25zdCB0cmVlPXJlcXVpcmUoJ3RyZWVub3RlL2xpYi9jbGllbnQvdHJlZS1jYWNoZScpKCdfYXBpJyk7XHJcbnZhciB0cmVlO1xyXG52YXIgcGF0aD1yZXF1aXJlKCdwYXRoJyk7XHJcbnZhciBjYWNoZT17fTsvL3dhbGthcm91bmQs55Sx5LqO6L+e57ut5Lik5Liq55u45ZCM55qEdHJlZS5saWRwYXRoMmdpZChwcGF0aCnosIPnlKjkvJrlr7zoh7TnrKzkuozkuKrkuI3miafooYzjgILmiYDku6XmlL7liLDnvJPlrZjkuK3jgIJcclxuXHJcbmZ1bmN0aW9uIGNsb25lKG9iail7XHJcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcclxufVxyXG5mdW5jdGlvbiBleHBhbmQobm9kZSxsZXZlbCl7IC8vbGV2ZWznlKjkuo7mjqfliLblsZXlvIDnmoTlsYLnuqdcclxuICAgIGlmKG5vZGUuX2xpbmsuY2hpbGRyZW4ubGVuZ3RoPT0wIHx8IGxldmVsPD0wICl7IC8v5LiN5YGa5bGV5byA55qEMuenjeaDheWGteOAgjEu5rKh5pyJ5a2Q6IqC54K544CCMu+8jOWxleW8gOWxgue6p+Wwj+S6jjBcclxuICAgICAgICB2YXIgY2xvbmVOb2RlPWNsb25lKG5vZGUpO1xyXG4gICAgICAgIGNsb25lTm9kZS5fY2hpbGRyZW49W107XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjbG9uZU5vZGUpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgcmV0dXJuIHRyZWUucmVhZF9ub2Rlcyhub2RlLl9saW5rLmNoaWxkcmVuKVxyXG4gICAgICAgIC50aGVuKG5vZGVzPT57XHJcbiAgICAgICAgICAgIGNvbnN0IGZub2Rlcz1ub2Rlcy5tYXAobm9kZT0+ZXhwYW5kKG5vZGUsbGV2ZWwtMSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZm5vZGVzKS50aGVuKG5vZGVzPT57XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xvbmVOb2RlPWNsb25lKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgY2xvbmVOb2RlLl9jaGlsZHJlbj1ub2Rlc3x8W107IC8v5bGV5byA55qE6IqC54K55pS+5YiwX2NoaWxkcmVu5LitXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xvbmVOb2RlO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vL+Whq+WFheeItuiKgueCueebtOWIsOagueiKgueCuSzljIXlkKvmoLnoioLngrkgXHJcbi8vWzE5XT09PlswLDEsMTcsMTldXHJcbmZ1bmN0aW9uICBleHBhbmRUb1Jvb3QoZ2lkcyxyb290PTApe1xyXG4gICAgY29uc3QgZ2lkPWdpZHNbMF07XHJcbiAgICByZXR1cm4gdHJlZS5yZWFkKGdpZCkudGhlbihub2RlPT57XHJcbiAgICAgICAgY29uc3QgcD1ub2RlLl9saW5rLnA7XHJcbiAgICAgICAgZ2lkcy51bnNoaWZ0KHApO1xyXG4gICAgICAgIGlmKHA9PT1yb290KXtcclxuICAgICAgICAgICAgcmV0dXJuIGdpZHM7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV4cGFuZFRvUm9vdChnaWRzLHJvb3QpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzPWZ1bmN0aW9uKF90cmVlKXtcclxuICAgIHRyZWU9X3RyZWU7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGV4cGFuZCxcclxuICAgICAgICBleHBhbmRUb1Jvb3RcclxuICAgIH1cclxufSJdfQ==