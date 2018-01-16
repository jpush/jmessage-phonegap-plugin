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


typedef void (^JMSGConversationCallback)(JMSGConversation *conversation,NSError *error);

@interface JMessagePlugin ()<JMessageDelegate, JMSGEventDelegate, UIApplicationDelegate>
@property(strong,nonatomic)CDVInvokedUrlCommand *callBack;
@property(strong,nonatomic)NSMutableDictionary *SendMsgCallbackDic;//{@"msgid": @"", @"callbackID": @""}
@end

JMessagePlugin *SharedJMessagePlugin;
NSMutableDictionary *_jmessageEventCache;

@implementation JMessagePlugin


#ifdef __CORDOVA_4_0_0

- (void)pluginInitialize {
    NSLog(@"### pluginInitialize ");
    [self initNotifications];
    [self initPlugin];
}

#else

- (CDVPlugin*)initWithWebView:(UIWebView*)theWebView {
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
    }
    self.SendMsgCallbackDic = @{}.mutableCopy;
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

- (void)init:(CDVInvokedUrlCommand *)command {
    self.callBack = command;
    NSDictionary * param = [command argumentAtIndex:0];
    [[JMessageHelper shareInstance] initJMessage:param];
    [self dispatchJMessageCacheEvent];
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

    [defaultCenter addObserver:self
                      selector:@selector(didReceiveJMessageMessage:)
                          name:kJJMessageReceiveMessage
                        object:nil];
  [defaultCenter addObserver:self
                    selector:@selector(didReceiveJMessageChatRoomMessage:)
                        name:kJJMessageReceiveChatroomMessage
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
                      selector:@selector(unreadChanged:)
                          name:kJJMessageUnreadChanged
                        object:nil];

    [defaultCenter addObserver:self
                      selector:@selector(loginStateChanged:)
                          name:kJJMessageLoginStateChanged
                        object:nil];

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

    [defaultCenter addObserver:self
                      selector:@selector(onSyncOfflineMessage:)
                          name:kJJMessageSyncOfflineMessage
                        object:nil];

    [defaultCenter addObserver:self
                      selector:@selector(onSyncRoamingMessage:)
                          name:kJJMessageSyncRoamingMessage
                        object:nil];
}

- (void)getConversationWithDictionary:(NSDictionary *)param callback:(JMSGConversationCallback)callback {
  if (param[@"type"] == nil) {
    NSError *error = [NSError errorWithDomain:@"param error!" code: 1 userInfo: nil];
    callback(nil,error);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  JMSGConversationType conversationType = [self convertStringToConvsersationType:param[@"type"]];
  switch (conversationType) {
    case kJMSGConversationTypeSingle:{
      [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                      appKey:appKey
                                           completionHandler:^(id resultObject, NSError *error) {
                                             if (error) {
                                               callback(nil, error);
                                               return;
                                             }
                                             
                                             JMSGConversation *conversation = resultObject;
                                             callback(conversation,nil);
                                           }];
      break;
    }
    case kJMSGConversationTypeGroup:{
      [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
          callback(nil, error);
          return;
        }
        
        JMSGConversation *conversation = resultObject;
        callback(conversation,nil);
      }];
      break;
    }
    case kJMSGConversationTypeChatRoom:{
      [JMSGConversation createChatRoomConversationWithRoomId:param[@"roomId"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
          callback(nil, error);
          return;
        }
        
        JMSGConversation *conversation = resultObject;
        callback(conversation,nil);
      }];
      break;
    }
  }
}

