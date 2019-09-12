//http://www.joshmorony.com/advanced-forms-validation-in-ionic-2/
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { AlertService } from '../../providers/alert-service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'page-new-user',
  templateUrl: 'new-user.html'
})

export class NewUserPage {
  loginForm: FormGroup;
  submitAttempt: boolean = false; //This boolean shows if the user tryed submit the form.
  constructor(public formBuilder: FormBuilder, public navCtrl: NavController, public alertCtrl: AlertController, public alertService: AlertService, private userServ: UserService) {

    this.loginForm = formBuilder.group({
			email: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'), Validators.required])],
			pwd: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9._-]*'), Validators.required])],
	    });
  }

  ionViewDidLoad() {
    console.log('Hello NewUserPage Page');//this.loginForm.controls["email"].setValue("abcd")
  }
  public pwdConfirm: string = "";
  newUser(email: string, pwd: string) {
    this.submitAttempt = true;
    if (this.loginForm.invalid){
      return;
    }

    if (this.userServ.user.password != this.pwdConfirm){
      this.alertService.showOk('Erro!', 'A senha e a confirmação são diferentes. <br>Por favor reinsira a senha!', 'Ok', ()=>{})
      return;
    }
    this.alertService.showLoading("Conectando ao servidor...", 0)
    this.userServ.createNewUser_DB(email, pwd,(res)=>{
      // ------------- Sucess Alert -------------
      this.userServ.user = this.userServ.getEmptyUser()
      //<REVIEW-THIS CODE(CHANGE PAGE):>
      //this.homeEmitEventService.emit("page", { page:this.pageService.getPage("LoginPage"), navCtrlType: NavCtrlTypesEnum.realPop},)
      this.alertService.dismissLoading();
      this.alertService.showOk('Usuario criado com sucesso!', 'Agora você ja pode fazer loggin.', 'Ok', ()=>{})
      // ------------- Sucess Alert -------------
    },(err)=>{
      // ------------- Error Alert -------------
      this.pwdConfirm = ""
      this.alertService.dismissLoading();
      this.alertService.showOk('Problema na criação do usuário!', 'Verifique se seu e-mail e senha são validos.', 'Ok', ()=>{})
      // ------------- Error Alert -------------
    },(fail)=>{
      // ------------- Fail Alert -------------
      this.pwdConfirm = ""
      this.alertService.dismissLoading();
      this.alertService.showServerError(()=>{})
      // ------------- Fail Alert -------------
    })
  }

}
