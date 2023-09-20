( async function() {
const CONST = await import('./constants.mjs')
const { EventManager } = await import('./event_manager.mjs')
const { CalendarModel } = await import('./calendar_model.mjs')
const { defaultConfig, defaultTemplate } = await import('./config.mjs')
const { PluginManagerMixin } = await import('./mixins/plugin_manager_mixin.mjs')
const { APIMixin } = await import('./mixins/api_mixin.mjs')

class FlexyCalendar extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const template = defaultTemplate
    this.flexyCalendarContainer = document.createElement('div')
    this.flexyCalendarContainer.classList.add('flexy-calendar')
    this.flexyCalendarContainer.innerHTML = template
    shadow.appendChild(this.flexyCalendarContainer)
    this.config = this.cloneConfig(defaultConfig)
    this.model = new CalendarModel(this.config)
    this.eventManager = new EventManager()
    this.ui = {}
    this.isPopupOpen = false
    this.silentMode = CONST.LOUDNESS
    this.attributeChangedCallback = this.attributeChangedCallback.bind(this)
  }

  cloneConfig(config){
    return { 
      ...config,
      locale: {
        dayNames: [...config.locale.dayNames],
        monthsNames: [...config.locale.monthsNames]
      }} 
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
        if (!this.model.cellsData) return
        this.goToDate(new Date(newValue))
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

  attachPlugins(plugins){
    for (const plugin of plugins) {
      this.inject(new plugin(this))
    }
  }

  dispatchWaitPluginsEvent(){
    const waitPlugins = new CustomEvent("waitplugins", {
      detail: { cb: this.attachPlugins.bind(this)}
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
    this.incudeClassByCondition(div, 'current', monthOffset === CONST.CURRENT)
  }

  setCalendarBody(){
    if (!this.ui.calendar) return
    this.model.setCellsData()
    for (let i = 0; i < CONST.CELLS; i++) this.setDateToCell(i)
    this.showSelectedCellIfNeed()
  }

  changeMonth(btn){
    if (btn.classList.contains("calendar__btn-prev")) this.prevMonth()
    else if (btn.classList.contains("calendar__btn-next")) this.nextMonth()
    this.updateCalendarUI()
  }

  getCellMonthOffset(cell){
    const index = Array.from(this.ui.calendar.children).findIndex(e => e === cell)
    return this.model.cellsData[index].monthOffset
  }

  silentEvent(fn){
    this.silentMode = CONST.SILENT
    fn.bind(this)()
    this.silentMode = CONST.LOUDNESS
  }

  selectOnClick(target){
    const cell = target.closest('.cal_date')
    if (!cell || this.getCellMonthOffset(cell) !== CONST.CURRENT) return
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
    for (let i = 0; i < CONST.CELLS; i++) {
      const {date, monthOffset} = this.model.cellsData[i]
      const current = monthOffset === CONST.CURRENT ? 'current' : ''
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
  /////////// API
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
    this.ui.backDrop.classList.add('flexy__calendar-backdrop')
    this.parentNode.insertBefore(this.ui.backDrop, this)
  }
  goToDate(date){
    this.removeActive()
    this.model.setCalendarDate(date)
    const index = this.model.getIndexInCellData()
    this.selectCalendarCellByIndex(index)
    this.updateCalendarUI()
    if (this.silentMode === CONST.LOUDNESS) this.dispatchChangeDateEvent()
  }
  nextMonth(){
    this.model.changeMonth(CONST.NEXT)
  }
  prevMonth(){
    this.model.changeMonth(CONST.PREV)
  }
  ///////////

  setHTMLElements(){
    Object.entries(this.config.ui).forEach(([k, v]) => 
      this.ui[k] = this.shadowRoot.querySelector(v))
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

Object.assign(FlexyCalendar.prototype, PluginManagerMixin)
Object.assign(FlexyCalendar.prototype, APIMixin)
customElements.define('flexy-calendar', FlexyCalendar)
})();