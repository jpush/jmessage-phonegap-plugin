# JMessage PhoneGap / Cordova Plugin

[![release](https://img.shields.io/badge/release-1.0.0-blue.svg)](https://github.com/jpush/jmessage-phonegap-plugin/releases)
[![platforms](https://img.shields.io/badge/platforms-iOS%7CAndroid-lightgrey.svg)](https://github.com/jpush/jmessage-phonegap-plugin)
[![QQ Group](https://img.shields.io/badge/QQ%20Group-413602425-red.svg)](https://github.com/jpush/jmessage-phonegap-plugin)
[![weibo](https://img.shields.io/badge/weibo-JPush-blue.svg)](http://weibo.com/jpush?refer_flag=1001030101_&is_all=1)

JMessage PhoneGap / Cordova Plugin 是基于[极光 IM](http://docs.jpush.io/guideline/jmessage_guide/) 的 Cordova 插件，目前支持 iOS 和 Android 平台。

除了支持 IM 功能外，还集成了 [JPush PhoneGap Plugin](https://github.com/jpush/jpush-phonegap-plugin) 插件的功能，支持进行消息推送。

>JMessage PhoneGap Plugin 和 JPush PhoneGap Plugin 这两个插件不能同时安装。

>迁移到 JMessage Phonegap Plugin 前要先删除 JPush PhoneGap Plugin 插件，因为 JMessage PhoneGap Plugin 中已经包含了 JPush 的相关功能了。

> **注意**：需要 Cordova 5.0.0 或以上版本。

## 集成步骤
- 在线安装

		cordova plugin add https://github.com/jpush/jmessage-phonegap-plugin.git --variable APP_KEY=Your_app_key

- 本地安装

		cordova plugin add <Plugin Path> --variable APP_KEY=Your_app_key

	> [点击这里](http://docs.jpush.io/guideline/statistical_report/)查看如何获取 APP_KEY。

## API
API 分为 IM（聊天）和 Push（消息推送）两部分。具体可参考：
### IM
- [Android API](/doc/Android_detail_api.md)。
- [iOS API](/doc/iOS_detail_api.md)。

### Push
- [公共 API](https://github.com/jpush/jpush-phonegap-plugin/blob/master/doc/Common_detail_api.md)。
- [Android API](https://github.com/jpush/jpush-phonegap-plugin/blob/master/doc/Android_detail_api.md)。
- [iOS API](https://github.com/jpush/jpush-phonegap-plugin/blob/master/doc/iOS_API.md)。

## Demo
插件项目中的 */example* 目录下包含一个简单的示例，如果想参考可以将目录下的所有文件拷贝到具体 Cordova 项目的 */assets/www/* 目录下。

## 常见问题
若要使用 CLI 来编译项目，注意应使用 *cordova compile* 而不是 *cordova build* 命令，因为 *cordova build* 可能会清除对插件文件中 AndroidManifest.xml 文件的修改。
具体的 Cordova CLI 用法可参考 [Cordova CLI 官方文档](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/index.html)。

### Android
Eclipse 中 import PhoneGap 工程之后出现：*Type CallbackContext cannot be resolved to a type*。

解决方案：Eclipse 中右键单击工程名，Build Path -> Config Build Path -> Projects -> 选中工程名称 -> CordovaLib -> 点击 add。

### iOS
- 收不到推送：请首先按照正确方式再次配置证书、描述文件，可参考 [iOS 证书设置指南](http://docs.jpush.io/client/ios_tutorials/#ios_1)。
- 设置 PushConfig.plist:
	- APP_KEY：应用标识。
	- CHANNEL：渠道标识。
	- IsProduction：是否为生产环境。
	- IsIDFA：是否使用 IDFA 启动 SDK。

## 更多
- [极光官网文档](http://docs.jiguang.cn/guideline/jmessage_guide/)。
- 有问题可访问[极光社区](http://community.jpush.cn/)搜索和提问。
