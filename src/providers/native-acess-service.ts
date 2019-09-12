import { Injectable } from '@angular/core';
//import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AlertService } from './alert-service'

import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Shake } from '@ionic-native/shake';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion';
import { BackgroundMode } from '@ionic-native/background-mode';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Network } from '@ionic-native/network';
import { NetworkInterface } from '@ionic-native/network-interface';
//import { SMS } from '@ionic-native/sms';
import { AndroidPermissions } from '@ionic-native/android-permissions';
declare var sms: any;
declare var SMS:any;
declare var nfc: any;
declare var networkinterface: any;


/*
  Generated class for the VoiceInterfaceServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NativeAccessService {

  constructor(private androidPermissions: AndroidPermissions, private network: Network, private nfc2: NFC, private ndef: Ndef, private backgroundMode: BackgroundMode,private deviceMotion: DeviceMotion,private shake: Shake, private speechRecognition: SpeechRecognition, public alertService: AlertService,private tts: TextToSpeech) {
    console.log('Hello VoiceInterfaceService');
    this.speechRecognition.requestPermission()
      .then(
        () => {()=>{}/*this.alertService.showOk("Requerendo permição!", "Permisão consedida!", "Ok", ()=>{callbackOk()})*/},
        () => {()=>{}/*this.alertService.showOk("Requerendo permição!", "Permisão  NÂO consedida!", "Ok", ()=>{callbackNok()})*/}
      )


  }

  //----------------------------- Android Permision ----------------------------
  public andoidPermissionTest(){
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_SMS).then(
      result => alert('Has permission?' + result.hasPermission.tostring()),
      err => {this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_SMS), alert('Sem permicao. Liberando..')}
    );
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.WRITE_SMS]);
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_SMS]);
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.SEND_SMS]);
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.RECEIVE_SMS]);
  }
  //----------------------------- Android Permision ----------------------------

  //----------------------------- SMS ----------------------------
  public interceptSMS(){
  if(SMS) SMS.enableIntercept(true, function(){alert('Interceptado!')}, function(){alert('Nao Interceptado!')});
}
  public smsSendSMSTest(){
  //sms.send('03516277074', 'Hellow Iocic teste!');
  if(SMS) SMS.sendSMS("03516277074", "Eu testando IONIC!", function(){}, function(){});
  }


  public ReadListSMS(){
  //http://www.programmingworldtech.com/2017/09/ionic-3-cordova-read-sms-plugin.html

  //https://github.com/floatinghotpot/cordova-plugin-sms/tree/master/docs

  this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_SMS]);
  this.alertService.showOk("Tentando Ler!", "...", "Ok", ()=>{})
  //this.platform.ready().then((readySource) => {

  let filter =
  {
    box : 'inbox', // 'inbox' (default), 'sent', 'draft'
    indexFrom : 0, // start from index 0
    maxCount : 1, // count of SMS to return each time
  };

  if(SMS) SMS.listSMS(filter, (ListSms)=>{

     console.log("Sms",ListSms);
     alert(ListSms)
     this.alertService.showOk("Tentando Ler!", JSON.stringify(ListSms), "Ok", ()=>{})

    },

    Error=>{
    console.log('error list sms: ' + Error);
    alert(Error)
    this.alertService.showOk("Tentando Ler!", Error.tostring(), "Ok", ()=>{})
    });
    alert('Tentando ler..')

      //});
  }

  public deleteSMS(){
    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_SMS)
    //this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.WRITE_SMS]);
    var filter = {

        		//box : 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all

            // the following 4 filters are OR relationship
        		_id : 104 // given a sms id, recommend ONLY use this filter
        		//read : 1, // delete all read SMS
        		//address : '03516277074' // delete all SMS from this phone number
        		//body : 'Test is a test SMS' // delete SMS by content
        	};
        	if(SMS){
            SMS.deleteSMS(filter, function( n ){
          		//updateStatus( n + ' sms messages deleted' );
              alert('Deletado: ' + n)
          	}, function(err){
          		//updateStatus('error delete sms: ' + err);
              alert('Nao Deletado!')
          	});
          }
  }
  //----------------------------- SMS ----------------------------


  //----------- network --------------------------
  public getNetworkDetail(){
  alert("1: " + this.network.type);
  networkinterface.getWiFiIPAddress(
    function(ip, subnet) { alert("2: " + ip + ":" + subnet); },
    function(err) { alert("Err: " + err); }
);
  //networkInterface.getWiFiIPAddress().then((ip, subnet)=>{alert("2: " + ip + " 3: " + subnet);})
  //networkInterface.getCarrierIPAddress().then((ip)=>{alert("4: " + ip);})
}
  //----------- network --------------------------

  public testSpeak(text){
    this.tts.speak({text:text, locale:"pt-BR", rate: 0.75})
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));
  }

  public speak(text, callbackDone){
    if(text != ""){
      this.tts.speak({text:text, locale:"pt-BR", rate: 1})//
        .then(() => callbackDone())
        .catch((reason: any) => console.log(reason));
    }
    else{
      callbackDone()
    }
  }

  public testListening(callbackOk, callbackNok){
    let speechOptions = {
      language: "pt-BR",
      Number: 100,
      prompt: "",      // Android only
      showPopup: true,  // Android only
      showPartial: false // iOS only
    }

    this.speechRecognition.isRecognitionAvailable().then((available: boolean) => {
      this.alertService.showOk("Comando de Voz", "Diga o comando desejado de forma clara!", "Ok", ()=>{
        // Start the recognition process
        this.speechRecognition.startListening(speechOptions)
          .subscribe(
            (matches: Array<string>) => {
              this.alertService.showOk("Veja o Resultado da fala!", matches.toString(), "Ok", ()=>{callbackOk(matches.toString())})
            },
            (onerror) => {
              this.alertService.showOk("Erro no reconhecimento da fala!", onerror.toString(), "Ok", ()=>{callbackNok()})
            }
          )
      })
    })
  }

  public listening(callbackOk, callbackNok){
    this.listeningDoPermision(()=>{
      let speechOptions = {
        language: "pt-BR",
        Number: 100,
        prompt: "",      // Android only
        showPopup: true,  // Android only
        showPartial: false // iOS only
      }

      this.speechRecognition.isRecognitionAvailable().then((available: boolean) => {
        //this.alertService.showOk("Comando de Voz", "Diga o comando desejado de forma clara!", "Ok", ()=>{
          // Start the recognition process
        this.speechRecognition.startListening(speechOptions)
          .subscribe(
            (matches: Array<string>) => {
              callbackOk(matches)
              //this.alertService.showOk("Veja o Resultado da fala!", matches.toString(), "Ok", ()=>{callbackOk(matches.toString())})
            },
            (onerror) => {
              callbackNok()
              //this.alertService.showOk("Erro no reconhecimento da fala!", onerror.toString(), "Ok", ()=>{callbackNok()})
            }
          )
        //})
      })
    }, ()=>{callbackNok()})
  }

  public listeningDoPermision(callbackOk, callbackNok){
    // Check permission
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        //this.alertService.showOk("Checando permição!", "Permisão existente!", "Ok", ()=>{})
        callbackOk()
      }).catch((reason)=>{
      // Request permissions
      this.speechRecognition.requestPermission()
        .then(
          () => {callbackOk()/*this.alertService.showOk("Requerendo permição!", "Permisão consedida!", "Ok", ()=>{callbackOk()})*/},
          () => {callbackNok()/*this.alertService.showOk("Requerendo permição!", "Permisão  NÂO consedida!", "Ok", ()=>{callbackNok()})*/}
        )
    })


  }

  public listeningshake(sensitivity, callBackOk){
    const watch = this.shake.startWatch(60).subscribe(() => {
    this.alertService.showToast("Detected!", "button",2000)
    this.speak("Movimento detectado!",()=>{})
    //this.listening(()=>{},()=>{})
    this.backgroundMode.unlock();
    this.backgroundMode.enable()
    this.backgroundMode.wakeUp();
    });
    //
    // //watch.unsubscribe();
    // Get the device current acceleration
    // this.deviceMotion.getCurrentAcceleration().then(
    //   (acceleration: DeviceMotionAccelerationData) => this.alertService.showToast("Valor(x, y,z): "+acceleration.x+" / "+acceleration.z+" / "+acceleration.z+" / ", "button",2000),
    //   (error: any) => this.alertService.showToast("Erro(x, y,z): "+error.tostring(), "button",2000)
    // );
    //
    // // Watch device acceleration
    // var subscription = this.deviceMotion.watchAcceleration().subscribe((acceleration: DeviceMotionAccelerationData) => {
    //   console.log(acceleration);
    //   this.alertService.showToast("Valor(x, y,z): "+acceleration.x+" / "+acceleration.z+" / "+acceleration.z+" / ", "button",2000)
    // });

    //https://www.joshmorony.com/understanding-zones-and-change-detection-in-ionic-2-angular-2/
    //https://www.joshmorony.com/adding-background-geolocation-to-an-ionic-2-application/
    }

    public listeningNFC(callbackOk, callbackNok){
      this.nfc2.addTagDiscoveredListener(() => {
        console.log('successfully attached ndef listener');
        this.alertService.showOk("Aviso!", "Tag cadastrada com sucesso!", "Ok", ()=>{})
      }, (err) => {
        console.log('error attaching ndef listener', err);
      }).subscribe((event) => {
        console.log('Conteudo da tag lida: ', event.tag);
        this.alertService.showOk("Aviso!", "Conteudo da tag lida: "+ event.tag.tostring(), "Ok", ()=>{})
        //console.log('ID da tag: ', this.nfc.bytesToHexString(event.tag.id));
        this.alertService.showOk("Aviso!", "ID da tag: "+this.nfc2.bytesToHexString(event.tag.id), "Ok", ()=>{})

        //let message = this.ndef.textRecord('Hello world');
        //this.nfc.share([message]).then(callbackOk).catch(callbackNok);
      });
    }
    public NFC(callback, callbackOk, callbackNok){
      nfc.addTagDiscoveredListener((data)=>{
        this.alertService.showOk("Aviso!", "Sucesso!", "Ok", ()=>{})
        this.alertService.showOk("Aviso!", JSON.stringify(data), "Ok", ()=>{})
        callback()
      }, [(event)=>{
        this.alertService.showOk("Aviso!", "Conteudo da tag lida: "+ event.tag.tostring(), "Ok", ()=>{})
        this.alertService.showOk("Aviso!", "ID da tag: "+nfc.bytesToHexString(event.tag.id), "Ok", ()=>{})
        callbackOk()
      }], [()=>{
        this.alertService.showOk("Aviso!", "Erro!", "Ok", ()=>{})
        callbackNok()
      }]);
    }
}
