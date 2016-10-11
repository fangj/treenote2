import React from 'react';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';
var cx =require ("classnames");
var _=require("lodash");
require('./tree_browser.less');
var PubSub =require ("pubsub-js");

const TreeBrowser=(props)=>{
    const {node,...others}=props;
    const {render,focus,expands}=props;
    const vnode={_type:"vnode",_p:node._id}
    return (
        <div className={cx("node",{focus:focus===node._id})} >
          <div className="main">{render(node)}</div>
          {!_.includes(expands,node._id)?null:<div className={cx("children",{focus:_.includes(node._link.children, focus)})}>{render(vnode)}{node._children.map(node=><TreeBrowser key={node._id} node={node} {...others}/>)}</div>}
        </div>
        
    );
}


export default class tree_browser extends React.Component {
  constructor(props) {
    super(props);
    this.state=props;
  }
  render() {
  	var {root,...others}=this.state;
  	return <TreeNodeReader gid={root}  view={TreeBrowser}  {...others}/>
  }
  componentDidMount() {
    const me=this;
    const {node}=this.props;
    function mysubscriber(target,data){
     console.log('got',target,data);
     if(data.msg=='focus'){
       const focus=data.gid;
       const pgid=data.pgid;
       var {expands}=me.state;
       expands=buildExpandsWithFocus(expands,focus,pgid);
       me.setState({focus,expands});
     }else if(data.msg=='refresh'){
      me.forceUpdate();
     }
    }
    this.token=PubSub.subscribe("TreeBrowser",mysubscriber)
  }
}

function buildExpandsWithFocus(expands,focus,pgid) {
  var idx=expands.indexOf(pgid);
  if(idx<0){return expands;}//没找到直接返回
  expands=expands.slice(0,idx+1);//父节点之前
  expands.push(focus);//加入新的节点
  return expands;
}