- (JMSGMessage *)createMessageWithDictionary:(NSDictionary *)param type:(JMSGContentType)type {
  
  if (param[@"type"] == nil) {
    return nil;
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
  
  JMSGMessage *message = nil;
  JMSGAbstractContent *content = nil;
  switch (type) {
    case kJMSGContentTypeText:{
      content = [[JMSGTextContent alloc] initWithText:param[@"text"]];
      break;
    }
    case kJMSGContentTypeImage:{
      NSString *mediaPath = param[@"path"];
      if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
        mediaPath = mediaPath;
      } else {
        return nil;
      }
      content = [[JMSGImageContent alloc] initWithImageData: [NSData dataWithContentsOfFile: mediaPath]];
      
      break;
    }
    case kJMSGContentTypeVoice:{
      NSString *mediaPath = param[@"path"];
      double duration = 0;
      if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
        mediaPath = mediaPath;
        
        NSError *error = nil;
        AVAudioPlayer *avAudioPlayer = [[AVAudioPlayer alloc] initWithData:[NSData dataWithContentsOfFile:mediaPath] error: &error];
        if (error) {
          return nil;
        }
        
        duration = avAudioPlayer.duration;
        avAudioPlayer = nil;
        
      } else {
        
        return nil;
      }
      content = [[JMSGVoiceContent alloc] initWithVoiceData:[NSData dataWithContentsOfFile: mediaPath] voiceDuration:@(duration)];
      break;
    }
    case kJMSGContentTypeLocation:{
      content = [[JMSGLocationContent alloc] initWithLatitude:param[@"latitude"] longitude:param[@"longitude"] scale:param[@"scale"] address: param[@"address"]];
      break;
    }
    case kJMSGContentTypeFile:{
      NSString *mediaPath = param[@"path"];
      if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
        mediaPath = mediaPath;
      } else {
        return nil;
      }
      
      NSString *fileName = @"";
      if (param[@"fileName"]) {
        fileName = param[@"fileName"];
      }
      
      content = [[JMSGFileContent alloc] initWithFileData:[NSData dataWithContentsOfFile: mediaPath] fileName: fileName];
      break;
    }
    case kJMSGContentTypeCustom:{
      content = [[JMSGCustomContent alloc] initWithCustomDictionary: param[@"customObject"]];
      break;
    }
      
    default:
      return nil;
  }
  
  JMSGConversationType targetType = [self convertStringToConvsersationType:param[@"type"]];
  
  switch (targetType) {
    case kJMSGConversationTypeSingle:{
      message = [JMSGMessage createSingleMessageWithContent:content username:param[@"username"]];
      break;
    }
    case kJMSGConversationTypeGroup:{
      message = [JMSGMessage createGroupMessageWithContent:content groupId:param[@"groupId"]];
      break;
    }
     
    case kJMSGConversationTypeChatRoom:{
      message = [JMSGMessage createChatRoomMessageWithContent:content chatRoomId:param[@"roomId"]];
      break;
    }
  }
  
  if (message) {
    if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
      NSDictionary *extras = param[@"extras"];
      for (NSString *key in extras.allKeys) {
        [message.content addStringExtra:extras[key] forKey:key];
      }
    }
    return message;
  } else {
    return nil;
  }
}

- (JMSGContentType)convertStringToContentType:(NSString *)str {
  if ([str isEqualToString:@"text"]) {
    return kJMSGContentTypeText;
  }
  
  if ([str isEqualToString:@"image"]) {
    return kJMSGContentTypeImage;
  }
  
  if ([str isEqualToString:@"voice"]) {
    return kJMSGContentTypeVoice;
  }
  
  if ([str isEqualToString:@"location"]) {
    return kJMSGContentTypeLocation;
  }
  
  if ([str isEqualToString:@"file"]) {
    return kJMSGContentTypeFile;
  }
  
  if ([str isEqualToString:@"custom"]) {
    return kJMSGContentTypeCustom;
  }
  
  return kJMSGContentTypeUnknown;
}

- (JMSGConversationType)convertStringToConvsersationType:(NSString *)str {
  if ([str isEqualToString:@"group"]) {
    return kJMSGConversationTypeGroup;
  }
  
  if ([str isEqualToString:@"chatRoom"]) {
    return kJMSGConversationTypeChatRoom;
  }
  
  return kJMSGConversationTypeSingle;
}

