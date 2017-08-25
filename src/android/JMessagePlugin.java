package cn.jiguang.cordova.im;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.MediaPlayer;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import cn.jpush.im.android.api.ContactManager;
import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.CreateGroupCallback;
import cn.jpush.im.android.api.callback.DownloadCompletionCallback;
import cn.jpush.im.android.api.callback.GetAvatarBitmapCallback;
import cn.jpush.im.android.api.callback.GetBlacklistCallback;
import cn.jpush.im.android.api.callback.GetGroupIDListCallback;
import cn.jpush.im.android.api.callback.GetGroupInfoCallback;
import cn.jpush.im.android.api.callback.GetGroupMembersCallback;
import cn.jpush.im.android.api.callback.GetNoDisurbListCallback;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.callback.GetUserInfoListCallback;
import cn.jpush.im.android.api.callback.IntegerCallback;
import cn.jpush.im.android.api.content.CustomContent;
import cn.jpush.im.android.api.content.FileContent;
import cn.jpush.im.android.api.content.ImageContent;
import cn.jpush.im.android.api.content.LocationContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.content.VoiceContent;
import cn.jpush.im.android.api.enums.ContentType;
import cn.jpush.im.android.api.event.ContactNotifyEvent;
import cn.jpush.im.android.api.event.ConversationRefreshEvent;
import cn.jpush.im.android.api.event.LoginStateChangeEvent;
import cn.jpush.im.android.api.event.MessageEvent;
import cn.jpush.im.android.api.event.MessageRetractEvent;
import cn.jpush.im.android.api.event.NotificationClickEvent;
import cn.jpush.im.android.api.event.OfflineMessageEvent;
import cn.jpush.im.android.api.exceptions.JMFileSizeExceedException;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.android.api.options.MessageSendingOptions;
import cn.jpush.im.api.BasicCallback;

import static cn.jiguang.cordova.im.JMessageUtils.handleResult;
import static cn.jiguang.cordova.im.JMessageUtils.sendMessage;
import static cn.jiguang.cordova.im.JMessageUtils.toMessageSendingOptions;
import static cn.jiguang.cordova.im.JsonUtils.fromJson;
import static cn.jiguang.cordova.im.JsonUtils.toJson;

public class JMessagePlugin extends CordovaPlugin {

    private static String TAG = JMessagePlugin.class.getSimpleName();

    private static final int ERR_CODE_PARAMETER = 1;
    private static final int ERR_CODE_CONVERSATION = 2;
    private static final int ERR_CODE_MESSAGE = 3;
    private static final int ERR_CODE_FILE = 4;

    private static final String ERR_MSG_PARAMETER = "Parameters error";
    private static final String ERR_MSG_CONVERSATION = "Can't get the conversation";
    private static final String ERR_MSG_MESSAGE = "No such message";

    private Activity mCordovaActivity;

