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

#import "JMessagePlugin.h"
#import "ConstantDef.h"
#import <JMessage/JMessage.h>
#import "JMessageHelper.h"
#import <AVFoundation/AVFoundation.h>

#pragma mark - Cordova

@interface JMessagePlugin ()<JMSGEventDelegate>

@end

@implementation JMessagePlugin

#ifdef __CORDOVA_4_0_0

- (void)pluginInitialize {
    NSLog(@"### pluginInitialize ");
    [self initNotifications];
}

#else

- (CDVPlugin*)initWithWebView:(UIWebView*)theWebView{
    NSLog(@"### initWithWebView ");
    if (self=[super initWithWebView:theWebView]) {
        [self initNotifications];
    }
    return self;
}

#endif

- (void)onAppTerminate {
    NSLog(@"### onAppTerminate ");

}

- (void)onReset {
    NSLog(@"### onReset ");

}
- (void)dispose {
    NSLog(@"### dispose ");
}

#pragma mark - JMessagePlugin

#pragma mark IM - Private

//因为cordova 有lazy 特性，所以在不使用其他函数的情况下。这个函数作用在于激活插件
- (void)initPush:(CDVInvokedUrlCommand *)command {

}

-(void)initNotifications {

    NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
    [defaultCenter addObserver:self
                      selector:@selector(didReceiveJMessageMessage:)
                          name:kJJMessageReceiveMessage
                        object:nil];

    [defaultCenter addObserver:self
                      selector:@selector(conversationChanged:)
                          name:kJJMessageConversationChanged
                        object:nil];

    [defaultCenter addObserver:self
                      selector:@selector(didSendMessage:)
                          name:kJJMessageSendMessageRespone
                        object:nil];

    [defaultCenter addObserver:self
                      selector:@selector(networkDidReceiveMessage:)
                          name:kJJPushReceiveMessage
                        object:nil];

    [defaultCenter addObserver:self
                      selector:@selector(networkDidReceiveNotification:)
                          name:kJPushPluginReceiveNotification
                        object:nil];

    [defaultCenter addObserver:self
                      selector:@selector(networkDidReceiveNotification:)
                          name:kJPushPluginiOS10ForegroundReceiveNotification
                        object:nil];

    [defaultCenter addObserver:self
                      selector:@selector(networkDidReceiveNotification:)
                          name:kJPushPluginiOS10ClickNotification
                        object:nil];

    
    
    [defaultCenter addObserver:self
                      selector:@selector(unreadChanged:)
                          name:kJJMessageUnreadChanged
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(loginUserKicked:)
                          name:kJJMessageLoginUserKicked
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(groupInfoChanged:)
                          name:kJJMessageGroupInfoChanged
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(onReceiveImageData:)
                          name:kJJMessageReceiveImageData
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(onReceiveVoiceData:)
                          name:kJJMessageReceiveVoiceData
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(onReceiveFileData:)
                          name:kJJMessageReceiveFileData
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(onReceiveLocation:)
                          name:kJJMessageReceiveLocationData
                        object:nil];
}

#pragma mark IM - Notifications

-(void)didSendMessage:(NSNotification *)notification {
    [self commonSendMessage:@"onSendMessage" jsonParm:[notification.object toJsonString]];
}

- (void)conversationChanged:(NSNotification *)notification {
    [self commonSendMessage:@"onConversationChanged" jsonParm:[notification.object toJsonString]];
}

- (void)unreadChanged:(NSNotification *)notification{
    [self commonSendMessage:@"onUnreadChanged" jsonParm:[notification.object toJsonString]];
}

- (void)groupInfoChanged:(NSNotification *)notification{
    [self commonSendMessage:@"onGroupInfoChanged" jsonParm:[notification.object toJsonString]];
}

- (void)loginUserKicked:(NSNotification *)notification{
    [self commonSendMessage:@"onLoginUserKicked" jsonParm:@"login user kicked"];
}

//didReceiveJMessageMessage change name
- (void)didReceiveJMessageMessage:(NSNotification *)notification {
    NSDictionary *userInfo = [notification object];
    NSString *jsonString = [userInfo toJsonString];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"\"{" withString:@"{"];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"}\"" withString:@"}"];
    [self commonSendMessage:@"onReceiveConversationMessage" jsonParm:jsonString];
}

-(void)onReceiveImageData:(NSNotification*)notification{
    NSLog(@"JMessagePlugin onReceiveImageData");
    NSDictionary *userInfo = [notification object];
    NSString *jsonString = [userInfo toJsonString];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"\"{" withString:@"{"];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"}\"" withString:@"}"];
    [self commonSendMessage:@"onReceiveImageData" jsonParm:jsonString];
}

-(void)onReceiveVoiceData:(NSNotification*)notification{
    NSLog(@"JMessagePlugin onReceiveVoiceData");
    NSDictionary *userInfo = [notification object];
    NSString *jsonString = [userInfo toJsonString];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"\"{" withString:@"{"];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"}\"" withString:@"}"];
    [self commonSendMessage:@"onReceiveVoiceData" jsonParm:jsonString];
}

-(void)onReceiveFileData:(NSNotification*)notification{
    NSLog(@"JMessagePlugin onReceiveFileData");
    NSDictionary *userInfo = [notification object];
    NSString *jsonString = [userInfo toJsonString];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"\"{" withString:@"{"];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"}\"" withString:@"}"];
    [self commonSendMessage:@"onReceiveFileData" jsonParm:jsonString];
}

-(void)onReceiveLocation:(NSNotification*)notification{
    NSLog(@"JMessagePlugin onReceiveLocation");
    NSDictionary *userInfo = [notification object];
    NSString *jsonString = [userInfo toJsonString];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"\"{" withString:@"{"];
    jsonString = [jsonString stringByReplacingOccurrencesOfString:@"}\"" withString:@"}"];
    [self commonSendMessage:@"onReceiveLocation" jsonParm:jsonString];
}

