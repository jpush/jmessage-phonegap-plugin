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

- (void)onReceiveNotificationEvent:(JMSGNotificationEvent *)event {
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
    case kJMSGEventNotificationCurrentUserInfoChange:
      break;
    case kJMSGEventNotificationReceiveFriendInvitation:{
      JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *) event;
      JMSGUser *user = [friendEvent getFromUser];
      [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageContactNotify
                                                          object:@{
                                                                    @"type":@"invite_received",
                                                                    @"reason":[friendEvent eventDescription],
                                                                    @"fromUsername":[friendEvent getFromUsername],
                                                                    @"fromUserAppKey":user.appKey}];
      }
      break;
    case kJMSGEventNotificationAcceptedFriendInvitation:{
      JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *) event;
      JMSGUser *user = [friendEvent getFromUser];
      [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageContactNotify
                                                          object:@{
                                                                    @"type":@"invite_accepted",
                                                                    @"reason":[friendEvent eventDescription],
                                                                    @"fromUsername":[friendEvent getFromUsername],
                                                                    @"fromUserAppKey":user.appKey}];
      }
      break;
    case kJMSGEventNotificationDeclinedFriendInvitation:{
      JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *) event;
      JMSGUser *user = [friendEvent getFromUser];
      [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageContactNotify
                                                          object:@{
                                                                    @"type":@"invite_declined",
                                                                    @"reason":[friendEvent eventDescription],
                                                                    @"fromUsername":[friendEvent getFromUsername],
                                                                    @"fromUserAppKey":user.appKey}];
      }
      break;
    case kJMSGEventNotificationDeletedFriend:{
      JMSGFriendNotificationEvent *friendEvent = (JMSGFriendNotificationEvent *) event;
      JMSGUser *user = [friendEvent getFromUser];
      [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageContactNotify
                                                          object:@{
                                                                    @"type":@"contact_deleted",
                                                                    @"reason":[friendEvent eventDescription],
                                                                    @"fromUsername":[friendEvent getFromUsername],
                                                                    @"fromUserAppKey":user.appKey}];
      }
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

- (void)onGroupInfoChanged:(JMSGGroup *)group{
  [[NSNotificationCenter defaultCenter] postNotificationName:kJJMessageGroupInfoChanged object:[group groupToDictionary]];
}

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
  
  if (self.conversationType == kJMSGConversationTypeSingle) {
    JMSGUser *user = self.target;
    dict[@"target"] = [user userToDictionary];
    dict[@"conversationType"] = @"single";
    
  } else {
    JMSGGroup *group = self.target;
    dict[@"target"] = [group groupToDictionary];
    dict[@"conversationType"] = @"group";
  }
  
  dict[@"latestMessage"] = [self.latestMessage messageToDictionary];
  dict[@"unreadCount"] = self.unreadCount;
  dict[@"title"] = [self title];
  return dict;
}


@end

@implementation JMSGUser (JMessage)
-(NSMutableDictionary*)userToDictionary{
  NSMutableDictionary *dict = [NSMutableDictionary dictionary];
  dict[@"type"] = @"user";
  dict[@"username"] = self.username;
  dict[@"nickname"] = self.nickname;
  dict[@"avatarThumbPath"] = [self thumbAvatarLocalPath];
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
-(NSMutableDictionary*)groupToDictionary{
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

@implementation JMSGMessage (JMessage)

- (NSMutableDictionary *)messageToDictionary {
  NSMutableDictionary *dict = [NSMutableDictionary new];

  dict[@"id"] = self.msgId;
  dict[@"from"] = [self.fromUser userToDictionary];
  
  if (self.content.extras != nil) {
    dict[@"extras"] = self.content.extras;
  }
  
  if (self.targetType == kJMSGConversationTypeSingle) {
    JMSGUser *user = self.target;
    dict[@"target"] = [user userToDictionary];
  } else {
    JMSGGroup *group = self.target;
    dict[@"target"] = [group groupToDictionary];
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
      
      switch (eventContent.eventType) {
        case kJMSGEventNotificationAcceptedFriendInvitation: {
          dict[@"evenType"] = @"acceptedFriendInvitation";
          break;
        }
        case kJMSGEventNotificationAddGroupMembers: {
          dict[@"evenType"] = @"addGroupMembers";
          break;
        }
        case kJMSGEventNotificationCreateGroup: {
          dict[@"evenType"] = @"createGroup";
          break;
        }
        case kJMSGEventNotificationCurrentUserInfoChange: {
          dict[@"evenType"] = @"currentUserInfoChange";
          break;
        }
        case kJMSGEventNotificationDeclinedFriendInvitation: {
          dict[@"evenType"] = @"declinedFriendInvitation";
          break;
        }
        case kJMSGEventNotificationDeletedFriend: {
          dict[@"evenType"] = @"deletedFriend";
          break;
        }
        case kJMSGEventNotificationExitGroup: {
          dict[@"evenType"] = @"exitGroup";
          break;
        }
        case kJMSGEventNotificationLoginKicked: {
          dict[@"evenType"] = @"loginKicked";
          break;
        }
        case kJMSGEventNotificationMessageRetract: {
          dict[@"evenType"] = @"messageRetract";
          break;
        }
        case kJMSGEventNotificationReceiveFriendInvitation: {
          dict[@"evenType"] = @"receiveFriendInvitation";
          break;
        }
        case kJMSGEventNotificationReceiveServerFriendUpdate: {
          dict[@"evenType"] = @"receiveServerFriendUpdate";
          break;
        }
        case kJMSGEventNotificationRemoveGroupMembers: {
          dict[@"evenType"] = @"removeGroupMembers";
          break;
        }
        case kJMSGEventNotificationServerAlterPassword: {
          dict[@"evenType"] = @"serverAlterPassword";
          break;
        }
        case kJMSGEventNotificationUpdateGroupInfo: {
          dict[@"evenType"] = @"updateGroupInfo";
          break;
        }
        case kJMSGEventNotificationUserLoginStatusUnexpected: {
          dict[@"evenType"] = @"userLoginStatusUnexpected";
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