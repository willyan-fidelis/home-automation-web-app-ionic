import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { NavController,NavParams, ViewController, Platform, Events } from 'ionic-angular';
import { DatePickerComponent, DateDatePickerModel } from '../../components/date-picker/date-picker'
//import { DeviceOneModel } from '../../model/modOne-model';
//import { ModuleOneModel } from '../../model/device-module-model';
//From device:
//import { EspGeneralService } from '../../providers/esp-general-service';
import { ModOneApiService } from '../../providers/modOne-api-service';
import { AlertService } from '../../providers/alert-service';

import { ModOneBackEndService, DeviceOneModel, ModuleOneModel } from '../../providers/modOne-backEnd-service';
import { ObjectUtil } from '../../utils/object-util';
import { UserService } from '../../providers/user-service';
import { ConsoleLogService } from '../../static-class/object-util';
import { ConfigService, ConfigServiceModel, ConfigServiceMQTTParModel, DeviceComunEnun, ConfigServiceAppComParModel} from '../../providers/config-service';

@Component({
  selector: 'page-esp-mod1-detail',
  templateUrl: 'esp-mod1-detail.html'
})
export class EspMod1DetailPage {
  brightness = 50;
  sensor = true
  myDate: any = {weekDay: "2", day: "2016-01-01", time: "05:10:10"}

  device: any;
  pageMode: number = 0;
  pageTitle: string = "Detalhes"
  constructor(public events: Events,public platform: Platform,public params: NavParams,public viewCtrl: ViewController){
      this.device = this.params.get('device')
      this.pageMode = this.params.get('detailPageMode')
      this.pageTitle = this.params.get('title')
    }
  ionViewDidLoad() {
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspMod1DetailPage Page');
    this.device = this.params.get('device')
    ConsoleLogService.log("EspMod1DetailPage","Te Device passed is: "+this.device)
  }
  private dismiss() {
    this.viewCtrl.dismiss();
  }
  private timeChanged(){
    ConsoleLogService.log("EspMod1DetailPage","New Time is: " + this.myDate)
  }
  private newOffLineData(ev){
    this.events.publish('EspMod1DetailPage:newOffLineData', ev);
    //ConsoleLogService.log("EspMod1DetailPage","changed")
  }
  private newOnLineData(ev){
    this.events.publish('EspMod1DetailPage:newOnLineData', ev);
    //ConsoleLogService.log("EspMod1DetailPage","changed")
  }
}

@Component({
  selector: 'page-esp-commands',
  templateUrl: 'esp-commands.html'
})
export class EspCommandsPage {
  //------------------------
  @Input() public item: DeviceOneModel = this.modOneBackEndService.getEmptyDevice();
  @Output() onNewOffLineData = new EventEmitter<any>();
  //Show options:
  @Input() public showMainCmds: boolean = false;
  @Input() public showRGBCmds: boolean = false;
  @Input() public showStatus: boolean = false;

