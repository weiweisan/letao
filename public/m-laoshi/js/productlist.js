$(function () {
    // 就是当前要查询的关键字 从url中参数获取的key
    var key = getQueryString('key');
    console.log(key);
    /* 1. 根据url参数的值 去查询商品列表数据并显示
        1. 调用ajax 请求查询商品列表的数据的API
        2. 调用查询API传人一些参数 包含当前搜索关键字key（但是后台要求传人proName）  proName:key 传人page 和 pageSize
        3. 拿到数据后调用模板去渲染页面即可 */
    // 第一次调用查询商品的函数 是在根据url参数去查询
    queryProduct();

    /* 2. 在当前商品列表页面去搜索商品也能实现商品搜索
        1. 获取搜索按钮添加点击事件
        2. 获取当前输入框输入要搜索的关键字
        3. 调用查询 传人当前用户输入的搜索关键字请求数据 渲染页面 */
    $('.btn-search').on('tap', function () {
        // 1. 获取当前输入内容 把全局变量的key的值重新覆盖成当前输入的内容 注意改全局变量不能再写var 写了就重新声明局部变量key
        key = $('.input-search').val().trim();
        // 2. 进行非空判断
        // if(key == ''){
        // !key 取key的相反值 如果key为false 取反后变成 true 就成立 表示你没有输入
        // !key 取key的相反值 如果key为true 取反后变成 false 就不成立 表示你有输入
        if (!key) {
            mui.alert('请输入你要搜索的关键字', '温馨提示(标题)', function () {

            });
            return;
        }
        // 3. 点击搜索按钮搜索商品 调用查询商品的渲染函数
        queryProduct();
        // 4. 下拉刷新完成后去重置上拉加载效果
        mui('#refreshContainer').pullRefresh().refresh(true);
        // 5. 除了重置上拉加载的效果 还要把page也重置为第一页 一定要重置page不然下一次请求到了很大page
        page = 1;
    });

    /* 3. 商品的排序
        1. 点击了排序按钮进行商品的排序功能 给所有排序添加事件
        2. 排序规则是后端定义的  后端定义 price和 num排序
             如果price=1价格升序 从小到大 price=2 价格降序从 大到小 num也是和价格一样
        3. 点击排序按钮的时候 比如价格第一次点击进行升序排序 第二次进行降序排序 第三次 升序 第四就降序
        4. 调用api 传人除了之前名称 分页 还需要在加一个 排序方式=排序顺序 例如方式price=顺序是1
        5. 排序完后重新渲染页面 */

    // 1. 给所有a添加点击事件 
    $('.product-list .mui-card-header a').on('tap', function () {
        // 2. 获取当前a身上的排序顺序data-sort-type的属性的值
        var sortType = $(this).data('sort-type'); // price num time discount 四个值之一
        console.log(sortType);
        // 3. 获取当前a身上的排序顺序
        var sort = $(this).data('sort');
        console.log(sort);
        // 4. 在JS中对排序顺序进行修改 如果之前是1升序 点击了变成2降序 如果之前是降序2 点击变成升序1
        sort = sort == 1 ? 2 : 1;
        console.log(sort);
        // 5. 把修改了的排序顺序重新保存到 当前点击a标签身上
        $(this).data('sort', sort);
        // 6. 把参数挪到外面来定义
        var obj = {
            proName: key,
            page: 1,
            pageSize: 4,
        }
        console.log(obj);

        // 7. 判断如果是价格就进行价格排序 如果是数量进行数量排序
        // if (sortType == 'price') {
        //     // 如果排序方式是价格就在参数对象上加一个价格属性
        //     obj.price = sort;
        // } else if (sortType == 'num') {
        //     // 如果排序方式是数量在参数的对象上加一个数量的属性
        //     obj.num = sort;
        // } else if (sortType == 'time') {
        //     // 如果排序方式是数量在参数的对象上加一个数量的属性
        //     obj.time = sort;
        // } else if (sortType == 'discount') {
        //     // 如果排序方式是数量在参数的对象上加一个数量的属性
        //     obj.discount = sort;
        // }
        // 给参数动态添加一个属性名 名称可能是price可能是num
        obj[sortType] = sort;
        console.log(obj);
        // 8. 不管价格和数量都是调用ajax请求 传人当前obj参数对象
        $.ajax({
            url: '/product/queryProduct',
            data: obj,
            success: function (res) {
                console.log(res);
                // 2. 调用模板
                var html = template('productListTpl', res);
                // 3. 把列渲染到商品列表 的 mui-row里面
                $('.product-list .mui-card-content .mui-row').html(html);
            }
        });

        // 9. 给当前a添加active类名 其他a删除active
        $(this).addClass('active').siblings().removeClass('active');
        // 10. 给a里面的i替换类名
        if (sort == 1) {
            // 如果排序方式1 升序  把之前的降序删掉 替换升序
            $(this).find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
        } else {
            // 如果排序方式2 降序 把之前的升序删掉 替换为降序
            $(this).find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
        }
        // 4. 下拉刷新完成后去重置上拉加载效果
        mui('#refreshContainer').pullRefresh().refresh(true);
        // 5. 除了重置上拉加载的效果 还要把page也重置为第一页 一定要重置page不然下一次请求到了很大page
        page = 1;
    });



    /* 4.商品下拉刷新和上拉加载更多
        1. 下拉刷新是请求第一页数据 重新刷新页面 html函数
        2. 上拉加载更多 请求下一页的数据 在页面基础上追加下一页的数据  append追加
        3. 如何让他下拉 或者 上拉使用插件 MUI下拉刷新和上拉加载插件
        5. 写下拉上拉结构
        6. 调用JS初始化下拉上拉
        7. 下拉的时候回调函数里面刷新数据 并且结束下拉转圈圈
        8. 上拉加载更多数据 定义一个全局page=1 每次上拉page++
        9. 请求++之后的数据 然后追加渲染页面
        10. 判断数据是否还有长度 有就结束 如果没有长度就结束并且提示没有数据了
        11. 但是有些时候重新下拉希望能够重新继续上拉 所以在下拉里面要重置一下上拉加载效果 */
    // 1. 定义一个全局page默认为1 第一次默认的第一页
    var page = 1;
    // 1. 初始化下拉刷新和上拉加载更多插件
    mui.init({
        pullRefresh: {
            container: "#refreshContainer", //下拉刷新容器选择器
            down: { //初始化下拉
                callback: function () {
                    // 模拟请求过程写了一个延迟的定时器 让结束代码延迟2秒钟执行
                    setTimeout(function () {
                        // 2. 调用ajax请求渲染刷新页面
                        queryProduct();
                        // 3. 结束下拉加载转圈圈
                        mui('#refreshContainer').pullRefresh().endPulldownToRefresh();

                        // 4. 下拉刷新完成后去重置上拉加载效果
                        mui('#refreshContainer').pullRefresh().refresh(true);
                        // 5. 除了重置上拉加载的效果 还要把page也重置为第一页 一定要重置page不然下一次请求到了很大page
                        page = 1;
                    }, 2000);
                }
            },
            up: { // 初始化上拉
                callback: function () {
                    // 模拟请求过程写了一个延迟的定时器 让结束代码延迟2秒钟执行
                    setTimeout(function () {
                        // 1. 请求下一页的数据
                        // 2. 把page全局变量++
                        page++;
                        $.ajax({
                            url: '/product/queryProduct',
                            data: {
                                proName: key,
                                page: page,
                                pageSize: 4
                            },
                            success: function (res) {
                                console.log(res);
                                // 3. 判断返回数据的数组的长度是否大于0 大于0表示有数据就追加渲染
                                if (res.data.length > 0) {
                                    // 4. 调用模板
                                    var html = template('productListTpl', res);
                                    // 5. 把列渲染追加到商品列表 的 mui-row里面 append函数
                                    $('.product-list .mui-card-content .mui-row').append(html);
                                    // 6. 数据加载完毕 要结束上拉加载 但是还有数据
                                    mui('#refreshContainer').pullRefresh().endPullupToRefresh();
                                } else {
                                    // 7. 没有数据了 结束上拉加载 并且提示没有更多数据了
                                    mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
                                }
                            }
                        });
                    }, 2000);
                }
            }
        }
    });


    // 查询商品的函数
    function queryProduct() {
        $.ajax({
            url: '/product/queryProduct',
            data: {
                proName: key,
                page: 1, // 必传一定要传
                pageSize: 4 //必传 不传会报错 报错就重启
            },
            success: function (res) {
                console.log(res);
                // 2. 调用模板
                var html = template('productListTpl', res);
                // 3. 把列渲染到商品列表 的 mui-row里面
                $('.product-list .mui-card-content .mui-row').html(html);
            }
        });
    }
    // 获取url参数值的函数
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        // console.log(r); 
        if (r != null) return decodeURI(r[2]);
        return null;
    }

});


