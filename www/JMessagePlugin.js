


var JMessagePlugin = function () {
    console.log("JMessagePlugin init");
    this.username = "";
    this.nickname = "";
    this.gender = 0;
    this.avatarUrl = "";
    this.ReceiveMessageObj = "";
};

JMessagePlugin.prototype.init = function () {
    console.log("JMessagePlugin init");

    if (device.platform == "Android") {
        this.setReceiveMessageCallbackChannel();
        this.setReceivePushCallbackChannel();
    }
};

JMessagePlugin.prototype.register = function (username, password, success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "userRegister", [username, password]);
};

JMessagePlugin.prototype.login = function (username, password, success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "userLogin", [username, password]);
};

JMessagePlugin.prototype.logout = function (success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "userLogout", []);
};

JMessagePlugin.prototype.getUserInfo = function (success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "getUserInfo", []);
};

JMessagePlugin.prototype.setUserNickname = function (nickname, success, fail) {
     cordova.exec(success, fail, "JMessagePlugin", "setUserNickname", [nickname]);
};

JMessagePlugin.prototype.setUserGender = function (gender, success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "setUserGender", [gender]);
};

JMessagePlugin.prototype.updateUserPassword = function(oldPwd, newPwd,
        success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "updateUserPassword",
        [oldPwd, newPwd]);
};


//  Message
JMessagePlugin.prototype.sendSingleTextMessage = function (username, text,
        success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "sendSingleTextMessage",
        [username, text]);
};

JMessagePlugin.prototype.sendSingleImageMessage = function (username, fileUrl,
        success, fail) {
    cordova.exec(success, fail, "JMessagePlugin",
        "sendSingleImageMessage", [username, fileUrl]);
};

JMessagePlugin.prototype.sendSingleVoiceMessage = function (username, fileUrl,
        success, fail) {
    cordova.exec(success, fail, "JMessagePlugin",
        "sendSingleVoiceMessage", [username, fileUrl]);
};

JMessagePlugin.prototype.sendGroupTextMessage = function (username, fileUrl,
        success, fail) {
    cordova.exec(success, fail, "JMessagePlugin",
        "sendGroupTextMessage", [groupId, text]);
};

JMessagePlugin.prototype.sendGroupImageMessage = function (username, fileUrl,
        success, fail) {
    cordova.exec(success, fail, "JMessagePlugin",
        "sendGroupImageMessage", [groupId, imgUrl]);
};

JMessagePlugin.prototype.sendGroupVoiceMessage = function (username, fileUrl,
        success, fail) {
    cordova.exec(success, fail, "JMessagePlugin",
        "sendGroupVoiceMessage", [groupId, voiceFileUrl]);
};

JMessagePlugin.prototype.getSingleHistoryMessage = function (username, from,
        limit, success, fail) {
    cordova.exec(success, fail, "JMessagePlugin",
        "getSingleConversationHistoryMessage", [username, from, limit]);
};



//  Conversation
JMessagePlugin.prototype.getSingleConversationList = function (success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "getAllSingleConversation", []);
};

JMessagePlugin.prototype.deleteSingleConversation = function (username, success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "deleteSingleConversation", [username]);
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
}

if (!window.plugins.jmessagePlugin) {
    window.plugins.jmessagePlugin = new JMessagePlugin();
}

module.exports = new JMessagePlugin();
