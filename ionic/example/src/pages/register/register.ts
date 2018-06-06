import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { JMessagePlugin, JMError } from '@jiguang-ionic/jmessage';
import { LoginPage } from '../login/login';
@Component({
  templateUrl: 'register.html'
})

export class RegisterPage {

  username = '';
  password = '';
  
  constructor(private jmessage: JMessagePlugin, public navCtrl: NavController) {

  }

  Register() {
    if (
        this.username == '' ||
        this.password == ''
      ) { return; }
  
    let username = this.username;
    let password = this.password;

    this.jmessage.register({
        username,
        password,
        nickname: username
    })
    .then( () => {
        this.navCtrl.push(LoginPage);
    })
    .catch( err => {
      alert(JSON.stringify(err));
    });
  }
}
