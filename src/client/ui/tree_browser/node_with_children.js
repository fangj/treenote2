import React from 'react';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';

const Noder=(_node,props)=>{
  const {render,node,tree,cur_col,cur_gid,last_col,root}=props;
  return <NodeWithChildren  key={_node._id}  node={_node}  render={render} tree={tree} root={root} cur_col={cur_col} cur_gid={cur_gid} last_col={last_col}/>
}

const SimpleNoder=(node)=><div key={node._id}>{JSON.stringify(node)}</div>

export default class NodeWithChildren extends React.Component {
  static propTypes = {
    node: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const me=this;
    const {render,node}=me.props;
    const vnode={_type:"vnode",_p:node._id}
    return (
        <div className="node" >
          <div className="main">{render(node)}</div>
          <div className="children">{render(vnode)}{node._children.map(cnode=>Noder(cnode,me.props))}</div>
        </div>
        
    );
  }
}
