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
#import <JMessage/JMSGConstants.h>

@class JMSGUser;

/*!
 * 群信息类（用于修改群信息、创建群）
 */
@interface JMSGGroupInfo : NSObject

/** 群名称 */
@property(nonatomic, strong) NSString *JMSG_NONNULL name;
/** 群描述 */
@property(nonatomic, strong) NSString *JMSG_NONNULL desc;
/** 群头像数据 */
@property(nonatomic, strong) NSData   *JMSG_NONNULL avatarData;

@end


/*!
 * 群组
 *
 * 群组表示一组用户, 是群组聊天的聊天对象.
 *
 * 主要包含两类 API: 群组信息维护, 群组成员变更.
 */
@interface JMSGGroup : NSObject

JMSG_ASSUME_NONNULL_BEGIN


///----------------------------------------------------
/// @name Group Info Maintenance 群组信息维护
///----------------------------------------------------

/*!
 * @abstract 创建群组
 *
 * @param groupName 群组名称
 * @param groupDesc 群组描述信息
 * @param usernameArray 初始成员列表。NSArray 里的类型是 NSString
 * @param handler 结果回调。正常返回 resultObject 的类型是 JMSGGroup。
 *
 * @discussion 向服务器端提交创建群组请求，返回生成后的群组对象.
 * 返回群组对象, 群组ID是App 需要关注的, 是后续各种群组维护的基础.
 */
+ (void)createGroupWithName:(NSString * JMSG_NULLABLE )groupName
                       desc:(NSString *JMSG_NULLABLE)groupDesc
                memberArray:(NSArray JMSG_GENERIC(__kindof NSString *) *JMSG_NULLABLE)usernameArray
          completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 创建群组
 *
 * @param groupInfo     群信息类，详细请查看 JMSGGroupInfo 类
 * @param usernameArray 初始成员列表。NSArray 里的类型是 NSString
 * @param handler       结果回调。正常返回 resultObject 的类型是 JMSGGroup。
 *
 * @discussion 向服务器端提交创建群组请求，返回生成后的群组对象.
 * 返回群组对象, 群组ID是App 需要关注的, 是后续各种群组维护的基础.
 */
+ (void)createGroupWithGroupInfo:(JMSGGroupInfo *)groupInfo
                     memberArray:(NSArray JMSG_GENERIC(__kindof NSString *) *JMSG_NULLABLE)usernameArray
               completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;
/*!
 * @abstract 更新群组信息
 *
 * @param groupId 待更新的群组ID
 * @param groupName 新名称
 * @param groupDesc 新描述
 * @param handler 结果回调. 正常返回时, resultObject 为 nil.
 *
 * @discussion 注意：name 和 desc 不允许传空字符串
 */
+ (void)updateGroupInfoWithGroupId:(NSString *)groupId
                              name:(NSString *JMSG_NULLABLE)groupName
                              desc:(NSString *JMSG_NULLABLE)groupDesc
                 completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 更新群头像（支持传图片格式）
 *
 * @param groupId         待更新的群组ID
 * @param avatarData      头像数据
 * @param avatarFormat    头像格式，可以为空，不包括"."
 * @param handler         回调
 *
 * @discussion 头像格式参数直接填格式名称，不要带点。正确：@"png"，错误：@".png"
 */
+ (void)updateGroupAvatarWithGroupId:(NSString *JMSG_NONNULL)groupId
                          avatarData:(NSData *JMSG_NONNULL)avatarData
                        avatarFormat:(NSString *JMSG_NULLABLE)avatarFormat
                   completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;
/*!
 * @abstract 更新群信息
 *
 * @param gid         群组 id
 * @param groupInfo   群信息类，详细请查看 JMSGGroupInfo 类
 * @param handler     结果回调. 正常返回时, resultObject 为 nil.
 *
 * @discussion 注意：修改群名称和群描述时参数不允许传空字符串
 */
+ (void)updateGroupInfoWithGid:(NSString *)gid
                     groupInfo:(JMSGGroupInfo *)groupInfo
             completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 获取群组信息
 *
 * @param groupId 待获取详情的群组ID
 * @param handler 结果回调. 正常返回时 resultObject 类型是 JMSGGroup.
 *
 * @discussion 该接口总是向服务器端发起请求, 即使本地已经存在.
 * 如果考虑性能损耗, 在群聊时获取群组信息, 可以获取 JMSGConversation -> target 属性.
 */
+ (void)groupInfoWithGroupId:(NSString *)groupId
           completionHandler:(JMSGCompletionHandler)handler;

