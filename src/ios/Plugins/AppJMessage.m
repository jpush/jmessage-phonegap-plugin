//
//  AppJMessage.m
//  jmessage
//
//  Created by ljg on 15/12/28.
//
//

#import "AppJMessage.h"






@implementation AppJMessage


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
    [defaultCenter addObserver:self
                      selector:@selector(networkDidSetup:)
                          name:kJPFNetworkDidSetupNotification
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(networkIsConnecting:)
                          name:kJPFNetworkIsConnectingNotification
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(networkDidClose:)
                          name:kJPFNetworkDidCloseNotification
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(networkDidRegister:)
                          name:kJPFNetworkDidRegisterNotification
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(networkDidLogin:)
                          name:kJPFNetworkDidLoginNotification
                        object:nil];
    
    [defaultCenter addObserver:self
                      selector:@selector(receivePushMessage:)
                          name:kJPFNetworkDidReceiveMessageNotification
                        object:nil];
    
}


// notification from JPush
- (void)networkDidSetup:(NSNotification *)notification {
    NSLog(@"Event - networkDidSetup");
}

// notification from JPush
- (void)networkIsConnecting:(NSNotification *)notification {
    NSLog(@"Event - networkIsConnecting");
}

// notification from JPush
- (void)networkDidClose:(NSNotification *)notification {
    NSLog(@"Event - networkDidClose");
}

// notification from JPush
- (void)networkDidRegister:(NSNotification *)notification {
    NSLog(@"Event - networkDidRegister");
}

// notification from JPush
- (void)networkDidLogin:(NSNotification *)notification {
    NSLog(@"Event - networkDidLogin");
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
}





- (void)onReceiveMessage:(JMSGMessage *)message
                   error:(NSError *)error;
{
    
    //这里填充的dict 要和历史消息的一样
    NSLog(@"onReceiveMessage");
    NSMutableDictionary * dict = [NSMutableDictionary new];
    
    [dict setValue:message.msgId forKey:@"msgId"];
    [dict setValue:[NSNumber numberWithInt:message.contentType] forKey:@"contentType"];
    
    
    if (message.contentType == kJMSGContentTypeText && [message.content isKindOfClass:[JMSGTextContent class]]) {
        JMSGTextContent *textContent =  message.content;
        [dict setValue:textContent.text forKey:@"text"];
    }
    
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


//------------------------------JMessage end-----------------------------------


@end
