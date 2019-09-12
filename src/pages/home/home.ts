import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { BackgroundMode } from '@ionic-native/background-mode';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  pageTitle: string = "Home"
  constructor(private backgroundMode: BackgroundMode,public events: Events, public navCtrl: NavController, public params:NavParams) {
  }

  ionViewDidLoad() {
    //ConsoleLogService.log("HomePage",'Hello ModuleListPage Page');
    this.backgroundMode.overrideBackButton();
  }
}
