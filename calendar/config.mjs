import { MONDAY } from "./constants.mjs"

export const defaultLocale = {
  dayNames: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  monthsNames: ["Январь", "Февраль", "Март", "Апрель",
    "Май", "Июнь", "Июль", "Август",
    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
}

export const defaultTemplate = `
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
  left: max(calc(100% - 335px ), 0px);
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

export const defaultConfig = { 
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
