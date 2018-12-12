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
#import "JMessageDefine.h"
#import <objc/runtime.h>
#import <UserNotifications/UserNotifications.h>

@interface JMessageHelper ()
@end

@implementation JMessageHelper

+ (JMessageHelper *)shareInstance {
  static JMessageHelper *instance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    instance = [[JMessageHelper alloc] init];
  });
  return instance;
}


-(void)initJMessage:(NSDictionary*)options{
  NSNumber *isOpenMessageRoaming = @(false);
  if (options[@"isOpenMessageRoaming"]) {
    isOpenMessageRoaming = options[@"isOpenMessageRoaming"];
  }
  
  NSString *plistPath = [[NSBundle mainBundle] pathForResource:JMessageConfig_FileName ofType:@"plist"];
  if (plistPath == nil) {
    NSLog(@"error: JMessageConfig.plist");
    assert(0);
  }
  
  NSMutableDictionary *plistData = [[NSMutableDictionary alloc] initWithContentsOfFile:plistPath];
  NSString *appkey       = [plistData valueForKey:JMessageConfig_Appkey];
  [JMessageHelper shareInstance].JMessageAppKey = appkey;
  NSString *channel      = [plistData valueForKey:JMessageConfig_Channel];
  NSNumber *isProduction = [plistData valueForKey:JMessageConfig_IsProduction];
  
  // init third-party SDK
  [JMessage addDelegate:self withConversation:nil];

  [JMessage setupJMessage:_launchOptions
                   appKey:appkey
                  channel:channel
         apsForProduction:[isProduction boolValue]
                 category:nil
           messageRoaming:[isOpenMessageRoaming boolValue]];
}

- (void)onReceiveMessageRetractEvent:(JMSGMessageRetractEvent *)retractEvent {
  NSDictionary *conversation = [retractEvent.conversation conversationToDictionary];
  NSDictionary *messageDic = [retractEvent.retractMessage messageToDictionary];
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageRetractMessage
                                                      object:@{@"conversation":conversation,
                                                               @"retractedMessage":messageDic}];
}

- (void)onReceiveMessage:(JMSGMessage *)message error:(NSError *)error{
  NSMutableDictionary *dict = [NSMutableDictionary new];
  dict = [message messageToDictionary];
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveMessage object:dict];
}

- (void)onReceiveChatRoomConversation:(JMSGConversation *)conversation messages:(NSArray<__kindof JMSGMessage *> *)messages {
  NSArray *messageDicArr = [messages mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    JMSGMessage *message = obj;
    return [message messageToDictionary];
  }];
  
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveChatroomMessage object:messageDicArr];
}

- (void)onReceiveNotificationEvent:(JMSGNotificationEvent *)event {

  switch (event.eventType) {
    case kJMSGEventNotificationCurrentUserInfoChange:
      break;
    case kJMSGEventNotificationReceiveServerFriendUpdate:
      
      break;
    case kJMSGEventNotificationCreateGroup:
      
      break;
    case kJMSGEventNotificationExitGroup:
      
      break;
    case kJMSGEventNotificationAddGroupMembers:
      
      break;
    case kJMSGEventNotificationRemoveGroupMembers:
      
      break;
    case kJMSGEventNotificationUpdateGroupInfo:
      
      break;
    default:
      break;
  }
}

// 登录状态变更事件
- (void)onReceiveUserLoginStatusChangeEvent:(JMSGUserLoginStatusChangeEvent *)event {
    switch (event.eventType) {
        case kJMSGEventNotificationLoginKicked:
            [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageLoginStateChanged
                                                                object:@{@"type":@"user_kicked"}];
            break;
        case kJMSGEventNotificationServerAlterPassword:
            [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageLoginStateChanged
                                                                object:@{@"type":@"user_password_change"}];
            break;
        case kJMSGEventNotificationUserLoginStatusUnexpected:
            [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageLoginStateChanged
                                                                object:@{@"type":@"user_login_state_unexpected"}];
            break;
    }
}

