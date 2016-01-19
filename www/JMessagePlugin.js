var JMessagePlugin = function () {

    console.log("JMessagePlugin init");
    this.username = "";
    this.nickname = "";
    this.gender = 0;
    this.avatarUrl = "";
    this.ReceiveMessageObj = "";
};


JMessagePlugin.prototype.init = function () {
    console.log("JMessagePlugin onDeviceReady");

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


//message
JMessagePlugin.prototype.sendSingleTextMessage = function (username, text, success, fail) {

    cordova.exec(success, fail, "JMessagePlugin", "sendSingleTextMessage", [username, text]);
};


JMessagePlugin.prototype.getSingleHistoryMessage = function (username, from, limit, success, fail) {

    cordova.exec(success, fail, "JMessagePlugin", "getSingleConversationHistoryMessage", [username, from, limit]);
};

//  conversation
JMessagePlugin.prototype.getSingleConversationList = function (success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "getAllSingleConversation", []);
};

JMessagePlugin.prototype.deleteSingleConversation = function (username, success, fail) {
    cordova.exec(success, fail, "JMessagePlugin", "deleteSingleConversation", [username]);
};


function onSingleConversationMessageReceivedInAndroid(response) {
    cordova.fireDocumentEvent('jmessage.singleReceiveMessage', response);
}

//iOS receive msg
JMessagePlugin.prototype.onSingleConversationMessageReceived = function (data) {
    try {
        var bToObj = JSON.parse(data);
        cordova.fireDocumentEvent('jmessage.singleReceiveMessage', bToObj);
    }
    catch (exception) {
        console.log("onSingleConversationMessageReceived " + exception);
    }
};

JMessagePlugin.prototype.onSingleConversationChanged = function (data) {
    try {
        var bToObj = JSON.parse(data);
        //console.log(bToObj);
        cordova.fireDocumentEvent('jmessage.conversationChange', bToObj);
    }
    catch (exception) {
        console.log("onSingleConversationChanged " + exception);
    }
};

JMessagePlugin.prototype.onSendSingleTextMessage = function (data) {
    try {
        var bToObj = JSON.parse(data);
        console.log(data);
    }
    catch (exception) {
        console.log("sendSingleTextMessageRespone " + exception);
    }
};

///////////////// android only method /////////////////////


JMessagePlugin.prototype.setReceiveMessageCallbackChannel = function () {

    function AndroidReceiveMessageCallback(message) {
        window.plugins.jmessagePlugin.ReceiveMessageObj = message;
        cordova.fireDocumentEvent('jmessage.singleReceiveMessage', null);
    }

    function fail() {
        console.log("setMessageCallbackChannel  faild");
    }

    cordova.exec(AndroidReceiveMessageCallback, fail, "JMessagePlugin", "setJMessageReceiveCallbackChannel", []);

};


////////////////// handle android receive push ///////////////////

JMessagePlugin.prototype.setReceivePushCallbackChannel = function () {

    function AndroidReceivePushCallback(bToObj) {
        console.log("### android receive push message");

        var ss = JSON.stringify(bToObj);

        var messageWrapTyle = bToObj.messageWrapTyle;
        var realData;
        if (messageWrapTyle === "ACTION_MESSAGE_RECEIVED") {
            realData = bToObj.data;
            window.plugins.jPushPlugin.onReceiveMessageInAndroid(realData);
        }
        else if (messageWrapTyle === "ACTION_NOTIFICATION_OPENED") {
            realData = bToObj.data;
            window.plugins.jPushPlugin.onOpenNofiticationInAndroid(realData);
        }
        else if (messageWrapTyle === "ACTION_NOTIFICATION_RECEIVED") {
            realData = bToObj.data;
            window.plugins.jPushPlugin.onReceiveNofiticationInAndroid(realData);
        }
        else {

        }
    }

    function fail() {
        console.log("--- setPushReceiveCallbackChannel  faild");
    }

    cordova.exec(AndroidReceivePushCallback, fail, "JMessagePlugin", "setPushReceiveCallbackChannel", []);
};



if (!window.plugins) {
    console.log('int window plugins');
    window.plugins = {};
}

if (!window.plugins.jmessagePlugin) {
    window.plugins.jmessagePlugin = new JMessagePlugin();
}
module.exports = new JMessagePlugin();
    
    



