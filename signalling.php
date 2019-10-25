<?php
/**
 * 音视频状态信令同步路由接收
 * User: hejinyu
 * Date: 2019/10/9
 * Time: 19:01
 */
require "DbModel.php";
require "./dao/Base.php";
error_reporting(0);
//信令日志添加
function adddata($data){
    if(!isset($data['appKey']) && !isset($data['channelId'])){
        return false;
    }
    $content = json_encode($data['content']);
    $targetUserIds = json_encode($data['targetUserIds']);
    $uSql = "INSERT INTO rtc_signalling_recv SET appkey='{$data['appKey']}',channelid='{$data['channelId']}',fromuserid='{$data['fromUserId']}',objectname='{$data['objectName']}',content='{$content}',msguid='{$data['msgUID']}',msgtimestamp='{$data['msgTimestamp']}',targetuserids='{$targetUserIds}'";
    DbModel::getInstance()->executeSql($uSql);
    return true;
}
$data = file_get_contents("php://input");
//$data = '{"appKey":"c9kqb3rdkbb8j","channelId":"2A509384BA3ED2326CC14FAFE9A9A73F","fromUserId":"oYaMXqNey","targetUserIds":["BmxXGoUk1"],"objectName":"RC:SignallingSDK_Call","content":"{\n  \"voipPushContent\" : \"Hello\",\n  \"signalingType\" : 8,\n  \"channelId\" : \"2A509384BA3ED2326CC14FAFE9A9A73F\",\n  \"signalingContent\" : \"{\\n  \\\"mediaType\\\" : 2,\\n  \\\"toUserIdList\\\" : [\\n    \\\"qJofpqDt5\\\",\\n    \\\"BmxXGoUk1\\\"\\n  ],\\n  \\\"conversationType\\\" : 3,\\n  \\\"targetId\\\" : \\\"ZNZiaKkrW\\\"\\n}\"\n}","msgTimestamp":1571395929742,"msgUID":"BDRP-VGD3-H93H-G6M5"}';
//$data = '{"appKey":"c9kqb3rdkbb8j","channelId":"2A509384BA3ED2326CC14FAFE9A9A73F","fromUserId":"BmxXGoUk1","targetUserIds":["oYaMXqNey"],"objectName":"RC:SignallingSDK_Accept","content":"{\n  \"channelId\" : \"453523C00529BF7D77188FD1E1AF844E\",\n  \"signalingContent\" : \"{\\n  \\\"reason\\\" : 12\\n}\",\n  \"signalingType\" : 9\n}","msgTimestamp":1571395577540,"msgUID":"BDRP-SQDH-0N5H-A2NE"}';
//$data = '{"appKey":"c9kqb3rdkbb8j","channelId":"2A509384BA3ED2326CC14FAFE9A9A73F","fromUserId":"oYaMXqNey","targetUserIds":["BmxXGoUk1"],"objectName":"RC:SignallingSDK_Hangup","content":"{\n  \"voipPushContent\" :\"Hello\",\n  \"signalingType\" : 8,\n  \"channelId\" : \"2A509384BA3ED2326CC14FAFE9A9A73F\",\n  \"signalingContent\" : \"{\\n  \\\"mediaType\\\" : 2,\\n  \\\"toUserIdList\\\" : [\\n    \\\"qJofpqDt5\\\",\\n    \\\"BmxXGoUk1\\\"\\n  ],\\n  \\\"conversationType\\\" : 3,\\n  \\\"targetId\\\" : \\\"ZNZiaKkrW\\\"\\n}\"\n}","msgTimestamp":1571395929742,"msgUID":"BDRP-VGD3-H93H-G6M5"}';
//字符串中 二维字段中包含json 需要 替换掉转义字符
$data = str_replace(['\\\n','\\n','\n','\\\"','\"','"{','}"'],['','','','"','"','{','}'],$data);
$data = json_decode($data,true);
$result = adddata($data);
//会话详单添加
function addConversationData($data){
    $deleteSql = " delete from rtc_conversation_detail where appKey = '{$data["appKey"]}' and channelId = '{$data["channelId"]}' and status = 0 and (pushUserId='{$data['fromUserId']}' or subscribeUserId='{$data['fromUserId']}')";
    DbModel::getInstance()->executeSql($deleteSql);
    $accetpList = getAccetpList($data,1);
    $callUser = getCallUser($data);
    foreach ($data['targetUserIds'] as $UserId){
        if(in_array($UserId, $accetpList)){//还未接通用户不生成详单
            $subUserIsCall = $UserId==$callUser?1:0;
            $uSql = "INSERT INTO rtc_conversation_detail SET appKey='{$data['appKey']}',channelId='{$data['channelId']}',start='{$data['msgTimestamp']}',pushUserId='{$data['fromUserId']}',subscribeUserId='{$UserId}',callUser='{$callUser}'";
            DbModel::getInstance()->executeSql($uSql);
            $uSql = "INSERT INTO rtc_conversation_detail SET appKey='{$data['appKey']}',channelId='{$data['channelId']}',start='{$data['msgTimestamp']}',pushUserId='{$UserId}',subscribeUserId='{$data['fromUserId']}',callUser='{$callUser}'";
            DbModel::getInstance()->executeSql($uSql);
        }
    }
}
//会话详单更新
function updateConversationData($data){
    foreach ($data['targetUserIds'] as $UserId) {
        $uSql = "UPDATE rtc_conversation_detail SET end='{$data['msgTimestamp']}',status=1 WHERE appKey = '{$data['appKey']}' and channelId = '{$data['channelId']}' and ((pushUserId='{$data['fromUserId']}' and subscribeUserId = '{$UserId}') or (pushUserId='{$UserId}' and subscribeUserId = '{$data['fromUserId']}')) and status = 0";
        DbModel::getInstance()->executeSql($uSql);
    }
    if(count($data['targetUserIds']) == 1){//最后一个人退出 需要将所有的未接通的人会话全部删除掉
        deleteUnconnected($data);
    }
    return true;
}
//获取主叫方
function getCallUser($data){
    $sql = "SELECT fromuserid FROM rtc_signalling_recv where appKey = '{$data["appKey"]}' and channelId = '{$data["channelId"]}'  " ;
    $sql .=" and objectname='RC:SignallingSDK_Call' order by id desc";
    $result = DbModel::getInstance()->fetchRow($sql);
    return isset($result['fromuserid'])?$result['fromuserid']:"";
}
//查询已接听信令用户
function getAccetpList($data,$getCall= 0){
    $sql = "SELECT fromuserid FROM rtc_signalling_recv where appKey = '{$data["appKey"]}' and channelId = '{$data["channelId"]}' " ;
    if($getCall){
        $sql .=" and (objectname='RC:SignallingSDK_Accept' or objectname='RC:SignallingSDK_Call') ";
    }else{
        $sql .=" and objectname='RC:SignallingSDK_Accept'";
    }
    $result = DbModel::getInstance()->fetchAll($sql);
    $result = Base::arrayToAssoc($result,'fromuserid',true);
    return $result;
}
//删除未接通会话详单
function deleteUnconnected($data){
    $result = getAccetpList($data);
    $deleteSql = " delete from rtc_conversation_detail where appKey = '{$data["appKey"]}' and channelId = '{$data["channelId"]}' and status = 0 ";
    if($result){
        $acceptUserIds = '"'.implode('","',$result).'"';
        $deleteSql .=" and (pushUserId not in ({$acceptUserIds}) and subscribeUserId not in ({$acceptUserIds})) ";
    }
    DbModel::getInstance()->executeSql($deleteSql);
}
if($result){//详单计算
    $startSignalling = 'RC:SignallingSDK_Accept';
    $endSignalling = 'RC:SignallingSDK_Hangup';
    switch ($data['objectName']){
        case $startSignalling:
            addConversationData($data);
            break;
        case $endSignalling:
            updateConversationData($data);
            break;
        default:
            break;
    }
}