  constructor(public events: Events, public modOneBackEndService: ModOneBackEndService, public modOneApiService: ModOneApiService){
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspTimeEventsPage Page');

    this.events.subscribe("ModOneBackEndService:NewData",(obj)=>{this.item=this.modOneBackEndService.getDeviceByName(this.item.DB.Name)})

    // this.item.DB.ModuleList[0] = this.modOneBackEndService.getEmptyModule()
    // this.item.DB.ModuleList[1] = this.modOneBackEndService.getEmptyModule()
    // this.item.DB.ModuleList[2] = this.modOneBackEndService.getEmptyModule()
    // this.item.DB.ModuleList[3] = this.modOneBackEndService.getEmptyModule()
    // this.item.DB.ModuleList[4] = this.modOneBackEndService.getEmptyModule()
  }
  //This methodo(ngOnChanges) is called always that one @input changes. When this class is called the '@Input' doens't cames refresed, so we must call 'ngOnChanges' to ensure that the @input will be read correctly:
  ngOnChanges(changes: {[propKey: string]: SimpleChange}){ //ngOnChanges -> READ @input methodo!
    //ConsoleLogService.log("EspMod1DetailPage",'EspClockPage was changed!!!:',this.item);

    this.refreshData()
  }
  private toBool(number: number){
    if(number === 1){
      //ConsoleLogService.log("EspMod1DetailPage","Turned-on")
      return true
    }
    else{
      //ConsoleLogService.log("EspMod1DetailPage","Turned-off")
      return false
    }
  }
  private refreshData(){
    //Get data from device:
    this.item.temp.lastModRequest[0] = -1;this.item.temp.lastModRequest[1] = -1;
    this.modOneApiService.GetStatus(this.item.DB.Number,(res)=>{
      this.item.temp.lastModRequest[0] = 1;this.item.temp.lastModRequest[1] = 1;
      this.modOneApiService.ignoreNextRequest(1500)
      //Refresh screen data:
      //this.data = {pe:[{cmd:{m0:res.pe.i1.cmd.m0,m1:res.pe.i1.cmd.m1},prd:res.pe.i1.prd,dy_sec:res.pe.i1.dy_sec,enb:res.pe.i1.enb},{cmd:{m0:res.pe.i2.cmd.m0,m1:res.pe.i2.cmd.m1},prd:res.pe.i2.prd,dy_sec:res.pe.i2.dy_sec,enb:res.pe.i2.enb}],prd:[{m1:res.prd.i1.m1,h1:res.prd.i1.h1,m2:res.prd.i1.m1,h2:res.prd.i1.h2},{m1:res.prd.i2.m1,h1:res.prd.i2.h1,m2:res.prd.i2.m2,h2:res.prd.i2.h2}]}
      //this.data = {rgb:[0,0,0],InputM0:0,InputM1:0,Sensor:0,Light:0,out:{M1:false,M0:false}}
      this.item.Local.Status = res
      this.item.Local.Status.rgb[0] = ObjectUtil.map(this.item.Local.Status.rgb[0],0,1023,0,100)
      this.item.Local.Status.rgb[1] = ObjectUtil.map(this.item.Local.Status.rgb[1],0,1023,0,100)
      this.item.Local.Status.rgb[2] = ObjectUtil.map(this.item.Local.Status.rgb[2],0,1023,0,100)

      //this.item.Local.Status = this.data
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{this.item.temp.lastModRequest[0] = 2;this.item.temp.lastModRequest[1] = 2;})
  }
  private cmdReset(){
    this.modOneApiService.cmdReset(this.item.DB.Number,(res)=>{},(err)=>{})
  }
  private cmdFind(){
    this.modOneApiService.findOutDevs(this.item)
  }
  private turn(cmd:number, index:number){
    // let x = 50
    // ConsoleLogService.log("EspMod1DetailPage","Objct util is: ", ObjectUtil.map(x,0,100,0,1023))
    //ConsoleLogService.log("EspMod1DetailPage","GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG: ",cmd)//typeof cmd
    let cmd0 = 0
    let cmd1 = 0
    if(index == 0){
      cmd0 = cmd
    }
    if(index == 1){
      cmd1 = cmd
    }
    this.item.temp.lastModRequest[index] = -1;
    this.modOneApiService.cmdTurn(this.item.DB.Number, cmd0, cmd1, (res)=>{
      this.item.temp.lastModRequest[index] = 1;
      this.item.Local.Status = res
      this.item.Local.Status.rgb[0] = ObjectUtil.map(this.item.Local.Status.rgb[0],0,1023,0,100)
      this.item.Local.Status.rgb[1] = ObjectUtil.map(this.item.Local.Status.rgb[1],0,1023,0,100)
      this.item.Local.Status.rgb[2] = ObjectUtil.map(this.item.Local.Status.rgb[2],0,1023,0,100)

      //this.item.Local.Status = this.data
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")
    }, (err)=>{this.item.temp.lastModRequest[index] = 2;})
  }
  private setRGB(index:number, value:number){
    this.modOneApiService.cmdSetRGB(this.item.DB.Number,this.item.Local.ip.sta_ip, index, ObjectUtil.map(value,0,100,0,1023), (res)=>{
      this.item.Local.Status = res
      //this.item.Local.Status = this.data
      this.item.Local.Status.rgb[0] = ObjectUtil.map(this.item.Local.Status.rgb[0],0,1023,0,100)
      this.item.Local.Status.rgb[1] = ObjectUtil.map(this.item.Local.Status.rgb[1],0,1023,0,100)
      this.item.Local.Status.rgb[2] = ObjectUtil.map(this.item.Local.Status.rgb[2],0,1023,0,100)
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")
    }, (err)=>{})
  }
}

@Component({
  selector: 'page-esp-time-events',
  templateUrl: 'esp-time-events.html'
})
export class EspTimeEventsPage {
  modNames: Array<string> = ["Saida 1", "Saida 2"]
  delayArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  date: Array<{weekDay:any, day: {day:number,month:number,year:number}, time: {hour:number, minute:number, second:number}}> = [{weekDay:[true,false,false,false,false,false,false], day: {day:0,month:0,year:0}, time: {hour:5, minute:45, second:0}},{weekDay:[false,true,true,false,false,false,false], day: {day:0,month:0,year:0}, time: {hour:5, minute:45, second:0}}]
  //date2: Array<{weekDay:number, day: {day:number,month:number,year:number}, time: {hour:number, minute:number, second:number}}> = [{weekDay:0, day: {day:0,month:0,year:0}, time: {hour:5, minute:45, second:0}},{weekDay:0, day: {day:0,month:0,year:0}, time: {hour:5, minute:45, second:0}}]
  //------------------------
  @Input() public item: DeviceOneModel;
  @Output() onNewOffLineData = new EventEmitter<any>();
  data: {te:Array<{cmd:{m1:number,m0:number},h:number,m:number,enb:boolean, wk_days:{i1:boolean,i2:boolean,i3:boolean,i4:boolean,i5:boolean,i6:boolean,i7:boolean}}>} = {te:[{cmd:{m1:1,m0:1},h:3,m:0,enb:true, wk_days:{i1:false,i2:false,i3:false,i4:false,i5:false,i6:false,i7:false}},{cmd:{m1:1,m0:1},h:3,m:0,enb:true, wk_days:{i1:false,i2:false,i3:false,i4:false,i5:false,i6:false,i7:false}}]}

