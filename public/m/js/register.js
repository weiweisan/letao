/* 这是处理注册表单的js文件 */
$(function () {
    /* 1.实现注册功能
        1.进行表单非空验证 
      */
    // 1.给注册按钮添加一个点击事件
    $('.btn-register').on('tap', function () {
        // 1.1默认是通过了验证
        //运用到开关思想
        var check = true;
        //1.2获取所有输入框
                
        var inputs = $('.mui-input-group input');
        //1.3遍历每一个输入框
        inputs.each(function (index, value) {
            //1.4获取每个输入框的value值 并且去除空格
            var val = $(value).val().trim();
            //1.5判断当前输入的值是否为空
            if (!val) {
                
                //1.6为空就获取为空的元素的上一个兄弟label 元素里面的文本值
                var label = $(value).prev().text();
                //1.7拼接上 文本值 不允许为空
                mui.toast(label + "不允许为空");
                //1.8只要进入了 这个判断就表示为空 为空就把check改成false
                check = false;
                //1.9只要有其中一个为空 结束 只是退出了这个循环
                return false;
            }
        });
        // 2. check还是为true 表示没有进入条件满足 全部都有输入
        if (check) {
            //才表示验证通过 获取用户名密码 手机号 确认框 调用注册api去注册
            var mobile = $('.mobile').val();
            //2.1判断当前手机号输入是否合法 是否满足11位 以1 第二位3 4 5 6 7 8 9中的一个 后面跟着9个数字结尾 !号是取反如果不符合
            if (!(/^1[3456789]\d{9}$/.test(mobile))) {
                mui.toast("手机号输入不合法请重新输入");
                return false;
            }
            var username = $('.username').val();
            var password1 = $('.password1').val();
            var password2 = $('.password2').val();
            //2.2判断2次输入的密码是否一致
            if (password1 != password2) {
                mui.toast("两次输入的密码不一致");
                return false;
            }
            //当前用户输入的vcode
            var vcode = $('.vcode').val();
            //2.3判断当前输入的验证码 是否和后台返回 全局变量的验证码是否一致
            if(vcode != vCode){
                mui.toast("验证码输入错误");
                return false;
            }
            // 3.调用注册APi去注册 传入这些参数
            $.ajax({
                url:'/user/register',
                type: 'post',
                data: {
                    username: username,
                    password: password1,
                    mobile:mobile,
                    vCode:vCode
                },
                success: function(data){
                    //4.判断当前注册是否成功
                    if(data.success){
                        //5.如果成功 跳转到登陆页面去登陆页面 跳转到登陆并且跟上登陆成功要 跳转的url
                        location = 'login.html?returnUrl=user.html';
                    }else{
                        //6.失败就提示失败的原因
                        mui.toast(data.message);
                    }
                }
            });
        }
    });
    var vCode = '';
    /* 2.获取验证码
        1.点击获取验证码按钮 获取验证码
        2.调用获取验证码的api去获取验证码
        3.正常情况是根据手机号去获取验证码 验证码会发送到手机上
        4.做个假的验证码发到控制台
      */   
    //1.点击获取验证码按钮 获取验证码
    $('.get-vcode').on('tap',function(){
        //2.调用获取验证码的api去获取验证码
        $.ajax({
            url:'/user/vCode',
            success: function(data){
                console.log(data.vCode);
                //3.把后台返回的 验证码 保存到全局变量中 要和用户输入进行判断
                vCode = data.vCode;
            }
        })
    }); 
});