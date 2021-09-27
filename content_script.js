document.head.appendChild(
  Object.assign(document.createElement("script"), {
    src: chrome.runtime.getURL("scripts/main.js"),
  })
);
document.head.appendChild(
  Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: chrome.runtime.getURL("scripts/main.css"),
  })
);
