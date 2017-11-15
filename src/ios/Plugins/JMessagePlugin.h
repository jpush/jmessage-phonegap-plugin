#import <Cordova/CDV.h>
#import <JMessage/JMessage.h>

@interface JMessagePlugin : CDVPlugin

- (void)startJMessageSDK:(CDVInvokedUrlCommand *)command;

- (void)init:(CDVInvokedUrlCommand *)command;
- (void)setDebugMode:(CDVInvokedUrlCommand *)command;

// account
- (void)userRegister:(CDVInvokedUrlCommand *)command;
- (void)userLogin:(CDVInvokedUrlCommand *)command;
- (void)userLogout:(CDVInvokedUrlCommand *)command;
- (void)getMyInfo:(CDVInvokedUrlCommand *)command;
- (void)getUserInfo:(CDVInvokedUrlCommand *)command;
- (void)updateMyAvatar:(CDVInvokedUrlCommand *)command;
- (void)updateMyPassword:(CDVInvokedUrlCommand *)command;
- (void)updateMyInfo:(CDVInvokedUrlCommand *)command;

// Send message
- (void)sendTextMessage:(CDVInvokedUrlCommand *)command;
- (void)sendImageMessage:(CDVInvokedUrlCommand *)command;
- (void)sendVoiceMessage:(CDVInvokedUrlCommand *)command;
- (void)sendCustomMessage:(CDVInvokedUrlCommand *)command;
- (void)sendLocationMessage:(CDVInvokedUrlCommand *)command;
- (void)sendFileMessage:(CDVInvokedUrlCommand *)command;
- (void)getHistoryMessages:(CDVInvokedUrlCommand *)command;
- (void)sendInvitationRequest:(CDVInvokedUrlCommand *)command;
- (void)acceptInvitation:(CDVInvokedUrlCommand *)command;
- (void)declineInvitation:(CDVInvokedUrlCommand *)command;
- (void)removeFromFriendList:(CDVInvokedUrlCommand *)command;
- (void)updateFriendNoteName:(CDVInvokedUrlCommand *)command;
- (void)updateFriendNoteText:(CDVInvokedUrlCommand *)command;
- (void)getFriends:(CDVInvokedUrlCommand *)command;
- (void)createGroup:(CDVInvokedUrlCommand *)command;
- (void)getGroupIds:(CDVInvokedUrlCommand *)command;
- (void)getGroupInfo:(CDVInvokedUrlCommand *)command;
- (void)updateGroupInfo:(CDVInvokedUrlCommand *)command;
- (void)addGroupMembers:(CDVInvokedUrlCommand *)command;
- (void)removeGroupMembers:(CDVInvokedUrlCommand *)command;
- (void)exitGroup:(CDVInvokedUrlCommand *)command;
- (void)getGroupMembers:(CDVInvokedUrlCommand *)command;
- (void)addUsersToBlacklist:(CDVInvokedUrlCommand *)command;
- (void)removeUsersFromBlacklist:(CDVInvokedUrlCommand *)command;

- (void)getBlacklist:(CDVInvokedUrlCommand *)command;
- (void)setNoDisturb:(CDVInvokedUrlCommand *)command;
- (void)getNoDisturbList:(CDVInvokedUrlCommand *)command;
- (void)setNoDisturbGlobal:(CDVInvokedUrlCommand *)command;
- (void)isNoDisturbGlobal:(CDVInvokedUrlCommand *)command;
- (void)downloadThumbUserAvatar:(CDVInvokedUrlCommand *)command;
- (void)downloadOriginalUserAvatar:(CDVInvokedUrlCommand *)command;
- (void)downloadOriginalImage:(CDVInvokedUrlCommand *)command;
- (void)downloadVoiceFile:(CDVInvokedUrlCommand *)command;
- (void)downloadFile:(CDVInvokedUrlCommand *)command;
- (void)createConversation:(CDVInvokedUrlCommand *)command;
- (void)deleteConversation:(CDVInvokedUrlCommand *)command;
- (void)getConversation:(CDVInvokedUrlCommand *)command;
- (void)getConversations:(CDVInvokedUrlCommand *)command;
- (void)resetUnreadMessageCount:(CDVInvokedUrlCommand *)command;
- (void)retractMessage:(CDVInvokedUrlCommand *)command;

- (void)isGroupBlocked:(CDVInvokedUrlCommand *)command;
- (void)getBlockedGroupList:(CDVInvokedUrlCommand *)command;
- (void)updateGroupAvatar:(CDVInvokedUrlCommand *)command;
- (void)downloadThumbGroupAvatar:(CDVInvokedUrlCommand *)command;
- (void)downloadOriginalGroupAvatar:(CDVInvokedUrlCommand *)command;

@end
