import React from 'react';
require('./tree_browser.less');
var PubSub =require('pubsub-js');
import NodeWithChildren from './node_with_children';
export default class TreeBrowser extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }


  componentDidMount() {
    this.refresh(this.props);
    const me=this;
    function mySubscriber(msg,gid){
      const {tree,root,render}=me.props;
      me.refresh({tree,root,render,gid})
    }
    this.token=PubSub.subscribe('click-node',mySubscriber);
  }
  componentWillReceiveProps(nextProps) {
    this.refresh(nextProps);
  }

  refresh(props){
    const me=this;
    const {tree,root,render,gid}=props;
    if(!tree || !root||!render){return;}
    var state;
    if(gid==undefined){
      state={root:root,render:render,last_col:root,cur_col:root,cur_gid:null}
      this.setState(state);
    }else{
      tree.read(gid).then(node=>{
        const pgid=node._link.p;
        state={root:root,render:render,last_col:pgid,cur_col:pgid,cur_gid:gid}
        me.setState(state);
      })
    }
  }

  render() {
    if(!this.state){return null;}
    return (
      <NodeWithChildren {...this.state}/>
    );
  }

  onClick(){
    console.log('click')
    PubSub.publish('click-node',"Kt85zP5CFVsHtlxc")
  }
  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }
}
