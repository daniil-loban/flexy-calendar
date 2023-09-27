import {BasePlugin} from '../base/base_plugin.mjs'
import { INSERT_AFTER, 
  REPLACE, 
  API_SET_YEAR, 
  API_SET_MONTH, 
  API_GET_MONTH, 
  API_SHOW_PREV_MONTH,
  API_SHOW_NEXT_MONTH,
  API_GET_YEAR,
} from "../constants.mjs";
import { childIndex } from '../utils.mjs';

export class Plugin_FC_TABS extends BasePlugin {
  getTemplateModifiers(){
    return [
      {
        targetTag: '.calendar__header',
        type: REPLACE,
        html: `
          <style>
            nav button {
              background: transparent;
              border: 0;
              text-decoration: UNDERLINE;
            }
          </style>
          <nav>
            <button class="calendar__nav-goto-days">дни</button>
          </nav>  
        `,
        uiName: 'btnDays',
        uiSelector: '.calendar__nav-goto-days' 
      },
      {
        targetTag: '.calendar__nav-goto-days',
        type: INSERT_AFTER,
        html: `
          <button class="calendar__nav-goto-months">месяцы</button>
        `,
        uiName: 'btnMonths',
        uiSelector: '.calendar__nav-goto-months' 
      },
      {
        targetTag: '.calendar__nav-goto-months',
        type: INSERT_AFTER,
        html: `
          <button class="calendar__nav-goto-years">годы</button>
        `,
        uiName: 'btnYears',
        uiSelector: '.calendar__nav-goto-years' 
      },
      {
        targetTag: '.calendar__nav-goto-years',
        type: INSERT_AFTER,
        html: `
          <button class="calendar__btn-prev calendar-btn" tabindex="0" type="button" title="Previous month" aria-label="Previous month">
            <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"
                fill="black" fill-opacity="0.5">
              </path>
            </svg>
          </button>
       `,
        uiName: 'btnPrev',
        uiSelector: '.calendar__btn-prev' 
      },
      {
        targetTag: '.calendar__btn-prev',
        type: INSERT_AFTER,
        html: `
          <button class="calendar__btn-next calendar-btn" tabindex="0" type="button" title="Next month" aria-label="Next month">
            <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                fill="black" fill-opacity="0.5">
              </path>
            </svg>
          </button>
       `,
        uiName: 'btnNext',
        uiSelector: '.calendar__btn-next' 
      },{
        targetTag: '.calendar__wrapper',
        type: REPLACE,
        html: `
          <style>
            .calendar__content {
              --pos: 0px;
              width: 298px;
              overflow: hidden;
            }      
            .calendar__tabs {
              display: flex;
            }
            .calendar__tab {
              min-width: 300px;
              position: relative;
              left: var(--pos);
              transition: left .2s; 
            }
          </style>  
          <div class="calendar__tabs">
            <div class="calendar__tab days">
              <div class="calendar__header">
                <span></span>
              </div>
              <div class="calendar__wrapper">
                <div class="calendar__days"></div>
                <div class="calendar__main"></div>
              </div>
            </div>
          </div>                  
        `,
        uiName: 'calendar',
        uiSelector: '.calendar__main' 
      },
      {
        targetTag: '.calendar__tab.days',
        type: INSERT_AFTER,
        html: `
          <style>
            .months, .years {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              height: 262px;
              margin-left: 25px;
            }
            .month, .year {
              display: inline-flex;
              justify-content:center;
              align-items: center;
              flex-direction: column;
            }
            .month span {
              display: block
            }
            .month span:last-child {
              font-size: 0.8em;
            }
            .month.active, .year.active {
              border: 1px solid darkgray;
              border-radius: 3px;
            }
          </style>  
          <div class="calendar__tab months">
            <div class="month"><span>Янв</span><span></span></div>
            <div class="month"><span>Фев</span><span></span></div>
            <div class="month"><span>Мар</span><span></span></div>
            <div class="month"><span>Апр</span><span></span></div>
            <div class="month"><span>Май</span><span></span></div>
            <div class="month"><span>Июн</span><span></span></div>
            <div class="month"><span>Июл</span><span></span></div>
            <div class="month"><span>Авг</span><span></span></div>
            <div class="month"><span>Сен</span><span></span></div>
            <div class="month"><span>Окт</span><span></span></div>
            <div class="month"><span>Ноя</span><span></span></div>
            <div class="month"><span>Дек</span><span></span></div>
          </div>                
        `,
        uiName: 'months',
        uiSelector: '.calendar__tab.months' 
      },
      {
        targetTag: '.calendar__tab.months',
        type: INSERT_AFTER,
        html: `
          <div class="calendar__tab years">
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
            <div class="year"></div>
          </div>                
        `,
        uiName: 'years',
        uiSelector: '.calendar__tab.years' 
      }      
    ]  
  }
  getEvents(){
    return [
      {element: 'btnDays', event: 'click', handler: 'showDays'},
      {element: 'btnMonths', event: 'click', handler: 'showMonths'},
      {element: 'btnYears', event: 'click', handler: 'showYears'},
      {element: 'years', event: 'click', handler: 'yearSelect'},
      {element: 'months', event: 'click', handler: 'monthSelect'},
      {element: 'btnPrev', event: 'click', handler: 'gotoPrev'},
      {element: 'btnNext', event: 'click', handler: 'gotoNext'}
    ]
  }
  showDays(e){
    this.shadowRoot.querySelector('.calendar__content')
      .style.setProperty("--pos", '0');
  }
  showMonths(e){
    const calendarMonth = this.getAPI(API_GET_MONTH)()
    const active = this.shadowRoot.querySelector('.calendar__tab.months .month.active')
    const index = active ?  childIndex(active) : -1 
    if (active && index !== calendarMonth) active.classList.remove('active')
    this.shadowRoot.querySelector('.calendar__tab.months')
      .children[calendarMonth].classList.add('active')
    this.shadowRoot.querySelector('.calendar__content')
      .style.setProperty("--pos", '-326px');
    for (const el of Array.from(this.shadowRoot.querySelector('.calendar__tab.months').children)){
      el.children[1].textContent = '' 
    }
  }
  showYears(e){
    const calendarYear = this.getAPI(API_GET_YEAR)()
    const active = this.shadowRoot.querySelector('.calendar__tab.years .year.active')
    if (active && +active.textContent !== calendarYear) active.classList.remove('active')
    let startYear = calendarYear - 6
    for (const el of Array.from(this.shadowRoot.querySelector('.calendar__tab.years').children)){
      el.textContent = startYear++
      if (+el.textContent === calendarYear){
        el.classList.add('active')
      }
    }
    this.shadowRoot.querySelector('.calendar__content').style.setProperty("--pos", '-652px');
  }
  yearSelect(e){
    for (const el of Array.from(this.shadowRoot.querySelector('.calendar__tab.months').children)){
      el.children[1].textContent = '' 
    }
    this.shadowRoot.querySelector('.calendar__content')
      .style.setProperty("--pos", '-326px');
    this.callAPI(API_SET_YEAR, +e.target.textContent)            
  }
  monthSelect(e){
    this.shadowRoot.querySelector('.calendar__content')
      .style.setProperty("--pos", '0px');
    const monthEl = e.target.closest('.month')  
    const monthIndex = childIndex(monthEl)
    const year = monthEl.children[1].textContent
    if (year !== '') this.callAPI(API_SET_YEAR, +year)  
    this.callAPI(API_SET_MONTH, monthIndex)
  }
  gotoPrev(e){
    e.stopImmediatePropagation()  
    const pos = this.shadowRoot.querySelector('.calendar__content').style.getPropertyValue("--pos")
    if (pos === '' || pos === '0' || pos === '0px'){
      this.getAPI(API_SHOW_PREV_MONTH)()
    } else if (pos === '-326px'){
      const calendarYear = this.getAPI(API_GET_YEAR)()
      let index = 0
      for (const el of Array.from(this.shadowRoot.querySelector('.calendar__tab.months').children)){
        if (el.children[1].textContent === ''){
          el.children[1].textContent = calendarYear - 1
        } else {
          const newVal = +el.children[1].textContent - 1
          el.children[1].textContent = newVal !== calendarYear ? newVal : '' 
        }
        const calendarMonth = this.getAPI(API_GET_MONTH)()
        const isCurrentMonth = el.children[1].textContent === '' && calendarMonth === index
        el.classList[ isCurrentMonth ? 'add' :  'remove']('active')
        index++
      }
    } else if (pos === '-652px'){
      const calendarYear = this.getAPI(API_GET_YEAR)()
      for (const el of Array.from(this.shadowRoot.querySelector('.calendar__tab.years').children)){
        el.textContent = +el.textContent - 10
        el.classList[+el.textContent === calendarYear ? 'add' : 'remove']('active')
      }
    }      
  }
  gotoNext(e){
    e.stopImmediatePropagation()
    const pos = this.shadowRoot.querySelector('.calendar__content').style.getPropertyValue("--pos")
    if (pos === '' || pos === '0' || pos === '0px'){
      this.getAPI(API_SHOW_NEXT_MONTH)()
    } else if (pos === '-326px'){
      const calendarYear = this.getAPI(API_GET_YEAR)()
      let index = 0
      for (const el of Array.from(this.shadowRoot.querySelector('.calendar__tab.months').children)){
        if (el.children[1].textContent === ''){
          el.children[1].textContent = calendarYear + 1
        } else {
          const newVal = +el.children[1].textContent + 1
          el.children[1].textContent = newVal !== calendarYear ? newVal : '' 
        }
        const calendarMonth = this.getAPI(API_GET_MONTH)()
        const isCurrentMonth = el.children[1].textContent === '' && calendarMonth === index
        el.classList[ isCurrentMonth ? 'add' : 'remove']('active')
        index++
      }
    } else if (pos === '-652px'){
      const calendarYear = this.getAPI(API_GET_YEAR)()
      for (const el of Array.from(this.shadowRoot.querySelector('.calendar__tab.years').children)){
        el.textContent = +el.textContent + 10
        el.classList[+el.textContent === calendarYear ? 'add' : 'remove']('active')
      }
    }      
  }
}