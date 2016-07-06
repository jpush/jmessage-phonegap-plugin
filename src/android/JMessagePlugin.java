package cn.jmessage.phonegap;

import android.app.Activity;
import android.content.Intent;
import android.media.MediaPlayer;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

import com.google.gson.Gson;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.CreateGroupCallback;
import cn.jpush.im.android.api.callback.GetBlacklistCallback;
import cn.jpush.im.android.api.callback.GetGroupIDListCallback;
import cn.jpush.im.android.api.callback.GetGroupInfoCallback;
import cn.jpush.im.android.api.callback.GetGroupMembersCallback;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.content.CustomContent;
import cn.jpush.im.android.api.content.EventNotificationContent;
import cn.jpush.im.android.api.content.ImageContent;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.content.VoiceContent;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.event.LoginStateChangeEvent;
import cn.jpush.im.android.api.event.MessageEvent;
import cn.jpush.im.android.api.event.NotificationClickEvent;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.api.BasicCallback;


public class JMessagePlugin extends CordovaPlugin {
    private static String TAG = "JMessagePlugin";

    private final static List<String> methodList = Arrays.asList(
            // Login and register API.
            "userRegister",
            "userLogin",
            "userLogout",
            // User info API.
            "getUserInfo",
            "getMyInfo",
            "updateMyInfo",
            "updateUserInfo",
            "updateMyPassword",
            "updateMyAvatar",
            // Message API.
            "sendSingleTextMessage",
            "sendSingleImageMessage",
            "sendSingleVoiceMessage",
            "sendSingleCustomMessage",
            "sendGroupTextMessage",
            "sendGroupImageMessage",
            "sendGroupVoiceMessage",
            "sendGroupCustomMessage",
            "getLatestMessage",
            "getHistoryMessages",
            "getAllMessages",
            // Conversation API.
            "getConversationList",
            "getSingleConversation",
            "getGroupConversation",
            "setSingleConversationUnreadMessageCount",
            "setGroupConversationUnreadMessageCount",
            "deleteSingleConversation",
            "deleteGroupConversation",
            "getAllSingleConversation",
            "enterSingleConversation",
            "enterGroupConversation",
            "exitConversation",
            // Group API.
            "createGroup",
            "getGroupIDList",
            "getGroupInfo",
            "updateGroupName",
            "updateGroupDescription",
            "addGroupMembers",
            "removeGroupMembers",
            "exitGroup",
            "getGroupMembers",
            // Black list API.
            "addUsersToBlacklist",
            "delUsersFromBlacklist",
            "getBlacklist",
            // Notification API.
            "setNotificationMode",
            // Other
            "setJMessageReceiveCallbackChannel"
    );

    private static JMessagePlugin instance;
    private ExecutorService threadPool = Executors.newFixedThreadPool(1);
    private Gson mGson = new Gson();
    private CallbackContext mJMessageReceiveCallback = null;
    private Activity mCordovaActivity;

    public JMessagePlugin() {
        instance = this;
    }

    protected void pluginInitialize() {
        Log.i(TAG, "Plugin initialize");

        mCordovaActivity = cordova.getActivity();

        JMessageClient.init(this.cordova.getActivity().getApplicationContext());
        JMessageClient.registerEventReceiver(this);
    }

