<h3 align="center">DOM</h3>
------

#### 一、节点的操作

父（parent）、子（child）和同胞（sibling）等术语用于描述这些关系。父节点拥有子节点。同级的子节点被称      为同胞（兄弟或姐妹）

```js
childNodes 获取当前元素节点的所有子节点

firstChild 获取当前元素节点的第一个子节点

lastChild 获取当前元素节点的最后一个子节点

previousSibling 获取当前节点的前一个同级节点 -(678不支持)

nextSibling 获取当前节点的后一个同级节点 -(678不支持)

以上五中方法都包含空白文本节点


firstElementChild   获取当前元素节点的第一个元素子节点

lastElementChild  获取当前元素节点的最后一个元素子节点

parentNode 获取当前节点的父元素

children 获取所有的子节点  不返回其他节点
```



#### 二、DOM尺寸和位置

DOM尺寸

```
box.style.width
box.style.height
只能获取到内联style属性的CSS样式中的宽和高，如果有，获取;如果没有，则返回空

box.clientWidth
box.clientHeight
返回了元素大小，但没有单位，默认单位是px，如果设置了其他的单位，比如100em之类，返回出来的结果还会转换为px像素（不含边框） width + padding值

box.scrollWidth
box.scrollHeight
获取滚动内容的元素大小（当元素出现滚动条时，此属性指全部滚动内容的宽高）返回了元素大小，默认单位是px。如果没有设置任何CSS的宽和高度，它会得到计算后的宽度和高度  整个内容的

box.offsetWidth
box.offsetHeight
返回了元素大小，默认单位是px。如果没有设置任何CSS的宽和高度，他会得到计算后的宽度和高度
包含盒模型中除margin以外的宽高（包含边框）最稳定，使用最频繁
```

getComputedStyle().样式名  方法用于获取指定元素的 CSS 样式。获取的样式是元素在浏览器中最终渲染效果的样式。

参数1表示元素， 不能设置引号。 参数2表示伪对象（一般设置为空）

语法：getComputedStyle(元素名称).属性；



currentStyle.样式名  只有IE浏览器支持，其他浏览器都不支持  如果当前元素没有设置样式，则返回它的默认属性



获取非行内样式（兼容问题）

```js
function getStyle(obj, name){
    if(window.getComputedStyle){
        //非IE浏览器
        return getComputedStyle(obj, null)[name];
    }else{
        //针对IE浏览器
        return obj.currentStyle[name];
    }
}
```

位置坐标

```js
box.clientLeft
box.clientTop    获取左边框和上边框的宽度

box.offsetLeft    需要定位参照
box.offsetTop     获取元素当前相对于offsetParent父元素的位置

```



#### 三、简单认识this对象

```
1、核心一句话 - 哪个对象调用函数，函数里面的this指向哪个对象。

2、浏览器解析器在调用函数时每次都会向函数内部传递一个隐含的参数，这个隐含的参数就是this,this指向的是一个对象，这个对象我们称之为函数执行的上下文对象。

3、根据函数的调用方式的不同，this会指向不同的对象，这也是this的存在的意义所在。

```

每个函数都有自己的执行环境，也叫执行上下文（Execution Context）
				
函数里面的this是谁？

- 函数调用圆括号时，函数的this是window对象

- 函数作为一个对象的方法，对象打点调用，函数的this就是这个对象

- 函数是事件处理函数时，函数的this就是触发这个this的对象

  ```js
  
  ```
  
  
  
- 定时器调用函数时，this是window对象

- 数组中存放的函数，被数组索引之后加圆括号调用，this就是这个数组