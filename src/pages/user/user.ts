import { Component } from '@angular/core';
//import {Validators, FormBuilder } from '@angular/forms';//https://ionicframework.com/docs/v2/resources/forms/
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { LoginPage } from '../login/login'
import { AlertService } from '../../providers/alert-service'
import { ConsoleLogService } from '../../static-class/object-util';

@Component({
  selector: 'page-user',
  templateUrl: 'user.html'
})
export class UserPage {
  constructor(public alertService: AlertService, public navCtrl: NavController, public params:NavParams, public alertCtrl: AlertController, private userServ: UserService) {}
  ionViewDidLoad() {
    ConsoleLogService.log("UserPage",'Hello UserPage Page');
  }
  doPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'Troca de senha',
      message: "Digite a senha antiga e a nova senha desejada",
      inputs: [
        {
          name: 'old_pwd',
          placeholder: 'Senha Antiga',
          type: "password"
        },
        {
          name: 'new_pwd',
          placeholder: 'Nova Senha',
          type: "password"
        },
        {
          name: 'new_pwd_confirm',
          placeholder: 'Confirme Nova Senha',
          type: "password"
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            ConsoleLogService.log("UserPage",'Cancel clicked');
          }
        },
        {
          text: 'Salvar',
          handler: data => {
            if (data.new_pwd != data.new_pwd_confirm){
              this.alertService.showOk('Erro!', 'A nova senha e a confirmação são diferentes. <br>Por favor reinsira a nova senha!', 'Ok', ()=>{this.doPrompt();})
              // ------------- Error Alert -------------
            }
            else{
              this.alertService.showLoading("Conectando ao servidor...", 0)
              this.userServ.changePassword_DB(this.userServ.user.email, data.old_pwd, data.new_pwd, this.userServ.user.SessionID,(res)=>{
                //ConsoleLogService.log("UserPage","User saved like this> "+JSON.stringify(this.userServ.user))
                this.alertService.dismissLoading();
                this.alertService.showOk('Senha Alterada', 'Senha modificada com suceeso!', 'Ok', ()=>{})
                // ------------- Sucess Alert -------------
              },(err)=>{
                //ConsoleLogService.log("UserPage","Not Ok!!!")
                this.alertService.dismissLoading();
                this.alertService.showOk('Problemas de autenticação!', 'Você sera encaminhado a tela de loggin. Sua senha permanece a mesma!', 'Ok', ()=>{
                  this.navCtrl.push(LoginPage)
                })
                // ------------- Error Alert -------------
              }, (fail)=>{
                this.alertService.dismissLoading();
                this.alertService.showServerError(()=>{})

              })
            }
            ConsoleLogService.log("UserPage",'Saved clicked'+JSON.stringify(data));
          }
        }
      ]
    });
    prompt.present();
  }
}
