var exec = require('cordova/exec')

var JMessagePlugin = function () {
  const NOTI_MODE_DEFAULT = 0
  const NOTI_MODE_NO_SOUND = 1
  const NOTI_MODE_NO_VIBRATE = 2
  const NOTI_MODE_SILENCE = 3
  const NOTI_MODE_NO_NOTIFICATION = 4

  this.username = ''
  this.nickname = ''
  this.gender = ''
  this.avatarUrl = ''

  this.message = {}
  this.openedMessage = {}
  this.textMessage = {}
  this.imageMessage = {}
  this.voiceMessage = {}
  this.customMessage = {}
}

JMessagePlugin.prototype.init = function () {}

JMessagePlugin.prototype.errorCallback = function (msg) {
  console.log('JMessagePlugin callback error:' + msg)
}

JMessagePlugin.prototype.callNative = function (name, args, successCallback, errorCallback) {
  if (errorCallback == null) {
    exec(successCallback, this.errorCallback, 'JMessagePlugin', name, args)
  } else {
    exec(successCallback, errorCallback, 'JMessagePlugin', name, args)
  }
}

// 用于 Android 6.0 以上动态申请权限。
JMessagePlugin.prototype.requestAndroidPermission = function (permission, successCallback, errorCallback) {
  this.callNative('requestPermission', [permission], successCallback, errorCallback)
}

// Login and register API.

JMessagePlugin.prototype.register = function (username, password, successCallback, errorCallback) {
  this.callNative('userRegister', [username, password], successCallback, errorCallback)
}

JMessagePlugin.prototype.login = function (username, password, successCallback, errorCallback) {
  this.callNative('userLogin', [username, password], successCallback, errorCallback)
}

JMessagePlugin.prototype.logout = function (successCallback, errorCallback) {
  this.callNative('userLogout', [], successCallback, errorCallback)
}


