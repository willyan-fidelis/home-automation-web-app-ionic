import { Injectable } from '@angular/core';
//import { LocalStorageService } from './local-storage-service';
//import { DeviceOneModel } from '../model/modOne-model';
import { HttpService } from './http-service';
//import { EspDetailMod1Model } from '../model/esp-detail-mod1-model';
import { KeyValuePairModel } from '../model/key-value-pair-model';
import { AlertService } from './alert-service'
import { ModOneBackEndService, DeviceOneModel,ModuleOneModel } from './modOne-backEnd-service';
import { MQTTService } from './mqtt.service'
import { ConsoleLogService, ObjectUtil } from '../static-class/object-util';
import { Events } from 'ionic-angular';
import { ConfigService, DeviceComunEnun, AppComunEnun } from './config-service';
import { CentralLoggerService} from './central.logger.service';

@Injectable()
export class ModOneApiService {
private timeout: number = 10000
  constructor(public centralLoggerService: CentralLoggerService, public events: Events, public configService: ConfigService, private mqtt: MQTTService, private modOneBackEndService: ModOneBackEndService, private httpService: HttpService, private alertService: AlertService) {
    ConsoleLogService.log("ModOneApiService",'Hello EspDetailMod1Service Provider');
    //this.esp = this.getEmpty();
    //this.findOutDevsPeriodic(30000)

    this.configService.getConfigObj((obj)=>{/*this.ip=obj.server.URL*/})
    this.events.subscribe("ConfigService:NewData",(obj)=>{/*this.ip=obj.server.URL*/})
  }

  //---------------------------------- Abstract methods ----------------------------------------->>>
  public  foundOutAllDevs():boolean {if(this.modOneBackEndService.getListLength() == this.foundDevs){return true}else{return false}}
  private foundDevs: number
  private HttpFindOutDevs(){
    //http://www.subnet-calculator.com/subnet.php?net_class=A
    this.foundDevs = 0

    let _myIP = "192.168.43.18"
    let _myMask = "255.255.255.0"

    let _ipSplited = _myIP.split(".")
    let _ip = _ipSplited[0] + "." + _ipSplited[1] + "." +  _ipSplited[2] + "."

    this.modOneBackEndService.getDeviceList((list)=>{
      //for(var obj of list){}
      for (var i = 0; i < 255; i++) {
        this.httpFindOut(_ip + i.toString(), (res)=>{
          let dev = this.modOneBackEndService.getDeviceByNumber(res.number)
          if(dev){
            this.getIp(dev.DB.Number,(res)=>{},(err)=>{})
            this.foundDevs = this.foundDevs + 1
            //dev.Local.ip.sta_ip = res.ip
            //this.modOneBackEndService.saveDevice(dev)
          }
        }, ()=>{})
      }
      console.log("Fim da busca!")
    })
  }
  private MQTTFindOutDevs(dev: DeviceOneModel){
    if(!dev){return}
    this.mqtt.disconnect(dev.DB.Number)
    //this.mqtt.connect(dev.DB.Number,dev.Local.MQTT)
  }
  public  findOutDevsPeriodic(time: number){ //Connect directly to the ESP8266. The ESP works as a server and the acees point could be either AP, STA and AP/STA
    var counter = 0;
    function _findOutDevsPeriodic(_comType, _callBack){
      if(_comType != "USER_APP.DIRECT_DEV"){
          clearInterval(i);
      }
      else{
        //this.findOutDevs()
        _callBack()
      }
    }
    var i = setInterval(_findOutDevsPeriodic.bind(null,this.getConnectionType(), ()=>{this.HttpFindOutDevs()}),time);
  }
  private setModRequestStatus(dev: DeviceOneModel, modIndex: number, status: string): DeviceOneModel{
    //console.log("lol");console.log(dev);console.log(modIndex)
    dev.temp.requestStatus.dev.reqStatus = status
    if(modIndex == -1){
      for(var i in dev.temp.requestStatus.dev.mod){

        dev.temp.requestStatus.dev.mod[i].reqStatus = status

      }
    }
    else{
      dev.temp.requestStatus.dev.mod[modIndex].reqStatus = status
    }
    return dev
  }
  public  getStatusPeriodic(time: number, callBackOk){ //Get status directly from the ESP8266. The ESP works as a server and the acees point could be either AP, STA and AP/STA

    var counter = 0;
    function _getStatusPeriodic(_comType, _getStatus){
      if(_comType != "USER_APP.DIRECT_DEV"){
          clearInterval(i);
      }
      else{
        //this.findOutDevs()
        _getStatus()
      }
    }
    var i = setInterval(_getStatusPeriodic.bind(null,this.getConnectionType(),(number, ip)=>{
      this.modOneBackEndService.getDeviceList((list)=>{

        for (let i in list){
          list[i] = this.setModRequestStatus(list[i],-1,"SENDING")
          //list[i].temp.lastModRequest[0] = -1;list[i].temp.lastModRequest[1] = -1;
          //list[i].temp.lastModRequest[2] = -1;list[i].temp.lastModRequest[3] = -1;list[i].temp.lastModRequest[4] = -1;
          this.GetStatus(list[i].DB.Number, (res)=>{
            let dev = this.modOneBackEndService.getDeviceByNumber(res.number)

            if(dev){

              dev = this.setModRequestStatus(dev,-1,"OK")

              dev.temp.lastModRequest[0] = 1;list[i].temp.lastModRequest[1] = 1;
              dev.temp.lastModRequest[2] = 1;list[i].temp.lastModRequest[3] = 1;list[i].temp.lastModRequest[4] = 1;
              dev.Local.Status = res
              dev.Local.ip.sta_ip = res.ip

              this.modOneBackEndService.saveDevice(dev)
              console.log('Success getStatusPeriodic!')
              //console.log(dev)
            }
          }, (err, numb)=>{

            let dev = this.modOneBackEndService.getDeviceByNumber(numb)
            if (dev){
              dev = this.setModRequestStatus(dev,-1,"NOK")
              dev.temp.lastModRequest[0] = -2;list[i].temp.lastModRequest[1] = -2;
              dev.temp.lastModRequest[2] = -2;list[i].temp.lastModRequest[3] = -2;list[i].temp.lastModRequest[4] = -2;
              this.modOneBackEndService.saveDevice(dev)
              console.log('Error getStatusPeriodic: '+numb)
            }
          })
        }
        this.modOneBackEndService.getDeviceList((_list)=>{setTimeout(callBackOk(_list),3000)})

      })
    }),time);
  }
  public  getModRequestStatus(deviceName: string, index: number): string{ //Get HTTP or MQTT request status
    let dev = this.modOneBackEndService.getDeviceByName(deviceName)
    if(dev){
      return dev.temp.requestStatus.dev.mod[index].reqStatus
    }
    else{
      return "NOK"
    }
  }
  public  getDevRequestStatus(deviceName: string): string{
    let dev = this.modOneBackEndService.getDeviceByName(deviceName)
    if(dev){
      return dev.temp.requestStatus.dev.reqStatus
    }
    else{
      return "NOK"
    }
  }
  public  getResumeStatus(deviceName: string, index: number, ignoreSending: boolean): string{

    let dev = this.modOneBackEndService.getDeviceByName(deviceName)
    //console.log('GetResumeStatus: ');console.log(deviceName);console.log(index);console.log(ignoreSending);console.log(dev)
    if(dev){
      switch(dev.temp.requestStatus.dev.mod[index].reqStatus) {
         case "OK": {
            //console.log("OK");
            if(index < 2){
              let mod_index: string = 'M' + index
              if(dev.Local.Status.out[mod_index] == true){return "ON"}else{return "OFF"}
            }
            if(index >= 2){
              //console.log('HHH: ');console.log(dev.DB.ModuleList[index].Position)
              if(dev.Local.Status.rgb[index-2] == 0){return "OFF"}else{return "ON"}
            }
            break;
         }
         case "NOK": {
            //console.log("NOK");
            return "NOK"
            //break;
         }
         case "SENDING": {
            //console.log("SENDING");
            if(ignoreSending == true){
              if(index < 2){
                let mod_index: string = 'M' + index
                if(dev.Local.Status.out[mod_index] == true){return "ON"}else{return "OFF"}
              }
              if(index >= 2){
                //console.log('III: ');console.log(dev.DB.ModuleList[index].Position)
                if(dev.Local.Status.rgb[index-2] == 0){return "OFF"}else{return "ON"}
              }
            }
            else{return "SENDING"}
            break;
         }
         default: {
            //console.log("Invalid choice");
            break;
         }
      }
    }
    else{
      return "NOK"
    }
  }

