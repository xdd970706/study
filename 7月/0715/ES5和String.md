<h3 align="center">ES5和String</h3>
<hr/>
#### 一、<Span>ES5</span>严格模式

1)概念：除了正常运行模式，ECMAscript5添加了第二种运行模式：“严格模式”（strict mode）。顾名思义，这种模式是的Javascript在更严格的条件下运行。

严格:

<img src="img/jr.png" width="500" />



松散:

<img src="img/yd.jpg" width="700" height="200"/>



2)严格模式的作用：

a.消除了JS语法的一些不合理、不严谨之处，减少一些怪异行为；

b.消除代码运行的一些不安全之处，保证代码运行的安全；

c.提高编译器效率，增加运行速度；

d.为未来新版本的JS做好铺垫

注意点：同样的代码，在“严格模式”中，可能会有不一样的运行结果，一些在“正常模式”下可以正常运行的语句，在“严格模式”下将不能运行，掌握这些内容，有助于更细致深入的理解JS，让你编程一个更好的程序员。



#### 二、严格模式的调用

```js
1、如何进入严格模式？
进入严格模式的标志，书写这一行语句 "use strict"
老的浏览器会把他当成一串普通的字符串，加以忽略

2、“严格模式”有两种调用方式，适用于不同的场合；
针对整个脚本文件：将 "use strict" 放在脚本文件的第一行，则整个脚本文件都将以“严格模式”运行，
如果这行语句不在第一行，则无效，整个脚本以“正常模式”运行。
如果不同模式的代码文件合并成一个文件，这一点需要特别注意。

针对单个函数：将 "use strict" 放在函数的第一行，则整个函数以“严格模式”运行。

脚本文件的变通写法：因为第一种调用方式不利于文件合并，所以更好的做法是，借用第二种方法，将整个脚本文件放在一个立即执行的匿名函数中

```



#### 三、进入严格模式的变化

```js
进入严格模式之后，需要进行哪些行为变更：

1.全局变量声明时，必须加关键字(var)
正常模式：a = 10;    console.log(a)    //10
严格模式：a = 10;    console.log(a)    //a is not defined

2.this无法指向全局对象
正常模式：function fn(){ console.log(this) }        //window
严格模式：function fn(){ console.log(this) }        //undefined

3.函数内不允许出现重名参数
正常模式：function fn( a,b,b ){ console.log(a,b) }
fn(1,2,3)        //1,3
严格模式：function fn( a,b,b ){ }
//报错：Duplicate parameter name not allowed in this context    在此上下文中不允许出现重复的参数名

4.arguments对象
4.1 arguments对象不允许被动态改变
正常模式：
function fn(a){
    a=20;
    console.log(a);                //20
    console.log(arguments[0]);     //20
}
fn(10);

严格模式：
function fn(a){
    a=20;
    console.log(a);                //20
    console.log(arguments[0]);     //10
}
fn(10);

5、不允许使用arguments.callee


6.新增的保留字：implements，interface，let，package，private，protected，public，static，yield
```



ES5新增数组方法：

```
1、indexOf(data,start)接收两个参数：要查找的项和（可选的）表示查找起点位置的索引 

2、forEach() 循环  对数组进行遍历循环，对数组中的每一项运行给定函数。这个方法没有返回值

3、map(callback) ； 会遍历当前数组，然后调用参数中的方法，返回当前方法的返回值。
map可以改变当前循环的值，返回一个新的被改变过值之后的数组（map需return），一般用来处理需要修改某一个数组的值。

4、filter() 遍历和过滤。返回符合条件的元素的数组。filter需要在循环的时候判断一下是true还是false，是true才会返回这个元素。 
```







#### 四、字符串

##### 1、字符串的对象概念：

字符串就是一串字符，由双（单）引号括起来。字符串是 JavaScript 的一种基本的数据类型。字符串不能进行算术运算，只能进行“连接”运算。

JS中的任何数据类型都可以当作对象来看。所以string既是基本数据类型，又是对象。

##### 2、字符串的创建

