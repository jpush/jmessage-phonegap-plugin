
# jmessage-phonegap-plugin

## 概要

**jmessage-phonegap-plugin** 是基于[极光IM](http://docs.jpush.io/guideline/jmessage_guide/)的Cordova 插件。 目前支持 iOS , Android 平台。

**jmessage-phonegap-plugin**  除了支持IM 功能外，还集成了原 [**jpush-phonegap-plugin**](https://github.com/jpush/jpush-phonegap-plugin) 插件,  支持消息推送功能。


功能和特性：

**IM**
+ 用户注册/登录
+ 会话
+ 会话列表
+ 获取本地会话记录
+ 设置用户基本信息昵称，性别等

**Push**
+ 发送推送通知
+ 发送推送自定义消息
+ 设置推送标签和别名

开发环境建议：


cordova 版本 5.4.0 

iOS平台：xcode 版本 7.2

Android 平台：Android Studio 1.5





## 安装

在线安装

```sh
cordova plugin add  https://github.com/jpush/jmessage-phonegap-plugin.git --variable APP_KEY="<your app key>"
```

或 下载代码后，在本地安装

```sh
cordova plugin add  <jmessage-phonegap-plugin路径>   --variable APP_KEY="<your app key>"
```



如何获得[APP_KEY](http://docs.jpush.io/guideline/statistical_report/)





#### 安装依赖的其他 plugin

+ org.apache.cordova.device

```sh
cordova plugin add org.apache.cordova.device
```



## 使用示例

示例目录

`jmessage-phonegap-plugin/example/`





## API 

API 分为IM（聊天）API 和  Push(消息推送)两部分

+ [JMessage API](doc/JMessage_API.md)

+ [Push API](doc/JPush_API.md)

+ [API 返回错误码定义](http://docs.jpush.io/client/im_errorcode/)








