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
#import <JMessage/JMessage.h>
#import <AVFoundation/AVFoundation.h>
#import <objc/runtime.h>

#import "JMessageHelper.h"
#import "JMessageDefine.h"
#import "AppDelegate+JMessage.h"


#pragma mark - Cordova

#define ResultSuccess(method) [NSString stringWithFormat:@"success - %@",method]
#define ResultFailed(method)  [NSString stringWithFormat:@"failed  - %@",method]

@interface JMessagePlugin ()<JMessageDelegate, JMSGEventDelegate, UIApplicationDelegate>
@property(strong,nonatomic)CDVInvokedUrlCommand *callBack;
@property(strong,nonatomic)NSMutableDictionary *SendMsgCallbackDic;//{@"msgid": @"", @"callbackID": @""}
@end

JMessagePlugin *SharedJMessagePlugin;

@implementation JMessagePlugin


#ifdef __CORDOVA_4_0_0

- (void)pluginInitialize {
    NSLog(@"### pluginInitialize ");
    [self initNotifications];
    [self initPlugin];
}

#else

- (CDVPlugin*)initWithWebView:(UIWebView*)theWebView{
    NSLog(@"### initWithWebView ");
    if (self=[super initWithWebView:theWebView]) {
        [self initNotifications];
    }
    [self initPlugin];
    return self;
}

#endif

-(void)initPlugin{
    if (!SharedJMessagePlugin) {
        SharedJMessagePlugin = self;
        self.SendMsgCallbackDic = @{}.mutableCopy;
        //    [JMessage addDelegate:self withConversation:nil];
        //    [JMSGFriendManager getFriendList:^(id resultObject, NSError *error) {
        //
        //    }];
        
    }
}

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

-(void)startJMessageSDK:(CDVInvokedUrlCommand *)command{
    [(AppDelegate*)[UIApplication sharedApplication].delegate startJMessageSDK];
}


#pragma mark IM - Private

//因为cordova 有lazy 特性，所以在不使用其他函数的情况下。这个函数作用在于激活插件
- (void)init:(CDVInvokedUrlCommand *)command {
    self.callBack = command;
    NSDictionary * param = [command argumentAtIndex:0];
    [[JMessageHelper shareInstance] initJMessage:param];
}

- (void)setDebugMode:(CDVInvokedUrlCommand *)command {
  NSDictionary *param = [command.arguments objectAtIndex:0];
  if (param[@"enable"]) {
    [JMessage setDebugMode];
  } else {
    [JMessage setLogOFF];
  }
}

-(void)initNotifications {
    
    NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
    // have
    [defaultCenter addObserver:self
                      selector:@selector(didReceiveJMessageMessage:)
                          name:kJJMessageReceiveMessage
                        object:nil];
    
    [defaultCenter addObserver:self
                      selector:@selector(conversationChanged:)
                          name:kJJMessageConversationChanged
                        object:nil];
    // have
    [defaultCenter addObserver:self
                      selector:@selector(didSendMessage:)
                          name:kJJMessageSendMessageRespone
                        object:nil];
    
    [defaultCenter addObserver:self
                      selector:@selector(unreadChanged:)
                          name:kJJMessageUnreadChanged
                        object:nil];
    // have
    [defaultCenter addObserver:self
                      selector:@selector(loginStateChanged:)
                          name:kJJMessageLoginStateChanged
                        object:nil];
    // have
    [defaultCenter addObserver:self
                      selector:@selector(onContactNotify:)
                          name:kJJMessageContactNotify
                        object:nil];
    [defaultCenter addObserver:self
                      selector:@selector(didReceiveRetractMessage:)
                          name:kJJMessageRetractMessage
                        object:nil];
    
    
    [defaultCenter addObserver:self
                      selector:@selector(groupInfoChanged:)
                          name:kJJMessageGroupInfoChanged
                        object:nil];
    // have
    [defaultCenter addObserver:self
                      selector:@selector(onSyncOfflineMessage:)
                          name:kJJMessageSyncOfflineMessage
                        object:nil];
    // have
    [defaultCenter addObserver:self
                      selector:@selector(onSyncRoamingMessage:)
                          name:kJJMessageSyncRoamingMessage
                        object:nil];
}

#pragma mark IM - Notifications
- (void)onSyncOfflineMessage: (NSNotification *) notification {
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"eventName": @"syncOfflineMessage", @"value": notification.object}];
    [result setKeepCallback:@(true)];
    [self.commandDelegate sendPluginResult:result callbackId:self.callBack.callbackId];
}

- (void)onSyncRoamingMessage: (NSNotification *) notification {
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"eventName": @"syncRoamingMessage", @"value": notification.object}];
    [result setKeepCallback:@(true)];
    [self.commandDelegate sendPluginResult:result callbackId:self.callBack.callbackId];
}

-(void)didSendMessage:(NSNotification *)notification {
    NSDictionary *response = notification.object;
    
    CDVPluginResult *result = nil;
    
    if (response[@"error"] == nil) {
        CDVCommandStatus status = CDVCommandStatus_OK;
        result = [CDVPluginResult resultWithStatus:status messageAsDictionary:response[@"message"]];
    } else {
        NSError *error = response[@"error"];
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:@{@"code": @(error.code), @"description": [error description]}];
    }
    
    NSDictionary *msgDic = response[@"message"];
    NSString *callBackID = self.SendMsgCallbackDic[msgDic[@"id"]];
    if (callBackID) {
        [self.commandDelegate sendPluginResult:result callbackId:callBackID];
        [self.SendMsgCallbackDic removeObjectForKey:msgDic[@"id"]];
    } else {
        return;
    }
}

- (void)conversationChanged:(NSNotification *)notification {
    [JMessagePlugin evalFuntionName:@"onConversationChanged" jsonParm:[notification.object toJsonString]];
}

