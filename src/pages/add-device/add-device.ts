import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//import { EspGeneralService } from '../../providers/esp-general-service';
import { ModOneApiService } from '../../providers/modOne-api-service';
//import { EspGeneralDeviceModel } from '../../model/esp-general-device-model';
//import { modOneBackEndService } from '../../providers/device-service';
import { ModOneBackEndService } from '../../providers/modOne-backEnd-service';
//import { DeviceDetailMod1Service } from '../../providers/device-detail-mod1-service';
import { AlertService } from '../../providers/alert-service'
import { UserService } from '../../providers/user-service';
import { ConsoleLogService } from '../../static-class/object-util';

/*
  Generated class for the FindEsp page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-device',
  templateUrl: 'add-device.html'
})
export class AddDevicePage {

  constructor(private userService: UserService, public alertService: AlertService, public navCtrl: NavController, private modOneBackEndService: ModOneBackEndService/*, private deviceMod1Service: DeviceDetailMod1Service*/) {
    //this.espGeneral = this.modOneApiService.getEmptyEsp();
    /*
    let abc: any = {}
    abc.x={}
    if (abc.x) {ConsoleLogService.log("FindEspPage","Not null!!")} else {ConsoleLogService.log("FindEspPage","null!!")}
    */
  }

  ionViewDidLoad() {
    ConsoleLogService.log("FindEspPage",'Hello FindEspPage Page');

    }
  public espGeneral: any;//EspGeneralDeviceModel

  public do(){
    //this.modOneApiService.getDeviceTypeAndNumber("192.168.25.7",(res)=>{this.espGeneral.DeviceType=res},(error)=>{});
    //this.modOneApiService.getIp("192.168.25.7",(res)=>{},(error)=>{});
    //this.modOneApiService.GetSTAConfig("192.168.25.7",(res)=>{},(error)=>{});
    //this.modOneApiService.GetAPConfig("192.168.25.7",(res)=>{},(error)=>{});
    //this.modOneApiService.cmdReset("192.168.25.7",(res)=>{},(error)=>{});
    //this.modOneApiService.SetSTAConfig("192.168.25.7","GVT-DCEA","S1F4519897",(res)=>{},(error)=>{});
    //this.modOneApiService.SetAPConfig("192.168.25.7","MinhaRedeFidelis","0123456789",(res)=>{},(error)=>{});
    //this.modOneApiService.GetTime("192.168.25.7",(res)=>{},(error)=>{});
    //this.modOneApiService.GetEventList("192.168.25.7",(res)=>{},(error)=>{});
    //this.modOneApiService.SetTime("192.168.25.7","15","55","12","3","7","12","16",(res)=>{},(error)=>{});
    //this.modOneApiService.cmdSetRGB("192.168.25.7","40","5","100",(res)=>{},(error)=>{});
    //this.modOneApiService.cmdTurn("192.168.25.7",3,3,(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventTE("192.168.25.7",1,true,17,0,3,3,[true,true,true,true,true,true,true],(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventTE("192.168.25.7",2,true,17,0,3,3,[true,true,true,true,true,true,true],(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventPE("192.168.25.7",1,true,0,3,3,0,(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventPE("192.168.25.7",2,true,0,3,3,0,(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventPrd("192.168.25.7",1,30,19,(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventPrd("192.168.25.7",2,45,23,(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventLgt("192.168.25.7",1,true,3,3,0,(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventLgt("192.168.25.7",1,false,1,1,0,(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventLgtTyp("192.168.25.7",1,800,(res)=>{},(error)=>{});
    //this.modOneApiService.EditEventLgtTyp("192.168.25.7",2,800,(res)=>{},(error)=>{});
    //this.modOneApiService.GetStatus("192.168.0.173",(res)=>{},(error)=>{});

    // ------------------------ Finding new ESP device series ------------------------
    // this.alertService.showOk('Atenção!', 'Para continuar você precisar estar conectado na <b>rede do dispositivo!</b>', 'Ok', ()=>{
    //   this.alertService.showLoading("Procurando novo dispositivo...", 0)
    //   this.modOneApiService.cmdFind((res)=>{
    //     this.alertService.dismissLoading();
    //     this.alertService.showOk('Encontrado!', 'Um dispositivo foi encontrado com suceeso!', 'Ok', ()=>{
    //       ConsoleLogService.log("FindEspPage","ESP Found: "+JSON.stringify(res))
    //       let msg: string =
    //       "Modelo: "+res[0].type
    //       +"<br>"+"Versão de hardware: "+res[0].hw
    //       +"<br>"+"Versão de software: "+res[0].sw
    //
    //       this.alertService.showOk('Detalhes:', msg, 'Ok', ()=>{
    //         let _input: Array<any> = [
    //           {
    //             name: 'name',
    //             placeholder: 'Nome da rede wifi'
    //           },
    //           {
    //             name: 'pwd',
    //             placeholder: 'Senha da rede wifi',
    //             //type: "password"
    //           }
    //         ]
    //         this.alertService.createOkCancelWithInputs('Insira os dados de sua rede', "Para continuar é necerrario que insira os dados de sua rede wifi!", _input, (data)=>{
    //           //Now set station configuration with user data:
    //           this.modOneApiService.SetSTAConfig("-1",data.name,data.pwd,(res)=>{
    //             this.alertService.showOk('Configurado', 'Rede wifi do dispositivo configurado!', 'Ok', ()=>{
    //               this.alertService.showLoading("Agurade até que os dados sejam atualizados no dispositivo. <br>Isso pode demorar até 30 segundos...", 0)
    //               setTimeout(()=>{
    //                 this.modOneApiService.cmdFind((res)=>{
    //                   this.alertService.showOkWith1Input('Atenção!', 'Para continuar você precisar conectar-se em uma rede com <b>acesso a internet</b>!<br>Agora digite o nome do novo dispositivo.','Nome novo dispositivo', 'Ok', (text)=>{
    //                     ConsoleLogService.log("FindEspPage","ESP Found: "+JSON.stringify(res))
    //                     this.alertService.dismissLoading();
    //                     //Try to insert this device:
    //                     let staInfo: Array<any> = res[2]
    //                     let apInfo: Array<any> = res[3]
    //                     let number: string = res[0].number
    //
    //                     let sta_ip = res[1].sta_ip;
    //                     ConsoleLogService.log("FindEspPage",JSON.stringify(staInfo))
    //                     if (res[0].type == "1.0"){ //Add to data base - Type '1.0'(mod1):
    //                       this.modOneBackEndService.new_DB(this.userServ.user.email,this.userServ.user.SessionID,res[0].type,res[0].sw,res[0].sw,res[0].number,text,(res)=>{ //staInfo[0],staInfo[1],apInfo[0],apInfo[1],res[1].sta_ip,
    //                         this.alertService.showOk('Sucesso!', 'Seus dispositivo foi adicionado com sucesso ao servidor na nuvem!', 'Ok', ()=>{
    //                           this.modOneBackEndService.getDeviceList_DB(false, this.userServ.user.email,this.userServ.user.SessionID, (res)=>{
    //                             //Now save the data locally:
    //                             //this.modOneBackEndService.saveDataFromDeviceGeneral(number, this.espGeneralServ.getEmptyEsp())
    //                             //Save type mod1 details locally:
    //                             //this.modOneBackEndService.saveDataFromDeviceDetail(number, this.modOneApiService.getEmpty())
    //                             let devToBeSaved = this.modOneBackEndService.getDeviceByNumber(number);
    //                             devToBeSaved.Local.ip.sta_ip = sta_ip;
    //                             this.modOneBackEndService.saveDevice(devToBeSaved);
    //                           }, (res)=>{}, (err)=>{})
    //                         })
    //                       },(res)=>{
    //                         if (res.Parameters.Result == "-50"){
    //                           this.alertService.showOk('Dispositivo ja existente!', 'Seus dispositivo já existe no banco de dados!', 'Ok', ()=>{})
    //                           //this.alertService.showOkCancel('Fallha!', 'Seus dispositivo já existe no banco de dados!', 'Apagar', 'Cancelar', ()=>{}, ()=>{})
    //                         }
    //                         else{
    //                           this.alertService.showOk('Erro!', 'Tente novamente, se o problema continuar entre em contato com HomeSense!', 'Ok', ()=>{})
    //                         }
    //                       },(err)=>{this.alertService.showServerError(()=>{})})
    //                     }
    //                   })
    //                 },(error)=>{this.alertService.dismissLoading();this.alertService.showOk('Erro!', 'Tente novamente!', 'Ok', ()=>{})})
    //               },12000)//25000
    //             })
    //           },(res)=>{this.alertService.showOk('Erro!', 'Tente novamente!', 'Ok', ()=>{})})
    //         }, (data)=>{}, 'Confrimar', 'Cancelar')
    //         this.alertService.showOkCancelWithInputs()
    //       })
    //     })
    //   }, (error)=>{
    //     this.alertService.dismissLoading();
    //     this.alertService.showOk('Não encontrado!', 'Nenhum dispositivo encontrado! Veririque se você esta conetado ao ponto wifi do dispositivo', 'Ok', ()=>{})
    //   })
    // })
    // ------------------------ Finding new ESP device series ------------------------


    //this.modOneBackEndService.deviceList[1].FromDevice.General = this.espGeneralServ.getEmptyEsp();
    //this.modOneBackEndService.deviceList[1].FromDevice.General.ip.sta_ip = "babaca"
    //this.modOneBackEndService.save(this.modOneBackEndService.deviceList[1])//"20161220.001.16668185"
  }

  public test(){
    //this.espGeneralServ.getIp('192.168.25.7',(res)=>{this.espGeneral.ip=res}, (err)=>{})

    //this.modOneApiService.cmdGetAllData("10.0.0.1",(res)=>{ConsoleLogService.log("FindEspPage","Xyz: "+JSON.stringify(res))},(err)=>{})


    //this.modOneBackEndService.saveDataFromDeviceGeneral("20161220.001.16668185",this.espGeneralServ.getEmptyEsp())
    //this.modOneBackEndService.saveDataFromDeviceDetail("20161220.001.16668185",this.modOneApiService.getEmpty())
    //ConsoleLogService.log("FindEspPage","Saved!!: "+JSON.stringify(this.modOneBackEndService.deviceList))
  }

  private takePicture(){} //Take a picture and scan the device number

  private typeNumber(){ //Type the number manualy
    this.alertService.showOkCancelWith1Input("Novo Dispositivo!","Digite o número do dispositivo. Confira o código atentamente.","xxxx.yyyy.zzzz","Ok","Cancelar",(text)=>{
      this.modOneBackEndService.shareDevice_DB(this.userService.user.email,this.userService.user.email,text,1,this.userService.user.SessionID,(res)=>{
        this.modOneBackEndService.getDeviceList_DB(false, this.userService.user.email, this.userService.user.SessionID, (list)=>{}, (res)=>{}, (err)=>{})
        this.alertService.showOk("Sucesso!","Dispositivo adicionado com sucesso!","Ok",()=>{})
      },(res)=>{this.alertService.showOk("Erro!","Problemas para criar esse dipositivo. Verifique o número e tente novamente.","Ok",()=>{})})
    })


  }

}
