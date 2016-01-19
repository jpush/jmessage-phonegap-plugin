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


-(void)initNotifications {
  
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  [defaultCenter addObserver:self
                    selector:@selector(didReceiveJMessageMessage:)
                        name:kJJMessageReceiveMessage
                      object:nil];
  
  [defaultCenter addObserver:self
                    selector:@selector(didConversationChange:)
                        name:kJJMessageConversationChange
                      object:nil];
  
  [defaultCenter addObserver:self
                    selector:@selector(didSendSingleTextMessage:)
                        name:kJJMessageSendSingleMessageRespone
                      object:nil];
  
  [defaultCenter addObserver:self
                    selector:@selector(networkDidReceiveMessage:)
                        name:kJJPushReceiveMessage
                      object:nil];
  
  [defaultCenter addObserver:self
                    selector:@selector(networkDidReceiveNotification:)
                        name:kJJPushReceiveNotification
                      object:nil];
  
}


+(NSMutableDictionary *)getDictionaryWithError:(NSInteger)error
                                   description:(NSString*)descriptionString {
  NSMutableDictionary * dict = [NSMutableDictionary new];
  [dict setValue:[NSNumber numberWithLong:error] forKey:KEY_ERRORCODE];
  [dict setValue:descriptionString forKey:KEY_ERRORDESCRIP];
  return dict;
}

+(NSMutableDictionary*)getDictionaryFromError:(NSError*)error {
  return [JMessagePlugin getDictionaryWithError:error.code description:error.debugDescription];
}

