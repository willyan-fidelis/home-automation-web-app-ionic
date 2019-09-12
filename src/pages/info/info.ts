import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConsoleLogService } from '../../static-class/object-util';

/*
  Generated class for the Info page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-info',
  templateUrl: 'info.html'
})
export class InfoPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    ConsoleLogService.log("InfoPage",'Hello InfoPage Page');
  }

}
