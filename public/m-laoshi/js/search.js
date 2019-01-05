$(function () {
    /* 1. 添加搜索记录
        1. 获取当前输入的搜索内容
        2. 不能直接添加这个内容到数组中 把内容存储到一个数组里面去 把数组添加到本地存储中
        3. 判断 去除重复的 如果之前数组中存在这个值 要先删除 再往前添加
        4. 把数组存储到本地存储的中的时候 要把数组转出一个json字符串再存进去
        5. 调用设置本地存储的函数 把json字符串存储到本地存储中 */

    // 1. 给搜索按钮添加点击事件
    $('.btn-search').on('tap', function () {
        console.log(this);
        // 2. 获取当前输入框输入的内容  可能会有首尾空格这种是不合法的输入 吧空格去掉 .trim方法
        var search = $('.input-search').val().trim();
        console.log(search);
        // 3. 进行非空判断 如果用户没有输入或者输入全部是空格不合法 提示用户去输入
        if (search == '') {
            // mui.toast('你不搜索在下不给!',{ duration:'long', type:'div' }) 
            mui.alert('你不输入在下不给看', '温馨提示', function () {

            });
            // 如果用户没有输入内容需要阻止添加搜索记录
            return;
        }
        /* 4. 把数据存储加到一个数组中
            1. 因为可能不是第一次添加 之前就已经有值 在之前的值的基础上再添加 
            2. 先获取之前的数组 获取之前的键historyData1里面的数组 */
        var arr = localStorage.getItem('historyData1');
        // 5. 对数组字符串进行一个转换转成一个JS数组 但是又有可能是第一次加 之前数组不存在 没有数组转不了使用 空数组
        arr = JSON.parse(arr || '[]');
        // 6. 还得做数组的去重如果 数组中已经有了这个值 先把这个值删掉 再去添加这个值
        // 判断当前值在数组中存在 因为存在返回当前值的索引 不会是-1
        if (arr.indexOf(search) != -1) {
            // 7. 去数组中删除掉这个值 splice是数组的删除一个值的函数 第一个参数的是要删除的索引 第二个参数是删几个 
            arr.splice(arr.indexOf(search), 1);
        }
        // 8. 去除了重复之后 在把当前值加到数组的前面 unshift函数把一个值往数组的前面添加
        arr.unshift(search);
        // 9. 数组加完之后吧数组存储到本地存储中 先转出字符串再存储到本地存储中
        arr = JSON.stringify(arr);
        localStorage.setItem('historyData1', arr);
        // 10. 输入完成请空文本框 把输入value值设置为空
        $('.input-search').val('');
        // 11. 添加完成后重新查询一下 显示最新添加的记录
        queryHistory();
        // 12. 添加完成搜索记录后跳转到商品详情页面  
        // ?后面的都是url参数  =号前面的 search参数名 = 号后面的鞋是参数的值
        // 如果有多个参数用&相连
        // var params = 'key='+search+'&time='+ new Date().getTime();
        // location = 'productlist.html?'+escape(params);
        // 使用 encodeURI加密
        // var params = 'key='+search+'&time='+ new Date().getTime();
        // location = 'productlist.html?'+encodeURI(params);
        // 也可以默认不写 不写默认就是encodeURI
        location = 'productlist.html?key='+search+'&time='+ new Date().getTime();
    });
    // 一开始调用一下
    queryHistory();
    /* 实现历史记录的查询
         1. 获取本地存储中的数组字符串 也要转出一个js数组对象
         2. 创建一个列表模板 渲染模板 */
    // 由于每次添加了都需要查询 把查询的代码放到一个函数queryHistory里面 第一次调用一下 在添加完成也调用一下
    function queryHistory() {
        // 1. 读取本地存储的值
        var arr = localStorage.getItem('historyData1');        
        // 2. 对数组字符串进行一个转换转成一个JS数组 但是又有可能是第一次加 之前数组不存在 没有数组转不了使用 空数组
        arr = JSON.parse(arr || '[]');
        console.log(arr);
        // 把 arr 作为一个值包装 对象的 rows数组上 
        // 是对象就不用包本身要求就是对象满足了  是数组就要包 数组不满足要求他需要对象
        var html = template('searchHistoryTpl', {
            rows: arr
        });
        // 3. 把模板渲染到页面上
        $('.search-history ul').html(html);
    }

    /* 实现删除历史记录
        1. 点击x获取当前点击x的索引 自定义属性绑定和获取
        2. 获取当前本地存储中存储的这个数组字符串 转成真正数组
        3. 把当前数组调用删除元素删掉当前索引的这个元素
        4. 删完后重新把删除完成后的数组保存到本地存储中
        5. 刷新页面即可重新渲染(调用查询) */
    // 1. 使用委托给删除按钮添加点击事件
    $('.search-history').on('tap', '.btn-delete', function () {
        // 2. 获取当前点击的索引
        //dataset[] 是dom对象的  data函数 是zepto对象的
        var index = $(this).data('index');
        // 3. 读取本地存储的值
        var arr = localStorage.getItem('historyData1');        
        // 4. 对数组字符串进行一个转换转成一个JS数组 但是又有可能是第一次加 之前数组不存在 没有数组转不了使用 空数组
        arr = JSON.parse(arr || '[]');
        // 5. 把arr数组中的当前索引的值删掉
        arr.splice(index, 1);                                
        // 6. 把删除后的数组重新保存到本地存储中
        // 7. 数组加完之后吧数组存储到本地存储中 先转出字符串再存储到本地存储中
        arr = JSON.stringify(arr);
        localStorage.setItem('historyData1', arr);
        // 8. 删除完成后调用查询重新渲染
        queryHistory();
    });

   /*  清空记录
        1. 给清空按钮添加点击事件
        2. 把本地存储的数据清空 只要把你当前存储的这个键 去清空 或者删除即可 不要把别人的数据也删掉了
        3. 删除完成重新调用查询刷新页面即可 */
    // 1. 这个清空记录按钮已经存在了不是动态添加的不需要委托
    $('.btn-clear').on('tap',function (){
        //  2. 清空当前存储的这个historyData1这个键的值
        // 调用本地存储删除键的方式 把historyData1键删掉 值也会被删掉
        // localStorage.removeItem('historyData1');
        // localStorage.clear();// 不要使用清空把别人也影响了
        // 3. 删除完成调用查询刷新页面
        queryHistory();
    })

})