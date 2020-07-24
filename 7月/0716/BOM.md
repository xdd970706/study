<h2 align="center">BOM</h2>
#### 一、BOM介绍：

1、BOM（ Browser Object Model）---> 浏览器对象模型。

2、BOM 作用：主要提供了访问和操作浏览器各组件的方式。

![](C:\Users\Mac\Desktop\lesson\二阶段\JavaScript课程\day9\img\bom.png)

window浏览器窗口对象是js中最大的对象。其他所有的对象，都是window的子对象

document文档对象，代表一个网页

location地址栏对象，对地址栏的操作一些方法

navigatior浏览器软件对象，主要用来判断用户用的是什么浏览器，可以解决兼容性问题

screen屏幕对象，可以获取屏幕相关的信息

history历史记录对象，可以对浏览器的历史记录进行相关的操作

```
注意点：

1、window是全局浏览器内置顶级对象 表示浏览器中打开的窗口（没有应用于window对象的公开标准，不过所有浏览器都支持该对象）Window 对象表示一个浏览器窗口或一个框架。

2、在客户端 JavaScript 中，Window 对象是全局对象，所有的表达式都在当前的环境中计算。也就是说，要引用当前窗口根本不需要特殊的语法，可以把那个窗口的属性作为全局变量来使用。

例如，可以只写 document，而不必写 window.document。

同样，可以把当前窗口对象的方法当作函数来使用，如只写 alert()，而不必写 Window.alert()。

除了上面列出的属性和方法，Window 对象还实现了核心 JavaScript 所定义的所有全局属性和方法。
```



#### 二、window对象常用的方法

```js
1.prompt() 显示可提示用户输入的对话框

2.alert() 显示一个带有提示信息和一个“确定”按钮的警示对话框

3.confirm() 显示一个带有提示信息、“确定”和“取消”按钮的对话框

4.close() 关闭浏览器窗口   close()方法用于关闭浏览器窗口，语法：window.close（）;

5.定时器

a、间隔定时器setInterval（开启）  clearInterval（关闭）

b、超时定时器setTimeout（开启）   clearTimeout（关闭）   
          
6. open()方法   功能：打开一个新的浏览器窗口

```



#### 三、location地址栏对象

```js
1、hostname 设置或返回当前URL的主机名

2、href：获取地址栏中完整的地址。可以实现JS的网页跳转。location.href = “http://www.sina.com.cn”;

3、pathname：文件路径及文件名

4、protocol：协议，如：http://、ftp://

5、hash：锚点名称。如：#top

6、reload([true])：刷新网页。true参数表示强制刷新  

a、是网页浏览后，一般会在du本地留下缓存，普通刷新的话，浏览器会优先获取缓存里的资源代替从服务器上请求，以提高访问速度。

b、强制刷新就是告诉浏览器不要获取缓存，重新从服务器请求网页上的所有资源，适用于开发测试或者某些资源更新。

7、注意：所有的属性，重新赋值后，网页将自动刷新。

<meta  http-equiv = “refresh”  content = “5;url=http://www.sina.com.cn” />
```



#### 四、navigator对象

```
1、appName：浏览器软件名称   appCodeName

2、appVersion：浏览器软件的核心版本号。

3、platform：平台

4、userAgent浏览器版本信息
```

[浏览器历史](https://zhidao.baidu.com/question/1767408752449075980.html)



#### 五、history对象

```
1、back（）  后退

2、forward（） 前进

3、go（） 

4、history.back（）===  history.go（-1） 浏览器中的  后退

5、history.forward() === history.go  ( 1 )   浏览器中的  前进 

```



#### 六、screen屏幕对象

```js
1、Width：浏览器屏幕的宽度，只读属性。  window.screen.width 

2、Height：浏览器屏幕的高度，只读属性。 window.screen.height

3、availWidth：屏幕的有效宽度，不含任务栏。只读属性。

4、availHeight：屏幕的有效高度，不含任务栏。只读属性。
```



#### 七、window对象事件

```
1、window.onload 当网页加载完成，指<body>标记的所有内容全部加载完成，才触发该事件(条件)

2、为窗口添加滚动条事件

onscroll 滚动事件

 scrolltop 垂直滚动条滚动的距离
 scrollleft 水平滚动条滚动的距离
 
 window.innerHeight - 浏览器窗口的可见高度 
 window.innerWidth - 浏览器窗口的可见宽度 

兼容写法：var scrolltop = document.documentElement.scrollTop||document.body.scrollTop; 

3、window.onresize 事件会在窗口或框架被调整大小时发生
```


