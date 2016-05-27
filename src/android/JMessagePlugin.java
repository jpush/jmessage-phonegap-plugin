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
            "deleteSingleConversation",
            "getAllSingleConversation",
            "getSingleConversationHistoryMessage",
            "getUserInfo",
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
            // Single conversation.
            "enterSingleConversation",
            "enterSingleConversationCrossApp",
            "enterGroupConversation",
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

    // JMessage methods.

    public void userRegister(JSONArray data, CallbackContext callback) {
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

    public void userLogin(JSONArray data, CallbackContext callback) {
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

    public void userLogout(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "JMessageLogout \n" + data);

        JMessageClient.logout();
        callback.success("退出成功");
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

    public void getUserInfo(JSONArray data, CallbackContext callback) {
        Log.i(TAG, " getUserInfo \n" + data);
        UserInfo info = JMessageClient.getMyInfo();
        try {
            if (info != null && info.getUserName() != null) {
                JSONObject jsonItem = new JSONObject();
                jsonItem.put("username", info.getUserName());
                jsonItem.put("nickname", info.getNickname());
                jsonItem.put("gender", "unknown");
                callback.success(jsonItem);
            } else {
                JSONObject jsonItem = new JSONObject();
                jsonItem.put("errorCode", 863004);
                jsonItem.put("errorDescription", "not found");
                callback.error(jsonItem);
            }
        } catch (JSONException e) {
            e.printStackTrace();
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
            callback.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

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

    //------------群组维护-----------

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

    // 黑名单相关

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

    public void enterSingleConversation(JSONArray data, CallbackContext callback) {
        try {
            String username = data.getString(0);
            JMessageClient.enterSingleConversation(username);
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json error.");
        }
    }

    public void enterSingleConversationCrossApp(JSONArray data,
            CallbackContext callback) {
        try {
            String username = data.getString(0);
            String appkey = data.getString(1);
            JMessageClient.enterSingleConversation(username, appkey);
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
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("json data error");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            callback.error("file url error");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            callback.error("文件不存在");
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

            Map<String, String> valuesMap = new HashMap<String, String>();
            JSONObject customValues = data.getJSONObject(1);
            Iterator<? extends String> keys = customValues.keys();
            String key, value;
            while (keys.hasNext()) {
                key = keys.next();
                value = customValues.getString(key);
                valuesMap.put(key, value);
            }
            Message msg = con.createSendCustomMessage(valuesMap);
            JMessageClient.sendMessage(msg);
            callback.success("正在发送");
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("error reading id json.");
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

    public void deleteSingleConversation(JSONArray data,
            CallbackContext callback) {
        try {
            String username = data.getString(0);
            JMessageClient.deleteSingleConversation(username);
            callback.success("deleteSingleConversation ok");
        } catch (JSONException e) {
            callback.error("deleteSingleConversation failed");
            e.printStackTrace();
        }
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


    private void setUserInfo(UserInfo.Field field, UserInfo info,
            CallbackContext callback) {
        final CallbackContext cb = callback;
        JMessageClient.updateMyInfo(field, info, new BasicCallback() {
            @Override
            public void gotResult(final int status, String desc) {
                cb.success("set userInfo ok");
            }
        });
    }

    public void setUserNickname(JSONArray data, CallbackContext callback) {
        Log.i(TAG, "setUserNickname");
        try {
            String nickName = data.getString(0);
            Log.i(TAG, "setUserNickname" + nickName);

            UserInfo myUserInfo = JMessageClient.getMyInfo();
            myUserInfo.setNickname(nickName);
            this.setUserInfo(UserInfo.Field.nickname, myUserInfo, callback);
            callback.success("update userInfo ok");
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Error reading alias JSON");
        }
    }

    public void setUserGender(JSONArray data, CallbackContext callback) {
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
            this.setUserInfo(UserInfo.Field.gender, myUserInfo, callback);
        } catch (JSONException e) {
            e.printStackTrace();
            callback.error("Error reading alias JSON");
        }
    }

    /**
     * set user's avatar.
     *
     * @param data     data.getString(0): the URL of the users avatar file.
     * @param callback callback method.
     */
    public void setUserAvatar(JSONArray data, CallbackContext callback) {
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

}
