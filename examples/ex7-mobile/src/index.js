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
    this.state={contX:-width,leftX:0,middleX:width,rightX:2*width,
      llist:0,mlist:1,rlist:2,
      mlist_y:0,rlist_y:0}
    this.accept=this.accept.bind(this);
  }

  render() {
    return (
      <div className="tree-container">
        <div className="list leftlist">left</div>
        <div className="list middlelist">middle
          <div className="card"/>
          <div className="card"/>
          <div className="card"/>
          <div className="card"/>
        </div>
        <div className="list rightlist">right</div>

      </div>
    );
  }

   accept(msg,data){
    var state=this.state||{}; //获取当前的state值
    const fns={
      // "contX":setContainerX, //响应msg的函数列表
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

}//end class


ReactDOM.render(
      <TreeViewMobile/>,
  document.getElementById('root')
);



