import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConsoleLogService } from '../../static-class/object-util';

/*
  Generated class for the Blank page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-blank',
  templateUrl: 'blank.html'
})
export class BlankPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    ConsoleLogService.log("BlankPage",'Hello BlankPage Page');
  }

}
