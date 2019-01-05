$(function () {
    // 5. 把参数挪到外面来定义 放到全局变量定义
    var obj = {
        proName: "",
        page: 1,
        pageSize: 4
    }
    // 就是当前要查询的关键字 从url中参数获取的key
    obj.proName = getQueryString('key');
    console.log(obj.proName);
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
        obj.proName = $('.input-search').val().trim();
        // 2. 进行非空判断
        // if(key == ''){
        // !key 取key的相反值 如果key为false 取反后变成 true 就成立 表示你没有输入
        // !key 取key的相反值 如果key为true 取反后变成 false 就不成立 表示你有输入
        if (!obj.proName) {
            mui.alert('请输入你要搜索的关键字', '温馨提示(标题)', function () {

            });
            return;
        }
        // 3. 点击搜索按钮搜索商品 调用查询商品的渲染函数
        queryProduct();
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
        // 2. 获取当前a身上的排序顺序的属性的值
        var sortType = $(this).data('sort-type');
        console.log(sortType);
        // 3. 获取当前a身上的排序顺序
        var sort = $(this).data('sort');
        console.log(sort);
        // 4. 在JS中对排序顺序进行修改 如果之前是1升序 点击了变成2降序 如果之前是降序2 点击变成升序1
        sort = sort == 1 ? 2 : 1;
        console.log(sort);

        console.log(obj)
        // 6. 把修改了的排序顺序重新保存到标签身上
        $(this).data('sort', sort);
        // 7. 判断如果是价格就进行价格排序 如果是数量进行数量排序
        // if (sortType == 'price') {
        //     // 如果排序方式是价格就在参数对象上加一个价格属性
        //     obj.price = sort;
        // } else if (sortType == 'num') {
        //     // 如果排序方式是数量在参数的对象上加一个数量的属性
        //     obj.num = sort;
        // }
        // 对全局变量这个参数 每次排序的时候都进行一次重置 
        obj = {
            proName: obj.proName,
            page: 1,
            pageSize: 4
        }
        // 给参数动态添加一个属性名 名称可能是price可能是num
        obj[sortType] = sort; // 如果sortType变量的值是price obj['price'] = 1 是num obj['num'] = 1


        console.log(obj);
        // 8. 不管价格和数量都是调用ajax请求 传人当前obj参数对象
        queryProduct();
    })

    function queryProduct() {
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
    }

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