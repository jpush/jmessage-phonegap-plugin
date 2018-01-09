/*
 *	| |    | |  \ \  / /  | |    | |   / _______|
 *	| |____| |   \ \/ /   | |____| |  / /
 *	| |____| |    \  /    | |____| |  | |   _____
 * 	| |    | |    /  \    | |    | |  | |  |____ |
 *  | |    | |   / /\ \   | |    | |  \ \______| |
 *  | |    | |  /_/  \_\  | |    | |   \_________|
 *
 * Copyright (c) 2011 ~ 2015 Shenzhen HXHG. All rights reserved.
 */

#import <Foundation/Foundation.h>
#import <JMessage/JMSGConversation.h>

/*!
 * @abstract 通知事件
 *
 * @discussion 服务器端下发的事件通知, 如：用户被踢下线,加好友, SDK 作为一个通知事件下发.
 * 上层通过 JMSGEventDelegate 类中的 -(void)onReceiveNotificationEvent: 代理方法接收事件,详见官方文档.
 *
 * 注意：消息事件(如：群事件)，SDK 依旧作为一个特殊的消息类型下发，依旧通过 JMSGMessageDelegate 接收消息事件.
 */
@interface JMSGNotificationEvent : NSObject

/*!
 * @abstract 事件类型
 * @discussion 参考事件类型的定义 JMSGEventNotificationType
 */
@property(nonatomic, assign, readonly) JMSGEventNotificationType eventType;

/*!
 * @abstract 事件的描述信息
 * @discussion 下发事件的文字描述，可能为空
 */
@property(nonatomic, strong, readonly) NSString *eventDescription;

@end


/*!
 * @abstract 消息撤回事件
 *
 * @discussion 上层通过 JMSGEventDelegate 类中的 -(void)onReceiveMessageRetractEvent: 代理方法监听此事件,详见官方文档.
 */
@interface JMSGMessageRetractEvent : JMSGNotificationEvent

/**
 * @abstract 消息撤回所属会话
 */
@property(nonatomic, strong, readonly) JMSGConversation *conversation;

/**
 * @abstract 撤回之后的消息
 */
@property(nonatomic, strong, readonly) JMSGMessage *retractMessage;

@end


/*!
 * @abstract 消息已读回执状态变更事件
 */
@interface JMSGMessageReceiptStatusChangeEvent : JMSGNotificationEvent
/**
 * @abstract 消息所属会话
 */
@property(nonatomic, strong, readonly) JMSGConversation *conversation;

/**
 * @abstract 已读回执变更的消息列表
 */
@property(nonatomic, strong, readonly) NSArray <__kindof JMSGMessage *>*messages;

@end


/*!
 * @abstract 消息透传事件
 */
@interface JMSGMessageTransparentEvent : JMSGNotificationEvent

/*!
 * @abstract 消息所属会话
 */
@property(nonatomic, strong, readonly) JMSGConversation *conversation;

/*!
 * @abstract 用户自定义透传内容
 */
@property(nonatomic, strong, readonly) NSString *transparentText;

@end


/*!
 * @abstract 申请入群事件
 */
@interface JMSGApplyJoinGroupEvent : JMSGNotificationEvent

/// 事件的 id
@property(nonatomic, strong, readonly) NSString *eventID;
/// 群 gid
@property(nonatomic, strong, readonly) NSString *groupID;
/// 是否是用户主动申请入群，YES：主动申请加入，NO：被邀请加入
@property(nonatomic, assign, readonly) BOOL isInitiativeApply;
/// 发起申请的 user
@property(nonatomic, strong, readonly) JMSGUser *sendApplyUser;
/// 被邀请入群的 user 数组
@property(nonatomic, strong, readonly) NSArray JMSG_GENERIC(__kindof JMSGUser *)*joinGroupUsers;
/// 原因
@property(nonatomic, strong, readonly) NSString *reason;

@end

/*!
 * @abstract 管理员拒绝入群申请事件
 */
@interface JMSGGroupAdminRejectApplicationEvent : JMSGNotificationEvent

/// 群 gid
@property(nonatomic, strong, readonly) NSString *groupID;
/// 拒绝原因
@property(nonatomic, strong, readonly) NSString *rejectReason;
/// 操作的管理员
@property(nonatomic, strong, readonly) JMSGUser *groupManager;

@end