    public void onEvent(MessageEvent event) {
        final Message msg = event.getMessage();
        Log.i(TAG, "onEvent:" + msg.toString());

        String jsonStr = mGson.toJson(msg);
        fireEvent("onReceiveMessage", jsonStr);

        try {
            switch (msg.getContentType()) {
                case text:  // 处理文字消息。
                    TextContent textContent = (TextContent) msg.getContent();
                    String text = textContent.getText();
                    JSONObject textJson = new JSONObject();
                    textJson.put("text", text);
                    fireEvent("onReceiveTextMessage", textJson.toString());
                    break;
                case image:
                    ImageContent imageContent = (ImageContent) msg.getContent();
                    String imagePath = imageContent.getLocalPath();
                    String thumbnailPath = imageContent.getLocalThumbnailPath();
                    JSONObject imageJson = new JSONObject();
                    imageJson.put("imagePath", imagePath);
                    imageJson.put("thumbnailPath", thumbnailPath);
                    fireEvent("onReceiveImageMessage", imageJson.toString());
                    break;
                case voice:
                    VoiceContent voiceContent = (VoiceContent) msg.getContent();
                    String voicePath = voiceContent.getLocalPath();
                    int duration = voiceContent.getDuration();
                    JSONObject voiceJson = new JSONObject();
                    voiceJson.put("voicePath", voicePath);
                    voiceJson.put("duration", duration);
                    fireEvent("onReceiveVoiceMessage", voiceJson.toString());
                    break;
                case custom:
                    CustomContent customContent = (CustomContent) msg.getContent();
                    // 获取自定义的值。
                    JSONObject customJson = new JSONObject();

                    Map<String, String> strMap = customContent.getAllStringValues();
                    for (String key : strMap.keySet()) {
                        customJson.put(key, strMap.get(key));
                    }

                    Map<String, Number> numMap = customContent.getAllNumberValues();
                    for (String key : strMap.keySet()) {
                        customJson.put(key, numMap.get(key));
                    }

                    Map<String, Boolean> boolMap = customContent.getAllBooleanValues();
                    for (String key : boolMap.keySet()) {
                        customJson.put(key, boolMap.get(key));
                    }
                    fireEvent("onReceiveCustomMessage", customJson.toString());
                    break;
                case eventNotification:
                    EventNotificationContent content = (EventNotificationContent)
                            msg.getContent();
                    switch (content.getEventNotificationType()) {
                        case group_member_added:    // 群成员加群事件。
                            fireEvent("onGroupMemberAdded", null);
                            break;
                        case group_member_removed:
                            // 群成员被踢事件（只有被踢的用户能收到此事件）。
                            fireEvent("onGroupMemberRemoved", null);
                            break;
                        case group_member_exit:
                            fireEvent("onGroupMemberExit", null);
                            break;
                        default:
                    }
                    break;
                case unknown:
                    break;
                default:
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void onEvent(LoginStateChangeEvent event) {
        LoginStateChangeEvent.Reason reason = event.getReason();// 获取变更的原因。
        switch (reason) {
            case user_password_change:
                fireEvent("onUserPasswordChanged", null);
                break;
            case user_logout:
                fireEvent("onUserLogout", null);
                break;
            case user_deleted:
                fireEvent("onUserDeleted", null);
                break;
            default:
        }
    }

    // 触发通知栏点击事件。
    public void onEvent(NotificationClickEvent event) {
        Message msg = event.getMessage();
        String json = mGson.toJson(msg);
        fireEvent("onOpenMessage", json);

        Intent launch = cordova.getActivity().getApplicationContext()
                .getPackageManager().getLaunchIntentForPackage(
                        cordova.getActivity().getApplicationContext().getPackageName());
        launch.addCategory(Intent.CATEGORY_LAUNCHER);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        cordova.getActivity().getApplicationContext().startActivity(launch);
    }

    private void fireEvent(String eventName, String jsonStr) {
        String format = "window.JMessage." + eventName + "(%s);";
        String js;
        if (jsonStr != null) {
            js = String.format(format, jsonStr);
        } else {
            js = String.format(format, "");
        }

        final String finalJs = js;
        mCordovaActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                instance.webView.loadUrl("javascript:" + finalJs);
            }
        });
    }

