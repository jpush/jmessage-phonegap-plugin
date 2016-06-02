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
    this.ReceiveMessageObj = "";

    this.textMessage = {};
    this.imageMessage = {};
    this.voiceMessage = {};
    this.customMessage = {};
};

JMessagePlugin.prototype.init = function () {
    if (device.platform == "Android") {
        this.setReceiveMessageCallbackChannel();
        this.setReceivePushCallbackChannel();
    }
};

JMessagePlugin.prototype.errorCallback = function(msg) {
    console.log("JMessagePlugin callback error:" + msg);
};

JMessagePlugin.prototype.callNative = function(name, args, successCallback) {
    ret = cordova.exec(successCallback, this.errorCallback, "JMessagePlugin", args);
    return ret;
};


// Login and register API.

JMessagePlugin.prototype.register = function (username, password, successCallback) {
    this.callNative("register", [username, password], successCallback);
};

JMessagePlugin.prototype.login = function (username, password, successCallback) {
    this.callNative("login", [username, password], successCallback);
};

JMessagePlugin.prototype.logout = function(successCallback) {
    this.callNative("logout", [], successCallback);
};


// User info API.

// 如果 appKey 为空，获取当前 AppKey 下的用户信息。
JMessagePlugin.prototype.getUserInfo = function(username, appKey, successCallback) {
    this.callNative("getUserInfo", [username, appKey], successCallback);
};

JMessagePlugin.prototype.getMyInfo = function(successCallback) {
    this.callNative("getMyInfo", [], successCallback);
};

JMessagePlugin.prototype.updateUserInfo = function(username, appKey,
        userInfoField, value, successCallback) {
    this.callNative("updateUserInfo", [username, appKey, userInfoField, value],
        successCallback);
};

JMessagePlugin.prototype.updateUserPassword = function(oldPwd, newPwd,
        successCallback) {
    this.callNative("updateUserPassword", [oldPwd, newPwd], successCallback);
};

JMessagePlugin.prototype.updateUserAvatar = function(avatarFileUrl, successCallback) {
    this.callNative("updateUserAvatar", [avatarFileUrl], successCallback);
};


// Message API.

JMessagePlugin.prototype.sendSingleTextMessage = function (username, text,
        successCallback) {
    this.callNative("sendSingleTextMessage", [username, text], successCallback);
};

JMessagePlugin.prototype.sendSingleImageMessage = function (username, imageUrl,
        successCallback) {
    this.callNative("sendSingleImageMessage", [username, imageUrl], successCallback);
};

JMessagePlugin.prototype.sendSingleVoiceMessage = function (username, fileUrl,
        successCallback) {
    this.callNative("sendSingleVoiceMessage", [username, fileUrl], successCallback);
};

JMessagePlugin.prototype.sendSingleCustomMessage = function (username, jsonStr,
        successCallback) {
    this.callNative("sendSingleCustomMessage", [username, jsonStr], successCallback);
};

JMessagePlugin.prototype.sendGroupTextMessage = function (username, text,
        successCallback) {
    this.callNative("sendGroupTextMessage", [username, text], successCallback);
};

JMessagePlugin.prototype.sendGroupImageMessage = function (username, imageUrl,
        successCallback) {
    this.callNative("sendGroupImageMessage", [username, imageUrl], successCallback);
};

JMessagePlugin.prototype.sendGroupVoiceMessage = function (username, fileUrl,
        successCallback) {
    this.callNative("sendGroupVoiceMessage", [username, fileUrl], successCallback);
};

JMessagePlugin.prototype.sendGroupCustomMessage = function (username, jsonStr,
        successCallback) {
    this.callNative("sendGroupCustomMessage", [username, jsonStr], successCallback);
};


// Conversation API.

JMessagePlugin.prototype.getConversationList = function(successCallback) {
    this.callNative("getConversationList", [], successCallback);
};

JMessagePlugin.prototype.getSingleConversation = function(username, appKey,
        successCallback) {
    this.callNative("getSingleConversation", [username, appKey], successCallback);
};

JMessagePlugin.prototype.getGroupConversation = function(groupId, successCallback) {
    this.callNative("getGroupConversation", [groupId], successCallback);
};

JMessagePlugin.prototype.deleteSingleConversation = function(username, appKey,
        successCallback) {
    this.callNative("deleteSingleConversation", [username, appKey], successCallback);
};

JMessagePlugin.prototype.deleteGroupConversation = function(groupId,
        successCallback) {
    this.callNative("deleteGroupConversation", [groupId], successCallback);
};

JMessagePlugin.prototype.enterSingleConversation = function(username, appKey
        successCallback) {
    this.callNative("enterSingleConversation", [username, appKey], successCallback);
};

JMessagePlugin.prototype.enterGroupConversation = function(groupId, successCallback) {
    this.callNative("enterGroupConversation", [groupId], successCallback);
};

JMessagePlugin.prototype.exitConversation = function(successCallback) {
    this.callNative("exitConversation", [], successCallback);
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
        successCallback) {
    this.callNative("createGroup", [groupName, groupDesc], successCallback);
};

JMessagePlugin.prototype.getGroupIDList = function(successCallback) {
    this.callNative("getGroupIDList", [], successCallback);
};

JMessagePlugin.prototype.getGroupInfo = function(groupId, successCallback) {
    this.callNative("getGroupInfo", [groupId], successCallback);
};

JMessagePlugin.prototype.updateGroupName = function(groupId, groupNewName,
        successCallback) {
    this.callNative("updateGroupName", [groupId, groupNewName], successCallback);
};

JMessagePlugin.prototype.updateGroupDescription = function(groupId, groupNewDesc,
        successCallback) {
    this.callNative("updateGroupDescription", [groupId, groupNewDesc], successCallback);
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

JMessagePlugin.prototype.exitGroup = function(groupId, successCallback) {
    this.callNative("exitGroup", [groupId], successCallback);
};

JMessagePlugin.prototype.getGroupMembers = function(groupId, successCallback) {
    this.callNative("getGroupMembers", [groupId], successCallback);
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
    console.log('int window plugins');
    window.plugins = {};
};

if (!window.plugins.jmessagePlugin) {
    window.plugins.jmessagePlugin = new JMessagePlugin();
};

module.exports = new JMessagePlugin();
