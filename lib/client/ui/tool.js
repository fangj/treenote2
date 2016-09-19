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

function remove(gid) {
    return tree.remove(gid);
}

function fetchOrCreatePath(lidpath) {
    //返回lidpath对应的gid，如果路径不存在尝试逐级创建
    return tree.lidpath2gid(lidpath).then(function (gid) {
        cache[lidpath] = gid;
        return gid;
    }).catch(function (e) {
        if (e.status == 404) {
            console.log('not found', lidpath, 'try create');
            return tryCreatePath(lidpath);
        }
    });
}

function tryCreatePath(lidpath) {
    return findExistAncestorPath(lidpath).then(function (ancestorPath) {
        return createPaths(lidpath, ancestorPath); //返回新建lidpath的gid
    });
}

function findExistAncestorPath(lidpath) {
    var ppath = path.dirname(lidpath);
    if (ppath.indexOf("/") < 0) {
        //已经到最后，数字部分
        return ppath; //返回当前路径，只有数字部分
    } else {
        return tree.lidpath2gid(ppath).then(function (gid) {
            cache[ppath] = gid;
            return ppath;
        }) //找到，返回当前路径
        .catch(function (e) {
            if (e.status == 404) {
                return findExistAncestorPath(ppath); //没找到，逐级往上找
            } else {
                throw e;
            }
        });
    }
}

