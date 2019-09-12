import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoggerService} from '../../providers/logger.service';
import { Events, ModalController, NavParams, ViewController, Platform } from 'ionic-angular';
import { ModOneBackEndService } from '../../providers/modOne-backEnd-service';

import { CentralLoggerService, CentralLoggerLogListModel} from '../../providers/central.logger.service';
/*
  Generated class for the Notification page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html'
})
export class NotificationPage {
  deviceList: any = {};
  constructor(private centralLoggerService: CentralLoggerService,private modOneBackEndService: ModOneBackEndService, public modalCtrl: ModalController, public events: Events, public logger: LoggerService,public navCtrl: NavController) {
    events.subscribe('MqttLoggerService:log', (_newLog) => {
      console.log("(NotificationPage)New Log arrived: ");console.log(_newLog)
      this.getLogList()
    });

    this.modOneBackEndService.getDeviceList((list)=>{this.deviceList = list})

    this.logger.ackMsgs()
  }

  ionViewDidLoad() {
    console.log('Hello NotificationPage Page');
    this.getLogList()
  }
  private filterType: string = "1"
  private filterArg: string = ""
  private logList: Array<{title: string, description: string, detail: Array<string>, icon: string, date: Date, code: string}> = []
  private AllMonths(){return [0,1,2,3,4,5,6,7,8,9,10,11]}
  private AllDays(){return [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]}
  private AllHour(){return [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]}
  private AllMinutes(){return [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59]}
  private MsgDescriptionFilter: Array<CentralLoggerLogListModel> = this.centralLoggerService.getReadableLogList()
  private getLogList(){
    //this.logList = this.logger.filterMessages("devNumber", "20161220.001.16668185")
    this.logList = this.logger.filterMessages('', '', "DeviceOne")
    //this.logList = this.logger.filterMessages('typ', 'pin7_1')
  }

  private openModal(_element) {

    let modal = this.modalCtrl.create(NotificationModalPage, _element);
    modal.present();
  }

  private onFilterChange(_argName, _argValue){
    this.logList = this.logger.filterMessages(_argName, _argValue, "DeviceOne")
  }

}

@Component({
  selector: 'page-notification-model',
  templateUrl: 'notification-modal.html'
})
export class NotificationModalPage{
  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ){
    this.element = this.params.get('element')
    console.log(this.element)
  }
  public element: {}

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}