// 好友事件
- (void)onReceiveFriendNotificationEvent:(JMSGFriendNotificationEvent *)event {
    switch (event.eventType) {
        case kJMSGEventNotificationReceiveFriendInvitation:{
            JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *) event;
            JMSGUser *user = [friendEvent getFromUser];
            [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageContactNotify
                                                                object:@{
                                                                         @"type":@"invite_received",
                                                                         @"reason":[friendEvent eventDescription] ?: @"",
                                                                         @"fromUsername":[friendEvent getFromUser].username,
                                                                         @"fromUserAppKey":user.appKey}];
        }
            break;
        case kJMSGEventNotificationAcceptedFriendInvitation:{
            JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *) event;
            JMSGUser *user = [friendEvent getFromUser];
            [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageContactNotify
                                                                object:@{
                                                                         @"type":@"invite_accepted",
                                                                         @"reason":[friendEvent eventDescription] ?: @"",
                                                                         @"fromUsername":[friendEvent getFromUser].username,
                                                                         @"fromUserAppKey":user.appKey}];
        }
            break;
        case kJMSGEventNotificationDeclinedFriendInvitation:{
            JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *) event;
            JMSGUser *user = [friendEvent getFromUser];
            [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageContactNotify
                                                                object:@{
                                                                         @"type":@"invite_declined",
                                                                         @"reason":[friendEvent eventDescription] ?: @"",
                                                                         @"fromUsername":[friendEvent getFromUser].username,
                                                                         @"fromUserAppKey":user.appKey}];
        }
            break;
        case kJMSGEventNotificationDeletedFriend:{
            JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *) event;
            JMSGUser *user = [friendEvent getFromUser];
            [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageContactNotify
                                                                object:@{
                                                                         @"type":@"contact_deleted",
                                                                         @"reason":[friendEvent eventDescription] ?: @"",
                                                                         @"fromUsername":[friendEvent getFromUser].username,
                                                                         @"fromUserAppKey":user.appKey}];
        }
            break;
            
        default:
            break;
    }
}

#pragma mark - Group 回调

/*!
 * @abstract 群组信息 (GroupInfo) 信息通知
 * @param group 变更后的群组对象
 * @discussion 如果想要获取通知, 需要先注册回调. 具体请参考 JMessageDelegate 里的说明.
 */
- (void)onGroupInfoChanged:(JMSGGroup *)group {
    
}

/*!
 * @abstract 监听申请入群通知
 * @param event 申请入群事件
 * @discussion 只有群主和管理员能收到此事件；申请入群事件相关参数请查看 JMSGApplyJoinGroupEvent 类，在群主审批此事件时需要传递事件的相关参数
 */
- (void)onReceiveApplyJoinGroupApprovalEvent:(JMSGApplyJoinGroupEvent *)event {
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveApplyJoinGroupApproval
                                                        object: [event eventToDictionary]];
}

/*!
 * @abstract 监听管理员拒绝入群申请通知
 * @param event 拒绝入群申请事件
 * @discussion 只有申请方和被申请方会收到此事件；拒绝的相关描述和原因请查看 JMSGGroupAdminRejectApplicationEvent 类
 */
- (void)onReceiveGroupAdminRejectApplicationEvent:(JMSGGroupAdminRejectApplicationEvent *)event {
    [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageReceiveGroupAdminReject
                                                        object: [event eventToDictionary]];
}

/*!
 * @abstract 监听管理员审批通知
 * @discussion 只有管理员才会收到该事件；当管理员同意或拒绝了某个入群申请事件时，其他管理员就会收到该事件，相关属性请查看 JMSGGroupAdminApprovalEvent 类
 */
- (void)onReceiveGroupAdminApprovalEvent:(JMSGGroupAdminApprovalEvent *)event {
    [[NSNotificationCenter defaultCenter] postNotificationName:kJMessageReceiveGroupAdminApproval
                                                        object: [event eventToDictionary]];
}

- (NSString *)getFullPathWith:(NSString *) path {
  NSString * homeDir = NSHomeDirectory();
  return [NSString stringWithFormat:@"%@/Documents/%@", homeDir,path];
}

