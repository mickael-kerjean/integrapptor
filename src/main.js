const {app, BrowserWindow, ipcMain, Menu, webContents} = require('electron');
const path = require('path');
const config = require('../config');
const open = require('open');

app.on('ready', () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, './assets/icons/64x64.png'),
        //resizable: false,
    });
    
    Menu.setApplicationMenu(Menu.buildFromTemplate(template())); 
    win.loadURL(`file://${__dirname}/index.html`);
    //win.webContents.toggleDevTools();
    //win.loadURL("https://webmail.schneider-electric.com/owa/")

    // HTTP BASIC AUTH
    let fns = {};
    app.on('login', (event, webContents, request, authInfo, callback) => {        
        fns[authInfo.host] = callback;
        event.preventDefault();
        win.webContents.send('auth-basic-request', authInfo.host);
    });
    ipcMain.on('auth-basic-response', function(e, info, username, password){
        const clb = fns[info];
        if(clb){
            clb(username, password);
            delete fns[info];
        }
    });
    ipcMain.on('auth-basic-cancel', function(e, info, username, password){
        delete fns[info];
    });

});

app.on('window-all-closed', () => {
    app.quit()
});


ipcMain.on('new-window', function(e, url){
    open(url);
});



function template(){
    return [
        {
            label: "Application",
            submenu: [
                { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
                { type: "separator" },
                { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
            ]
        },
        {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
            ]
        },
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forcereload'},
                {role: 'toggledevtools'}
            ]
        }
    ];
}




function createDOM(conf){
    const html = `

`;
    return html
        .replace("{{GROUPS_NAME}}", function(tabs){
            return tabs.map((tab) => `<span>${tab.name}</span>`).join('')
        }(conf.tabs))
        .replace("{{GROUPS_LINKS}}", function(tabs){
            return tabs.map((tab => {
                let html = `<ul id=${tab.name}>`;
                html += tab.apps.map((app, index) => {
                    return `<li data-shortcut="${index+1}" data-target-url="${app.url}">${app.title}</li>`
                }).join('');
                html += '</ul>';
            })).join('');
        }(conf.tabs))
}
