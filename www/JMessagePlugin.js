
               
var JMessagePlugin = function(){
                                                                                                                   
    console.log("--- JMessagePlugin init");
    this.username="";    
    this.nickname="";
    this.gender = 0;  
    this.avatarUrl = "";
  
}

JMessagePlugin.prototype.singleReceiveMessage={}


               
JMessagePlugin.prototype.register = function(username,password,success, fail){

	 cordova.exec(success, fail, "JMessagePlugin", "userRegister", [username,password]);
}
               
               
JMessagePlugin.prototype.login = function(username,password,success, fail){

	 cordova.exec(success, fail, "JMessagePlugin", "userLogin", [username,password]);
}

               
JMessagePlugin.prototype.logout = function(success, fail){

	cordova.exec(success, fail, "JMessagePlugin", "userLogout",[]);
}
               
JMessagePlugin.prototype.getUserInfo = function(success, fail){

	cordova.exec(success, fail, "JMessagePlugin", "getUserInfo",[]);
}


//message
JMessagePlugin.prototype.sendSingleTextMessage = function(username, text, success, fail){

	cordova.exec(success, fail, "JMessagePlugin", "sendSingleTextMessage",[username,text]);
}

               
JMessagePlugin.prototype.getSingleHistoryMessage = function(username, from, limit, success, fail){

	cordova.exec(success, fail, "JMessagePlugin", "getSingleConversationHistoryMessage",[username,from,limit]);
}

//  conversation
JMessagePlugin.prototype.getSingleConversationList = function(success, fail){

	console.log("---- getSingleConversationList");

	cordova.exec(success, fail, "JMessagePlugin", "getAllSingleConversation",[]);
}

JMessagePlugin.prototype.deleteSingleConversation = function(username, success, fail){

	cordova.exec(success, fail, "JMessagePlugin", "deleteSingleConversation",[username]);
}

function commonMessageReceive(response){
		     console.log("### rev");
             var ss = JSON.stringify(response);
		     console.log("### rev" + ss);
			 this.singleReceiveMessage=response;
			 cordova.fireDocumentEvent('jmessage.singleReceiveMessage',null);
}

//receive message callback
JMessagePlugin.prototype.onSingleConversationMessageReceived = function(data){
               try{               
                    var bToObj  = JSON.parse(data);
                    console.log("### rev");
                    console.log(bToObj);
                    //this.singleReceiveMessage=bToObj
                    cordova.fireDocumentEvent('jmessage.singleReceiveMessage',bToObj);
               }
               catch(exception){
                    console.log("onSingleConversationMessageReceived "+exception);
               }	
}

JMessagePlugin.prototype.onSingleConversationChanged = function(data){
               try{               
                    var bToObj  = JSON.parse(data);
                    console.log("### change");
                    console.log(bToObj);
                   // this.singleReceiveMessage=bToObj
                   cordova.fireDocumentEvent('jmessage.conversationChange',bToObj);
               }
               catch(exception){
                    console.log("onSingleConversationChanged "+exception);
               }	
}

JMessagePlugin.prototype.onSendSingleTextMessage = function(data){
	try{
        var bToObj  = JSON.parse(data);
        console.log("--- send msg respone");
        console.log(bToObj);
	}
	catch(exception){
        console.log("sendSingleTextMessageRespone "+exception);
	}
}

JMessagePlugin.prototype.onDeviceReady = function(){
    console.log("--- onDeviceReady");
	//if(device.platform == "Android"){
		function AndroidReceiveMessageCallback(message){
			console.log("--- AndroidReceiveMessageCallback");
			commonMessageReceive(message);
		}
		function fail(){
		}
		
		cordova.exec(AndroidReceiveMessageCallback, fail, "JMessagePlugin", "JMessageAndroidCallbackInit",[]);

 
// 		cordova.exec(AndroidConversationChangeCallback, null, "JMessagePlugin", "JMessageAndroidCallbackInit",[]);
// 		
// 		function AndroidConversationChangeCallback(respone){
// 			console.log("--- AndroidConversationChangeCallback");
// 		}
// 		 		
// 		cordova.exec(AndroidSendTextRespone, null, "JMessagePlugin", "JMessageAndroidCallbackInit",[]);
// 		
// 	    function AndroidSendTextRespone(message){
// 			console.log("--- AndroidSendTextRespone");
// 		} 		
	//}
	
}





if(!window.plugins){
    console.log('int window plugins');
    window.plugins = {};
}

if(!window.plugins.jmessagePlugin){
    window.plugins.jmessagePlugin = new JMessagePlugin();//JMessagePlugin是一个函数
}  
module.exports = new JMessagePlugin();


