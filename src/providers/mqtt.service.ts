import {Injectable} from '@angular/core';
import {CentralLoggerService} from './central.logger.service';
import {LoggerLogListModel} from './logger.service';
import { AlertService } from './alert-service'
import { ConsoleLogService } from '../static-class/object-util';
import { ModOneBackEndService } from './modOne-backEnd-service';
import { ConfigService, ConfigServiceModel, ConfigServiceMQTTParModel } from './config-service';
import { Events } from 'ionic-angular';

declare let MqttClient: any;

export interface MQTTConnectionModel{
  Name:string,
  status:boolean,
  exist:boolean,
  MqttClient: any //Referencece of MqttClient instance
}

export interface MQTTConnectionParametersModel{
}

export interface SubscriptionOnceTopicModel{
    id: string,
    topic: string,
    message: string | any,
    callback: (topic: string, msg: string)=>void,
    callbackFail: (err:string)=>void,
    status: number
}

export interface SubscriptionEverTopicModel{
    topic: string,
    callback: (topic:string, message:string|{from:string, title:string, message:string}, Name:string)=>void,
}


@Injectable()
export class MQTTService {

  constructor(public events: Events, public configService: ConfigService, private modOneBackEndService: ModOneBackEndService, public centralLoggerService: CentralLoggerService, private alertService: AlertService) {
    this.configService.getConfigObj((obj)=>{this.configServiceObj=obj})
    this.events.subscribe("ConfigService:NewData",(obj)=>{this.configServiceObj = obj})
  }

  /**
  * Connect to MQTT broker
  *
  * @param callback
  */
  private configServiceObj: ConfigServiceModel = this.configService.getEmptyData()

  //public _client: any;

  //public _connected: boolean = false;

  private _prefix: string = 'application';
  //private monitorSubscribedEverList: any = [];
  private topicPrefix: string = "/HomeSense1985"
  private connections: Array<MQTTConnectionModel> = []

  private addNewConn(name: string, MqttClient: any):Array<MQTTConnectionModel>{
    let arrayRes: Array<MQTTConnectionModel> = this.connections.filter((elem) => elem.Name === name)
    if (arrayRes.length == 1){
      return this.changeConnStatus(name, true)
    }
    else{
      this.connections.push({Name:name, status:true, exist:true, MqttClient: MqttClient})

      let topicBegin: string = this.topicPrefix + '/FromDevice/Log/'
      let topicName: string = name
      let topicEnd: string = "/"
      let topicFull = topicBegin + topicName + topicEnd

      // this.SubscribeEver(topicFull, (_topic:string, _message:string, _name:string)=>{
      //     ConsoleLogService.log("MQTTService","Topic arrived: " + _topic + _message);
      //     if ((topicBegin + _name + topicEnd) == _topic){
      //       this.log("Log", _message, _name);
      //     }
      //   })

        this.monitorSubscribedEverList.push({
            topic: topicFull,
            callback: (_topic:string, _message:string, _name:string)=>{
                ConsoleLogService.log("MQTTService","Topic arrived: " + _topic + _message);
                if ((topicBegin + _name + topicEnd) == _topic){
                  this.log(_message, _name);
                }
              }
        });
    }
  }
  private changeConnStatus(Name:string, NewStatus:boolean):Array<MQTTConnectionModel> {
    let changed: Array<MQTTConnectionModel>
     for (var i in this.connections) {
       if (this.connections[i].Name == Name) {
          this.connections[i].status = NewStatus;
          //ConsoleLogService.log("MQTTService","@@@")
          //ConsoleLogService.log("MQTTService",this.connections[i])
          //ConsoleLogService.log("MQTTService",this.connections)
          changed = this.connections
          break; //Stop this loop, we found it!
       }
     }
     return changed;
  }
  public getConnByName(Name: string): MQTTConnectionModel{
    let arrayRes: Array<MQTTConnectionModel> = this.connections.filter((elem) => elem.Name === Name)
    if (arrayRes.length == 1){
      //ConsoleLogService.log("MQTTService","Element found: ");ConsoleLogService.log("MQTTService",arrayRes[0])
      return arrayRes[0]
    }
    else{
      return {Name:"-1", status:false, exist:false, MqttClient: null}
    }
  }