- (void)unreadChanged:(NSNotification *)notification{
    [JMessagePlugin evalFuntionName:@"onUnreadChanged" jsonParm:[notification.object toJsonString]];
}

- (void)groupInfoChanged:(NSNotification *)notification{
    [JMessagePlugin evalFuntionName:@"onGroupInfoChanged" jsonParm:[notification.object toJsonString]];
}

- (void)loginStateChanged:(NSNotification *)notification{
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"eventName": @"loginStateChanged", @"value": notification.object}];
    
    [result setKeepCallback:@(true)];
    [self.commandDelegate sendPluginResult:result callbackId:self.callBack.callbackId];
}

- (void)onContactNotify:(NSNotification *)notification{
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"eventName": @"contactNotify", @"value": notification.object}];
    
    [result setKeepCallback:@(true)];
    [self.commandDelegate sendPluginResult:result callbackId:self.callBack.callbackId];
}

- (void)didReceiveRetractMessage:(NSNotification *)notification{
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"eventName": @"retractMessage", @"value": notification.object}];
    
    [result setKeepCallback:@(true)];
    [self.commandDelegate sendPluginResult:result callbackId:self.callBack.callbackId];
}

//didReceiveJMessageMessage change name
- (void)didReceiveJMessageMessage:(NSNotification *)notification {
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"eventName": @"receiveMessage", @"value": notification.object}];
    [result setKeepCallback:@(true)];
    
    [self.commandDelegate sendPluginResult:result callbackId:self.callBack.callbackId];
}

+(void)evalFuntionName:(NSString*)functionName jsonParm:(NSString*)jsonString{
    dispatch_async(dispatch_get_main_queue(), ^{
        [SharedJMessagePlugin.commandDelegate evalJs:[NSString stringWithFormat:@"%@.%@('%@')",JMessagePluginName,functionName,jsonString]];
    });
}

+(void)fireDocumentEvent:(NSString*)eventName jsString:(NSString*)jsString{
    dispatch_async(dispatch_get_main_queue(), ^{
        [SharedJMessagePlugin.commandDelegate evalJs:[NSString stringWithFormat:@"cordova.fireDocumentEvent('jmessage.%@',%@)", eventName, jsString]];
    });
}

//#pragma mark IM - User

-(void)handleResultWithDictionary:(NSDictionary *)value command:(CDVInvokedUrlCommand*)command error:(NSError*)error{
    
    CDVPluginResult *result = nil;
    
    if (error == nil) {
        CDVCommandStatus status = CDVCommandStatus_OK;
        result = [CDVPluginResult resultWithStatus:status messageAsDictionary:value];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                               messageAsDictionary:@{@"code": @(error.code), @"description": [error description]}];
    }
    
    //  WEAK_SELF(weakSelf);
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void)handleResultWithArray:(NSArray *)value command:(CDVInvokedUrlCommand*)command error:(NSError*)error{
    
    CDVPluginResult *result = nil;
    
    if (error == nil) {
        CDVCommandStatus status = CDVCommandStatus_OK;
        result = [CDVPluginResult resultWithStatus:status messageAsArray: value];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:@{@"code": @(error.code), @"description": [error description]}];
    }
    
    //  WEAK_SELF(weakSelf);
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)returnParamError:(CDVInvokedUrlCommand *)command {
    NSError *error = [NSError errorWithDomain:@"param error" code: 1 userInfo: nil];
    [self handleResultWithDictionary:nil command:command error: error];
}

- (void)returnMediaFileError:(CDVInvokedUrlCommand *)command {
    NSError *error = [NSError errorWithDomain:@"media file not exit!" code: 1 userInfo: nil];
    [self handleResultWithDictionary:nil command:command error: error];
}

- (void)returnErrorWithLog:(NSString *)log command:(CDVInvokedUrlCommand *)command {
    NSError *error = [NSError errorWithDomain:log code: 1 userInfo: nil];
    [self handleResultWithDictionary:nil command:command error: error];
}

- (void)userRegister:(CDVInvokedUrlCommand *)command {
    
    NSDictionary * user = [command argumentAtIndex:0];
    NSLog(@"username %@",user);
    if (user[@"username"] && user[@"password"]) {
        
        [JMSGUser registerWithUsername: user[@"username"] password: user[@"password"] completionHandler:^(id resultObject, NSError *error) {
            if (!error) {
                [self handleResultWithDictionary:@{} command:command error: nil];
            } else {
                [self handleResultWithDictionary:nil command:command error: error];
            }
        }];
    } else {
        [self returnParamError:command];
    }
    
    
}

- (void)userLogin:(CDVInvokedUrlCommand *)command {
    NSDictionary * user = [command argumentAtIndex:0];
    NSLog(@"username %@",user);
    if (user[@"username"] && user[@"password"]) {
        [JMSGUser loginWithUsername:user[@"username"] password:user[@"password"] completionHandler:^(id resultObject, NSError *error) {
            if (!error) {
              JMSGUser *myInfo = [JMSGUser myInfo];
              // 为了和 android 行为一致，在登录的时候自动下载缩略图
              [myInfo thumbAvatarData:^(NSData *data, NSString *objectId, NSError *error) {
                [self handleResultWithDictionary:@{} command:command error: nil];
              }];
            } else {
                [self handleResultWithDictionary:nil command:command error: error];
            }
        }];
    } else {
        [self returnParamError:command];
    }
}

- (void)userLogout:(CDVInvokedUrlCommand *)command {
    [JMSGUser logout:^(id resultObject, NSError *error) {}];
}

- (void)getMyInfo:(CDVInvokedUrlCommand *)command {
    JMSGUser *myInfo = [JMSGUser myInfo];
    if (myInfo.username == nil) {
        [self handleResultWithDictionary: @{} command:command error: nil];
    } else {
        [self handleResultWithDictionary: [myInfo userToDictionary] command:command error: nil];
    }
}

