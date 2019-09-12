import { Injectable } from '@angular/core';
//import { UserModel } from '../model/user-model';
import { LocalStorageService } from './local-storage-service';
import { HttpService } from './http-service';
import { ConsoleLogService } from '../static-class/object-util';
import { ConfigService } from './config-service';
import { Events } from 'ionic-angular';

export interface  UserModel {
    logged: boolean;
    AnyTimelogged: boolean;
    name: string;
    password: string;
    email: string;
    SessionID: string;
    RoomList: Array<{Name:string, Type:string}>
    //public email?: string
}

@Injectable()
export class UserService {
  constructor(public events: Events, public configService: ConfigService, public localStorage: LocalStorageService, public httpService: HttpService) {
    ConsoleLogService.log("UserService",'Hello User Provider');
    //this.user = this.getEmptyUser()

    this.configService.getConfigObj((obj)=>{this.ip=obj.server.URL})
    this.events.subscribe("ConfigService:NewData",(obj)=>{this.ip=obj.server.URL})
  }

  public user: UserModel = this.getEmptyUser();
  public ip: string = ''//"192.168.0.14"//"willyancasa-PC"//'willyannote';
  private timeout: number = 15000;
  private localStorageName: string = "user"

  public getEmptyUser(){
    //ConsoleLogService.log("UserService","New User got!");
    let _user: UserModel = {AnyTimelogged: true, logged: false, name: "", password: "", email: "", SessionID: "", RoomList:[{Name:"Desconhecido", Type:"Desconhecido"}]};
    return _user;
  }
  public getUser(_callBackOk : (user: UserModel) => any, _callBackNoUser : () => any){
    this.localStorage.isSet(this.localStorageName,()=>{
      //If no data is available(null) so:
      let _user = this.getEmptyUser()
      _user.AnyTimelogged = false
      this.localStorage.set(this.localStorageName,_user)
      _callBackNoUser()
    },()=>{
      //If data is available(not null) so:
      this.localStorage.get(this.localStorageName,(ob)=>{this.user=ob; _callBackOk(this.user)})
    });
  }
  //----------------------- Comunication with data base methods From/To DB(Data Base) ----------------------->>>

