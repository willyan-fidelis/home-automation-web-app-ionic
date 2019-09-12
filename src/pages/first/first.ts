import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
//Put here all services necessary at start-up moment:

import { AlertService } from '../../providers/alert-service'

import { HomePage } from '../home/home';
import { MenuPage } from '../menu/menu';
import { IntroductionPage } from '../introduction/introduction';
import { LoginPage } from '../login/login'
import { EspMod1DetailPage } from '../esp-mod1-detail/esp-mod1-detail'

import { ObjectUtil } from '../../utils/object-util';

import { ConfigService } from '../../providers/config-service';
import { ModOneApiService } from '../../providers/modOne-api-service';
import { AutomationService } from '../../providers/automation-service';
import { ModOneBackEndService } from '../../providers/modOne-backEnd-service';
import { UserService } from '../../providers/user-service';
import { ConsoleLogService } from '../../static-class/object-util';

@Component({
  selector: 'page-first',
  templateUrl: 'first.html'
})
export class FirstPage {
  constructor(public automationService: AutomationService, public configService: ConfigService, public modOneApiService: ModOneApiService, public alertService: AlertService, public events: Events, public navCtrl: NavController, private userServ: UserService, private deviceService: ModOneBackEndService) {
    events.subscribe('FirstPage:goRootPage', () => {
      this.dataReady(()=>{
        this.navCtrl.setRoot(MenuPage)
      })
    });
    //this.configService.config()
  }
  ionViewDidLoad() {
    ConsoleLogService.log("FirstPage",'Hello FirstPage Page');
    this.userServ.isLogged(()=>{
      //_callBackIsLogged:
      this.dataReady(()=>{
        this.navCtrl.setRoot(MenuPage)
      })
    },()=>{
      //_callBackIsNotLogged:
      this.navCtrl.setRoot(IntroductionPage)
    },()=>{
      //_callBackAnyTimeLogged:
      this.navCtrl.setRoot(LoginPage)
    },()=>{
      //_callBackAfterCheck:
    })
    // ----------------------------- Init Services -----------------------------
  }
  public dataReady(_callBack : () => any){
    // ----------------------------- Init Services -----------------------------
    //First of all get the offline user:
    this.userServ.getUser((user)=>{
      let _loadTime: number = 1//5000 ms
      //Conect to data base and refresh the aplication device list:
      //this.deviceService.getDeviceList(user.email,user.SessionID,(res)=>{},(res)=>{},(err)=>{})
      this.alertService.showLoading("Bem Vindo ao HomeSense!<br>Carregando aplicativo..", _loadTime)
      setTimeout(()=>{_callBack()},_loadTime)//Wait '6000' ms to ensure that the aplication is loaded correctly!
    },()=>{/*'No user logged in' code here!*/})
    // ----------------------------- Init Services -----------------------------
  }
}