/*!
 * @abstract 获取我的群组列表
 *
 * @param handler 结果回调。正常返回时 resultObject 的类型是 NSArray，数组里的成员类型是JMSGGroup的gid
 *
 * @discussion 该接口总是向服务器端发起请求。
 */
+ (void)myGroupArray:(JMSGCompletionHandler)handler;

/*!
 * @abstract 获取所有设置群消息屏蔽的群组
 *
 * @param handler 结果回调。回调参数：
 *
 * - resultObject 类型为 NSArray，数组里成员的类型为 JMSGGroup
 * - error 错误信息
 *
 * 如果 error 为 nil, 表示设置成功
 * 如果 error 不为 nil,表示设置失败
 *
 * @discussion 从服务器获取，返回所有设置群消息屏蔽的群组。
 */
+ (void)shieldList:(JMSGCompletionHandler)handler;

///----------------------------------------------------
/// @name Group basic fields 群组基本属性
///----------------------------------------------------


/*!
 * @abstract 群组ID
 *
 * @discussion 该ID由服务器端生成，全局唯一。可以用于服务器端 API。
 */
@property(nonatomic, strong, readonly) NSString *gid;

/*!
 * @abstract 群组名称
 *
 * @discussion 可用于群组聊天的展示名称
 */
@property(nonatomic, copy, readonly) NSString * JMSG_NULLABLE name;

/*!
 * @abstract 群组描述信息
 */
@property(nonatomic, copy, readonly) NSString * JMSG_NULLABLE desc;

/*!
 * @abstract 群组等级
 *
 * @discussion 不同等级的群组，人数上限不同。当前默认等级 4，人数上限 200。客户端不可更改。
 */
@property(nonatomic, strong, readonly) NSNumber *level;

/*!
 * @abstract 群组头像（媒体文件ID）
 *
 * @discussion 此文件ID仅用于内部更新，不支持外部URL。
 */
@property(nonatomic, strong, readonly) NSString * JMSG_NULLABLE avatar;

/*!
 * @abstract 群组设置标志位
 *
 * @discussion 这是一个内部状态标志，对外展示仅用于调试目的。客户端不可更改。
 */
@property(nonatomic, strong, readonly) NSNumber *flag;

/*!
 * @abstract 群主（用户的 username）
 *
 * @discussion 有一套确认群主的策略。简单地说，群创建人是群主；如果群主退出，则是第二个加入的人，以此类似。客户端不可更改。
 */
@property(nonatomic, copy, readonly) NSString *owner;

/*!
 * @abstract 群主的appKey
 *
 * @discussion 当有跨应用群成员与群主同名(username相同)时，可结合用这个ownerAppKey来判断群主。
 */
@property(nonatomic, copy, readonly) NSString *ownerAppKey;

/*!
 * @abstract 群组人数上限，
 *
 * @discussion 表示当前群组人数上限，客户端不可更改。。
 */
@property(nonatomic, strong, readonly) NSString *maxMemberCount;

/*!
 * @abstract 该群是否已被设置为免打扰
 *
 * @discussion YES:是 , NO: 否
 */
@property(nonatomic, assign, readonly) BOOL isNoDisturb;

/*!
 * @abstract 该群是否已被设置为消息屏蔽
 *
 * @discussion YES:是 , NO: 否
 */
@property(nonatomic, assign, readonly) BOOL isShieldMessage;

/*!
 * @abstract 设置群组消息免打扰（支持跨应用设置）
 *
 * @param isNoDisturb 是否免打扰 YES:是 NO: 否
 * @param handler 结果回调。回调参数：
 *
 * - resultObject 相应对象
 * - error 错误信息
 *
 * 如果 error 为 nil, 表示设置成功
 * 如果 error 不为 nil,表示设置失败
 *
 * @discussion 针对单个群组设置免打扰
 * 这个接口支持跨应用设置免打扰
 */
- (void)setIsNoDisturb:(BOOL)isNoDisturb handler:(JMSGCompletionHandler)handler;

/*!
 * @abstract 设置群组消息屏蔽
 *
 * @param isShield 是否群消息屏蔽 YES:是 NO: 否
 * @param handler 结果回调。回调参数：
 *
 * - resultObject 相应对象
 * - error 错误信息
 *
 * 如果 error 为 nil, 表示设置成功
 * 如果 error 不为 nil,表示设置失败
 *
 * @discussion 针对单个群组设置群消息屏蔽
 */
- (void)setIsShield:(BOOL)isShield handler:(JMSGCompletionHandler)handler;