-(void)commonSendMessage:(NSString *)functionName jsonParm:(NSString*)jsonString{
    WEAK_SELF(weakSelf);
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf.commandDelegate evalJs:[NSString stringWithFormat:@"%@.%@('%@')",Plugin_Name,functionName,jsonString]];
    });
}

#pragma mark IM - User

- (void)userRegister:(CDVInvokedUrlCommand *)command {
    NSString * username = [command argumentAtIndex:0];
    NSString * password = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGUser registerWithUsername:username password:password completionHandler:^(id resultObject, NSError *error) {
        [weakSelf handleResultWithValue:@"user register succeeded" command:command error:error log:@"user register"];
    }];
}

- (void)userLogin:(CDVInvokedUrlCommand *)command {
    NSLog(@"JMessageLogin");
    NSString * username = [command argumentAtIndex:0];
    NSString * password = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGUser loginWithUsername:username password:password completionHandler:^(id resultObject, NSError *error) {
        [weakSelf handleResultWithValue:@"regeister succeeded" command:command error:error log:@"user login"];
    }];
}

- (void)userLogout:(CDVInvokedUrlCommand *)command {
    NSLog(@"JMessageLogout");
    WEAK_SELF(weakSelf);
    [JMSGUser logout:^(id resultObject, NSError *error) {
        [weakSelf handleResultWithValue:@"login out succeeded" command:command error:error log:@"log out"];
    }];
}

- (void)getMyInfo:(CDVInvokedUrlCommand *)command {
    JMSGUser *user = [JMSGUser myInfo];
    NSError *error = nil;
    NSMutableDictionary *dict = [NSMutableDictionary new];

    if (user && user.username.length > 0) {//以此判断是否有用户信息
        dict = [user userToDictionary];
    }
    else{
        error = [NSError errorWithDomain:@"JMessagePlugin error" code:errorNoFound userInfo:@{@"description":errorNoFoundString}];
    }

    [self handleResultWithValue:dict command:command error:error];
}

- (void)getUserInfo:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    [JMSGConversation createSingleConversationWithUsername:username completionHandler:^(id resultObject, NSError *error) {
        NSMutableDictionary *dict = [NSMutableDictionary dictionary];
        if (error == nil) {
            JMSGUser *user = ((JMSGConversation*)resultObject).target;
            dict = [user userToDictionary];
        }
        [self handleResultWithValue:dict command:command error:error];
    }];
}

-(void)getUserInfoArray:(CDVInvokedUrlCommand *)command{
    NSArray *nameArr = [command argumentAtIndex:0];
    WEAK_SELF(weakSelf);
    [JMSGUser userInfoArrayWithUsernameArray:nameArr completionHandler:^(id resultObject, NSError *error) {
        NSMutableArray *arr = [NSMutableArray array];
        if (error == nil) {
            NSArray *users = resultObject;
            for (JMSGUser *user in users) {
                [arr addObject:[user userToDictionary]];
            }
        }
        [weakSelf handleResultWithValue:arr command:command error:error];
    }];
}

- (void)updateMyPassword:(CDVInvokedUrlCommand *)command{
    NSString *old = [command argumentAtIndex:0];
    NSString *new = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGUser updateMyPasswordWithNewPassword:new oldPassword:old completionHandler:^(id resultObject, NSError *error) {
        [weakSelf handleResultWithValue:@"update password" command:command error:error];
    }];
}

-(void)updateMyInfo:(CDVInvokedUrlCommand *)command{
    int type = [[command argumentAtIndex:0] intValue];
    id val;
    if (type == 5) {
        val = [NSData dataWithContentsOfFile:[command argumentAtIndex:1]];
    }else{
        val = [command argumentAtIndex:1];
    }
    WEAK_SELF(weak_self);
    [JMSGUser updateMyInfoWithParameter:val userFieldType:type completionHandler:^(id resultObject, NSError *error) {
        [weak_self handleResultWithValue:@"success" command:command error:error];
    }];
}

#pragma mark IM - Message

#pragma mark IM - Message - Single

- (void)sendSingleTextMessage:(CDVInvokedUrlCommand *)command {
    NSString *username = [command argumentAtIndex:0];
    NSString *text     = [command argumentAtIndex:1];
    WEAK_SELF(weak_self);
    
    [JMSGConversation createSingleConversationWithUsername:username completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            [conversation sendTextMessage:text];
        }
        [weak_self handleResultWithValue:@"send single text message" command:command error:error log:@"send single text message"];
    }];
}

- (void)sendSingleVoiceMessage:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *voiceUrl = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGConversation createSingleConversationWithUsername:username completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGMessage *voiceMessage = nil;
            AVAudioPlayer *play = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL fileURLWithPath:voiceUrl] error:nil];
            JMSGVoiceContent *voiceContent = [[JMSGVoiceContent alloc] initWithVoiceData:[NSData dataWithContentsOfFile:voiceUrl]
                                                                           voiceDuration:[NSNumber numberWithInteger:play.duration]];
            voiceMessage = [conversation createMessageWithContent:voiceContent];
            [conversation sendMessage:voiceMessage];
        }
        [weakSelf handleResultWithValue:@"send single voice message" command:command error:error log:@"send single voice message"];
    }];
}

- (void)sendSingleImageMessage:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *imageUrl = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGConversation createSingleConversationWithUsername:username completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            NSData *data = [NSData dataWithContentsOfFile:imageUrl];
            [conversation sendImageMessage:data];
        }
        [weakSelf handleResultWithValue:@"send single image message" command:command error:error log:@"send single image message"];
    }];
}

-(void)sendSingleCustomMessage:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *text     = [command argumentAtIndex:1];
    NSString *extra    = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGConversation createSingleConversationWithUsername:username completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGMessage *message = nil;
            JMSGTextContent *textContent = [[JMSGTextContent alloc] initWithText:text];
            [textContent addStringExtra:extra forKey:@"extra"];
            message = [conversation createMessageWithContent:textContent];//!
            [conversation sendMessage:message];
        }
        [weakSelf handleResultWithValue:@"send single custom message" command:command error:error log:@"send single custom message"];
    }];
}

#pragma mark IM - Message - Group

