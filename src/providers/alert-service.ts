import { Injectable } from '@angular/core';
import {  AlertController, LoadingController, ToastController  } from 'ionic-angular';
import { ConsoleLogService } from '../static-class/object-util';

@Injectable()
export class AlertService {
  alert: any;
  loader: any;
  constructor(public toastCtrl: ToastController, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    ConsoleLogService.log("AlertService",'Hello AlertService Provider');
  }
  public showOk(_title: string, _subTitle: string, _okBtn: string, _callBackOk){
    this.alert = this.alertCtrl.create({
      title: _title,
      subTitle: _subTitle,
      enableBackdropDismiss: false,
      buttons: [{
        text: _okBtn,
        handler: data => {
          _callBackOk();
      }}]
    });
    this.alert.present();
  }
  public showOkCancel(_title: string, _subTitle: string, _okBtn: string, _cancelBtn:string, _callBackOk, _callBackCancel){
    this.alert = this.alertCtrl.create({
      title: _title,
      subTitle: _subTitle,
      enableBackdropDismiss: false,
      buttons: [
        {
        text: _okBtn,
        handler: data => {_callBackOk();}
      },
      {
      text: _cancelBtn,
      handler: data => {_callBackCancel();}
      }
      ]
    });
    this.alert.present();
  }
  public showOkWith1Input(_title: string, _message: string, _placeholder: string, _okBtn: string, _callBackOk){
    this.alert = this.alertCtrl.create({
      title: _title,
      message: _message,
      inputs: [
        {
          name: 'txt',
          placeholder: _placeholder
        }
      ],
      enableBackdropDismiss: false,
      buttons: [
        {
          text: _okBtn,
          handler: data => {_callBackOk(data.txt)}
        }
      ]
    });
    this.alert.present();
  }
  public showOkCancelWith1Input(_title: string, _message: string, _placeholder: string, _okBtn: string, _cancelBtn: string, _callBackOk:(text: string)=>void){
    this.alert = this.alertCtrl.create({
      title: _title,
      message: _message,
      inputs: [
        {
          name: 'txt',
          placeholder: _placeholder
        }
      ],
      enableBackdropDismiss: false,
      buttons: [
        {
          text: _okBtn,
          handler: data => {_callBackOk(data.txt)}
        },
        {
          text: _cancelBtn,
          handler: data => {}
        }
      ]
    });
    this.alert.present();
  }

  public createOkCancelWithInputs(_title: string, _message: string, _input: Array<any>, _callBackOk, _callBackCancel, _okBtn: string, _cancelBtn: string){
    this.alert = this.alertCtrl.create({
      title: _title,
      message: _message,
      inputs: _input,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: _cancelBtn,
          handler: data => {_callBackCancel(data)}
        },
        {
          text: _okBtn,
          handler: data => {_callBackOk(data)}
        }
      ]
    });
    //this.alert.present();
  }
  public showOkCancelWithInputs(){
    this.alert.present();
  }
  public showServerError(_callBackOk){
    this.showOk('Erro!', 'Falha ao tentar conectar ao servidor e ao banco de dados! <br>Verifique sua conexão com a internet.', 'ok', _callBackOk)
  }
  // -------------------- Loading Object --------------------
  public showLoading(_text: string, time: number) {
    this.loader = this.loadingCtrl.create({
      content: _text
    });
    if (time != 0){
      setTimeout(()=>{this.loader.dismiss();}, time);
    }
    this.loader.present();
  }
  public dismissLoading(){
    this.loader.dismiss();
  }
  // -------------------- Loading Object --------------------

  public showToast(text: string, position: string, time: number) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: time,
      position: position
    });

    toast.present(toast);
  }
}
