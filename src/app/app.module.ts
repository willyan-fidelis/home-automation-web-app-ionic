import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
//import {Paho} from 'paho.mqtt.javascript-master/src/mqttws31.js'
import { MyApp } from './app.component';
import { FirstPage } from '../pages/first/first';
import { BlankPage } from '../pages/blank/blank';
import { MenuPage } from '../pages/menu/menu';
import { MenuPopoverPage } from '../pages/menu/menu-popover';
import { HomePage } from '../pages/home/home';
import { IntroductionPage } from '../pages/introduction/introduction';
import { LoginPage } from '../pages/login/login';
import { InfoPage } from '../pages/info/info';
import { HelpPage } from '../pages/help/help';
import { UserService } from '../providers/user-service';
import { LogoutPage } from '../pages/logout/logout'
import { AddDevicePage } from '../pages/add-device/add-device'
import { UserPage } from '../pages/user/user'
import { ModuleListPage } from '../pages/module-list/module-list'
import { NewUserPage } from '../pages/new-user/new-user';
import {EspMod1DetailPage, EspTimeEventsPage, EspPresenceEventsPage, EspLightEventsPage, EspConfigPage, EspCommandsPage, EspClockPage, EspDetailPage, EspEditPage, EspSharePage } from '../pages/esp-mod1-detail/esp-mod1-detail';
import { SpeechRecPage } from '../pages/speech-rec/speech-rec';
//import { EspClockPage } from '../pages/esp-mod1-detail/esp-clock';
import { EspMod1ListPage } from '../pages/esp-mod1-list/esp-mod1-list';
import { DatePickerComponent } from '../components/date-picker/date-picker'
import { ConfigPage } from '../pages/config/config'
import { NotificationPage, NotificationModalPage } from '../pages/notification/notification'
import { AutomationPage, AutomationModalPage } from '../pages/automation/automation'
import { DeveloperPage } from '../pages/developer/developer'
//import { Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage'
import { LocalStorageService } from '../providers/local-storage-service';
import { HttpService } from '../providers/http-service';
import { ModOneBackEndService } from '../providers/modOne-backEnd-service';
//import { DeviceDetailMod1Service } from '../providers/device-detail-mod1-service';
//import { EspGeneralService } from '../providers/esp-general-service';
import { ModOneApiService } from '../providers/modOne-api-service';
import { AutomationService } from '../providers/automation-service';
import { AlertService } from '../providers/alert-service';

import {LoggerService} from '../providers/logger.service';
import {CentralLoggerService} from '../providers/central.logger.service';
import {MQTTService} from '../providers/mqtt.service';
import {AppService} from '../providers/app-service';
import { BrowserModule } from '@angular/platform-browser';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';

import { Vibration } from '@ionic-native/vibration';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Shake } from '@ionic-native/shake';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion';

import { ConfigService } from '../providers/config-service';
import { NativeAccessService } from '../providers/native-acess-service';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Network } from '@ionic-native/network';
import { NetworkInterface } from '@ionic-native/network-interface';
import { SMS } from '@ionic-native/sms';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@NgModule({
  declarations: [
    MyApp,
    FirstPage,
    BlankPage,
    MenuPage,
    MenuPopoverPage,
    HomePage,
    IntroductionPage,
    LoginPage,
    LogoutPage,
    ModuleListPage,
    AddDevicePage,
    UserPage,
    InfoPage,
    HelpPage,
    NewUserPage,
    EspMod1DetailPage,
    EspTimeEventsPage,
    EspPresenceEventsPage,
    EspLightEventsPage,
    EspConfigPage,
    EspCommandsPage,
    EspClockPage,
    EspDetailPage,
    EspEditPage,
    EspSharePage,
    EspMod1ListPage,
    DatePickerComponent,
    ConfigPage,
    NotificationPage,
    NotificationModalPage,
    AutomationPage,
    AutomationModalPage,
    SpeechRecPage,
    DeveloperPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    BrowserModule,
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    FirstPage,
    BlankPage,
    MenuPage,
    MenuPopoverPage,
    HomePage,
    IntroductionPage,
    LoginPage,
    LogoutPage,
    ModuleListPage,
    AddDevicePage,
    UserPage,
    InfoPage,
    HelpPage,
    NewUserPage,
    EspMod1DetailPage,
    EspTimeEventsPage,
    EspPresenceEventsPage,
    EspLightEventsPage,
    EspConfigPage,
    EspCommandsPage,
    EspClockPage,
    EspMod1ListPage,
    DatePickerComponent,
    ConfigPage,
    NotificationPage,
    NotificationModalPage,
    AutomationPage,
    AutomationModalPage,
    SpeechRecPage,
    DeveloperPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},DeviceMotion,Shake, BackgroundMode, TextToSpeech, SpeechRecognition, LocalNotifications, Vibration, StatusBar, SplashScreen, UserService, LocalStorageService, HttpService, ModOneBackEndService/*, EspGeneralService*/, ModOneApiService, AutomationService, AlertService, LoggerService, CentralLoggerService, MQTTService, AppService,
    ConfigService,
    NativeAccessService,
    NFC, Ndef,/*DeviceDetailMod1Service*/
    Network,
    NetworkInterface,
    SMS,
    AndroidPermissions]
})
export class AppModule {}
