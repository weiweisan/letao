$(function () {


    /* 1. 渲染商品详情
        1. 根据当前的商品id 去 请求商品详情数据
        2. 渲染商品详情页面 轮播图和商品信息都要渲染
        3. 动态渲染就要考虑 动态渲染完毕再执行初始化代码
     */
    // 1. 获取url参数id的值
    var id = getQueryString('id');
    console.log(id);
    // 2. 调用ajax 传人id请求数据
    $.ajax({
        url: '/product/queryProductDetail',
        data: {
            id: id
        },
        success: function (data) {
            console.log(data)
            // 2.1 动态渲染之前因为尺码不是一个数组 是一个字符串40-50字符串 希望是一个[40,41,42,43..50]这样的数组
            // 2.2 取出字符中的最小值
            var min = +data.size.split('-')[0];
            var max = +data.size.split('-')[1];
            console.log(min, max);
            // 2.4 定义一个数组把循环的每一个值都添加到数组中
            var size = [];
            // 2.3 写一个循环从min开始到max结束
            for (var i =  min; i <= max; i++) {
                size.push(i);
            }
            // console.log(size);
            // 2.5 把数组赋值给数据对象 data的size属性
            data.size = size;
            console.log(data);
            // 3. 调用模板生成html
            var html = template('detailTpl', data);
            // 在这详情页面就已经渲染完毕了
            $('#main .mui-scroll').html(html);
            // 4. 动态渲染完成后要手动初始化插件

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
    // 8. 初始化尺码点击 让尺码能够点击切换 类名 如果放在渲染函数外面就要使用委托因为 事件代码比ajax快
    // $('#main').on('tap', '.btn-size', function () {
    //     $(this).addClass('mui-btn-warning').siblings().removeClass('mui-btn-warning');
    // });

    /* 2. 实现加入购物车功能
        1. 点击加入购物车按钮实现加入购物车
        2. 获取当前用户选择的尺码和数量
        3. 如果没有选择尺码或者数量要提示用户选择
        4. 把用户选择器的尺码数量等作为参数调用加入购物车APi
        5. 接收API返回值是成功还是失败 如果是成功表示加入成功去购物车查看
        6. 如果失败表示未登录 跳转到登录页面让用户去登录 */
    // 1. 点击加入购物车按钮实现加入购物车
    $('.btn-add-cart').on('tap',function (){
        // 2. 获取url参数值的函数
        var size = $('.btn-size.mui-btn-warning').data('size');
        console.log(size);
        // 3. 如果没有选择尺码或者数量要提示用户选择
        if(!size){
            mui.toast('请选择尺码!',{ duration:1000, type:'div' });
            return false; 
        }
        var num = mui('.mui-numbox').numbox().getValue();
        console.log(num);
        if(!num){
            mui.toast('请选择数量!',{ duration:1000, type:'div' });
            return false; 
        }
        // 4. 把用户选择器的尺码数量等作为参数调用加入购物车APi
        $.ajax({
            url: '/cart/addCart',
            type: 'post',//因为提交数据 提交数据都是post请求一定要写类型为post
            data: {productId:id,size:size,num:num},//productIdAPi的参数名 id自己参数的值 是一个变量存了当前url中id的值
            success: function (data){
                console.log(data);
                // 5. 判断后台返回的数据是否成功 如果成功就提示用户是否去购物车查看  如果失败表示未登录 跳转到登录页面
                if(data.success){
                    // 6. 表示添加成功
                }else{
                    // 7. 不是成功就都是失败 跳转到登录页面 注意在商品详情页面 
                    // 跳转到登录的时候吧当前商品详情页面的url带过去 通过url参数 值是当前页面的url
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