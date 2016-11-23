//
//  ConstantDef.h
//  jmessage
//
//  Created by ljg on 16/1/19.
//
//

#ifndef ConstantDef_h
#define ConstantDef_h


#define WEAK_SELF(weakSelf)  __weak __typeof(&*self)weakSelf = self;
#define Plugin_Name @"window.plugins.jmessagePlugin"
#define Plugin_Push_Name @"window.plugins.jPushPlugin"



#define kJJMessageReceiveMessage @"kJJMessageReceiveMessage"
#define kJJMessageSendMessageRespone @"kJJMessageSendMessageRespone"

//Conversation 回调
#define kJJMessageConversationChanged @"kJJMessageConversationChanged"
#define kJJMessageUnreadChanged @"kJJMessageUnreadChanged"

//Group 回调
#define kJJMessageGroupInfoChanged @"kJJMessageGroupInfoChanged"

//User 回调
#define kJJMessageLoginUserKicked @"kJJMessageLoginUserKicked"

#define kJJPushReceiveNotification @"kJJPushReceiveNotification"
#define kJJPushReceiveMessage @"kJJPushReceiveMessage"

//image voice 消息 回调
#define kJJMessageReceiveImageData @"kJJMessageReceiveImageData"
#define kJJMessageReceiveVoiceData @"kJJMessageReceiveVoiceData"
#define kJJMessageReceiveFileData  @"kJJMessageReceiveFileData"
#define kJJMessageReceiveLocationData  @"kJJMessageReceiveLocationData"



static NSInteger  errorNoFound =  kJMSGErrorSDKUserNotLogin;

static NSString * errorNoFoundString =  @"not found";
static NSString * errorParamString =  @"error param";
static NSString *const KEY_ERRORCODE = @"errorCode";
static NSString *const KEY_ERRORDESCRIP = @"errorDscription";
static NSString *const KEY_MESSAGEID = @"messageId";
static NSString *const KEY_CONTENTTYPE = @"contentType";
static NSString *const KEY_CONTENTTEXT = @"contentText";
static NSString *const KEY_LASTMESSAGE = @"lastMessage";
static NSString *const KEY_UNREADCOUNT = @"unreadCount";
static NSString *const KEY_CONTENT = @"content";
static NSString *const KEY_MSGID = @"msgId";
static NSString *const KEY_RESPONE = @"respone";
static NSString *const KEY_TARGETID = @"targetId";

static NSString *const KEY_UNKNOW = @"unknow";
static NSString *const KEY_MAILE = @"male";
static NSString *const KEY_FEMAILE = @"female";

static NSString *const KEY_RESULTCODE = @"resultCode";
static NSString *const KEY_TAGS       = @"tags";
static NSString *const KEY_ALIAS      = @"alias";




static NSString *const JM_APP_KEY = @"APP_KEY";
static NSString *const JM_APP_CHANNEL = @"CHANNEL";

static NSString *const JMessageConfigFileName = @"JMessageConfig";

//Group
static NSString *const KEY_GROUP_GID = @"gid";
static NSString *const KEY_GROUP_NAME = @"name";
static NSString *const KEY_GROUP_DESC = @"desc";
static NSString *const KEY_GROUP_LEVEL = @"level";
static NSString *const KEY_GROUP_GLAG = @"flag";
static NSString *const KEY_GROUP_OWNER = @"owner";


#endif /* ConstantDef_h */
