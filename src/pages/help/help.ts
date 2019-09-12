import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConsoleLogService } from '../../static-class/object-util';

/*
  Generated class for the Help page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-help',
  templateUrl: 'help.html'
})
export class HelpPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    ConsoleLogService.log("HelpPage",'Hello HelpPage Page');
  }

}
