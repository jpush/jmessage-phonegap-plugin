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
//


package cn.jmessage.phonegap;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map.Entry;

import com.ljg.push.R;

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

import android.util.Log;


public class JMessagePlugin extends CordovaPlugin {

    private final static List<String> methodList = Arrays.asList(
            /*JMessage*/
            "initPush",
            "userRegister",
            "userLogin",
            "userLogout",
            "getUserInfo",
            "sendSingleTextMessage",
            "getSingleConversationHistoryMessage",
            "getAllSingleConversation",
            "deleteSingleConversation",
            "setJMessageReceiveCallbackChannel",
            "setUserNickname",
            "setUserGender",
            "setUserAvatar",
            /*push api*/
            "setPushReceiveCallbackChannel",
            "getRegistrationID",
            "setTags",
            "setTagsWithAlias",
            "setAlias",
            "setBasicPushNotificationBuilder",
            "setCustomPushNotificationBuilder",
            "setPushTime",
            "init",
            "setDebugMode",
            "stopPush",
            "resumePush",
            "isPushStopped",
            "setLatestNotificationNum",
            "setPushTime",
            "clearAllNotification",
            "clearNotificationById",
            "addLocalNotification",
            "removeLocalNotification",
            "clearLocalNotifications",
            "onResume",
            "onPause",
            "reportNotificationOpened"
    );

    private ExecutorService threadPool = Executors.newFixedThreadPool(1);
    private static JMessagePlugin instance;
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