///----------------------------------------------------
/// @name Group members maintenance 群组成员维护
///----------------------------------------------------


/*!
 * @abstract 获取群组成员列表（同步接口，建议使用异步接口）
 *
 * @return 成员列表. NSArray 里成员类型是 JMSGUser.
 *
 * @discussion 一般在群组详情界面调用此接口，展示群组的所有成员列表。
 * 本接口只是在本地请求成员列表，不会发起服务器端请求。
 */
- (NSArray JMSG_GENERIC(__kindof JMSGUser *)*)memberArray;

/*!
 * @abstract 获取群组成员列表（异步接口）
 *
 * @handler 成员列表. NSArray 里成员类型是 JMSGUser.
 *
 * @discussion 一般在群组详情界面调用此接口，展示群组的所有成员列表。
 * 本接口只是在本地请求成员列表，不会发起服务器端请求。
 */
- (void)memberArrayWithCompletionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 添加群组成员
 *
 * @param usernameArray 用户名数组。数组里的成员类型是 NSString
 * @param handler 结果回调。正常返回时 resultObject 为 nil.
 */
- (void)addMembersWithUsernameArray:(NSArray JMSG_GENERIC(__kindof NSString *) *)usernameArray
                  completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 添加群组跨应用成员
 *
 * @param usernameArray 用户名数组。数组里的成员类型是 NSString
 * @param handler 结果回调。正常返回时 resultObject 为 nil.
 */
- (void)addMembersWithUsernameArray:(NSArray JMSG_GENERIC(__kindof NSString *) *)usernameArray
                             appKey:(NSString *)userAppKey
                  completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 删除群组成员
 *
 * @param usernameArray 用户名数据. 数组里的成员类型是 NSString
 * @param handler 结果回调。正常返回时 resultObject 为 nil.
 */
- (void)removeMembersWithUsernameArray:(NSArray JMSG_GENERIC(__kindof NSString *) *)usernameArray
                     completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 删除群组跨应用成员
 *
 * @param usernameArray 用户名数据. 数组里的成员类型是 NSString
 * @param handler 结果回调。正常返回时 resultObject 为 nil.
 */
- (void)removeMembersWithUsernameArray:(NSArray JMSG_GENERIC(__kindof NSString *) *)usernameArray
                                appKey:(NSString *)userAppKey
                     completionHandler:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 退出当前群组(当前用户)
 *
 * @param handler 结果回调。正常返回时 resultObject 为 nil。
 */
- (void)exit:(JMSGCompletionHandler JMSG_NULLABLE)handler;

/*!
 * @abstract 获取头像缩略图文件数据
 *
 * @param handler 结果回调。回调参数:
 *
 * - data     头像数据;
 * - objectId 群组 gid;
 * - error    不为nil表示出错;
 *
 * 如果 error 为 nil, data 也为 nil, 表示没有头像数据.
 *
 * @discussion 需要展示缩略图时使用。
 * 如果本地已经有文件，则会返回本地，否则会从服务器上下载。
 */
- (void)thumbAvatarData:(JMSGAsyncDataHandler)handler;

/*!
 * @abstract 获取头像缩略文件的本地路径
 *
 * @return 返回本地路，返回值只有在下载完成之后才有意义
 */
- (NSString *JMSG_NULLABLE)thumbAvatarLocalPath;

/*!
 * @abstract 获取头像大图文件数据
 *
 * @param handler 结果回调。回调参数:
 *
 * - data     头像数据;
 * - objectId 群组 gid;
 * - error    不为nil表示出错;
 *
 * 如果 error 为 nil, data 也为 nil, 表示没有头像数据.
 *
 * @discussion 需要展示大图图时使用
 * 如果本地已经有文件，则会返回本地，否则会从服务器上下载。
 */
- (void)largeAvatarData:(JMSGAsyncDataHandler)handler;

/*!
 * @abstract 获取头像大图文件的本地路径
 *
 * @return 返回本地路，返回值只有在下载完成之后才有意义
 */
- (NSString *JMSG_NULLABLE)largeAvatarLocalPath;

/*!
 * @abstract 获取群组的展示名
 *
 * @discussion 如果 group.name 为空, 则此接口会拼接群组前 5 个成员的展示名返回.
 */
- (NSString *)displayName;

- (BOOL)isMyselfGroupMember;

- (BOOL)isEqualToGroup:(JMSGGroup * JMSG_NULLABLE)group;

JMSG_ASSUME_NONNULL_END

@end


