import React from 'react';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';
var cx =require ("classnames");
var _=require("lodash");
require('./tree_browser.less');
var PubSub =require ("pubsub-js");

// class NodeWrapper extends  React.Component {
//   constructor(props) {
//     super(props);
//     const {expands,focus}=this.props;
//     this.state={expands:expands||[],focus}
//   }

//   render() {
// 	  const {gid,node,render,tree}=this.props;
// 	  const {expands,focus}=this.state;
// 		var expand=false;//是否要展开当前节点？默认不展开
// 		if(expands.length>0){
// 			var [first,...remain]=expands;
// 			if(first===node._id){
// 				expand=true;//当前结点在要展开的节点中，展开
// 			}
// 		}
// 		this.state.expand=expand;
// 	  if(expand){
// 	  	return <TreeNodeReader  tree={tree} gid={node._id} view={NodeWithChildren}  render={render} focus={focus} level={1} expands={remain}/>
// 	  }else{
// 	  	return <Noder  tree={tree} node={node}  render={render}  focus={focus} />
// 	  }
//   }	

//   componentDidMount() {
//   	const me=this;
//   	const {node}=this.props;
//   	function mysubscriber(gid,data){
//   		console.log('got',gid,data);
//   		if(data.msg=='focus'){
//   			const focus=data.gid;
  		
//   			console.log('old state',me.state);
//   			console.log('new state',{
//   				expands:[node._id,focus],
//   				focus
//   			});

//   			me.setState({
//   				expands:[node._id,focus],
//   				focus
//   			})
//   		}
//   	}
//   	this.token=PubSub.subscribe(node._id,mysubscriber)
//   }
//   componentWillUnmount() {
//   	PubSub.unsubscribe(this.token);
//   }

// }

// const NodeWithChildren=(props)=>{
// 	console.log('NodeWithChildren render')
//     const {render,node,focus,...others}=props;
//     const vnode={_type:"vnode",_p:node._id};
//     return (
//         <div className="node" >
//           <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
//           <div className={cx("children",{focus:_.includes(node._link.children, focus)})}>{render(vnode)}{node._children.map(cnode=><NodeWrapper key={cnode._id} node={cnode} render={render}  focus={focus}  {...others} />)}</div>
//         </div>
        
//     );
// }

// class NodeWithChildren extends React.Component {
//   static propTypes = {
//     node: React.PropTypes.object,
//   };

//   constructor(props) {
//     super(props);
//   }

//   render() {
//   	console.log('NodeWithChildren render')
//     const me=this;
//     const {render,node,focus,...others}=me.props;
//     const vnode={_type:"vnode",_p:node._id};
//     return (
//         <div className="node" >
//           <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
//           <div className={cx("children",{focus:_.includes(node._link.children, focus)})}>{render(vnode)}{node._children.map(cnode=><NodeWrapper key={cnode._id} node={cnode} render={render}  focus={focus}  {...others} />)}</div>
//         </div>
        
//     );
//   }
// }

// class Noder extends React.Component {
//   static propTypes = {
//     node: React.PropTypes.object,
//   };

//   constructor(props) {
//     super(props);
//   }

//   render() {
//     const me=this;
//     const {render,node,expands,focus}=me.props;
//     return (
//         <div className="node" >
//           <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
//         </div>
        
//     );
//   }
// }

// const Noder=(props)=>{
//     const {render,node,expands,focus}=props;
//     return (
//         <div className="node" >
//           <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
//         </div>
        
//     );
// }
const TreeBrowser=(props)=>{
    const {node,...others}=props;
    const {render,focus}=props;
    const vnode={_type:"vnode",_p:node._id}
    return (
        <div className="node" >
          <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
          <div className={cx("children",{focus:_.includes(node._link.children, focus)})}>{render(vnode)}{node._children.map(node=><TreeBrowser key={node._id} node={node} {...others}/>)}</div>
        </div>
        
    );
}


export default class tree_browser extends React.Component {
  render() {
  	var {root,...others}=this.props;
  	return <TreeNodeReader gid={root}  view={TreeBrowser}  {...others}/>
  }
}