  constructor(public modOneBackEndService: ModOneBackEndService, public modOneApiService: ModOneApiService){
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspTimeEventsPage Page');
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}){ //ngOnChanges -> READ @input methodo!
    //This methodo(ngOnChanges) is called always that one @input changes. When this class is called the '@Input' doens't cames refresed, so we must call 'ngOnChanges' to ensure that the @input will be read correctly:
    //Fisrt of all put the saved data on the screen:
    this.data.te[0] = this.item.Local.EventList.te.i1
    this.data.te[1] = this.item.Local.EventList.te.i2

    this.date[0].time.hour = this.data.te[0].h
    this.date[0].time.minute = this.data.te[0].m
    this.date[1].time.hour = this.data.te[1].h
    this.date[1].time.minute = this.data.te[1].m

    this.date[0].weekDay[0] = this.data.te[0].wk_days.i1
    this.date[0].weekDay[1] = this.data.te[0].wk_days.i2
    this.date[0].weekDay[2] = this.data.te[0].wk_days.i3
    this.date[0].weekDay[3] = this.data.te[0].wk_days.i4
    this.date[0].weekDay[4] = this.data.te[0].wk_days.i5
    this.date[0].weekDay[5] = this.data.te[0].wk_days.i6
    this.date[0].weekDay[6] = this.data.te[0].wk_days.i7

    this.date[1].weekDay[0] = this.data.te[1].wk_days.i1
    this.date[1].weekDay[1] = this.data.te[1].wk_days.i2
    this.date[1].weekDay[2] = this.data.te[1].wk_days.i3
    this.date[1].weekDay[3] = this.data.te[1].wk_days.i4
    this.date[1].weekDay[4] = this.data.te[1].wk_days.i5
    this.date[1].weekDay[5] = this.data.te[1].wk_days.i6
    this.date[1].weekDay[6] = this.data.te[1].wk_days.i7

    //this.date2[0].time.hour = this.data.te[0].h
    //this.date2[0].time.minute = this.data.te[0].m
    //this.date2[1].time.hour = this.data.te[1].h
    //this.date2[1].time.minute = this.data.te[1].m

    this.modNames[0] = this.item.DB.ModuleList[0].Name
    this.modNames[1] = this.item.DB.ModuleList[1].Name
    //Now check on device if data was changed:
    this.refreshData()
  }
  private refreshData(){
    //Get data from device:
    this.modOneApiService.GetEventList(this.item.DB.Number,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      //Refresh screen data:
      //this.data = {pe:[{cmd:{m0:res.pe.i1.cmd.m0,m1:res.pe.i1.cmd.m1},prd:res.pe.i1.prd,dy_sec:res.pe.i1.dy_sec,enb:res.pe.i1.enb},{cmd:{m0:res.pe.i2.cmd.m0,m1:res.pe.i2.cmd.m1},prd:res.pe.i2.prd,dy_sec:res.pe.i2.dy_sec,enb:res.pe.i2.enb}],prd:[{m1:res.prd.i1.m1,h1:res.prd.i1.h1,m2:res.prd.i1.m1,h2:res.prd.i1.h2},{m1:res.prd.i2.m1,h1:res.prd.i2.h1,m2:res.prd.i2.m2,h2:res.prd.i2.h2}]}
      this.data = {
        te:[
          {cmd:{m1:res.te.i1.cmd.m1,m0:res.te.i1.cmd.m0},h:res.te.i1.h,m:res.te.i1.m,enb:res.te.i1.enb, wk_days:{i1:res.te.i1.wk_days.i1,i2:res.te.i1.wk_days.i2,i3:res.te.i1.wk_days.i3,i4:res.te.i1.wk_days.i4,i5:res.te.i1.wk_days.i5,i6:res.te.i1.wk_days.i6,i7:res.te.i1.wk_days.i7}},
          {cmd:{m1:res.te.i2.cmd.m1,m0:res.te.i2.cmd.m0},h:res.te.i2.h,m:res.te.i2.m,enb:res.te.i2.enb, wk_days:{i1:res.te.i2.wk_days.i1,i2:res.te.i2.wk_days.i2,i3:res.te.i2.wk_days.i3,i4:res.te.i2.wk_days.i4,i5:res.te.i2.wk_days.i5,i6:res.te.i2.wk_days.i6,i7:res.te.i2.wk_days.i7}}
        ]}
      this.date[0].time.hour = this.data.te[0].h
      this.date[0].time.minute = this.data.te[0].m
      this.date[1].time.hour = this.data.te[1].h
      this.date[1].time.minute = this.data.te[1].m

      this.date[0].weekDay[0] = this.data.te[0].wk_days.i1
      this.date[0].weekDay[1] = this.data.te[0].wk_days.i2
      this.date[0].weekDay[2] = this.data.te[0].wk_days.i3
      this.date[0].weekDay[3] = this.data.te[0].wk_days.i4
      this.date[0].weekDay[4] = this.data.te[0].wk_days.i5
      this.date[0].weekDay[5] = this.data.te[0].wk_days.i6
      this.date[0].weekDay[6] = this.data.te[0].wk_days.i7

      this.date[1].weekDay[0] = this.data.te[1].wk_days.i1
      this.date[1].weekDay[1] = this.data.te[1].wk_days.i2
      this.date[1].weekDay[2] = this.data.te[1].wk_days.i3
      this.date[1].weekDay[3] = this.data.te[1].wk_days.i4
      this.date[1].weekDay[4] = this.data.te[1].wk_days.i5
      this.date[1].weekDay[5] = this.data.te[1].wk_days.i6
      this.date[1].weekDay[6] = this.data.te[1].wk_days.i7

      this.item.Local.EventList.te.i1 = this.data.te[0]
      this.item.Local.EventList.te.i2 = this.data.te[1]
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
  private timeChanged(ev, index){
    //ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): ",ev)
    this.data.te[index].h = ev.time.hour
    this.data.te[index].m = ev.time.minute

    this.data.te[index].wk_days.i1 = ev.weekDay[0]
    this.data.te[index].wk_days.i2 = ev.weekDay[1]
    this.data.te[index].wk_days.i3 = ev.weekDay[2]
    this.data.te[index].wk_days.i4 = ev.weekDay[3]
    this.data.te[index].wk_days.i5 = ev.weekDay[4]
    this.data.te[index].wk_days.i6 = ev.weekDay[5]
    this.data.te[index].wk_days.i7 = ev.weekDay[6]
    ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): "+this.data)
  }
  private teChanged(index){
    this.modOneApiService.EditEventTE(this.item.DB.Number,index+1,this.data.te[index].enb,this.data.te[index].h,this.data.te[index].m,this.data.te[index].cmd.m0,this.data.te[index].cmd.m1,[this.data.te[index].wk_days.i1,this.data.te[index].wk_days.i2,this.data.te[index].wk_days.i3,this.data.te[index].wk_days.i4,this.data.te[index].wk_days.i5,this.data.te[index].wk_days.i6,this.data.te[index].wk_days.i7],(res)=>{
      //Get only the data changed:
      let espIndex = index+1//["i"+espIndex.toString()]
      this.item.Local.EventList.te["i"+espIndex.toString()] = this.data.te[index]
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")//this.item
      //ConsoleLogService.log("EspMod1DetailPage","Saved: ",ev.weekDay)
    },(err)=>{})
    this.modOneApiService.ignoreNextRequest(1500)
  }
}

@Component({
  selector: 'page-esp-presence-events',
  templateUrl: 'esp-presence-events.html'
})
export class EspPresenceEventsPage {
  modNames: Array<string> = ["Saida 1", "Saida 2"]
  delayArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  date: Array<{weekDay:number, day: {day:number,month:number,year:number}, time: {hour:number, minute:number, second:number}}> = [{weekDay:0, day: {day:0,month:0,year:0}, time: {hour:5, minute:45, second:0}},{weekDay:0, day: {day:0,month:0,year:0}, time: {hour:5, minute:45, second:0}}]
  date2: Array<{weekDay:number, day: {day:number,month:number,year:number}, time: {hour:number, minute:number, second:number}}> = [{weekDay:0, day: {day:0,month:0,year:0}, time: {hour:5, minute:45, second:0}},{weekDay:0, day: {day:0,month:0,year:0}, time: {hour:5, minute:45, second:0}}]
  //------------------------
  @Input() public item: DeviceOneModel;
  @Output() onNewOffLineData = new EventEmitter<any>();
  data: {pe:Array<{cmd:{m0:number,m1:number},prd:number,dy_sec:number,enb:boolean}>,prd:Array<{m1:number,h1:number,m2:number,h2:number}>} = {pe:[{cmd:{m0:0,m1:1},prd:1,dy_sec:10,enb:true},{cmd:{m0:2,m1:3},prd:2,dy_sec:5,enb:false}],prd:[{m1:6,h1:30,m2:6,h2:30},{m1:19,h1:45,m2:19,h2:45}]}

