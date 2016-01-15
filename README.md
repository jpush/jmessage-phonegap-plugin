
# jmessage-phonegap-plugin

## 概要

**jmessage-phonegap-plugin** 是基于[极光IM](http://docs.jpush.io/guideline/jmessage_guide/)的Cordova 插件。 目前支持 iOS , Android 平台。

**jmessage-phonegap-plugin**  除了支持IM 功能外，还集成了原 [**jpush-phonegap-plugin**](https://github.com/jpush/jpush-phonegap-plugin) 插件


开发环境建议：

cordova 版本 5.4.0 

iOS平台：xcode 版本 7.2

Android 平台：Android Studio 1.5


## 安装

在线安装

```sh
cordova plugin add  xxx.git --variable JPUSH_APP_KEY="<your app key>"
```

或
下载代码后，在本地安装

```sh
cordova plugin add  <jmessage-phonegap-plugin路径>   --variable JPUSH_APP_KEY="<your app key>"
```

如何获得[极光APP_KEY](http://docs.jpush.io/guideline/statistical_report/)

## 依赖的其他 plugin

org.apache.cordova.device

```sh
cordova plugin add org.apache.cordova.device
```

## 使用示例

示例目录

`jmessage-phonegap-plugin/example/`



## API 

API 分为IM（聊天）API 和  Push(消息推送)两部分

[JMessage Api](http://docs.jpush.io/client/im_errorcode1/)

[Push API](https://github.com/jpush/jpush-phonegap-plugin)(和原Push 插件接口一样)


[API 返回错误码定义](http://docs.jpush.io/client/im_errorcode/)


## 其他

+ iOS 如何设置推送channel 和  修改appkey ？

    `在iOS 工程的 JMessageConfig.plist 中设置和修改`




