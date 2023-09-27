import {BasePlugin} from '../base/base_plugin.mjs'
import { API_SHOW_CALENDAR, INSERT_BEFORE } from "../constants.mjs";

export class Plugin_FC_SHOW_CALENDAR extends BasePlugin{
  getTemplateModifiers(){
    return [
      {
        targetTag: '.calendar__input._icon-calendar',
        type: INSERT_BEFORE,
        html: `
          <style>
            .active {
              background: yellow;
            }
          </style>
          <button class="show-calendar">Show Calendar</button>
        `,
        uiName: 'showCalendarBtn',
        uiSelector: '.show-calendar' 
      }
    ]  
  }
  getEvents(){
    return [
      { element:  'showCalendarBtn',  event: 'click',  handler: 'showCalendar' }
    ]
  }
  showCalendar(){
    this.callAPI(API_SHOW_CALENDAR)
  }
}