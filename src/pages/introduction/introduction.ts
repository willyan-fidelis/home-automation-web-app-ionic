import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConsoleLogService } from '../../static-class/object-util';

//import { MenuPage } from '../menu/menu';
import { LoginPage } from '../login/login'

@Component({
  selector: 'page-introduction',
  templateUrl: 'introduction.html'
})
export class IntroductionPage {
// menuItems: [{name: string, component: any, icon: string, title: string}] = [{name: "IntroductionPage", component: IntroductionPage, icon: "star", title: "Pagina 1"}, {name: "", component: "OtherPage", icon: "search", title: "Outra pagina"}];
// menuPopoverItems: [{name: string, component: any, icon: string, title: string}] = [
//   {name: "UserPage", component: IntroductionPage, icon: "person", title: "Usuário"},
//   {name: "LogoutPage", component: IntroductionPage, icon: "log-out", title: "Sair"},
//   {name: "HelpPage", component: IntroductionPage, icon: "help-circle", title: "Ajuda"},
//   {name: "InfoPage", component: IntroductionPage, icon: "information-circle", title: "Sobre"},
// ]
  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    //debugger;
    ConsoleLogService.log("IntroductionPage",'Hello IntroductionPage Page');
  }

  slides = [
      {
        title: "Bem vindo ao HomeSense",
        description: "HomeSense conecta você e seus dispositivos dentro de sua casa ou em qualquer lugar do mundo.",
        image: "assets/img/pages/introduction/home.png",
      },
      {
        title: "Criando uma conta.",
        description: "Para começar você precisar criar uma conta, para salvar seus dispositivos com segurança na nuvem!",
        image: "assets/img/pages/introduction/login.png",
      },
      {
        title: "Encontre e controle seus dispositivos!",
        description: "Com <b>HomeSense</b> encontre e controle seus dispositivos de qualquer lugar.",
        image: "assets/img/pages/introduction/lamp.png",
      },
      {
        title: "Crie tarefas.",
        description: "Crie tarefas para que o dispositivo ganhe sua propria inteligencia. Por exemplo, ao escurecer do dia a iluminação pode ser agendada para ser ligada automaticamente!",
        image: "assets/img/pages/introduction/task.png",
      },
      {
        title: "Crie alarmes.",
        description: "Que tal ligar a luz do quarto ou a televisão todos os dias uteis as 7 horas da manha?",
        image: "assets/img/pages/introduction/alarm.png",
      },
      {
        title: "Mantenha-se notificado!",
        description: "Receba e-mails quando um sensor de segurança é ativado. Monitore as atividades dos dispositivos.",
        image: "assets/img/pages/introduction/notification.png",
      },
      {
        title: "Segurança.",
        description: "Adicione sensores e agende para ligar uma sirene.",
        image: "assets/img/pages/introduction/sensor.png",
      }
    ];

  public continue(){
    this.navCtrl.setRoot(LoginPage)
    //this.homeEmitEventService.emit("page", { page:this.pageService.getPage("LoginPage"), navCtrlType: NavCtrlTypesEnum.setRootWihoutMenu},)
  }
  // selectMenuItem(ev){
  //   ConsoleLogService.log("IntroductionPage","Item selecionda é: ",ev)
  //   this.navCtrl.setRoot(ev.component)
  // }
  // selectPopoverMenuItem(ev){
  //   ConsoleLogService.log("IntroductionPage","Item selecionda é: ",ev)
  // }
}
