package cn.jiguang.cordova.im;

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
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return result;
    }

    static JSONObject toJson(GroupInfo groupInfo) {
        JSONObject result = new JSONObject();

        try {
            result.put("type", "group");
            result.put("id", groupInfo.getGroupID());
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
            result.put("id", msg.getId());
            result.put("from", toJson(msg.getFromUser()));  // 消息发送者

            if (msg.getDirect() == MessageDirect.send) {    // 消息发送
                if (msg.getTargetType() == ConversationType.single) {   // 消息发送对象的类型
                    result.put("target", toJson((UserInfo) msg.getTargetInfo()));
                } else if (msg.getTargetType() == ConversationType.group) {
                    result.put("target", toJson((GroupInfo) msg.getTargetInfo()));
                }

            } else if (msg.getDirect() == MessageDirect.receive) {    // 消息接收
                if (msg.getTargetType() == ConversationType.single) {
                    result.put("target", toJson(JMessageClient.getMyInfo()));
                } else if (msg.getTargetType() == ConversationType.group) {
                    result.put("target", toJson((GroupInfo) msg.getTargetInfo()));
                }
            }

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
}