  public login_DB(_email: string, _password: string, _callBackOk, _callBackNotOk, _callBackFail){
      this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpUserLogin.php/?email="+_email+"&pwd="+_password, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //So set the Session ID:
        this.user.SessionID = res.Results[0].Session;
        //And mark as logged:
        this.user.logged = true
        this.user.AnyTimelogged = true
        this.localStorage.set(this.localStorageName,this.user);
        _callBackOk(this.user)
      }
      else
      {
        //Wrong info - So set the user to be emptied:
        this.user = this.getEmptyUser();
        this.localStorage.set(this.localStorageName,this.user);
        _callBackNotOk(res)
      }
    }, (error)=>{
      this.user = this.getEmptyUser(); //wrong user, so get emptied!
      this.localStorage.set(this.localStorageName,this.user);
      _callBackFail(error)
    })
  }
  public changePassword_DB(_email: string, _password: string, _new_password: string, _session: string, _callBackOk, _callBackNotOk, _callBackFail){
      this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpEditUserPwd.php/?email="+_email+"&pwd="+_password+"&newpwd="+_new_password+"&session="+_session, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //Save the new password:
        this.user.password = _new_password;
        this.localStorage.set(this.localStorageName,this.user);
        _callBackOk(res)
      }
      else
      {
        //Wrong info - So set the user to be emptied:
        this.user = this.getEmptyUser();
        this.localStorage.set(this.localStorageName,this.user);
        _callBackNotOk(res)
      }
    }, (error)=>{
      _callBackFail(error)
    })
  }
  public logout_DB(_callBackOk, _callBackFail){
    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpUserLogoutAll.php/?email="+this.user.email+"&session="+this.user.SessionID, (res)=>{
      this.localStorage.set(this.localStorageName,this.user);
      _callBackOk(res)
    }, (error)=>{
      this.localStorage.set(this.localStorageName,this.user);
      _callBackFail(error)
    })
    //So set the user to be emptied:
    this.user = this.getEmptyUser();
  }
  public createNewUser_DB(_email: string, _password: string, _callBackOk, _callBackNotOk, _callBackFail){
    this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpUserAdd.php/?email="+_email+"&pwd="+_password, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        // //So set the Session ID:
        // this.user.SessionID = res.Results[0].Session;
        // //And mark as logged:
        // this.user.logged = true
        // this.user.AnyTimelogged = true
        // this.localStorage.set(this.localStorageName,this.user);
        _callBackOk(res)
      }
      else
      {
        //Wrong info - So set the user to be emptied:
        this.user = this.getEmptyUser();
        this.localStorage.set(this.localStorageName,this.user);
        _callBackNotOk(res)
      }
    }, (error)=>{
      this.user = this.getEmptyUser(); //wrong user, so get emptied!
      this.localStorage.set(this.localStorageName,this.user);
      _callBackFail(error)
    })
  }
  public getUserRoomList_DB(_email: string, _session: string, _callBackOk, _callBackNotOk, _callBackFail){
      this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/StReturnUserRoomList.php/?email="+_email+"&session="+_session, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //Save the new list:
        this.user.RoomList = res.Results;
        this.localStorage.set(this.localStorageName,this.user);
        _callBackOk(res)
      }
      else
      {
        //Wrong info - So set the user to be emptied:
        //this.user = this.getEmptyUser();
        //this.localStorage.set(this.localStorageName,this.user);
        _callBackNotOk(res)
      }
    }, (error)=>{
      _callBackFail(error)
    })
  }
  public editUserRoom_DB(_email: string, _session: string, _room: string, room_old_name:string, Room_Type:string, _callBackOk, _callBackNotOk, _callBackFail){
      this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpUpDataUserRoom.php/?email="+_email+"&session="+_session+"&room_name="+_room+"&room_old_name="+room_old_name+"&RoomType="+Room_Type, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //Get List:
        this.getUserRoomList_DB(_email, _session,(res)=>{_callBackOk(res)},(res)=>{_callBackNotOk(res)},(err)=>{_callBackFail(err)})
      }
      else
      {
        //Wrong info - So set the user to be emptied:
        //this.user = this.getEmptyUser();
        //this.localStorage.set(this.localStorageName,this.user);
        _callBackNotOk(res)
      }
    }, (error)=>{
      _callBackFail(error)
    })
  }
  public deleteUserRoom_DB(_email: string, _session: string, _room: string, _callBackOk, _callBackNotOk, _callBackFail){
      this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/StDeleteUserRoom.php/?email="+_email+"&session="+_session+"&room_name="+_room, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //Get List:
        this.getUserRoomList_DB(_email, _session,(res)=>{_callBackOk(res)},(res)=>{_callBackNotOk(res)},(err)=>{_callBackFail(err)})
      }
      else
      {
        //Wrong info - So set the user to be emptied:
        //this.user = this.getEmptyUser();
        //this.localStorage.set(this.localStorageName,this.user);
        _callBackNotOk(res)
      }
    }, (error)=>{
      _callBackFail(error)
    })
  }
  public newUserRoom_DB(_email: string, _session: string, _room: string, _type: string, _callBackOk, _callBackNotOk, _callBackFail){
      this.httpService.subscribeRequest(this.timeout, this.ip, "/hsn_db/php/hsdata/SpUserRoomAdd.php/?email="+_email+"&session="+_session+"&room_name="+_room+"&RoomType="+_type, (res)=>{
      //Check if the result is ok:
      if (res.Parameters.Result == "1")
      {
        //Get List:
        this.getUserRoomList_DB(_email, _session,(res)=>{_callBackOk(res)},(res)=>{_callBackNotOk(res)},(err)=>{_callBackFail(err)})
      }
      else
      {
        //Wrong info - So set the user to be emptied:
        //this.user = this.getEmptyUser();
        //this.localStorage.set(this.localStorageName,this.user);
        _callBackNotOk(res)
      }
    }, (error)=>{
      _callBackFail(error)
    })
  }
  //----------------------- Comunication with data base methods From/To DB(Data Base) -----------------------<<<

  //Get Status methods ------------------------------------------>>>
  public isLogged(_callBackIsLogged : (user: UserModel) => any,_callBackIsNotLogged : () => any,_callBackAnyTimeLogged : () => any,_callBackAfterCheck : () => any){
    this.getUser((_user)=>{
      this.localStorage.get(this.localStorageName,(ob)=>{
        this.user=ob;
        if (this.user.logged){
          ConsoleLogService.log("UserService","User is logged!")
          _callBackIsLogged(this.user)
        }
        else{
          if(this.user.AnyTimelogged){
            ConsoleLogService.log("UserService","User is logged at least one time!")
            _callBackAnyTimeLogged()
          }
          else{
            ConsoleLogService.log("UserService","User is not logged!")
            _callBackIsNotLogged()
          }
        }
        _callBackAfterCheck()
      })
      //return this.user.logged;
    }, ()=>{
      _callBackIsNotLogged();_callBackAfterCheck()
    })

  }
  //Get Status methods ------------------------------------------<<<
}