- (void)getUserInfo:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    if (param[@"username"]) {
        [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (!error) {
                NSArray *users = resultObject;
                JMSGUser *user = users[0];
                [self handleResultWithDictionary: [user userToDictionary] command:command error: nil];
            } else {
                [self handleResultWithDictionary:nil command:command error: error];
            }
        }];
    } else {
        [self returnParamError:command];
    }
}

- (void)updateMyPassword:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"oldPwd"] && param[@"newPwd"]) {
        [JMSGUser updateMyPasswordWithNewPassword:param[@"newPwd"] oldPassword:param[@"oldPwd"] completionHandler:^(id resultObject, NSError *error) {
            [self handleResultWithDictionary:@{} command:command error: error];
        }];
    } else {
        [self returnParamError:command];
    }
}

- (void)updateMyAvatar:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"imgPath"]) {
    [self returnParamError:command];
    return;
  }
  
  NSString *mediaPath = param[@"imgPath"];
    
  if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
    mediaPath = mediaPath;
    NSData *img = [NSData dataWithContentsOfFile: mediaPath];
    
    [JMSGUser updateMyInfoWithParameter:img userFieldType:kJMSGUserFieldsAvatar completionHandler:^(id resultObject, NSError *error) {
      [self handleResultWithDictionary:nil command:command error:error];
    }];
    
  } else {
    [self returnMediaFileError:command];
  }
}

- (void)updateMyInfo:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
  
    JMSGUserInfo *info = [[JMSGUserInfo alloc] init];
    
    if (param[@"nickname"]) {
        info.nickname = param[@"nickname"];
    }
  
    if (param[@"birthday"]) {
      NSNumber *birthday = param[@"birthday"];
      info.birthday = @([birthday integerValue] / 1000); // Millisecond to second.
    }
  
    if (param[@"signature"]) {
        info.signature = param[@"signature"];
    }
    
    if (param[@"gender"]) {
        if ([param[@"gender"] isEqualToString:@"male"]) {
            info.gender = kJMSGUserGenderMale;
        }
        
        if ([param[@"gender"] isEqualToString:@"female"]) {
            info.gender = kJMSGUserGenderFemale;
        }
        
        if ([param[@"gender"] isEqualToString:@"unknow"]) {
            info.gender = kJMSGUserGenderUnknown;
        }
    }
    
    if (param[@"region"]) {
        info.region = param[@"region"];
    }
    
    if (param[@"address"]) {
        info.address = param[@"address"];
    }
    
    [JMSGUser updateMyInfoWithUserInfo:info completionHandler:^(id resultObject, NSError *error) {
        [self handleResultWithDictionary:nil command:command error:error];
    }];
}

- (JMSGOptionalContent *)convertDicToJMSGOptionalContent:(NSDictionary *)dic {
    JMSGCustomNotification *customNotification = [[JMSGCustomNotification alloc] init];
    JMSGOptionalContent *optionlContent = [[JMSGOptionalContent alloc] init];
    
    if(dic[@"isShowNotification"]) {
        NSNumber *isShowNotification = dic[@"isShowNotification"];
        optionlContent.noSaveNotification = ![isShowNotification boolValue];
    }
    
    if(dic[@"isRetainOffline"]) {
        NSNumber *isRetainOffline = dic[@"isRetainOffline"];
        optionlContent.noSaveOffline = ![isRetainOffline boolValue];
    }
    
    if(dic[@"isCustomNotificationEnabled"]) {
        NSNumber *isCustomNotificationEnabled = dic[@"isCustomNotificationEnabled"];
        customNotification.enabled= [isCustomNotificationEnabled boolValue];
    }
    
    if(dic[@"notificationTitle"]) {
        customNotification.title = dic[@"notificationTitle"];
    }
    
    if(dic[@"notificationText"]) {
        customNotification.alert = dic[@"notificationText"];
    }
    
    optionlContent.customNotification = customNotification;
    
    return optionlContent;
}

- (void)sendTextMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;}
    
    if (param[@"text"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        JMSGTextContent *content = [[JMSGTextContent alloc] initWithText:param[@"text"]];
        JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
        if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
            NSDictionary *extras = param[@"extras"];
            for (NSString *key in extras.allKeys) {
                [message updateMessageExtraValue: extras[key] forKey: key];
            }
        }
        
        [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                        appKey:appKey
                                             completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command:command error: error];
                return;
            }
            
            JMSGConversation *conversation = resultObject;
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [conversation sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [conversation sendMessage: message];
            }
        }];
      
    } else if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            JMSGTextContent *content = [[JMSGTextContent alloc] initWithText:param[@"text"]];
            JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
            if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
                NSDictionary *extras = param[@"extras"];
                for (NSString *key in extras.allKeys) {
                    [message updateMessageExtraValue: extras[key] forKey: key];
                }
            }
            
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [JMSGMessage sendMessage:message];
            }
      
    } else {
      [self returnParamError:command];
    }
}

- (void)sendImageMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    if (param[@"path"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *mediaPath = param[@"path"];
    if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
        mediaPath = mediaPath;
    } else {
        [self returnMediaFileError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        JMSGImageContent *content = [[JMSGImageContent alloc] initWithImageData: [NSData dataWithContentsOfFile: mediaPath]];
        JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
        if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
            NSDictionary *extras = param[@"extras"];
            for (NSString *key in extras.allKeys) {
                [message updateMessageExtraValue: extras[key] forKey: key];
            }
        }
        [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                        appKey:appKey
                                             completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [conversation sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [conversation sendMessage: message];
            }
        }];
      
    } else if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            JMSGImageContent *content = [[JMSGImageContent alloc] initWithImageData: [NSData dataWithContentsOfFile: mediaPath]];
            JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
            if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
                NSDictionary *extras = param[@"extras"];
                for (NSString *key in extras.allKeys) {
                    [message updateMessageExtraValue: extras[key] forKey: key];
                }
            }
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [JMSGMessage sendMessage:message];
            }
      } else {
        [self returnParamError:command];
      }
}

