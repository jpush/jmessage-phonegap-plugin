import { Component } from '@angular/core';
import { NavController, LoadingController, Loading } from 'ionic-angular';
import { JMessagePlugin, JMError } from '@jiguang-ionic/jmessage';

import { TabbarPage } from '../tabbar/tabbar';
import { RegisterPage } from '../register/register';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  username = '';
  password = '';
  private loader: Loading;

  constructor(private jmessage: JMessagePlugin, 
    public navCtrl: NavController,
    public loadingCtrl: LoadingController) {
    
  }

  Login() {

    if (
      this.username == '' ||
      this.password == ''
    ) { return;  }

    let username = this.username;
    let password = this.password;
    
    this.loader = this.loadingCtrl.create({
      content: '正在登录'
    });
    
    this.loader.present();

    this.jmessage.login({
      username,
      password
    }).then( () => {
      this.navCtrl.push(TabbarPage);
      this.loader.dismiss();
    }).catch( (error: JMError) => {
      alert(`error: ${JSON.stringify(error)}`);
      this.loader.dismiss();
    })
  }

  Register() {
    this.navCtrl.push(RegisterPage);
  }
}
