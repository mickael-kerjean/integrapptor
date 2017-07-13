const $dom = require("./dom");
const ipc = require("electron").ipcRenderer;
const md5 = require("md5");

const actions = function(){
    let state = null;

    return {
        init: function(config){
            state = {
                menu: 'close',
                shortcut: {step: null},
                focus: {
                    label: config.initial.title,
                    url: config.initial.url
                },
                auth_basic: false,
                group: config.tabs[0].name,
            };
            paint(state);
        },
        closeMenu: function(){
            state.menu = 'close';
            state.shortcut = {step: null};
            paint(state);
        },
        closeAuthBasic: function(){
            state.auth_basic = false;
            paint(state);
        },
        openAuthBasic: function(info){
            state.auth_basic = info;
            paint(state);
        },
        toggleMenu: function(){
            state.menu = state.menu === 'open' ? 'close' : 'open';
            state.shortcut = {step: null};
            paint(state);
        },
        openApp: function(app){
            state.menu = 'close';
            state.auth_basic = false;
            state.focus.label = app.title;
            state.focus.url = app.url;
            paint(state);
        },
        updateGroup: function(group){
            state.group = group;
            paint(state);
        },
        reload: function(){
            state.menu = 'close';
            paint(state);
            reload(state);
        },
        shortcut: function(key, tabs){
            if(state.menu === 'open' && state.shortcut.step === null){
                state.shortcut = {step: 1};
            }

            if(state.shortcut.step === 1){
                let idx = tabs.map((tab) => tab.name[0].toLowerCase()).indexOf(key)
                if(idx >= 0){
                    state.shortcut.step = 2;
                    state.shortcut.payload = idx;
                    this.updateGroup(tabs[idx].name);
                }else{
                    state.shortcut = {step: null};
                }
            }else if(state.shortcut.step === 2){
                if(/[0-9]/.test(key) && tabs[state.shortcut.payload].apps[parseInt(key) - 1]){
                    this.openApp(tabs[state.shortcut.payload].apps[parseInt(key) - 1]);
                }else{
                    state.shortcut = {step: null};
                    this.shortcut(key, tabs);
                }
            }else{
                state.shortcut = {step: null};
            }
            paint(state);
        },
        sendLogin: function(username, password){
            ipc.send('auth-basic-response', $dom.getModalForm());
        }
    };
}();
module.exports = actions;

function paint(_state){
    const state = Object.assign({}, _state);
    _paint.menu(state);
    _paint.shortcut(state);
    _paint.group(state);
    _paint.appTitle(state);
    _paint.authBasic(state);
    _paint.webpage(state);
}
function reload(state){
    let $page = $dom.getPage(state.focus.url);
    if($page){
        $page.reload();
    }else{
        console.error("can't reload "+state.focus.url);
    }
}

