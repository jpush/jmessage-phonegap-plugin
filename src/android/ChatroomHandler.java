package cn.jiguang.cordova.im;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import cn.jpush.im.android.api.ChatRoomManager;
import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.RequestCallback;
import cn.jpush.im.android.api.model.ChatRoomInfo;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.api.BasicCallback;

import static cn.jiguang.cordova.im.JMessagePlugin.ERR_CODE_PARAMETER;
import static cn.jiguang.cordova.im.JMessagePlugin.ERR_MSG_PARAMETER;
import static cn.jiguang.cordova.im.JMessageUtils.handleResult;
import static cn.jiguang.cordova.im.JsonUtils.toJson;

/**
 * 处理聊天室相关 API。
 */

class ChatRoomHandler {

    static void getChatRoomInfoListOfApp(JSONArray data, final CallbackContext callback) {
        int start, count;
        try {
            JSONObject params = data.getJSONObject(0);
            start = params.getInt("start");
            count = params.getInt("count");
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        ChatRoomManager.getChatRoomListByApp(start, count, new RequestCallback<List<ChatRoomInfo>>() {
            @Override
            public void gotResult(int status, String desc, List<ChatRoomInfo> chatRoomInfos) {
                if (status != 0) {
                    handleResult(status, desc, callback);
                    return;
                }

                JSONArray jsonArr = new JSONArray();
                try {
                    for (ChatRoomInfo chatroomInfo : chatRoomInfos) {
                        jsonArr.put(toJson(chatroomInfo));
                    }
                } catch (JSONException e) { // 因为转 json 的操作一定没有问题，所以这里不做多余处理。
                    e.printStackTrace();
                }
                callback.success(jsonArr);
            }
        });
    }

    static void getChatRoomInfoListOfUser(JSONArray data, final CallbackContext callback) {
        ChatRoomManager.getChatRoomListByUser(new RequestCallback<List<ChatRoomInfo>>() {
            @Override
            public void gotResult(int status, String desc, List<ChatRoomInfo> chatRoomInfoList) {
                if (status != 0) {
                    handleResult(status, desc, callback);
                    return;
                }

                JSONArray jsonArr = new JSONArray();
                try {
                    for (ChatRoomInfo chatroomInfo : chatRoomInfoList) {
                        jsonArr.put(toJson(chatroomInfo));
                    }
                } catch (JSONException e) { // 因为转 json 的操作一定没有问题，所以这里不做多余处理。
                    e.printStackTrace();
                }
                callback.success(jsonArr);
            }
        });
    }

    static void getChatRoomInfoListById(JSONArray data, final CallbackContext callback) {
        Set<Long> roomIds = new HashSet<Long>(); // JS 层为了和 iOS 统一，因此 roomId 类型为 String，在原生做转换。

        try {
            JSONObject params = data.getJSONObject(0);
            JSONArray roomIdArr = params.getJSONArray("roomIds");

            for (int i = 0; i < roomIdArr.length(); i++) {
                roomIds.add(Long.valueOf(roomIdArr.getString(i)));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        ChatRoomManager.getChatRoomInfos(roomIds, new RequestCallback<List<ChatRoomInfo>>() {
            @Override
            public void gotResult(int status, String desc, List<ChatRoomInfo> chatRoomInfos) {
                if (status != 0) {
                    handleResult(status, desc, callback);
                    return;
                }

                JSONArray jsonArr = new JSONArray();
                try {
                    for (ChatRoomInfo chatroomInfo : chatRoomInfos) {
                        jsonArr.put(toJson(chatroomInfo));
                    }
                } catch (JSONException e) { // 因为转 json 的操作一定没有问题，所以这里不做多余处理。
                    e.printStackTrace();
                }
                callback.success(jsonArr);
            }
        });
    }

    static void getChatRoomOwner(JSONArray data, final CallbackContext callback) {
        final long roomId;

        try {
            JSONObject params = data.getJSONObject(0);
            roomId = Long.parseLong(params.getString("roomId"));
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        Set<Long> roomIds = new HashSet<Long>();
        roomIds.add(roomId);

        ChatRoomManager.getChatRoomInfos(roomIds, new RequestCallback<List<ChatRoomInfo>>() {
            @Override
            public void gotResult(int status, String desc, List<ChatRoomInfo> chatRoomInfoList) {
                if (status != 0) {
                    handleResult(status, desc, callback);
                    return;
                }

                try {
                    JSONObject chatroomInfoJson = toJson(chatRoomInfoList.get(0));
                    callback.success(chatroomInfoJson);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    static void enterChatRoom(JSONArray data, final CallbackContext callback) {
        final long roomId;

        try {
            JSONObject params = data.getJSONObject(0);
            roomId = Long.parseLong(params.getString("roomId"));
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        ChatRoomManager.enterChatRoom(roomId, new RequestCallback<Conversation>() {
            @Override
            public void gotResult(int status, String desc, Conversation conversation) {
                if (status != 0) {
                    handleResult(status, desc, callback);
                    return;
                }

                JSONObject result = new JSONObject();
                try {
                    result.put("roomId", roomId);
                    result.put("conversation", toJson(conversation));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                callback.success(result);
            }
        });
    }

    static void exitChatRoom(JSONArray data, final CallbackContext callback) {
        final long roomId;

        try {
            JSONObject params = data.getJSONObject(0);
            roomId = Long.parseLong(params.getString("roomId"));
        } catch (JSONException e) {
            e.printStackTrace();
            handleResult(ERR_CODE_PARAMETER, ERR_MSG_PARAMETER, callback);
            return;
        }

        ChatRoomManager.leaveChatRoom(roomId, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                if (status == 0) { // success
                    callback.success();
                } else {
                    handleResult(status, desc, callback);
                }
            }
        });
    }

    static void getChatRoomConversationList(JSONArray data, final CallbackContext callback) {
        List<Conversation> conversations = JMessageClient.getChatRoomConversationList();
        JSONArray result = new JSONArray();

        for (Conversation con : conversations) {
            result.put(toJson(con));
        }
        callback.success(result);
    }

}