  public  toggleCommand(_device: DeviceOneModel, _modIndex){
      let outID: string;
      let m0Cmd: number = 0
      let m1Cmd: number = 0
      if (_device.DB.ModuleList[_modIndex].Position == 1){
        outID = "M0";
        m0Cmd = 3;
      }
      else if (_device.DB.ModuleList[_modIndex].Position == 2){
        outID = "M1";
        m1Cmd = 3;
      }
      else{
        return
      }
      //Send the command:
      this.setModRequestStatus(_device,_modIndex,"SENDING")

      _device.temp.lastModRequest[_modIndex] = -1;

      function _ok(_dev: DeviceOneModel,_res: any, _modIndex: number, _callBack: (_dev: DeviceOneModel, _index: number) => any){
        _dev.temp.lastModRequest[_modIndex] = 1;

        _dev.Local.Status = _res
        _dev.Local.ip.sta_ip = _res.ip
        _dev.Local.Status.out.M0 = (_dev.Local.General.M0 != 1) ? _dev.Local.Status.out.M0: false//General.M0 is the module type, where one is pulsing type
        _dev.Local.Status.out.M1 = (_dev.Local.General.M1 != 1) ? _dev.Local.Status.out.M1: false//General.M1 is the module type, where one is pulsing type
        _callBack(_dev,_modIndex)
      }
      function _nok(_dev: DeviceOneModel,_err: any, _index: number, _callBack: (_dev: DeviceOneModel, _index: number) => any){
        _dev.temp.lastModRequest[_index] = -2;
        _callBack(_dev,_index)
      }

      this.cmdTurn(_device.DB.Number, m0Cmd, m1Cmd, (res)=>{
        setTimeout(_ok.bind(null,_device,res,_modIndex,(_dev,_index)=>{this.modOneBackEndService.saveDevice(_dev);this.setModRequestStatus(_dev,_index,"OK")}),1)
      }, (err)=>{
        setTimeout(_nok.bind(null,_device,err,_modIndex,(_dev,_index)=>{this.modOneBackEndService.saveDevice(_dev);this.setModRequestStatus(_dev,_index,"NOK")}),1)
      })
  }
  public  setRGB(_device: DeviceOneModel, _modIndex){
    let RGBIndex: number = 0;
    let value: number = 0;
    if (_device.DB.ModuleList[_modIndex].Position == 3){
      RGBIndex = 0;
    }
    else if (_device.DB.ModuleList[_modIndex].Position == 4){
      RGBIndex = 1;
    }
    else if (_device.DB.ModuleList[_modIndex].Position == 5){
      RGBIndex = 2;
    }
    else{
      return
    }

    if (_device.Local.Status.rgb[RGBIndex] === 0){
      value = 1023
    }
    else{
      value = 0
    }
    //Send the command:
    this.setModRequestStatus(_device,_modIndex,"SENDING")

    _device.temp.lastModRequest[_modIndex] = -1;

    function _ok(_dev: DeviceOneModel,_res: any, _modIndex: number, _callBack: (_dev: DeviceOneModel, _index: number) => any){
      _dev.temp.lastModRequest[_modIndex] = 1;

      _dev.Local.Status = _res
      _dev.Local.ip.sta_ip = _res.ip
      _callBack(_dev,_modIndex)
    }
    function _nok(_dev: DeviceOneModel,_err: any, _index: number, _callBack: (_dev: DeviceOneModel, _index: number) => any){
      _dev.temp.lastModRequest[_index] = -2;
      _callBack(_dev,_index)
    }
    this.cmdSetRGB(_device.DB.Number,_device.Local.ip.sta_ip, RGBIndex, value, (res)=>{
      setTimeout(_ok.bind(null,_device,res,_modIndex,(_dev,_index)=>{this.modOneBackEndService.saveDevice(_dev);this.setModRequestStatus(_dev,_index,"OK")}),1)
    }, (err)=>{
      setTimeout(_nok.bind(null,_device,err,_modIndex,(_dev,_index)=>{this.modOneBackEndService.saveDevice(_dev);this.setModRequestStatus(_dev,_index,"NOK")}),1)
    })
  }

  //---------------------------------- Abstract methods -----------------------------------------<<<

  private nextRequestIgnored: boolean = false
  public  ignoreNextRequest(time: number){//
    if (!this.nextRequestIgnored){
      setTimeout(()=>{this.nextRequestIgnored = false}, time)
    }
    this.nextRequestIgnored = true
  }
  public  reqError(){
    return this.requestError
  }
  public  reqRunning(){
    return this.requestRunning || this.animationRunning
  }
  private requestError: boolean = false
  private requestRunning: boolean = false
  private animationRunning: boolean = false
  private requestID: number = 0;
  //public useRemoteCtrl: boolean = false
  public defaultAP_IP: string = "192.168.4.1"//Default Acess Point IP

