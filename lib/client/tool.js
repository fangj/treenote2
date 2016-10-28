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
    var level = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvdG9vbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksSUFBRSxRQUFRLE9BQVIsQ0FBTjtBQUNBO0FBQ0EsSUFBSSxJQUFKO0FBQ0EsSUFBSSxPQUFPLFFBQVEsTUFBUixDQUFYO0FBQ0EsSUFBSSxRQUFRLEVBQVosQyxDQUFnQjs7QUFFaEIsU0FBUyxLQUFULENBQWUsR0FBZixFQUFvQjtBQUNoQixXQUFPLEtBQUssS0FBTCxDQUFXLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBWCxDQUFQO0FBQ0g7O0FBRUQsU0FBUyxNQUFULENBQWdCLElBQWhCLEVBQXNCLEtBQXRCLEVBQTZCO0FBQUU7QUFDM0IsUUFBSSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLElBQThCLENBQTlCLElBQW1DLFNBQVMsQ0FBaEQsRUFBbUQ7QUFBRTtBQUNqRCxZQUFJLFlBQVksTUFBTSxJQUFOLENBQWhCO0FBQ0Esa0JBQVUsU0FBVixHQUFzQixFQUF0QjtBQUNBLGVBQU8sUUFBUSxPQUFSLENBQWdCLFNBQWhCLENBQVA7QUFDSCxLQUpELE1BSU87QUFDSCxlQUFPLEtBQUssVUFBTCxDQUFnQixLQUFLLEtBQUwsQ0FBVyxRQUEzQixFQUNGLElBREUsQ0FDRyxpQkFBUztBQUNYLGdCQUFNLFNBQVMsTUFBTSxHQUFOLENBQVU7QUFBQSx1QkFBUSxPQUFPLElBQVAsRUFBYSxRQUFRLENBQXJCLENBQVI7QUFBQSxhQUFWLENBQWY7QUFDQSxtQkFBTyxRQUFRLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLElBQXBCLENBQXlCLGlCQUFTO0FBQ3JDLG9CQUFJLFlBQVksTUFBTSxJQUFOLENBQWhCO0FBQ0EsMEJBQVUsU0FBVixHQUFzQixTQUFTLEVBQS9CLENBRnFDLENBRUY7QUFDbkMsdUJBQU8sU0FBUDtBQUNILGFBSk0sQ0FBUDtBQUtILFNBUkUsQ0FBUDtBQVNIO0FBQ0o7O0FBRUQsU0FBUyxRQUFULENBQWtCLEdBQWxCLEVBQXVCLEdBQXZCLEVBQTRCO0FBQ3hCLFdBQU8sSUFBSSxPQUFKLENBQVksR0FBWixJQUFtQixDQUFDLENBQTNCO0FBQ0g7O0FBRUQsU0FBUyxPQUFULENBQWlCLElBQWpCLEVBQXFDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7QUFBRTtBQUNuQyxRQUFJLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsSUFBOEIsQ0FBOUIsSUFBbUMsQ0FBQyxTQUFTLE9BQVQsRUFBa0IsS0FBSyxHQUF2QixDQUF4QyxFQUFxRTtBQUFFO0FBQ25FLFlBQUksWUFBWSxNQUFNLElBQU4sQ0FBaEI7QUFDQSxrQkFBVSxTQUFWLEdBQXNCLEVBQXRCO0FBQ0EsZUFBTyxRQUFRLE9BQVIsQ0FBZ0IsU0FBaEIsQ0FBUDtBQUNILEtBSkQsTUFJTztBQUNILGVBQU8sS0FBSyxVQUFMLENBQWdCLEtBQUssS0FBTCxDQUFXLFFBQTNCLEVBQ0YsSUFERSxDQUNHLGlCQUFTO0FBQ1gsZ0JBQU0sU0FBUyxNQUFNLEdBQU4sQ0FBVTtBQUFBLHVCQUFRLFFBQVEsSUFBUixFQUFjLE9BQWQsQ0FBUjtBQUFBLGFBQVYsQ0FBZjtBQUNBLG1CQUFPLFFBQVEsR0FBUixDQUFZLE1BQVosRUFBb0IsSUFBcEIsQ0FBeUIsaUJBQVM7QUFDckMsb0JBQUksWUFBWSxNQUFNLElBQU4sQ0FBaEI7QUFDQSwwQkFBVSxTQUFWLEdBQXNCLFNBQVMsRUFBL0IsQ0FGcUMsQ0FFRjtBQUNuQyx1QkFBTyxTQUFQO0FBQ0gsYUFKTSxDQUFQO0FBS0gsU0FSRSxDQUFQO0FBU0g7QUFDSjs7QUFHRDtBQUNBO0FBQ0EsU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQXdDO0FBQUE7O0FBQUEsUUFBWixJQUFZLHlEQUFMLEdBQUs7O0FBQ3BDLFFBQU0sTUFBTSxLQUFLLENBQUwsQ0FBWjtBQUNBLFdBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixFQUFlLElBQWYsQ0FBb0IsZ0JBQVE7QUFDL0IsWUFBTSxJQUFJLEtBQUssS0FBTCxDQUFXLENBQXJCO0FBQ0EsYUFBSyxPQUFMLENBQWEsQ0FBYjtBQUNBLFlBQUksTUFBTSxJQUFOLElBQWMsTUFBTSxHQUFwQixJQUEyQixNQUFNLENBQXJDLEVBQXdDO0FBQ3BDLG1CQUFPLElBQVA7QUFDSCxTQUZELE1BRU87QUFDSCxtQkFBTyxNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsQ0FBUDtBQUNIO0FBQ0osS0FSTSxDQUFQO0FBU0g7O0FBRUQsU0FBUyxpQkFBVCxDQUEyQixJQUEzQixFQUFnQyxJQUFoQyxFQUFxQztBQUNqQztBQUNBLFdBQU8sS0FBSyxjQUFMLENBQW9CLElBQXBCLEVBQXlCLElBQXpCLENBQVA7QUFDSDs7QUFFRDtBQUNBOzs7OztBQUtBLFNBQVMsZ0JBQVQsQ0FBMEIsSUFBMUIsRUFBK0I7QUFDM0I7QUFDQSxRQUFJLFFBQU0sS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFWO0FBQ0EsUUFBSSxNQUFJLE1BQU0sS0FBTixFQUFSLENBSDJCLENBR0w7QUFDdEIsUUFBTSxJQUFFLFNBQUYsQ0FBRSxDQUFDLENBQUQsRUFBRyxJQUFIO0FBQUEsZUFBVSxFQUFFLElBQUYsQ0FBTztBQUFBLG1CQUFPLGtCQUFrQixNQUFNLEdBQXhCLEVBQTRCLElBQTVCLENBQVA7QUFBQSxTQUFQLENBQVY7QUFBQSxLQUFSO0FBQ0EsV0FBTyxNQUFNLE1BQU4sQ0FBYSxDQUFiLEVBQWUsS0FBSyxJQUFMLENBQVUsR0FBVixDQUFmLENBQVA7QUFDSDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxTQUFTLFNBQVQsQ0FBbUIsSUFBbkIsRUFBd0IsR0FBeEIsRUFBb0M7QUFBQSxRQUFSLEtBQVEseURBQUYsQ0FBRTs7QUFDaEMsUUFBRyxLQUFLLEdBQUwsS0FBVyxHQUFkLEVBQWtCO0FBQ2QsZUFBTyxLQUFQLENBRGMsQ0FDRDtBQUNoQixLQUZELE1BRU0sSUFBRyxLQUFLLFNBQUwsQ0FBZSxNQUFmLEdBQXNCLENBQXpCLEVBQTJCO0FBQzdCLGVBQU8sRUFBRSxPQUFGLENBQVUsS0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQjtBQUFBLG1CQUFNLFVBQVUsSUFBVixFQUFlLEdBQWYsRUFBbUIsUUFBTSxDQUF6QixDQUFOO0FBQUEsU0FBbkIsQ0FBVixFQUFpRSxDQUFqRSxDQUFQO0FBQ0gsS0FGSyxNQUVEO0FBQ0QsZUFBTyxJQUFQLENBREMsQ0FDVztBQUNmO0FBQ0o7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLFVBQVMsS0FBVCxFQUFnQjtBQUM3QixXQUFPLEtBQVA7QUFDQSxXQUFPO0FBQ0gsc0JBREc7QUFFSCx3QkFGRztBQUdILGtDQUhHO0FBSUgsMENBSkc7QUFLSDtBQUxHLEtBQVA7QUFPSCxDQVREIiwiZmlsZSI6InRvb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUj1yZXF1aXJlKCdyYW1kYScpO1xyXG4vLyBjb25zdCB0cmVlPXJlcXVpcmUoJ3RyZWVub3RlL2xpYi9jbGllbnQvdHJlZS1jYWNoZScpKCdfYXBpJyk7XHJcbnZhciB0cmVlO1xyXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcclxudmFyIGNhY2hlID0ge307IC8vd2Fsa2Fyb3VuZCznlLHkuo7ov57nu63kuKTkuKrnm7jlkIznmoR0cmVlLmxpZHBhdGgyZ2lkKHBwYXRoKeiwg+eUqOS8muWvvOiHtOesrOS6jOS4quS4jeaJp+ihjOOAguaJgOS7peaUvuWIsOe8k+WtmOS4reOAglxyXG5cclxuZnVuY3Rpb24gY2xvbmUob2JqKSB7XHJcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXhwYW5kKG5vZGUsIGxldmVsKSB7IC8vbGV2ZWznlKjkuo7mjqfliLblsZXlvIDnmoTlsYLnuqdcclxuICAgIGlmIChub2RlLl9saW5rLmNoaWxkcmVuLmxlbmd0aCA9PSAwIHx8IGxldmVsIDw9IDApIHsgLy/kuI3lgZrlsZXlvIDnmoQy56eN5oOF5Ya144CCMS7msqHmnInlrZDoioLngrnjgIIy77yM5bGV5byA5bGC57qn5bCP5LqOMFxyXG4gICAgICAgIHZhciBjbG9uZU5vZGUgPSBjbG9uZShub2RlKTtcclxuICAgICAgICBjbG9uZU5vZGUuX2NoaWxkcmVuID0gW107XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjbG9uZU5vZGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdHJlZS5yZWFkX25vZGVzKG5vZGUuX2xpbmsuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIC50aGVuKG5vZGVzID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZub2RlcyA9IG5vZGVzLm1hcChub2RlID0+IGV4cGFuZChub2RlLCBsZXZlbCAtIDEpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChmbm9kZXMpLnRoZW4obm9kZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbG9uZU5vZGUgPSBjbG9uZShub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBjbG9uZU5vZGUuX2NoaWxkcmVuID0gbm9kZXMgfHwgW107IC8v5bGV5byA55qE6IqC54K55pS+5YiwX2NoaWxkcmVu5LitXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lTm9kZTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluY2x1ZGVzKGFyciwgb2JqKSB7XHJcbiAgICByZXR1cm4gYXJyLmluZGV4T2Yob2JqKSA+IC0xO1xyXG59XHJcblxyXG5mdW5jdGlvbiBleHBhbmQyKG5vZGUsIGV4cGFuZHMgPSBbXSkgeyAvL2V4cGFuZHPnlKjkuo7mjqfliLblsZXlvIDnmoToioLngrnliJfooahcclxuICAgIGlmIChub2RlLl9saW5rLmNoaWxkcmVuLmxlbmd0aCA9PSAwIHx8ICFpbmNsdWRlcyhleHBhbmRzLCBub2RlLl9pZCkpIHsgLy/kuI3lgZrlsZXlvIDnmoQy56eN5oOF5Ya144CCMS7msqHmnInlrZDoioLngrnjgIIy77yMZXhwYW5kc+aVsOe7hOS4reayoeacieatpOmhuVxyXG4gICAgICAgIHZhciBjbG9uZU5vZGUgPSBjbG9uZShub2RlKTtcclxuICAgICAgICBjbG9uZU5vZGUuX2NoaWxkcmVuID0gW107XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjbG9uZU5vZGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdHJlZS5yZWFkX25vZGVzKG5vZGUuX2xpbmsuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIC50aGVuKG5vZGVzID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZub2RlcyA9IG5vZGVzLm1hcChub2RlID0+IGV4cGFuZDIobm9kZSwgZXhwYW5kcykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGZub2RlcykudGhlbihub2RlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsb25lTm9kZSA9IGNsb25lKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb25lTm9kZS5fY2hpbGRyZW4gPSBub2RlcyB8fCBbXTsgLy/lsZXlvIDnmoToioLngrnmlL7liLBfY2hpbGRyZW7kuK1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2xvbmVOb2RlO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxuXHJcbi8v5aGr5YWF54i26IqC54K555u05Yiw5qC56IqC54K5LOWMheWQq+agueiKgueCuSBcclxuLy9bMTldPT0+WzAsMSwxNywxOV1cclxuZnVuY3Rpb24gZXhwYW5kVG9Sb290KGdpZHMsIHJvb3QgPSAnMCcpIHtcclxuICAgIGNvbnN0IGdpZCA9IGdpZHNbMF07XHJcbiAgICByZXR1cm4gdHJlZS5yZWFkKGdpZCkudGhlbihub2RlID0+IHtcclxuICAgICAgICBjb25zdCBwID0gbm9kZS5fbGluay5wO1xyXG4gICAgICAgIGdpZHMudW5zaGlmdChwKTtcclxuICAgICAgICBpZiAocCA9PT0gcm9vdCB8fCBwID09PSAnMCcgfHwgcCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2lkcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHBhbmRUb1Jvb3QoZ2lkcywgcm9vdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkQnlOYW1lKHBnaWQsbmFtZSl7XHJcbiAgICAvLyBjb25zb2xlLmxvZygnY3JlYXRlQ2hpbGRCeU5hbWUnLHBnaWQsbmFtZSk7XHJcbiAgICByZXR1cm4gdHJlZS5ta19zb25fYnlfbmFtZShwZ2lkLG5hbWUpO1xyXG59XHJcblxyXG4vL+agueaNrui3r+W+hOWIm+W7uuiKgueCuVxyXG4vKipcclxuICogQHBhcmFtICB7U3RyaW5nfVxyXG4gKiBAcGFyYW0gIHtBcnJheX1cclxuICogQHJldHVybiB7UHJvbWlzZTxTdHJpbmc+fVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlTm9kZUJ5UGF0aChwYXRoKXtcclxuICAgIC8vcGF0aD1cIjAvYWJjL2RlZlwiIGdpZOWKoOS4iui3r+W+hOeahOW9ouW8j+ihqOi+vlxyXG4gICAgdmFyIHBhdGhzPXBhdGguc3BsaXQoJy8nKTtcclxuICAgIHZhciBnaWQ9cGF0aHMuc2hpZnQoKTsvL+enu+WHuuesrOS4gOS4qmdpZO+8jOWJqeS4i+mDqOWIhuS4uui3r+W+hFxyXG4gICAgY29uc3QgZj0oUCxuYW1lKT0+UC50aGVuKHBub2RlPT5jcmVhdGVDaGlsZEJ5TmFtZShwbm9kZS5faWQsbmFtZSkpO1xyXG4gICAgcmV0dXJuIHBhdGhzLnJlZHVjZShmLHRyZWUucmVhZChnaWQpKTtcclxufVxyXG5cclxuLy9ub2Rl5Li65bGV5byA55qE6IqC54K577yM5oul5pyJX2NoaWxkcmVuXHJcbi8vZ2lk5Li65bGV5byA6IqC54K55Lit55qE5LiA5Liq77yM5rGCZ2lk55qE5bGV5byA5bGC57qnXHJcbi8vbGV2ZWzkuLpub2Rl5omA5Zyo5bGC57qnXHJcbmZ1bmN0aW9uIGZpbmRMZXZlbChub2RlLGdpZCxsZXZlbD0xKXtcclxuICAgIGlmKG5vZGUuX2lkPT09Z2lkKXtcclxuICAgICAgICByZXR1cm4gbGV2ZWw7Ly/lvZPliY3oioLngrnlsLHmmK/vvIzov5Tlm57lvZPliY3lsYLnuqdcclxuICAgIH1lbHNlIGlmKG5vZGUuX2NoaWxkcmVuLmxlbmd0aD4wKXtcclxuICAgICAgICByZXR1cm4gXy5jb21wYWN0KG5vZGUuX2NoaWxkcmVuLm1hcChub2RlPT5maW5kTGV2ZWwobm9kZSxnaWQsbGV2ZWwrMSkpKVswXTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIHJldHVybiBudWxsOy8v5b2T5YmN6IqC54K55LiN5piv77yM5Y+I5rKh5pyJ5a2Q6IqC54K577yM6L+U5ZuebnVsbFxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF90cmVlKSB7XHJcbiAgICB0cmVlID0gX3RyZWU7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGV4cGFuZCxcclxuICAgICAgICBleHBhbmQyLFxyXG4gICAgICAgIGV4cGFuZFRvUm9vdCxcclxuICAgICAgICBjcmVhdGVOb2RlQnlQYXRoLFxyXG4gICAgICAgIGZpbmRMZXZlbFxyXG4gICAgfVxyXG59Il19