  constructor(public modOneBackEndService: ModOneBackEndService, public modOneApiService: ModOneApiService){
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspPresenceEventsPage Page');
  }
  //This methodo(ngOnChanges) is called always that one @input changes. When this class is called the '@Input' doens't cames refresed, so we must call 'ngOnChanges' to ensure that the @input will be read correctly:
  ngOnChanges(changes: {[propKey: string]: SimpleChange}){ //ngOnChanges -> READ @input methodo!
    //Fisrt of all put the saved data on the screen:
    this.data.pe[0] = this.item.Local.EventList.pe.i1
    this.data.pe[1] = this.item.Local.EventList.pe.i2
    this.data.prd[0] = this.item.Local.EventList.prd.i1
    this.data.prd[1] = this.item.Local.EventList.prd.i2
    this.date[0].time.hour = this.data.prd[0].h1
    this.date[0].time.minute = this.data.prd[0].m1
    this.date[1].time.hour = this.data.prd[1].h1
    this.date[1].time.minute = this.data.prd[1].m1
    this.date2[0].time.hour = this.data.prd[0].h2
    this.date2[0].time.minute = this.data.prd[0].m2
    this.date2[1].time.hour = this.data.prd[1].h2
    this.date2[1].time.minute = this.data.prd[1].m2

    this.modNames[0] = this.item.DB.ModuleList[0].Name
    this.modNames[1] = this.item.DB.ModuleList[1].Name
    //Now check on device if data was changed:
    this.refreshData()
  }
  private refreshData(){
    //Get data from device:
    this.modOneApiService.GetEventList(this.item.DB.Number,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      //Refresh screen data:
      this.data = {pe:[{cmd:{m0:res.pe.i1.cmd.m0,m1:res.pe.i1.cmd.m1},prd:res.pe.i1.prd,dy_sec:res.pe.i1.dy_sec,enb:res.pe.i1.enb},{cmd:{m0:res.pe.i2.cmd.m0,m1:res.pe.i2.cmd.m1},prd:res.pe.i2.prd,dy_sec:res.pe.i2.dy_sec,enb:res.pe.i2.enb}],prd:[{m1:res.prd.i1.m1,h1:res.prd.i1.h1,m2:res.prd.i1.m1,h2:res.prd.i1.h2},{m1:res.prd.i2.m1,h1:res.prd.i2.h1,m2:res.prd.i2.m2,h2:res.prd.i2.h2}]}
      this.date[0].time.hour = this.data.prd[0].h1
      this.date[0].time.minute = this.data.prd[0].m1
      this.date[1].time.hour = this.data.prd[1].h1
      this.date[1].time.minute = this.data.prd[1].m1
      this.date2[0].time.hour = this.data.prd[0].h2
      this.date2[0].time.minute = this.data.prd[0].m2
      this.date2[1].time.hour = this.data.prd[1].h2
      this.date2[1].time.minute = this.data.prd[1].m2
      // //Get only the data changed:
      this.item.Local.EventList.pe.i1 = this.data.pe[0]
      this.item.Local.EventList.pe.i2 = this.data.pe[1]
      this.item.Local.EventList.prd.i1 = this.data.prd[0]
      this.item.Local.EventList.prd.i2 = this.data.prd[1]
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
  private timeChanged(ev, index){
    ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): "+ev)
    this.data.prd[index].h1 = ev.time.hour
    this.data.prd[index].m1 = ev.time.minute
  }
  private timeChanged2(ev, index){
    ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): "+ev)
    this.data.prd[index].h2 = ev.time.hour
    this.data.prd[index].m2 = ev.time.minute
  }
  private prdChanged(index){
    this.modOneApiService.EditEventPrd(this.item.DB.Number,index+1,this.data.prd[index].m1,this.data.prd[index].h1,this.data.prd[index].m2,this.data.prd[index].h2,(res)=>{
      //Get only the data changed:
      let espIndex = index+1//["i"+espIndex.toString()]
      this.item.Local.EventList.prd["i"+espIndex.toString()] = this.data.prd[index]
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")//this.item
      //ConsoleLogService.log("EspMod1DetailPage","Saved: ",ev.weekDay)
    },(err)=>{})
    this.modOneApiService.ignoreNextRequest(1500)
  }
  private eventChanged(index){
    //ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): ",ev)

    //Now send the new data to the device:
    //(_ip: string,_ss: string,_min: string,_hh: string,_w: string,_dd: string,_mm: string,_yy: string, _callBackOk, _callBackNotOk)
    this.modOneApiService.EditEventPE(this.item.DB.Number,index+1,this.data.pe[index].enb,this.data.pe[index].dy_sec,this.data.pe[index].cmd.m0,this.data.pe[index].cmd.m1,this.data.pe[index].prd,(res)=>{
      //Get only the data changed:
      let espIndex = index+1//["i"+espIndex.toString()]
      this.item.Local.EventList.pe["i"+espIndex.toString()] = this.data.pe[index]
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")//this.item
      //ConsoleLogService.log("EspMod1DetailPage","Saved: ",ev.weekDay)
    },(err)=>{})
    this.modOneApiService.ignoreNextRequest(1500)
  }
}

@Component({
  selector: 'page-esp-light-events',
  templateUrl: 'esp-light-events.html'
})
export class EspLightEventsPage implements OnChanges {
  //delayArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  modNames: Array<string> = ["Saida 1", "Saida 2"]
  //------------------------
  @Input() public item: DeviceOneModel;
  @Output() onNewOffLineData = new EventEmitter<any>();
  data: {event:Array<{enb:boolean,actionOut1:number,actionOut2:number, lghLevel:number}>,light:{tol:number,actual:number,list:Array<{value}>}} = {event:[{enb:false,actionOut1:0,actionOut2:0, lghLevel:1},{enb:false,actionOut1:0,actionOut2:0, lghLevel:1}],light:{tol:100,actual:0,list:[{value:0},{value:0}]}}

