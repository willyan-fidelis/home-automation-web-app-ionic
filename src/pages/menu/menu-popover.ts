//https://github.com/driftyco/ionic-preview-app/tree/master/src/pages/popovers/basic
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavParams, NavController, ViewController, Events } from 'ionic-angular';
import { ConsoleLogService } from '../../static-class/object-util';

import { LogoutPage } from '../logout/logout'
import { UserPage } from '../user/user';
import { InfoPage } from '../info/info';
import { HelpPage } from '../help/help';

@Component({
  selector: 'page-menu-popover',
  template: `
    <ion-list>
    <ion-list-header class="menu-icon" (click)="close()"><ion-icon item-right name="close"></ion-icon>Home Sense</ion-list-header>
    <button detail-none ion-item *ngFor="let item of menuPopoverItems" (click)="selectMenuPopoverItem(item);close()">
      <ion-icon class="menu-icon" [name]="item.icon" item-right></ion-icon>
      {{item.title}}
    </button>
    </ion-list>
  `
})
export class MenuPopoverPage {
  @Input('menuPopoverItems') menuPopoverItems: [{name: string, component: any, icon: string, title: string}] =
  [
    {name: "UserPage", component: UserPage, icon: "person", title: "Usuário"},
    {name: "LogoutPage", component: LogoutPage, icon: "log-out", title: "Sair"},
    {name: "HelpPage", component: HelpPage, icon: "help-circle", title: "Ajuda"},
    {name: "InfoPage", component: InfoPage, icon: "information-circle", title: "Sobre"},
  ]
  //@Output() onSelectMenuPopoverItem = new EventEmitter<{name: string, component: any, icon: string, title: string}>();

  constructor(public events: Events, private navCtrl: NavController,public params:NavParams, public viewCtrl: ViewController){
    //ConsoleLogService.log("MenuPopoverPage",'Hello MenuPopoverPage Page');
  }
  ngOnInit() {
  }
  selectMenuPopoverItem(item){
    this.navCtrl.push(item.component)
  }
  close() {
    this.viewCtrl.dismiss();
  }
}
