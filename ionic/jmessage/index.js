var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 *
 * TODO:
 * - Add Promise callback params type
 * - Add ChatRoom API
 * - Test ionic plugin
 * - Remove this note
 */
import { Injectable } from '@angular/core';
import { Plugin, Cordova, CordovaProperty, IonicNativePlugin } from '@ionic-native/core';
;
;
;
;
;
;
;
;
;
;
;
;
// TODO: to Promise
var JMChatRoom = (function () {
    function JMChatRoom() {
    }
    JMChatRoom.prototype.getChatRoomInfoListOfApp = function (params, success, fail) { };
    JMChatRoom.prototype.getChatRoomInfoListOfUser = function (success, fail) { };
    JMChatRoom.prototype.getChatRoomInfoListById = function (params, success, fail) { };
    JMChatRoom.prototype.getChatRoomOwner = function (params, success, fail) { };
    JMChatRoom.prototype.enterChatRoom = function (obj, success, fail) { };
    JMChatRoom.prototype.exitChatRoom = function (params, success, fail) { };
    JMChatRoom.prototype.getChatRoomConversation = function (params, success, fail) { };
    JMChatRoom.prototype.getChatRoomConversationList = function (success, fail) { };
    JMChatRoom.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    JMChatRoom.ctorParameters = function () { return []; };
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Function, Function]),
        __metadata("design:returntype", void 0)
    ], JMChatRoom.prototype, "getChatRoomInfoListOfApp", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function, Function]),
        __metadata("design:returntype", void 0)
    ], JMChatRoom.prototype, "getChatRoomInfoListOfUser", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Function, Function]),
        __metadata("design:returntype", void 0)
    ], JMChatRoom.prototype, "getChatRoomInfoListById", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Function, Function]),
        __metadata("design:returntype", void 0)
    ], JMChatRoom.prototype, "getChatRoomOwner", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Function, Function]),
        __metadata("design:returntype", void 0)
    ], JMChatRoom.prototype, "enterChatRoom", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Function, Function]),
        __metadata("design:returntype", void 0)
    ], JMChatRoom.prototype, "exitChatRoom", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Function, Function]),
        __metadata("design:returntype", void 0)
    ], JMChatRoom.prototype, "getChatRoomConversation", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function, Function]),
        __metadata("design:returntype", void 0)
    ], JMChatRoom.prototype, "getChatRoomConversationList", null);
    return JMChatRoom;
}());
export { JMChatRoom };
/**
 * @name jmessage
 * @description
 * This plugin does something
 */