  private MQTTPSubrequest(_ID: string, _device: DeviceOneModel, _url: string, _callBackOk, _callBackNotOk){
    if(!_device){return}
    this.MQTTConnect(_device)


    //let conn = this.mqtt.getConnByName(_number)
    //if(conn.status){
    //if(this.mqtt._connected){
      _url ="/?" + _url + "?/";
      //this.mqtt.publish("/HomeSense/ToDevice/" + _number + "/", _url, {retain: true, qos: 2});

      this.animationRunning = true;this.requestRunning = true; this.requestError = false
      this.mqtt.SubscribeOnce(_ID, _device.DB.Number, _url, (topic: string, res: any) => {
            if(_device.Local.DevComun.type != DeviceComunEnun.MQTT){return false}
            //ConsoleLogService.log("ModOneApiService","MQTTSubscribe Ok!: " + JSON.stringify(res))
            //ConsoleLogService.log("ModOneApiService","MQTTSubscribe Ok! Topic: ")
            //ConsoleLogService.log("ModOneApiService","MQTTSubscribe get this obj: ")
            //ConsoleLogService.log("ModOneApiService",res)
            setTimeout(()=>{
              if (this.requestRunning === false){
                this.animationRunning = false;
              }
            },1000)

            if (res.status === "error"){
              this.animationRunning = false;this.requestRunning = false; this.requestError = true;
              //if (_useRemoteCtrl){this.remoteRequestNokMsg()}else{_callBackNotOk(res)}
              _callBackNotOk(res)
            }

            else{
              this.requestRunning = false;
              //if (_useRemoteCtrl){this.remoteRequestOkMsg()}else{_callBackOk(res)}
              _callBackOk(res)
            }
        }, (error)=>{
          //ConsoleLogService.log("ModOneApiService","MQTTSubscribe Fail!")
          this.animationRunning = false;this.requestRunning = false; this.requestError = true;_callBackNotOk(error)
        });
      //this.mqtt.subscribe("/HomeSense/FromDevice/Response/" + _number + "/", (topic: string, resp: string) =>{ConsoleLogService.log("ModOneApiService","Subscribe Ok! Topic: " + JSON.stringify(topic))})
    //}
  }


  //------------------------ Connect ------------------------
  private connectionType: string = "USER_APP.DIRECT_DEV";
  public setConnectionType(type: string){
    this.connectionType = type;
  }
  public getConnectionType(): string{
    return this.connectionType;
  }

  public MQTTConnect(_device: DeviceOneModel): boolean{
    if(!_device){return}

    this.mqtt.connect(_device.DB.Number,_device.Local.MQTT,()=>{});
    return true
  }

  public DirectESPConnect(){ //Connect directly to the ESP8266. The ESP works as a server and the acees point could be either AP, STA and AP/STA
    var counter = 0;
    function _DirectESPConnect(_comType, _callBack){
      if(_comType != "USER_APP.DIRECT_DEV" || this.foundOutAllDevs() == true){
          clearInterval(i);
      }
      else{
        //this.findOutDevs()
        _callBack()
      }
    }
    var i = setInterval(_DirectESPConnect.bind(null,this.getConnectionType(), ()=>{this.HttpFindOutDevs()}),30000);
  }

  public ESPGatwayConnect(){ //The user buy a ESP8266 that works as a gatway. This gatway conect with each other ESP server directly

  }

  public findOutDevs(dev: DeviceOneModel){ //Choose one of the folowing methods: MQTTConnect, DirectESPConnect or ESPGatwayConnect
    this.foundDevs = 0
    this.HttpFindOutDevs()
    this.MQTTFindOutDevs(dev)
  }
  //------------------------ Connect ------------------------

  //Forward MSG TO MQTT Methods -------------------------->>>

  public forwardMSGToDeviceByMQTT(_device: DeviceOneModel){//Forward message to device by means of MQTT
    //_device.Local.DevComun.AppRouter.MQTT
  }
  public forwardMSGToDeviceBySMS(_device: DeviceOneModel){//Forward message to device by means of MQTT
    //_device.Local.DevComun.AppRouter.MQTT
  }
  //Forward MSG TO MQTT Methods --------------------------<<<

  public subscribeRequest(_device: DeviceOneModel, _url: string, _callBackOk, _callBackNotOk){

    if (!_device){
      _callBackNotOk()
      return
    }
    if(_device.Local.DevComun.type == DeviceComunEnun.MQTT){
      this.MQTTPSubrequest(this.requestID.toString(), _device, _url, _callBackOk, _callBackNotOk)
    }
    else if(_device.Local.DevComun.type == DeviceComunEnun.WIFI_DIRECT || _device.Local.DevComun.type == DeviceComunEnun.WIFI_LOCAL){
      _url ="/?" + _url + "?/"; //Add the pre-fix and su-fix mark on the url:
      let _ip:string = (_device.Local.DeviceType.ip == "") ? _device.Local.ip.sta_ip : _device.Local.DeviceType.ip//_device.Local.ip.sta_ip
          if (_device.Local.DevComun.type == DeviceComunEnun.WIFI_DIRECT){
            _ip = (_device.Local.DeviceType.ip == "") ? this.defaultAP_IP : this.defaultAP_IP//this.defaultAP_IP
          }
          if (this.nextRequestIgnored){
            this.animationRunning = false;this.requestRunning = false; this.requestError = true
            if (_device.Local.DevComun.type == DeviceComunEnun.MQTT){this.remoteRequestNokMsg()}else{_callBackNotOk()}
            //_callBackNotOk()
            return
          }
          this.animationRunning = true;this.requestRunning = true; this.requestError = false
          this.httpService.subscribeRequest(this.timeout, _ip, _url, (res)=>{
            setTimeout(()=>{
              if (this.requestRunning === false){
                this.animationRunning = false;
              }
            },1000)

            if (res.status === "error"){
              this.animationRunning = false;this.requestRunning = false; this.requestError = true;
              if (_device.Local.DevComun.type == DeviceComunEnun.MQTT){this.remoteRequestNokMsg()}else{_callBackNotOk(res)}
              //_callBackNotOk(res)
            }
            else{
              this.requestRunning = false;
              if (_device.Local.DevComun.type == DeviceComunEnun.MQTT){this.remoteRequestOkMsg()}else{
                //Recive HTTP Message Buffer --->>>
                let bufferMsg: Array<string> = res.bufferMsg
                if( bufferMsg && Array.isArray(bufferMsg) ){bufferMsg.forEach((elem)=>{this.centralLoggerService.log(elem,_device.DB.Name, "DeviceOne")})}
                //Recive HTTP Message Buffer ---<<<
                _callBackOk(res)
              }
              //_callBackOk(res)
            }

          }, (error)=>{this.animationRunning = false;this.requestRunning = false; this.requestError = true;_callBackNotOk(error)})
    }
    else if(_device.Local.DevComun.type == DeviceComunEnun.APP_ROUTER){
      if(_device.Local.DevComun.AppRouter.AppComun == AppComunEnun.MQTT){
        this.forwardMSGToDeviceByMQTT(_device)
      }
      else if(_device.Local.DevComun.AppRouter.AppComun == AppComunEnun.SMS){
        this.forwardMSGToDeviceBySMS(_device)
      }
    }
    else{}
    this.requestID = this.requestID + 1;
  }

  public remoteRequestOkMsg(){
    //ConsoleLogService.log("ModOneApiService","!!!")
    this.alertService.showOk("Aviso", "Sua solicitação foi recebida com sucesso no servidor HomeSense. Aguarde alguns minutos para que o dispositivo veja seu requerimento!", "ok",()=>{})
  }
  public remoteRequestNokMsg(){
    //ConsoleLogService.log("ModOneApiService","!!!")
    this.alertService.showOk("Aviso", "Falha ao tentar enviar solicitação ao servior HomeSense! Verifique sua conexão com a internet!", "ok",()=>{})
  }

  //----------- Textual Commands ----------->>>

