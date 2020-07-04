$(function (){
//根据屏幕大小来决定轮播图的背景设置方式
 function resize(){
//获取屏幕的宽度
    var windowWidth = $(window).width();
//判断屏幕大小属于pc端还是移动端
//根据大小来设置轮播图的的尺寸
var isSmallScreen = windowWidth < 768;
//获取到的是DOM数组对象
$('#main-ad > .carousel-inner > .item').each(function(i,item){
    var $item = $(item);//因为DOM对象需要转化
    //$element.data()函数用于取DOM对象上自定义属性(例如属性设置为:data-abc)
    //那么函数的参数为(abc),函数的返回值为该属性对应的属性值
    var imgSrc = $item.data(isSmallScreen? 'image-xl':'image-lg')
   //设置背景图片
    $item.css('backgroundImage','url("' + imgSrc + '")');


    //因为小图时需要进行等比缩放，所以使用img标签的方式来展示图片
    if(isSmallScreen){
        $item.html('<img src = "'+ imgSrc +'" alt="" />');
    }else{
        $item.empty();
    }
})
}
//让window在一开始就触发一下resize()函数
//链式相当于在下一行添加$(window).trigger('resize');
$(window).on('resize',resize).trigger('resize');
$('[data-toggle="tooltip"]').tooltip()

var ulwarrp = $(".ul-warrp");
var lists = $(".nav-tabs li");
var listWidth = 0;
lists.each(function (index , element) {
    console.log(element.clientWidth);
    listWidth += element.clientWidth;
  })
  if($(window).width() <= 767){
      ulwarrp.css('width',listWidth+20);
      ulwarrp.css('overflow-x','scroll');
  }

//   给新闻图标添加点击事件来更换新闻标题
var titleDiv = $("#news .news-title p");
$("#news .news-icon a").on('click',function(){
    //获取当前点击元素对象
    var $This = $(this);
    //获取当前元素对象的title值
    var title = $This.data("title");
    //将对应的title值传给标题栏
    titleDiv.html(title);
})
});