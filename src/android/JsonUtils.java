package cn.jiguang.cordova.im;

import android.text.TextUtils;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.content.CustomContent;
import cn.jpush.im.android.api.content.EventNotificationContent;
import cn.jpush.im.android.api.content.FileContent;
import cn.jpush.im.android.api.content.ImageContent;
import cn.jpush.im.android.api.content.LocationContent;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.content.VoiceContent;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.enums.MessageDirect;
import cn.jpush.im.android.api.model.ChatRoomInfo;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;

class JsonUtils {

    static Map<String, String> fromJson(JSONObject jsonObject) throws JSONException {
        Map<String, String> map = new HashMap<String, String>();

        Iterator<String> keysItr = jsonObject.keys();
        while (keysItr.hasNext()) {
            String key = keysItr.next();
            String value = jsonObject.getString(key);
            map.put(key, value);
        }
        return map;
    }

    static JSONObject toJson(Map<String, String> map) {
        Iterator<String> iterator = map.keySet().iterator();

        JSONObject jsonObject = new JSONObject();
        while (iterator.hasNext()) {
            String key = iterator.next();

            try {
                jsonObject.put(key, map.get(key));
            } catch (JSONException e) {
                Log.wtf("RequestManager", "Failed to put value for " + key + " into JSONObject.", e);
            }
        }
        return jsonObject;
    }