  textCommandList: Array<{name: string, type: string,  commandList: Array<string>, wellDonekMsg: string, ackMsg: string, confirmMsg: string}> = [
    {name: "helpPlus", type:"textOnly",  commandList: ["ajuda detalhada"],        wellDonekMsg:"Qualquer duvida estou aqui!", ackMsg: "Para mais detalhes veja os videos no site oficial.", confirmMsg: "Ok. Vou te ajudar"},
    {name: "help",     type:"textOnly",  commandList: ["ajuda", "help"],          wellDonekMsg:"Qualquer duvida estou aqui!", ackMsg: "Comandos válidos: Ligar ou acionar, desligar ou desacionar, inverter ou mudar estado. Além desses comando você pode falar ver estado do dispositivo 1, por exemplo!", confirmMsg: "Ok. Vou te ajudar detalhadamente"},
    {name: "turnOn",   type:"mod",       commandList: ["ligar", "aciona", "ligar", "aciona"],       wellDonekMsg:"Comando ligar realizado com sucesso!", ackMsg: "Commando ligar identificado!", confirmMsg: "Deseja mesmo ligar?"},
    {name: "turnOff",  type:"mod",       commandList: ["desligar", "desacionar", "desliga", "desaciona"], wellDonekMsg:"Comando desligar realizado com sucesso!", ackMsg: "Commando desligar identificado!", confirmMsg: "Deseja mesmo desligar?"},
    {name: "toggle",   type:"mod",       commandList: ["inverter", "inverte"],               wellDonekMsg:"Comando inverter realizado com sucesso!", ackMsg: "Commando inverter identificado!", confirmMsg: "Deseja mesmo mudar o estado?"},
    {name: "status",   type:"dev",       commandList: ["status", "estado", "situacao"],       wellDonekMsg:"Comando verificar status realizado com sucesso!", ackMsg: "Verificando estado..", confirmMsg: "Verificando estado. Aguarde"}
  ]
  lastTextCommand: {name: string, type: string, commandList: Array<string>, wellDonekMsg: string, ackMsg: string, confirmMsg: string} = {name: "", type:"", commandList: [""], wellDonekMsg:"", ackMsg: "", confirmMsg: ""};
  lastTextCommand_Dev_Mod: {device:DeviceOneModel,module:ModuleOneModel};
  lastTextCommandErrCode: string = ""
  public searchTextCommand(command: string, commandKey: string):boolean{
    command = ObjectUtil.removeAccents(command).toLowerCase()
    commandKey = ObjectUtil.removeAccents(commandKey).toLowerCase()
    /*
    Regular Expretion(RegEx) was not used for many reason..Nut here an use exemple:
    --- Code ---
    var re = new RegExp('abc');
    console.log(re.test("abc"))
    --- Code ---
    Instead of it uses string methods like 'split, indexOf' and array filters like 'some' becouse it is powerfull too..
    */
    // function findWord(word, str) {
    //   //https://stackoverflow.com/questions/25493984/javascript-find-word-in-string
    //   return str.split(' ').some(function(w){return w === word}) //The same with RegEx: return RegExp('\\b'+ word +'\\b').test(str)
    // }

    //Check if the keyword is correct:
    if (commandKey != ""){
      if (!ObjectUtil.findWord(commandKey, command)){
        ConsoleLogService.log("ModOneApiService","Palavra chave não reconhecida!")
        return false
      }
    }
    for(var obj of this.textCommandList){
      //Find any command:
      if(ObjectUtil.findWordOrPhraseList(obj.commandList,command)){
      ConsoleLogService.log("ModOneApiService","Msg lida: "+obj.commandList)
        //Save the last command:
        this.lastTextCommand = obj
        //Text(like help..) Commands:
        if(obj.type == "textOnly"){
          if(ObjectUtil.findWordOrPhraseList(obj.commandList,command)){
            ConsoleLogService.log("ModOneApiService",obj.ackMsg)
            return true
          }
        }
        //Device commands:
        else if(obj.type == "dev"){
          //Check if the device name and the module name is correct:
          this.lastTextCommand_Dev_Mod = this.modOneBackEndService.serachtDeviceModByText(command, command)
          ConsoleLogService.log("ModOneApiService",this.lastTextCommand_Dev_Mod)
          //Check if it exists:
          if (!this.lastTextCommand_Dev_Mod.device){
            this.lastTextCommandErrCode = "Nome do dispositio não reconhecido!"
            ConsoleLogService.log("ModOneApiService",this.lastTextCommandErrCode)
            return false
          }
          else{
            ConsoleLogService.log("ModOneApiService",obj.ackMsg)
            return true
          }
        }
        //Module commands:
        else if(obj.type == "mod"){
          //Check if the device name and the module name is correct:
          this.lastTextCommand_Dev_Mod = this.modOneBackEndService.serachtDeviceModByText(command, command)
          ConsoleLogService.log("ModOneApiService",this.lastTextCommand_Dev_Mod)
          //Check if it exists:
          if (!this.lastTextCommand_Dev_Mod.device){
            this.lastTextCommandErrCode = "Nome do dispositio não reconhecido!"
            ConsoleLogService.log("ModOneApiService",this.lastTextCommandErrCode)
            return false
          }
          else{
            if (!this.lastTextCommand_Dev_Mod.module){
              this.lastTextCommandErrCode = "Nome do controle não reconhecido!"
              ConsoleLogService.log("ModOneApiService",this.lastTextCommandErrCode)
              return false
            }
            else{
              ConsoleLogService.log("ModOneApiService",obj.ackMsg)
              return true
            }
          }
        }
      }
    }
    this.lastTextCommandErrCode = "Comando não reconhecido!"
    ConsoleLogService.log("ModOneApiService",this.lastTextCommandErrCode)
    return false
    //
    // //Check if the keyword is correct:
    // if (commandKey != ""){
    //   if (!ObjectUtil.findWord(commandKey, command)){
    //     ConsoleLogService.log("ModOneApiService","Palavra chave não reconhecida!")
    //     return "Palavra chave não reconhecida!"
    //   }
    // }
    //
    // //Detail Help command:
    // if (ObjectUtil.findWordOrPhraseList(["ajuda detalhada"], command)){
    //   ConsoleLogService.log("ModOneApiService","Comandos validos: Ligar ou acionar, desligar ou desacionar, inverter ou mudar estado. Alem desses comando você pode falar ver estado do modulo 1 por exemplo!")
    //   return "Comandos validos: Ligar ou acionar, desligar ou desacionar, inverter ou mudar estado. Alem desses comando você pode falar ver estado do modulo 1 por exemplo!"
    // }
    //
    // //Help command:
    // if (ObjectUtil.findWordList(["ajuda", "ajudar"], command)){
    //   ConsoleLogService.log("ModOneApiService","Bem vindo a central de ajuda. Diga ligar luz 1 do modulo da sala por exemplo. Para mais detalhes diga ajuda detalhada!")
    //   return "Bem vindo a central de ajuda. Diga ligar luz 1 do modulo da sala por exemplo. Para mais detalhes diga ajuda detalhada!"
    // }
    //
    // //Check if the device name and the module name is correct:
    // let dev_mod = this.modOneBackEndService.serachtDeviceModByText(command, command)
    // ConsoleLogService.log("ModOneApiService",dev_mod)
    // if (!dev_mod){
    //   ConsoleLogService.log("ModOneApiService","Nome do dispositio ou controle não reconhecido!")
    //   return "Nome do dispositio ou controle não reconhecido!"
    // }
    //
    // if (dev_mod.module){
    // //Module commands:
    // if (ObjectUtil.findWordList(["ligar", "acionar"], command)){
    //   this.comdTurnByPosition(1,dev_mod.device.DB.Number,dev_mod.module.Position,dev_mod.device.Local.ip.sta_ip,()=>{},()=>{})
    //   ConsoleLogService.log("ModOneApiService","Commando 'ligar' identificado!")
    // }
    // else if (ObjectUtil.findWordList(["desligar", "desacionar"], command)){
    //   this.comdTurnByPosition(2,dev_mod.device.DB.Number,dev_mod.module.Position,dev_mod.device.Local.ip.sta_ip,()=>{},()=>{})
    //   ConsoleLogService.log("ModOneApiService","Commando 'desliga' identificado!")
    // }
    // else if (ObjectUtil.findWordOrPhraseList(["inverter", "mudar estado"], command)){
    //   this.comdTurnByPosition(3,dev_mod.device.DB.Number,dev_mod.module.Position,dev_mod.device.Local.ip.sta_ip,()=>{},()=>{})
    //   ConsoleLogService.log("ModOneApiService","Commando 'inverter' identificado!")
    // }
    // else{
    //   ConsoleLogService.log("ModOneApiService","Nenhum comando identificado identificado!")
    //   return "Nenhum comando identificado identificado!"
    // }
    // }
    // else{
    //   //Device commands:
    //   if(ObjectUtil.findWordOrPhrase("ver status", command)){
    //     this.GetStatus(dev_mod.device.DB.Number,dev_mod.device.Local.ip.sta_ip,(res)=>{
    //       let resp =
    //       'O primeiro interruptor esta ' + (res.InputM0 == 1 ? 'ligado' : 'desligado') +
    //       ', o segundo interruptor esta ' + (res.InputM1 == 1 ? 'ligado' : 'desligado') +
    //       ' e o sensor esta ' + (res.Sensor == 1 ? 'ligado' : 'desligado')
    //
    //       ConsoleLogService.log("ModOneApiService",res)
    //       ConsoleLogService.log("ModOneApiService",resp)
    //     },(err)=>{
    //       ConsoleLogService.log("ModOneApiService",err)
    //     })
    //     ConsoleLogService.log("ModOneApiService","Commando 'ver status' identificado!")
    //   }
    //   else{
    //     ConsoleLogService.log("ModOneApiService","Nenhum comando identificado identificado!")
    //     return "Nenhum comando identificado identificado!"
    //   }
    // }
    //
    // return ""
  }
  public confirmTextCommandMsg():string{
    ConsoleLogService.log("ModOneApiService",this.lastTextCommand.confirmMsg)
    return this.lastTextCommand.confirmMsg
  }
  public doTextCommand(command: string, commandKey: string, withCheck: boolean, _callBackMsg):boolean{
    if(withCheck){
      command = ObjectUtil.removeAccents(command).toLowerCase()
      commandKey = ObjectUtil.removeAccents(commandKey).toLowerCase()
      if (commandKey != ""){
        if (!ObjectUtil.findWord(commandKey, command)){
          ConsoleLogService.log("ModOneApiService","Palavra chave não reconhecida!")
          _callBackMsg("Comando abortado!")
          return false
        }
      }

      if (!ObjectUtil.findWordOrPhraseList(["sim", "confirmar", "confirma", "ok", "por favor", "positivo"], command)){
        ConsoleLogService.log("ModOneApiService","Comando abortado!")
        _callBackMsg("Comando abortado!")
        return false
      }
    }

    if(this.lastTextCommand.type == "textOnly"){
      //Do nothing. Only send the well done message!
      ConsoleLogService.log("ModOneApiService",this.lastTextCommand.ackMsg+" ."+this.lastTextCommand.wellDonekMsg)
      _callBackMsg(this.lastTextCommand.ackMsg+" ."+this.lastTextCommand.wellDonekMsg)
      return true
    }
    else{
      if(this.lastTextCommand.name == "turnOn"){
        if(!this.lastTextCommand_Dev_Mod.module){return false}
        _callBackMsg(this.lastTextCommand.wellDonekMsg)
        this.comdTurnByPosition(1,this.lastTextCommand_Dev_Mod.device.DB.Number,this.lastTextCommand_Dev_Mod.module.Position,this.lastTextCommand_Dev_Mod.device.Local.ip.sta_ip,()=>{},()=>{})
      }
      if(this.lastTextCommand.name == "turnOff"){
        if(!this.lastTextCommand_Dev_Mod.module){return false}
        _callBackMsg(this.lastTextCommand.wellDonekMsg)
        this.comdTurnByPosition(2,this.lastTextCommand_Dev_Mod.device.DB.Number,this.lastTextCommand_Dev_Mod.module.Position,this.lastTextCommand_Dev_Mod.device.Local.ip.sta_ip,()=>{},()=>{})
      }
      if(this.lastTextCommand.name == "toggle"){
        if(!this.lastTextCommand_Dev_Mod.module){return false}
        _callBackMsg(this.lastTextCommand.wellDonekMsg)
        this.comdTurnByPosition(3,this.lastTextCommand_Dev_Mod.device.DB.Number,this.lastTextCommand_Dev_Mod.module.Position,this.lastTextCommand_Dev_Mod.device.Local.ip.sta_ip,()=>{},()=>{})
      }
      if(this.lastTextCommand.name == "status"){
        //_callBackMsg("Aguardando status do dispositivo..")
        this.GetStatus(this.lastTextCommand_Dev_Mod.device.DB.Number,(res)=>{
              let resp =
              'O primeiro interruptor está ' + (res.InputM0 == 1 ? 'ligado' : 'desligado') +
              ', o segundo interruptor está ' + (res.InputM1 == 1 ? 'ligado' : 'desligado') +
              ' e o sensor está ' + (res.Sensor == 1 ? 'ligado' : 'desligado') +
              '. A primeira saída está ' + (res.out.M0 == false ? 'ligada' : 'desligada') +
              ' e a segunda saída está ' + (res.out.M1 == false ? 'ligada' : 'desligada')
              _callBackMsg(resp)
              ConsoleLogService.log("ModOneApiService",res)
              ConsoleLogService.log("ModOneApiService",resp)
            },(err)=>{
              _callBackMsg("Erro ao tentar verificar o estado.")
              ConsoleLogService.log("ModOneApiService",err)
            })
            //setInterval(()=>{_callBackMsg("Ocorreu um erro. Disporitivo não esta respondendo!")},4000)

            //setTimeout(()=>{_callBackMsg("Ocorreu um erro. Disporitivo não esta respondendo!")},4000)
            //_callBackMsg("Aguardando status do dispositivo..")
      }
      ConsoleLogService.log("ModOneApiService",this.lastTextCommand.wellDonekMsg)
      true
    }
  }
  public isTextCommandOnlyGetMsg(){
    if(this.lastTextCommand.name == "status" || this.lastTextCommand.type == "textOnly"){
      return true
    }
    else{
      return false
    }
  }

