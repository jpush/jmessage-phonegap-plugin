package cn.jmessage.phonegap;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Environment;
import android.text.TextUtils;
import android.util.Log;

import com.google.gson.Gson;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
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
import cn.jpush.im.android.api.callback.DownloadCompletionCallback;
import cn.jpush.im.android.api.callback.GetAvatarBitmapCallback;
import cn.jpush.im.android.api.callback.GetBlacklistCallback;
import cn.jpush.im.android.api.callback.GetGroupIDListCallback;
import cn.jpush.im.android.api.callback.GetGroupInfoCallback;
import cn.jpush.im.android.api.callback.GetGroupMembersCallback;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.content.EventNotificationContent;
import cn.jpush.im.android.api.content.ImageContent;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.content.VoiceContent;
import cn.jpush.im.android.api.enums.ContentType;
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

    private static JMessagePlugin instance;
    private ExecutorService threadPool = Executors.newFixedThreadPool(1);
    private Gson mGson = new Gson();
    private Activity mCordovaActivity;
    private Message mCurrentMsg; // 当前消息。
    private static Message mBufMsg;     // 缓存的消息。
    private static boolean shouldCacheMsg = false;
    private int[] mMsgIds;

    public JMessagePlugin() {
        instance = this;
    }

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        mCordovaActivity = cordova.getActivity();
        JMessageClient.init(this.cordova.getActivity().getApplicationContext());
        JMessageClient.registerEventReceiver(this);
    }

    public void onEvent(MessageEvent event) {
        final Message msg = event.getMessage();
        try {
            String jsonStr = mGson.toJson(msg);
            JSONObject msgJson = new JSONObject(jsonStr);

            // Add user avatar path.
            UserInfo fromUser = msg.getFromUser();
            String avatarPath = "";
            File avatarFile = fromUser.getAvatarFile(); // 获取用户头像缩略图文件
            if (avatarFile != null) {
                avatarPath = avatarFile.getAbsolutePath();
            }
            msgJson.getJSONObject("fromUser").put("avatarPath", avatarPath);
            String fromName = TextUtils.isEmpty(fromUser.getNickname()) ? fromUser.getUserName()
                    : fromUser.getNickname();
            msgJson.put("fromName", fromName);
            msgJson.put("fromID", fromUser.getUserName());

            UserInfo myInfo = JMessageClient.getMyInfo();
            String myInfoJson = mGson.toJson(myInfo);
            JSONObject myInfoJsonObj = new JSONObject(myInfoJson);

            File myAvatarFile = JMessageClient.getMyInfo().getAvatarFile();
            String myAvatarPath = "";
            if (myAvatarFile != null) {
                myAvatarPath = myAvatarFile.getAbsolutePath();
            }
            myInfoJsonObj.put("avatarPath", myAvatarPath);

            msgJson.put("targetInfo", myInfoJsonObj);

            String targetName = "";
            if (msg.getTargetType().equals(ConversationType.single)) {
                targetName = TextUtils.isEmpty(myInfo.getNickname())
                        ? myInfo.getUserName() : myInfo.getNickname();
                msgJson.put("targetID", myInfo.getUserName());

            } else if (msg.getTargetType().equals(ConversationType.group)) {
                GroupInfo targetInfo = (GroupInfo) msg.getTargetInfo();
                targetName = TextUtils.isEmpty(targetInfo.getGroupName())
                        ? targetInfo.getGroupName() : (targetInfo.getGroupID() + "");
            }
            msgJson.put("targetName", targetName);

            switch (msg.getContentType()) {
                case text:
                    fireEvent("onReceiveTextMessage", jsonStr);
                    break;
                case image:
                    ImageContent imageContent = (ImageContent) msg.getContent();
                    String imgPath = imageContent.getLocalPath();
                    String imgLink = imageContent.getImg_link();
                    msgJson.getJSONObject("content").put("imagePath", imgPath);
                    msgJson.getJSONObject("content").put("imageLink", imgLink);
                    fireEvent("onReceiveImageMessage", msgJson.toString());
                    break;
                case voice:
                    VoiceContent voiceContent = (VoiceContent) msg.getContent();
                    String voicePath = voiceContent.getLocalPath();
                    int duration = voiceContent.getDuration();
                    msgJson.getJSONObject("content").put("voicePath", voicePath);
                    msgJson.getJSONObject("content").put("duration", duration);
                    fireEvent("onReceiveVoiceMessage", msgJson.toString());
                    break;
                case custom:
                    fireEvent("onReceiveCustomMessage", msgJson.toString());
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
            Log.i(TAG, "onReceiveMessage: " + msgJson.toString());
            fireEvent("onReceiveMessage", msgJson.toString());
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
        if (shouldCacheMsg) {
            mBufMsg = msg;
        }
        String json = mGson.toJson(msg);
        fireEvent("onOpenMessage", json);

        Intent launch = cordova.getActivity().getApplicationContext()
                .getPackageManager().getLaunchIntentForPackage(
                        cordova.getActivity().getApplicationContext().getPackageName());
        launch.addCategory(Intent.CATEGORY_LAUNCHER);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        cordova.getActivity().getApplicationContext().startActivity(launch);
    }

    private void triggerMessageClickEvent(Message msg) {
        String json = mGson.toJson(msg);
        fireEvent("onOpenMessage", json);
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
        shouldCacheMsg = true;
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
        shouldCacheMsg = false;
    }

    public void onDestroy() {
        JMessageClient.unRegisterEventReceiver(this);
        mCordovaActivity = null;
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
                public void gotResult(int responseCode, String responseDesc, UserInfo userInfo) {
                    if (responseCode == 0) {
                        try {
                            String json = mGson.toJson(userInfo);
                            JSONObject jsonObject = new JSONObject(json);
                            String avatarPath = "";
                            if (userInfo.getAvatarFile() != null) {
                                avatarPath = userInfo.getAvatarFile().getAbsolutePath();
                            }
                            jsonObject.put("avatarPath", avatarPath);
                            callback.success(jsonObject.toString());
                        } catch (JSONException e) {
                            e.printStackTrace();
                            callback.error(e.getMessage());
                        }
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
            try {
                String json = mGson.toJson(myInfo);
                JSONObject jsonObject = new JSONObject(json);
                String avatarPath = "";
                if (myInfo.getAvatarFile() != null) {
                    avatarPath = myInfo.getAvatarFile().getAbsolutePath();
                }
                jsonObject.put("avatarPath", avatarPath);
                callback.success(jsonObject.toString());
            } catch (JSONException e) {
                e.printStackTrace();
                callback.error(e.getMessage());
            }
        } else {
            callback.error("My info is null.");
        }
    }

    public void updateMyInfo(JSONArray data, final CallbackContext callback) {
        try {
            String field = data.getString(0);
            String value = data.getString(1);

            UserInfo myInfo = JMessageClient.getMyInfo();
            String result = updateUserInfo(myInfo, field, value);
            if (result == null) {
                callback.success();
            } else {
                callback.error(result);
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
     * Update my avatar.
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

    public void updateMyAvatarByPath(JSONArray data, final CallbackContext callback) {
        try {
            String path = data.getString(0);
            File avatarFile = new File(path);
            if (!avatarFile.exists()) {
                callback.error("File not exist.");
                return;
            }
            JMessageClient.updateUserAvatar(avatarFile, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        callback.success();
                    } else {
                        callback.error(status);
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Argument error.");
        }
    }

    public void getUserAvatar(JSONArray data, final CallbackContext callback) {
        try {
            String username = data.isNull(0) ? "" : data.getString(0);
            if (TextUtils.isEmpty(username)) {  // 取得当前登录用户的头像缩略图地址
                UserInfo myInfo = JMessageClient.getMyInfo();
                File avatarFile = myInfo.getAvatarFile();
                String path = "";
                if (avatarFile != null) {
                    path = avatarFile.getAbsolutePath();
                }
                callback.success(path);
            } else {    // 取得指定用户的头像缩略图地址
                JMessageClient.getUserInfo(username, new GetUserInfoCallback() {
                    @Override
                    public void gotResult(int status, String desc, UserInfo userInfo) {
                        if (status == 0) {
                            File avatarFile = userInfo.getAvatarFile();
                            String path = "";
                            if (avatarFile != null) {
                                path = avatarFile.getAbsolutePath();
                            }
                            callback.success(path);
                        } else {
                            Log.i(TAG, "getUserAvatar: " + status + " - " + desc);
                            callback.error(status);
                        }
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Argument error.");
        }
    }

    /**
     * 获取用户头像原图，当 username 为空时，默认下载当前用户头像。
     */
    public void getOriginalUserAvatar(JSONArray data, final CallbackContext callback) {
        try {
            final String username = data.isNull(0) ? "" : data.getString(0);
            final String fileName;
            final String avatarPath = getAvatarPath();
            if (TextUtils.isEmpty(username)) {
                final UserInfo myInfo = JMessageClient.getMyInfo();
                fileName = "avatar_" + myInfo.getUserID();
                File avatarFile = new File(avatarPath + fileName + ".png");
                if (avatarFile.exists()) {
                    Log.i(TAG, "isExists");
                    callback.success(avatarFile.getAbsolutePath());
                    return;
                }
                myInfo.getBigAvatarBitmap(new GetAvatarBitmapCallback() {
                    @Override
                    public void gotResult(int status, String desc, Bitmap bitmap) {
                        if (status == 0) {
                            if (bitmap == null) {
                                callback.success("");
                            } else {
                                callback.success(storeImage(bitmap, fileName));
                            }
                        } else {
                            Log.i(TAG, "getOriginalUserAvatar: " + status + " - " + desc);
                            callback.error(status);
                        }
                    }
                });
            } else {
                JMessageClient.getUserInfo(username, new GetUserInfoCallback() {
                    @Override
                    public void gotResult(int status, String desc, final UserInfo userInfo) {
                        if (status == 0) {
                            String fileName = "avatar_" + userInfo.getUserID();
                            File avatarFile = new File(avatarPath + fileName + ".png");
                            if (avatarFile.exists()) {
                                callback.success(avatarFile.getAbsolutePath());
                                return;
                            }
                            userInfo.getBigAvatarBitmap(new GetAvatarBitmapCallback() {
                                @Override
                                public void gotResult(int status, String desc, Bitmap bitmap) {
                                    if (status == 0) {
                                        if (bitmap == null) {
                                            callback.success("");
                                        } else {
                                            String filename = "avatar_" + userInfo.getUserID();
                                            callback.success(storeImage(bitmap, filename));
                                        }
                                    } else {
                                        Log.i(TAG, "getOriginalUserAvatar: " + status + " - " + desc);
                                        callback.error(status);
                                    }
                                }
                            });
                        } else {
                            Log.i(TAG, "getOriginalUserAvatar: " + status + " - " + desc);
                            callback.error(status);
                        }
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Argument error.");
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

    public void sendSingleTextMessageWithExtras(JSONArray data, final CallbackContext callback) {
        try {
            String username = data.getString(0);
            String text = data.getString(1);
            String json = data.getString(2);    // 自定义信息的 Json 数据。
            String appkey = data.isNull(3) ? "" : data.getString(3);

            Conversation conversation = getConversation("single", username, appkey);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(username, appkey);
            }
            if (conversation == null) {
                callback.error("无法创建会话");
                return;
            }

            TextContent content = new TextContent(text);

            if (!TextUtils.isEmpty(json)) {
                JSONObject values = new JSONObject(json);
                Iterator<? extends String> keys = values.keys();
                Map<String, String> valuesMap = new HashMap<String, String>();

                String key, value;
                while (keys.hasNext()) {
                    key = keys.next();
                    value = values.getString(key);
                    valuesMap.put(key, value);
                }
                content.setExtras(valuesMap);
            }

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
            callback.error(e.toString());
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
            callback.error("URL error.");
        }
    }

    public void sendSingleImageMessageWithExtras(JSONArray data, final CallbackContext callback) {
        try {
            String userName = data.getString(0);
            String imgUrlStr = data.getString(1);
            String json = data.getString(2);
            String appKey = data.isNull(3) ? "" : data.getString(3);

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
            ImageContent content = new ImageContent(imgFile);

            if (!TextUtils.isEmpty(json)) {
                JSONObject values = new JSONObject(json);
                Iterator<? extends String> keys = values.keys();
                Map<String, String> valuesMap = new HashMap<String, String>();

                String key, value;
                while (keys.hasNext()) {
                    key = keys.next();
                    value = values.getString(key);
                    valuesMap.put(key, value);
                }
                content.setExtras(valuesMap);
            }

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
            callback.error("json data error");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callback.error("文件不存在");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            callback.error("URL error.");
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

    public void sendSingleVoiceMessageWithExtras(JSONArray data, final CallbackContext callback) {
        try {
            String userName = data.getString(0);
            String voiceUrlStr = data.getString(1);
            String json = data.getString(2);
            String appKey = data.isNull(3) ? "" : data.getString(3);

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

            VoiceContent content = new VoiceContent(file, duration);

            if (!TextUtils.isEmpty(json)) {
                JSONObject values = new JSONObject(json);
                Iterator<? extends String> keys = values.keys();
                Map<String, String> valuesMap = new HashMap<String, String>();

                String key, value;
                while (keys.hasNext()) {
                    key = keys.next();
                    value = values.getString(key);
                    valuesMap.put(key, value);
                }
                content.setExtras(valuesMap);
            }

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

    public void sendGroupTextMessageWithExtras(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String text = data.getString(1);
            String json = data.getString(2);

            Conversation conversation = JMessageClient.getGroupConversation(groupId);
            if (conversation == null) {
                conversation = Conversation.createGroupConversation(groupId);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            TextContent content = new TextContent(text);
            if (!TextUtils.isEmpty(json)) {
                content.setExtras(getExtras(json));
            }

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

    public void sendGroupImageMessageWithExtras(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String imgUrlStr = data.getString(1);
            String json = data.getString(2);

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
            ImageContent content = new ImageContent(imgFile);

            if (!TextUtils.isEmpty(json)) {
                content.setExtras(getExtras(json));
            }

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

    public void sendGroupVoiceMessageWithExtras(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String voiceUrlStr = data.getString(1);
            String json = data.getString(2);

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

            VoiceContent content = new VoiceContent(file, duration);
            if (!TextUtils.isEmpty(json)) {
               content.setExtras(getExtras(json));
            }

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
                callback.success("");
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
                    callback.error("Conversation is not exist.");
                    return;
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

            int from = data.getInt(3);
            int limit = data.getInt(4);

            List<Message> messages = conversation.getMessagesFromNewest(from, limit);
            if (!messages.isEmpty()) {
                callback.success(mGson.toJson(messages));
            } else {
                callback.success("");
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
                    callback.error("Conversation is not exist.");
                    return;
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

            List<Message> messages = conversation.getAllMessage();
            if (messages != null && !messages.isEmpty()) {
                String json = mGson.toJson(messages);
                callback.success(json);
            } else {
                callback.success("");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }


    // Conversation API.

    public void isSingleConversationExist(JSONArray data, CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.isNull(1) ? "" : data.getString(1);
            Conversation con = JMessageClient.getSingleConversation(username, appKey);
            if (con == null) {
                callback.success(0);
            } else {
                callback.success(1);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void isGroupConversationExist(JSONArray data, CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            Conversation con = JMessageClient.getGroupConversation(groupId);
            if (con == null) {
                callback.success(0);
            } else {
                callback.success(1);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Parameter error.");
        }
    }

    public void getConversationList(JSONArray data, CallbackContext callback) {
        List<Conversation> conversationList = JMessageClient.getConversationList();
        if (conversationList != null) {
            String json = mGson.toJson(conversationList);
            Log.i(TAG, "Conversation list: " + json);
            callback.success(json);
        } else {
            callback.success("");
        }
    }

    // 设置会话本地未读消息数的接口。
    public void setSingleConversationUnreadMessageCount(JSONArray data, CallbackContext callback) {
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

    public void setGroupConversationUnreadMessageCount(JSONArray data, CallbackContext callback) {
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
                callback.success("");
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
                callback.success("");
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
        try {
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
                        public void gotResult(int responseCode, String responseMsg, long groupId) {
                            if (responseCode == 0) {
                                callback.success(String.valueOf(groupId));
                            } else {
                                callback.error(responseCode);
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
                    callback.success(mGson.toJson(list));
                } else {
                    callback.error(responseCode);
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
                        callback.error(responseCode);
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
                                callback.error(responseCode);
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
                        public void gotResult(int responseCode, String responseMsg) {
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

    /**
     * 取到图片消息的图片原图。
     */
    public void getOriginImageInSingleConversation(JSONArray data, final CallbackContext callback) {
        try {
            String username = data.getString(0);
            long msgId = data.getLong(1);
            Conversation con = JMessageClient.getSingleConversation(username);
            if (con == null) {
                callback.error("Conversation isn't exist.");
                return;
            }
            List<Message> messageList = con.getAllMessage();
            for (Message msg : messageList) {
                if (!msg.getContentType().equals(ContentType.image)) {
                    continue;
                }
                if (msgId == msg.getServerMessageId()) {
                    ImageContent imgContent = (ImageContent) msg.getContent();
                    if (!TextUtils.isEmpty(imgContent.getLocalPath())) {
                        callback.success(imgContent.getLocalPath());
                        return;
                    }
                    imgContent.downloadOriginImage(msg, new DownloadCompletionCallback() {
                        @Override
                        public void onComplete(int status, String desc, File file) {
                            if (status == 0) {
                                callback.success(file.getAbsolutePath());
                            } else {
                                Log.i(TAG, "getOriginImageInSingleConversation: " + status + " - " + desc);
                                callback.error(status);
                            }
                        }
                    });
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Argument error.");
        }
    }

    public void getOriginImageInGroupConversation(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            long msgId = data.getLong(1);

            Conversation con = JMessageClient.getGroupConversation(groupId);
            if (con == null) {
                callback.error("Conversation isn't exist.");
                return;
            }
            List<Message> messageList = con.getAllMessage();
            for (Message msg : messageList) {
                if (!msg.getContentType().equals(ContentType.image)) {
                    continue;
                }
                if (msgId == msg.getServerMessageId()) {
                    ImageContent imgContent = (ImageContent) msg.getContent();
                    if (!TextUtils.isEmpty(imgContent.getLocalPath())) {
                        callback.success(imgContent.getLocalPath());
                        return;
                    }
                    imgContent.downloadOriginImage(msg, new DownloadCompletionCallback() {
                        @Override
                        public void onComplete(int status, String desc, File file) {
                            if (status == 0) {
                                callback.success(file.getAbsolutePath());
                            } else {
                                Log.i(TAG, "getOriginImageInGroupConversation: " + status + " - " + desc);
                                callback.error(status);
                            }
                        }
                    });
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Argument error.");
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

    public void getSingleConversationHistoryMessage(JSONArray data, CallbackContext callback) {
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

    public void setJMessageReceiveCallbackChannel(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "setJMessageReceiveCallbackChannel:"
                + callback.getCallbackId());

        PluginResult dataResult = new PluginResult(PluginResult.Status.OK,
                "js call init ok");
        dataResult.setKeepCallback(true);
        callback.sendPluginResult(dataResult);
    }

    /**
     * @param type   会话类型，'single' or 'group'。
     * @param value  会话的唯一标识，如果类型为 'single' 则为 username；
     *               如果类型为 'group' 则为 groupId。
     * @param appKey 如果会话类型为 'single'，可以通过该属性获得跨应用会话。
     * @return
     */
    private Conversation getConversation(String type, String value, String appKey) {
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

    private void handleResult(String successString, int status, String desc, CallbackContext callback) {
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

    private String updateUserInfo(UserInfo userInfo, String field, String value) {
        final String[] result = {null};

        if (field.equals("nickname")) {
            userInfo.setNickname(value);
        } else if (field.equals("birthday")) {
            long birthday = Long.parseLong(value);
            userInfo.setBirthday(birthday);
        } else if (field.equals("gender")) {
            if (value.equals("male")) {
                userInfo.setGender(UserInfo.Gender.male);
            } else if (value.equals("female")) {
                userInfo.setGender(UserInfo.Gender.female);

            } else {
                userInfo.setGender(UserInfo.Gender.unknown);
            }
        } else if (field.equals("signature")) {
            userInfo.setSignature(value);
        } else if (field.equals("region")) {
            userInfo.setRegion(value);
        } else {
            return "Field name error.";
        }

        JMessageClient.updateMyInfo(UserInfo.Field.valueOf(field), userInfo,
                new BasicCallback() {
                    @Override
                    public void gotResult(int responseCode, String responseDesc) {
                        if (responseCode != 0) {
                            result[0] = responseDesc;
                        }
                    }
                });
        return result[0];
    }

    private String getFilePath() {
        return Environment.getExternalStorageDirectory() + "/"
                + cordova.getActivity().getApplication().getPackageName();
    }

    private String getAvatarPath() {
        return getFilePath() + "/images/avatar/";
    }

    private String storeImage(Bitmap bitmap, String filename) {
        File avatarFile = new File(getAvatarPath());
        if (!avatarFile.exists()) {
            avatarFile.mkdirs();
        }

        String filePath = getAvatarPath() + filename + ".png";
        try {
            FileOutputStream fos = new FileOutputStream(filePath);
            BufferedOutputStream bos = new BufferedOutputStream(fos);
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, bos);
            bos.flush();
            bos.close();
            return filePath;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return "";
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }

    private JSONObject getMessageJSONObject(Message msg) throws JSONException {
        String jsonStr = mGson.toJson(msg);
        JSONObject msgJson = new JSONObject(jsonStr);

        // Add user avatar path.
        UserInfo fromUser = msg.getFromUser();
        String avatarPath = "";
        File avatarFile = fromUser.getAvatarFile(); // 获取用户头像缩略图文件
        if (avatarFile != null) {
            avatarPath = avatarFile.getAbsolutePath();
        }
        msgJson.getJSONObject("fromUser").put("avatarPath", avatarPath);

        File myAvatarFile = JMessageClient.getMyInfo().getAvatarFile();
        String myAvatarPath = "";
        if (myAvatarFile != null) {
            myAvatarPath = myAvatarFile.getAbsolutePath();
        }
        msgJson.getJSONObject("targetInfo").put("avatarPath", myAvatarPath);

        switch (msg.getContentType()) {
            case image:
                ImageContent imageContent = (ImageContent) msg.getContent();
                String imgPath = imageContent.getLocalPath();
                String imgLink = imageContent.getImg_link();
                msgJson.getJSONObject("content").put("imagePath", imgPath);
                msgJson.getJSONObject("content").put("imageLink", imgLink);
                break;
            case voice:
                VoiceContent voiceContent = (VoiceContent) msg.getContent();
                String voicePath = voiceContent.getLocalPath();
                int duration = voiceContent.getDuration();
                msgJson.getJSONObject("content").put("voicePath", voicePath);
                msgJson.getJSONObject("content").put("duration", duration);
                break;
            case custom:
                break;
        }
        return msgJson;
    }

    private Map<String, String> getExtras(String json) throws JSONException {
        JSONObject values = new JSONObject(json);
        Iterator<? extends String> keys = values.keys();
        Map<String, String> valuesMap = new HashMap<String, String>();

        String key, value;
        while (keys.hasNext()) {
            key = keys.next();
            value = values.getString(key);
            valuesMap.put(key, value);
        }
        return valuesMap;
    }

}
