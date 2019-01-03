//import { template } from "handlebars";

/* 这是分类区域滚动的js样式 */
$(function () {
    /* 如果两个初始化一样可以只写一个 */
    mui('.mui-scroll-wrapper').scroll({
        indicators: false, //是否显示滚动条
        deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
    });
    /* 1.实现分类左侧的动态渲染
        2.拿到数据进行动态渲染
        3.使用模板引擎来渲染左侧分类菜单
    */ 
   //使用zepto的$.ajax发送请求
   //因为get和post的写法和jq不一样所以建议都使用$.ajax来写
   $.ajax({
        //type:"get"  默认是get 如果是get请求可以省略
        url:'/category/queryTopCategory',
        //dataType:'json'//默认也是 把json转成JS对象 所以也可以省略
        success:function(data){ //ajax回调函数 接收返回数据 不能省略
            //console.log(data);
            //调用模板引擎函数 传入模板id和 对象的数据(data 已经是对象了直接传入 )
            var html = template('categoryLeftTpl',data);
            $('.category-left ul').html(html);
        }
   });
   
    /* 
    2.实现分类左侧的点击渲染右侧分类
        1.给所有左侧分类的li的a添加点击事件 不能直接添加 左侧异步动动态渲染的li 所以要使用事件委托的方式添加事件
        2.给当前点击li 的 a 分类id
        3.拿到分类id再请求二级分类的数据 并且把当前拿到id作为 请求参数传递
        4.拿到二级分类的数据 渲染右侧分类
        5.为了一开就显示默认id为1的右侧分类数据 所以 定义一个函数默认调用传入1 在事件里面调用传入点击的id
        6.给当前点击a的父元素添加active 其它兄弟删除active
    */
    //1.使用事件委托方式给左侧分类的ul里li的 a 添加事件 移动端使用tap 解决延迟的click事件
    $('.category-left ul').on('tap','li > a',function(){
        //console.log($(this).data('id')) // 拿到的数据会做数据转换 推荐使用
        //console.log(this.dataset['id'])   //拿到之后不会做数据转换 不推荐使用
        // 2.获取到了当前点击的a的分类的id
        var id = $(this).data('id');
        // 3.根据当前id请求二级分类的API数据 调用获取右侧分类的函数传入id
        querySecondCategory(id);
        // 4.给当前点击的a的父元素添加active 其它兄弟删除active siblings 兄弟元素 是a的父元素 li的所有兄弟
        $(this).parent().addClass('active').siblings().removeClass('active');
       
    })
    // 5.为了默认也去调用右侧分类的数据 并且显示第一个分类的数据 传入id 为1
    querySecondCategory(1);
    // 定义一个专门获取右侧分类数据的函数
    function querySecondCategory(id){
        $.ajax({
            url: '/category/querySecondCategory',
            data: {id:id}, // {参数名:参数值} 参数是id 参数的值  后面的id是变量id的值
            success: function(data){
                console.log(data);
                // 4.创建模板渲染数据
                var html = template('categoryRightTpl',data);
                // 5.把模板渲染到右侧分类的mui-row里面
                $('.category-right .mui-row').html(html);
            }
        });
    }
})