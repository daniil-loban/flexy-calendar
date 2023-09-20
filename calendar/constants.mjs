export const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]  
export const MAX_MONTH_LEN = Math.max.apply(null, MONTH_DAYS)
export const MONTHS_IN_YEAR = MONTH_DAYS.length
export const WEEK_SIZE = 7
export const CELLS = WEEK_SIZE * 6
export const JAN = 0, FEB = 1, DEC = 11
export const SUNDAY=0, MONDAY=1
export const SILENT = 0, LOUDNESS = 1
export const PREV = -1, CURRENT = 0, NEXT = 1

export const INSERT_BEFORE = -1, REPLACE =  0, INSERT_AFTER =  1;

export const API_GOTO_PREV_MONTH = 0
export const API_GOTO_NEXT_MONTH = 1
export const API_GOTO_DATE = 2
export const API_SHOW_CALENDAR = 3
export const API_HIDE_CALENDAR = 4