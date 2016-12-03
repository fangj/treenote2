/**
 * dom_opeation.js
 * 负责所有的dom操作，依赖于jQuery
 * 拖拽操作会在dom中插入/删除临时节点
 * 真正的操作通过向TreeBrowser发送move消息来实现，也就是等价于cut/paste
 */
//拖拽时用到的手型图片
var cardImage=require('./handcard');

//检查是否有jQuery
if(!window.$){
  console.warn("need jQuery");
}
//把指定id的card滚动到视图中
function scroll2card(id){
  if(!window.$)return;
  var card=$("#"+id);
  if(!card || !card.offset())return;
  var cardX=card.offset().left;
  var cardY=card.offset().top;
  var newPos={scrollLeft:cardX-200};
  if(cardY>(window.scrollY+window.innerHeight/2)){
    //如果卡片位置在屏幕的下半部分以下。则移动到屏幕上部
    newPos.scrollTop=cardY-20;
  }
  $('html,body').animate(newPos, 800); //只改变横坐标
}
var dragSource,over;
//placeholder是用于占位的块，拖拽时会插入到鼠标所在位置
var placeholder = document.createElement("div");
placeholder.className = "placeholder";

//拖拽开始事件，作用于拖拽把柄上
function drag(ev){
  var moveButton=ev.target; //拖拽把柄（按钮）
  var menu=moveButton.parentElement; //拖拽把柄所在的菜单
  var main=menu.parentElement; //拖拽菜单是父节点是正在拖拽的卡片
  var node=main.parentElement; //卡片的父节点包含了当前卡片和所有子节点
  dragSource=node;
  $(node).css('opacity','0.5');//淡化要移动的节点
  $(node).children(".children").hide(); //不能够移动到子节点，所以隐藏子节点避免成为drop target
  // console.log("node",node)
  var dt = ev.dataTransfer;
  dt.setData('text/plain',node.id); //设置拖拽的数据是当前节点的id
  dt.setDragImage(cardImage, 100, 50); //设置拖拽用的手
  dt.effectAllowed = "move";
  $(".focus").removeClass('focus');//避免宽元素放到窄列中,方便移动
}

//拖拽结束事件，作用于拖拽把柄上
function dragEnd(ev){
  $(dragSource).css('opacity','1');//恢复：淡化要移动的节点
  if(placeholder.parentNode){
    //如果placeholder被插入，则有父节点。拖拽结束时从父节点移除placeholder
    placeholder.parentNode.removeChild(placeholder);//清除黄色占位块
  }
}
//drop操作。作用于node的main视图上
function drop(ev){
  ev.preventDefault();
  var sourceID = ev.dataTransfer.getData("text/plain"); 
  //取得传输的数据，是拖拽的节点id
  var targetNode=$( ev.target ).closest(".node").get(0); 
  //目标节点是main视图最近的node视图
  // var sourceNode=document.getElementById(sourceID);
  if(sourceID==targetNode.id){
    return;//相同元素不移动
  }
  //真正的移动操作通过发送move消息来完成
  PubSub.publish("TreeBrowser",{msg:"move",gid:sourceID,bgid:targetNode.id});
}
function allowDrop(ev) {
    ev.preventDefault();
}

//dragover操作。作用于node的main视图上
//找到main视图所在的node并在相邻后位插入占位符
function dragover(ev){
  allowDrop(ev);
  if(ev.target.className == "placeholder") return;
  var targetNode=$( ev.target ).closest(".node").get(0);
  over = targetNode;
  targetNode.parentNode.insertBefore(placeholder, targetNode.nextElementSibling);
}

function ensureFocusColumn(focus){
  $("#"+focus).closest(".children").addClass("focus");//拖拽后保证focus,以免新旧卡片尺寸不一致
}


module.exports={
  scroll2card,
  drag,drop,dragEnd,
  dragover,
  ensureFocusColumn
}