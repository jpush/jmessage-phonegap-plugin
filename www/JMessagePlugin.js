var exec = require("cordova/exec");

var JMessagePlugin = function () {
    this.username = "";
    this.nickname = "";
    this.gender = "";
    this.avatarUrl = "";

    this.message = {};
    this.openedMessage = {};
    this.textMessage = {};
    this.imageMessage = {};
    this.voiceMessage = {};
    this.customMessage = {};
};

JMessagePlugin.prototype.init = function () {

};

JMessagePlugin.prototype.errorCallback = function(msg) {
    console.log("JMessagePlugin callback error:" + msg);
};

JMessagePlugin.prototype.callNative = function(name, args, successCallback, errorCallback) {
    if (errorCallback == null) {
        exec(successCallback, this.errorCallback, "JMessagePlugin", name, args);
    } else {
        exec(successCallback, errorCallback, "JMessagePlugin", name, args);
    }
};


// Login and register API.

JMessagePlugin.prototype.register = function (username, password, successCallback, errorCallback) {
    this.callNative("userRegister", [username, password], successCallback, errorCallback);
};

JMessagePlugin.prototype.login = function (username, password, successCallback, errorCallback) {
    this.callNative("userLogin", [username, password], successCallback, errorCallback);
};

JMessagePlugin.prototype.logout = function(successCallback, errorCallback) {
    this.callNative("userLogout", [], successCallback, errorCallback);
};


// User info API.

