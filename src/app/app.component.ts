import { Component,ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
//import { StatusBar, Splashscreen } from 'ionic-native';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
//Put here all services necessary at start-up moment:
// import { PageService } from '../providers/page-service'
// import { UserService } from '../providers/user-service';
// import { DeviceService } from '../providers/device-service'
//Put here all pages that we need put in "PageService" provider, and dont forget to call the method "setPageComponent":
import { FirstPage } from '../pages/first/first';

// import { BlankPage } from '../pages/blank/blank';
// import { HomePage } from '../pages/home/home';
// import { IntroductionPage } from '../pages/introduction/introduction';
// import { LoginPage } from '../pages/login/login'
// import { LogoutPage } from '../pages/logout/logout'
// import { ModuleListPage } from '../pages/module-list/module-list'
// import { FindEspPage } from '../pages/find-esp/find-esp'
// import { UserPage } from '../pages/user/user';
// import { InfoPage } from '../pages/info/info';
// import { HelpPage } from '../pages/help/help';
// import { NewUserPage } from '../pages/new-user/new-user';

//http://www.cbblogers.com/2012/12/eu-posso-usar-imagens-que-eu-acho-na-internet/
@Component({
  template: `<ion-nav #myNav [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage: any// = LoginPage;//ModuleListPage;//LoginPage;//HomePage;
  @ViewChild('myNav') nav //This is necessary because this component is the root componente, and others components are children, like NavController is too.

  constructor(private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen/*, private userServ: UserService, public pageService: PageService, private deviceService: DeviceService*/) {
    this.initializeApp(()=>{
      statusBar.styleDefault();
      splashScreen.hide();
    });
    //this.userServ.isLogged(()=>{this.rootPage = HomePage;},()=>{this.rootPage = HomePage;},()=>{this.rootPage = HomePage;})//isLogged(_callBackIsLogged,_callBackIsNotLogged,_callBackAnyTimeLogged)
  }

  ngAfterViewInit(){
    this.nav.setRoot(FirstPage)
  }

  initializeApp(_callBack) {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      _callBack()
    });
  }
}
