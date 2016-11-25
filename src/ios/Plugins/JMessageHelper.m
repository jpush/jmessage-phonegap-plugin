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


#import "JMessageHelper.h"
#import "ConstantDef.h"
#import <objc/runtime.h>

@implementation JMessageHelper

-(void)initJMessage:(NSDictionary*)launchOptions{
    //read appkey and channel from JMessageConfig.plist
    NSString *plistPath = [[NSBundle mainBundle] pathForResource:JMessageConfigFileName ofType:@"plist"];
    if (plistPath == nil) {
        NSLog(@"error: JMessageConfig.plist ");
        assert(0);
    }

    NSMutableDictionary *plistData = [[NSMutableDictionary alloc] initWithContentsOfFile:plistPath];
    NSString * appkey = [plistData valueForKey:JM_APP_KEY];
    NSString * channel = [plistData valueForKey:JM_APP_CHANNEL];

    // init third-party SDK
    [JMessage addDelegate:self withConversation:nil];
    [JMessage setupJMessage:launchOptions
                     appKey:appkey
                    channel:channel apsForProduction:NO
                   category:nil];
    [JPUSHService registerForRemoteNotificationTypes:(UIUserNotificationTypeBadge |
                                                      UIUserNotificationTypeSound |
                                                      UIUserNotificationTypeAlert)
                                          categories:nil];
    [self registerJPushStatusNotification];

}

- (void)registerJPushStatusNotification{
    NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];

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
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJPushReceiveMessage object:info];
}

- (void)onReceiveMessage:(JMSGMessage *)message error:(NSError *)error{
    NSString *jsonString = [message toJsonString];
    NSMutableDictionary *dict = [NSMutableDictionary new];
    [dict setValue:message.msgId forKey:KEY_MSGID];
    [dict setValue:jsonString forKey:KEY_CONTENT];
    [dict setValue:[NSString stringWithFormat:@"%ld",(long)message.contentType] forKey:KEY_CONTENTTYPE];

    if (message.contentType == kJMSGContentTypeImage) {
        [(JMSGImageContent*)message.content thumbImageData:^(NSData *data, NSString *objectId, NSError *error) {
            if (!error) {
                if (data) {
                    NSString *resourcePath;
                    Ivar ivar = class_getInstanceVariable([message.content class], "_resourcePath");
                    resourcePath = object_getIvar(message.content, ivar);
                    [dict setValue:objectId forKey:@"objectId"];
                    [dict setValue:resourcePath forKey:@"resourcePath"];
                    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveImageData object:dict];
                }
            }
        }];
    }

    if (message.contentType == kJMSGContentTypeVoice) {
        [(JMSGVoiceContent*)message.content voiceData:^(NSData *data, NSString *objectId, NSError *error) {
            if (!error) {
                if (data) {
                    NSString *resourcePath;
                    Ivar ivar = class_getInstanceVariable([message.content class], "_resourcePath");
                    resourcePath = object_getIvar(message.content, ivar);
                    [dict setValue:objectId forKey:@"objectId"];
                    [dict setValue:resourcePath forKey:@"resourcePath"];
                    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveVoiceData object:dict];
                }
            }

        }];
    }

    if (message.contentType == kJMSGContentTypeFile) {
        [(JMSGFileContent*)message.content fileData:^(NSData *data, NSString *objectId, NSError *error) {
            if (!error) {
                if (data) {
                    NSString *resourcePath;
                    Ivar ivar = class_getInstanceVariable([message.content class], "_resourcePath");
                    resourcePath = object_getIvar(message.content, ivar);
                    [dict setValue:objectId forKey:@"objectId"];
                    [dict setValue:resourcePath forKey:@"resourcePath"];
                    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveFileData object:dict];
                }
            }
        }];
    }

    if (message.contentType == kJMSGContentTypeLocation) {
        JMSGLocationContent *locContent = (JMSGLocationContent*)message.content;
        [dict setValue:[NSString stringWithFormat:@"%@",locContent.latitude]  forKey:@"latitude"];
        [dict setValue:[NSString stringWithFormat:@"%@",locContent.longitude] forKey:@"longitude"];
        [dict setValue:[NSString stringWithFormat:@"%@",locContent.scale]     forKey:@"scale"];
        [dict setValue:[NSString stringWithFormat:@"%@",locContent.address]   forKey:@"address"];
        [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveLocationData object:dict];
    }

    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveMessage object:dict];
}