// 如果 appKey 为空，获取当前 AppKey 下的用户信息。
JMessagePlugin.prototype.getUserInfo = function(username, appKey, successCallback, errorCallback) {
    this.callNative("getUserInfo", [username, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.getMyInfo = function(successCallback, errorCallback) {
    this.callNative("getMyInfo", [], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateUserInfo = function(username, appKey, userInfoField, value, successCallback, errorCallback) {
    this.callNative("updateUserInfo", [username, appKey, userInfoField, value], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateMyInfo = function(field, value, successCallback, errorCallback) {
    this.callNative("updateMyInfo", [field, value], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateMyPassword = function(oldPwd, newPwd, successCallback, errorCallback) {
    this.callNative("updateMyPassword", [oldPwd, newPwd], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateMyAvatar = function(avatarFileUrl, successCallback, errorCallback) {
    this.callNative("updateMyAvatar", [avatarFileUrl], successCallback, errorCallback);
};


// Message API.

JMessagePlugin.prototype.sendSingleTextMessage = function (username, text, appKey, successCallback, errorCallback) {
    this.callNative("sendSingleTextMessage", [username, text, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.sendSingleImageMessage = function (username, imageUrl, appKey, successCallback, errorCallback) {
    this.callNative("sendSingleImageMessage", [username, imageUrl, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.sendSingleVoiceMessage = function (username, fileUrl, appKey, successCallback, errorCallback) {
    this.callNative("sendSingleVoiceMessage", [username, fileUrl, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.sendSingleCustomMessage = function (username, jsonStr, appKey, successCallback, errorCallback) {
    this.callNative("sendSingleCustomMessage", [username, jsonStr, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.sendGroupTextMessage = function (groupId, text, successCallback, errorCallback) {
    this.callNative("sendGroupTextMessage", [groupId, text], successCallback, errorCallback);
};

JMessagePlugin.prototype.sendGroupImageMessage = function (groupId, imageUrl, successCallback, errorCallback) {
    this.callNative("sendGroupImageMessage", [groupId, imageUrl], successCallback, errorCallback);
};

JMessagePlugin.prototype.sendGroupVoiceMessage = function (username, fileUrl, successCallback, errorCallback) {
    this.callNative("sendGroupVoiceMessage", [username, fileUrl], successCallback, errorCallback);
};

JMessagePlugin.prototype.sendGroupCustomMessage = function (username, jsonStr, successCallback, errorCallback) {
    this.callNative("sendGroupCustomMessage", [username, jsonStr], successCallback, errorCallback);
};

JMessagePlugin.prototype.getLatestMessage = function(conversationType, value, appKey, successCallback, errorCallback) {
    this.callNative("getLatestMessage", [conversationType, value, appKey], successCallback, errorCallback);
};

// 获取指定 Conversation 的部分历史消息。conversationType: 'single' or 'group';
// value: username if conversation type is 'single' or groupId if conversation type is 'group'.
JMessagePlugin.prototype.getHistoryMessages = function(conversationType, value, appKey, from, limit, successCallback, errorCallback) {
    this.callNative("getHistoryMessages", [conversationType, value, appKey, from, limit], successCallback, errorCallback);
};

// 获取指定 Conversation 的全部历史消息。
JMessagePlugin.prototype.getAllMessages = function(conversationType, value, appKey, successCallback, errorCallback) {
    this.callNative("getAllMessages", [conversationType, value, appKey], successCallback, errorCallback);
};


// Conversation API.

JMessagePlugin.prototype.getConversationList = function(successCallback, errorCallback) {
    this.callNative("getConversationList", [], successCallback, errorCallback);
};

// username: 目标用户的用户名。
JMessagePlugin.prototype.getSingleConversation = function(username, appKey, successCallback, errorCallback) {
    this.callNative("getSingleConversation", [username, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.getAllSingleConversation = function(successCallback, errorCallback) {
    this.callNative("getAllSingleConversation", [], successCallback, errorCallback);
};

JMessagePlugin.prototype.setSingleConversationUnreadMessageCount = function(username, appKey, unreadMessageCount, successCallback, errorCallback) {
    this.callNative("setSingleConversationUnreadMessageCount", [username, appKey, unreadMessageCount], successCallback, errorCallback);
};

JMessagePlugin.prototype.getGroupConversation = function(groupId, successCallback, errorCallback) {
    this.callNative("getGroupConversation", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.getAllGroupConversation = function(successCallback, errorCallback) {
    this.callNative("getAllGroupConversation", [], successCallback, errorCallback);
};

JMessagePlugin.prototype.setGroupConversationUnreadMessageCount = function(groupId, unreadMessageCount, successCallback, errorCallback) {
    this.callNative("setGroupConversationUnreadMessageCount", [groupId, unreadMessageCount], successCallback, errorCallback);
};

JMessagePlugin.prototype.deleteSingleConversation = function(username, appKey, successCallback, errorCallback) {
    this.callNative("deleteSingleConversation", [username, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.deleteGroupConversation = function(groupId, successCallback, errorCallback) {
    this.callNative("deleteGroupConversation", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.enterSingleConversation = function(username, appKey, successCallback, errorCallback) {
    this.callNative("enterSingleConversation", [username, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.enterGroupConversation = function(groupId, successCallback, errorCallback) {
    this.callNative("enterGroupConversation", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.exitConversation = function(successCallback, errorCallback) {
    this.callNative("exitConversation", [], successCallback, errorCallback);
};


// Group API.

JMessagePlugin.prototype.createGroup = function(groupName, groupDesc, successCallback, errorCallback) {
    this.callNative("createGroup", [groupName, groupDesc], successCallback, errorCallback);
};

JMessagePlugin.prototype.getGroupIDList = function(successCallback, errorCallback) {
    this.callNative("getGroupIDList", [], successCallback, errorCallback);
};

JMessagePlugin.prototype.getGroupInfo = function(groupId, successCallback, errorCallback) {
    this.callNative("getGroupInfo", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateGroupName = function(groupId, groupNewName, successCallback, errorCallback) {
    this.callNative("updateGroupName", [groupId, groupNewName], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateGroupDescription = function(groupId, groupNewDesc, successCallback, errorCallback) {
    this.callNative("updateGroupDescription", [groupId, groupNewDesc], successCallback, errorCallback);
};

// userNameList 格式为 "userName1,userName2" 字符串。
JMessagePlugin.prototype.addGroupMembers = function(groupId, userNameListStr, success) {
    this.callNative("addGroupMembers", [userNameListStr], success);
};

// userNameList 格式为 "userName1,userName2" 字符串。
JMessagePlugin.prototype.removeGroupMembers = function(groupId, userNameListStr, success) {
    this.callNative("removeGroupMembers", [userNameListStr], success);
};

JMessagePlugin.prototype.exitGroup = function(groupId, successCallback, errorCallback) {
    this.callNative("exitGroup", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.getGroupMembers = function(groupId, successCallback, errorCallback) {
    this.callNative("getGroupMembers", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.addMembers = function(membersArray, successCallback, errorCallback) {
    this.callNative("addMembers", [membersArray], successCallback, errorCallback);
};

// Blacklist API.

/**
* usernameStr: 被 "," 分隔的用户名字符串，如 "username1,username2";
*/
JMessagePlugin.prototype.addUsersToBlacklist = function(usernameStr, success) {
    this.callNative("addUsersToBlacklist", [usernameStr], success);
};

JMessagePlugin.prototype.delUsersFromBlacklist = function(usernameStr, success) {
    this.callNative("delUsersFromBlacklist ", [usernameStr], success);
};

JMessagePlugin.prototype.getBlacklist = function(success) {
    this.callNative("getBlacklist", [], success);
};


// handle event.
JMessagePlugin.prototype.onOpenMessage = function(data) {
    data = JSON.stringify(data);
    this.openedMessage = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onOpenMessage", null);
};

JMessagePlugin.prototype.onReceiveMessage = function(data) {
    data = JSON.stringify(data);
    this.message = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveMessage", null);
};

JMessagePlugin.prototype.onReceiveTextMessage = function(data) {
    data = JSON.stringify(data);
    this.textMessage = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveTextMessage", null);
};

JMessagePlugin.prototype.onReceiveImageMessage = function(data) {
    data = JSON.stringify(data);
    this.imageMessage = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveImageMessage", null);
};

JMessagePlugin.prototype.onReceiveVoiceMessage = function(data) {
    data = JSON.stringify(data);
    this.voiceMessage = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveVoiceMessage", null);
};

JMessagePlugin.prototype.onReceiveCustomMessage = function(data) {
    data = JSON.stringify(data);
    this.customMessage = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveCustomMessage", null);
};

JMessagePlugin.prototype.onUserPasswordChanged = function() {
    cordova.fireDocumentEvent("jmessage.onUserPasswordChanged", null);
};

JMessagePlugin.prototype.onUserLogout = function() {
    cordova.fireDocumentEvent("jmessage.onUserLogout", null);
};

JMessagePlugin.prototype.onUserDeleted = function() {
    cordova.fireDocumentEvent("jmessage.onUserDeleted", null);
};

JMessagePlugin.prototype.onGroupMemberAdded = function() {
    cordova.fireDocumentEvent("jmessage.onGroupMemberAdded", null);
};

JMessagePlugin.prototype.onGroupMemberRemoved = function() {
    cordova.fireDocumentEvent("jmessage.onGroupMemberRemoved", null);
};

JMessagePlugin.prototype.onGroupMemberExit = function() {
    cordova.fireDocumentEvent("jmessage.onGroupMemberExit", null);
};

//---------- iOS only ----------//
/*
    iOS API 文档参考 http://docs.jiguang.cn/client/im_sdk_ios/
    参数名后缀为 array 则需要传数组
*/

//User
JMessagePlugin.prototype.getUserInfoArray = function(usernameArray, successCallback, errorCallback) {
    this.callNative("getUserInfoArray", [usernameArray], successCallback, errorCallback);
};

//Conversation
JMessagePlugin.prototype.getSingleConversationHistoryMessage = function(username, from, limit, successCallback, errorCallback) {
    this.callNative("getSingleConversationHistoryMessage", [username, from, limit], successCallback, errorCallback);
};

JMessagePlugin.prototype.getGroupConversationHistoryMessage = function(username, from, limit, successCallback, errorCallback) {
    this.callNative("getGroupConversationHistoryMessage", [username, from, limit], successCallback, errorCallback);
};

JMessagePlugin.prototype.getAllConversation = function(successCallback, errorCallback) {
    this.callNative("getAllConversation", [], successCallback, errorCallback);
};

//Group
JMessagePlugin.prototype.createGroupIniOS = function(name, desc, memebersArray, successCallback, errorCallback) {
    this.callNative("createGroupIniOS", [name, desc, memebersArray], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateGroupInfo = function(groupId, name, desc, successCallback, errorCallback) {
    this.callNative("updateGroupInfo", [groupId, name, desc], successCallback, errorCallback);
};

JMessagePlugin.prototype.myGroupArray = function(groupId, successCallback, errorCallback) {
    this.callNative("myGroupArray", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.addMembers = function(memberArray, successCallback, errorCallback) {
    this.callNative("addMembers", [memberArray], successCallback, errorCallback);
};

JMessagePlugin.prototype.removeMembers = function(memberArray, successCallback, errorCallback) {
    this.callNative("removeMembers", [memberArray], successCallback, errorCallback);
};

//Cross App

JMessagePlugin.prototype.cross_sendSingleTextMessage = function (username, appKey, text, successCallback, errorCallback) {
    this.callNative("cross_sendSingleTextMessage", [username, appKey, text], successCallback, errorCallback);
};

JMessagePlugin.prototype.cross_sendSingleImageMessage = function (username, appKey, imageUrl, successCallback, errorCallback) {
    this.callNative("cross_sendSingleImageMessage", [username, imageUrl, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.cross_sendSingleVoiceMessage = function (username, appKey, fileUrl, successCallback, errorCallback) {
    this.callNative("cross_sendSingleVoiceMessage", [username, fileUrl, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.cross_getSingleConversationHistoryMessage = function (username, appKey, from, limit, successCallback, errorCallback) {
    this.callNative("cross_getSingleConversationHistoryMessage", [username, appKey, from, limit], successCallback, errorCallback);
};

JMessagePlugin.prototype.cross_deleteSingleConversation = function (username, appKey, successCallback, errorCallback) {
    this.callNative("cross_deleteSingleConversation", [username, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.cross_getUserInfoArray = function (nameArray, appKey, successCallback, errorCallback) {
    this.callNative("cross_getUserInfoArray", [nameArray, appKey], successCallback, errorCallback);
};

// iOS handle event

JMessagePlugin.prototype.onConversationChanged = function (data) {
    try {
        var bToObj = JSON.parse(data);
        cordova.fireDocumentEvent('jmessage.onConversationChanged', bToObj);
    }
    catch (exception) {
        console.log("onConversationChanged " + exception);
    }
};

JMessagePlugin.prototype.onUnreadChanged = function (data) {
    try {
        var bToObj = JSON.parse(data);
        cordova.fireDocumentEvent('jmessage.onUnreadChanged', bToObj);
    }
    catch (exception) {
        console.log("onUnreadChanged " + exception);
    }
};

JMessagePlugin.prototype.onGroupInfoChanged = function (data) {
    try {
        var bToObj = JSON.parse(data);
        cordova.fireDocumentEvent('jmessage.onGroupInfoChanged', bToObj);
    }
    catch (exception) {
        console.log("onGroupInfoChanged " + exception);
    }
};

JMessagePlugin.prototype.loginUserKicked = function (data) {
    try {
        var bToObj = JSON.parse(data);
        cordova.fireDocumentEvent('jmessage.loginUserKicked', bToObj);
    }
    catch (exception) {
        console.log("loginUserKicked " + exception);
    }
};

JMessagePlugin.prototype.onReceiveConversationMessage = function (data) {
    try {
        var bToObj = JSON.parse(data);
    }
    catch (exception) {
        console.log("onConversationMessageReceived " + exception);
    }
    cordova.fireDocumentEvent('jmessage.onReceiveMessage', bToObj);
};

JMessagePlugin.prototype.onSendMessage = function (data) {
    try {
        var bToObj = JSON.parse(data);
        console.log(data);
    }
    catch (exception) {
        console.log("onSendMessage " + exception);
    }
    cordova.fireDocumentEvent('jmessage.onSendMessage', bToObj);
};

//---------- iOS only end ----------//

if (!window.plugins) {
    window.plugins = {};
};

if (!window.plugins.jmessagePlugin) {
    window.plugins.jmessagePlugin = new JMessagePlugin();
};

module.exports = new JMessagePlugin();
