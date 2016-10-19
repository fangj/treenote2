var R=require('ramda');
// const tree=require('treenote/lib/client/tree-cache')('_api');
var tree;
var path = require('path');
var cache = {}; //walkaround,由于连续两个相同的tree.lidpath2gid(ppath)调用会导致第二个不执行。所以放到缓存中。

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function expand(node, level) { //level用于控制展开的层级
    if (node._link.children.length == 0 || level <= 0) { //不做展开的2种情况。1.没有子节点。2，展开层级小于0
        var cloneNode = clone(node);
        cloneNode._children = [];
        return Promise.resolve(cloneNode);
    } else {
        return tree.read_nodes(node._link.children)
            .then(nodes => {
                const fnodes = nodes.map(node => expand(node, level - 1));
                return Promise.all(fnodes).then(nodes => {
                    var cloneNode = clone(node);
                    cloneNode._children = nodes || []; //展开的节点放到_children中
                    return cloneNode;
                })
            })
    }
}

function includes(arr, obj) {
    return arr.indexOf(obj) > -1;
}

function expand2(node, expands = []) { //expands用于控制展开的节点列表
    if (node._link.children.length == 0 || !includes(expands, node._id)) { //不做展开的2种情况。1.没有子节点。2，expands数组中没有此项
        var cloneNode = clone(node);
        cloneNode._children = [];
        return Promise.resolve(cloneNode);
    } else {
        return tree.read_nodes(node._link.children)
            .then(nodes => {
                const fnodes = nodes.map(node => expand2(node, expands));
                return Promise.all(fnodes).then(nodes => {
                    var cloneNode = clone(node);
                    cloneNode._children = nodes || []; //展开的节点放到_children中
                    return cloneNode;
                })
            })
    }
}


//填充父节点直到根节点,包含根节点 
//[19]==>[0,1,17,19]
function expandToRoot(gids, root = '0') {
    const gid = gids[0];
    return tree.read(gid).then(node => {
        const p = node._link.p;
        gids.unshift(p);
        if (p === root || p === '0' || p === 0) {
            return gids;
        } else {
            return this.expandToRoot(gids, root);
        }
    });
}

function createChildByName(pgid,name){
    // console.log('createChildByName',pgid,name);
    return tree.mk_son_by_name(pgid,name);
}

//根据路径创建节点
/**
 * @param  {String}
 * @param  {Array}
 * @return {Promise<String>}
 */
function createNodeByPath(path){
    //path="0/abc/def" gid加上路径的形式表达
    var paths=path.split('/');
    var gid=paths.shift();//移出第一个gid，剩下部分为路径
    const f=(P,name)=>P.then(pnode=>createChildByName(pnode._id,name));
    return paths.reduce(f,tree.read(gid));
}

module.exports = function(_tree) {
    tree = _tree;
    return {
        expand,
        expand2,
        expandToRoot,
        createNodeByPath
    }
}