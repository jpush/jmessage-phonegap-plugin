//	            __    __                ________
//	| |    | |  \ \  / /  | |    | |   / _______|
//	| |____| |   \ \/ /   | |____| |  / /
//	| |____| |    \  /    | |____| |  | |   _____
//	| |    | |    /  \    | |    | |  | |  |____ |
//  | |    | |   / /\ \   | |    | |  \ \______| |
//  | |    | |  /_/  \_\  | |    | |   \_________|
//
//	Copyright (c) 2012年 HXHG. All rights reserved.
//	http://www.jpush.cn
//  Created by liangjianguo


package cn.jmessage.phonegap;

import android.app.Activity;
import android.media.MediaPlayer;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import cn.jpush.android.api.BasicPushNotificationBuilder;
import cn.jpush.android.api.JPushInterface;
import cn.jpush.android.api.TagAliasCallback;
import cn.jpush.android.data.JPushLocalNotification;
import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.event.MessageEvent;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.api.BasicCallback;


public class JMessagePlugin extends CordovaPlugin {

    private final static List<String> methodList = Arrays.asList(
            "deleteSingleConversation",
            "getAllSingleConversation",
            "getSingleConversationHistoryMessage",
            "getUserInfo",
            "initPush",
            "sendSingleCustomMessage",
            "sendSingleTextMessage",
            "sendSingleImageMessage",
            "sendSingleVoiceMessage",
            "sendGroupCustomMessage",
            "sendGroupTextMessage",
            "sendGroupImageMessage",
            "sendGroupVoiceMessage",
            "setJMessageReceiveCallbackChannel",
            "setUserAvatar",
            "setUserGender",
            "setUserNickname",
            "setJMessageDebugMode",
            "updateUserPassword",
            "userRegister",
            "userLogin",
            "userLogout"
    );

    private ExecutorService threadPool = Executors.newFixedThreadPool(1);
    private static JMessagePlugin instance;
    private static Activity cordovaActivity;
    private static String TAG = "JMessagePlugin";

    private static boolean shouldCacheMsg = false;
    public static String notificationAlert;
    public static Map<String, Object> notificationExtras = new HashMap<String, Object>();
    public static String openNotificationAlert;
    public static Map<String, Object> openNotificationExtras = new HashMap<String, Object>();
    private CallbackContext mJMessageReceiveCallback = null;
    private CallbackContext mJPushReceiveCallback = null;

    public JMessagePlugin() {
        instance = this;
    }

    protected void pluginInitialize() {
        Log.i(TAG, "pluginInitialize");

        cordovaActivity = this.cordova.getActivity();

        JMessageClient.init(cordovaActivity.getApplicationContext());
        JMessageClient.registerEventReceiver(this);
        JPushInterface.init(cordovaActivity.getApplicationContext());
    }

    public void onEvent(MessageEvent event) {
        final Message msg = event.getMessage();

        Log.i(TAG, "onEvent:" + msg.toString());

        //可以在这里创建Notification
        if (msg.getTargetType() == ConversationType.single) {
            JSONObject obj = this.getJSonFormMessage(msg);
            Log.i(TAG, "@@@" + obj.toString());

            PluginResult dataResult = new PluginResult(PluginResult.Status.OK, obj);
            dataResult.setKeepCallback(true);
            if (mJMessageReceiveCallback != null) {
                mJMessageReceiveCallback.sendPluginResult(dataResult);
            }
        } else {
            LOG.w(TAG, "message is not singleType");
        }
    }