var JMessagePlugin = (function (_super) {
    __extends(JMessagePlugin, _super);
    function JMessagePlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * This function does something
     * @param obj {string} Some param to configure something
     * @param arg2 {number} Another param to configure something
     * @return {Promise<any>} Returns a promise that resolves when something happens
     */
    JMessagePlugin.prototype.init = function (params) { };
    JMessagePlugin.prototype.setDebugMode = function (params) { };
    JMessagePlugin.prototype.register = function (params) {
        return;
    };
    JMessagePlugin.prototype.login = function (params) {
        return;
    };
    JMessagePlugin.prototype.logout = function () { };
    JMessagePlugin.prototype.setBadge = function (params) { };
    JMessagePlugin.prototype.getMyInfo = function () {
        return; // We add return; here to avoid any IDE / Compiler errors
    };
    JMessagePlugin.prototype.getUserInfo = function (params) {
        return;
    };
    JMessagePlugin.prototype.updateMyPassword = function (params) {
        return;
    };
    /**
     * 更新当前用户头像。
     * @param {object} params = {
     *  imgPath: string // 本地图片绝对路径。
     * }
     * 注意 Android 与 iOS 的文件路径是不同的：
     *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
     *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
     */
    JMessagePlugin.prototype.updateMyAvatar = function (params) {
        return;
    };
    JMessagePlugin.prototype.updateMyInfo = function (params) {
        return;
    };
    JMessagePlugin.prototype.updateGroupAvatar = function (params) {
        return;
    };
    JMessagePlugin.prototype.downloadThumbGroupAvatar = function (params) {
        return;
    };
    JMessagePlugin.prototype.downloadOriginalGroupAvatar = function (params) {
        return;
    };
    JMessagePlugin.prototype.setConversationExtras = function (params) {
        return;
    };
    JMessagePlugin.prototype.sendTextMessage = function (params) {
        return;
    };
    JMessagePlugin.prototype.sendImageMessage = function (params) {
        return;
    };
    JMessagePlugin.prototype.sendVoiceMessage = function (params) {
        return;
    };
    JMessagePlugin.prototype.sendCustomMessage = function (params) {
        return;
    };
    JMessagePlugin.prototype.sendLocationMessage = function (params) {
        return;
    };
    JMessagePlugin.prototype.sendFileMessage = function (params) {
        return;
    };
    JMessagePlugin.prototype.retractMessage = function (params) {
        return;
    };
    JMessagePlugin.prototype.getHistoryMessages = function (params) {
        return;
    };
    JMessagePlugin.prototype.getMessageById = function (params) {
        return;
    };
    JMessagePlugin.prototype.deleteMessageById = function (params) {
        return;
    };
    JMessagePlugin.prototype.sendInvitationRequest = function (params) {
        return;
    };
    JMessagePlugin.prototype.acceptInvitation = function (params) {
        return;
    };
    JMessagePlugin.prototype.declineInvitation = function (params) {
        return;
    };
    JMessagePlugin.prototype.removeFromFriendList = function (params) {
        return;
    };
    JMessagePlugin.prototype.updateFriendNoteName = function (params) {
        return;
    };
    JMessagePlugin.prototype.updateFriendNoteText = function (params) {
        return;
    };
    JMessagePlugin.prototype.getFriends = function () {
        return;
    };
    JMessagePlugin.prototype.createGroup = function (params) {
        return;
    };
    JMessagePlugin.prototype.getGroupIds = function () {
        return;
    };
    JMessagePlugin.prototype.getGroupInfo = function (params) {
        return;
    };
    JMessagePlugin.prototype.updateGroupInfo = function (params) {
        return;
    };
    JMessagePlugin.prototype.addGroupMembers = function (params) {
        return;
    };
    JMessagePlugin.prototype.removeGroupMembers = function (params) {
        return;
    };
    JMessagePlugin.prototype.exitGroup = function (params) {
        return;
    };
    JMessagePlugin.prototype.getGroupMembers = function (params) {
        return;
    };
    JMessagePlugin.prototype.addUsersToBlacklist = function (params) {
        return;
    };
    JMessagePlugin.prototype.removeUsersFromBlacklist = function (params) {
        return;
    };
    JMessagePlugin.prototype.getBlacklist = function () {
        return;
    };
    JMessagePlugin.prototype.setNoDisturb = function (params) {
        return;
    };
    JMessagePlugin.prototype.getNoDisturbList = function () {
        return;
    };
    JMessagePlugin.prototype.setNoDisturbGlobal = function (params) {
        return;
    };
    JMessagePlugin.prototype.isNoDisturbGlobal = function () {
        return;
    };
    JMessagePlugin.prototype.blockGroupMessage = function (params) {
        return;
    };
    JMessagePlugin.prototype.isGroupBlocked = function (params) {
        return;
    };
    JMessagePlugin.prototype.getBlockedGroupList = function () {
        return;
    };
    JMessagePlugin.prototype.downloadThumbUserAvatar = function (params) {
        return;
    };
    JMessagePlugin.prototype.downloadOriginalUserAvatar = function (params) {
        return;
    };
    JMessagePlugin.prototype.downloadThumbImage = function (params) {
        return;
    };
    JMessagePlugin.prototype.downloadOriginalImage = function (params) {
        return;
    };
    JMessagePlugin.prototype.downloadVoiceFile = function (params) {
        return;
    };
    JMessagePlugin.prototype.downloadFile = function (params) {
        return;
    };
    JMessagePlugin.prototype.createConversation = function (params) {
        return;
    };
    JMessagePlugin.prototype.deleteConversation = function (params) {
        return;
    };
    JMessagePlugin.prototype.enterConversation = function (params) {
        return;
    };
    JMessagePlugin.prototype.exitConversation = function (params) { };
    JMessagePlugin.prototype.getConversation = function (params) {
        return;
    };
    JMessagePlugin.prototype.getConversations = function () {
        return;
    };
    JMessagePlugin.prototype.resetUnreadMessageCount = function (params) {
        return;
    };
    JMessagePlugin.prototype.enterChatRoom = function (params) {
        return;
    };
    JMessagePlugin.prototype.exitChatRoom = function (params) {
        return;
    };
    JMessagePlugin.prototype.getChatRoomConversation = function (params) {
        return;
    };
    JMessagePlugin.prototype.getChatRoomConversationList = function () {
        return;
    };
    JMessagePlugin.prototype.addReceiveMessageListener = function (params) {
    };
    JMessagePlugin.prototype.removeReceiveMessageListener = function (params) {
    };
    JMessagePlugin.prototype.addClickMessageNotificationListener = function (params) {
    };
    JMessagePlugin.prototype.removeClickMessageNotificationListener = function (params) {
    };
    JMessagePlugin.prototype.addSyncOfflineMessageListener = function (params) {
    };
    JMessagePlugin.prototype.removeSyncOfflineMessageListener = function (params) {
    };
    JMessagePlugin.prototype.addSyncRoamingMessageListener = function (params) {
    };
    JMessagePlugin.prototype.removeSyncRoamingMessageListener = function (params) {
    };
    JMessagePlugin.prototype.addLoginStateChangedListener = function (params) {
    };
    JMessagePlugin.prototype.removeLoginStateChangedListener = function (params) {
    };
    JMessagePlugin.prototype.addContactNotifyListener = function (params) {
    };
    JMessagePlugin.prototype.removeContactNotifyListener = function (params) {
    };
    JMessagePlugin.prototype.addMessageRetractListener = function (params) {
    };
    JMessagePlugin.prototype.removeMessageRetractListener = function (params) {
    };
    JMessagePlugin.prototype.addReceiveTransCommandListener = function (params) {
    };
    JMessagePlugin.prototype.removeReceiveTransCommandListener = function (params) {
    };
    JMessagePlugin.prototype.addReceiveChatRoomMessageListener = function (params) {
    };
    JMessagePlugin.prototype.removeReceiveChatRoomMessageListener = function (params) {
    };
    JMessagePlugin.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    JMessagePlugin.ctorParameters = function () { return []; };
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "init", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "setDebugMode", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "register", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "login", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "logout", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "setBadge", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getMyInfo", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getUserInfo", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "updateMyPassword", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "updateMyAvatar", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "updateMyInfo", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "updateGroupAvatar", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "downloadThumbGroupAvatar", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "downloadOriginalGroupAvatar", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "setConversationExtras", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "sendTextMessage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "sendImageMessage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "sendVoiceMessage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "sendCustomMessage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "sendLocationMessage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "sendFileMessage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "retractMessage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getHistoryMessages", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getMessageById", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "deleteMessageById", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "sendInvitationRequest", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "acceptInvitation", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "declineInvitation", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "removeFromFriendList", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "updateFriendNoteName", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "updateFriendNoteText", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getFriends", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "createGroup", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getGroupIds", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getGroupInfo", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "updateGroupInfo", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "addGroupMembers", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "removeGroupMembers", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "exitGroup", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getGroupMembers", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "addUsersToBlacklist", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "removeUsersFromBlacklist", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getBlacklist", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "setNoDisturb", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getNoDisturbList", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "setNoDisturbGlobal", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "isNoDisturbGlobal", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "blockGroupMessage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "isGroupBlocked", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getBlockedGroupList", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "downloadThumbUserAvatar", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "downloadOriginalUserAvatar", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "downloadThumbImage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "downloadOriginalImage", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "downloadVoiceFile", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "downloadFile", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "createConversation", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "deleteConversation", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "enterConversation", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "exitConversation", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getConversation", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getConversations", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "resetUnreadMessageCount", null);
    __decorate([
        CordovaProperty,
        __metadata("design:type", JMChatRoom)
    ], JMessagePlugin.prototype, "ChatRoom", void 0);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "enterChatRoom", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "exitChatRoom", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getChatRoomConversation", null);
    __decorate([
        Cordova(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], JMessagePlugin.prototype, "getChatRoomConversationList", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addReceiveMessageListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeReceiveMessageListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addClickMessageNotificationListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeClickMessageNotificationListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addSyncOfflineMessageListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeSyncOfflineMessageListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addSyncRoamingMessageListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeSyncRoamingMessageListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addLoginStateChangedListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeLoginStateChangedListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addContactNotifyListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeContactNotifyListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addMessageRetractListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeMessageRetractListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addReceiveTransCommandListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeReceiveTransCommandListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "addReceiveChatRoomMessageListener", null);
    __decorate([
        Cordova({
            sync: true,
            platforms: ['iOS', 'Android']
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", void 0)
    ], JMessagePlugin.prototype, "removeReceiveChatRoomMessageListener", null);
    JMessagePlugin = __decorate([
        Plugin({
            pluginName: 'JMessagePlugin',
            plugin: 'jmessage-phonegap-plugin',
            pluginRef: 'JMessage',
            repo: 'https://github.com/jpush/jmessage-phonegap-plugin',
            install: 'cordova plugin add jmessage-phonegap-plugin --variable APP_KEY=your_app_key',
            installVariables: ['APP_KEY'],
            platforms: ['Android', 'iOS']
        })
    ], JMessagePlugin);
    return JMessagePlugin;
}(IonicNativePlugin));
export { JMessagePlugin };
//# sourceMappingURL=index.js.map