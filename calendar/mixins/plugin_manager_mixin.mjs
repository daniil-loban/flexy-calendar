import { INSERT_AFTER, INSERT_BEFORE, REPLACE } from "../constants.mjs";
import { insertAfter, insertBefore } from "../utils.mjs";

export const PluginManagerMixin = {
  injectHTML(document, plugin){
    const modifiers = plugin.getTemplateModifiers()
    for (const {type, targetTag, html, uiName, uiSelector} of modifiers) {
      const existingNode = this.shadowRoot.querySelector(targetTag)
      const div = document.createElement('div')
      if (type === INSERT_AFTER){  insertAfter(div, existingNode) } 
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
    this.updateSettings(plugin)
    this.injectHTML(document, plugin)
    this.injectEvents(plugin)
  }  
}