- (void)onSendMessageResponse:(JMSGMessage *)message error:(NSError *)error{
    NSMutableDictionary * dict = [NSMutableDictionary new];
    [dict setValue:message.msgId forKey:KEY_MSGID];

    if (error == nil) {
        dict[KEY_RESPONE] = @"send message sucess";
    }else{
        dict[KEY_RESPONE]      = @"send message fail";
        dict[KEY_ERRORCODE]    = [NSNumber numberWithLong:error.code];
        dict[KEY_ERRORDESCRIP] = error.description;
    }
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageSendMessageRespone object:dict];
}

- (void)onReceiveMessageDownloadFailed:(JMSGMessage *)message{
    NSLog(@"onReceiveMessageDownloadFailed");
}

- (void)didReceiveRemoteNotification:(NSDictionary *)userInfo{
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJPushReceiveNotification object:userInfo];
}

#pragma mark - Conversation 回调

- (void)onConversationChanged:(JMSGConversation *)conversation{
    NSMutableDictionary * dict = [NSMutableDictionary new];
    dict = [conversation conversationToDictionary];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageConversationChanged object:dict];
}

- (void)onUnreadChanged:(NSUInteger)newCount{
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageUnreadChanged object:[NSNumber numberWithUnsignedInteger:newCount]];
}

#pragma mark - Group 回调

- (void)onGroupInfoChanged:(JMSGGroup *)group{
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageGroupInfoChanged object:[group groupToDictionary]];
}

#pragma mark - User 回调

-(void)onLoginUserKicked{
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageLoginUserKicked object:nil];
}

@end



#pragma mark - Category

@implementation NSDictionary (JPush)
-(NSString*)toJsonString{
    NSError  *error;
    NSData   *data       = [NSJSONSerialization dataWithJSONObject:self options:0 error:&error];
    NSString *jsonString = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    return jsonString;
}
@end

@implementation NSString (JPush)
-(NSMutableDictionary*)toDictionary{
    NSError             *error;
    NSData              *jsonData = [self dataUsingEncoding:NSUTF8StringEncoding];
    NSMutableDictionary *dict     = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
    return dict;
}
@end

@implementation JMSGConversation (JPush)
-(NSMutableDictionary*)conversationToDictionary{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    if ([self.target isKindOfClass:[JMSGUser class]]) {
        JMSGUser *user = self.target;
        dict = [user userToDictionary];
    }else{
        JMSGGroup *group = self.target;
        dict = [group groupToDictionary];
    }
    dict[KEY_LASTMESSAGE] = self.latestMessageContentText;
    dict[KEY_UNREADCOUNT] = self.unreadCount;
    return dict;
}
@end

@implementation JMSGUser (JPush)
-(NSMutableDictionary*)userToDictionary{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    dict[KEY_USERNAME]    = self.username;
    dict[KEY_NICKNAME]    = self.nickname;
    dict[KEY_AVATAR]      = self.avatar;
    dict[KEY_GENDER]      = [NSNumber numberWithInteger:self.gender];
    dict[KEY_BIRTHDAY]    = self.birthday;
    dict[KEY_REGION]      = self.region;
    dict[KEY_SIGNATURE]   = self.signature;
    dict[KEY_APP_KEY]     = self.appKey;
    dict[KEY_NOTE_NAME]   = self.noteName;
    dict[KEY_NOTE_TEXT]   = self.noteText;
    dict[@"isFriend"]   = [NSString stringWithFormat:@"%d",self.isFriend];
    return dict;
}
@end

@implementation JMSGGroup (JPush)
-(NSMutableDictionary*)groupToDictionary{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    dict[KEY_GROUP_GID]   = self.gid;
    dict[KEY_GROUP_NAME]  = self.name;
    dict[KEY_GROUP_DESC]  = self.desc;
    dict[KEY_GROUP_LEVEL] = self.level;
    dict[KEY_GROUP_GLAG]  = self.flag;
    dict[KEY_GROUP_OWNER] = self.owner;
    return dict;
}
@end

