import {BasePlugin} from '../base/base_plugin.mjs'

export class Plugin_FC_SELF_PAINT extends BasePlugin {
  updateConfig(){
    return {
      onCellPaint: 'MyOwnPaint'
    }
  }
  MyOwnPaint({index, cell, data:{monthOffset, date}, month, year}){
    cell.style.background = `hsl(${180 + date + (month + monthOffset * 2) * 30}, 100%, 90%)`
    cell.style.borderRadius = '0'
    cell.textContent = date
  }
}