const _paint = {
    menu: function(state){
        if(state.menu === 'open' && $dom.menu().getAttribute('class') === 'hide'){
            $dom.menu().removeAttribute('class')
            $dom.menu().animate([
                {opacity: 0, transform: 'translateX(0px) translateY(-10px)'},
                {opacity: 1, transform: 'translateX(0px) translateY(0)'}
            ], {
                duration: 100,
            });
        }else if(state.menu === 'close' && $dom.menu().hasAttribute('class') === false){
            $dom.menu().animate([
                {opacity: 1, transform: 'translateX(0px)'},
                {opacity: 0, transform: 'translateX(-20px)'}
            ], {
                duration: 50,
            }).onfinish = function(){
                $dom.menu().setAttribute('class', 'hide')
            }
        }
    },
    group: function(state){
        let $groups = $dom.groups_header();
        for(let i=0; i<$groups.length; i++){
            if($groups[i].textContent === state.group){
                $groups[i].setAttribute('class', 'active');
            }else if($groups[i].getAttribute('class') === 'active' && state.group !== $groups[i].textContent){
                $groups[i].removeAttribute('class');
            }
        }
        $groups = $dom.groups_content();
        for(let i=0; i<$groups.length; i++){
            if($groups[i].getAttribute('id') === state.group){
                $groups[i].removeAttribute('class');
            }else{
                $groups[i].setAttribute('class', 'hide');
            }
        }
    },
    appTitle: function(state){
        let $title = $dom.title();
        $title.innerHTML = state.focus.label;
    },
    webpage: function(state){
        let $pages = $dom.pages_open();
        let $els = $dom.app_shortcut();
        let exist = false;

        // indicator
        for(let k = 0; k< $els.length; k++){
            if($els[k].getAttribute('data-target-url') === state.focus.url){
                $els[k].setAttribute('class', 'active');
            }
        }


        // manage the webview
        for(let i=0; i<$pages.length; i++){
            if($pages[i].getAttribute('data-url') === state.focus.url){
                exist = true;
                $pages[i].removeAttribute('class')
            }else{
                $pages[i].setAttribute('class', 'hide');
            }
        }
        if(exist === false){
            const $page = document.createElement('webview');
            $page.setAttribute('src', state.focus.url);
            $page.setAttribute('class', 'not-visible');
            $page.setAttribute('partition', 'persist:'+md5(state.focus.label+state.focus.url))
            $page.setAttribute('data-url', state.focus.url);

            // setup to open window in another browser
            const openInNewWindow = (e, url) => {ipc.send('new-window', url)};

            // setup loader
            $dom.loader().removeAttribute('class');
            $page.addEventListener('did-stop-loading', function(){
                $dom.loader().setAttribute('class', 'hide');
                $page.removeAttribute('class');
                navigation_setup($page);

                // navigation buttons
                $dom.navigate().forward.active.onclick = function(){
                    $page.goForward();
                };
                $dom.navigate().backward.active.onclick = function(){
                    $page.goBack();
                };
                $dom.navigate().refresh.onclick = function(){
                    $page.reload();
                };
                

                // open page in a new window
                $page.getWebContents().removeListener('new-window', openInNewWindow);
                $page.getWebContents().on('new-window', openInNewWindow);

                // page listeners
                $page.getWebContents().on('did-start-loading', function(){
                    navigation_setup($page);
                    $dom.loader().removeAttribute('class');
                });
                $page.getWebContents().on('did-stop-loading', function(){
                    navigation_setup($page);
                    $dom.loader().setAttribute('class', 'hide');
                });
            });
            function navigation_setup($webview){
                if($webview.getWebContents().canGoBack()){
                    $dom.navigate().backward.inactive.setAttribute('class', 'hide');
                    $dom.navigate().backward.active.removeAttribute('class');
                }else{
                    $dom.navigate().backward.active.setAttribute('class', 'hide');
                    $dom.navigate().backward.inactive.removeAttribute('class');
                }
                if($webview.getWebContents().canGoForward()){
                    $dom.navigate().forward.inactive.setAttribute('class', 'hide');
                    $dom.navigate().forward.active.removeAttribute('class');
                }else{
                    $dom.navigate().forward.active.setAttribute('class', 'hide');
                    $dom.navigate().forward.inactive.removeAttribute('class');                    
                }
            }
            $dom.view().appendChild($page);
        }

    },
    shortcut: function(state){
        let $els = $dom.app_shortcut();
        if(state.shortcut.step === 2){
            for(let i=0; i<$els.length; i++){
                $els[i].setAttribute('class', 'shortcut');
                const shortcut = $els[i].getAttribute('data-shortcut');
                if(!$els[i].querySelector('span') && $els[i].getAttribute('data-target-url') !== state.focus.url){
                    $els[i].innerHTML = $els[i].innerHTML + `<span>${shortcut}</span>`;
                }
            }
        }else{
            for(let i=0; i<$els.length; i++){
                $els[i].removeAttribute('class');
                const indicator = $els[i].querySelector('span');
                if(indicator){ indicator.remove(); }
            }
        }
    },
    authBasic: function(state){
        if(state.auth_basic === false){
            $dom.getModal().setAttribute('class', 'hide modal');
            $dom.getModal().removeAttribute('data-info');
        }else{
            $dom.getModal().setAttribute('class', 'modal');
            $dom.getModal().setAttribute('data-info', state.auth_basic);
        }
    }
}