- (void)sendGroupTextMessage:(CDVInvokedUrlCommand *)command{
    NSString *gid  = [command argumentAtIndex:0];
    NSString *text = [command argumentAtIndex:1];
    WEAK_SELF(weak_self);
    [JMSGConversation createGroupConversationWithGroupId:gid completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            [conversation sendTextMessage:text];
        }
        [weak_self handleResultWithValue:@"send group text message" command:command error:error log:@"send group text message"];
    }];
}

- (void)sendGroupVoiceMessage:(CDVInvokedUrlCommand *)command{
    NSString *gid      = [command argumentAtIndex:0];
    NSString *voiceUrl = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGConversation createGroupConversationWithGroupId:gid completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGMessage *voiceMessage = nil;
            AVAudioPlayer *play = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL fileURLWithPath:voiceUrl] error:nil];
            JMSGVoiceContent *voiceContent = [[JMSGVoiceContent alloc] initWithVoiceData:[NSData dataWithContentsOfFile:voiceUrl]
                                                                           voiceDuration:[NSNumber numberWithInteger:play.duration]];
            voiceMessage = [conversation createMessageWithContent:voiceContent];
            [conversation sendMessage:voiceMessage];
        }
        [weakSelf handleResultWithValue:@"send single voice message" command:command error:error log:@"send single voice message"];
    }];
}

- (void)sendGroupImageMessage:(CDVInvokedUrlCommand *)command{
    NSString *gid      = [command argumentAtIndex:0];
    NSString *imageUrl = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGConversation createGroupConversationWithGroupId:gid completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            NSData *data = [NSData dataWithContentsOfFile:imageUrl];
            [conversation sendImageMessage:data];
        }
        [weakSelf handleResultWithValue:@"send single image message" command:command error:error log:@"send single image message"];
    }];
}

-(void)sendGroupCustomMessage:(CDVInvokedUrlCommand *)command{
    NSString *gid   = [command argumentAtIndex:0];
    NSString *text  = [command argumentAtIndex:1];
    NSString *extra = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGConversation createGroupConversationWithGroupId:gid completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGMessage *message = nil;
            JMSGTextContent *textContent = [[JMSGTextContent alloc] initWithText:text];
            [textContent addStringExtra:extra forKey:@"extra"];
            message = [conversation createMessageWithContent:textContent];//!
            [conversation sendMessage:message];
        }
        [weakSelf handleResultWithValue:@"send group custom message" command:command error:error log:@"send group custom message"];
    }];
}


#pragma mark IM - Conversation

#pragma mark IM - Conversation - Single

- (void)getSingleConversationHistoryMessage:(CDVInvokedUrlCommand *)command {
    WEAK_SELF(weakSelf);
    NSString *username = [command argumentAtIndex:0];
    NSNumber *from     = [command argumentAtIndex:1];
    NSNumber *limit    = [command argumentAtIndex:2];
    [JMSGConversation createSingleConversationWithUsername:username completionHandler:^(id resultObject, NSError *error) {
        NSMutableArray *resultArr = [NSMutableArray new];
        if (error == nil) {
            JMSGConversation * conversation = resultObject;
            NSArray * messageList =  [conversation messageArrayFromNewestWithOffset:from limit:limit];
            for (JMSGMessage * msg in messageList) {
                NSString * jsonString  = [msg toJsonString];
                [resultArr addObject:[jsonString toDictionary]];
            }
        }
        [weakSelf handleResultWithValue:resultArr command:command error:error log:@"JMessagePlugin Get Single History Message"];
    }];
}

- (void)getAllSingleConversation:(CDVInvokedUrlCommand *)command {
    WEAK_SELF(weakSelf);
    [JMSGConversation allConversations:^(id resultObject, NSError *error) {
        NSMutableArray *resultArr = [NSMutableArray new];
        if (error == nil) {
            NSArray * conversationArr = resultObject;
            for (JMSGConversation *conversation in conversationArr) {
                if (conversation.conversationType == kJMSGConversationTypeSingle) {
                    [resultArr addObject:[conversation conversationToDictionary]];
                }
            }
        }
        [weakSelf handleResultWithValue:resultArr command:command error:error];
    }];
}

- (void)deleteSingleConversation:(CDVInvokedUrlCommand *)command {
    NSString *username = [command argumentAtIndex:0];
    BOOL       success = [JMSGConversation deleteSingleConversationWithUsername:username];
    [self handleResultWithValue:[NSNumber numberWithBool:success] command:command log:@"delete single conversation"];
}

#pragma mark IM - Conversation - Group

- (void)getGroupConversationHistoryMessage:(CDVInvokedUrlCommand *)command{
    WEAK_SELF(weakSelf);
    NSString *rid   = [command argumentAtIndex:0];
    NSNumber *from  = [command argumentAtIndex:1];
    NSNumber *limit = [command argumentAtIndex:2];
    [JMSGConversation createGroupConversationWithGroupId:rid completionHandler:^(id resultObject, NSError *error) {
        NSMutableArray *resultArr = [NSMutableArray new];
        if (error == nil) {
            JMSGConversation * conversation = resultObject;
            NSArray * messageList =  [conversation messageArrayFromNewestWithOffset:from limit:limit];
            for (JMSGMessage * msg in messageList) {
                NSString * jsonString  = [msg toJsonString];
                [resultArr addObject:[jsonString toDictionary]];
            }
        }
        [weakSelf handleResultWithValue:resultArr command:command error:error log:@"JMessagePlugin Get Group History Message"];
    }];
}

-(void)getAllGroupConversation:(CDVInvokedUrlCommand *)command{
    WEAK_SELF(weakSelf);
    [JMSGConversation allConversations:^(id resultObject, NSError *error) {
        NSMutableArray *resultArr = [NSMutableArray new];
        if (error == nil) {
            NSArray * conversationArr = resultObject;
            for (JMSGConversation *conversation in conversationArr) {
                if (conversation.conversationType == kJMSGConversationTypeGroup) {
                    JMSGGroup *group = conversation.target;
                    NSMutableDictionary * dict = [group groupToDictionary];
                    dict[KEY_LASTMESSAGE] = conversation.latestMessageContentText;
                    dict[KEY_UNREADCOUNT] = conversation.unreadCount;
                    [resultArr addObject:dict];
                }
            }
        }
        [weakSelf handleResultWithValue:resultArr command:command error:error];
    }];
}