  private log(logCode: string, name: string){
    let dev = this.modOneBackEndService.getDeviceByNumber(name);
    if (!dev){return}
    this.centralLoggerService.log(logCode,dev.DB.Name, "DeviceOne")
  }
  public connect(Name: string, MQTTParObj:ConfigServiceMQTTParModel,callback?: Function): void {
      if(this.getConnByName(Name).Name == Name && this.getConnByName(Name).status == true){return}

      if (typeof callback !== 'function') {
          callback = (err) => {
              if (err) {/*this.log("System/Error", `MQTTService::connect: ${err}`, Name);*/}
          };
      }


      //let _port: number = 0
      // if(MQTTParObj.MQTTHost=='m11.cloudmqtt.com'){_port = 34113}
      // else if(MQTTParObj.MQTTHost=='broker.mqttdashboard.com'){_port = 8000}
      // else if(MQTTParObj.MQTTHost=='iot.eclipse.org'){_port = 80}
      // else{_port = MQTTParObj.MQTTPort}
      //console.log(_port)

      //Unfortunately we must set the Port to some hosts. It happens becouse the ESP and the APP works with different ports:
      let _MQTTPars: ConfigServiceMQTTParModel = JSON.parse(JSON.stringify(MQTTParObj))
      switch(MQTTParObj.MQTTHost) {
         case "m11.cloudmqtt.com": {
           //_MQTTPars.MQTTPort = 34113
            break;
         }
         case "broker.mqttdashboard.com": {
            //_MQTTPars.MQTTPort = 8000
            break;
         }
         case "iot.eclipse.org": {
           //_MQTTPars.MQTTPort = 80
           //_MQTTPars.MQTTPath = "/ws"
            break;
         }
         default: {
            break;
         }
      }


      let _conn
      this.addNewConn(Name, _conn);
      _conn = this.getConnByName(Name)

      _conn.MqttClient = new MqttClient({
          //Tested brokers:

          /*
          host: 'm11.cloudmqtt.com',
          port: 34113,
          username: 'bvxpyvvg',
          password: 'cYgr4xM3VKdz',
          ssl: true,
          cleanSession: false,

          path:"",
          clientId:null,
          timeout: 10,
          keepAliveInterval: 0,
          */

          /*
          host: 'broker.mqttdashboard.com',
          port: 8000,
          path: "",
          username: '',
          password: '',
          ssl: false,
          cleanSession: false,
          timeout: 10
          */

          /*
          host: 'iot.eclipse.org',
          port: 80,
          path: "/ws",
          username: '',
          password: '',
          ssl: false,
          cleanSession: false
          */

          /*
          host: 'broker.hivemq.com',
          port: 8000,
          path: "",
          username: '',
          password: '',
          ssl: false,
          cleanSession: false
          */

          /*
          host: 'broker.bevywise.com',
          port: 8443,
          path: "",
          username: 'UcSQ0Oteo578lxspev',
          password: 'mj7aCVs7Fe8wqcEDaj',
          ssl: false,
          cleanSession: false
          */



          //Pass MQTT config to the client:
          host: _MQTTPars.MQTTHost,
          port: _MQTTPars.MQTTWSPort,
          username: _MQTTPars.MQTTUser,
          password: _MQTTPars.MQTTUserPwd,
          ssl: (_MQTTPars.MQTTSSL == 0) ? false : true,
          cleanSession: (_MQTTPars.MQTTClearS == 0) ? false : true,

          path:_MQTTPars.MQTTPath,
          clientId:null,
          timeout: 10,
          keepAliveInterval: 0,


          //Not workig yet:
          // host: 'm.thingscale.io',
          // port: 8083,
          // path: "",
          // username: 'U000265',
          // password: 'C05C079E0B6AB10FC4291FB9FE325DB8',
          // ssl: false,
          // cleanSession: false

      });



      _conn.MqttClient.on('connect', () => {
          //this.changeConnStatus(Name, true)

          //this.log("System/Status", 'MQTTConnected', Name);
          ConsoleLogService.log("MQTTService","On connection sucess: " + Name)

          //this._connected = true;
          //this.changeConnStatus(Name, true)

          try {
              _conn.MqttClient.subscribe(this.topicPrefix + `/#`);this.changeConnStatus(Name, true)
          } catch (err) {
              ConsoleLogService.log("MQTTService","Fail to subscribe to: " + Name, ". Error: ", err)
              this.changeConnStatus(Name, false)
          }

          callback();
      });

      _conn.MqttClient.on('message', (topic, message) => {
          ConsoleLogService.log("MQTTService", "message",message,topic)
          message = message.toString();

          //this.log('Subscribed: ' + `${topic}, ${message}`, Name);


          try {
              message = JSON.parse(message);
              ConsoleLogService.log("MQTTService","callbackEntry!: ",message.devid)
          } catch (err) {
              // Do nothing
          }

          //Monitor Ever Messages ------------------------------------>>>
            this.monitorSubscribedEverList.forEach(callbackEntry => {

                if (callbackEntry.topic === topic) {

                    callbackEntry.callback(topic, message, Name);
                    //this.log("System/Subscribe", message, Name, topic);
                }
            });
          //Monitor Ever Messages ------------------------------------<<<

          //Monitor Once Messages ------------------------------------>>>
          this.monitorSubscribedOnceList.forEach(callbackEntry => {

              if (callbackEntry.id == message.devid) {
                  callbackEntry.callback(topic, message);
                  callbackEntry.status = 1;
                  callbackEntry.message = message;
                  //Now save this 'monitorSubscribedOnceList' element:
                  this.changeSubscribedOnceTopic(callbackEntry)
              }
          });
          //Monitor Once Messages ------------------------------------<<<
      });

      _conn.MqttClient.on('error', error => {
          this.changeConnStatus(Name, false)
          this.disconnect(Name)
          ConsoleLogService.log("MQTTService", "error")
          //this.log("System/Error", error, Name);
      });

      _conn.MqttClient.on('disconnect', () => {
          ConsoleLogService.log("MQTTService", "disconnect")
          //this._connected = false;
          this.changeConnStatus(Name, false)

          //this.monitorSubscribedEverList = [];

          //this.log("System/Status", 'disconnect', Name);
      });

      _conn.MqttClient.on('offline', () => {
          ConsoleLogService.log("MQTTService", "offline")
          this.changeConnStatus(Name, false)

          //this.monitorSubscribedEverList = [];
      });

      _conn.MqttClient.connect();
  }