-(void)commonResponeWithSucess:(NSString*)sucessString
                         error:(NSError*)error
                    callbackId:(NSString*)callbackId {
  WEAK_SELF(weak_self);
  CDVPluginResult* pluginResult = nil;
  if (error == nil) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:sucessString];
  } else {
    NSMutableDictionary * dict  = [JMessagePlugin getDictionaryFromError:error];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
  }
  [weak_self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

- (void)reponeParamErrorWithCallbackId:(NSString*)callbackId {
  CDVPluginResult* pluginResult = nil;
  NSMutableDictionary * dict  = [JMessagePlugin getDictionaryWithError:kJMSGErrorHttpPrameterInvalid description:errorParamString ];
  pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
  
}


//因为cordova 有lazy 特性，所以在不使用其他函数的情况下。这个函数作用在于激活插件
- (void)initPush:(CDVInvokedUrlCommand *)command {
  
}


- (void)userRegister:(CDVInvokedUrlCommand *)command {
  NSString * username = [command argumentAtIndex:0];
  NSString * password = [command argumentAtIndex:1];
  NSLog(@"JMessageRegister");
  [JMSGUser registerWithUsername:username password:password completionHandler:^(id resultObject, NSError *error) {
    [self commonResponeWithSucess:@"注册成功" error:error callbackId:command.callbackId];
  }];
}

- (void)userLogin:(CDVInvokedUrlCommand *)command {
  NSLog(@"JMessageLogin");
  NSString * username = [command argumentAtIndex:0];
  NSString * password = [command argumentAtIndex:1];
  [JMSGUser loginWithUsername:username password:password completionHandler:^(id resultObject, NSError *error) {
    [self commonResponeWithSucess:@"登陆成功" error:error callbackId:command.callbackId];
  }];
}

- (void)userLogout:(CDVInvokedUrlCommand *)command {
  NSLog(@"JMessageLogout");
  [JMSGUser logout:^(id resultObject, NSError *error) {
    [self commonResponeWithSucess:@"退出登陆成功" error:nil callbackId:command.callbackId];
  }];
}

- (void)getUserInfo:(CDVInvokedUrlCommand *)command {
  JMSGUser * info = [JMSGUser myInfo];
  CDVPluginResult* pluginResult = nil;
  WEAK_SELF(weak_self);
  if (info && info.username.length > 0) {//以此判断是否有用户信息
    NSMutableDictionary * dict = [NSMutableDictionary new];
    NSString * gender = KEY_UNKNOW;//性别未定义
    if (info.gender == kJMSGUserGenderMale) {
      gender = KEY_MAILE;//男
    }
    else if(info.gender == kJMSGUserGenderFemale){
      gender = KEY_FEMAILE;//女
    }
    [dict setValue:info.username forKey:KEY_USERNAME];
    [dict setValue:info.nickname forKey:KEY_NICKNAME];
    [dict setValue:info.avatar forKey:KEY_AVATAR];//TODO: 这个头像的图片，还不知如何处理
    [dict setValue:gender forKey:KEY_GENDER];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
    [weak_self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
  else{
    NSMutableDictionary * dict  = [JMessagePlugin getDictionaryWithError:errorNoFound description: errorNoFoundString];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
  }
}

- (void)setUserInfoWithFielType:(JMSGUserField)userFieldType
                            val:(id)val
                  sucessRespone:(NSString*)responeString
                     callbackId:(NSString*)callbackId{
  WEAK_SELF(weak_self);
  [JMSGUser updateMyInfoWithParameter:val userFieldType:userFieldType completionHandler:^(id resultObject, NSError *error) {
    CDVPluginResult* pluginResult = nil;
    if (error == nil) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:responeString];
    } else {
      NSMutableDictionary * dict  = [JMessagePlugin getDictionaryFromError:error];
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
    }
    [weak_self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
  }];
  
}



- (void)setUserNickname:(CDVInvokedUrlCommand *)command {
  NSString * nickname = [command argumentAtIndex:0];
  if (nickname.length > 0) {
    [self setUserInfoWithFielType:kJMSGUserFieldsNickname val:nickname sucessRespone:@"set nickname ok" callbackId:command.callbackId];
  }
  else{
    [self reponeParamErrorWithCallbackId:command.callbackId];
  }
}


- (void)setUserGender:(CDVInvokedUrlCommand *)command {
  NSString * gender = [command argumentAtIndex:0];
  if (gender.length > 0) {
    
    NSNumber *genderNumber = [NSNumber numberWithInt:kJMSGUserGenderUnknown];
    if ([gender isEqualToString:KEY_MAILE]) {
      genderNumber = [NSNumber numberWithInt:kJMSGUserGenderMale];
    }
    else if([gender isEqualToString:KEY_FEMAILE]){
      genderNumber = [NSNumber numberWithInt:kJMSGUserGenderFemale];
    }
    [self setUserInfoWithFielType:kJMSGUserFieldsGender val:genderNumber sucessRespone:@"set gender ok" callbackId:command.callbackId];
  }
  else{
    [self reponeParamErrorWithCallbackId:command.callbackId];
  }
}


- (void)setUserAvatar:(CDVInvokedUrlCommand *)command {
  NSString * avatar = [command argumentAtIndex:0];
  if (avatar.length > 0) {
    [self setUserInfoWithFielType:kJMSGUserFieldsAvatar val:avatar sucessRespone:@"set avatar ok" callbackId:command.callbackId];
  }
  else{
    [self reponeParamErrorWithCallbackId:command.callbackId];
  }
}


- (void)sendSingleTextMessage:(CDVInvokedUrlCommand *)command {
  NSString * username = [command argumentAtIndex:0];
  NSString * text = [command argumentAtIndex:1];
  WEAK_SELF(weak_self);
  [JMSGConversation createSingleConversationWithUsername:username completionHandler:^(id resultObject, NSError *error) {
    CDVPluginResult* pluginResult = nil;
    if (error == nil) {
      JMSGConversation * conversation = resultObject;
      [conversation sendTextMessage:text];
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"正在发送"];
    } else {
      NSLog(@"JMessageSendSingleTextMessage 创建会话失败");
      NSMutableDictionary * dict  = [JMessagePlugin getDictionaryFromError:error];
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
    }
    [weak_self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}


- (void)getSingleConversationHistoryMessage:(CDVInvokedUrlCommand *)command {
  WEAK_SELF(weak_self);
  NSString * username = [command argumentAtIndex:0];
  NSNumber * from = [command argumentAtIndex:1];
  NSNumber * limit = [command argumentAtIndex:2];
  [JMSGConversation createSingleConversationWithUsername:username completionHandler:^(id resultObject, NSError *error) {
    CDVPluginResult* pluginResult = nil;
    NSMutableArray *resultArr = [NSMutableArray new];
    if (error == nil) {
      JMSGConversation * conversation = resultObject;
      NSArray * messageList =  [conversation messageArrayFromNewestWithOffset:from limit:limit];
      for (JMSGMessage * msg in messageList) {
        
        NSError *err;
        
        NSString * jsonString  = [msg toJsonString];
        NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
        NSDictionary * dict = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&err];
        [resultArr addObject:dict];
        
      }
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:resultArr];
      
    } else {
      
      NSLog(@"JMessageGetSingleHistoryMessage");
      NSMutableDictionary * dict  = [JMessagePlugin getDictionaryFromError:error];
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
      
    }
    [weak_self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
  }];
}

- (void)getAllSingleConversation:(CDVInvokedUrlCommand *)command {
  WEAK_SELF(weak_self);
  
  [JMSGConversation allConversations:^(id resultObject, NSError *error) {
    CDVPluginResult* pluginResult = nil;
    if (error == nil) {
      NSArray * conversationArr = resultObject;
      NSMutableArray *resultArr = [NSMutableArray new];
      for (JMSGConversation *conversation in conversationArr) {
        
        NSMutableDictionary * dict = [NSMutableDictionary new];
        JMSGUser *user = conversation.target;
        int nGender = (int) user.gender;
        
        [dict setValue:user.username forKey:KEY_USERNAME];
        [dict setValue:user.nickname  forKey:KEY_NICKNAME];
        [dict setValue:user.avatar forKey:KEY_AVATAR];
        [dict setValue:[NSNumber numberWithInt:nGender] forKey:KEY_GENDER];
        
        [dict setValue:conversation.latestMessageContentText forKey:KEY_LASTMESSAGE];
        [dict setValue:conversation.unreadCount forKey:KEY_UNREADCOUNT];
        
        [resultArr addObject:dict];
        
        NSLog(@"%@",dict);
      }
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:resultArr];
      [weak_self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      
    }
    else{
      NSMutableDictionary * dict  = [JMessagePlugin getDictionaryFromError:error];
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
    }
  }];
}


- (void)deleteSingleConversation:(CDVInvokedUrlCommand *)command {
}

-(NSString*)getStringFromNotification:(NSNotification*)notification
{
  NSError  *error;
  NSDictionary *userInfo = [notification object];
  NSData   *jsonData   = [NSJSONSerialization dataWithJSONObject:userInfo options:0 error:&error];
  NSString *jsonString = [[NSString alloc]initWithData:jsonData encoding:NSUTF8StringEncoding];
  return jsonString;
}


-(void)commonSendMessage:(NSString *)functionName jsonParm:(NSString*)jsonString
{
  [self.commandDelegate evalJs:[NSString stringWithFormat:@"%@.%@('%@')",Plugin_Name,functionName,jsonString]];
}


-(void)didSendSingleTextMessage:(NSNotification *)notification {
  
  NSString *jsonString = [self getStringFromNotification:notification];
  NSLog(@"JMessage didReceiveJMessageMessage  %@",jsonString);
  dispatch_async(dispatch_get_main_queue(), ^{
    [self commonSendMessage:@"onSendSingleTextMessage" jsonParm:jsonString];
  });
}

- (void)didConversationChange:(NSNotification *)notification {
  NSString *jsonString = [self getStringFromNotification:notification];
  NSLog(@"JMessage didReceiveJMessageMessage  %@",jsonString);
  dispatch_async(dispatch_get_main_queue(), ^{
    [self commonSendMessage:@"onSingleConversationChanged" jsonParm:jsonString];
  });
}

//didReceiveJMessageMessage change name
- (void)didReceiveJMessageMessage:(NSNotification *)notification {
  NSDictionary *userInfo = [notification object];
  NSString *jsonString = [userInfo valueForKey:KEY_CONTENT];
  NSLog(@"JMessage didReceiveJMessageMessage  %@",jsonString);
  dispatch_async(dispatch_get_main_queue(), ^{
    [self commonSendMessage:@"onSingleConversationMessageReceived" jsonParm:jsonString];
  });
}



///////////////////JPush////////////////////////

-(void)tagsWithAliasCallback:(int)resultCode
                        tags:(NSSet *)tags
                       alias:(NSString *)alias{
  
  NSDictionary *dict=[NSDictionary dictionaryWithObjectsAndKeys:
                      [NSNumber numberWithInt:resultCode],KEY_RESULTCODE,
                      tags==nil?[NSNull null]:[tags allObjects],KEY_TAGS,
                      alias==nil?[NSNull null]:alias,KEY_ALIAS,nil];
  NSMutableDictionary *data = [NSMutableDictionary dictionary];
  [data setObject:[NSNumber numberWithInt:resultCode] forKey:KEY_RESULTCODE];
  [data setObject:tags==nil?[NSNull null]:[tags allObjects] forKey:KEY_TAGS];
  [data setObject:alias==nil?[NSNull null]:alias forKey:KEY_ALIAS];
  NSError  *error;
  
  NSData   *jsonData   = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&error];
  NSString *jsonString = [[NSString alloc]initWithData:jsonData encoding:NSUTF8StringEncoding];
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.commandDelegate evalJs:[NSString stringWithFormat:@"cordova.fireDocumentEvent('jpush.setTagsWithAlias',%@)",jsonString]];
  });
  
}


