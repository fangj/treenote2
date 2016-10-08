import React from 'react';
import ReactDOM from 'react-dom';
import TreeBrowser from 'treenote2/src/client/ui/tree_browser';
import TreeBrowser2 from 'treenote2/src/client/ui/tree_browser2';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';
var PubSub =require('pubsub-js');

var tree=require('treenote2/src/client/tree.js')("_api");

function render(node,vtype){
  if(node._type=='vnode'){ //虚节点,{_type:"vnode",_p:"pgid"}
    return <div className="node" onClick={()=>{
      tree.mk_son_by_data(node._p,"new").then(_=>{
        console.log("publish updated ")
        // PubSub.publish('updated');
        PubSub.publish(node._p);
      });
    }}><div className="main">+{node._p}</div></div>
  }
  return <div className={vtype}><pre>{JSON.stringify(node)}</pre></div>
}
        
// ReactDOM.render(
//    <div>
//    <TreeNodeReader tree={tree} view={props=><div>xx</div>} gid='0' level={1}/>
//    <TreeNodeReader tree={tree} view={TreeBrowser} root='0' gid='0' render={render} subscribe={["updated"]} expands={['0']}/>
//    </div>,
//   document.getElementById('root')
// );

ReactDOM.render(
   <div>
   <TreeBrowser2 tree={tree} render={render} gid='0' expands={['0','aEPi425BJDu0Nw3O','fp9rDCkZC4qekBRg','e5jEsZ9cf31Vy7T5']}/>
   </div>,
  document.getElementById('root')
);
