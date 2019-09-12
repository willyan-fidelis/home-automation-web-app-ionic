import { Injectable } from '@angular/core';
//import 'rxjs/add/operator/map';
import { LocalStorageService } from './local-storage-service';
import { ConsoleLogService } from '../static-class/object-util';

/*
  Aplication methods
*/
@Injectable()
export class AppService {

  constructor(public localStorage: LocalStorageService) {
    //console.log('Hello AppDataService Provider');
    ConsoleLogService.log("AppDataService", 'Hello AppDataService Provider')

    this.data = this.getEmptyData()
    this.restoreFromLocalSorage((data)=>{},()=>{})
  }

  public data : {MQTTServers: Array<{Server : string, User :string, Pwd : string, PortDevice : string, PortApp : string, Path: string}>, Other:string}

  public getEmptyData(){
    return {
      MQTTServers: this.getCommumMQTTServers(),
      Other: "Only for teste!"
    }
  }

  private localStorageName: string = "AppData"
  public restoreFromLocalSorage(_callBackOk : (_dt: any) => any, _callBackNoUser : () => any){
    this.localStorage.isSet(this.localStorageName,()=>{
      //If no data is available(null) so:
      let _data = this.getEmptyData()
      this.localStorage.set(this.localStorageName,_data)
      _callBackNoUser()
    },()=>{
      //If data is available(not null) so:
      this.localStorage.get(this.localStorageName,(ob)=>{this.data=ob; _callBackOk(this.data)})
    });
  }
  private saveToLocalSorage(){
    this.localStorage.set(this.localStorageName,this.data)
  }

  public getCommumMQTTServers(){
    return [
      {Server : "broker.mqttdashboard.com", User : "", Pwd : "", PortDevice : "1883", PortApp : "8000", Path: ""},
      {Server : "iot.eclipse.org", User : "", Pwd : "", PortDevice : "1883", PortApp : "80", Path: "/ws"},
      {Server : "m11.cloudmqtt.com", User : "", Pwd : "", PortDevice : "14113", PortApp : "34113", Path: ""},
      {Server : "", User : "", Pwd : "", PortDevice : "", PortApp : "", Path: ""},
      {Server : "", User : "", Pwd : "", PortDevice : "", PortApp : "", Path: ""}
    ]
  }

  //------------- Edit Data ---------------
  public editData(_data){
    this.data = _data
    this.saveToLocalSorage()
  }
}