  public disconnect(Name: string): void {
      let _conn = this.getConnByName(Name)
      if(!_conn || !_conn.MqttClient){return}
      _conn.MqttClient.disconnect();
      this.changeConnStatus(Name, false)
      //_conn.MqttClient = null
      //this.monitorSubscribedEverList = [];
  }

  private publish(name: string, topic: string, message: string, options?: any) {
    ConsoleLogService.log("MQTTService","LOL: ",this.connections)

    let _conn = this.getConnByName(name)

    function tryAgainPublish(_MqttClient: any, publishArgs:{topic,message,options}){//Call this function when 'MqttClient' is not connected, so try connect again in the near future!
      if(_MqttClient.connected != true){/*Do nothing here!*/}else{_MqttClient.publish(publishArgs.topic, publishArgs.message, publishArgs.options)}
    }

    if(_conn.MqttClient.connected == true){_conn.MqttClient.publish(topic, message, options)}else{setTimeout(tryAgainPublish.bind(null,_conn.MqttClient, {topic, message, options}),3000)}

  }



  //Monitor Subscribed topics:
  private monitorSubscribedOnceList: Array<SubscriptionOnceTopicModel> = []

  //SubscribeOnce - Publish and subscribe once(until the msg arrives from de publish):

  public SubscribeOnce(_ID: string, _Name: string, _msg:string, _callbackOk:(tp:string, msg:string)=>void, _callbackNok:(err:string)=>void) {
    //_ID = _ID.toString()
    //Declare the sender and revicer topics:
    let pubTopic: string = this.topicPrefix + "/ToDevice/" + _Name + "/"
    let subTopic: string = this.topicPrefix + '/FromDevice/Response/' + _Name + "/"
    //
    if (this.getSubTopicByID(_ID)){
      this.alertService.showOk("Aviso", "Ocupado. Aguarde..", "ok",()=>{_callbackNok("busy")})
      return
    }


    //First Publish the device command:
    this.publish(_Name, pubTopic, _msg, {retain: true, qos: 2});


    //Now Subscribe to the answer request:
    let newSubTopic: SubscriptionOnceTopicModel = {
        id: _ID,
        topic: subTopic,
        message: "",
        callback: _callbackOk,
        callbackFail: _callbackNok,
        status: -1
    }
    this.addSubscribedOnceTopic(newSubTopic);

    function MQTTSubscribe_afterTime(_topic: SubscriptionOnceTopicModel, _callOk: (topic:SubscriptionOnceTopicModel)=>void,_callFail: (err:{timeout:boolean})=>void, _callEnd: (top_id: string)=> void)
    {
      //ConsoleLogService.log("MQTTService","Topic is: "+_topic.topic);
      if (_topic.status !== 1){
        _callFail({timeout: true})
        ConsoleLogService.log("MQTTService","This topic fail: ",_topic.id);
      }
      else{
        //_callOk(_topic)//This call is done when the msg arrives 'on message' event, so we dont need call here again!
      }
      _callEnd(_topic.id)
    }
    setTimeout(MQTTSubscribe_afterTime.bind(null,newSubTopic,(top)=>{_callbackOk(top.topic,top.message)},(err)=>{_callbackNok(err)}, (top)=>{this.delSubscribedOnceTopic(top)}),6000)
  }
  //MonitorSubTopic List operators methods:

