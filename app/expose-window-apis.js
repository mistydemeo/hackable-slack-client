var hostProcess = process;
var hostRequire = require;

process.once('loaded', function(){
  electron = hostRequire('electron')

  global.host = {};

  ipc = electron.ipcRenderer;

  webFrame = hostRequire('electron').webFrame;
  webFrame.registerURLSchemeAsBypassingCSP("hax")
  webFrame.registerURLSchemeAsBypassingCSP("haxs")
  webFrame.registerURLSchemeAsBypassingCSP("localhax")
  webFrame.registerURLSchemeAsSecure("hax")
  webFrame.registerURLSchemeAsSecure("haxs")
  webFrame.registerURLSchemeAsSecure("localhax")

  global.host.zoom = {

    localStorageKey: "default-zoom",

    setZoom: function(zoom) {
      webFrame.setZoomFactor(zoom);
      localStorage.setItem(global.host.zoom.localStorageKey, zoom);
    },

    increase: function() {
      zoom = webFrame.getZoomFactor();
      global.host.zoom.setZoom(zoom + 0.1);
    },

    decrease: function() {
      zoom = webFrame.getZoomFactor();
      global.host.zoom.setZoom(zoom - 0.1);
    },

    reset: function() {
      global.host.zoom.setZoom(1);
    }
  }

  var defaultZoom = localStorage.getItem(global.host.zoom.localStorageKey);
  if (defaultZoom != null) {
    // set the default zoom that we saved previously
    global.host.zoom.setZoom(parseFloat(defaultZoom));
  }

  //TS.client.ui.active_highlight_count
  //TS.model.prefs.mac_ssb_bounce, "short" or "long"
  global.dock = {
    bounce: function() {
      var preference, type;
      preference = TS.model.prefs.mac_ssb_bounce;
      if (!(preference === "long" || preference === "short")) {
        return;
      }
      type = TS.model.prefs.mac_ssb_bounce === "short" ? "informational" : "critical";
      return ipc.send('bounce', {
        type: type
      });
    },

    badge: function(message) {
      return ipc.send('badge', {
        badge_text: message
      });
    }
  };

  const Menu = electron.remote.Menu;
  const MenuItem = electron.remote.MenuItem;
  const Clipboard = electron.remote.clipboard;

  var rightClickPosition, rightClickElement = null

  var regularMenu = new Menu();
  var linkMenu = new Menu();

  var copyLinkLocation = new MenuItem({ label: "Copy Link Location", click: function() {
    Clipboard.writeText(rightClickElement.href)
  }});
  var inspectElement = new MenuItem({ label: 'Inspect Element', click: function() {
    electron.remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
  }});

  regularMenu.append(inspectElement)

  linkMenu.append(inspectElement)
  linkMenu.append(copyLinkLocation)

  window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    rightClickPosition = {x: e.x, y: e.y}
    rightClickElement = e.srcElement || e.target;
    href = rightClickElement.href
    if (typeof href == "string") {
      linkMenu.popup(electron.remote.getCurrentWindow());
    } else {
      regularMenu.popup(electron.remote.getCurrentWindow());
    }
  }, false);
});
