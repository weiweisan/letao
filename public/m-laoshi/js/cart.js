$(function () {
    /* 1. 实现购物车商品列表查询 
      1. 发送ajax请求购物车列表数据
      2. 创建模板渲染数据 */
    // 1. 调用公共的发请求的 和渲染购物车列表的函数
    queryCart();

    /* 2. 实现下拉刷新和上拉加载
        1. 写结构
        2. 调整样式
        3. 初始化
        4. 传人回调函数的参数  
        5. 在回调函数请求数据（下拉就刷新请求第一页 上拉加载更多请求下一页 追加）
        6. 数据请求渲染完后  结束下拉刷新效果
        7. 上拉数据没有的时候要提示没有数据了
        8. 重新下拉的时候重置上拉的效果 page也要重置 */
    // 1. 初始化
    mui.init({
        pullRefresh: {
            container: "#refreshContainer", //下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
            down: {
                // 指定下拉刷新的回调函数 为了解决嵌套深的问题把 函数放到外面写  把函数作为对象的值赋值callback
                callback: pullDownCallback
            },
            up: {
                callback: pullUpCallback
            }
        }
    });
    // 下拉刷新的回调函数
    function pullDownCallback() {
        // 1. 为了模拟延迟也设置一个定时器
        setTimeout(function () {
            // 2. 延迟后调用发送请求渲染列表的函数
            queryCart();
            console.log(mui('#refreshContainer').pullRefresh())
            // 3. 等刷新完成后调用下拉刷新结束方法结束下拉刷新(不然会一直转) 注意官网的结束代码函数少了ToRefresh
            mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
            // 4. 上拉加载的效果重置 重置函数必须写在结束下拉加载效果的后面
            mui('#refreshContainer').pullRefresh().refresh(true);
            // 5. 把全局变量page也重置为  让下一次上拉的时候从新从第一页的下一页开始请求
            page = 1;
        }, 2000);
    }
    // 1. 定义一个page = 1; 当前页码数
    page = 1;
    // 上拉加载更多的回调函数
    function pullUpCallback() {
        // 1. 为了模拟延迟也设置一个定时器
        setTimeout(function () {
            // 2. 上拉需要加载更多数据 每次要page++
            page++;
            // 3. 请求page++完后的数据（下一页）
            $.ajax({
                url: '/cart/queryCartPaging',
                data: {
                    page: page,
                    pageSize: 5
                }, // 传入请求的页码数和每页显示多少条
                success: function (data) {
                    console.log(data);
                    // 4. 判断如果返回数据不是对象是一个数组 就把数据包装一下包装在对象里面的data属性上
                    if (data instanceof Array) {
                        data = {
                            data: data
                        }
                    }
                    // 5. 判断返回数据的数组长度大于0 就是表示有数据 就渲染       
                    if (data.data.length > 0) {
                        // 6. 调用模板生成html
                        var html = template('cartlistTpl', data);
                        // 7. 把模板追加到页面的cartlist的ul里面 注意使用append
                        $('.cartlist').append(html);
                        // 8. 上拉加载数据完成后 结束上拉加载的效果 强调结束上拉加载更多 改成up
                        mui('#refreshContainer').pullRefresh().endPullupToRefresh();
                        // 上拉加载的时候也去计算总金额
                        getSum();
                    } else {
                        // 9. 没有数据了 传人一个true提示没有数据了
                        mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
                    }

                }
            });
        }, 2000);
    }

    /* 购物车的删除商品功能
        1. 点击删除按钮弹出一个确认框 问用户是否要删除
        2. 判断用户点击了是或者点击了否 
        3. 如果点击了是 调用删除APi删掉当前商品 
        4. 需要传人当前删除的商品id 在删除按钮上绑定当前要删掉的商品的id
        5. 删除完成后调用查询重新刷新页面 */
    // 1. 给删除按钮添加点击事件 动态添加的要使用委托
    $('.cartlist').on('tap', '.btn-delete', function () {
        // 7. 使用dom方式获取li 是当前a的父元素的父元素
        var li = this.parentNode.parentNode;
        // 使用zepto方式获取 [0]取里面的dom对象 注意不能是zepto对象 因为MUi的参数需要dom对象
        // var li = $(this).parent().parent();
        // 2. 获取当前要删除的id
        var id = $(this).data('id');
        // 3. 调用Mui确认框问用户是否删除当前元素
        var btnArray = ['确定', '取消'];
        mui.confirm('您真的要删除我吗 ？', '温馨提示', btnArray, function (e) {
            console.log(e);
            // 4. 判断用户点击了确定还是取消 e.index == 0表示是确定
            if (e.index == 0) {
                // 5. 点击了确定调用APi去删除购物车的商品 并且传人删除id
                $.ajax({
                    url: '/cart/deleteCart',
                    data: {
                        id: id
                    },
                    success: function (data) {
                        console.log(data);
                        // 6. 判断如果删除成功就刷新页面(调用查询)
                        if (data.success) {
                            queryCart();
                        }
                    }
                })
            } else {
                // 注意这个确认框里面会改变this指向 当前this已经不是a元素了
                // console.log(this);
                // var li = this.parentNode.parentNode;
                console.log('点击了取消');
                setTimeout(function () {
                    // 注意这个 滑动关闭的函数 官网文档的$.swipeoutClose $不是zepto 是MUi自己
                    // 不能使用zepto的$换成 mui.swipeoutClose
                    // 而且这个函数参数是li标签 是DOM对象 不是zepto 
                    // 8. 调用MUi的滑动关闭函数 让侧滑列表回去
                    mui.swipeoutClose(li);
                }, 0);
            }
        })
    });


    /* 购物车编辑功能
        1. 点击编辑按钮弹出一个确认框
        2. 在确认框里面放代码而不是放文字
        3. 创建一个购物车编辑商品的模板
        4. 传人对应商品数据去渲染模板
        5. 把模板生成的html放到确认框里面去
        6. 放完后还要初始化尺码点击和数量点击功能
        7. 获取最新选择的尺码和数量调用更新购物车商品的APi去更新购物车商品数据
        8. 更新完成后要重新刷新页面
        9. 点击了取消就把列表滑动回去 */
    // 1. 给编辑按钮添加点击事件
    $('.cartlist').on('tap', '.btn-edit', function () {
        // 11. 使用dom方式获取li 是当前a的父元素的父元素
        var li = this.parentNode.parentNode;
        // 2. 准备一个弹出框框的模板 准备一个数据(来源商品列表的单个商品数据)
        var value = $(this).data('value');
        console.log(value);
        // 2.1 动态渲染之前因为尺码不是一个数组 是一个字符串40-50字符串 希望是一个[40,41,42,43..50]这样的数组
        // 2.2 取出字符中的最小值
        var min = +value.productSize.split('-')[0];
        var max = +value.productSize.split('-')[1];
        console.log(min, max);
        // 2.4 定义一个数组把循环的每一个值都添加到数组中
        var size = [];
        // 2.3 写一个循环从min开始到max结束
        for (var i = min; i <= max; i++) {
            size.push(i);
        }
        // console.log(size);
        // 2.5 把数组赋值给数据对象 data的size属性
        value.productSize = size;
        console.log(value);
        // 3. 创建一个模板生成编辑框里面需要的html结构 传人当前的value对象 是一个商品数据的对象
        var html = template('editCartTpl', value);
        // console.log(html);
        // 4. 去掉html标签中的回车换行 不然变成br标签
        html = html.replace(/[\r\n]/g, "");
        // console.log(html);
        // 5. 弹出一个确认框 把准备好的html标签模板放到确认框里面
        var btnArray = ['确定', '取消'];        
        mui.confirm(html, '温馨提示', btnArray, function (e) {
            console.log(e);
            // 9. 判断用户点击了确定还是取消 e.index == 0表示是确定
            if (e.index == 0) {
                // 11. 点击了确定获取当前用户选择的尺码和数量调用APi更新购物车商品
                // 12. 获取最新选中的尺码
                var size = $('.btn-size.mui-btn-warning').data('size');
                console.log(size);
                // 13. 获取最新选择的数量                
                var num = mui('.mui-numbox').numbox().getValue();
                // 14. 调用APi传人商品id 和 尺码 和 数量更新购物车 的商品
                $.ajax({
                    url: '/cart/updateCart',
                    type: 'post',
                    data: {id:value.id,size:size,num:num},
                    success:function (data){
                      // 15. 判断如果修改成功调用查询刷新页面
                      if(data.success){
                          queryCart();
                      }
                    }
                });
            } else {                
                setTimeout(function () {                   
                    // 10. 点击了取消 调用MUi的滑动关闭函数 让侧滑列表回去
                    mui.swipeoutClose(li);
                }, 0);
            }
        });
        // 6. 弹窗出来后就要对尺码和数字框进行初始化
        // 7. 初始化数字框
        mui('.mui-numbox').numbox();
        // 8. 初始化尺码点击 让尺码能够点击切换 类名 为什么不需要委托 因为详情数据已经渲染完毕了可以直接使用
        $('.btn-size').on('tap', function () {
            $(this).addClass('mui-btn-warning').siblings().removeClass('mui-btn-warning');
        });
    });

    /* 计算选中商品的订单总额
        1. 获取页面所有的复选框 添加一个选择事件(change)
        2. 在change里面要获取所有选中的复选框 :checked
        3. 遍历所有选中的复选框获取他们的价格和数量  价格*数量
        4. 把每个商品总价 累加就是总金额 */
    // 在事件里面也调用一下
    $('.cartlist').on('change','.choose',getSum);    
    function getSum(){        
        // 2. 获取所有选中的复选框 :checked表示选中的
        var checkeds = $('.choose:checked');
        console.log(checkeds);
        // 3. 遍历所有选中的复选框把 计算每个金额和累加起来
        var sum = 0;
        checkeds.each(function (index,value){
          var price = $(value).data('price');
          var num = $(value).data('num');
          // 计算当前商品单价 把所有商品单价累加到sum里面
          sum += (price * num);          
        });
        // 4. 保留2位小数 因为JS计算 0.1+0.2 变成 0.3000000004 把后面小数去掉
        sum = sum.toFixed(2);
        // 5. 把金额渲染到页面上
        $('.order-count span').html(sum);      
    }
    // 因为需要重复发送请求 封装在一个公共的函数里面
    function queryCart() {
        $.ajax({
            url: '/cart/queryCartPaging',
            data: {
                page: 1,
                pageSize: 5
            }, // 传入请求的页码数和每页显示多少条
            success: function (data) {
                console.log(data);
                // 1. 对后台返回数据进行一个判断处理 当返回的是数组  把数组包装在对象里面
                if (data instanceof Array) {
                    data = {
                        data: data
                    }
                }
                // 2. 调用模板生成html
                var html = template('cartlistTpl', data);
                // 3. 把模板渲染到页面的cartlist的ul里面
                $('.cartlist').html(html);
                // 4. 商品列表加载完成后 调用计算总金额的函数
                getSum();
            }
        });
    }
});