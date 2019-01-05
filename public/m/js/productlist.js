/* 这是处理乐淘移动端商品列表js页面 */
/* 入口函数 */
$(function () {

    // console.log(document.location)
    // 获取当前要查询的关键字 从url的参数中获取的key
    var key = getQueryString('key');

    /*1.根据url参数的值 去查询商品列表数据并显示
        1.调用ajax 请求查询商品列表的数据的API
        2.调用查询API传入一些参数 包含当前搜索关键字key(但是后台要求传入proName) 
         proName:key 传人page 和 pageSize 这两个后端规定一定要传入不传入后端会挂掉 要npm strat 重启
        3.拿到数据后调用模板去渲染页面就可以了 
    
    */

    //第一次调用查询商品的函数 是在根据url参数去查询
    queryProduct();

    /* 2.在当前商品列表页面去搜索商品也能实现商品搜索
        1.获取搜索按钮 添加点击事件
        2.获取当前输入框要搜索的关键字
        3.调用查询 传入当前用户输入的搜索关键字请求数据 渲染页面

    */

    $('.btn-search').on('tap', function () {
        /* 1. 获取当前输入内容 把全局变量的key的值重新覆盖成当前输入的内容
        注意改变全局变量不能再写var 写了就重新声明局部变量key */
        // trim移除字符串中的空格
        key = $('.input-search').val().trim();
        // 2.进行费控判断
        // if(key == '') 判断空字符串和下面的取反是一样的
        // !key 取key的相反值 如果key为false 取反后变成true 就成立 表示你没有输入
        // !key 取key的相反值 如果key为true 取反后变成false 就不成立 表示你有输入
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
    })

    /* 商品的排序
        1.点击了排序按钮进行商品的排序功能 给所有排序添加事件
        2.排序股则是后端定义的 后端定义 price和num排序
            如果price=1价格升序 从小到大 price=2 价格降序从大到小 num也是和价格一样
        3.点击排序按钮的时候 比如价格第一次点击进行升序排序 第二次进行降序排序 第三次升序...   
        4.调用api 传入出了之前名称 分页 还需要在加一个排序方式=排序顺序 例如方式price=顺序是1
        5.排序完后重新渲染页面
    */

    //1.给所有a添加点击事件
    $('.product-list .mui-card-header a').on('tap', function () {
        //2.获取当前a身上的排序顺序data-sort-type的属性的值
        var sortType = $(this).data('sort-type'); //price num time discount 四个值之一
        console.log(sortType);
        //3.获取当前a身上的排序顺序
        var sort = $(this).data('sort');
        console.log(sort);
        //4.在JS中对排序顺序进行修改 如果之前是1升序 点击了变成2降序
        sort = sort == 1 ? 2 : 1;
        console.log(sort);
        //5.把修改了的排序顺序重新保存到 当前点击的a标签身上
        $(this).data('sort', sort);
        //6.把参数挪到外面来定义
        var obj = {
            proName: key,
            page: 1,
            pageSize: 4,
        }
        console.log(obj);
        /*  //7.判断如果是价格就进行价格排序 如果是数量进行排序 
         if(sortType == 'price'){
             //如果排序方式是价格就在参数对象上加一个价格上行
             obj.price = sort;
         }else if(sortType == 'time'){
             //如果排序方式是数量在参数的对象上加一个数量的属性
             obj.num = sort;
         }
         //如果后面有其他条件就继续添加  */
        //上面的方式可读性高 但是维护性能不高 

        //7.给参数动态添加一个属性名 名称可能是price可能是num
        obj[sortType] = sort;
        console.log(obj);
        //8.不管价格和数量都是调用ajax请求 传入当前obj参数对象
        $.ajax({
            url: '/product/queryProduct',
            data: obj,
            success: function (res) {
                console.log(res);
                //2.调用模板
                var html = template('productListTpl', res);
                //3.把列渲染到商品列表 的mui-row里面
                $('.product-list .mui-card-content .mui-row').html(html);
            }
        })

        //9. 给当前a添加active 类名 其它a删除active
        //siblings 其它兄弟元素
        $(this).addClass('active').siblings().removeClass('active');
        //10. 给a里面的i替换类名
        if (sort == 1) {
            //如果排序方式1 升序 把之前的降序删掉 替换升序
            //find 表示它的子元素
            $(this).find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
        } else {
            //如果排序方式2 降序 把之前的升序删掉 替换为降序
            $(this).find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
            // 4. 下拉刷新完成后去重置上拉加载效果
            mui('#refreshContainer').pullRefresh().refresh(true);
            // 5. 除了重置上拉加载的效果 还要把page也重置为第一页 一定要重置page不然下一次请求到了很大page
            page = 1;
        }

    })

    /*4.商品下拉刷新和上拉刷新加载更多 
        1.下拉刷新是请求跌一页数据 重新刷新页面 html函数
        2.上拉加载更多 请求下一页的数据 在页面基础上追加下一页的数据 apppend追加
        3.如果让他下拉 或者 上拉使用插件 MUI下拉刷新和上拉加载插件
        4.写上拉下拉结构
        5.调用JS初始化下拉上拉
        6.下拉的时候回调函数里面刷新数据 并且结束下拉转圈圈
        7.下拉加载更多数据 定义一个全局page=1 每次上拉page++
        8.请求++之后的数据 然后追加渲染页面
        9.判断数据是否还有长度 有就结束 如果没有长度就结束并且提示没有数据了
        10.但是有些时候重新下拉希望能够重新继续上拉 所以在下拉里面要重置一下 上拉加载效果
    */
    // 1. 定义一个全局page默认为1 第一次默认的第一页
    var page = 1;
    // 1.初始化下拉刷新和下拉加载更多插件
    mui.init({
        pullRefresh: {
            container: "#refreshContainer", //下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
            down: { //初始化下拉
                callback: function () { //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
                    //模拟请求过程写一个延迟的定时器 让结束代码延迟2秒钟执行
                    setTimeout(function () {
                        // 2. 调用ajax请求渲染刷新页面
                        queryProduct();
                        // 3. 结束下拉加载转圈圈 官方文档有坑点 建议到dom文档里去找 
                        mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
                        // 4. 下拉刷新完成后去重置 上拉加载效果

                    }, 2000);
                }
            },
            up: { //初始化上拉
                callback: function () { //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
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
                                // 3.判断返回数据的数组的长度是否大于0 大于0表示有数据就追加渲染
                                if (res.data.length > 0) {
                                    // 4. 调用模板
                                    var html = template('productListTpl', res);
                                    // 5.把列渲染追加到商品列表 的 mui-row里面 这里不能用html因为会把之前的清除再渲染 append函数 追加是append
                                    $('.product-list .mui-card-content .mui-row').append(html);
                                    // 6.数据加载完毕 要结束上拉加载 但是还有数据 要继续加载执行下面的代码 参数不用传
                                    mui('#refreshContainer').pullRefresh().endPullupToRefresh();
                                } else {
                                    // 7.没有数据了 结束上拉加载 并且表示没有更多数据了
                                    mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
                                }
                            }
                        });
                    }, 2000)
                }
            }
        }
    });


    // 因为这个页面需要多次调用这个方法 所以为了解决代码 冗余 把它封装到函数中
    function queryProduct() {
        $.ajax({
            url: '/product/queryProduct',
            data: {
                proName: key,
                page: 1,
                pageSize: 4
            },
            success: function (res) {
                console.log(res)
                // 2. 调用模板
                var html = template('productListTpl', res);
                // 3. 把列渲染到商品列表里 的 mui-row里面
                $('.product-list .mui-card-content .mui-row').html(html);
            }
        });
    }
    // 这是网上查的方法 正则截取实现的
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        // console.log(r); 
        if (r != null) return decodeURI(r[2]);
        return null;
    }
})

