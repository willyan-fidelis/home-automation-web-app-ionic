import { Injectable } from '@angular/core';
//import { ModOneModel } from '../model/modOne-model';
//import { ModuleOneModel } from '../model/device-module-model';
//import { DeviceType1Model } from '../model/deviceType1-model';
import { LocalStorageService } from './local-storage-service';
import { HttpService } from './http-service';
import { KeyValuePairModel } from '../model/key-value-pair-model';
//Utils:
//import { ObjectUtil } from '../static-class/object-util';
import { ConsoleLogService, ObjectUtil } from '../static-class/object-util';
import { ConfigService, DeviceComunEnun, ConfigServiceAppComParModel, AppComunEnun, ConfigServiceMQTTParModel } from './config-service';
import { Events } from 'ionic-angular';
import { GetGeneralTbModOneAPIModel,GetDeviceTypeModOneAPIModel,GetIpModOneAPIModel,GetTimeModOneAPIModel,GetStatusModOneAPIModel,GetEventListModOneAPIModel,GetSTAConfigModOneAPIModel,GetAPConfigModOneAPIModel} from './modOne-api-service';


export interface  ModuleOneModel {
    Number: string;
    Name: string;
    Favorite: boolean;
    Desactvated: boolean;
    Position: number;
    ParentPosition: number;
    //public email?: string
}
export interface  DeviceOneModel {
    DB: {
      Number:string, Name:string, Desactvated:boolean,
      Room:string,
      Type: {Type: string,SwVersion: string,HwVersion: string},
      ModuleList: Array<ModuleOneModel>,
      MQTT: ConfigServiceMQTTParModel,
      //Detail: {ApName:string, ApPwd:string, Number:string, StaIP:string, StaName:string, StaPwd:string}
    }; //From data base! "General" is commom to all device, esp or others! "Detail" is specific to each kind of devices(type 1.0 is one, type 2.0 is other..)
    //FromDevice: {General: any, Detail: any};//From device(esp or others)!
    Local: {
      // --------------------- ESP Data ---------------------
      DeviceType: GetDeviceTypeModOneAPIModel,
      APConfig:   GetAPConfigModOneAPIModel,
      STAConfig:  GetSTAConfigModOneAPIModel,
      ip:         GetIpModOneAPIModel;
      Status:     GetStatusModOneAPIModel,
      Time:       GetTimeModOneAPIModel,
      EventList:  GetEventListModOneAPIModel,
      General:    GetGeneralTbModOneAPIModel,
      DevComun: {name:string, type:number, AppRouter: ConfigServiceAppComParModel};
      MQTT: ConfigServiceMQTTParModel,
      // --------------------- ESP Data ---------------------

      // --------------------- Aplication Data ---------------------

      // --------------------- Aplication Data ---------------------
    };
    temp: {
      lastModRequest:[number,number,number,number,number],
      requestStatus: {dev:{reqStatus: string, mod:[{pos:number,reqStatus: string}]}}
    };
}

@Injectable()
export class ModOneBackEndService {

  constructor(public events: Events, public configService: ConfigService, public localStorage: LocalStorageService, public httpService: HttpService) {
    ConsoleLogService.log("ModOneBackEndService",'Hello DeviceService Provider');

    this.configService.getConfigObj((obj)=>{this.ip=obj.server.URL})
    this.events.subscribe("ConfigService:NewData",(obj)=>{this.ip=obj.server.URL})
  }

