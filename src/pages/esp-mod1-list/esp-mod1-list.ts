//---------------------------------------------------------------------------------------------
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { AddDevicePage } from '../add-device/add-device'
//import { DeviceOneModel } from '../../model/modOne-model';
//Pages:
//import { FindEspPage } from '../find-esp/find-esp'
import { EspMod1DetailPage } from '../esp-mod1-detail/esp-mod1-detail';
import { UserService } from '../../providers/user-service';
import { AlertService } from '../../providers/alert-service'
//From device:
//import { EspGeneralService } from '../../providers/esp-general-service';
import { ModOneApiService } from '../../providers/modOne-api-service';
//From Data Base:
//import { DeviceDetailMod1Service } from '../../providers/device-detail-mod1-service';
//From data base - Commun:
//import { DeviceService } from '../../providers/device-service';
import { ModOneBackEndService, DeviceOneModel } from '../../providers/modOne-backEnd-service';
//Utils:
import { ObjectUtil, ConsoleLogService } from '../../static-class/object-util';

import { BackgroundMode } from '@ionic-native/background-mode';

@Component({
  selector: 'page-esp-mod1-list',
  templateUrl: 'esp-mod1-list.html'
})
export class EspMod1ListPage {
  private gotList: boolean = false;
  private deviceList: Array<DeviceOneModel>// = []
  private detailPageMode: number = 0
  private pageMode: string = "ModuleListPage"//"AllPages";
  //private roomSelected: string = "Desconhecido"
  private roomSelected: {Name: string, Type: string} = {Name: "Desconhecido", Type: "Nenhum"}
  private roomTypeSelected: string = "";
  private roomNameSelected: string = "";
  //private roomTypeSelected: string = "Sala"
  private newRoomName: string = ""
  private newRoomTypeName: string = ""
  private showRoomScreen: string = "room_name"
  private roomTypeList: Array<string> = [
    "Nenhum",
    "Sala",
    "Quarto",
    "Cozinha",
    "Lavanderia",
    "Corredor",
    "Garagem",
    "Jardim",
    "Sacada",
    "Banheiro",
    "Lavabo",
    "Fundos",
    "Frente",
    "Porão",
    "Externo",
    "Interno"
  ];
  //private myRoomTypeList: Array<string> = [];
  constructor(private backgroundMode: BackgroundMode,public alertService: AlertService, public events: Events, public modalCtrl: ModalController, private userServ: UserService, public navCtrl: NavController,public params:NavParams, private modOneBackEndService: ModOneBackEndService, private modOneApiService: ModOneApiService) {
    this.initData();


    // events.subscribe('EspMod1DetailPage:newOffLineData', (item) => {
    //   ConsoleLogService.log("EspMod1ListPage","subscribed for: EspMod1DetailPage:newOffLineData")
    //   this.getOffLineList()//this.modOneBackEndService.getDeviceList((list)=>{})
    // });
    // events.subscribe('EspMod1DetailPage:newOnLineData', (item) => {
    //   ConsoleLogService.log("EspMod1ListPage","subscribed for: EspMod1DetailPage:newOnLineData")
    //   this.getOnLineList()
    // });
    events.subscribe('HomePage:ChangeMode', (item) => {
      ConsoleLogService.log("EspMod1ListPage","Subscribed for: HomePage:ChangeMode. Item: " + item)
      this.pageMode = item;
    });

    this.events.subscribe("ModOneBackEndService:NewData",(obj)=>{this.deviceList=obj})
  }