- (void)setTagsWithAlias:(CDVInvokedUrlCommand *)command {
  NSArray *arguments=command.arguments;
  if (!arguments||[arguments count]<2) {
    return ;
  }
  NSString *alias=[arguments objectAtIndex:0];
  NSArray  *arrayTags=[arguments objectAtIndex:1];
  NSSet* set=[NSSet setWithArray:arrayTags];
  [JPUSHService setTags:set
                  alias:alias
       callbackSelector:@selector(tagsWithAliasCallback:tags:alias:)
                 object:self];
}


- (void)setTags:(CDVInvokedUrlCommand *)command {
  NSArray *arguments=[command arguments];
  NSString *tags=[arguments objectAtIndex:0];
  NSArray  *array=[tags componentsSeparatedByString:@","];
  [JPUSHService setTags:[NSSet setWithArray:array]
       callbackSelector:@selector(tagsWithAliasCallback:tags:alias:)
                 object:self];
  
}

- (void)setAlias:(CDVInvokedUrlCommand *)command {
  NSArray *arguments=[command arguments];
  [JPUSHService setAlias:[arguments objectAtIndex:0]
        callbackSelector:@selector(tagsWithAliasCallback:tags:alias:)
                  object:self];
}

- (void)failWithCallbackID:(NSString *)callbackID {
  CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
  [self.commandDelegate sendPluginResult:result callbackId:callbackID];
}