- (void)onSendMessageResponse:(JMSGMessage *)message error:(NSError *)error {
  NSMutableDictionary *response = @{}.mutableCopy;
  if (error) {
    response[@"error"] = error;
  }
  response[@"message"] = [message messageToDictionary];
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageSendMessageRespone object:response];
}

- (void)onReceiveMessageDownloadFailed:(JMSGMessage *)message{
  NSLog(@"onReceiveMessageDownloadFailed");
}

#pragma mark - Conversation 回调

- (void)onConversationChanged:(JMSGConversation *)conversation{
  NSMutableDictionary * dict = [NSMutableDictionary new];
  dict = [conversation conversationToDictionary];
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageConversationChanged object:dict];
}

- (void)onUnreadChanged:(NSUInteger)newCount{
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageUnreadChanged
                                                      object:[NSNumber numberWithUnsignedInteger:newCount]];
}

- (void)onSyncRoamingMessageConversation:(JMSGConversation *)conversation {
  [[NSNotificationCenter defaultCenter] postNotificationName: kJJMessageSyncRoamingMessage
                                                      object: [conversation conversationToDictionary]];
}

- (void)onSyncOfflineMessageConversation:(JMSGConversation *)conversation
                         offlineMessages:(NSArray JMSG_GENERIC ( __kindof JMSGMessage *) *)offlineMessages {
  NSMutableDictionary *callBackDic = @{}.mutableCopy;
  callBackDic[@"conversation"] = [conversation conversationToDictionary];
  NSMutableArray *messageArr = @[].mutableCopy;
  for (JMSGMessage *message in offlineMessages) {
    [messageArr addObject: [message messageToDictionary]];
  }
  callBackDic[@"messageArray"] = messageArr;
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageSyncOfflineMessage object:callBackDic];
}

#pragma mark - Group 回调

@end


#pragma mark - category

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

@implementation JMSGConversation (JMessage)
-(NSMutableDictionary*)conversationToDictionary{
  NSMutableDictionary *dict = [NSMutableDictionary dictionary];
  
  switch (self.conversationType) {
    case kJMSGConversationTypeSingle:{
      JMSGUser *user = self.target;
      dict[@"target"] = [user userToDictionary];
      dict[@"conversationType"] = @"single";
      break;
    }
      
    case kJMSGConversationTypeGroup:{
      JMSGGroup *group = self.target;
      dict[@"target"] = [group groupToDictionary];
      dict[@"conversationType"] = @"group";
      break;
    }
    case kJMSGConversationTypeChatRoom:{
      JMSGChatRoom *chatroom = self.target;
      dict[@"target"] = [chatroom chatRoomToDictionary];
      dict[@"conversationType"] = @"chatRoom";
      break;
    }
  }
  
  dict[@"latestMessage"] = [self.latestMessage messageToDictionary];
  dict[@"unreadCount"] = self.unreadCount;
  dict[@"title"] = [self title];
  dict[@"extras"] = [self getConversationExtras];
  return dict;
}


@end

@implementation JMSGUser (JMessage)
-(NSMutableDictionary*)userToDictionary{
  NSMutableDictionary *dict = [NSMutableDictionary dictionary];
  dict[@"type"] = @"user";
  dict[@"username"] = self.username;
  dict[@"nickname"] = self.nickname;
  dict[@"birthday"] = self.birthday;
  dict[@"region"] = self.region;
  dict[@"signature"] = self.signature;
  dict[@"address"] = [self address];
  dict[@"noteName"] = self.noteName;
  dict[@"noteText"] = self.noteText;
  dict[@"appKey"] = self.appKey;
  dict[@"isNoDisturb"] = @(self.isNoDisturb);
  dict[@"isInBlackList"] = @(self.isInBlacklist);
  dict[@"isFriend"] = @(self.isFriend);
  dict[@"extras"] = self.extras;
  
  if([[NSFileManager defaultManager] fileExistsAtPath: [self thumbAvatarLocalPath] ?: @""]){
    dict[@"avatarThumbPath"] = [self thumbAvatarLocalPath];
  } else {
    dict[@"avatarThumbPath"] = @"";
  }
  
  switch (self.gender) {
    case kJMSGUserGenderUnknown:
      dict[@"gender"] = @"unknown";
      break;
    case kJMSGUserGenderFemale:
      dict[@"gender"] = @"female";
      break;
    case kJMSGUserGenderMale:
      dict[@"gender"] = @"male";
      break;
    default:
      break;
  }
  return dict;
}

