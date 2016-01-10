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
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.Map.Entry;

import com.ljg.push.R;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.event.MessageEvent;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.api.BasicCallback;

//import cn.jmessage.phonegap.android.api.BasicPushNotificationBuilder;
//import cn.jmessage.android.api.CustomPushNotificationBuilder;
//import cn.jmessage.android.api.JPushInterface;
//import cn.jmessage.android.data.JPushLocalNotification;
//import cn.jmessage.android.api.TagAliasCallback;
import android.util.Log;


public class JMessagePlugin extends CordovaPlugin {
	private final static List<String> methodList = 
			Arrays.asList(
					"userRegister",
					"userLogin",
					"userLogout",
					"getUserInfo",
					"sendSingleTextMessage",
					"getSingleConversationHistoryMessage",
					"getAllSingleConversation",
					"deleteSingleConversation",
					"JMessageAndroidCallbackInit"
					);
	
	private ExecutorService threadPool = Executors.newFixedThreadPool(1);
	private static JMessagePlugin instance;
    private static String TAG = "--- JMessagePlugin-";

	private  static  boolean shouldCacheMsg = false;

	public static String notificationAlert;
	public static Map<String, Object> notificationExtras=new HashMap<String, Object>();
	public static String openNotificationAlert;
	public static Map<String, Object> openNotificationExtras=new HashMap<String, Object>();


	private  CallbackContext mCallbackContext;

	public JMessagePlugin() {
		instance = this;
	}

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		Log.i(TAG, "init");

