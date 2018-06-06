import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, Content } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { JMessagePlugin } from '@jiguang-ionic/jmessage';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { TabbarPage } from '../pages/tabbar/tabbar';

import { ChatPage } from '../pages/chat/chat';
import { UserDetailPage } from '../pages/userDetail/userDetail'

import { ConversationListPage } from '../pages/tabbar/conversationList/conversationList';
import { MyAccountPage } from '../pages/tabbar/myAccount/myAccount';
import { ContactPage } from '../pages/tabbar/contact/contact';

import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { Media, MediaObject } from '@ionic-native/media';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    TabbarPage,
    ConversationListPage,
    MyAccountPage,
    ContactPage,
    ChatPage,
    UserDetailPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,{
      tabsHideOnSubPages:true
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    TabbarPage,
    ConversationListPage,
    MyAccountPage,
    ContactPage,
    ChatPage,
    UserDetailPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    JMessagePlugin,
    Camera,
    File,
    Media,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