  constructor(public modOneBackEndService: ModOneBackEndService, public modOneApiService: ModOneApiService){
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspLightEventsPage Page');
  }
  //This methodo(ngOnChanges) is called always that one @input changes. When this class is called the '@Input' doens't cames refresed, so we must call 'ngOnChanges' to ensure that the @input will be read correctly:
  ngOnChanges(changes: {[propKey: string]: SimpleChange}){ //ngOnChanges -> READ @input methodo!
    //Fisrt of all put the saved data on the screen:
    this.data.event[0].enb = this.item.Local.EventList.lgt_e.i1.enb
    this.data.event[1].enb = this.item.Local.EventList.lgt_e.i2.enb
    this.data.event[0].actionOut1 = this.item.Local.EventList.lgt_e.i1.m0
    this.data.event[1].actionOut1 = this.item.Local.EventList.lgt_e.i1.m1
    this.data.event[0].actionOut2 = this.item.Local.EventList.lgt_e.i2.m0
    this.data.event[1].actionOut2 = this.item.Local.EventList.lgt_e.i2.m1
    this.data.event[0].lghLevel = this.item.Local.EventList.lgt_e.i1.typ
    this.data.event[1].lghLevel = this.item.Local.EventList.lgt_e.i2.typ

    this.data.light.list[0].value = this.item.Local.EventList.lgtyp.i1
    this.data.light.list[1].value = this.item.Local.EventList.lgtyp.i2

    this.data.light.tol = this.item.Local.General.tol

    this.modNames[0] = this.item.DB.ModuleList[0].Name
    this.modNames[1] = this.item.DB.ModuleList[1].Name
    //Now check on device if data was changed:
    this.refreshData()
  }
  private refreshData(){
    //Get data from device:
    this.modOneApiService.GetEventList(this.item.DB.Number,(res)=>{
      this.modOneApiService.GetStatus(this.item.DB.Number,(res)=>{
        this.modOneApiService.GetGeneralTb(this.item.DB.Number,(res)=>{
          this.modOneApiService.ignoreNextRequest(1500)
          //Refresh screen data:
          this.data.light.tol = res.tol
          // //Get only the data changed:
          this.item.Local.EventList.lgt_e.i1.enb = this.data.event[0].enb
          this.item.Local.EventList.lgt_e.i2.enb = this.data.event[1].enb
          this.item.Local.EventList.lgt_e.i1.m0 = this.data.event[0].actionOut1
          this.item.Local.EventList.lgt_e.i1.m1 = this.data.event[1].actionOut1
          this.item.Local.EventList.lgt_e.i2.m0 = this.data.event[0].actionOut2
          this.item.Local.EventList.lgt_e.i2.m1 = this.data.event[1].actionOut2
          this.item.Local.EventList.lgt_e.i1.typ = this.data.event[0].lghLevel
          this.item.Local.EventList.lgt_e.i2.typ = this.data.event[1].lghLevel

          this.item.Local.EventList.lgtyp.i1 = this.data.light.list[0].value
          this.item.Local.EventList.lgtyp.i2 = this.data.light.list[1].value

          this.item.Local.General = res
          //Save the data restored from device:
          this.modOneBackEndService.saveDevice(this.item);
          this.onNewOffLineData.emit("Device changed!")
        },(res)=>{})
        //Refresh screen data:
        //this.modOneApiService.ignoreNextRequest(1500)
        this.data.light.actual = res.Light
      },(res)=>{})

      //Refresh screen data:
      this.data = {event:[{enb:res.lgt_e.i1.enb,actionOut1:res.lgt_e.i1.m0,actionOut2:res.lgt_e.i1.m1, lghLevel:res.lgt_e.i1.typ},{enb:res.lgt_e.i2.enb,actionOut1:res.lgt_e.i2.m0,actionOut2:res.lgt_e.i2.m1, lghLevel:res.lgt_e.i2.typ}],light:{tol:0,actual:0,list:[{value:res.lgtyp.i1},{value:res.lgtyp.i2}]}}
    },(err)=>{})
  }
  private eventChanged(index){
    //ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): ",ev)

    //Now send the new data to the device:
    //(_ip: string,_ss: string,_min: string,_hh: string,_w: string,_dd: string,_mm: string,_yy: string, _callBackOk, _callBackNotOk)
    this.modOneApiService.EditEventLgt(this.item.DB.Number,index+1,this.data.event[index].enb,this.data.event[index].actionOut1,this.data.event[index].actionOut2,this.data.event[index].lghLevel,(res)=>{
      //Get only the data changed:
      this.item.Local.EventList.lgt_e.i1.enb = this.data.event[0].enb
      this.item.Local.EventList.lgt_e.i2.enb = this.data.event[1].enb
      this.item.Local.EventList.lgt_e.i1.m0 = this.data.event[0].actionOut1
      this.item.Local.EventList.lgt_e.i1.m1 = this.data.event[1].actionOut1
      this.item.Local.EventList.lgt_e.i2.m0 = this.data.event[0].actionOut2
      this.item.Local.EventList.lgt_e.i2.m1 = this.data.event[1].actionOut2
      this.item.Local.EventList.lgt_e.i1.typ = this.data.event[0].lghLevel
      this.item.Local.EventList.lgt_e.i2.typ = this.data.event[1].lghLevel

      // this.item.Local.EventList.lgtyp.i1 = this.data.light.list[0].value
      // this.item.Local.EventList.lgtyp.i2 = this.data.light.list[1].value
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")//this.item
      //ConsoleLogService.log("EspMod1DetailPage","Saved: ",ev.weekDay)
    },(err)=>{})
    this.modOneApiService.ignoreNextRequest(1500)
  }
  private lightChanged(index){
    //this.data.light.actual = 415 //Only for test

    //Now send the new data to the device:
    //(_ip: string,_ss: string,_min: string,_hh: string,_w: string,_dd: string,_mm: string,_yy: string, _callBackOk, _callBackNotOk)
    this.modOneApiService.EditEventLgtTyp(this.item.DB.Number,index+1,this.data.light.list[index].value,(res)=>{
      //Get only the data changed:
      //this.data.light.list[index].value = this.data.light.actual

      this.item.Local.EventList.lgtyp.i1 = this.data.light.list[0].value
      this.item.Local.EventList.lgtyp.i2 = this.data.light.list[1].value
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")//this.item
      //ConsoleLogService.log("EspMod1DetailPage","Saved: ",ev.weekDay)
    },(err)=>{})
    this.modOneApiService.ignoreNextRequest(1500)
  }
  private tolChanged(){
    //ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): ",ev)

    //Now send the new data to the device:
    //(_ip: string,_ss: string,_min: string,_hh: string,_w: string,_dd: string,_mm: string,_yy: string, _callBackOk, _callBackNotOk)
    this.modOneApiService.EditEventLgtTol(this.item.DB.Number,77,(res)=>{
      //Get only the data changed:
      this.item.Local.General.tol = this.data.light.tol
      //Save the data restored from device:
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")//this.item
      //ConsoleLogService.log("EspMod1DetailPage","Saved: ",ev.weekDay)
    },(err)=>{})
    this.modOneApiService.ignoreNextRequest(1500)
  }
}

@Component({
  selector: 'page-esp-config',
  templateUrl: 'esp-config.html'
})
export class EspConfigPage implements OnChanges {
  @Input() public item: DeviceOneModel = this.modOneBackEndService.getEmptyDevice();
  @Output() onNewOffLineData = new EventEmitter<any>();