-(void)deleteGroupConversation:(CDVInvokedUrlCommand *)command{
    NSString *gid = [command argumentAtIndex:0];
    BOOL  success = [JMSGConversation deleteGroupConversationWithGroupId:gid];
    [self handleResultWithValue:[NSNumber numberWithBool:success] command:command log:@"delete group conversation"];
}

-(void)getAllConversation:(CDVInvokedUrlCommand *)command{
    WEAK_SELF(weakSelf);
    [JMSGConversation allConversations:^(id resultObject, NSError *error) {
        NSMutableArray *resultArr = [NSMutableArray new];
        if (error == nil) {
            NSArray * conversationArr = resultObject;
            for (JMSGConversation *conversation in conversationArr) {
                NSMutableDictionary * dict = nil;
                if (conversation.conversationType == kJMSGConversationTypeSingle) {
                    JMSGUser *user = conversation.target;
                    dict = [user userToDictionary];
                }else if (conversation.conversationType == kJMSGConversationTypeGroup){
                    JMSGGroup *group = conversation.target;
                    dict = [group groupToDictionary];
                }
                dict[@"timestamp"]    = conversation.latestMessage.timestamp;
                dict[KEY_LASTMESSAGE] = conversation.latestMessageContentText;
                dict[KEY_UNREADCOUNT] = conversation.unreadCount;
                [resultArr addObject:dict];
            }
        }
        [weakSelf handleResultWithValue:resultArr command:command error:error];
    }];
}

-(void)clearSingleUnreadCount:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    JMSGConversation *conversation =  [JMSGConversation singleConversationWithUsername:username];
    [conversation clearUnreadCount];
}

-(void)clearGroupUnreadCount:(CDVInvokedUrlCommand *)command{
    NSString *gid = [command argumentAtIndex:0];
    JMSGConversation *conversation =  [JMSGConversation groupConversationWithGroupId:gid];
    [conversation clearUnreadCount];
}


#pragma mark IM - Group

-(void)createGroupIniOS:(CDVInvokedUrlCommand *)command{
    NSString *name    = [command argumentAtIndex:0];
    NSString *desc    = [command argumentAtIndex:1];
    NSArray  *members = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGGroup createGroupWithName:name desc:desc memberArray:members completionHandler:^(id resultObject, NSError *error) {
        NSMutableDictionary *dict = [NSMutableDictionary dictionary];
        if (error == nil) {
            JMSGGroup *group = resultObject;
            dict = [group groupToDictionary];
        }
        [weakSelf handleResultWithValue:dict command:command log:@"create group"];
    }];
}

-(void)updateGroupInfo:(CDVInvokedUrlCommand *)command{
    NSString *groupId = [command argumentAtIndex:0];
    NSString *name    = [command argumentAtIndex:1];
    NSString *desc    = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGGroup updateGroupInfoWithGroupId:groupId name:name desc:desc completionHandler:^(id resultObject, NSError *error) {
        NSMutableDictionary *dict = [NSMutableDictionary dictionary];
        if (error == nil) {
            JMSGGroup *group = resultObject;
            dict = [group groupToDictionary];
        }
        [weakSelf handleResultWithValue:dict command:command log:@"update group info"];
    }];
}

-(void)getGroupInfo:(CDVInvokedUrlCommand *)command{
    NSString *groupId = [command argumentAtIndex:0];
    WEAK_SELF(weakSelf);
    [JMSGGroup groupInfoWithGroupId:groupId completionHandler:^(id resultObject, NSError *error) {
        NSMutableDictionary *dict = [NSMutableDictionary dictionary];
        if (error == nil) {
            JMSGGroup *group = resultObject;
            dict = [group groupToDictionary];
        }
        [weakSelf handleResultWithValue:dict command:command log:@"get group info"];
    }];
}

-(void)myGroupArray:(CDVInvokedUrlCommand *)command{
    WEAK_SELF(weakSelf);
    [JMSGGroup myGroupArray:^(id resultObject, NSError *error) {
        NSMutableArray *arr;
        if (error == nil) {
            arr = [NSMutableArray arrayWithArray:resultObject];
        }
        [weakSelf handleResultWithValue:arr command:command log:@"my group array"];
    }];
}

-(void)memberArray:(CDVInvokedUrlCommand *)command{
    NSString *groupId = [command argumentAtIndex:0];
    WEAK_SELF(weakSelf);
    [JMSGConversation createGroupConversationWithGroupId:groupId completionHandler:^(id resultObject, NSError *error) {
        NSArray *arr = nil;
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGGroup *group = conversation.target;
            arr = [group memberArray];
        }
        [weakSelf handleResultWithValue:arr command:command log:@"member array"];
    }];
}

-(void)addMembers:(CDVInvokedUrlCommand *)command{
    NSString *groupId = [command argumentAtIndex:0];
    NSArray  *members = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGConversation createGroupConversationWithGroupId:groupId completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGGroup *group = conversation.target;
            [group addMembersWithUsernameArray:members completionHandler:^(id resultObject, NSError *error) {
                if (error == nil && resultObject == nil) {
                    [weakSelf handleResultWithValue:@"1" command:command log:@"add members"];
                }else if (error){
                    [weakSelf handleResultWithValue:@"0" command:command error:error];
                }
            }];
        }

    }];
}

-(void)removeMembers:(CDVInvokedUrlCommand *)command{
    NSString *groupId = [command argumentAtIndex:0];
    NSArray  *members = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGConversation createGroupConversationWithGroupId:groupId completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGGroup *group = conversation.target;
            [group removeMembersWithUsernameArray:members completionHandler:^(id resultObject, NSError *error) {
                if (error == nil && resultObject == nil) {
                    [weakSelf handleResultWithValue:@"1" command:command log:@"remove members"];
                }else if (error){
                    [weakSelf handleResultWithValue:@"0" command:command error:error];
                }
            }];
        }

    }];
}

