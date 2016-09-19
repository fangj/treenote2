import React from 'react';
import TreeNodeReader from 'treenote2/lib/client/ui/tree_node_reader';


export default class NodeWithChildren extends React.Component {
  static propTypes = {
    node: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {render,node}=this.props;
    return (
      <div>
        <div className="node">{render(node)}</div>
        <div className="children">{
          node._link.children.map(gid=><TreeNodeReader key={gid}>{gid}</div>)
        }</div>
      </div>
    );
  }
}
