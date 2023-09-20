export class EventManager {
  constructor(){ this.eventListenersFree = [] }
 
  add(element, event, func){
    element.addEventListener(event, func)
    this.eventListenersFree.push(() => element.removeEventListener(event, func))
  }
  
  clearAll(){
    this.eventListenersFree.forEach(free => free())
  }
}
