




#import <Cordova/CDV.h>
#import <JMessage/JMessage.h>
@interface JMessagePlugin : CDVPlugin<JMessageDelegate>


-(void)JMessageRegister:(CDVInvokedUrlCommand*)command;
-(void)JMessageLogin:(CDVInvokedUrlCommand*)command;
-(void)JMessageLogout:(CDVInvokedUrlCommand*)command;
-(void)JMessageGetUserInfo:(CDVInvokedUrlCommand*)command;
-(void)JMessageSendSingleTextMessage:(CDVInvokedUrlCommand*)command;
-(void)JMessageGetSingleHistoryMessage:(CDVInvokedUrlCommand*)command;
-(void)JMessageGetAllSingleConversation:(CDVInvokedUrlCommand*)command;
-(void)JMessageDeleteSingleConversation:(CDVInvokedUrlCommand*)command;


 
//+(void)setLaunchOptions:(NSDictionary *)theLaunchOptions;
//-(void)setTagsWithAlias:(CDVInvokedUrlCommand*)command;
//-(void)setTags:(CDVInvokedUrlCommand*)command;
//-(void)setAlias:(CDVInvokedUrlCommand*)command;
//-(void)getRegistrationID:(CDVInvokedUrlCommand*)command;
//-(void)startLogPageView:(CDVInvokedUrlCommand*)command;
//-(void)stopLogPageView:(CDVInvokedUrlCommand*)command;

@end
