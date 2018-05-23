/**
 *
 * TODO:
 * - Add Promise callback params type
 * - Add ChatRoom API
 * - Test ionic plugin
 * - Remove this note
 */
import { Injectable } from '@angular/core';
import {
  Plugin,
  Cordova,
  CordovaProperty,
  IonicNativePlugin
} from '@ionic-native/core';


export interface JMSingleType {
  type: 'single';
  username: string;
  appKey: string;
};

export interface JMGroupType {
  type: 'group';
  groupId: string;
};

export interface JMChatRoomType {
  type: 'chatRoom';
  roomId: string;
};

export type JMAllType = (JMSingleType | JMGroupType | JMChatRoomType);

export interface JMMessageOptions {
  extras?: { [key: string]: string; };
  messageSendingOptions?: JMMessageSendOptions;
};

export interface JMConfig {
  isOpenMessageRoaming: boolean;
};

export interface JMError {
  code: string;
  description: string;
};

/**
 * Message type
 */

export interface JMNormalMessage {
  id: string;                      // 本地数据库中的消息 id
  serverMessageId: string;          // 对应服务器端的消息 id
  isSend: boolean;                 // 消息是否由当前用户发出。true：为当前用户发送；false：为对方用户发送。
  from: JMUserInfo;                // 消息发送者对象
  target: (JMUserInfo | JMGroupInfo); // 消息接收者对象
  createTime: number;             // 发送消息时间
  extras?: { [key: string]: string; };                  // 附带的键值对
};

export type JMTextMessage = JMNormalMessage & {
  type: 'text';
  text: string;                   // 消息内容
};

export type JMVoiceMessage = JMNormalMessage & {
  type: 'voice';
  path?: string;                   // 语音文件路径,如果为空需要调用相应下载方法
  duration: number;                 // 语音时长，单位秒
};

export type JMImageMessage = JMNormalMessage & {
  type: 'image';
  thumbPath?: string;               // 图片的缩略图路径, 如果为空需要调用相应下载方法
};

export type JMFileMessage = JMNormalMessage & {
  type: 'file';
  fileName: string;                 // 文件名
};

export type JMLocationMessage = JMNormalMessage & {
  type: 'location';
  longitude: number;              // 经度
  latitude: number;               // 纬度
  scale: number;                   // 地图缩放比例
  address?: string;               // 详细地址
};

export type JMCustomMessage = JMNormalMessage & {
  type: 'custom';
  customObject: { [key: string]: string; }            // 自定义键值对
};

export interface JMEventMessage {
  type: 'event';           // 消息类型
  eventType: 'group_member_added' | 'group_member_removed' | 'group_member_exit';       // 'group_member_added' / 'group_member_removed' / 'group_member_exit'
  usernames: JMUserInfo[];         // 该事件涉及到的用户 username 数组
};

export type JMAllMessage = JMTextMessage | JMVoiceMessage | JMImageMessage | JMFileMessage | JMEventMessage;

export type JMMessageEventListener = (message: JMAllMessage) => void;

export type JMSyncOfflineMessageListener = (event: {
  conversation: JMConversationInfo;
  messageArray: JMAllMessage[];
}) => void;

export type JMSyncRoamingMessageListener = (event: {
  conversation: JMConversationInfo;
}) => void;

export type JMLoginStateChangedListener = (event: {
  type: 'user_password_change' | 'user_logout' | 'user_deleted' | 'user_login_status_unexpected';
}) => void;

export type JMContactNotifyListener = (event: {
  type: 'invite_received' | 'invite_accepted' | 'invite_declined' | 'contact_deleted';
  reason: string;
  fromUsername: string;
  fromUserAppKey: string;
}) => void;

export type JMMessageRetractListener = (event: {
  conversation: JMConversationInfo;
  retractedMessage: JMAllMessage;
}) => void;

export type JMReceiveTransCommandListener = (event: {
  message: string;
  sender: JMUserInfo;
  receiver: JMUserInfo | JMGroupInfo;
  receiverType: 'single' | 'group';
}) => void;

export type JMReceiveChatRoomMessageListener = (event: {
  messageArray: JMAllMessage[];
}) => void;

/**
 * User Type
 */
