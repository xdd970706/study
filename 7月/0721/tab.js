//btn表示的是按钮  ele表示的是元素--->内容 color 表示是颜色值--->按钮的背景颜色 类型 string
function tab(btn, ele, color){
	//遍历绑定事件
	for(var i=0; i<btn.length; i++){
		//自定义属性
		btn[i].index = i;
		btn[i].onclick = function(){
			//排他思想
			for(var j=0; j<btn.length; j++){
				btn[j].className = "";
				ele[j].style.display = "none";
			}
			//留下它自己
			this.className = color;
			//点击那个按钮让对应的div显示
			//     0 1 2 3 4
			ele[this.index].style.display = "block";
		}
	}
}