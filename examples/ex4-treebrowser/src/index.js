import React from 'react';
import ReactDOM from 'react-dom';
import TreeBrowser from 'treenote2/src/client/ui/tree_browser';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';
var PubSub =require('pubsub-js');

var tree=require('treenote2/src/client/tree-cache.js')("_api");

// function scroll2card(id){ //已经移到tree_browser中
//   var card=$("#"+id);
//   var cardX=card.offset().left;
//   var cardY=card.offset().top;
//   // window.scrollTo(cardX-20,cardY-20);
//   // $('html,body').animate({scrollLeft:cardX-20,scrollTop:cardY-20}, 800);
//   $('html,body').animate({scrollLeft:cardX-200}, 800); //只改变横坐标
// }

// function dragOver(ev)
// {
//   ev.preventDefault();
// }

// function drag(ev)
// {
//   ev.dataTransfer.setData("node",ev.target.id);
//   ev.dataTransfer.dropEffect = "move";
// }

// function drop(ev)
// {
//   ev.preventDefault();
//   var sourceID=ev.dataTransfer.getData("node");
//   var target=ev.target;
//   if(!target.id){
//     target=ev.target.parentElement; //target有时候时目标元素的子元素
//   }
//   console.log('s',sourceID,'t',target.id,ev.target);
//   // target.parentElement.parentElement.parentElement.appendChild(document.getElementById(sourceID).parentElement.parentElement);
//   if(target.id=='0')return;//不能移动为根节点的兄弟
//   var targetNode=target.parentElement.parentElement.parentElement;
//   var sourceNode=document.getElementById(sourceID).parentElement.parentElement.parentElement;
//   // targetNode.parentElement.appendChild(sourceNode);
//   targetNode.parentElement.insertBefore(sourceNode,targetNode);
// }

function render(node,vtype){
  //新建节点
  if(node._type=='vnode'){ //虚节点,{_type:"vnode",_p:"pgid"}
    return <div style={{height:"50px"}} onClick={()=>{
      tree.mk_son_by_data(node._p,null).then(_=>{
        console.log("publish updated ")
        PubSub.publish("TreeBrowser",{msg:"refresh"});
      });
    }}>+{node._p}</div>
  }
  return <div>
    <div 
    onClick={(e)=>{
      console.log("node",node)
        PubSub.publish("TreeBrowser",{msg:'focus',gid:node._id,pgid:node._link.p})
        // scroll2card(node._id);
        // setTimeout(_=>scroll2card(node._id),1000)
    }} 
      >
    <pre>{JSON.stringify({id:node._id,name:node._name,link:node._link},null,2)}</pre>
    </div>
  </div>
}


        
// ReactDOM.render(
//    <div>
//    <TreeNodeReader tree={tree} view={props=><div>xx</div>} gid='0' />
//    <TreeNodeReader tree={tree} view={TreeBrowser} root='0' gid='0' render={render} subscribe={["updated"]} expands={['0']} level={2}/>
//    </div>,
//   document.getElementById('root')
// );

ReactDOM.render(
   <div >
   <TreeBrowser tree={tree} render={render} root='0' focus='0/hello/world' expands={['0','0/hello','0/hello/world']}
   hideRoot={true}/>
   </div>,
  document.getElementById('root')
);

// ReactDOM.render(
//    <div>
//    <TreeBrowser tree={tree} render={render} root='0' focus='aEPi425BJDu0Nw3O' level={3}/>
//    </div>,
//   document.getElementById('root')
// );
