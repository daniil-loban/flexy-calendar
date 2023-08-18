(function(){
  const template = `
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
  </div>    
  `
     
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
  
  const state = {} 
  const INIT_STATE = 'INIT_STATE'
  const SELECT_DATE = 'SELECT_DATE'
  const SHIFT_MONTH = 'SHIFT_MONTH'
  
  let calendar = null
  let input = null
  let calHeader = null
  let calHeaderTitle = null
  let calDays = null

  function updateState(action, payload){
    switch(action){
      case INIT_STATE: {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        state.current = { month, year }
        state.selected = {
            date: date.getDate(), 
            month,
            year,
            cell: null
        }
        break 
      }
      case SELECT_DATE: {
        const cell = payload
        state.selected.month = state.current.month
        state.selected.year = state.current.year
        state.selected.date = +cell.innerText
        state.selected.cell = cell
        break
      }
      case SHIFT_MONTH: {
        const offset = payload
        const {year, month} = getNearbyMonth(offset)
        state.current.month = month
        state.current.year = year            
      }
    }
  }
  
  function getSizeOfMonth({year, month}) {
    const getSizeOfFeb = year => MAX_MONTH_LEN -
      new Date(year, FEB, MONTH_DAYS[FEB]).getMonth() - 1 
    return month === FEB 
      ? getSizeOfFeb(year) : MONTH_DAYS[month]
  } 
  
  function getNearbyMonth(offset){
    let {year, month} = state.current
    if (offset < 0) {
      year += month === JAN ? PREV : CURRENT
      month = (MONTHS_IN_YEAR + month + PREV) % MONTHS_IN_YEAR
    } else if (offset > 0){
      year += month === DEC ? NEXT : CURRENT
      month = (MONTHS_IN_YEAR + month + NEXT) % MONTHS_IN_YEAR
    }
    return {year, month}
  }  
  
  function setCalendarHeader(){
    const {month, year} = state.current
    calHeaderTitle.innerHTML = `${MONTH_NAMES[month]} ${year}` 
  };
  
  function getCalendarCellsData() {
    const {year, month} = state.current
    const date = new Date(year, month, 1)
    const size = getSizeOfMonth({year, month})
    const prevSize = getSizeOfMonth(getNearbyMonth(PREV))
    const nextSize = getSizeOfMonth(getNearbyMonth(NEXT))
    const prevMonth = getTail(getNumbers(prevSize), date.getDay())
    const currMonth = getNumbers(size)
    const nextMonth = getHead(getNumbers(nextSize), 
      CELLS - (prevMonth.length + currMonth.length))
    return [...prevMonth, ...currMonth, ...nextMonth]
  }
  
  function setDateToInput(){
    const {year, month, date} = state.selected  
    input.value = `${MONTH_NAMES[month]} ${date}, ${year}`
  };
  
  function setCalendarBody(){
    const data = getCalendarCellsData()
    for (let i = 0; i < CELLS; i++) { 
      const div = calendar.children[i]
      const span = div.children[0]
      const action = isCurrentMonthCell(data, i) ? 'add' : 'remove'
      div.classList[action]("current");
      span.innerText = data[i]
    }
    showSelectedCellIfNeed()
  };
  
  function changeMonth(btn){
    let offset;
    if (btn.classList.contains("calendar__btn-prev")) {
        offset = PREV;
    } else if (btn.classList.contains("calendar__btn-next")) {
        offset = NEXT;
    }
    updateState(SHIFT_MONTH, offset)
    updateCalendarUI()
  };
  
  function selectOnClick(cell){
    if (!cell) return
    updateState(SELECT_DATE, cell)
    setDateToInput()
    const isActive = cell.classList.contains('active')
    const index = Array.from(calendar.children).findIndex((el) => el === cell) 
    const dayOfWeek = `${index % 7}`
  };
  
  function removeActive(){
    document.querySelector('.cal_date.active')?.classList.remove('active')
  }
  
  function setActive(cell){
    cell?.classList.add('active')
  }
  
  function addListenerToCalendar(){
    calendar.addEventListener('click', ({target}) => {
      removeActive()
      const cell = target.closest('.cal_date')
      setActive(cell)
      selectOnClick(cell);
    }) 
  }
  
  function isCurrentMonthCell(arr, i){
    const half = CELLS/2
    const isBigNumberAtBegin = i < 7 && arr[i] > half
    const isSmallNumberAtEnd = i > 28 && arr[i] < half
    return !(isBigNumberAtBegin || isSmallNumberAtEnd)
  }
  
  function setDaysPlaceholders(monthDetails){
    const data = getCalendarCellsData()
    for (let i = 0; i < CELLS; i++) {
      let div = document.createElement("div"),
          span = document.createElement("span");
      div.classList.add("cell_wrapper");
      div.classList.add("cal_date");
      if(isCurrentMonthCell(data, i)){
        div.classList.add("current");
        if (state.selected.date === data[i]){
          setActive(div)
          state.selected.cell = div
        }  
      }
      span.classList.add("cell_item");
      span.innerText = data[i]
      div.appendChild(span);
      calendar.appendChild(div);
    }
  };
  
  function showSelectedCellIfNeed(){
    const action = (
      state.selected.month === state.current.month
      && state.selected.year === state.current.year
    ) ? 'add' : 'remove'
    state.selected.cell.classList[action]('active')
  }
  
  function updateCalendarUI(){
    setCalendarHeader();
    setCalendarBody();
  }
  
  function setCalendarDays(){
    for (let i = 0; i < DAY_NAMES.length; i++) {
      let div = document.createElement("div"),
          span = document.createElement("span");
      div.classList.add("cell_wrapper");
      span.classList.add("cell_item");
      span.innerText = DAY_NAMES[i].slice(0, 2);
      div.appendChild(span);
      calDays.appendChild(div);
    }        
  }

  function setHTMLElements(){
    calendar = document.querySelector(".calendar__main");
    input = document.querySelector("#date");
    calHeader = document.querySelector(".calendar__header");
    calHeaderTitle = document.querySelector(".calendar__header span");
    calDays = document.querySelector(".calendar__days");
  }
  
  function init(){
    updateState(INIT_STATE)
    setDateToInput();
    setCalendarDays()
    setCalendarHeader();
    setDaysPlaceholders()
    addListenerToCalendar()
  
    document.querySelectorAll(".calendar-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        changeMonth(btn);
      });
    });
  
    input.addEventListener('click', () => {
      document.querySelector('.calendar__content').classList.toggle('hidden');
      document.querySelector('.calendar__input').classList.toggle('showCal');
      document.querySelector('#date').classList.toggle('onFocus');
    });
  
    window.addEventListener('click', e => {
      const target = e.target
      if (!target.closest('#date') 
        && !target.closest('.calendar__input') 
        && !target.closest('.calendar__content')) {
        document.querySelector('.calendar__content').classList.add('hidden');
        document.querySelector('.calendar__input').classList.remove('showCal');
        document.querySelector('#date').classList.add('onFocus');
      }
    })
  }
  //init()
  window.createCalendar = function(id){
    document.getElementById(id).outerHTML = template
    setHTMLElements()
    init()
  }
}()) 

