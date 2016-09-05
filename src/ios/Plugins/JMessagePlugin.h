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
-(void)getMyInfo:(CDVInvokedUrlCommand *)command;//new
-(void)getUserInfo:(CDVInvokedUrlCommand *)command;//new
-(void)getUserInfoArray:(CDVInvokedUrlCommand *)command;//new
-(void)updateMyPassword:(CDVInvokedUrlCommand *)command;//new
-(void)updateMyInfo:(CDVInvokedUrlCommand *)command;//new

//Message
-(void)sendSingleTextMessage:(CDVInvokedUrlCommand *)command;
-(void)sendSingleVoiceMessage:(CDVInvokedUrlCommand *)command;//new
-(void)sendSingleImageMessage:(CDVInvokedUrlCommand *)command;//new
-(void)sendSingleCustomMessage:(CDVInvokedUrlCommand *)command;//new

-(void)sendGroupTextMessage:(CDVInvokedUrlCommand *)command;//new
-(void)sendGroupVoiceMessage:(CDVInvokedUrlCommand *)command;//new
-(void)sendGroupImageMessage:(CDVInvokedUrlCommand *)command;//new
-(void)sendGroupCustomMessage:(CDVInvokedUrlCommand *)command;//new

//Conversation
-(void)getSingleConversationHistoryMessage:(CDVInvokedUrlCommand *)command;
-(void)getAllSingleConversation:(CDVInvokedUrlCommand *)command;
-(void)deleteSingleConversation:(CDVInvokedUrlCommand *)command;

-(void)getGroupConversationHistoryMessage:(CDVInvokedUrlCommand *)command;//new
-(void)getAllGroupConversation:(CDVInvokedUrlCommand *)command;//new
-(void)deleteGroupConversation:(CDVInvokedUrlCommand *)command;//new

-(void)getAllConversation:(CDVInvokedUrlCommand *)command;//new

-(void)clearSingleUnreadCount:(CDVInvokedUrlCommand *)command;//new
-(void)clearGroupUnreadCount:(CDVInvokedUrlCommand *)command;//new

//Group
-(void)createGroupIniOS:(CDVInvokedUrlCommand *)command;//new
-(void)updateGroupInfo:(CDVInvokedUrlCommand *)command;//new
-(void)getGroupInfo:(CDVInvokedUrlCommand *)command;//new
-(void)myGroupArray:(CDVInvokedUrlCommand *)command;//new
-(void)memberArray:(CDVInvokedUrlCommand *)command;//new
-(void)addMembers:(CDVInvokedUrlCommand *)command;//new
-(void)removeMembers:(CDVInvokedUrlCommand *)command;//new
-(void)exitGroup:(CDVInvokedUrlCommand *)command;//new

//Cross App method

//Cross - Converstaion
-(void)cross_sendSingleTextMessage:(CDVInvokedUrlCommand *)command;//new
-(void)cross_sendSingleVoiceMessage:(CDVInvokedUrlCommand *)command;//new
-(void)cross_sendSingleImageMessage:(CDVInvokedUrlCommand *)command;//new
-(void)cross_sendSingleCustomMessage:(CDVInvokedUrlCommand *)command;//new

-(void)cross_getSingleConversationHistoryMessage:(CDVInvokedUrlCommand *)command;//new
-(void)cross_deleteSingleConversation:(CDVInvokedUrlCommand *)command;//new
-(void)cross_clearSingleUnreadCount:(CDVInvokedUrlCommand *)command;//new

//Cross - User
-(void)cross_getUserInfoArray:(CDVInvokedUrlCommand *)command;//new



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
-(void)beginLogPageView:(CDVInvokedUrlCommand *)command;//new

//设置角标到服务器,服务器下一次发消息时,会设置成这个值
//本接口不会改变应用本地的角标值.
-(void)setBadge:(CDVInvokedUrlCommand *)command;//new
//相当于 [setBadge:0]
-(void)resetBadge:(CDVInvokedUrlCommand *)command;//new

//应用本地的角标值设置/获取
-(void)setApplicationIconBadgeNumber:(CDVInvokedUrlCommand *)command;//new
-(void)getApplicationIconBadgeNumber:(CDVInvokedUrlCommand *)command;//new

//停止与恢复推送
-(void)stopPush:(CDVInvokedUrlCommand *)command;//new
-(void)resumePush:(CDVInvokedUrlCommand *)command;//new
-(void)isPushStopped:(CDVInvokedUrlCommand *)command;//new

//开关日志
-(void)setDebugModeFromIos:(CDVInvokedUrlCommand *)command;//new
-(void)setLogOFF:(CDVInvokedUrlCommand *)command;//new
-(void)crashLogON:(CDVInvokedUrlCommand *)command;//new

//本地推送
-(void)setLocalNotification:(CDVInvokedUrlCommand *)command;//new
-(void)deleteLocalNotificationWithIdentifierKey:(CDVInvokedUrlCommand *)command;//new
-(void)clearAllLocalNotifications:(CDVInvokedUrlCommand *)command;//new

//地理位置上报 [latitude,longitude]
-(void)setLocation:(CDVInvokedUrlCommand *)command;//new

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
