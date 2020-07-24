<h3 align="center">Math和Date</h3>

<hr/>

#### 一、什么是对象(Object)

```php+HTML
我们知道之前学习数据类型时，提过对象，说它是引用（复合）数据类型，什么数组，函数都是引用数据类型，它们的最显著特点就是一个变量名可以存多个值。当然对象也是可以存多个值，和数组函数类似的一种东西。

人就是一个”对象”,人的特征（属性）有：身高、体重、姓名、性别、年龄。每个人可以有不同的本事(方法)：打游戏、玩打飞机、炒股、开车等都是方法。你们现在只要理解对象是由”属性”和”方法”构成的就行。其实我们学习对象也就是学习它的属性和方法。

JS中对象分类：

JS内置对象：数组对象、日期对象、字符串对象。。。。。等。

BOM对象，浏览器各组件对象，包括：window、document、location、history。。。。

DOM对象，文档对象，包括：所有的HTML标记，每一个HTML标记都是一个对象。

自定义对象，根据自己的项目需要，要自己定义自己的对象。

```

##### 1、对象的创建

```js
var obj = {}  //字面量形式

var obj = new Object(); //构造函数形式

```



##### 2、内置对象Math

```js
Math数学对象

Math对象是一个静态对象，换句话说：在使用Math对象，不需要创建实例。

1、Math.PI：圆周率  Math.PI

2、Math.abs():绝对值。如：Math.abs(-9)=9;

3、Math.ceil():向上取整(整数加1，小数去掉)。如：Math.ceil(10.2)=11;

不管小数大小，都要给整数加1.

4、Math.floor():向下取整(直接去掉小数)。如：Math.floor(9.888)=9;

不管小数大小，直接去掉小数部分。

5、Math.round():四舍五入。如：Math.round(4.5)=5; Math.round(4.1)=4;

6、Math.pow():求x的y次方。如：Math.pow(2,3)=8;

7、Math.sqrt():求平方根。如：Math.sqrt(121)=11;

8、Math.random():返回一个0到1之间的随机小数。如：Math.random();

```

补充：toFixed() 方法可把 Number 四舍五入为指定小数位数的数字。



实例：求直角三角形斜边长

```js
function getLong(a, b){
    //定义斜边长的变量
    var c = Math.pow(a, 2) + Math.pow(b, 2);
    //开平方
    c = Math.sqrt(c);
    //输出结果
    console.log(c);
}
getLong(3, 4);
```



实例：网页随机背景

```js
//实例：网页随机背景色
var min = 100000;
var max = 999999;
var random = Math.random()*(max-min)+min;
//向下取整
random = Math.floor(random);
document.body.bgColor = "#"+random ;
```





##### 3、内置日期对象Date  

日期对象类型使用自 UTC（Coordinated Universal Time，国际协调时间）1970 年 1 月 1 日午夜（零时）开始经过的毫秒数来保存日期。Date 类型保存的日期能够精确到 1970 年 1 月 1 日或之后的 285616 年。

```js
创建一个日期对象
var d = new Date();

从日期对象获取信息
console.log(d.getFullYear());    //获取年
console.log(d.getMonth());       //获取月，注意月份是从0开始
console.log(d.getDate());        //获取日
console.log(d.getDay());         //获取周

console.log(d.getHours());       //获取小时
console.log(d.getMinutes());     //获取分钟
console.log(d.getSeconds());     //获取秒数
console.log(d.getMilliseconds());//获取毫秒

时间戳
console.log(d.getTime());        //获取从1970年1月1日至今的毫秒

console.log(d)                   //返回本地时间，包含年月日星期时分秒

设置日期：
1.粗野模式，简单粗暴，但是会清零时分秒
var d = new Date("2008/8/8");

2.复杂模式
var d = new Date();
d.setFullYear(2009);    //设置年
d.setMonth(6);          //设置月，超过11，累加年
d.setDate(27);          //设置日，超过最大日期，累加月

d.setHours(40);         //设置小时，超过24，累加天
d.setMinutes(40);       //设置分钟，超过60，累加小时
d.setSeconds(40);       //设置秒，超过60，累加分钟
d.setMilliseconds(40);  //设置毫秒，超过1000，累加秒

d.setTime(10000)        //设置从1970年1月1日过去了多少毫秒

console.log(d)          //返回更改后的年月日 时分秒

注意set系列的返回值
console.log(d.setFullYear(2009));
//返回从1970年1月1日，到当前设置的时间的毫秒数

```

##### 4、定时器 - 延时器

```js
延时器方法—setTimout()

功能：设置一个延时器，换句话说：时间一到，就执行JS代码一次。

语法：var timer=window.setTimeout(code,millisec)

参数：

code：是任何合法的JS代码，一般情况下是JS函数，该函数要放在引号中。

举例：window.setTimeout(“close()”,2000);

举例：window.setTimeout(init,2000);//传函数地址，因此不需要加括号。如果加括号，是将函数的执行结果传到方法中。

millisec:毫秒值。1秒=1000毫秒。

返回值：返回一个延时器的id变量，这个id变量给clearTimeout()用来清除。

clearTimeout()

功能：清除延时器id变量。

语法：window.clearTimeout(timer)

参数：timer就是由setTimeout()设置的延时器的id变量。

```

##### 5、定时器

```js
setIerval()

功能：设置一个定时器。定时器，重复不断的执行JS代码(周期性)。

语法：var timer=window.setIerval(code,millisec)

参数：

code：是任何合法的JS代码，一般情况下是JS函数，该函数要放在引号中。

举例：window.setIerval(“close()”,2000);

举例：window.setIerval(init,2000);//传函数地址，因此不需要加括号。如果加括号，是将函数的执行结果传到方法中。

millisec:毫秒值。1秒=1000毫秒。

返回值：返回一个延时器的id变量，这个id变量给clearIerval()用来清除。

clearIerval()

功能：清除延时器id变量。

语法：window.clearIerval(timer)

参数：timer就是由setIerval()设置的延时器的id变量。

```

练习：

1、秒杀活动倒计时

2、图片自动切换

```

```