    @Override
    public boolean execute(final String action, final JSONArray data,
            final CallbackContext callbackContext) throws JSONException {
        Log.i(TAG, action);
        if (!methodList.contains(action)) {
            return false;
        }
        threadPool.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    Method method = JMessagePlugin.class.getDeclaredMethod(action,
                            JSONArray.class, CallbackContext.class);
                    method.invoke(JMessagePlugin.this, data, callbackContext);
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

    private void handleResult(String successString, int status, String desc,
            CallbackContext cb) {
        if (status == 0) {
            cb.success(successString);
        } else {
            JSONObject data = new JSONObject();
            try {
                data.put("errorCode", status);
                data.put("errorDescription", desc);
                cb.error(data);
            } catch (JSONException e) {
                e.printStackTrace();
                cb.error("error write json");
            }
        }
    }

    void initPush(JSONArray data, CallbackContext callbackContext) {
        JPushInterface.init(cordovaActivity.getApplicationContext());
    }

    //jmessage method

    public void userRegister(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, " JMessageRegister \n" + data);

        final CallbackContext cb = callbackContext;
        try {
            String username = data.getString(0);
            String password = data.getString(1);

            JMessageClient.register(username, password, new BasicCallback() {
                @Override
                public void gotResult(final int status, final String desc) {
                    handleResult("注册成功", status, desc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json.");
        }
    }

    public void userLogin(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, "  userLogin \n" + data);

        final CallbackContext cb = callbackContext;
        try {
            String username = data.getString(0);
            String password = data.getString(1);

            JMessageClient.login(username, password, new BasicCallback() {
                @Override
                public void gotResult(final int status, final String desc) {
                    Log.i(TAG, "login callback " + status + desc);
                    handleResult("登录成功", status, desc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json");
        }
    }

    public void userLogout(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, "JMessageLogout \n" + data);

        JMessageClient.logout();
        callbackContext.success("退出成功");
    }

    /**
     * Update user password.
     *
     * @param data            JSONArray; data.getString(0): old password, data.getString(1): new password.
     * @param callbackContext result callback method.
     */
    public void updateUserPassword(JSONArray data, CallbackContext callbackContext) {
        final CallbackContext cb = callbackContext;
        try {
            String oldPwd = data.getString(0);
            String newPwd = data.getString(1);
            JMessageClient.updateUserPassword(oldPwd, newPwd, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    handleResult("密码修改成功", status, desc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading password json.");
        }
    }

    public void getUserInfo(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, " getUserInfo \n" + data);
        UserInfo info = JMessageClient.getMyInfo();
        try {
            if (info != null && info.getUserName() != null) {
                JSONObject jsonItem = new JSONObject();
                jsonItem.put("username", info.getUserName());
                jsonItem.put("nickname", info.getNickname());
                jsonItem.put("gender", "unknown");
                callbackContext.success(jsonItem);
            } else {
                JSONObject jsonItem = new JSONObject();
                jsonItem.put("errorCode", 863004);
                jsonItem.put("errorDescription", "not found");
                callbackContext.error(jsonItem);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * @param data            JSONArray.
     *                        data.getString(0):username, data.getJSONObject(1):custom key-values.
     * @param callbackContext CallbackContext.
     */
    public void sendSingleCustomMessage(JSONArray data, CallbackContext callbackContext) {
        try {
            String userName = data.getString(0);

            Conversation con = JMessageClient.getSingleConversation(userName);
            if (con == null) {
                con = Conversation.createSingleConversation(userName);
            }
            if (con == null) {
                callbackContext.error("无法创建对话");
                return;
            }

            JSONObject values = data.getJSONObject(1);
            Iterator<? extends String> keys = values.keys();
            Map<String, String> valuesMap = new HashMap<String, String>();

            String key, value;
            while (keys.hasNext()) {
                key = keys.next();
                value = values.getString(key);
                valuesMap.put(key, value);
            }
            Message msg = con.createSendCustomMessage(valuesMap);
            JMessageClient.sendMessage(msg);
            callbackContext.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void sendSingleTextMessage(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, " sendSingleTextMessage \n" + data);

        final CallbackContext cb = callbackContext;
        try {
            String username = data.getString(0);
            String text = data.getString(1);

            Conversation conversation = JMessageClient.getSingleConversation(username);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(username);
            }
            if (conversation == null) {
                callbackContext.error("无法创建对话");
                return;
            }

            TextContent content = new TextContent(text);
            final Message msg = conversation.createSendMessage(content);
            JMessageClient.sendMessage(msg);
            callbackContext.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json.");
        }
    }

    /**
     * @param data            JSONArray.
     *                        data.getString(0):username, data.getString(1):text
     * @param callbackContext CallbackContext.
     */
    public void sendSingleImageMessage(JSONArray data, CallbackContext callbackContext) {
        try {
            String userName = data.getString(0);
            String imgUrlStr = data.getString(1);

            Conversation conversation = JMessageClient.getSingleConversation(userName);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(userName);
            }
            if (conversation == null) {
                callbackContext.error("无法创建对话");
                return;
            }

            URL imgUrl = new URL(imgUrlStr);
            File imgFile = new File(imgUrl.getPath());
            Message msg = conversation.createSendImageMessage(imgFile);
            JMessageClient.sendMessage(msg);
            callbackContext.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("json data error");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callbackContext.error("文件不存在");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
    }

    /**
     * @param data            JSONArray.
     *                        data.getString(0):username, data.getString(1):voiceFileUrl.
     * @param callbackContext CallbackContext.
     */
    public void sendSingleVoiceMessage(JSONArray data, CallbackContext callbackContext) {
        try {
            String userName = data.getString(0);
            String voiceUrlStr = data.getString(1);

            Conversation conversation = JMessageClient.getSingleConversation(userName);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(userName);
            }
            if (conversation == null) {
                callbackContext.error("无法创建对话");
                return;
            }

            URL url = new URL(voiceUrlStr);
            String voicePath = url.getPath();
            File file = new File(voicePath);

            MediaPlayer mediaPlayer = MediaPlayer.create(cordovaActivity,
                    Uri.parse(voicePath));
            int duration = mediaPlayer.getDuration();

            Message msg = JMessageClient.createSingleVoiceMessage(userName, file, duration);
            JMessageClient.sendMessage(msg);
            callbackContext.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("json data error");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            callbackContext.error("file url error");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callbackContext.error("文件不存在");
        }
    }

    /**
     * @param data            JSONArray.
     *                        data.getLong(0):groupID, data.getJSONObject(1):custom key-values.
     * @param callbackContext CallbackContext.
     */
    public void sendGroupCustomMessage(JSONArray data, CallbackContext callbackContext) {
        try {
            long groupId = data.getLong(0);

            Conversation con = JMessageClient.getGroupConversation(groupId);
            if (con == null) {
                con = Conversation.createGroupConversation(groupId);
            }
            if (con == null) {
                callbackContext.error("无法建立对话");
                return;
            }

            Map<String, String> valuesMap = new HashMap<String, String>();
            JSONObject customeValues = data.getJSONObject(1);
            Iterator<? extends String> keys = customeValues.keys();
            String key = null;
            String value = null;
            while (keys.hasNext()) {
                key = keys.next();
                value = customeValues.getString(key);
                valuesMap.put(key, value);
            }
            Message msg = con.createSendCustomMessage(valuesMap);
            JMessageClient.sendMessage(msg);
            callbackContext.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json.");
        }
    }

    /**
     * @param data            JSONArray.
     *                        data.getLong(0):groupId, data.getString(1):text.
     * @param callbackContext CallbackContext.
     */
    public void sendGroupTextMessage(JSONArray data, CallbackContext callbackContext) {
        try {
            long groupId = data.getLong(0);
            String text = data.getString(1);

            Conversation conversation = JMessageClient.getGroupConversation(groupId);
            if (conversation == null) {
                conversation = Conversation.createGroupConversation(groupId);
            }
            if (conversation == null) {
                callbackContext.error("无法创建对话");
                return;
            }

            Message msg = JMessageClient.createGroupTextMessage(groupId, text);
            JMessageClient.sendMessage(msg);
            callbackContext.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json.");
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
            CallbackContext callbackContext) {
        Log.i(TAG, " getSingleConversationHistoryMessage \n" + data);

        try {
            String username = data.getString(0);
            int from = data.getInt(1);
            int limit = data.getInt(2);

            if (limit <= 0 || from < 0) {
                Log.w(TAG, " JMessageGetSingleHistoryMessage from: " + from + "limit" + limit);
                return;
            }
            Conversation conversation = JMessageClient.getSingleConversation(username);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(username);
            }
            if (conversation == null) {
                callbackContext.error("无法创建对话");
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
            callbackContext.success(jsonResult);
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json.");
        }
    }

    public void getAllSingleConversation(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, "  getAllSingleConversation \n" + data);

        List<Conversation> list = JMessageClient.getConversationList();
        Log.i(TAG, "JMessageGetAllSingleConversation" + list.size());

        JSONArray jsonResult = new JSONArray();

        for (int i = 0; i < list.size(); ++i) {
            Conversation con = list.get(i);
            if (con.getType() == ConversationType.single) {
                UserInfo info = (UserInfo) con.getTargetInfo();
                Message msg = con.getLatestMessage();
                String contentText = "";
                if (msg != null) {
                    switch (msg.getContentType()) {
                        case text:
                            contentText = ((TextContent) msg.getContent()).getText();
                            break;
                        default:
                            break;
                    }
                }
                JSONObject jsonItem = new JSONObject();
                try {
                    jsonItem.put("username", info.getUserName());
                    jsonItem.put("nickname", info.getNickname());
                    //jsonItem.put("avatar", info.getAvatar());
                    jsonItem.put("lastMessage", contentText);
                    jsonItem.put("unreadCount", con.getUnReadMsgCnt());
                    jsonResult.put(jsonItem);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
        callbackContext.success(jsonResult);
    }

    public void deleteSingleConversation(JSONArray data,
            CallbackContext callbackContext) {
        try {
            String username = data.getString(0);
            JMessageClient.deleteSingleConversation(username);
            callbackContext.success("deleteSingleConversation ok");
        } catch (JSONException e) {
            callbackContext.error("deleteSingleConversation failed");
            e.printStackTrace();
        }
    }

    public void setJMessageReceiveCallbackChannel(JSONArray data,
            CallbackContext callbackContext) {
        Log.i(TAG, "setJMessageReceiveCallbackChannel:" + callbackContext.getCallbackId());

        mJMessageReceiveCallback = callbackContext;
        PluginResult dataResult = new PluginResult(PluginResult.Status.OK, "js call init ok");
        dataResult.setKeepCallback(true);
        mJMessageReceiveCallback.sendPluginResult(dataResult);
    }

    public void setPushReceiveCallbackChannel(JSONArray data,
            CallbackContext callbackContext) {
        Log.i(TAG, "setPushReceiveCallbackChannel:" + callbackContext.getCallbackId());

        mJPushReceiveCallback = callbackContext;
        PluginResult dataResult = new PluginResult(PluginResult.Status.OK, "js call init ok");
        dataResult.setKeepCallback(true);//必要
        mJPushReceiveCallback.sendPluginResult(dataResult);
    }

    private void setUserInfo(UserInfo.Field field, UserInfo info,
            CallbackContext callbackContext) {
        final CallbackContext cb = callbackContext;
        JMessageClient.updateMyInfo(field, info, new BasicCallback() {
            @Override
            public void gotResult(final int status, String desc) {
                cb.success("set userinfo ok");
            }
        });
    }

    public void setUserNickname(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, "setUserNickname");
        try {
            String nickName = data.getString(0);
            Log.i(TAG, "setUserNickname" + nickName);

            UserInfo myUserInfo = JMessageClient.getMyInfo();
            myUserInfo.setNickname(nickName);
            this.setUserInfo(UserInfo.Field.nickname, myUserInfo, callbackContext);
            callbackContext.success("update userinfo ok");
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("Error reading alias JSON");
        }
    }

    public void setUserGender(JSONArray data, CallbackContext callbackContext) {
        try {
            String genderString = data.getString(0);
            UserInfo.Gender gender = UserInfo.Gender.unknown;
            if (genderString.equals("male")) {
                gender = UserInfo.Gender.male;
            } else if (genderString.equals("female")) {
                gender = UserInfo.Gender.female;
            }
            UserInfo myUserInfo = JMessageClient.getMyInfo();
            myUserInfo.setGender(gender);
            this.setUserInfo(UserInfo.Field.gender, myUserInfo, callbackContext);
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("Error reading alias JSON");
        }
    }

    /**
     * set user's avatar.
     *
     * @param data            data.getString(0): the URL of the users avatar file.
     * @param callbackContext callback method.
     */
    public void setUserAvatar(JSONArray data, CallbackContext callbackContext) {
        final CallbackContext cb = callbackContext;
        try {
            String avatarPath = data.getString(0);
            if (TextUtils.isEmpty(avatarPath)) {
                callbackContext.error("Avatar path is empty!");
                return;
            }
            File avatarFile = new File(avatarPath);
            JMessageClient.updateUserAvatar(avatarFile, new BasicCallback() {
                @Override
                public void gotResult(int status, String errorDesc) {
                    handleResult("修改头像成功", status, errorDesc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("Error reading alias JSON.");
        }
    }

}
