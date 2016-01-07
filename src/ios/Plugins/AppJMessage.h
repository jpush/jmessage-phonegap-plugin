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
#define JMSSAGE_APPKEY @"18e186ca16883add07b6d37a"
#define CHANNEL @""


#define kJJMessageReceiveMessage @"kJJMessageReceiveMessage"
#define kJJMessageConversationChange @"kJJMessageConversationChange"
#define kJJMessageSendSingleMessageRespone @"kJJMessageSendSingleMessageRespone"


@interface AppJMessage : NSObject<JMessageDelegate>

-(void)initJMessage:(NSDictionary*)launchOptions;

@end
