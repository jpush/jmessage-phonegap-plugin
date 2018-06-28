import { IonicNativePlugin } from '@ionic-native/core';
export interface JMSingleType {
    type: 'single';
    username: string;
    appKey?: string;
}
export interface JMGroupType {
    type: 'group';
    groupId: string;
}
export interface JMChatRoomType {
    type: 'chatRoom';
    roomId: string;
}
export declare type JMAllType = (JMSingleType | JMGroupType | JMChatRoomType);
export interface JMMessageOptions {
    extras?: {
        [key: string]: string;
    };
    messageSendingOptions?: JMMessageSendOptions;
}
export interface JMConfig {
    isOpenMessageRoaming: boolean;
}
export interface JMError {
    code: string;
    description: string;
}
/**
 * Message type
 */
export interface JMNormalMessage {
    id: string;
    serverMessageId: string;
    isSend: boolean;
    from: JMUserInfo;
    target: (JMUserInfo | JMGroupInfo);
    createTime: number;
    extras?: {
        [key: string]: string;
    };
}
export declare type JMTextMessage = JMNormalMessage & {
    type: 'text';
    text: string;
};
export declare type JMVoiceMessage = JMNormalMessage & {
    type: 'voice';
    path?: string;
    duration: number;
};
export declare type JMImageMessage = JMNormalMessage & {
    type: 'image';
    thumbPath?: string;
};
export declare type JMFileMessage = JMNormalMessage & {
    type: 'file';
    fileName: string;
};
export declare type JMLocationMessage = JMNormalMessage & {
    type: 'location';
    longitude: number;
    latitude: number;
    scale: number;
    address?: string;
};
export declare type JMCustomMessage = JMNormalMessage & {
    type: 'custom';
    customObject: {
        [key: string]: string;
    };
};
export interface JMEventMessage {
    type: 'event';
    eventType: 'group_member_added' | 'group_member_removed' | 'group_member_exit';
    usernames: JMUserInfo[];
}
export declare type JMAllMessage = JMTextMessage | JMVoiceMessage | JMImageMessage | JMFileMessage | JMEventMessage;
export declare type JMMessageEventListener = (message: JMAllMessage) => void;
export declare type JMSyncOfflineMessageListener = (event: {
    conversation: JMConversationInfo;
    messageArray: JMAllMessage[];
}) => void;
export declare type JMSyncRoamingMessageListener = (event: {
    conversation: JMConversationInfo;
}) => void;
export declare type JMLoginStateChangedListener = (event: {
    type: 'user_password_change' | 'user_logout' | 'user_deleted' | 'user_login_status_unexpected';
}) => void;
export declare type JMContactNotifyListener = (event: {
    type: 'invite_received' | 'invite_accepted' | 'invite_declined' | 'contact_deleted';
    reason: string;
    fromUsername: string;
    fromUserAppKey?: string;
}) => void;
export declare type JMMessageRetractListener = (event: {
    conversation: JMConversationInfo;
    retractedMessage: JMAllMessage;
}) => void;
export declare type JMReceiveTransCommandListener = (event: {
    message: string;
    sender: JMUserInfo;
    receiver: JMUserInfo | JMGroupInfo;
    receiverType: 'single' | 'group';
}) => void;
export declare type JMReceiveChatRoomMessageListener = (event: {
    messageArray: JMAllMessage[];
}) => void;
export declare type JMReceiveApplyJoinGroupApprovalListener = (event: {
    eventId: string;
    groupId: string;
    isInitiativeApply: boolean;
    sendApplyUser: JMUserInfo;
    joinGroupUsers?: JMUserInfo[];
    reason?: string;
}) => void;
export declare type JMReceiveGroupAdminRejectListener = (event: {
    groupId: string;
    groupManager: JMUserInfo;
    reason?: string;
}) => void;
export declare type JMReceiveGroupAdminApprovalListener = (event: {
    isAgree: boolean;
    applyEventId: string;
    groupId: string;
    groupAdmin: JMUserInfo;
    users: JMUserInfo[];
}) => void;
/**
 * User Type
 */
