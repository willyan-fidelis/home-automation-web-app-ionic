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

  static map(in_x, in_min, in_max, out_min, out_max){
    return (in_x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
  }
}
