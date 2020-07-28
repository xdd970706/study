var tools = {
	/* 查找DOM元素
	 * @param selector <string> 选择器
	 * @param [isAll] <boolean> 是否查询所有，默认为false
	 * @param [parent] <DOMObject> 父级对象，默认为document
	 * @return  DOMObject  || NodeList
	 */
	 $: function (selector, isAll, parent) {
		// 判断是否传了父级对象
		parent = parent || document;
		if(isAll){
			// isAll如果为true就返回所有
			return parent.querySelectorAll(selector);
		}
		return parent.querySelector(selector);
	},
	
	/* 获取元素的某一条样式
	 * @param obj <DOMObject>  要获取样式的元素
	 * @param attr <string>    样式名
	 * @return <string>  样式值
	 */
	getStyle: function (obj, attr) {
		if(obj.currentStyle) {
			// IE兼容
			return obj.currentStyle[attr];
			
		}else{
			return getComputedStyle(obj, false)[attr];
		}
	},
	
	/* 给元素设置样式（一次性设置多条样式）
	 * @param obj <DOMObject> 设置样式的对象
	 * @param attrJson <object> 要设置的所有属性构建出来的对象，如： {width:"200px","left":"100px"}	 
	 */
	setStyle: function (obj, attrJson) {
		for(var key in attrJson) {
			obj.style[key] = attrJson[key];
		}
	},
	
	/* 计算元素距离浏览器边缘的偏移
	 * @param obj <DOMObject> 要计算的那个元素
	 * @return  {left, top}
	 */
	getBodyDis: function (obj) {
		var left = 0, top = 0;
		while(obj.offsetParent !== null){
			// 加上offsetParent的边框
			left += obj.offsetLeft + obj.offsetParent.clientLeft;
			top += obj.offsetTop + obj.offsetParent.clientTop;
			// 往前走一步
			// 把自己变成父亲
			obj = obj.offsetParent;
		}
		return {
			"left" : left,
			"top" : top
		};
	},
	
	/* 得到可视区窗口的大小
	 * @return {width, height}
	 */
	getBodySize: function () {
		return {
			width: document.documentElement.clientWidth || document.body.clientWidth,
			height: document.documentElement.clientHeight || document.body.clientHeight
		}
	},
	
	/* 添加事件监听
	 * @param obj <DOMObject> 监听事件得DOM对象
	 * @param type <string> 事件类型（不带on)
	 * @param fn <Function> 事件预处理函数
	 * @param [isCapture] <Boolean> 是否捕获，默认为false
	 */
	on: function (obj, type, fn, isCapture) {
		// isCapture如果没有传的话默认值为false
		isCapture = isCapture === undefined ? false : isCapture;
		if(obj.attachEvent){
			// IE
			obj.attachEvent('on'+type, fn);
		}else{
			obj.addEventListener(type, fn, isCapture);
		}
	},
	/* 移出事件监听
	 * @param obj <DOMObject> 监听事件得DOM对象
	 * @param type <string> 事件类型（不带on)
	 * @param fn <Function> 事件预处理函数
	 * @param [isCapture] <Boolean> 是否捕获，默认为false
	 */
	off: function (obj, type, fn, isCapture) {
		// isCapture如果没有传的话默认值为false
		isCapture = isCapture === undefined ? false : isCapture;
		if(obj.detachEvent){
			// IE
			obj.detachEvent('on'+type, fn);
		}else{
			obj.removeEventListener(type, fn, isCapture);
		}
	},
	
	/* 给元素写匀速运动动画
	 * @param obj  <DOMObject> 运动的元素
	 * @param attr <string>    运动的属性名称
	 * @param end  <number>    运动的终点
	 * @param time <number>    运动总时间
	 * @param fn <function>    运动结束之后的回调函数
	 */
	move: function (obj, attr, end, time, fn) {
		// 先清除上一次的timer
		clearInterval(obj.timer);
		// 获取起点值
		let start = parseInt(this.getStyle(obj, attr));
		// 计算总距离
		let distance = end - start;
		// 根据时间计算总步数, 为了避免超出终点值，向下取整
		let steps = Math.floor(time / 20);
		// 速度  px/步
		let speed = distance / steps;
		
		// 开始运动
		let n = 0; // 记录当前步数
		obj.timer = setInterval(function () {
			n++;
			obj.style[attr] = start + n*speed + "px";
			// 如果到达终点（步数走完）
			if(n === steps) {
				clearInterval(obj.timer);
				// 有可能距离终点还差0.几步
				obj.style[attr] = end + "px";
				// 执行回调
				fn && fn();
			}
		}, 20);
	},
	
	/* 给元素写缓冲运动动画
	 * @param obj  <DOMObject> 运动的元素
	 * @param attr <string>    运动的属性名称
	 * @param end  <number>    运动的终点
	 * @param fn   <function>  运动结束之后的回调函数
	 */
	move2: function (obj, attr, end, fn) {
		let start = parseInt(this.getStyle(obj, attr));
		clearInterval(obj.timer);
		
		obj.timer = setInterval(function () {
			// 剩下距离 = 终点值 - 当前位置
			let distance = end - start;
			// 计算速度，每一步的速度都是剩下距离的1/10
			// 速度在最后几步最后都要变成1px，但是正负方向不一样
			let speed = distance > 0 ?  Math.ceil(distance/10) : Math.floor(distance/10);
			// 往前移动一步
			start += speed;
			
			obj.style[attr] = start + "px";
			
			// 判断终点
			if(start === end) {
				clearInterval(obj.timer);
				fn && fn();
			}
			
			
			
		}, 20);
		
	},
	
	/* 让元素在浏览器范围内绝对居中
	 * @param  obj <DOMObject> 要居中的元素
	 */
	showCenter: function (obj) {
		// 可以动态计算left和top， window.onresize的时候重新计算
		this.setStyle(obj, {
			display: "block",
			position: "absolute"
		})
		/* const center = () => {
			this.getBodySize()
		} */
		let _this = this;
		window.onresize = (function center () {
			
			let left = (_this.getBodySize().width - obj.offsetWidth) / 2 + "px",
				top = (_this.getBodySize().height - obj.offsetHeight) / 2 + "px";
			
			// 解构赋值
			_this.setStyle(obj, {left, top});
			return center;
		})();
		
		
		// css控制
		/* this.setStyle(obj, {
			display: "block",
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			margin: "auto",
			position: "absolute"
		}); */
	},

	/* 存cookie的方法
	 * @param key <string> 存cookie的名称
	 * @param value <string> cookie的值
	 * @param options <object> { expires, path }  expires:Number 代表过期天数
	
	*/
	setCookie: function (key, value, options) {
		// 默认的cookie名称和值
		var str = key+"="+encodeURIComponent(value);
		// 判断是否有参数
		if(options) {
			// 参数里是否有path
			if(options.path) str += ";path="+options.path;
			// 参数是否有过期时间
			if(options.expires) {
				let d = new Date();
				d.setDate(d.getDate()+options.expires);
				// 继续拼接expires
				str += ";expires="+d;
			}
		}
		document.cookie = str;
	},

	/*
	 * @param key <string> 要取得cookie的名称
	 * @return <string> 
	 */
	getCookie: function (key) {
		// 先把所有cookie取出来
		var str = document.cookie;
		var arr = str.split("; ");
		var obj = {};
		arr.forEach(function (item) {
			// 遍历每一条cookie，按照等号切割
			var itemArr = item.split("=");
			// 第0个元素是key，第1个事value，再解密
			obj[itemArr[0]] = decodeURIComponent(itemArr[1])
		})

		return obj[key];


	},

	/*
	 * 删除cookie
	 * @param key <string> 要删除的cookie的名称
	 * @param [path] <string> 原来存的这个cookie的路径
	*/ 
	removeCookie: function (key, path) {
		// 把cookie的值设置为任意值,过期时间设置为昨天（已经过期）
		var d = new Date();
		d.setDate(d.getDate()-1);
		var str = key+"=111l;expires="+d;
		if(path) str += ";path="+path;
		console.log(str);
		document.cookie = str;
	},

	/* 
	 * ajax get请求
	 * @param url <string> 请求的地址
	 * @param query <object> 请求携带的参数
	 * @param callback <function> 回调函数，数据接收到以后要做的事情
	 * @param isJson <Boolean>  返回的值是否需要解析成json， 默认为true
	 *  */
	ajaxGet: function (url, query, callback, isJson) {
		// 如果没有传入isJson，那么默认值为true
		isJson = isJson === undefined ? true : isJson;
		if(query) {
			// 如果有请求参数，就再url后面拼接参数
			url += "?";
			for(var key in query) {
				url += key + "=" + query[key] + "&";
			}
			// url结尾多出一个 & 
			url = url.slice(0, -1);
		}

		// 1、创建核心对象
		var xhr = new XMLHttpRequest();
		// 2、打开连接
		xhr.open("GET", url);
		// 3、 发送请求
		xhr.send();
		// 4、监听状态改变
		xhr.onreadystatechange = function () {
			if(xhr.readyState === 4) {
				if(xhr.status === 200) {
					// 请求成功
					// 如果isJson为true， 那就解析一下
					var resp = isJson ? JSON.parse(xhr.responseText) : xhr.responseText;
					callback && callback(resp);
				}
			}
		}
	},

	/*
	* ajax post请求方法
	* @param url <string> 请求地址
	* @param rData <object> 请求数据
	* @param callback <function> 回调函数
	* @param [isJson] 是否需要转换为json数据 默认true
	*/ 

	ajaxPost: function (url,rData,callback,isJson) {

		//判断是否有请求数据，如果有拼接成一个字符串
		var str='';
		if(rData){
			//声明一个变量来接收请求数据
			
			for(var key in rData){
				str += key +'='+rData[key]+'&';
			}
			str=str.slice(0,-1);
		}
		//判断是否需要转json
		isJson = isJson===undefined? true : isJson;

		//创建核心对象
		var xhr = new XMLHttpRequest();
		//发送链接
		xhr.open('POST',url);
		xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		//发送请求数据
		xhr.send(str);
		//监听状态改变 
		xhr.onreadystatechange = function () {
			if(xhr.readyState===4 && xhr.status===200){
				var res = isJson? JSON.parse(xhr.responseText):xhr.responseText;
				callback && callback(res);
			}
			
		}
	},
	
	/* jsonp跨域请求
	 * @param url <string> 请求地址
	 * @param cb <string> 回调函数名称（必须是全局函数）
	 * @param rData <object> 请求数据
	 */
	getJsonp: function (url, cb, rData) {
		// 把回调和其他参数拼接给url
		url += "?cb="+cb;
		if(rData) {
			for(var key in rData) {
				url += "&"+ key + "=" + rData[key];
			}
		}
		
		var script = document.createElement("script");
		script.src = url;
		// 只要页面上有这个script请求就发出去了，所以马上就可以删掉
		document.body.appendChild(script);
		// 过河拆桥
		document.body.removeChild(script);
	},
	/* 
	 * ajax get请求通过promise封装
	 * @param url <string> 请求的地址
	 * @param query <object> 请求携带的参数
	 * @param isJson <Boolean>  返回的值是否需要解析成json， 默认为true
	 *  */
	fetch: function (url, query, isJson=true) {
		if(query) {
			url += "?";
			for(let key in query) {
				url += key + "=" + query[key] + "&";
			}
			url = url.slice(0, -1);
		}
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.open("get", url);
			xhr.send();
			xhr.onreadystatechange = () => {
				if(xhr.readyState === 4) {
					if(xhr.status === 200) {
						resolve(isJson ? JSON.parse(xhr.responseText) : xhr.responseText);
					}else {
						reject();
					}
				}
			}
		})
	}

}



