const mainJs = chrome.runtime.getURL("scripts/main.js");
const mainCss = chrome.runtime.getURL("scripts/main.css");
document.head.appendChild(
  Object.assign(document.createElement("script"), { src: mainJs })
);
document.head.appendChild(
  Object.assign(document.createElement("link"), { rel: "stylesheet", href: mainCss })
);