- (NSString *)getLargeAvatarFilePath {
  NSString *avatarPath = [self largeAvatarLocalPath];
  if([[NSFileManager defaultManager] fileExistsAtPath: avatarPath]){
    return avatarPath;
  } else {
    return @"";
  }
}
@end

@implementation JMSGGroup (JMessage)
-(NSMutableDictionary*)groupToDictionary {
  NSMutableDictionary *dict = [NSMutableDictionary dictionary];
  dict[@"type"] = @"group";
  dict[@"id"] = self.gid;
  dict[@"name"] = self.name;
  dict[@"desc"] = self.desc;
  dict[@"level"] = self.level;
  dict[KEY_GROUP_GLAG] = self.flag;
  dict[@"owner"] = self.owner;
  dict[@"ownerAppKey"] = self.ownerAppKey;
  dict[@"maxMemberCount"] = self.maxMemberCount;
  dict[@"isNoDisturb"] = @(self.isNoDisturb);
  dict[@"isShieldMessage"] = @(self.isShieldMessage);
  dict[@"displayName"] = self.displayName;
  return dict;
}
@end


@implementation JMSGGroupMemberInfo (JMessage)
- (NSMutableDictionary *)memberToDictionary {
  NSMutableDictionary *dict = [NSMutableDictionary dictionary];
  dict[@"user"] = [self.user userToDictionary];
  dict[@"groupNickname"] = [self displayName] ? : @"";

  switch (self.memberType) {
    case kJMSGGroupMemberTypeOrdinary:
      dict[@"memberType"] = @"ordinary";
      break;
    case kJMSGGroupMemberTypeOwner:
      
      break;
    case kJMSGGroupMemberTypeAdmin:
      dict[@"memberType"] = @"admin";
      break;
  }
  dict[@"joinGroupTime"] = @(self.ctime);
  return dict;
}
@end

@implementation JMSGGroupInfo (JMessage)
-(NSMutableDictionary*)groupToDictionary {
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    dict[@"id"] = self.gid;
    dict[@"name"] = self.name;
    dict[@"desc"] = self.desc;
    dict[@"maxMemberCount"] = self.maxMemberCount;
    switch (self.groupType) {
        case kJMSGGroupTypePublic:
            dict[@"groupType"] = @"public";
            break;
            
        default:
            dict[@"groupType"] = @"private";
            break;
    }
    return dict;
}
@end

@implementation JMSGMessage (JMessage)

