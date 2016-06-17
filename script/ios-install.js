#!/usr/bin/env node


function consoleLogError(string) {

    console.log('\x1b[31mError: %s\x1b[0m', string);

}
function consoleLogInfo(string) {

    console.log('\x1b[32mInfo: %s\x1b[0m', string);

}
function consoleLogWarning(string) {

    console.log('\x1b[33mWarning: %s\x1b[0m', string);

}


function insertCodeForAppdelagateDidFinishLaunchingWithOptions(str) {

    var regExpIsInsert = /_jmessage[\s]*=[\s]*[[\s]*JMessageHelper[\s]*new[\s]*]/;
    if (regExpIsInsert.test(str)) {
        return str;
    }

    var reg = /didFinishLaunchingWithOptions[\s]*:[\s]*\([\s]*NSDictionary[\s\S]+\)[\s]*launchOptions[\s]*{/;

    var insertCode = " didFinishLaunchingWithOptions:(NSDictionary*)launchOptions{ \n \
	//------------------------------JMessage start----------------------------------- \n\
    _jmessage = [JMessageHelper new]; \n\
    [_jmessage initJMessage:launchOptions]; \n\
    //------------------------------JMessage end-----------------------------------";

    var result = str.replace(reg, insertCode);

    return result;
}


var functionRegexp = new Array();
var functionCode = new Array();
var insertCodeRegrexList = new Array();
var insertCodeList = new Array();


functionRegexp[0] = /didRegisterForRemoteNotificationsWithDeviceToken[\s]*:[\s]*\([\s]*NSData[\s|\S]+\)[\s]*deviceToken[\s]*{[\s|\S]*}/;
functionCode[0] = "\n- (void)application:(UIApplication *)application \
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken { \n\
    [JPUSHService registerDeviceToken:deviceToken]; \n\
}";

insertCodeRegrexList[0] = /[[\s]*JPUSHService[\s]*registerDeviceToken[\s]*:[\s]*deviceToken[\s]*]/;
insertCodeList[0] = "didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken { \n\
    [JPUSHService registerDeviceToken:deviceToken]; \n";

//------------------

functionRegexp[1] = /didReceiveRemoteNotification[\s]*:[\s]*\([\s]*NSDictionary[\s|\S]+\)[\s]*userInfo[\s]*{[\s|\S]*}/

functionCode[1] = "\n- (void)application:(UIApplication *)application \
didReceiveRemoteNotification:(NSDictionary *)userInfo { \n\
    [JPUSHService handleRemoteNotification:userInfo]; \n\
}";

insertCodeRegrexList[1] = /[[\s]*JPUSHService[\s]*handleRemoteNotification[\s]*:[\s]*userInfo[\s]*]/;
insertCodeList[1] = "didReceiveRemoteNotification:(NSDictionary *)userInfo { \n\
    [JPUSHService handleRemoteNotification:userInfo]; \n";


//------------------


functionRegexp[2] = /fetchCompletionHandler[\s]*:[\s]*\([\s]*void[\s]*\([\s]*\^[\s]*\)[\s]*\([\s]*UIBackgroundFetchResult[\s]*\)[\s]*\)[\s]*completionHandler[\s]*{[\s|\S]*}/;


functionCode[2] = "\n- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler { \n\
    [_jmessage didReceiveRemoteNotification:userInfo]; \n\
}";
insertCodeRegrexList[2] = /[[\s]*_jmessage[\s]*didReceiveRemoteNotification[\s]*:[\s]*userInfo[\s]*]/;
insertCodeList[2] = "fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler { \n\
    [_jmessage didReceiveRemoteNotification:userInfo];";

//------------------


functionRegexp[3] = /didReceiveLocalNotification[\s]*:[\s]*\([\s]*UILocalNotification[\s\S]+\)[\s]*notification[\s]*{[\s|\S]*}/

functionCode[3] = "- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification { \n\
    [JPUSHService showLocalNotificationAtFront:notification identifierKey:nil]; \n\
}";

insertCodeRegrexList[3] = /[[\s]*JPUSHService[\s]*showLocalNotificationAtFront[\s]*:[\s]*notification[\s]*identifierKey[\s]*:[\s]*nil[\s]*]/;
insertCodeList[3] = "didReceiveLocalNotification:(UILocalNotification *)notification { \n\
    [JPUSHService showLocalNotificationAtFront:notification identifierKey:nil]; \n";


var keywordComment = new Array();
keywordComment[0] = /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm;


function insertFunction(str, code) {
    var regRexEnd = /@end/;

    var result = str.replace(regRexEnd, code + "\n@end");
    return result;
}

function deleteKeywordComment(str) {
    for (var i = 0; i < keywordComment.length; ++i) {
        var reg = keywordComment[i];
        if (reg.test(str)) {
            console.log("find comment code" + keywordComment);
        }
        else {
            console.log("not find comment code" + keywordComment);
        }
        str = str.replace(reg, '/*---JMessage Mark---*/');
    }
    return str;
}

function getSubRegrex(reg) {
    var subString = reg.source.substring(0, reg.source.length - 9);
    var subRegrex = new RegExp(subString);
    return subRegrex;
}

function insertFuntionWithList(i, str) {

    var reg = functionRegexp[i];

    if (reg.test(str)) {//if funtion is exits
        var functionResult = reg.exec(str);
        var functionString = functionResult[0];

        var insertCodeRegrex = insertCodeRegrexList[i];

        if (!insertCodeRegrex.test(functionString)) {// is code to insert in fuction is not exits

            var subRegrex = getSubRegrex(reg);

            var insertCode = insertCodeList[i];
            var fixFuncString = functionString.replace(subRegrex, insertCode);
            str = str.replace(reg, fixFuncString);
        }

        return str;
    }

    var code = functionCode[i];

    var result = insertFunction(str, code);

    return result;
}


function deletePushNotification(str) {

    var reg = /#ifndef[\s]*DISABLE_PUSH_NOTIFICATIONS([\s\S]*?)endif/;

    var ss = reg.exec(str);

    var code = "#ifndef  DISABLE_PUSH_NOTIFICATIONS \n #endif";

    var result = str.replace(reg, code);
    return result;

}

function insertCodeForAppdelegateHeader(str) {

    var regRexIsInsert = /[\s]*#import[\s]*"AppJMessage.h"/;
    if (regRexIsInsert.test(str)) {
        return str;
    }

    var regRexClassName = /[\s]*@interface[\s]*AppDelegate[\s]*:[\s]*CDVAppDelegate/;

    var insertHeaderCode = "\n\#import \"JMessageHelper.h\" //JMessage add \n@interface AppDelegate : CDVAppDelegate";

    var result = str.replace(regRexClassName, insertHeaderCode);


    var regRexEnd = /@end/;

    var insertProperty = "\n@property (nonatomic, strong)  JMessageHelper * jmessage; //JMessage add \n@end";

    var result2 = result.replace(regRexEnd, insertProperty);

    return result2;
}

function insertCodeForAppdelegateH(inputFile, outputFile, fs) {

    fs.readFile(inputFile, {encoding: 'utf-8', flag: 'r+'}, function (err, data) {
        if (err) {
            consoleLogError("ios: open" + inputFile + " err:" + err);
        }
        var rs = insertCodeForAppdelegateHeader(data);
        fs.writeFileSync(outputFile, rs);
        consoleLogInfo("ios: insert code in Appdeletegate.h sucess");

    })

}


function insertCodeForAppdelegateM(inputFile, outputFile, fs) {

    console.info("inertCodeFor Appdelegate.m");

    fs.readFile(inputFile, {encoding: 'utf-8', flag: 'r+'}, function (err, data) {

        if (err) {
            consoleLogError("ios: open" + inputFile + " err:" + err);
        }
        var result0 = deletePushNotification(data);

        //result0 = deleteKeywordComment(result0);

        var result1 = insertCodeForAppdelagateDidFinishLaunchingWithOptions(result0);

        for (var k = 0; k < 4; ++k) {
            var result = insertFuntionWithList(k, result1);
            result1 = result;
        }
        fs.writeFileSync(outputFile, result);
        consoleLogInfo("ios: insert code in Appdeletegate.m sucess");

    })
}

function findIosProjectName(fs, path){

    var files = fs.readdirSync(path);	
        
	var regRexIsInsert = /[\S]*.xcodeproj/;	
	
	for(var i in files){
		var item = files[i];
		var matchItem = item.match(regRexIsInsert);
		if(matchItem !== null){
			var projectName = matchItem[0];
			projectName = projectName.substring(0,projectName.length - 10);
			return projectName;
		}
	}

	
	return null;	
 }


module.exports = function (context) {

    var path = context.requireCordovaModule('path'),
        fs = context.requireCordovaModule('fs'),
        shell = context.requireCordovaModule('shelljs'),
        projectRoot = context.opts.projectRoot;                 

    // android platform available?
    if (context.opts.cordova.platforms.indexOf("ios") === -1) {
        consoleLogInfo("ios: platform has not been added.");
        return;
    }

    if (['after_plugin_install'].indexOf(context.hook) === -1) {
        try {
            fs.unlinkSync(targetFile);
        } catch (err) {
        }
    } else {
        consoleLogInfo("ios running install script...");

		var iosProjectName = findIosProjectName(fs,projectRoot + "/platforms/ios/");
		
		consoleLogInfo("ios project name is" + iosProjectName);
		
		if(iosProjectName == null){
			consoleLogError("can not find ios project, please setup AppDelegate.h AppDelegate.m by handle");
			return;
		}		
		
		var iosProjectPath = projectRoot + "/platforms/ios/" + iosProjectName;

        var appdelegateFileH = iosProjectPath + "/Classes/AppDelegate.h";
        var appdelegateFileM =  iosProjectPath + "/Classes/AppDelegate.m";
        
        console.log(appdelegateFileM);

        fs.readFile(appdelegateFileH, {encoding: 'utf-8', flag: 'r'}, function (err, data) {
            fs.writeFileSync(iosProjectPath + "/Classes/AppDelegate_JM_backup_H", data);
        });
        fs.readFile(appdelegateFileM, {encoding: 'utf-8', flag: 'r'}, function (err, data) {
            fs.writeFileSync(iosProjectPath + "/Classes/AppDelegate_JM_backup_M", data);
        });

        insertCodeForAppdelegateH(appdelegateFileH, appdelegateFileH, fs);
        insertCodeForAppdelegateM(appdelegateFileM, appdelegateFileM, fs);

        consoleLogInfo("ios running install script done");
    }
};

function test() {
    //node.js test
    var fs = require('fs');
    var appdelegateFileH = "./AppDelegate.h";
    var appdelegateFileM = "./AppDelegate.m";
    insertCodeForAppdelegateH(appdelegateFileH, './hello.h', fs);
    insertCodeForAppdelegateM(appdelegateFileM, './hello.m', fs);

}
//  test();

