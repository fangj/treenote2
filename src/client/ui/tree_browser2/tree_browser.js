import React from 'react';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';
var cx =require ("classnames");
var _=require("lodash");
require('./tree_browser.less');

const noder=(_node,props)=>{
  var {render,tree,focus,expands}=props;
  expands=expands||[];
	var expand=false;//是否要展开当前节点？默认不展开
	if(expands.length>0){
		var [first,...remain]=expands;
		if(first===_node._id){
			expand=true;//当前结点在要展开的节点中，展开
		}
	}
  if(expand){
  	return <TreeNodeReader key={_node._id} tree={tree} gid={_node._id} view={NodeWithChildren}  render={render} focus={focus} level={1} expands={remain}/>
  }else{
  	return <Noder  key={_node._id} tree={tree} node={_node}  render={render}  focus={focus} />
  }
}

class NodeWithChildren extends React.Component {
  static propTypes = {
    node: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const me=this;
    const {render,node,expands,focus}=me.props;
    const vnode={_type:"vnode",_p:node._id};
    console.log('focus,node._id',focus,node._id)
    return (
        <div className="node" >
          <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
          <div className={cx("children",{focus:_.includes(node._link.children, focus)})}>{render(vnode)}{node._children.map(cnode=>noder(cnode,me.props))}</div>
        </div>
        
    );
  }
}

class Noder extends React.Component {
  static propTypes = {
    node: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const me=this;
    const {render,node,expands,focus}=me.props;
    return (
        <div className="node" >
          <div className={cx("main",{focus:focus===node._id})}>{render(node)}</div>
        </div>
        
    );
  }
}





const treeRoot=(props)=>{
	const {node,gid,...others}=props;
  	return noder(node,others);
}


export default class tree_browser extends React.Component {
  render() {
  	var {tree,root,gid,...others}=this.props;
  	return <TreeNodeReader tree={tree} gid={root} level={0} view={treeRoot} focus={gid} {...others}/>
  }
}