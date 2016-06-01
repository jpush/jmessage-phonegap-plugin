cordova.define("cordova-plugin-jmessage.JMessagePlugin", function(require, exports, module) {

var JMessagePlugin = function () {
    this.username = "";
    this.nickname = "";
    this.gender = 0;
    this.avatarUrl = "";
    this.ReceiveMessageObj = "";
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

// userNameList 格式为 "userName1,userName2" 字符串。
JMessagePlugin.prototype.addGroupMembers = function(groupId, userNameListStr,
        success) {
    this.callNative("addGroupMembers", [userNameListStr], success);
};

JMessagePlugin.prototype.removeGroupMembers = function(groupId, userNameListStr,
        success) {
    this.callNative("removeGroupMembers", [userNameListStr], success);
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

JMessagePlugin.prototype.setNotificationMode = function(mode, success) {
    this.callNative("setNotificationMode", [mode], success);
};




//  Android Method

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


//  handle android receive push

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

});
