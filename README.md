# FLEXY-CALENDAR

The main goal of the project is to popularize web components and the plugin approach to development.

    .
    ├── calendar
    │   ├── base
    │   │   └── base_plugin.mjs  // base class for plugins in development
    │   ├── calendar.js          // main class of the webcomponent  
    │   ├── calendar_model.mjs   // a model of data for ui 
    │   ├── config.mjs           // default config for a webcomponent instance
    │   ├── constants.mjs        // some global constants with API names 
    │   ├── event_manager.mjs    // helper for event listeners   
    │   ├── mixins
    │   │   ├── api_mixin.mjs    // a correspondence between constants and APIs
    │   │   └── plugin_manager_mixin.mjs  // work with plugins
    │   ├── plugins              // just examples  
    │   │   ├── index.js         // export   
    │   │   ├── painted.js        
    │   │   ├── show_btn.js
    │   │   ├── tabs.js
    │   │   └── today.js
    │   ├── README.md
    │   └── utils.mjs             // some uesful functions
    ├── calendar.css
    └── index.html                // an example page (to run on a local server)

## Use with REACT

For react just copy the calendar folder in project.


    import logo from './logo.svg';
    import { useEffect, useRef, useState } from 'react';
    /** IMPORT */
    import './custom/calendar/calendar'
    import  {applyPlugin, Plugin_FC_TODAY_BTN } from './custom/calendar/plugins'
    import './App.css';

    function App() {
      const [dateString, setDateString] = useState('');
      const refFC = useRef()

      const handler = ({detail:{date}}) => {
        setDateString(new Date(date).toDateString())
      }

      useEffect(()=>{
        const fc = refFC.current
        applyPlugin(fc , Plugin_FC_TODAY_BTN)
          .addEventListener('changedate', handler)
        return ()=> fc.removeEventListener('changedate', handler)
      }, [])

      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>{dateString}</p>  
          </header>
          <flexy-calendar  ref={refFC} changedate={handler} ></flexy-calendar>
        </div>
      );
    }

    export default App;
