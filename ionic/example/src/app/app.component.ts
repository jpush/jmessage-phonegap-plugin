import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { JMessagePlugin, JMUserInfo, JMError } from '@jiguang-ionic/jmessage';
import { JsonPipe } from '@angular/common';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { TabbarPage } from '../pages/tabbar/tabbar';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  rootPage:any = LoginPage;

    constructor(private jmessage: JMessagePlugin,platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
      
      this.jmessage.getMyInfo().then( (user:JMUserInfo) => {
        if (user.username != undefined && user.username != null) {
          this.rootPage = TabbarPage;
        } else {
          this.rootPage = LoginPage;
        }
      }).catch( err => {
        alert(JSON.stringify(err));
      });
      

      this.jmessage.init({ isOpenMessageRoaming: true });
      // const username = '0001';
      // const password = '1111';
      
      // this.jmessage.login({ username, password }).then(
      //   () => alert('login success')
      // ).catch( (error) => {
      //   alert('login error' + JSON.stringify(error));
      // });

      
      // this.jmessage.updateMyInfo({
      //   birthday: 2423423,
      //   gender: 'male',
      //   extras: {
      //     key1: 'value1',
      //     key2: 'value2'
      //   }
      // }).then( (result) => {
      //     alert('updateMyInfo success' + JSON.stringify(result));
      // });
    
      // this.jmessage.updateMyInfo({
      //   birthday: 2423423,
      //   gender: 'male',
      //   extras: {
      //     key1: 'value1',
      //     key2: 'value2'
      //   }
      // }).then( (result) => {
      //     alert('updateMyInfo success' + JSON.stringify(result));
      // });

      // this.jmessage.createGroup({}).then( (gid:string) => {
      //   this.jmessage.getGroupInfo({
      //     id: gid
      //   }).then( (groupInfo: JMGroupInfo) => {
      //     alert('createGroup: ' + JSON.stringify(groupInfo));
      //   });
        
      //   this.jmessage.createConversation({
      //     type: 'group',
      //     groupId: gid
      //   }).then( (group) => {
      //     alert('createConversation: ' + JSON.stringify(group))
      //   }) ;
      // })

      
      // this.jmessage.ChatRoom.enterChatRoom({roomId: '12503299'}, () => {
      //   alert('success');
      // }, (error: JMError) => {
      //   alert(error.code);
      // })

      // this.jmessage.addReceiveMessageListener( (message) => {
      //   alert('recive message: ' + JSON.stringify(message));
      // });

      // this.jmessage.addReceiveChatRoomMessageListener( (message) => {
      //   alert('recive chat room message: ' + JSON.stringify(message));
      // });



    });
  }
}