  //----------- Textual Commands -----------<<<

  //----------- Commands to device ----------->>>

  public cmdSetRGB(_number:string,_ip: string, _index: number, _value: number, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    let outPins = [8,6,7]
    let _parm: KeyValuePairModel[] = [{key:"cmd.devid", value:this.requestID},{key:"cmd._number", value:_number},{key:"cmd.id", value:"setrgb"},{key:"cmd.out", value:outPins[_index]},{key:"cmd.v", value:_value}]
    this.subscribeRequest(_dev, this.httpService.espSerialize(_parm), (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  public cmdTurn(_number:string, _out0: number, _out1: number, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    let _parm: KeyValuePairModel[] = [{key:"cmd.devid", value:this.requestID},{key:"cmd._number", value:_number},{key:"cmd.id", value:"turn"},{key:"cmd.m0", value:_out0},{key:"cmd.m1", value:_out1}]
    this.subscribeRequest(_dev, this.httpService.espSerialize(_parm), (res)=>{


      let _res:GetStatusModOneAPIModel = res
      let dev = this.modOneBackEndService.getDeviceByNumber(res.number); if(dev){
        dev.Local.Status = _res;this.modOneBackEndService.saveDevice(dev)
        // let bufferMsg: Array<string> = res.bufferMsg
        // bufferMsg.forEach((elem)=>{this.centralLoggerService.log(elem,dev.DB.Name, "DeviceOne")})
      }
      _callBackOk(res)
    }, (error)=>{_callBackNotOk(error)})
  }
  public comdTurnByPosition(_cmd, _number, _poition, _ip, callbackOk:()=>void,callbackNok:()=>void){
    _poition = _poition - 1
    if(_poition<=1){
      let cmd0 = 0
      let cmd1 = 0
      if(_poition == 0){
        cmd0 = _cmd
      }
      if(_poition == 1){
        cmd1 = _cmd
      }
      this.cmdTurn(_number, cmd0, cmd1, (res)=>{
        callbackOk()
      }, (err)=>{callbackNok()})
    }
  }

  //----------- Commands to device -----------<<<

  //----------- HTTP funcions ----------->>>

  public httpFindOut(_ip: string, _callBackOk: (res: GetDeviceTypeModOneAPIModel) => void, _callBackNotOk:(err:any)=>void){
    let _url: string = '{"cmd.devid":"'+"-100"/*this.requestID*/+'","cmd.id":"getdevicetype"}'
    _url ="/?" + _url + "?/";
    //The url this methodo is the same that 'getDeviceType'. The unique diference is the 'requestID' field that is always -100:
    this.httpService.subscribeRequest(this.timeout, _ip, _url, (res)=>{
    let _res:GetDeviceTypeModOneAPIModel = res
    let dev = this.modOneBackEndService.getDeviceByNumber(res.number); if(dev){dev.Local.DeviceType = _res;this.modOneBackEndService.saveDevice(dev)}
    ConsoleLogService.log("ModOneApiService",'Result(GetStatus): ',res,_res);
    _callBackOk(res)
    }, (error)=>{_callBackNotOk(error)})
  }

  //----------- HTTP funcions -----------<<<

  //----------- Set data to device ----------->>>

  public SetTime(_number:string,_ss: string,_min: string,_hh: string,_w: string,_dd: string,_mm: string,_yy: string, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    let _parm: KeyValuePairModel[] = [{key:"cmd.devid", value:this.requestID},{key:"cmd._number", value:_number},{key:"cmd.id", value:"settime"},{key:"cmd.s", value:_ss},{key:"cmd.min", value:_min},{key:"cmd.h", value:_hh},{key:"cmd.w", value:_w},{key:"cmd.d", value:_dd},{key:"cmd.m", value:_mm},{key:"cmd.y", value:_yy}]
    this.subscribeRequest(_dev, this.httpService.espSerialize(_parm), (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  //Time event(TE)
  //_eventIndex(values: 1 or 2),_enb(values:true or false),_h(values: 0-24 hrs),_min(0-60 min),action1(0,1,2 or 3),action2(0,1,2 or 3),_weekDaysArray(true,false)

  public EditEventTE(_number:string,_eventIndex,_enb,_h,_min,_act1,_act2,_weekDaysArray: boolean[], _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"db","data":{"te":{"i'+_eventIndex+'":{"enb":'+_enb+',"wk_days":{"i7":'+_weekDaysArray[6]+',"i6":'+_weekDaysArray[5]+',"i5":'+_weekDaysArray[4]+',"i4":'+_weekDaysArray[3]+',"i3":'+_weekDaysArray[2]+',"i2":'+_weekDaysArray[1]+',"i1":'+_weekDaysArray[0]+'},"cmd":{"m0":'+_act1+',"m1":'+_act2+'},"h":'+_h+',"m":'+_min+'}}}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  //Presence event(PE)
  //_eventIndex(values: 1 or 2),_enb(values:true or false),_dy_min(Delay in minutes: 0-60 min),action1(0,1,2 or 3),action2(0,1,2 or 3),_prdIndex(1 or 2. See EditEventPrd)

  public EditEventPE(_number:string,_eventIndex,_enb,_dy_sec,_act1,_act2,_prdIndex, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"db","data":{"pe":{"i'+_eventIndex+'":{"cmd":{"m1":'+_act2+',"m0":'+_act1+'},"prd":'+_prdIndex+',"dy_sec":'+_dy_sec+',"enb":'+_enb+'}}}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  //Periods - Used for event(Prd)
  //_eventIndex(values: 1 or 2),_enb(values:true or false),_dy_min(Delay in minutes: 0-60 min),action1(0,1,2 or 3),action2(0,1,2 or 3),_prdIndex(1 or 2. See EditEventPrd)

  public EditEventPrd(_number:string,_prdIndex,_min1,_hrs1,_min2,_hrs2, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"db","data":{"prd":{"i'+_prdIndex+'":{"m1":'+_min1+',"h1":'+_hrs1+',"m2":'+_min2+',"h2":'+_hrs2+'}}}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  //Light event(Lgt)
  //_eventIndex(values: 1 or 2),_enb(values:true or false),action1(0,1,2 or 3),action2(0,1,2 or 3),_typIndex(1 or 2. See EditEventlgtTyp)

  public EditEventLgt(_number:string,_eventIndex,_enb,_act1,_act2,_typIndex, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"db","data":{"lgt_e":{"i'+_eventIndex+'":{"m1":'+_act2+',"m0":'+_act1+',"typ":'+_typIndex+',"enb":'+_enb+'}}}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  //Light Type - Used for event(LgtTyp)
  //_eventIndex(values: 1 or 2),_enb(values:true or false),action1(0,1,2 or 3),action2(0,1,2 or 3),_typIndex(1 or 2. See EditEventlgtTyp)

  public EditEventLgtTyp(_number:string,_eventIndex,_value, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"db","data":{"lgtyp":{"i'+_eventIndex+'":'+_value+'}}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  public EditEventLgtTol(_number:string,_tolerance:number, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"general","data":{"tol":'+_tolerance+'}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  public EditMQTT(_number:string,_address:string,_user:string,_pwd:string,_port:number,_enb:boolean, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"general","data":{"ServNm":"'+_address+'","pwd":"'+_pwd+'","user":"'+_user+'","port":'+_port+',"EnbMQTT":'+_enb+'}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  public EditOutType(_number:string,_m0:number,_m1:number, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"general","data":{"M0":'+_m0+',"M1":'+_m1+'}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  public EditEnbSTA(_number:string,_enable:boolean,_callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.withrestart":"yes","cmd.id":"edit_tb","cmd.tb_name":"general","data":{"EnbSTA":'+_enable+'}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  public EditInpType(_number:string,_inpRGBorSensor:boolean,_inp1:number,_inp2:number, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"edit_tb","cmd.tb_name":"general","data":{"InpRGB":'+_inpRGBorSensor+',"Inp1":'+_inp1+',"Inp2":'+_inp2+'}}', (res)=>{_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }

  //----------- Set data to device -----------<<<



  // ---------------------------------------------- General ESP Methods ---------------------------------------------->>>
  //----------- Commands to device ----------->>>

  public cmdReset(_number:string, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"reset"}', (res)=>{ConsoleLogService.log("ModOneApiService",'Result(cmdReset): ',res);_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }

  //----------- Commands to device -----------<<<

  //----------- Set data to device -----------

  public SetSTAConfig(_number:string, _name: string, _pwd: string, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    let _parm: KeyValuePairModel[] = [{key:"cmd.devid", value:this.requestID},{key:"cmd._number", value:_number},{key:"cmd.id", value:"setstaconfig"},{key:"cmd.nm", value:_name},{key:"cmd.pwd", value:_pwd}]
    this.subscribeRequest(_dev, this.httpService.espSerialize(_parm), (res)=>{ConsoleLogService.log("ModOneApiService",'Result(SetSTAConfig): ',res);_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  public SetAPConfig(_number:string, _name: string, _pwd: string, _callBackOk:(res:GetStatusModOneAPIModel)=>void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    let _parm: KeyValuePairModel[] = [{key:"cmd.devid", value:this.requestID},{key:"cmd._number", value:_number},{key:"cmd.id", value:"setapconfig"},{key:"cmd.nm", value:_name},{key:"cmd.pwd", value:_pwd}]
    this.subscribeRequest(_dev, this.httpService.espSerialize(_parm), (res)=>{ConsoleLogService.log("ModOneApiService",'Result(SetAPConfig): ',res);_callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }

  //----------- Set data to device -----------<<<

  //---------- Get data from device ---------->>>

  public GetTime(_number:string, _callBackOk: (res: GetTimeModOneAPIModel) => void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"gettime"}', (res)=>{
      let _res:GetTimeModOneAPIModel = res
      let dev = this.modOneBackEndService.getDeviceByNumber(_number); if(dev){dev.Local.Time = _res;this.modOneBackEndService.saveDevice(dev)}
      ConsoleLogService.log("ModOneApiService",'Result(GetTime): ',res,_res);
      _callBackOk(res)}, (error)=>{_callBackNotOk(error)})
  }
  public GetEventList(_number:string, _callBackOk: (res: GetEventListModOneAPIModel) => void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"get_tb","cmd.tb_name":"db"}', (res)=>{
      let _res:GetEventListModOneAPIModel = res
      let dev = this.modOneBackEndService.getDeviceByNumber(_number); if(dev){dev.Local.EventList = _res;this.modOneBackEndService.saveDevice(dev)}
      ConsoleLogService.log("ModOneApiService",'Result(GetEventList): ',res,_res);
      _callBackOk(res)
    }, (error)=>{_callBackNotOk(error)})
  }
  public GetGeneralTb(_number:string, _callBackOk: (res: GetGeneralTbModOneAPIModel) => void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"get_tb","cmd.tb_name":"general"}', (res)=>{
      let _res:GetGeneralTbModOneAPIModel = res
      let dev = this.modOneBackEndService.getDeviceByNumber(_number); if(dev){dev.Local.General = _res;this.modOneBackEndService.saveDevice(dev)}
      ConsoleLogService.log("ModOneApiService",'Result(GetGeneralTb): ',res,_res);
      _callBackOk(res)
    }, (error)=>{_callBackNotOk(error)})
  }
  public GetStatus(_number:string, _callBackOk: (res: GetStatusModOneAPIModel, number:string) => void, _callBackNotOk:(err:any, number:string)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    function errFunc(err:any, numb:string, func){func(err, numb)}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"getstatus"}', (res)=>{
      let _res:GetStatusModOneAPIModel = res
      let dev = this.modOneBackEndService.getDeviceByNumber(res.number); if(dev){dev.Local.Status = _res;this.modOneBackEndService.saveDevice(dev)}
      ConsoleLogService.log("ModOneApiService",'Result(GetStatus): ',res,_res);
      _callBackOk(res,_number)
    }, (error)=>{setTimeout(errFunc.bind(null,error,_number, _callBackNotOk),1)})
  }
  public cmdGetAllData(_number:string, _callBackOk, _callBackNotOk:(err:any)=>void){
    let _result: Array<any> = []
    this.GetTime(_number,(res)=>{
      _result.push(res)
      setTimeout(()=>{
        this.GetEventList(_number,(res)=>{
          _result.push(res)
          setTimeout(()=>{
            this.GetStatus(_number,(res)=>{
              _result.push(res)
              ConsoleLogService.log("ModOneApiService",'Result(cmdGetAllData): ',res);_callBackOk(_result)
            },(err)=>{_callBackNotOk(err)})
          },2000)
        },(err)=>{_callBackNotOk(err)})
      },1000)
    },(err)=>{_callBackNotOk(err)})
  }
  public getDeviceType(_number:string, _callBackOk: (res: GetDeviceTypeModOneAPIModel) => void, _callBackNotOk:(err:any)=>void){ //Main function. Reason: Get the number ID, unique key ever!
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd.id":"getdevicetype"}', (res)=>{
    let _res:GetDeviceTypeModOneAPIModel = res
    let dev = this.modOneBackEndService.getDeviceByNumber(_number); if(dev){dev.Local.DeviceType = _res;this.modOneBackEndService.saveDevice(dev)}
    ConsoleLogService.log("ModOneApiService",'Result(getDeviceType/x): ',dev);
    ConsoleLogService.log("ModOneApiService",'Result(getDeviceType): ',res,_res);
    _callBackOk(res)
  }, (error)=>{_callBackNotOk(error)})
  }
  public getIp(_number:string, _callBackOk: (res: GetIpModOneAPIModel) => void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"getip"}', (res)=>{
      let _res:GetIpModOneAPIModel = res
      let dev = this.modOneBackEndService.getDeviceByNumber(_number); if(dev){dev.Local.ip = _res;this.modOneBackEndService.saveDevice(dev)}
      ConsoleLogService.log("ModOneApiService",'Result(getIp): ',res,_res);
      _callBackOk(res)
    }, (error)=>{_callBackNotOk(error)})
  }
  public GetSTAConfig(_number:string, _callBackOk: (res: GetSTAConfigModOneAPIModel) => void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}
    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"getstaconfig"}', (res)=>{
      let _res:GetSTAConfigModOneAPIModel = res
      _res.devid = res.devid;_res.status = res.status;_res.name = res["1"];_res.pwd = res["2"];_res.mac = res["3"];
      let dev = this.modOneBackEndService.getDeviceByNumber(_number); if(dev){dev.Local.STAConfig = _res;this.modOneBackEndService.saveDevice(dev)}
      ConsoleLogService.log("ModOneApiService",'Result(GetSTAConfig): ',res,_res);
      _callBackOk(res)
    }, (error)=>{_callBackNotOk(error)})
  }
  public GetAPConfig(_number:string, _callBackOk: (res: GetAPConfigModOneAPIModel) => void, _callBackNotOk:(err:any)=>void){
    let _dev:DeviceOneModel = this.modOneBackEndService.getDeviceByNumber(_number); if(!_dev){return}

    this.subscribeRequest(_dev, '{"cmd.devid":"'+this.requestID+'","cmd._number":"'+_number+'","cmd.id":"getapconfig"}', (res)=>{
      let _res:GetAPConfigModOneAPIModel = res
      _res.devid = res.devid;_res.status = res.status;_res.name = res["1"];_res.pwd = res["2"];
      let dev = this.modOneBackEndService.getDeviceByNumber(_number); if(dev){dev.Local.APConfig = _res;this.modOneBackEndService.saveDevice(dev)}
      ConsoleLogService.log("ModOneApiService",'Result(GetAPConfig): ',res,_res);
      _callBackOk(res)
    }, (error)=>{_callBackNotOk(error)})
  }
  public cmdGetAllCommData(_number:string/*_number is a safty information that is checked on device!*/,ip: string, _callBackOk: (res: {getDeviceTypeAndNumber:any,getIp:GetIpModOneAPIModel,GetSTAConfig:GetSTAConfigModOneAPIModel,GetAPConfig:GetAPConfigModOneAPIModel,getDeviceType:any})=>void, _callBackNotOk:(err:any)=>void){//setTimeout(()=>{}, 500) //Get All common data!
    let _result: {getDeviceTypeAndNumber:any,getIp:GetIpModOneAPIModel,GetSTAConfig:GetSTAConfigModOneAPIModel,GetAPConfig:GetAPConfigModOneAPIModel,getDeviceType:any} =
    {getDeviceTypeAndNumber:null,getIp:null,GetSTAConfig:null,GetAPConfig:null,getDeviceType:null}
    if (_number == ""){
      this.getDeviceType("", (res)=>{
        _result.getDeviceTypeAndNumber = res
        setTimeout(()=>{
          this.getIp(_number, (res)=>{
            _result.getIp = res
            setTimeout(()=>{
              this.GetSTAConfig(_number, (res)=>{
                _result.GetSTAConfig = res
                this.GetAPConfig(_number, (res)=>{_result.GetAPConfig = res;ConsoleLogService.log("ModOneApiService",'Result(cmdGetAllCommData): ',_result);_callBackOk(_result)}, (error)=>{_callBackNotOk(error)})
              }, (error)=>{_callBackNotOk(error)})
            }, 2000)
          }, (error)=>{_callBackNotOk(error)})
        }, 2000)
      }, (error)=>{_callBackNotOk(error)})
    }
    else{
      this.getDeviceType(_number, (res)=>{
        _result.getDeviceType = res
        setTimeout(()=>{
          this.getIp(_number, (res)=>{
            _result.getIp = res
            setTimeout(()=>{
              this.GetSTAConfig(_number, (res)=>{
                _result.GetSTAConfig = res
                this.GetAPConfig(_number, (res)=>{_result.GetAPConfig = res;ConsoleLogService.log("ModOneApiService",'Result(cmdGetAllCommData): ',_result);_callBackOk(_result)}, (error)=>{_callBackNotOk(error)})
              }, (error)=>{_callBackNotOk(error)})
            }, 2000)
          }, (error)=>{_callBackNotOk(error)})
        }, 2000)
      }, (error)=>{_callBackNotOk(error)})
    }
  }
  //---------- Get data from device ----------<<<




}
//APConfig:{devid: string,status:string,name: string,pwd: string},
//STAConfig:{devid: string,status:string,name: string,pwd: string,mac: string},
export interface  GetIpModOneAPIModel {
    devid: string;
    status: string;
    ap_gtw: string;
    ap_ip: string;
    ap_mac: string;
    ap_msk: string;
    sta_gtw: string;
    sta_ip: string;
    sta_mac: string;
    sta_msk: string;
}
export interface  GetSTAConfigModOneAPIModel {
    devid: string;
    status: string;
    name: string;  //1 - Wifi Name
    pwd: string;   //2 - WifiPassword
    mac: string;   //4 - MAC Address
}
export interface  GetAPConfigModOneAPIModel {
    devid: string;
    status: string;
    name: string;  //1 - Wifi Name
    pwd: string;   //2 - WifiPassword
}
export interface  GetGeneralTbModOneAPIModel {
    devid: string;
    status: string;
    EnbSTA: boolean;
    Inp1: number;
    Inp2: number;
    InpRGB: boolean;
    M0: number;
    M1: number;
    EnbMQTT: boolean;
    ServNm: string;
    port: string;
    pwd: string;
    user: string;
    tol: number;
}
export interface  GetTimeModOneAPIModel {
    devid: string;
    status: string;
    day: number;
    hrs: number;
    min: number;
    mth: number;
    sec: number;
    wk: number;
    yy: number;
}
export interface  GetStatusModOneAPIModel {
    devid: string;
    status: string;
    InputM0: number;
    InputM1: number;
    Light: number;
    Sensor: number;
    ip: string;
    number: string;
    out: {M0:boolean,M1:boolean};
    rgb: [number,number,number];
}
export interface  GetEventListModOneAPIModel {
    devid: string;
    status: string;
    lgt_e: {i1:{enb:boolean, m0:number, m1:number,typ:number},i2:{enb:boolean, m0:number, m1:number,typ:number}};
    lgtyp: {i1:number,i2:number};
    pe: {i1:{cmd:{m0:number,m1:number},dy_sec:number,enb:boolean,prd:number},i2:{cmd:{m0:number,m1:number},dy_sec:number,enb:boolean,prd:number}};
    prd: {i1:{h1:number,m1:number,h2:number,m2:number},i2:{h1:number,m1:number,h2:number,m2:number}};
    te: {i1:{cmd:{m0:number,m1:number},wk_days:{i1:boolean,i2:boolean,i3:boolean,i4:boolean,i5:boolean,i6:boolean,i7:boolean,},h:number,m:number,enb:boolean},i2:{cmd:{m0:number,m1:number},wk_days:{i1:boolean,i2:boolean,i3:boolean,i4:boolean,i5:boolean,i6:boolean,i7:boolean,},h:number,m:number,enb:boolean}};
}
export interface  GetDeviceTypeModOneAPIModel {
    devid: string;
    status: string;
    hw: string;
    sw: string;
    type: string;
    ip: string;
    number: string;
}
