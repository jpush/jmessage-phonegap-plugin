#!/usr/bin/env node


 /*
var AppDelegateSourceRegExp = new Array();
 
AppDelegateSourceRegExp[0]=/[[\s]*JPUSHService[\s]*registerDeviceToken[\s]*:[\s]*deviceToken[\s]*]/;
AppDelegateSourceRegExp[1]=/[[\s]*JPUSHService[\s]*handleRemoteNotification[\s]*:[\s]*userInfo[\s]*]/;
AppDelegateSourceRegExp[2]=/[[\s]*JPUSHService[\s]*handleRemoteNotification[\s]*:[\s]*userInfo[\s]*]/;
AppDelegateSourceRegExp[3]=/[[\s]*JPUSHService[\s]*showLocalNotificationAtFront[\s]*:[\s]*notification[\s]*identifierKey[\s]*:[\s]*nil[\s]*]/;
AppDelegateSourceRegExp[4]=/_jmessage[\s]*=[\s]*[[\s]*AppJMessage[\s]*new[\s]*]/;
AppDelegateSourceRegExp[5]= /\[[\s]*_jmessage[\s]*initJMessage[\s]*:[\s]*launchOptions[\s]*\]/;

var AppDelegateHeaderRegExp = new Array();
AppDelegateHeaderRegExp[0] =   /#import[\s]*"AppJMessage.h"/;
AppDelegateHeaderRegExp[1]=/@property[\s]*\([\s]*nonatomic,[\s]*strong[\s]*\)[\s]*AppJMessage[\s]*\*[\s]*jmessage/;
 


function removeCode(inputFile,outputFile,fs,regExpList){

	console.info("remove " + inputFile + "...");

   fs.readFile(inputFile, {encoding: 'utf-8',flag:'r+'}, function (err, data) {    
 
  	if(err){
 	 	console.info("#ios open file err:"+ err);
 	}

    for(var k = 0; k < regExpList.length; ++k){
    	var regexp = regExpList[k];
    	data = data.replace(regexp,'\n//');
     }
    fs.writeFileSync(outputFile, data);        
 })
}
*/

  
function consoleLogError(string){

	console.log('\x1b[31mError: %s\x1b[0m', string);
	
}  
function consoleLogInfo(string){

	console.log('\x1b[32mInfo: %s\x1b[0m', string);
	
}  
function consoleLogWarning(string){

	console.log('\x1b[33mWarning: %s\x1b[0m', string);
	
}  


 module.exports = function (context) {

    var path         = context.requireCordovaModule('path'),
        fs           = context.requireCordovaModule('fs'),
        shell        = context.requireCordovaModule('shelljs'),
        projectRoot  = context.opts.projectRoot;

    if (context.opts.cordova.platforms.indexOf("ios") === -1) {
        console.info("#hook ios platform has not been added.");
        return ;
    }

    if (['before_plugin_uninstall'].indexOf(context.hook) === -1) {
        try {
            fs.unlinkSync(targetFile);
        } catch (err) {}
    } else {
    
    
		consoleLogInfo("ios running uninstall script ...");

         var appdelegateFileH = projectRoot + "/platforms/ios/jmessage/Classes/AppDelegate.h";
         var appdelegateFileM= projectRoot + "/platforms/ios/jmessage/Classes/AppDelegate.m";
         
        var appdelegateFileH_backup = projectRoot + "/platforms/ios/jmessage/Classes/AppDelegate_JM_backup_H";
         var appdelegateFileM_backup = projectRoot + "/platforms/ios/jmessage/Classes/AppDelegate_JM_backup_M";
         
        fs.readFile(appdelegateFileH_backup, {encoding: 'utf-8',flag:'r'}, function (err, data) {    
        	if(err){
        		consoleLogError("ios: can not open backup file:" + appdelegateFileH_backup);
        		return;
        	}
        	
		    fs.writeFileSync(appdelegateFileH, data); 
		    consoleLogInfo("restore  ' Appdelegate.h' from backup file:" + appdelegateFileH_backup);
		});
		fs.readFile(appdelegateFileM_backup, {encoding: 'utf-8',flag:'r'}, function (err, data) {   
        	if(err){
        		consoleLogError("ios: can not open backup file:" + appdelegateFileM_backup);
        		return;
        	}
			fs.writeFileSync(appdelegateFileM, data); 
			consoleLogInfo("restore 'Appdelegate.m' from backup file:" + appdelegateFileM_backup);
		});

		//removeCode(appdelegateFileH,appdelegateFileH,fs,AppDelegateHeaderRegExp);
		//removeCode(appdelegateFileM,appdelegateFileM,fs,AppDelegateSourceRegExp);
    }
};

function test()
{
	var fs = require('fs');
	 var appdelegateFileH =    "./AppDelegate.h";
    var appdelegateFileM=   "./AppDelegate.m";
    
             
    var appdelegateFileH_backup =  "./AppDelegate_JM_backup_H";
    var appdelegateFileM_backup =  "./AppDelegate_JM_backup_M";
         
    console.log("recover appdelegate from backup");
         
        fs.readFile(appdelegateFileH_backup, {encoding: 'utf-8',flag:'r'}, function (err, data) {    
		    fs.writeFileSync(appdelegateFileH, data); 
		   
		          	
		});
		fs.readFile(appdelegateFileM, {encoding: 'utf-8',flag:'r'}, function (err, data) {   
			fs.writeFileSync(appdelegateFileM, data); 
		});
    
	//removeCode(appdelegateFileH,'./hello.h',fs,AppDelegateHeaderRegExp);
	//removeCode(appdelegateFileM,'./hello.m',fs,AppDelegateSourceRegExp);
}
// test();

