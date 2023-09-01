(function() {
const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель",
  "Май", "Июнь", "Июль", "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const MAX_MONTH_LEN = 31
const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];  
const MONTHS_IN_YEAR = MONTH_DAYS.length
const CELLS = 42
const JAN = 0, FEB = 1, DEC = 11
const SUNDAY=0, MONDAY=1, WEDNESDAY = 3
const FIRST_WEEK_DAY = WEDNESDAY
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

class FlexyCalendar extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const flexyCalendarContainer = document.createElement('div');
    flexyCalendarContainer.classList.add('flexy-calendar');
    const template = `
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
          <button class="calendar__btn-prev calendar-btn" tabindex="0" type="button" title="Next month" aria-label="Next month">
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
    this.ui = {
      calendar: null,
      input: null,
      calHeaderTitle: null,
      calDays: null,
    }
    this.state = {} 
    flexyCalendarContainer.innerHTML = template;
    shadow.appendChild(flexyCalendarContainer);
    this.attributeChangedCallback = this.attributeChangedCallback.bind(this)
  }
  connectedCallback() {
    console.log('connectedCallback')
    this.setHTMLElements()
    this.init()
  }

  disconnectedCallback(){
    console.log('disconnectedCallback')
  }

  static get observedAttributes() { return ['date']; }
  
  attributeChangedCallback(name, oldValue, newValue){
    console.log({name, oldValue, newValue})
    if (name === 'date' && this.state.cellsData){
      const changedDate = new Date(newValue);
      const year = changedDate.getFullYear();
      const month = changedDate.getMonth();
      this.updateState(SET_DATE, {year, month, date: changedDate.getDate()})
      this.updateState(SET_CELLS_DATA, this.getCalendarCellsData())
      const index = this.state.cellsData.findIndex((e, i) => {
        return e.date === this.state.selected.date && e.monthOffset === CURRENT
      })
      this.removeActive()
      this.state.selected.cell = this.ui.calendar.children[index]
      this.updateCalendarUI()
      this.dispatchChangeDateEvant()
    }
  }

  updateState(action, payload){
    switch(action){
      case INIT_STATE: {
        const dateAttr =  this.getAttribute('date')
        const date = dateAttr ? new Date(dateAttr) : new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        this.state.current = { 
          month,
          year,
          isPopup: false
        }
        this.state.cellsData = []
        this.state.selected = {
            date: date.getDate(), 
            month,
            year,
            cell: null
        }
        break 
      }
      case SELECT_DATE: {
        const cell = payload
        this.state.selected.month = this.state.current.month
        this.state.selected.year = this.state.current.year
        this.state.selected.date = +cell.innerText
        this.state.selected.cell = cell
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

  incudeClassByCondition(element, className, condition){
    const action = condition ? 'add' : 'remove'
    element.classList[action](className);
  }

  getSizeOfMonth({year, month}) {
    const getSizeOfFeb = year => MAX_MONTH_LEN -
      new Date(year, FEB, MONTH_DAYS[FEB]).getMonth() - 1 
    return month === FEB  ? getSizeOfFeb(year) : MONTH_DAYS[month]
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

  getCalendarCellsData() {
    const {year, month} = this.state.current
    const date = new Date(year, month, 1)
    const size = this.getSizeOfMonth({year, month})
    const prevSize = this.getSizeOfMonth(this.getNearbyMonth(PREV))
    const nextSize = this.getSizeOfMonth(this.getNearbyMonth(NEXT))
    const firstDayOffset = getRolledIndex(DAY_NAMES.length, date.getDay() - FIRST_WEEK_DAY )
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

  setDateAttribute(){
    const {year, month, date} = this.state.selected
    this.setAttribute('date', `${month+1}/${date}/${year}`)
  }

  dispatchChangeDateEvant(){
    const {year, month, date} = this.state.selected  
    const changeDate = new CustomEvent("changedate", {
      detail: {
        date: `${month+1}/${date}/${year}`,
      },
    });
    this.dispatchEvent(changeDate)
  }

  setDateToInput(){
    const {year, month, date} = this.state.selected  
    this.ui.input.value = `${MONTH_NAMES[month]} ${date}, ${year}`
  };

  setCalendarHeader(){
    const {month, year} = this.state.current
    this.ui.calHeaderTitle.innerHTML = `${MONTH_NAMES[month]} ${year}` 
  };

  setCalendarBody(){
    this.updateState(SET_CELLS_DATA, this.getCalendarCellsData())
    for (let i = 0; i < CELLS; i++) { 
      const div = this.ui.calendar.children[i]
      const span = div.children[0]
      const {monthOffset, date} = this.state.cellsData[i]
      this.incudeClassByCondition(div, 'current', monthOffset === CURRENT)
      span.innerText = date
    }
    this.showSelectedCellIfNeed()
  };

  changeMonth(btn){
    if (btn.classList.contains("calendar__btn-prev")) {
      this.updateState(SHIFT_MONTH, PREV)
    } else if (btn.classList.contains("calendar__btn-next")) {
      this.updateState(SHIFT_MONTH, NEXT)
    }
    this.updateCalendarUI()
  };

  selectOnClick(cell){
    if (!cell) return
    this.updateState(SELECT_DATE, cell)
    this.setDateToInput()
    this.setDateAttribute()
    this.dispatchChangeDateEvant()
  };

  removeActive(){
    this.shadowRoot.querySelector('.cal_date.active')?.classList.remove('active')
  }

  setActive(cell){
    cell?.classList.add('active')
  }

  addListenerToCalendar(){
    this.ui.calendar.addEventListener('click', ({target}) => {
      this.removeActive()
      const cell = target.closest('.cal_date')
      this.setActive(cell)
      this.selectOnClick(cell);
    }) 
  }

  getOffsetMonth(arr, i){
    const half = CELLS/2
    const isBigNumberAtBegin = i < 7 && arr[i] > half
    const isSmallNumberAtEnd = i > 28 && arr[i] < half
    if (isBigNumberAtBegin) return PREV
    else if (isSmallNumberAtEnd) return NEXT
    return CURRENT
  }

  setDaysPlaceholders(){
    this.updateState(SET_CELLS_DATA, this.getCalendarCellsData())
    for (let i = 0; i < CELLS; i++) {
      let div = document.createElement("div"),
          span = document.createElement("span");
      div.classList.add("cell_wrapper");
      div.classList.add("cal_date");
      const {date, monthOffset} = this.state.cellsData[i]
      if(monthOffset === CURRENT){
        div.classList.add("current");
        if (this.state.selected.date === date){
          this.setActive(div)
          this.state.selected.cell = div
        }  
      }
      span.classList.add("cell_item");
      span.innerText = date
      div.appendChild(span);
      this.ui.calendar.appendChild(div);
    }
  };

  showSelectedCellIfNeed(){
    this.incudeClassByCondition(
      this.state.selected.cell, 'active',  
      this.state.selected.month === this.state.current.month
        && this.state.selected.year === this.state.current.year
    )
  }

  updateCalendarUI(){
    this.setDateToInput()
    this.setCalendarHeader()
    this.setCalendarBody()
  }

  setCalendarDays(){
    for (let i = 0; i < DAY_NAMES.length; i++) {
      let div = document.createElement("div"),
          span = document.createElement("span");
      div.classList.add("cell_wrapper");
      span.classList.add("cell_item");
      span.innerText = DAY_NAMES[getRolledIndex(DAY_NAMES.length, i + FIRST_WEEK_DAY)]
      div.appendChild(span);
      this.ui.calDays.appendChild(div);
    }        
  }

  setHTMLElements(){
    this.ui.calendar = this.shadowRoot.querySelector(".calendar__main");
    this.ui.input = this.shadowRoot.querySelector("#date");
    this.ui.calHeaderTitle = this.shadowRoot.querySelector(".calendar__header span");
    this.ui.calDays = this.shadowRoot.querySelector(".calendar__days");
  }

  hideCalendar(){
    this.shadowRoot.querySelector('.calendar__content').classList.add('hidden')
    this.ui.backDrop.remove()
    this.state.current.isPopup = false
  }

  showCalendar(){
    this.shadowRoot.querySelector('.calendar__content').classList.remove('hidden')
    this.showCalendarPopup = true
    this.ui.backDrop = document.createElement('div')
    this.ui.backDrop.classList.add('backdrop')
    this.parentNode.parentNode.insertBefore(this.ui.backDrop, this.parentNode)
  }

  init(){
    this.updateState(INIT_STATE)
    this.setDateToInput();
    this.setCalendarDays()
    this.setCalendarHeader();
    this.setDaysPlaceholders()
    this.addListenerToCalendar()

    this.shadowRoot.querySelectorAll(".calendar-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.changeMonth(btn);
      });
    });

    this.ui.input.addEventListener('click', () => {
      if (this.state.current.isPopup === true) return
      this.state.current.isPopup = true
      this.showCalendar()
    });
    
    window.addEventListener('click', ({target, currentTarget}) => {
      if (this.state.current.isPopup && target.tagName !== this.tagName){
        this.hideCalendar()
      }
    })
  }
}

customElements.define('flexy-calendar', FlexyCalendar);
})();