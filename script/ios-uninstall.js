//	            __    __                ________
//	| |    | |  \ \  / /  | |    | |   / _______|
//	| |____| |   \ \/ /   | |____| |  / /
//	| |____| |    \  /    | |____| |  | |   _____
//	| |    | |    /  \    | |    | |  | |  |____ |
//  | |    | |   / /\ \   | |    | |  \ \______| |
//  | |    | |  /_/  \_\  | |    | |   \_________|
//
//	Copyright (c) 2012年 HXHG. All rights reserved.
//	http://www.jpush.cn
//  Created by liangjianguo
//

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

        var appdelegateFileH = projectRoot + "/platforms/ios/jmessage/Classes/AppDelegate.h";
        var appdelegateFileM = projectRoot + "/platforms/ios/jmessage/Classes/AppDelegate.m";

        var appdelegateFileH_backup = projectRoot + "/platforms/ios/jmessage/Classes/AppDelegate_JM_backup_H";
        var appdelegateFileM_backup = projectRoot + "/platforms/ios/jmessage/Classes/AppDelegate_JM_backup_M";

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

        //removeCode(appdelegateFileH,appdelegateFileH,fs,AppDelegateHeaderRegExp);
        //removeCode(appdelegateFileM,appdelegateFileM,fs,AppDelegateSourceRegExp);
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

