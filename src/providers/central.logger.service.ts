import {Injectable} from '@angular/core';
import { Events } from 'ionic-angular';
import { ConsoleLogService } from '../static-class/object-util';
import { ModOneBackEndService } from './modOne-backEnd-service';
import {LoggerService, LoggerLogListModel} from './logger.service';

export interface  CentralLoggerLogListModel {
    from: string;
    icon: string;
    code: string;
    description: string;
    detail: Array<string>;
}

@Injectable()
export class CentralLoggerService {
    constructor (public events: Events, public modOneBackEndService: ModOneBackEndService, public logger: LoggerService){}

    public getReadableLogList(): Array<CentralLoggerLogListModel>{
     let MsgTypes: Array<CentralLoggerLogListModel> = [
       //Device ModOne Messages:
       {from: "DeviceOne", icon: "md-walk",          code: "mot",            description: "Sensor Acionado!",          detail: ["Sensor de presença foi acionado"]},
       {from: "DeviceOne", icon: "md-hand",          code: "pin6_0",         description: "Entrada 1 desacionada!",    detail: ["Interruptor 1(um) foi desacionado pelo usuário."]},
       {from: "DeviceOne", icon: "md-hand",          code: "pin6_1",         description: "Entrada 1 acionada!",       detail: ["Interruptor 1(um) foi acionado pelo usuário."]},
       {from: "DeviceOne", icon: "md-hand",          code: "pin7_0",         description: "Entrada 2 desacionada!",    detail: ["Interruptor 2(dois) foi desacionado pelo usuário."]},
       {from: "DeviceOne", icon: "md-hand",          code: "pin7_1",         description: "Entrada 2 acionada!",       detail: ["Interruptor 2(dois) foi acionado pelo usuário."]},
       {from: "DeviceOne", icon: "md-cloud-done",    code: "con",            description: "Dispositivo Conectado!",    detail: ["Dispositivo foi conectado ao serivor IOT!"]},
       {from: "DeviceOne", icon: "md-outlet",        code: "init",           description: "Dispositivo Inicializado!", detail: ["Dispositivo foi inicializado nesse momento."]},
       {from: "DeviceOne", icon: "md-globe",         code: "req",            description: "Conectado Remotamente!",    detail: ["Dispositivo foi controlado remotamente por usuário credenciado."]},
       {from: "DeviceOne", icon: "md-cloud-outline", code: "MQTTConnected",  description: "Aplicativo Conectado!",     detail: ["Aplicativo foi conectado ao servidor IOT!"]},
       //From Cell Phones Messages:
       {from: "CelPhone",  icon: "md-globe",         code: "phone_comun",    description: "Sensor Acionado!",          detail: ["Sensor de presença foi acionado"]},
     ]
     return MsgTypes
    }

    private toReadableLog(code: string, from: string): {description: string, detail: Array<string>, icon: string}{
     let tobeReturned: {description: string, detail: Array<string>, icon: string} = {description: "", detail: [""], icon: ""};

     //for (let element of this.getCodeMsgList()){
       //let _elem = this.getCodeMsgList().filter(elem => elem.code === code)
     //}
     let _elem = this.getReadableLogList().filter(elem => elem.code === code && elem.from === from)
     if (_elem.length > 0){
       tobeReturned.description = _elem[0].description;
       tobeReturned.detail = _elem[0].detail;
       tobeReturned.icon = _elem[0].icon
     }
     else{tobeReturned = null}
     return tobeReturned;
    }

    public log(logCode: string, title: string, from: string, date?: Date){
      ConsoleLogService.log("CentralLoggerService", "Will be logged. Title: '" + title + "' Log Code: '" + logCode + "'.")

      let msg = this.toReadableLog(logCode,from)
      if(!msg){return}

      let _toLog: LoggerLogListModel = {title: title, description: msg.description, detail:msg.detail, icon: msg.icon, code: logCode, date: (!date) ? new Date(): date, type: from}
      this.logger.log(_toLog);
    }

    // public fullLog(log: LoggerLogListModel){ //Not used yet
    //   this.logger.log(log);
    // }

}
