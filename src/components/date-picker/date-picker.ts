import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConsoleLogService } from '../../static-class/object-util';

/*
  Generated class for the DatePicker page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

export interface  DayDatePickerModel {day:number,month:number,year:number}
export interface  TimeDatePickerModel {hour:number, minute:number, second:number}
export interface  DateDatePickerModel {weekDay:[boolean,boolean,boolean,boolean,boolean,boolean,boolean] | number | string, day: DayDatePickerModel, time: TimeDatePickerModel}

@Component({
  selector: 'component-date-picker',
  templateUrl: 'date-picker.html'
})
export class DatePickerComponent implements OnChanges {
  @Output() onTimeChanged = new EventEmitter<DateDatePickerModel>();
  @Input() multipleWeekDays: boolean = false;
  @Input() hideSeconds: boolean = false;
  @Input() hideDate: boolean = false;
  @Input() hideWeekDays: boolean = false;
  @Input() title: string = "Hora";
  @Input() date: DateDatePickerModel = {weekDay:[false,false,false,false,false,false,false], day: {day:0,month:0,year:0}, time: {hour:0, minute:0, second:0}}
  private myDate: any = {weekDay: "2", day: "2016-01-01", time: "05:10:10"}

  private timeChanged(){
    //Get the new data:
    if (this.multipleWeekDays){
      this.date.weekDay = [false,false,false,false,false,false,false]
      for (let i in this.myDate.weekDay){
        //ConsoleLogService.log("DatePickerPage","TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT: ", i)
        this.date.weekDay[Number(this.myDate.weekDay[i])-1] = true
      }
    }
    else{
      this.date.weekDay = this.myDate.weekDay
    }
    //this.date.weekDay = this.myDate.weekDay
    this.date.day.year = Number(this.myDate.day.slice(2, 4));
    this.date.day.month = Number(this.myDate.day.slice(5, 7));
    this.date.day.day = Number(this.myDate.day.slice(8, 10));

    this.date.time.hour = Number(this.myDate.time.slice(0, 2));
    this.date.time.minute = Number(this.myDate.time.slice(3, 5));
    this.date.time.second = Number(this.myDate.time.slice(6, 8));

    ConsoleLogService.log("DatePickerPage","New Time is: " + this.date)
    this.onTimeChanged.emit(this.date)
  }
  constructor(public navCtrl: NavController) {ConsoleLogService.log("DatePickerPage",'Hello DatePickerPage Page');}

  ionViewDidLoad() {
    ConsoleLogService.log("DatePickerPage",'Hello DatePickerPage Page');
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}){ //This methodo is called always that one @input changes
    //This methodo(ngOnChanges) is called always that one @input changes. When this class is called the '@Input' doens't cames refresed, so we must call 'ngOnChanges' to ensure that the @input will be read correctly:
    if(typeof this.date.weekDay === "number" || typeof this.date.weekDay === "string"){this.multipleWeekDays = false} //Only typeof array could be multiple Chooses!
    this.fisrtLoad()
  }

  fisrtLoad(){//Fisrt Load Method -> Is called the first time, when the @Input arrived correctly!
    //Read the @input and refresh 'myDate':
    if (this.multipleWeekDays){
      this.myDate.weekDay = []
      let weekDaysArray: any = this.date.weekDay
      for (let i in weekDaysArray){
        if (this.date.weekDay[i]){
          this.myDate.weekDay.push(Number(i)+1)
        }
        else{
        }
      }
    }
    else{
      this.myDate.weekDay = this.date.weekDay
    }
    //this.myDate.weekDay = this.date.weekDay//this.mask("0",1,this.date.weekDay)
    this.myDate.day = this.mask("20",4,this.date.day.year)+'-'+this.mask("00",2,this.date.day.month)+'-'+this.mask("00",2,this.date.day.day)
    this.myDate.time = this.mask("00",2,this.date.time.hour)+':'+this.mask("00",2,this.date.time.minute)+':'+this.mask("00",2,this.date.time.second)
    ConsoleLogService.log("DatePickerPage",'DatePickerPage was changed!!!' + this.myDate);
  }

  //Create a mask to a number. Exemples: Month 7 -> 07 / Year 16 -> 2016. See at:
  //http://stackoverflow.com/questions/8043026/javascript-format-number-to-have-2-digit

  private mask(mask,size,numb){
    // mask="0"
    // size=2
    // numb = 7;
    let result = (mask + numb).slice(-size);
    return result;
  }
}
