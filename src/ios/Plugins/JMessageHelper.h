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



#import <Foundation/Foundation.h>
#import <JMessage/JMessage.h>


// 需要填写为您自己的 JPush Appkey
#define JMSSAGE_APPKEY @"2972770d9e0d5bf547d8a66a"
#define CHANNEL @""


#define kJJMessageReceiveMessage @"kJJMessageReceiveMessage"
#define kJJMessageConversationChange @"kJJMessageConversationChange"
#define kJJMessageSendSingleMessageRespone @"kJJMessageSendSingleMessageRespone"
#define kJJPushReceiveNotification @"kJJPushReceiveNotification"
#define kJJPushReceiveMessage @"kJJPushReceiveMessage"


static NSInteger  errorNoFound =  kJMSGErrorSDKUserNotLogin;

static NSString * errorNoFoundString =  @"not found";
static NSString * errorParamString =  @"error param";
static NSString *const KEY_ERRORCODE = @"errorCode";
static NSString *const KEY_ERRORDESCRIP = @"errorDscription";
static NSString *const KEY_MESSAGEID = @"messageId";
static NSString *const KEY_CONTENTTYPE = @"contentType";
static NSString *const KEY_CONTENTTEXT = @"contentText";
static NSString *const KEY_LASTMESSAGE = @"lastMessage";
static NSString *const KEY_UNREADCOUNT = @"unreadCount";
static NSString *const KEY_CONTENT = @"content";
static NSString *const KEY_MSGID = @"msgId";
static NSString *const KEY_RESPONE = @"respone";
static NSString *const KEY_TARGETID = @"targetId";






@interface JMessageHelper : NSObject<JMessageDelegate>

- (void)initJMessage:(NSDictionary*)launchOptions;
- (void)didReceiveRemoteNotification:(NSDictionary *)userInfo;


@end