// 用字符串截取的的数据 从url中截取
/*  location是地址对象 
   location.search是地址栏参数对象里面的属性(属性的值是一个地址栏的参数 ?及其后面的内容)
*/
//查询地址栏参数 根据参数名获取参数的值的一个函数 需要传递一个参数名过来
// function getQueryString(name){

//     var str = location.search; // 获取到的是 '?key=输入要查询的值&time=和时间'字符串
//     // 1.把问好去掉 截取了 从第二个到末尾的字符串 去掉了第一个?字符串
//     str = str.substr(1);
//     //如果你传递的时候用的是 escape这种加密函数 使用unescape解密
//     // str = unescape(str);

//     //如果默认加密 浏览器默认就会使用encodeURI加密 就要使用decodeURI 进行解密
//     str = decodeURI(str);

//     //1.可能哟多个参数 先把参数分隔开
//     var srr = str.split('&'); // 分隔开后变成["key=传递的值","time=当前时间"] 这样的数组
//     // 遍历这个数组拿到我们想要的值
//     for( var i = 0 ; i < arr.length ; i++){
//        // console.log(arr[i]) // key=鞋
//         var arr2 = arr[i].split('=');
//        // console.log(arr2) // ["key","鞋"]
//        //胖端当前参数数组中第一个值 参数名 和传递的名字一致 返回当前参数组的第二个值 参数的值
//        if(arr2[0] == name){
//            // 返回arr2数组的第二个值 就是参数的值
//            return arr2[1];
//        }
//     }
// }