- (void)succeedWithPluginResult:(CDVPluginResult *)result withCallbackID:(NSString *)callbackID {
  [self.commandDelegate sendPluginResult:result callbackId:callbackID];
}


- (void)getRegistrationID:(CDVInvokedUrlCommand *)command {
  NSString* registrationID = [JPUSHService registrationID];
  CDVPluginResult *result=[self pluginResultForValue:registrationID];
  if (result) {
    [self succeedWithPluginResult:result withCallbackID:command.callbackId];
  } else {
    [self failWithCallbackID:command.callbackId];
  }
}



- (CDVPluginResult *)pluginResultForValue:(id)value {
  CDVPluginResult *result;
  if ([value isKindOfClass:[NSString class]]) {
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                               messageAsString:[value stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
  } else if ([value isKindOfClass:[NSNumber class]]) {
    CFNumberType numberType = CFNumberGetType((CFNumberRef)value);
    //note: underlyingly, BOOL values are typedefed as char
    if (numberType == kCFNumberIntType || numberType == kCFNumberCharType) {
      result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:[value intValue]];
    } else  {
      result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:[value doubleValue]];
    }
  } else if ([value isKindOfClass:[NSArray class]]) {
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:value];
  } else if ([value isKindOfClass:[NSDictionary class]]) {
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:value];
  } else if ([value isKindOfClass:[NSNull class]]) {
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  } else {
    NSLog(@"Cordova callback block returned unrecognized type: %@", NSStringFromClass([value class]));
    return nil;
  }
  return result;
}



