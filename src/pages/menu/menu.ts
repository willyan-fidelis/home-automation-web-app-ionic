//https://ionicframework.com/docs/v2/api/components/menu/MenuController/
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChange } from '@angular/core';
import { NavController, PopoverController, NavParams, Events, MenuController  } from 'ionic-angular';
import { ConsoleLogService } from '../../static-class/object-util';
import { MenuPopoverPage } from './menu-popover'
import { LoggerService } from '../../providers/logger.service';
import { HomePage } from '../home/home';

import { BlankPage } from '../blank/blank';
import { IntroductionPage } from '../introduction/introduction';
import { LoginPage } from '../login/login'
import { ModuleListPage } from '../module-list/module-list'
//import { AddDevicePage } from '../add-device/add-device'

import { NewUserPage } from '../new-user/new-user';
import { EspMod1ListPage } from '../esp-mod1-list/esp-mod1-list';
import { ConfigPage } from '../config/config'
import { NotificationPage } from '../notification/notification';
import { AutomationPage } from '../automation/automation';
import { SpeechRecPage } from '../speech-rec/speech-rec';
//import { NavCtrlTypesEnum } from '../../model/page-model';
import { BackgroundMode } from '@ionic-native/background-mode';
import { DeveloperPage } from '../developer/developer'

@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html'
})
export class MenuPage  implements OnChanges {
  eneblePlusMenu: boolean = true; //This enable the adtional menu. Only if you pay for this.
  menuItems: [{name: string, component: any, icon: string, title: string, class: string, enb: boolean, typ: number}] =
  [
    {name: "ModuleListPage", component: ModuleListPage, icon: "game-controller-a", title: "Meus Controles", class: "menu-color", enb: true, typ: 1},
    {name: "FavoritePage", component: ModuleListPage, icon: "star", title: "Favoritos", class: "menu-color", enb: true, typ: 1},
    {name: "RoomListPage", component: ModuleListPage, icon: "navigate", title: "Locais", class: "menu-color", enb: true, typ: 1},
    {name: "DeviceListPage", component: ModuleListPage, icon: "md-construct", title: "Dispositivos", class: "menu-color", enb: true, typ: 1},
    //{name: "AddDevicePage", component: AddDevicePage, icon: "add", title: "Procurar Novo", class: "menu-color", enb: true, typ: 1},
    {name: "NotificationPage", component: NotificationPage, icon: "md-information-circle", title: "Notificações", class: "menu-color", enb: true, typ: 1},
    {name: "ConfigPage", component: ConfigPage, icon: "settings", title: "Configuração", class: "menu-color", enb: true, typ: 1},
    {name: "SpeechRecPage", component: SpeechRecPage, icon: "ios-mic", title: "Comando de Voz", class: "menu-color", enb: true, typ: 1},
    {name: "ConfigPage", component: ConfigPage, icon: "ios-megaphone", title: "Alarmes", class: "menu-color-highlight", enb: this.eneblePlusMenu, typ: 2},
    {name: "AutomationPage", component: AutomationPage, icon: "ios-play", title: "Cenas/Tarefas", class: "menu-color-highlight", enb: this.eneblePlusMenu, typ: 2},
    {name: "ConfigPage", component: ConfigPage, icon: "ios-play", title: "Rastrear esse Disporitivo", class: "menu-color-highlight", enb: this.eneblePlusMenu, typ: 2},
    {name: "ConfigPage", component: ConfigPage, icon: "ios-play", title: "Tag NFC", class: "menu-color-highlight", enb: this.eneblePlusMenu, typ: 2},
    {name: "ConfigPage", component: ConfigPage, icon: "settings", title: "Configuração", class: "menu-color-highlight", enb: this.eneblePlusMenu, typ: 2},
    {name: "ConfigPage", component: ConfigPage, icon: "ios-mic", title: "Comando de Voz", class: "menu-color-highlight", enb: this.eneblePlusMenu, typ: 2},
    {name: "ConfigPage", component: DeveloperPage, icon: "settings", title: "Desenvolvedor", class: "menu-color-developer", enb: this.eneblePlusMenu, typ: 1}
  ];
  rootPage: any = this.menuItems[0]

  // actualMenuId = "1"
  ngOnChanges(changes: {[propKey: string]: SimpleChange}){ //This methodo is called always that one @input changes
    // ConsoleLogService.log("MenuPage","Menu id was changed! > "+this.menuId)
    // this.menuCtrl.close()
    // this.menuCtrl.enable(false, this.actualMenuId)
    // this.menuCtrl.enable(true, this.menuId)
    // this.actualMenuId = this.menuId;
  }
  //------------------------------------ Popover -----------------------------------------
  presentPopover(ev) {
    let popover = this.popoverCtrl.create(MenuPopoverPage,{});
    popover.present({
      ev: ev
    });
  }
  //------------------------------------ Popover -----------------------------------------
  constructor(private backgroundMode: BackgroundMode,public logger: LoggerService, public menuCtrl: MenuController, public events: Events, public navCtrl: NavController,public params:NavParams, public popoverCtrl: PopoverController) {

  }


  selectMenuItem(item){
    if(this.rootPage.component == item.component){
      this.events.publish("HomePage:ChangeMode", item.name)
      return;
    }
    ConsoleLogService.log("MenuPage","MenuPage says: Selected menu item is:"+item)
    this.navCtrl.push(item.component)
  }
  ionViewDidLoad() {
    //ConsoleLogService.log("HomePage",'Hello ModuleListPage Page');
    this.backgroundMode.overrideBackButton();
  }
}
//Muito cuidado ao ulizar esse componente:
//1 - Ao chamar o coponente usando '<page-menu [onSelectMenuItem]="xxx"></page-menu>' lembre que se for cascateado duas chamadas do mesmo componete sera chamado duas veszes a função 'selectMenuItem', então lembre-se passar [onSelectMenuItem] apenas uma vez!!! Caso contrario duas chamadas sera feita!
//2 - Se for colocado um '<ion-header></ion-header>' no componente irmão chamado entao ao dar um navCtrl.push um botão de voltar sera adicionado, caso contrario não!
