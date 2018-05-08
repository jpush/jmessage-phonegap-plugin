/**
 * This is a template for new plugin wrappers
 *
 * TODO:
 * - Add/Change information below
 * - Document usage (importing, executing main functionality)
 * - Remove any imports that you are not using
 * - Add this file to /src/index.ts (follow style of other plugins)
 * - Remove all the comments included in this template, EXCEPT the @Plugin wrapper docs and any other docs you added
 * - Remove this note
 *
 */
import {Injectable} from '@angular/core';
import {
  Plugin,
  Cordova,
  IonicNativePlugin
} from '@ionic-native/core';

/**
 * @name jmessage Chenyu
 * @description
 * This plugin does something
 *
 *
 * ...
 *
 *
 *
 * ```
 */
@Plugin({
  pluginName: 'JMessagePlugin',
  plugin: 'jmessage-phonegap-plugin', // npm package name, example: cordova-plugin-camera
  pluginRef: 'JMessage', // the variable reference to call the plugin, example: navigator.geolocation
  repo: '', // the github repository URL for the plugin
  install: 'cordova plugin add jmessage-phonegap-plugin --variable APP_KEY=your_app_key', // OPTIONAL install command, in case the plugin requires variables
  installVariables: ['APP_KEY'], // OPTIONAL the plugin requires variables
  platforms: ['Android', 'iOS'] // Array of platforms supported, example: ['Android', 'iOS']
})
@Injectable()
export class JmessageChenyu extends IonicNativePlugin {

  /**
   * This function does something
   * @param obj {string} Some param to configure something
   * @param arg2 {number} Another param to configure something
   * @return {Promise<any>} Returns a promise that resolves when something happens
   */
  @Cordova()
  init(obj?: any): Promise<any> {
    return; // We add return; here to avoid any IDE / Compiler errors
  }

  @Cordova()
  setDebugMode(obj?: any): Promise<any> {
    return; // We add return; here to avoid any IDE / Compiler errors
  }

  @Cordova()
  register(obj?: any): Promise<any> {
    return; // We add return; here to avoid any IDE / Compiler errors
  }

  @Cordova()
  login(obj?: any): Promise<any> {
    return; // We add return; here to avoid any IDE / Compiler errors
  }

  @Cordova()
  logout(obj?: any): Promise<any> {
    return; // We add return; here to avoid any IDE / Compiler errors
  }

  @Cordova()
  getMyInfo(obj?: any): Promise<any> {
    return; // We add return; here to avoid any IDE / Compiler errors
  }

  @Cordova()
  getUserInfo(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  updateMyPassword(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  updateMyAvatar(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  downloadThumbUserAvatar(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  downloadOriginalUserAvatar(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  updateMyInfo(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  createGroup(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getGroupInfo(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  addGroupMembers(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  removeGroupMembers(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getGroupMembers(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  exitGroup(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  blockGroupMessage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  isGroupBlocked(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getBlockedGroupList(): Promise<any> {
    return;
  }

  @Cordova()
  sendTextMessage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  sendImageMessage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  sendVoiceMessage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  sendCustomMessage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  sendLocationMessage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  sendFileMessage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  retractMessage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getHistoryMessages(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getMessageById(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  deleteMessageById(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  downloadOriginalImage(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  downloadVoiceFile(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  downloadFile(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  sendSingleTransCommand(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  sendGroupTransCommand(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  createConversation(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  deleteConversation(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  enterConversation(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  exitConversation(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getConversation(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getConversations(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  resetUnreadMessageCount(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  sendInvitationRequest(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  acceptInvitation(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  declineInvitation(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getFriends(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  removeFromFriendList(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  updateFriendNoteName(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  updateFriendNoteText(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  addUsersToBlacklist(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  removeUsersFromBlacklist(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getBlacklist(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  setNoDisturb(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  setNoDisturbGlobal(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  isNoDisturbGlobal(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  getNoDisturbList(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  setNotificationFlag(obj?: any): Promise<any> {
    return;
  }

  @Cordova()
  addReceiveMessageListener(obj?: any) {
  }

  @Cordova()
  removeReceiveMessageListener(obj?: any) {
  }

  @Cordova()
  addClickMessageNotificationListener(obj?: any) {
  }

  @Cordova()
  removeClickMessageNotificationListener(obj?: any) {
  }

  @Cordova()
  addSyncOfflineMessageListener(obj?: any) {
  }

  @Cordova()
  removeSyncOfflineMessageListener(obj?: any) {

  }

  @Cordova()
  addLoginStateChangedListener(obj?: any) {
  }

  @Cordova()
  removeLoginStateChangedListener(obj?: any) {
  }

  @Cordova()
  addContactNotifyListener(obj?: any) {
  }

  @Cordova()
  removeContactNotifyListener(obj?: any) {
  }

  @Cordova()
  addSyncRoamingMessageListener(obj?: any) {
  }

  @Cordova()
  removeSyncRoamingMessageListener(obj?: any) {
  }

  @Cordova()
  addMessageRetractListener(obj?: any) {
  }

  @Cordova()
  removeMessageRetractListener(obj?: any) {
  }

}