export interface JMUserInfo {
  type: 'user';
  username: string;           // 用户名
  appKey: string;             // 用户所属应用的 appKey，可与 username 共同作为用户的唯一标识
  nickname?: string;           // 昵称
  gender: 'male' | 'female' | 'unknown';             // 'male' / 'female' / 'unknown'
  avatarThumbPath: string;    // 头像的缩略图地址
  birthday?: number;           // 日期的毫秒数
  region?: string;             // 地区
  signature?: string;          // 个性签名
  address?: string;            // 具体地址
  noteName?: string;           // 备注名
  noteText?: string;           // 备注信息
  isNoDisturb: boolean;       // 是否免打扰
  isInBlackList: boolean;     // 是否在黑名单中
  isFriend: boolean;          // 是否为好友
  extras?: { [key: string]: string; };              // 自定义键值对
};

export interface JMGroupInfo {
  type: 'group';
  id: string;                 // 群组 id
  name?: string;               // 群组名称
  desc?: string;               // 群组描述
  level: number;              // 群组等级，默认等级 4
  owner: string;              // 群主的 username
  ownerAppKey: string;        // 群主的 appKey
  maxMemberCount: number;     // 最大成员数
  isNoDisturb: boolean;       // 是否免打扰
  isBlocked: boolean;          // 是否屏蔽群消息
};

export interface JMChatRoomInfo {
  type: 'chatRoom';
  roomId: string;   // 聊天室 id
  name: string;     // 聊天室名称
  appKey: string;   // 聊天室所属应用的 App Key
  description?: string; // 聊天室描述信息
  createTime: number; // 创建日期，单位：秒
  maxMemberCount?: number; // 最大成员数
  memberCount: number;     // 当前成员数
};

export type JMConversationInfo = ({
  conversationType: 'single';
  target: JMUserInfo;
} | {
  conversationType: 'group';
  target: JMGroupInfo;
}) & {
  title: string;                  // 会话标题
  latestMessage: JMAllMessage;    // 最近的一条消息对象。如果不存在消息，则 conversation 对象中没有该属性。
  unreadCount: number;            // 未读消息数
};

export interface JMMessageSendOptions {
  /**
 * 接收方是否针对此次消息发送展示通知栏通知。
 * @type {boolean}
 * @defaultvalue
 */
  isShowNotification?: boolean;
  /**
   * 是否让后台在对方不在线时保存这条离线消息，等到对方上线后再推送给对方。
   * @type {boolean}
   * @defaultvalue
   */
  isRetainOffline?: boolean;
  /**
   * 是否开启了自定义接收方通知栏功能。
   * @type {?boolean}
   */
  isCustomNotificationEnabled?: boolean;
  /**
   * 设置此条消息在接收方通知栏所展示通知的标题。
   * @type {?string}
   */
  notificationTitle?: string;
  /**
   * 设置此条消息在接收方通知栏所展示通知的内容。
   * @type {?string}
   */
  notificationText?: string;
};

// TODO: to Promise
@Injectable()
export class JMChatRoom {

  @Cordova()
  getChatRoomInfoListOfApp(params: {
    start: number;
    count: number;
  }, success: (chatroomList: JMChatRoomInfo[]) => void, fail: (error: JMError) => void): void {}

  @Cordova()
  getChatRoomInfoListOfUser(
    success: (chatroomList: JMChatRoomInfo[]) => void,
    fail: (error: JMError) => void): void {}

  @Cordova()
  getChatRoomInfoListById(params: {
    roomId: string;
  }, success: (chatroomList: JMChatRoomInfo[]) => void, fail: (error: JMError) => void): void {}

  @Cordova()
  getChatRoomOwner(params: {
    roomId: string;
  }, success: (chatroomList: JMUserInfo) => void, fail: (error: JMError) => void): void {}

  @Cordova()
  enterChatRoom(obj: {
    roomId: string;
  }, success: (conversation: JMConversationInfo) => void, fail: (error: JMError) => void): void {}

  @Cordova()
  exitChatRoom(params: {
    roomId: string;
  }, success: () => void, fail: (error: JMError) => void): void {}

  @Cordova()
  getChatRoomConversation(params: {
    roomId: string;
  }, success: () => void, fail: (error: JMError) => void): void {}

  @Cordova()
  getChatRoomConversationList(success: (conversationList: JMConversationInfo[]) => void, fail: (error: JMError) => void): void {}
}
/**
 * @name jmessage
 * @description
 * This plugin does something
 */
@Plugin({
  pluginName: 'JMessagePlugin',
  plugin: 'jmessage-phonegap-plugin',
  pluginRef: 'JMessage',
  repo: 'https://github.com/jpush/jmessage-phonegap-plugin',
  install: 'cordova plugin add jmessage-phonegap-plugin --variable APP_KEY=your_app_key', // OPTIONAL install command, in case the plugin requires variables
  installVariables: ['APP_KEY'],
  platforms: ['Android', 'iOS']
})
@Injectable()
export class JMessagePlugin extends IonicNativePlugin {

