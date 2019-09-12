import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/timeoutWith';
import { KeyValuePairModel } from '../model/key-value-pair-model';
import { ConsoleLogService } from '../static-class/object-util';

@Injectable()
export class HttpService {

  constructor(public http: Http) {
    ConsoleLogService.log("HttpService",'Hello HttpService Provider');
  }

  // private nextRequestIgnored: boolean = false
  // public ignoreNextRequest(time: number){
  //   if (!this.nextRequestIgnored){
  //     setTimeout(()=>{this.nextRequestIgnored = false}, time)
  //   }
  //   this.nextRequestIgnored = true
  // }

  public seturl(ip: string,path: string) {
    return 'http://' + ip + path;
  }

  public dorequest (timeout: number,_outFunc : (res: Response) => any, _url: string): Observable<any> {
      return this.http.get(_url)
                      //.timeout(timeout,new Error('Timeout exceeded!!!'))
                      .timeoutWith(timeout, Observable.throw(new Error('Boom!')))
                      .map(_outFunc)
                      .catch(this.handleError);
      }

  public extractData(res: Response):any {
    let body = res.json();
    //ConsoleLogService.log("HttpService",body)
    return body || { };
  }

  public handleError (error: any) {
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error!!!';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  public subscribeRequest(timeout: number,_ip: string, _url: string, _callBackOk, _callBackNotOk){
    // if (this.nextRequestIgnored){
    //   _callBackNotOk()
    //   return
    // }
    this.dorequest(timeout,this.extractData, this.seturl(_ip,_url))
      .subscribe(
      res => {
        ConsoleLogService.log("HttpService","Response OK. SubscribeRequest done for '" + this.seturl(_ip,_url) + "' url! Detais: ",res)
        _callBackOk(res)
      },
      error => {
        ConsoleLogService.log("HttpService","Response NOT OK. SubscribeRequest fault for '" + this.seturl(_ip,_url) + "' url! Detais: ",error)
        _callBackNotOk(error)
      });
  }

  public get(timeout: number,_ip: string, _url: string, _callBackOk, _callBackNotOk){
    this.dorequest(timeout,(res)=>{return res}, this.seturl(_ip,_url))
      .subscribe(
      res => {
        ConsoleLogService.log("HttpService","Response OK. SubscribeRequest done for '" + this.seturl(_ip,_url) + "' url! Detais: ",res)
        //console.log("FFF: ",res)
        _callBackOk(res)
      },
      error => {
        ConsoleLogService.log("HttpService","Response NOT OK. SubscribeRequest fault for '" + this.seturl(_ip,_url) + "' url! Detais: ",error)
        _callBackNotOk(error)
      });
  }

  public phpSerialize(_data: KeyValuePairModel[]){
    let stg: string="/?";
    for (let element of _data){
      stg = stg + element.key+"="+element.value+"&";
    }
    stg = stg.substring(0, stg.length-1);//Remove the last '&' character.
    //ConsoleLogService.log("HttpService","Serialized: "+ stg);
    return stg;
  }

  public espSerialize(_data: KeyValuePairModel[]){
    let stg: string='{';//let stg: string='/?{';
    for (let element of _data){
      let _typ = typeof element.value;
      if (_typ == "string")
      {
        stg = stg + '"' + element.key+'":"'+element.value+'",';
      }
      if (_typ == "number")
      {
        stg = stg + '"' + element.key+'":'+element.value+',';
      }
    }
    stg = stg.substring(0, stg.length-1);//Remove the last ',"' characters.
    stg = stg + '}'//stg = stg + '}?/'
    //ConsoleLogService.log("HttpService","Serialized: "+ stg);
    return stg;
  }
}
