fuzzypeach.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ fuzzypeach.showFirefoxContextMenu(e); }, false);
};

fuzzypeach.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-fuzzypeach").hidden = gContextMenu.onImage;
};

window.addEventListener("load", function () { fuzzypeach.onFirefoxLoad(); }, false);
