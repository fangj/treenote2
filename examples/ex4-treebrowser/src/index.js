import React from 'react';
import ReactDOM from 'react-dom';
import TreeBrowser from 'treenote2/src/client/ui/tree_browser';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';
var PubSub =require('pubsub-js');

var tree=require('treenote2/src/client/tree-cache.js')("_api");
var txt_editor=require('./txt_editor');
var _=require('lodash');


function render(node,options){
  //新建节点
  //vnode是虚拟节点，把新建节点的块作为一个特殊节点来处理
  if(node._type=='vnode'){ //虚节点,{_type:"vnode",_p:"pgid"}
    return <div style={{height:"50px"}} onClick={()=>{
      tree.mk_son_by_data(node._p,null).then(_=>{
        console.log("publish updated ")
        PubSub.publish("TreeBrowser",{msg:"refresh"});
        //新建节点后通过向TreeBrowser发送refresh消息使其更新
      });
    }}>+{node._p}</div>
  }
  //检查编辑状态，通过编辑状态决定是否显示编辑界面（todo:将由BlockViewController接管)
  const {isEdit}=options;
  if(isEdit){
    return  txt_editor(node);
  }
  return <div>
    <div 
    onClick={(e)=>{
      console.log("node",node)
        PubSub.publish("TreeBrowser",{msg:'focus',gid:node._id,pgid:node._link.p})
        //向TreeBrowser发送focus消息来转移焦点块
    }} 
      >
    {show(node)}
    </div>
  </div>
}

//show负责纯粹的数据显示
const show=(node)=>{
  const type=_.get(node,"_data.type");
  const data=_.get(node,"_data.data");
  if(type=='tn/txt'){
    return <pre>{data}</pre>
  }
  return <pre>{json(node)}</pre>;

}

const json=(node)=>JSON.stringify({id:node._id,name:node._name,link:node._link,data:node._data},null,2)


        
//TreeBrowser用法
//tree 数据API
//render 显示数据的render
//root 显示的根
//focus 当前焦点节点
//expands 要展开的节点，按顺序
//hideRoot 是否隐藏根节点列

ReactDOM.render(
   <div >
   <TreeBrowser tree={tree} render={render} root='0' focus='0/hello/world' expands={['0','0/hello','0/hello/world']}
   hideRoot={true}/>
   </div>,
  document.getElementById('root')
);