#pragma mark IM - Events
- (void)onSyncOfflineMessage: (NSNotification *) notification {
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                            messageAsDictionary:@{@"eventName": @"syncOfflineMessage", @"value": notification.object}];
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
    }
}

- (void)conversationChanged:(NSNotification *)notification {
    [self evalFuntionName:@"onConversationChanged" jsonParm:[notification.object toJsonString]];
}

- (void)unreadChanged:(NSNotification *)notification{
    [self evalFuntionName:@"onUnreadChanged" jsonParm:[notification.object toJsonString]];
}

- (void)groupInfoChanged:(NSNotification *)notification{
    [self evalFuntionName:@"onGroupInfoChanged" jsonParm:[notification.object toJsonString]];
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

- (void)didReceiveJMessageMessage:(NSNotification *)notification {
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"eventName": @"receiveMessage", @"value": notification.object}];
    [result setKeepCallback:@(true)];
    
    [self.commandDelegate sendPluginResult:result callbackId:self.callBack.callbackId];
}

- (void)didReceiveJMessageChatRoomMessage:(NSNotification *)notification {
  CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"eventName": @"receiveChatRoomMessage", @"value": notification.object}];
  [result setKeepCallback:@(true)];
  
  [self.commandDelegate sendPluginResult:result callbackId:self.callBack.callbackId];
}

- (void)evalFuntionName:(NSString*)functionName jsonParm:(NSString*)jsonString{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.commandDelegate evalJs:[NSString stringWithFormat:@"%@.%@('%@')",JMessagePluginName,functionName,jsonString]];
    });
}

- (void)dispatchJMessageCacheEvent {
  if (!_jmessageEventCache) {
    return;
  }
  
  for (NSString* key in _jmessageEventCache) {
    NSArray *evenList = _jmessageEventCache[key];
    for (NSString *event in evenList) {
      [JMessagePlugin fireDocumentEvent:key jsString:event];
    }
  }
}

+(void)fireDocumentEvent:(NSString*)eventName jsString:(NSString*)jsString{
  
  if (SharedJMessagePlugin) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [SharedJMessagePlugin.commandDelegate evalJs:[NSString stringWithFormat:@"cordova.fireDocumentEvent('jmessage.%@',%@)", eventName, jsString]];
    });
    return;
  }
  
  if (!_jmessageEventCache) {
    _jmessageEventCache = @{}.mutableCopy;
  }
  
  if (!_jmessageEventCache[eventName]) {
    _jmessageEventCache[eventName] = @[].mutableCopy;
  }
  
  [_jmessageEventCache[eventName] addObject: jsString];
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

    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void)handleResultWithString:(NSString *)value command:(CDVInvokedUrlCommand*)command error:(NSError*)error{
  CDVPluginResult *result = nil;
  
  if (error == nil) {
    CDVCommandStatus status = CDVCommandStatus_OK;
    result = [CDVPluginResult resultWithStatus:status messageAsString:value];
  } else {
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                           messageAsDictionary:@{@"code": @(error.code), @"description": [error description]}];
  }
  
  [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void)handleResultNilWithCommand:(CDVInvokedUrlCommand*)command error:(NSError*)error{
  CDVPluginResult *result = nil;
  
  if (error == nil) {
    CDVCommandStatus status = CDVCommandStatus_OK;
    result = [CDVPluginResult resultWithStatus: status];
    
  } else {
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                           messageAsDictionary:@{@"code": @(error.code), @"description": [error description]}];
  }
  
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
  NSDictionary * param = [command argumentAtIndex:0];
    
  if (!param[@"username"] || !param[@"password"]) {
    [self returnParamError:command];
    return;
  }
    
  JMSGUserInfo *info = [[JMSGUserInfo alloc] init];
    
  if (param[@"nickname"]) {
    info.nickname = param[@"nickname"];
  }
  
  if (param[@"birthday"]) {
    NSNumber *birthday = param[@"birthday"];
    info.birthday = @([birthday integerValue] / 1000); // Convert millisecond to second.
  }
    
  if (param[@"signature"]) {
    info.signature = param[@"signature"];
  }
    
  if (param[@"gender"]) {
    if ([param[@"gender"] isEqualToString:@"male"]) {
      info.gender = kJMSGUserGenderMale;
    } else if ([param[@"gender"] isEqualToString:@"female"]) {
      info.gender = kJMSGUserGenderFemale;
    } else if ([param[@"gender"] isEqualToString:@"unknow"]) {
      info.gender = kJMSGUserGenderUnknown;
    }
  }
    
  if (param[@"region"]) {
    info.region = param[@"region"];
  }
  
  if (param[@"address"]) {
    info.address = param[@"address"];
  }
  
  if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
    info.extras = param[@"extras"];
  }
  
  [JMSGUser registerWithUsername:param[@"username"]
                        password:param[@"password"]
                        userInfo:info
               completionHandler:^(id resultObject, NSError *error) {
                 if (!error) {
                   [self handleResultWithDictionary:@{} command:command error:nil];
                 } else {
                   [self handleResultWithDictionary:nil command:command error:error];
                 }
               }];
}

