var cardImage=require('./handcard');
if(!window.$){
  console.warn("need jQuery");
}
function scroll2card(id){
  if(!window.$)return;
  var card=$("#"+id);
  if(!card)return;
  var cardX=card.offset().left;
  var cardY=card.offset().top;
  var newPos={scrollLeft:cardX-200};
  if(cardY>(window.scrollY+window.innerHeight/2)){
    //如果卡片位置在屏幕的下半部分以下。则移动到屏幕上部
    newPos.scrollTop=cardY-20;
  }
  $('html,body').animate(newPos, 800); //只改变横坐标
}

function drag(ev){
  var moveButton=ev.target;
  var menu=moveButton.parentElement;
  var main=menu.parentElement;
  var node=main.parentElement;
  console.log("node",node)
  var dt = ev.dataTransfer;
  dt.setData('text/plain',node.id);
  dt.setDragImage(cardImage, 100, 50);
  dt.effectAllowed = "move";
}

function drop(ev){
  ev.preventDefault();
  var sourceID = ev.dataTransfer.getData("text/plain");
  var targetNode=$( ev.target ).closest(".node").get(0);
  console.log("targetNode",targetNode);
  if(sourceID==targetNode.id){
    return;//相同元素不移动
  }
  var sourceNode=document.getElementById(sourceID);
  $(sourceNode).removeClass('focus');//避免宽元素放到窄列中
  targetNode.parentElement.insertBefore(sourceNode,targetNode.nextElementSibling);
}
function allowDrop(ev) {
    ev.preventDefault();
}
function dragover(ev){
  allowDrop(ev);
}

module.exports={
  scroll2card,
  drag,drop,
  dragover
}