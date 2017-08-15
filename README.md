# JMessage PhoneGap / Cordova Plugin

[![release](https://img.shields.io/badge/release-3.0.10-blue.svg)](https://github.com/jpush/jmessage-phonegap-plugin/releases)
[![platforms](https://img.shields.io/badge/platforms-iOS%7CAndroid-lightgrey.svg)](https://github.com/jpush/jmessage-phonegap-plugin)
[![weibo](https://img.shields.io/badge/weibo-JPush-blue.svg)](http://weibo.com/jpush?refer_flag=1001030101_&is_all=1)

极光官方开发的[极光 IM](https://docs.jiguang.cn/jmessage/guideline/jmessage_guide/) cordova 插件，目前支持 iOS 和 Android 平台。

若只需要简单的聊天功能，可优先考虑使用 [JMessage Web SDK](https://docs.jiguang.cn/jmessage/client/im_sdk_js_v2/)。

**目前重构了 3.0.0 版本，Android, iOS 完全统一接口和对象字段，优化了 API 调用方式，不兼容老版本，升级时请注意。**

## 集成步骤

- 在线安装

  ```shell
  cordova plugin add jmessage-phonegap-plugin --variable APP_KEY=your_app_key
  ```

  或

  ```shell
  cordova plugin add https://github.com/jpush/jmessage-phonegap-plugin.git --variable APP_KEY=your_app_key
  ```
- 本地安装

  ```shell
  cordova plugin add <Plugin Path> --variable APP_KEY=your_app_key
  ```

## API

[API doc](./doc/api.md)

## FAQ

若要使用 CLI 来编译项目，注意应使用 *cordova compile* 而不是 *cordova build* 命令，因为 *cordova build* 可能会清除对插件文件中 AndroidManifest.xml 文件的修改。
具体的 Cordova CLI 用法可参考 [Cordova CLI 官方文档](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/index.html)。

### Android

- 发送图片、语音或文件消息，提示 'File not found'。

  1. 请先确认文件路径格式是否正确，需要为绝对路径，类似于：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
  2. 如果系统为 Android 6.0 以上，还需要在应用中动态请求存储（WRITE_EXTERNAL_STORAGE）权限。对于动态请求权限，可以使用这个[插件](https://github.com/dpa99c/cordova-diagnostic-plugin#requestruntimepermission)。

### iOS

- 收不到推送：请首先按照正确方式再次配置证书、描述文件，可参考 [iOS 证书设置指南](https://docs.jiguang.cn/jpush/client/iOS/ios_cer_guide/)。
- 设置 PushConfig.plist:
  - APP_KEY：应用标识
  - CHANNEL：渠道标识
  - IsProduction：是否为生产环境
  - IsIDFA：是否使用 IDFA 启动 SDK

## 更多

- QQ 群：413602425 / 524248013
- [极光官网文档](http://docs.jiguang.cn/guideline/jmessage_guide/)
- 有问题可访问[极光社区](http://community.jiguang.cn/)搜索和提问。
