import React from 'react';
import ReactDOM from 'react-dom';
import TreeBrowser from 'treenote2/lib/client/ui/tree_browser';
import TreeNodeReader from 'treenote2/lib/client/ui/tree_node_reader';

var tree=require('treenote2/lib/client/tree.js')("_api");

function render(node,vtype){
  if(node._type=='vnode'){ //虚节点,{_type:"vnode",_p:"pgid"}
    return <div className={vtype}>+{node._p}</div>
  }
  return <div className={vtype}><pre>{JSON.stringify(node)}</pre></div>
}
        
ReactDOM.render(
   <div>
   <TreeNodeReader tree={tree} view={props=><div>xx</div>} gid='0' level={1}/>
   <TreeBrowser tree={tree} root='0' gid='4CoTsMzWLq0UNf89' render={render}/>
   </div>,
  document.getElementById('root')
);

