import React from 'react';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';

const noder=(_node,props)=>{
  var {render,tree,cur_gid,expands}=props;
  expands=expands||[];
	var expand=false;//是否要展开当前节点？默认不展开
	if(expands.length>0){
		var [first,...remain]=expands;
		if(first===_node._id){
			expand=true;//当前结点在要展开的节点中，展开
		}
	}
  if(expand){
  	return <TreeNodeReader key={_node._id} tree={tree} gid={_node._id} view={Noder}  render={render} cur_gid={cur_gid} level={1} expands={remain}/>
  }else{
  	return <Noder  key={_node._id} tree={tree} node={_node}  render={render}  cur_gid={cur_gid} />
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
    const {render,node,expands}=me.props;
    const vnode={_type:"vnode",_p:node._id}
    return (
        <div className="node" >
          <div className="main">{render(node)}</div>
          <div className="children">{render(vnode)}{node._children.map(cnode=>noder(cnode,me.props))}</div>
        </div>
        
    );
  }
}



export default class tree_browser extends React.Component {
  render() {
  	var {tree,gid,...others}=this.props;
  	return <TreeNodeReader tree={tree} gid={gid} level={0} view={treeRoot} cur_gid={gid} {...others}/>
  }
}

const treeRoot=(props)=>{
	const {node,gid,...others}=props;
  	return noder(node,others);
}


