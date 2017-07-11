module.exports = {
    init: init,
    menu: () => {return document.querySelector('#menu-content')},
    menu_icon: () => {return document.querySelector('#menu-icon')},
    menu_title: () => {},
    menu_categories: () => {return document.querySelectorAll("#group span")},
    menu_links: () => {return document.querySelectorAll("#menu_links li")},
    groups_header: () => {return document.querySelectorAll('#group span');},
    groups_content: () => {return document.querySelectorAll('#menu_links ul')},
    view: () => {return document.querySelector('#view')},
    pages_open: () => {return document.querySelectorAll('#view webview')},
    title: () => {return document.querySelector('#menu-title');},
    loader: () => {return document.querySelector('#loader');},
    getPage: (url) => { return document.querySelector(`#view webview[data-url="${url}"]`);},
    getModal: () => { return document.querySelector('.modal') },
    getModalForm: () => { return document.querySelector('form') },
    navigate: () => {return {refresh: document.querySelector('#refresh'), forward: {active: document.querySelector('#navigate_forward'), inactive: document.querySelector('#navigate_forward_inactive')}, backward: {active: document.querySelector('#navigate_backward'), inactive: document.querySelector('#navigate_backward_inactive')}}},
    getModalFormValues: () => {
        const $els = document.querySelectorAll('form input');
        let values = [];
        for(let i=0; i < $els.length; i++){
            values.push($els[i].value);
        }
        return values;
    },
    app_shortcut: () => {return document.querySelectorAll('#menu-content li[data-shortcut]');},
    has_shortcut: (key) => {
        Array.prototype.slice.call(this.app_shortcut())
            .map(($el) => $el.getAttribute('data-shortcut'))
            .filter((shortcut) => key === shortcut)
    }
};

function init(config){
    
}

function createAuthBasicPopup(){
}