- (void)userLogin:(CDVInvokedUrlCommand *)command {
    NSDictionary * user = [command argumentAtIndex:0];
    NSLog(@"username %@",user);
    if (user[@"username"] && user[@"password"]) {
        [JMSGUser loginWithUsername:user[@"username"] password:user[@"password"] completionHandler:^(id resultObject, NSError *error) {
            if (!error) {
              JMSGUser *myInfo = [JMSGUser myInfo];
              // 为了和 Android 行为一致，在登录的时候自动下载缩略图。
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
        } else if ([param[@"gender"] isEqualToString:@"female"]) {
            info.gender = kJMSGUserGenderFemale;
        } else {
            info.gender = kJMSGUserGenderUnknown;
        }
    }
    
    if (param[@"region"]) {
        info.region = param[@"region"];
    }
    
    if (param[@"address"]) {
        info.address = param[@"address"];
    }
  
    if (param[@"extras"]) {
      info.extras = param[@"extras"];
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
  
  JMSGOptionalContent *messageSendingOptions = nil;
  if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
      messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
  }

  JMSGMessage *message = [self createMessageWithDictionary:param type:kJMSGContentTypeText];
  if (!message) {
    [self returnErrorWithLog:@"cannot create message, check your params" command:command];
    return;
  }
  
  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
    if (error) {
        [self handleResultWithDictionary: nil command:command error: error];
        return;
    }
    
    self.SendMsgCallbackDic[message.msgId] = command.callbackId;
    if (messageSendingOptions) {
      [conversation sendMessage:message optionalContent:messageSendingOptions];
    } else {
      [conversation sendMessage:message];
    }
  }];
}

- (void)sendImageMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
  
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
  
  JMSGMessage *message = [self createMessageWithDictionary:param type:kJMSGContentTypeImage];
  if (!message) {
    [self returnErrorWithLog:@"cannot create message, check your params" command:command];
    return;
  }
  
  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command:command error: error];
      return;
    }
    
    self.SendMsgCallbackDic[message.msgId] = command.callbackId;
    if (messageSendingOptions) {
      [conversation sendMessage:message optionalContent:messageSendingOptions];
    } else {
      [conversation sendMessage:message];
    }
  }];
}

- (void)sendVoiceMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
  
    JMSGMessage *message = [self createMessageWithDictionary:param type:kJMSGContentTypeVoice];
    if (!message) {
      [self returnErrorWithLog:@"cannot create message, check your params and make sure the media resource is valid" command:command];
      return;
    }
  
    [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command:command error: error];
        return;
      }
      
      self.SendMsgCallbackDic[message.msgId] = command.callbackId;
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage:message];
      }
    }];
}