  ionViewDidLoad() {
    ConsoleLogService.log("EspMod1ListPage",'Hello ModuleListPage Page');
    this.backgroundMode.overrideBackButton();
  }
  private getRoomTypeUsedList(){
    let list: Array<string> = []
    for (let entry of this.roomTypeList) {
      if(this.userServ.user.RoomList.some(elem => elem.Type === entry)){
        list.push(entry)
      }
    }
    return list;
  }
  private filterRoomAndTypeForUser(_room, _type){
    return this.userServ.user.RoomList.some(elem => elem.Name === _room && elem.Type === _type)
  }
  public editRoom(){
    this.userServ.editUserRoom_DB(this.userServ.user.email, this.userServ.user.SessionID, this.newRoomName, this.roomSelected.Name, this.newRoomTypeName,(res)=>{
      this.userServ.getUserRoomList_DB(this.userServ.user.email, this.userServ.user.SessionID,(res)=>{},(res)=>{},(err)=>{})
    },(res)=>{},(err)=>{})
    this.newRoomName = ""
    this.newRoomTypeName = ""
  }
  public deleteRoom(){
    this.userServ.deleteUserRoom_DB(this.userServ.user.email, this.userServ.user.SessionID,this.roomSelected.Name,(res)=>{
      this.userServ.getUserRoomList_DB(this.userServ.user.email, this.userServ.user.SessionID,(res)=>{},(res)=>{},(err)=>{})
    },(res)=>{},(err)=>{})
  }
  public newRoom(){
    this.alertService.showOkCancelWith1Input("Novo Local", "Digite um nome válido e único e então confirme!", "Nome", "Confirmar", "C", (name)=>{
      this.userServ.newUserRoom_DB(this.userServ.user.email, this.userServ.user.SessionID,name,"Sala",(res)=>{
        this.alertService.showOk("Aviso!","Criado com sucesso!","ok",()=>{})
        this.userServ.getUserRoomList_DB(this.userServ.user.email, this.userServ.user.SessionID,(res)=>{},(res)=>{},(err)=>{})
      },(res)=>{this.alertService.showOk("Erro!","Problemas na adição do Local. Verifique o nome e tente novamente!","ok",()=>{})},(err)=>{this.alertService.showOk("Erro!","Problemas na adição do Local. Verifique o nome e tente novamente!","ok",()=>{})})
    })
  }
  public initData(){
    this.modOneBackEndService.getDeviceList((list)=>{
      ConsoleLogService.log("EspMod1ListPage","XXX!")
      this.deviceList = list
      this.gotList = true


      //this.modOneApiService.Connect()
      //Connect:
      // for (let i in this.deviceList){
      //   this.modOneApiService.MQTTConnect(this.deviceList[i].DB.Number)
      // }
      //this.modOneApiService.getStatusPeriodic(5000,(lst)=>{this.deviceList = lst})

        // for (let i in this.deviceList){
        //   this.deviceList[i].temp.lastModRequest[0] = -1;this.deviceList[i].temp.lastModRequest[1] = -1;
        //   this.deviceList[i].temp.lastModRequest[2] = -1;this.deviceList[i].temp.lastModRequest[3] = -1;this.deviceList[i].temp.lastModRequest[4] = -1;
        //   this.modOneApiService.GetStatus(this.deviceList[i].DB.Number,this.deviceList[i].Local.ip.sta_ip, (res)=>{
        //     this.deviceList[i].temp.lastModRequest[0] = 1;this.deviceList[i].temp.lastModRequest[1] = 1;
        //     this.deviceList[i].temp.lastModRequest[2] = 1;this.deviceList[i].temp.lastModRequest[3] = 1;this.deviceList[i].temp.lastModRequest[4] = 1;
        //     this.deviceList[i].Local.Status = res
        //     this.deviceList[i].Local.ip.sta_ip = res.ip
        //     this.modOneBackEndService.saveOffLine(this.deviceList[i])
        //   }, (err)=>{
        //     this.deviceList[i].temp.lastModRequest[0] = -2;this.deviceList[i].temp.lastModRequest[1] = -2;
        //     this.deviceList[i].temp.lastModRequest[2] = -2;this.deviceList[i].temp.lastModRequest[3] = -2;this.deviceList[i].temp.lastModRequest[4] = -2;
        //   })
        // }

    })
  }
  public getOnLineList(){
    this.modOneBackEndService.getDeviceList_DB(false, this.userServ.user.email, this.userServ.user.SessionID, (list)=>{/*this.deviceList = list*/}, (res)=>{}, (err)=>{})
  }
  public getOffLineList(){
    this.modOneBackEndService.getDeviceList((list)=>{/*this.deviceList = list*/})
  }
  private openDevice(_device: any, detailPageMode: number, _title: string){//Open the selected device modal:
    this.detailPageMode = detailPageMode
    let modal = this.modalCtrl.create(EspMod1DetailPage, {device: _device, detailPageMode: this.detailPageMode, title: _title});
    modal.present();
    //this.events.publish('HomePage:push', EspMod1DetailPage, {device: _device});
  }
  private shareDevice(_device: any, detailPageMode: number, _title: string){//Open the selected device modal:
    this.detailPageMode = detailPageMode
    let modal = this.modalCtrl.create(EspMod1DetailPage, {device: _device, detailPageMode: this.detailPageMode, title: _title});
    modal.present();
    //this.events.publish('HomePage:push', EspMod1DetailPage, {device: _device});
  }
  private executeDeviceAction(_device: DeviceOneModel, _modIndex){
    this.modOneApiService.toggleCommand(_device,_modIndex)
  }
  private setRGB(_device: DeviceOneModel, _modIndex){
    this.modOneApiService.setRGB(_device,_modIndex)
  }
  private getDeviceStatus(_number: any, _moduleIndex){
    let _selected = this.modOneBackEndService.getDeviceByNumber(_number)
    if(_selected){
      this.modOneApiService.GetStatus(_selected.DB.Number, (res)=>{

      }, (err)=>{

      })
    }
  }
  private details(_device: DeviceOneModel){
    let stg: string = _device.DB.Name + "<br>" + _device.DB.Number
    this.alertService.showOk("Detalhes",stg,"ok",()=>{})
  }
  private deleteDevice(device: DeviceOneModel){
    // this.alertService.showOkCancel("Atenção!","Realmente deseja apagar o dispositivo de sua lista?","Confirmar","Cancelar",()=>{
    //   this.modOneBackEndService.deleteDevice_DB(this.userServ.user.email,this.userServ.user.SessionID,device.DB.Number,
    //     (res)=>{
    //       this.getOnLineList()
    //     }, (res)=>{}, (err)=>{})
    // },()=>{})
    this.alertService.showOkCancel("Deletar Dispositivo","Deseja mesmo apagar esse dispositivo de sua lista?","Sim","Cancelar",()=>{
      this.modOneBackEndService.unShareDevice_DB(this.userServ.user.email,this.userServ.user.email,device.DB.Number,this.userServ.user.SessionID,(res)=>{
        this.getOnLineList()
        this.alertService.showOk("Sucesso!","Dispositivo apagado com sucesso!","Ok",()=>{})
      },(res)=>{this.alertService.showOk("Erro!","Erro ao apagar dipositivo.","Ok",()=>{})})
  },()=>{})
  }
  test(txt1,txt2){
    // if(this.modOneApiService.searchTextCommand(txt1,txt2)){
    //   this.modOneApiService.confirmTextCommandMsg()
    //   this.modOneApiService.doTextCommand("ok "+txt2,txt2,true,(txt)=>{console.log(txt)});
    // }
    //this.modOneApiService.Connect("")
  }
  refresh(){
    //console.log("!2!")
    this.getOnLineList()
    this.userServ.getUserRoomList_DB(this.userServ.user.email, this.userServ.user.SessionID,(res)=>{},(res)=>{},(err)=>{})
  }
  private addDevice(){
    console.log("Add Page!")
    this.navCtrl.push(AddDevicePage)
  }
}
