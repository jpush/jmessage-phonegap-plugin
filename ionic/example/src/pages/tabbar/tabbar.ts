import { Component } from '@angular/core';

import { ConversationListPage } from './conversationList/conversationList';
import { MyAccountPage } from './myAccount/myAccount';
import { ContactPage } from './contact/contact';

@Component({
  templateUrl: 'tabbar.html'
})
export class TabbarPage {

  tab1 = ConversationListPage;
  tab2 = MyAccountPage;
  tab3 = ContactPage;

  constructor() {

  }
}