    private CallbackContext mCallback;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        mCordovaActivity = cordova.getActivity();
    }

    @Override
    public boolean execute(final String action, final JSONArray data, final CallbackContext callback)
            throws JSONException {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    Method method = JMessagePlugin.class.getDeclaredMethod(action, JSONArray.class,
                            CallbackContext.class);
                    method.invoke(JMessagePlugin.this, data, callback);
                } catch (Exception e) {
                    Log.e(TAG, e.toString());
                }
            }
        });
        return true;
    }

    void init(JSONArray data, CallbackContext callback) throws JSONException {
        JSONObject params = data.getJSONObject(0);

        boolean isOpenMessageRoaming = false;
        if (params.has("isOpenMessageRoaming")) {
            isOpenMessageRoaming = params.getBoolean("isOpenMessageRoaming");
        }
        JMessageClient.init(mCordovaActivity.getApplicationContext(), isOpenMessageRoaming);
        JMessageClient.registerEventReceiver(this);

        mCallback = callback;
    }

    void setDebugMode(JSONArray data, CallbackContext callback) throws JSONException {
        JSONObject params = data.getJSONObject(0);
        boolean enable = params.getBoolean("enable");
        JMessageClient.setDebugMode(enable);
    }

    void userRegister(JSONArray data, final CallbackContext callback) {
        String username, password;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            password = params.getString("password");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.register(username, password, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    public void userLogin(JSONArray data, final CallbackContext callback) {
        String username, password;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            password = params.getString("password");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.login(username, password, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void userLogout(JSONArray data, CallbackContext callback) {
        JMessageClient.logout();
    }

    void getMyInfo(JSONArray data, final CallbackContext callback) {
        UserInfo myInfo = JMessageClient.getMyInfo();
        if (myInfo != null) {
            callback.success(toJson(myInfo));
        } else {
            callback.success(new JSONObject());
        }
    }

    void getUserInfo(JSONArray data, final CallbackContext callback) {
        String username, appKey;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            appKey = params.has("appKey") ? params.getString("appKey") : "";
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {

            @Override
            public void gotResult(int status, String desc, UserInfo userInfo) {
                if (status == 0) {
                    handleResult(toJson(userInfo), status, desc, callback);
                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void updateMyPassword(JSONArray data, final CallbackContext callback) {
        String oldPwd, newPwd;

        try {
            JSONObject params = data.getJSONObject(0);
            oldPwd = params.getString("oldPwd");
            newPwd = params.getString("newPwd");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.updateUserPassword(oldPwd, newPwd, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void updateMyAvatar(JSONArray data, final CallbackContext callback) throws JSONException {
        JSONObject params = data.getJSONObject(0);
        if (!params.has("imgPath")) {
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        String imgPath = params.getString("imgPath");
        File img = new File(imgPath);
        JMessageClient.updateUserAvatar(img, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void updateMyInfo(JSONArray data, final CallbackContext callback) {
        UserInfo myInfo = JMessageClient.getMyInfo();
        UserInfo.Field field = null;

        try {
            JSONObject params = data.getJSONObject(0);

            if (params.has("nickname")) {
                field = UserInfo.Field.nickname;
                myInfo.setNickname(params.getString("nickname"));

            } else if (params.has("birthday")) {
                field = UserInfo.Field.birthday;
                myInfo.setBirthday(params.getLong("birthday"));

            } else if (params.has("signature")) {
                field = UserInfo.Field.signature;
                myInfo.setSignature(params.getString("signature"));

            } else if (params.has("gender")) {
                field = UserInfo.Field.gender;

                if (params.getString("gender").equals("male")) {
                    myInfo.setGender(UserInfo.Gender.male);
                } else if (params.getString("gender").equals("female")) {
                    myInfo.setGender(UserInfo.Gender.female);
                } else {
                    myInfo.setGender(UserInfo.Gender.unknown);
                }

            } else if (params.has("region")) {
                field = UserInfo.Field.region;
                myInfo.setRegion(params.getString("region"));

            } else if (params.has("address")) {
                field = UserInfo.Field.address;
                myInfo.setAddress(params.getString("address"));

            } else {
                handleResult(0, "field error", callback);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.updateMyInfo(field, myInfo, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });   
    }

    void sendTextMessage(JSONArray data, final CallbackContext callback) {
        String text;
        Map<String, String> extras = null;
        MessageSendingOptions messageSendingOptions = null;
        Conversation conversation;

        try {
            JSONObject params = data.getJSONObject(0);

            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
                return;
            }

            text = params.getString("text");

            if (params.has("extras")) {
                extras = fromJson(params.getJSONObject("extras"));
            }

            if (params.has("messageSendingOptions")) {
                messageSendingOptions = toMessageSendingOptions(params.getJSONObject("messageSendingOptions"));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        TextContent content = new TextContent(text);
        if (extras != null) {
            content.setExtras(extras);
        }

        sendMessage(conversation, content, messageSendingOptions, callback);
    }

    void sendImageMessage(JSONArray data, CallbackContext callback) {
        String path;
        Map<String, String> extras = null;
        MessageSendingOptions messageSendingOptions = null;
        Conversation conversation;

        try {
            JSONObject params = data.getJSONObject(0);

            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
                return;
            }

            path = params.getString("path");

            if (params.has("extras")) {
                extras = fromJson(params.getJSONObject("extras"));
            }

            if (params.has("messageSendingOptions")) {
                messageSendingOptions = toMessageSendingOptions(params.getJSONObject("messageSendingOptions"));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        ImageContent content;
        try {
            content = new ImageContent(new File(path));
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_FILE, "No such file", callback);
            return;
        }

        if (extras != null) {
            content.setExtras(extras);
        }

        sendMessage(conversation, content, messageSendingOptions, callback);
    }

    void sendVoiceMessage(JSONArray data, CallbackContext callback) {
        String path;
        Map<String, String> extras = null;
        MessageSendingOptions messageSendingOptions = null;
        Conversation conversation;

        try {
            JSONObject params = data.getJSONObject(0);

            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
                return;
            }

            path = params.getString("path");

            if (params.has("extras")) {
                extras = fromJson(params.getJSONObject("extras"));
            }

            if (params.has("messageSendingOptions")) {
                messageSendingOptions = toMessageSendingOptions(params.getJSONObject("messageSendingOptions"));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        try {
            File file = new File(path);
            MediaPlayer mediaPlayer = MediaPlayer.create(mCordovaActivity, Uri.parse(path));
            int duration = mediaPlayer.getDuration() / 1000;    // Millisecond to second.
            VoiceContent content = new VoiceContent(file, duration);
            mediaPlayer.release();

            if (extras != null) {
                content.setExtras(extras);
            }

            sendMessage(conversation, content, messageSendingOptions, callback);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_FILE, "No such file", callback);
        }
    }

    void sendCustomMessage(JSONArray data, CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);

            Conversation conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
                return;
            }

            JSONObject customObject = params.getJSONObject("customObject");

            MessageSendingOptions options = null;
            if (params.has("messageSendingOptions")) {
                options = toMessageSendingOptions(params.getJSONObject("messageSendingOptions"));
            }

            CustomContent content = new CustomContent();
            content.setAllValues(fromJson(customObject));
            sendMessage(conversation, content, options, callback);
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        }
    }

    void sendLocationMessage(JSONArray data, CallbackContext callback) {
        double latitude, longitude;
        int scale;
        String address;
        Map<String, String> extras = null;
        MessageSendingOptions options = null;
        Conversation conversation;

        try {
            JSONObject params = data.getJSONObject(0);

            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
                return;
            }

            latitude = params.getDouble("latitude");
            longitude = params.getDouble("longitude");
            scale = params.getInt("scale");
            address = params.getString("address");

            if (params.has("extras")) {
                extras = fromJson(params.getJSONObject("extras"));
            }

            if (params.has("messageSendingOptions")) {
                options = toMessageSendingOptions(params.getJSONObject("messageSendingOptions"));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        LocationContent content = new LocationContent(latitude, longitude, scale, address);
        if (extras != null) {
            content.setExtras(extras);
        }

        sendMessage(conversation, content, options, callback);
    }

    void sendFileMessage(JSONArray data, CallbackContext callback) {
        String path, fileName;
        Map<String, String> extras = null;
        MessageSendingOptions options = null;
        Conversation conversation;

        try {
            JSONObject params = data.getJSONObject(0);

            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
                return;
            }

            path = params.getString("path");
            fileName = params.getString("fileName");

            if (params.has("extras")) {
                extras = fromJson(params.getJSONObject("extras"));
            }

            if (params.has("messageSendingOptions")) {
                options = toMessageSendingOptions(params.getJSONObject("messageSendingOptions"));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        try {
            FileContent content = new FileContent(new File(path), fileName);
            if (extras != null) {
                content.setExtras(extras);
            }
            sendMessage(conversation, content, options, callback);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_FILE, "No such file", callback);
        } catch (JMFileSizeExceedException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_FILE, "File size is too large", callback);
        }
    }

    void retractMessage(JSONArray data, final CallbackContext callback) {
        Conversation conversation;
        String messageId;

        try {
            JSONObject params = data.getJSONObject(0);
            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
                return;
            }

            messageId = params.getString("messageId");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        Message msg = conversation.getMessage(Integer.parseInt(messageId));
        conversation.retractMessage(msg, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void getHistoryMessages(JSONArray data, CallbackContext callback) {
        Conversation conversation;
        int from, limit;

        try {
            JSONObject params = data.getJSONObject(0);
            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
                return;
            }

            from = params.getInt("from");
            limit = params.getInt("limit");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        List<Message> messageList = conversation.getMessagesFromNewest(from, limit);
        JSONArray messageJSONArr = new JSONArray();

        for (Message msg : messageList) {
            messageJSONArr.put(toJson(msg));
        }
        callback.success(messageJSONArr);
    }

    void sendInvitationRequest(JSONArray data, final CallbackContext callback) {
        String username, appKey, reason;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            appKey = params.has("appKey") ? params.getString("appKey") : "";
            reason = params.getString("reason");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        ContactManager.sendInvitationRequest(username, appKey, reason, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void acceptInvitation(JSONArray data, final CallbackContext callback) {
        String username, appKey;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            appKey = params.has("appKey") ? params.getString("appKey") : "";
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        ContactManager.acceptInvitation(username, appKey, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void declineInvitationRequest(JSONArray data, final CallbackContext callback) {
        String username, appKey, reason;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            appKey = params.has("appKey") ? params.getString("appKey") : "";
            reason = params.getString("reason");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        ContactManager.sendInvitationRequest(username, appKey, reason, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void removeFromFriendList(JSONArray data, final CallbackContext callback) {
        String username, appKey;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            appKey = params.getString("appKey");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {

            @Override
            public void gotResult(int status, String desc, UserInfo userInfo) {
                if (status == 0) {
                    userInfo.removeFromFriendList(new BasicCallback() {

                        @Override
                        public void gotResult(int status, String desc) {
                            handleResult(status, desc, callback);
                        }
                    });

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void updateFriendNoteName(JSONArray data, final CallbackContext callback) {
        final String username, appKey, noteName;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            appKey = params.getString("appKey");
            noteName = params.getString("noteName");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {

            @Override
            public void gotResult(int status, String desc, UserInfo userInfo) {
                if (status == 0) {
                    userInfo.updateNoteName(noteName, new BasicCallback() {

                        @Override
                        public void gotResult(int status, String desc) {
                            handleResult(status, desc, callback);
                        }
                    });

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void updateFriendNoteText(JSONArray data, final CallbackContext callback) {
        final String username, appKey, noteText;

        try {
            JSONObject params = data.getJSONObject(0);
            username = params.getString("username");
            appKey = params.getString("appKey");
            noteText = params.getString("noteText");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {

            @Override
            public void gotResult(int status, String desc, UserInfo userInfo) {
                if (status == 0) {
                    userInfo.updateNoteText(noteText, new BasicCallback() {

                        @Override
                        public void gotResult(int status, String desc) {
                            handleResult(status, desc, callback);
                        }
                    });

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void getFriends(JSONArray data, final CallbackContext callback) {
        ContactManager.getFriendList(new GetUserInfoListCallback() {

            @Override
            public void gotResult(int status, String desc, List list) {
                if (status == 0) {
                    handleResult(toJson(list), status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void createGroup(JSONArray data, final CallbackContext callback) {
        String name, desc;

        try {
            JSONObject params = data.getJSONObject(0);
            name = params.getString("name");
            desc = params.getString("desc");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.createGroup(name, desc, new CreateGroupCallback() {

            @Override
            public void gotResult(int status, String desc, long groupId) {
                if (status == 0) {
                    callback.success(String.valueOf(groupId));

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void getGroupIds(JSONArray data, final CallbackContext callback) {
        JMessageClient.getGroupIDList(new GetGroupIDListCallback() {
            @Override
            public void gotResult(int status, String desc, List<Long> list) {
                if (status == 0) {
                    JSONArray groupIdJsonArr = new JSONArray();
                    for (Long id : list) {
                        groupIdJsonArr.put(String.valueOf(id));
                    }
                    handleResult(groupIdJsonArr, status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void getGroupInfo(JSONArray data, final CallbackContext callback) {
        long groupId;

        try {
            JSONObject params = data.getJSONObject(0);
            groupId = Long.parseLong(params.getString("id"));

        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {
            @Override
            public void gotResult(int status, String desc, GroupInfo groupInfo) {
                if (status == 0) {
                    handleResult(toJson(groupInfo), status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void updateGroupInfo(JSONArray data, final CallbackContext callback) {
        final long groupId;
        final String newName, newDesc;

        try {
            JSONObject params = data.getJSONObject(0);
            groupId = Long.parseLong(params.getString("id"));
            newName = params.has("newName") ? params.getString("newName") : null;
            newDesc = params.has("newDesc") ? params.getString("newDesc") : null;

        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        if (!TextUtils.isEmpty(newName) && TextUtils.isEmpty(newDesc)) {
            JMessageClient.updateGroupName(groupId, newName, new BasicCallback() {

                @Override
                public void gotResult(int status, String desc) {
                    handleResult(status, desc, callback);
                }
            });
            return;
        }

        if (TextUtils.isEmpty(newName) && !TextUtils.isEmpty(newDesc)) {
            JMessageClient.updateGroupDescription(groupId, newDesc, new BasicCallback() {

                @Override
                public void gotResult(int status, String desc) {
                    handleResult(status, desc, callback);
                }
            });
            return;
        }

        if (!TextUtils.isEmpty(newName) && !TextUtils.isEmpty(newDesc)) {
            JMessageClient.updateGroupName(groupId, newName, new BasicCallback() {

                @Override
                public void gotResult(int status, String desc) {
                    if (status == 0) {
                        JMessageClient.updateGroupDescription(groupId, newDesc, new BasicCallback() {

                            @Override
                            public void gotResult(int status, String desc) {
                                handleResult(status, desc, callback);
                            }
                        });

                    } else {
                        handleResult(status, desc, callback);
                    }
                }
            });
        }
    }

    void addGroupMembers(JSONArray data, final CallbackContext callback) {
        long groupId;
        JSONArray usernameJsonArr;
        String appKey;
        List<String> usernameList = new ArrayList<String>();

        try {
            JSONObject params = data.getJSONObject(0);
            groupId = Long.parseLong(params.getString("id"));
            appKey = params.has("appKey") ? params.getString("appKey") : "";
            usernameJsonArr = params.getJSONArray("usernameArray");

            for (int i = 0; i < usernameJsonArr.length(); i++) {
                usernameList.add(usernameJsonArr.getString(i));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.addGroupMembers(groupId, appKey, usernameList, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void removeGroupMembers(JSONArray data, final CallbackContext callback) {
        long groupId;
        JSONArray usernameJsonArr;
        String appKey;
        List<String> usernameList = new ArrayList<String>();

        try {
            JSONObject params = data.getJSONObject(0);
            groupId = Long.parseLong(params.getString("id"));
            appKey = params.has("appKey") ? params.getString("appKey") : "";
            usernameJsonArr = params.getJSONArray("usernameArray");

            for (int i = 0; i < usernameJsonArr.length(); i++) {
                usernameList.add(usernameJsonArr.getString(i));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.removeGroupMembers(groupId, appKey, usernameList, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void exitGroup(JSONArray data, final CallbackContext callback) {
        long groupId;

        try {
            JSONObject params = data.getJSONObject(0);
            groupId = Long.parseLong(params.getString("id"));
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.exitGroup(groupId, new BasicCallback() {

            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void getGroupMembers(JSONArray data, final CallbackContext callback) {
        long groupId;

        try {
            JSONObject params = data.getJSONObject(0);
            groupId = Long.parseLong(params.getString("id"));
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.getGroupMembers(groupId, new GetGroupMembersCallback() {

            @Override
            public void gotResult(int status, String desc, List list) {
                if (status == 0) {
                    handleResult(toJson(list), status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void addUsersToBlacklist(JSONArray data, final CallbackContext callback) {
        List<String> usernameList;
        String appKey;

        try {
            JSONObject params = data.getJSONObject(0);
            JSONArray usernameJsonArr = params.getJSONArray("usernameArray");

            usernameList = new ArrayList<String>();
            for (int i = 0; i < usernameJsonArr.length(); i++) {
                usernameList.add(usernameJsonArr.getString(i));
            }

            appKey = params.has("appKey") ? params.getString("appKey") : "";
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.addUsersToBlacklist(usernameList, appKey, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void removeUsersFromBlacklist(JSONArray data, final CallbackContext callback) {
        List<String> usernameList;
        String appKey;

        try {
            JSONObject params = data.getJSONObject(0);
            JSONArray usernameJsonArr = params.getJSONArray("usernameArray");

            usernameList = new ArrayList<String>();
            for (int i = 0; i < usernameJsonArr.length(); i++) {
                usernameList.add(usernameJsonArr.getString(i));
            }

            appKey = params.has("appKey") ? params.getString("appKey") : "";
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        JMessageClient.delUsersFromBlacklist(usernameList, appKey, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                handleResult(status, desc, callback);
            }
        });
    }

    void getBlacklist(JSONArray data, final CallbackContext callback) {
        JMessageClient.getBlacklist(new GetBlacklistCallback() {
            @Override
            public void gotResult(int status, String desc, List list) {
                if (status == 0) {
                    handleResult(toJson(list), status, desc, callback);
                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void setNoDisturb(JSONArray data, final CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);
            String type = params.getString("type");
            final int isNoDisturb = params.getBoolean("isNoDisturb") ? ERR_CODE_PARAMETER : 0;

            if (type.equals("single")) {
                String username = params.getString("username");
                String appKey = params.has("appKey") ? params.getString("appKey") : "";

                JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {

                    @Override
                    public void gotResult(int status, String desc, UserInfo userInfo) {
                        if (status == 0) {
                            userInfo.setNoDisturb(isNoDisturb, new BasicCallback() {

                                @Override
                                public void gotResult(int status, String desc) {
                                    handleResult(status, desc, callback);
                                }
                            });

                        } else {
                            handleResult(status, desc, callback);
                        }
                    }
                });

            } else if (type.equals("group")) {
                final long groupId = Long.parseLong(params.getString("groupId"));

                JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {

                    @Override
                    public void gotResult(int status, String desc, GroupInfo groupInfo) {
                        if (status == 0) {
                            groupInfo.setNoDisturb(isNoDisturb, new BasicCallback() {
                                @Override
                                public void gotResult(int status, String desc) {
                                    handleResult(status, desc, callback);
                                }
                            });

                        } else {
                            handleResult(status, desc, callback);
                        }
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        }
    }

    void getNoDisturbList(JSONArray data, final CallbackContext callback) {
        JMessageClient.getNoDisturblist(new GetNoDisurbListCallback() {

            @Override
            public void gotResult(int status, String desc, List userInfoList, List groupInfoList) {
                if (status == 0) {
                    JSONObject result = new JSONObject();
                    try {
                        result.put("userInfoArray", toJson(userInfoList));
                        result.put("groupInfoArray", toJson(groupInfoList));
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    handleResult(result, status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void setNoDisturbGlobal(JSONArray data, final CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);
            int isNoDisturbGlobal = params.getBoolean("isNoDisturb") ? ERR_CODE_PARAMETER : 0;
            JMessageClient.setNoDisturbGlobal(isNoDisturbGlobal, new BasicCallback() {

                @Override
                public void gotResult(int status, String desc) {
                    handleResult(status, desc, callback);
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        }
    }

    void isNoDisturbGlobal(JSONArray data, final CallbackContext callback) {
        JMessageClient.getNoDisturbGlobal(new IntegerCallback() {

            @Override
            public void gotResult(int status, String desc, Integer integer) {
                if (status == 0) {
                    JSONObject result = new JSONObject();
                    try {
                        result.put("isNoDisturb", integer == 1);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    handleResult(result, status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void downloadOriginalUserAvatar(JSONArray data, final CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);

            final String username = params.getString("username");
            final String appKey = params.has("appKey") ? params.getString("appKey") : "";

            JMessageUtils.getUserInfo(params, new GetUserInfoCallback() {

                @Override
                public void gotResult(int status, String desc, final UserInfo userInfo) {
                    if (status == 0) {
                        userInfo.getBigAvatarBitmap(new GetAvatarBitmapCallback() {

                            @Override
                            public void gotResult(int status, String desc, Bitmap bitmap) {
                                if (status == 0) {
                                    final String pkgName = mCordovaActivity.getPackageName();
                                    final String fileName = username + appKey;
                                    String avatarFilePath = JMessageUtils.getAvatarPath(pkgName);

                                    File avatarBigFile = new File(avatarFilePath + fileName + ".png");
                                    String bigImagePath;
                                    
                                    if (avatarBigFile.exists()) {
                                        bigImagePath = avatarBigFile.getAbsolutePath();
                                    } else {
                                        bigImagePath = JMessageUtils.storeImage(bitmap, fileName, pkgName);
                                    }
                                    
                                    try {
                                        JSONObject result = new JSONObject();
                                        result.put("username", username);
                                        result.put("appKey", appKey);
                                        result.put("filePath", bigImagePath);
                                        callback.success(result);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                        callback.error(PluginResult.Status.JSON_EXCEPTION.toString());
                                    }

                                } else {
                                    handleResult(status, desc, callback);
                                }
                            }
                        });

                    } else {
                        handleResult(status, desc, callback);
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        } 
    }

    void downloadOriginalImage(JSONArray data, final CallbackContext callback) {
        Conversation conversation;
        final String messageId;

        try {
            JSONObject params = data.getJSONObject(0);
            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, "Can't get conversation", callback);
                return;
            }

            messageId = params.getString("messageId");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        Message msg = conversation.getMessage(Integer.parseInt(messageId));
        if (msg == null) {
            handleResult(ERR_CODE_MESSAGE, ERR_MSG_MESSAGE, callback);
            return;
        }

        if (msg.getContentType() != ContentType.image) {
            handleResult(ERR_CODE_MESSAGE, "Message type isn't image", callback);
            return;
        }

        ImageContent content = (ImageContent) msg.getContent();
        content.downloadOriginImage(msg, new DownloadCompletionCallback() {

            @Override
            public void onComplete(int status, String desc, File file) {
                if (status == 0) {
                    JSONObject result = new JSONObject();
                    try {
                        result.put("messageId", messageId);
                        result.put("filePath", file.getAbsolutePath());
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    handleResult(result, status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void downloadVoiceFile(JSONArray data, final CallbackContext callback) {
        Conversation conversation;
        final String messageId;

        try {
            JSONObject params = data.getJSONObject(0);
            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, "Can't get conversation", callback);
                return;
            }

            messageId = params.getString("messageId");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        Message msg = conversation.getMessage(Integer.parseInt(messageId));
        if (msg == null) {
            handleResult(ERR_CODE_MESSAGE, ERR_MSG_MESSAGE, callback);
            return;
        }

        if (msg.getContentType() != ContentType.voice) {
            handleResult(ERR_CODE_MESSAGE, "Message type isn't voice", callback);
            return;
        }

        VoiceContent content = (VoiceContent) msg.getContent();
        content.downloadVoiceFile(msg, new DownloadCompletionCallback() {

            @Override
            public void onComplete(int status, String desc, File file) {
                if (status == 0) {
                    JSONObject result = new JSONObject();
                    try {
                        result.put("messageId", messageId);
                        result.put("filePath", file.getAbsolutePath());
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    handleResult(result, status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void downloadFile(JSONArray data, final CallbackContext callback) {
        Conversation conversation;
        final String messageId;

        try {
            JSONObject params = data.getJSONObject(0);
            conversation = JMessageUtils.getConversation(params);
            if (conversation == null) {
                handleResult(ERR_CODE_CONVERSATION, "Can't get conversation", callback);
                return;
            }

            messageId = params.getString("messageId");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        Message msg = conversation.getMessage(Integer.parseInt(messageId));
        if (msg == null) {
            handleResult(ERR_CODE_MESSAGE, ERR_MSG_MESSAGE, callback);
            return;
        }

        if (msg.getContentType() != ContentType.file) {
            handleResult(ERR_CODE_MESSAGE, "Message type isn't file", callback);
            return;
        }

        FileContent content = (FileContent) msg.getContent();
        content.downloadFile(msg, new DownloadCompletionCallback() {

            @Override
            public void onComplete(int status, String desc, File file) {
                if (status == 0) {
                    JSONObject result = new JSONObject();
                    try {
                        result.put("messageId", messageId);
                        result.put("filePath", file.getAbsolutePath());
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    handleResult(result, status, desc, callback);

                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    void createConversation(JSONArray data, CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);

            String type = params.getString("type");
            Conversation conversation = null;

            if (type.equals("single")) {
                String username = params.getString("username");
                String appKey = params.has("appKey") ? params.getString("appKey") : "";
                conversation = Conversation.createSingleConversation(username, appKey);

            } else if (type.equals("group")) {
                String groupId = params.getString("groupId");
                conversation = Conversation.createGroupConversation(Long.parseLong(groupId));
            }

            if (conversation != null) {
                callback.success(toJson(conversation));
            } else {
                handleResult(ERR_CODE_CONVERSATION,
                        "Can't create the conversation, please check your parameters", callback);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        }
    }

    void deleteConversation(JSONArray data, CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);
            String type = params.getString("type");

            if (type.equals("single")) {
                String username = params.getString("username");
                String appKey = params.has("appKey") ? params.getString("appKey") : "";
                JMessageClient.deleteSingleConversation(username, appKey);

            } else if (type.equals("group")) {
                long groupId = Long.parseLong(params.getString("groupId"));
                JMessageClient.deleteGroupConversation(groupId);

            } else {
                handleResult(ERR_CODE_PARAMETER, "Conversation type error", callback);
                return;
            }

            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        }
    }

    void enterConversation(JSONArray data, CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);
            String type = params.getString("type");

            if (type.equals("single")) {
                String username = params.getString("username");
                String appKey = params.has("appKey") ? params.getString("appKey") : "";
                JMessageClient.enterSingleConversation(username, appKey);

            } else if (type.equals("group")) {
                long groupId = Long.parseLong(params.getString("groupId"));
                JMessageClient.enterGroupConversation(groupId);

            } else {
                handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
                return;
            }

            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        }
    }

    void exitConversation(JSONArray data, CallbackContext callback) {
        JMessageClient.exitConversation();
    }

    void getConversation(JSONArray data, CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);
            Conversation conversation = JMessageUtils.getConversation(params);
            if (conversation != null) {
                callback.success(toJson(conversation));
            } else {
                handleResult(ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION, callback);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        }
    }

    void getConversations(JSONArray data, CallbackContext callback) {
        List<Conversation> conversationList = JMessageClient.getConversationList();
        JSONArray jsonArr = new JSONArray();
        for (Conversation conversation : conversationList) {
            jsonArr.put(toJson(conversation));
        }
        callback.success(jsonArr);
    }

    void resetUnreadMessageCount(JSONArray data, CallbackContext callback) {
        try {
            JSONObject params = data.getJSONObject(0);
            Conversation conversation = JMessageUtils.getConversation(params);
            conversation.resetUnreadCount();
            callback.success();
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
        }
    }

    /**
     * 收到消息事件。
     *
     * @param event 消息事件。
     */
    public void onEvent(MessageEvent event) {
        eventSuccess(toJson("receiveMessage", toJson(event.getMessage())));
    }

    /**
     * 触发通知栏点击事件。
     *
     * @param event 通知栏点击事件。
     */
    public void onEvent(NotificationClickEvent event) {
        eventSuccess(toJson("clickMessageNotification", toJson(event.getMessage())));

        // 点击通知启动应用。
        Intent launch = mCordovaActivity.getApplicationContext().getPackageManager()
                .getLaunchIntentForPackage(mCordovaActivity.getApplicationContext().getPackageName());
        launch.addCategory(Intent.CATEGORY_LAUNCHER);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        mCordovaActivity.getApplicationContext().startActivity(launch);
    }

    /**
     * 同步离线消息。
     *
     * @param event 离线消息事件。
     */
    public void onEvent(OfflineMessageEvent event) throws JSONException {
        final JSONObject json = new JSONObject();
        json.put("conversation", toJson(event.getConversation()));

        final List<Message> offlineMsgList = event.getOfflineMessageList();
        int latestMediaMessageIndex = -1;

        for (int i = offlineMsgList.size() - 1; i >= 0; i--) {
            Message msg = offlineMsgList.get(i);
            if (msg.getContentType() == ContentType.image || msg.getContentType() == ContentType.voice) {
                latestMediaMessageIndex = i;
                break;
            }
        }

        final JSONArray msgJsonArr = new JSONArray();

        if (latestMediaMessageIndex == -1) { // 没有多媒体消息
            for (Message msg : offlineMsgList) {
                msgJsonArr.put(toJson(msg));
            }
            json.put("messageArray", msgJsonArr);
            eventSuccess(toJson("syncOfflineMessage", json));

        } else {
            final int fLatestMediaMessageIndex = latestMediaMessageIndex;

            for (int i = 0; i < offlineMsgList.size(); i++) {
                Message msg = offlineMsgList.get(i);

                final int fI = i;

                switch (msg.getContentType()) {
                    case image:
                        ((ImageContent) msg.getContent()).downloadThumbnailImage(msg, new DownloadCompletionCallback() {
                            @Override
                            public void onComplete(int status, String desc, File file) {
                                if (fI == fLatestMediaMessageIndex) {
                                    for (Message msg : offlineMsgList) {
                                        msgJsonArr.put(toJson(msg));
                                    }
                                    try {
                                        json.put("messageArray", msgJsonArr);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    }
                                    eventSuccess(toJson("syncOfflineMessage", json));
                                }
                            }
                        });
                        break;
                    case voice:
                        ((VoiceContent) msg.getContent()).downloadVoiceFile(msg, new DownloadCompletionCallback() {
                            @Override
                            public void onComplete(int status, String desc, File file) {
                                if (fI == fLatestMediaMessageIndex) {
                                    for (Message msg : offlineMsgList) {
                                        msgJsonArr.put(toJson(msg));
                                    }
                                    try {
                                        json.put("messageArray", msgJsonArr);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    }
                                    eventSuccess(toJson("syncOfflineMessage", json));
                                }
                            }
                        });
                    default:
                }
            }
        }
    }

    /**
     * 漫游消息同步事件。
     *
     * @param event 漫游消息同步事件。
     */
    public void onEvent(ConversationRefreshEvent event) throws JSONException {
        if (event.getReason() == ConversationRefreshEvent.Reason.MSG_ROAMING_COMPLETE) {
            JSONObject json = new JSONObject();
            json.put("conversation", toJson(event.getConversation()));
            eventSuccess(toJson("syncRoamingMessage", json));
        }
    }

    /**
     * 用户登录状态变更事件。
     *
     * @param event 用户登录状态变更事件。
     */
    public void onEvent(LoginStateChangeEvent event) throws JSONException {
        JSONObject json = new JSONObject();
        json.put("type", event.getReason());
        eventSuccess(toJson("loginStateChanged", json));
    }

    /**
     * 联系人相关通知事件。
     *
     * @param event 联系人相关通知事件。
     */
    public void onEvent(ContactNotifyEvent event) throws JSONException {
        JSONObject json = new JSONObject();
        json.put("type", event.getType());
        json.put("reason", event.getReason());
        json.put("fromUsername", event.getFromUsername());
        json.put("fromUserAppKey", event.getfromUserAppKey());
        eventSuccess(toJson("contactNotify", json));
    }

    /**
     * 消息接收方收到的消息撤回事件。
     *
     * @param event 消息撤回事件。
     */
    public void onEvent(MessageRetractEvent event) throws JSONException {
        JSONObject json = new JSONObject();
        json.put("conversation", toJson(event.getConversation()));
        json.put("retractedMessage", toJson(event.getRetractedMessage()));
        eventSuccess(toJson("retractMessage", json));
    }

    private void eventSuccess(JSONObject value) {
        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, value);
        pluginResult.setKeepCallback(true);
        mCallback.sendPluginResult(pluginResult);
    }
}