// User info API.
// 如果 appKey 为空，获取当前 AppKey 下的用户信息。
JMessagePlugin.prototype.getUserInfo = function (username, appKey, successCallback, errorCallback) {
  this.callNative('getUserInfo', [username, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.getMyInfo = function (successCallback, errorCallback) {
  this.callNative('getMyInfo', [], successCallback, errorCallback)
}

JMessagePlugin.prototype.updateMyInfo = function (field, value, successCallback, errorCallback) {
  this.callNative('updateMyInfo', [field, value], successCallback, errorCallback)
}

JMessagePlugin.prototype.updateMyPassword = function (oldPwd, newPwd, successCallback, errorCallback) {
  this.callNative('updateMyPassword', [oldPwd, newPwd], successCallback, errorCallback)
}

JMessagePlugin.prototype.updateMyAvatar = function (avatarFileUrl, successCallback, errorCallback) {
  this.callNative('updateMyAvatar', [avatarFileUrl], successCallback, errorCallback)
}

JMessagePlugin.prototype.updateMyAvatarByPath = function (avatarFilePath, successCallback, errorCallback) {
  this.callNative('updateMyAvatarByPath', [avatarFilePath], successCallback, errorCallback)
}

// 取得用户头像的缩略图地址，如果 username 为空，默认取得当前登录用户的头像缩略图地址。
JMessagePlugin.prototype.getUserAvatar = function(username, successCallback, errorCallback) {
  this.callNative('getUserAvatar', [username], successCallback, errorCallback)
}

// 下载用户头像大图，如果 username 为空，默认为当前用户。
JMessagePlugin.prototype.getOriginalUserAvatar = function(username, successCallback, errorCallback) {
  this.callNative('getOriginalUserAvatar', [username], successCallback, errorCallback)
}


// Message API.

JMessagePlugin.prototype.sendSingleTextMessage = function (username, text, appKey, successCallback, errorCallback) {
  this.callNative('sendSingleTextMessage', [username, text, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendSingleTextMessageWithExtras = function(username, text, json, appKey,
    successCallback, errorCallback) {
  this.callNative('sendSingleTextMessageWithExtras', [username, text, json, appKey], successCallback,
    errorCallback);
}

JMessagePlugin.prototype.sendSingleImageMessage = function (username, imageUrl, appKey, successCallback,
    errorCallback) {
  this.callNative('sendSingleImageMessage', [username, imageUrl, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendSingleImageMessageWithExtras = function(username, imageUrl, json, appKey,
    successCallback, errorCallback) {
  this.callNative('sendSingleImageMessageWithExtras', [username, imageUrl, json, appKey],
    successCallback, errorCallback);
}

JMessagePlugin.prototype.sendSingleVoiceMessage = function (username, fileUrl, appKey, successCallback,
    errorCallback) {
  this.callNative('sendSingleVoiceMessage', [username, fileUrl, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendSingleVoiceMessageWithExtras = function(username, fileUrl, json, appKey,
    successCallback, errorCallback) {
  this.callNative('sendSingleVoiceMessageWithExtras', [username, fileUrl, json, appKey],
    successCallback, errorCallback);
}

JMessagePlugin.prototype.sendSingleCustomMessage = function (username, jsonStr, appKey, successCallback, errorCallback) {
  this.callNative('sendSingleCustomMessage', [username, jsonStr, appKey], successCallback, errorCallback)
}

// scale：地图缩放比例；address：详细地址信息。
JMessagePlugin.prototype.sendSingleLocationMessage = function (username, appKey, latitude, longitude, scale, address) {
  this.callNative('sendSingleLocationMessage', [username, appKey, latitude, longitude, scale, address],
    successCallback, errorCallback)
}

JMessagePlugin.prototype.sendSingleFileMessage = function (username, appKey, filePath, fileName, successCallback, errorCallback) {
  this.callNative('sendSingleFileMessage', [username, appKey, filePath, fileName], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupTextMessage = function (groupId, text, successCallback, errorCallback) {
  this.callNative('sendGroupTextMessage', [groupId, text], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupTextMessageWithExtras = function (groupId, text, extrasJson, successCallback, errorCallback) {
  this.callNative('sendGroupTextMessageWithExtras', [groupId, text, extrasJson], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupImageMessage = function (groupId, imageUrl, successCallback, errorCallback) {
  this.callNative('sendGroupImageMessage', [groupId, imageUrl], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupImageMessageWithExtras = function (groupId, imageUrl, extrasJson, successCallback, errorCallback) {
  this.callNative('sendGroupImageMessageWithExtras', [groupId, imageUrl, extrasJson], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupVoiceMessage = function (groupId, fileUrl, successCallback, errorCallback) {
  this.callNative('sendGroupVoiceMessage', [groupId, fileUrl], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupVoiceMessageWithExtras = function (groupId, fileUrl, extrasJson, successCallback, errorCallback) {
  this.callNative('sendGroupVoiceMessageWithExtras', [groupId, fileUrl, extrasJson], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupCustomMessage = function (groupId, jsonStr, successCallback, errorCallback) {
  this.callNative('sendGroupCustomMessage', [groupId, jsonStr], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupLocationMessage = function (groupId, latitude, longitude, scale, address,
    successCallback, errorCallback) {
  this.callNative('sendGroupLocationMessage', [groupId, latitude, longitude, scale, address], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupFileMessage = function (groupId, filePath, fileName, successCallback, errorCallback) {
  this.callNative('sendGroupFileMessage', [groupId, filePath, fileName], successCallback, errorCallback)
}

JMessagePlugin.prototype.getLatestMessage = function (conversationType, value, appKey, successCallback, errorCallback) {
  this.callNative('getLatestMessage', [conversationType, value, appKey], successCallback, errorCallback)
}

// 获取指定 Conversation 的部分历史消息。conversationType: 'single' or 'group'
// value: username if conversation type is 'single' or groupId if conversation type is 'group'.
JMessagePlugin.prototype.getHistoryMessages = function (conversationType, value, appKey, from, limit,
    successCallback, errorCallback) {
  this.callNative('getHistoryMessages', [conversationType, value, appKey, from, limit],
    successCallback, errorCallback)
}

// 获取指定 Conversation 的全部历史消息。
JMessagePlugin.prototype.getAllMessages = function (conversationType, value, appKey, successCallback, errorCallback) {
  this.callNative('getAllMessages', [conversationType, value, appKey], successCallback, errorCallback)
}

// 获取指定单聊会话中指定图片消息的原图。
JMessagePlugin.prototype.getOriginImageInSingleConversation = function (username, msgServerId, successCallback, errorCallback) {
  this.callNative('getOriginImageInSingleConversation', [username, msgServerId], successCallback, errorCallback)
}

// 获取指定群聊会话中指定图片消息的原图。
JMessagePlugin.prototype.getOriginImageInGroupConversation = function (groupId, msgServerId, successCallback, errorCallback) {
  this.callNative('getOriginImageInGroupConversation', [groupId, msgServerId], successCallback, errorCallback);
}

// 好友关系 API

// 发送添加好友请求
JMessagePlugin.prototype.sendInvitationRequest = function (targetUsername, targetUserAppkey, reason,
    successCallback, errorCallback) {
  this.callNative('sendInvitationRequest', [targetUsername, targetUserAppkey, reason],
    successCallback, errorCallback)
}

JMessagePlugin.prototype.acceptInvitation = function (targetUsername, targetUserAppkey,
    successCallback, errorCallback) {
  this.callNative('acceptInvitation', [targetUsername, targetUserAppkey], successCallback, errorCallback)
}

JMessagePlugin.prototype.declineInvitation = function (targetUsername, targetUserAppkey, reason,
    successCallback, errorCallback) {
  this.callNative('declineInvitation', [targetUsername, targetUserAppkey, reason],
    successCallback, errorCallback)
}

JMessagePlugin.prototype.getFriendList = function (successCallback, errorCallback) {
  this.callNative('getFriendList', [], successCallback, errorCallback)
}

JMessagePlugin.prototype.removeFromFriendList = function (targetUsername, targetUserAppkey,
    successCallback, errorCallback) {
  this.callNative('removeFromFriendList', [targetUsername, targetUserAppkey], successCallback, errorCallback)
}

// 修改当前用户好友的备注名
JMessagePlugin.prototype.updateFriendNoteName = function (friendName, friendAppKey, noteName,
    successCallback, errorCallback) {
  this.callNative('updateFriendNoteName', [friendName, friendAppKey, noteName], successCallback, errorCallback)
}

JMessagePlugin.prototype.updateFriendNoteText = function (friendName, friendAppKey, noteText,
    successCallback, errorCallback) {
  this.callNative('updateFriendNoteText', [friendName, friendAppKey, noteText], successCallback, errorCallback)
}


// Conversation API.

JMessagePlugin.prototype.createSingleConversation = function(username, appKey, successCallback, errorCallback) {
  this.callNative('createSingleConversation', [username, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.createGroupConversation = function(groupId, successCallback, errorCallback) {
  this.callNative('createGroupConversation', [groupId], successCallback, errorCallback)
}

// 判断单聊会话是否存在。返回值：0 - 不存在；1 - 存在。
JMessagePlugin.prototype.isSingleConversationExist = function(username, appKey, successCallback,
    errorCallback) {
  this.callNative('isSingleConversationExist', [username, appKey], successCallback, errorCallback)
}

// 判断群聊会话是否存在。返回值：0 - 不存在；1 - 存在。
JMessagePlugin.prototype.isGroupConversationExist = function(groupId, successCallback,
    errorCallback) {
  this.callNative('isGroupConversationExist', [groupId], successCallback, errorCallback)
}

JMessagePlugin.prototype.getConversationList = function (successCallback, errorCallback) {
  this.callNative('getConversationList', [], successCallback, errorCallback)
}

// username: 目标用户的用户名。
JMessagePlugin.prototype.getSingleConversation = function (username, appKey, successCallback, errorCallback) {
  this.callNative('getSingleConversation', [username, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.getAllSingleConversation = function (successCallback, errorCallback) {
  this.callNative('getAllSingleConversation', [], successCallback, errorCallback)
}

JMessagePlugin.prototype.setSingleConversationUnreadMessageCount = function (username, appKey,
    unreadMessageCount, successCallback, errorCallback) {
  this.callNative('setSingleConversationUnreadMessageCount', [username, appKey, unreadMessageCount],
    successCallback, errorCallback)
}

JMessagePlugin.prototype.getGroupConversation = function (groupId, successCallback, errorCallback) {
  this.callNative('getGroupConversation', [groupId], successCallback, errorCallback)
}

JMessagePlugin.prototype.getAllGroupConversation = function (successCallback, errorCallback) {
  this.callNative('getAllGroupConversation', [], successCallback, errorCallback)
}

JMessagePlugin.prototype.setGroupConversationUnreadMessageCount = function (groupId, unreadMessageCount,
    successCallback, errorCallback) {
  this.callNative('setGroupConversationUnreadMessageCount', [groupId, unreadMessageCount], successCallback, errorCallback)
}

JMessagePlugin.prototype.deleteSingleConversation = function (username, appKey, successCallback, errorCallback) {
  this.callNative('deleteSingleConversation', [username, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.deleteGroupConversation = function (groupId, successCallback, errorCallback) {
  this.callNative('deleteGroupConversation', [groupId], successCallback, errorCallback)
}

JMessagePlugin.prototype.enterSingleConversation = function (username, appKey, successCallback, errorCallback) {
  this.callNative('enterSingleConversation', [username, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.enterGroupConversation = function (groupId, successCallback, errorCallback) {
  this.callNative('enterGroupConversation', [groupId], successCallback, errorCallback)
}

JMessagePlugin.prototype.exitConversation = function (successCallback, errorCallback) {
  this.callNative('exitConversation', [], successCallback, errorCallback)
}

// Group API.

// successCallback：以参数形式返回 Group ID.
JMessagePlugin.prototype.createGroup = function (groupName, groupDesc, successCallback, errorCallback) {
  this.callNative('createGroup', [groupName, groupDesc], successCallback, errorCallback)
}

JMessagePlugin.prototype.getGroupIDList = function (successCallback, errorCallback) {
  this.callNative('getGroupIDList', [], successCallback, errorCallback)
}

JMessagePlugin.prototype.getGroupInfo = function (groupId, successCallback, errorCallback) {
  this.callNative('getGroupInfo', [groupId], successCallback, errorCallback)
}

JMessagePlugin.prototype.updateGroupName = function (groupId, groupNewName, successCallback, errorCallback) {
  this.callNative('updateGroupName', [groupId, groupNewName], successCallback, errorCallback)
}

JMessagePlugin.prototype.updateGroupDescription = function (groupId, groupNewDesc, successCallback, errorCallback) {
  this.callNative('updateGroupDescription', [groupId, groupNewDesc], successCallback, errorCallback)
}

// userNameList 格式为 "userName1,userName2" 字符串。
JMessagePlugin.prototype.addGroupMembers = function (groupId, userNameListStr, successCallback, errorCallback) {
  this.callNative('addGroupMembers', [groupId, userNameListStr], successCallback, errorCallback)
}

// userNameList 格式为 "userName1,userName2" 字符串。
JMessagePlugin.prototype.removeGroupMembers = function (groupId, userNameListStr, successCallback, errorCallback) {
  this.callNative('removeGroupMembers', [groupId, userNameListStr], successCallback, errorCallback)
}

JMessagePlugin.prototype.exitGroup = function (groupId, successCallback, errorCallback) {
  this.callNative('exitGroup', [groupId], successCallback, errorCallback)
}

JMessagePlugin.prototype.getGroupMembers = function (groupId, successCallback, errorCallback) {
  this.callNative('getGroupMembers', [groupId], successCallback, errorCallback)
}

// Blacklist API.

/**
* usernameStr: 被 "," 分隔的用户名字符串，如 "username1,username2"
*/
JMessagePlugin.prototype.addUsersToBlacklist = function (usernameStr, successCallback, errorCallback) {
  this.callNative('addUsersToBlacklist', [usernameStr], successCallback, errorCallback)
}

JMessagePlugin.prototype.delUsersFromBlacklist = function (usernameStr, successCallback, errorCallback) {
  this.callNative('delUsersFromBlacklist ', [usernameStr], successCallback, errorCallback)
}

JMessagePlugin.prototype.getBlacklist = function (successCallback, errorCallback) {
  this.callNative('getBlacklist', [], successCallback, errorCallback)
}

// 免打扰相关 API。

// 设置对某个用户免打扰。
// isNoDisturb: 0 - 普通状态，1 - 免打扰状态。
JMessagePlugin.prototype.setUserNoDisturb = function (username, isNoDisturb, successCallback, errorCallback) {
  if (device.platform == 'Android') {
    this.callNative('setUserNoDisturb', [username, isNoDisturb], successCallback, errorCallback)
  }
}

JMessagePlugin.prototype.setGroupNoDisturb = function (groupId, isNoDisturb, successCallback, errorCallback) {
  if (device.platform == 'Android') {
    this.callNative('setGroupNoDisturb', [groupId, isNoDisturb], successCallback, errorCallback)
  }
}

// 获取对特定用户的免打扰状态。0 - 普通状态，1 - 免打扰状态。
JMessagePlugin.prototype.getUserNoDisturb = function (username, successCallback, errorCallback) {
  if (device.platform == 'Android') {
    this.callNative('getUserNoDisturb', [username], successCallback, errorCallback)
  }
}

// 获取对特定群组的免打扰状态。0 - 普通状态，1 - 免打扰状态。
JMessagePlugin.prototype.getGroupNoDisturb = function (groupId, successCallback, errorCallback) {
  if (device.platform == 'Android') {
    this.callNative('getGroupNoDisturb', [groupId], successCallback, errorCallback)
  }
}

// 获取免打扰列表，结果包含 "userList": 免打扰用户，"groupList": 免打扰群组。
JMessagePlugin.prototype.getNoDisturblist = function (successCallback, errorCallback) {
  if (device.platform == 'Android') {
    this.callNative('getNoDisturblist', [], successCallback, errorCallback)
  }
}

// 设置是否全局免打扰，isNoDisturb: 0 - 普通状态, 1 - 免打扰。
JMessagePlugin.prototype.setNoDisturbGlobal = function (isNoDisturb, successCallback, errorCallback) {
  if (device.platform == 'Android') {
    this.callNative('setNoDisturbGlobal', [isNoDisturb], successCallback, errorCallback)
  }
}

// 判断当前是否是全局免打扰。
JMessagePlugin.prototype.getNoDisturbGlobal = function (successCallback, errorCallback) {
  if (device.platform == 'Android') {
    this.callNative('getNoDisturbGlobal', [], successCallback, errorCallback)
  }
}

// 通知管理
JMessagePlugin.prototype.setNotificationMode = function (mode, successCallback, errorCallback) {
  if (device.platform == 'Android') {
    this.callNative('setNotificationMode', [mode], successCallback, errorCallback)
  }
}

// handle event.
JMessagePlugin.prototype.onOpenMessage = function (data) {
  data = JSON.stringify(data)
  this.openedMessage = JSON.parse(data)
  cordova.fireDocumentEvent('jmessage.onOpenMessage', this.openedMessage)
}

JMessagePlugin.prototype.onReceiveMessage = function (data) {
  data = JSON.stringify(data)
  this.message = JSON.parse(data)
  cordova.fireDocumentEvent('jmessage.onReceiveMessage', this.message)
}

JMessagePlugin.prototype.onReceiveTextMessage = function (data) {
  data = JSON.stringify(data)
  this.textMessage = JSON.parse(data)
  cordova.fireDocumentEvent('jmessage.onReceiveTextMessage', this.textMessage)
}

JMessagePlugin.prototype.onReceiveImageMessage = function (data) {
  data = JSON.stringify(data)
  this.imageMessage = JSON.parse(data)
  cordova.fireDocumentEvent('jmessage.onReceiveImageMessage', this.imageMessage)
}

JMessagePlugin.prototype.onReceiveVoiceMessage = function (data) {
  data = JSON.stringify(data)
  this.voiceMessage = JSON.parse(data)
  cordova.fireDocumentEvent('jmessage.onReceiveVoiceMessage', this.voiceMessage)
}

JMessagePlugin.prototype.onReceiveCustomMessage = function (data) {
  data = JSON.stringify(data)
  this.customMessage = JSON.parse(data)
  cordova.fireDocumentEvent('jmessage.onReceiveCustomMessage', this.customMessage)
}

JMessagePlugin.prototype.onUserPasswordChanged = function () {
  cordova.fireDocumentEvent('jmessage.onUserPasswordChanged', null)
}

JMessagePlugin.prototype.onUserLogout = function () {
  cordova.fireDocumentEvent('jmessage.onUserLogout', null)
}

JMessagePlugin.prototype.onUserDeleted = function () {
  cordova.fireDocumentEvent('jmessage.onUserDeleted', null)
}

JMessagePlugin.prototype.onGroupMemberAdded = function () {
  cordova.fireDocumentEvent('jmessage.onGroupMemberAdded', null)
}

JMessagePlugin.prototype.onGroupMemberRemoved = function () {
  cordova.fireDocumentEvent('jmessage.onGroupMemberRemoved', null)
}

JMessagePlugin.prototype.onGroupMemberExit = function () {
  cordova.fireDocumentEvent('jmessage.onGroupMemberExit', null)
}

// ---------- iOS only ----------//
/*
JPush 推送功能相关 API 说明可参照 https:## github.com/jpush/jpush-phonegap-plugin/blob/master/doc/iOS_API.md

API 统一说明：
    iOS 中跨应用接口均以 `cross_` 开头，需要传有效的 `appkey`，其余方法的 `appkey` 参数一律传 `null`
    参数 `successCallback`、`errorCallback` 分别为成功、失败回调
    参数名为 `xxxArray` 则传数组，其余无特殊说明传字符串
    调用示例：`window.JMessage.funcName(args, successCallback, errorCallback)`
*/

// User
JMessagePlugin.prototype.getUserInfoArray = function (usernameArray, successCallback, errorCallback) {
  this.callNative('getUserInfoArray', [usernameArray], successCallback, errorCallback)
}

// Conversation
JMessagePlugin.prototype.getSingleConversationHistoryMessage = function (username, from, limit, successCallback, errorCallback) {
  this.callNative('getSingleConversationHistoryMessage', [username, from, limit], successCallback, errorCallback)
}

JMessagePlugin.prototype.getGroupConversationHistoryMessage = function (groupId, from, limit, successCallback, errorCallback) {
  this.callNative('getGroupConversationHistoryMessage', [groupId, from, limit], successCallback, errorCallback)
}

JMessagePlugin.prototype.getAllConversation = function (successCallback, errorCallback) {
  this.callNative('getAllConversation', [], successCallback, errorCallback)
}

JMessagePlugin.prototype.clearSingleUnreadCount = function (username, successCallback, errorCallback) {
  this.callNative('clearSingleUnreadCount', [username], successCallback, errorCallback)
}

JMessagePlugin.prototype.clearGroupUnreadCount = function (groupId, successCallback, errorCallback) {
  this.callNative('clearGroupUnreadCount', [groupId], successCallback, errorCallback)
}

// Group
JMessagePlugin.prototype.createGroupIniOS = function (name, desc, memebersArray, successCallback, errorCallback) {
  this.callNative('createGroupIniOS', [name, desc, memebersArray], successCallback, errorCallback)
}

JMessagePlugin.prototype.updateGroupInfo = function (groupId, name, desc, successCallback, errorCallback) {
  this.callNative('updateGroupInfo', [groupId, name, desc], successCallback, errorCallback)
}

JMessagePlugin.prototype.myGroupArray = function (successCallback, errorCallback) {
  this.callNative('myGroupArray', [], successCallback, errorCallback)
}

JMessagePlugin.prototype.memberArray = function (groupId, successCallback, errorCallback) {
  this.callNative('memberArray', [groupId], successCallback, errorCallback)
}

JMessagePlugin.prototype.addMembers = function (groupId, memberArray, successCallback, errorCallback) {
  this.callNative('addMembers', [groupId, memberArray], successCallback, errorCallback)
}

JMessagePlugin.prototype.removeMembers = function (groupId, memberArray, successCallback, errorCallback) {
  this.callNative('removeMembers', [groupId, memberArray], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendSingleCustomMessage_ios = function (username, text, extra, successCallback, errorCallback) {
  this.callNative('sendSingleCustomMessage', [username, text, extra], successCallback, errorCallback)
}

JMessagePlugin.prototype.sendGroupCustomMessage_ios = function (gid, text, extra, successCallback, errorCallback) {
  this.callNative('sendGroupCustomMessage', [gid, text, extra], successCallback, errorCallback)
}

JMessagePlugin.prototype.cross_sendSingleCustomMessage_ios = function (username, appkey, text, extra, successCallback, errorCallback) {
  this.callNative('cross_sendSingleCustomMessage', [username, appkey, text, extra], successCallback, errorCallback)
}

JMessagePlugin

// Cross App

JMessagePlugin.prototype.cross_sendSingleTextMessage = function (username, appKey, text, successCallback, errorCallback) {
  this.callNative('cross_sendSingleTextMessage', [username, appKey, text], successCallback, errorCallback)
}

JMessagePlugin.prototype.cross_sendSingleImageMessage = function (username, appKey, imageUrl, successCallback, errorCallback) {
  this.callNative('cross_sendSingleImageMessage', [username, imageUrl, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.cross_sendSingleVoiceMessage = function (username, appKey, fileUrl,
    successCallback, errorCallback) {
  this.callNative('cross_sendSingleVoiceMessage', [username, fileUrl, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.cross_getSingleConversationHistoryMessage = function (username, appKey,
    from, limit, successCallback, errorCallback) {
  this.callNative('cross_getSingleConversationHistoryMessage', [username, appKey, from, limit],
    successCallback, errorCallback)
}

JMessagePlugin.prototype.cross_deleteSingleConversation = function (username, appKey, successCallback, errorCallback) {
  this.callNative('cross_deleteSingleConversation', [username, appKey], successCallback, errorCallback)
}

JMessagePlugin.prototype.cross_getUserInfoArray = function (username, appkey, successCallback, errorCallback) {
  this.callNative('cross_getUserInfoArray', [username, appkey], successCallback, errorCallback)
}

JMessagePlugin.prototype.cross_getUserInfoArray = function (nameArray, appKey, successCallback, errorCallback) {
  this.callNative('cross_getUserInfoArray', [nameArray, appKey], successCallback, errorCallback)
}

// iOS handle event

JMessagePlugin.prototype.onConversationChanged = function (data) {
  try {
    var bToObj = JSON.parse(data)
    cordova.fireDocumentEvent('jmessage.onConversationChanged', bToObj)
  } catch (exception) {
    console.log('onConversationChanged ' + exception)
  }
}

JMessagePlugin.prototype.onUnreadChanged = function (data) {
  try {
    var bToObj = JSON.parse(data)
    cordova.fireDocumentEvent('jmessage.onUnreadChanged', bToObj)
  } catch (exception) {
    console.log('onUnreadChanged ' + exception)
  }
}

JMessagePlugin.prototype.onGroupInfoChanged = function (data) {
  try {
    var bToObj = JSON.parse(data)
    cordova.fireDocumentEvent('jmessage.onGroupInfoChanged', bToObj)
  } catch (exception) {
    console.log('onGroupInfoChanged ' + exception)
  }
}

JMessagePlugin.prototype.loginUserKicked = function (data) {
  try {
    var bToObj = JSON.parse(data)
    cordova.fireDocumentEvent('jmessage.loginUserKicked', bToObj)
  } catch (exception) {
    console.log('loginUserKicked ' + exception)
  }
}

JMessagePlugin.prototype.onReceiveConversationMessage = function (data) {
  try {
    var bToObj = JSON.parse(data)
  } catch (exception) {
    console.log('onConversationMessageReceived ' + exception)
  }
  cordova.fireDocumentEvent('jmessage.onReceiveMessage', bToObj)
}

JMessagePlugin.prototype.onSendMessage = function (data) {
  try {
    var bToObj = JSON.parse(data)
    console.log(data)
  } catch (exception) {
    console.log('onSendMessage ' + exception)
  }
  cordova.fireDocumentEvent('jmessage.onSendMessage', bToObj)
}

JMessagePlugin.prototype.onReceiveImageData = function (data) {
  try {
    var bToObj = JSON.parse(data)
    console.log(data)
  } catch (exception) {
    console.log('onReceiveImageData ' + exception)
  }
  cordova.fireDocumentEvent('jmessage.onReceiveImageData', bToObj)
}

JMessagePlugin.prototype.onReceiveVoiceData = function (data) {
  try {
    var bToObj = JSON.parse(data)
    console.log(data)
  } catch (exception) {
    console.log('onReceiveVoiceData ' + exception)
  }
  cordova.fireDocumentEvent('jmessage.onReceiveVoiceData', bToObj)
}

// ---------- iOS only end ----------//

if (!window.plugins) {
  window.plugins = {}
}

if (!window.plugins.jmessagePlugin) {
  window.plugins.jmessagePlugin = new JMessagePlugin()
}

module.exports = new JMessagePlugin()