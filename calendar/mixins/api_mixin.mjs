import * as CONST from "../constants.mjs"

export const APIMixin = {
  callAPI(ACTION, ...ARG){
    this.getAction(ACTION).bind(this)(...ARG)
  },
  getAction(ACTION){
    return {
      [CONST.API_GOTO_MONTH]: this.nextMonth,
      [CONST.API_GOTO_DATE]: this.goToDate,
      [CONST.API_SHOW_CALENDAR]: this.showCalendar,
      [CONST.API_HIDE_CALENDAR]: this.hideCalendar,
    }[ACTION]
  }
}