-(void)exitGroup:(CDVInvokedUrlCommand *)command{
    NSString *groupId = [command argumentAtIndex:0];
    WEAK_SELF(weakSelf);
    [JMSGConversation createGroupConversationWithGroupId:groupId completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGGroup *group = conversation.target;
            [group exit:^(id resultObject, NSError *error) {
                if (error == nil && resultObject == nil) {
                    [weakSelf handleResultWithValue:@"1" command:command log:@"exit group"];
                }else if (error){
                    [weakSelf handleResultWithValue:@"0" command:command error:error];
                }
            }];
        }

    }];
}


#pragma mark CrossApp

#pragma mark CrossApp - Converstaion

-(void)cross_sendSingleTextMessage:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appkey   = [command argumentAtIndex:1];
    NSString *text     = [command argumentAtIndex:2];
    WEAK_SELF(weak_self);
    [JMSGConversation createSingleConversationWithUsername:username appKey:appkey completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            [conversation sendTextMessage:text];
        }
        [weak_self handleResultWithValue:@"send single text message" command:command error:error log:@"send single text message"];
    }];
}

-(void)cross_sendSingleVoiceMessage:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appkey   = [command argumentAtIndex:1];
    NSString *voiceUrl = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGConversation createSingleConversationWithUsername:username appKey:appkey completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            AVAudioPlayer *play = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL fileURLWithPath:voiceUrl] error:nil];
            NSString *durationStr = [NSString stringWithFormat:@"%.1f", play.duration];
            NSNumber *durationNum = [NSNumber numberWithInteger:[durationStr integerValue]];
            [conversation sendVoiceMessage:[play data] duration:durationNum];
        }
        [weakSelf handleResultWithValue:@"send single voice message" command:command error:error log:@"send single voice message"];
    }];
}

-(void)cross_sendSingleImageMessage:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appkey   = [command argumentAtIndex:1];
    NSString *imageUrl = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGConversation createSingleConversationWithUsername:username appKey:appkey completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            NSData *data = [NSData dataWithContentsOfFile:imageUrl];
            [conversation sendImageMessage:data];
        }
        [weakSelf handleResultWithValue:@"send single image message" command:command error:error log:@"send single image message"];
    }];
}

-(void)cross_sendSingleCustomMessage:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appkey   = [command argumentAtIndex:1];
    NSString *text     = [command argumentAtIndex:2];
    NSString *extra    = [command argumentAtIndex:3];
    WEAK_SELF(weakSelf);
    [JMSGConversation createSingleConversationWithUsername:username appKey:appkey completionHandler:^(id resultObject, NSError *error) {
        if (error == nil) {
            JMSGConversation *conversation = resultObject;
            JMSGMessage *message = nil;
            JMSGTextContent *textContent = [[JMSGTextContent alloc] initWithText:text];
            [textContent addStringExtra:extra forKey:@"extra"];
            message = [conversation createMessageWithContent:textContent];//!
            [conversation sendMessage:message];
        }
        [weakSelf handleResultWithValue:@"cross send single custom message" command:command error:error log:@"cross send single custom message"];
    }];
}

-(void)cross_getSingleConversationHistoryMessage:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appkey   = [command argumentAtIndex:1];
    NSNumber *from     = [command argumentAtIndex:2];
    NSNumber *limit    = [command argumentAtIndex:3];
    WEAK_SELF(weakSelf);
    [JMSGConversation createSingleConversationWithUsername:username appKey:appkey completionHandler:^(id resultObject, NSError *error) {
        NSMutableArray *resultArr = [NSMutableArray new];
        if (error == nil) {
            JMSGConversation * conversation = resultObject;
            NSArray * messageList =  [conversation messageArrayFromNewestWithOffset:from limit:limit];
            for (JMSGMessage * msg in messageList) {
                NSString * jsonString  = [msg toJsonString];
                [resultArr addObject:[jsonString toDictionary]];
            }
        }
        [weakSelf handleResultWithValue:resultArr command:command error:error log:@"JMessagePlugin Get Cross Single History Message"];
    }];
}

-(void)cross_deleteSingleConversation:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appkey   = [command argumentAtIndex:1];
    BOOL       success = [JMSGConversation deleteSingleConversationWithUsername:username appKey:appkey];
    [self handleResultWithValue:[NSNumber numberWithBool:success] command:command log:@"delete cross single conversation"];
}

-(void)cross_clearSingleUnreadCount:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appkey   = [command argumentAtIndex:1];
    JMSGConversation *conversation =  [JMSGConversation singleConversationWithUsername:username appKey:appkey];
    [conversation clearUnreadCount];
}

#pragma mark CrossApp - User

-(void)cross_getUserInfoArray:(CDVInvokedUrlCommand *)command{
    NSArray *nameArr = [command argumentAtIndex:0];
    NSString *appkey = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGUser userInfoArrayWithUsernameArray:nameArr appKey:appkey completionHandler:^(id resultObject, NSError *error) {
        NSMutableArray *arr = [NSMutableArray array];
        if (error == nil) {
            NSArray *users = resultObject;
            for (JMSGUser *user in users) {
                [arr addObject:[user userToDictionary]];
            }
        }
        [weakSelf handleResultWithValue:arr command:command error:error];
    }];
}

#pragma mark - JPush

#pragma mark 设置标签、别名、回调

- (void)setTagsWithAlias:(CDVInvokedUrlCommand *)command {
    NSArray *arguments = command.arguments;
    if (!arguments||[arguments count]<2) {
        return ;
    }
    NSString *alias     = arguments[0];
    NSArray  *arrayTags = arguments[1];
    NSSet    *set       = [NSSet setWithArray:arrayTags];
    [JPUSHService setTags:set
                    alias:alias
         callbackSelector:@selector(tagsWithAliasCallback:tags:alias:)
                   object:self];
}

