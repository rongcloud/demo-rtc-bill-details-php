;(function(win,doc,$,undefined){

    var conf = {
        'name': 'apiTool',
        'maxInput': 5,
        'data': {},
        'selectedApi': 0,
        'canSubmit': true
    };
    conf.tags = {
        'container': '.params-detail',
        'inputObj': '.param',
        'apiToolObj': '.apiTool-Name',
        'noticeObj': '.help-block',
        'errorObj': '#error',
        'btnSub': '.btnSub',
        'plusBtn': '.plus',
        'minusBtn': '.minus',
        'responseObj': '#response',
        'requestObj': '#request',
        'resultObj': '#result',
        'addInput': '.plus',
        'removeInput': '.minus',
        'selectApiName': '.selectApiName',
        'environment' : "input[name='environment']",
    };

    var lib = {};
    lib.eacho = function(o, f, t){
        if(!o || !f)return;
        for(var i in o ){
            if(!o.hasOwnProperty(i)) continue;
            if (t) {
                f(o[i], i, t);
            } else {
                f(o[i],i);
            }
        }
    };
    lib.isString = function(str) {
        return true;
        var strReg = /^[\w\u4E00-\uFA29]{1,}$/;
        return strReg.test(str);
    };
    lib.isInt = function(str) {
        var strReg = /^[\d]{1,}$/;
        return strReg.test(str);
    }
    /**
     * 计算字符串的长度，全角字符和中文算2个长度
     *
     * @param {string} str
     * @return {number}
     */
    lib.getRealLength = function(str) {
        // 用于string.getRealLength的正则对象
        var GET_REAL_LENGTH_REG = /[^\x00-\xff]/g;
        if (typeof str !== 'string') {
            return -1;
        }
        return str.replace(GET_REAL_LENGTH_REG, '**').length;
    };
    //序列化方法，如不能使用JSON.stringify序列化，则手动序列化
    lib.encodeJson = (function () {
        var win = window;
        if( win.JSON && JSON.stringify ){
            return function(str){
                return JSON.stringify( str );
            }
        };
        /**
         * 字符串处理时需要转义的字符表
         * @private
         */
        var escapeMap = {
            "\b": '\\b',
            "\t": '\\t',
            "\n": '\\n',
            "\f": '\\f',
            "\r": '\\r',
            '"' : '\\"',
            "\\": '\\\\'
        };

        /**
         * 字符串序列化
         * @private
         */
        function encodeString(source) {
            if (/["\\\x00-\x1f]/.test(source)) {
                source = source.replace(
                    /["\\\x00-\x1f]/g,
                    function (match) {
                        var c = escapeMap[match];
                        if (c) {
                            return c;
                        }
                        c = match.charCodeAt();
                        return "\\u00"
                                + Math.floor(c / 16).toString(16)
                                + (c % 16).toString(16);
                    });
            }
            return '"' + source + '"';
        }
        /**
         * 数组序列化
         * @private
         */
        function encodeArray(source) {
            var result = ["["],
                l = source.length,
                preComma, i, item;

            for (i = 0; i < l; i++) {
                item = source[i];

                switch (typeof item) {
                case "undefined":
                case "function":
                case "unknown":
                    break;
                default:
                    if(preComma) {
                        result.push(',');
                    }
                    result.push(lib.encodeJson(item));
                    preComma = 1;
                }
            }
            result.push("]");
            return result.join("");
        }

        /**
         * 处理日期序列化时的补零
         * @private
         */
        function pad(source) {
            return source < 10 ? '0' + source : source;
        }

        /**
         * 日期序列化
         * @private
         */
        function encodeDate(source){
            return '"' + source.getFullYear() + "-"
                    + pad(source.getMonth() + 1) + "-"
                    + pad(source.getDate()) + "T"
                    + pad(source.getHours()) + ":"
                    + pad(source.getMinutes()) + ":"
                    + pad(source.getSeconds()) + '"';
        }
        return function (value) {
            switch (typeof value) {
            case 'undefined':
                return 'undefined';

            case 'number':
                return isFinite(value) ? String(value) : "null";

            case 'string':
                return encodeString(value);

            case 'boolean':
                return String(value);

            default:
                if (value === null) {
                    return 'null';
                } else if (value instanceof Array) {
                    return encodeArray(value);
                } else if (value instanceof Date) {
                    return encodeDate(value);
                } else {
                    var result = ['{'],
                        encode = lib.encodeJson ,
                        preComma,
                        item;

                    for (var key in value) {
                        if (Object.prototype.hasOwnProperty.call(value, key)) {
                            item = value[key];
                            switch (typeof item) {
                            case 'undefined':
                            case 'unknown':
                            case 'function':
                                break;
                            default:
                                if (preComma) {
                                    result.push(',');
                                }
                                preComma = 1;
                                result.push(encode(key) + ':' + encode(item));
                            }
                        }
                    }
                    result.push('}');
                    return result.join('');
                }
            }
        };
    })();

    var self = {};
    self.conf = conf;
    self.init = function(conf) {
        self.setOptions(conf);
        self.makeHtml();
        self.bind();
    };

    self.setOptions = function(opt){
        self.conf = self.conf || {};
        lib.eacho(opt,function(v, k){
            self.conf[k] = v;
        });
    };
    self.bind = function() {

        $(conf.tags.apiToolObj).bind('click', self.chageApi);
        $(conf.tags.container).delegate(conf.tags.addInput, 'click', self.addInput);
        $(conf.tags.container).delegate(conf.tags.removeInput, 'click', self.removeInput);
        $(conf.tags.btnSub).bind('click', self.sub);
        $(conf.tags.environment).bind('change',self.envchange);
        $(conf.tags.container).delegate('input,textarea,select', 'change', function(event) {
            var name = $(this).attr("name");
            name = name.replace(/\[(.*)\]/g, "");
            $(conf.tags.noticeObj).css('margin-top','8px');
            var $obj = $(this).parent().parent().find(conf.tags.noticeObj);
            if(conf.data[name] && conf.data[name].notice){
                $obj.html(conf.data[name].notice);
            }
            $obj.removeClass('errorinfo');
            conf.canSubmit = true;
            self.showNotice();
        });
    };
    /**
     * 生成Html
     */
    self.makeHtml = function() {
        $(conf.tags.container).html('');
        if (conf.data) {
            lib.eacho(conf.data, self.html);
        };
    };
    /**
     * 添加输入项
     * @param  {object} value 传入的数据项
     * @param  {string} key   key 值
     * @return {null}       [description]
     */
    self.html = function(value, key) {
        if(key == 'checkurl'){
            if($("input[name=environment]:checked").val() == 1){
                self.checkApp();
            }
        }
        if (typeof value.format == "object") {
            self.groupHtml(value, key);
            return;
        };
        if (value.format == "message") {
            self.selectHtml(value, key);
            return;
        };
        if (value.format == "select") {
            self.selectHtml(value, key);
            return;
        };
        var strPlusgin = '';
        var name = key;
        var strInput = '';
        //添加删除按钮
        if (value.isMulti) {
            strPlusgin = [
                '<div class="plusPlugin">',
                    '<a herf="javascript:void(0)" class="glyphicon glyphicon-plus plus" alt="添加输入项"></a>',
                    '<a herf="javascript:void(0)" class="glyphicon glyphicon-minus minus" alt="删除输入项"></a>',
                '</div>'].join('');
                name = key + '[]';
        };
        //输入框类型
        if (value.format == "text" || /^(.*)object$/i.test(value.format)) {
            strInput = '<textarea type="text" class="form-control" placeholder="请输入 ' + key + '" id="' + key + '" name="' + name + '" ></textarea>';
            if (value.format == 'messageObject') {
                strInput = '<textarea type="text" class="form-control" placeholder="请输入 ' + key + '" id="' + key + '" name="' + name + '" style="min-height: 200px;" defaultValue=\'' + lib.encodeJson(conf['messageObject']['defaultValue']) + '\'>' + lib.encodeJson(conf['messageObject']['defaultValue']) + '</textarea>';
            };
        } else {
            strInput = '<input type="text" class="form-control" placeholder="请输入 ' + key + '" id="' + key + '" name="' + name + '" value="">';
        }

        var strHtml = [
            '<div class="row param">',
                '<label class="col-xs-3 text-right control-label">' + key + '</label>',
                '<div class="col-sm-5" target="' + key + '">',
                    strInput,
                '</div>',
                strPlusgin,
                '<div class="help-block" style="margin-top:8px;margin-left:13px;color: #999;" target="' + key + '">' + value.notice + '</div>',
            '</div>'].join('');
        $(conf.tags.container).append(strHtml);
    };

    /**
     * 生成组类型的表单内容key: value
     */
    self.groupHtml = function(value, key) {
        var strPlusgin = '';
        var name = key;
        if (value.isMulti) {
            strPlusgin = [
                '<div class="plusPlugin">',
                    '<a herf="javascript:void(0)" class="glyphicon glyphicon-plus plus" alt="添加输入项"></a>',
                    '<a herf="javascript:void(0)" class="glyphicon glyphicon-minus minus" alt="删除输入项"></a>',
                '</div>'].join('');

        };
        var strInput = '';
        for(i in value.params) {
            strInput += '<label class="text-right control-label">' + i + '</label><input type="text" class="col-xs-4 form-input" placeholder="请输入 ' + i + '" id="' + name + '['+i + '][]" name="' + name + '['+i + '][]" value="">';
        }
        var strHtml = [
            '<div class="row param">',
                '<label class="col-xs-3 text-right control-label">' + value.title + '</label>',
                '<div class="col-sm-6 param_inner" target="">',
                    strInput,
                '</div>',
                strPlusgin,
                '<div class="help-block" style="margin-top:8px;margin-left:13px;color: #999;" target="">' + value.notice + '</div>',
            '</div>'].join('');
        $(conf.tags.container).append(strHtml);
    };

    /**
     * 生成选择表单
     * @param  {object} value key 值
     * @param  {string} key   key
     * @return {[type]}       [description]
     */
    self.selectHtml = function(value, key) {
        var strInput = '';
        if (value.messageType) {
            for(i in value.messageType) {
                if (!conf[value.format+"Object"]) {
                    conf[value.format+"Object"] = value.messageType[i];
                };
                if(i*1 == i ){
                    strInput += '<option value="' + i + '">' + value.messageType[i].title + '</option>';
                }else{
                    strInput += '<option value="' + i + '">' + i + '</option>';    
                }
                
            }
        };
        
        if('objectName'==key){
            strInput += '<option value="custom">自定义</option>';
        }

        var strHtml = [
            '<div class="row param">',
                '<label class="col-xs-3 text-right control-label">' + value.title + '</label>',
                '<div class="col-sm-5" target=""><select name="'+key+'" class="form-control">',
                    strInput,
                '</select></div>',
                '<div class="help-block" style="margin-top:8px;margin-left:13px;color: #999;" target="">' + value.notice + '</div>',
            '</div>'].join('');
        $(conf.tags.container).append(strHtml);
        $('select[name='+key+']').bind('change', function(event) {
            var val = $(this).val();
            $(this).parent().find('#objectName-custom').remove();
            if('custom'!=val){
                if(conf.objectName){
                    $(this).attr('name','objectName');
                }
                conf[value.format+"Object"] = value.messageType[val];
                $(this).parent().parent().next().find("textarea").attr('defaultValue', lib.encodeJson(conf[value.format+"Object"]['defaultValue']));
                $(this).parent().parent().next().find("textarea").val(lib.encodeJson(conf[value.format+"Object"]['defaultValue']));
                $(this).parent().parent().next().find("textarea").trigger("change");
            }else{
                if(conf.objectName){
                    $(this).attr('name','');
                }
                var str_after = '<input type="text" style="margin-top: 15px;" class="form-control" placeholder="请输入 自定义消息标识" id="objectName-custom" name="objectName" value="">';
            	$(this).after(str_after);
            	$(this).parent().parent().next().find("textarea").val('');
            }
        });
    }
    /**
     * 添加输入项
     */
    self.addInput = function() {
        var name = $(this).parent().prev(conf.tags.param).find("input").attr("name");
        var thisObj = $(conf.tags.container).find('input[name="' + name + '"]');
        var length = thisObj.length;
        if (length >= conf.maxInput) {
            return false;
        };
        var inputObj = $(this).parent().parent().clone();
        inputObj.find("input").each(function(index, el) {
            if ($(this).attr("default-val")) {
                $(this).val($(this).attr("default-val"));
            } else {
                $(this).val('');
            }
        });
        $(this).parent().parent().after(inputObj);
        length ++;
        thisObj = $(conf.tags.container).find('input[name="' + name + '"]');
        thisObj.each(function(index, el) {
                $(this).parent().next().find(conf.tags.removeInput).show();
            });
        if (length >= conf.maxInput) {
            thisObj.each(function(index, el) {
                $(this).parent().next().find(conf.tags.addInput).hide();
            });
        };
    };
    /**
     * 删除输入项
     */
    self.removeInput = function() {
        var name = $(this).parent().prev(conf.tags.param).find("input").attr("name");
        var thisObj = $(conf.tags.container).find('input[name="' + name + '"]');
        var length = thisObj.length;
        if (length == 1) {
            return false;
        };
        $(this).parent().parent().remove();

        length --;
        thisObj.each(function(index, el) {
                $(this).parent().next().find(conf.tags.addInput).show();
            });
        if (length == 1) {
            thisObj.each(function(index, el) {
                $(this).parent().next().find(conf.tags.removeInput).hide();
            });
        };
    };
    self.vail = function(value, key) {
        if (conf.canSubmit == false ) {return};
        var type = "input";
        if (/(.*)message(.*)/i.test(value.format)) {
            type = "textarea";
        };
        if (value.format == "message" || value.format == "select") {
            type = "select"
        };
        var obj = $(conf.tags.container).find(type + '[name="' + key + '"]');
        
        if (value.format == "message" && obj.length==0) {
            obj = $(conf.tags.container).find('input' + '[name="' + key + '"]');
            var custom = true;
        };
        
        if (obj.length == 0) {
            obj = $(conf.tags.container).find(type + '[name="' + key + '[]"]');
        };
        if (typeof value.format == "object") {
            for (var i in value.params) {
                self.vail(value.params[i], key + "[" + i + "][]");
                return;
            };
        };
        if (obj.length == 0) {conf.canSubmit = false; return false;};
        obj.each(function(index, el) {
            var val = $.trim($(this).val());
            var $noticeObj = $(this).parent().parent().find(conf.tags.noticeObj);
            
            if( value.format=="messageObject" ){
                try {
              	  $.parseJSON($(this).val());
              }catch (err) {
                  $noticeObj.html(key + " 格式错误");
                  $noticeObj.addClass('errorinfo');
                  conf.canSubmit = false;
                  return;
              }
            }
            
            if (value.isNecessary && val == "") {
                $noticeObj.html(key + " 不能为空");
                $noticeObj.addClass('errorinfo');
                if (value.format == "message" && custom) {
                	$noticeObj.css('margin-top','55px');
                };
                conf.canSubmit = false;
                return;
            };
            if (val != "" && value.length != 0 && lib.getRealLength(val) > value.length) {
                $noticeObj.html(key + " 最大长度为" + value.length + "个字节");
                $noticeObj.addClass('errorinfo');
                conf.canSubmit = false;
                return;
            };
            if ((val != "" && value.format == "string" && !lib.isString(val))
                || (val != "" && value.format == "int" && !lib.isInt(val))) {
                    $noticeObj.html(key + " 格式错误");
                    $noticeObj.addClass('errorinfo');
                    conf.canSubmit = false;
                    return;
            };
            if (value.format == "int" && value.max) {
                if (val > value.max) {
                    $noticeObj.html("超出最大值,最大值为 "+value.max);
                    $noticeObj.addClass('errorinfo');
                    conf.canSubmit = false;
                    return;
                };
            };
            if (value.format == "int" && value.min) {
                if (val < value.min) {
                    $noticeObj.html("最小值为 "+value.min);
                    $noticeObj.addClass('errorinfo');
                    conf.canSubmit = false;
                    return;
                };
            };
        });
    };
    /**
     * 更改调试接口并获取api接口信息
     * @return {[type]} [description]
     */
    self.chageApi = function() {
        self.showNotice();
        $(conf.tags.responseObj).find("pre>code").html("<br>");
        $(conf.tags.requestObj).find("pre>code").html("<br>");
        $(conf.tags.resultObj).html("<br>");
        for (var i in conf) {
            if (/^(.*)object/i.test(i)) {
                conf[i] = false;
            };
        };
        var apiId = $(this).attr('apiid');
        var $that = $(this);
        if (apiId) {
            $.ajax({
                url: 'GetParamsFormat.php',
                type: 'get',
                dataType: 'json',
                data: {apiId: apiId},
                success: function(data) {
                    if (data.code == '0000') {
                        conf.data = data.params;
                        self.makeHtml();
                        $(conf.tags.apiToolObj).removeClass('selected');
                        $that.addClass('selected');
                        conf.selectedApi = apiId;
                        var txt = $that.text();
                        $(conf.tags.selectApiName).html(txt);
                        txt = txt.replace(/\ /, "_");
                        var docUrl = data.docUrl!=''?data.docUrl:"http://docs.rongcloud.cn/server.html#" + txt +"_方法";
                        $(conf.tags.selectApiName).next("a")
                            .attr("href", docUrl);
                    } else {
                        self.showError("获取 api 接口信息失败");
                    }
                },
                error: function() {
                    self.showError("获取 api 接口信息失败");
                    return;
                }
            });
        };
    };
    self.sub = function() {
        lib.eacho(conf.data, self.vail);
        $(conf.tags.resultObj).html('<br>');
        $(conf.tags.responseObj).html('<pre><code class="hljs request"></code></pre>');
        $(conf.tags.requestObj).html('<pre><code class="hljs request"></code></pre>');
        if (conf.canSubmit == true) {
            self.showNotice();
            var strParams = $(conf.tags.container).serialize() + '&id='
                +  encodeURI($("#id").val()) + '&apiId=' + encodeURI(conf.selectedApi)
                + '&format=' + encodeURI($("input[name=format]:checked").val())
                + '&environment=' + encodeURI($("input[name=environment]:checked").val())
                + '&app_key=' + encodeURI($("input[name=app_key]").val())
                + '&app_secret=' + encodeURI($("input[name=app_secret]").val());

                // $('#myModa2_loading').modal('toggle');
                $("#sub-loading").show();
            $.ajax({
                url: 'ApiProcess.php',
                type: 'post',
                dataType: 'json',
                data: strParams,
                success: function(data) {
                    if (data.code == "0000") {
                        var contentType = 'application/x-www-form-urlencoded';
                        if(data.msg.type == "json"){
                            contentType = 'Application/json';
                        }
                        var first_split = data.msg.ret.httpInfo.url.split("//");
                        var without_resource = first_split[1];
                        var second_split = without_resource.split("/");
                        var domain = second_split[0];
                        var request = [
                            '<pre><code class="hljs">',
                            'POST ' + data.msg.uri + '.'+data.msg.format+' HTTP/1.1<br/>',
                            'Host: '+domain+'<br/>',
                            'App-Key: '+data.msg.app_key+'<br/>',
                            'Nonce: '+data.msg.Nonce+'<br/>',
                            'Timestamp: '+data.msg.Timestamp+'<br/>',
                            'Signature: '+data.msg.Signature+'<br/>',
                            'Content-Type: '+contentType+'<br/>',
                            'Content-Length: '+data.msg.requsetLength+' <br/>',
                            '<br/>',
                            data.msg.params+'</code></pre>'
                        ].join('');
                        var response = [
                            '<pre><code class="hljs">',
                            'HTTP/1.1 '+data.msg.code+'<br/>',
                            'Content-Type: application/'+data.msg.format+';charset=utf-8<br>Content-Length: '+data.msg.length+'<br>',
                            '<br/>',
                            data.msg.ret.ret,
                            '<br/></code></pre>'
                        ].join('');
                        // $('#myModa2_loading').modal('hide');
                        $("#sub-loading").hide();
                        $(conf.tags.responseObj).html(response);
                        $(conf.tags.requestObj).html(request);
                        $(conf.tags.resultObj).html(data.msg.ret.ret);
                    } else {

                         $("#sub-loading").hide();
                        // $('#myModa2_loading').modal('hide');
                        self.showError(data.msg.err);
                    }
                },
                error: function() {
                    self.showError("api 调试失败~！");
                }
            });
        }
    };
    self.showError = function(str) {
        $(conf.tags.errorObj).html(str);
        $(conf.tags.errorObj).show();
    };
    self.showNotice = function() {
        $(conf.tags.errorObj).hide();
    };
    self.checkApp = function(){
        var id = $("#id").val();
        var url = conf.data.checkurl['check'];
        console.log(url);
        $.get(url,{id:id},function(rs){
            if(rs.code == '200'){
               
            }else{
               
                if(!$("body").find("#myModa2_confirm").length > 0){
                     self.createPushHtml();
                }
                 $('#myModa2_confirm').modal({
                    backdrop:false,
                    keyboard:false
                 });
                 
                 $("#environment_2").trigger("click")
                 
            }
        },'json');
    };
    self.createPushHtml = function(){
        var html = '<div class="modal fade" id="myModa2_confirm" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
            html += '<div class="modal-dialog">';
            html += '<div class="modal-content" style="padding:0 30px;">';
            html += '<div class="modal-header">';
            html += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            html += '<h4 class="modal-title">开启提示</h4>';
            html += '</div>';
                   
            html += '<div class="modal-body text-center" style="padding-top: 35px;">';
            html += '<div class="alert alert-danger">';
            html += '您还没有在生产环境开启广播消息功能';
            html += '</div>';
            html += '<p style=" text-align:left;">生产环境功能开启后开始计费，最短使用期限为 5 天。开启设置完成后立即生效。 <a href="http://www.rongcloud.cn/pricing/" target="_blank">收费详情</a></p>';
                        
            html += '</div>';
            html += '<div class="modal-footer" style="text-align:center">';
            html += '<a href="/service/broadcast/'+$("#id").val()+'" class="btn btn-primary ">立即开启</a>';
            html += '</div>';
            html += '</div><!-- /.modal-content -->';
            html += '</div><!-- /.modal-dialog -->';
            html += '</div><!-- /.modal -->';
        $('.main-content').append(html);
    };
    self.envchange = function(){
        if($(this).val() == 1){
            self.checkApp();
        }
    };
    window[conf.name] = self;
})(window, document, window.jQuery);

//app
/*$(function() {

    // hideAllMsg();
    $('#apitrial')
        .ajaxForm(
        {
            url : '/apitrial/gettoken',
            type : 'post',
            dataType : 'json',
            beforeSubmit : function() {
                hideAllMsg();
                var userId = $('#userId').val();
                var name = $('#name').val();
                var portraitUri = $('#portraitUri').val();
                // 验证
                var checked = true;
                if (userId == '') {
                    showMsgAfter('userId', 'userId 不能为空');
                    checked = false;
                }
                if (name == '') {
                    showMsgAfter('name', '用户名称不能为空，最大长度128字节');
                    checked = false;
                }
                if (portraitUri == '') {
                    showMsgAfter('portraitUri', '用户头像 Uri 不能为空，最大长度1024字节');
                    checked = false;
                }


                if(checked){
                    $('input[type=submit]').attr('disabled', "disabled");
                }
                // alert(tags);
                return checked;
            },
            success : function(data) {
                if (data.code == '0000') {
                    var code = data.msg.code == 200 ? '200 OK' : data.msg.code;
                    if(data.msg.code == 200){
                        $('#token').val(data.msg.copy_token);
                        $('#copy-button').attr('data-clipboard-text',data.msg.copy_token);
                        $('input[type=button]').removeAttr('disabled');
                    }else{
                        $('#token_error').show();
                    }

                    var response_token = '<pre><code class="hljs">\
HTTP/1.1 '+code+'<br/>Content-Type: application/'+data.msg.format+';charset=utf-8<br\>Content-Length: '+data.msg.length+'<br\>\
<br/>\
'+data.msg.token+'\
<br/></code></pre>';


                    var request_toekn = ' <pre><code class="hljs">\
POST /user/getToken.'+data.msg.format+' HTTP/1.1<br/>\
Host: api.cn.ronghub.com<br/>\
App-Key: '+data.msg.app_key+'<br/>\
Nonce: '+data.msg.Nonce+'<br/>\
Timestamp: '+data.msg.Timestamp+'<br/>\
Signature: '+data.msg.Signature+'<br/>\
Content-Type: application/x-www-form-urlencoded <br/>\
Content-Length: '+data.msg.requsetLength+' <br/>\
<br/>\
'+data.msg.params+'\
                    </code></pre>';
                    $('#token_request').html(request_toekn);
                    $('#token_response').html(response_token);
                } else {
                    showMsgAfter(data.msg.target,data.msg.err);
                }
                $('input[type=submit]').removeAttr('disabled');
            },
            error : function() {
            }
        });
});
*/


//调试API
function select_environment(environment,oper) {
    var id = $('#id').val();

    if(id && oper) {
        $.ajax({
            type:'post',
            url:'/apitrial/GetAppInfo',
            data:{id:id,oper:oper,random:Math.round((Math.random()) * 100000000)},
            dataType:'json',
            success:function(data){
                if(data.code == '0000') {
                    $('#app_key').text(data.msg.app_id);
                    $('#app_secret').next(".showAppSecret").trigger('change');
                    $('#app_secret').attr("default", data.msg.app_secret);
                }else{

                }
            }
        });
    }
}


function select_url(environment) {
    if(environment) {
        if(1 == environment) {//生产
            $('#app_url').val($('#h_json_url').val());
        }else{               //开发
            $('#app_url').val($('#h_xml_url').val());
        }
    }
}
