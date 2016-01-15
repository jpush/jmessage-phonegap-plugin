
# jmessage-phonegap-plugin

## 说明

jmessage-phonegap-plugin  是极光IM 的 cordova 插件。 目的在于帮助用户快速集成 IM 功能。
同时，它也集成了推送功能。（原推送插件 xxx.git）

开发环境建议：
cordova 版本 5.4.0 
iOS平台：xcode 版本 7.2
Android 平台：Android Studio 1.5

## 安装

在线安装

`cordova plugin add  xxx.git --variable API_KEY= <your app key>`

或

`cordova plugin add  <jmessage-phonegap-plugin路径>   --variable API_KEY=<your app key>`



## 依赖的其他 plugin

org.apache.cordova.device

`cordova plugin add org.apache.cordova.device`

## 使用示例

示例目录

`jmessage-phonegap-plugin/example/`



## API 

API 分为IM（聊天）API 和  Push(消息推送)两部分

JMessage Api 
http://docs.jpush.io/client/im_errorcode1/

Push API(和原Push 插件中的一样)
https://github.com/jpush/jpush-phonegap-plugin

API 返回错误码定义
http://docs.jpush.io/client/im_errorcode/


## 其他

+ iOS 如何设置推送channel 和  修改appkey ？

`在iOS 工程的 JMessageConfig.plist 中设置和修改`




