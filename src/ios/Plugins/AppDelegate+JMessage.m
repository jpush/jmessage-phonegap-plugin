//
//  AppDelegate+JPush.m
//  delegateExtention
//
//  Created by 张庆贺 on 15/8/3.
//  Copyright (c) 2015年 JPush. All rights reserved.
//

#import <objc/runtime.h>
#import <AdSupport/AdSupport.h>
#import "JMessagePlugin.h"
#import "JMessageHelper.h"
#import "AppDelegate+JMessage.h"


@implementation AppDelegate (JMessage)

+(void)load{
    Method origin1;
    Method swizzle1;
    origin1  = class_getInstanceMethod([self class],@selector(init));
    swizzle1 = class_getInstanceMethod([self class], @selector(init_plus));
    method_exchangeImplementations(origin1, swizzle1);
}

-(instancetype)init_plus{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidLaunch:) name:UIApplicationDidFinishLaunchingNotification object:nil];
    return [self init_plus];
}

NSDictionary *_launchOptions;

-(void)applicationDidLaunch:(NSNotification *)notification{
    [self startJMessageSDK];
}

-(void)startJMessageSDK{
    JMessageHelper *helper = [JMessageHelper new];
    [helper initJMessage:_launchOptions];
}


@end