// 1. 在当前商品列表页面获取当前搜索的关键字和时间
/* location是地址对象
location.search是地址栏参数对象里面的属性 (属性的值是一个地址栏的参数 ?及其后面的内容) */
// console.log(location.search);

// // 查询地址栏参数 根据参数名获取参数的值 的一个函数 需要传递一个参数名过来
// function getQueryString(name) {
//     var str = location.search;//'?key=鞋&time=1546659217943'
//     // 1. 把问号去掉 截取了从第二个到末尾的字符串 去掉了第一个?号字符串
//     str = str.substr(1);
//     // console.log(str);
//     // 使用 escape 这种加密函数 使用 unescape解密
//     // str = unescape(str);
//     // 如果默认的没加密 浏览器默认使用 encodeURI帮你加密 那就使用decodeURI进行解密
//     str = decodeURI(str);
//     // console.log(str);

//     // 1. 可能有多个参数 先把参数分隔开
//     var arr = str.split('&');["key=鞋","time=1546659217943"]
//     // console.log(arr);
//     for (var i = 0; i < arr.length; i++) {
//         // if(arr[i].)
//         // console.log(arr[i])// key=鞋
//         var arr2 = arr[i].split('=');
//         // console.log(arr2);//["key","鞋"]
//         // 判断当前参数数组中第一个值 参数名 和 传递的名字一致  返回当前参数数组的第二个值 参数的值
//         if (arr2[0] == name) {
//             // 返回 arr2数组的第二个值 就是参数的值
//             return arr2[1];
//         }
//     }
// }