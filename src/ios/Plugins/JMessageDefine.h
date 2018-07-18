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

static NSString *const JMessagePluginName = @"window.plugins.jmessage";
static NSString *const JPushPluginName    = @"window.plugins.jPushPlugin";

static NSString *const JMessageConfig_FileName     = @"JMessageConfig";
static NSString *const JMessageConfig_Appkey       = @"Appkey";
static NSString *const JMessageConfig_Channel      = @"Channel";
static NSString *const JMessageConfig_IsProduction = @"IsProduction";
static NSString *const JMessageConfig_IsIDFA       = @"IsIDFA";
static NSString *const JMessageConfig_Delay        = @"Delay";

// 在线消息
#define kJJMessageReceiveMessage     @"kJJMessageReceiveMessage"
#define kJJMessageReceiveChatroomMessage     @"kJJMessageReceiveChatroomMessage"
#define kJJMessageSendMessageRespone @"kJJMessageSendMessageRespone"

//Conversation 回调
#define kJJMessageConversationChanged @"kJJMessageConversationChanged"
#define kJJMessageUnreadChanged       @"kJJMessageUnreadChanged"

//离线消息
#define kJJMessageSyncOfflineMessage @"kJJMessageSyncOfflineMessage"

// 漫游消息同步

#define kJJMessageSyncRoamingMessage @"kJJMessageSyncRoamingMessage"

//Group 回调
#define kJJMessageGroupInfoChanged @"kJJMessageGroupInfoChanged"
#define kJJMessageGroupInfoChanged @"kJJMessageGroupInfoChanged"
#define kJJMessageReceiveApplyJoinGroupApproval @"kJJMessageReceiveApplyJoinGroupApproval"
#define kJJMessageReceiveGroupAdminReject @"kJJMessageReceiveGroupAdminReject"
#define kJMessageReceiveGroupAdminApproval @"kJMessageReceiveGroupAdminApproval"

//User 回调
#define kJJMessageLoginUserKicked  @"kJJMessageLoginUserKicked"
#define kJJMessageLoginStateChanged  @"kJJMessageLoginStateChanged"
#define kJJMessageContactNotify  @"kJJMessageContactNotify"
#define kJJMessageRetractMessage  @"kJJMessageretractMessage"


//message
static NSString *const KEY_ERRORCODE    = @"errorCode";
static NSString *const KEY_ERRORDESCRIP = @"errorDscription";
static NSString *const KEY_CONTENTTYPE  = @"contentType";
static NSString *const KEY_LASTMESSAGE  = @"lastMessage";
static NSString *const KEY_UNREADCOUNT  = @"unreadCount";
static NSString *const KEY_CONTENT      = @"content";
static NSString *const KEY_MSGID        = @"msgId";
static NSString *const KEY_RESPONE      = @"respone";


//Group
static NSString *const KEY_GROUP_GID   = @"gid";
static NSString *const KEY_GROUP_NAME  = @"name";
static NSString *const KEY_GROUP_DESC  = @"desc";
static NSString *const KEY_GROUP_LEVEL = @"level";
static NSString *const KEY_GROUP_GLAG  = @"flag";
static NSString *const KEY_GROUP_OWNER = @"owner";
static NSString *const KEY_GROUP_OWNERAPPKEY = @"ownerappkey";
static NSString *const KEY_GROUP_MAXMEMBERCOUNT = @"maxMemberCount";
static NSString *const KEY_GROUP_ISNODISTURB = @"isNoDisturb";



#endif /* ConstantDef_h */