//lidpath="0/a/b/c/d"
//ancestorPath="0/a" 或者 "0"
//remainPath="b/c/d" 或者"a/b/c/d"
function createPaths(lidpath, ancestorPath) {
    console.log("createPaths", lidpath, ancestorPath);
    if (lidpath == ancestorPath) {
        //递归终止条件
        return tree.lidpath2gid(ancestorPath);
    } else {
        var remainPath = lidpath.substr(ancestorPath.length + 1);
        var paths = remainPath.split("/");
        var newLid = paths.shift();
        var pgid = cache[ancestorPath];
        if (ancestorPath.indexOf("/") < 0) {
            pgid = Number(ancestorPath); //路径只有根gid的情况
        }
        var create = function create(_pgid) {
            console.log('ancestorPath', ancestorPath, _pgid);
            return tree.mk_son_by_data(_pgid, {}, newLid).then(function (node) {
                console.log("new node created", node);
                return createPaths(lidpath, ancestorPath + "/" + newLid); //递归调用自己逐级向下创建
            });
        };
        if (pgid || pgid === 0) {
            return create(pgid);
        } else {
            return tree.lidpath2gid(ancestorPath).then(function (pgid) {
                cache[ancestorPath] = pgid;
                return create(pgid);
            });
        }
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
        remove: remove,
        fetchOrCreatePath: fetchOrCreatePath,
        createPaths: createPaths,
        expandToRoot: expandToRoot
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdG9vbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBSSxJQUFKO0FBQ0EsSUFBSSxPQUFLLFFBQVEsTUFBUixDQUFUO0FBQ0EsSUFBSSxRQUFNLEVBQVYsQyxDQUFhOztBQUViLFNBQVMsS0FBVCxDQUFlLEdBQWYsRUFBbUI7QUFDZixXQUFPLEtBQUssS0FBTCxDQUFXLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBWCxDQUFQO0FBQ0g7QUFDRCxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBcUIsS0FBckIsRUFBMkI7QUFBRTtBQUN6QixRQUFHLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsSUFBNEIsQ0FBNUIsSUFBaUMsU0FBTyxDQUEzQyxFQUE4QztBQUFFO0FBQzVDLFlBQUksWUFBVSxNQUFNLElBQU4sQ0FBZDtBQUNBLGtCQUFVLFNBQVYsR0FBb0IsRUFBcEI7QUFDQSxlQUFPLFFBQVEsT0FBUixDQUFnQixTQUFoQixDQUFQO0FBQ0gsS0FKRCxNQUlLO0FBQ0QsZUFBTyxLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxLQUFMLENBQVcsUUFBM0IsRUFDTixJQURNLENBQ0QsaUJBQU87QUFDVCxnQkFBTSxTQUFPLE1BQU0sR0FBTixDQUFVO0FBQUEsdUJBQU0sT0FBTyxJQUFQLEVBQVksUUFBTSxDQUFsQixDQUFOO0FBQUEsYUFBVixDQUFiO0FBQ0EsbUJBQU8sUUFBUSxHQUFSLENBQVksTUFBWixFQUFvQixJQUFwQixDQUF5QixpQkFBTztBQUNuQyxvQkFBSSxZQUFVLE1BQU0sSUFBTixDQUFkO0FBQ0EsMEJBQVUsU0FBVixHQUFvQixTQUFPLEVBQTNCLENBRm1DLENBRUo7QUFDL0IsdUJBQU8sU0FBUDtBQUNILGFBSk0sQ0FBUDtBQUtILFNBUk0sQ0FBUDtBQVNIO0FBQ0o7O0FBRUQsU0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQW9CO0FBQ2hCLFdBQU8sS0FBSyxNQUFMLENBQVks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N0Msc0JBQU0sWUFBTixJQUFvQixJQUFwQjtBQUNBLHVCQUFPLE9BQU8sSUFBUCxDQUFQO0FBQ0gsYUFITSxDQUFQO0FBSUg7QUFFSjtBQUNKOztBQUVEO0FBQ0E7QUFDQSxTQUFVLFlBQVYsQ0FBdUIsSUFBdkIsRUFBbUM7QUFBQTs7QUFBQSxRQUFQLElBQU8seURBQUYsQ0FBRTs7QUFDL0IsUUFBTSxNQUFJLEtBQUssQ0FBTCxDQUFWO0FBQ0EsV0FBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLEVBQWUsSUFBZixDQUFvQixnQkFBTTtBQUM3QixZQUFNLElBQUUsS0FBSyxLQUFMLENBQVcsQ0FBbkI7QUFDQSxhQUFLLE9BQUwsQ0FBYSxDQUFiO0FBQ0EsWUFBRyxNQUFJLElBQVAsRUFBWTtBQUNSLG1CQUFPLElBQVA7QUFDSCxTQUZELE1BRUs7QUFDRCxtQkFBTyxNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsRUFBdUIsSUFBdkIsQ0FBUDtBQUNIO0FBQ0osS0FSTSxDQUFQO0FBU0Q7O0FBRUgsT0FBTyxPQUFQLEdBQWUsVUFBUyxLQUFULEVBQWU7QUFDMUIsV0FBSyxLQUFMO0FBQ0EsV0FBTztBQUNILHNCQURHO0FBRUgsc0JBRkc7QUFHSCw0Q0FIRztBQUlILGdDQUpHO0FBS0g7QUFMRyxLQUFQO0FBT0gsQ0FURCIsImZpbGUiOiJ0b29sLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY29uc3QgdHJlZT1yZXF1aXJlKCd0cmVlbm90ZS9saWIvY2xpZW50L3RyZWUtY2FjaGUnKSgnX2FwaScpO1xyXG52YXIgdHJlZTtcclxudmFyIHBhdGg9cmVxdWlyZSgncGF0aCcpO1xyXG52YXIgY2FjaGU9e307Ly93YWxrYXJvdW5kLOeUseS6jui/nue7reS4pOS4quebuOWQjOeahHRyZWUubGlkcGF0aDJnaWQocHBhdGgp6LCD55So5Lya5a+86Ie056ys5LqM5Liq5LiN5omn6KGM44CC5omA5Lul5pS+5Yiw57yT5a2Y5Lit44CCXHJcblxyXG5mdW5jdGlvbiBjbG9uZShvYmope1xyXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XHJcbn1cclxuZnVuY3Rpb24gZXhwYW5kKG5vZGUsbGV2ZWwpeyAvL2xldmVs55So5LqO5o6n5Yi25bGV5byA55qE5bGC57qnXHJcbiAgICBpZihub2RlLl9saW5rLmNoaWxkcmVuLmxlbmd0aD09MCB8fCBsZXZlbDw9MCApeyAvL+S4jeWBmuWxleW8gOeahDLnp43mg4XlhrXjgIIxLuayoeacieWtkOiKgueCueOAgjLvvIzlsZXlvIDlsYLnuqflsI/kuo4wXHJcbiAgICAgICAgdmFyIGNsb25lTm9kZT1jbG9uZShub2RlKTtcclxuICAgICAgICBjbG9uZU5vZGUuX2NoaWxkcmVuPVtdO1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2xvbmVOb2RlKTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIHJldHVybiB0cmVlLnJlYWRfbm9kZXMobm9kZS5fbGluay5jaGlsZHJlbilcclxuICAgICAgICAudGhlbihub2Rlcz0+e1xyXG4gICAgICAgICAgICBjb25zdCBmbm9kZXM9bm9kZXMubWFwKG5vZGU9PmV4cGFuZChub2RlLGxldmVsLTEpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGZub2RlcykudGhlbihub2Rlcz0+e1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsb25lTm9kZT1jbG9uZShub2RlKTtcclxuICAgICAgICAgICAgICAgIGNsb25lTm9kZS5fY2hpbGRyZW49bm9kZXN8fFtdOyAvL+WxleW8gOeahOiKgueCueaUvuWIsF9jaGlsZHJlbuS4rVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lTm9kZTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmUoZ2lkKXtcclxuICAgIHJldHVybiB0cmVlLnJlbW92ZShnaWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmZXRjaE9yQ3JlYXRlUGF0aChsaWRwYXRoKXsgLy/ov5Tlm55saWRwYXRo5a+55bqU55qEZ2lk77yM5aaC5p6c6Lev5b6E5LiN5a2Y5Zyo5bCd6K+V6YCQ57qn5Yib5bu6XHJcbiAgICByZXR1cm4gdHJlZS5saWRwYXRoMmdpZChsaWRwYXRoKVxyXG4gICAgLnRoZW4oZ2lkPT57XHJcbiAgICAgICAgY2FjaGVbbGlkcGF0aF09Z2lkO1xyXG4gICAgICAgIHJldHVybiBnaWQ7XHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKGU9PntcclxuICAgICAgICBpZihlLnN0YXR1cz09NDA0KXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ25vdCBmb3VuZCcsbGlkcGF0aCwndHJ5IGNyZWF0ZScpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ5Q3JlYXRlUGF0aChsaWRwYXRoKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiB0cnlDcmVhdGVQYXRoKGxpZHBhdGgpe1xyXG4gICAgcmV0dXJuIGZpbmRFeGlzdEFuY2VzdG9yUGF0aChsaWRwYXRoKS50aGVuKGFuY2VzdG9yUGF0aD0+e1xyXG4gICAgICAgIHJldHVybiBjcmVhdGVQYXRocyhsaWRwYXRoLGFuY2VzdG9yUGF0aCk7Ly/ov5Tlm57mlrDlu7psaWRwYXRo55qEZ2lkXHJcbiAgICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kRXhpc3RBbmNlc3RvclBhdGgobGlkcGF0aCkge1xyXG4gICAgdmFyIHBwYXRoPXBhdGguZGlybmFtZShsaWRwYXRoKTtcclxuICAgIGlmKHBwYXRoLmluZGV4T2YoXCIvXCIpPDApey8v5bey57uP5Yiw5pyA5ZCO77yM5pWw5a2X6YOo5YiGXHJcbiAgICAgICAgcmV0dXJuIHBwYXRoOyAvL+i/lOWbnuW9k+WJjei3r+W+hO+8jOWPquacieaVsOWtl+mDqOWIhlxyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgcmV0dXJuIHRyZWUubGlkcGF0aDJnaWQocHBhdGgpLnRoZW4oZ2lkPT57XHJcbiAgICAgICAgICAgIGNhY2hlW3BwYXRoXT1naWQ7XHJcbiAgICAgICAgICAgIHJldHVybiBwcGF0aDtcclxuICAgICAgICB9KSAvL+aJvuWIsO+8jOi/lOWbnuW9k+WJjei3r+W+hFxyXG4gICAgICAgIC5jYXRjaChlPT57XHJcbiAgICAgICAgICAgIGlmKGUuc3RhdHVzPT00MDQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbmRFeGlzdEFuY2VzdG9yUGF0aChwcGF0aCk7IC8v5rKh5om+5Yiw77yM6YCQ57qn5b6A5LiK5om+XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vbGlkcGF0aD1cIjAvYS9iL2MvZFwiXHJcbi8vYW5jZXN0b3JQYXRoPVwiMC9hXCIg5oiW6ICFIFwiMFwiXHJcbi8vcmVtYWluUGF0aD1cImIvYy9kXCIg5oiW6ICFXCJhL2IvYy9kXCJcclxuZnVuY3Rpb24gY3JlYXRlUGF0aHMobGlkcGF0aCxhbmNlc3RvclBhdGgpe1xyXG4gICAgY29uc29sZS5sb2coXCJjcmVhdGVQYXRoc1wiLGxpZHBhdGgsYW5jZXN0b3JQYXRoKVxyXG4gICAgaWYobGlkcGF0aD09YW5jZXN0b3JQYXRoKXsgLy/pgJLlvZLnu4jmraLmnaHku7ZcclxuICAgICAgICByZXR1cm4gdHJlZS5saWRwYXRoMmdpZChhbmNlc3RvclBhdGgpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgdmFyIHJlbWFpblBhdGg9bGlkcGF0aC5zdWJzdHIoYW5jZXN0b3JQYXRoLmxlbmd0aCsxKTtcclxuICAgICAgICB2YXIgcGF0aHM9cmVtYWluUGF0aC5zcGxpdChcIi9cIik7XHJcbiAgICAgICAgdmFyIG5ld0xpZD1wYXRocy5zaGlmdCgpO1xyXG4gICAgICAgIHZhciBwZ2lkPWNhY2hlW2FuY2VzdG9yUGF0aF07XHJcbiAgICAgICAgaWYoYW5jZXN0b3JQYXRoLmluZGV4T2YoXCIvXCIpPDApe1xyXG4gICAgICAgICAgICBwZ2lkPU51bWJlcihhbmNlc3RvclBhdGgpOyAgLy/ot6/lvoTlj6rmnInmoLlnaWTnmoTmg4XlhrVcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNyZWF0ZT1mdW5jdGlvbihfcGdpZCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbmNlc3RvclBhdGgnLGFuY2VzdG9yUGF0aCxfcGdpZCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cmVlLm1rX3Nvbl9ieV9kYXRhKF9wZ2lkLHt9LG5ld0xpZCkudGhlbihub2RlPT57XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJuZXcgbm9kZSBjcmVhdGVkXCIsbm9kZSlcclxuICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlUGF0aHMobGlkcGF0aCxhbmNlc3RvclBhdGgrXCIvXCIrbmV3TGlkKTsgIC8v6YCS5b2S6LCD55So6Ieq5bex6YCQ57qn5ZCR5LiL5Yib5bu6XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihwZ2lkfHxwZ2lkPT09MCl7XHJcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGUocGdpZCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiB0cmVlLmxpZHBhdGgyZ2lkKGFuY2VzdG9yUGF0aCkudGhlbihwZ2lkPT57XHJcbiAgICAgICAgICAgICAgICBjYWNoZVthbmNlc3RvclBhdGhdPXBnaWQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlKHBnaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbi8v5aGr5YWF54i26IqC54K555u05Yiw5qC56IqC54K5LOWMheWQq+agueiKgueCuSBcclxuLy9bMTldPT0+WzAsMSwxNywxOV1cclxuZnVuY3Rpb24gIGV4cGFuZFRvUm9vdChnaWRzLHJvb3Q9MCl7XHJcbiAgICBjb25zdCBnaWQ9Z2lkc1swXTtcclxuICAgIHJldHVybiB0cmVlLnJlYWQoZ2lkKS50aGVuKG5vZGU9PntcclxuICAgICAgICBjb25zdCBwPW5vZGUuX2xpbmsucDtcclxuICAgICAgICBnaWRzLnVuc2hpZnQocCk7XHJcbiAgICAgICAgaWYocD09PXJvb3Qpe1xyXG4gICAgICAgICAgICByZXR1cm4gZ2lkcztcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kVG9Sb290KGdpZHMscm9vdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxubW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oX3RyZWUpe1xyXG4gICAgdHJlZT1fdHJlZTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZXhwYW5kLFxyXG4gICAgICAgIHJlbW92ZSxcclxuICAgICAgICBmZXRjaE9yQ3JlYXRlUGF0aCxcclxuICAgICAgICBjcmVhdGVQYXRocyxcclxuICAgICAgICBleHBhbmRUb1Jvb3RcclxuICAgIH1cclxufSJdfQ==