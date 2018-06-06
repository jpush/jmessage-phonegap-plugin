import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { JMessagePlugin, JMUserInfo, } from '@jiguang-ionic/jmessage';

import { ChatPage } from '../chat/chat';

@Component({
  templateUrl: 'userDetail.html'
})
export class UserDetailPage {

    user: JMUserInfo;
    constructor(public navParams: NavParams,
        private jmessage: JMessagePlugin,
        public navCtrl: NavController) {

        this.user = <JMUserInfo>this.navParams['data'];
    }

    createConversation() {
        this.jmessage.createConversation({
            type: 'single',
            username: this.user.username,
            appKey: 'a1703c14b186a68a66ef86c1'
        })
        .then( (conversation) => {
            this.navCtrl.push(ChatPage,conversation);
        })
        .catch(err => {
            alert(JSON.stringify(err));
          });
    }
}