export interface JMUserInfo {
    type: 'user';
    username: string;
    appKey?: string;
    nickname?: string;
    gender: 'male' | 'female' | 'unknown';
    avatarThumbPath: string;
    birthday?: number;
    region?: string;
    signature?: string;
    address?: string;
    noteName?: string;
    noteText?: string;
    isNoDisturb: boolean;
    isInBlackList: boolean;
    isFriend: boolean;
    extras?: {
        [key: string]: string;
    };
}
export interface JMGroupInfo {
    type: 'group';
    id: string;
    name?: string;
    desc?: string;
    level: number;
    owner: string;
    ownerAppKey?: string;
    maxMemberCount: number;
    isNoDisturb: boolean;
    isBlocked: boolean;
}
export interface JMChatRoomInfo {
    type: 'chatRoom';
    roomId: string;
    name: string;
    appKey?: string;
    description?: string;
    createTime: number;
    maxMemberCount?: number;
    memberCount: number;
}
export declare type JMConversationInfo = ({
    conversationType: 'single';
    target: JMUserInfo;
} | {
    conversationType: 'group';
    target: JMGroupInfo;
}) & {
    title: string;
    latestMessage: JMAllMessage;
    unreadCount: number;
};
export interface JMMessageSendOptions {
    /**
   * 接收方是否针对此次消息发送展示通知栏通知。
   * @type {boolean}
   * @defaultvalue
   */
    isShowNotification?: boolean;
    /**
     * 是否让后台在对方不在线时保存这条离线消息，等到对方上线后再推送给对方。
     * @type {boolean}
     * @defaultvalue
     */
    isRetainOffline?: boolean;
    /**
     * 是否开启了自定义接收方通知栏功能。
     * @type {?boolean}
     */
    isCustomNotificationEnabled?: boolean;
    /**
     * 设置此条消息在接收方通知栏所展示通知的标题。
     * @type {?string}
     */
    notificationTitle?: string;
    /**
     * 设置此条消息在接收方通知栏所展示通知的内容。
     * @type {?string}
     */
    notificationText?: string;
}
export declare class JMChatRoom {
    getChatRoomInfoListOfApp(params: {
        start: number;
        count: number;
    }, success: (chatroomList: JMChatRoomInfo[]) => void, fail: (error: JMError) => void): void;
    getChatRoomInfoListOfUser(success: (chatroomList: JMChatRoomInfo[]) => void, fail: (error: JMError) => void): void;
    getChatRoomInfoListById(params: {
        roomId: string;
    }, success: (chatroomList: JMChatRoomInfo[]) => void, fail: (error: JMError) => void): void;
    getChatRoomOwner(params: {
        roomId: string;
    }, success: (chatroomList: JMUserInfo) => void, fail: (error: JMError) => void): void;
    enterChatRoom(obj: {
        roomId: string;
    }, success: (conversation: JMConversationInfo) => void, fail: (error: JMError) => void): void;
    exitChatRoom(params: {
        roomId: string;
    }, success: () => void, fail: (error: JMError) => void): void;
    getChatRoomConversation(params: {
        roomId: string;
    }, success: () => void, fail: (error: JMError) => void): void;
    getChatRoomConversationList(success: (conversationList: JMConversationInfo[]) => void, fail: (error: JMError) => void): void;
}
/**
 * @name jmessage
 * @description
 * This plugin does something
 */