		JMessageClient.init(cordova.getActivity().getApplicationContext());
		JMessageClient.registerEventReceiver(this);

	}

	public void onEvent(MessageEvent event) {
		final Message msg = event.getMessage();

		//可以在这里创建Notification
		if (msg.getTargetType() == ConversationType.single) {
			JSONObject obj = this.getMessageJson(msg);

			PluginResult dataResult = new PluginResult(PluginResult.Status.OK,obj);
			dataResult.setKeepCallback(true);
			mCallbackContext.sendPluginResult(dataResult);
		}
	}

	public  JSONObject  getMessageJson(Message msg){

		String contentText = "";
		//MSGContentTypeUnknown",@"JMSGContentTypeText",@"JMSGContentTypeImage",@"JMSGContentTypeVoice",@"JMSGContentTypeCustom",@"JMSGContentTypeEventNotification"
		String pluginContentType = "MSGContentTypeUnknown";//上传给js 层的类型，请和ios 保持一致

		switch (msg.getContentType()) {
			case text:
				contentText = ((TextContent) msg.getContent()).getText();
				pluginContentType="JMSGContentTypeText";
				break;

			default:
				break;
		}
		Log.i(TAG, "msg " + contentText );


		JSONObject jsonItem = new JSONObject();
		try {
			//MessageContent content = msg.getContent();

			jsonItem.put("msgId", msg.getId());
			jsonItem.put("contentType", pluginContentType);
			jsonItem.put("text", contentText);


		} catch (JSONException e) {
			e.printStackTrace();
		}
		return jsonItem;
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
		Log.i(TAG, " onPause");
 	}

	public void onResume(boolean multitasking) {
		Log.i(TAG, " onResume");

	}
	public void onStop() {
		Log.i(TAG, " onStop");

	}
	public void onDestroy() {
		Log.i(TAG, " onDestroy");

		JMessageClient.unRegisterEventReceiver(this);
	}

		private void handelResult(String sucessString, int status,String desc, CallbackContext cb){
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

	private void handleListResult(String sucessString, JSONArray arr){

	}

	//jmessage method

	public  void userRegister(JSONArray data, CallbackContext callbackContext){
		Log.i(TAG, " JMessageRegister \n" + data);

		final  CallbackContext cb = callbackContext;
		try {
			String username = data.getString(0);
			String password = data.getString(1);

			JMessageClient.register(username, password, new BasicCallback() {

				@Override
				public void gotResult(final int status, final String desc) {

					handelResult("注册成功", status, desc, cb);
				}
			});

		}catch (JSONException e){
			e.printStackTrace();
			callbackContext.error("error reading id json");
		}

	}

	public  void userLogin(JSONArray data, CallbackContext callbackContext) {
		Log.i(TAG, "  userLogin \n" + data);

		final  CallbackContext cb = callbackContext;
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


		}catch (JSONException e){
			e.printStackTrace();
			callbackContext.error("error reading id json");
		}

	}

	public  void userLogout(JSONArray data, CallbackContext callbackContext) {
		Log.i(TAG, "JMessageLogout \n" + data);

 		JMessageClient.logout();
		callbackContext.success("退出成功");
	}

	public  void getUserInfo(JSONArray data, CallbackContext callbackContext) {
		Log.i(TAG, " getUserInfo \n" + data);

		UserInfo info = JMessageClient.getMyInfo();

		try{


			if(info != null && info.getUserName() != null){
				JSONObject jsonItem = new JSONObject();

				jsonItem.put("username",info.getUserName());
				jsonItem.put("nickname",info.getNickname());
				jsonItem.put("gender","unknow");

				callbackContext.success(jsonItem);
			}
			else{
				JSONObject jsonItem = new JSONObject();
				jsonItem.put("errorCode",863004);
				jsonItem.put("errorDscription","not found");
				callbackContext.error(jsonItem);
			}
		}
		catch (JSONException e){
			e.printStackTrace();
		}
	}

	public  void sendSingleTextMessage(JSONArray data, CallbackContext callbackContext) {
		Log.i(TAG, " sendSingleTextMessage \n" + data);

		final  CallbackContext cb = callbackContext;
		try {
			String username = data.getString(0);
			String text     = data.getString(1);

			Conversation conversation =  JMessageClient.getSingleConversation(username);
			if(conversation == null){
				conversation = Conversation.createSingleConversation(username);
			}
			if (conversation == null){
				callbackContext.error("无法创建对话");
				return;
			}
			TextContent content = new TextContent(text);
			final Message msg = conversation.createSendMessage(content);

			JMessageClient.sendMessage(msg);
			callbackContext.success("正在发送");

		}catch (JSONException e){
			e.printStackTrace();
			callbackContext.error("error reading id json");
		}

	}

	private  JSONObject getJSonFormMessage(Message msg){
		String contentText = "";
		String msgType = "";//上传给js 层的类型，请和ios 保持一致

		switch (msg.getContentType()) {
			case text:
				contentText = ((TextContent) msg.getContent()).getText();
				msgType="text";
				break;
			default:
				break;
		}
		Log.i(TAG, "msg " + contentText );


		JSONObject jsonItem = new JSONObject();
		try {
			MessageContent content = msg.getContent();
			UserInfo targetUser = (UserInfo) msg.getTargetInfo();
			UserInfo fromUser = (UserInfo) msg.getFromUser();


			jsonItem.put("target_type", "single");
			jsonItem.put("target_id", targetUser.getUserID());
			jsonItem.put("target_name", targetUser.getUserName());
			jsonItem.put("from_id", fromUser.getUserID());
			jsonItem.put("from_name", fromUser.getUserName());
			jsonItem.put("create_time", msg.getCreateTime());
			jsonItem.put("msg_type", msgType);
			//jsonItem.put("text", contentText);

			JSONObject contentBody = new JSONObject();
			contentBody.put("text",contentText);
			jsonItem.put("msg_body",contentBody);

		} catch (JSONException e) {
			e.printStackTrace();
		}
		return  jsonItem;

	}

	public  void getSingleConversationHistoryMessage(JSONArray data, CallbackContext callbackContext) {
		Log.i(TAG, " getSingleConversationHistoryMessage \n" + data);

		try {
			String username = data.getString(0);
			int from = data.getInt(1);
			int limit = data.getInt(2);

			if(limit <= 0 || from < 0){
				Log.w(TAG, "  JMessageGetSingleHistoryMessage from: " + from + "limit" + limit);
				return;
			}

			Conversation conversation =  JMessageClient.getSingleConversation(username);
			if(conversation == null){
				conversation = Conversation.createSingleConversation(username);
			}
			if (conversation == null){
				callbackContext.error("无法创建对话");
				return;
			}
			List<Message> list = conversation.getMessagesFromNewest(from,limit);
			Log.i(TAG, "JMessageGetSingleHistoryMessage list size is" + list.size() );

			JSONArray jsonRusult = new JSONArray() ;

			for(int i = 0; i < list.size(); ++i){
				Message msg = list.get(i);
				JSONObject obj=  this.getJSonFormMessage(msg);
				jsonRusult.put(obj);
			}

			callbackContext.success(jsonRusult);

		}catch (JSONException e){
			e.printStackTrace();
			callbackContext.error("error reading id json");
		}
	}


	public  void getAllSingleConversation(JSONArray data, CallbackContext callbackContext) {
		Log.i(TAG, "  getAllSingleConversation \n" + data);



			List<Conversation> list = JMessageClient.getConversationList();

			Log.i(TAG,"JMessageGetAllSingleConversation" + list.size());

			JSONArray jsonRusult = new JSONArray() ;

			for(int i = 0; i < list.size(); ++i){
				Conversation conv = list.get(i);

				if(conv.getType() == ConversationType.single){

					UserInfo info = (UserInfo) conv.getTargetInfo();
					Message msg =  conv.getLatestMessage();
					String 	contentText = "";
					if(msg != null){
						switch (msg.getContentType()) {
							case  text:
							{
								contentText = ((TextContent) msg.getContent()).getText();

							}break;
							default:
								break;
						}
					}


					JSONObject jsonItem = new JSONObject();
					try {
						jsonItem.put("username", info.getUserName());
						jsonItem.put("nickname", info.getNickname());
						//jsonItem.put("avatar", info.getAvatar());
						jsonItem.put("lastMessage",contentText );
						jsonItem.put("unreadCount", conv.getUnReadMsgCnt());

						jsonRusult.put(jsonItem);

					} catch (JSONException e) {
						e.printStackTrace();
					}
				}

			}

			callbackContext.success(jsonRusult);
	}

	public void JMessageAndroidCallbackInit(JSONArray data, CallbackContext callbackContext){
		Log.i(TAG,"JMessageAndroidCallbackInit" + callbackContext.getCallbackId());

		mCallbackContext=callbackContext;
		PluginResult dataResult = new PluginResult(PluginResult.Status.OK,"js call init ok");
		dataResult.setKeepCallback(true);//非常重要
		mCallbackContext.sendPluginResult(dataResult);
	}
}
