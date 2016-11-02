import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
const width=window.innerWidth;
const height=window.innerHeight;
require("./index.less");

var containerStyle={
    position:"relative",
    backgroundColor: '#F5FCFF',
    height:height,
    width:width*3
  };
var styles = {
  leftlist:{
    position:"absolute",
    backgroundColor: 'lightpink',
    width:width,
    height:height,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  middlelist:{
    position:"absolute",
    backgroundColor: 'lightgreen',
    width:width,
    height:height,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightlist:{
    position:"absolute",
    backgroundColor: 'lightblue',
    width:width,
    height:height,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card:{
    width:width,
    height:height*2/3,
    borderWidth: 2,
    borderColor: 'gray',
    borderStyle:'dashed',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  } ,
  text:{
    fontSize:72
  }
};



export default class TreeViewMobile extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state={contX:0,leftX:0,middleX:width,rightX:2*width,
      llist:0,mlist:1,rlist:2,
      mlist_y:0,rlist_y:0}
    this.accept=this.accept.bind(this);
    this.handleTouchStart=this.handleTouchStart.bind(this);
    this.handleTouchMove=this.handleTouchMove.bind(this);
    this.handleTouchEnd=this.handleTouchEnd.bind(this);
    this.handleTouchCancel=this.handleTouchCancel.bind(this);
  }

  render() {
    const {contX}=this.state;
    return (
      <div className="tree-container" style={{left:contX}}>
        <div className="list leftlist">left</div>
        <div className="list middlelist" ref="middlelist">middle
          <div className="card"/>
          <div className="card"/>
          <div className="card"/>
          <div className="card"/>
        </div>
        <div className="list rightlist">right</div>

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
    this.startX=x;//开始touch时的x位置
  }
  
  handleTouchMove(e){
    console.log('touchmove',e.changedTouches[0].pageX) 
    const x=e.changedTouches[0].pageX;
    const dx=x-this.startX;
    if(Math.abs(dx)>20){
      e.preventDefault();//接管移动
      this.accept("contX",dx);
    }
  }
  handleTouchEnd(e){
    console.log('touchend',e.changedTouches[0].pageX) 
    me.accept("panEnd",dx);

  }
   handleTouchCancel(e){
    console.log('touchcancel',e.changedTouches[0].pageX) 
  }
   accept(msg,data){
    var state=this.state||{}; //获取当前的state值
    const fns={
      "contX":setContainerX //响应msg的函数列表
      // "panEnd":panEnd,
      // "panStart":panStart,
      // "measureCard":measureCard,
      // "recordScrollY":recordScrollY //记录滚动位置
    }
    if(fns[msg]){ //如果有响应函数，用响应函数处理state后刷新组件
      state=fns[msg](state,data,msg,this);
      if(state){
        this.setState(state);
      }
    }
  }

};//end class

function setContainerX(state,dx,msg) {
  state.contX=dx;
  return state;
}

function panStart(state,dx,msg,me) {
  me.panStartTime=Date.now();//开始移动时间
  const layout=me.layouts[2];//取得2号卡片的位置，假设2号卡片是拖动的卡片
  const scrollY=me.scrollY||0;
  const posY=layout.y-scrollY;//减去滚动的相对位置，得到相对于屏幕的距离
  state.rlist_y=Math.max(posY,0);
  // state.rlist_y=layout.y;
}

function panEnd(state,dx,msg,me) {
  console.log("panEnd");
  if(Math.abs(dx)<20){ //不移动
      state.contX=-width;
      me.setState(state);
  }else{
      const panEndTime=Date.now();
      const v=(width-Math.abs(dx))/(panEndTime-me.panStartTime);
      if(dx<-20){//左移
          state.contX=dx;
          state.llist=state.mlist;
          state.mlist=state.rlist;
          state.mlist_y=state.rlist_y;//拷贝右侧位置
          state.rlist_y=0;//恢复
          state.rlist=state.mlist+1;
          me._scrollView.scrollTo({x: 0, y: 0, animated: false});
          tweenH(me,state,v).chain(tweenUp(me,state)).start(); //左移后还需上移
      }else{//右移
          state.contX=-2*width+dx;
          state.rlist=state.mlist;
          state.mlist=state.llist;
          state.llist=state.mlist-1;
          tweenH(me,state,v).start();  
      }
  }
  return null;
}


//横向移动动画
const tweenH = (me,state,v)=>new TWEEN.Tween(state).easing(TWEEN.Easing.Quadratic.In)
      .to({ contX: -width}, Math.abs(state.contX-(-width))/v)
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