export declare class JMessagePlugin extends IonicNativePlugin {
    /**
     * This function does something
     * @param obj {string} Some param to configure something
     * @param arg2 {number} Another param to configure something
     * @return {Promise<any>} Returns a promise that resolves when something happens
     */
    init(params: JMConfig): void;
    setDebugMode(params: {
        enable: boolean;
    }): void;
    register(params: {
        username: string;
        password: string;
        nickname: string;
    }): Promise<void>;
    login(params: {
        username: string;
        password: string;
    }): Promise<void>;
    logout(): void;
    setBadge(params: {
        badge: number;
    }): void;
    getMyInfo(): Promise<JMUserInfo | {}>;
    getUserInfo(params: {
        username: string;
        appKey?: string;
    }): Promise<JMUserInfo>;
    updateMyPassword(params: {
        oldPwd: string;
        newPwd: string;
    }): Promise<void>;
    /**
     * 更新当前用户头像。
     * @param {object} params = {
     *  imgPath: string // 本地图片绝对路径。
     * }
     * 注意 Android 与 iOS 的文件路径是不同的：
     *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
     *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
     */
    updateMyAvatar(params: {
        imgPath: string;
    }): Promise<any>;
    updateMyInfo(params: {
        birthday?: number;
        gender?: 'male' | 'female' | 'unknown';
        extras?: {
            [key: string]: string;
        };
    }): Promise<any>;
    updateGroupAvatar(params: {
        id: string;
        imgPath: string;
    }): Promise<any>;
    downloadThumbGroupAvatar(params: {
        id: string;
    }): Promise<any>;
    downloadOriginalGroupAvatar(params: {
        id: string;
    }): Promise<any>;
    setConversationExtras(params: JMAllType & {
        extras: {
            [key: string]: string;
        };
    }): Promise<any>;
    sendTextMessage(params: JMAllType & JMMessageOptions & {
        text: string;
    }): Promise<any>;
    sendImageMessage(params: JMAllType & JMMessageOptions & {
        path: string;
    }): Promise<any>;
    sendVoiceMessage(params: JMAllType & JMMessageOptions & {
        path: string;
    }): Promise<any>;
    sendCustomMessage(params: JMAllType & JMMessageOptions & {
        customObject: {
            [key: string]: string;
        };
    }): Promise<any>;
    sendLocationMessage(params: JMAllType & JMMessageOptions & {
        latitude: number;
        longitude: number;
        scale: number;
        address: string;
    }): Promise<any>;
    sendFileMessage(params: JMAllType & JMMessageOptions & {
        path: string;
    }): Promise<any>;
    retractMessage(params: JMAllType & {
        messageId: string;
    }): Promise<any>;
    getHistoryMessages(params: (JMSingleType | JMGroupType) & {
        from: number;
        limit: number;
    }): Promise<any>;
    getMessageById(params: JMAllType & {
        messageId: string;
    }): Promise<any>;
    deleteMessageById(params: JMAllType & {
        messageId: string;
    }): Promise<any>;
    sendInvitationRequest(params: {
        username: string;
        reason: string;
        appKey?: string;
    }): Promise<any>;
    acceptInvitation(params: {
        username: string;
        appKey?: string;
    }): Promise<any>;
    declineInvitation(params: {
        username: string;
        reason: string;
        appKey?: string;
    }): Promise<any>;
    removeFromFriendList(params: {
        username: string;
        appKey?: string;
    }): Promise<any>;
    updateFriendNoteName(params: {
        username: string;
        noteName: string;
        appKey?: string;
    }): Promise<any>;
    updateFriendNoteText(params: {
        username: string;
        noteText: string;
        appKey?: string;
    }): Promise<any>;
    getFriends(): Promise<any>;
    createGroup(params: {
        groupType?: 'public' | 'private';
        name?: string;
        desc?: string;
    }): Promise<string>;
    getGroupIds(): Promise<any>;
    getGroupInfo(params: {
        id: string;
    }): Promise<any>;
    updateGroupInfo(params: {
        id: string;
        newName: string;
        newDesc?: string;
    } | {
        id: string;
        newDesc: string;
    }): Promise<any>;
    addGroupMembers(params: {
        id: string;
        usernameArray: string[];
        appKey?: string;
    }): Promise<any>;
    removeGroupMembers(params: {
        id: string;
        usernameArray: string[];
        appKey?: string;
    }): Promise<any>;
    exitGroup(params: {
        id: string;
    }): Promise<any>;
    getGroupMembers(params: {
        id: string;
    }): Promise<any>;
    addUsersToBlacklist(params: {
        usernameArray: string[];
        appKey?: string;
    }): Promise<any>;
    removeUsersFromBlacklist(params: {
        usernameArray: string[];
        appKey?: string;
    }): Promise<any>;
    getBlacklist(): Promise<any>;
    setNoDisturb(params: (JMSingleType | JMGroupType) & {
        isNoDisturb: boolean;
    }): Promise<any>;
    getNoDisturbList(): Promise<any>;
    setNoDisturbGlobal(params: {
        isNoDisturb: boolean;
    }): Promise<any>;
    isNoDisturbGlobal(): Promise<any>;
    blockGroupMessage(params: {
        id: string;
        isBlock: boolean;
    }): Promise<any>;
    isGroupBlocked(params: {
        id: string;
    }): Promise<any>;
    getBlockedGroupList(): Promise<any>;
    downloadThumbUserAvatar(params: {
        username: string;
        appKey?: string;
    }): Promise<any>;
    downloadOriginalUserAvatar(params: {
        username: string;
        appKey?: string;
    }): Promise<any>;
    downloadThumbImage(params: (JMSingleType | JMGroupType) & {
        messageId: string;
    }): Promise<any>;
    downloadOriginalImage(params: (JMSingleType | JMGroupType) & {
        messageId: string;
    }): Promise<any>;
    downloadVoiceFile(params: (JMSingleType | JMGroupType) & {
        messageId: string;
    }): Promise<any>;
    downloadFile(params: (JMSingleType | JMGroupType) & {
        messageId: string;
    }): Promise<any>;
    createConversation(params: JMAllType): Promise<any>;
    deleteConversation(params: JMAllType): Promise<any>;
    enterConversation(params: JMSingleType | JMGroupType): Promise<any>;
    exitConversation(params: JMSingleType | JMGroupType): void;
    getConversation(params: JMAllType): Promise<any>;
    getConversations(): Promise<any>;
    resetUnreadMessageCount(params: JMAllType): Promise<any>;
    /**
     * TODO:
     *
     * chatRoom internal api.
     */
    ChatRoom: JMChatRoom;
    enterChatRoom(params: {
        roomId: string;
    }): Promise<any>;
    exitChatRoom(params: {
        roomId: string;
    }): Promise<any>;
    getChatRoomConversation(params: {
        roomId: string;
    }): Promise<any>;
    getChatRoomConversationList(): Promise<any>;
    getAllUnreadCount(): Promise<{
        count: number;
    }>;
    addGroupAdmins(params: {
        groupId: string;
        usernames: string[];
        appKey?: string;
    }): Promise<any>;
    removeGroupAdmins(params: {
        groupId: string;
        usernames: string[];
        appKey?: string;
    }): Promise<any>;
    changeGroupType(params: {
        groupId: string;
        type: 'public' | 'private';
    }): Promise<any>;
    getPublicGroupInfos(params: {
        appKey: string;
        start: number;
        count: number;
    }): Promise<any>;
    applyJoinGroup(params: {
        groupId: string;
        reason?: string;
    }): Promise<any>;
    processApplyJoinGroup(params: {
        events: string[];
        isAgree: boolean;
        isRespondInviter: boolean;
        reason?: string;
    }): Promise<any>;
    dissolveGroup(params: {
        groupId: string;
    }): Promise<any>;
    addReceiveMessageListener(params: JMMessageEventListener): void;
    removeReceiveMessageListener(params: JMMessageEventListener): void;
    addClickMessageNotificationListener(params: JMMessageEventListener): void;
    removeClickMessageNotificationListener(params: JMMessageEventListener): void;
    addSyncOfflineMessageListener(params: JMSyncOfflineMessageListener): void;
    removeSyncOfflineMessageListener(params: JMSyncOfflineMessageListener): void;
    addSyncRoamingMessageListener(params: JMSyncRoamingMessageListener): void;
    removeSyncRoamingMessageListener(params: JMSyncRoamingMessageListener): void;
    addLoginStateChangedListener(params: JMLoginStateChangedListener): void;
    removeLoginStateChangedListener(params: JMLoginStateChangedListener): void;
    addContactNotifyListener(params: JMContactNotifyListener): void;
    removeContactNotifyListener(params: JMContactNotifyListener): void;
    addMessageRetractListener(params: JMMessageRetractListener): void;
    removeMessageRetractListener(params: JMMessageRetractListener): void;
    addReceiveTransCommandListener(params: JMReceiveTransCommandListener): void;
    removeReceiveTransCommandListener(params: JMReceiveTransCommandListener): void;
    addReceiveChatRoomMessageListener(params: JMReceiveChatRoomMessageListener): void;
    removeReceiveChatRoomMessageListener(params: JMReceiveChatRoomMessageListener): void;
    addReceiveApplyJoinGroupApprovalListener(params: JMReceiveApplyJoinGroupApprovalListener): void;
    removeReceiveApplyJoinGroupApprovalListener(params: JMReceiveApplyJoinGroupApprovalListener): void;
    addReceiveGroupAdminRejectListener(params: JMReceiveGroupAdminRejectListener): void;
    removeReceiveGroupAdminRejectListener(params: JMReceiveGroupAdminRejectListener): void;
    addReceiveGroupAdminApprovalListener(params: JMReceiveGroupAdminApprovalListener): void;
    removeReceiveGroupAdminApprovalListener(params: JMReceiveGroupAdminApprovalListener): void;
}