- (void)sendVoiceMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    if (param[@"path"] == nil) {
        [self returnErrorWithLog:@"media file not exit!" command: command];
        return;
    }
    
    NSString *mediaPath = param[@"path"];
    double duration = 0;
    if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
        mediaPath = mediaPath;
        
        NSError *error = nil;
        AVAudioPlayer *avAudioPlayer = [[AVAudioPlayer alloc] initWithData:[NSData dataWithContentsOfFile:mediaPath] error: &error];
        if (error) {
            [self returnErrorWithLog:@"音频资源读取失败" command: command];
        }
        
        duration = avAudioPlayer.duration;
        avAudioPlayer = nil;
        
    } else {
        [self returnMediaFileError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        // send single text message
        JMSGVoiceContent *content = [[JMSGVoiceContent alloc] initWithVoiceData:[NSData dataWithContentsOfFile: mediaPath] voiceDuration:@(duration)];
        JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
        if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
            NSDictionary *extras = param[@"extras"];
            for (NSString *key in extras.allKeys) {
                [message updateMessageExtraValue: extras[key] forKey: key];
            }
        }
        [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command:command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [conversation sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [conversation sendMessage: message];
            }
        }];
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            // send group text message
            JMSGVoiceContent *content = [[JMSGVoiceContent alloc] initWithVoiceData:[NSData dataWithContentsOfFile: mediaPath] voiceDuration:@(duration)];
            JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
            if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
                NSDictionary *extras = param[@"extras"];
                for (NSString *key in extras.allKeys) {
                    [message updateMessageExtraValue: extras[key] forKey: key];
                }
            }
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [JMSGMessage sendMessage:message];
            }
        } else {
            [self returnParamError:command];
        }
    }
}

- (void)sendCustomMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;}
    
    if (param[@"customObject"] == nil || ![param[@"customObject"] isKindOfClass:[NSDictionary class]]) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        
        // send single text message
        JMSGCustomContent *content = [[JMSGCustomContent alloc] initWithCustomDictionary: param[@"customObject"]];
        JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
        
        [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            
            JMSGConversation *conversation = resultObject;
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [conversation sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [conversation sendMessage: message];
            }
        }];
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            // send group text message
            JMSGCustomContent *content = [[JMSGCustomContent alloc] initWithCustomDictionary: param[@"customObject"]];
            JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
            
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [JMSGMessage sendMessage:message];
            }
        } else {
            [self returnParamError:command];
        }
    }
}

- (void)sendLocationMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil ||
        param[@"latitude"] == nil ||
        param[@"longitude"] == nil ||
        param[@"scale"] == nil ||
        param[@"address"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        JMSGLocationContent *content = [[JMSGLocationContent alloc] initWithLatitude:param[@"latitude"] longitude:param[@"longitude"] scale:param[@"scale"] address: param[@"address"]];
        JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
        if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
            NSDictionary *extras = param[@"extras"];
            for (NSString *key in extras.allKeys) {
                [message updateMessageExtraValue: extras[key] forKey: key];
            }
        }
        [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            
            JMSGConversation *conversation = resultObject;
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [conversation sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [conversation sendMessage: message];
            }
        }];
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            JMSGLocationContent *content = [[JMSGLocationContent alloc] initWithLatitude:param[@"latitude"]
                                                                               longitude:param[@"longitude"]
                                                                                   scale:param[@"scale"]
                                                                                 address:param[@"address"]];
            JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId:param[@"groupId"]];
            if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
                NSDictionary *extras = param[@"extras"];
                for (NSString *key in extras.allKeys) {
                    [message updateMessageExtraValue: extras[key] forKey: key];
                }
            }
            
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [JMSGMessage sendMessage:message];
            }
        } else {
            [self returnParamError:command];
        }
    }
}

- (void)sendFileMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil ||
        param[@"path"] == nil) {
        [self returnParamError:command];
        return;
    }
    NSString *fileName = @"";
    if (param[@"fileName"]) {
        fileName = param[@"fileName"];
    }
    NSString *mediaPath = param[@"path"];
    if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
        mediaPath = mediaPath;
    } else {
        [self returnMediaFileError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        // send single text message
        JMSGFileContent *content = [[JMSGFileContent alloc] initWithFileData:[NSData dataWithContentsOfFile: mediaPath] fileName: fileName];
        JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
        if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
            NSDictionary *extras = param[@"extras"];
            for (NSString *key in extras.allKeys) {
                [message updateMessageExtraValue: extras[key] forKey: key];
            }
        }
        [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [conversation sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [conversation sendMessage: message];
            }
        }];
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            // send group text message
            JMSGFileContent *content = [[JMSGFileContent alloc] initWithFileData:[NSData dataWithContentsOfFile: mediaPath] fileName: fileName];
            JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
            if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
                NSDictionary *extras = param[@"extras"];
                for (NSString *key in extras.allKeys) {
                    [message updateMessageExtraValue: extras[key] forKey: key];
                }
            }
            
            self.SendMsgCallbackDic[message.msgId] = command.callbackId;
            if (messageSendingOptions) {
                [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
            } else {
                [JMSGMessage sendMessage:message];
            }
        } else {
            [self returnParamError:command];
        }
    }
}

