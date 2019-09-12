import {Injectable} from '@angular/core';
import { ModOneBackEndService } from './modOne-backEnd-service';
import { AlertService } from './alert-service';
import { Events } from 'ionic-angular';
import { ConsoleLogService } from '../static-class/object-util';
import { Vibration } from '@ionic-native/vibration';
import { LocalNotifications } from '@ionic-native/local-notifications';

export interface  LoggerLogListModel {
  title: string;
  description: string;
  detail: Array<string>;
  icon: string;
  date: Date;
  code: string;
  type: string;
  obj?: any;  //You can log any aboject that you need here!
}

@Injectable()
export class LoggerService {
    //@Output() onSelectPopoverMenuItem = new EventEmitter<{log: any}>();

    constructor (private localNotifications: LocalNotifications, private vibration: Vibration, public alertService: AlertService, public events: Events, private modOneBackEndService: ModOneBackEndService){}
    private newMsgCount: number = 0;

    public ackMsgs(){
      this.newMsgCount = 0
    }

    public newMsgs(){
      if (this.newMsgCount != 0)
        {return true}
      else
        {return false}
    }

    public MsgsCount(){
      return this.newMsgCount
    }

    public getMessages() {

        return this.logs;
    }

    logs : Array<LoggerLogListModel> = []//{title: string, description: string, detail: Array<string>, icon: string, date: Date, code: string, type: string}[] = [];

    public log(_msg:LoggerLogListModel){
      this.newMsgCount = this.newMsgCount + 1;
      //let _date: Date = new Date()
      ConsoleLogService.log("LoggerService", this.getMessages())
      ConsoleLogService.log("LoggerService","New log. Title: '" + _msg.title + "'. Description: '" + _msg.description + "' At this time: '" +  _msg.date + "'. Log code: '" + _msg.code + "'");
      this.alertService.showToast(_msg.title + ": " + _msg.description,"button",2000)

      let newLog = _msg;
      this.logs.unshift(newLog);

      //http://www.programmingworldtech.com/2017/09/ionic-3-cordova-read-sms-plugin.html
      this.events.publish("LoggerService:NewData",newLog)

      this.vibration.vibrate(1000);
      // Schedule a single notification
      this.localNotifications.schedule({
        id: 1,
        badge: this.newMsgCount,
        title: _msg.title,
        text: _msg.description,
        sound: true? 'file://sound.mp3': 'file://beep.caf',
        data: { secret: "key" }
      });
    }

    public filterMessages(ArgName, ArgValue, Type): any {
      function msgFilter(element: {title: string, description: string, detail: Array<string>, icon: string, date: Date, code: string, type: string}, index, array) {
        if(Type !== element.type){
          return false
        }
        let dateNow = new Date()
        if(ArgName === "description"){
          return (element.description === ArgValue);
        }
        if(ArgName === "title"){
          return (element.title === ArgValue);
        }
        if(ArgName === "Month"){
          return (dateNow.getMonth() === ArgValue && dateNow.getFullYear() === element.date.getFullYear());
        }
        if(ArgName === "MonthDay"){
          return (element.date.getDate() === ArgValue && dateNow.getMonth() === element.date.getMonth() && dateNow.getFullYear() === element.date.getFullYear());
        }
        if(ArgName === "Hours"){
          return (element.date.getHours() === ArgValue && dateNow.getDate() === element.date.getDate() && dateNow.getMonth() === element.date.getMonth() && dateNow.getFullYear() === element.date.getFullYear());
        }
        if(ArgName === "Min"){
          return (element.date.getMinutes() === ArgValue && dateNow.getHours() === element.date.getHours() && dateNow.getDate() === element.date.getDate() && dateNow.getMonth() === element.date.getMonth() && dateNow.getFullYear() === element.date.getFullYear());
        }
        if(ArgName === ""){
          return true;
        }
        return true;
      }
      console.log("YYY: ",ArgName, ArgValue, Type,this.logs)
      let arrayRes: Array<any> = this.logs.filter(msgFilter)
      let tobeReturned: Array<{icon: string, msg: string, detail: string, number: string, name: string, date: Date}> = []
      if (arrayRes.length != 0){
        //for (let i in arrayRes){
          //tobeReturned.push({icon: "", msg: "", detail: "", number: arrayRes[i].devNumber, name: this.modOneBackEndService.getDeviceByNumber(arrayRes[i].devNumber).DB.Name, date: arrayRes[i].date})
        //}
        //return tobeReturned
        return arrayRes
      }
      else{
        return []
      }

    }
}
