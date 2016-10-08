import React from 'react';
require('./tree_browser.less');
var PubSub =require('pubsub-js');
import NodeWithChildren from './node_with_children';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';


export default class TreeBrowser extends React.Component {
  static propTypes = {
    expands: React.PropTypes.array, //哪些节点要展开
  };

  constructor(props) {
    super(props);
    this.state=this.buildStateByProps(props);
  }

  buildStateByProps(props){
    var {tree,root,render,node,expands}=props;
    if(!tree || !root||!render){return;}
    if(!expands){
      expands=[];
    }
    if(node==undefined){
      return {root,render,expands,cur_col:root,cur_gid:null}
    }else{
      const pgid=node._link.p;
      return {root,render,expands,cur_col:pgid,cur_gid:node._id}
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
    if(state){this.setState(state);}
  }

  render() {
    if(!this.state){return null;}
    const {tree}=this.props;
    return (
      <TreeNodeReader tree={tree} gid={this.state.root} level={1} view={NodeWithChildren} {...this.state}/>
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
