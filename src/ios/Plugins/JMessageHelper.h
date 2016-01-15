//
//  AppJMessage.h
//  jmessage
//
//  Created by ljg on 15/12/28.
//
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


@interface JMessageHelper : NSObject<JMessageDelegate>

- (void)initJMessage:(NSDictionary*)launchOptions;
- (void)didReceiveRemoteNotification:(NSDictionary *)userInfo;


@end
