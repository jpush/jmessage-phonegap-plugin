## iOS API 说明
JPush 推送功能相关 API 说明可参照 [JPush Phonegap Plugin iOS API doc](https:## github.com/jpush/jpush-phonegap-plugin/blob/master/doc/iOS_API.md)


API 统一说明：

- iOS 中跨应用接口均以 `cross_` 开头，需要传有效的 `appkey`，其余方法的 `appkey` 参数一律传 `null`
- 参数 `successCallback`、`errorCallback` 分别为成功、失败回调
- 参数名为 `xxxArray` 则传数组，其余无特殊说明传字符串
- 调用示例：`window.JMessage.funcName(args, successCallback, errorCallback);`



API 目录：

- [用户操作](#user)
- [发送消息](#message)
- [会话操作](#conversation)
- [群组操作](#group)
- [跨应用接口](#cross-app-method)
 

## User

### API - register
新用户注册
#### 接口定义
	window.JMessage.register(username, password, successCallback, errorCallback);

### API - login
用户登录
#### 接口定义
	window.JMessage.login(username, password, successCallback, errorCallback);
	
### API - logout
当前用户退出登录
#### 接口定义
	window.JMessage.logout(successCallback, errorCallback);
	
### API - getMyInfo
获取我的信息（当前登录用户）
#### 接口定义
	window.JMessage.getMyInfo(successCallback, errorCallback);
	
### API - getUserInfo
获取某用户的信息
#### 接口定义
	window.JMessage.getUserInfo(username,successCallback, errorCallback);
	
### API - getUserInfoArray
获取用户详情（批量接口）
#### 接口定义
	window.JMessage.getUserInfoArray(successCallback, errorCallback);
	
### API - updateMyPassword
更新密码（当前登录用户）
#### 接口定义
	window.JMessage.getMyInfo(oldPwd, newPwd, errorCallback);
	
### API - updateMyInfo
获取我的信息（当前登录用户）
#### 接口定义
	window.JMessage.getMyInfo(field, value, successCallback, errorCallback);
#### 参数说明
- field：数字、或纯数字字符串

		/// 用户信息字段: 用户名
		kJMSGUserFieldsNickname = 0,
		/// 用户信息字段: 生日
		kJMSGUserFieldsBirthday = 1,
		/// 用户信息字段: 签名
		kJMSGUserFieldsSignature = 2,
		/// 用户信息字段: 性别
		kJMSGUserFieldsGender = 3,
		/// 用户信息字段: 区域
		kJMSGUserFieldsRegion = 4,
		/// 用户信息字段: 头像 (内部定义的 media_id)
		kJMSGUserFieldsAvatar = 5,



## Message

### API - sendSingleTextMessage
发送单聊文本消息
#### 接口定义
	window.JMessage.sendSingleTextMessage(username, text, appKey, successCallback, errorCallback);
	
### API - sendSingleVoiceMessage
发送单聊语音消息
#### 接口定义
	window.JMessage.sendSingleTextMessage(username, text, appKey, successCallback, errorCallback);
	
### API - sendSingleImageMessage
发送单聊图片消息
#### 接口定义
	window.JMessage.getMyInfosendSingleImageMessage(username, imageUrl, appKey, successCallback, errorCallback);

### API - sendGroupTextMessage
发送群聊文本消息
#### 接口定义
	window.JMessage.sendGroupTextMessage(groupId, text, successCallback, errorCallback);
	
### API - sendGroupVoiceMessage
发送群聊语音消息
#### 接口定义
	window.JMessage.sendGroupVoiceMessage (username, fileUrl, successCallback, errorCallback);
	
### API - sendGroupImageMessage
发送群聊图片消息
#### 接口定义
	window.JMessage.sendGroupImageMessage (groupId, imageUrl, successCallback, errorCallback);


## Conversation

### API - getSingleConversationHistoryMessage
获取多条单聊消息（同步接口）
#### 接口定义
	window.JMessage.getSingleConversationHistoryMessage(username, from, limit, successCallback, errorCallback);
#### 参数说明
- offset：开始的位置，null 表示从最初开始
- limit：获取的数量，null 表示不限
- 例：
	- offset = nil, limit = nil，表示获取全部。相当于 allMessages
	- offset = nil, limit = 100，表示从最新开始取 100 条记录
	- offset = 100, limit = nil，表示从最新第 100 条开始，获取余下所有记录
	
### API - getAllSingleConversation
获取全部单聊会话信息
#### 接口定义
	window.JMessage.getAllSingleConversation(successCallback, errorCallback);
	
### API - deleteSingleConversation
删除单聊会话。除了删除会话本身，还会删除该会话下所有的聊天消息。
#### 接口定义
	window.JMessage.deleteSingleConversation(username, appKey, successCallback, errorCallback);

### API - getGroupConversationHistoryMessage
获取多条群聊消息（同步接口）。参数同 [获取多条单聊消息](#api---getsingleconversationhistorymessage)
#### 接口定义
	window.JMessage.getGroupConversationHistoryMessage(username, from, limit, successCallback, errorCallback);
	
### API - getAllGroupConversation
获取全部群聊会话信息
#### 接口定义
	window.JMessage.getAllGroupConversation(successCallback, errorCallback);
	
### API - deleteGroupConversation
删除群聊会话
#### 接口定义
	window.JMessage.deleteGroupConversation(groupId, successCallback, errorCallback);

### API - getAllConversation
获取全部单聊、群里会话信息
#### 接口定义
	window.JMessage.getAllConversation(successCallback, errorCallback);


## Group

### API - createGroupIniOS
创建群组
#### 接口定义
	window.JMessage.createGroupIniOS(name, desc, memebersArray, successCallback, errorCallback);
	
### API - updateGroupInfo
修改群组信息
#### 接口定义
	window.JMessage.updateGroupInfo(groupId, name, desc, successCallback, errorCallback);
#### 参数说明
- name：新名称
- desc：新描述
	
### API - getGroupInfo
获取群组详情（不包含群组成员）
#### 接口定义
	window.JMessage.getGroupInfo(groupId, successCallback, errorCallback);
	
### API - myGroupArray
获取我的群组列表
#### 接口定义
	window.JMessage.myGroupArray(groupId, successCallback, errorCallback);
	
### API - memberArray
获取当前群组成员列表
#### 接口定义
	window.JMessage.memberArray(groupId, successCallback, errorCallback);
	
### API - addMembers
添加群组成员
#### 接口定义
	window.JMessage.addMembers(memberArray, successCallback, errorCallback) ;

### API - removeMembers
删除群组成员
#### 接口定义
	window.JMessage.removeMembers(memberArray, successCallback, errorCallback);
	
### API - exitGroup
退出群组（当前用户）
#### 接口定义
	window.JMessage.exitGroup(groupId, successCallback, errorCallback);


## Cross App method

### API - cross_sendSingleTextMessage
发送跨应用单聊文本消息
#### 接口定义
	window.JMessage.cross_sendSingleTextMessage = function (username, appKey, text, successCallback, errorCallback);
	
### API - cross_sendSingleVoiceMessage
发送跨应用单聊语音消息
#### 接口定义
	window.JMessage.cross_sendSingleVoiceMessage = function (username, appKey, fileUrl, successCallback, errorCallback);
	
### API - cross_sendSingleImageMessage
发送跨应用单聊图片消息
#### 接口定义
	window.JMessage.cross_sendSingleImageMessage = function (username, appKey, imageUrl, successCallback, errorCallback);
	
### API - cross_getSingleConversationHistoryMessage
获取跨应用单聊历史消息（多条）。参数同 [获取多条单聊消息](#api---getsingleconversationhistorymessage)
#### 接口定义
	window.JMessage.cross_getSingleConversationHistoryMessage = function (username, appKey, from, limit, successCallback, errorCallback);
	
### API - cross_deleteSingleConversation
删除跨应用单聊会话
#### 接口定义
	window.JMessage.cross_deleteSingleConversation = function (username, appKey, successCallback, errorCallback);

### API - cross_getUserInfoArray
批量获取跨应用用户信息
#### 接口定义
	window.JMessage.cross_getUserInfoArray = function (nameArray, appKey, successCallback, errorCallback);


