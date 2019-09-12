import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-service';
import { ConsoleLogService, ObjectUtil } from '../static-class/object-util';
import { ConfigService } from './config-service';
import { Events } from 'ionic-angular';
import { GetGeneralTbModOneAPIModel,GetDeviceTypeModOneAPIModel,GetIpModOneAPIModel,GetTimeModOneAPIModel,GetStatusModOneAPIModel,GetEventListModOneAPIModel,GetSTAConfigModOneAPIModel,GetAPConfigModOneAPIModel} from './modOne-api-service';
import { LoggerLogListModel} from './logger.service';
import { ModOneBackEndService, DeviceOneModel,ModuleOneModel } from './modOne-backEnd-service';

export enum SceneTriggerTypeEnun {
    NONE = 0,
    TimeDate = 1,
    TimeInterval = 2,
    DeviceObj = 3,
    LocalEvent = 5,
    NFCCardEvent = 4
}

export enum SceneActionTypeEnun {
    NONE = 0,
    DeviceObj = 1,
    SendNotification = 2,
}

export interface  SceneTriggerObjModel {
    TriggerType:  number, //SceneTriggerTypeEnun
    Time:         Date,
    Interval:     {min: number, sec: number},
    DeviceObj:    {DeviceName: string, EventCode: string},
    Local:        {Local: Array<string>, EventList: Array<any>};
    NFCCardEvent: any,
}

export interface  SceneActionObjModel {
    DeviceObj: {DeviceName: string, Event: any},
    SysObj: {SendNotification: any}, //SendNotification -> Cell Phone
}

//Scene is some things like wait a list of events and execute a lis of actions:
export interface  SceneModel {
    Name:             string;
    Status:           {StEnable: boolean};
    IsAlarm:          boolean,
    TriggerObjList:   Array<SceneTriggerObjModel>,
    ActionDelay:      {Min: Number, Sec: Number},
    ActionObjList:    Array<SceneActionObjModel>;
}

@Injectable()
export class AutomationService {

  constructor(public events: Events, public configService: ConfigService, public localStorage: LocalStorageService, public modOneBackEndService: ModOneBackEndService) {
    ConsoleLogService.log("ModOneAutomationService",'Hello ModOneAutomationService Provider');

    this.configService.getConfigObj((obj)=>{})
    this.events.subscribe("ConfigService:NewData",(obj)=>{})
    this.events.subscribe("LoggerService:NewData",(obj)=>{this.newLogArrived(obj)})

    this.restoreFromLocalSorage((data)=>{})
  }

  private newLogArrived(log: LoggerLogListModel){
    console.log("New Log Arrived: ",log)
  }

  private localStorageName: string = "AutomationService"
  private sceneList: Array<SceneModel> = []
  private emptySceneObj: SceneModel =
  {
    Name:"",
    Status:{StEnable:true},
    IsAlarm: true,
    TriggerObjList: [
      {
        TriggerType: SceneTriggerTypeEnun.NONE,
        Time: null,
        Interval: {min: 0, sec: 0},
        DeviceObj: {DeviceName: "", EventCode: ""},
        Local: {Local: [""], EventList: [""]},
        NFCCardEvent: null,
      }
      ],
      ActionDelay:{Min:0, Sec:0},
      ActionObjList:[
        {
          DeviceObj: {DeviceName: "", Event: ""},
          SysObj: {SendNotification: "any"}
        }
      ]
  }//JSON.parse(JSON.stringify());//Object.assign({},this.configServiceObj)
  //Get and set data:

  public getSceneList(_callGotData : (_data: Array<SceneModel>) => void) {this.restoreFromLocalSorage((obj)=>{_callGotData(obj)})}
  private setSceneList(obj: Array<SceneModel>): void{
    this.sceneList = obj; this.saveToLocalSorage(this.sceneList);
    this.events.publish("AutomationService:NewData",JSON.parse(JSON.stringify(this.sceneList)))
    //Exemplo de como seinscrever quando uma nova configuracao for salva:
    //this.events.subscribe("ConfigService:NewData",(obj)=>{console.log('New Data saved!!!: ' + obj)})
  }
  public addScene(scene: SceneModel): void{
    this.sceneList.push(scene)
    this.setSceneList(this.sceneList)
  }
  public deleteScene(index: number): void{
    if(index<0){return}
    this.sceneList.splice(index, 1)
    this.setSceneList(this.sceneList)
  }
  public editScene(index: number, scene: SceneModel): void{
    if(index<0){return}
    this.sceneList[index] = scene
    this.setSceneList(this.sceneList)
  }

  public addTrigger(sceneIndex: number, trigger: SceneTriggerObjModel): void{
    if(sceneIndex<0){return}
    this.sceneList[sceneIndex].TriggerObjList.push(trigger)
    this.setSceneList(this.sceneList)
  }
  public deleteTrigger(sceneIndex: number, triggerIndex: number): void{
    if(sceneIndex<0){return}
    this.sceneList[sceneIndex].TriggerObjList.splice(triggerIndex, 1)
    this.setSceneList(this.sceneList)
  }
  public editTrigger(sceneIndex: number, triggerIndex: number, trigger: SceneTriggerObjModel): void{
    if(sceneIndex<0 || triggerIndex<0){return}
    this.sceneList[sceneIndex].TriggerObjList[triggerIndex] = trigger
    this.setSceneList(this.sceneList)
  }

  //Get an empty object:

  public getEmptyScene(): SceneModel{
    return JSON.parse(JSON.stringify(this.emptySceneObj));//this.emptyConfigServiceObj
  }

  public restoreFromLocalSorage(_callBackOk : (_data: Array<SceneModel>) => void): void{
    this.localStorage.isSet(this.localStorageName,()=>{
      //If no data is available(null) so:
      let _data = [] //this.getEmptyScene()
      this.localStorage.set(this.localStorageName,_data)
      _callBackOk(this.sceneList)
    },()=>{
      //If data is available(not null) so:
      ConsoleLogService.log('AutomationService','Restored!')
      this.localStorage.get(this.localStorageName,(obj)=>{this.sceneList=obj; _callBackOk(obj)})
    });
  }

  private saveToLocalSorage(obj: Array<SceneModel>): void{
    this.localStorage.set(this.localStorageName,obj)
  }
}
