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

@interface JMessageHelper : NSObject<JMessageDelegate>

- (void)initJMessage:(NSDictionary*)launchOptions;
- (void)didReceiveRemoteNotification:(NSDictionary *)userInfo;

@end


#pragma mark - Category

@interface NSDictionary (JPush)
-(NSString*)toJsonString;
@end

@interface NSString (JPush)
-(NSDictionary*)toDictionary;
@end

@interface JMSGConversation (JPush)
-(NSMutableDictionary*)conversationToDictionary;
@end

@interface JMSGUser (JPush)
-(NSMutableDictionary*)userToDictionary;
@end

@interface JMSGGroup (JPush)
-(NSMutableDictionary*)groupToDictionary;
@end