- (void)sendCustomMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
  
    JMSGMessage *message = [self createMessageWithDictionary:param type:kJMSGContentTypeCustom];
    if (!message) {
      [self returnErrorWithLog:@"cannot create message, check your params and make sure the media resource is valid" command:command];
      return;
    }
  
    [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command:command error: error];
        return;
      }
      
      self.SendMsgCallbackDic[message.msgId] = command.callbackId;
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage:message];
      }
    }];
}

- (void)sendLocationMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
  
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
  
    JMSGMessage *message = [self createMessageWithDictionary:param type:kJMSGContentTypeLocation];
    if (!message) {
      [self returnErrorWithLog:@"cannot create message, check your params and make sure the media resource is valid" command:command];
      return;
    }
  
    [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command:command error: error];
        return;
      }
      
      self.SendMsgCallbackDic[message.msgId] = command.callbackId;
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage:message];
      }
    }];
}

- (void)sendFileMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
  
    JMSGOptionalContent *messageSendingOptions = nil;
    if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
      messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
    }
  
    JMSGMessage *message = [self createMessageWithDictionary:param type:kJMSGContentTypeFile];
    if (!message) {
      [self returnErrorWithLog:@"cannot create message, check your params and make sure the media resource is valid" command:command];
      return;
    }
  
    [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command:command error: error];
        return;
      }
      
      self.SendMsgCallbackDic[message.msgId] = command.callbackId;
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage:message];
      }
    }];
}

//change
- (void)getHistoryMessages:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
    if (error) {
      [self handleResultWithDictionary:@{} command: command error:error];
      return;
    }
    
    NSNumber *limit = param[@"limit"];
    if ([limit isEqualToNumber:@(-1)]) {
      limit = nil;
    }
    NSArray *messageList = [conversation messageArrayFromNewestWithOffset:param[@"from"] limit:limit];

    NSArray *messageDicArr = [messageList mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
      JMSGMessage *message = obj;
      return [message messageToDictionary];
    }];
    [self handleResultWithArray:messageDicArr command:command error:error];
  }];
}

- (void)sendSingleTransCommand:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"username"] || !param[@"content"]) {
    [self returnParamError:command];
    return;
  }
  
  NSString * appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  NSString * message = param[@"content"];
  
  [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary:nil command:command error:error];
      return;
    }
    
    JMSGConversation *conversation = resultObject;
    [conversation sendTransparentMessage:message completionHandler:^(id resultObject, NSError *error) {
      [self handleResultWithDictionary:nil command:command error:error];
    }];
  }];
}

- (void)sendGroupTransCommand:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"groupId"] || !param[@"content"]) {
    [self returnParamError:command];
    return;
  }
  
  NSString * message = param[@"content"];
  
  [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary:nil command:command error:error];
      return;
    }
    
    JMSGConversation * conversation = resultObject;
    [conversation sendTransparentMessage:message completionHandler:^(id resultObject, NSError *error) {
      [self handleResultWithDictionary:nil command:command error:error];
    }];
  }];
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
            
            [user updateNoteText:param[@"noteText"] completionHandler:^(id resultObject, NSError *error) {
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
            return;
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
  NSDictionary *param = [command argumentAtIndex:0];
  
  [JMSGGroup createGroupWithName:param[@"name"] desc:param[@"desc"] memberArray:nil completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary:nil command:command error:error];
      return;
    }
    
    JMSGGroup *group = resultObject;
    [self handleResultWithString:group.gid command:command error:error];
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
            [self handleResultWithDictionary:nil command:command error:error];
            return;
        }
        
        JMSGGroup *group = resultObject;
        
        [group memberArrayWithCompletionHandler:^(id resultObject, NSError *error) {
            if (error) {
                [self handleResultWithDictionary:nil command:command error:error];
                return;
            }
          
            NSArray *userList = resultObject;
            NSMutableArray *userInfoList = @[].mutableCopy;
            for (JMSGUser *user in userList) {
                [userInfoList addObject:[user userToDictionary]];
            }
            [self handleResultWithArray:userInfoList command:command error:error];
        }];
    }];
}

