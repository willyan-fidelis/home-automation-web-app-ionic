import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { ConsoleLogService } from '../static-class/object-util';
import { LocalStorageService } from './local-storage-service';

/*
  Configuration method
*/
export interface  ConfigServiceMQTTParModel{ //MQTT Parameter Model
  MQTTHost: string,MQTTPort: number,MQTTWSPort: number, MQTTSSL: number, MQTTPath: string, MQTTUser: string, MQTTUserPwd: string, MQTTClearS: number, MQTTQoS: number, MQTTType: string
}

export interface  ConfigServiceAppComParModel{ //App Comunication Parameter Model
  AppComun:number, phone:string, name:string, enabled: boolean, MQTT:ConfigServiceMQTTParModel
}

export interface  ConfigServiceModel {
    clearDataObj:{MQTT:ConfigServiceMQTTParModel, AppCom: ConfigServiceAppComParModel} //Put here all object that is necessary exist an empty template.
    appMQTT: ConfigServiceMQTTParModel;
    appID: string,
    appList:Array<ConfigServiceAppComParModel>;
    server: {URL: string, URLTest: string},
    connType: string;
    MQTTPreConfigList: Array<ConfigServiceMQTTParModel>;
}

export enum DeviceComunEnun { //Device Comunication Enumeration
    NONE = 0,
    WIFI_DIRECT = 1, //ESP Wifi(ESP as Acess Point)
    WIFI_LOCAL = 2,  //Your Peivate Wifi Network
    MQTT = 3,
    APP_ROUTER = 4,
}
export enum AppComunEnun { //App Comunication Enumeration
    NONE = 100,
    SMS = 101,
    MQTT = 102,
}

@Injectable()
export class ConfigService {

  constructor(public events: Events, public localStorage: LocalStorageService) {
    ConsoleLogService.log('ConfigService','Hello ConfigServiceProvider Provider')
    //this.saveToLocalSorage(this.configServiceObj)
    this.restoreFromLocalSorage((obj)=>{ConsoleLogService.log('ConfigService',obj)})

  }
  private localStorageName: string = "ConfigService"
  private configServiceObj: ConfigServiceModel = {
    clearDataObj:{
      MQTT:{MQTTHost: "host.com", MQTTPort: 8000, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "caminho", MQTTUser: "usuario", MQTTUserPwd: "senha", MQTTClearS: 0, MQTTQoS: 0, MQTTType: ""},
      AppCom: {AppComun: AppComunEnun.SMS, phone:'',name:'Nome',enabled:true, MQTT: {MQTTHost: "host.com.br", MQTTPort: 8000, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "caminho", MQTTUser: "usuario", MQTTUserPwd: "senha", MQTTClearS: 0, MQTTQoS: 0, MQTTType: ""}}
    },
    appMQTT: {MQTTHost: "", MQTTPort: 0, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: ""},
    appID:  Date.now().toString() + "-" + (Math.random()*10).toString(),
    appList: [{AppComun: AppComunEnun.SMS, phone:'',name:'Nome',enabled:true, MQTT: {MQTTHost: "", MQTTPort: 0, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: ""}}],
    server: {URL: 'localhost', URLTest: "/index.php"},
    connType: 'NONE',
    MQTTPreConfigList: [
      {MQTTHost: "broker.mqttdashboard.com",  MQTTPort: 1883, MQTTWSPort: 8000, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "1"},
      {MQTTHost: "iot.eclipse.org",  MQTTPort: 1883, MQTTWSPort: 0, MQTTSSL: 80, MQTTPath: "/ws", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "2"},
      {MQTTHost: "broker.hivemq.com",  MQTTPort: 1883, MQTTWSPort: 8000, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "3"},
      {MQTTHost: "m11.cloudmqtt.com",  MQTTPort: 14113, MQTTWSPort: 34113, MQTTSSL: 1, MQTTPath: "", MQTTUser: "bvxpyvvg", MQTTUserPwd: "cYgr4xM3VKdz", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "4"},
      {MQTTHost: "broker.bevywise.com",  MQTTPort: 1883, MQTTWSPort: 8443, MQTTSSL: 0, MQTTPath: "", MQTTUser: "UcSQ0Oteo578lxspev", MQTTUserPwd: "mj7aCVs7Fe8wqcEDaj", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "5"},
      {MQTTHost: "Reserva 2",  MQTTPort: 1883, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "6"},
      {MQTTHost: "Reserva 3",  MQTTPort: 1883, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "7"},
      {MQTTHost: "Reserva 4",  MQTTPort: 1883, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "8"},
      {MQTTHost: "Reserva 5",  MQTTPort: 1883, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "9"},
      {MQTTHost: "Reserva 6",  MQTTPort: 1883, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: "10"}
    ]
  }
  private emptyConfigServiceObj: ConfigServiceModel = JSON.parse(JSON.stringify(this.configServiceObj));//Object.assign({},this.configServiceObj)
  //Get and set data:

  public getConfigObj(_callGotData : (_data: ConfigServiceModel) => void) {this.restoreFromLocalSorage((obj)=>{_callGotData(obj)})}
  public setConfigObj(obj: ConfigServiceModel): void{
    this.configServiceObj = obj; this.saveToLocalSorage(this.configServiceObj);
    this.events.publish("ConfigService:NewData",JSON.parse(JSON.stringify(this.configServiceObj)))
    //Exemplo de como seinscrever quando uma nova configuracao for salva:
    //this.events.subscribe("ConfigService:NewData",(obj)=>{console.log('New Data saved!!!: ' + obj)})
  }

  //Get an empty onject:

  public getEmptyData(): ConfigServiceModel{
    return JSON.parse(JSON.stringify(this.emptyConfigServiceObj));//this.emptyConfigServiceObj
  }

  //Restore to default:

  public defaultRestore(){
    this.configServiceObj = JSON.parse(JSON.stringify(this.emptyConfigServiceObj));//Object.assign({},this.emptyConfigServiceObj)
    this.configServiceObj.appID = Date.now().toString() + "-" + (Math.random()*10).toString()
    this.saveToLocalSorage(this.emptyConfigServiceObj)
    this.events.publish("ConfigService:NewData",JSON.parse(JSON.stringify(this.configServiceObj)))
  }
  //Save and restore from local storage:

  public restoreFromLocalSorage(_callBackOk : (_data: ConfigServiceModel) => void): void{
    this.localStorage.isSet(this.localStorageName,()=>{
      //If no data is available(null) so:
      let _data = this.getEmptyData()
      this.localStorage.set(this.localStorageName,_data)
      _callBackOk(this.configServiceObj)
    },()=>{
      //If data is available(not null) so:
      ConsoleLogService.log('ConfigService','Restored!')
      this.localStorage.get(this.localStorageName,(obj)=>{this.configServiceObj=obj; _callBackOk(obj)})
    });
  }
  private saveToLocalSorage(obj: ConfigServiceModel): void{
    this.localStorage.set(this.localStorageName,obj)
  }

}
