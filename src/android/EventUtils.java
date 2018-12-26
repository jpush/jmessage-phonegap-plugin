package cn.jiguang.cordova.im;

import android.content.Context;

import com.google.gson.Gson;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.HashMap;
import java.util.List;

import cn.jpush.im.android.api.event.GroupApprovalEvent;


class EventUtils {

    private static final String TAG = EventUtils.class.getSimpleName();

    private static Gson gson = new Gson();

    private static final String GROUP_APPROVAL_EVENT_NAME = "/jpush_event/group_approval/";
    private static HashMap<String, GroupApprovalEvent> events = new HashMap<>();


    public static void saveGroupApprovalEvent(Context context, GroupApprovalEvent event) {
        events.put(event.getEventId() + "", event);
        String s = gson.toJson(event);
        Logger.i(TAG, "Save group approval event:" + s);
        FileOutputStream outputStream;
        try {
//            outputStream = context.openFileOutput(GROUP_APPROVAL_EVENT_NAME+event.getEventId(), Context.MODE_PRIVATE);
            File file = new File(context.getFilesDir() + GROUP_APPROVAL_EVENT_NAME, event.getEventId() + "");
            if (!file.exists()) {
                file.getParentFile().getParentFile().mkdir();
                file.getParentFile().mkdir();
                file.createNewFile();
            }
            outputStream = new FileOutputStream(file);
            outputStream.write(s.getBytes());
            outputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public static GroupApprovalEvent getGroupApprovalEvent(Context context, String eventId) {
        GroupApprovalEvent groupApprovalEvent = events.get(eventId);
        if (groupApprovalEvent != null) {
            return groupApprovalEvent;
        }


        FileInputStream inputStream;
        GroupApprovalEvent event = null;
        try {
//            inputStream = context.openFileInput(GROUP_APPROVAL_EVENT_NAME+eventId);
            File file = new File(context.getFilesDir() + GROUP_APPROVAL_EVENT_NAME, eventId);
            inputStream = new FileInputStream(file);
            byte[] bytes = new byte[inputStream.available()];
            StringBuffer sb = new StringBuffer();
            int len = -1;
            while ((len = inputStream.read(bytes)) != -1) {
                sb.append(new String(bytes, 0, len));
            }
            Logger.i(TAG, "Get group approval event:" + sb.toString());
            inputStream.close();
            event = gson.fromJson(sb.toString(), GroupApprovalEvent.class);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return event;
    }

    public static void removeGroupApprovalEvent(Context context, String eventId) {
        events.remove(eventId);
        File file = new File(context.getFilesDir() + GROUP_APPROVAL_EVENT_NAME, eventId);
        if (file.exists()) {
            Boolean isSucc = file.delete();
            Logger.i(TAG, "Delete group approval event " + eventId + ": " + isSucc);
        }
    }

    public static void removeGroupApprovalEvents(Context context, List<GroupApprovalEvent> groupApprovalEventList) {
        for (int i = 0; i < groupApprovalEventList.size(); i++) {
            GroupApprovalEvent groupApprovalEvent = groupApprovalEventList.get(i);
            removeGroupApprovalEvent(context, groupApprovalEvent.getEventId() + "");
        }
    }


}
