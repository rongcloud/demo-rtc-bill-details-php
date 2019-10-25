# rtc_conversation_demo
RTC 信令消息路由和 RTC 音视频会话状态路由实时计算会话详单 DEmo 

使用说明：
    
    1、执行环境：LNMP 环境，并且可外网访问：如：http://xxxx.com/index.php
    
    2、在开发者平台(https://developer.rongcloud.cn/audio/audio)开通音视频服务，并且设置会场同步地址为:http://xxxx.com/stat.php
    
    3、在开发者平台配置信令同步路由地址为：http://xxxx.com/signaling.php
    
    4、创建项目中的数据库 rtc，并且更改数据库的账号密码等信息，位置在 DbModel.php 中
    
    5、网页查看数据(http://xxxx.com/signaling.php)
    
    6、rtc_signalling_recv 表为音视频信令同步日志
       rtc_stat_recv 表为音视频房间状态同步日志
       rtc_conversation_detail 表为音视频实时会话详单
       rtc_conversation_type 表为音视频会话资源变更日志

