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
  receiveChatRoomMessage: [], // 聊天室消息
  receiveApplyJoinGroupApproval: [],
  receiveGroupAdminReject: [],
  receiveGroupAdminApproval: []
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
    isCustomNotificationEnabled: undefined,
    /**
     * 设置此条消息在接收方通知栏所展示通知的标题。
     * @type {?string}
     */
    notificationTitle: undefined,
    /**
     * 设置此条消息在接收方通知栏所展示通知的内容。
     * @type {?string}
     */
    notificationText: undefined
  },
  /**
   * @param {object} params = {
   *  'isOpenMessageRoaming': boolean  // 是否开启消息漫游，不传默认关闭。
   * }
   *
   * 打开消息漫游之后，用户多个设备之间登录时，SDK 会自动将当前登录用户的历史消息同步到本地。
   */
  init: function(params) {
    var success = function(result) {
      if (!EventHandlers.hasOwnProperty(result.eventName)) {
        return;
      }

      for (var index in EventHandlers[result.eventName]) {
        EventHandlers[result.eventName][index].apply(undefined, [result.value]);
      }
    };

    exec(success, null, PLUGIN_NAME, "init", [params]);
  },
  /**
   * 设置是否开启 debug 模式，开启后 SDK 将会输出更多日志信息。应用对外发布时应关闭。
   *
   * @param {object} params = {'enable': boolean}
   */
  setDebugMode: function(params) {
    exec(null, null, PLUGIN_NAME, "setDebugMode", [params]);
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
  register: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "userRegister", [params]);
  },
  /**
   * @param {object} params = {
   *  username: 'yourUsername',
   *  password: 'yourPassword',
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  login: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "userLogin", [params]);
  },
  /**
   * 用户登出接口，调用后用户将无法收到消息。登出动作必定成功，开发者不需要关心结果回调。
   */
  logout: function() {
    exec(null, null, PLUGIN_NAME, "userLogout", []);
  },
  /**
   * （iOS only）设置 JMessage 服务器角标。
   * @param {object} params = {
   *  badge: number
   * }
   */
  setBadge: function(params) {
    if (device.platform === "iOS") {
      exec(null, null, PLUGIN_NAME, "setBadge", [params]);
    }
  },
  /**
   * 登录成功则返回用户信息，未登录则对应用户信息为空对象。
   *
   * @param {function} success = function (myInfo) {}
   */
  getMyInfo: function(success) {
    exec(success, null, PLUGIN_NAME, "getMyInfo", []);
  },
  /**
   * 获取用户信息，此接口可用来获取不同 appKey 下用户的信息，如果 appKey 为空，则默认获取当前 appKey 下的用户信息。
   *
   * @param {object} params = {'username': String, 'appKey': string}
   * @param {function} success = function (userInfo) {} // 通过参数返回用户对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getUserInfo: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "getUserInfo", [params]);
  },
  /**
   * @param {object} params = {'oldPwd': String, 'newPwd': string}
   */
  updateMyPassword: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "updateMyPassword", [params]);
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
  updateMyAvatar: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "updateMyAvatar", [params]);
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
  updateMyInfo: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "updateMyInfo", [params]);
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
  updateGroupAvatar: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "updateGroupAvatar", [params]);
  },

  /**
   * 下载用户头像缩略图，如果已经下载，不会重复下载。
   *
   * @param {object} params = {'id': String}
   * @param {function} success = function ({'id': String, 'filePath': String}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadThumbGroupAvatar: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadThumbGroupAvatar", [params]);
  },

  /**
   * 下载用户头像原图，如果已经下载，不会重复下载。
   *
   * @param {object} params = {'id': String}
   * @param {function} success = function ({'id': String, 'filePath': String}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadOriginalGroupAvatar: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadOriginalGroupAvatar", [params]);
  },

  /**
   * 增加或更新扩展字段,可扩展会话属性，比如：会话置顶、标识特殊会话等
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'roomId': String           // 聊天室 id。
   * }
   * @param {function} success = function (conversation) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  setConversationExtras: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "setConversationExtras", [params]);
  },

  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,                             // 当 type 为 'group' 时，groupId 不能为空
   *  'username': String,                            // 当 type 为 'single' 时，username 不能为空
   *  'appKey': String,                              // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用
   *  'roomId': String,                              // 当 type 为 'chatRoom' 时，roomId 不能为空
   *  'text': String,                                // 消息内容
   *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendTextMessage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "sendTextMessage", [params]);
  },
  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,                             // 当 type 为 'group' 时，groupId 不能为空
   *  'username': String,                            // 当 type 为 'single' 时，username 不能为空
   *  'appKey': String,                              // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用
   *  'roomId': String,                              // 当 type 为 'chatRoom' 时，roomId 不能为空
   *  'path': String,                                // 本地图片绝对路径。
   *  'extras': object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
   * }
   * 注意 Android 与 iOS 的文件路径是不同的：
   *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
   *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendImageMessage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "sendImageMessage", [params]);
  },
  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group'
   *  'groupId': String,                             // 当 type 为 'group' 时，groupId 不能为空
   *  'username': String,                            // 当 type 为 'single' 时，username 不能为空
   *  'appKey': String,                              // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'roomId': String,                              // 当 type 为 'chatRoom' 时，roomId 不能为空
   *  'path': String,                                // 本地语音文件路径。
   *  'extras': object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象。
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendVoiceMessage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "sendVoiceMessage", [params]);
  },
  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group'
   *  'groupId': String,                             // 当 type 为 'group' 时，groupId 不能为空
   *  'username': String,                            // 当 type 为 'single' 时，username 不能为空
   *  'appKey': String,                              // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'roomId': String,                              // 当 type 为 'chatRoom' 时，roomId 不能为空
   *  'videoFilePath': String,                       // 本地视频文件路径
   *  'videoFileName': String,                       // 本地视频文件名
   *  'videoImagePath': String,                      // 本地视频缩略图路径
   *  'videoImageFormat': String,                    // 本地视频缩略图格式（ios可不传）
   *  'videoDuration': int,                          // 本地视频播放时长，单位秒
   *  'extras': object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象。
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendVideoMessage: function(params,success,error){
    exec(success, error, PLUGIN_NAME, "sendVideoMessage", [params]);
  },
  /**
   * @param {object} params = {
   *  'type': String,           // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,        // 当 type 为 'group' 时，groupId 不能为空
   *  'username': String,       // 当 type 为 'single' 时，username 不能为空
   *  'roomId': String,         // 当 type 为 'chatRoom' 时，roomId 不能为空
   *  'appKey': String,         // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'customObject': {'key1': 'value1'}  // Optional. 自定义键值对
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendCustomMessage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "sendCustomMessage", [params]);
  },
  /**
   * @param {object} params = {
   *  'type': String,           // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,        // 当 type 为 'group' 时，groupId 不能为空
   *  'username': String,       // 当 type 为 'single' 时，username 不能为空
   *  'appKey': String,         // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'roomId': String,         // 当 type 为 'chatRoom' 时，roomId 不能为空
   *  'latitude': Number,       // 纬度信息
   *  'longitude': Number,      // 经度信息
   *  'scale': Number,          // 地图缩放比例
   *  'address': String,        // 详细地址信息
   *  'extras': object          // Optional. 自定义键值对 = {'key1': 'value1'}
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendLocationMessage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "sendLocationMessage", [params]);
  },
  /**
   * @param {object} params = {
   *  'type': String,                                // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,                             // 当 type 为 'group' 时，groupId 不能为空。
   *  'username': String,                            // 当 type 为 'single' 时，username 不能为空。
   *  'appKey': String,                              // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'roomId': String,                              // 当 type 为 'chatRoom' 时，roomId 不能为空
   *  'path': String,                                // 本地文件路径。
   *  'extras': object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象。
   * }
   * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  sendFileMessage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "sendFileMessage", [params]);
  },
  /**
   * 消息撤回。
   *
   * @param {object} params = {
   *  'type': String,       // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,    // 当 type 为 'group' 时，groupId 不能为空。
   *  'username': String,   // 当 type 为 'single' 时，username 不能为空。
   *  'roomId': String,     // 当 type 为 'chatRoom' 时，roomId 不能为空。
   *  'appKey': String,     // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'messageId': string   // 消息 id。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  retractMessage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "retractMessage", [params]);
  },
  /**
   * 从最新的消息开始获取历史消息。
   * 当 limit = -1 而 from >= 0 时，返回从 from 开始余下的所有历史消息。如果 from 大于历史消息总数，则返回空数组。
   * 例如：当 from = 0 && limit = -1 时，返回所有历史消息。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,         // 当 type 为 'group' 时，groupId 不能为空。
   *  'username': String,        // 当 type 为 'single' 时，username 不能为空。
   *  'appKey': String,          // 当 type 为 'single' 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'roomId': String,          // 当 type 为 'chatRoom' 时，roomId 不能为空。
   *  'from': Number,            // 开始的消息下标。
   *  'limit': Number            // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 - 9 的 10 条历史消息。
   * }
   * @param {function} success = function (messageArray)) {}  // 以参数形式返回历史消息对象数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getHistoryMessages: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "getHistoryMessages", [params]);
  },
  /**
   * 根据消息 id 获取消息对象。
   *
   * @param {object} params = {
   *   type: String,      // 'single' / 'group' / 'chatRoom'
   *   groupId: String,   // 当 type = 'group' 时，groupId 必填。
   *   username: String,  // 当 type = 'single' 时，username 必填。
   *   appKey: String,    // 当 type = 'single' 时，用于指定对象所属应用的 appKey。如果未空，则默认为当前应用。
   *   roomId: String,    // 当 type 为 'chatRoom' 时，roomId 不能为空。
   *   messageId: string  // 消息 Id。
   * }
   */
  getMessageById: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "getMessageById", [params]);
  },
  /**
   * 根据消息 id 删除指定消息。
   *
   * @param {object} params 同上。
   */
  deleteMessageById: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "deleteMessageById", [params]);
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
  sendInvitationRequest: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "sendInvitationRequest", [params]);
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 对方用户用户名。
   *  'appKey': String,     // 对方用户所属应用的 AppKey。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  acceptInvitation: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "acceptInvitation", [params]);
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 对方用户用户名。
   *  'appKey': String,     // 对方用户所属应用的 AppKey。
   *  'reason': string      // 拒绝原因。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  declineInvitation: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "declineInvitation", [params]);
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 好友用户名。
   *  'appKey': String,     // 好友所属应用的 AppKey。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  removeFromFriendList: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "removeFromFriendList", [params]);
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 好友用户名。
   *  'appKey': String,     // 好友所属应用的 AppKey。
   *  'noteName': string    // 备注名。
   * }
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateFriendNoteName: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "updateFriendNoteName", [params]);
  },
  /**
   * @param {object} params = {
   *  'username': String,   // 好友用户名。
   *  'appKey': String,     // 好友所属应用的 AppKey。
   *  'noteText': string    // 备注信息。
   * }
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateFriendNoteText: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "updateFriendNoteText", [params]);
  },
  /**
   * @param {function} success = function (friendArr) {}  // 以参数形式返回好友对象数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getFriends: function(success, error) {
    exec(success, error, PLUGIN_NAME, "getFriends", []);
  },
  /**
   * 创建群组，创建成功后，创建者默认会包含在群成员中。
   *
   * @param {object} params = {
   *  name: String,          // 群组名称。
   *  desc: String,          // 群组描述。
   *  groupType: String      // 'public' | 'private'
   * }
   * @param {function} success = function (groupId) {}  // 以参数形式返回 group id
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  createGroup: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "createGroup", [params]);
  },
  /**
   * 获取当前用户所有所在的群组 Id。
   *
   * @param {function} success = function (groupIdArray) {} // 以参数形式返回 group Id 数组。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getGroupIds: function(success, error) {
    exec(success, error, PLUGIN_NAME, "getGroupIds", []);
  },
  /**
   * @param {object} params = {'id': '群组 Id'}
   * @param {function} success = function (groupInfo) {} // 以参数形式返回群组信息对象
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getGroupInfo: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "getGroupInfo", [params]);
  },
  /**
   * @param {object} params = {'id': '群组 id', 'newName': '新群组名称', 'newDesc': '新群组介绍'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  updateGroupInfo: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "updateGroupInfo", [params]);
  },
  /**
   * @param {object} params = {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待添加用户所在应用的 appKey'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  addGroupMembers: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "addGroupMembers", [params]);
  },
  /**
   * @param {object} params = {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待删除用户所在应用的 appKey'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  removeGroupMembers: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "removeGroupMembers", [params]);
  },
  /**
   * @param {object} params = {'id': '群组 id'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  exitGroup: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "exitGroup", [params]);
  },
  /**
   * @param {object} params = {'id': '群组 id'}
   * @param {function} success = function (groupMemberInfoArray) {} // 以参数形式返回用户对象数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getGroupMembers: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "getGroupMembers", [params]);
  },
  /**
   * @param {object} params = {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  addUsersToBlacklist: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "addUsersToBlacklist", [params]);
  },
  /**
   * @param {object} params = {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  removeUsersFromBlacklist: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "removeUsersFromBlacklist", [params]);
  },
  /**
   * @param {function} success = function (userInfoArray) {} // 以参数形式返回黑名单中的用户信息数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getBlacklist: function(success, error) {
    exec(success, error, PLUGIN_NAME, "getBlacklist", []);
  },
  /**
   * 设置某个用户或群组是否免打扰。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'isNoDisturb': boolean     // 是否免打扰。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  setNoDisturb: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "setNoDisturb", [params]);
  },
  /**
   * 获取免打扰用户和群组名单。
   *
   * @param {function} success = function ({userInfoArray: [], groupInfoArray: []}) {}  // 以参数形式返回用户和群组对象数组
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getNoDisturbList: function(success, error) {
    exec(success, error, PLUGIN_NAME, "getNoDisturbList", []);
  },
  /**
   * 设置是否全局免打扰。
   *
   * @param {object} params = {'isNoDisturb': boolean}
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  setNoDisturbGlobal: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "setNoDisturbGlobal", [params]);
  },
  /**
   * 判断当前是否全局免打扰。
   *
   * @param {function} success = function ({'isNoDisturb': boolean}) {} // 以参数形式返回结果
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  isNoDisturbGlobal: function(success, error) {
    exec(success, error, PLUGIN_NAME, "isNoDisturbGlobal", []);
  },
  /**
   * 设置是否屏蔽群消息。
   *
   * @param {Object} params = { id: String, isBlock: boolean }
   */
  blockGroupMessage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "blockGroupMessage", [params]);
  },
  /**
   * 判断指定群组是否被屏蔽。
   *
   * @param {object} params = { id: String }
   * @param {function} success = function ({ isBlocked: boolean }) {} // 以参数形式返回结果。
   */
  isGroupBlocked: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "isGroupBlocked", [params]);
  },

  /**
   * 获取当前用户的群屏蔽列表。
   *
   * @param {function} success = function (groupArr) {} // 以参数形式返回结果。
   */
  getBlockedGroupList: function(success, error) {
    exec(success, error, PLUGIN_NAME, "getBlockedGroupList", []);
  },

  /**
   * 下载用户头像缩略图，如果已经下载，不会重复下载。
   *
   * @param {object} params = {'username': String, 'appKey': string}
   * @param {function} success = function ({'username': String, 'appKey': String, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadThumbUserAvatar: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadThumbUserAvatar", [params]);
  },
  /**
   * 下载用户头像原图，如果已经下载，不会重复下载。
   * 如果用户未设置头像，则返回的 filePath 为空字符串。
   *
   * @param {object} params = {'username': String, 'appKey': string}
   * @param {function} success = function ({'username': String, 'appKey': String, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadOriginalUserAvatar: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadOriginalUserAvatar", [params]);
  },
  /**
   * 下载图片消息的缩略图，如果已下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadThumbImage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadThumbImage", [params]);
  },
  /**
   * 下载指定图片消息的原图，如果已经下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadOriginalImage: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadOriginalImage", [params]);
  },
  /**
   * 下载语音消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadVoiceFile: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadVoiceFile", [params]);
  },
  /**
   * 下载视频消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadVideoFile: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadVideoFile", [params]);
  },  
  /**
   * 下载视频消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
   downloadVideoFile: function(params, success, error) {
     exec(success, error, PLUGIN_NAME, "downloadVideoFile", [params]);
   },
  /**
   * 下载文件消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'messageId': string        // 指定消息 id。
   * }
   * @param {function} success = function ({'messageId': String, 'filePath': string}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  downloadFile: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "downloadFile", [params]);
  },
  /**
   * 创建聊天会话。目前可创建单聊、群聊和聊天室会话。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'roomId': String           // 目标聊天室 id。
   * }
   * @param {function} success = function (conversation) {} // 以参数形式返回聊天会话对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  createConversation: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "createConversation", [params]);
  },
  /**
   * 删除聊天会话，同时将删除本地聊天记录。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'roomId': String           // 目标聊天室 id。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  deleteConversation: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "deleteConversation", [params]);
  },
  /**
   * 进入聊天会话。可以在进入聊天会话页面时调用该方法，这样在收到当前聊天用户的消息时，不会显示通知。
   * 对于聊天室（Chat Room）需要调用 `enterChatRoom` 方法。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String           // 目标用户所属 AppKey。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  enterConversation: function(params, success, error) {
    if (device.platform === "Android") {
      exec(success, error, PLUGIN_NAME, "enterConversation", [params]);
    }
  },
  /**
   * 退出聊天会话。
   * 对于聊天室（Chat Room）需要调用 `exitChatRoom` 方法。
   */
  exitConversation: function() {
    if (device.platform === "Android") {
      exec(null, null, PLUGIN_NAME, "exitConversation", []);
    }
  },
  /**
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,         // 目标群组 id。当 type 为 'group' 时必填。
   *  'username': String,        // 目标用户名。当 type 为 'single' 时必填。
   *  'appKey': String,          // 目标用户所属 AppKey。如果不传或为空字符串，则默认为当前应用。
   *  'roomId': String           // 聊天室 id。当 type 为 'roomId' 时必填。
   * }
   * @param {function} success = function (conversation) {} // 以参数形式返回聊天会话对象。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getConversation: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "getConversation", [params]);
  },
  /**
   * @param {function} success = function (conversationArray) {}  // 以参数形式返回会话对象数组。
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getConversations: function(success, error) {
    exec(success, error, PLUGIN_NAME, "getConversations", []);
  },
  /**
   * 重置单个会话的未读消息数。
   *
   * @param {object} params = {
   *  'type': String,            // 'single' / 'group' / 'chatRoom'
   *  'groupId': String,         // 目标群组 id。
   *  'username': String,        // 目标用户名。
   *  'appKey': String,          // 目标用户所属 AppKey。
   *  'roomId': String           // 聊天室 id。
   * }
   * @param {function} success = function () {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  resetUnreadMessageCount: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "resetUnreadMessageCount", [params]);
  },

  // 聊天室 API - start
  ChatRoom: {
    /**
     * 获取当前应用所属聊天室的信息。
     *
     * @param {object} params = {
     *  start: number,  // 索引起始位置，从 0 开始。
     *  count: number   // 查询个数。
     * }
     * @param {function} success = function (chatRoomInfoList) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatRoomInfoListOfApp: function(params, success, error) {
      exec(success, error, PLUGIN_NAME, "getChatRoomInfoListOfApp", [params]);
    },
    /**
     * 获取当前登录用户加入的聊天室列表。
     *
     * @param {function} success = function (chatRoomInfoList) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatRoomInfoListOfUser: function(success, error) {
      exec(success, error, PLUGIN_NAME, "getChatRoomInfoListOfUser", []);
    },
    /**
     * 根据聊天室 id 获取聊天室信息。
     *
     * @param {object} params = {
     *  roomIds: [String] // 聊天室 id 字符串数组。
     * }
     * @param {function} success = function (ChatRoomInfoList) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatRoomInfoListById: function(params, success, error) {
      exec(success, error, PLUGIN_NAME, "getChatRoomInfoListById", [params]);
    },
    /**
     * 获取聊天室拥有者的用户信息。
     *
     * @param {object} params = { roomId: String } // 聊天室 id
     * @param {function} success = function (userInfo) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatRoomOwner: function(params, success, error) {
      exec(success, error, PLUGIN_NAME, "getChatRoomOwner", [params]);
    },
    /**
     * 进入聊天室。
     * 用户只有成功调用此接口之后，才能收到聊天室消息，以及在此聊天室中发言。
     * 成功进入聊天室之后，会将聊天室中最近若干条聊天记录同步到本地并触发 `receiveChatRoomMessage` 事件。
     *
     * @param {object} params = { roomId: String }
     * @param {function} success = function (conversation) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    enterChatRoom: function(params, success, error) {
      exec(success, error, PLUGIN_NAME, "enterChatRoom", [params]);
    },
    /**
     * 离开聊天室。
     * 成功调用此接口之后，用户将能不在此聊天室收发消息。
     *
     * @param {object} params = { roomId: String }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    exitChatRoom: function(params, success, error) {
      exec(success, error, PLUGIN_NAME, "exitChatRoom", [params]);
    },
    /**
     * 获取聊天室会话信息。
     *
     * @param {object} params = { roomId: String }
     * @param {function} success = function (conversation) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatRoomConversation: function(params, success, error) {
      exec(success, error, PLUGIN_NAME, "getChatRoomConversation", [params]);
    },
    /**
     * 从本地数据库中获取包含当前登录用户所有聊天室会话的列表。
     *
     * @param {function} success = function (conversationList) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    getChatRoomConversationList: function(success, error) {
      exec(success, error, PLUGIN_NAME, "getChatRoomConversationList", []);
    }
  },
  // 聊天室 - end
  /**
   * 获取所有会话未读消息总数
   * @param {function} callback = function([{count: number}])
   */
  getAllUnreadCount: function(callback) {
    exec(callback, null, PLUGIN_NAME, "getAllUnreadCount", []);
  },

  // 群组相关 - start
  /**
   * 批量添加管理员
   * @param {object} param = {groupId: string, usernames: [string], appKey: string}
   * @param {function} success
   * @param {function} error
   */
  addGroupAdmins: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "addGroupAdmins", [params]);
  },

  /**
   * 批量删除管理员
   * @param {object} param = {groupId: string, usernames: [string], appKey: string}
   * @param {function} success
   * @param {function} error
   */
  removeGroupAdmins: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "removeGroupAdmins", [params]);
  },

  /**
   * 修改群类型，
   * @param {object} param = {groudId: String, type: 'public' | 'private'}
   * @param {function} success = function({conversation})
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  changeGroupType: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "changeGroupType", [params]);
  },

  /**
   * 分页获取群页面
   * @param {object} param = {appKey: string, start: number, count: number}
   * @param {function} success = function([groupInfo])
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  getPublicGroupInfos: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "getPublicGroupInfos", [params]);
  },

  /**
   * 申请公开群入群
   * @param {object} param = {groupId: string, reason: string}
   * @param {function} success = function()
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  applyJoinGroup: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "applyJoinGroup", [params]);
  },

  /**
   * 批量处理公开群入群请求
   * @param {object} param = {events: [string], isAgree: boolean, reason: string, isRespondInviter: boolean}
   *  events: 请求的 eventId 数组。
   *  isAgree: 是否同意入群。
   *  isRespondInviter: 是否将处理结果返回给申请入群者
   * @param {function} success = _ => {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  processApplyJoinGroup: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "processApplyJoinGroup", [params]);
  },

  /**
   * 解散群
   * @param {object} param = { groupId: string }
   * @param {function} success = _ => {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  dissolveGroup: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "dissolveGroup", [params]);
  },

   /**
    * 设置群成员昵称
    * @param {object} params = { nickName: string, groupId: string , username: string, appKey: string}
    * @param {function} success  = _ => {}
    * @param {function} error  = function ({'code': '错误码', 'description': '错误信息'}) {}
    */
  setGroupNickname: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "setGroupNickname", [params]);
  },
  /**
   * 移交群主
   * @param {object} params = { groupId: string , username: string, appKey: string}
   * @param {function} success = function = _ => {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  transferGroupOwner: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "transferGroupOwner", [params]);
  },

  /**
   * 设置禁言或解禁用户
   * @param {object} params = { groupId: string, isSilence: Boolean, username: string, appKey: string }
   * @param {function} success = _ => {}
   * @param {function} error  = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  setGroupMemberSilence: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "setGroupMemberSilence", [params]);
  },

  /**
   * 判断用户是否被禁言
   * @param {object} params = { groupId: string, username: string, appKey: string }
   * @param {function} success = ({isSilence: Boolean}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  isSilenceMember: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "isSilenceMember", [params]);
  },

  /**
   * 获取群禁言列表 （注意在获取群列表成功后该方法才有效）
   * @param {object} params = { groupId: string}
   * @param {function} success 
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  groupSilenceMembers: function(params, success, error) {
    exec(success, error, PLUGIN_NAME, "groupSilenceMembers", [params]);
  },



  // 群组相关 - end

  // 事件监听 - start
  /**
   * 添加收到消息事件监听。
   *
   * @param {function} listener = function (message) {}  // 以参数形式返回消息对象。
   * message = {
   *  'id': String,
   *  'from': object,    // 消息发送者信息对象。
   *  'target': object,  // 消息接收方信息（可能为用户或者群组）。
   *  'type': string     // 'text' / 'image' / 'voice' / 'location' / 'file' / 'custom' / 'event'
   *  ...                // 不同消息类型还有其他对应的相关字段，具体可参考文档。
   * }
   */
  addReceiveMessageListener: function(listener) {
    EventHandlers.receiveMessage.push(listener);
  },
  removeReceiveMessageListener: function(listener) {
    var handlerIndex = EventHandlers.receiveMessage.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.receiveMessage.splice(handlerIndex, 1);
    }
  },
  /**
   * 添加点击通知栏消息通知事件监听。
   * Note: Android only, (如果想要 iOS 端实现相同的功能，需要同时集成 jpush-phonegap-plugin)
   * @param {function} listener = function (message) {}  // 以参数形式返回消息对象。
   */
  addClickMessageNotificationListener: function(listener) {
    EventHandlers.clickMessageNotification.push(listener);
  },
  removeClickMessageNotificationListener: function(listener) {
    var handlerIndex = EventHandlers.clickMessageNotification.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.clickMessageNotification.splice(handlerIndex, 1);
    }
  },
  /**
   * 添加同步离线消息事件监听。事件会在用户登录后触发。
   *
   * @param {function} listener = function ({'conversation': {}, 'messageArray': []}) {}  // 以参数形式返回消息对象数组。
   */
  addSyncOfflineMessageListener: function(listener) {
    EventHandlers.syncOfflineMessage.push(listener);
  },
  removeSyncOfflineMessageListener: function(listener) {
    var handlerIndex = EventHandlers.syncOfflineMessage.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.syncOfflineMessage.splice(handlerIndex, 1);
    }
  },
  /**
   * 添加同步漫游消息事件监听。
   *
   * @param {function} listener = function ({'conversation': {}}) {}  // 以参数形式返回消息对象数组。
   */
  addSyncRoamingMessageListener: function(listener) {
    EventHandlers.syncRoamingMessage.push(listener);
    if (device.platform === "Android") {
      exec(null, null, PLUGIN_NAME, "addSyncRoamingMessageListener", []);
    }
  },
  removeSyncRoamingMessageListener: function(listener) {
    var handlerIndex = EventHandlers.syncRoamingMessage.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.syncRoamingMessage.splice(handlerIndex, 1);
    }
  },
  /**
   * 添加登录状态变更事件监听。
   *
   * @param {function} listener = function (event) {}  // 以参数形式返回事件信息。
   * event = {
   *  'type': String, // 'user_password_change' / 'user_logout' / 'user_deleted' / 'user_login_status_unexpected'
   * }
   */
  addLoginStateChangedListener: function(listener) {
    EventHandlers.loginStateChanged.push(listener);
  },
  removeLoginStateChangedListener: function(listener) {
    var handlerIndex = EventHandlers.loginStateChanged.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.loginStateChanged.splice(handlerIndex, 1);
    }
  },
  /**
   * 好友相关通知事件。
   *
   * @param {function} listener = function (event) {}  // 以参数形式返回事件信息。
   * event = {
   *  'type': String,            // 'invite_received' / 'invite_accepted' / 'invite_declined' / 'contact_deleted'
   *  'reason': String,          // 事件发生的理由，该字段由对方发起请求时所填，对方如果未填则返回默认字符串。
   *  'fromUsername': String,    // 事件发送者的 username。
   *  'fromUserAppKey': string   // 事件发送者的 AppKey。
   * }
   */
  addContactNotifyListener: function(listener) {
    EventHandlers.contactNotify.push(listener);
  },
  removeContactNotifyListener: function(listener) {
    var handlerIndex = EventHandlers.contactNotify.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.contactNotify.splice(handlerIndex, 1);
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
  addMessageRetractListener: function(listener) {
    EventHandlers.retractMessage.push(listener);
  },
  removeMessageRetractListener: function(listener) {
    var handlerIndex = EventHandlers.retractMessage.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.retractMessage.splice(handlerIndex, 1);
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
  addReceiveTransCommandListener: function(listener) {
    EventHandlers.receiveTransCommand.push(listener);
  },
  removeReceiveTransCommandListener: function(listener) {
    var handlerIndex = EventHandlers.receiveTransCommand.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.receiveTransCommand.splice(handlerIndex, 1);
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
  addReceiveChatRoomMessageListener: function(listener) {
    EventHandlers.receiveChatRoomMessage.push(listener);
  },
  removeReceiveChatRoomMessageListener: function(listener) {
    var handlerIndex = EventHandlers.receiveChatRoomMessage.indexOf(listener);
    if (handlerIndex >= 0) {
      EventHandlers.receiveChatRoomMessage.splice(handlerIndex, 1);
    }
  },

  /**
   * 监听接收入群申请事件
   * @param {function} listener = function([{Message}])
   */
  addReceiveApplyJoinGroupApprovalListener: function(listener) {
    EventHandlers.receiveApplyJoinGroupApproval.push(listener);
  },
  removeReceiveApplyJoinGroupApprovalListener: function(listener) {
    var handlerIndex = EventHandlers.receiveApplyJoinGroupApproval.indexOf(
      listener
    );
    if (handlerIndex >= 0) {
      EventHandlers.receiveApplyJoinGroupApproval.splice(handlerIndex, 1);
    }
  },

  /**
   * 监听管理员拒绝入群申请事件
   * @param {function} listener = function([{Message}])
   */
  addReceiveGroupAdminRejectListener: function(listener) {
    EventHandlers.receiveGroupAdminReject.push(listener);
  },
  removeReceiveGroupAdminRejectListener: function(listener) {
    var handlerIndex = EventHandlers.receiveApplyJoinGroupApproval.indexOf(
      listener
    );
    if (handlerIndex >= 0) {
      EventHandlers.receiveGroupAdminReject.splice(handlerIndex, 1);
    }
  },

  /**
   * 监听管理员同意入群申请事件
   * @param {function} listener = function([{Message}])
   */
  addReceiveGroupAdminApprovalListener: function(listener) {
    EventHandlers.receiveGroupAdminApproval.push(listener);
  },
  removeReceiveGroupAdminApprovalListener: function(listener) {
    var handlerIndex = EventHandlers.receiveGroupAdminApproval.indexOf(
      listener
    );
    if (handlerIndex >= 0) {
      EventHandlers.receiveGroupAdminApproval.splice(handlerIndex, 1);
    }
  }
  // 事件监听 - end
};

module.exports = JMessagePlugin