- (void)blockGroupMessage:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"id"] || !param[@"isBlock"]) {
    [self returnParamError:command];
    return;
  }
  
  NSNumber *isBlock = param[@"isBlock"];
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary:nil command:command error:error];
      return;
    }
    
    JMSGGroup *group = resultObject;
    [group setIsShield:[isBlock boolValue] handler:^(id resultObject, NSError *error) {
      [self handleResultWithDictionary:nil command:command error:error];
    }];
  }];
}

- (void)isGroupBlocked:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"id"]) {
    [self returnParamError:command];
    return;
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary:nil command:command error:error];
      return;
    }
    
    JMSGGroup *group = resultObject;
    [self handleResultWithDictionary:@{@"isBlocked": @(group.isShieldMessage)} command:command error:error];
  }];
}

- (void)getBlockedGroupList:(CDVInvokedUrlCommand *)command {
  [JMSGGroup shieldList:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary:nil command:command error:error];
    }
    
    NSArray *groupArr = resultObject;
    NSMutableArray *groupList = @[].mutableCopy;
    
    for (JMSGGroup *group in groupArr) {
      [groupList addObject:group];
    }
    
    [self handleResultWithArray:groupList command:command error:error];
  }];
}

// Group API - end

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

- (void)downloadThumbImage:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return;
    }
    
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
      
      [content thumbImageData:^(NSData *data, NSString *objectId, NSError *error) {
        if (error) {
          [self handleResultWithDictionary: nil command: command error: error];
          return;
        }
        
        [self handleResultWithDictionary:@{@"messageId": message.msgId,
                                           @"filePath": content.thumbImageLocalPath}
                                 command:command error:error];
      }];
    }
  }];
}

- (void)downloadOriginalImage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
  
  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
    if (error) {
        [self handleResultWithDictionary: nil command: command error: error];
        return;
    }
    
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
}

- (void)downloadVoiceFile:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
  
    [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command: command error: error];
        return;
      }
      
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
}

- (void)downloadFile:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];

    [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
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
}

- (void)createConversation:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command: command error: error];
        return;
      }
      
      [self handleResultWithDictionary:[conversation conversationToDictionary] command:command error:error];
    }];
}

- (void)deleteConversation:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];
    
    if (param[@"type"] == nil) {
        [self returnParamError:command];
        return;
    }
  
    if (([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) ||
        ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil)   ||
        ([param[@"type"] isEqual: @"chatRoom"] && param[@"roomId"] != nil)) {

    } else {
      [self returnParamError:command];
      return;
    }
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
        appKey = param[@"appKey"];
    } else {
        appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
  
    JMSGConversationType type =  [self convertStringToConvsersationType:param[@"type"]];
    switch (type) {
      case kJMSGConversationTypeSingle: {
        [JMSGConversation deleteSingleConversationWithUsername:param[@"username"] appKey:appKey];
        break;
      }
      case kJMSGConversationTypeGroup: {
        [JMSGConversation deleteGroupConversationWithGroupId:param[@"groupId"]];
        break;
      }
      case kJMSGConversationTypeChatRoom: {
        [JMSGConversation deleteChatRoomConversationWithRoomId:param[@"roomId"]];
        break;
      }
    }
  
    [self handleResultWithDictionary:nil command:command error:nil];
}

- (void)getConversation:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];

    [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command: command error: error];
        return;
      }
      
      [self handleResultWithDictionary:[conversation conversationToDictionary] command:command error:error];
    }];
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

  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
    if (error) {
        [self handleResultWithDictionary: nil command: command error: error];
        return;
    }
    [conversation clearUnreadCount];
    [self handleResultWithDictionary:nil command:command error:error];
  }];
}

- (void)retractMessage:(CDVInvokedUrlCommand *)command {
    NSDictionary * param = [command argumentAtIndex:0];

  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
    if (error) {
        [self handleResultWithDictionary: nil command:command error: error];
        return;
    }
    
    JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
    if (message == nil) {
        [self returnErrorWithLog:@"cann't found this message" command:command];
        return;
    }
    [conversation retractMessage:message completionHandler:^(id resultObject, NSError *error) {
        [self handleResultWithDictionary:@{} command:command error:error];
    }];
  }];
}

