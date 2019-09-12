import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertService } from '../../providers/alert-service'
import { NativeAccessService } from '../../providers/native-acess-service'


import { SpeechRecognition } from '@ionic-native/speech-recognition';

import { ModOneApiService } from '../../providers/modOne-api-service';
import { ModOneBackEndService } from '../../providers/modOne-backEnd-service';
import { BackgroundMode } from '@ionic-native/background-mode';
var cordova: any
/**
 * Generated class for the SpeechRecPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-speech-rec',
  templateUrl: 'speech-rec.html',
})
export class SpeechRecPage {

  constructor(private backgroundMode: BackgroundMode,private modOneApiService: ModOneApiService, private nativeAccessService: NativeAccessService,private speechRecognition: SpeechRecognition, public alertService: AlertService, public navCtrl: NavController, public navParams: NavParams) {
  }

  // private speechOptions = {
  //   language: "pt-BR",
  //   Number: 100,
  //   prompt: "",      // Android only
  //   showPopup: true,  // Android only
  //   showPartial: false // iOS only
  // }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SpeechRecPage');
    //this.voiceInterfaceService.testSpeak()

    setTimeout(()=>{

      //this.backgroundMode.moveToForeground();
      //this.backgroundMode.unlock();
      //this.backgroundMode.enable()
      //this.backgroundMode.wakeUp();
      cordova.plugins.backgroundMode.show()
      //setTimeout(()=>{this.listeningCommand()},2000)
    },5000)
  }

  private test(){
    this.nativeAccessService.listeningDoPermision(()=>{
      this.nativeAccessService.testListening((res)=>{this.nativeAccessService.testSpeak(res)}, ()=>{})
    }, ()=>{})
  }

  private listeningCommand(){
    let anyValidCommand = false
    this.nativeAccessService.listening((txtArray1)=>{
      for(var obj of txtArray1){
        //this.alertService.showOk("Objeto: ", obj.toString(), "Ok", ()=>{})
        //this.alertService.showToast(obj,"button",2000)
        if(this.modOneApiService.searchTextCommand(obj + " senha", "senha")){
          anyValidCommand = true
          this.nativeAccessService.speak(this.modOneApiService.confirmTextCommandMsg(), ()=>{
            if(this.modOneApiService.isTextCommandOnlyGetMsg()){
              this.modOneApiService.doTextCommand("","",false,(txt)=>{this.nativeAccessService.speak(txt, ()=>{})})
            }
            else{
              this.nativeAccessService.listening((txtArray2)=>{
                for(var obj of txtArray2){
                  this.alertService.showToast(obj,"button",2000)
                  this.modOneApiService.doTextCommand(obj+" senha", "senha", true, (txt)=>{this.nativeAccessService.speak(txt, ()=>{})})
                  return
                }
              },()=>{this.nativeAccessService.speak("Algo não ocorreu bem. Tente novamente!", ()=>{})})
            }
          })
          return
        }
      }
      if(!anyValidCommand){
        this.nativeAccessService.speak("Nenhum comando reconhecido!", ()=>{})
      }
    },()=>{this.nativeAccessService.speak("Algo não ocorreu bem. Tente novamente!", ()=>{})})
  }

  private setShake(sensitivity){
    this.nativeAccessService.listeningshake(60, (data)=>{
      this.alertService.showToast("Detected(x, y,z): "+sensitivity.x+" / "+sensitivity.y+" / "+sensitivity.z+" / ","button",2000)
    })
  }

  private listeningNFC(){
    //this.nativeAccessService.listeningNFC(()=>{}, ()=>{})
    this.nativeAccessService.NFC(()=>{},()=>{}, ()=>{})
  }

  private getNetworkDetail(){
    this.nativeAccessService.getNetworkDetail()
  }
  private interceptSMS(){
    this.nativeAccessService.interceptSMS()
  }
  private testSMS(){
    this.nativeAccessService.smsSendSMSTest()
  }
  private testSendSMS(){
    this.nativeAccessService.ReadListSMS()
  }
  private testDelSMS(){
    this.nativeAccessService.deleteSMS()
  }
  private androidPermissionTest(){
    this.nativeAccessService.andoidPermissionTest()
  }
}
