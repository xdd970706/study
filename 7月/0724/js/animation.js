//匀速动画
//参数1 ele元素
//参数2 num 数值
//参数3 target 目标值
var timer = null;
function animation1(ele, num, target){
	//先清除，再开启
	clearInterval(ele.timer);
	//开启定时器
	ele.timer = setInterval(function(){
		//获取开始位置
		var begin = ele.offsetLeft;
		//步长
		var step = num;
		//把结果保存
		var res = begin + step;
		//判断当到达目标位置时，清除定时器
		if(res >= target && num>0){
			res = target;
			clearInterval(ele.timer);
		}else if(res<=target && num<0){
			res = target;
			clearInterval(ele.timer);
		}
		//直接赋值
		ele.style.left = res + "px";
	}, 30)
}

function animation2(ele, target, attr, callback){
		//先清除，再开启
		clearInterval(ele.timer);
		//开启定时器
		ele.timer = setInterval(function(){
			//获取开始位置
			var begin = parseInt(getstyle(ele, attr));
			//步长 缓动动画公式: (目标位置 - 开始位置)/10
			var step = (target - begin)/10;
			step = step>0 ? Math.ceil(step) : Math.floor(step);
			//把结果保存
			var res = begin + step;
			//当值等于目标位置时，清除定时器
			 if(res == target){
				 clearInterval(ele.timer);
				 //如果你存在，我就调用你
				 if(callback){
					 callback();
				 }
				 //callback && callback();
			 } 
			//直接赋值
			ele.style[attr] = res + "px";
		}, 30)
	}
//获取属性
function getstyle(ele, attr){
	if(window.getComputedStyle){
		return getComputedStyle(ele, null)[attr];
	}else{
		return ele.currentStyle[attr];
	}
}