- (void)updateGroupAvatar:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"id"]) {
    [self returnParamError:command];
    return;
  }
  
  NSString *mediaPath = param[@"imgPath"];
  
  if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
    mediaPath = mediaPath;
    NSData *img = [NSData dataWithContentsOfFile: mediaPath];
    
    [JMSGGroup updateGroupAvatarWithGroupId:param[@"id"] avatarData:img avatarFormat:[mediaPath pathExtension] completionHandler:^(id resultObject, NSError *error) {
        [self handleResultWithDictionary: nil command:command error: error];
    }];
  } else {
    [self returnParamError:command];
  }
}

- (void)downloadThumbGroupAvatar:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"id"]) {
    [self returnParamError:command];
    return;
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return ;
    }
    
    JMSGGroup *group = resultObject;
    [group thumbAvatarData:^(NSData *data, NSString *objectId, NSError *error) {

    [self handleResultWithDictionary: @{@"id": objectId, @"filePath": group.thumbAvatarLocalPath}
                             command: command
                               error: error];
    }];
  }];
}
- (void)downloadOriginalGroupAvatar:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  if (!param[@"id"]) {
    [self returnParamError: command];
    return;
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command:command error: error];
      return ;
    }
    
    JMSGGroup *group = resultObject;
    [group largeAvatarData:^(NSData *data, NSString *objectId, NSError *error) {
      [self handleResultWithDictionary: @{@"id": objectId, @"filePath": group.largeAvatarLocalPath}
                               command: command
                                 error: error];
    }];
  }];
}
//change
- (void)setConversationExtras:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  if (!param[@"type"]) {
    [self returnParamError:command];
    return;
  }
  
  if (!param[@"extras"]) {
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

  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
     if (error) {
       [self handleResultWithDictionary: nil command: command error: error];
        NSDictionary *extras = param[@"extras"];
        for (NSString *key in extras) {
          [conversation setExtraValue:extras[key] forKey:key];
        }
        [self handleResultWithDictionary:[conversation conversationToDictionary] command:command error:error];
       return;
     }
  }];
}


- (void)getMessageById:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
     if (error) {
       [self handleResultWithDictionary: nil command: command error: error];
       return;
     }

     JMSGMessage *msg = [conversation messageWithMessageId:param[@"messageId"]];
     if (msg != nil) {
       [self handleResultWithDictionary:[msg messageToDictionary] command:command error:error];
     } else {
       [self handleResultNilWithCommand:command error:error];
     }
  }];
}

- (void)deleteMessageById:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];

  [self getConversationWithDictionary:param callback:^(JMSGConversation *conversation, NSError *error) {
     if (error) {
       [self handleResultWithDictionary: nil command: command error: error];
       return;
     }
  
     BOOL result = [conversation deleteMessageWithMessageId:param[@"messageId"]];

     if (result) {
       [self handleResultNilWithCommand:command error:nil];
     } else {
       [self handleResultNilWithCommand:command error:[NSError errorWithDomain:@"message message fail" code: 3 userInfo: nil]];
     }
  }];
}

- (void)getChatRoomInfoListOfApp:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  NSNumber *start = nil;
  NSNumber *count = nil;
  if (!param[@"start"]) {
    [self returnParamError:command];
    start = param[@"start"];
    return;
  }
  
  if (!param[@"count"]) {
    [self returnParamError:command];
    count = param[@"count"];
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGChatRoom getChatRoomListWithAppKey:appKey start:[start integerValue] count:[count integerValue] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return;
    }
    NSArray *chatRoomArr = resultObject;
    NSArray *chatRoomDicArr = [chatRoomArr mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
      JMSGChatRoom *chatRoom = obj;
      return [chatRoom chatRoomToDictionary];
    }];

    [self handleResultWithArray:chatRoomDicArr command:command error:error];
  }];
}

