# Android API

- [注册与登录](#注册与登录)
- [用户属性维护](#用户属性维护)
- [发送消息](#发送消息)
- [获取历史消息](#获取历史消息)
- [聊天会话](#聊天会话)
	- [单聊](#单聊)
	- [群聊](#群聊)
- [黑名单](#黑名单)
- [事件处理](#事件处理)
	- [消息事件](#消息事件)
	- [用户状态变更事件](#用户状态变更事件)
	- [群组事件](#群组事件)


## 注册与登录
### API - register
用户注册。

#### 接口定义

	window.JMessage.register(username, password, successCallback, errorCallback)

#### 参数定义
- username：用户名。
- password：密码。
- successCallback：注册成功的回调函数，无返回信息。
- errorCallback：注册失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.register('username', 'password',
		function() {
			// 注册成功。
		}, function(errorStr) {
			console.log(errorStr);	// 输出错误信息。
		});

### API - login
用户登录。

#### 接口定义

	window.JMessage.login(username, password, successCallback, errorCallback)

#### 参数定义
- username：用户名。
- password：密码。
- successCallback：登录成功的回调函数，无返回信息。
- errorCallback：登录失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.login('username', 'password',
		function() {
			//  登录成功。
		}, function(errorStr) {
			console.log(errorStr);	// 输出错误信息。
		});

### API - logout
用户登出。

#### 接口定义

	window.JMessage.logout(successCallback, errorCallback)

#### 参数定义
- successCallback：登出成功的回调函数，无返回信息。
- errorCallback：登出失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.logout(function() {
			// 登出成功。
		}, function(errorStr) {
			console.log(errorStr);	// 输出错误信息。
		});


## 用户属性维护
### API - getUserInfo
获取用户信息。

#### 接口定义

	window.JMessage.getUserInfo(username, appKey, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- appKey：目标用户所属应用的 AppKey，可以使用此参数获取不同应用下的用户信息。如果为空，默认获取当前应用下的用户信息。
- successCallback：获取成功的回调函数，返回用户信息对象的 JSON 字符串。
- errorCallback：获取失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.getUserInfo('username', null,
		function(response) {
			var userInfo = JSON.parse(response);
		}, function(errorStr) {
			console.log(errorStr);	// 输出错误信息。
		});

### API - getMyInfo
获取当前用户的信息。

#### 接口定义

	window.JMessage.getMyInfo(successCallback, errorCallback)

#### 参数说明
- successCallback：获取成功的回调函数，返回当前用户信息对象的 JSON 字符串。
- errorCallback：获取失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.getMyInfo(function(response) {
		var myInfo = JSON.parse(response);
	}, function(errorStr) {
		console.log(errorStr);	// 输出错误信息。
	});


### API - updateUserInfo
更新特定用户信息。

#### 接口定义

	window.JMessage.updateUserInfo(username, appKey, userInfoField, value, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- appKey：目标用户所属应用的 AppKey，可以使用此参数获取不同应用下的用户信息。如果为空，默认获取当前应用下的用户信息。
- userInfoField：需要更新的用户信息字段。包括：
	- nickname：昵称。
	- birthday：生日。
	- signature：个性签名。
	- gender：性别。
	- region：地区。
- value：更新的值。
- successCallback：更新成功的回调函数，无返回值。
- errorCallback：更新失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	// AppKey 为 null，更新当前应用下特定用户的信息。
	window.JMessage.updateUserInfo('username', null, 'nickname', 'yourNickname',
		function() {
			// 更新成功。
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});


### API - updateMyInfo
更新当前用户信息。

#### 接口定义

	window.JMessage.updateMyInfo(userInfoField, value, successCallback, errorCallback)

#### 参数说明
- userInfoField：需要更新的用户信息字段。包括：
	- nickname：昵称。
	- birthday：生日。
	- signature：个性签名。
	- gender：性别。
	- region：地区。
- value：更新的值。
- successCallback：获取成功的回调函数，无返回值。
- errorCallback：更新失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.updateMyInfo('nickname', 'yourNickname',
		function() {
			// 更新成功。
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - updateMyPassword
更新当前用户密码。

#### 接口定义

	window.JMessage.updateMyPassword(oldPassword, newPassword, successCallback, errorCallback)

#### 参数说明
- oldPassword：更新前的密码。
- newPassword：更新后的密码。
- successCallback：更新成功的回调函数，无返回值。
- errorCallback：更新失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.updateMyPassword('oldPassword', 'newPassword',
		function() {
			// 更新成功。
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - updateMyAvatar
更新当前用户头像。

#### 接口定义

	window.JMessage.updateMyAvatar(avatarFileUrl, successCallback, errorCallback)

#### 参数说明
- avatarFileUrl：头像文件的 URL。
- successCallback：更新成功的回调函数，无返回值。
- errorCallback：更新失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.updateMyAvatar('avatarFileUrl', function() {
		// 更新成功。
	}, function(errorMsg) {
		console.log(errorMsg);
	});


## 发送消息
### API - sendSingleTextMessage
发送一条单聊文本消息。

#### 接口定义

	window.JMessage.sendSingleTextMessage(username, text, appKey, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- text：文本内容。
- appKey：目标用户所属应用的 AppKey。如果为空，默认发送给本应用下对应的用户。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.sendSingleTextMessage('username', 'content', null,
		function(response) {
			var message = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - sendSingleImageMessage
发送一条单聊图片消息。

#### 接口定义

	window.JMessage.sendSingleImageMessage(username, imageUrl, appKey, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- imageUrl：图片文件的 URL。
- appKey：目标用户所属应用的 AppKey。如果为空，默认发送给本应用下的用户。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.sendSingleImageMessage('username', 'imageUrl', null,
		function(response) {
			var message = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - sendSingleVoiceMessage
发送一条单聊语音消息。

#### 接口定义

	window.JMessage.sendSingleVoiceMessage(username, voiceFileUrl, appKey, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- voiceFileUrl：语音文件的 URL。
- appKey：目标用户所属应用的 AppKey。如果为空，默认发送给本应用下的用户。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.sendSingleVoiceMessage('username', 'voiceFileUrl', null,
		function(response) {
			var message = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - sendSingleCustomMessage
发送一条单聊自定义消息。

#### 接口定义

	window.JMessage.sendSingleCustomMessage(username, jsonStr, appKey, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- jsonStr：自定义消息要携带的数据的 JSON 字符串。
- appKey：目标用户所属应用的 AppKey。如果为空，默认发送给本应用下的用户。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.sendSingleCustomMessage('username', 'yourJsonStr', null,
		function(response) {
			var message = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - sendGroupTextMessage
发送一条群聊文本消息。

#### 接口定义

	window.JMessage.sendGroupTextMessage(username, text, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- text：文本内容。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.sendSingleTextMessage('username', 'content',
		function(response) {
			var message = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - sendGroupImageMessage
发送一条群聊图片消息。

#### 接口定义

	window.JMessage.sendGroupTextMessage(username, imageUrl, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- imageUrl：图片文件的 URL。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.sendGroupImageMessage('username', 'imageUrl',
		function(response) {
			var message = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - sendGroupVoiceMessage
发送一条群聊语音消息。

#### 接口定义

	window.JMessage.sendGroupVoiceMessage(username, voiceFileUrl, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- voiceFileUrl：语音文件的 URL。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.sendGroupVoiceMessage('username', 'voiceFileUrl',
		function(response) {
			var message = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - sendGroupCustomMessage
发送一条群聊自定义消息。

#### 接口定义

	window.JMessage.sendGroupCustomMessage(username, jsonStr, successCallback, errorCallback)

#### 参数说明
- username：用户名。
- jsonStr：自定义消息要携带的数据的 JSON 字符串。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.sendGroupCustomMessage('username', 'yourJsonStr',
		function(response) {
			var message = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

## 获取历史消息
### API - getLatestMessage
获取指定会话中最近的消息。

#### 接口定义

	window.JMessage.getLatestMessage(conversationType, value, appKey, successCallback, errorCallback)

#### 参数说明
- conversationType：会话类型。有"single", "group"两种。
- value：确定指定会话的参数。如果 conversationType 为 single，即为 username；如果为 group，则为 groupId。
- appKey：当 conversationType 为 single 时，目标用户所属应用的 AppKey。如果为空，默认获得本应用下的会话消息。
- successCallback：发送成功的回调函数，以参数形式返回消息对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.getLatestMessage('single', 'targetUsername', 'targetAppKey',
		function(response) {
			var msg = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

	window.JMessage.getLatestMessage('group', 'targetGroupId', null,
		function(response) {
			var msg = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - getHistoryMessages
获取指定会话中从新到旧的部分历史消息。

#### 接口定义

	window.JMessage.getHistoryMessages(conversationType, value, appKey, from, limit, successCallback, errorCallback)

#### 参数说明
- conversationType：会话类型。有"single"，"group"两种。
- value：确定指定会话的参数。当会话类型为 single 时，为 username；会话类型为 group 时，则为 groupId。
- appKey：当 conversationType 为 single 时，目标会话用户所属应用的 AppKey。如果为空，默认获取本应用下的会话消息。
- from：从第几条开始获取历史消息。
- limit：要获取的历史消息数量。
- successCallback：发送成功的回调函数，以参数形式返回消息数组对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	// 获取从最新消息开始的 50 条历史消息。
	window.JMessage.getHistoryMessages('single', 'targetUsername', 'targetAppKey', 0, 50,
		function(response) {
			var messages = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

	window.JMessage.getHistoryMessages('group', 'targetGroupId', null, 0, 50,
		function(response) {
			var messages = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

### API - getAllMessages
获取指定会话中的所有消息。

#### 接口定义

	window.JMessage.getAllMessages(conversationType, value, appKey, successCallback, errorCallback)

#### 参数说明
- conversationType：会话类型。有"single"，"group"两种。
- value：确定指定会话的参数。当会话类型为 single 时，为 username；会话类型为 group 时，则为 groupId。
- appKey：当 conversationType 为 single 时，目标会话用户所属应用的 AppKey。如果为空，默认获取本应用下的会话消息。
- successCallback：发送成功的回调函数，以参数形式返回消息数组对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.getAllMessages('single', 'targetUsername', 'targetAppKey',
		function(response) {
			var messages = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

	window.JMessage.getAllMessages('group', 'targetGroupId', null,
		function(response) {
			var messages = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});


## 聊天会话
### API - getConversationList
获取当前用户的所有会话列表。从本地数据库获得，同步返回。

#### 接口定义

	window.JMessage.getConversationList(successCallback, errorCallback)

#### 参数说明
- successCallback：发送成功的回调函数，以参数形式返回会话数组对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.getConversationList(function(response) {
		var conversations = JSON.parse(response);
	}, function(errorMsg) {
		console.log(errorMsg);	// 输出错误信息。
	});

### API - exitConversation
退出当前会话。在退出会话界面是需要调用该函数。

#### 接口定义

	window.JMessage.exitConversation(successCallback, errorCallback)

#### 参数说明
- successCallback：发送成功的回调函数，无返回值。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.exitConversation(function() {
		// 退出成功。
	}, function(errorMsg) {
		console.log(errorMsg);	// 输出错误信息。
	});

### 单聊
#### API - enterSingleConversation
进入单聊会话。

##### 接口定义

	window.JMessage.enterSingleConversation(username, appKey, successCallback, errorCallback)

##### 参数说明
- username：目标用户的用户名。
- appKey：目标用户所属应用的 AppKey。如果为空，默认得到本应用下特定用户的单聊会话。
- successCallback：进入成功的回调函数，无返回值。
- errorCallback：进入失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.enterSingleConversation('targetUsername', 'targetAppKey',
		function() {
			// 进入会话成功。
		}, function(errorMsg) {
			console.log(errorMsg);
		});


#### API - getSingleConversation
获取和特定目标用户的单聊会话。

##### 接口定义

	window.JMessage.getSingleConversation(username, appKey, successCallback, errorCallback)

##### 参数说明
- username：目标用户的用户名。
- appKey：目标用户所属应用的 AppKey。如果为空，默认得到本应用下特定用户的单聊会话。
- successCallback：发送成功的回调函数，以参数形式返回会话数组对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.getSingleConversation('targetUsername', 'targetAppKey',
		function(response) {
			 var singleConversation = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});


#### API - getAllSingleConversation
获取当前用户的所有单聊会话。

##### 接口定义

	window.JMessage.getAllSingleConversation(successCallback, errorCallback)

##### 参数说明
- successCallback：发送成功的回调函数，以参数形式返回会话列表的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.getAllSingleConversation(function() {
		function(response) {
			 var singleConversations = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

#### API - deleteSingleConversation
删除特定单聊会话。

##### 接口定义

	window.JMessage.deleteSingleConversation(username, appKey, successCallback, errorCallback)

##### 参数说明
- username：目标用户名。
- appKey：目标用户所属应用的 AppKey，可以使用此参数获取和不同应用下用户的单聊会话。如果为空，默认删除和当前应用下的用户单聊会话。
- successCallback：获取成功的回调函数，无返回值。
- errorCallback：获取失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.deleteSingleConversation('targetUsername', null,
		function() {
			// 删除成功
		}, function(errorMsg) {
			console.log(errorMsg);
		});

#### API - setSingleConversationUnreadMessageCount
设置指定单聊会话的未读消息数。

##### 接口定义

	window.JMessage.setSingleConversationUnreadMessageCount(username, appKey, unreadCount, successCallback, errorCallback)

##### 参数说明
- username：目标用户名。
- appKey：目标用户所属应用的 AppKey，可以使用此参数获取和不同应用下用户的单聊会话。如果为空，默认删除和当前应用下的用户单聊会话。
- unreadCount：未读消息数。
- successCallback：设置成功的回调函数，无返回值。
- errorCallback：设置失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.setSingleConversationUnreadMessageCount('targetUsername', 'targetAppKey', 10,
		function() {
			// 设置成功。
		}, function(errorMsg) {
			console.log(errorMsg);
		});


### 群聊
#### API - enterGroupConversation
进入特定群聊会话。

##### 接口定义

	window.JMessage.enterGroupConversation(groupId, successCallback, errorCallback)

##### 参数说明
- groupId：目标群组 ID。
- successCallback：获取成功的回调函数，无返回值。
- errorCallback：获取失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.enterGroupConversation('targetGroupId',
		function() {
			// 进入会话成功。
		}, function(errorMsg) {
			console.log(errorMsg);
		});

#### API - getGroupConversation
获取和特定群组的群聊会话。

##### 接口定义

	window.JMessage.getGroupConversation(groupId, successCallback, errorCallback)

##### 参数说明
- groupId：群组 ID。
- successCallback：发送成功的回调函数，以参数形式返回会话对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.getGroupConversation('targetGroupId',
		function(response) {
			var groupConversation = JSON.parse(reponse);
		}, function(errorMsg) {
			console.log(errorMsg);	// 输出错误信息。
		});

#### API - getAllGroupConversation
获取当前用户所有的群聊会话。

##### 接口定义

	window.JMessage.getAllGroupConversation(successCallback, errorCallback)

##### 参数说明
- successCallback：发送成功的回调函数，以参数形式返回会话列表对象的 JSON 字符串。
- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.getAllGroupConversation(function(response) {
		var groupConversations = JSON.parse(response);
	}, function(errorMsg) {
		console.log(errorMsg);
	});

#### API - deleteGroupConversation
删除指定的群聊会话。

##### 接口定义

	window.JMessage.deleteGroupConversation(groupId, successCallback, errorCallback)

##### 参数说明
- groupId：群组 ID。
- successCallback：删除成功的回调函数，无返回值。
- errorCallback：删除失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.deleteGroupConversation('targetGroupId',
		function() {

		}, function(errorMsg) {
			console.log(errorMsg);
		});

#### API - setGroupConversationUnreadMessageCount
设置指定单聊会话的未读消息数。

##### 接口定义

	window.JMessage.setGroupConversationUnreadMessageCount(groupId, unreadCount, successCallback, errorCallback)

##### 参数说明
- groupId：群组 ID。
- unreadCount：未读消息数。
- successCallback：设置成功的回调函数，无返回值。
- errorCallback：设置失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

##### 代码示例

	window.JMessage.setGroupConversationUnreadMessageCount('targetGroupId', 10,
		function() {
			// 设置成功。
		}, function(errorMsg) {
			console.log(errorMsg);
		});


## 黑名单
### API - addUsersToBlacklist
将用户添加进黑名单。

#### 接口定义

	window.JMessage.addUsersToBlacklist(usernamesStr, successCallback, errorCallback)

#### 参数说明
- usernamesStr：用户名字符串。形如："username1, username2"。
- successCallback：添加成功的回调函数，无返回值。
- errorCallback：添加失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.addUsersToBlacklist('username1, username2',
		function() {
			// 添加成功。
		}, function(errorMsg) {
			console.log(errorMsg);
		});

### API - delUsersFromBlacklist
从当前用户的黑名单中删除部分用户。

#### 接口定义

	window.JMessage.delUsersFromBlacklist(usernamesStr, successCallback, errorCallback)

#### 参数说明
- usernamesStr：用户名字符串。形如："username1, username2"。
- successCallback：删除成功的回调函数，无返回值。
- errorCallback：删除失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.delUsersFromBlacklist('username1, username2',
		function() {
			// 删除成功。
		}, function(errorMsg) {
			console.log(errorMsg);
		});

### API - getBlacklist
获取当前用户的黑名单。

#### 接口定义

	window.JMessage.getBlacklist(successCallback, errorCallback)

#### 参数说明
- successCallback：操作成功的回调函数，以参数形式返回黑名单用户信息列表的 JSON 格式字符串。
- errorCallback：操作失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.getBlacklist(function(response) {
			var userInfos = JSON.parse(response);
		}, function(errorMsg) {
			console.log(errorMsg);
		});


## 事件处理
### 消息事件
#### 消息对象的 JSON 数据格式

	{
	    "content": {
	        "text": "content",
	        "booleanExtras": { },
	        "contentType": "text",
	        "extras": {
	            "a": { }
	        },
	        "numExtras": { },
	        "stringExtras": { }
	    },
	    "contentType": "text",
	    "createTimeInSeconds": 1466496463,
	    "direct": "receive",
	    "fromAppkey": "fromUserAppKey",
	    "fromID": "fromUserID",
	    "fromName": "fromUsername",
	    "fromType": "user",
	    "fromUser": {
	        "address": "",
	        "appkey": "yourAppKey",
	        "birthday": "",
	        "gender": "0",
	        "mGender": "male",
	        "nickname": "targetNickname",
	        "noteText": "",
	        "notename": "",
	        "region": "",
	        "signature": "",
	        "userName": "testUsername",
	        "userID": testUserID,
	        "blacklist": 0,
	        "noDisturb": 0,
	        "star": 0
	    },
	    "from_platform": "a",
	    "msgTypeString": "text",
	    "serverMessageId": 73511240,
	    "status": "receive_success",
	    "targetAppkey": "targetAppkey",
	    "targetID": "targetUserId",
	    "targetInfo": {
	        "address": "",
	        "appkey": "targetAppKey",
	        "birthday": "",
	        "gender": "0",
	        "mGender": "female",
	        "nickname": "testNickname",
	        "noteText": "",
	        "notename": "",
	        "region": "",
	        "signature": "",
	        "userName": "testUsername",
	        "userID": testUserID,
	        "blacklist": 0,
	        "noDisturb": 0,
	        "star": 0
	    },
	    "targetName": "",
	    "targetType": "single",
	    "version": 1,
	    "_id": 7,
	    "createTimeInMillis": 1466496463000
	}

#### API - jmessage.onOpenMessage
点击通知栏中的消息通知时触发。

##### 代码示例

	document.addEventListener('jmessage.onOpenMessage', function() {
		var msg = window.JMessage.openedMessage;
	}, false);

#### API - jmessage.onReceiveMessage
收到消息时触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveMessage', function() {
		var msg = window.JMessage.message;
	}, false);

#### API - jmessage.onReceiveTextMessage
收到文本消息触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveTextMessage', function() {
		var msg = window.JMessage.textMessage;
	}, false);

#### API - jmessage.onReceiveImageMessage
收到图片消息触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveImagetMessage', function() {
		var msg = window.JMessage.imageMessage;
	}, false);

#### API - jmessage.onReceiveVoiceMessage
收到语音消息触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveVoicetMessage', function() {
		var msg = window.JMessage.voiceMessage;
	}, false);

#### API - jmessage.onReceiveCustomMessage
收到自定义消息触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveCustomtMessage', function() {
		var msg = window.JMessage.customMessage;
	}, false);

### 用户状态变更事件
#### API - jmessage.onUserPasswordChanged
当用户密码在服务器端被修改时触发。

##### 代码示例

	document.addEventListener('jmessage.onUserPasswordChanged', yourFunction, false);

#### API - jmessage.onUserLogout
当用户换设备登录时触发。

##### 代码示例

	document.addEventListener('jmessage.onUserLogout', yourFunction, false);

#### API - jmessage.onUserDeleted
当用户被删除时触发。

##### 代码示例

	document.addEventListener('jmessage.onUserDeleted', yourFunction, false);


### 群组事件
#### API - jmessage.onGroupMemberAdded
群成员加群时触发。

##### 代码示例

	document.addEventListener('jmessage.onGroupMemberAdded', yourFunction, false);

#### API - jmessage.onGroupMemberRemoved
群成员被踢时触发。

##### 代码示例

	document.addEventListener('jmessage.onGroupMemberRemoved', yourFunction, false);

#### API - jmessage.onGroupMemberExit
群成员退群时触发。

##### 代码示例

	document.addEventListener('jmessage.onGroupMemberExit', yourFunction, false);
