/* import { template } from "handlebars"; */

$(function(){
    /* 
        1.添加搜索记录
        1.获取当前输入的搜索内容
        2.不能直接添加这个内容到数组中 把内容存储到一个数组里面添加到本地存储中
        3.判断 去除重复的 如果之前数组中存在这个值 要先删除 再往前添加
        4.把数组存储到本地存储中的时候 要把数组转出一个json字符串再存进去
        5.调用设置本地的函数 把json字符串存储到本地存储中
    */

    //1.给搜索按钮添加点击事件
    //点击事件用封装好的tap事件 避免延迟
    $('.btn-search').on('tap',function(){
        // console.log(this);
        //2.获取当前输入框的内容 可能会有收尾空格这种 把空格去掉 .trim方法
        var search = $('.input-search').val().trim();
        console.log(search);
        //3.进行非空判断 如果用户没有输入或者输入全部是空格 提示用户重新输入
        if(search == ''){
            mui.toast('你不输入想什么呢',{ duration:'long', type:'div' });
            return; 
        }
        //4.把数据存储加到一个数组中
            //1.因为可能不是第一次添加 之前就已经有值 在之前的值的基础你上再添加
            //2.先获取之前额数组 获取之前的键 historyData1里面的数组
        var arr = localStorage.getItem('historyData1');
        //5.对数组字符串进行一个转换成一个js数组 但是又有可能是第一次加 之前数组不存在 没有数组转不了会是null 空数组
        //短路思想 前面的能成立则返回前面的 否则返回后面的
        // arr = JSON.parse(arr) || [];   //parse不能转空值或者und 会报错 不执行后面的代码 下面的写法更严谨
        // 不能转数组要用引号包起来 空数组也会报错
        arr = JSON.parse(arr || '[]') ;   
        //6.还得做数组的去重如果 数组中已经有了这个值 先把 这个值删掉 再去添加这个值
        //判断当前值在数组中存在 因为存在返回当前值得索引 不会是-1 不等于-1返回数组的索引
        if(arr.indexOf(search) != -1){
            //7.去数组中删掉这个值 splice 是数组删除一个值的函数 第一个参数是要删除的索引 第二个参数是删几个
            arr.splice(arr.indexOf(search),1);
        }
        //8.去除了重复之后 在把当前值加到数组的前面 unshift 函数把一个值往数组的前面添加
        arr.unshift(search);
        //9.数组加完之后把数组存储到本地存储中 先转出字符串再存储到本地存储中
        arr = JSON.stringify(arr);
        localStorage.setItem('historyData1',arr);
        //10.输入完成清空文本框 把输入value值设置为空
        $('.input-search').val('');
        //11.添加完成后重新查询一下 显示最新添加的记录
         queryHistory();
         //12. 添加完成后重新查询一下 显示最新添加的记录 
         // ?后面的都是url参数 =号前面的是 search参数名 =号后面的是参数的值
         //如果有多个参数用&相连
         //一般传递过去的参数打印出来都会进行加密 encodeURL 也可以默认不写 默认就是encodeURL 但是js中接收一定要写
         //new Date().getTime() 获取当前毫秒时间 
         location = 'productlist.html?key='+search+'&time'+new Date().getTime();
    });
    //开始调用一下 
    queryHistory();
    /*实现历史记录的查询
        1.获取本次存储中的数组字符串 也要转出一个js数组对象
        2.创建一个列表模板 渲染模板 
    */
   //由于每次添加了都需要查询 把查询的代码放到一个函数里面 第一次调用一下 在添加完成也调用一下
   function queryHistory(){
       //1.读取本地存储的值
       var arr = localStorage.getItem('historyData1');
       //2.对数组字符串进行一个准换成一个JS数组 但是又有可能是第一次加 之前数组不存在 没有数组转不了使用 空数组
       //短路思想 前面的能成立则返回前面的 否则返回后面的
       arr = JSON.parse(arr) || [];
       console.log(arr);
       //把 arr 作为一个值包装 对象的rows数组上
       //是对象就不用报本身要求及时对象满足了 是数组就要报 数组不满足要求需要对象
       var html = template('searchHistoryTpl',{
           rows:arr
       });
       $('.search-history ul').html(html);
   }

   /* 实现删除历史记录
        1.点击x获取当前点击x的索引 自定义属性绑定和获取
        2.获取当前本地存储的这个数组字符串 转成真正的数组
        3.把当前数组调用删除元素 删掉当前索引的这个元素
        4.删完后重新把删除后的数组保存到本地存储中
        5.刷新页面既可以重新渲染(调用查询)

   */
   
  //1.使用委托时间给 x 添加点击事件 x是动态添加的元素
  $('.search-history').on('tap','.btn-delete',function(){
      //2.获取当前这个点击的索引
      var index = $(this).data('index');
        //3.读取本地存储的值
        var arr = localStorage.getItem('historyData1');
        //4.对数组字符串进行一个准换成一个JS数组 但是又有可能是第一次加 之前数组不存在 没有数组转不了使用 空数组
        //短路思想 前面的能成立则返回前面的 否则返回后面的
        arr = JSON.parse(arr) || [];
        //5.把arr数组中的当前索引直接删除掉
        arr.splice(index,1);
        //6.把删除后的数据重新保存到本地中 转成json字符串
        arr = JSON.stringify(arr);
        localStorage.setItem('historyData1',arr);
        //7.删除完成后调用查询重新渲染
        queryHistory();
  })

    /* 实现全部清除的功能
        1.获取全部功能按钮给它注册点击事件 因为这不是动态添加的元素 所以不需要事件委托
        2.把本地存储的数据清空 只要把你当前的存储的这个键 去 清空 或者删除就可以了 不雅把别人的数据也删掉了
        3.删除完成重新调用查询刷新页面就可以了
    */

  //1.获取按钮注册点击事件
  $('.btn-clear').on('tap',function(){
    //清空本地存储的数据 不能用clear
    localStorage.removeItem('historyData1');
    //3.删除完成后调用查询刷新页面
    queryHistory();

      
  })
   
//    $('.search-history .btn-remove').on('tap',function(){
//         console.log(this);
//         // console.log(dataIndex);
//         var index = $(this).data('index');
//         // var index = parseInt('dataIndex',1);
//         console.log(index);
        
//         //先获取这个这个存储的数组
//         var arr = localStorage.getItem('historyData1');
//         //删除这个下标数组
//         arr = JSON.parse(arr)
//         var arr = arr.splice(arr.index,1);
//         //再添加
//         localStorage.setItem('historyData1',arr);
//    })
})