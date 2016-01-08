
#import "JMessagePlugin.h"
#import <JMessage/JMessage.h>
#import "JMessageHelper.h"

#define WEAK_SELF(weakSelf)  __weak __typeof(&*self)weakSelf = self;
#define Plugin_Name @"window.plugins.jmessagePlugin"

static NSString * errorNoFoundString =  @"not found";
static NSInteger  errorNoFound =  kJMSGErrorSDKUserNotLogin;


static NSString *const KEY_ERRORCODE = @"errorCode";
static NSString *const KEY_ERRORDESCRIP = @"errorDscription";


static NSString *const KEY_MESSAGEID = @"messageId";
static NSString *const KEY_CONTENTTYPE = @"contentType";
static NSString *const KEY_CONTENTTEXT = @"contentText";
static NSString *const KEY_LASTMESSAGE = @"lastMessage";
static NSString *const KEY_UNREADCOUNT = @"unreadCount";

//code style

@implementation JMessagePlugin


+(NSMutableDictionary *)getDictionaryWithError:(NSInteger)error description:(NSString*)descriptionString {
    NSMutableDictionary * dict = [NSMutableDictionary new];
    [dict setValue:[NSNumber numberWithLong:error] forKey:KEY_ERRORCODE];
    [dict setValue:descriptionString forKey:KEY_ERRORDESCRIP];
    return dict;
}


+(NSMutableDictionary*)getDictionaryFromError:(NSError*)error
{
    return [JMessagePlugin getDictionaryWithError:error.code description:error.debugDescription];
}


-(void)commonResponeWithSucess:(NSString*)sucessString error:(NSError*)error callbackId:(NSString*)callbackId
{
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

-(void)JMessageRegister:(CDVInvokedUrlCommand*)command
{
    NSString * username = [command argumentAtIndex:0];
    NSString * password = [command argumentAtIndex:1];
    
    NSLog(@"JMessageRegister");
   
    [JMSGUser registerWithUsername:username password:password completionHandler:^(id resultObject, NSError *error) {
        
        [self commonResponeWithSucess:@"注册成功" error:error callbackId:command.callbackId];
    }];
}

-(void)JMessageLogin:(CDVInvokedUrlCommand*)command
{
    NSLog(@"JMessageLogin");
    
    NSString * username = [command argumentAtIndex:0];
    NSString * password = [command argumentAtIndex:1];
    
    [JMSGUser loginWithUsername:username password:password completionHandler:^(id resultObject, NSError *error) {
        
        [self commonResponeWithSucess:@"登陆成功" error:error callbackId:command.callbackId];
    }];
}

-(void)JMessageLogout:(CDVInvokedUrlCommand*)command
{
    NSLog(@"JMessageLogout");
    [JMSGUser logout:^(id resultObject, NSError *error) {
        
    }];
}

-(void)JMessageGetUserInfo:(CDVInvokedUrlCommand*)command
{
    JMSGUser * info = [JMSGUser myInfo];
    CDVPluginResult* pluginResult = nil;

    WEAK_SELF(weak_self);

    if (info && info.username.length > 0) {//以此判断是否有用户信息
        NSMutableDictionary * dict = [NSMutableDictionary new];
        
        int gender = 0;//性别未定义
        if (info.gender == kJMSGUserGenderMale) {
            gender = 1;//男
        }
        else if(gender == kJMSGUserGenderFemale){
            gender = 2;//女
        }
        
        [dict setValue:info.username forKey:KEY_USERNAME];
        [dict setValue:info.nickname forKey:KEY_NICKNAME];
        [dict setValue:info.avatar forKey:KEY_AVATAR];//TODO: 这个头像的图片，还不知如何处理
        [dict setValue:[NSNumber numberWithInt:gender] forKey:KEY_GENDER];
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
        [weak_self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
    else{
        NSMutableDictionary * dict  = [JMessagePlugin getDictionaryWithError:errorNoFound description: errorNoFoundString];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
    }
}

-(void)JMessageSendSingleTextMessage:(CDVInvokedUrlCommand*)command
{
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
-(NSString*)convertMessageType:(JMSGContentType)type
{
    NSArray * contentTypeString  = @[@"MSGContentTypeUnknown",@"JMSGContentTypeText",@"JMSGContentTypeImage",@"JMSGContentTypeVoice",@"JMSGContentTypeCustom",@"JMSGContentTypeEventNotification"];
    
    return contentTypeString[type];
}
-(void)JMessageGetSingleHistoryMessage:(CDVInvokedUrlCommand*)command
{
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
                NSMutableDictionary * dict = [NSMutableDictionary new];
                
                [dict setValue:msg.msgId forKey:KEY_MESSAGEID];
                
                [dict setValue:[self convertMessageType:msg.contentType] forKey:KEY_CONTENTTYPE];
                
                if (msg.contentType == kJMSGContentTypeText && [msg.content isKindOfClass:[JMSGTextContent class]]) {
                    JMSGTextContent *textContent =  (JMSGTextContent*)msg.content;
                    [dict setValue:textContent.text forKey:KEY_CONTENTTEXT];
                }
                
                [resultArr addObject:dict];
                
                NSLog(@"%@",dict);
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

-(void)JMessageGetAllSingleConversation:(CDVInvokedUrlCommand*)command
{
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

-(void)JMessageDeleteSingleConversation:(CDVInvokedUrlCommand*)command
{
    
}


- (CDVPlugin*)initWithWebView:(UIWebView*)theWebView{
    if (self=[super initWithWebView:theWebView]) {
        
        NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
        [defaultCenter addObserver:self
                          selector:@selector(didReceiveJMessageMessage:)
                              name:kJJMessageReceiveMessage
                            object:nil];
        
        NSNotificationCenter *defaultCenter2 = [NSNotificationCenter defaultCenter];
        [defaultCenter2 addObserver:self
                          selector:@selector(didConversationChange:)
                              name:kJJMessageConversationChange
                            object:nil];
        
        NSNotificationCenter *defaultCenter3 = [NSNotificationCenter defaultCenter];
        [defaultCenter3 addObserver:self
                           selector:@selector(didSendSingleTextMessage:)
                               name:kJJMessageSendSingleMessageRespone
                             object:nil];

    }
    return self;
}

-(NSString*)getStringFromNotification:(NSNotification*)notification
{
    NSError  *error;
    
    NSDictionary *userInfo = [notification object];
    
    NSData   *jsonData   = [NSJSONSerialization dataWithJSONObject:userInfo options:0 error:&error];
    
    NSString *jsonString = [[NSString alloc]initWithData:jsonData encoding:NSUTF8StringEncoding];
    
    return jsonString;
}

-(void)commonSendMessage:(NSString*)functionName jsonParm:(NSString*)jsonString
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
    
    NSString *jsonString = [self getStringFromNotification:notification];
  
    NSLog(@"JMessage didReceiveJMessageMessage  %@",jsonString);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        
        [self commonSendMessage:@"onSingleConversationMessageReceived" jsonParm:jsonString];
    });
}




@end
