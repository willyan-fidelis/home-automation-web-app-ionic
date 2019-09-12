//http://www.joshmorony.com/advanced-forms-validation-in-ionic-2/
import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { AlertService } from '../../providers/alert-service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewUserPage } from '../new-user/new-user';
import { ConsoleLogService } from '../../static-class/object-util';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  loginForm: FormGroup;
  submitAttempt: boolean = false; //This boolean shows if the user tryed submit the form.
  constructor(public events: Events, public formBuilder: FormBuilder, public navCtrl: NavController, public alertCtrl: AlertController, public alertService: AlertService, private userServ: UserService) {

    this.loginForm = formBuilder.group({
			email: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'), Validators.required])],
			pwd: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9._-]*'), Validators.required])],
	    });
  }

  ionViewDidLoad() {
    ConsoleLogService.log("LoginPage",'Hello LoginPage Page');//this.loginForm.controls["email"].setValue("abcd")
  }

  public login(email: string, pwd: string){
    this.submitAttempt = true;
    if (this.loginForm.invalid){
      return;
    }
    this.alertService.showLoading("Conectando ao servidor...", 0)
    this.userServ.login_DB(email, pwd, (res)=>{
      this.alertService.dismissLoading();
      this.events.publish('FirstPage:goRootPage', "");//This will change the page!
      //this.navCtrl.setRoot(HomePage)
    }, (err)=>{

      //This will change the page! //REMOVE THIS!!! ----------------------------------------------------------
      this.alertService.showOk("Modo de Desenvolvedor", "Voce esta em modo de teste!", "Ok", ()=>{
        if(true){this.events.publish('FirstPage:goRootPage', "");}
      })
      //This will change the page! //REMOVE THIS!!! ----------------------------------------------------------

      this.alertService.dismissLoading();
      this.alertService.showOk("Usuario ou senha incorreta.", "Favor reinsira os dados!", "Ok", ()=>{})
    }, (fail)=>{
      this.alertService.dismissLoading();
      this.alertService.showServerError(()=>{});

      //This will change the page! //REMOVE THIS!!! ----------------------------------------------------------
      this.alertService.showOk("Modo de Desenvolvedor", "Voce esta em modo de teste!", "Ok", ()=>{
        if(true){this.events.publish('FirstPage:goRootPage', "");}
      })
      //This will change the page! //REMOVE THIS!!! ----------------------------------------------------------

    })
  }

  public pwdConfirm: string = "";
  newUser(email: string, pwd: string) {
    //<REVIEW-THIS CODE(CHANGE PAGE):>
    this.navCtrl.setRoot(NewUserPage)
  }

}