- (void)getHistoryMessages:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  if (param[@"type"] == nil ||
      param[@"from"] == nil ||
      param[@"limit"] == nil) {
    [self returnParamError:command];
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        [self handleResultWithDictionary:@{} command: command error:error];
        return;
      }
      
      JMSGConversation *conversation = resultObject;
      
      NSArray *messageList = [conversation messageArrayFromNewestWithOffset:param[@"from"] limit:param[@"limit"]];
      NSMutableArray *messageDicList = @[].mutableCopy;
      for (JMSGMessage *message in messageList) {
        [messageDicList addObject:[message messageToDictionary]];
      }
      [self handleResultWithArray:messageDicList command:command error:error];
      
    }];
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
          [self handleResultWithDictionary:@{} command: command error:error];
          return;
        }
        
        JMSGConversation *conversation = resultObject;
        NSArray *messageList = [conversation messageArrayFromNewestWithOffset:param[@"from"] limit:param[@"limit"]];
        NSMutableArray *messageDicList = @[].mutableCopy;
        for (JMSGMessage *message in messageList) {
          [messageDicList addObject:[message messageToDictionary]];
        }
        [self handleResultWithArray:messageDicList command:command error:error];
        
      }];
      
    } else {
      [self returnParamError:command];
      return;
    }
  }
  
}

- (void)sendInvitationRequest:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"username"] == nil ||
        param[@"reason"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGFriendManager sendInvitationRequestWithUsername:param[@"username"]
                                                  appKey:appKey
                                                  reason:param[@"reason"]
                                       completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return;
        }
        [self handleResultWithArray:nil command: command error:nil];
    }];
}

- (void)acceptInvitation:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"username"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGFriendManager acceptInvitationWithUsername:param[@"username"]
                                             appKey:appKey
                                  completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        [self handleResultWithArray:nil command: command error:nil];
    }];
}

- (void)declineInvitation:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"username"] == nil ||
        param[@"reason"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    [JMSGFriendManager rejectInvitationWithUsername:param[@"username"]
                                             appKey:appKey
                                             reason:param[@"reason"]
                                  completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        [self handleResultWithArray:nil command: command error:nil];
    }];
}

- (void)removeFromFriendList:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"username"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGFriendManager removeFriendWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        [self handleResultWithArray:nil command: command error:nil];
    }];
}

- (void)updateFriendNoteName:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"username"] == nil ||
        param[@"noteName"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        NSArray *userArr = resultObject;
        if (userArr.count < 1) {
            [self returnErrorWithLog:@"cann't find user by usernaem" command:command];
        } else {
            JMSGUser *user = resultObject[0];
            [user updateNoteName:param[@"noteName"] completionHandler:^(id resultObject, NSError *error) {
                if (error) {
                    [self handleResultWithDictionary: nil command: command error:error];
                    return ;
                }
                [self handleResultWithArray:nil command: command error:nil];
            }];
        }
    }];
}

- (void)updateFriendNoteText:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"username"] == nil ||
        param[@"noteText"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        NSArray *userArr = resultObject;
        if (userArr.count < 1) {
            [self returnErrorWithLog:@"cann't find user by usernaem" command:command];
        } else {
            JMSGUser *user = resultObject[0];
            
            [user updateNoteName:param[@"noteText"] completionHandler:^(id resultObject, NSError *error) {
                if (error) {
                    [self handleResultWithDictionary: nil command: command error:error];
                    return ;
                }
                [self handleResultWithArray:nil command: command error:nil];
            }];
        }
    }];
}

- (void)getFriends:(CDVInvokedUrlCommand *)command {
    [JMSGFriendManager getFriendList:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        NSArray *userList = resultObject;
        NSMutableArray *userDicList = @[].mutableCopy;
        for (JMSGUser *user in userList) {
            [userDicList addObject: [user userToDictionary]];
        }
        
        [self handleResultWithArray:userDicList command:command error:error];
    }];
}

- (void)createGroup:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    NSString *groupName = @"";
    NSString *descript = @"";
    
    if (param[@"name"] != nil) {
        groupName = param[@"name"];
    }
    
    if (param[@"desc"] != nil) {
        descript = param[@"desc"];
    }
    
    [JMSGGroup createGroupWithName:groupName desc:descript memberArray:nil completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        JMSGGroup *group = resultObject;
        [self handleResultWithDictionary:[group groupToDictionary] command:command error:error];
    }];
}

- (void)getGroupIds:(CDVInvokedUrlCommand *)command {
    [JMSGGroup myGroupArray:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        NSArray *groudIdList = resultObject;
        
        [self handleResultWithArray:groudIdList command:command error:error];
    }];
}

- (void)getGroupInfo:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"id"] == nil) {
        [self returnParamError:command];
    }
    
    [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        JMSGGroup *group = resultObject;
        [self handleResultWithDictionary:[group groupToDictionary] command:command error:error];
    }];
}

- (void)updateGroupInfo:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"id"] == nil) {
        [self returnParamError:command];
    }
    
    if (param[@"newName"] == nil && param[@"newDesc"] == nil) {
        [self returnParamError:command];
    }
    
    [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        JMSGGroup *group = resultObject;
        NSString *newName = group.displayName;
        NSString *newDesc = group.description;
        
        if (param[@"newName"]) {
            newName = param[@"newName"];
        }
        
        if (param[@"newDesc"]) {
            newDesc = param[@"newDesc"];
        }
        
        [JMSGGroup updateGroupInfoWithGroupId:group.gid name:newName desc:newDesc completionHandler:^(id resultObject, NSError *error) {
            [self handleResultWithDictionary: nil command: command error:error];
        }];
        
    }];
}

- (void)addGroupMembers:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"id"] == nil ||
        param[@"usernameArray"] == nil) {
        [self returnParamError:command];
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        JMSGGroup *group = resultObject;
        [group addMembersWithUsernameArray:param[@"usernameArray"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error:error];
                return ;
            }
            
            [self handleResultWithDictionary:nil command:command error:error];
        }];
    }];
}

