<?php
/**
 *
 * 音视频状态同步路由接收
 * User: hejinyu
 * Date: 2019/10/10
 * Time: 15:30
 */
require "DbModel.php";
require "dao/Base.php";
error_reporting(E_ALL);
function adddata($data){
    if(!isset($data['appKey']) && !isset($data['channelId'])){
        return false;
    }
    $data['userId'] = isset($data['userId'])?$data['userId']:"";
    $member = json_encode($data['members']);
    $uSql = "INSERT INTO rtc_stat_recv SET appKey='{$data['appKey']}',channelId='{$data['channelId']}',sessionId='{$data['sessionId']}',event='{$data['event']}',userId='{$data['userId']}',timestamp='{$data['timestamp']}',token='{$data['token']}',members='{$member}'";
    DbModel::getInstance()->executeSql($uSql);
    return true;
}
$data = file_get_contents("php://input");
//字符串中 二维字段中包含json 需要 替换掉转义字符
$data = str_replace(['\\n','\n','\\\"','\"','"{','}"','"[',']"'],['','','"','"','{','}','[',']'],$data);
$data = json_decode($data,true);
$result = adddata($data);
//房间销毁 需要将所有的会话中的日志更改为 已结束
//1.先删除未接通的通话详单 2.将有效并且未结束的通话详单全部结束
function updateConversationData($data){
    deleteUnconnected($data);
    $uSql = "UPDATE rtc_conversation_detail SET end='{$data['timestamp']}',status=1 WHERE appKey = '{$data['appKey']}' and channelId = '{$data['channelId']}' and status = 0 ";
    DbModel::getInstance()->executeSql($uSql);
    updateConversationType($data);
    return true;
}
//更新会话详单中的会话类型
function updateConversationType($data){
    $sql = "SELECT * FROM rtc_stat_recv where channelId = '{$data['channelId']}' and event = 20 order by id asc" ;
    $result = DbModel::getInstance()->fetchRow($sql);
    if(!$result) return false;
    $result['members'] = json_decode($result['members'],true);
    $type = getTypeByData($result);
    //设置会话类型  更新时长
    $uSql = "UPDATE rtc_conversation_detail SET type = '{$type}',`times`=`end`-`start` WHERE appKey = '{$data['appKey']}' and channelId = '{$data['channelId']}' and type = -1";
    DbModel::getInstance()->executeSql($uSql);
}
//删除未接通会话详单
function deleteUnconnected($data){
    //查询已接听信令用户
    $sql = "SELECT fromuserid FROM rtc_signalling_recv where appKey = '{$data["appKey"]}' and channelId = '{$data["channelId"]}' and objectname='RC:SignallingSDK_Accept' " ;
    $result = DbModel::getInstance()->fetchAll($sql);
    $deleteSql = " delete from rtc_conversation_detail where appKey = '{$data["appKey"]}' and channelId = '{$data["channelId"]}' and status = 0 ";
    if($result){
        $result = Base::arrayToAssoc($result,'fromuserid',true);
        $acceptUserIds = '"'.implode('","',$result).'"';
        $deleteSql .=" and (pushUserId not in ({$acceptUserIds}) and subscribeUserId not in ({$acceptUserIds})) ";
    }
    DbModel::getInstance()->executeSql($deleteSql);
}
function getTypeByData($data){
    $typeList = $data['members'][0]['data']['uris'];
    $conversationType = (($typeList[0]['mediaType']+1)*$typeList[0]['state'])+(($typeList[1]['mediaType']+1)*$typeList[1]['state']);
    $conversationType = $conversationType - 1;
    return $conversationType;
}
//资源变更节点重新开始
function addConversationTypeData($data){
    $conversationType = getTypeByData($data);
    $uSql = "INSERT INTO rtc_conversation_type SET appKey='{$data['appKey']}',channelId='{$data['channelId']}',userId='{$data['userId']}',timestamp='{$data['timestamp']}',type='{$conversationType}'";
    DbModel::getInstance()->executeSql($uSql);
    return true;
}
if($result){//详单计算 会长状态同步只使用 房间销毁 事件
    switch ($data['event']){
        case 3://房间销毁
            updateConversationData($data);
            break;
        case 20://资源信息变更日志
            addConversationTypeData($data);
        default:
            break;
    }
}