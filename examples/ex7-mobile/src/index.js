import React from 'react';
import ReactDOM from 'react-dom';
require("./index.less");

var TWEEN = require('tween.js'); 
requestAnimationFrame(animate);
function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
}
// const W=window.innerWidth;
// const H=window.innerHeight;
// const CX0=-W;
const W=window.innerWidth/3;
const H=window.innerHeight;
const CX0=0;
const TX=50;//threshold of x move

export default class TreeViewMobile extends React.Component {
  static propTypes = {
  };

  constructor(props) {
    super(props);
    this.state={cx:CX0,my:0,ry:0,
      l:1,m:2,r:3}
    this.accept=this.accept.bind(this);
    this.handleTouchStart=this.handleTouchStart.bind(this);
    this.handleTouchMove=this.handleTouchMove.bind(this);
    this.handleTouchEnd=this.handleTouchEnd.bind(this);
    this.handleTouchCancel=this.handleTouchCancel.bind(this);
  }

  render() {
    const {cx,my,ry,l,m,r}=this.state;
    return (
      <div className="tree-container" style={{left:cx,width:W*3}}>
        <div className="list leftlist" style={{left:0,width:W}}>{l}</div>
        <div className="list middlelist"  ref="middlelist"
         style={{left:W,width:W}}>
         {m}
        </div>
        <div className="list rightlist" style={{left:W*2,width:W}}>{r}</div>
      </div>
    );
  }

  componentDidMount() {
    const el=this.refs.middlelist;
    el.addEventListener('touchstart', this.handleTouchStart, false);
    el.addEventListener("touchend", this.handleTouchEnd, false);
    el.addEventListener("touchcancel", this.handleTouchCancel, false);
    el.addEventListener("touchmove", this.handleTouchMove, false);
  }
  componentWillUnmount() {
    const el=this.refs.middlelist;
    el.removeEventListener('touchstart', this.handleTouchStart, false);
    el.removeEventListener("touchend", this.handleTouchEnd, false);
    el.removeEventListener("touchcancel", this.handleTouchCancel, false);
    el.removeEventListener("touchmove", this.handleTouchMove, false);
  }

  handleTouchStart(e){
    console.log('touchstart',e.changedTouches[0].pageX) 
    const x=e.changedTouches[0].pageX;
    this.accept("panStart",x);
  }
  
  handleTouchMove(e){
    console.log('touchmove',e.changedTouches[0].pageX) 
    const x=e.changedTouches[0].pageX;
    this.accept("panMove",{e,x});
  }
  handleTouchEnd(e){
    console.log('touchend',e.changedTouches[0].pageX) 
    const x=e.changedTouches[0].pageX;
    this.accept("panEnd",x);
  }
  handleTouchCancel(e){
    console.log('touchcancel',e.changedTouches[0].pageX) 
  }
   accept(msg,data){
    var state=this.state||{}; //获取当前的state值
    const fns={
      "panStart":panStart, //响应msg的函数列表
      "panMove":panMove,
      "panEnd":panEnd
    }
    if(fns[msg]){ //如果有响应函数，用响应函数处理state后刷新组件
      state=fns[msg](state,data,msg,this);
      if(state){
        this.setState(state);
      }
    }
  }

};//end class

function panStart(state,x,msg,me) {
  me.panStartX=x;//开始移动位置
  me.panStartTime=Date.now();//开始移动时间
}

function panMove(state,{e,x},msg,me){
  const dx=x-me.panStartX;
  if(Math.abs(dx)>TX){
    e.preventDefault();
  }
  state.cx=dx;
  me.setState(state);
}

function panEnd(state,x,msg,me) {
  const dx=x-me.panStartX;
  if(Math.abs(dx)<TX){//回到原位
    state.cx=CX0;//回到原位
    me.setState(state);
  }else{ //动画到新位置
    const panEndTime=Date.now();
    const v=(W-Math.abs(dx))/(panEndTime-me.panStartTime);//计算速度
    if(dx<-TX){//左移
      state.cx=state.cx+W;//容器右移一格
      //挨个把内容左移
      state.l=state.m;
      state.m=state.r;
      state.r=state.r+1;//暂时
      tweenH(me,state,v).start();  //水平移动动画
    }else{//右移
      state.cx=state.cx-W;//容器左移一格
      //挨个把内容右移
      state.r=state.m;
      state.m=state.l;
      state.l=state.l-1;//暂时
      tweenH(me,state,v).start();  //水平移动动画
    }
  }
  return null;
}


//横向移动动画
const tweenH = (me,state,v)=>new TWEEN.Tween(state).easing(TWEEN.Easing.Quadratic.In)
      .to({ cx: CX0}, Math.abs(state.cx-CX0)/v)
      .onUpdate(function() {
          me.setState(state);
      });

const tweenUp=(me,state)=>new TWEEN.Tween(state)
      .to({ mlist_y: 0}, 300)
      .onUpdate(function() {
          me.setState(state);
      });

ReactDOM.render(
      <TreeViewMobile/>,
  document.getElementById('root')
);