- (void)setTags:(CDVInvokedUrlCommand *)command {
    NSArray *tags = command.arguments;
    [JPUSHService setTags:[NSSet setWithArray:tags]
         callbackSelector:@selector(tagsWithAliasCallback:tags:alias:)
                   object:self];
}

- (void)setAlias:(CDVInvokedUrlCommand *)command {
    [JPUSHService setAlias:command.arguments[0]
          callbackSelector:@selector(tagsWithAliasCallback:tags:alias:)
                    object:self];
}

-(void)tagsWithAliasCallback:(int)resultCode tags:(NSSet *)tags alias:(NSString *)alias{
    NSDictionary *dict = @{@"resultCode":[NSNumber numberWithInt:resultCode],
                           @"tags"      :tags  == nil ? [NSNull null] : [tags allObjects],
                           @"alias"     :alias == nil ? [NSNull null] : alias
                           };
    [self.commandDelegate evalJs:[NSString stringWithFormat:@"cordova.fireDocumentEvent('jpush.setTagsWithAlias',%@)",[dict toJsonString]]];
}

#pragma mark 获取 RegistrationID

-(void)getRegistrationID:(CDVInvokedUrlCommand*)command{
    NSString* registrationID = [JPUSHService registrationID];
    NSLog(@"### getRegistrationID %@",registrationID);
    [self handleResultWithValue:registrationID command:command];
}

#pragma mark 页面统计

- (void)startLogPageView:(CDVInvokedUrlCommand *)command {
    NSArray *arguments = command.arguments;
    if (!arguments || [arguments count] < 1) {
        NSLog(@"startLogPageView argument  error");
        return ;
    }
    NSString * pageName = arguments[0];
    if (pageName) {
        [JPUSHService startLogPageView:pageName];
    }
}

- (void)stopLogPageView:(CDVInvokedUrlCommand *)command {
    NSArray *arguments = command.arguments;
    if (!arguments || [arguments count] < 1) {
        NSLog(@"stopLogPageView argument  error");
        return ;
    }
    NSString * pageName = arguments[0];
    if (pageName) {
        [JPUSHService stopLogPageView:pageName];
    }
}

-(void)beginLogPageView:(CDVInvokedUrlCommand*)command{
    NSArray *arguments = command.arguments;
    if (!arguments || [arguments count] < 2) {
        NSLog(@"beginLogPageView argument  error");
        return ;
    }
    NSString * pageName = arguments[0];
    int duration = [arguments[0] intValue];
    if (pageName) {
        [JPUSHService beginLogPageView:pageName duration:duration];
    }
}

#pragma mark badge

-(void)setBadge:(CDVInvokedUrlCommand *)command{
    NSArray *argument = command.arguments;
    if ([argument count] < 1) {
        NSLog(@"setBadge argument error!");
        return;
    }
    NSNumber *badge = argument[0];
    [JPUSHService setBadge:[badge intValue]];
}

-(void)resetBadge:(CDVInvokedUrlCommand *)command{
    [JPUSHService resetBadge];
}

-(void)setApplicationIconBadgeNumber:(CDVInvokedUrlCommand *)command{
    NSArray *argument = command.arguments;
    if ([argument count] < 1) {
        NSLog(@"setBadge argument error!");
        return;
    }
    NSNumber *badge = [argument objectAtIndex:0];
    [UIApplication sharedApplication].applicationIconBadgeNumber = [badge intValue];
}

-(void)getApplicationIconBadgeNumber:(CDVInvokedUrlCommand *)command {
    NSInteger num    = [UIApplication sharedApplication].applicationIconBadgeNumber;
    NSNumber *number = [NSNumber numberWithInteger:num];
    [self handleResultWithValue:number command:command];
}

#pragma mark 停止与恢复推送

-(void)stopPush:(CDVInvokedUrlCommand*)command{
    [[UIApplication sharedApplication] unregisterForRemoteNotifications];
}

-(void)resumePush:(CDVInvokedUrlCommand*)command{
    if ([[UIDevice currentDevice].systemVersion floatValue] >= 8.0) {
        //可以添加自定义categories
        [JPUSHService registerForRemoteNotificationTypes:(UIUserNotificationTypeBadge |
                                                          UIUserNotificationTypeSound |
                                                          UIUserNotificationTypeAlert)
                                              categories:nil];
    } else {
        //categories 必须为nil
        [JPUSHService registerForRemoteNotificationTypes:(UIRemoteNotificationTypeBadge |
                                                          UIRemoteNotificationTypeSound |
                                                          UIRemoteNotificationTypeAlert)
                                              categories:nil];
    }

}

-(void)isPushStopped:(CDVInvokedUrlCommand*)command{
    NSNumber *result;
    if ([[UIApplication sharedApplication] isRegisteredForRemoteNotifications]) {
        result = @(0);
    }else{
        result = @(1);
    }
    [self handleResultWithValue:result command:command];
}

#pragma mark 开关日志

-(void)setDebugModeFromIos:(CDVInvokedUrlCommand*)command{
    [JPUSHService setDebugMode];
}

-(void)setLogOFF:(CDVInvokedUrlCommand*)command{
    [JPUSHService setLogOFF];
}

-(void)crashLogON:(CDVInvokedUrlCommand*)command{
    [JPUSHService crashLogON];
}

#pragma mark 本地推送

-(void)setLocalNotification:(CDVInvokedUrlCommand*)command{
    NSArray      *arguments = command.arguments;
    NSDate       *date      = arguments[0] == [NSNull null] ? nil : [NSDate dateWithTimeIntervalSinceNow:[((NSString*)arguments[0]) intValue]];
    NSString     *alertBody = arguments[1] == [NSNull null] ? nil : (NSString*)arguments[1];
    int           badge     = arguments[2] == [NSNull null] ? 0   : [(NSString*)arguments[2] intValue];
    NSString     *idKey     = arguments[3] == [NSNull null] ? nil : (NSString*)arguments[3];
    NSDictionary *dict      = arguments[4] == [NSNull null] ? nil : (NSDictionary*)arguments[4];
    [JPUSHService setLocalNotification:date alertBody:alertBody badge:badge alertAction:nil identifierKey:idKey userInfo:dict soundName:nil];
}

