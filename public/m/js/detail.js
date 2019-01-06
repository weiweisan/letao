/* 这是处理商品详情的js页面 */
$(function () {

    /* 1.渲染页面详情
        1.根据当前的商品的id 去请求商品详情数据
        2.渲染商品详情页面 轮播图和商品信息都要渲染
        3.动态渲染就要考虑 动态渲染完毕再执行初始化代码
      */
    //1.获取url参数id的值
    var id = getQueryString('id');
    console.log(id);

    //2.调用ajax 传入id 请求数据
    $.ajax({
        url: '/product/queryProductDetail',
        data: {
            id: id
        },
        success: function (data) {
            console.log(data);
            //2.1动态渲染之前因为尺码不是一个数组 是一个类似于30-50的字符串
            //而我们需要的数据是一个类似于[30,31,32...50]的数组
            //2.2对这个字符串进行处理 
            // 做出的分析是取出字符串最小值 和最大值 取值的时候要进行字符串转换转成num类型 进行遍历 
            // 字符串截取 - 隔开成一个数组 然后取下标0
            var min = +data.size.split('-')[0];
            var max = +data.size.split('-')[1];
            console.log(min, max);
            // 2.4定义一个空数组 把循环的每一个值 包添加到数组中
            var size = [];
            //遍历
            for (var i = min; i <= max; i++) {
                /* push往数组中添加数据 */
                size.push(i);
            }
            // 2.5把数组赋值给数据对象 data的size属性
            data.size = size;
            console.log(data);

            //3.调用模板生成html
            var html = template('detailTpl', data);
            //4.渲染到页面
            $('#main .mui-scroll').html(html);
            // 5. 初始化轮播图
            var gallery = mui('.mui-slider');
            gallery.slider({
                interval: 1000 //自动轮播周期，若为0则不自动播放，默认为0；
            });
            // 6. 初始化区域滚动
            mui('.mui-scroll-wrapper').scroll({
                deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
            });
            // 7. 初始化数字框
            mui('.mui-numbox').numbox();
            // 8. 初始化尺码点击 让尺码能够点击切换 类名 为什么不需要委托 因为详情数据已经渲染完毕了可以直接使用
            $('.btn-size').on('tap', function () {
                $(this).addClass('mui-btn-warning').siblings().removeClass('mui-btn-warning');
            });
        }
    });

    /* 2.实现加入购物车功能
        1.点击加入购物车按钮实现加入购物车
        2.获取当前用户选择的尺码和数量
        3.如果没有选择尺码或者数量要提示用户选择
        4.把用户选择的尺码数量等作为参数调用加入购物车的API
        5.接收API返回值是成功还是失败 如果是成功表示加入成功去购物车查看
        6.如果失败表示未登陆 跳转到登陆页面让用户去登陆
      */   
    //1.点击加入购物车按钮实现加入购物车
    $('.btn-add-cart').on('tap',function(){
        //2.获取url参数值的函数
        
        var size = $('.btn-size.mui-btn-warning').data('size');
        console.log(size);

        //3.如果没有选择尺码 或者数量要提示用户选择
        if(!size){
            mui.toast('请选择尺码!',{ duration:1000, type:'div' });
            return false; 
        }
        //这是mui自带的取数量的方法 直接去文档中复制就行了
        var num = mui('.mui-numbox').numbox().getValue();
        console.log(num);
        //如果没有选择数量 提示用户选择
        if(!num){
            mui.toast('请选择数量!',{ duration:1000, type:'div' });
            return false; 
        }

        //4.把用户选择器的尺码数量等作为参数调用加入购车API
        $.ajax({
            url: '/cart/addCart',
            type: 'post',//因为提交数据 提交数据都是post请求 一定要写类型为post
            data: {
                productId:id,
                size:size,
                num:num
            },
            success:function(data){
                console.log(data);
                //5.判断后台返回的数据是否成功 如果成功就提示用户去购车查看 如果失败表示未登录 跳转到登陆页面
                if(data.success){
                    // 6.到了这里表示添加成功
                }else{
                    //7.不是成功就都是失败 跳转到登陆页面 注意在商品详情页面 
                    //跳转到登陆的时候把商品详情页面的url带过去 通过 url参数 值是当前页面的url
                    location = 'login.html?returnUrl='+location.href;
                }
            }
        })
    });


    // 获取url参数值的函数
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        // console.log(r); 
        if (r != null) return decodeURI(r[2]);
        return null;
    }
})