//	            __    __                ________
//	| |    | |  \ \  / /  | |    | |   / _______|
//	| |____| |   \ \/ /   | |____| |  / /
//	| |____| |    \  /    | |____| |  | |   _____
//	| |    | |    /  \    | |    | |  | |  |____ |
//  | |    | |   / /\ \   | |    | |  \ \______| |
//  | |    | |  /_/  \_\  | |    | |   \_________|
//
//	Copyright (c) 2012年 HXHG. All rights reserved.
//	http://www.jpush.cn
//  Created by liangjianguo
//



#import <Cordova/CDV.h>
#import <JMessage/JMessage.h>

@interface JMessagePlugin : CDVPlugin


//--------------- JMessage Interface ---------------//

//User
-(void)userRegister:(CDVInvokedUrlCommand *)command;
-(void)userLogin:(CDVInvokedUrlCommand *)command;
-(void)userLogout:(CDVInvokedUrlCommand *)command;
-(void)getMyInfo:(CDVInvokedUrlCommand *)command;
-(void)getUserInfo:(CDVInvokedUrlCommand *)command;
-(void)getUserInfoArray:(CDVInvokedUrlCommand *)command;
-(void)updateMyPassword:(CDVInvokedUrlCommand *)command;
-(void)updateMyInfo:(CDVInvokedUrlCommand *)command;

//Message
-(void)sendSingleTextMessage:(CDVInvokedUrlCommand *)command;
-(void)sendSingleVoiceMessage:(CDVInvokedUrlCommand *)command;
-(void)sendSingleImageMessage:(CDVInvokedUrlCommand *)command;
-(void)sendSingleCustomMessage:(CDVInvokedUrlCommand *)command;

-(void)sendGroupTextMessage:(CDVInvokedUrlCommand *)command;
-(void)sendGroupVoiceMessage:(CDVInvokedUrlCommand *)command;
-(void)sendGroupImageMessage:(CDVInvokedUrlCommand *)command;
-(void)sendGroupCustomMessage:(CDVInvokedUrlCommand *)command;

//Conversation
-(void)getSingleConversationHistoryMessage:(CDVInvokedUrlCommand *)command;
-(void)getAllSingleConversation:(CDVInvokedUrlCommand *)command;
-(void)deleteSingleConversation:(CDVInvokedUrlCommand *)command;

-(void)getGroupConversationHistoryMessage:(CDVInvokedUrlCommand *)command;
-(void)getAllGroupConversation:(CDVInvokedUrlCommand *)command;
-(void)deleteGroupConversation:(CDVInvokedUrlCommand *)command;

-(void)getAllConversation:(CDVInvokedUrlCommand *)command;

-(void)clearSingleUnreadCount:(CDVInvokedUrlCommand *)command;
-(void)clearGroupUnreadCount:(CDVInvokedUrlCommand *)command;

//Group
-(void)createGroupIniOS:(CDVInvokedUrlCommand *)command;
-(void)updateGroupInfo:(CDVInvokedUrlCommand *)command;
-(void)getGroupInfo:(CDVInvokedUrlCommand *)command;
-(void)myGroupArray:(CDVInvokedUrlCommand *)command;
-(void)memberArray:(CDVInvokedUrlCommand *)command;
-(void)addMembers:(CDVInvokedUrlCommand *)command;
-(void)removeMembers:(CDVInvokedUrlCommand *)command;
-(void)exitGroup:(CDVInvokedUrlCommand *)command;

//Cross App method

//Cross - Converstaion
-(void)cross_sendSingleTextMessage:(CDVInvokedUrlCommand *)command;
-(void)cross_sendSingleVoiceMessage:(CDVInvokedUrlCommand *)command;
-(void)cross_sendSingleImageMessage:(CDVInvokedUrlCommand *)command;
-(void)cross_sendSingleCustomMessage:(CDVInvokedUrlCommand *)command;

-(void)cross_getSingleConversationHistoryMessage:(CDVInvokedUrlCommand *)command;
-(void)cross_deleteSingleConversation:(CDVInvokedUrlCommand *)command;
-(void)cross_clearSingleUnreadCount:(CDVInvokedUrlCommand *)command;

