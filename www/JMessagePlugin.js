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

import android.media.MediaPlayer;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

import com.google.gson.Gson;

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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import cn.jpush.android.api.JPushInterface;
import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.CreateGroupCallback;
import cn.jpush.im.android.api.callback.GetBlacklistCallback;
import cn.jpush.im.android.api.callback.GetGroupIDListCallback;
import cn.jpush.im.android.api.callback.GetGroupInfoCallback;
import cn.jpush.im.android.api.callback.GetGroupMembersCallback;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.event.MessageEvent;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.api.BasicCallback;


public class JMessagePlugin extends CordovaPlugin {
    private static String TAG = "JMessagePlugin";

    private final static List<String> methodList = Arrays.asList(
            // Login and register API.
            "register",
            "login",
            "logout",
            // User info API.
            "getUserInfo",
            "getMyInfo",
            "updateMyInfo",
            "updateUserPassword",
            "updateUserAvatar",
            // Message API.
            "sendSingleTextMessage",
            "sendSingleImageMessage",
            "sendSingleVoiceMessage",
            "sendSingleCustomMessage",
            "sendGroupTextMessage",
            "sendGroupImageMessage",
            "sendGroupVoiceMessage",
            "sendGroupCustomMessage",
            // Conversation API.
            "getConversationList",
            "getSingleConversation",
            "getGroupConversation",
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

    private ExecutorService threadPool = Executors.newFixedThreadPool(1);
    private Gson mGson = new Gson();

    private CallbackContext mJMessageReceiveCallback = null;

    public JMessagePlugin() {
    }

    protected void pluginInitialize() {
        Log.i(TAG, "pluginInitialize");

        JMessageClient.init(this.cordova.getActivity().getApplicationContext());
        JMessageClient.registerEventReceiver(this);
        JPushInterface.init(this.cordova.getActivity().getApplicationContext());
    }

    public void onEvent(MessageEvent event) {
        final Message msg = event.getMessage();

        Log.i(TAG, "onEvent:" + msg.toString());

        // 可以在这里创建 Notification。
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

    // Login and register API.

    public void register(JSONArray data, CallbackContext callback) {
        Log.i(TAG, " JMessageRegister \n" + data);

        final CallbackContext cb = callback;
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
            callback.error("error reading id json.");
        }
    }

    public void login(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "  userLogin \n" + data);

        final CallbackContext cb = callback;
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
            callback.error("error reading id json");
        }
    }

    public void logout(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "JMessageLogout \n" + data);

        JMessageClient.logout();
        callback.success("退出成功");
    }

    // User info API.

    public void getUserInfo(JSONArray data, final CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.getString(1);
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
            callback.error("json error.");
        }
    }

    public void getMyInfo(JSONArray data, CallbackContext callback) {
        UserInfo myInfo = JMessageClient.getMyInfo();
        String json = mGson.toJson(myInfo);
        callback.success(json);
    }

    public void updateMyInfo(JSONArray data, final CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.getString(1);
            String field = data.getString(2);

            UserInfo userInfo = getUserInfo(username, appKey);

            switch (field) {
                case "nickname":
                    String nickname = data.getString(3);
                    userInfo.setNickname(nickname);
                    break;
                case "birthday":
                    long birthday = data.getLong(3);
                    userInfo.setBirthday(birthday);
                    break;
                case "gender":
                    String gender = data.getString(3);
                    if (gender.equals("male")) {
                        userInfo.setGender(UserInfo.Gender.male);
                    } else if (gender.equals("female")) {
                        userInfo.setGender(UserInfo.Gender.male);
                    } else {
                        userInfo.setGender(UserInfo.Gender.unknown);
                    }
                    break;
                case "region":
                    String region = data.getString(3);
                    userInfo.setRegion(region);
                    break;
                default:
                    callback.error("UserInfo field error.");
            }

            JMessageClient.updateMyInfo(UserInfo.Field.valueOf(field), userInfo,
                    new BasicCallback() {
                        @Override
                        public void gotResult(int responseCode, String responseDesc) {
                            if (responseCode == 0) {
                                callback.success();
                            }
                        }
                    });
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
        }
    }

    /**
     * Update user password.
     *
     * @param data     JSONArray; data.getString(0): old password, data.getString(1): new password.
     * @param callback result callback method.
     */
    public void updateUserPassword(JSONArray data, CallbackContext callback) {
        final CallbackContext cb = callback;
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
            callback.error("error reading password json.");
        }
    }

    /**
     * update user's avatar.
     *
     * @param data     data.getString(0): the URL of the users avatar file.
     * @param callback callback method.
     */
    public void updateUserAvatar(JSONArray data, CallbackContext callback) {
        final CallbackContext cb = callback;
        try {
            String avatarPath = data.getString(0);
            if (TextUtils.isEmpty(avatarPath)) {
                callback.error("Avatar path is empty!");
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
            callback.error("Error reading alias JSON.");
        }
    }


    // Message API.

    public void sendSingleTextMessage(JSONArray data, CallbackContext callback) {
        Log.i(TAG, " sendSingleTextMessage \n" + data);

        final CallbackContext cb = callback;
        try {
            String username = data.getString(0);
            String text = data.getString(1);

            Conversation conversation = JMessageClient.getSingleConversation(username);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(username);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            TextContent content = new TextContent(text);
            final Message msg = conversation.createSendMessage(content);
            JMessageClient.sendMessage(msg);
            callback.success("正在发送");
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
    public void sendSingleImageMessage(JSONArray data, CallbackContext callback) {
        try {
            String userName = data.getString(0);
            String imgUrlStr = data.getString(1);

            Conversation conversation = JMessageClient.getSingleConversation(userName);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(userName);
            }
            if (conversation == null) {
                callback.error("无法创建对话");
                return;
            }

            URL imgUrl = new URL(imgUrlStr);
            File imgFile = new File(imgUrl.getPath());
            Message msg = conversation.createSendImageMessage(imgFile);
            JMessageClient.sendMessage(msg);
            callback.success("正在发送");
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
    public void sendSingleVoiceMessage(JSONArray data, CallbackContext callback) {
        try {
            String userName = data.getString(0);
            String voiceUrlStr = data.getString(1);

            Conversation conversation = JMessageClient.getSingleConversation(userName);
            if (conversation == null) {
                conversation = Conversation.createSingleConversation(userName);
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

            Message msg = JMessageClient.createSingleVoiceMessage(userName, file, duration);
            JMessageClient.sendMessage(msg);
            callback.success("正在发送");
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
    public void sendSingleCustomMessage(JSONArray data, CallbackContext callback) {
        try {
            String userName = data.getString(0);

            Conversation con = JMessageClient.getSingleConversation(userName);
            if (con == null) {
                con = Conversation.createSingleConversation(userName);
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
            Message msg = JMessageClient.createSingleCustomMessage(userName, valuesMap);
            JMessageClient.sendMessage(msg);
            callback.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
        }
    }

    /**
     * @param data     JSONArray.
     *                 data.getLong(0):groupId, data.getString(1):text.
     * @param callback CallbackContext.
     */
    public void sendGroupTextMessage(JSONArray data, CallbackContext callback) {
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

            Message msg = JMessageClient.createGroupTextMessage(groupId, text);
            JMessageClient.sendMessage(msg);
            callback.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json.");
        }
    }

    public void sendGroupImageMessage(JSONArray data, CallbackContext callback) {
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
            Message msg = JMessageClient.createGroupImageMessage(groupId, imgFile);
            JMessageClient.sendMessage(msg);
            callback.success("发送成功");
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callback.error("file not found.");
        }
    }

    public void sendGroupVoiceMessage(JSONArray data, CallbackContext callback) {
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

            Message msg = JMessageClient.createGroupVoiceMessage(groupId, file, duration);
            JMessageClient.sendMessage(msg);
            callback.success("正在发送");
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
    public void sendGroupCustomMessage(JSONArray data, CallbackContext callback) {
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
            Message msg = JMessageClient.createGroupCustomMessage(groupId, valuesMap);
            JMessageClient.sendMessage(msg);
            callback.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json.");
        }
    }


    // Conversation API.

    public void getConversationList(JSONArray data, CallbackContext callback) {
        List<Conversation> conversationList = JMessageClient.getConversationList();
        if (conversationList != null) {
            String json = mGson.toJson(conversationList);
            callback.success(json);
        } else {
            callback.error("conversation list not find.");
        }
    }

    public void enterSingleConversation(JSONArray data, CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.getString(1);
            JMessageClient.enterSingleConversation(username, appKey);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
        }
    }

    public void enterGroupConversation(JSONArray data, CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            JMessageClient.enterGroupConversation(groupId);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
        }
    }

    public void getSingleConversation(JSONArray data, CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.getString(1);
            Conversation conversation = JMessageClient.getSingleConversation(username, appKey);
            if (conversation != null) {
                String json = mGson.toJson(conversation);
                callback.success(json);
            } else {
                callback.error("conversation not find.");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
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
            callback.error("json error.");
        }
    }

    public void deleteSingleConversation(JSONArray data, CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appKey = data.getString(1);
            JMessageClient.deleteSingleConversation(username, appKey);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
        }
    }

    public void deleteGroupConversation(JSONArray data, CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            JMessageClient.deleteGroupConversation(groupId);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
        }
    }

    public void exitConversation(JSONArray data, CallbackContext callback) {
        JMessageClient.exitConversation();
    }


    // Group API.

    public void createGroup(JSONArray data, final CallbackContext callback) {
        try {
            String groupName = data.getString(0);
            String groupDesc = data.getString(1);
            JMessageClient.createGroup(groupName, groupDesc, new CreateGroupCallback() {
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
            callback.error("json error.");
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
            callback.error("json error.");
        }
    }

    public void updateGroupName(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String groupNewName = data.getString(1);

            JMessageClient.updateGroupName(groupId, groupNewName, new BasicCallback() {
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
            callback.error("json error.");
        }
    }

    public void updateGroupDescription(JSONArray data, final CallbackContext callback) {
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
            callback.error("json error.");
        }
    }

    public void addGroupMembers(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String membersStr = data.getString(1);

            String[] members = membersStr.split(",");
            List<String> memberList = new ArrayList<String>();
            for (String member : members) {
                memberList.add(member);
            }
            JMessageClient.addGroupMembers(groupId, memberList, new BasicCallback() {
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
            callback.error("json error.");
        }
    }

    public void removeGroupMembers(JSONArray data, final CallbackContext callback) {
        try {
            long groupId = data.getLong(0);
            String userNamesStr = data.getString(1);
            String[] userNamesArr = userNamesStr.split(",");

            List<String> userNamesList = Arrays.asList(userNamesArr);
            JMessageClient.removeGroupMembers(groupId, userNamesList, new BasicCallback() {
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
            callback.error("json error.");
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
            callback.error("json error.");
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
            callback.error("json error.");
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
            callback.error("json error.");
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
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
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
                Log.w(TAG, "JMessageGetSingleHistoryMessage from: " + from + "limit" + limit);
                return;
            }
            Conversation conversation = JMessageClient.getSingleConversation(username);
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
        callback.success(jsonResult);
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

}
