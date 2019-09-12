import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { EspMod1ListPage } from '../esp-mod1-list/esp-mod1-list';
import { ConsoleLogService } from '../../static-class/object-util';

@Component({
  selector: 'page-module-list',
  templateUrl: 'module-list.html'
})
export class ModuleListPage {
  constructor(public navCtrl: NavController, public params:NavParams) {}

  ionViewDidLoad() {
    ConsoleLogService.log("ModuleListPage",'Hello ModuleListPage Page');
  }
}