  /**
   * This function does something
   * @param obj {string} Some param to configure something
   * @param arg2 {number} Another param to configure something
   * @return {Promise<any>} Returns a promise that resolves when something happens
   */
  @Cordova({
     sync: true,
     platforms: ['iOS', 'Android']
    })
  init(params: JMConfig): void { }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  setDebugMode(params: { enable: boolean; }): void {}

  @Cordova()
  register(params: {
    username: string;
    password: string;
    nickname: string;
  }): Promise<void> {
    return;
  }

  @Cordova()
  login(params: {
    username: string;
    password: string;
  }): Promise<void> {
    return;
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  logout(): void {}

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  setBadge(params: { badge: number; }): void { }

  @Cordova()
  getMyInfo(): Promise< JMUserInfo | {} > {
    return; // We add return; here to avoid any IDE / Compiler errors
  }


  @Cordova()
  getUserInfo(params: {
    username: string;
    appKey?: string;
  }): Promise<JMUserInfo> {
    return;
  }

  @Cordova()
  updateMyPassword(params: {
    oldPwd: string;
    newPwd: string;
  }): Promise<void> {
    return;
  }

  /**
   * 更新当前用户头像。
   * @param {object} params = {
   *  imgPath: string // 本地图片绝对路径。
   * }
   * 注意 Android 与 iOS 的文件路径是不同的：
   *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
   *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
   */
  @Cordova()
  updateMyAvatar(params: {
    imgPath: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  updateMyInfo(params: {
    birthday?: number;
    gender?: 'male' | 'female' | 'unknown';
    extras?: { [key: string]: string; };
  }): Promise<any> {
    return;
  }

  @Cordova()
  updateGroupAvatar(params: {
    id: string;
    imgPath: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  downloadThumbGroupAvatar(params: {
    id: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  downloadOriginalGroupAvatar(params: {
    id: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  setConversationExtras(params: JMAllType & { extras: { [key: string]: string; }; }): Promise<any> {
    return;
  }

  @Cordova()
  sendTextMessage(params: JMAllType & JMMessageOptions & { text: string; }): Promise<any> {
    return;
  }

  @Cordova()
  sendImageMessage(params: JMAllType & JMMessageOptions & { path: string; }): Promise<any> {
    return;
  }

  @Cordova()
  sendVoiceMessage(params: JMAllType & JMMessageOptions & { path: string; }): Promise<any> {
    return;
  }

  @Cordova()
  sendCustomMessage(params: JMAllType & JMMessageOptions & { customObject: { [key: string]: string; }; }): Promise<any> {
    return;
  }

  @Cordova()
  sendLocationMessage(params: JMAllType & JMMessageOptions & {
    latitude: number;
    longitude: number;
    scale: number;
    address: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  sendFileMessage(params: JMAllType & JMMessageOptions & {
    path: string;
  }): Promise<any> {
    return;
  }


  @Cordova()
  retractMessage(params: JMAllType & { messageId: string; }): Promise<any> {
    return;
  }

  @Cordova()
  getHistoryMessages(params: (JMSingleType | JMGroupType) & {
    from: number;
    limit: number;
  }): Promise<any> {
    return;
  }

  @Cordova()
  getMessageById(params: JMAllType & { messageId: string; }): Promise<any> {
    return;
  }

  @Cordova()
  deleteMessageById(params: JMAllType & { messageId: string; }): Promise<any> {
    return;
  }

  @Cordova()
  sendInvitationRequest(params: {
    username: string;
    reason: string;
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  acceptInvitation(params: {
    username: string;
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  declineInvitation(params: {
    username: string;
    reason: string;
    appKey?: string;
  }): Promise<any> {
    return;
  }



  @Cordova()
  removeFromFriendList(params: {
    username: string;
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  updateFriendNoteName(params: {
    username: string;
    noteName: string;
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  updateFriendNoteText(params: {
    username: string;
    noteText: string;
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  getFriends(): Promise<any> {
    return;
  }

  @Cordova()
  createGroup(params: {
    name?: string;
    desc?: string;
  }): Promise<string> {
    return;
  }

  @Cordova()
  getGroupIds(): Promise<any> {
    return;
  }

  @Cordova()
  getGroupInfo(params: { id: string; }): Promise<any> {
    return;
  }

  @Cordova()
  updateGroupInfo(params: {
    id: string;
    newName: string;
    newDesc?: string;
  } | {
      id: string;
      newDesc: string;
    }): Promise<any> {
    return;
  }

  @Cordova()
  addGroupMembers(params: {
    id: string;
    usernameArray: string[];
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  removeGroupMembers(params: {
    id: string;
    usernameArray: string[];
    appKey?: string;
  }): Promise<any> {
    return;
  }


  @Cordova()
  exitGroup(params: {
    id: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  getGroupMembers(params: {
    id: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  addUsersToBlacklist(params: {
    usernameArray: string[];
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  removeUsersFromBlacklist(params: {
    usernameArray: string[];
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  getBlacklist(): Promise<any> {
    return;
  }

  @Cordova()
  setNoDisturb(params: (JMSingleType | JMGroupType) & {
    isNoDisturb: boolean;
  }): Promise<any> {
    return;
  }

  @Cordova()
  getNoDisturbList(): Promise<any> {
    return;
  }

  @Cordova()
  setNoDisturbGlobal(params: {
    isNoDisturb: boolean;
  }): Promise<any> {
    return;
  }

  @Cordova()
  isNoDisturbGlobal(): Promise<any> {
    return;
  }

  @Cordova()
  blockGroupMessage(params: {
    id: string;
    isBlock: boolean;
  }): Promise<any> {
    return;
  }

  @Cordova()
  isGroupBlocked(params: {
    id: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  getBlockedGroupList(): Promise<any> {
    return;
  }

  @Cordova()
  downloadThumbUserAvatar(params: {
    username: string;
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  downloadOriginalUserAvatar(params: {
    username: string;
    appKey?: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  downloadThumbImage(params: (JMSingleType | JMGroupType) & {
    messageId: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  downloadOriginalImage(params: (JMSingleType | JMGroupType) & {
    messageId: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  downloadVoiceFile(params: (JMSingleType | JMGroupType) & {
    messageId: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  downloadFile(params: (JMSingleType | JMGroupType) & {
    messageId: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  createConversation(params: JMAllType): Promise<any> {
    return;
  }

  @Cordova()
  deleteConversation(params: JMAllType): Promise<any> {
    return;
  }

  @Cordova()
  enterConversation(params: JMSingleType | JMGroupType): Promise<any> {
    return;
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  exitConversation(params: JMSingleType | JMGroupType): void {}

  @Cordova()
  getConversation(params: JMAllType): Promise<any> {
    return;
  }

  @Cordova()
  getConversations(): Promise<any> {
    return;
  }

  @Cordova()
  resetUnreadMessageCount(params: JMAllType): Promise<any> {
    return;
  }



  /**
   * TODO:
   * 
   * chatRoom internal api.
   */
  @CordovaProperty
  ChatRoom: JMChatRoom;

  @Cordova()
  enterChatRoom(params: {
    roomId: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  exitChatRoom(params: {
    roomId: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  getChatRoomConversation(params: {
    roomId: string;
  }): Promise<any> {
    return;
  }

  @Cordova()
  getChatRoomConversationList(): Promise<any> {
    return;
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addReceiveMessageListener(params: JMMessageEventListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeReceiveMessageListener(params: JMMessageEventListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addClickMessageNotificationListener(params: JMMessageEventListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeClickMessageNotificationListener(params: JMMessageEventListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addSyncOfflineMessageListener(params: JMSyncOfflineMessageListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeSyncOfflineMessageListener(params: JMSyncOfflineMessageListener): void {

  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addSyncRoamingMessageListener(params: JMSyncRoamingMessageListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeSyncRoamingMessageListener(params: JMSyncRoamingMessageListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addLoginStateChangedListener(params: JMLoginStateChangedListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeLoginStateChangedListener(params: JMLoginStateChangedListener): void {
  }


  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addContactNotifyListener(params: JMContactNotifyListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeContactNotifyListener(params: JMContactNotifyListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addMessageRetractListener(params: JMMessageRetractListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeMessageRetractListener(params: JMMessageRetractListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addReceiveTransCommandListener(params: JMReceiveTransCommandListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeReceiveTransCommandListener(params: JMReceiveTransCommandListener): void {
  }


  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  addReceiveChatRoomMessageListener(params: JMReceiveChatRoomMessageListener): void {
  }

  @Cordova({
    sync: true,
    platforms: ['iOS', 'Android']
   })
  removeReceiveChatRoomMessageListener(params: JMReceiveChatRoomMessageListener): void {
  }
}