- (void)getChatRoomInfoListOfUser:(CDVInvokedUrlCommand *)command {
  [JMSGChatRoom getMyChatRoomListCompletionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return;
    }
    
    NSArray *chatRoomArr = resultObject;
    NSArray *chatRoomDicArr = [chatRoomArr mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
      JMSGChatRoom *chatRoom = obj;
      return [chatRoom chatRoomToDictionary];
    }];
    
    [self handleResultWithArray:chatRoomDicArr command:command error:error];
  }];
}

- (void)getChatRoomInfoListById:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"roomIds"]) {
    [self returnParamError:command];
    return;
  }
  
  [JMSGChatRoom getChatRoomInfosWithRoomIds:param[@"roomIds"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return;
    }
    
    NSArray *chatRoomArr = resultObject;
    NSArray *chatRoomDicArr = [chatRoomArr mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
      JMSGChatRoom *chatRoom = obj;
      return [chatRoom chatRoomToDictionary];
    }];
    
    [self handleResultWithArray:chatRoomDicArr command:command error:error];
  }];
}

- (void)enterChatRoom:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"roomId"]) {
    [self returnParamError:command];
    return;
  }
  
  [JMSGChatRoom enterChatRoomWithRoomId:param[@"roomId"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return;
    }
    
    JMSGConversation *conversation = resultObject;
    [self handleResultWithDictionary:[conversation conversationToDictionary] command:command error:error];
    
  }];
}

- (void)exitChatRoom:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"roomId"]) {
    [self returnParamError:command];
    return;
  }
  
  [JMSGChatRoom leaveChatRoomWithRoomId:param[@"roomId"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return;
    }
    [self handleResultNilWithCommand:command error:error];
  }];
}

- (void)getChatRoomConversation:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"roomId"]) {
    [self returnParamError:command];
    return;
  }
  
  JMSGConversation *chatRoomConversation = [JMSGConversation chatRoomConversationWithRoomId:param[@"roomId"]];
  NSError *error = nil;
  if (!chatRoomConversation) {
    error = [NSError errorWithDomain:@"cannot found chat room convsersation from this roomId" code: 1 userInfo: nil];
    [self handleResultNilWithCommand:command error:error];
    return;
  }
  
  [self handleResultWithDictionary:[chatRoomConversation conversationToDictionary] command:command error: error];
}

- (void)getChatRoomConversationList:(CDVInvokedUrlCommand *)command {
  
  [JMSGConversation allChatRoomConversation:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return;
    }
    
    NSArray *conversationArr = resultObject;
    NSArray *conversationDicArr = [conversationArr mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
      JMSGConversation *conversation = obj;
      return [conversation conversationToDictionary];
    }];
    
    [self handleResultWithArray:conversationDicArr command:command error:error];
  }];
}

- (void)getChatRoomOwner:(CDVInvokedUrlCommand *)command {
  NSDictionary * param = [command argumentAtIndex:0];
  
  if (!param[@"roomId"]) {
    [self returnParamError:command];
    return;
  }
  
  [JMSGChatRoom getChatRoomInfosWithRoomIds:@[param[@"roomId"]] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      [self handleResultWithDictionary: nil command: command error: error];
      return;
    }
    NSArray *chatRoomArr = resultObject;
    if (chatRoomArr == nil || chatRoomArr.count == 0) {
      [self returnErrorWithLog:@"cann't found chat room from this roomId!" command:command];
      return;
    }
    JMSGChatRoom *chatRoom = chatRoomArr[0];
    [chatRoom getChatRoomOwnerInfo:^(id resultObject, NSError *error) {
      if (error) {
        [self handleResultWithDictionary: nil command: command error: error];
        return;
      }
      JMSGUser *user = resultObject;
      [self handleResultWithDictionary:[user userToDictionary] command:command error:error];
    }];
  }];
}

@end