```js
1, 直接使用字符串字面量去创建

   var str1 = “亲, 包邮哦!”;

   alert(typeof str1);

2, 通过new创建字符串对象, 通过new创建的都为object类型

   var str2 = new String(“hello world!”);

   alert(typeof str2);

3, 省略new, 这种方式创建的不是object类型, 而是string类型

   var str3 = String(“hello world”);  包装类

   alert(typeof str3);
```



##### 3、**字符串的属性和方法**

```js
1)length：获取字符串的长度。如：var len=strObj.length;

2)toLowerCase():将字符串中的字母转成全小写。如：strObj.toLowerCase();

3)toUpperCase():将字符串中的字母转成全大写。如：strObj.toUpperCase()；

4)charAt(index):返回指定下标位置的一个字符。如果没有找到，则返回空字符串； 参数是下标

```



```js

5)indexOf:返回一个字符串在原始字符串中的索引值(查找顺序从左往右查找)。如果没有找到，则返回-1；

例子：判断用户输入的邮箱地址是否有@符号
var email = prompt("请输入邮箱地址?");
    if(email.indexOf("@")==-1){
   		document.write("邮箱地址" +email+ "不合法");
    }else{
    	document.write("邮箱地址" +email+ "是合法的");
}
```



```js
6)lastIndexOf:在原始字符串中，从右往左查找。如果没有找到，则返回-1；

8)substring()：在原字符串，返回一个字符串；不取结束位置，不能给负值会转成0 

注点意：参数是下标 
```

```js
9)split():将一个字符串切割成若干段，返回一个数组。也就是说将一个字符串转成数组；括号里面可以给空字符串， 会把字符串切割成几份
var res = str.split("");

10)slice():提取字符串的片断，并在新的字符串中返回被提取的部分；不包括结束位置。给负值时，可以返回倒数第几个
var res = str.slice(0, 3);

11）trim()：移除字符串首尾空白；

12）concat()：连接两个或多个字符串，返回连接后的字符串

13)replace()	替换与正则表达式匹配的子串。

14)substr()	从起始索引号提取字符串中指定数目的字符。参数1表示起始位置  值我、2表示截取的项数

15）charAt() 方法可返回指定位置的字符。
```





练习：

```js
1、敏感字符的替换    

2、已知字符串 str = “I hate BeiJing!”,提取第3个字符到第5个字符

3、统计字符串的个数

```





#### 五、编码介绍

```
ASCII：American Standard Code for Information Interchange，美国信息交换标准代码。
```

<img src="img/asc.jpg"/>

[百度](https://baike.baidu.com/item/ASCII/309296?fr=aladdin)



```
Unicode（统一码、万国码、单一码）是计算机科学领域里的一项业界标准,包括字符集、编码方案等。Unicode 是为了解决传统的字符编码方案的局限而产生的，它为每种语言中的每个字符设定了统一并且唯一的二进制编码，以满足跨语言、跨平台进行文本转换、处理的要求。 Unicode目前普遍采用的是UCS-2,它用两个字节来编码一个字符。 如汉字”经”的编码是0x7ECF,注意字符码一般用十六进制来 表示，为了与十进制区分，十六进制以0x开头，0x7ECF转换成十进制 就是32463,UCS-2用两个字节来编码字符，两个字节就是16位二进制， 2的16次方等于65536,所以UCS-2最多能编码65536个字符。

GBK全称《汉字内码扩展规范》（GBK即“国标”、“扩展”汉语拼音的第一个字母，英文名称：Chinese Internal Code Specification）。

GBK 向下与GB2312编码兼容，向上支持 ISO 10646.1国际标准，是前者向后者过渡过程中的一个承上启下的产物。

UTF-8（8-bit Unicode Transformation Format）是一种针对Unicode的可变长度字符编码，又称万国码。 UTF-8用1到4个字节编码UNICODE字符。用在网页上可以同一页面显示中文简体繁体及其它语言（如英文，日文，韩文）。
```



知识补充：

回调函数：如果把函数的指针（地址）作为参数传递给另一个函数，当这个指针被用来调用其所指的函数时，我们就说这是回调函数。

