var cardImage=require('./handcard');

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

function dragWithCustomImage(event) {
  var canvas = document.createElement("canvas");
  canvas.width = canvas.height = 50;

  var ctx = canvas.getContext("2d");
  ctx.lineWidth = 4;
  ctx.moveTo(0, 10);
  ctx.lineTo(50, 50);
  ctx.moveTo(0, 50);
  ctx.lineTo(50, 0);
  ctx.stroke();

  var dt = event.dataTransfer;
  dt.setData('text/plain', 'Data to Drag');
  dt.setDragImage(cardImage, 100, 50);
}
function drag(ev){
  dragWithCustomImage(ev)
  console.log('drag',ev)
}

module.exports={
  scroll2card,
  drag,
  dragWithCustomImage
}