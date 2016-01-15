
# jmessage-API

JMessage API 在文件 JMessagePlugin.js 中定义


+ 注册
```sh
  JMessagePlugin.register(username, password, success, fail)
```

+ 登录，登出
```sh
JMessagePlugin.login(username, password, success, fail)
JMessagePlugin.logout(success, fail)
```

+ 用户信息获取

```sh
JMessagePlugin.getUserInfo(success, fail)
```

+ 用户信息设置

```sh
JMessagePlugin.setUserGender(gender,success, fail)

JMessagePlugin.setUserNickname(nickname,success, fail)
```

+ 消息

发消息
```sh
JMessagePlugin.setUserGender(username, text,success, fail)
```

收消息
**iOS**
```sh
JMessagePlugin.onSingleConversationMessageReceived(data){
}
```
**Android**
```sh
function AndroidReceiveMessageCallback(message) {
  window.plugins.jmessagePlugin.ReceiveMessageObj = message;
  cordova.fireDocumentEvent('jmessage.singleReceiveMessage', null);
}
```

+ 会话
```sh
JMessagePlugin.getSingleConversationList
JMessagePlugin.deleteSingleConversation
```

历史消息

```sh
JMessagePlugin.getSingleHistoryMessage(username, from, limit, success, fail)
```


+ 初始化时设置回调

```sh
JMessagePlugin.onDeviceReady()
```