  constructor(public events: Events, public configService: ConfigService, public modOneBackEndService: ModOneBackEndService, public modOneApiService: ModOneApiService){
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspConfigPage Page');

    //Get Object assincroning and monitor when have new data:
    this.configService.getConfigObj((obj)=>{this.configServiceObj=obj})
    this.events.subscribe("ConfigService:NewData",(obj)=>{this.configServiceObj=obj})
    this.events.subscribe("ModOneBackEndService:NewData",(obj)=>{this.item=this.modOneBackEndService.getDeviceByName(this.item.DB.Name)})
  }
  private configServiceObj: ConfigServiceModel = this.configService.getEmptyData()

  //------------------------------- Device Comunication options -------------------------------
  private devComunEnun: any = {NONE: DeviceComunEnun.NONE, MQTT: DeviceComunEnun.MQTT, WIFI_DIRECT: DeviceComunEnun.WIFI_DIRECT,WIFI_LOCAL: DeviceComunEnun.WIFI_LOCAL, APP_ROUTER: DeviceComunEnun.APP_ROUTER}
  private selectedMQTTDevComunList: number = DeviceComunEnun.NONE
  private selectedAppList: ConfigServiceAppComParModel = this.configService.getEmptyData().clearDataObj.AppCom

  private saveDevComun(){
    if(this.selectedAppList){this.item.Local.DevComun.AppRouter=this.selectedAppList}
    this.item.Local.DevComun.type = this.selectedMQTTDevComunList
    this.modOneBackEndService.saveDevice(this.item)
  }
  private editDevice(){
    this.modOneBackEndService.saveDevice(this.item);
    this.serverChanged()
  }
  //------------------------------- Device Comunication options -------------------------------


  ngOnChanges(changes: {[propKey: string]: SimpleChange}){ //ngOnChanges -> READ @input methodo!

    //This methodo(ngOnChanges) is called always that one @input changes. When this class is called the '@Input' doens't cames refresed, so we must call 'ngOnChanges' to ensure that the @input will be read correctly:

    this.selectedMQTTDevComunList = this.item.Local.DevComun.type
    this.selectedAppList=this.item.Local.DevComun.AppRouter

    //Now check on device if data was changed:
    this.refreshData()
  }
  private refreshData(){
    //Get data from device:
    this.modOneApiService.cmdGetAllCommData(this.item.DB.Number,this.item.Local.ip.sta_ip,(res)=>{
    ConsoleLogService.log("EspMod1DetailPage","(cmdGetAllCommData)All data got: ",res)
      this.modOneApiService.GetGeneralTb(this.item.DB.Number,(res)=>{
        this.modOneApiService.ignoreNextRequest(1500)
        this.onNewOffLineData.emit("Device changed!")
      },(err)=>{})
    },(err)=>{})
  }
  private STAChanged(ev){
    ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): "+ev)

