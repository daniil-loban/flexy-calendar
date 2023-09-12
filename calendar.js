(function() {
const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]  
const MAX_MONTH_LEN = Math.max.apply(null, MONTH_DAYS)
const MONTHS_IN_YEAR = MONTH_DAYS.length
const WEEK_SIZE = 7
const CELLS = WEEK_SIZE * 6
const JAN = 0, FEB = 1, DEC = 11
const SUNDAY=0, MONDAY=1
const SILENT = 0, LOUDNESS = 1
const PREV = -1, NEXT = 1, CURRENT = 0
const getNumbers = size => Array.from(Array(size)).map((_, i) => i + 1)
const getTail = (arr, size) => arr.slice(-size)
const getHead = (arr, size) => arr.slice(0, size)
const getRolledIndex = (size, index) => (size + index) %  size
const INIT_STATE = 'INIT_STATE'
const SELECT_DATE = 'SELECT_DATE'
const SHIFT_MONTH = 'SHIFT_MONTH'
const SET_DATE = 'SET_DATE'
const SET_CELLS_DATA = 'SET_CELLS_DATA'
const defaultLocale = {
  dayNames: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  monthsNames: ["Январь", "Февраль", "Март", "Апрель",
    "Май", "Июнь", "Июль", "Август",
    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
}
const defaultTemplate = `
<style>
.calendar{
  position: relative;
}
.calendar__input input {
  position: relative;
  width: calc(100% - 5px);
  cursor: pointer;
  outline: none;
}
.calendar__content {
  position: absolute;
  z-index: 1;
  right: 0;
  padding: 25px;
  width: auto;
  background: #f8f8f8;
  box-shadow: 1px 1px 5px gray;
}
.calendar__header {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  margin: 0px 0px 24px 0px;
}
.calendar__header span {
  flex: 1 1 auto;
}
.calendar__days, .calendar__main {
  display: grid;
  row-gap:  2px;
  column-gap: 1px;
  grid-template-columns: repeat(7, 1fr);
}
.cal_date .cell_item {
  cursor: pointer;
}
.cell_wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  appearance: none;
  text-decoration: none;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 400;
  font-size: 0.75rem;
  line-height: 1.66;
  letter-spacing: 0.03333em;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: transparent;
  margin: 0px 2px;
}
.cell_wrapper .cell_item {
  margin-top: 3px;
  color: rgba(0, 0, 0, .5);
}
.calendar__days .cell_wrapper .cell_item {
  color: rgba(0, 0, 0, .7);
  cursor: text;
}
.calendar__main .cell_wrapper.cal_date.current:hover {
  background-color: lightgrey;
}
.cell_wrapper.active {
  border:  1px solid darkgray;
}
.current .cell_item {
  color: rgba(0, 0, 0, .9);
}
.hidden {
  visibility: hidden;
}
.calendar-btn {
  display: inline-flex;
  height:  36px;
  width:  36px;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  background: transparent;
  border: 0;
  margin-left: 2px;
}
.calendar-btn:hover {
  background-color: lightgrey;
}
.calendar-btn svg {
  height:  24px;
  width:  24px;
}
</style>
<div class="tabs-transmit-readings__calendar calendar">
  <div class="calendar__input  _icon-calendar">
    <input autocomplete="off" type="text" id="date" class="onFocus" readonly>
    <slot name="num"></slot>
  </div>
  <div class="calendar__content hidden">
    <div class="calendar__header">
      <span></span>
      <button class="calendar__btn-prev calendar-btn" tabindex="0" type="button" title="Previous month" aria-label="Previous month">
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"
            fill="black" fill-opacity="0.5">
          </path>
        </svg>
      </button>
      <button class="calendar__btn-next calendar-btn" tabindex="0" type="button" title="Next month" aria-label="Next month">
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
            fill="black" fill-opacity="0.5">
          </path>
        </svg>
      </button>
    </div>
    <div class="calendar__wrapper">
      <div class="calendar__days"></div>
      <div class="calendar__main"></div>
    </div>
  </div>
</div>`
const defaultConfig = { 
  firstWeekDay: MONDAY,
  locale: defaultLocale,
  template:defaultTemplate,
  ui: { 
    calendar: '.calendar__main',
    input: '#date',
    calHeaderTitle: '.calendar__header span',
    calDays: '.calendar__days',
    popup: '.calendar__content'
  }
}

class EventManager {
  constructor(){ this.eventListenersFree = [] }
 
  add(element, event, func){
    element.addEventListener(event, func)
    this.eventListenersFree.push(() => element.removeEventListener(event, func))
  }
  
  clearAll(){
    this.eventListenersFree.forEach(free => free())
  }
}

class CalendarModel {
  constructor(config){
    this.locale = CalendarModel.getLocaleAccessors(config)
    this.config = config ?? defaultConfig
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
}

class FlexyCalendar extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const flexyCalendarContainer = document.createElement('div')
    flexyCalendarContainer.classList.add('flexy-calendar')
    const template = defaultTemplate
    flexyCalendarContainer.innerHTML = template
    shadow.appendChild(flexyCalendarContainer)
    this.config = defaultConfig
    this.model = new CalendarModel(defaultConfig)
    this.eventManager = new EventManager()
    this.ui = {}
    this.isPopupOpen = false
    this.silentMode = LOUDNESS
    this.attributeChangedCallback = this.attributeChangedCallback.bind(this)
  }

  init(){
    this.setHTMLElements()
    this.model.initializeIfNeed()
    this.setDateToInput()
    this.setCalendarDays()
    this.setCalendarHeader()
    this.setDaysPlaceholders()
    this.addEventsToCalendar()
    this.addEventsToButtons()
    this.addEventsToInput()
    this.addEventsToWindow()
  }

  updateCalendarUI(){
    this.setDateToInput()
    this.setCalendarHeader()
    this.setCalendarBody()
  }

  connectedCallback() {
    this.init()
  }

  disconnectedCallback(){
    this.eventManager.clearAll()
  }
 
  selectCalendarCellByIndex(index){
    this.ui.selectedCell = this.ui.calendar?.children[index]  
  }

  selectCalendarCellByElement(element){
    this.ui.selectedCell = element
  }

  static get observedAttributes() { return ['date', "plugins"] }

  attributeChangedCallback(name, oldValue, newValue){
    this.model.initializeIfNeed()
    switch (name) {
      case 'plugins': 
        if (name === 'plugins' && oldValue === null && newValue === ''){
          this.dispatchWaitPluginsEvent()
        }
        break
      case 'date':
        if (name !== 'date' || !this.model.cellsData) return
        const changedDate = new Date(newValue)
        this.model.setCalendarDate(changedDate)
        const index = this.model.cellsData.findIndex(e => 
          e.date === this.model.selectedDate && e.monthOffset === CURRENT)
        this.selectCalendarCellByIndex(index)
        this.removeActive()
        this.updateCalendarUI()
        if (this.silentMode === LOUDNESS) this.dispatchChangeDateEvent()
        break
      default:
    }
  }

  incudeClassByCondition(element, className, condition){
    element.classList[condition ? 'add' : 'remove'](className)
  }

  setDateAttribute(){
    const [year, month, date] = this.model.getSelectedDateYMD()
    this.setAttribute('date', `${month+1}/${date}/${year}`)
  }

  dispatchChangeDateEvent(){
    const [year, month, date] = this.model.getSelectedDateYMD()  
    const changeDate = new CustomEvent("changedate", {
      detail: { date: `${month+1}/${date}/${year}`}
    })
    this.dispatchEvent(changeDate)
  }

  attachPlugins(arg){
    console.log('attachPlugins:', arg)
  }

  dispatchWaitPluginsEvent(){
    const waitPlugins = new CustomEvent("waitplugins", {
      detail: { cb: this.attachPlugins}
    })
    this.dispatchEvent(waitPlugins)
  }
  
  setDateToInput(){
    if (!this.ui.input) return
    const [year, month, date] = this.model.getSelectedDateYMD()    
    this.ui.input.value = `${this.model.locale.getMonthName(month)} ${date}, ${year}`
  }

  setCalendarHeader(){
    if (!this.ui.calHeaderTitle) return
    const [year, month] = this.model.getCurrentViewYM()
    this.ui.calHeaderTitle.innerHTML = `${this.model.locale.getMonthName(month)} ${year}` 
  }

  setDateToCell(index){
    const div = this.ui.calendar.children[index]
    const span = div.children[0]
    const {monthOffset, date} = this.model.cellsData[index]
    span.innerText = date
    this.incudeClassByCondition(div, 'current', monthOffset === CURRENT)
  }

  setCalendarBody(){
    if (!this.ui.calendar) return
    this.model.setCellsData()
    for (let i = 0; i < CELLS; i++) this.setDateToCell(i)
    this.showSelectedCellIfNeed()
  }

  changeMonth(btn){
    if (btn.classList.contains("calendar__btn-prev")) this.model.changeMonth(PREV)
    else if (btn.classList.contains("calendar__btn-next")) this.model.changeMonth(NEXT)
    this.updateCalendarUI()
  }

  getCellMonthOffset(cell){
    const index = Array.from(this.ui.calendar.children).findIndex(e => e === cell)
    return this.model.cellsData[index].monthOffset
  }

  silentEvent(fn){
    this.silentMode = SILENT
    fn.bind(this)()
    this.silentMode = LOUDNESS
  }

  selectOnClick(target){
    const cell = target.closest('.cal_date')
    if (!cell || this.getCellMonthOffset(cell) !== CURRENT) return
    this.model.selectDate(cell.innerText)
    this.selectCalendarCellByElement(cell)
    this.removeActive()
    this.setActive(cell)
    this.setDateToInput()
    this.silentEvent(this.setDateAttribute)
    this.dispatchChangeDateEvent()
  }

  removeActive(){
    this.shadowRoot.querySelector('.cal_date.active')?.classList.remove('active')
  }

  setActive(cell){ 
    cell?.classList.add('active')
  }

  setDaysPlaceholders(){
    this.model.setCellsData()
    for (let i = 0; i < CELLS; i++) {
      const {date, monthOffset} = this.model.cellsData[i]
      const current = monthOffset === CURRENT ? 'current' : ''
      const active = current && this.model.selectedDate === date ? 'active' : ''
      const div = this.ui.calendar.appendChild(document.createElement("div"))
      div.outerHTML = `
        <div class="cell_wrapper cal_date ${current} ${active}">
          <span class="cell_item">${date}</span>
        </div>`
      if (active) this.selectCalendarCellByIndex(i)
    }
  }

  showSelectedCellIfNeed(){
    this.incudeClassByCondition(
      this.ui.selectedCell, 'active',  
      this.model.selectedMonth === this.model.currentMonth
        && this.model.selectedYear === this.model.currentYear
    )
  }

  setCalendarDays(){
    const days = this.model.getCalendarDays()
    let day = days.next()
    while(!day.done){
      this.ui.calDays.appendChild(document.createElement("div"))
        .outerHTML = `<div class="cell_wrapper">
          <span class="cell_item">
            ${day.value}
          </span>
        </div>`
      day = days.next()
    }
  }

  setHTMLElements(){
    Object.entries(this.config.ui).forEach(([k, v]) => 
      this.ui[k] = this.shadowRoot.querySelector(v))
  }

  hideCalendar(target){
    if (!this.isPopupOpen || (this.isPopupOpen && target === this)) return
    this.isPopupOpen = false
    this.ui.popup.classList.add('hidden')
    this.ui.backDrop.remove()
  }

  showCalendar(){
    if (this.isPopupOpen === true) return
    this.isPopupOpen = true
    this.ui.popup.classList.remove('hidden')
    this.ui.backDrop = document.createElement('div')
    this.ui.backDrop.classList.add('backdrop')
    this.parentNode.insertBefore(this.ui.backDrop, this)
  }

  addEventsToCalendar(){
    this.eventManager.add(
      this.ui.calendar, 'click', ({target}) => { this.selectOnClick(target) }  
    )
  }

  addEventsToButtons(){
    this.shadowRoot.querySelectorAll(".calendar-btn").forEach((btn) => {
      this.eventManager.add(btn, 'click', () => this.changeMonth(btn)) 
    })
  }

  addEventsToInput(){
    this.eventManager.add(this.ui.input, 'click',() => this.showCalendar())}

  addEventsToWindow(){
    this.eventManager.add(window, 'click', ({target}) => this.hideCalendar(target))
  }
}

customElements.define('flexy-calendar', FlexyCalendar)
})();