-(void)deleteLocalNotificationWithIdentifierKey:(CDVInvokedUrlCommand*)command{
    [JPUSHService deleteLocalNotificationWithIdentifierKey:(NSString*)command.arguments[0]];
}

-(void)clearAllLocalNotifications:(CDVInvokedUrlCommand*)command{
    [JPUSHService clearAllLocalNotifications];
}

#pragma mark 地理位置上报

-(void)setLocation:(CDVInvokedUrlCommand*)command{
    [JPUSHService setLatitude:[((NSString*)command.arguments[0]) doubleValue] longitude:[((NSString*)command.arguments[1]) doubleValue]];
}

#pragma mark - JPush Private

-(void)commonPushRespone:(NSString *)functionName
                jsonParm:(NSString *)jsonString{
    [self.commandDelegate evalJs:[NSString stringWithFormat:@"%@.%@('%@')",Plugin_Push_Name,functionName,jsonString]];
}

- (void)networkDidReceiveMessage:(NSNotification *)notification {
    [self commonPushRespone:@"onReceiveMessageIniOS" jsonParm:[notification.object toJsonString]];
}

-(void)networkDidReceiveNotification:(NSNotification *)notification{
    switch ([UIApplication sharedApplication].applicationState) {
        case UIApplicationStateActive:{
            //前台收到
            [self commonPushRespone:@"onReceiveNofiticationIniOS" jsonParm:[notification.object toJsonString]];
        }
            break;
        case UIApplicationStateInactive:{
            //后台点击
            [self commonPushRespone:@"onOpenNofiticationIniOS" jsonParm:[notification.object toJsonString]];
        }
        case UIApplicationStateBackground:{
            //后台收到
            [self commonPushRespone:@"onBackgoundNotificationIniOS" jsonParm:[notification.object toJsonString]];
        }
            break;
        default:
            //do nothing
            break;
    }
}

#pragma mark - IM & JPush private

#pragma mark handleResult 将参数返回给js

-(void)handleResultWithValue:(id)value command:(CDVInvokedUrlCommand*)command{
    [self handleResultWithValue:value command:command error:nil log:nil];
}

-(void)handleResultWithValue:(id)value command:(CDVInvokedUrlCommand*)command log:(NSString*)log{
    [self handleResultWithValue:value command:command error:nil log:log];
}

-(void)handleResultWithValue:(id)value command:(CDVInvokedUrlCommand*)command error:(NSError*)error{
    [self handleResultWithValue:value command:command error:error log:nil];
}

-(void)handleResultWithValue:(id)value command:(CDVInvokedUrlCommand*)command error:(NSError*)error log:(NSString*)log{

    CDVPluginResult *result = nil;

    if (error == nil) {
        CDVCommandStatus status = CDVCommandStatus_OK;

        if ([value isKindOfClass:[NSString class]]) {
            value = [value stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        } else if ([value isKindOfClass:[NSNull class]]) {
            value = nil;
        }

        if ([value isKindOfClass:[NSObject class]]) {
            result = [CDVPluginResult resultWithStatus:status messageAsString:value];//NSObject 类型都可以
        } else {
            NSLog(@"JMessagePlugin Log: Cordova callback block returned unrecognized type: %@", NSStringFromClass([value class]));
            result = nil;
        }

        if (result != nil) {
            if (log) {
                NSLog(@"JMessagePlugin Log: %@ succeeded",log);
            }
        }else{
            if (log) {
                NSLog(@"JMessagePlugin Log: %@ failed",log);
            }
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        }


    }else{
        if (log) {
            NSLog(@"JMessagePlugin Log: %@ failed",log);
        }
        NSMutableDictionary * dict = [NSMutableDictionary new];
        [dict setValue:[NSNumber numberWithLong:error.code] forKey:KEY_ERRORCODE];
        [dict setValue:error.debugDescription forKey:KEY_ERRORDESCRIP];
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
    }


    WEAK_SELF(weakSelf);
    [weakSelf.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

#pragma mark - JMessage SDK v2.2.0~v2.2.1 新增

-(void)onReceiveNotificationEvent:(JMSGNotificationEvent *)event{
    NSString *eventType = [NSString stringWithFormat:@"%ld",(long)event.eventType];

    NSString *reason;
    NSString *username;
    NSDictionary *userDict;

    switch (event.eventType) {
        case kJMSGEventNotificationReceiveFriendInvitation:
        case kJMSGEventNotificationAcceptedFriendInvitation:
        case kJMSGEventNotificationDeclinedFriendInvitation:
        case kJMSGEventNotificationDeletedFriend:{
            JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *)event;
            reason   = [friendEvent getReason];
            username = [friendEvent getFromUsername];
            JMSGUser *user = [friendEvent getFromUser];
            userDict = [user userToDictionary];
        }
            break;
        default:
            break;
    }

    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    [dict setValuesForKeysWithDictionary:@{@"eventType":eventType,@"eveventDescriptionentD":event.eventDescription}];
    if (reason) {
        [dict setValue:reason forKey:@"reason"];
    }
    if (username) {
        [dict setValue:username forKey:@"username"];
    }
    if (userDict) {
        [dict setValue:[dict toJsonString] forKey:@"user"];
    }
    [self commonSendMessage:@"onReceiveNotificationEvent" jsonParm:[dict toJsonString]];

}

#pragma mark JMSGFriendManager

-(void)getFriendList:(CDVInvokedUrlCommand *)command{
    WEAK_SELF(weakSelf);
    [JMSGFriendManager getFriendList:^(id resultObject, NSError *error) {
        NSMutableArray *arr = [NSMutableArray array];
        if (error == nil) {
            NSArray *users = resultObject;
            for (JMSGUser *user in users) {
                [arr addObject:[user userToDictionary]];
            }
        }
        [weakSelf handleResultWithValue:arr command:command error:error];
    }];
}

-(void)sendInvitationRequest:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appKey   = [command argumentAtIndex:1];
    NSString *reason   = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGFriendManager sendInvitationRequestWithUsername:username appKey:appKey reason:reason completionHandler:^(id resultObject, NSError *error) {
        [weakSelf handleResultWithValue:@"send invitation request succeed" command:command error:error];
    }];
}

