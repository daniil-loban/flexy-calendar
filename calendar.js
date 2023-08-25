(function() {
const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель",
  "Май", "Июнь", "Июль", "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const MAX_MONTH_LEN = 31
const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];  
const MONTHS_IN_YEAR = 12
const CELLS = 42
const JAN = 0, FEB = 1, DEC = 11
const PREV = -1, NEXT = 1, CURRENT = 0
const getNumbers = size => Array.from(Array(size)).map((_, i) => i + 1)
const getTail = (arr, size) => arr.slice(-size)
const getHead = (arr, size) => arr.slice(0, size)
const getRolledIndex = (size, index) => (size + index) %  size
const INIT_STATE = 'INIT_STATE'
const SELECT_DATE = 'SELECT_DATE'
const SHIFT_MONTH = 'SHIFT_MONTH'

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
    .calendar__input {
      position: relative;
      cursor: pointer;
      width: 100%;
    }
    .calendar__input input {
      cursor: pointer;
        width: 100%;
    }
    .calendar__input input._form-focus {
      border: 1px solid #ebebeb;
    }
    .calendar__input.showCal input {
      border: 1px solid green;
    }
    .calendar__input.showCal::before {
      color: green;
    }
    .calendar__input::before {
      position: absolute;
      right: 20px;
      font-size: 20px;
      color: #afafaf;
      top: 50%;
      transform: translate(0, -50%);
      pointer-events: none;
    }
    .calendar__content {
      position: absolute;
      z-index: 40;
      right: 0;
      padding: 25px;
      top: 99%;
      width: auto;
      background: #f8f8f8;
      border: 1px solid green;
      border-radius: 2px;
    }
    .calendar__header {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 16px;
      margin: 0px 0px 24px 0px;
    }
    .calendar__header span {
      flex: 1 1 auto;
    }
    .calendar__btn-prev {
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0px 27px 0px 0px;
    }
    .calendar__btn-prev::before {
      font-size: 16px;
      transform: rotate(-90deg);
    }
    .calendar__btn-prev:hover::before {
      color: green;
    }
    .calendar__btn-next {
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .calendar__btn-next::before {
      font-size: 16px;
      transform: rotate(90deg);
    }
    .calendar__btn-next:hover::before {
      color: green;
    }
    .calendar__days {
      display: grid;
      column-gap: 35px;
      grid-template-columns: repeat(7, 1fr);
      margin: 0px 0px 16px 0px;
    }
    .calendar__main {
      display: grid;
      column-gap: 35px;
      row-gap: 16px;
      grid-template-columns: repeat(7, 1fr);
      grid-template-rows: repeat(5, min(32px));
    }
    
    .cal_date .cell_item {
      cursor: pointer;
      min-width: 32px;
      min-height: 32px;
    }
    
    .cell_wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .cell_wrapper .cell_item {
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 32px;
      position: relative;
      font-weight: 400;
      font-size: 16px;
      border-radius: 50%;
      color: rgba(49, 49, 49, 0.5);
    }
    .cell_wrapper.active .cell_item {
      background: #efa021;
      color: #ffffff;
    }
    
    .current .cell_item {
      color: #111111;
    }
    
    .hidden {
      visibility: hidden;
    }
    
    </style>

    <div class="tabs-transmit-readings__calendar calendar">
      <div class="calendar__input  _icon-calendar">
        <input autocomplete="off" type="text" id="date" class="onFocus" readonly>
      </div>
      <div class="calendar__content hidden">
        <div class="calendar__header">
          <span></span>
          <button class="calendar__btn-prev calendar-btn _icon-arrow-slider"></button>
          <button class="calendar__btn-next calendar-btn _icon-arrow-slider"></button>
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
    this.flexyCalendarContainer = flexyCalendarContainer
    shadow.appendChild(flexyCalendarContainer);
  }
  connectedCallback() {
    console.log('connectedCallback')
    this.setHTMLElements()
    this.init()
    this.testChangeMonth()
  }

  disconnectedCallback(){
    console.log('disconnectedCallback')
  }
  attributeChangedCallback(){
    console.log('attributeChangedCallback')
  }

  testChangeMonth(){
    const {year: oldYear, month: oldMonth} = this.state.current
    const btnNext = document.createElement('button')
    const btnPrev = document.createElement('button')
    btnNext.classList.add('calendar__btn-next')
    btnPrev.classList.add('calendar__btn-prev')
    this.changeMonth(btnNext)
    const {year: newYear, month: newMonth} = this.state.current
    this.changeMonth(btnPrev)
    if (oldMonth >= newMonth)console.log('TEST FAILED')
  }
  
  updateState(action, payload){
    switch(action){
      case INIT_STATE: {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        this.state.current = { 
          month,
          year,
          isPopup: false
        }
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
    const prevMonthNumbers = getTail(getNumbers(prevSize), date.getDay())
    const currMonthNumbers = getNumbers(size)
    const nextMonthNumbers = getHead(getNumbers(nextSize), 
      CELLS - (prevMonthNumbers.length + currMonthNumbers.length))
    return [...prevMonthNumbers, ...currMonthNumbers, ...nextMonthNumbers]
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
    const data = this.getCalendarCellsData()
    for (let i = 0; i < CELLS; i++) { 
      const div = this.ui.calendar.children[i]
      const span = div.children[0]
      this.incudeClassByCondition(div, 'current', this.getOffsetMonth(data, i) === CURRENT)
      span.innerText = data[i]
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
    const isActive = cell.classList.contains('active')
    const index = Array.from(this.ui.calendar.children).findIndex((el) => el === cell) 
    const dayOfWeek = `${index % 7}`
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

  setDaysPlaceholders(monthDetails){
    const data = this.getCalendarCellsData()
    for (let i = 0; i < CELLS; i++) {
      let div = document.createElement("div"),
          span = document.createElement("span");
      div.classList.add("cell_wrapper");
      div.classList.add("cal_date");
      if(this.getOffsetMonth(data, i) === CURRENT){
        div.classList.add("current");
        if (this.state.selected.date === data[i]){
          this.setActive(div)
          this.state.selected.cell = div
        }  
      }
      span.classList.add("cell_item");
      span.innerText = data[i]
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
    this.setCalendarHeader();
    this.setCalendarBody();
  }

  setCalendarDays(){
    for (let i = 0; i < DAY_NAMES.length; i++) {
      let div = document.createElement("div"),
          span = document.createElement("span");
      div.classList.add("cell_wrapper");
      span.classList.add("cell_item");
      span.innerText = DAY_NAMES[i].slice(0, 2);
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
      this.shadowRoot.querySelector('.calendar__content').classList.remove('hidden')
      this.showCalendarPopup = true
      this.ui.backDrop = document.createElement('div')
      this.ui.backDrop.classList.add('backdrop')
      this.parentNode.parentNode.insertBefore(this.ui.backDrop, this.parentNode)
    });
    
    window.addEventListener('click', ({target, currentTarget}) => {
      if (target.tagName !== this.tagName){
        this.shadowRoot.querySelector('.calendar__content').classList.add('hidden')
        this.ui.backDrop.remove()
        this.state.current.isPopup = false
      }
    })
  

  }

}



customElements.define('flexy-calendar', FlexyCalendar);
})();