- (NSMutableDictionary *)messageToDictionary {
  NSMutableDictionary *dict = [NSMutableDictionary new];

  dict[@"id"] = self.msgId; // 本地数据库中的消息 Id。
  dict[@"serverMessageId"] = self.serverMessageId;  // 服务器端对应的消息 Id。
  dict[@"from"] = [self.fromUser userToDictionary];
  
  if (self.content.extras != nil) {
    dict[@"extras"] = self.content.extras;
  }

  dict[@"isSend"] = @(!self.isReceived);
  switch (self.targetType) {
    case kJMSGConversationTypeSingle:{
      JMSGUser *user = self.target;
      dict[@"target"] = [user userToDictionary];
      break;
    }
    case kJMSGConversationTypeGroup:{
      JMSGGroup *group = self.target;
      dict[@"target"] = [group groupToDictionary];
      break;
    }
    case kJMSGConversationTypeChatRoom:{
      JMSGChatRoom *chatroom = self.target;
      dict[@"target"] = [chatroom chatRoomToDictionary];
      break;
    }
  }
  
  dict[@"createTime"] = self.timestamp;
  
  switch (self.contentType) {
    case kJMSGContentTypeUnknown: {
      dict[@"type"] = @"unknown";
      break;
    }
    case kJMSGContentTypeText: {
      dict[@"type"] = @"text";
      JMSGTextContent *textContent = (JMSGTextContent *) self.content;
      dict[@"text"] = textContent.text;
      break;
    }
    case kJMSGContentTypeImage: {
      dict[@"type"] = @"image";
      JMSGImageContent *imageContent = (JMSGImageContent *) self.content;
      dict[@"thumbPath"] = [imageContent thumbImageLocalPath];
      break;
    }
    case kJMSGContentTypeVoice: {
      dict[@"type"] = @"voice";
      dict[@"path"] = [self getOriginMediaFilePath];
      JMSGVoiceContent *voiceContent = (JMSGVoiceContent *) self.content;
      dict[@"duration"] = [voiceContent duration];
      break;
    }
    case kJMSGContentTypeCustom: {
      dict[@"type"] = @"custom";
      JMSGCustomContent *customContent = (JMSGCustomContent *) self.content;
      dict[@"customObject"] = customContent.customDictionary;
      break;
    }
    case kJMSGContentTypeEventNotification: {
      dict[@"type"] = @"event";
      JMSGEventContent *eventContent = (JMSGEventContent *) self.content;
      
      NSArray *userArr = [eventContent getEventToUsernameList];
      dict[@"usernames"] = userArr;
        
      switch (eventContent.eventType) {
        case kJMSGEventNotificationAcceptedFriendInvitation: {
          dict[@"eventType"] = @"acceptedFriendInvitation";
          break;
        }
        case kJMSGEventNotificationAddGroupMembers: {
          dict[@"eventType"] = @"group_member_added";
          break;
        }
        case kJMSGEventNotificationCreateGroup: {
          dict[@"eventType"] = @"createGroup";
          break;
        }
        case kJMSGEventNotificationCurrentUserInfoChange: {
          dict[@"eventType"] = @"currentUserInfoChange";
          break;
        }
        case kJMSGEventNotificationDeclinedFriendInvitation: {
          dict[@"eventType"] = @"declinedFriendInvitation";
          break;
        }
        case kJMSGEventNotificationDeletedFriend: {
          dict[@"eventType"] = @"deletedFriend";
          break;
        }
        case kJMSGEventNotificationExitGroup: {
          dict[@"eventType"] = @"group_member_exit";
          break;
        }
        case kJMSGEventNotificationLoginKicked: {
          dict[@"eventType"] = @"loginKicked";
          break;
        }
        case kJMSGEventNotificationMessageRetract: {
          dict[@"eventType"] = @"messageRetract";
          break;
        }
        case kJMSGEventNotificationReceiveFriendInvitation: {
          dict[@"eventType"] = @"receiveFriendInvitation";
          break;
        }
        case kJMSGEventNotificationReceiveServerFriendUpdate: {
          dict[@"eventType"] = @"receiveServerFriendUpdate";
          break;
        }
        case kJMSGEventNotificationRemoveGroupMembers: {
          dict[@"eventType"] = @"group_member_removed";
          break;
        }
        case kJMSGEventNotificationServerAlterPassword: {
          dict[@"eventType"] = @"serverAlterPassword";
          break;
        }
        case kJMSGEventNotificationUpdateGroupInfo: {
          dict[@"eventType"] = @"group_info_updated";
          break;
        }
        case kJMSGEventNotificationUserLoginStatusUnexpected: {
          dict[@"eventType"] = @"userLoginStatusUnexpected";
          break;
        }
        case kJMSGEventNotificationGroupTypeChange: {
          dict[@"eventType"] = @"group_type_changed";
          break;
        }
        case kJMSGEventNotificationDissolveGroup: {
          dict[@"eventType"] = @"group_dissolved";
          break;
        }
        default:
          break;
      }
      break;
    }
    case kJMSGContentTypeFile: {
      dict[@"type"] = @"file";
      JMSGFileContent *fileContent = (JMSGFileContent *) self.content;
      dict[@"fileName"] = [fileContent fileName];
      break;
    }
    case kJMSGContentTypeLocation: {
      dict[@"type"] = @"location";
      JMSGLocationContent *locationContent = (JMSGLocationContent *) self.content;
      dict[@"latitude"] = locationContent.latitude;
      dict[@"longitude"] = locationContent.longitude;
      dict[@"scale"] = locationContent.scale;
      dict[@"address"] = locationContent.address;
      break;
    }
    case kJMSGContentTypePrompt: {
      dict[@"type"] = @"prompt";
      JMSGPromptContent *promptContent = (JMSGPromptContent *) self.content;
      dict[@"promptText"] = promptContent.promptText;
      break;
    }
    default:
      break;
  }
  return dict;
}