-(void)acceptInvitation:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appKey   = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGFriendManager acceptInvitationWithUsername:username appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        [weakSelf handleResultWithValue:@"accept invitation succeed" command:command error:error];
    }];
}

-(void)rejectInvitation:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appKey   = [command argumentAtIndex:1];
    NSString *reason   = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGFriendManager rejectInvitationWithUsername:username appKey:appKey reason:reason completionHandler:^(id resultObject, NSError *error) {
        [weakSelf handleResultWithValue:@"reject invitation succeed" command:command error:error];
    }];
}

-(void)removeFriend:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appKey   = [command argumentAtIndex:1];
    WEAK_SELF(weakSelf);
    [JMSGFriendManager removeFriendWithUsername:username appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        [weakSelf handleResultWithValue:@"remove friend succeed" command:command error:error];
    }];
}

#pragma mark JMSGUser

-(void)updateNoteName:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appKey   = [command argumentAtIndex:1];
    NSString *noteName = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGFriendManager getFriendList:^(id resultObject, NSError *aError) {
        if (aError == nil) {
            NSArray *users = resultObject;
            for (JMSGUser *user in users) {
                if ([user.username isEqualToString:username] && [user.appKey isEqualToString:appKey]) {
                    [user updateNoteName:noteName completionHandler:^(id resultObject, NSError *bError) {
                        [weakSelf handleResultWithValue:@"update note name succeed" command:command error:bError];
                    }];
                }
            }
        }
    }];
}

-(void)updateNoteText:(CDVInvokedUrlCommand *)command{
    NSString *username = [command argumentAtIndex:0];
    NSString *appKey   = [command argumentAtIndex:1];
    NSString *noteText = [command argumentAtIndex:2];
    WEAK_SELF(weakSelf);
    [JMSGFriendManager getFriendList:^(id resultObject, NSError *aError) {
        if (aError == nil) {
            NSArray *users = resultObject;
            for (JMSGUser *user in users) {
                if ([user.username isEqualToString:username] && [user.appKey isEqualToString:appKey]) {
                    [user updateNoteText:noteText completionHandler:^(id resultObject, NSError *bError) {
                        [weakSelf handleResultWithValue:@"update note text succeed" command:command error:bError];
                    }];
                }
            }
        }
    }];
}

#pragma mark JMSGConversation

-(void)sendFileMessage:(CDVInvokedUrlCommand *)command{
    NSString *name     = [command argumentAtIndex:0];
    NSString *appkey   = [command argumentAtIndex:1];
    NSString *single   = [command argumentAtIndex:2];
    NSString *filePath = [command argumentAtIndex:3];
    NSString *fileName = [command argumentAtIndex:4];

    if (single.boolValue) {
        if (appkey) {
            [JMSGConversation createSingleConversationWithUsername:name appKey:appkey completionHandler:^(id resultObject, NSError *error) {
                if (error == nil) {
                    JMSGConversation *conversation = resultObject;
                    NSData *data = [NSData dataWithContentsOfFile:filePath];
                    [conversation sendFileMessage:data fileName:fileName];
                }
            }];
        } else {
            [JMSGConversation createSingleConversationWithUsername:name completionHandler:^(id resultObject, NSError *error) {
                if (error == nil) {
                    JMSGConversation *conversation = resultObject;
                    NSData *data = [NSData dataWithContentsOfFile:filePath];
                    [conversation sendFileMessage:data fileName:fileName];
                }
            }];
        }
    } else {
        [JMSGConversation createGroupConversationWithGroupId:name completionHandler:^(id resultObject, NSError *error) {
            if (error == nil) {
                JMSGConversation *conversation = resultObject;
                NSData *data = [NSData dataWithContentsOfFile:filePath];
                [conversation sendFileMessage:data fileName:fileName];
            }
        }];
    }
}

-(void)sendLocationMessage:(CDVInvokedUrlCommand *)command{
    NSString *name      = [command argumentAtIndex:0];
    NSString *appkey    = [command argumentAtIndex:1];
    NSString *single    = [command argumentAtIndex:2];
    NSString *latitude  = [command argumentAtIndex:3];
    NSString *longitude = [command argumentAtIndex:4];
    NSString *scale     = [command argumentAtIndex:5];
    NSString *address   = [command argumentAtIndex:6];

    if (single.boolValue) {
        if (appkey) {
            [JMSGConversation createSingleConversationWithUsername:name appKey:appkey completionHandler:^(id resultObject, NSError *error) {
                if (error == nil) {
                    JMSGConversation *conversation = resultObject;
                    [conversation sendLocationMessage:[NSNumber numberWithFloat:[latitude floatValue]] longitude:[NSNumber numberWithFloat:[longitude floatValue]] scale:[NSNumber numberWithFloat:[scale floatValue]] address:address];
                }
            }];
        } else {
            [JMSGConversation createSingleConversationWithUsername:name completionHandler:^(id resultObject, NSError *error) {
                if (error == nil) {
                    JMSGConversation *conversation = resultObject;
                    [conversation sendLocationMessage:[NSNumber numberWithFloat:[latitude floatValue]] longitude:[NSNumber numberWithFloat:[longitude floatValue]] scale:[NSNumber numberWithFloat:[scale floatValue]] address:address];
                }
            }];
        }
    } else {
        [JMSGConversation createGroupConversationWithGroupId:name completionHandler:^(id resultObject, NSError *error) {
            if (error == nil) {
                JMSGConversation *conversation = resultObject;
                [conversation sendLocationMessage:[NSNumber numberWithFloat:[latitude floatValue]] longitude:[NSNumber numberWithFloat:[longitude floatValue]] scale:[NSNumber numberWithFloat:[scale floatValue]] address:address];
            }
        }];
    }
}


@end




