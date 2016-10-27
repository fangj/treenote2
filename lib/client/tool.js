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

//node为展开的节点，拥有_children
//gid为展开节点中的一个，求gid的展开层级
//level为node所在层级
function findLevel(node, gid) {
    var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    if (node._id === gid) {
        return level; //当前节点就是，返回当前层级
    } else if (node._children.length > 0) {
            return _.compact(node._children.map(function (node) {
                return findLevel(node, gid, level + 1);
            }))[0];
        } else {
            return null; //当前节点不是，又没有子节点，返回null
        }
}

module.exports = function (_tree) {
    tree = _tree;
    return {
        expand: expand,
        expand2: expand2,
        expandToRoot: expandToRoot,
        createNodeByPath: createNodeByPath,
        findLevel: findLevel
    };
};
//# sourceMappingURL=data:application/json;base64,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QUFqRSxDQUFQLENBRDZCO1NBQTNCLE1BRUQ7QUFDRCxtQkFBTyxJQUFQO0FBREMsU0FGQztDQUhWOztBQVVBLE9BQU8sT0FBUCxHQUFpQixVQUFTLEtBQVQsRUFBZ0I7QUFDN0IsV0FBTyxLQUFQLENBRDZCO0FBRTdCLFdBQU87QUFDSCxzQkFERztBQUVILHdCQUZHO0FBR0gsa0NBSEc7QUFJSCwwQ0FKRztBQUtILDRCQUxHO0tBQVAsQ0FGNkI7Q0FBaEIiLCJmaWxlIjoidG9vbC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBSPXJlcXVpcmUoJ3JhbWRhJyk7XG4vLyBjb25zdCB0cmVlPXJlcXVpcmUoJ3RyZWVub3RlL2xpYi9jbGllbnQvdHJlZS1jYWNoZScpKCdfYXBpJyk7XG52YXIgdHJlZTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGNhY2hlID0ge307IC8vd2Fsa2Fyb3VuZCznlLHkuo7ov57nu63kuKTkuKrnm7jlkIznmoR0cmVlLmxpZHBhdGgyZ2lkKHBwYXRoKeiwg+eUqOS8muWvvOiHtOesrOS6jOS4quS4jeaJp+ihjOOAguaJgOS7peaUvuWIsOe8k+WtmOS4reOAglxuXG5mdW5jdGlvbiBjbG9uZShvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kKG5vZGUsIGxldmVsKSB7IC8vbGV2ZWznlKjkuo7mjqfliLblsZXlvIDnmoTlsYLnuqdcbiAgICBpZiAobm9kZS5fbGluay5jaGlsZHJlbi5sZW5ndGggPT0gMCB8fCBsZXZlbCA8PSAwKSB7IC8v5LiN5YGa5bGV5byA55qEMuenjeaDheWGteOAgjEu5rKh5pyJ5a2Q6IqC54K544CCMu+8jOWxleW8gOWxgue6p+Wwj+S6jjBcbiAgICAgICAgdmFyIGNsb25lTm9kZSA9IGNsb25lKG5vZGUpO1xuICAgICAgICBjbG9uZU5vZGUuX2NoaWxkcmVuID0gW107XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2xvbmVOb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJlZS5yZWFkX25vZGVzKG5vZGUuX2xpbmsuY2hpbGRyZW4pXG4gICAgICAgICAgICAudGhlbihub2RlcyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZm5vZGVzID0gbm9kZXMubWFwKG5vZGUgPT4gZXhwYW5kKG5vZGUsIGxldmVsIC0gMSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChmbm9kZXMpLnRoZW4obm9kZXMgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvbmVOb2RlID0gY2xvbmUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGNsb25lTm9kZS5fY2hpbGRyZW4gPSBub2RlcyB8fCBbXTsgLy/lsZXlvIDnmoToioLngrnmlL7liLBfY2hpbGRyZW7kuK1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lTm9kZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluY2x1ZGVzKGFyciwgb2JqKSB7XG4gICAgcmV0dXJuIGFyci5pbmRleE9mKG9iaikgPiAtMTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kMihub2RlLCBleHBhbmRzID0gW10pIHsgLy9leHBhbmRz55So5LqO5o6n5Yi25bGV5byA55qE6IqC54K55YiX6KGoXG4gICAgaWYgKG5vZGUuX2xpbmsuY2hpbGRyZW4ubGVuZ3RoID09IDAgfHwgIWluY2x1ZGVzKGV4cGFuZHMsIG5vZGUuX2lkKSkgeyAvL+S4jeWBmuWxleW8gOeahDLnp43mg4XlhrXjgIIxLuayoeacieWtkOiKgueCueOAgjLvvIxleHBhbmRz5pWw57uE5Lit5rKh5pyJ5q2k6aG5XG4gICAgICAgIHZhciBjbG9uZU5vZGUgPSBjbG9uZShub2RlKTtcbiAgICAgICAgY2xvbmVOb2RlLl9jaGlsZHJlbiA9IFtdO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNsb25lTm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRyZWUucmVhZF9ub2Rlcyhub2RlLl9saW5rLmNoaWxkcmVuKVxuICAgICAgICAgICAgLnRoZW4obm9kZXMgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZub2RlcyA9IG5vZGVzLm1hcChub2RlID0+IGV4cGFuZDIobm9kZSwgZXhwYW5kcykpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChmbm9kZXMpLnRoZW4obm9kZXMgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvbmVOb2RlID0gY2xvbmUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGNsb25lTm9kZS5fY2hpbGRyZW4gPSBub2RlcyB8fCBbXTsgLy/lsZXlvIDnmoToioLngrnmlL7liLBfY2hpbGRyZW7kuK1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lTm9kZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG59XG5cblxuLy/loavlhYXniLboioLngrnnm7TliLDmoLnoioLngrks5YyF5ZCr5qC56IqC54K5IFxuLy9bMTldPT0+WzAsMSwxNywxOV1cbmZ1bmN0aW9uIGV4cGFuZFRvUm9vdChnaWRzLCByb290ID0gJzAnKSB7XG4gICAgY29uc3QgZ2lkID0gZ2lkc1swXTtcbiAgICByZXR1cm4gdHJlZS5yZWFkKGdpZCkudGhlbihub2RlID0+IHtcbiAgICAgICAgY29uc3QgcCA9IG5vZGUuX2xpbmsucDtcbiAgICAgICAgZ2lkcy51bnNoaWZ0KHApO1xuICAgICAgICBpZiAocCA9PT0gcm9vdCB8fCBwID09PSAnMCcgfHwgcCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGdpZHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHBhbmRUb1Jvb3QoZ2lkcywgcm9vdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2hpbGRCeU5hbWUocGdpZCxuYW1lKXtcbiAgICAvLyBjb25zb2xlLmxvZygnY3JlYXRlQ2hpbGRCeU5hbWUnLHBnaWQsbmFtZSk7XG4gICAgcmV0dXJuIHRyZWUubWtfc29uX2J5X25hbWUocGdpZCxuYW1lKTtcbn1cblxuLy/moLnmja7ot6/lvoTliJvlu7roioLngrlcbi8qKlxuICogQHBhcmFtICB7U3RyaW5nfVxuICogQHBhcmFtICB7QXJyYXl9XG4gKiBAcmV0dXJuIHtQcm9taXNlPFN0cmluZz59XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU5vZGVCeVBhdGgocGF0aCl7XG4gICAgLy9wYXRoPVwiMC9hYmMvZGVmXCIgZ2lk5Yqg5LiK6Lev5b6E55qE5b2i5byP6KGo6L6+XG4gICAgdmFyIHBhdGhzPXBhdGguc3BsaXQoJy8nKTtcbiAgICB2YXIgZ2lkPXBhdGhzLnNoaWZ0KCk7Ly/np7vlh7rnrKzkuIDkuKpnaWTvvIzliankuIvpg6jliIbkuLrot6/lvoRcbiAgICBjb25zdCBmPShQLG5hbWUpPT5QLnRoZW4ocG5vZGU9PmNyZWF0ZUNoaWxkQnlOYW1lKHBub2RlLl9pZCxuYW1lKSk7XG4gICAgcmV0dXJuIHBhdGhzLnJlZHVjZShmLHRyZWUucmVhZChnaWQpKTtcbn1cblxuLy9ub2Rl5Li65bGV5byA55qE6IqC54K577yM5oul5pyJX2NoaWxkcmVuXG4vL2dpZOS4uuWxleW8gOiKgueCueS4reeahOS4gOS4qu+8jOaxgmdpZOeahOWxleW8gOWxgue6p1xuLy9sZXZlbOS4um5vZGXmiYDlnKjlsYLnuqdcbmZ1bmN0aW9uIGZpbmRMZXZlbChub2RlLGdpZCxsZXZlbD0xKXtcbiAgICBpZihub2RlLl9pZD09PWdpZCl7XG4gICAgICAgIHJldHVybiBsZXZlbDsvL+W9k+WJjeiKgueCueWwseaYr++8jOi/lOWbnuW9k+WJjeWxgue6p1xuICAgIH1lbHNlIGlmKG5vZGUuX2NoaWxkcmVuLmxlbmd0aD4wKXtcbiAgICAgICAgcmV0dXJuIF8uY29tcGFjdChub2RlLl9jaGlsZHJlbi5tYXAobm9kZT0+ZmluZExldmVsKG5vZGUsZ2lkLGxldmVsKzEpKSlbMF07XG4gICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBudWxsOy8v5b2T5YmN6IqC54K55LiN5piv77yM5Y+I5rKh5pyJ5a2Q6IqC54K577yM6L+U5ZuebnVsbFxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihfdHJlZSkge1xuICAgIHRyZWUgPSBfdHJlZTtcbiAgICByZXR1cm4ge1xuICAgICAgICBleHBhbmQsXG4gICAgICAgIGV4cGFuZDIsXG4gICAgICAgIGV4cGFuZFRvUm9vdCxcbiAgICAgICAgY3JlYXRlTm9kZUJ5UGF0aCxcbiAgICAgICAgZmluZExldmVsXG4gICAgfVxufSJdfQ==