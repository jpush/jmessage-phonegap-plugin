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

    if (context.opts.cordova.platforms.indexOf("ios") === -1) {
        console.info("#hook ios platform has not been added.");
        return;
    }

    if (['before_plugin_uninstall'].indexOf(context.hook) === -1) {
        try {
            fs.unlinkSync(targetFile);
        } catch (err) {
        }
    } else {

        consoleLogInfo("ios running uninstall script ...");

		var iosProjectName = findIosProjectName(fs,projectRoot + "/platforms/ios/");
		
		consoleLogInfo("ios project name is" + iosProjectName);
		
		if(iosProjectName == null){
			consoleLogError("can not find ios project");
			return;
		}		
		var iosProjectPath = projectRoot + "/platforms/ios/" + iosProjectName;

        var appdelegateFileH = iosProjectPath + "/Classes/AppDelegate.h";
        var appdelegateFileM =  iosProjectPath + "/Classes/AppDelegate.m";
        

        var appdelegateFileH_backup = iosProjectPath + "/Classes/AppDelegate_JM_backup_H";
        var appdelegateFileM_backup = iosProjectPath + "/Classes/AppDelegate_JM_backup_M";

        console.log(appdelegateFileM_backup);


        fs.readFile(appdelegateFileH_backup, {encoding: 'utf-8', flag: 'r'}, function (err, data) {
            if (err) {
                consoleLogError("ios: can not open backup file:" + appdelegateFileH_backup);
                return;
            }

            fs.writeFileSync(appdelegateFileH, data);
            consoleLogInfo("restore  ' Appdelegate.h' from backup file:" + appdelegateFileH_backup);
        });
        fs.readFile(appdelegateFileM_backup, {encoding: 'utf-8', flag: 'r'}, function (err, data) {
            if (err) {
                consoleLogError("ios: can not open backup file:" + appdelegateFileM_backup);
                return;
            }
            fs.writeFileSync(appdelegateFileM, data);
            consoleLogInfo("restore 'Appdelegate.m' from backup file:" + appdelegateFileM_backup);
        });

    }
};

function test() {
    var fs = require('fs');
    var appdelegateFileH = "./AppDelegate.h";
    var appdelegateFileM = "./AppDelegate.m";

    var appdelegateFileH_backup = "./AppDelegate_JM_backup_H";
    var appdelegateFileM_backup = "./AppDelegate_JM_backup_M";

    console.log("recover appdelegate from backup");

    fs.readFile(appdelegateFileH_backup, {encoding: 'utf-8', flag: 'r'}, function (err, data) {
        fs.writeFileSync(appdelegateFileH, data);


    });
    fs.readFile(appdelegateFileM, {encoding: 'utf-8', flag: 'r'}, function (err, data) {
        fs.writeFileSync(appdelegateFileM, data);
    });

    //removeCode(appdelegateFileH,'./hello.h',fs,AppDelegateHeaderRegExp);
    //removeCode(appdelegateFileM,'./hello.m',fs,AppDelegateSourceRegExp);
}
// test();

