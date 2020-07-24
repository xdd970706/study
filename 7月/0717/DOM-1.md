<h3 align="center">DOM</h3>
------

#### 一、DOM对象介绍

1、DOM Document Object Model ，文档对象模型。我们可以把网页中的所有“东西”看成是“对象”。

2、DOM是W3C制定的网页标准或规则，而这个标准，在浏览器中，以“对象”的形式得以实现。

3、DOM的官方定义：DOM可以使脚本，动态的访问或操作，网页的内容、网页外观、网页结构。





#### 二、DOM的分类

1、核心DOM：提供了同时操作HTML文档和XML文档的公共的属性和方法。

2、HTML DOM：针对HTML文档提供的专用的属性方法。

3、XML DOM：针对XML文档提供的专用的属性和方法。(了解)

4、CSS DOM：提供了操作CSS的属性和方法。

5、Event DOM：事件对象模型。如：onclick、 onload等。（讲事件时再说）

![](C:\Users\Mac\Desktop\lesson\二阶段\JavaScript课程\day9\img\dom.png)





#### 四、核心DOM的操作

1、认识DOM中元素节点类型：

```
document文档节点，代表整个网页，不代表任何HTML标记。但它是html节点的父节点

element元素节点，指任何HTML标记。每一个HTML标记就称一个“元素节点”。它可以有文本节点和属性节点

attribute属性节点。指HTML标记的属性

text节点。是节点树的最底节点
```



2、DOM中访问节点

```
firstChild：第1个子节点

lastChild：最后1个子节点

childNodes：子节点列表，是一个数组  childNodes[0]

parentNode：父节点

nodeName：节点名称  返回标签名

nodeValue 属性节点的的属性值

nodeType 节点类型，返回值是数字  

如果节点是元素节点，则 nodeType 属性将返回 1。如果节点是属性节点，则 nodeType 属性将返回 2。返回3是文本节点。如果是注释节点，返回8



查找<html>标记的方法

document.documentElement

查找<body>标记的方法

document.body

```

3、对节点的属性操作

```
setAttribute(name,value)：给某个节点添加一个属性

getAttributeNode(name)：获取某个节点属性的值

removeAttribute(name)：删除某个节点的属性
```



4、创建节点

```
document.createElement(tagName)：创建一个指定的HTML标记，一个节点

tagName：是指不带尖括号的HTML标记名称  

举例：var imgObj = document.createElement(“img”)


parentNode.appendChild(childNode)：将创建的节点，追加到某个父节点下。

parentNode代表父节点，父节点必须存在。

childNode代表子节点。

举例：document.body.appendChild(imgObj)

box.insertBefore() 方法可在已有的子节点前插入一个新的子节点 先放要排在前面的元素， 再写其他元素

参数1表示新建的节点  参数2表示你要插入的那个节点之前
```



5、删除节点

```
parentNode.removeChild(childNode)：删除某个父节点下的子节点。

parentNode代表父节点。

childNode代表要删除的子节点。

举例：document.body.removeChild(imgObj)

remove()直接删除当前项
```



#### 五、HTML DOM的操作

核心DOM中，提供的属性和方法，已经可以操作网页了。为什么还要有HTMLDOM呢？

如果在核心DOM中，网页中节点层级很深时，访问这个节点时将十分麻烦。

那么，HTMLDOM中就提供了通过id直接找节点的方法，而不用再HTML根节点开始。

```
1、getElementById()

功能：查找网页中指定id的元素对象。

语法：var obj = document.getElementById(id)



2、getElementsByTagName(tagName)

功能：查找指定的HTML标记，返回一个数组

语法：var arrObj = parentNode.getElementsByTagName(tagName)

参数：tagName是要查找的标记名称，不带尖括号。

返回值：返回一个数组。如果只有一个节点，也返回一个数组。


3、 getElementsByName("Name")

功能：通过name值获取元素，返回值是数组，通常用来获取有name的input的值

4.getElementsByClassName()  

功能：通过class名获取元素，返回值是数组

ES5新增选择器：

5.document.querySelectorAll();    //强大到超乎想象，支持IE8+。ECMAScript借鉴了jQuery选择器的

6.document.querySelector();  返回单个元素
```



#### 六、元素属性的对象：

 a、在HTML中叫“标记”  b、 在DOM中叫“节点”    c、在JS中叫“对象”

```js
tagName：标签名称，与核心DOM中nodeName一样

className：CSS类的样式

id：同HTML标记id属性一样

title：同HTML标记的title属性一样

style：同HTML标记的style属性一样

innerHTML：包含HTML标记中的所有的内容，包括HTML标记等
```



#### 七、CSS DOM动态样式

```js
使用JS操作CSS中的各种属性。JS只能操作或修改行内样式，对于类样式，通过className来赋值。

如：imgObj.className=”imgClass”;

1、style对象

每个HTML标记，都有一个style属性。但这个style属性又是一个style对象。  

那么，这个style对象属性有哪些？style对象的属性，与CSS中的属性，一一对应。

因此，style对象用来代替CSS。

如：imgObj.style.border=”1px solid red”;

2、style对象属性与CSS属性的转换

(1)、如果是一个单词，style对象属性，与CSS属性一样。

(2)、如果是多个单词，第一个单词全小写，后面每个单词首字母大写，并去掉中划线。
```

1.表格添加信息



2.网页换肤



3.tab切换案例



4.点击按钮换图片

