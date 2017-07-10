const fs = require('fs');
const config = require("./config.json");
const path = require("path");

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <meta content="yes" name="apple-mobile-web-app-capable">
    <meta content="name" name="apple-mobile-web-app-title">
    <meta content="black-translucent" name="apple-mobile-web-app-status-bar-style">
    <link rel="stylesheet" href="./assets/css/style.css">
    <script src="./assets/js/index.js"></script>
    <title>App Center</title>
  </head>

  <body>
      <header id="tabs">
          <div class="no-select">
              <img id="menu-icon" src="./assets/icons/menu.png"/>
              <div id="loader">
                  <svg width="120px" height="120px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><rect x="0" y="0" width="100" height="100" fill="none"></rect><circle cx="50" cy="50" r="40" stroke="rgba(100%,100%,100%,0.679)" fill="none" stroke-width="10" stroke-linecap="round"></circle><circle cx="50" cy="50" r="40" stroke="#6f6f6f" fill="none" stroke-width="6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="2s" repeatCount="indefinite" from="0" to="502"></animate><animate attributeName="stroke-dasharray" dur="2s" repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></animate></circle></svg>
              </div>
              <div id="menu-title">Title</div>
          </div>
          <div id="menu-content">
              <div id="group" class="no-select">
                  {{GROUPS_NAME}}
              </div>
              <div id="menu_links">
                  {{GROUPS_LINKS}}
              </div>
          </div>
      </header>
      <div id="view"></div>

      <div id="modal-auth-basic" class="modal hide">
          <div class="container">
              <h2>Authentication required</h2>
              <form>
                  <table border="0" cellspacing="1">
                      <input type="text" placeholder="Username" autofocus="true"/>
                      <input type="password" placeholder="Password"/>
                      <button>ok</button>
                  </table>
              </form>
          </div>
      </div>
  </body>
</html>
`

fs.writeFileSync(
    path.join(__dirname, "src", "index.html"),
    html
        .replace("{{GROUPS_NAME}}", function(tabs){
            return tabs.map((tab) => `<span>${tab.name}</span>`).join('');
        }(config.tabs))
        .replace("{{GROUPS_LINKS}}", function(tabs){
            return tabs.map((tab => {
                let html = `<ul id=${tab.name}>`;
                html += tab.apps.map((app, index) => {
                    return `<li data-shortcut="${index+1}" data-target-url="${app.url}">${app.title}</li>`
                }).join('');
                html += '</ul>';
                return html;
            })).join('');
        }(config.tabs))
);
