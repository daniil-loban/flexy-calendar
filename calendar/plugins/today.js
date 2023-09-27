import {BasePlugin} from '../base/base_plugin.mjs'
import { INSERT_AFTER, SUNDAY, API_GOTO_DATE } from "../constants.mjs";


export class Plugin_FC_TODAY_BTN extends BasePlugin {
  getTemplateModifiers(){
    return [
      {
        targetTag: '.calendar__btn-prev',
        type: INSERT_AFTER,
        html: `<style>
            .today-btn {
              border: 0;
              border-radius: 5px;
              background: transparent;
            }
            .today-btn:hover {
              background: rgba(0,0,0,.2);
            }
          </style>
          <button class="today-btn">Today</button>`,
        uiName: 'todayBtn',
        uiSelector: '.today-btn' 
      }
    ]  
  }
  getEvents(){
    return [
      { element:  'todayBtn',  event: 'click',  handler: 'gotoToday' }
    ]
  }
  gotoToday(){
    this.callAPI(API_GOTO_DATE, new Date())
  }
  updateLocale(){
    return {
      dayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      monthsNames: ["Jan", "Feb", "Mar", "Apr",
      "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec"]
    }
  }
  updateConfig(){
    return {
      firstWeekDay: SUNDAY
    }
  }
}