- (void)removeGroupMembers:(CDVInvokedUrlCommand *)command {
    
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"id"] == nil ||
        param[@"usernameArray"] == nil) {
        [self returnParamError:command];
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        JMSGGroup *group = resultObject;
        [group removeMembersWithUsernameArray:param[@"usernameArray"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error:error];
                return ;
            }
            
            [self handleResultWithDictionary:nil command:command error:error];
        }];
    }];
}

- (void)exitGroup:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"id"] == nil) {
        [self returnParamError:command];
    }
    
    [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        JMSGGroup *group = resultObject;
        [group exit:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error:error];
                return ;
            }
            
            [self handleResultWithDictionary:nil command:command error:error];
        }];
    }];
}

- (void)getGroupMembers:(CDVInvokedUrlCommand *)command {
    
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"id"] == nil) {
        [self returnParamError:command];
    }
    
    [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        JMSGGroup *group = resultObject;
        
        [group memberArrayWithCompletionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error:error];
                return ;
            }
            NSArray *userList = resultObject;
            NSMutableArray *usernameList = @[].mutableCopy;
            for (JMSGUser *user in 	userList) {
                [usernameList addObject:[user username]];
            }
            [self handleResultWithArray:usernameList command:command error:error];
        }];
    }];
}

- (void)addUsersToBlacklist:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"usernameArray"] == nil) {
        [self returnParamError:command];
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGUser addUsersToBlacklist:param[@"usernameArray"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        [self handleResultWithDictionary: nil command: command error:error];
    }];
}

- (void)removeUsersFromBlacklist:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"usernameArray"] == nil) {
        [self returnParamError:command];
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    
    [JMSGUser delUsersFromBlacklist:param[@"usernameArray"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        [self handleResultWithDictionary: nil command: command error:error];
    }];
}

- (void)getBlacklist:(CDVInvokedUrlCommand *)command {
    [JMessage blackList:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        NSArray *userList = resultObject;
        NSMutableArray *userDicList = @[].mutableCopy;
        for (JMSGUser *user in userList) {
            [userDicList addObject:[user userToDictionary]];
        }
        [self handleResultWithArray:userDicList command:command error:error];
    }];
}

- (void)setNoDisturb:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    NSNumber *isNoDisturb;
    if (param[@"type"] == nil ||
        param[@"isNoDisturb"] == nil) {
        [self returnParamError:command];
        return;
    }
    isNoDisturb = param[@"isNoDisturb"];
    
    if ([param[@"type"] isEqualToString:@"single"]) {
        if (param[@"username"] == nil) {
            [self returnParamError:command];
            return;
        }
    } else {
        if ([param[@"type"] isEqualToString:@"group"]) {
            if (param[@"groupId"] == nil) {
                [self returnParamError:command];
                return;
            }
        } else {
            [self returnParamError:command];
            return;
        }
        
    }
    
    if ([param[@"type"] isEqualToString:@"single"]) {
        
        NSString *appKey = nil;
        if (param[@"appKey"]) {
            appKey = param[@"appKey"];
        } else {
            appKey = [JMessageHelper shareInstance].JMessageAppKey;
        }
        
        [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error:error];
                return ;
            }
            
            NSArray *userList = resultObject;
            if (userList.count < 1) {
                [self returnErrorWithLog:@"user not exit" command:command];
                return;
            }
            
            JMSGUser *user = userList[0];
            [user setIsNoDisturb:[isNoDisturb boolValue] handler:^(id resultObject, NSError *error) {
                if (error) {
                    [self handleResultWithDictionary: nil command: command error:error];
                    return ;
                }
                [self handleResultWithDictionary:nil command:command error:nil];
            }];
            
        }];
    }
    
    if ([param[@"type"] isEqualToString:@"group"]) {
        [JMSGGroup groupInfoWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error:error];
                return ;
            }
            
            JMSGGroup *group = resultObject;
            [group setIsNoDisturb:[isNoDisturb boolValue] handler:^(id resultObject, NSError *error) {
                [self handleResultWithDictionary: nil command: command error:error];
            }];
        }];
    }
}

- (void)getNoDisturbList:(CDVInvokedUrlCommand *)command {
    [JMessage noDisturbList:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        NSArray *disturberList = resultObject;
        NSMutableArray *userDicList = @[].mutableCopy;
        NSMutableArray *groupDicList = @[].mutableCopy;
        for (id disturber in disturberList) {
            if ([disturber isKindOfClass:[JMSGUser class]]) {
                
                [userDicList addObject:[disturber userToDictionary]];
            }
            
            if ([disturber isKindOfClass:[JMSGGroup class]]) {
                [groupDicList addObject:[disturber groupToDictionary]];
            }
        }
        
        [self handleResultWithDictionary:@{@"userInfos": userDicList, @"groupInfos": groupDicList} command:command error:error];
    }];
}

- (void)setNoDisturbGlobal:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"isNoDisturb"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    [JMessage setIsGlobalNoDisturb:[param[@"isNoDisturb"] boolValue] handler:^(id resultObject, NSError *error) {
        [self handleResultWithDictionary:nil command:command error:error];
    }];
}

- (void)isNoDisturbGlobal:(CDVInvokedUrlCommand *)command {
    BOOL isNodisturb = [JMessage isSetGlobalNoDisturb];
    [self handleResultWithDictionary:@{@"isNoDisturb": @(isNodisturb)} command:command error:nil];
}

- (void)downloadThumbUserAvatar:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  if (param[@"username"] == nil) {
    [self returnParamError:command];
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error:error];
      return ;
    }
    
    NSArray *userList = resultObject;
    if (userList.count < 1) {
      [self returnErrorWithLog:@"user not exit" command:command];
      return;
    }
    
    JMSGUser *user = userList[0];
    [user thumbAvatarData:^(NSData *data, NSString *objectId, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command: command error:error];
        return ;
      }
      
      [self handleResultWithDictionary:@{@"username": user.username,
                                           @"appKey": user.appKey,
                                         @"filePath": [user thumbAvatarLocalPath] ?: @""}
                               command:command error:error];
    }];
  }];
}

