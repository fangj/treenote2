import React from 'react';
import TreeNodeReader from 'treenote2/src/client/ui/tree_node_reader';
var cx =require ("classnames");
var _=require("lodash");
require('./tree_browser.less');
var PubSub =require ("pubsub-js");
var d=require('./dom_operation');
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
      // console.log('lets paste',from,"to",to)
      tree.mv_as_brother(from,to).then(_=>{
        clipboard=null;
        PubSub.publish("TreeBrowser",{msg:"refresh"});
      })
    }
  })
}

const menu=(node,tree,treetool)=>{
    return <div className="menu">
              <button className="btn btn-default btn-xs"
              draggable="true" onDragStart={d.drag} onDragEnd={d.dragEnd}
              >
                <i className="fa fa-arrows"></i>
              </button>
              <button className="btn btn-default btn-xs" onClick={()=>{
                clipboard=node._id;
              }}><i className="fa fa-cut"></i></button>
              <button className="btn btn-default btn-xs"  onClick={()=>{
                // console.log(clipboard)
                paste(clipboard,node._id,tree,treetool);
              }}><i className="fa fa-paste"></i></button>
              <button className="btn btn-default btn-xs"  onClick={()=>{
                var sure=confirm("are you sure?")
                // console.log(sure);
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
    const {render,focus,expands,tree,level,hideRoot}=props;
    const treetool=require('treenote2/src/client/tool')(tree);
    const vnode={_type:"vnode",_p:node._id}
    //test begin
    // if(node._id=='0'){
    //   console.log('TreeBrowser',node);
    // }
    //test end
    var isHideRoot=hideRoot&&level===1;
    return (
        <div className={cx("node",{focus:focus===node._id},{hideRoot:isHideRoot})} id={node._id}
        data-level={level}>
        {isHideRoot?null:<div className="main" onDrop={d.drop} onDragOver={d.dragover}>
            {render(node)}
            {menu(node,tree,treetool)}
          </div>
        }
          {!_.includes(expands,node._id)?null:<div className={cx("children",{focus:_.includes(node._link.children, focus)})}>
          <div className="vnode" >
            <div  className="main">
            {render(vnode)}
            </div>
          </div>
          {node._children.map(node=><TreeBrowser key={node._id} node={node} {...others} level={level+1}/>)}
          </div>}
        </div>
        
    );
}


export default class tree_browser extends React.Component {
  constructor(props) {
    super(props);
    this.state=props;
    const {tree}=props;
  }
  render() {
  	var {root,...others}=this.state;
    var {focus,expands}=this.state;
    if(hasSlash(root)||hasSlash(root)||_.some(expands, hasSlash)){ 
      return null;//如果有用路径表示的节点，需要转化为gid形式再显示
    }
  	return <TreeNodeReader gid={root}  view={TreeBrowser}  {...others} level={1}/>
  }
  componentDidMount() {
    const me=this;
    const {node,tree}=this.props;
    const treetool=require('treenote2/src/client/tool')(tree);

    //处理点击卡片后收到的消息
    function mysubscriber(target,data){
     console.log('got',target,data);
     if(data.msg=='focus'){ //设置焦点
       const focus=data.gid;
       const pgid=data.pgid;
       var {expands}=me.state;
       expands=buildExpandsWithFocus(expands,focus,pgid);
       me.setState({focus,expands});
     }else if(data.msg=='refresh'){ //刷新视图
      me.forceUpdate();
     }else if(data.msg=='move'){ //移动卡片
      paste(data.gid,data.bgid,tree,treetool);
     }
    }
    this.token=PubSub.subscribe("TreeBrowser",mysubscriber)

    //把路径转换为gid形式
    var {root,focus,expands}=this.state;
    const _path2gid=_.curry(path2gid)(treetool);//单参数函数fn(gidOrPath)
    const together=[root,focus,...expands];//合并一下方便处理
    Promise.all(together.map(_path2gid)).then(([root,focus,...expands])=>{
      me.setState({root,focus,expands});
    })

  }
  componentDidUpdate(prevProps, prevState) {
    const {focus}=this.state;
    d.scroll2card(focus);
    d.ensureFocusColumn(focus);
  }
}

const hasSlash=(str)=>str.indexOf('/')>-1;

function path2gid(treetool,gidOrPath){
  return hasSlash(gidOrPath)?treetool.createNodeByPath(gidOrPath).then(node=>node._id):Promise.resolve(gidOrPath);//有斜杠的视为路径，没有的视为gid直接返回
}

function buildExpandsWithFocus(expands,focus,pgid) {
  var idx=expands.indexOf(pgid);
  if(idx<0){return expands;}//没找到直接返回
  expands=expands.slice(0,idx+1);//父节点之前
  expands.push(focus);//加入新的节点
  return expands;
}