



#import <Cordova/CDV.h>
#import <JMessage/JMessage.h>



@interface JMessagePlugin : CDVPlugin<JMessageDelegate>

//JMessage Interface

- (void)userRegister:(CDVInvokedUrlCommand *)command;
- (void)userLogin:(CDVInvokedUrlCommand *)command;
- (void)userLogout:(CDVInvokedUrlCommand *)command;
- (void)getUserInfo:(CDVInvokedUrlCommand *)command;
- (void)sendSingleTextMessage:(CDVInvokedUrlCommand *)command;
- (void)getSingleConversationHistoryMessage:(CDVInvokedUrlCommand *)command;
- (void)getAllSingleConversation:(CDVInvokedUrlCommand *)command;
- (void)deleteSingleConversation:(CDVInvokedUrlCommand *)command;


- (void)initPush:(CDVInvokedUrlCommand *)command;

- (void)setTagsWithAlias:(CDVInvokedUrlCommand *)command;
- (void)setTags:(CDVInvokedUrlCommand *)command;
- (void)setAlias:(CDVInvokedUrlCommand *)command;
- (void)getRegistrationID:(CDVInvokedUrlCommand *)command;
- (void)startLogPageView:(CDVInvokedUrlCommand *)command;
- (void)stopLogPageView:(CDVInvokedUrlCommand *)command;



@end
