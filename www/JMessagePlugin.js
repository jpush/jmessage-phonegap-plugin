var exec = require("cordova/exec");

var JMessagePlugin = function () {
    this.NOTI_MODE_NO_NOTIFICATION = 0;
    this.NOTI_MODE_DEFAULT = 1;
    this.NOTI_MODE_NO_SOUND = 2;
    this.NOTI_MODE_NO_VIBRATE = 3;
    this.NOTI_MODE_SILENCE = 4;

    this.username = "";
    this.nickname = "";
    this.gender = 0;
    this.avatarUrl = "";
    this.receiveMessageObj = "";

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

JMessagePlugin.prototype.callNative = function(name, args, successCallback,
        errorCallback) {
    if (errorCallback == null) {
        exec(successCallback, this.errorCallback, "JMessagePlugin", name, args);
    } else {
        exec(successCallback, errorCallback, "JMessagePlugin", name, args);
    }
};


// Login and register API.

JMessagePlugin.prototype.register = function (username, password, successCallback,
        errorCallback) {
    this.callNative("register", [username, password], successCallback, errorCallback);
};

JMessagePlugin.prototype.login = function (username, password, successCallback,
        errorCallback) {
    this.callNative("login", [username, password], successCallback, errorCallback);
};

JMessagePlugin.prototype.logout = function(successCallback, errorCallback) {
    this.callNative("logout", [], successCallback, errorCallback);
};


// User info API.

// 如果 appKey 为空，获取当前 AppKey 下的用户信息。
JMessagePlugin.prototype.getUserInfo = function(username, appKey, successCallback,
        errorCallback) {
    this.callNative("getUserInfo", [username, appKey], successCallback, errorCallback);
};

JMessagePlugin.prototype.getMyInfo = function(successCallback, errorCallback) {
    this.callNative("getMyInfo", [], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateUserInfo = function(username, appKey,
        userInfoField, value, successCallback, errorCallback) {
    this.callNative("updateUserInfo", [username, appKey, userInfoField, value],
        successCallback, errorCallback);
};

JMessagePlugin.prototype.updateMyInfo = function(field, value, successCallback,
        errorCallback) {
    this.callNative("updateMyInfo", [field, value], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateUserPassword = function(oldPwd, newPwd,
        successCallback, errorCallback) {
    this.callNative("updateUserPassword", [oldPwd, newPwd], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.updateUserAvatar = function(avatarFileUrl, successCallback,
        errorCallback) {
    this.callNative("updateUserAvatar", [avatarFileUrl], successCallback, errorCallback);
};


// Message API.

JMessagePlugin.prototype.sendSingleTextMessage = function (username, text,
        successCallback, errorCallback) {
    this.callNative("sendSingleTextMessage", [username, text], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.sendSingleImageMessage = function (username, imageUrl,
        successCallback, errorCallback) {
    this.callNative("sendSingleImageMessage", [username, imageUrl], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.sendSingleVoiceMessage = function (username, fileUrl,
        successCallback, errorCallback) {
    this.callNative("sendSingleVoiceMessage", [username, fileUrl], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.sendSingleCustomMessage = function (username, jsonStr,
        successCallback, errorCallback) {
    this.callNative("sendSingleCustomMessage", [username, jsonStr], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.sendGroupTextMessage = function (username, text,
        successCallback, errorCallback) {
    this.callNative("sendGroupTextMessage", [username, text], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.sendGroupImageMessage = function (username, imageUrl,
        successCallback, errorCallback) {
    this.callNative("sendGroupImageMessage", [username, imageUrl], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.sendGroupVoiceMessage = function (username, fileUrl,
        successCallback, errorCallback) {
    this.callNative("sendGroupVoiceMessage", [username, fileUrl], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.sendGroupCustomMessage = function (username, jsonStr,
        successCallback, errorCallback) {
    this.callNative("sendGroupCustomMessage", [username, jsonStr], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.getLatestMessage = function(conversationType, value,
        appKey, successCallback, errorCallback) {
    this.callNative("getLatestMessage", [conversationType, value, appKey],
        successCallback, errorCallback);
};

// 获取指定 Conversation 的部分历史消息。conversationType: 'single' or 'group';
// value: username if conversation type is 'single' or groupId if conversation type is 'group'.
JMessagePlugin.prototype.getHistoryMessages = function(conversationType, value,
        appKey, from, limit, successCallback, errorCallback) {
    this.callNative("getHistoryMessages", [conversationType, value, appKey, from, limit],
        successCallback, errorCallback);
};

// 获取指定 Conversation 的全部历史消息。
JMessagePlugin.prototype.getAllMessages = function(conversationType, value,
        appKey, successCallback, errorCallback) {
    this.callNative("getAllMessages", [conversationType, value, appKey],
        successCallback, errorCallback);
};


// Conversation API.

JMessagePlugin.prototype.getConversationList = function(successCallback,
        errorCallback) {
    this.callNative("getConversationList", [], successCallback, errorCallback);
};

// username: 目标用户的用户名。
JMessagePlugin.prototype.getSingleConversation = function(username, appKey,
        successCallback, errorCallback) {
    this.callNative("getSingleConversation", [username, appKey], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.getAllSingleConversation = function(successCallback,
        errorCallback) {
    this.callNative("getAllSingleConversation", [], successCallback, errorCallback);
};

JMessagePlugin.prototype.getGroupConversation = function(groupId, successCallback,
        errorCallback) {
    this.callNative("getGroupConversation", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.deleteSingleConversation = function(username, appKey,
        successCallback, errorCallback) {
    this.callNative("deleteSingleConversation", [username, appKey], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.deleteGroupConversation = function(groupId,
        successCallback, errorCallback) {
    this.callNative("deleteGroupConversation", [groupId], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.enterSingleConversation = function(username, appKey,
        successCallback, errorCallback) {
    this.callNative("enterSingleConversation", [username, appKey], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.enterGroupConversation = function(groupId, successCallback,
        errorCallback) {
    this.callNative("enterGroupConversation", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.exitConversation = function(successCallback, errorCallback) {
    this.callNative("exitConversation", [], successCallback, errorCallback);
};

JMessagePlugin.prototype.onReceivedSingleConversationMessage = function (data) {
    if (device.platform == "Android") {
        var bToObj = window.plugins.jmessagePlugin.ReceiveMessageObj;
    } else {
        try {
            bToObj = JSON.parse(data);
        } catch (exception) {
            console.log("onSingleConversationMessageReceived " + exception);
        }
    }
    cordova.fireDocumentEvent('jmessage.singleReceiveMessage', bToObj);
};

JMessagePlugin.prototype.onSingleConversationChanged = function (data) {
    try {
        var bToObj = JSON.parse(data);
        cordova.fireDocumentEvent('jmessage.conversationChange', bToObj);
    } catch (exception) {
        console.log("onSingleConversationChanged " + exception);
    }
};

JMessagePlugin.prototype.onSendSingleTextMessage = function (data) {
    try {
        var bToObj = JSON.parse(data);
        console.log(data);
    } catch (exception) {
        console.log("sendSingleTextMessageResponse " + exception);
    }
};


// Group API.

JMessagePlugin.prototype.createGroup = function(groupName, groupDesc,
        successCallback, errorCallback) {
    this.callNative("createGroup", [groupName, groupDesc], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.getGroupIDList = function(successCallback, errorCallback) {
    this.callNative("getGroupIDList", [], successCallback, errorCallback);
};

JMessagePlugin.prototype.getGroupInfo = function(groupId, successCallback,
        errorCallback) {
    this.callNative("getGroupInfo", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.updateGroupName = function(groupId, groupNewName,
        successCallback, errorCallback) {
    this.callNative("updateGroupName", [groupId, groupNewName], successCallback,
        errorCallback);
};

JMessagePlugin.prototype.updateGroupDescription = function(groupId, groupNewDesc,
        successCallback, errorCallback) {
    this.callNative("updateGroupDescription", [groupId, groupNewDesc],
        successCallback, errorCallback);
};

// userNameList 格式为 "userName1,userName2" 字符串。
JMessagePlugin.prototype.addGroupMembers = function(groupId, userNameListStr,
        success) {
    this.callNative("addGroupMembers", [userNameListStr], success);
};

// userNameList 格式为 "userName1,userName2" 字符串。
JMessagePlugin.prototype.removeGroupMembers = function(groupId, userNameListStr,
        success) {
    this.callNative("removeGroupMembers", [userNameListStr], success);
};

JMessagePlugin.prototype.exitGroup = function(groupId, successCallback,
        errorCallback) {
    this.callNative("exitGroup", [groupId], successCallback, errorCallback);
};

JMessagePlugin.prototype.getGroupMembers = function(groupId, successCallback,
        errorCallback) {
    this.callNative("getGroupMembers", [groupId], successCallback, errorCallback);
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


// Notification API.
JMessagePlugin.prototype.setNotificationMode = function(mode, success) {
    this.callNative("setNotificationMode", [mode], success);
};

JMessagePlugin.prototype.setReceiveMessageCallbackChannel = function () {
    function AndroidReceiveMessageCallback(message) {
        window.plugins.jmessagePlugin.ReceiveMessageObj = message;
        window.plugins.jmessagePlugin.onReceivedSingleConversationMessage(null);
        //cordova.fireDocumentEvent('jmessage.singleReceiveMessage', null);
    }

    function fail() {
        console.log("setMessageCallbackChannel failed");
    }

    cordova.exec(AndroidReceiveMessageCallback, fail, "JMessagePlugin",
        "setJMessageReceiveCallbackChannel", []);
};

// handle event.
JMessagePlugin.prototype.onReceiveMessage = function(data) {
    console.log(data);
    this.receiveMessageObj = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveMessage", null);
};

JMessagePlugin.prototype.onReceiveTextMessage = function(data) {
    this.textMessage = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveTextMessage", null);
};

JMessagePlugin.prototype.onReceiveImageMessage = function(data) {
    this.imageMessage = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveImageMessage", null);
};

JMessagePlugin.prototype.onReceiveVoiceMessage = function(data) {
    this.voiceMessage = JSON.parse(data);
    cordova.fireDocumentEvent("jmessage.onReceiveVoiceMessage", null);
};

JMessagePlugin.prototype.onReceiveCustomMessage = function(data) {
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


// handle android receive push

JMessagePlugin.prototype.setReceivePushCallbackChannel = function () {
    function AndroidReceivePushCallback(bToObj) {
        console.log("### android receive push message");

        var ss = JSON.stringify(bToObj);
        var messageWrapType = bToObj.messageWrapType;
        var realData = bToObj.data;

        if (messageWrapType === "ACTION_MESSAGE_RECEIVED") {
            window.plugins.jPushPlugin.onReceiveMessageInAndroid(realData);
        } else if (messageWrapType === "ACTION_NOTIFICATION_OPENED") {
            window.plugins.jPushPlugin.onOpenNotificationInAndroid(realData);
        } else if (messageWrapType === "ACTION_NOTIFICATION_RECEIVED") {
            window.plugins.jPushPlugin.onReceiveNotificationInAndroid(realData);
        }
    }

    function fail() {
        console.log("--- setPushReceiveCallbackChannel failed");
    }

    cordova.exec(AndroidReceivePushCallback, fail, "JMessagePlugin",
        "setPushReceiveCallbackChannel", []);
};

if (!window.plugins) {
    window.plugins = {};
};

if (!window.plugins.jmessagePlugin) {
    window.plugins.jmessagePlugin = new JMessagePlugin();
};

module.exports = new JMessagePlugin();
