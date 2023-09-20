import { getRolledIndex, getHead, getTail, getNumbers } from "./utils.mjs"
import {
  MONTHS_IN_YEAR,
  MAX_MONTH_LEN,
  JAN, FEB, DEC,
  MONTH_DAYS,
  WEEK_SIZE,
  PREV, CURRENT, NEXT,
  CELLS
} from "./constants.mjs"

const INIT_STATE = 'INIT_STATE'
const SELECT_DATE = 'SELECT_DATE'
const SHIFT_MONTH = 'SHIFT_MONTH'
const SET_DATE = 'SET_DATE'
const SET_CELLS_DATA = 'SET_CELLS_DATA'

export class CalendarModel {
  constructor(config){
    this.config = config ?? defaultConfig
    this.locale = CalendarModel.getLocaleAccessors(config)
    this.initialized = false
    this.state = {} 
  }

  static getLocaleAccessors(config){
    const {dayNames, monthsNames} = config.locale ?? defaultConfig.locale
    const {firstWeekDay} = config ?? defaultConfig
    return {
      getMonthName: (index)=> monthsNames[index],
      getDayName: (index)=> dayNames[getRolledIndex(WEEK_SIZE, index + firstWeekDay)]
    }
  }

  updateState(action, payload){
    switch(action){
      case INIT_STATE: {
        this.initialized = true
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth()
        this.state.current = { 
          month,
          year
        }
        this.state.cellsData = []
        this.state.selected = {
          date: date.getDate(), 
          month,
          year
        }
        break 
      }
      case SELECT_DATE: {
        this.state.selected.month = this.state.current.month
        this.state.selected.year = this.state.current.year
        this.state.selected.date = payload
        break
      }
      case SET_DATE: {
        const {month, year, date} = payload
        if (!this.state.current) break
        this.state.selected.month = this.state.current.month = month
        this.state.selected.year = this.state.current.year = year
        this.state.selected.date = date
        break
      }
      case SET_CELLS_DATA: {
        this.state.cellsData = payload
        break
      }      
      case SHIFT_MONTH: {
        const offset = payload
        const {year, month} = this.getNearbyMonth(offset)
        this.state.current.month = month
        this.state.current.year = year            
      }
    }
  }

  get isInitialized(){ return this.initialized }
  get currentMonth(){ return this.state.current.month}
  get selectedMonth(){ return this.state.selected.month}
  get currentYear(){ return this.state.current.year}
  get selectedYear(){ return this.state.selected.year}
  get selectedDate(){ return this.state.selected.date}
  get cellsData(){ return this.state.cellsData?.slice()}
  
  initializeIfNeed(){
    if (!this.initialized) this.updateState(INIT_STATE)
  }

  selectDate(textDateNum){
    this.updateState(SELECT_DATE, +textDateNum)
  }

  setDate({year, month, date}){
    this.updateState(SET_DATE, {year, month, date})
    this.updateState(SET_CELLS_DATA, this.getCalendarCellsData())
  }

  setCalendarDate(newDate){
    const year = newDate.getFullYear()
    const month = newDate.getMonth()
    this.updateState(SET_DATE, {year, month, date: newDate.getDate()})
    this.updateState(SET_CELLS_DATA, this.getCalendarCellsData())
  }

  changeMonth(offset){ 
    this.updateState(SHIFT_MONTH, offset)
  }

  setCellsData(){
    this.updateState(SET_CELLS_DATA, this.getCalendarCellsData())
  }

  getSelectedDateYMD(){
    return [this.state.selected.year, this.state.selected.month, this.state.selected.date]
  }
  
  getCurrentViewYM(){
    return [this.state.current.year, this.state.current.month]
  }

  getSizeOfMonth({year, month}) {
    const getSizeOfFeb = year => MAX_MONTH_LEN -
      new Date(year, FEB, MONTH_DAYS[FEB]).getMonth() - 1 
    return month === FEB  ? getSizeOfFeb(year) : MONTH_DAYS[month]
  } 
  
  getCalendarCellsData() {
    const {year, month} = this.state.current
    const date = new Date(year, month, 1)
    const size = this.getSizeOfMonth({year, month})
    const prevSize = this.getSizeOfMonth(this.getNearbyMonth(PREV))
    const nextSize = this.getSizeOfMonth(this.getNearbyMonth(NEXT))
    const firstDayOffset = getRolledIndex(WEEK_SIZE, date.getDay() - this.config.firstWeekDay )
    const prevMonthNumbers = firstDayOffset ? getTail(getNumbers(prevSize), firstDayOffset) : []
    const currMonthNumbers = getNumbers(size)
    const nextMonthDaysCount = CELLS - (prevMonthNumbers.length + currMonthNumbers.length)
    const nextMonthNumbers = getHead(getNumbers(nextSize), nextMonthDaysCount)
    return [
      ...prevMonthNumbers.map(date => ({date, monthOffset: PREV})), 
      ...currMonthNumbers.map(date => ({date, monthOffset: CURRENT})),
      ...nextMonthNumbers.map(date => ({date, monthOffset: NEXT})),
    ]
  }
  
  getIndexInCellData(){
    return this.cellsData.findIndex(e => 
      e.date === this.selectedDate && e.monthOffset === CURRENT)
  }

  * getCalendarDays(){
    for (let i = 0; i < WEEK_SIZE; i++) yield this.locale.getDayName(i)
  }
  
  getNearbyMonth(offset){
    let {year, month} = this.state.current
    if (offset < 0) {
      year += month === JAN ? PREV : CURRENT
      month = getRolledIndex(MONTHS_IN_YEAR, month + PREV)
    } else if (offset > 0){
      year += month === DEC ? NEXT : CURRENT
      month = getRolledIndex(MONTHS_IN_YEAR, month + NEXT)
    }
    return {year, month}
  } 

  resetLocale(config){
    this.locale = CalendarModel.getLocaleAccessors(config)
  }
}