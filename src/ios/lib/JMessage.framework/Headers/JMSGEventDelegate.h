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
#import <JMessage/JMSGNotificationEvent.h>

/*!
 * 监听通知事件
 */
@protocol JMSGEventDelegate <NSObject>

/*!
 * @abstract 监听通知事件
 *
 * @param event 下发的通知事件，事件类型请查看 JMSGNotificationEvent 类
 *
 * @discussion SDK 收到服务器端下发事件后，会以通知代理的方式给到上层,上层通过 event.eventType 判断具体事件.
 *
 * 注意：
 *
 * 非消息事件，如：用户登录状态变更、被踢下线、加好友等，SDK会作为通知事件下发,上层通过此方法可监听此类非消息事件.
 *
 * 消息事件，如：群事件，SDK会作为一个特殊的消息类型下发，上层依旧通过 JMSGMessageDelegate 监听消息事件.
 */
@optional
- (void)onReceiveNotificationEvent:(JMSGNotificationEvent *)event;

/*!
 * @abstract 消息撤回事件
 *
 * @param retractEvent 下发的通知事件，事件类型请查看 JMSGMessageRetractEvent 类
 *
 * @discussion 收到此事件时，可以通过 event.conversation 判断是否属于某个会话
 *
 * @since 3.2.0
 */
@optional
- (void)onReceiveMessageRetractEvent:(JMSGMessageRetractEvent *)retractEvent;
@end

