import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { JMessagePlugin, JMConversationInfo, JMError } from '@jiguang-ionic/jmessage';
import { ChatPage } from '../../chat/chat'

@Component({
  templateUrl: 'conversationList.html'
})
export class ConversationListPage {

  conversationList: JMConversationInfo[];

  constructor(private jmessage: JMessagePlugin,public navCtrl: NavController) {

    this.jmessage.getConversations()
    .then( (conversationList: JMConversationInfo[]) => {
      this.conversationList = conversationList;
    })
    .catch( (error: JMError ) => {
      alert(JSON.stringify(error));
    });
  }

  enterChat(conversationInfo: JMConversationInfo) {
    this.navCtrl.push(ChatPage, conversationInfo);
  }
}
