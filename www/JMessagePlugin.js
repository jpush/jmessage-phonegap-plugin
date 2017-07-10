var exec = require('cordova/exec')

var PLUGIN_NAME = 'JMessagePlugin'

/**
 * 针对消息发送动作的控制选项，可附加在消息发送方法的参数中。
 */
var MessageSendingOptions = {
  /**
   * 接收方是否针对此次消息发送展示通知栏通知。
   * @type {boolean}
   * @defaultvalue
   */
  isShowNotification: true,
  /**
   * 是否让后台在对方不在线时保存这条离线消息，等到对方上线后再推送给对方。
   * @type {boolean}
   * @defaultvalue
   */
  isRetainOffline: true,
  /**
   * 是否开启了自定义接收方通知栏功能。
   * @type {?boolean}
   */
  isCustomNotificationEnabled: null,
  /**
   * 设置此条消息在接收方通知栏所展示通知的标题。
   * @type {?string}
   */
  notificationTitle: null,
  /**
   * 设置此条消息在接收方通知栏所展示通知的内容。
   * @type {?string}
   */
  notificationText: null
}

var JMessagePlugin = {
  /**
   * @param {object} params - {'isOpenMessageRoaming': boolean} // 是否开启消息漫游。
   * 打开消息漫游之后，用户多个设备之间登录时，SDK 会自动将当前登录用户的历史消息同步到本地。
   */
  init: function (params) {
    exec(null, null, PLUGIN_NAME, 'init', [params])
  },
  /**
  * 设置是否开启 debug 模式，开启后 SDK 将会输出更多日志信息。应用对外发布时应关闭。
  *
  * @param {object} params - {'enable': boolean}
  */
  setDebugMode: function (params) {
    exec(null, null, PLUGIN_NAME, 'setDebugMode', [params])
  },
  /**
   * @param {object} params - {'username': '', 'password': ''}
   * @param {function} success - function () {}
   * @param {function} error - function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  register: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'userRegister', [params])
  },
  /**
   * @param {object} params - {'username': '', 'password': ''}
   * @param {function} success - function () {}
   * @param {function} error - function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  login: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'userLogin', [params])
  },
  /**
   * 用户登出接口，调用后用户将无法收到消息。登出动作必定成功，开发者不需要关心结果回调。
   *
   * @param {function} success - function () {}
   */
  logout: function () {
    exec(null, null, PLUGIN_NAME, 'userLogout', [])
  },
  /**
   * 登录成功则返回用户信息，已登出或未登录则对应用户信息为 null。
   *
   * @param {function} success - function (myInfo) {}
   */
  getMyInfo: function (success) {
    exec(success, null, PLUGIN_NAME, 'getMyInfo', [])
  },
  /**
   * 获取用户信息，此接口可用来获取不同 appKey 下用户的信息，如果 appKey 为空，则默认获取当前 appKey 下的用户信息。
   *
   * @param {object} params - {'username': '', 'appKey': ''}
   * @param {function} success - function (userInfo) {}
   * @param {function} error - function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getUserInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getUserInfo', [params])
  },
  /**
   * @param {object} params - {'oldPwd': '', 'newPwd': ''}
   */
  updateMyPassword: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateMyPassword', [params])
  },
  /**
   * 更新当前登录用户的信息。
   *
   * @param {object} params - {'field': '需要更新的字段值'}
   *  field 包括：nickname（昵称）, birthday（生日）, signature（签名）, gender（性别）, region（地区）。
   * 如：{
   *  'birthday': '生日日期的微秒数'
   *  'gender': 'male / female / unknow'
   * }
   * @param {function} success - function () {}
   * @param {function} error - function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateMyInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateMyInfo', [params])
  },
  /**
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '',
   *  'username': '',
   *  'appKey': '',
   *  'text': '',
   *  'extras': {},                // 附加信息
   *  'messageSendingOptions': {}  // MessageSendingOptions 对象
   * }
   */
  sendTextMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendTextMessage', [params])
  },
  /**
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '',
   *  'username': '',
   *  'appKey': '',
   *  'path': '',                  // 图片路径
   *  'extras': {},
   *  'messageSendingOptions': {}  // Optional. MessageSendingOptions 对象
   * }
   */
  sendImageMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendImageMessage', [params])
  },
  /**
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '',
   *  'username': '',
   *  'appKey': '',
   *  'path': '',                  // 图片路径
   *  'extras': {},
   *  'messageSendingOptions': {}  // Optional. MessageSendingOptions 对象
   * }
   */
  sendVoiceMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendVoiceMessage', [params])
  },
  /**
   * @param {object} params - {'type': 'single / group', 'groupId': '', 'username': '', 'appKey': '', 'customObject': {}}
   */
  sendCustomMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendCustomMessage', [params])
  },
  /**
   * @param {object} params - {
   *  'type': 'single / group', // 对象类型（single 或 group）
   *  'groupId': '',            // 当 type = group 时，groupId 不能为空
   *  'username': '',           // 当 type = single 时，username 不能为空
   *  'appKey': '',             // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用
   *  'latitude': '',           // 纬度信息
   *  'longitude': '',          // 经度信息
   *  'scale': '',              // 地图缩放比例
   *  'address': '',            // 详细地址信息
   *  'extras': {'key1': 'value1', 'key2': 'value2'}  // 附加信息对象
   * }
   */
  sendLocationMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendLocationMessage', [params])
  },
  /**
   * @param {object} params - {'type': 'single', 'groupId': '', 'username': '', 'appKey': '', 'path': '', 'filename': '', 'extras', ''}
   */
  sendFileMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendFileMessage', [params])
  },
  /**
   * 当 from = 0 && limit = -1 时，返回所有历史消息。
   *
   * @param {object} params - {'type': 'single', 'groupId': '', 'username': '', 'appKey': '', 'from': 0, 'limit': 10}
   * @param {function} success - function (messageArray)) {}  // 以参数形式返回历史消息对象数组
   */
  getHistoryMessages: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getHistoryMessages', [params])
  },
  /**
   * @param {object} params - {'username': '对方用户名', 'appKey': '对方 AppKey', 'reason': ''}
   */
  sendInvitationRequest: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendInvitationRequest', [params])
  },
  /**
   * @param {object} params - {'username': '对方用户名', 'appKey': '对方 AppKey'}
   */
  acceptInvitation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'acceptInvitation', [params])
  },
  /**
   * @param {object} params - {'username': '对方用户名', 'appKey': '对方 AppKey', 'reason': '拒绝理由'}
   */
  declineInvitation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'declineInvitation', [params])
  },
  /**
   * @param {object} params - {'username': '好友用户名', 'appKey': '好友 AppKey'}
   */
  removeFromFriendList: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeFromFriendList', [params])
  },
  /**
   * @param {object} params - {'username': '好友用户名', 'appKey': '好友 AppKey', noteName: '备注名'}
   */
  updateFriendNoteName: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateFriendNoteName', [params])
  },
  /**
   * @param {object} params - {'username': '好友用户名', 'appKey': '好友 AppKey', 'noteText': '备注信息'}
   */
  updateFriendNoteText: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateFriendNoteText', [params])
  },
  /**
   * @param {function} success - function (friendArr) {}  // 以参数形式返回好友对象数组
   */
  getFriends: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getFriends', [])
  },
  /**
   * 创建群组，创建成功后，创建者默认会包含在群成员中。
   *
   * @param {object} params - {
   *  'name': '群组名称',
   *  'desc': '群组描述',
   *  'usernameArray': [待添加的用户名数组]
   * }
   * @param {function} success - function (groupId) {}  // 以参数形式返回 group id
   */
  createGroup: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'createGroup', [params])
  },
  /**
   * 获取当前用户所有所在的群组 id。
   *
   * @param {function} success - function (groupIdArr) {} // 以参数形式返回 group id 数组
   */
  getGroupIds: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupIds', [])
  },
  /**
   * @param {object} params - {'id': '群组 id'}
   * @param {function} success - function (groupInfo) {} // 以参数形式返回群组信息对象
   */
  getGroupInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupInfo', [params])
  },
  /**
   * @param {object} params - {'id': '群组 id', 'newName': '新群组名称', 'newDesc': '新群组介绍'}
   */
  updateGroupInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateGroupInfo', [params])
  },
  /**
   * @param {object} params - {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待添加用户所在应用的 appKey'}
   */
  addGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'addGroupMembers', [params])
  },
  /**
   * @param {object} params - {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待删除用户所在应用的 appKey'}
   */
  removeGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeGroupMembers', [params])
  },
  /**
   * @param {object} params - {'id': '群组 id'}
   */
  exitGroup: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'exitGroup', [params])
  },
  /**
   * @param {object} params - {'id': '群组 id'}
   * @param {function} success - function (usernameArray) {} // 以参数形式返回用户名数组
   */
  getGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupMembers', [params])
  },
  /**
   * @param {object} params - {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
   */
  addUsersToBlacklist: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'addUsersToBlacklist', [params])
  },
  /**
   * @param {object} params - {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
   */
  removeUsersFromBlacklist: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeUsersFromBlacklist', [params])
  },
  /**
   * @param {function} success - function (userInfoArray) {} // 以参数形式返回黑名单中的用户信息数组
   */
  getBlacklist: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getBlacklist', [])
  },
  /**
   * @param {object} params - {'username': '目标用户名', 'appKey': '目标用户 AppKey'}
   * @param {function} success - function (isInBlackList) {} // 以参数形式（bool 类型）返回目标用户是否在黑名单中
   */
  isInBlacklist: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'isInBlacklist', [params])
  },
  /**
   * 设置某个用户或群组是否免打扰。
   *
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '目标群组 ID',
   *  'username': '目标用户名',
   *  'appKey': '目标用户所属 appKey',
   *  'isNoDisturb': boolean
   * }
   */
  setNoDisturb: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'setNoDisturb', [params])
  },
  /**
   * 获取免打扰用户和群组名单。
   *
   * @param {function} success - function ({userInfoArray: [], groupInfoArray: []}) {}  // 以参数形式返回用户信息对象数组
   */
  getNoDisturbList: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getNoDisturbList', [])
  },
  /**
   * 设置是否全局免打扰。
   *
   * @param {object} params - {'isNoDisturb': boolean}
   */
  setNoDisturbGlobal: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'setNoDisturbGlobal', [params])
  },
  /**
   * 判断当前是否全局免打扰。
   *
   * @param {function} success - function (isNoDisturb) {} // 以参数形式返回结果
   */
  isNoDisturbGlobal: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'isNoDisturbGlobal', [])
  },
  /**
   * 下载用户头像原图。
   *
   * @param {object} params - {'username': '目标用户名', 'appKey': '目标用户 AppKey'}
   * @param {function} success - function ('imagePath') {}
   */
  downloadOriginalUserAvatar: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadOriginalUserAvatar', [params])
  },
  /**
   * 下载指定图片消息的原图。
   *
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '目标群组会话的 group id',
   *  'username': '目标单聊会话的用户名',
   *  'appKey': '目标单聊用户所属 appKey',
   *  'messageId': '指定消息 id'
   * }
   * @param {function} success - function (imageMessage) {}  // 以参数形式返回消息对象，可用 imageMessage.originPath 获得原图路径。
   */
  downloadOriginalImage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadOriginalImage', [params])
  },
  /**
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '目标群组会话的 group id',
   *  'username': '目标单聊会话的用户名',
   *  'appKey': '目标单聊用户所属 appKey',
   *  'messageId': '指定消息 id'
   * }
   * @param {function} success - function (voiceMessage) {}  // 以参数形式返回消息对象，可用 voiceMessage.path 获得录音文件路径。
   */
  downloadVoiceFile: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadVoiceFile', [params])
  },
  /**
   * 下载文件消息文件。
   *
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '目标群组会话的 group id',
   *  'username': '目标单聊会话的用户名',
   *  'appKey': '目标单聊用户所属 appKey',
   *  'messageId': '指定消息 id'
   * }
   * @param {function} success - function (fileMessage) {}  // 以参数形式返回消息对象，可用 fileMessage.path 获得文件路径。
   */
  downloadFile: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadFile', [params])
  },
  /**
   * 创建聊天会话。
   *
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '目标群组 id',
   *  'username': '目标用户名',
   *  'appKey': '目标用户所属 appKey'
   * }
   * @param {function} success - function (conversation) {} // 以参数形式返回聊天会话对象。
   */
  createConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'createConversation', [params])
  },
  /**
   * 删除聊天会话，同时会删除本地聊天记录。
   *
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '目标群组 id',
   *  'username': '目标用户名',
   *  'appKey': '目标用户所属 appKey'
   * }
   */
  deleteConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'deleteConversation', [params])
  },
  /**
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '目标群组 id',
   *  'username': '目标用户名',
   *  'appKey': '目标用户所属 appKey'
   * }
   * @param {function} success - function (conversation) {} // 以参数形式返回聊天会话对象。
   */
  getConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getConversation', [params])
  },
  /**
   * @param {object} params - {type: 'single / group or all'}
   * @param {function} success - function ({'single': [], 'group': []}) {}  // 以参数形式返回会话对象数组。
   */
  getConversations: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getConversations', [params])
  },
  /**
   * 重置单个会话的未读消息数。
   *
   * @param {object} params - {
   *  'type': 'single / group',
   *  'groupId': '目标群组 id',
   *  'username': '目标用户名',
   *  'appKey': '目标用户所属 appKey',
   * }
   */
  resetUnreadMessageCount: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'resetUnreadMessageCount', [params])
  },
  /**
   * @param {object} msg - {
   *  'id': '',
   *  'from': {}    // 消息发送者信息对象
   *  'target': {}  // 消息接收方信息（可能是用户或者群组）
   *  'type': 'text / image / voice / location / file / custom / event'
   *  // 不同类型还有其他对应的相关字段，具体可参考文档。
   * }
   */
  onReceiveMessage: function (msg) {
    msg = JSON.stringify(msg)
    msg = JSON.parse(msg)
    cordova.fireDocumentEvent('jmessage.onReceiveMessage', msg)
  },
  onClickMessageNotification: function (msg) {
    msg = JSON.stringify(msg)
    msg = JSON.parse(msg)
    cordova.fireDocumentEvent('jmessage.onClickMessageNotification', msg)
  },
  /**
   * 同步离线消息。
   */
  onSyncOfflineMessage: function (offlineMessageArray) {
    offlineMessageArray = JSON.stringify(offlineMessageArray)
    offlineMessageArray = JSON.parse(offlineMessageArray)
    cordova.fireDocumentEvent('jmessage.onSyncOfflineMessage', offlineMessageArray)
  },
  /**
   * 同步漫游消息。
   */
  onSyncRoamingMessage: function (messageArray) {
    messageArray = JSON.stringify(messageArray)
    messageArray = JSON.parse(messageArray)
    cordova.fireDocumentEvent('jmessage.onSyncRoamingMessage', messageArray)
  },
  /**
   * 登录状态变更。
   *
   * @param {object} event - {
   *  'type': 'user_password_change / user_logout / user_deleted'
   *  'reason': ''   // 变更的原因,
   *  'userInfo': '' // 变更的账户信息
   * }
   */
  onLoginStateChanged: function (event) {
    event = JSON.stringify(event)
    event = JSON.parse(event)
    cordova.fireDocumentEvent('jmessage.onLoginStateChanged', event)
  },
  /**
   * 好友相关通知事件。
   *
   * @param {object} event - {
   *  'type': 'invite_received / invite_accepted / invite_declined / contact_deleted',
   *  'reason': ''          // 事件发生的理由，该字段由对方发起请求时所填，对方如果未填则将返回默认字符串。
   *  'fromUsername': ''    // 事件发送者的 username
   *  'fromUserAppKey': ''  // 事件发送者的 appKey
   * }
   */
  onContactNotify: function (event) {
    event = JSON.stringify(event)
    event = JSON.parse(event)
    cordova.fireDocumentEvent('jmessage.onContactNotify', event)
  }
}

module.exports = JMessagePlugin