  private deviceList: Array<DeviceOneModel> = [{
    DB:
    {
      Number:"",
      Name:"",
      Desactvated:false,
      Room:"Desconhecido",
      Type:{Type:"", SwVersion:"", HwVersion:""},
      ModuleList:[],
      MQTT: {MQTTHost: "", MQTTPort: 0, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: ""},
    //Detail:{ApName:"", ApPwd:"", Number:"", StaIP:"", StaName:"", StaPwd:""}
    },
    Local:{
      DeviceType:{devid:"",status:"",hw: "",type: "",sw: "",number: "", ip:""},
      APConfig:{devid:"",status:"",name: "",pwd: ""},
      STAConfig:{devid:"",status:"",name: "",pwd: "",mac: ""},
      ip: {devid:"",status:"",ap_msk: "",ap_mac: "",ap_gtw: "",ap_ip: "",sta_ip: "",sta_msk: "",sta_gtw: "",sta_mac: ""},

      Status:{devid:"",status:"",rgb:[0,0,0],InputM0:0,InputM1:0,Sensor:0,Light:0,out:{M1:false,M0:false},ip:"",number:""},
      Time:{devid:"",status:"",sec: 0,min: 0,hrs: 0,day: 1,wk: 1,mth: 1,yy: 16},
      EventList:{
        devid:"",status:"",
        lgt_e:{i1:{m1:1,m0:1,typ:1,enb:true},i2:{m1:2,m0:2,typ:2,enb:true}},
        te:{i1:{cmd:{m1:1,m0:1},h:3,m:0,enb:true, wk_days:{i1:false,i2:false,i3:false,i4:false,i5:false,i6:false,i7:false}},i2:{cmd:{m1:0,m0:0},h:1,m:0,enb:false, wk_days:{i1:false,i2:false,i3:false,i4:false,i5:false,i6:false,i7:false}}},
        prd:{i1:{m1:37,h1:12,m2:37,h2:12},i2:{m1:37,h1:12,m2:37,h2:12}},
        pe:{i1:{cmd:{m1:0,m0:1},prd:1,dy_sec:0,enb:true},i2:{cmd:{m1:1,m0:0},prd:2,dy_sec:0,enb:true}},
        lgtyp:{i1:0,i2:0}
      },
      General:{devid:"",status:"",tol:100,pwd:"",user:"",port:"1883",ServNm:"broker.mqttdashboard.com",EnbMQTT:true,M0:0,M1:0,InpRGB:false,Inp1:3,Inp2:3, EnbSTA: false},
      DevComun: {name:"", type:DeviceComunEnun.WIFI_DIRECT, AppRouter: {AppComun: AppComunEnun.SMS, phone:'',name:'Nome',enabled:true, MQTT: {MQTTHost: "host.com.br", MQTTPort: 8000, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "caminho", MQTTUser: "usuario", MQTTUserPwd: "senha", MQTTClearS: 0, MQTTQoS: 0, MQTTType: ""}}},
      MQTT: {MQTTHost: "", MQTTPort: 0, MQTTWSPort: 0, MQTTSSL: 0, MQTTPath: "", MQTTUser: "", MQTTUserPwd: "", MQTTClearS: 0, MQTTQoS: 0, MQTTType: ""},
    },
    temp: {
      lastModRequest:[1,1,1,1,1],
      requestStatus: {dev:{reqStatus: 'NOK', mod:[{pos:1,reqStatus: "NOK"},{pos:2,reqStatus: "NOK"},{pos:3,reqStatus: "NOK"},{pos:4,reqStatus: "NOK"},{pos:5,reqStatus: "NOK"}]}}
    }
  }];
  // private moduleList: Array<ModuleOneModel> = [ //This List is not so importante. The reason is that the liste is saved inside the the 'deviceList' too.
  //   {Number:"", Name:"",Favorite:false,Desactvated:false,Position:1,ParentPosition:0}
  // ];
  private deviceListLocalStorage: string = "deviceList"
  //private moduleListLocalStorage: string = "moduleList"
  public ip: string = ''//"192.168.0.14"//"willyancasa-PC";//'willyannote'; //"192.168.0.34";
  private timeout: number = 15000;

  private emptyDeviceObj: DeviceOneModel = JSON.parse(JSON.stringify(this.deviceList[0]))
  public getEmptyDevice():DeviceOneModel{
    return JSON.parse(JSON.stringify(this.emptyDeviceObj));
  }

  private emptyModObj: ModuleOneModel = JSON.parse(JSON.stringify({Number:"", Name:"",Favorite:false,Desactvated:false,Position:1,ParentPosition:0}))
  public getEmptyModule():ModuleOneModel{
    return JSON.parse(JSON.stringify(this.emptyModObj));
  }
  // -------------------------------- Comunication with data base methods From/To DB(Data Base) -------------------------------->>>

