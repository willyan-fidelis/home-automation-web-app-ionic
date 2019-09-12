import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SpeechRecPage } from './speech-rec';

@NgModule({
  declarations: [
    SpeechRecPage,
  ],
  imports: [
    IonicPageModule.forChild(SpeechRecPage),
  ],
})
export class SpeechRecPageModule {}