  private monitorSubscribedEverList: Array<SubscriptionEverTopicModel> = [];
  private SubscribeEver(topic:string, callback: (topic:string, message:string, Name:string)=>void) {
        this.monitorSubscribedEverList.push({
            topic: topic,
            callback: callback
        });
        /*
        function afterTime(msg,anyFnc)
        {
          ConsoleLogService.log("MQTTService","Msg is: "+msg);
          anyFnc(msg)
        }
        let abc = 5
        setTimeout(afterTime.bind(null,abc, (dt)=>{alert(dt)}),3000)
        */
    }

  private addSubscribedOnceTopic(obj: SubscriptionOnceTopicModel){
    if (this.getSubTopicByID(obj.id) === false){
      this.monitorSubscribedOnceList.push(obj)
      //ConsoleLogService.log("MQTTService","Sucess of funcion: 'addSubscribedOnceTopic()'. Array: ")
      ConsoleLogService.log("MQTTService","addSubscribedOnceTopic: ",this.monitorSubscribedOnceList, obj)
    }
    else{
      //ConsoleLogService.log("MQTTService","Fault of funcion: 'addSubscribedOnceTopic()'")
      this.changeSubscribedOnceTopic(obj)
    }
  }
  private delSubscribedOnceTopic(ID: string){
    for (var i in this.monitorSubscribedOnceList) {
      if (this.monitorSubscribedOnceList[i].id == ID) {
         this.monitorSubscribedOnceList.splice(Number(i), 1);
         break; //Stop this loop, we found it!
      }
    }
  }
  private changeSubscribedOnceTopic(obj: SubscriptionOnceTopicModel) {
     for (var i in this.monitorSubscribedOnceList) {
       if (this.monitorSubscribedOnceList[i].id == obj.id) {
          this.monitorSubscribedOnceList[i] = obj;
          //ConsoleLogService.log("MQTTService","Sucess of funcion: 'changeSubscribedOnceTopic(). Topic changed: " + JSON.stringify(obj))
          break; //Stop this loop, we found it!
       }
     }
  }
  private getSubTopicByID(ID: string): any{
    let arrayRes: Array<any> = this.monitorSubscribedOnceList.filter((elem) => elem.id === ID)
    if (arrayRes.length == 1){
      //ConsoleLogService.log("MQTTService","Element found: ");ConsoleLogService.log("MQTTService",arrayRes[0])
      return arrayRes[0]
    }
    else{
      return false
    }
  }

}
