import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Events, ModalController, NavParams, ViewController, Platform } from 'ionic-angular';
import { ModOneBackEndService, DeviceOneModel } from '../../providers/modOne-backEnd-service';

import { CentralLoggerService, CentralLoggerLogListModel} from '../../providers/central.logger.service';
import { AutomationService, SceneModel, SceneTriggerObjModel, SceneActionObjModel, SceneTriggerTypeEnun, SceneActionTypeEnun} from '../../providers/automation-service';
import { AlertService } from '../../providers/alert-service'

@Component({
  selector: 'page-automation',
  templateUrl: 'automation.html'
})
export class AutomationPage {

  private sceneList: Array<SceneModel> = [];
  private alarmList: Array<SceneModel> = [];
  private deviceList: Array<DeviceOneModel> = []

  constructor(private alertService: AlertService, private automationService: AutomationService, private modOneBackEndService: ModOneBackEndService, public modalCtrl: ModalController, public events: Events,public navCtrl: NavController) {
    this.events.subscribe("AutomationService:NewData",(list)=>{
      this.sceneList = list.filter((elem)=>{ return elem.IsAlarm === false });
      this.alarmList = list.filter((elem)=>{ return elem.IsAlarm === true });
      console.log(this.sceneList, this.alarmList)
    });
    this.events.subscribe("ModOneBackEndService:NewData",(obj)=>{this.deviceList = obj});


    this.automationService.getSceneList((list)=>{
      this.sceneList = list.filter((elem)=>{ return elem.IsAlarm === false });
      this.alarmList = list.filter((elem)=>{ return elem.IsAlarm === true });
      console.log(this.sceneList, this.alarmList)
    });
    this.modOneBackEndService.getDeviceList((list)=>{this.deviceList = list});
  }

  ionViewDidLoad() {
    console.log('Hello automationPage Page');
  }

  private openModal(_element, mode, index) {
    let modal = this.modalCtrl.create(AutomationModalPage, {element: _element, createMode: mode, index: index});
    modal.present();
  }

  private addScene(){
    let scene: SceneModel = this.automationService.getEmptyScene()
    scene.TriggerObjList = [];scene.ActionObjList = [];
    //this.automationService.addScene(scene)
    this.openModal(scene, true, -1)
  }
  private editScene(scene: SceneModel, index: number){
    //this.automationService.editScene(index, scene)
    this.openModal(scene, false, index)
  }
  private deleteScene(index: number){
    this.alertService.showOkCancel("Atenção!","Deseja mesmo apagar essa cena?","ok","Cancelar",()=>{this.automationService.deleteScene(index)},()=>{})
  }
  private playScene(index: number){
    //this.automationService.play(index)
    this.alertService.showOk("Executado","Cena executada!","ok",()=>{})
  }
}

@Component({
  selector: 'page-automation-modal',
  templateUrl: 'automation-modal.html'
})
export class AutomationModalPage{
  constructor(private modOneBackEndService: ModOneBackEndService, public events: Events, private centralLoggerService: CentralLoggerService, private automationService: AutomationService, public params: NavParams, public viewCtrl: ViewController){
    this.element = this.params.get('element');
    this.createMode = this.params.get('createMode');
    this.sceneIndex = this.params.get('index');

    console.log(this.element)
    // this.element.TriggerObjList[0].DeviceObj.DeviceName
    // this.trigger.DeviceObj.DeviceName
    // this.devOnelogList[0].description

    this.events.subscribe("AutomationService:NewData",(list)=>{
      let res: Array<SceneModel> = list.filter((elem: SceneModel, index: number, arr:Array<any>)=>{ return index === this.sceneIndex });
      if(res[0]){
        this.element = res[0];
      }
    });
    //DeviceOneModel
    this.modOneBackEndService.getDeviceList((list)=>{list.filter((elem)=>{this.deviceNameList.push(elem.DB.Name)})});
  }
  private element: SceneModel;
  private createMode: boolean;
  private sceneIndex: number;
  private devOnelogList: Array<CentralLoggerLogListModel> = this.centralLoggerService.getReadableLogList().filter((elem)=>{return elem.from === "DeviceOne"});
  private trigger: SceneTriggerObjModel = this.automationService.getEmptyScene().TriggerObjList[0];
  private triggerTypes: {DeviceObj : number, LocalEvent : number, NFCCardEvent : number, NONE : number, TimeDate : number, TimeInterval : number} = {DeviceObj : SceneTriggerTypeEnun.DeviceObj, LocalEvent : SceneTriggerTypeEnun.LocalEvent, NFCCardEvent : SceneTriggerTypeEnun.NFCCardEvent, NONE : SceneTriggerTypeEnun.NONE, TimeDate : SceneTriggerTypeEnun.TimeDate, TimeInterval : SceneTriggerTypeEnun.TimeInterval}
  private triggerType: number = 0;
  private action: SceneActionObjModel = this.automationService.getEmptyScene().ActionObjList[0];
  private deviceNameList: Array<string> = [];

  public dismiss() {
    this.viewCtrl.dismiss();
  }

  private addScene(){
    this.automationService.addScene(this.element)
    this.dismiss()
  }

  private editScene(){
    this.automationService.editScene(this.sceneIndex, this.element)
    this.dismiss()
  }

  private addTrigger(){
    this.automationService.addTrigger(this.sceneIndex, JSON.parse(JSON.stringify(this.trigger)))
  }
  private deleteTrigger(index: number){
    this.automationService.deleteTrigger(this.sceneIndex, index)
  }


  private getLogDescriptionByCode(code: string){
    let ret = this.centralLoggerService.getReadableLogList().filter((elem)=>{return (elem.from === "DeviceOne" && elem.code == code)});
    return (ret[0] != null)? ret[0].description: "Nenhum"
  }
}
