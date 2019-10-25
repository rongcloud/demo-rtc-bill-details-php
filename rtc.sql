/*
Navicat MySQL Data Transfer

Source Server         :
Source Server Version : 50722
Source Host           :
Source Database       : rtc

Target Server Type    : MYSQL
Target Server Version : 50722
File Encoding         : 65001

Date: 2019-10-24 17:15:56
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for rtc_conversation_detail
-- ----------------------------
DROP TABLE IF EXISTS `rtc_conversation_detail`;
CREATE TABLE `rtc_conversation_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appKey` varchar(20) NOT NULL DEFAULT '',
  `channelId` varchar(50) NOT NULL DEFAULT '' COMMENT '房间号',
  `sessionId` varchar(20) NOT NULL DEFAULT '' COMMENT '房间唯一id channelId 为用户输入或自动生成 会重复使用',
  `start` bigint(20) NOT NULL DEFAULT '0' COMMENT '开始时间',
  `end` bigint(20) NOT NULL DEFAULT '0' COMMENT '结束时间',
  `pushUserId` varchar(64) NOT NULL DEFAULT '' COMMENT '发布人 Id',
  `subscribeUserId` varchar(64) NOT NULL DEFAULT '' COMMENT '订阅人 Id',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '人员会话状态 0 会话中 1会话结束',
  `times` int(11) NOT NULL COMMENT '会话时长',
  `callUser` varchar(64) NOT NULL DEFAULT '' COMMENT '主叫人 userId',
  `type` tinyint(1) NOT NULL DEFAULT '-1' COMMENT '会话类型 -1 未知 0 音频 1 :视频 2 音频+ 视频',
  PRIMARY KEY (`id`),
  KEY `appKey` (`appKey`),
  KEY `sessionId` (`sessionId`),
  KEY `channelId` (`channelId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='音视频会话详单表';

-- ----------------------------
-- Table structure for rtc_conversation_type
-- ----------------------------
DROP TABLE IF EXISTS `rtc_conversation_type`;
CREATE TABLE `rtc_conversation_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appKey` varchar(20) NOT NULL DEFAULT '',
  `channelId` varchar(50) NOT NULL DEFAULT '' COMMENT '房间号',
  `userId` varchar(64) NOT NULL DEFAULT '' COMMENT '资源发布人 Id',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '变更后资源类型 0:音频 1:视频 2音频+视频',
  `timestamp` bigint(20) DEFAULT NULL COMMENT '资源类型变更时间',
  PRIMARY KEY (`id`),
  KEY `appKey` (`appKey`),
  KEY `channelId` (`channelId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='音视频会话人员资源类型变更表';

-- ----------------------------
-- Table structure for rtc_signalling_recv
-- ----------------------------
DROP TABLE IF EXISTS `rtc_signalling_recv`;
CREATE TABLE `rtc_signalling_recv` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `appkey` varchar(50) DEFAULT NULL,
  `channelid` varchar(50) DEFAULT NULL COMMENT '房间号，频道唯一标识',
  `fromuserid` varchar(50) DEFAULT NULL COMMENT '发送者 ID',
  `objectname` varchar(50) DEFAULT NULL COMMENT 'RC:SignallingSDK（普通房间消息类型名称）RC:SignallingSDK_Query（属性变更自定义消息）RC:SignallingSDK_Invite（邀请信令）RC:SignallingSDK_Call（呼叫信令）RC:SignallingSDK_Accept（接听信令）RC:SignallingSDK_CancelInvite（取消邀请信令）RC:SignallingSDK_Reject（拒绝邀请信令）RC:SignallingSDK_Hangup（挂断信令）RC:SignallingSDK_Custom（自定义信令）',
  `content` varchar(1000) DEFAULT NULL COMMENT '消息体',
  `msguid` varchar(50) DEFAULT NULL COMMENT '消息唯一标识',
  `msgtimestamp` bigint(20) DEFAULT NULL COMMENT '服务端收到客户端发送消息时的服务器时间',
  `targetuserids` varchar(1000) DEFAULT NULL COMMENT '目标用户 ID',
  PRIMARY KEY (`id`),
  KEY `appkey` (`appkey`),
  KEY `channelid` (`channelid`),
  KEY `objectname` (`objectname`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for rtc_stat_recv
-- ----------------------------
DROP TABLE IF EXISTS `rtc_stat_recv`;
CREATE TABLE `rtc_stat_recv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appKey` varchar(20) NOT NULL DEFAULT '',
  `channelId` varchar(50) NOT NULL DEFAULT '' COMMENT '房间号',
  `sessionId` varchar(20) NOT NULL DEFAULT '' COMMENT '房间唯一id channelId 为用户输入或自动生成 会重复使用',
  `event` tinyint(2) NOT NULL COMMENT '事件：1 同步房间信息、2 房间创建、3 房间销毁、11 成员加入、12 成员退出、20 资源发生变动（发布资源或者取消发布资源）。',
  `userId` varchar(64) NOT NULL DEFAULT '' COMMENT '当前事件的用户 Id',
  `timestamp` bigint(19) NOT NULL DEFAULT '0' COMMENT '当前事件发生的时间戳',
  `token` varchar(255) NOT NULL DEFAULT '' COMMENT 'userId 所获取的 Token 用来订阅资源时验证请求合法性',
  `members` longtext NOT NULL COMMENT '用户信息，只有在同步房间信息时，members 里的 member 列表才是全量的，其他事件都是对应事件中的 user 信息，比如 user1 资源发布，那 members 里的信息只有 user1 的资源信息',
  PRIMARY KEY (`id`),
  KEY `appKey` (`appKey`),
  KEY `sessionId` (`sessionId`),
  KEY `channelId` (`channelId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='音视频房间状态同步日志表';
