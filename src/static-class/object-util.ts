//import { FormControl } from '@angular/forms';

export class ObjectUtil {

  static hasAnyProperty(obj: any){
    for(var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
          // handle prop as required
          //console.log("Object has any property defined!")
          return true
      }
    }
    return false;
  }

  //Find a word in a string:
  static findWord(word: string, strTosearch: string) {
    //https://stackoverflow.com/questions/25493984/javascript-find-word-in-string
    return strTosearch.split(' ').some(function(w){return w === word}) //The same with RegEx: return RegExp('\\b'+ word +'\\b').test(str)
  }
  static findWordList2(wordList, strTosearch) {//Falta implementar isso..
  	let _wordList = []
  	let _toSearchList = []
    //https://stackoverflow.com/questions/25493984/javascript-find-word-in-string
    wordList.split(' ').some(function(w){_wordList.push(w)})
    strTosearch.split(' ').some(function(w){_toSearchList.push(w)})
    for(var i in _toSearchList){
      if(!(_wordList[i] == _toSearchList[i])){
        return false
      }
    }
    return true
  }
  static findWordOrPhrase(wordOrPhrase: string, strTosearch: string) {
    //https://stackoverflow.com/questions/25493984/javascript-find-word-in-string
    if(wordOrPhrase.split(' ').length > 1){
      //Is a phrase:
      if(strTosearch.indexOf(wordOrPhrase) != -1){
        return true
      }
      else{return false}
    }
    else{
      //Is a word:
      return this.findWord(wordOrPhrase, strTosearch)
    }
  }

  static findWordList(wordList: Array<string>, strTosearch: string){
    for(var obj of wordList){
      if(this.findWord(obj,strTosearch)){
        return true
      }
    }
  }

  static findWordOrPhraseList(wordOrPhraseList: Array<string>, strTosearch: string){
    for(var obj of wordOrPhraseList){
      if(this.findWordOrPhrase(obj,strTosearch)){
        return true
      }
    }
  }

  static removeAccents(text){
    //https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
    if (text){
      return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    }
    else{return ""}
  }
}

export class ConsoleLogService {

  //-------------------------------- Log for Development --------------------------------
  private static developerLogEnabled: boolean = false
  private static developerLoggerText: string = ''
  private static logDeveloperLogger(log: any, log2?: any,log3?: any,log4?: any){
    if(this.developerLogEnabled == false){return}


    if(log4 !== undefined){
      //console.log(log, log2, log3, log4)
      this.developerLoggerText ='<b>---------------- New Log ----------------</b><br/><br/>' + JSON.stringify(log) + JSON.stringify(log2) + JSON.stringify(log3) + JSON.stringify(log4) + "<br/><br/>" + this.developerLoggerText + "<br/><br/>"
    }
    else if(log3 !== undefined){
      //console.log(log, log2, log3)
      this.developerLoggerText = '<b>---------------- New Log ----------------</b><br/><br/>' + JSON.stringify(log) + JSON.stringify(log2) + JSON.stringify(log3) + "<br/><br/>" + this.developerLoggerText + "<br/><br/>"
    }
    else if(log2 !== undefined){
      //console.log(log, log2)
      this.developerLoggerText = '<b>---------------- New Log ----------------</b><br/><br/>' + JSON.stringify(log) + JSON.stringify(log2) + "<br/><br/>" + this.developerLoggerText + "<br/><br/>"
    }
    else{
      //console.log(log)
      this.developerLoggerText = '<b>---------------- New Log ----------------</b><br/><br/>' + JSON.stringify(log) + "<br/><br/>" + this.developerLoggerText
    }
    //console.log('XTX: '+this.developerLoggerText)
  }
  private static typeUsedList: Array<string> = []
  public static toggleOnOffDeveloperLogger(){this.developerLogEnabled = !this.developerLogEnabled}
  public static isEnableDeveloperLogger(){return this.developerLogEnabled}
  public static clearDeveloperLogger(){this.developerLoggerText = ''}
  public static getDeveloperLoggerText(): string{return this.developerLoggerText}
  public static getTypeUsedList(): Array<string> {return this.typeUsedList}
  public static getTypeSelected(): Array<string> {return this.typeSelected}
  public static setTypeSelected(list: Array<string>){this.typeSelected = list}
  public static logAll(): void {this.typeSelected = []}
  //-------------------------------- Log for Development --------------------------------

  private static typeSelected: Array<string> = ["ModOneApiService","HttpService","LocalStorageService"]
  private static firstLog: boolean = false
  //private static logList: {type: string, log: string, date: Date}[] = [];

  public static log(_type: string, log: any, log2?: any,log3?: any,log4?: any){
    if (this.typeUsedList.indexOf(_type) == -1){this.typeUsedList.push(_type)}

    let _oneTypeSelected: boolean = false
    let _manyTypesSelected: boolean = false
    //let _allTypesSelected: boolean = false
    let _typeFound: boolean = false
    if(this.typeSelected.length === 0){
      //_allTypesSelected = true
      return
    }
    if(this.typeSelected.length === 1){
      _oneTypeSelected = true
    }
    if(this.typeSelected.length > 1){
      _manyTypesSelected = true
    }
    if(this.typeSelected.filter(elem => elem === _type).length !== 0){
      _typeFound = true
    }

    //Put All logs on the queue:
    //this.logList.unshift({type: _type, log: log, date: new Date()});

    //Only log the desired type of log:
    let _eval = this.typeSelected.filter(elem => elem === _type).length
    if (/*_allTypesSelected || */_typeFound == true){//if (_type === this.typeSelected || this.typeSelected === "all"){

      //First log print:
      if (!this.firstLog && !_manyTypesSelected){
        console.log("ConsoleLogService recive new log from '" + _type + "'. Contente: ")
        this.firstLog = true
      }

      if(_manyTypesSelected){
        console.log("### '"+_type+"' Log ###")
      }

      //Now log the msg:
      if(log4 !== undefined){
        console.log(log, log2, log3, log4)
        this.logDeveloperLogger(log, log2, log3, log4)
      }
      else if(log3 !== undefined){
        console.log(log, log2, log3)
        this.logDeveloperLogger(log, log2, log3)
      }
      else if(log2 !== undefined){
        console.log(log, log2)
        this.logDeveloperLogger(log, log2)
      }
      else{
        console.log(log)
        this.logDeveloperLogger(log)
      }
    }
  }

}
