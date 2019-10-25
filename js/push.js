function bindChg() {
    var range = $('input:radio[name="ArgOption2"]:checked').val();
    if (range == 2) {
        var tags = $("#mc").val();
        var adr = new Array();
        adr = (tags).split(";");
        if (adr.length > 20) {
            // $("#show").html("标签数大于20");
            // $("#show").addClass('tags_err');
            // $(".tags_err").show();
             $('.tags_error').html("标签数大于 20");
             $('.tags_error').show();

            return false;
        } else {
            $(".tags_err").hide();
            $(".tags_err").removeClass('tags_err');
        }
    }
    if (!range) {
        $("#show").html("推送范围未选");
        $("#show").addClass('tags_err');
        $(".tags_err").show();
        return false;
    } else {
        $(".tags_err").hide();
        $(".tags_err").removeClass('tags_err');
    }
}
$(document).ready(function () {
    var strModal = [
        '<div class="modal fade" id="myModa2" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">',
            '<div class="modal-dialog">',
                '<div class="modal-content">',
                    '<div class="modal-header">',
                        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                        '<h4 class="modal-title">提示</h4>',
                    '</div>',
                    '<div class="modal-body">',
                        '<div class="alert alert-warning">',
                            '确认推送此条信息吗？生产环境下推送和广播消息合计每天最多推送 3 次。',
                        '</div>',
                    '</div>',
                    '<div class="modal-footer">',
                    '<button type="button" class="btn btn-default" data-dismiss="modal" aria-hidden="true">取消</button>',
                    '<button type="button" class="btn btn-primary sendMsg">确定</button>',
                        
                    '</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
    $("body").append($(strModal));
/*    $(".show-labels").on("click", function(){
        if($(this).find("span").hasClass('glyphicon-chevron-down')){
            $(this).find("span").removeClass('glyphicon-chevron-down');
            $(this).find("span").addClass('glyphicon-chevron-up');
        } else {
            $(this).find("span").removeClass('glyphicon-chevron-up');
            $(this).find("span").addClass('glyphicon-chevron-down');
        }
        $(".label-container").slideToggle('fast');
    });*/


    var content_val = $("#content").val();
    if (content_val) {
        if(content_val.length > 220){
            $('#word_start_alert').css('color','#c7254e');
        }else{
            $('#word_start_alert').css('color','#333');
        }
        $("#word_start").text(content_val.length);
    }

    $("#content").keyup(function () {
        var content_val = $("#content").val();
        if(content_val.length > 220){
            $('#word_start_content').css('color','#c7254e');
        }else{
            $('#word_start_content').css('color','#333');
        }
        console.log(content_val.length);
        $("#word_start_content").text(content_val.length);
        if (content_val.length > 220) {
            // $("#show").html("聊天界面内容超限");
            // $("#show").addClass('content_err');
            // $(".content_err").show();
            $('.chat_error').html('聊天界面内容超限');
            $('.chat_error').show();
            return false;
        } else {
            // $(".content_err").hide();
            // $(".content_err").removeClass('content_err');
            $('.chat_error').html('');
            $('.chat_error').hide();
        }
    });
    $("#alert").keyup(function () {
        var content_val = $("#alert").val();
        if(content_val.length > 220){
            $('#word_start_alert').css('color','#c7254e');
        }else{
            $('#word_start_alert').css('color','#333');
        }
        $("#word_start_alert").text(content_val.length);
        if (content_val.length > 220) {
            // $("#show").html("通知栏内容超限");
            // $("#show").addClass('alert_err');
            // $(".alert_err").show();
            // return false;
            $('.inform_error').html('通知栏内容超限');
            $('.inform_error').show();
            return false;
        } else {
            // $(".alert_err").hide();
            // $(".alert_err").removeClass('alert_err');
             $(".inform_error").hide();
        }
    });

    $('input:radio[name="ArgOption2"]').on("change", bindChg);
    $('#mc').on("change", bindChg);
    $("input[name=sendId]").on("change", function() {
        console.log($.trim($("input[name=sendId]").val()).length)
        if($.trim($("input[name=sendId]").val()).length == 0){
            $('.arg_error').html("请输入发送人用户 Id");
            $('.arg_error').show();
            // $("#show").html("请输入发送人用户 Id");
            // $("#show").addClass('sendId_err');
            // $(".sendId_err").show();
            return false;
        } else {
            // $(".sendId_err").hide();
            // $(".sendId_err").removeClass('sendId_err');
            $('.arg_error').html(" ");
            $('.arg_error').hide();
        }
    });
    $("input[name=ios_unread_type]").on("change",function(){
    	if($(this).val()=='other'){
    		$("input[name=ios_unread_num]").show();
    	}else{
    		$("input[name=ios_unread_num]").hide();
    	}
    })
    // 主动触发，第一次加载计数
    $("#content").trigger('keyup');
    $("#alert").trigger('keyup');
    $("#send").click(function () {
        _postSend();
    });
    $(".sendMsg").on("click", sendMsg);


    var param = {};
    function _postSend() {
        var flag=true;
        param.env = $('input:radio[name="ArgOption"]:checked').val();

        if (!param.env) {
            $("#show").html("推送环境未选");
            $("#show").show();
            return false;
        }

        param.app_key = '';
        if (param.env == 1) {
            param.app_key = key.pru;
        } else {
            param.app_key = key.dev;
        }
        param.app_secret = key.secret;
        var obj = document.getElementsByName('ArgOption1');
        var s = new Array();
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].checked)
                s.push(obj[i].value);
        }

        if (s.length == 0) {
            // $("#show").html("推送机型未选");
            // $("#show").addClass('arg_err');
            // $(".arg_err").show();
            $('.push_model_error').html("推送机型未选");
            $('.push_model_error').show();
            flag=false;
            // $(document.body).animate({
            //         scrollTop: 694},
            //         200);
            // return false;
        } else {
            // $(".arg_err").hide();
            // $(".arg_err").removeClass('arg_err');
            $('.push_model_error').html(" ");
            $('.push_model_error').hide();
        }
        param.who = s;
        param.tag = '';

        var range = $('input:radio[name="ArgOption2"]:checked').val();
        if (range == 2) {
            param.tag = $.trim($("#mc").val());
            if(param.tag == ""){
                // $("#show").html("请输入标签");
                // $("#show").addClass('tags_err');
                // $(".tags_err").show();
                $('.tags_error').html("请输入标签");
                $('.tags_error').show();
                flag=false;
                // $(document.body).animate({
                //     scrollTop: 760},
                //     200);

                // return false;
            } else {
                $('.tags_error').html(" ");
                $('.tags_error').hide();
                // $(".tags_err").hide();
                // $(".tags_err").removeClass('tags_err');
            }
            var adr = new Array();
            adr = (param.tag).split(";");
            if (adr.length > 20) {
                $('.tags_error').html("标签数大于 20");
                $('.tags_error').show();
                flag=false;
            } 
        }
        if (!range) {
            $("#show").html("推送范围未选");
            $("#show").addClass('tags_err');
            $(".tags_err").show();
            return false;
        } else {
            $(".tags_err").hide();
            $(".tags_err").removeClass('tags_err');
        }
        param.alert = $.trim($("#alert").val()) ? $.trim($("#alert").val()) : '';
        if(!isNotify){
            if($.trim($("input[name=sendId]").val()) == ""){
                $(".arg_error").html("请输入发送人用户 ID");
                $(".arg_error").show();
                flag=false;
            }else{
                $(".arg_error").html(" ");
                $(".arg_error").hide();
            }
            if (!param.alert) {
                $('.inform_error').html('通知栏内容不能为空');
                $('.inform_error').show();
                flag=false;
            }
            var sendId = $.trim($("input[name=sendId]").val());
            param.sendId = sendId;
            //消息内容(允许为空)
            param.content = $("#content").val() ? $("#content").val() : '';
            if (!param.content) {
                $('.chat_error').html('聊天界面内容不能为空');
                $('.chat_error').show();
                flag=false;
            } else if (param.content.length > 220) {
                $('.chat_error').html('聊天界面内容超限');
                $('.chat_error').show();
                flag=false;
            }else{
                 $('.chat_error').html(' ');
                 $('.chat_error').hide();
            }
            
        }
        param.badge = $("input[name=ios_unread_type]:checked").val();
        if(param.badge == 'other'){
        	param.badge = Number( $("input[name=ios_unread_num]").val() );
            console.log(param.badge)
        	if(!param.badge>0){
                console.log(param.badge)
                $('.badge_error').html("请填写badge");
                $('.badge_error').show();
                flag=false;
        	}else{
                $('.badge_error').html("");
                $('.badge_error').hide();
                flag=true;
            }
        }

        //推送内容
        if(isNotify){
            if (!param.alert) {
                $('.inform_error').html('通知栏内容不能为空');
                $('.inform_error').show();
                flag=false;
            }
        }
        if (param.alert.length > 220) {
            $('.inform_error').html('通知栏内容超限');
            $('.inform_error').show();
            flag=false;
        }
        var str = 0;
         var keyerror = '';
        $(".label-list").find('.label').each(function(index, el) {
            if($(this).find("input[name=key]").val().length <= 0 && $(this).find("input[name=val]").val().length>0){
                keyerror= '自定义附加信息中 Key 不能为空';
                $(this).find('.key_error').html(keyerror);
                $(this).find('.key_error').show();
                flag=false;
            }
            str += $(this).find("input[name=key]").val().length + $(this).find("input[name=val]").val().length;
        });
        if(str > 0){
             if(keyerror != ''){
                // $("#show").html(keyerror);
                // $("#show").addClass('alert_err');
                // $(".alert_err").show();
                // return false;
            }
        }
        if(str > 300){
            // $("#show").html("自定义附加信息最大长度为 300.");
            // $("#show").addClass('alert_err');
            // $(".alert_err").show();
            $('.last_key_error').html("自定义附加信息最大长度为 300.");
            $('.last_key_error').show();
            flag=false;
            // return false;
        }else{
            $(".alert_err").hide();
        }
        param.extra = {};
        $("body").find("input[name=key]").each(function(index, el) {
            var $key = $(this);
            var $val = $(this).parent().next("label").find("input[name=val]");
            if($key.val() != '' && $val.val() != ''){
                var tmpKey = $key.val();
                var tmlVal = $val.val();
                param.extra[tmpKey] = tmlVal;
            }
        });

        // 判断有没有必须填写项没有填写
        if(!flag){
            if($.trim($("input[name=sendId]").val()) == ""){
                $(document.body).animate({
                    scrollTop: 590},
                    200);
            }else if(param.tag == "" ||adr.length > 20 ){
                $(document.body).animate({
                    scrollTop: 760},
                    200);
            }else if (!param.content || param.content.length > 220) {
                $(document.body).animate({
                    scrollTop: 960},
                    200);
            }else{

            }
            return false;
        }else{
            if(param.env == 1){
                $('#myModa2').modal('toggle');
            }else{
                sendMsg();
            }
        }


        // if(param.env == 1){
        //     $('#myModa2').modal('toggle');    
        // }else{
        //     sendMsg();
        // }
        
    }
    function sendMsg() {
        if(param.env == 1){
            $('#myModa2').modal('toggle');
        }
        var loadi = layer.load('正在提交中，请稍后...');
        $.ajax({
            type: "post", //使用post方法访问后台
            dataType: "json", //返回json格式的数据
            url: "push_send.php", //要访问的后台地址
            data: param, //要发送的数据
            success: function (msg) {//msg为返回的数据，在这里做数据绑定
                layer.close(loadi);
                if (msg.code != 2000) {
                    layer.msg(msg.data, 1, -1);
                } else {
                    layer.msg(msg.data, 1, -1);
                    window.location.href = 'push_history.php?app_key='+param.app_key+'&app_secret='+param.app_secret+'&env='+param.env;
                }
            }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                layer.close(loadi);
                layer.msg('网络错误,请重试!', 2, -1);
            }
        });
    }
});