- (void)downloadOriginalUserAvatar:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"username"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error:error];
            return ;
        }
        
        NSArray *userList = resultObject;
        if (userList.count < 1) {
            [self returnErrorWithLog:@"user not exit" command:command];
            return;
        }
        
        JMSGUser *user = userList[0];
        [user largeAvatarData:^(NSData *data, NSString *objectId, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error:error];
                return ;
            }
            
            [self handleResultWithDictionary:@{@"username": user.username,
                                                 @"appKey": user.appKey,
                                               @"filePath": [user largeAvatarLocalPath] ?: @""}
                                     command:command error:error];
        }];
    }];
}

- (void)downloadOriginalImage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    if (param[@"messageId"] == nil ||
        param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            
        } else {
            [self returnParamError:command];
            return;
        }
    }
    
    if ([param[@"type"] isEqual: @"single"]) {
        [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
            if (message == nil) {
                [self returnErrorWithLog:@"cann't find this message" command: command];
                return;
            }
            
            if (message.contentType != kJMSGContentTypeImage) {
                [self returnErrorWithLog:@"It is not voice message" command:command];
                return;
            } else {
                JMSGImageContent *content = (JMSGImageContent *) message.content;
                [content largeImageDataWithProgress:^(float percent, NSString *msgId) {
                    
                } completionHandler:^(NSData *data, NSString *objectId, NSError *error) {
                    if (error) {
                        [self handleResultWithDictionary: nil command: command error: error];
                        return;
                    }
                    
                    JMSGMediaAbstractContent *mediaContent = (JMSGMediaAbstractContent *) message.content;
                    [self handleResultWithDictionary:@{@"messageId": message.msgId,
                                                        @"filePath": [mediaContent originMediaLocalPath]}
                                             command:command error:error];
                }];
            }
        }];
    } else {
        [JMSGGroup groupInfoWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            
            JMSGGroup *group = resultObject;
            [JMSGConversation createGroupConversationWithGroupId:group.gid completionHandler:^(id resultObject, NSError *error) {
                JMSGConversation *conversation = resultObject;
                JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
                
                if (message == nil) {
                    [self returnErrorWithLog:@"cann't find this message" command: command];
                    return;
                }
                
                if (message.contentType != kJMSGContentTypeVoice) {
                    [self returnErrorWithLog:@"It is not image message" command:command];
                    return;
                } else {
                    JMSGImageContent *content = (JMSGImageContent *) message.content;
                    [content largeImageDataWithProgress:^(float percent, NSString *msgId) {
                        
                    } completionHandler:^(NSData *data, NSString *objectId, NSError *error) {
                        if (error) {
                            [self handleResultWithDictionary: nil command: command error: error];
                            return;
                        }
                        JMSGMediaAbstractContent *mediaContent = (JMSGMediaAbstractContent *) message.content;
                        [self handleResultWithDictionary:@{@"messageId": message.msgId,
                                                           @"filePath": [mediaContent originMediaLocalPath]}
                                                 command:command error:error];
                    }];
                }
            }];
        }];
    }
}

- (void)downloadVoiceFile:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"messageId"] == nil ||
        param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            
        } else {
            [self returnParamError:command];
            return;
        }
    }
    
    if ([param[@"type"] isEqual: @"single"]) {
        [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                        appKey:appKey
                                             completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
            
            if (message == nil) {
                [self returnErrorWithLog:@"cann't find this message" command: command];
                return;
            }
            
            if (message.contentType != kJMSGContentTypeVoice) {
                [self returnErrorWithLog:@"It is not image message" command:command];
                return;
            } else {
                JMSGVoiceContent *content = (JMSGVoiceContent *) message.content;
                [content voiceData:^(NSData *data, NSString *objectId, NSError *error) {
                    if (error) {
                        [self handleResultWithDictionary: nil command: command error: error];
                        return;
                    }
                    
                    JMSGMediaAbstractContent *mediaContent = (JMSGMediaAbstractContent *) message.content;
                    [self handleResultWithDictionary:@{@"messageId": message.msgId,
                                                       @"filePath": [mediaContent originMediaLocalPath]}
                                             command:command error:error];
                }];
            }
        }];
    } else {
        [JMSGGroup groupInfoWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            
            JMSGGroup *group = resultObject;
            [JMSGConversation createGroupConversationWithGroupId:group.gid completionHandler:^(id resultObject, NSError *error) {
                JMSGConversation *conversation = resultObject;
                JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
                
                if (message == nil) {
                    [self returnErrorWithLog:@"cann't find this message" command: command];
                    return;
                }
                
                if (message.contentType != kJMSGContentTypeVoice) {
                    [self returnErrorWithLog:@"It is not voice message" command:command];
                    return;
                } else {
                    JMSGVoiceContent *content = (JMSGVoiceContent *) message.content;
                    [content voiceData:^(NSData *data, NSString *objectId, NSError *error) {
                        if (error) {
                            [self handleResultWithDictionary: nil command: command error: error];
                            return;
                        }
                        
                        JMSGMediaAbstractContent *mediaContent = (JMSGMediaAbstractContent *)message.content;
                        [self handleResultWithDictionary:@{@"messageId": message.msgId,
                                                           @"filePath": [mediaContent originMediaLocalPath]}
                                                 command:command
                                                   error:error];
                    }];
                }
            }];
        }];
    }
}

