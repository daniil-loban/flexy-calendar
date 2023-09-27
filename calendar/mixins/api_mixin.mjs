import * as CONST from "../constants.mjs"

export const APIMixin = {
  callAPI(ACTION, ...ARG){
    this.getAction(ACTION).apply(this, ARG)
  },
  getAPI(ACTION){
    return this.getAction(ACTION).bind(this)
  },
  getAction(ACTION){
    return {
      [CONST.API_GOTO_DATE]: this.goToDate,
      [CONST.API_SHOW_CALENDAR]: this.showCalendar,
      [CONST.API_HIDE_CALENDAR]: this.hideCalendar,
      [CONST.API_GET_MONTH]: this.getMonth,
      [CONST.API_SET_MONTH]: this.setMonth,
      [CONST.API_GET_YEAR]: this.getYear,
      [CONST.API_SET_YEAR]: this.setYear,
      [CONST.API_SHOW_PREV_MONTH]: this.showPrevMonth, 
      [CONST.API_SHOW_NEXT_MONTH]: this.showNextMonth, 
    }[ACTION]
  }
}