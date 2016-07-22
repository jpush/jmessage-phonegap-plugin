# Android API

- [注册与登录](#注册与登录)
	- [register](#register)
	- [login](#login)
	- [logout](#logout)
- [用户属性维护](#用户属性维护)
	- [getUserInfo](#getuserinfo)
	- [getMyInfo](#getmyinfo)
	- [updateUserInfo](#updateuserinfo)
	- [updateMyInfo](#updatemyinfo)
	- [updateMyPassword](#updatemypassword)
	- [updateMyAvatar](#updatemyavatar)
	- [getUserAvatar](#getuseravatar)
	- [getOriginalUserAvatar](#getoriginaluseravatar)
- [发送消息](#发送消息)
	- [sendSingleTextMessage](#sendsingletextmessage)
	- [sendSingleImageMessage](#sendsingleimagemessage)
	- [sendSingleVoiceMessage](#sendsinglevoicemessage)
	- [sendSingleCustomMessage](#sendsinglecustommessage)
	- [sendGroupTextMessage](#sendgrouptextmessage)
	- [sendGroupImageMessage](#sendgroupimagemessage)
	- [sendGroupVoiceMessage](#sendgroupvoicemessage)
	- [sendGroupCustomMessage](#sendgroupcustommessage)
- [获取历史消息](#获取历史消息)
	- [getLatestMessage](#getlatestmessage)
	- [getHistoryMessages](#gethistorymessages)
	- [getAllMessages](#getallmessages)
	- [getOriginImageInSingleConversation](#getoriginimageinsingleconversation)
	- [getOriginImageInGroupConversation](#getoriginimageingroupconversation)
- [聊天会话](#聊天会话)
	- [getConversationList](#getconversationlist)
	- [exitConversation](#exitconversation)
	- [单聊](#单聊)
		- [enterSingleConversation](#entersingleconversation)
		- [getSingleConversation](#getsingleconversation)
		- [getAllSingleConversation](#getallsingleconversation)
		- [deleteSingleConversation](#deletesingleconversation)
		- [setSingleConversationUnreadMessageCount](#setsingleconversationunreadmessagecount)
	- [群聊](#群聊)
		- [enterGroupConversation](#entergroupconversation)
		- [getGroupConversation](#getgroupconversation)
		- [getAllGroupConversation](#getallgroupconversation)
		- [deleteGroupConversation](#deletegroupconversation)
		- [setGroupConversationUnreadMessageCount](#setgroupconversationunreadmessagecount)
- [黑名单](#黑名单)
	- [addUsersToBlacklist](#adduserstoblacklist)
	- [delUsersFromBlacklist](#delusersfromblacklist)
	- [getBlacklist](#getblacklist)
- [事件处理](#事件处理)
	- [消息事件](#消息事件)
		- [消息对象的 JSON 数据格式](#消息对象的-json-数据格式)
		- [jmessage.onOpenMessage](#jmessageonopenmessage)
		- [jmessage.onReceiveMessage](#jmessageonreceivemessage)
		- [jmessage.onReceiveTextMessage](#jmessageonreceivetextmessage)
		- [jmessage.onReceiveImageMessage](#jmessageonreceiveimagemessage)
		- [jmessage.onReceiveVoiceMessage](#jmessageonreceivevoicemessage)
		- [jmessage.onReceiveCustomMessage](#jmessageonreceivecustommessage)
	- [用户状态变更事件](#用户状态变更事件)
		- [jmessage.onUserPasswordChanged](#jmessageonuserpasswordchanged)
		- [jmessage.onUserLogout](#jmessageonuserlogout)
		- [jmessage.onUserDeleted](#jmessageonuserdeleted)
	- [群组事件](#群组事件)
		- [jmessage.onGroupMemberAdded](#jmessageongroupmemberadded)
		- [jmessage.onGroupMemberRemoved](#jmessageongroupmemberremoved)
		- [jmessage.onGroupMemberExit](#jmessageongroupmemberexit)


## 注册与登录
### register
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

### login
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

### logout
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
### getUserInfo
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

### getMyInfo
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


### updateUserInfo
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


### updateMyInfo
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

### updateMyPassword
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

### updateMyAvatar
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

### getUserAvatar
获取指定用户的头像缩略图。

#### 接口定义

    window.JMessage.getUserAvatar(username, successCallback, errorCallback)

#### 参数说明
- username：指定用户的用户名，如果为空，默认就为当前用户。
- successCallback：以参数形式返回图片路径。
- errorCallback：以参数形式返回错误信息。

#### 代码示例

    window.JMessage.getUserAvatar('targetUsername', function (path) {
      // Success callback.
    }, function (response) {
      // Error callback.
    })

### getOriginalUserAvatar
获取指定用户的头像原图，如果在上传用户头像时没有做约束，调用该方法可能会导致 OOM。

#### 接口定义

    window.JMessage.getOriginalUserAvatar(username, successCallback, errorCallback)

#### 参数说明
- username：指定用户的用户名，如果为空，默认就为当前用户。
- successCallback：以参数形式返回图片路径。
- errorCallback：以参数形式返回错误信息。

#### 代码示例

    window.JMessage.getOriginalUserAvatar('targetUsername', function (path) {
      // Success callback.
    }, function (response) {
      // Error callback.
    })

## 发送消息
### sendSingleTextMessage
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
			var message = JSON.parse(response)
		}, function(errorMsg) {
			console.log(errorMsg)	// 输出错误信息。
		})

### sendSingleImageMessage
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

### sendSingleVoiceMessage
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

### sendSingleCustomMessage
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

### sendGroupTextMessage
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

### sendGroupImageMessage
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

### sendGroupVoiceMessage
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

### sendGroupCustomMessage
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
### getLatestMessage
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

### getHistoryMessages
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

### getAllMessages
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
			var messages = JSON.parse(response)
		}, function(errorMsg) {
			console.log(errorMsg)	// 输出错误信息。
		})

	window.JMessage.getAllMessages('group', 'targetGroupId', null,
		function(response) {
			var messages = JSON.parse(response)
		}, function(errorMsg) {
			console.log(errorMsg)	// 输出错误信息。
		})

### getOriginImageInSingleConversation
获取指定单聊会话中的指定图片消息原图。

#### 接口定义

    window.JMessage.getOriginImageInSingleConversation(username, serverMessageId, successCallback, errorCallback)

#### 参数说明
- username：指定会话的对方用户名。
- serverMessageId：图片消息的 serverMessageId。
- successCallback：以参数形式返回图片地址。
- errorCallback：以参数形式返回错误信息。

#### 代码示例

    window.JMessage.getOriginImageInSingleConversation('username', 83708669, function (path) {
      // Success callback.
    }, function (errorMsg) {
      // Error callback.
    })

### getOriginImageInGroupConversation
获取指定群聊会话中的指定图片消息原图。

#### 接口定义

    window.JMessage.getOriginImageInGroupConversation(groupId, serverMessageId, successCallback, errorCallback)

#### 参数说明
- groupId：指定群聊会话的 Group ID。
- serverMessageId：图片消息的 serverMessageId。
- successCallback：以参数形式返回图片地址。
- errorCallback：以参数形式返回错误信息。

#### 代码示例

    window.JMessage.getOriginImageInGroupConversation(151231241, 83708669, function (path) {
      // Success callback.
    }, function (errorMsg) {
      // Error callback.
    })


## 聊天会话
### getConversationList
获取当前用户的所有会话列表。从本地数据库获得，同步返回。

#### 接口定义

	window.JMessage.getConversationList(successCallback, errorCallback)

#### 参数说明
- successCallback：发送成功的回调函数，以参数形式返回会话数组对象的 JSON 字符串。

        [
          {
            "id": "56740fc3-25e0-468d-a490-d644470d63d2", // Conversation ID
            "latestType": "最近一条消息的类型",
            "latestText": "最近一条消息的内容",
            "targetId": "目标用户的用户名",
            "title": "会话标题",
            "type": "会话类型（single / group）",
            "unReadMsgCnt": 0,  // 未读消息数
            "lastMsgDate": 1468983461848  // 最近消息的收到时间，单位为 ms
          }
        ]

- errorCallback：发送失败的回调函数，以参数形式返回错误信息。如果为 null，默认打印失败信息日志。

#### 代码示例

	window.JMessage.getConversationList(function(response) {
		var conversations = JSON.parse(response);
	}, function(errorMsg) {
		console.log(errorMsg);	// 输出错误信息。
	});

### exitConversation
退出当前会话。在退出会话界面时需要调用该函数，与 enterSingleConversation / enterGroupConversation 函数配套使用。

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
#### enterSingleConversation
进入单聊会话，调用后在收到指定会话消息时不会再弹出通知。

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


#### getSingleConversation
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


#### getAllSingleConversation
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

#### deleteSingleConversation
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

#### setSingleConversationUnreadMessageCount
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
#### enterGroupConversation
进入特定群聊会话，调用后收到指定会话消息时不会再弹出通知。

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
			console.log(errorMsg)
		})

#### getGroupConversation
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

#### getAllGroupConversation
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

#### deleteGroupConversation
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

#### setGroupConversationUnreadMessageCount
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
### addUsersToBlacklist
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

### delUsersFromBlacklist
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

### getBlacklist
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
	        "star": 0,
          "avatarPath": "/data/user/0/io.cordova.hellocordova/files/images/small-avatar/avatarName"  // 发送用户的头像缩略图。
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
	        "star": 0,
          "avatarPath": "/data/user/0/io.cordova.hellocordova/files/images/small-avatar/avatarName"  // 接收用户的头像缩略图。
	    },
	    "targetName": "",
	    "targetType": "single",
	    "version": 1,
	    "_id": 7,
	    "createTimeInMillis": 1466496463000
	}

#### jmessage.onOpenMessage
点击通知栏中的消息通知时触发。

##### 代码示例

	document.addEventListener('jmessage.onOpenMessage', function(msg) {

	}, false);

#### jmessage.onReceiveMessage
收到消息时触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveMessage', function(msg) {

	}, false);

#### jmessage.onReceiveTextMessage
收到文本消息触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveTextMessage', function(msg) {

	}, false);

#### jmessage.onReceiveImageMessage
收到图片消息触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveImagetMessage', function(msg) {

	}, false);

#### jmessage.onReceiveVoiceMessage
收到语音消息触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveVoicetMessage', function(msg) {

	}, false);

#### jmessage.onReceiveCustomMessage
收到自定义消息触发。

##### 代码示例

	document.addEventListener('jmessage.onReceiveCustomtMessage', function(msg) {

	}, false);

### 用户状态变更事件
#### jmessage.onUserPasswordChanged
当用户密码在服务器端被修改时触发。

##### 代码示例

	document.addEventListener('jmessage.onUserPasswordChanged', yourFunction, false);

#### jmessage.onUserLogout
当用户换设备登录时触发。

##### 代码示例

	document.addEventListener('jmessage.onUserLogout', yourFunction, false);

#### jmessage.onUserDeleted
当用户被删除时触发。

##### 代码示例

	document.addEventListener('jmessage.onUserDeleted', yourFunction, false);


### 群组事件
#### jmessage.onGroupMemberAdded
群成员加群时触发。

##### 代码示例

	document.addEventListener('jmessage.onGroupMemberAdded', yourFunction, false);

#### jmessage.onGroupMemberRemoved
群成员被踢时触发。

##### 代码示例

	document.addEventListener('jmessage.onGroupMemberRemoved', yourFunction, false);

#### jmessage.onGroupMemberExit
群成员退群时触发。

##### 代码示例

	document.addEventListener('jmessage.onGroupMemberExit', yourFunction, false);