    this.modOneApiService.SetSTAConfig(this.item.DB.Number,this.item.Local.STAConfig.name,this.item.Local.STAConfig.pwd,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
  private APChanged(ev){
    ConsoleLogService.log("EspMod1DetailPage","Time was changed(EspClock): "+ev)

    this.modOneApiService.SetAPConfig(this.item.DB.Number,this.item.Local.APConfig.name,this.item.Local.APConfig.pwd,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
  private serverChanged(){
    this.modOneApiService.EditMQTT(this.item.DB.Number,this.item.Local.MQTT.MQTTHost,this.item.Local.MQTT.MQTTUser,this.item.Local.MQTT.MQTTUserPwd,this.item.Local.MQTT.MQTTPort,this.item.Local.General.EnbMQTT,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
  private EnbSTA(){
    this.modOneApiService.EditEnbSTA(this.item.DB.Number,this.item.Local.General.EnbSTA,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
  private outTypeChanged(){
    this.modOneApiService.EditOutType(this.item.DB.Number,this.item.Local.General.M0,this.item.Local.General.M1,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
  private inpTypeChanged(){
    this.modOneApiService.EditInpType(this.item.DB.Number,this.item.Local.General.InpRGB,this.item.Local.General.Inp1,this.item.Local.General.Inp2,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
}

@Component({
  selector: 'page-esp-clock',
  templateUrl: "esp-clock.html"
})
export class EspClockPage implements OnChanges{
  @Input() public item: DeviceOneModel = this.modOneBackEndService.getEmptyDevice();
  @Output() onNewOffLineData = new EventEmitter<any>();
  private date: DateDatePickerModel = {weekDay:6, day: {day:23,month:10,year:17}, time: {hour:3, minute:5, second:30}}

  constructor(public events: Events,public modOneBackEndService: ModOneBackEndService, public modOneApiService: ModOneApiService) {
    //ConsoleLogService.log("EspMod1DetailPage","EspClock says: ",this.item)
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspClock Page');

    this.events.subscribe("ModOneBackEndService:NewData",(obj)=>{this.item=this.modOneBackEndService.getDeviceByName(this.item.DB.Name)})
  }

  ionViewDidLoad() {
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspClock Page');
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}){ //ngOnChanges -> READ @input methodo!

    //This methodo(ngOnChanges) is called always that one @input changes. When this class is called the '@Input' doens't cames refresed, so we must call 'ngOnChanges' to ensure that the @input will be read correctly:

    //ConsoleLogService.log("EspMod1DetailPage",'EspClockPage was changed!!!:',this.item);
    //Fisrt of all put the saved data on the screen:
    this.date = {weekDay:this.item.Local.Time.wk, day: {day:this.item.Local.Time.day,month:this.item.Local.Time.mth,year:this.item.Local.Time.yy}, time: {hour:this.item.Local.Time.hrs, minute:this.item.Local.Time.min, second:this.item.Local.Time.sec}}
    //Now check on device if data was changed:
    this.refreshData()
  }
  private refreshData(){
    //Get data from device:
    this.modOneApiService.GetTime(this.item.DB.Number,(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      //Refresh screen data:
      this.date = {weekDay:res.wk, day: {day:res.day,month:res.mth,year:res.yy}, time: {hour:res.hrs, minute:res.min, second:res.sec}}
      //Save the data restored from device:
      this.item.Local.Time = res
      this.modOneBackEndService.saveDevice(this.item);
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }

  private tmChanged(_ev){
    let ev:DateDatePickerModel = _ev //Explicite declaration!

    this.item.Local.Time.wk = Number(ev.weekDay)

    this.item.Local.Time.day = ev.day.day
    this.item.Local.Time.mth = ev.day.month
    this.item.Local.Time.yy = ev.day.year

    this.item.Local.Time.hrs = ev.time.hour
    this.item.Local.Time.min = ev.time.minute
    this.item.Local.Time.sec = ev.time.second
  }
  private timeChanged(){
    //Now send the new data to the device:
    this.modOneApiService.SetTime(this.item.DB.Number,this.item.Local.Time.sec.toString(),this.item.Local.Time.min.toString(),this.item.Local.Time.hrs.toString(),this.item.Local.Time.wk.toString(),this.item.Local.Time.day.toString(),this.item.Local.Time.mth.toString(),this.item.Local.Time.yy.toString(),(res)=>{
      this.modOneApiService.ignoreNextRequest(1500)
      this.onNewOffLineData.emit("Device changed!")
    },(err)=>{})
  }
}

@Component({
  selector: 'page-esp-detail',
  templateUrl: 'esp-detail.html'
})
export class EspDetailPage implements OnChanges{
  @Input() public item: DeviceOneModel;
  @Output() onNewOffLineData = new EventEmitter<any>();

  constructor(public modOneBackEndService: ModOneBackEndService) {
    //ConsoleLogService.log("EspMod1DetailPage","EspClock says: ",this.item)
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspDetailPage Page');
    //this.item.DB.ModuleList[0].Favorite
  }
  ionViewDidLoad() {
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspDetailPage Page');
  }
  ngOnChanges(changes: {[propKey: string]: SimpleChange}){
  }

  private changed(){
    //this.onNewOffLineData.emit("Device changed!")
  }
}

@Component({
  selector: 'page-esp-edit',
  templateUrl: 'esp-edit.html'
})
export class EspEditPage implements OnChanges{
  @Input() public item: DeviceOneModel = this.modOneBackEndService.getEmptyDevice();
  @Output() onNewOffLineData = new EventEmitter<any>();
  @Output() onNewOnLineData = new EventEmitter<any>();

  private roomList: Array<{Name: String}>= [];

  constructor(public events: Events, public configService: ConfigService, public modOneBackEndService: ModOneBackEndService, public userService: UserService) {
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspEditPage Page');
    //Get Object assincroning and monitor when have new data:
    this.configService.getConfigObj((obj)=>{this.configServiceObj=obj})
    this.events.subscribe("ConfigService:NewData",(obj)=>{this.configServiceObj = obj})

    this.events.subscribe("ModOneBackEndService:NewData",(obj)=>{this.item=this.modOneBackEndService.getDeviceByName(this.item.DB.Name)})
  }
  private configServiceObj: ConfigServiceModel = this.configService.getEmptyData()

  ionViewDidLoad() {
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspEditPage Page');
  }
  ngOnChanges(changes: {[propKey: string]: SimpleChange}){
    this.userService.getUserRoomList_DB(this.userService.user.email, this.userService.user.SessionID,(res)=>{
      this.roomList = res.Results
    },(res)=>{},(err)=>{})

    //this.selectedMQTTDevComunList = this.item.Local.DevComun.type
    //this.selectedAppList=this.item.Local.DevComun.AppRouter
  }

  private changed(){
    this.onNewOnLineData.emit("Device changed!")
  }
  private editDevice(device: DeviceOneModel){
    this.modOneBackEndService.editDevice_DB(this.userService.user.email,this.userService.user.SessionID,{room: device.DB.Room,number:device.DB.Number,name:device.DB.Name,desactive:device.DB.Desactvated,staName:device.Local.STAConfig.name,
      staPwd:device.Local.STAConfig.name,apName:device.Local.APConfig.name,apPwd:device.Local.APConfig.pwd,staIP:device.Local.ip.sta_ip,MQTTHost:device.DB.MQTT.MQTTHost,
      MQTTPort:device.DB.MQTT.MQTTPort,MQTTSSL:device.DB.MQTT.MQTTSSL,MQTTPath:device.DB.MQTT.MQTTPath,MQTTUser:device.DB.MQTT.MQTTUser,
      MQTTUserPwd:device.DB.MQTT.MQTTUserPwd,MQTTClearS:device.DB.MQTT.MQTTClearS,MQTTQoS:device.DB.MQTT.MQTTQoS,MQTTType:device.DB.MQTT.MQTTType},
      (res)=>{
        this.changed()
      }, (res)=>{}, (err)=>{})
  }
  private editModule(module: ModuleOneModel){
    this.modOneBackEndService.editModule_DB(this.userService.user.email,this.userService.user.SessionID,{number:module.Number,position:module.Position,name:module.Name,desactive:module.Desactvated,favorite:module.Favorite},
      (res)=>{
        this.changed()
      }, (res)=>{}, (err)=>{})
  }

  //------------------------------- Device Comunication options -------------------------------
  // private devComunEnun: any = {NONE: DeviceComunEnun.NONE, MQTT: DeviceComunEnun.MQTT, DIRECT: DeviceComunEnun.DIRECT, APP_ROUTER: DeviceComunEnun.APP_ROUTER}
  // private selectedMQTTDevComunList: number = DeviceComunEnun.NONE
  // private selectedAppList: ConfigServiceAppComParModel = this.configService.getEmptyData().clearDataObj.AppCom
  //
  // private saveDevComun(){
  //   if(this.selectedAppList){this.item.Local.DevComun.AppRouter=this.selectedAppList}
  //   this.item.Local.DevComun.type = this.selectedMQTTDevComunList
  //   this.modOneBackEndService.saveDevice(this.item)
  // }
  //------------------------------- Device Comunication options -------------------------------
}

@Component({
  selector: 'page-esp-share',
  templateUrl: 'esp-share.html'
})
export class EspSharePage implements OnChanges{
  @Input() public item: DeviceOneModel = this.modOneBackEndService.getEmptyDevice();
  @Output() onNewOffLineData = new EventEmitter<any>();
  @Output() onNewOnLineData = new EventEmitter<any>();

  //private roomList: Array<{Name: String}>= [];
  private email: string = "";
  private rights: number = 1;
  private showScreen: string = "share";

  constructor(public alertService: AlertService,public events: Events, public configService: ConfigService, public modOneBackEndService: ModOneBackEndService, public userService: UserService) {
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspEditPage Page');
    //Get Object assincroning and monitor when have new data:
    this.configService.getConfigObj((obj)=>{this.configServiceObj=obj})
    this.events.subscribe("ConfigService:NewData",(obj)=>{this.configServiceObj = obj})

    this.events.subscribe("ModOneBackEndService:NewData",(obj)=>{this.item=this.modOneBackEndService.getDeviceByName(this.item.DB.Name)})
  }
  private configServiceObj: ConfigServiceModel = this.configService.getEmptyData()

  ionViewDidLoad() {
    ConsoleLogService.log("EspMod1DetailPage",'Hello EspEditPage Page');
  }
  ngOnChanges(changes: {[propKey: string]: SimpleChange}){
    // this.userService.getUserRoomList_DB(this.userService.user.email, this.userService.user.SessionID,(res)=>{
    // },(res)=>{},(err)=>{})
  }

  private share(email: string, rights: number){
    this.modOneBackEndService.shareDevice_DB(email,this.userService.user.email,this.item.DB.Number,rights,this.userService.user.SessionID,(res)=>{
      this.alertService.showOk("Sucesso!","Dispositivo compartilhado com sucesso!","Ok",()=>{})
    },(res)=>{this.alertService.showOk("Erro!","Problemas para compartilhas esse dipositivo. Confira o email, seu nivel de usuário ou se já foi compartilhado alguma vez e tente novamente.","Ok",()=>{})})
  }
  private unshare(email: string){
    this.modOneBackEndService.unShareDevice_DB(email,this.userService.user.email,this.item.DB.Number,this.userService.user.SessionID,(res)=>{
      this.alertService.showOk("Sucesso!","Compartilhamento de dispositivo apagado com sucesso!","Ok",()=>{})
    },(res)=>{this.alertService.showOk("Erro!","Sem compartilhamentos para apagar.","Ok",()=>{})})
  }
  private unshareAllUser(){
    this.modOneBackEndService.unShareDevice_DB("-1",this.userService.user.email,this.item.DB.Number,this.userService.user.SessionID,(res)=>{
      this.alertService.showOk("Sucesso!","Compartilhamento de dispositivo apagado com sucesso!","Ok",()=>{})
    },(res)=>{this.alertService.showOk("Erro!","Sem compartilhamentos para apagar.","Ok",()=>{})})
  }
}
