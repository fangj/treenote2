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
    var expands = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
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

    var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '0';

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
function createNodeByPath(path) {
    //path="0/abc/def" gid加上路径的形式表达
    var paths = path.split('/');
    var gid = paths.shift(); //移出第一个gid，剩下部分为路径
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
//# sourceMappingURL=data:application/json;base64,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QUFiLEVBRitCO0FBRy9CLFlBQUksTUFBTSxJQUFOLElBQWMsTUFBTSxHQUFOLElBQWEsTUFBTSxDQUFOLEVBQVM7QUFDcEMsbUJBQU8sSUFBUCxDQURvQztTQUF4QyxNQUVPO0FBQ0gsbUJBQU8sTUFBSyxZQUFMLENBQWtCLElBQWxCLEVBQXdCLElBQXhCLENBQVAsQ0FERztTQUZQO0tBSHVCLENBQTNCLENBRm9DO0NBQXhDOztBQWFBLFNBQVMsaUJBQVQsQ0FBMkIsSUFBM0IsRUFBZ0MsSUFBaEMsRUFBcUM7O0FBRWpDLFdBQU8sS0FBSyxjQUFMLENBQW9CLElBQXBCLEVBQXlCLElBQXpCLENBQVAsQ0FGaUM7Q0FBckM7Ozs7Ozs7O0FBV0EsU0FBUyxnQkFBVCxDQUEwQixJQUExQixFQUErQjs7QUFFM0IsUUFBSSxRQUFNLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBTixDQUZ1QjtBQUczQixRQUFJLE1BQUksTUFBTSxLQUFOLEVBQUo7QUFIdUIsUUFJckIsSUFBRSxTQUFGLENBQUUsQ0FBQyxDQUFELEVBQUcsSUFBSDtlQUFVLEVBQUUsSUFBRixDQUFPO21CQUFPLGtCQUFrQixNQUFNLEdBQU4sRUFBVSxJQUE1QjtTQUFQO0tBQWpCLENBSm1CO0FBSzNCLFdBQU8sTUFBTSxNQUFOLENBQWEsQ0FBYixFQUFlLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBZixDQUFQLENBTDJCO0NBQS9COztBQVFBLE9BQU8sT0FBUCxHQUFpQixVQUFTLEtBQVQsRUFBZ0I7QUFDN0IsV0FBTyxLQUFQLENBRDZCO0FBRTdCLFdBQU87QUFDSCxzQkFERztBQUVILHdCQUZHO0FBR0gsa0NBSEc7QUFJSCwwQ0FKRztLQUFQLENBRjZCO0NBQWhCIiwiZmlsZSI6InRvb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUj1yZXF1aXJlKCdyYW1kYScpO1xuLy8gY29uc3QgdHJlZT1yZXF1aXJlKCd0cmVlbm90ZS9saWIvY2xpZW50L3RyZWUtY2FjaGUnKSgnX2FwaScpO1xudmFyIHRyZWU7XG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbnZhciBjYWNoZSA9IHt9OyAvL3dhbGthcm91bmQs55Sx5LqO6L+e57ut5Lik5Liq55u45ZCM55qEdHJlZS5saWRwYXRoMmdpZChwcGF0aCnosIPnlKjkvJrlr7zoh7TnrKzkuozkuKrkuI3miafooYzjgILmiYDku6XmlL7liLDnvJPlrZjkuK3jgIJcblxuZnVuY3Rpb24gY2xvbmUob2JqKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZChub2RlLCBsZXZlbCkgeyAvL2xldmVs55So5LqO5o6n5Yi25bGV5byA55qE5bGC57qnXG4gICAgaWYgKG5vZGUuX2xpbmsuY2hpbGRyZW4ubGVuZ3RoID09IDAgfHwgbGV2ZWwgPD0gMCkgeyAvL+S4jeWBmuWxleW8gOeahDLnp43mg4XlhrXjgIIxLuayoeacieWtkOiKgueCueOAgjLvvIzlsZXlvIDlsYLnuqflsI/kuo4wXG4gICAgICAgIHZhciBjbG9uZU5vZGUgPSBjbG9uZShub2RlKTtcbiAgICAgICAgY2xvbmVOb2RlLl9jaGlsZHJlbiA9IFtdO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNsb25lTm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRyZWUucmVhZF9ub2Rlcyhub2RlLl9saW5rLmNoaWxkcmVuKVxuICAgICAgICAgICAgLnRoZW4obm9kZXMgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZub2RlcyA9IG5vZGVzLm1hcChub2RlID0+IGV4cGFuZChub2RlLCBsZXZlbCAtIDEpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZm5vZGVzKS50aGVuKG5vZGVzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsb25lTm9kZSA9IGNsb25lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBjbG9uZU5vZGUuX2NoaWxkcmVuID0gbm9kZXMgfHwgW107IC8v5bGV5byA55qE6IqC54K55pS+5YiwX2NoaWxkcmVu5LitXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9uZU5vZGU7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxufVxuXG5mdW5jdGlvbiBpbmNsdWRlcyhhcnIsIG9iaikge1xuICAgIHJldHVybiBhcnIuaW5kZXhPZihvYmopID4gLTE7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZDIobm9kZSwgZXhwYW5kcyA9IFtdKSB7IC8vZXhwYW5kc+eUqOS6juaOp+WItuWxleW8gOeahOiKgueCueWIl+ihqFxuICAgIGlmIChub2RlLl9saW5rLmNoaWxkcmVuLmxlbmd0aCA9PSAwIHx8ICFpbmNsdWRlcyhleHBhbmRzLCBub2RlLl9pZCkpIHsgLy/kuI3lgZrlsZXlvIDnmoQy56eN5oOF5Ya144CCMS7msqHmnInlrZDoioLngrnjgIIy77yMZXhwYW5kc+aVsOe7hOS4reayoeacieatpOmhuVxuICAgICAgICB2YXIgY2xvbmVOb2RlID0gY2xvbmUobm9kZSk7XG4gICAgICAgIGNsb25lTm9kZS5fY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjbG9uZU5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cmVlLnJlYWRfbm9kZXMobm9kZS5fbGluay5jaGlsZHJlbilcbiAgICAgICAgICAgIC50aGVuKG5vZGVzID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmbm9kZXMgPSBub2Rlcy5tYXAobm9kZSA9PiBleHBhbmQyKG5vZGUsIGV4cGFuZHMpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZm5vZGVzKS50aGVuKG5vZGVzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsb25lTm9kZSA9IGNsb25lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBjbG9uZU5vZGUuX2NoaWxkcmVuID0gbm9kZXMgfHwgW107IC8v5bGV5byA55qE6IqC54K55pS+5YiwX2NoaWxkcmVu5LitXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9uZU5vZGU7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxufVxuXG5cbi8v5aGr5YWF54i26IqC54K555u05Yiw5qC56IqC54K5LOWMheWQq+agueiKgueCuSBcbi8vWzE5XT09PlswLDEsMTcsMTldXG5mdW5jdGlvbiBleHBhbmRUb1Jvb3QoZ2lkcywgcm9vdCA9ICcwJykge1xuICAgIGNvbnN0IGdpZCA9IGdpZHNbMF07XG4gICAgcmV0dXJuIHRyZWUucmVhZChnaWQpLnRoZW4obm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHAgPSBub2RlLl9saW5rLnA7XG4gICAgICAgIGdpZHMudW5zaGlmdChwKTtcbiAgICAgICAgaWYgKHAgPT09IHJvb3QgfHwgcCA9PT0gJzAnIHx8IHAgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBnaWRzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kVG9Sb290KGdpZHMsIHJvb3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkQnlOYW1lKHBnaWQsbmFtZSl7XG4gICAgLy8gY29uc29sZS5sb2coJ2NyZWF0ZUNoaWxkQnlOYW1lJyxwZ2lkLG5hbWUpO1xuICAgIHJldHVybiB0cmVlLm1rX3Nvbl9ieV9uYW1lKHBnaWQsbmFtZSk7XG59XG5cbi8v5qC55o2u6Lev5b6E5Yib5bu66IqC54K5XG4vKipcbiAqIEBwYXJhbSAge1N0cmluZ31cbiAqIEBwYXJhbSAge0FycmF5fVxuICogQHJldHVybiB7UHJvbWlzZTxTdHJpbmc+fVxuICovXG5mdW5jdGlvbiBjcmVhdGVOb2RlQnlQYXRoKHBhdGgpe1xuICAgIC8vcGF0aD1cIjAvYWJjL2RlZlwiIGdpZOWKoOS4iui3r+W+hOeahOW9ouW8j+ihqOi+vlxuICAgIHZhciBwYXRocz1wYXRoLnNwbGl0KCcvJyk7XG4gICAgdmFyIGdpZD1wYXRocy5zaGlmdCgpOy8v56e75Ye656ys5LiA5LiqZ2lk77yM5Ymp5LiL6YOo5YiG5Li66Lev5b6EXG4gICAgY29uc3QgZj0oUCxuYW1lKT0+UC50aGVuKHBub2RlPT5jcmVhdGVDaGlsZEJ5TmFtZShwbm9kZS5faWQsbmFtZSkpO1xuICAgIHJldHVybiBwYXRocy5yZWR1Y2UoZix0cmVlLnJlYWQoZ2lkKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oX3RyZWUpIHtcbiAgICB0cmVlID0gX3RyZWU7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZXhwYW5kLFxuICAgICAgICBleHBhbmQyLFxuICAgICAgICBleHBhbmRUb1Jvb3QsXG4gICAgICAgIGNyZWF0ZU5vZGVCeVBhdGhcbiAgICB9XG59Il19