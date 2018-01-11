var exec = require('cordova/exec')

var PLUGIN_NAME = 'JMessagePlugin'

var EventHandlers = {
  receiveMessage: [],
  clickMessageNotification: [],
  syncOfflineMessage: [],
  syncRoamingMessage: [],
  loginStateChanged: [],
  contactNotify: [],
  retractMessage: [],
  receiveTransCommand: [], // 透传命令
  receiveChatroomMessage: [] // 聊天室消息
}

var JMessagePlugin = {
  /**
   * 针对消息发送动作的控制选项，可附加在消息发送方法的参数中。
   */
  messageSendingOptions: {
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
  },
  /**
   * @param {object} params = {
   *  'isOpenMessageRoaming': boolean  // 是否开启消息漫游，不传默认关闭。
   * }
   *
   * 打开消息漫游之后，用户多个设备之间登录时，SDK 会自动将当前登录用户的历史消息同步到本地。
   */
  init: function (params) {
    var success = function (result) {
      if (!EventHandlers.hasOwnProperty(result.eventName)) {
        return
      }

      for (var index in EventHandlers[result.eventName]) {
        EventHandlers[result.eventName][index].apply(undefined, [result.value])
      }
    }

    exec(success, null, PLUGIN_NAME, 'init', [params])
  },
  /**
   * 设置是否开启 debug 模式，开启后 SDK 将会输出更多日志信息。应用对外发布时应关闭。
   *
   * @param {object} params = {'enable': boolean}
   */
  setDebugMode: function (params) {
    exec(null, null, PLUGIN_NAME, 'setDebugMode', [params])
  },
  /**
   * 注册用户。
   * @param {object} params = {
   *  username: String,
   *  password: String,
   *  nickname: String,
   *  ...
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  register: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'userRegister', [params])
  },
  /**
   * @param {object} params = {
   *  username: 'yourUsername',
   *  password: 'yourPassword',
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  login: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'userLogin', [params])
  },
  /**
   * 用户登出接口，调用后用户将无法收到消息。登出动作必定成功，开发者不需要关心结果回调。
   */
  logout: function () {
    exec(null, null, PLUGIN_NAME, 'userLogout', [])
  },
  /**
   * 登录成功则返回用户信息，未登录则对应用户信息为空对象。
   *
   * @param {function} success = function (myInfo) {}
   */
  getMyInfo: function (success) {
    exec(success, null, PLUGIN_NAME, 'getMyInfo', [])
  },
  /**
   * 获取用户信息，此接口可用来获取不同 appKey 下用户的信息，如果 appKey 为空，则默认获取当前 appKey 下的用户信息。
   *
   * @param {object} params = {'username': string, 'appKey': string}
   * @param {function} success = function (userInfo) {} // 通过参数返回用户对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getUserInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getUserInfo', [params])
  },
  /**
   * @param {object} params = {'oldPwd': string, 'newPwd': string}
   */
  updateMyPassword: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateMyPassword', [params])
  },
  /**
   * 更新当前用户头像。
   * @param {object} params = {
   *  imgPath: string // 本地图片绝对路径。
   * }
   * 注意 Android 与 iOS 的文件路径是不同的：
   *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
   *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
   */
  updateMyAvatar: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateMyAvatar', [params])
  },
  /**
   * 更新当前登录用户的信息。
   *
   * @param {object} params = {'field': '需要更新的字段值'}
   *
   *  field 包括：nickname（昵称）, birthday（生日）, signature（签名）, gender（性别）, region（地区）, address（具体地址），extras（附加字段）。
   *  如：{
   *    'birthday': Number,  // 生日日期的毫秒数
   *    'gender': String,    // 'male' / 'female' / 'unknown'
   *    'extras': Object     // 附加字段 value 必须为 String
   *    ...                  // 其余皆为 String 类型
   *  }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateMyInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateMyInfo', [params])
  },

  /**
   * 更新当前用户头像。
   *
   * @param {object} params = {
   *  id: string // 目标群组的 id。
   *  imgPath: string // 本地图片绝对路径。
   * }
   * 注意 Android 与 iOS 的文件路径是不同的：
   *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
   *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
   */
  updateGroupAvatar: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateGroupAvatar', [params])
  },

  /**
   * 下载用户头像缩略图，如果已经下载，不会重复下载。
   *
   * @param {object} params = {'id': String}
   * @param {function} success = function ({'id': String, 'filePath': String}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadThumbGroupAvatar: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadThumbGroupAvatar', [params])
  },

  /**
   * 下载用户头像原图，如果已经下载，不会重复下载。
   *
   * @param {object} params = {'id': String}
   * @param {function} success = function ({'id': String, 'filePath': String}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadOriginalGroupAvatar: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadOriginalGroupAvatar', [params])
  },

  /**
   * 增加或更新扩展字段,可扩展会话属性，比如：会话置顶、标识特殊会话等
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   * }
   * @param {function} success = function (conversation) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  setConversationExtras: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'setConversationExtras', [params])
  },

  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group'
   *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
   *  'username': String,                            // 当 type = single 时，username 不能为空
   *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用
   *  'text': String,                                // 消息内容
   *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendTextMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendTextMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': string,                                // 'single' / 'group'
   *  'groupId': string,                             // 当 type = group 时，groupId 不能为空
   *  'username': string,                            // 当 type = single 时，username 不能为空
   *  'appKey': string,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'path': string,                                // 本地图片绝对路径。
   *  'extras': object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
   * }
   * 注意 Android 与 iOS 的文件路径是不同的：
   *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
   *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendImageMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendImageMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': string,                                // 'single' / 'group'
   *  'groupId': string,                             // 当 type = group 时，groupId 不能为空
   *  'username': string,                            // 当 type = single 时，username 不能为空
   *  'appKey': string,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'path': string,                                // 本地语音文件路径。
   *  'extras': object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象。
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendVoiceMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendVoiceMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': string,           // 'single' / 'group'
   *  'groupId': string,        // 当 type = group 时，groupId 不能为空
   *  'username': string,       // 当 type = single 时，username 不能为空
   *  'appKey': string,         // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'customObject': {'key1': 'value1'}  // Optional. 自定义键值对
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendCustomMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendCustomMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': string,           // 'single' / 'group'
   *  'groupId': string,        // 当 type = group 时，groupId 不能为空
   *  'username': string,       // 当 type = single 时，username 不能为空
   *  'appKey': string,         // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'latitude': Number,       // 纬度信息
   *  'longitude': Number,      // 经度信息
   *  'scale': Number,          // 地图缩放比例
   *  'address': string,        // 详细地址信息
   *  'extras': object          // Optional. 自定义键值对 = {'key1': 'value1'}
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendLocationMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendLocationMessage', [params])
  },
  /**
   * @param {object} params = {
   *  'type': string,                                // 'single' / 'group'
   *  'groupId': string,                             // 当 type = group 时，groupId 不能为空。
   *  'username': string,                            // 当 type = single 时，username 不能为空。
   *  'appKey': string,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'path': string,                                // 本地文件路径。
   *  'extras': object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象。
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendFileMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendFileMessage', [params])
  },
  /**
   * 消息撤回。
   *
   * @param {object} params = {
   *  'type': string,       // 'single' / 'group'
   *  'groupId': string,    // 当 type = group 时，groupId 不能为空。
   *  'username': string,   // 当 type = single 时，username 不能为空。
   *  'appKey': string,     // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'messageId': string   // 消息 id。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  retractMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'retractMessage', [params])
  },
  /**
   * 从最新的消息开始获取历史消息。
   * 当 limit = -1 而 from >= 0 时，返回从 from 开始余下的所有历史消息。如果 from 大于历史消息总数，则返回空数组。
   * 例如：当 from = 0 && limit = -1 时，返回所有历史消息。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 当 type = group 时，groupId 不能为空。
   *  'username': string,        // 当 type = single 时，username 不能为空。
   *  'appKey': string,          // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'from': Number,            // 开始的消息下标。
   *  'limit': Number            // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 - 9 的 10 条历史消息。
   * }
   * @param {function} success = function (messageArray)) {}  // 以参数形式返回历史消息对象数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getHistoryMessages: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getHistoryMessages', [params])
  },
  /**
   * 根据消息 id 获取消息对象。
   *
   * @param {object} params = {
   *   type: string,      // 'single' / 'group'
   *   groupId: string,   // 当 type = 'group' 时，groupId 必填。
   *   username: string,  // 当 type = 'single' 时，username 必填。
   *   appKey: string,    // 当 type = 'single' 时，用于指定对象所属应用的 appKey。如果未空，则默认为当前应用。
   *   messageId: string  // 消息 Id。
   * }
   */
  getMessageById: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getMessageById', [params])
  },
  /**
   * 根据消息 id 删除指定消息。
   *
   * @param {object} params 同上。
   */
  deleteMessageById: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'deleteMessageById', [params])
  },
  /**
   * 发送好友请求。
   *
   * @param {object} params = {
   *  username: String,   // 对方用户用户名。
   *  appKey: String,     // 对方用户所属应用的 AppKey。
   *  reason: String      // 申请原因。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({code: '错误码', description: '错误信息'}) {}
   */
  sendInvitationRequest: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'sendInvitationRequest', [params])
  },
  /**
   * @param {object} params = {
   *  'username': string,   // 对方用户用户名。
   *  'appKey': string,     // 对方用户所属应用的 AppKey。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  acceptInvitation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'acceptInvitation', [params])
  },
  /**
   * @param {object} params = {
   *  'username': string,   // 对方用户用户名。
   *  'appKey': string,     // 对方用户所属应用的 AppKey。
   *  'reason': string      // 拒绝原因。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  declineInvitation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'declineInvitation', [params])
  },
  /**
   * @param {object} params = {
   *  'username': string,   // 好友用户名。
   *  'appKey': string,     // 好友所属应用的 AppKey。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  removeFromFriendList: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeFromFriendList', [params])
  },
  /**
   * @param {object} params = {
   *  'username': string,   // 好友用户名。
   *  'appKey': string,     // 好友所属应用的 AppKey。
   *  'noteName': string    // 备注名。
   * }
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateFriendNoteName: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateFriendNoteName', [params])
  },
  /**
   * @param {object} params = {
   *  'username': string,   // 好友用户名。
   *  'appKey': string,     // 好友所属应用的 AppKey。
   *  'noteText': string    // 备注信息。
   * }
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateFriendNoteText: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateFriendNoteText', [params])
  },
  /**
   * @param {function} success = function (friendArr) {}  // 以参数形式返回好友对象数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getFriends: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getFriends', [])
  },
  /**
   * 创建群组，创建成功后，创建者默认会包含在群成员中。
   *
   * @param {object} params = {
   *  name: String,          // 群组名称。
   *  desc: String,          // 群组描述。
   * }
   * @param {function} success = function (groupId) {}  // 以参数形式返回 group id
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  createGroup: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'createGroup', [params])
  },
  /**
   * 获取当前用户所有所在的群组 Id。
   *
   * @param {function} success = function (groupIdArray) {} // 以参数形式返回 group Id 数组。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getGroupIds: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupIds', [])
  },
  /**
   * @param {object} params = {'id': '群组 Id'}
   * @param {function} success = function (groupInfo) {} // 以参数形式返回群组信息对象
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getGroupInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupInfo', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id', 'newName': '新群组名称', 'newDesc': '新群组介绍'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateGroupInfo: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'updateGroupInfo', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待添加用户所在应用的 appKey'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  addGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'addGroupMembers', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待删除用户所在应用的 appKey'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  removeGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeGroupMembers', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  exitGroup: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'exitGroup', [params])
  },
  /**
   * @param {object} params = {'id': '群组 id'}
   * @param {function} success = function (userInfoArray) {} // 以参数形式返回用户对象数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getGroupMembers: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getGroupMembers', [params])
  },
  /**
   * @param {object} params = {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  addUsersToBlacklist: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'addUsersToBlacklist', [params])
  },
  /**
   * @param {object} params = {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  removeUsersFromBlacklist: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'removeUsersFromBlacklist', [params])
  },
  /**
   * @param {function} success = function (userInfoArray) {} // 以参数形式返回黑名单中的用户信息数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getBlacklist: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getBlacklist', [])
  },
  /**
   * 设置某个用户或群组是否免打扰。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   *  'isNoDisturb': boolean     // 是否免打扰。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  setNoDisturb: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'setNoDisturb', [params])
  },
  /**
   * 获取免打扰用户和群组名单。
   *
   * @param {function} success = function ({userInfoArray: [], groupInfoArray: []}) {}  // 以参数形式返回用户和群组对象数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getNoDisturbList: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getNoDisturbList', [])
  },
  /**
   * 设置是否全局免打扰。
   *
   * @param {object} params = {'isNoDisturb': boolean}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  setNoDisturbGlobal: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'setNoDisturbGlobal', [params])
  },
  /**
   * 判断当前是否全局免打扰。
   *
   * @param {function} success = function ({'isNoDisturb': boolean}) {} // 以参数形式返回结果
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  isNoDisturbGlobal: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'isNoDisturbGlobal', [])
  },
  /**
   * 设置是否屏蔽群消息。
   *
   * @param {Object} params = { id: String, isBlock: boolean }
   */
  blockGroupMessage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'blockGroupMessage', [params])
  },
  /**
   * 判断指定群组是否被屏蔽。
   *
   * @param {object} params = { id: String }
   * @param {function} success = function ({ isBlocked: boolean }) {} // 以参数形式返回结果。
   */
  isGroupBlocked: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'isGroupBlocked', [params])
  },

  /**
   * 获取当前用户的群屏蔽列表。
   *
   * @param {function} success = function (groupArr) {} // 以参数形式返回结果。
   */
  getBlockedGroupList: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getBlockedGroupList', [])
  },
  /**
   * 判断指定群组是否被屏蔽。
   *
   * @param {object} params = { id: String }
   * @param {function} success = function ({ isBlocked: boolean }) {} // 以参数形式返回结果。
   */
  isGroupBlocked: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'isGroupBlocked', [params])
  },
  /**
   * 获取当前用户的群屏蔽列表。
   *
   * @param {function} success = function (groupArr) {} // 以参数形式返回结果。
   */
  getBlockedGroupList: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getBlockedGroupList', [])
  },
  /**
   * 下载用户头像缩略图，如果已经下载，不会重复下载。
   *
   * @param {object} params = {'username': string, 'appKey': string}
   * @param {function} success = function ({'username': string, 'appKey': string, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadThumbUserAvatar: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadThumbUserAvatar', [params])
  },
  /**
   * 下载用户头像原图，如果已经下载，不会重复下载。
   * 如果用户未设置头像，则返回的 filePath 为空字符串。
   *
   * @param {object} params = {'username': string, 'appKey': string}
   * @param {function} success = function ({'username': string, 'appKey': string, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadOriginalUserAvatar: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadOriginalUserAvatar', [params])
  },
  /**
   * 下载图片消息的缩略图，如果已下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': string, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadThumbImage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadThumbImage', [params])
  },
  /**
   * 下载指定图片消息的原图，如果已经下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': string, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadOriginalImage: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadOriginalImage', [params])
  },
  /**
   * 下载语音消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': string, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadVoiceFile: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadVoiceFile', [params])
  },
  /**
   * 下载文件消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': string, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadFile: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'downloadFile', [params])
  },
  /**
   * 创建聊天会话。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   * }
   * @param {function} success = function (conversation) {} // 以参数形式返回聊天会话对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  createConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'createConversation', [params])
  },
  /**
   * 删除聊天会话，同时会删除本地聊天记录。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  deleteConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'deleteConversation', [params])
  },
  /**
   * 进入聊天会话。可以在进入聊天会话页面时调用该方法，这样在收到当前聊天用户的消息时，不会显示通知。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  enterConversation: function (params, success, error) {
    if (device.platform === 'Android') {
      exec(success, error, PLUGIN_NAME, 'enterConversation', [params])
    }
  },
  exitConversation: function () {
    if (device.platform === 'Android') {
      exec(null, null, PLUGIN_NAME, 'exitConversation', [])
    }
  },
  /**
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   * }
   * @param {function} success = function (conversation) {} // 以参数形式返回聊天会话对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getConversation: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'getConversation', [params])
  },
  /**
   * @param {function} success = function (conversationArray) {}  // 以参数形式返回会话对象数组。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getConversations: function (success, error) {
    exec(success, error, PLUGIN_NAME, 'getConversations', [])
  },
  /**
   * 重置单个会话的未读消息数。
   *
   * @param {object} params = {
   *  'type': string,            // 'single' / 'group'
   *  'groupId': string,         // 目标群组 id。
   *  'username': string,        // 目标用户名。
   *  'appKey': string,          // 目标用户所属 AppKey。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  resetUnreadMessageCount: function (params, success, error) {
    exec(success, error, PLUGIN_NAME, 'resetUnreadMessageCount', [params])
  },

  // 聊天室 API - start
  Chatroom: {
    /**
     * 获取当前应用所属聊天室的信息。
     * @param {object} params = {
     *  start: number,  // 索引起始位置，从 0 开始。
     *  count: number   // 查询个数。
     * }
     * @param {function} success = function (chatroomInfoList) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatroomInfoListOfApp: function (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'getChatroomInfoListOfApp', [params])
    },
    /**
     * 获取当前登录用户加入的聊天室列表。
     *
     * @param {function} success = function (chatroomInfoList) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatroomInfoListOfUser (success, error) {
      exec(success, error, PLUGIN_NAME, 'getChatroomInfoListOfUser', [])
    },
    /**
     * 根据聊天室 id 获取聊天室信息。
     *
     * @param {object} params = {
     *  roomIds: [String] // 聊天室 id 字符串数组。
     * }
     * @param {function} success = function (chatroomInfoList) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatroomInfoListById (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'getChatroomInfoListById', [params])
    },
    /**
     * 获取聊天室拥有者的用户信息。
     * 
     * @param {*} params = { roomId: String } // 聊天室 id
     * @param {function} success = function (userInfo) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatroomOwner (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'getChatroomOwner', [params])
    },
    /**
     * 进入聊天室。
     *
     * @param {object} params = { roomId: String }
     * @param {function} success = function (conversation) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    enterChatroom (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'enterChatroom', [params])
    },
    /**
     * 离开聊天室。
     *
     * @param {object} params = { roomId: String }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    exitChatroom (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'exitChatroom', [params])
    },
    /**
     * 获取聊天室会话信息。如果无法返回
     *
     * @param {object} params = { roomId: String }
     * @param {function} success = function (conversation) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatroomConversation (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'getChatroomConversation', [params])
    },
    /**
     * 从本地数据库中获取包含当前登录用户所有聊天室会话的列表。
     *
     * @param {function} success = function (conversationList) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatroomConversationList (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'getChatroomConversationList', [params])
    },
    /**
     * 创建聊天室会话。
     *
     * @param {object} params = { roomId: String }
     * @param {function} success = function (conversation) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    createChatroomConversation (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'createChatroomConversation', [params])
    },
    /**
     * 删除聊天室会话，同时删除掉本地相关缓存。
     *
     * @param {object} params = { roomId: String }
     * @param {function} success = function (conversation) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    deleteChatroomConversation (params, success, error) {
      exec(success, error, PLUGIN_NAME, 'deleteChatroomConversation', [params])
    }
  },
  // 聊天室 - end

  // 事件监听 - start

  /**
   * 添加收到消息事件监听。
   *
   * @param {function} listener = function (message) {}  // 以参数形式返回消息对象。
   * message = {
   *  'id': string,
   *  'from': object,    // 消息发送者信息对象。
   *  'target': object,  // 消息接收方信息（可能为用户或者群组）。
   *  'type': string     // 'text' / 'image' / 'voice' / 'location' / 'file' / 'custom' / 'event'
   *  ...                // 不同消息类型还有其他对应的相关字段，具体可参考文档。
   * }
   */
  addReceiveMessageListener: function (listener) {
    EventHandlers.receiveMessage.push(listener)
  },
  removeReceiveMessageListener: function (listener) {
    var handlerIndex = EventHandlers.receiveMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.receiveMessage.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加点击通知栏消息通知事件监听。
   * Note: Android only, (如果想要 iOS 端实现相同的功能，需要同时集成 jpush-phonegap-plugin)
   * @param {function} listener = function (message) {}  // 以参数形式返回消息对象。
   */
  addClickMessageNotificationListener: function (listener) {
    EventHandlers.clickMessageNotification.push(listener)
  },
  removeClickMessageNotificationListener: function (listener) {
    var handlerIndex = EventHandlers.clickMessageNotification.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.clickMessageNotification.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加同步离线消息事件监听。事件会在用户登录后触发。
   *
   * @param {function} listener = function ({'conversation': {}, 'messageArray': []}) {}  // 以参数形式返回消息对象数组。
   */
  addSyncOfflineMessageListener: function (listener) {
    EventHandlers.syncOfflineMessage.push(listener)
  },
  removeSyncOfflineMessageListener: function (listener) {
    var handlerIndex = EventHandlers.syncOfflineMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.syncOfflineMessage.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加同步漫游消息事件监听。
   *
   * @param {function} listener = function ({'conversation': {}}) {}  // 以参数形式返回消息对象数组。
   */
  addSyncRoamingMessageListener: function (listener) {
    EventHandlers.syncRoamingMessage.push(listener)
    if (device.platform === 'Android') {
      exec(null, null, PLUGIN_NAME, 'addSyncRoamingMessageListener', [])
    }
  },
  removeSyncRoamingMessageListener: function (listener) {
    var handlerIndex = EventHandlers.syncRoamingMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.syncRoamingMessage.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加登录状态变更事件监听。
   *
   * @param {function} listener = function (event) {}  // 以参数形式返回事件信息。
   * event = {
   *  'type': string, // 'user_password_change' / 'user_logout' / 'user_deleted' / 'user_login_status_unexpected'
   * }
   */
  addLoginStateChangedListener: function (listener) {
    EventHandlers.loginStateChanged.push(listener)
  },
  removeLoginStateChangedListener: function (listener) {
    var handlerIndex = EventHandlers.loginStateChanged.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.loginStateChanged.splice(handlerIndex, 1)
    }
  },
  /**
   * 好友相关通知事件。
   *
   * @param {function} listener = function (event) {}  // 以参数形式返回事件信息。
   * event = {
   *  'type': string,            // 'invite_received' / 'invite_accepted' / 'invite_declined' / 'contact_deleted'
   *  'reason': string,          // 事件发生的理由，该字段由对方发起请求时所填，对方如果未填则返回默认字符串。
   *  'fromUsername': string,    // 事件发送者的 username。
   *  'fromUserAppKey': string   // 事件发送者的 AppKey。
   * }
   */
  addContactNotifyListener: function (listener) {
    EventHandlers.contactNotify.push(listener)
  },
  removeContactNotifyListener: function (listener) {
    var handlerIndex = EventHandlers.contactNotify.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.contactNotify.splice(handlerIndex, 1)
    }
  },
  /**
   * 消息撤回事件监听。
   *
   * @param {function} listener = function (event) {} // 以参数形式返回事件信息。
   * event = {
   *  'conversation': object,     // 会话对象。
   *  'retractedMessage': object  // 被撤回的消息对象。
   * }
   */
  addMessageRetractListener: function (listener) {
    EventHandlers.retractMessage.push(listener)
  },
  removeMessageRetractListener: function (listener) {
    var handlerIndex = EventHandlers.retractMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.retractMessage.splice(handlerIndex, 1)
    }
  },
  /**
   * 收到透传命令事件监听。
   *
   * @param {function} listener = function (event) {} // 以参数形式返回事件信息。
   * event = {
   *  message: String,      // 透传命令消息内容
   *  sender: Object,       // 发送方，类型为 UserInfo。
   *  receiver: Object      // 接收方，类型可能为 UserInfo 或 GroupInfo。
   *  receiverType: String, // 接收方的类型，可能值为 'single' 和 'group'。
   * }
   */
  addReceiveTransCommandListener: function (listener) {
    EventHandlers.receiveTransCommand.push(listener)
  },
  removeReceiveTransCommandListener: function (listener) {
    var handlerIndex = EventHandlers.receiveTransCommand.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.receiveTransCommand.splice(handlerIndex, 1)
    }
  },
  /**
   * 添加收到聊天室消息的事件监听。
   * 
   * @param {function} listener = function (event) {} // 以参数形式返回事件信息。
   * event = {
   *  messageArray: Array   // 消息对象数组。
   * }
   */
  addReceiveChatroomMessageListener: function (listener) {
    EventHandlers.receiveChatroomMessage.push(listener)
  },
  removeReceiveChatroomMessageListener: function (listener) {
    var handlerIndex = EventHandlers.receiveChatroomMessage.indexOf(listener)
    if (handlerIndex >= 0) {
      EventHandlers.receiveChatroomMessage.splice(handlerIndex, 1)
    }
  }

  // 事件监听 - end
}

module.exports = JMessagePlugin