    @Override
    public boolean execute(final String action, final JSONArray data,
            final CallbackContext callback) throws JSONException {
        if (!methodList.contains(action)) {
            return false;
        }
        threadPool.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    Method method = JMessagePlugin.class.getDeclaredMethod(action,
                            JSONArray.class, CallbackContext.class);
                    method.invoke(JMessagePlugin.this, data, callback);
                } catch (Exception e) {
                    Log.e(TAG, e.toString());
                }
            }
        });
        return true;
    }

    public void onPause(boolean multitasking) {
        Log.i(TAG, "onPause");
    }

    public void onDestroy() {
        Log.i(TAG, " onDestroy");
        JMessageClient.unRegisterEventReceiver(this);
    }


    // Login and register API.

    public void userRegister(JSONArray data, CallbackContext callback) {
        Log.i(TAG, " JMessageRegister \n" + data);

        final CallbackContext cb = callback;
        try {
            String username = data.getString(0);
            String password = data.getString(1);

            JMessageClient.register(username, password, new BasicCallback() {
                @Override
                public void gotResult(final int status, final String desc) {
                    handleResult("", status, desc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json.");
        }
    }

    public void userLogin(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "  userLogin \n" + data);

        final CallbackContext cb = callback;
        try {
            String username = data.getString(0);
            String password = data.getString(1);

            JMessageClient.login(username, password, new BasicCallback() {
                @Override
                public void gotResult(final int status, final String desc) {
                    handleResult("", status, desc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json");
        }
    }

    public void userLogout(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "Logout \n" + data);
        try {
            JMessageClient.logout();
            callback.success();
        } catch (Exception exception) {
            callback.error(exception.toString());
        }
    }


    // User info API.

    public void getUserInfo(JSONArray data, final CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.isNull(1) ? "" : data.getString(1);
            JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
                @Override
                public void gotResult(int responseCode, String responseDesc,
                        UserInfo userInfo) {
                    if (responseCode == 0) {
                        String json = mGson.toJson(userInfo);
                        callback.success(json);
                    } else {
                        callback.error(responseDesc);
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getMyInfo(JSONArray data, CallbackContext callback) {
        UserInfo myInfo = JMessageClient.getMyInfo();
        if (myInfo != null) {
            String json = mGson.toJson(myInfo);
            callback.success(json);
        } else {
            callback.error("Get my info error.");
        }
    }

    public void updateMyInfo(JSONArray data, final CallbackContext callback) {
        try {
            String field = data.getString(0);
            String value = data.getString(1);

            UserInfo myInfo = JMessageClient.getMyInfo();
            if (updateUserInfo(myInfo, field, value)) {
                callback.success();
            } else {
                callback.error("Update my info error.");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void updateUserInfo(JSONArray data, final CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.isNull(1) ? "" : data.getString(1);
            String field = data.getString(2);
            String value = data.getString(3);

            UserInfo userInfo = getUserInfo(username, appKey);
            if (updateUserInfo(userInfo, field, value)) {
                callback.success();
            } else {
                callback.error("Update user info error.");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    /**
     * Update my password.
     *
     * @param data     JSONArray; data.getString(0): old password, data.getString(1): new password.
     * @param callback result callback method.
     */
    public void updateMyPassword(JSONArray data, CallbackContext callback) {
        final CallbackContext cb = callback;
        try {
            String oldPwd = data.getString(0);
            String newPwd = data.getString(1);
            JMessageClient.updateUserPassword(oldPwd, newPwd, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    handleResult("", status, desc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading password json.");
        }
    }

    /**
     * update my avatar.
     *
     * @param data     data.getString(0): the URL of the users avatar file.
     * @param callback callback method.
     */
    public void updateMyAvatar(JSONArray data, CallbackContext callback) {
        final CallbackContext cb = callback;
        try {
            String avatarUrlStr = data.getString(0);
            if (TextUtils.isEmpty(avatarUrlStr)) {
                callback.error("Avatar URL is empty!");
                return;
            }
            URL url = new URL(avatarUrlStr);
            String path = url.getPath();
            File avatarFile = new File(path);
            JMessageClient.updateUserAvatar(avatarFile, new BasicCallback() {
                @Override
                public void gotResult(int status, String errorDesc) {
                    handleResult("", status, errorDesc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Reading alias JSON error.");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            callback.error("Avatar URL error.");
        }
    }


    // Message API.

    public void sendSingleTextMessage(JSONArray data, final CallbackContext callback) {
        Log.i(TAG, "sendSingleTextMessage \n" + data);

        try {
            String username = data.getString(0);
            String text = data.getString(1);
            String appKey = data.isNull(2) ? "" : data.getString(2);

            Conversation conversation = JMessageClient.getSingleConversation(
                    username, appKey);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(username,
                        appKey);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            TextContent content = new TextContent(text);
            final Message msg = conversation.createSendMessage(content);
            msg.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success(mGson.toJson(msg));
                    } else {
                        callback.error(status + ": " + desc);
                    }
                }
            });
            JMessageClient.sendMessage(msg);
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json.");
        }
    }

    /**
     * @param data     JSONArray.
     *                 data.getString(0):username, data.getString(1):text
     * @param callback CallbackContext.
     */
    public void sendSingleImageMessage(JSONArray data, final CallbackContext callback) {
        try {
            String userName = data.getString(0);
            String imgUrlStr = data.getString(1);
            String appKey = data.isNull(2) ? "" : data.getString(2);

            Conversation conversation = JMessageClient.getSingleConversation(
                    userName, appKey);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(userName,
                        appKey);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            URL imgUrl = new URL(imgUrlStr);
            File imgFile = new File(imgUrl.getPath());
            final Message msg = conversation.createSendImageMessage(imgFile);
            msg.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success(mGson.toJson(msg));
                    } else {
                        callback.error(status + ": " + desc);
                    }
                }
            });
            JMessageClient.sendMessage(msg);
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json data error");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callback.error("文件不存在");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
    }

    /**
     * @param data     JSONArray.
     *                 data.getString(0):username, data.getString(1):voiceFileUrl.
     * @param callback CallbackContext.
     */
    public void sendSingleVoiceMessage(JSONArray data, final CallbackContext callback) {
        try {
            String userName = data.getString(0);
            String voiceUrlStr = data.getString(1);
            String appKey = data.isNull(2) ? "" : data.getString(2);

            Conversation conversation = JMessageClient.getSingleConversation(
                    userName, appKey);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(userName,
                        appKey);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            URL url = new URL(voiceUrlStr);
            String voicePath = url.getPath();
            File file = new File(voicePath);

            MediaPlayer mediaPlayer = MediaPlayer.create(this.cordova.getActivity(),
                    Uri.parse(voicePath));
            int duration = mediaPlayer.getDuration();

            final Message msg = JMessageClient.createSingleVoiceMessage(userName, file,
                    duration);
            msg.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success(mGson.toJson(msg));
                    } else {
                        callback.error(status + ": " + desc);
                    }
                }
            });
            JMessageClient.sendMessage(msg);
            mediaPlayer.release();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json data error");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            callback.error("file url error");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callback.error("file not found.");
        }
    }

    /**
     * @param data     JSONArray.
     *                 data.getString(0):username, data.getJSONObject(1):custom key-values.
     * @param callback CallbackContext.
     */
    public void sendSingleCustomMessage(JSONArray data, final CallbackContext callback) {
        try {
            String userName = data.getString(0);
            String appKey = data.isNull(2) ? "" : data.getString(2);

            Conversation con = JMessageClient.getSingleConversation(userName,
                    appKey);
            if (con == null) {
                con = Conversation.createSingleConversation(userName, appKey);
            }
            if (con == null) {
                callback.error("无法创建对话");
                return;
            }

            String jsonStr = data.getString(1);
            JSONObject values = new JSONObject(jsonStr);
            Iterator<? extends String> keys = values.keys();
            Map<String, String> valuesMap = new HashMap<String, String>();

            String key, value;
            while (keys.hasNext()) {
                key = keys.next();
                value = values.getString(key);
                valuesMap.put(key, value);
            }
            final Message msg = JMessageClient.createSingleCustomMessage(userName,
                    valuesMap);
            msg.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success(mGson.toJson(msg));
                    } else {
                        callback.error(status + ": " + desc);
                    }
                }
            });
            JMessageClient.sendMessage(msg);
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    /**
     * @param data     JSONArray.
     *                 data.getLong(0):groupId, data.getString(1):text.
     * @param callback CallbackContext.
     */
    public void sendGroupTextMessage(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String text = data.getString(1);

            Conversation conversation = JMessageClient.getGroupConversation(groupId);
            if (conversation == null) {
                conversation = Conversation.createGroupConversation(groupId);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            final Message msg = JMessageClient.createGroupTextMessage(groupId, text);
            msg.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success(mGson.toJson(msg));
                    } else {
                        callback.error(status + ": " + desc);
                    }
                }
            });
            JMessageClient.sendMessage(msg);
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json.");
        }
    }

    public void sendGroupImageMessage(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String imgUrlStr = data.getString(1);

            Conversation conversation = JMessageClient.getGroupConversation(groupId);
            if (conversation == null) {
                conversation = Conversation.createGroupConversation(groupId);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            URL imgUrl = new URL(imgUrlStr);
            File imgFile = new File(imgUrl.getPath());
            final Message msg = JMessageClient.createGroupImageMessage(groupId, imgFile);
            msg.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success(mGson.toJson(msg));
                    } else {
                        callback.error(status + ": " + desc);
                    }
                }
            });
            JMessageClient.sendMessage(msg);
            callback.success(mGson.toJson(msg));
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callback.error("file not found.");
        }
    }

    public void sendGroupVoiceMessage(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String voiceUrlStr = data.getString(1);

            Conversation conversation = JMessageClient.getGroupConversation(groupId);
            if (conversation == null) {
                conversation = Conversation.createGroupConversation(groupId);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            URL url = new URL(voiceUrlStr);
            String voicePath = url.getPath();
            File file = new File(voicePath);

            MediaPlayer mediaPlayer = MediaPlayer.create(this.cordova.getActivity(),
                    Uri.parse(voicePath));
            int duration = mediaPlayer.getDuration();

            final Message msg = JMessageClient.createGroupVoiceMessage(groupId, file, duration);
            msg.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success(mGson.toJson(msg));
                    } else {
                        callback.error(status + ": " + desc);
                    }
                }
            });
            JMessageClient.sendMessage(msg);
            mediaPlayer.release();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json data error");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            callback.error("file url error");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callback.error("file not found.");
        }
    }

    /**
     * @param data     JSONArray.
     *                 data.getLong(0):groupID, data.getJSONObject(1):custom key-values.
     * @param callback CallbackContext.
     */
    public void sendGroupCustomMessage(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);

            Conversation con = JMessageClient.getGroupConversation(groupId);
            if (con == null) {
                con = Conversation.createGroupConversation(groupId);
            }
            if (con == null) {
                callback.error("无法建立对话");
                return;
            }

            String jsonStr = data.getString(1);
            JSONObject customValues = new JSONObject(jsonStr);
            Iterator<? extends String> keys = customValues.keys();
            String key, value;
            Map<String, String> valuesMap = new HashMap<String, String>();
            while (keys.hasNext()) {
                key = keys.next();
                value = customValues.getString(key);
                valuesMap.put(key, value);
            }
            final Message msg = JMessageClient.createGroupCustomMessage(groupId, valuesMap);
            msg.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success(mGson.toJson(msg));
                    } else {
                        callback.error(status + ": " + desc);
                    }
                }
            });
            JMessageClient.sendMessage(msg);
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json.");
        }
    }

    public void getLatestMessage(JSONArray data, CallbackContext callback) {
        try {
            String conversationType = data.getString(0);
            String value = data.getString(1);
            String appKey = data.isNull(2) ? "" : data.getString(2);
            Conversation conversation = getConversation(conversationType, value,
                    appKey);
            if (conversation == null) {
                callback.error("Conversation is not exist.");
                return;
            }
            Message msg = conversation.getLatestMessage();
            if (msg != null) {
                String json = mGson.toJson(msg);
                callback.success(json);
            } else {
                callback.error("Conversation is not contain message.");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getHistoryMessages(JSONArray data, CallbackContext callback) {
        try {
            String conversationType = data.getString(0);
            Conversation conversation;
            if (conversationType.equals("single")) {
                String username = data.getString(1);
                String appKey = data.isNull(2) ? "" : data.getString(2);
                Log.i(TAG, "username:" + username + "; appKey:" + appKey);
                conversation = JMessageClient.getSingleConversation(
                        username, appKey);
                if (conversation == null) {
                    conversation = Conversation.createSingleConversation(
                            username, appKey);
                }
            } else if (conversationType.equals("group")) {
                long groupId = data.getLong(1);
                conversation = JMessageClient.getGroupConversation(groupId);
                if (conversation == null) {
                    conversation = Conversation.createGroupConversation(groupId);
                }
            } else {
                callback.error("Conversation type error.");
                return;
            }

            if (conversation == null) {
                callback.error("Can't get conversation.");
                return;
            }

            int from = data.getInt(3);
            int limit = data.getInt(4);

            List<Message> messages = conversation.getMessagesFromNewest(
                    from, limit);
            if (!messages.isEmpty()) {
                String json = mGson.toJson(messages);
                callback.success(json);
            } else {
                callback.error("Conversation isn't contain message.");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getAllMessages(JSONArray data, CallbackContext callback) {
        try {
            String type = data.getString(0);
            Conversation conversation;
            if (type.equals("single")) {
                String username = data.getString(1);
                String appKey = data.isNull(2) ? "" : data.getString(2);
                conversation = JMessageClient.getSingleConversation(
                        username, appKey);
                if (conversation == null) {
                    conversation = Conversation.createSingleConversation(
                            username, appKey);
                }
            } else if (type.equals("group")) {
                long groupId = data.getLong(1);
                conversation = JMessageClient.getGroupConversation(groupId);
                if (conversation == null) {
                    conversation = Conversation.createGroupConversation(groupId);
                }
            } else {
                callback.error("Conversation type error.");
                return;
            }

            if (conversation == null) {
                callback.error("Can't get conversation.");
                return;
            }

            List<Message> messages = conversation.getAllMessage();
            if (!messages.isEmpty()) {
                String json = mGson.toJson(messages);
                callback.success(json);
            } else {
                callback.error("Conversation isn't contain message.");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }


    // Conversation API.

    public void getConversationList(JSONArray data, CallbackContext callback) {
        List<Conversation> conversationList = JMessageClient.getConversationList();
        if (conversationList != null) {
            String json = mGson.toJson(conversationList);
            callback.success(json);
        } else {
            callback.error("Conversation list not find.");
        }
    }

    // 设置会话本地未读消息数的接口。
    public void setSingleConversationUnreadMessageCount(JSONArray data,
            CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.isNull(1) ? "" : data.getString(1);
            int unreadMessageCount = data.getInt(2);
            Conversation con = JMessageClient.getSingleConversation(username, appKey);
            if (con == null) {
                callback.error("Conversation is not exist.");
                return;
            }
            con.setUnReadMessageCnt(unreadMessageCount);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void setGroupConversationUnreadMessageCount(JSONArray data,
            CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            int unreadMessageCount = data.getInt(1);
            Conversation con = JMessageClient.getGroupConversation(groupId);
            if (con == null) {
                callback.error("Conversation is not exist.");
                return;
            }
            con.setUnReadMessageCnt(unreadMessageCount);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void enterSingleConversation(JSONArray data, CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.isNull(1) ? "" : data.getString(1);
            JMessageClient.enterSingleConversation(username, appKey);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void enterGroupConversation(JSONArray data, CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            JMessageClient.enterGroupConversation(groupId);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getSingleConversation(JSONArray data, CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.isNull(1) ? "" : data.getString(1);
            Conversation conversation = JMessageClient.getSingleConversation(username, appKey);
            if (conversation != null) {
                String json = mGson.toJson(conversation);
                callback.success(json);
            } else {
                callback.error("conversation not find.");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getGroupConversation(JSONArray data, CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            Conversation conversation = JMessageClient.getGroupConversation(groupId);
            if (conversation != null) {
                String json = mGson.toJson(conversation);
                callback.success(json);
            } else {
                callback.error("conversation not find.");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void deleteSingleConversation(JSONArray data, CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.isNull(1) ? "" : data.getString(1);
            JMessageClient.deleteSingleConversation(username, appKey);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void deleteGroupConversation(JSONArray data, CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            JMessageClient.deleteGroupConversation(groupId);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void exitConversation(JSONArray data, CallbackContext callback) {
        try{
            JMessageClient.exitConversation();
            callback.success();
        } catch (Exception exception) {
            callback.error(exception.toString());
        }
    }

    // Group API.

    public void createGroup(JSONArray data, final CallbackContext callback) {
        try {
            String groupName = data.getString(0);
            String groupDesc = data.getString(1);
            JMessageClient.createGroup(groupName, groupDesc,
                    new CreateGroupCallback() {
                        @Override
                        public void gotResult(int responseCode, String responseMsg,
                                long groupId) {
                            if (responseCode == 0) {
                                callback.success();
                            } else {
                                callback.error(responseMsg);
                            }
                        }
                    });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getGroupIDList(JSONArray data, final CallbackContext callback) {
        JMessageClient.getGroupIDList(new GetGroupIDListCallback() {
            @Override
            public void gotResult(int responseCode, String responseMsg,
                    List<Long> list) {
                if (responseCode == 0) {
                    callback.success(list.toString());
                } else {
                    callback.error(responseMsg);
                }
            }
        });
    }

    public void getGroupInfo(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {
                @Override
                public void gotResult(int responseCode, String responseMsg,
                        GroupInfo groupInfo) {
                    if (responseCode == 0) {
                        callback.success(mGson.toJson(groupInfo));
                    } else {
                        callback.error(responseMsg);
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void updateGroupName(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String groupNewName = data.getString(1);

            JMessageClient.updateGroupName(groupId, groupNewName,
                    new BasicCallback() {
                        @Override
                        public void gotResult(int responseCode, String responseDesc) {
                            if (responseCode == 0) {
                                callback.success();
                            } else {
                                callback.error(responseDesc);
                            }
                        }
                    });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void updateGroupDescription(JSONArray data,
            final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String groupNewDesc = data.getString(1);

            JMessageClient.updateGroupDescription(groupId, groupNewDesc,
                    new BasicCallback() {
                        @Override
                        public void gotResult(int responseCode,
                                String responseMsg) {
                            if (responseCode == 0) {
                                callback.success();
                            } else {
                                callback.error(responseMsg);
                            }
                        }
                    });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void addGroupMembers(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String membersStr = data.getString(1);

            String[] members = membersStr.split(",");
            List<String> memberList = new ArrayList<String>();
            Collections.addAll(memberList, members);
            JMessageClient.addGroupMembers(groupId, memberList,
                    new BasicCallback() {
                        @Override
                        public void gotResult(int responseCode, String responseDesc) {
                            if (responseCode == 0) {
                                callback.success();
                            } else {
                                callback.error(responseDesc);
                            }
                        }
                    });

        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void removeGroupMembers(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String userNamesStr = data.getString(1);
            String[] userNamesArr = userNamesStr.split(",");

            List<String> userNamesList = Arrays.asList(userNamesArr);
            JMessageClient.removeGroupMembers(groupId, userNamesList,
                    new BasicCallback() {
                        @Override
                        public void gotResult(int responseCode, String responseDesc) {
                            if (responseCode == 0) {
                                callback.success();
                            } else {
                                callback.error(responseDesc);
                            }
                        }
                    });
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void exitGroup(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            JMessageClient.exitGroup(groupId, new BasicCallback() {
                @Override
                public void gotResult(int responseCode, String responseDesc) {
                    if (responseCode == 0) {
                        callback.success();
                    } else {
                        callback.error(responseDesc);
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getGroupMembers(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            JMessageClient.getGroupMembers(groupId, new GetGroupMembersCallback() {
                @Override
                public void gotResult(int responseCode, String responseDesc,
                        List<UserInfo> list) {
                    if (responseCode == 0) {
                        String json = new Gson().toJson(list);
                        callback.success(json);
                    } else {
                        callback.error(responseDesc);
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }


    // Black list API.

    public void addUsersToBlacklist(JSONArray data, final CallbackContext callback) {
        try {
            String usernameStr = data.getString(0);
            String[] usernameArr = usernameStr.split(",");
            List<String> usernameList = Arrays.asList(usernameArr);
            JMessageClient.addUsersToBlacklist(usernameList, new BasicCallback() {
                @Override
                public void gotResult(int responseCode, String responseDesc) {
                    if (responseCode == 0) {
                        callback.success();
                    } else {
                        callback.error(responseDesc);
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void delUsersFromBlacklist(JSONArray data, final CallbackContext callback) {
        try {
            String usernameStr = data.getString(0);
            String[] usernameArr = usernameStr.split(",");
            List<String> usernameList = Arrays.asList(usernameArr);
            JMessageClient.delUsersFromBlacklist(usernameList, new BasicCallback() {
                @Override
                public void gotResult(int responseCode, String responseDesc) {
                    if (responseCode == 0) {
                        callback.success();
                    } else {
                        callback.error(responseDesc);
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getBlacklist(JSONArray data, final CallbackContext callback) {
        JMessageClient.getBlacklist(new GetBlacklistCallback() {
            @Override
            public void gotResult(int responseCode, String responseDesc,
                    List<UserInfo> list) {
                if (responseCode == 0) {
                    callback.success(mGson.toJson(list));
                } else {
                    callback.error(responseDesc);
                }
            }
        });
    }

    public void setNotificationMode(JSONArray data, CallbackContext callback) {
        try {
            int mode = data.getInt(0);
            JMessageClient.setNotificationMode(mode);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    private JSONObject getJSonFormMessage(Message msg) {
        String contentText = "";
        String msgType = "";    //上传给 js 层的类型，请和 iOS 保持一致

        switch (msg.getContentType()) {
            case text:
                contentText = ((TextContent) msg.getContent()).getText();
                msgType = "text";
                break;
            default:
                break;
        }
        Log.i(TAG, "msg " + contentText);

        JSONObject jsonItem = new JSONObject();
        try {
            MessageContent content = msg.getContent();
            UserInfo targetUser = (UserInfo) msg.getTargetInfo();
            UserInfo fromUser = (UserInfo) msg.getFromUser();

            jsonItem.put("target_type", "single");
            jsonItem.put("target_id", targetUser.getUserName());
            jsonItem.put("target_name", targetUser.getNickname());
            jsonItem.put("from_id", fromUser.getUserName());
            //jsonItem.put("from_name", fromUser.getNickname());
            jsonItem.put("from_name", msg.getFromName());
            jsonItem.put("create_time", msg.getCreateTime());
            jsonItem.put("msg_type", msgType);
            //jsonItem.put("text", contentText);

            JSONObject contentBody = new JSONObject();
            contentBody.put("text", contentText);
            jsonItem.put("msg_body", contentBody);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return jsonItem;
    }

    public void getSingleConversationHistoryMessage(JSONArray data,
            CallbackContext callback) {
        Log.i(TAG, "getSingleConversationHistoryMessage \n" + data);
        try {
            String username = data.getString(0);
            int from = data.getInt(1);
            int limit = data.getInt(2);

            if (limit <= 0 || from < 0) {
                Log.w(TAG, "JMessageGetSingleHistoryMessage from: " + from
                        + "limit" + limit);
                return;
            }
            Conversation conversation = JMessageClient.getSingleConversation(
                    username);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(username);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }
            List<Message> list = conversation.getMessagesFromNewest(from, limit);
            Log.i(TAG, "JMessageGetSingleHistoryMessage list size is" + list.size());

            JSONArray jsonResult = new JSONArray();
            for (int i = 0; i < list.size(); ++i) {
                Message msg = list.get(i);
                JSONObject obj = this.getJSonFormMessage(msg);
                jsonResult.put(obj);
            }
            callback.success(jsonResult);
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json.");
        }
    }

    public void getAllSingleConversation(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "getAllSingleConversation \n" + data);

        List<Conversation> list = JMessageClient.getConversationList();
        List<Conversation> singleConversationList = new ArrayList<Conversation>();

        for (int i = 0; i < list.size(); ++i) {
            Conversation con = list.get(i);
            if (con.getType() == ConversationType.single) {
                singleConversationList.add(con);
            }
        }
        callback.success(mGson.toJson(singleConversationList));
    }

    public void getAllGroupConversation(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "getAllSingleConversation \n" + data);

        List<Conversation> list = JMessageClient.getConversationList();
        List<Conversation> groupConversationList = new ArrayList<Conversation>();

        for (int i = 0; i < list.size(); ++i) {
            Conversation con = list.get(i);
            if (con.getType() == ConversationType.group) {
                groupConversationList.add(con);
            }
        }
        callback.success(mGson.toJson(groupConversationList));
    }

    public void setJMessageReceiveCallbackChannel(JSONArray data,
            CallbackContext callback) {
        Log.i(TAG, "setJMessageReceiveCallbackChannel:"
                + callback.getCallbackId());

        mJMessageReceiveCallback = callback;
        PluginResult dataResult = new PluginResult(PluginResult.Status.OK,
                "js call init ok");
        dataResult.setKeepCallback(true);
        mJMessageReceiveCallback.sendPluginResult(dataResult);
    }

    /**
     * @param type   会话类型，'single' or 'group'。
     * @param value  会话的唯一标识，如果类型为 'single' 则为 username；
     *               如果类型为 'group' 则为 groupId。
     * @param appKey 如果会话类型为 'single'，可以通过该属性获得跨应用会话。
     * @return
     */
    private Conversation getConversation(String type, String value,
            String appKey) {
        Conversation conversation = null;
        if (type.equals("single")) {
            conversation = JMessageClient.getSingleConversation(value, appKey);
        } else if (type.equals("group")) {
            long groupId = Long.parseLong(value);
            conversation = JMessageClient.getGroupConversation(groupId);
        } else {
            return null;
        }
        return conversation;
    }

    private void handleResult(String successString, int status, String desc,
            CallbackContext callback) {
        if (status == 0) {
            if (TextUtils.isEmpty(successString)) {
                callback.success();
            } else {
                callback.success(successString);
            }
        } else {
            callback.error(desc);
        }
    }

    private UserInfo getUserInfo(String username, String appKey) {
        final UserInfo[] userInfos = new UserInfo[1];
        JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
            @Override
            public void gotResult(int responseCode, String responseDesc,
                    UserInfo userInfo) {
                if (responseCode == 0) {
                    userInfos[0] = userInfo;
                }
            }
        });
        return userInfos[0];
    }

    private boolean updateUserInfo(UserInfo userInfo, String field, String value) {
        final boolean[] result = {false};

        switch (field) {
            case "nickname":
                userInfo.setNickname(value);
                result[0] = true;
                break;
            case "birthday":
                long birthday = Long.parseLong(value);
                userInfo.setBirthday(birthday);
                result[0] = true;
                break;
            case "gender":
                switch (value) {
                    case "male":
                        userInfo.setGender(UserInfo.Gender.male);
                        break;
                    case "female":
                        userInfo.setGender(UserInfo.Gender.female);
                        break;
                    default:
                        userInfo.setGender(UserInfo.Gender.unknown);
                        break;
                }
                result[0] = true;
                break;
            case "signature":
                userInfo.setSignature(value);
                result[0] = true;
                break;
            case "region":
                userInfo.setRegion(value);
                result[0] = true;
                break;
            default:
                return result[0];
        }

        JMessageClient.updateMyInfo(UserInfo.Field.valueOf(field), userInfo,
                new BasicCallback() {
                    @Override
                    public void gotResult(int responseCode, String responseDesc) {
                        result[0] = responseCode == 0;
                    }
                });
        return result[0];
    }

}
