$(function () {
    /* 1. 完成登录功能
      1. 点击登录按钮去登录
      2. 获取当前用户输入的用户名和密码
      3. 进行非空判断
      4. 如果都输入了就把用户名密码调用APi传参
      5. 接收APi返回值 success表示登录成功(返回详情页面继续让用户加入购物车) 如果登录失败提示用户错误的原因 */
    // 1. 点击登录按钮去登录
    $('.btn-login').on('tap', function () {
        // 2. 获取当前用户输入的用户名和密码 去掉空格
        var username = $('.username').val().trim();
        // 3. 进行非空判断
        if (!username) {
            mui.toast('请输入用户名', {
                duration: 'short',
                type: 'div'
            });
            // return 结束后面的代码不执行
            return false; // 不进行结束后面的代码而且阻止默认行为
        }
        var password = $('.password').val().trim();
        if (!password) {
            mui.toast('请输入密码', {
                duration: 'short',
                type: 'div'
            });
            return false;
        }
        // 4. 如果都输入了就把用户名密码调用APi传参
        $.ajax({
            url: '/user/login',
            type: 'post',
            data: {
                username: username,
                password: password
            },
            success: function (data) {
                console.log(data);
                //   5. 判断当前是否登录成功
                if (data.success) {
                    // 6. 成功 就跳转回我需要返回的页面的url  通过地址栏参数去获取这个我要返回 的url
                    var returnUrl = getQueryString('returnUrl');
                    console.log(returnUrl)
                    // 7. 使用location去跳转到这个url地址
                    location = returnUrl;
                } else {
                    // 7. 失败提示用户失败的信息
                    mui.toast(data.message, {
                        duration: 'short',
                        type: 'div'
                    });
                }
            }
        })
    });

    // 2. 点击免费注册 跳转到注册页面
    $('.btn-register').on('tap', function () {
        location = 'register.html';
    });

    // 获取url参数值的函数
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        // console.log(r); 
        if (r != null) return decodeURI(r[2]);
        return null;
    }
});