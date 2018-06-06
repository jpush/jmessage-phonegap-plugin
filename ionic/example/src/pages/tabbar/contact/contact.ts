import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { JMessagePlugin, JMUserInfo } from '@jiguang-ionic/jmessage';

import { UserDetailPage } from '../../userDetail/userDetail';
@Component({
  templateUrl: 'contact.html'
})
export class ContactPage {

  friendList: JMUserInfo[];

  constructor(private jmessage: JMessagePlugin, public navCtrl: NavController) {
    this.jmessage.getFriends()
    .then( (friends) => {
      this.friendList = friends;
    })
    .catch(err => {
      alert(JSON.stringify(err));
    });
  }

  enterUser(friend: JMUserInfo) {
    this.navCtrl.push(UserDetailPage, friend);
  }
}
