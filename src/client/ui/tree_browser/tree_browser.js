import React from 'react';
require('./tree_browser.less');
var PubSub =require('pubsub-js');
import NodeWithChildren from './node_with_children';
import TreeNodeReader from 'treenote2/lib/client/ui/tree_node_reader';


export default class TreeBrowser extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state=this.buildStateByProps(props);
  }

  buildStateByProps(props){
    const {tree,root,render,node}=props;
    if(!tree || !root||!render){return;}
    if(node==undefined){
      return {root:root,render:render,last_col:root,cur_col:root,cur_gid:null}
    }else{
      const pgid=node._link.p;
      return {root:root,render:render,last_col:pgid,cur_col:pgid,cur_gid:node._id}
    }
  }

  componentDidMount() {
    const me=this;
    function mySubscriber(msg,_node){
      const {node,...others}=me.props;
      const state=this.buildStateByProps({node:_node,...others});
      if(state){me.setState(state);}
    }
    this.token=PubSub.subscribe('click-node',mySubscriber);
  }

  componentWillReceiveProps(nextProps) {
    const state=this.buildStateByProps(nextProps);
    if(state){me.setState(state);}
  }

  render() {
    if(!this.state){return null;}
    const {tree}=this.props;
    return (
      <TreeNodeReader tree={tree} gid={this.state.root} level={5} view={NodeWithChildren} {...this.state}/>
    );
  }

  onClick(){
    console.log('click')
    const {tree}=this.props;
    tree.read("Kt85zP5CFVsHtlxc").then(node=>{
      PubSub.publish('click-node',node)
    })
  }
  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }
}