    static JSONObject toJson(final UserInfo userInfo) {
        if (userInfo == null) {
            return null;
        }

        final JSONObject result = new JSONObject();
        try {
            result.put("type", "user");
            result.put("gender", userInfo.getGender());
            result.put("username", userInfo.getUserName());
            result.put("appKey", userInfo.getAppKey());
            result.put("nickname", userInfo.getNickname());

            if (userInfo.getAvatarFile() != null) {
                result.put("avatarThumbPath", userInfo.getAvatarFile().getAbsolutePath());
            } else {
                result.put("avatarThumbPath", "");
            }

            result.put("birthday", userInfo.getBirthday());
            result.put("region", userInfo.getRegion());
            result.put("signature", userInfo.getSignature());
            result.put("address", userInfo.getAddress());
            result.put("noteName", userInfo.getNotename());
            result.put("noteText", userInfo.getNoteText());
            result.put("isNoDisturb", userInfo.getNoDisturb() == 1);
            result.put("isInBlackList", userInfo.getNoDisturb() == 1);
            result.put("isFriend", userInfo.isFriend());

            Map<String, String> extras = userInfo.getExtras();
            JSONObject extrasJson = toJson(extras);
            result.put("extras", extrasJson.toString());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return result;
    }

    static JSONObject toJson(GroupInfo groupInfo) {
        JSONObject result = new JSONObject();

        try {
            result.put("type", "group");
            result.put("id", String.valueOf(groupInfo.getGroupID()));
            result.put("name", groupInfo.getGroupName());
            result.put("desc", groupInfo.getGroupDescription());
            result.put("level", groupInfo.getGroupLevel());
            result.put("owner", groupInfo.getGroupOwner());
            result.put("ownerAppKey", groupInfo.getOwnerAppkey());
            result.put("maxMemberCount", groupInfo.getMaxMemberCount());
            result.put("isNoDisturb", groupInfo.getNoDisturb() == 1);
            result.put("isBlocked", groupInfo.isGroupBlocked() == 1);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return result;
    }

    static JSONObject toJson(Message msg) {
        JSONObject result = new JSONObject();
        try {
            result.put("id", String.valueOf(msg.getId()));  // 本地数据库 id
            result.put("serverMessageId", String.valueOf(msg.getServerMessageId()));    // 服务器端 id
            result.put("from", toJson(msg.getFromUser()));  // 消息发送者
            result.put("isSend", msg.getDirect() == MessageDirect.send);    // 消息是否是由当前用户发出

            JSONObject targetJson = null;
            switch (msg.getTargetType()) {
                case single:
                    if (msg.getDirect() == MessageDirect.send) {    // 消息发送
                        targetJson = toJson((UserInfo) msg.getTargetInfo());
                    } else {    // 消息接收
                        targetJson = toJson(JMessageClient.getMyInfo());
                    }
                    break;
                case group:
                    targetJson = toJson((GroupInfo) msg.getTargetInfo());
                    break;
                case chatroom:
                    targetJson = toJson((ChatRoomInfo) msg.getTargetInfo());
                    break;
            }
            result.put("target", targetJson);

            MessageContent content = msg.getContent();
            if (content.getStringExtras() != null) {
                result.put("extras", toJson(content.getStringExtras()));
            } else {
                result.put("extras", new JSONObject());
            }

            result.put("createTime", msg.getCreateTime());

            switch (msg.getContentType()) {
                case text:
                    result.put("type", "text");
                    result.put("text", ((TextContent) content).getText());
                    break;
                case image:
                    result.put("type", "image");
                    result.put("thumbPath", ((ImageContent) content).getLocalThumbnailPath());
                    break;
                case voice:
                    result.put("type", "voice");
                    result.put("path", ((VoiceContent) content).getLocalPath());
                    result.put("duration", ((VoiceContent) content).getDuration());
                    break;
                case file:
                    result.put("type", "file");
                    result.put("fileName", ((FileContent) content).getFileName());
                    break;
                case custom:
                    result.put("type", "custom");
                    Map<String, String> customObject = ((CustomContent) content).getAllStringValues();
                    result.put("customObject", toJson(customObject));
                    break;
                case location:
                    result.put("type", "location");
                    result.put("latitude", ((LocationContent) content).getLatitude());
                    result.put("longitude", ((LocationContent) content).getLongitude());
                    result.put("address", ((LocationContent) content).getAddress());
                    result.put("scale", ((LocationContent) content).getScale());
                    break;
                case eventNotification:
                    result.put("type", "event");
                    List usernameList = ((EventNotificationContent) content).getUserNames();
                    result.put("usernames", toJson(usernameList));
                    switch (((EventNotificationContent) content).getEventNotificationType()) {
                        case group_member_added:
                            //群成员加群事件
                            result.put("eventType", "group_member_added");
                            break;
                        case group_member_removed:
                            //群成员被踢事件
                            result.put("eventType", "group_member_removed");
                            break;
                        case group_member_exit:
                            //群成员退群事件
                            result.put("eventType", "group_member_exit");
                            break;
                    }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return result;
    }

    static Message JsonToMessage(JSONObject json) {
        Conversation conversation = null;
        int msgId = 0;

        try {
            msgId = Integer.parseInt(json.getString("id"));
            boolean isSend = json.getBoolean("isSend");

            JSONObject target = json.getJSONObject("target");

            if (target.getString("type").equals("user")) {
                String username;
                String appKey;

                if (isSend) {   // 消息由当前用户发送，则聊天对象为消息接收方。
                    username = target.getString("username");
                    appKey = target.has("appKey") ? target.getString("appKey") : null;

                } else {    // 当前用户为消息接收方，则聊天对象为消息发送方。
                    JSONObject opposite = json.getJSONObject("from");
                    username = opposite.getString("username");
                    appKey = opposite.has("appKey") ? opposite.getString("appKey") : null;
                }

                conversation = JMessageClient.getSingleConversation(username, appKey);

            } else if (target.getString("type").equals("group")) {
                long groupId = Long.parseLong(target.getString("id"));
                conversation = JMessageClient.getGroupConversation(groupId);

            } else if (target.getString("type").equals("chatroom")) {
                long roomId = Long.parseLong(target.getString("roomId"));
                conversation = JMessageClient.getChatRoomConversation(roomId);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return conversation != null ? conversation.getMessage(msgId) : null;
    }

    static JSONObject toJson(Conversation conversation) {
        JSONObject json = new JSONObject();

        try {
            json.put("title", conversation.getTitle());
            json.put("conversationType", conversation.getType());
            json.put("unreadCount", conversation.getUnReadMsgCnt());

            if (conversation.getLatestMessage() != null) {
                json.put("latestMessage", toJson(conversation.getLatestMessage()));
            }

            if (conversation.getType() == ConversationType.single) {
                UserInfo targetInfo = (UserInfo) conversation.getTargetInfo();
                json.put("target", toJson(targetInfo));

            } else if (conversation.getType() == ConversationType.group) {
                GroupInfo targetInfo = (GroupInfo) conversation.getTargetInfo();
                json.put("target", toJson(targetInfo));
            }

            String extraStr = conversation.getExtra();
            JSONObject extra = TextUtils.isEmpty(extraStr) ? new JSONObject() : new JSONObject(extraStr);
            json.put("extra", extra);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return json;
    }

    static JSONArray toJson(List list) {
        JSONArray jsonArray = new JSONArray();

        for (Object object : list) {
            if (object instanceof UserInfo) {
                jsonArray.put(toJson((UserInfo) object));
            } else if (object instanceof GroupInfo) {
                jsonArray.put(toJson((GroupInfo) object));
            } else if (object instanceof Message) {
                jsonArray.put(toJson((Message) object));
            } else {
                jsonArray.put(object);
            }
        }

        return jsonArray;
    }

    static JSONObject toJson(String eventName, JSONObject value) {
        JSONObject result = new JSONObject();
        try {
            result.put("eventName", eventName);
            result.put("value", value);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return result;
    }

    static JSONObject toJson(String eventName, JSONArray value) {
        JSONObject result = new JSONObject();
        try {
            result.put("eventName", eventName);
            result.put("value", value);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return result;
    }

    static JSONObject toJson(ChatRoomInfo chatRoomInfo) throws JSONException {
        JSONObject json = new JSONObject();
        json.put("type", "chatRoom");
        json.put("roomId", String.valueOf(chatRoomInfo.getRoomID()));   // 配合 iOS，将 long 转成 String。
        json.put("name", chatRoomInfo.getName());
        json.put("appKey", chatRoomInfo.getAppkey());
        json.put("description", chatRoomInfo.getDescription());
        json.put("createTime", chatRoomInfo.getCreateTime());   // 创建日期，单位秒。
        json.put("maxMemberCount", chatRoomInfo.getMaxMemberCount());   // 最大成员数。
        json.put("memberCount", chatRoomInfo.getTotalMemberCount()); // 当前成员数。
        return json;
    }
}
