'use strict';

var R = require('ramda');
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

function includes(arr, obj) {
    return arr.indexOf(obj) > -1;
}

function expand2(node) {
    var expands = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    //expands用于控制展开的节点列表
    if (node._link.children.length == 0 || !includes(expands, node._id)) {
        //不做展开的2种情况。1.没有子节点。2，expands数组中没有此项
        var cloneNode = clone(node);
        cloneNode._children = [];
        return Promise.resolve(cloneNode);
    } else {
        return tree.read_nodes(node._link.children).then(function (nodes) {
            var fnodes = nodes.map(function (node) {
                return expand2(node, expands);
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

    var root = arguments.length <= 1 || arguments[1] === undefined ? '0' : arguments[1];

    var gid = gids[0];
    return tree.read(gid).then(function (node) {
        var p = node._link.p;
        gids.unshift(p);
        if (p === root || p === '0' || p === 0) {
            return gids;
        } else {
            return _this.expandToRoot(gids, root);
        }
    });
}

function createChildByName(pgid, name) {
    // console.log('createChildByName',pgid,name);
    return tree.mk_son_by_name(pgid, name);
}

//根据路径创建节点
/**
 * @param  {String}
 * @param  {Array}
 * @return {Promise<String>}
 */
function createNodeByPath(gid, path) {
    var paths = path.split('/');
    var f = function f(P, name) {
        return P.then(function (pnode) {
            return createChildByName(pnode._id, name);
        });
    };
    return paths.reduce(f, tree.read(gid));
}

module.exports = function (_tree) {
    tree = _tree;
    return {
        expand: expand,
        expand2: expand2,
        expandToRoot: expandToRoot,
        createNodeByPath: createNodeByPath
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdG9vbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksSUFBRSxRQUFRLE9BQVIsQ0FBTjtBQUNBO0FBQ0EsSUFBSSxJQUFKO0FBQ0EsSUFBSSxPQUFPLFFBQVEsTUFBUixDQUFYO0FBQ0EsSUFBSSxRQUFRLEVBQVosQyxDQUFnQjs7QUFFaEIsU0FBUyxLQUFULENBQWUsR0FBZixFQUFvQjtBQUNoQixXQUFPLEtBQUssS0FBTCxDQUFXLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBWCxDQUFQO0FBQ0g7O0FBRUQsU0FBUyxNQUFULENBQWdCLElBQWhCLEVBQXNCLEtBQXRCLEVBQTZCO0FBQUU7QUFDM0IsUUFBSSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLElBQThCLENBQTlCLElBQW1DLFNBQVMsQ0FBaEQsRUFBbUQ7QUFBRTtBQUNqRCxZQUFJLFlBQVksTUFBTSxJQUFOLENBQWhCO0FBQ0Esa0JBQVUsU0FBVixHQUFzQixFQUF0QjtBQUNBLGVBQU8sUUFBUSxPQUFSLENBQWdCLFNBQWhCLENBQVA7QUFDSCxLQUpELE1BSU87QUFDSCxlQUFPLEtBQUssVUFBTCxDQUFnQixLQUFLLEtBQUwsQ0FBVyxRQUEzQixFQUNGLElBREUsQ0FDRyxpQkFBUztBQUNYLGdCQUFNLFNBQVMsTUFBTSxHQUFOLENBQVU7QUFBQSx1QkFBUSxPQUFPLElBQVAsRUFBYSxRQUFRLENBQXJCLENBQVI7QUFBQSxhQUFWLENBQWY7QUFDQSxtQkFBTyxRQUFRLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLElBQXBCLENBQXlCLGlCQUFTO0FBQ3JDLG9CQUFJLFlBQVksTUFBTSxJQUFOLENBQWhCO0FBQ0EsMEJBQVUsU0FBVixHQUFzQixTQUFTLEVBQS9CLENBRnFDLENBRUY7QUFDbkMsdUJBQU8sU0FBUDtBQUNILGFBSk0sQ0FBUDtBQUtILFNBUkUsQ0FBUDtBQVNIO0FBQ0o7O0FBRUQsU0FBUyxRQUFULENBQWtCLEdBQWxCLEVBQXVCLEdBQXZCLEVBQTRCO0FBQ3hCLFdBQU8sSUFBSSxPQUFKLENBQVksR0FBWixJQUFtQixDQUFDLENBQTNCO0FBQ0g7O0FBRUQsU0FBUyxPQUFULENBQWlCLElBQWpCLEVBQXFDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7QUFBRTtBQUNuQyxRQUFJLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsSUFBOEIsQ0FBOUIsSUFBbUMsQ0FBQyxTQUFTLE9BQVQsRUFBa0IsS0FBSyxHQUF2QixDQUF4QyxFQUFxRTtBQUFFO0FBQ25FLFlBQUksWUFBWSxNQUFNLElBQU4sQ0FBaEI7QUFDQSxrQkFBVSxTQUFWLEdBQXNCLEVBQXRCO0FBQ0EsZUFBTyxRQUFRLE9BQVIsQ0FBZ0IsU0FBaEIsQ0FBUDtBQUNILEtBSkQsTUFJTztBQUNILGVBQU8sS0FBSyxVQUFMLENBQWdCLEtBQUssS0FBTCxDQUFXLFFBQTNCLEVBQ0YsSUFERSxDQUNHLGlCQUFTO0FBQ1gsZ0JBQU0sU0FBUyxNQUFNLEdBQU4sQ0FBVTtBQUFBLHVCQUFRLFFBQVEsSUFBUixFQUFjLE9BQWQsQ0FBUjtBQUFBLGFBQVYsQ0FBZjtBQUNBLG1CQUFPLFFBQVEsR0FBUixDQUFZLE1BQVosRUFBb0IsSUFBcEIsQ0FBeUIsaUJBQVM7QUFDckMsb0JBQUksWUFBWSxNQUFNLElBQU4sQ0FBaEI7QUFDQSwwQkFBVSxTQUFWLEdBQXNCLFNBQVMsRUFBL0IsQ0FGcUMsQ0FFRjtBQUNuQyx1QkFBTyxTQUFQO0FBQ0gsYUFKTSxDQUFQO0FBS0gsU0FSRSxDQUFQO0FBU0g7QUFDSjs7QUFHRDtBQUNBO0FBQ0EsU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQXdDO0FBQUE7O0FBQUEsUUFBWixJQUFZLHlEQUFMLEdBQUs7O0FBQ3BDLFFBQU0sTUFBTSxLQUFLLENBQUwsQ0FBWjtBQUNBLFdBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixFQUFlLElBQWYsQ0FBb0IsZ0JBQVE7QUFDL0IsWUFBTSxJQUFJLEtBQUssS0FBTCxDQUFXLENBQXJCO0FBQ0EsYUFBSyxPQUFMLENBQWEsQ0FBYjtBQUNBLFlBQUksTUFBTSxJQUFOLElBQWMsTUFBTSxHQUFwQixJQUEyQixNQUFNLENBQXJDLEVBQXdDO0FBQ3BDLG1CQUFPLElBQVA7QUFDSCxTQUZELE1BRU87QUFDSCxtQkFBTyxNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsQ0FBUDtBQUNIO0FBQ0osS0FSTSxDQUFQO0FBU0g7O0FBRUQsU0FBUyxpQkFBVCxDQUEyQixJQUEzQixFQUFnQyxJQUFoQyxFQUFxQztBQUNqQztBQUNBLFdBQU8sS0FBSyxjQUFMLENBQW9CLElBQXBCLEVBQXlCLElBQXpCLENBQVA7QUFDSDs7QUFFRDtBQUNBOzs7OztBQUtBLFNBQVMsZ0JBQVQsQ0FBMEIsR0FBMUIsRUFBOEIsSUFBOUIsRUFBbUM7QUFDL0IsUUFBTSxRQUFNLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBWjtBQUNBLFFBQU0sSUFBRSxTQUFGLENBQUUsQ0FBQyxDQUFELEVBQUcsSUFBSDtBQUFBLGVBQVUsRUFBRSxJQUFGLENBQU87QUFBQSxtQkFBTyxrQkFBa0IsTUFBTSxHQUF4QixFQUE0QixJQUE1QixDQUFQO0FBQUEsU0FBUCxDQUFWO0FBQUEsS0FBUjtBQUNBLFdBQU8sTUFBTSxNQUFOLENBQWEsQ0FBYixFQUFlLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBZixDQUFQO0FBQ0g7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLFVBQVMsS0FBVCxFQUFnQjtBQUM3QixXQUFPLEtBQVA7QUFDQSxXQUFPO0FBQ0gsc0JBREc7QUFFSCx3QkFGRztBQUdILGtDQUhHO0FBSUg7QUFKRyxLQUFQO0FBTUgsQ0FSRCIsImZpbGUiOiJ0b29sLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFI9cmVxdWlyZSgncmFtZGEnKTtcclxuLy8gY29uc3QgdHJlZT1yZXF1aXJlKCd0cmVlbm90ZS9saWIvY2xpZW50L3RyZWUtY2FjaGUnKSgnX2FwaScpO1xyXG52YXIgdHJlZTtcclxudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XHJcbnZhciBjYWNoZSA9IHt9OyAvL3dhbGthcm91bmQs55Sx5LqO6L+e57ut5Lik5Liq55u45ZCM55qEdHJlZS5saWRwYXRoMmdpZChwcGF0aCnosIPnlKjkvJrlr7zoh7TnrKzkuozkuKrkuI3miafooYzjgILmiYDku6XmlL7liLDnvJPlrZjkuK3jgIJcclxuXHJcbmZ1bmN0aW9uIGNsb25lKG9iaikge1xyXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4cGFuZChub2RlLCBsZXZlbCkgeyAvL2xldmVs55So5LqO5o6n5Yi25bGV5byA55qE5bGC57qnXHJcbiAgICBpZiAobm9kZS5fbGluay5jaGlsZHJlbi5sZW5ndGggPT0gMCB8fCBsZXZlbCA8PSAwKSB7IC8v5LiN5YGa5bGV5byA55qEMuenjeaDheWGteOAgjEu5rKh5pyJ5a2Q6IqC54K544CCMu+8jOWxleW8gOWxgue6p+Wwj+S6jjBcclxuICAgICAgICB2YXIgY2xvbmVOb2RlID0gY2xvbmUobm9kZSk7XHJcbiAgICAgICAgY2xvbmVOb2RlLl9jaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2xvbmVOb2RlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRyZWUucmVhZF9ub2Rlcyhub2RlLl9saW5rLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAudGhlbihub2RlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmbm9kZXMgPSBub2Rlcy5tYXAobm9kZSA9PiBleHBhbmQobm9kZSwgbGV2ZWwgLSAxKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZm5vZGVzKS50aGVuKG5vZGVzID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvbmVOb2RlID0gY2xvbmUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvbmVOb2RlLl9jaGlsZHJlbiA9IG5vZGVzIHx8IFtdOyAvL+WxleW8gOeahOiKgueCueaUvuWIsF9jaGlsZHJlbuS4rVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9uZU5vZGU7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbmNsdWRlcyhhcnIsIG9iaikge1xyXG4gICAgcmV0dXJuIGFyci5pbmRleE9mKG9iaikgPiAtMTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXhwYW5kMihub2RlLCBleHBhbmRzID0gW10pIHsgLy9leHBhbmRz55So5LqO5o6n5Yi25bGV5byA55qE6IqC54K55YiX6KGoXHJcbiAgICBpZiAobm9kZS5fbGluay5jaGlsZHJlbi5sZW5ndGggPT0gMCB8fCAhaW5jbHVkZXMoZXhwYW5kcywgbm9kZS5faWQpKSB7IC8v5LiN5YGa5bGV5byA55qEMuenjeaDheWGteOAgjEu5rKh5pyJ5a2Q6IqC54K544CCMu+8jGV4cGFuZHPmlbDnu4TkuK3msqHmnInmraTpoblcclxuICAgICAgICB2YXIgY2xvbmVOb2RlID0gY2xvbmUobm9kZSk7XHJcbiAgICAgICAgY2xvbmVOb2RlLl9jaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2xvbmVOb2RlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRyZWUucmVhZF9ub2Rlcyhub2RlLl9saW5rLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAudGhlbihub2RlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmbm9kZXMgPSBub2Rlcy5tYXAobm9kZSA9PiBleHBhbmQyKG5vZGUsIGV4cGFuZHMpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChmbm9kZXMpLnRoZW4obm9kZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbG9uZU5vZGUgPSBjbG9uZShub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBjbG9uZU5vZGUuX2NoaWxkcmVuID0gbm9kZXMgfHwgW107IC8v5bGV5byA55qE6IqC54K55pS+5YiwX2NoaWxkcmVu5LitXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lTm9kZTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vL+Whq+WFheeItuiKgueCueebtOWIsOagueiKgueCuSzljIXlkKvmoLnoioLngrkgXHJcbi8vWzE5XT09PlswLDEsMTcsMTldXHJcbmZ1bmN0aW9uIGV4cGFuZFRvUm9vdChnaWRzLCByb290ID0gJzAnKSB7XHJcbiAgICBjb25zdCBnaWQgPSBnaWRzWzBdO1xyXG4gICAgcmV0dXJuIHRyZWUucmVhZChnaWQpLnRoZW4obm9kZSA9PiB7XHJcbiAgICAgICAgY29uc3QgcCA9IG5vZGUuX2xpbmsucDtcclxuICAgICAgICBnaWRzLnVuc2hpZnQocCk7XHJcbiAgICAgICAgaWYgKHAgPT09IHJvb3QgfHwgcCA9PT0gJzAnIHx8IHAgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdpZHM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kVG9Sb290KGdpZHMsIHJvb3QpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDaGlsZEJ5TmFtZShwZ2lkLG5hbWUpe1xyXG4gICAgLy8gY29uc29sZS5sb2coJ2NyZWF0ZUNoaWxkQnlOYW1lJyxwZ2lkLG5hbWUpO1xyXG4gICAgcmV0dXJuIHRyZWUubWtfc29uX2J5X25hbWUocGdpZCxuYW1lKTtcclxufVxyXG5cclxuLy/moLnmja7ot6/lvoTliJvlu7roioLngrlcclxuLyoqXHJcbiAqIEBwYXJhbSAge1N0cmluZ31cclxuICogQHBhcmFtICB7QXJyYXl9XHJcbiAqIEByZXR1cm4ge1Byb21pc2U8U3RyaW5nPn1cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZU5vZGVCeVBhdGgoZ2lkLHBhdGgpe1xyXG4gICAgY29uc3QgcGF0aHM9cGF0aC5zcGxpdCgnLycpO1xyXG4gICAgY29uc3QgZj0oUCxuYW1lKT0+UC50aGVuKHBub2RlPT5jcmVhdGVDaGlsZEJ5TmFtZShwbm9kZS5faWQsbmFtZSkpO1xyXG4gICAgcmV0dXJuIHBhdGhzLnJlZHVjZShmLHRyZWUucmVhZChnaWQpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihfdHJlZSkge1xyXG4gICAgdHJlZSA9IF90cmVlO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBleHBhbmQsXHJcbiAgICAgICAgZXhwYW5kMixcclxuICAgICAgICBleHBhbmRUb1Jvb3QsXHJcbiAgICAgICAgY3JlYXRlTm9kZUJ5UGF0aFxyXG4gICAgfVxyXG59Il19