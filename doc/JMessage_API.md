
# JMessage-API

JMessage API 在文件 JMessagePlugin.js 中定义

####初始化
```
JMessagePlugin.init()
```

####注册
```
JMessagePlugin.register(username, password, success, fail)
```

####登录 登出
```
JMessagePlugin.login(username, password, success, fail)
JMessagePlugin.logout(success, fail)
```

####用户信息获取

```
JMessagePlugin.getUserInfo(success, fail)
```

####用户信息设置

```
JMessagePlugin.setUserGender(gender, success, fail)

JMessagePlugin.setUserNickname(nickname, success, fail)
```


####发消息
```
JMessagePlugin.setUserGender(username, text, success, fail)
```

####收消息

	
	JMessagePlugin.onReceivedSingleConversationMessage(data) {	
		cordova.fireDocumentEvent('jmessage.singleReceiveMessage', data)
	}
	


####会话列表
```
JMessagePlugin.getSingleConversationList(success, fail)   
```
####删除会话
```
JMessagePlugin.deleteSingleConversation(username, success, fail)
```
####历史消息

```
JMessagePlugin.getSingleHistoryMessage(username, from, limit, success, fail)
```