- (void)startLogPageView:(CDVInvokedUrlCommand *)command {
  NSArray *arguments=command.arguments;
  if (!arguments||[arguments count]<1) {
    NSLog(@"startLogPageView argument  error");
    return ;
  }
  NSString * pageName=[arguments objectAtIndex:0];
  if (pageName) {
    [JPUSHService startLogPageView:pageName];
  }
}


- (void)stopLogPageView:(CDVInvokedUrlCommand *)command {
  NSArray *arguments=command.arguments;
  if (!arguments||[arguments count]<1) {
    NSLog(@"stopLogPageView argument  error");
    return ;
  }
  NSString * pageName=[arguments objectAtIndex:0];
  if (pageName) {
    [JPUSHService stopLogPageView:pageName];
  }
}


-(void)setBadge:(CDVInvokedUrlCommand *)command{
  NSArray *argument=command.arguments;
  if ([argument count]<1) {
    NSLog(@"setBadge argument error!");
    return;
  }
  NSNumber *badge=[argument objectAtIndex:0];
  [JPUSHService setBadge:[badge intValue]];
}


-(void)resetBadge:(CDVInvokedUrlCommand *)command{
  [JPUSHService resetBadge];
}



-(void)setDebugModeFromIos:(CDVInvokedUrlCommand *)command{
  [JPUSHService setDebugMode];
}


-(void)setLogOFF:(CDVInvokedUrlCommand *)command{
  [JPUSHService setLogOFF];
}


-(void)stopPush:(CDVInvokedUrlCommand *)command{
  [[UIApplication sharedApplication]unregisterForRemoteNotifications];
}


-(void)commonPushRespone:(NSString *)functionName
                jsonParm:(NSString *)jsonString{
  [self.commandDelegate evalJs:[NSString stringWithFormat:@"%@.%@('%@')",Plugin_Push_Name,functionName,jsonString]];
}


- (void)networkDidReceiveMessage:(NSNotification *)notification {
  NSDictionary *userInfo = [notification object];
  NSLog(@"networkDidReceiveMessage %@",userInfo);
  
  NSError  *error;
  NSData   *jsonData   = [NSJSONSerialization dataWithJSONObject:userInfo options:0 error:&error];
  NSString *jsonString = [[NSString alloc]initWithData:jsonData encoding:NSUTF8StringEncoding];
  dispatch_async(dispatch_get_main_queue(), ^{
    [self commonPushRespone:@"onReceiveMessageIniOS" jsonParm:jsonString];
  });
  
}


-(void)networkDidReceiveNotification:(id)notification{
  NSError  *error;
  NSDictionary *userInfo = [notification object];
  
  NSData   *jsonData   = [NSJSONSerialization dataWithJSONObject:userInfo options:0 error:&error];
  NSString *jsonString = [[NSString alloc]initWithData:jsonData encoding:NSUTF8StringEncoding];
  switch ([UIApplication sharedApplication].applicationState) {
    case UIApplicationStateActive:
    {
      dispatch_async(dispatch_get_main_queue(), ^{
        [self commonPushRespone:@"onReceiveNofiticationIniOS" jsonParm:jsonString];
      });
    }
      break;
    case UIApplicationStateInactive:
    case UIApplicationStateBackground:
    {
      dispatch_async(dispatch_get_main_queue(), ^{
        [self commonPushRespone:@"onOpenNofiticationIniOS" jsonParm:jsonString];
        
      });
    }
      break;
    default:
      //do nothing
      break;
  }
}

@end
