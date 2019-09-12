import { Component } from '@angular/core';
import { NavController, AlertController  } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { AlertService } from '../../providers/alert-service'
import { LoginPage } from '../login/login'
import { ConsoleLogService } from '../../static-class/object-util';

@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html'
})
export class LogoutPage {
  constructor(public alertService: AlertService, public navCtrl: NavController, private userServ: UserService, public alertCtrl: AlertController) {
  }
  ionViewDidLoad() {
    ConsoleLogService.log("LogoutPage",'Hello LogoutPage Page');
    this.doConfirm();

  }
  doConfirm() {
   let confirm = this.alertCtrl.create({
     title: 'Deseja sair?',
     message: 'Deseja realmente desconectar de sua conta? <br>Isso sera aplicado a todos dispositivos conectados.',
     enableBackdropDismiss: false,
     buttons: [
       {
         text: 'Cancelar',
         handler: () => {
           this.navCtrl.pop()
         }
       },
       {
         text: 'Sair',
         handler: () => {
           this.userServ.logout_DB((res)=>{},(err)=>{this.alertService.showServerError(()=>{});});
           this.navCtrl.push(LoginPage)
         }
       }
     ]
   });
   confirm.present()
 }
}