        JMessageClient.init(cordova.getActivity().getApplicationContext());
        JMessageClient.registerEventReceiver(this);
        JPushInterface.init(this.cordova.getActivity().getApplicationContext());
    }

    public void onPause(boolean multitasking) {
        Log.i(TAG, "onPause");
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
            LOG.w(TAG, "message is not singleTyle");
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

    public void onDestroy() {
        Log.i(TAG, " onDestroy");
        JMessageClient.unRegisterEventReceiver(this);
    }

    private void handelResult(String sucessString, int status, String desc, CallbackContext cb) {
        if (status == 0) {
            cb.success(sucessString);
        } else {

            JSONObject data = new JSONObject();
            try {
                data.put("errorCode", status);
                data.put("errorDscription", desc);

                cb.error(data);

            } catch (JSONException e) {
                e.printStackTrace();
                cb.error("error write  json");
            }
        }
    }

    void initPush(JSONArray data, CallbackContext callbackContext) {
        JPushInterface.init(this.cordova.getActivity().getApplicationContext());

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
                    handelResult("注册成功", status, desc, cb);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json");
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
                    handelResult("登录成功", status, desc, cb);
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

    public void getUserInfo(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, " getUserInfo \n" + data);
        UserInfo info = JMessageClient.getMyInfo();
        try {
            if (info != null && info.getUserName() != null) {
                JSONObject jsonItem = new JSONObject();
                jsonItem.put("username", info.getUserName());
                jsonItem.put("nickname", info.getNickname());
                jsonItem.put("gender", "unknow");
                callbackContext.success(jsonItem);
            } else {
                JSONObject jsonItem = new JSONObject();
                jsonItem.put("errorCode", 863004);
                jsonItem.put("errorDscription", "not found");
                callbackContext.error(jsonItem);
            }
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
            callbackContext.error("error reading id json");
        }
    }

    private JSONObject getJSonFormMessage(Message msg) {
        String contentText = "";
        String msgType = "";//上传给js 层的类型，请和ios 保持一致

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

    public void getSingleConversationHistoryMessage(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, " getSingleConversationHistoryMessage \n" + data);

        try {
            String username = data.getString(0);
            int from = data.getInt(1);
            int limit = data.getInt(2);

            if (limit <= 0 || from < 0) {
                Log.w(TAG, "  JMessageGetSingleHistoryMessage from: " + from + "limit" + limit);
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

            JSONArray jsonRusult = new JSONArray();

            for (int i = 0; i < list.size(); ++i) {
                Message msg = list.get(i);
                JSONObject obj = this.getJSonFormMessage(msg);


                jsonRusult.put(obj);
            }

            callbackContext.success(jsonRusult);

        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json");
        }
    }


    public void getAllSingleConversation(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, "  getAllSingleConversation \n" + data);


        List<Conversation> list = JMessageClient.getConversationList();

        Log.i(TAG, "JMessageGetAllSingleConversation" + list.size());

        JSONArray jsonRusult = new JSONArray();

        for (int i = 0; i < list.size(); ++i) {
            Conversation conv = list.get(i);

            if (conv.getType() == ConversationType.single) {

                UserInfo info = (UserInfo) conv.getTargetInfo();
                Message msg = conv.getLatestMessage();
                String contentText = "";
                if (msg != null) {
                    switch (msg.getContentType()) {
                        case text: {
                            contentText = ((TextContent) msg.getContent()).getText();

                        }
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
                    jsonItem.put("unreadCount", conv.getUnReadMsgCnt());

                    jsonRusult.put(jsonItem);

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

        }

        callbackContext.success(jsonRusult);
    }

    public void deleteSingleConversation(JSONArray data, CallbackContext callbackContext) {
        try {
            String username = data.getString(0);
            JMessageClient.deleteSingleConversation(username);
            callbackContext.success("deleteSingleConversation ok");

        } catch (JSONException e) {
            callbackContext.error("deleteSingleConversation failed");
            e.printStackTrace();
        }
    }

    public void setJMessageReceiveCallbackChannel(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, "setJMessageReceiveCallbackChannel:" + callbackContext.getCallbackId());

        mJMessageReceiveCallback = callbackContext;
        PluginResult dataResult = new PluginResult(PluginResult.Status.OK, "js call init ok");
        dataResult.setKeepCallback(true);
        mJMessageReceiveCallback.sendPluginResult(dataResult);
    }


    public void setPushReceiveCallbackChannel(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, "setPushReceiveCallbackChannel:" + callbackContext.getCallbackId());

        mJPushReceiveCallback = callbackContext;
        PluginResult dataResult = new PluginResult(PluginResult.Status.OK, "js call init ok");
        dataResult.setKeepCallback(true);//必要
        mJPushReceiveCallback.sendPluginResult(dataResult);
    }

    private void setUserInfo(UserInfo.Field field, UserInfo info, CallbackContext callbackContext) {
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

    public void setUserAvatar(JSONArray data, CallbackContext callbackContext) {
        final CallbackContext cb = callbackContext;
//
//		try {
//
//			String avatarString = data.getString(0);
//			UserInfo myUserInfo = JMessageClient.getMyInfo();
//			myUserInfo.(avatarString);
//
//
//		} catch (JSONException e) {
//			e.printStackTrace();
//			callbackContext.error("Error reading alias JSON");
//		}


    }


    //////////////push  api//////////////////////

    void getRegistrationID(JSONArray data, CallbackContext callbackContext) {
        Log.i(TAG, "getRegistrationID");
        String regID = JPushInterface.getRegistrationID(this.cordova.getActivity().getApplicationContext());
        callbackContext.success(regID);
    }

    void setTags(JSONArray data, CallbackContext callbackContext) {

        try {
            HashSet<String> tags = new HashSet<String>();
            for (int i = 0; i < data.length(); i++) {
                tags.add(data.getString(i));
            }
            JPushInterface.setTags(this.cordova.getActivity()
                    .getApplicationContext(), tags, mTagWithAliasCallback);
            callbackContext.success();

        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("Error reading tags JSON");
        }
    }

    void setAlias(JSONArray data, CallbackContext callbackContext) {
        try {
            String alias = data.getString(0);
            JPushInterface.setAlias(this.cordova.getActivity()
                    .getApplicationContext(), alias, mTagWithAliasCallback);
            callbackContext.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("Error reading alias JSON");
        }
    }

    void setTagsWithAlias(JSONArray data, CallbackContext callbackContext) {
        HashSet<String> tags = new HashSet<String>();
        String alias;
        try {
            alias = data.getString(0);
            JSONArray tagsArray = data.getJSONArray(1);
            for (int i = 0; i < tagsArray.length(); i++) {
                tags.add(tagsArray.getString(i));
            }

            JPushInterface.setAliasAndTags(this.cordova.getActivity()
                    .getApplicationContext(), alias, tags, mTagWithAliasCallback);
            callbackContext.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("Error reading tagAlias JSON");
        }
    }

    void setBasicPushNotificationBuilder(JSONArray data,
                                         CallbackContext callbackContext) {
        BasicPushNotificationBuilder builder = new BasicPushNotificationBuilder(
                this.cordova.getActivity());
        builder.developerArg0 = "Basic builder 1";
        JPushInterface.setPushNotificationBuilder(1, builder);
        JSONObject obj = new JSONObject();
        try {
            obj.put("id", 1);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        //callbackContext.success(obj);
    }


    void setCustomPushNotificationBuilder(JSONArray data,
                                          CallbackContext callbackContext) {

//		CustomPushNotificationBuilder builder = new CustomPushNotificationBuilder(
//				this.cordova.getActivity(), R.layout.test_notification_layout,
//				R.id.icon, R.id.title, R.id.text);
//		builder.developerArg0 = "Custom Builder 1";
//		builder.layoutIconDrawable = R.drawable.jpush_notification_icon;
//		JPushInterface.setPushNotificationBuilder(2, builder);
//		JSONObject obj = new JSONObject();
//		try {
//			obj.put("id", 2);
//		} catch (JSONException e) {
//			e.printStackTrace();
//		}
        //callbackContext.success(obj);
    }

    void clearAllNotification(JSONArray data,
                              CallbackContext callbackContext) {
        JPushInterface.clearAllNotifications(this.cordova.getActivity());
        //callbackContext.success();
    }

    void clearNotificationById(JSONArray data,
                               CallbackContext callbackContext) {
        int notificationId = -1;
        try {
            notificationId = data.getInt(0);
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading id json");
        }
        if (notificationId != -1) {
            JPushInterface.clearNotificationById(this.cordova.getActivity(), notificationId);
        } else {
            callbackContext.error("error id");
        }
    }

    void addLocalNotification(JSONArray data,
                              CallbackContext callbackContext) throws JSONException {
        //builderId,content,title,notificaitonID,broadcastTime,extras

        int builderId = data.getInt(0);
        String content = data.getString(1);
        String title = data.getString(2);
        int notificationID = data.getInt(3);
        int broadcastTime = data.getInt(4);
        JSONObject extras = data.getJSONObject(5);

        JPushLocalNotification ln = new JPushLocalNotification();
        ln.setBuilderId(builderId);
        ln.setContent(content);
        ln.setTitle(title);
        ln.setNotificationId(notificationID);
        ln.setBroadcastTime(System.currentTimeMillis() + broadcastTime);

        ln.setExtras(extras.toString());
        JPushInterface.addLocalNotification(this.cordova.getActivity(), ln);
    }

    void removeLocalNotification(JSONArray data,
                                 CallbackContext callbackContext) throws JSONException {

        int notificationID = data.getInt(0);
        JPushInterface.removeLocalNotification(this.cordova.getActivity(), notificationID);

    }

    void clearLocalNotifications(JSONArray data,
                                 CallbackContext callbackContext) {
        JPushInterface.clearLocalNotifications(this.cordova.getActivity());
    }


    private final TagAliasCallback mTagWithAliasCallback = new TagAliasCallback() {

        @Override
        public void gotResult(int code, String alias, Set<String> tags) {
            if (instance == null) {
                return;
            }

            JSONObject data = new JSONObject();
            try {
                data.put("resultCode", code);
                data.put("tags", tags);
                data.put("alias", alias);

                String jsEvent = String
                        .format("cordova.fireDocumentEvent('jpush.setTagsWithAlias',%s)",
                                data.toString());
                instance.webView.sendJavascript(jsEvent);


            } catch (JSONException e) {

            }
        }
    };

    void setDebugMode(JSONArray data, CallbackContext callbackContext) {
        boolean mode;
        try {
            mode = data.getBoolean(0);
            // if (mode.equals("true")) {
            // 	JPushInterface.setDebugMode(true);
            // } else if (mode.equals("false")) {
            // 	JPushInterface.setDebugMode(false);
            // } else {
            // 	callbackContext.error("error mode");
            // }
            JPushInterface.setDebugMode(mode);
            callbackContext.success();
        } catch (JSONException e) {
        }
    }

    void stopPush(JSONArray data,
                  CallbackContext callbackContext) {
        JPushInterface.stopPush(this.cordova.getActivity().getApplicationContext());
        callbackContext.success();
    }

    void resumePush(JSONArray data,
                    CallbackContext callbackContext) {
        JPushInterface.resumePush(this.cordova.getActivity().getApplicationContext());
        callbackContext.success();
    }

    void isPushStopped(JSONArray data,
                       CallbackContext callbackContext) {
        boolean isStopped = JPushInterface.isPushStopped(this.cordova.getActivity().getApplicationContext());
        if (isStopped) {
            callbackContext.success(1);
        } else {
            callbackContext.success(0);
        }
    }

    void setLatestNotificationNum(JSONArray data,
                                  CallbackContext callbackContext) {
        int num = -1;
        try {
            num = data.getInt(0);
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading num json");
        }
        if (num != -1) {
            JPushInterface.setLatestNotificationNumber(this.cordova.getActivity().getApplicationContext(), num);
        } else {
            callbackContext.error("error num");
        }
    }

    void setPushTime(JSONArray data,
                     CallbackContext callbackContext) {
        Set<Integer> days = new HashSet<Integer>();
        JSONArray dayArray;
        int startHour = -1;
        int endHour = -1;
        try {
            dayArray = data.getJSONArray(0);
            for (int i = 0; i < dayArray.length(); i++) {
                days.add(dayArray.getInt(i));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error("error reading days json");
        }
        try {
            startHour = data.getInt(1);
            endHour = data.getInt(2);
        } catch (JSONException e) {
            callbackContext.error("error reading hour json");
        }
        JPushInterface.setPushTime(this.cordova.getActivity().getApplicationContext(), days, startHour, endHour);
        callbackContext.success();
    }

    void onResume(JSONArray data, CallbackContext callbackContext) {
        JPushInterface.onResume(this.cordova.getActivity());
    }

    void onPause(JSONArray data, CallbackContext callbackContext) {
        JPushInterface.onPause(this.cordova.getActivity());
    }

    void reportNotificationOpened(JSONArray data, CallbackContext callbackContext) {
        try {
            String msgID;
            msgID = data.getString(0);
            JPushInterface.reportNotificationOpened(this.cordova.getActivity(), msgID);
        } catch (JSONException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    void onReceivePushMessage(JSONObject jsonData) {
        Log.i(TAG, "onReceivePushMessage");
        if (mJPushReceiveCallback == null) {
            Log.i(TAG, "mJPushReceiveCallback is null");
            return;
        }

        PluginResult dataResult = new PluginResult(PluginResult.Status.OK, jsonData);
        dataResult.setKeepCallback(true);
        mJPushReceiveCallback.sendPluginResult(dataResult);

    }


    //构造上传到Js 的 Push 数据
    private static JSONObject basePushJsonObject(String message,
                                                 Map<String, Object> extras) {
        JSONObject data = new JSONObject();
        try {
            JSONObject jExtras = new JSONObject();
            for (Entry<String, Object> entry : extras.entrySet()) {
                if (entry.getKey().equals("cn.jpush.android.EXTRA")) {
                    JSONObject jo = new JSONObject((String) entry.getValue());
                    jExtras.put("cn.jpush.android.EXTRA", jo);
                } else {
                    jExtras.put(entry.getKey(), entry.getValue());
                }
            }
            if (jExtras.length() > 0) {
                data.put("extras", jExtras);
            }
        } catch (JSONException e) {

        }
        return data;
    }


    private static JSONObject getPushObject(String messageWrapTyle,
                                            String messageKeyword,
                                            String message,
                                            Map<String, Object> extras) {

        JSONObject data = basePushJsonObject(message, extras);
        JSONObject data2 = new JSONObject();
        try {
            data.put(messageKeyword, message);
            data2.put("data", data);
            data2.put("messageWrapTyle", messageWrapTyle);

        } catch (JSONException e) {

        }
        return data2;
    }

    public static void transmitPushMessage(String action, String message, Map<String, Object> extras) {
        JSONObject data = null;
        if (action.equals(JPushInterface.ACTION_MESSAGE_RECEIVED)) {
            data = getPushObject("ACTION_MESSAGE_RECEIVED", "message", message, extras);
        } else if (action.equals(JPushInterface.ACTION_NOTIFICATION_RECEIVED)) {
            data = getPushObject("ACTION_NOTIFICATION_RECEIVED", "alert", message, extras);
        } else if (action.equals(JPushInterface.ACTION_NOTIFICATION_OPENED)) {
            data = getPushObject("ACTION_NOTIFICATION_OPENED", "alert", message, extras);
        } else {
            Log.w(TAG, "unkown push action ");
        }

        if (instance != null && data != null) {
            instance.onReceivePushMessage(data);
        } else {
            if (instance == null) {
                Log.w(TAG, "instance is null");
            }
            Log.w(TAG, " err when transmit Message to js ");
        }
    }
}
