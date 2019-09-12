import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { ModOneApiService } from '../../providers/modOne-api-service';
import { ConsoleLogService } from '../../static-class/object-util';
//import { ModOneBackEndService } from '../../providers/modOne-backEnd-service';
//import { ObjectUtil } from '../../utils/object-util';
//import { UserService } from '../../providers/user-service';
import {AppService} from '../../providers/app-service';
import { ConfigService, ConfigServiceModel } from '../../providers/config-service';
import { HttpService } from '../../providers/http-service';

@Component({
  selector: 'page-developer',
  templateUrl: 'developer.html'
})
export class DeveloperPage {

  constructor(public httpService: HttpService, public events: Events, public configService: ConfigService, public appService: AppService, public navCtrl: NavController, public modOneApiService: ModOneApiService) {
    this.configService.getConfigObj((obj)=>{this.configServiceObj=obj})
    this.events.subscribe("ConfigService:NewData",(obj)=>{this.configServiceObj = obj})
  }

  private configServiceObj: ConfigServiceModel = this.configService.getEmptyData()
  private screen: string = 'CONSOLE_LOG'

  private save(){
    this.configService.setConfigObj(this.configServiceObj)
  }
  private restore(){
    this.configService.getConfigObj((obj)=>{this.configServiceObj=obj})
  }
  private default(){
    this.configService.defaultRestore()
    //this.configServiceObj.server.URL
  }

  //-------------------------------- Logger --------------------------------
  private Loggertext: string = ''
  private getLoggerText(): string{return ConsoleLogService.getDeveloperLoggerText()}
  private isLoggerEnable(){return ConsoleLogService.isEnableDeveloperLogger()}
  private toggleOnOffLogger(){ConsoleLogService.toggleOnOffDeveloperLogger()}
  private clearLogger(){ConsoleLogService.clearDeveloperLogger()}
  private getTypeUsedList(): Array<string> {return ConsoleLogService.getTypeUsedList()}
  private logList: Array<string> = ConsoleLogService.getTypeSelected()
  private exposedLogger(){ConsoleLogService.setTypeSelected(this.logList)}
  private selectedLogger(obj){}
  //-------------------------------- Logger --------------------------------

  //-------------------------------- Server --------------------------------
  private serverTestText: string = ''
  private testServer(){
    this.httpService.get(1000, this.configServiceObj.server.URL,this.configServiceObj.server.URLTest, (res)=>{this.serverTestText=res._body},(err)=>{})
  }
  //-------------------------------- Server --------------------------------
}