  public  getDeviceList_DB(_restore: boolean, _email: string, _sessionID: string, _callBackOk,_callBackNotOk,_callBackFail){
    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/StReturnDeviceList.php/?email="+_email+"&session="+_sessionID, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //this.deviceList = []
        //So get the device list:
        for (let i in res.Results) {
          //if (!ObjectUtil.hasAnyProperty(this.deviceList[i]) || !ObjectUtil.hasAnyProperty(this.deviceList[i].DB) || !ObjectUtil.hasAnyProperty(this.deviceList[i].DB)){
            let ip = "10.0.0.1"
            if (this.deviceList[i]){
              if (this.deviceList[i].Local.ip.sta_ip){
                ip = this.deviceList[i].Local.ip.sta_ip
              }

            }

            if(_restore == true || this.deviceList[i] == null){this.deviceList[i] = this.getEmptyDevice();}
            this.deviceList[i] = this.getEmptyDevice();
            this.deviceList[i].Local.ip.sta_ip = ip;
            this.deviceList[i].DB.Number = res.Results[i].Number;
            this.deviceList[i].DB.Name = res.Results[i].Name;
            if (res.Results[i].Desactvated === 1){
              this.deviceList[i].DB.Desactvated = true
            }
            else{
              this.deviceList[i].DB.Desactvated = false
            }
            //MQTT Info:
            this.deviceList[i].DB.MQTT.MQTTHost = res.Results[i].MQTTHost;
            this.deviceList[i].DB.MQTT.MQTTPort = res.Results[i].MQTTPort;
            this.deviceList[i].DB.MQTT.MQTTSSL = res.Results[i].MQTTSSL;
            this.deviceList[i].DB.MQTT.MQTTPath = res.Results[i].MQTTPath;
            this.deviceList[i].DB.MQTT.MQTTUser = res.Results[i].MQTTUser;
            this.deviceList[i].DB.MQTT.MQTTUserPwd = res.Results[i].MQTTUserPwd;
            this.deviceList[i].DB.MQTT.MQTTClearS = res.Results[i].MQTTClearS;
            this.deviceList[i].DB.MQTT.MQTTQoS = res.Results[i].MQTTQoS;
            this.deviceList[i].DB.MQTT.MQTTType = res.Results[i].MQTTType;
            this.deviceList[i].DB.Room = res.Results[i].Room;
            this.deviceList[i].DB.Type.Type = res.Results[i].Type;
            this.deviceList[i].DB.Type.SwVersion = res.Results[i].SwVersion;
            this.deviceList[i].DB.Type.HwVersion = res.Results[i].HwVersion;
        }
        this.deviceList = this.deviceList.slice(0, res.Results.length)
        ConsoleLogService.log("ModOneBackEndService",this.deviceList);
        //this.localStorage.remove(this.deviceListLocalStorage)
        this.localStorage.set(this.deviceListLocalStorage,this.deviceList);

        //Now get the module list:

        this.getModuleList_DB(_email,_sessionID, (list)=>{
          //Now save the array in the object structure:
          //this.deviceList = []
          for (let i in this.deviceList){
            let _dev = list.filter(elem => elem.Number === this.deviceList[i].DB.Number)//this.deviceList[0].DB.Number
            if (_dev.length > 0){
              this.deviceList[i].DB.ModuleList = _dev
              this.clear_TempRequestStatus()
              this.createIfIsNull() //NEW: Added to create temp data if it is null
              this.saveDevice(this.deviceList[i])
              //ConsoleLogService.log("ModOneBackEndService","Saved: "+JSON.stringify(this.deviceList))
            }
          }

          _callBackOk(this.deviceList)
        }, (ress)=>{_callBackNotOk(ress)}, (errr)=>{_callBackFail(errr)});
        this.localStorage.set(this.deviceListLocalStorage,this.deviceList);
      }
      else
      {
        this.deviceList = []
        this.localStorage.set(this.deviceListLocalStorage,this.deviceList);
        _callBackOk(this.deviceList)
      }

    }, (error)=>{_callBackFail(error)})
  }
  public  AddNewDevice_DB(_email: string, _sessionID: string, _data: KeyValuePairModel[], _type: number, _callBackOk,_callBackNotOk,_callBackFail){
    let _ctrlData: KeyValuePairModel[]
    _ctrlData = [
      {key:"addType", value:1},
      {key:"email", value:_email},
      {key:"session", value:_sessionID},

      {key:"MQTTHost", value:"broker.mqttdashboard.com"},
      {key:"MQTTPort", value:1883},
      {key:"MQTTSSL", value:0},
      {key:"MQTTPath", value:""},
      {key:"MQTTUser", value:""},
      {key:"MQTTUserPwd", value:""},
      {key:"MQTTClearS", value:60},
      {key:"MQTTQoS", value:0},
      {key:"MQTTType", value:"ws"}
    ];
    _data = _data.concat(_ctrlData);

    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpCreateDevice.php"+this.httpService.phpSerialize(_data), (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //this.getDeviceList(_email, _sessionID)
        _callBackOk(res)
      }
      else{
        _callBackNotOk(res)
      }
    }, (error)=>{_callBackFail(error)})
  }
  public  new_DB(email:string, sessionID: string, type: string,sw_ver: string,hw_ver: string,number: string,name: string, _callBackOk,_callBackNotOk,_callBackFail){ //staname: string,stapwd: string,apname: string,appwd: string,staip: string,
    let detail: Array<any> = [
      {key:"type", value:type},
      {key:"sw_ver", value:sw_ver},
      {key:"hw_ver", value:hw_ver},
      {key:"number", value:number},
      {key:"name", value:name},
      //{key:"staname", value:staname},
      //{key:"stapwd", value:stapwd},
      //{key:"apname", value:apname},
      //{key:"appwd", value:appwd},
      //{key:"staip", value:staip}
    ]
    this.AddNewDevice_DB(email, sessionID,detail,1,(res)=>{_callBackOk(res)},(res)=>{_callBackNotOk(res)},(err)=>{_callBackFail(err)})
  }
  public  deleteDevice_DB(_email: string, _sessionID: string, _number: string, _callBackOk,_callBackNotOk,_callBackFail){
    let _data: KeyValuePairModel[];
    _data = [{key:"number", value:_number}, {key:"email", value:_email}, {key:"session", value:_sessionID}]

    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/StDeleteDevice.php"+this.httpService.phpSerialize(_data), (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        _callBackOk(res)
      }
      else{
        _callBackNotOk(res)
      }
    }, (error)=>{_callBackFail(error)})
  }
  public  editDevice_DB(_email: string, _sessionID: string, _data: {room: string, number: string, name: string, desactive: boolean, staName: string, staPwd: string, apName: string, apPwd: string, staIP: string, MQTTHost: string, MQTTPort: number, MQTTSSL: number, MQTTPath: string, MQTTUser: string, MQTTUserPwd: string, MQTTClearS: number, MQTTQoS: number, MQTTType: string}, _callBackOk,_callBackNotOk,_callBackFail){
    let _ctrlData: KeyValuePairModel[]
    let desact: number = 0
    if (_data.desactive){
      desact = 1
    }
    _ctrlData = [
      {key:"devType", value:1},
      {key:"email", value:_email},
      {key:"session", value:_sessionID},
      {key:"room", value:_data.room},
      {key:"number", value:_data.number},
      {key:"name", value:_data.name},
      {key:"desact", value:desact},
      {key:"staname", value:_data.staName},
      {key:"stapwd", value:_data.staPwd},
      {key:"apname", value:_data.apName},
      {key:"appwd", value:_data.apPwd},
      {key:"staip", value:_data.staIP},

      {key:"MQTTHost", value:_data.MQTTHost},
      {key:"MQTTPort", value:_data.MQTTPort},
      {key:"MQTTSSL", value:_data.MQTTSSL},
      {key:"MQTTPath", value:_data.MQTTPath},
      {key:"MQTTUser", value:_data.MQTTUser},
      {key:"MQTTUserPwd", value:_data.MQTTUserPwd},
      {key:"MQTTClearS", value:_data.MQTTClearS},
      {key:"MQTTQoS", value:_data.MQTTQoS},
      {key:"MQTTType", value:_data.MQTTType}
    ];

    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpUpDataDevice.php"+this.httpService.phpSerialize(_ctrlData), (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        _callBackOk()
      }
      else{
        _callBackNotOk(res)
      }
    }, (error)=>{_callBackFail(error)})
  }
  public  editModule_DB(_email: string, _sessionID: string, _data: {number: string, position: number, name: string, desactive: boolean, favorite: boolean}, _callBackOk,_callBackNotOk,_callBackFail){
    let _ctrlData: KeyValuePairModel[]
    let des: number = 0
    if (_data.desactive){
      des = 1
    }
    let fav: number = 0
    if (_data.favorite){
      fav = 1
    }
    _ctrlData = [{key:"email", value:_email},{key:"session", value:_sessionID},
    {key:"numb", value:_data.number},{key:"pos", value:_data.position},{key:"nm", value:_data.name},
    {key:"fav", value:fav},{key:"des", value:des}];

    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpUpDataModule.php"+this.httpService.phpSerialize(_ctrlData), (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        _callBackOk()
      }
      else{
        _callBackNotOk(res)
      }
    }, (error)=>{_callBackFail(error)})
  }
  private getModuleList_DB(_email: string, _sessionID: string, _callBackOk,_callBackNotOk,_callBackFail){
    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/StReturnModuleList.php/?email="+_email+"&session="+_sessionID, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        let list: Array<ModuleOneModel> = []
        list = res.Results;
        //this.moduleList = this.moduleList.slice(0, res.Results.length)
        _callBackOk(list)
      }
      else
      {
        _callBackNotOk(res)
      }
      //this.localStorage.set(this.moduleListLocalStorage,this.moduleList);
    }, (error)=>{_callBackFail(error)})
  }
  public shareDevice_DB(_UserEmailToBeShared: string, _email: string ,_number: string, _rights: number,_sessionID: string,_callBackOk:(res: any)=>void,_callBackNotOk:(err: any)=>void){
    let _ctrlData: KeyValuePairModel[]
    _ctrlData = [
      {key:"email", value:_email},
      {key:"session", value:_sessionID},
      {key:"number", value:_number},
      {key:"emailToShare", value:_UserEmailToBeShared},
      {key:"rights", value:_rights}
    ];

    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpShareDevice.php"+this.httpService.phpSerialize(_ctrlData), (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //this.getDeviceList(_email, _sessionID)
        _callBackOk(res)
      }
      else{
        _callBackNotOk(res)
      }
    }, (error)=>{_callBackNotOk(error)})
  }
  public unShareDevice_DB(_UserEmailToBeUnShared: string, _email: string ,_number: string,_sessionID: string,_callBackOk:(res: any)=>void,_callBackNotOk:(err: any)=>void){
    let _ctrlData: KeyValuePairModel[]
    _ctrlData = [
      {key:"email", value:_email},
      {key:"session", value:_sessionID},
      {key:"number", value:_number},
      {key:"emailToUnShare", value:_UserEmailToBeUnShared}
    ];

    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpUnShareDevice.php"+this.httpService.phpSerialize(_ctrlData), (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //this.getDeviceList(_email, _sessionID)
        _callBackOk(res)
      }
      else{
        _callBackNotOk(res)
      }
    }, (error)=>{_callBackNotOk(error)})
  }
  // -------------------------------- Comunication with data base methods From/To DB(Data Base) --------------------------------<<<

  //---------------------------------------- Local Commands ------------------------------------->>>

  public saveDevice(_device: DeviceOneModel): void{
    //this.createIfIsNull() //NEW: Added to create temp data if it is null
      for (let i in this.deviceList) {
        if(this.deviceList[i].DB.Number === _device.DB.Number){
          this.deviceList[i]=_device;
          this.localStorage.set(this.deviceListLocalStorage,this.deviceList);
          this.events.publish("ModOneBackEndService:NewData",this.deviceList)
          break;
          //ConsoleLogService.log("ModOneBackEndService","Element Saved!");
        }
      }
  }

  public saveList(_list: Array<DeviceOneModel>): void{
    this.deviceList = _list
    this.localStorage.set(this.deviceListLocalStorage,this.deviceList);
    this.events.publish("ModOneBackEndService:NewData",this.deviceList)
  }
  public getDeviceByNumber(number: string): DeviceOneModel {
    let arrayRes: Array<DeviceOneModel> = this.deviceList.filter((elem) => {return elem.DB.Number === number})
    if (arrayRes.length == 1){
      ConsoleLogService.log("ModOneBackEndService","Element found: ");ConsoleLogService.log("ModOneBackEndService",arrayRes[0])
      return JSON.parse(JSON.stringify(arrayRes[0]))
    }
    else{
      let ret: DeviceOneModel
      return ret
    }
  }
  public getDeviceByName(name: string): DeviceOneModel {
    let arrayRes: Array<DeviceOneModel> = this.deviceList.filter((elem) => {return elem.DB.Name === name})
    if (arrayRes.length == 1){
      ConsoleLogService.log("ModOneBackEndService","Element found: ");ConsoleLogService.log("ModOneBackEndService",arrayRes[0])
      return JSON.parse(JSON.stringify(arrayRes[0]))
    }
    else{
      let ret: DeviceOneModel
      return ret
    }
  }
  public getDeviceModByName(name: string, modName: string): ModuleOneModel {
    let arrayRes1: Array<DeviceOneModel> = this.deviceList.filter((elem) => {return elem.DB.Name === name})
    if (arrayRes1.length == 1){
      //ConsoleLogService.log("ModOneBackEndService","Element found: ");ConsoleLogService.log("ModOneBackEndService",arrayRes1[0])
      let arrayRes2 = arrayRes1[0].DB.ModuleList.filter((elem) => elem.Name === modName)
      if (arrayRes2.length == 1){
        return JSON.parse(JSON.stringify(arrayRes2[0]))
      }else{
        let ret: ModuleOneModel
        return ret
      }
    }
    else{
      let ret: ModuleOneModel
      return ret
    }
  }

  private clear_TempRequestStatus(): void{
    let list = this.deviceList
    for(var i in list){
      list[i].temp.requestStatus = null
    }
  }
  private createIfIsNull_TempRequestStatus(): void{//Check and initialize Temp Data
      let list = this.deviceList
      for(var i in list){
        //list[i].temp['requestList'] = null
        if(list[i].temp.requestStatus == null){//Verica a se a primeira posicao esta null
          list[i].temp.requestStatus = {dev:{reqStatus: "NOK", mod:[{pos:1,reqStatus: "NOK"},{pos:2,reqStatus: "NOK"},{pos:3,reqStatus: "NOK"},{pos:4,reqStatus: "NOK"},{pos:5,reqStatus: "NOK"}]}}
          this.saveDevice(list[i])
        }
      }
      ConsoleLogService.log("ModOneBackEndService",list)
  }
  private createIfIsNull(): void{

    //Initialize the tem data if it doens't exist:
    this.createIfIsNull_TempRequestStatus()
  }
  //serachtDeviceModByText: Method to be used with voice recognition:

  public serachtDeviceModByText(nameToSearch: string, modNameToSearch: string): {device:DeviceOneModel,module:ModuleOneModel} {
    let arrayRes1: Array<DeviceOneModel> = this.deviceList.filter((elem) => ObjectUtil.findWordOrPhrase(ObjectUtil.removeAccents(elem.DB.Name.toLowerCase()), ObjectUtil.removeAccents(nameToSearch.toLowerCase())) /*elem.DB.Name === nameToSearch*/)
    if (arrayRes1.length == 1){
      //ConsoleLogService.log("ModOneBackEndService","Element found: ");ConsoleLogService.log("ModOneBackEndService",arrayRes1[0])
      let arrayRes2: Array<ModuleOneModel> = arrayRes1[0].DB.ModuleList.filter((elem) => ObjectUtil.findWordOrPhrase(ObjectUtil.removeAccents(elem.Name.toLowerCase()), ObjectUtil.removeAccents(modNameToSearch.toLowerCase())) /*elem.Name === modNameToSearch*/)
      if (arrayRes2.length == 1){
        return {device:arrayRes1[0],module:arrayRes2[0]}
      }else{
        return {device:arrayRes1[0],module:null}
      }
    }
    else{
      return {device:null,module:null}
    }
  }

  public getDeviceList(_callBackOk : (res: Array<DeviceOneModel>) => any): void{
    //Now try restore the deviceList in teh localStorage:
    this.localStorage.isSet(this.deviceListLocalStorage,()=>{
      //If no data is available(null) so:
      this.localStorage.set(this.deviceListLocalStorage, this.deviceList)
      _callBackOk(this.deviceList)
    },()=>{
      //If data is available(not null) so:
      this.localStorage.get(this.deviceListLocalStorage,(ob)=>{
        this.deviceList=ob; /*ConsoleLogService.log("ModOneBackEndService","deviceList is: " + JSON.stringify(this.deviceList))*/
        _callBackOk(this.deviceList)
    }) });
  }

  public getListLength():number{return this.deviceList.length}

  //---------------------------------------- Local Commands -------------------------------------<<<

  public DevNetPutCmd(_email: string, _sessionID: string, _data: KeyValuePairModel[], _type: number, _callBackOk,_callBackNotOk,_callBackFail): void{
    let _ctrlData: KeyValuePairModel[]
    _ctrlData = [{key:"addType", value:1},{key:"email", value:_email},{key:"session", value:_sessionID}];
    _data = _data.concat(_ctrlData);

    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpDevNetPutCmd.php"+this.httpService.phpSerialize(_data), (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //this.getDeviceList(_email, _sessionID)
        _callBackOk(res)
      }
      else{
        _callBackNotOk(res)
      }
    }, (error)=>{_callBackFail(error)})
  }
}
