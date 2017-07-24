var exec = require('cordova/exec')

var PLUGIN_NAME = 'JMessagePlugin'

/**
 * 针对消息发送动作的控制选项，可附加在消息发送方法的参数中。
 */
var MessageSendingOptions = {
  /**
   * 接收方是否针对此次消息发送展示通知栏通知。
   * @type {Boolean}
   * @defaultvalue
   */
  isShowNotification: true,
  /**
   * 是否让后台在对方不在线时保存这条离线消息，等到对方上线后再推送给对方。
   * @type {Boolean}
   * @defaultvalue
   */
  isRetainOffline: true,
  /**
   * 是否开启了自定义接收方通知栏功能。
   * @type {?Boolean}
   */
  isCustomNotificationEnabled: null,
  /**
   * 设置此条消息在接收方通知栏所展示通知的标题。
   * @type {?String}
   */
  notificationTitle: null,
  /**
   * 设置此条消息在接收方通知栏所展示通知的内容。
   * @type {?String}
   */
  notificationText: null
}

var JMessagePlugin = {
  /**
   * @param {object} params = {
   *  'isOpenMessageRoaming': Boolean,  // 是否开启消息漫游。
   *  'isProduction': Boolean           // 是否为生产环境（仅 iOS 有效）。
   * }
   *
   * 打开消息漫游之后，用户多个设备之间登录时，SDK 会自动将当前登录用户的历史消息同步到本地。
   */
  init: function (params) {
    JMessagePlugin.handlers = {
      'receiveMessage': [],
      'clickMessageNotification': [],
      'syncOfflineMessage': [],
      'syncRoamingMessage': [],
      'loginStateChanged': [],
      'contactNotify': [],
      'retractMessage': []
    }

    var success = function (result) {
      if (!JMessagePlugin.handlers.hasOwnProperty(result.eventName)) {
        return
      }

      for (var index in JMessagePlugin.handlers[result.eventName]) {
        JMessagePlugin.handlers[result.eventName][index].apply(undefined, [result.value])
      }
    }
    exec(success, null, PLUGIN_NAME, 'init', [params])
  },
  /**
  * 设置是否开启 debug 模式，开启后 SDK 将会输出更多日志信息。应用对外发布时应关闭。
  *
  * @param {object} params = {'enable': Boolean}
  */
  setDebugMode: function (params) {
    exec(null, null, PLUGIN_NAME, 'setDebugMode', [params])
  },
  /**
   * @param {object} params = {'username': String, 'password': String}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  register: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'userRegister', [params])
  },
  /**
   * @param {object} params = {'username': String, 'password': String}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  login: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'userLogin', [params])
  },
  /**
   * 用户登出接口，调用后用户将无法收到消息。登出动作必定成功，开发者不需要关心结果回调。
   *
   * @param {function} success = function () {}
   */
  logout: function () {
    exec(null, null, PLUGIN_NAME, 'userLogout', [])
  },
  /**
   * 登录成功则返回用户信息，已登出或未登录则对应用户信息为 null。
   *
   * @param {function} success = function (myInfo) {}
   */
  getMyInfo: function (success) {
    exec(success, null, PLUGIN_NAME, 'getMyInfo', [])
  },
  /**
   * 获取用户信息，此接口可用来获取不同 appKey 下用户的信息，如果 appKey 为空，则默认获取当前 appKey 下的用户信息。
   *
   * @param {object} params = {'username': String, 'appKey': String}
   * @param {function} success = function (userInfo) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getUserInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getUserInfo', [params])
  },
  /**
   * @param {object} params = {'oldPwd': String, 'newPwd': String}
   */
  updateMyPassword: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateMyPassword', [params])
  },
  /**
   * 更新当前登录用户的信息。
   *
   * @param {object} params = {'field': '需要更新的字段值'}
   *
   *  field 包括：nickname（昵称）, birthday（生日）, signature（签名）, gender（性别）, region（地区）。
   *  如：{
   *    'birthday': Number,  // 生日日期的微秒数
   *    'gender': String,    // 'male' / 'female' / 'unknow'
   *    ...                  // 其余皆为 String 类型
   *  }
   *
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateMyInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateMyInfo', [params])
  },
  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group'
   *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
   *  'username': String,                            // 当 type = single 时，username 不能为空
   *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'text': String,                                // 本地图片路径
   *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
   * }
   */
  sendTextMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendTextMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group'
   *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
   *  'username': String,                            // 当 type = single 时，username 不能为空
   *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'path': String,                                // 本地图片路径
   *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
   * }
   */
  sendImageMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendImageMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group'
   *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
   *  'username': String,                            // 当 type = single 时，username 不能为空
   *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'path': String,                                // 本地图片路径
   *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
   * }
   */
  sendVoiceMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendVoiceMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': String,           // 'single' / 'group'
   *  'groupId': String,        // 当 type = group 时，groupId 不能为空
   *  'username': String,       // 当 type = single 时，username 不能为空
   *  'appKey': String,         // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'customObject': {'key1': 'value1'}  // Optional. 自定义键值对
   * }
   */
  sendCustomMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendCustomMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': String,           // 'single' / 'group'
   *  'groupId': String,        // 当 type = group 时，groupId 不能为空
   *  'username': String,       // 当 type = single 时，username 不能为空
   *  'appKey': String,         // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'latitude': Number,       // 纬度信息
   *  'longitude': Number,      // 经度信息
   *  'scale': Number,          // 地图缩放比例
   *  'address': String,        // 详细地址信息
   *  'extras': Object          // Optional. 自定义键值对 = {'key1': 'value1'}
   * }
   */
  sendLocationMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendLocationMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group'
   *  'groupId': String,                             // 当 type = group 时，groupId 不能为空。
   *  'username': String,                            // 当 type = single 时，username 不能为空。
   *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'path': String,                                // 本地文件路径。
   *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象。
   * }
   */
  sendFileMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendFileMessage', [params])
  },
  /**
   * 消息撤回。
   *
   * @param {object} params = {
   *  'type': String,       // 'single' / 'group'
   *  'groupId': String,    // 当 type = group 时，groupId 不能为空。
   *  'username': String,   // 当 type = single 时，username 不能为空。
   *  'appKey': String,     // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'messageId': String   // 消息 id。
   * }
   */
  retractMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'retractMessage', [params])
  },
  /**
   * 从最新的消息开始获取历史消息。
   * 当 from = 0 && limit = =1 时，返回所有历史消息。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 当 type = group 时，groupId 不能为空。
   *  'username': String,        // 当 type = single 时，username 不能为空。
   *  'appKey': String,          // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'from': Number,            // 开始的消息下标。
   *  'limit': Number            // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 = 9 条历史消息。
   * }
   * @param {function} success = function (messageArray)) {}  // 以参数形式返回历史消息对象数组
   */
  getHistoryMessages: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getHistoryMessages', [params])
  },
  /**
   * 发送好友请求。
   *
   * @param {object} params = {
   *  'username': String,   // 对方用户用户名。
   *  'appKey': String,     // 对方用户所属应用的 AppKey。
   *  'reason': String      // 申请原因。
   * }
   */
  sendInvitationRequest: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendInvitationRequest', [params])
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 对方用户用户名。
   *  'appKey': String,     // 对方用户所属应用的 AppKey。
   * }
   */
  acceptInvitation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'acceptInvitation', [params])
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 对方用户用户名。
   *  'appKey': String,     // 对方用户所属应用的 AppKey。
   *  'reason': String      // 拒绝原因。
   * }
   */
  declineInvitation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'declineInvitation', [params])
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 好友用户名。
   *  'appKey': String,     // 好友所属应用的 AppKey。
   * }
   */
  removeFromFriendList: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeFromFriendList', [params])
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 好友用户名。
   *  'appKey': String,     // 好友所属应用的 AppKey。
   *  'noteName': String    // 备注名。
   * }
   */
  updateFriendNoteName: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateFriendNoteName', [params])
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 好友用户名。
   *  'appKey': String,     // 好友所属应用的 AppKey。
   *  'noteName': String    // 备注信息。
   * }
   */
  updateFriendNoteText: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateFriendNoteText', [params])
  },
  /**
   * @param {function} success = function (friendArr) {}  // 以参数形式返回好友对象数组
   */
  getFriends: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getFriends', [])
  },
  /**
   * 创建群组，创建成功后，创建者默认会包含在群成员中。
   *
   * @param {object} params = {
   *  'name': String          // 群组名称。
   *  'desc': String          // 群组描述。
   * }
   * @param {function} success = function (groupId) {}  // 以参数形式返回 group id
   */
  createGroup: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'createGroup', [params])
  },
  /**
   * 获取当前用户所有所在的群组 id。
   *
   * @param {function} success = function (groupIdArray) {} // 以参数形式返回 group id 数组
   */
  getGroupIds: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupIds', [])
  },
  /**
   * @param {object} params = {'id': '群组 id'}
   * @param {function} success = function (groupInfo) {} // 以参数形式返回群组信息对象
   */
  getGroupInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupInfo', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id', 'newName': '新群组名称', 'newDesc': '新群组介绍'}
   */
  updateGroupInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateGroupInfo', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待添加用户所在应用的 appKey'}
   */
  addGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'addGroupMembers', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待删除用户所在应用的 appKey'}
   */
  removeGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeGroupMembers', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id'}
   */
  exitGroup: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'exitGroup', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id'}
   * @param {function} success = function (userInfoArray) {} // 以参数形式返回用户对象数组
   */
  getGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupMembers', [params])
  },
  /**
   * @param {object} params = {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
   */
  addUsersToBlacklist: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'addUsersToBlacklist', [params])
  },
  /**
   * @param {object} params = {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
   */
  removeUsersFromBlacklist: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeUsersFromBlacklist', [params])
  },
  /**
   * @param {function} success = function (userInfoArray) {} // 以参数形式返回黑名单中的用户信息数组
   */
  getBlacklist: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getBlacklist', [])
  },
  /**
   * 设置某个用户或群组是否免打扰。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'isNoDisturb': Boolean     // 是否免打扰。
   * }
   */
  setNoDisturb: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'setNoDisturb', [params])
  },
  /**
   * 获取免打扰用户和群组名单。
   *
   * @param {function} success = function ({userInfoArray: [], groupInfoArray: []}) {}  // 以参数形式返回用户和群组对象数组
   */
  getNoDisturbList: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getNoDisturbList', [])
  },
  /**
   * 设置是否全局免打扰。
   *
   * @param {object} params = {'isNoDisturb': Boolean}
   */
  setNoDisturbGlobal: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'setNoDisturbGlobal', [params])
  },
  /**
   * 判断当前是否全局免打扰。
   *
   * @param {function} success = function ({'isNoDisturb': Boolean}) {} // 以参数形式返回结果
   */
  isNoDisturbGlobal: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'isNoDisturbGlobal', [])
  },
  /**
   * 下载用户头像原图。
   *
   * @param {object} params = {'username': String, 'appKey': String}
   * @param {function} success = function ({'username': String, 'appKey': String, 'filePath': String}) {}
   */
  downloadOriginalUserAvatar: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadOriginalUserAvatar', [params])
  },
  /**
   * 下载指定图片消息的原图。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': String        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': String}) {}
   */
  downloadOriginalImage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadOriginalImage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': String        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': String}) {}
   */
  downloadVoiceFile: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadVoiceFile', [params])
  },
  /**
   * 下载文件消息文件。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': String        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': String}) {}
   */
  downloadFile: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadFile', [params])
  },
  /**
   * 创建聊天会话。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   * }
   * @param {function} success = function (conversation) {} // 以参数形式返回聊天会话对象。
   */
  createConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'createConversation', [params])
  },
  /**
   * 删除聊天会话，同时会删除本地聊天记录。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   * }
   */
  deleteConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'deleteConversation', [params])
  },
  /**
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   * }
   * @param {function} success = function (conversation) {} // 以参数形式返回聊天会话对象。
   */
  getConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getConversation', [params])
  },
  /**
   * @param {function} success = function (conversationArray) {}  // 以参数形式返回会话对象数组。
   */
  getConversations: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getConversations', [])
  },
  /**
   * 重置单个会话的未读消息数。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   * }
   */
  resetUnreadMessageCount: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'resetUnreadMessageCount', [params])
  },
  /**
   * 添加收到消息事件监听。
   *
   * @param {function} listener = function (message) {}  // 以参数形式返回消息对象。
   *
   * message = {
   *  'id': String,
   *  'from': object,    // 消息发送者信息对象。
   *  'target': object,  // 消息接收方信息（可能为用户或者群组）。
   *  'type': String     // 'text' / 'image' / 'voice' / 'location' / 'file' / 'custom' / 'event'
   *  ...                // 不同消息类型还有其他对应的相关字段，具体可参考文档。
   * }
   */
  addReceiveMessageListener: function (listener) {
    JMessagePlugin.handlers.receiveMessage.push(listener)
  },
  removeReceiveMessageListener: function (listener) {
    var handlerIndex = JMessagePlugin.handlers.receiveMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      JMessagePlugin.handlers.receiveMessage.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加点击通知栏消息通知事件监听。
   * Note: Android only, (如果想要 iOS 端 实现相同的功能，需要同时集成 jpush-phonegap-plugin)
   * @param {function} listener = function (message) {}  // 以参数形式返回消息对象。
   */
  addClickMessageNotificationListener: function (listener) {
    JMessagePlugin.handlers.clickMessageNotification.push(listener)
  },
  removeClickMessageNotificationListener: function (listener) {
    var handlerIndex = JMessagePlugin.handlers.clickMessageNotification.indexOf(listener)
    if (handlerIndex >= 0) {
      JMessagePlugin.handlers.clickMessageNotification.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加同步离线消息事件监听。
   *
   * @param {function} listener = function ({'conversation': {}, 'messageArray': []}) {}  // 以参数形式返回消息对象数组。
   */
  addSyncOfflineMessageListener: function (listener) {
    JMessagePlugin.handlers.syncOfflineMessage.push(listener)
  },
  removeSyncOfflineMessageListener: function (listener) {
    var handlerIndex = JMessagePlugin.handlers.syncOfflineMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      JMessagePlugin.handlers.syncOfflineMessage.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加同步漫游消息事件监听。
   *
   * @param {function} listener = function ({'conversation': {}}) {}  // 以参数形式返回消息对象数组。
   */
  addSyncRoamingMessageListener: function (listener) {
    JMessagePlugin.handlers.syncRoamingMessage.push(listener)
  },
  removeSyncRoamingMessageListener: function (listener) {
    var handlerIndex = JMessagePlugin.handlers.syncRoamingMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      JMessagePlugin.handlers.syncRoamingMessage.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加登录状态变更事件监听。
   *
   * @param {function} listener = function (event) {}  // 以参数形式返回事件信息。
   *
   * event = {
   *  'type': String, // 'user_password_change' / 'user_logout' / 'user_deleted' / 'user_login_status_unexpected'
   * }
   */
  addLoginStateChangedListener: function (listener) {
    JMessagePlugin.handlers.loginStateChanged.push(listener)
  },
  removeLoginStateChangedListener: function (listener) {
    var handlerIndex = JMessagePlugin.handlers.loginStateChanged.indexOf(listener)
    if (handlerIndex >= 0) {
      JMessagePlugin.handlers.loginStateChanged.splice(handlerIndex, 1)
    }
  },
  /**
   * 好友相关通知事件。
   *
   * @param {function} listener = function (event) {}  // 以参数形式返回事件信息。
   *
   * event = {
   *  'type': String,            // 'invite_received' / 'invite_accepted' / 'invite_declined' / 'contact_deleted'
   *  'reason': String,          // 事件发生的理由，该字段由对方发起请求时所填，对方如果未填则返回默认字符串。
   *  'fromUsername': String,    // 事件发送者的 username。
   *  'fromUserAppKey': String   // 事件发送者的 AppKey。
   * }
   */
  addContactNotifyListener: function (listener) {
    JMessagePlugin.handlers.contactNotify.push(listener)
  },
  removeContactNotifyListener: function (listener) {
    var handlerIndex = JMessagePlugin.handlers.contactNotify.indexOf(listener)
    if (handlerIndex >= 0) {
      JMessagePlugin.handlers.contactNotify.splice(handlerIndex, 1)
    }
  },
  /**
   * 消息撤回事件监听。
   *
   * @param {function} listener = function (event) {} // 以参数形式返回事件信息。
   *
   * event = {
   *  'conversation': Object      // 会话对象。
   *  'retractedMessage': Object  // 被撤回的消息对象。
   * }
   */
  addMessageRetractListener: function (listener) {
    JMessagePlugin.handlers.retractMessage.push(listener)
  },
  removeMessageRetractListener: function (listener) {
    var handlerIndex = JMessagePlugin.handlers.retractMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      JMessagePlugin.handlers.retractMessage.splice(handlerIndex, 1)
    }
  }
}

module.exports = JMessagePlugin