//Cross - User
-(void)cross_getUserInfoArray:(CDVInvokedUrlCommand *)command;


#pragma mark - JMessage SDK v2.2.0~v2.2.1 新增 API
//--------------- JMessage SDK v2.2.0~v2.2.1 新增 API ---------------//

/*
    新增：好友功能
    新增：好友备注名和备注信息设置
    新增：发送文件消息
    新增：发送位置消息
    新增：适配 iOS 10
    新增：事件
*/

# pragma mark JMSGFriendManager

-(void)getFriendList:(CDVInvokedUrlCommand *)command;//获取好友列表
-(void)sendInvitationRequest:(CDVInvokedUrlCommand *)command;//发送添加好友请求
-(void)acceptInvitation:(CDVInvokedUrlCommand *)command;//接受好友邀请
-(void)rejectInvitation:(CDVInvokedUrlCommand *)command;//拒绝好友邀请
-(void)removeFriend:(CDVInvokedUrlCommand *)command;//删除好友

#pragma mark JMSGUser

-(void)updateNoteName:(CDVInvokedUrlCommand *)command;//修改用户备注名
-(void)updateNoteText:(CDVInvokedUrlCommand *)command;//修改用户备注信息

#pragma mark JMSGConversation

-(void)sendFileMessage:(CDVInvokedUrlCommand *)command;//发送文件消息
-(void)sendLocationMessage:(CDVInvokedUrlCommand *)command;//发送地理位置消息

#pragma mark 已过时接口
// onLoginUserKicked;// 改用 onReceiveNotificationEvent 方法统一监听被踢、用户信息过期、好友等通知事件






//--------------- JPush Interface ---------------//

-(void)initPush:(CDVInvokedUrlCommand *)command;

//设置标签、别名
-(void)setTagsWithAlias:(CDVInvokedUrlCommand *)command;
-(void)setTags:(CDVInvokedUrlCommand *)command;
-(void)setAlias:(CDVInvokedUrlCommand *)command;

//获取 RegistrationID
-(void)getRegistrationID:(CDVInvokedUrlCommand *)command;

//页面统计
-(void)startLogPageView:(CDVInvokedUrlCommand *)command;
-(void)stopLogPageView:(CDVInvokedUrlCommand *)command;
-(void)beginLogPageView:(CDVInvokedUrlCommand *)command;

//设置角标到服务器,服务器下一次发消息时,会设置成这个值
//本接口不会改变应用本地的角标值.
-(void)setBadge:(CDVInvokedUrlCommand *)command;
//相当于 [setBadge:0]
-(void)resetBadge:(CDVInvokedUrlCommand *)command;

//应用本地的角标值设置/获取
-(void)setApplicationIconBadgeNumber:(CDVInvokedUrlCommand *)command;
-(void)getApplicationIconBadgeNumber:(CDVInvokedUrlCommand *)command;

//停止与恢复推送
-(void)stopPush:(CDVInvokedUrlCommand *)command;
-(void)resumePush:(CDVInvokedUrlCommand *)command;
-(void)isPushStopped:(CDVInvokedUrlCommand *)command;

//开关日志
-(void)setDebugModeFromIos:(CDVInvokedUrlCommand *)command;
-(void)setLogOFF:(CDVInvokedUrlCommand *)command;
-(void)crashLogON:(CDVInvokedUrlCommand *)command;

//本地推送
-(void)setLocalNotification:(CDVInvokedUrlCommand *)command;
-(void)deleteLocalNotificationWithIdentifierKey:(CDVInvokedUrlCommand *)command;
-(void)clearAllLocalNotifications:(CDVInvokedUrlCommand *)command;

//地理位置上报 [latitude,longitude]
-(void)setLocation:(CDVInvokedUrlCommand *)command;

/*
 *  以下为js中可监听到的事件
 *  jpush.openNotification      点击推送消息启动或唤醒app
 *  jpush.setTagsWithAlias      设置标签、别名完成
 *  jpush.receiveMessage        收到自定义消息
 *  jpush.receiveNotification   前台收到推送
 *  jpush.backgoundNotification 后台收到推送
 */

-(void)handleResultWithValue:(id)value command:(CDVInvokedUrlCommand*)command;

@end
