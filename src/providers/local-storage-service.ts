import { Injectable } from '@angular/core';
//import { Http } from '@angular/http';
//import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { ConsoleLogService } from '../static-class/object-util';

@Injectable()
export class LocalStorageService {

  constructor(/*public http: Http, */private storage: Storage) {
    ConsoleLogService.log("LocalStorageService",'Hello LocalStorageService Provider');
  }

  //private objectName: string;

  public isSet(name: string, _isNullCallBack, _isNotNullCallBack){
    //this.objectName = name;
    this.storage.get(name).then((obj) => {
    if (obj == null){ _isNullCallBack() } else { _isNotNullCallBack() }
    });
  }

  public set(_name: string, _obj: Object){
    this.storage.set(_name, JSON.stringify(_obj));
    ConsoleLogService.log("LocalStorageService","LocalStorageService saved the '"+_name+"' data base successfully. Data Saved: ", _obj)//; ConsoleLogService.log("LocalStorageService",_obj)
  }

  public get(_name: string, _callBack){
    this.storage.get(_name).then((obj) => {
      //ConsoleLogService.log("LocalStorageService","LocalStorageService recovery the '"+_name+"' data base successfully. Data recovered: ",/*JSON.stringify(JSON.parse(obj))*/JSON.parse(obj))
      _callBack(JSON.parse(obj));//Call back function -> Pass 'obj' as parameter.
      }).catch((err)=>{
        ConsoleLogService.log("LocalStorageService","Error!! : "+err)
      })
  }

  public remove(_key){
    this.storage.remove(_key);
  }

}
