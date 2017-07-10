const $dom = require('./assets/js/dom');
const action = require('./assets/js/action');
const config = require('../config.json');
const ipc = require("electron").ipcRenderer;


window.addEventListener('DOMContentLoaded', function(){
    const MENU_TRIGGER_KEYS = ["Alt"];
    /*
     * INIT
     */    
    $dom.init() // create the initial dom from the config
    action.init(config); // bootup the state in the UI from the config

    /*
     * REACT TO EVENTS
     */    
    // menu handler
    $dom.menu_icon().addEventListener('click', action.toggleMenu);
    window.addEventListener('keydown', function(e){
        if(MENU_TRIGGER_KEYS.indexOf(e.key) >= 0){ action.toggleMenu() }
    });

    // menu category handler
    const $groups = $dom.menu_categories();
    for (let i=0; i < $groups.length; i++) {
        $groups[i].addEventListener('click', action.updateGroup.bind(null, $groups[i].textContent));
    }

    // open an app handler
    const $links = $dom.menu_links();
    for (let i=0; i < $links.length; i++) {
        $links[i].addEventListener('click', action.openApp.bind(null, {
            title: $links[i].innerText,
            url: $links[i].getAttribute('data-target-url')
        }));
    }

    // close menu when relevant
    $dom.view().addEventListener('click', action.closeMenu);

    // click on the title refresh the page
    $dom.title().addEventListener('click', action.reload);

    // shortcut for selecting an app
    window.addEventListener('keydown', function(e){
        action.shortcut(e.key, config.tabs);
    });

    // auth basic
    $dom.getModalForm().addEventListener('submit', function(e){
        e.preventDefault();
        const formValues = $dom.getModalFormValues();
        ipc.send(
            'auth-basic-response',
            $dom.getModal().getAttribute('data-info'),
            formValues[0], formValues[1]
        );
        action.closeAuthBasic();
    });
    ipc.on("auth-basic-request", function(e, info){
        action.openAuthBasic(info);
    });

});


