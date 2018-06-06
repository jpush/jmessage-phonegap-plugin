import { Component } from '@angular/core';
import { NavController, Platform, LoadingController, Loading } from 'ionic-angular';
import { JMessagePlugin, JMUserInfo } from '@jiguang-ionic/jmessage';
import { App } from 'ionic-angular';

import { LoginPage } from '../../login/login';
import { JsonPipe } from '@angular/common';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, IWriteOptions } from '@ionic-native/file';

@Component({
  selector: 'account-page',
  templateUrl: 'myAccount.html'
})
export class MyAccountPage {
  myInfo: JMUserInfo;
  avatarData: string;

  loader: Loading;

  constructor(private jmessage: JMessagePlugin,
      public navCtrl: NavController,
      public app: App,
      public loadingCtrl: LoadingController,
      public platform: Platform,
      private camera: Camera,
      private file: File
    ) {

      this.myInfo = {
        type: 'user',
        username: '',
        appKey: '',
        gender: 'male',
        avatarThumbPath: '',
        isNoDisturb: false,
        isInBlackList: false,
        isFriend: false,
      };

    this.jmessage.getMyInfo()
    .then( (myInfo:JMUserInfo) => {
      if (myInfo.avatarThumbPath != "" && myInfo.avatarThumbPath != undefined ) {
        if (this.platform.is('ios')) {
          alert(`file://${myInfo.avatarThumbPath}`)
          this.getImageDataFromPath(`file://${myInfo.avatarThumbPath}`).then(res => {
            this.avatarData = res;
          });
          
        } else {
          this.getImageDataFromPath(`file://${myInfo.avatarThumbPath}`).then(res => {
            this.avatarData = res;
          });
        }
      } else {
        this.avatarData = '';
      }
      this.myInfo = myInfo;
    })
    .catch(err => {
      alert(JSON.stringify(err));
    });
  }

  uploadAvatar() {
    const options: CameraOptions = {
      quality: 40,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
     let date = new Date();
     let name = date.getTime();
      
    this.camera.getPicture(options)
      .then((imagePath) => {

        let dir = imagePath.split( '/' ).slice( 0, -1 ).join( '/' );
        let name = imagePath.split( '/' ).slice(-1)[0];


        let imgPath = imagePath.replace('file://','');
        alert(imgPath);
          this.showLoading();
          this.jmessage.updateMyAvatar( { imgPath } ).then(res => {
            this.getImageDataFromPath(imagePath).then(res => {
              this.avatarData = res;
            });
            this.loader.dismiss();
          }).catch(err => {
            this.loader.dismiss();
          });
      }, (err) => {
      })
      .catch(err => {
        alert('err: ' + JSON.stringify(err));
      });
  }


  private showLoading() {
    this.loader = this.loadingCtrl.create({
      content: 'Uploading Avatar'
    });
    
    this.loader.present();
  }
  
  private async getImageDataFromPath(path: string): Promise<string> {
    let dir = path.split( '/' ).slice( 0, -1 ).join( '/' );
    let name = path.split( '/' ).slice(-1)[0];
    const promise = new Promise<string>(resolve => {
      this.file.readAsDataURL(dir, name).then(res => {
        resolve(res);
      });
    });
    return promise;
  }
  
  logout() {
      this.jmessage.logout();
      this.app.getRootNav().setRoot(LoginPage);
  }
}
