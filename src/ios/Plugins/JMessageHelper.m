//
//  AppJMessage.m
//  jmessage
//
//  Created by ljg on 15/12/28.
//
//

#import "JMessageHelper.h"





@implementation JMessageHelper



-(void)initJMessage:(NSDictionary*)launchOptions
{
    // init third-party SDK
    [JMessage addDelegate:self withConversation:nil];
    
    [JMessage setupJMessage:launchOptions
                     appKey:JMSSAGE_APPKEY
                    channel:CHANNEL apsForProduction:NO
                   category:nil];
    
    [JPUSHService registerForRemoteNotificationTypes:(UIUserNotificationTypeBadge |
                                                      UIUserNotificationTypeSound |
                                                      UIUserNotificationTypeAlert)
                                          categories:nil];
  
    [self registerJPushStatusNotification];
}


- (void)registerJPushStatusNotification {
    NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  
  [JPUSHService setDebugMode];
  
    [defaultCenter addObserver:self
                      selector:@selector(receivePushMessage:)
                          name:kJPFNetworkDidReceiveMessageNotification
                        object:nil];
    
}


// notification from JPush
- (void)receivePushMessage:(NSNotification *)notification {
    NSLog(@"Event - receivePushMessage");
    
    NSDictionary *info = notification.userInfo;
    if (info) {
        NSLog(@"The message - %@", info);
    } else {
        NSLog(@"Unexpected - no user info in jpush mesasge");
    }
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJPushReceiveMessage
                                                      object:notification];
  
}




- (void)onReceiveMessage:(JMSGMessage *)message
                   error:(NSError *)error;
{
  
  NSString * jsonString =  [message toJsonString];
  
  NSLog(@"onReceiveMessage");
  NSMutableDictionary * dict = [NSMutableDictionary new];
  
  [dict setValue:jsonString forKey:@"content"];
  
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveMessage
                                                      object:dict];
}


- (void)onSendMessageResponse:(JMSGMessage *)message
                        error:(NSError *)error
{
    NSLog(@"onSendMessageResponse");
    
    NSMutableDictionary * dict = [NSMutableDictionary new];
    [dict setValue:message.msgId forKey:@"msgId"];
    
    if (error == nil) {
        [dict setValue:@"send message sucess" forKey:@"respone"];
    }else{
        [dict setValue:@"send message fail" forKey:@"respone"];
        [dict setValue:[NSNumber numberWithLong:error.code] forKey:@"error"];
        [dict setValue:error.description forKey:@"error"];
    }
    
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageSendSingleMessageRespone
                                                        object:dict];
}


- (void)onReceiveMessageDownloadFailed:(JMSGMessage *)message
{
    NSLog(@"onReceiveMessageDownloadFailed");
}


- (void)onConversationChanged:(JMSGConversation *)conversation
{
    NSLog(@"onConversationChanged");
    
    NSMutableDictionary * dict = [NSMutableDictionary new];
    
    JMSGUser *user = conversation.target;
    int nGender = (int) user.gender;
    
    [dict setValue:user.username forKey:@"targetId"];
    [dict setValue:user.nickname  forKey:@"nickname"];
    [dict setValue:user.avatar forKey:@"avatar"];
    [dict setValue:[NSNumber numberWithInt:nGender] forKey:@"gender"];
    
    [dict setValue:conversation.latestMessageContentText forKey:@"lastMessage"];
    [dict setValue:conversation.unreadCount forKey:@"unreadCount"];
    
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageConversationChange
                                                        object:dict];
  
}

- (void)onUnreadChanged:(NSUInteger)newCount
{
    NSLog(@"onUnreadChanged");
}


- (void)didReceiveRemoteNotification:(NSDictionary *)userInfo
{
  NSLog(@"收到通知:%@", [self logDic:userInfo]);
  [JPUSHService handleRemoteNotification:userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJPushReceiveNotification
                                                      object:userInfo];
}


// log NSSet with UTF8
// if not ,log will be \Uxxx
- (NSString *)logDic:(NSDictionary *)dic {
  if (![dic count]) {
    return nil;
  }
  NSString *tempStr1 =
  [[dic description] stringByReplacingOccurrencesOfString:@"\\u"
                                               withString:@"\\U"];
  NSString *tempStr2 =
  [tempStr1 stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""];
  NSString *tempStr3 =
  [[@"\"" stringByAppendingString:tempStr2] stringByAppendingString:@"\""];
  NSData *tempData = [tempStr3 dataUsingEncoding:NSUTF8StringEncoding];
  NSString *str =
  [NSPropertyListSerialization propertyListFromData:tempData
                                   mutabilityOption:NSPropertyListImmutable
                                             format:NULL
                                   errorDescription:NULL];
  return str;
}

//------------------------------JMessage end-----------------------------------

@end