- (NSString *)getOriginMediaFilePath {
  JMSGMediaAbstractContent *content = (JMSGMediaAbstractContent *) self.content;
  NSString *mediaPath = [content originMediaLocalPath];
  if([[NSFileManager defaultManager] fileExistsAtPath:mediaPath]){
    return mediaPath;
  } else {
    return @"";
  }
}

- (NSString *)getFullPathWith:(NSString *) path {
  NSString * homeDir = NSHomeDirectory();
  return [NSString stringWithFormat:@"%@/Documents/%@", homeDir,path];
}
@end

@implementation JMSGChatRoom (JMessage)
- (NSMutableDictionary *)chatRoomToDictionary {
  NSMutableDictionary *dict = @{}.mutableCopy;
  dict[@"type"] = @"chatRoom";
  dict[@"roomId"] = self.roomID;
  dict[@"name"] = self.name;
  dict[@"appKey"] = self.appkey;
  dict[@"description"] = self.description;
  dict[@"createTime"] = self.ctime;
  dict[@"maxMemberCount"] = @([self.maxMemberCount integerValue]);
  dict[@"memberCount"] = @(self.totalMemberCount);
  
  return dict;
}
@end



@implementation NSArray (JMessage)

- (NSArray *)mapObjectsUsingBlock:(id (^)(id obj, NSUInteger idx))block {
  NSMutableArray *result = [NSMutableArray arrayWithCapacity:[self count]];
  [self enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
    [result addObject:block(obj, idx)];
  }];
  return result;
}

@end

@implementation JMSGApplyJoinGroupEvent (JMessage)
- (NSMutableDictionary *)eventToDictionary {
    NSMutableDictionary *dict = @{}.mutableCopy;
    
    dict[@"eventId"] = self.eventID;
    dict[@"groupId"] = self.groupID;
    dict[@"isInitiativeApply"] = @(self.isInitiativeApply);
    dict[@"sendApplyUser"] = self.sendApplyUser != nil ? @{} : [self.sendApplyUser userToDictionary];
    if (self.joinGroupUsers != nil) {
        NSArray *userDicArr = [self.joinGroupUsers mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
            JMSGUser *user = obj;
            return [user userToDictionary];
        }];
        dict[@"joinGroupUsers"] = userDicArr;
    }
    dict[@"reason"] = self.reason;
    return dict;
}
@end


@implementation JMSGGroupAdminRejectApplicationEvent (JMessage)
- (NSMutableDictionary *)eventToDictionary {
    NSMutableDictionary *dict = @{}.mutableCopy;
    dict[@"groupId"] = self.groupID;
    dict[@"reason"] = self.rejectReason;
    dict[@"groupManager"] = [self.groupManager userToDictionary];
    return dict;
}
@end

@implementation JMSGGroupAdminApprovalEvent (JMessage)
- (NSMutableDictionary *)eventToDictionary {
    NSMutableDictionary *dict = @{}.mutableCopy;
    dict[@"isAgree"] = @(self.isAgreeApply);
    dict[@"applyEventId"] = self.applyEventID;
    dict[@"groupId"] = self.groupID;
    dict[@"groupAdmin"] = [self.groupAdmin userToDictionary];
    
    if (self.users != nil) {
        NSArray *userDicArr = [self.users mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
            JMSGUser *user = obj;
            return [user userToDictionary];
        }];
        dict[@"users"] = userDicArr;
    }
    return dict;
}
@end
