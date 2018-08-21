# API

API 使用文档可以直接参考 [JMessagePlugin.js](../www/JMessagePlugin.js) 中的注释。

这里列出插件中会返回的各对象组成：

```js
UserInfo: {
    type: 'user',
    username: string,           // 用户名。
    appKey: string,             // 用户所属应用的 appKey。可与 username 共同作为用户的唯一标志。
    nickname: string,           // 昵称。
    gender: string,             // 'male' / 'female' / 'unknown'
    avatarThumbPath: string,    // 头像的缩略图地址。
    birthday: number,           // 日期的毫秒数。
    region: string,             // 地区。
    signature: string,          // 个性签名。
    address: string,            // 具体地址。
    noteName: string,           // 备注名。
    noteText: string,           // 备注信息。
    isNoDisturb: boolean,       // 是否免打扰。
    isInBlackList: boolean,     // 是否在黑名单中。
    isFriend:boolean            // 是否为好友。
}
```

```js
GroupInfo: {
    type: 'group',
    id: string,                 // 群组 id，
    name: string,               // 群组名称。
    desc: string,               // 群组描述。
    level: number,              // 群组等级，默认等级 4。
    owner: string,              // 群主的 username。
    ownerAppKey: string,        // 群主的 appKey。
    maxMemberCount: number,     // 最大成员数。
    isNoDisturb: boolean,       // 是否免打扰。
    isBlocked: boolean          // 是否屏蔽群消息。
}
```

```js
Conversation: {
    /**
    *   会话对象标题。
    *   如果为群聊：
    *       - 未设置群名称：自动使用群成员中前五个人的名称拼接成 title。
    *       - 设置了群名称，则显示群名称。
    *   如果为单聊：如果用户有昵称，显示昵称。否则显示 username。
    */
    title: string,
    latestMessage: Message, // 最近的一条消息对象。
    unreadCount: number,    // 未读消息数。
    conversationType: 'single' / 'group',
    target: UserInfo / GroupInfo    // 聊天对象信息。
}
```

## Message

```js
TextMessage: {
    id: string,                     // 消息 id。
    type: 'text',                   // 消息类型。
    from: UserInfo,                 // 消息发送者对象。
    target: UserInfo / GroupInfo,   // 消息接收者对象。可能是用户或群组。
    createTime: number,             // 发送消息时间。
    text: string,                   // 消息内容。
    extras: object                  // 附带的键值对对象。
}
```

```js
ImageMessage: {
    id: string,
    type: 'image',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    thumbPath: string              // 图片的缩略图路径。要下载原图需要调用 `downloadOriginalImage` 方法。
}
```

```js
VoiceMessage: {
    id: string,
    type: 'image',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    path: string,                   // 语音文件路径。
    duration: number                // 语音时长
}
```

```js
LocationMessage: {
    id: string,
    type: 'voice',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    address: string,                // 详细地址。
    longitude: number,              // 经度。
    latitude: number,               // 纬度。
    scale:number                    // 地图缩放比例。
}
```

```js
FileMessage: {
    id: string,
    type: 'file',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    fileName: string             // 文件名。要下载完整文件需要调用 `downloadFile` 方法。
}
```

```js
CustomMessage: {
    id: string,
    type: 'file',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    customObject: object         // 自定义键值对对象。
}
```

```js
Event: {
    type: 'event',
    eventType: string,       // 'group_member_added' / 'group_member_removed' / 'group_member_exit' / 'group_info_updated' / 'group_dissolved' / 'group_type_changed'
    usernames: Array         // 该事件涉及到的用户 username 数组。
}
```