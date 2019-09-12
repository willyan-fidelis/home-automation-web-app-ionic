import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { ModOneApiService } from '../../providers/modOne-api-service';
import { ConsoleLogService } from '../../static-class/object-util';
//import { ModOneBackEndService } from '../../providers/modOne-backEnd-service';
//import { ObjectUtil } from '../../utils/object-util';
//import { UserService } from '../../providers/user-service';
import {AppService} from '../../providers/app-service';
import { ConfigService, ConfigServiceModel, ConfigServiceMQTTParModel, ConfigServiceAppComParModel, DeviceComunEnun, AppComunEnun } from '../../providers/config-service';

@Component({
  selector: 'page-config',
  templateUrl: 'config.html'
})
export class ConfigPage {

  constructor(public events: Events, public configService: ConfigService, public appService: AppService, public navCtrl: NavController, public modOneApiService: ModOneApiService) {
    this.configService.getConfigObj((obj)=>{this.configServiceObj=obj;this.gotConfigServiceObj=true})
    this.events.subscribe("ConfigService:NewData",(obj)=>{this.configServiceObj = obj})
  }

  //public appData = this.appService.getEmptyData()
  ionViewDidLoad() {
    ConsoleLogService.log("ConfigPage",'Hello ConfigPage Page');
  }

  public setComType(){
    //console.log("Test 123:" + this.configServiceObj.connType)
    this.modOneApiService.setConnectionType(this.configServiceObj.connType);
    //this.modOneApiService.Connect();
    this.configService.setConfigObj(this.configServiceObj);

  }
  private save(){
    this.configService.setConfigObj(this.configServiceObj)
  }

  private configServiceObj: ConfigServiceModel = this.configService.getEmptyData()
  private gotConfigServiceObj: boolean = false
  //--------------------------- MQTT Config --------------------------------
  private selectedMQTT = this.configService.getEmptyData().appMQTT
  private defineAsAPPMQTT(){
    this.configServiceObj.appMQTT = JSON.parse(JSON.stringify(this.selectedMQTT))
    this.save()
  }
  //--------------------------- MQTT Config --------------------------------

  //--------------------------- Cell Phone Config --------------------------------
  private appComunEnun: any = {NONE: AppComunEnun.NONE, MQTT: AppComunEnun.MQTT, SMS: AppComunEnun.SMS}
  private selectedMQTTAppComunList: number = AppComunEnun.NONE
  private phoneSelected: ConfigServiceAppComParModel = this.configService.getEmptyData().clearDataObj.AppCom
  private phoneSelectedIndex: number = -1
  private phoneExposed: ConfigServiceAppComParModel = this.configService.getEmptyData().clearDataObj.AppCom
  private phoneExposedIndex: number = -1
  private selectedPhone(phone, index){
    this.phoneSelected = JSON.parse(JSON.stringify(phone)); //Object.assign by value and not by reference..
    this.phoneSelectedIndex = index
    this.selectedMQTTAppComunList = phone.AppComun
  }
  private exposedPhone(){
    this.phoneExposed = JSON.parse(JSON.stringify(this.phoneSelected));  //Object.assign by value and not by reference..
    this.phoneExposedIndex = this.phoneSelectedIndex
  }
  private editPhone(){
    //let filtered = this.configServiceObj.appList.filter(elem => elem.name === this.phoneExposed.name)
    //this.configServiceObj.appList[this.phoneExposedIndex].MQTT = this.selectedMQTTAppList;
    if(this.phoneExposedIndex == -1){return}

    this.configServiceObj.appList[this.phoneExposedIndex] = JSON.parse(JSON.stringify(this.phoneExposed))
    this.configServiceObj.appList[this.phoneExposedIndex].MQTT = JSON.parse(JSON.stringify(this.selectedMQTTAppList))
    this.configServiceObj.appList[this.phoneExposedIndex].AppComun = this.selectedMQTTAppComunList
    this.save()
  }
  private deletePhone(){
    if(this.phoneExposedIndex == -1){return}
    this.configServiceObj.appList.splice(this.phoneExposedIndex, 1);
    this.save()
  }
  private newPhone(){
    this.configServiceObj.appList.push(JSON.parse(JSON.stringify(this.phoneExposed)))
    //this.configServiceObj.appList[this.phoneExposedIndex].MQTT = JSON.parse(JSON.stringify(this.selectedMQTTAppList))
    //this.configServiceObj.appList[this.phoneExposedIndex].AppComun = this.selectedMQTTAppComunList

    //this.phoneExposedIndex = this.configServiceObj.appList.length - 1
    this.save()
    //this.configServiceObj.appList[0].MQTT.MQTTHost
    //this.selectedMQTTAppList
    this.phoneExposed.MQTT
  }
  private selectedMQTTAppList: ConfigServiceMQTTParModel = JSON.parse(JSON.stringify(this.configService.getEmptyData().clearDataObj.MQTT))
  //private selectedMQTTAppList(){}
  //--------------------------- Cell Phone Config --------------------------------

  //--------------------------- Default Restore ----------------------------------
  private default(){this.configService.defaultRestore()}
  //--------------------------- Default Restore ----------------------------------

}
