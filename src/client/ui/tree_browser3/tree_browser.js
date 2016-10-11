import React from 'react';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';
var cx =require ("classnames");
var _=require("lodash");
require('./tree_browser.less');
var PubSub =require ("pubsub-js");

var clipboard;//剪贴板，用于存放当前剪切的node id

function isDescendant(target,source,treetool){ //check whether target is  descendant of source
  return treetool.expandToRoot([target],source).then(idpath=>{
    return idpath.indexOf(source)>-1;
  })
}

function paste(from,to,tree,treetool){
  isDescendant(to,from,treetool).then(cannot=>{
    if(cannot){
      alert("cannot paste from " +from+" to "+to)
    }else{
      console.log('lets paste',from,"to",to)
      tree.mv_as_brother(from,to).then(_=>{
        clipboard=null;
        PubSub.publish("TreeBrowser",{msg:"refresh"});
      })
    }
  })
}

const menu=(node,tree,treetool)=>{
    return <div className="menu">
              <button className="btn btn-default btn-xs" onClick={()=>{
                clipboard=node._id;
              }}><i className="fa fa-cut"></i></button>
              <button className="btn btn-default btn-xs"  onClick={()=>{
                console.log(clipboard)
                paste(clipboard,node._id,tree,treetool);
              }}><i className="fa fa-paste"></i></button>
              <button className="btn btn-default btn-xs"  onClick={()=>{
                var sure=confirm("are you sure?")
                console.log(sure);
                if(sure){
                  tree.remove(node._id).then(_=>{
                    PubSub.publish("TreeBrowser",{msg:"refresh"});
                  })
                }
              }}><i className="fa fa-trash"></i></button>
            </div>
}

const TreeBrowser=(props)=>{
    const {node,...others}=props;
    const {render,focus,expands,tree}=props;
    const treetool=require('treenote2/src/client/tool')(tree);
    const vnode={_type:"vnode",_p:node._id}
    return (
        <div className={cx("node",{focus:focus===node._id})} >
          <div className="main">
            {render(node)}
            {menu(node,tree,treetool)}
          </div>
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