;(function(win, doc, $, undefined) {
    var conf = {
        'name': 'labelAdd',
        'data': [],
        'maxLen': 10,
        'maxConLen': 300,
        'intLabelNum': 0
    };
    conf.labelData = {
        'key': '',
        'val': ''
    };
    conf.html = {
        'labelHtml': [
            '<div class="form-group label" style="position: relative; display:block;">',
            '    <label class="col-md-2 col-xs-2 text-right control-label title"></label>',
            '    <div class="col-md-9 col-xs-9 form-inline" style="width: 660px; font-size: 15px;">',
            '    <label class="col-md-5 col-xs-5" style="margin-left: -15px;;color:#000">',
            '        键（Key）',
            '        <input class="form-control" name="key" type="text" value="" style="width: 130px;" placeholder="">',
            '     </label>',
            '     <label class="col-md-5 col-xs-5" style="color:#000">',
            '         值（Value）',
            '         <input class="form-control" type="text" value="" name= "val" style="width: 130px;" placeholder="">',
            '      </label>',
            '     <label class="plusPlugin">',
            '         <a herf="javascript:void(0)" class="glyphicon glyphicon-plus plus" alt="添加输入项"></a>',
            '         <div class="add_defined_info">增加自定义附加消息。</div>',
            '         <a herf="javascript:void(0)" class="glyphicon glyphicon-minus minus" alt="删除输入项" style="display: inline;"></a>',
            '         <div class="del_defined_info">删除该自定义附加消息。</div>',            
            '    </div>',
            '    <div class="key_error col-xs-offset-2"></div>',
            '</div>'
        ].join('')
    };
    var lib = {};
    lib.each = function(a, f){
        if(!a || !f)return;
        var i = 0;
        var l = a.length;
        for(;i<l;i++){f(a[i],i)}
    };
    lib.eacho = function(o, f){
        if(!o || !f)return;
        for(var i in o ){
            if(!o.hasOwnProperty(i)) continue;
            f(o[i], i);
        }
    };
    var self = {};
    self.conf = conf;
    /**
     * 加载配置
     * @param {obj} opt 配置对象
     */
    self.setOptions = function(opt) {
        self.conf = self.conf || {};
        lib.eacho(opt, function(v, k) {
            self.conf[k] = v;
        });
    };
    /**
     * 初始化参数
     * @param  {obj} opt 数据对象
     * @return {n=nul}      [description]
     */
    self.init = function(opt) {
        self.setOptions(opt);
        conf.intLabelNum = conf.data.length;
        self.makeHtml();
        self.bind();
    };
    /**
     * 生成 html 代码
     */
    self.makeHtml = function() {
        if(conf.intLabelNum == 0){
            conf.data[0] = conf.labelData;
            conf.intLabelNum = 1;
        }
        lib.eacho(conf.data, function(v, k) {
            self.html(v, k);
        });
        if(conf.intLabelNum >= 10){
            $('.label-container').find(".plus").hide();
        }

    };
    /**
     * 根据数据生成 html 代码
     * @param  {obj} data [description]
     * @return {[type]}      [description]
     */
    self.html = function(data, key) {
        var $objHtml = $(conf.html.labelHtml);
        var $option_err=$('.last_key_error').eq(0);

        $objHtml.find("input[name=key]").val(data['key']);
        $objHtml.find("input[name=val]").val(data['val']);
        if (conf.intLabelNum == 1) {
            $objHtml.find(".minus").hide();
            $('.label-container').find(".minus").hide();
        }else{
            $('.label-container').find(".minus").show();
        }
        if (conf.intLabelNum == conf.maxLen) {
            $objHtml.find(".plus").hide();
            $('.label-container').find(".plus").hide();
        }else{
            $('.label-container').find(".plus").show();
        }
        // $(".label-list").append($objHtml);
        $option_err.before($objHtml)
    };
    /**
     * 绑定所有事件
     * @return {[type]} [description]
     */
    self.bind = function() {
        $(document.body).on("click",".plusPlugin .plus", self.addLabel);
        $(document.body).on("click", ".plusPlugin .minus", self.delLabel);
    };
    // 删除标签
    self.delLabel = function() {
        $('.plusPlugin .plus').show();
        $that = $(this);
        if (conf.intLabelNum == 1) {
            return false;
        };
        $that.closest('.form-group').remove();
        conf.intLabelNum --;
        if (conf.intLabelNum == 1) {
            $('.label-container').find(".minus").hide();
        };

    };
    //添加标签
    self.addLabel = function() {
        if(conf.intLabelNum >= 10){
            return;
        }
        conf.contLen = 0;
        $(".label-list").find('.label').each(function(index, el) {
            conf.contLen += $(this).find("input[name=key]").val().length + $(this).find("input[name=val]").val().length;
        });
        if(conf.contLen >= conf.maxConLen){
            $("#show").text("自定义附加信息最大长度为 " + conf.maxConLen + ".");
        }
        conf.intLabelNum ++;

        self.html(conf.labelData);
    };
    win[conf.name] = self;
})(window, document, window.jQuery);
