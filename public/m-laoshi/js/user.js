$(function () {
    // 1. 查询个人中心的信息
    // 1. 调用查询用户信息的APi
    $.ajax({
        url: '/user/queryUserMessage',
        success: function (data) {
           // console.log(data);
            // 2. 判断返回的数据是否失败 失败表示未登录  跳转到登录页面
            if (data.error) {
                // 3. 跳转到登录页面  等登录完成后要跳转回到当前个人中心页面 
                // 去登录的时候告诉登录页面 你登录成功给我返回到这个地址
                location = 'login.html?returnUrl=' + location.href;
            } else {
                // 当数据请求成功 表示已经登录了 就显示这个页面
                document.documentElement.style.display  = 'block';
                console.log(data);
                // 4. 请求成功渲染数据到用户名和手机号上
                $('.username').html(data.username);
                $('.mobile').html(data.mobile);
            }
        }
    });

    // 2. 退出登录
    // 1. 给退出按钮添加点击事件
    $('.btn-exit').on('tap', function () {
        // 2. 调用后台的退出登录API实现退出登录
        $.ajax({
            url: '/user/logout',
            success: function (data) {
                // 3. 判断如果退出成功跳转到登录页面
                if (data.success) {
                    // 去登录的时候告诉登录页面 你登录成功给我返回到这个地址
                    location = 'login.html?returnUrl=' + location.href;
                }
            }
        })
    });
});