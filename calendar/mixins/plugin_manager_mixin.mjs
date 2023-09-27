import { INSERT_AFTER, INSERT_BEFORE, REPLACE } from "../constants.mjs";
import { insertAfter, insertBefore } from "../utils.mjs";

export const PluginManagerMixin = {
  isPluginExist(plugin){
    const modifiers = plugin.getTemplateModifiers()
    const uiNames = modifiers.map(e => e.uiName) 
    const existUiNames = Object.keys(this.ui)
    for (let i = 0; i<  uiNames.length; i++){
      if (existUiNames.includes(uiNames[i])) return true
    }
    return false
  },
  injectHTML(document, plugin){
    const modifiers = plugin.getTemplateModifiers()
    for (const {type, targetTag, html, uiName, uiSelector} of modifiers) {
      const existingNode = this.shadowRoot.querySelector(targetTag)
      const div = document.createElement('div')
      if (type === INSERT_AFTER){ insertAfter(div, existingNode)} 
      else if (type === INSERT_BEFORE){ insertBefore(div, existingNode)} 
      else if (type === REPLACE){ insertAfter(div, existingNode); existingNode.remove()}
      div.outerHTML = html
      this.ui[uiName] = this.shadowRoot.querySelector(uiSelector)
    } 
  },
  injectEvents(plugin){
    const events = plugin.getEvents()
    for (const { element, event, handler } of events) {
      this.eventManager.add(
        this.ui[element], 
        event, 
        plugin[handler].bind(this)
      )
    }
  },
  setCallbacks(plugin){
    if (this.config.onCellPaint && typeof(this.config.onCellPaint) === 'string'){
      this.config.onCellPaint = plugin[this.config.onCellPaint].bind(this)
    }
  },
  updateLocale(plugin){
    if (plugin.updateLocale) {
      this.config.locale = {...this.config.locale,  ...plugin.updateLocale()}
      this.model.resetLocale(this.config)          
    } 
  },
  updateConfig(plugin){
    if (plugin.updateConfig) {
      this.config = {...this.config,  ...plugin.updateConfig()}
    } 
  },
  updateSettings(plugin){
    this.updateConfig(plugin)
    this.updateLocale(plugin)
  },
  inject(plugin){
    if (this.isPluginExist(plugin)) {
      console.log( `Ошибка плагин ${plugin.__proto__.constructor.name} подключен`)
      return
    }
    this.updateSettings(plugin)
    this.setCallbacks(plugin)
    this.injectHTML(document, plugin)
    this.injectEvents(plugin)
  }  
}

export function applyPlugin (uiElement, ...plugins ){
  uiElement.addEventListener('waitplugins', ({detail:{cb}}) => {
    cb(plugins)
  }, {once: true})
  uiElement.setAttribute('plugins', '')
  return uiElement
}