- (void)downloadFile:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"messageId"] == nil ||
        param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            
        } else {
            [self returnParamError:command];
            return;
        }
    }
    
    if ([param[@"type"] isEqual: @"single"]) {
        [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
            
            if (message == nil) {
                [self returnErrorWithLog:@"cann't find this message" command: command];
                return;
            }
            
            if (message.contentType != kJMSGContentTypeFile) {
                [self returnErrorWithLog:@"It is not file message" command:command];
                return;
            } else {
                JMSGFileContent *content = (JMSGFileContent *) message.content;
                [content fileData:^(NSData *data, NSString *objectId, NSError *error) {
                    if (error) {
                        [self handleResultWithDictionary: nil command: command error: error];
                        return;
                    }
                    JMSGFileContent *fileContent = (JMSGFileContent *) message.content;
                    [self handleResultWithDictionary:@{@"messageId": message.msgId,
                                                       @"filePath":[fileContent originMediaLocalPath]}
                                             command:command error:error];
                }];
            }
        }];
    } else {
        [JMSGGroup groupInfoWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            
            JMSGGroup *group = (JMSGGroup *) resultObject;
            [JMSGConversation createGroupConversationWithGroupId:group.gid completionHandler:^(id resultObject, NSError *error) {
                JMSGConversation *conversation = resultObject;
                JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
                
                if (message == nil) {
                    [self returnErrorWithLog:@"Can't find the message" command:command];
                    return;
                }
                
                if (message.contentType != kJMSGContentTypeFile) {
                    [self returnErrorWithLog:@"It is not a file message" command:command];
                    return;
                  
                } else {
                    JMSGFileContent *content = (JMSGFileContent *) message.content;
                    [content fileData:^(NSData *data, NSString *objectId, NSError *error) {
                        if (error) {
                            [self handleResultWithDictionary: nil command: command error: error];
                            return;
                        }
                        JMSGFileContent *fileContent = (JMSGFileContent *) message.content;
                        [self handleResultWithDictionary:@{@"messageId": message.msgId,
                                                           @"filePath":[fileContent originMediaLocalPath]}
                                                 command:command error:error];
                    }];
                }
            }];
        }];
    }
}

- (void)createConversation:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            
        } else {
            [self returnParamError:command];
            return;
        }
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    if ([param[@"type"] isEqualToString:@"single"]) {
        [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                        appKey:appKey
                                             completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            [self handleResultWithDictionary:[conversation conversationToDictionary] command:command error:error];
        }];
    } else {
        [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            [self handleResultWithDictionary:[conversation conversationToDictionary] command:command error:error];
        }];
    }
    
}

- (void)deleteConversation:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            
        } else {
            [self returnParamError:command];
            return;
        }
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    if ([param[@"type"] isEqualToString:@"single"]) {
        [JMSGConversation deleteSingleConversationWithUsername:param[@"username"] appKey:appKey];
    } else {
        [JMSGConversation deleteGroupConversationWithGroupId:param[@"groupId"]];
    }
    
    [self handleResultWithDictionary:nil command:command error:nil];
}

- (void)getConversation:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            
        } else {
            [self returnParamError:command];
            return;
        }
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    if ([param[@"type"] isEqualToString:@"single"]) {
        [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                        appKey:appKey
                                             completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            [self handleResultWithDictionary:[conversation conversationToDictionary] command:command error:error];
        }];
    } else {
        [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"]
                                           completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            [self handleResultWithDictionary:[conversation conversationToDictionary] command:command error:error];
        }];
    }
}

- (void)getConversations:(CDVInvokedUrlCommand *)command {
    [JMSGConversation allConversations:^(id resultObject, NSError *error) {
        if (error) {
            [self handleResultWithDictionary: nil command: command error: error];
            return;
        }
        NSArray *conversationList = resultObject;
        NSMutableArray *conversationDicList = @[].mutableCopy;
        
        if (conversationList.count < 1) {
            [self handleResultWithArray:@[] command:command error:nil];
        } else {
            for (JMSGConversation *conversation in conversationList) {
                [conversationDicList addObject:[conversation conversationToDictionary]];
            }
            [self handleResultWithArray:conversationDicList command:command error:error];
        }
    }];
}

- (void)resetUnreadMessageCount:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            
        } else {
            [self returnParamError:command];
            return;
        }
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    if ([param[@"type"] isEqualToString:@"single"]) {
        [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                        appKey:appKey
                                             completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            [conversation clearUnreadCount];
            [self handleResultWithDictionary:nil command:command error:error];
        }];
      
    } else {
        [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"]
                                           completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command: command error: error];
                return;
            }
            JMSGConversation *conversation = resultObject;
            [conversation clearUnreadCount];
            [self handleResultWithDictionary:nil command:command error:error];
        }];
    }
}

- (void)retractMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;}
    
    if (param[@"messageId"] == nil) {
        [self returnParamError:command];
        return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
  
    if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
        // send single text message
        [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                        appKey:appKey
                                             completionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary: nil command:command error: error];
                return;
            }
            
            JMSGConversation *conversation = resultObject;
            JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
            if (message == nil) {
                [self returnErrorWithLog:@"cann't found this message" command:command];
                return;
            }
            
            [conversation retractMessage:message completionHandler:^(id resultObject, NSError *error) {
                [self handleResultWithDictionary:@{} command:command error:error];
            }];
        }];
      
    } else {
        if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
            // send group text message
            [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"]
                                               completionHandler:^(id resultObject, NSError *error) {
                
                if (error) {
                    [self handleResultWithDictionary: nil command:command error: error];
                    return;
                }
                
                JMSGConversation *conversation = resultObject;
                JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
                if (message == nil) {
                    [self returnErrorWithLog:@"cann't found this message" command:command];
                    return;
                }
                
                [conversation retractMessage:message completionHandler:^(id resultObject, NSError *error) {
                    [self handleResultWithDictionary:@{} command:command error:error];
                }];
            }];
        } else {
            [self returnParamError:command];
        }
    }
}

@end
