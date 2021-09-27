const btnOff = document.getElementById("btn-off");
const btnOn = document.getElementById("btn-on");
const btnAssets = document.getElementById("btn-assets");
const btnTests = document.getElementById("btn-tests");

let state = { on: false, assets: false, tests: false };

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const a = Object.assign(document.createElement("a"), { href: tab.url });
  const params = new URLSearchParams(a.search);
  const initialState = params.get("debug");

  state.assets = /assets/.test(initialState);
  state.tests = /tests/.test(initialState);
  state.on = !state.assets && (state.tests || /1|true/.test(initialState));

  btnOn.onclick = () => {
    if (state.on) {
      state.on = false;
      state.tests = false;
    } else {
      state.on = true;
      state.assets = false;
    }
    updateDebugState();
  };

  btnAssets.onclick = () => {
    if (state.assets) {
      state.assets = false;
      state.tests = false;
    } else {
      state.on = false;
      state.assets = true;
    }
    updateDebugState();
  };

  btnTests.onclick = () => {
    if (state.tests) {
      state.tests = false;
    } else {
      state.tests = true;
      if (!state.assets) {
        state.on = true;
      }
    }
    updateDebugState();
  };

  const updateClasses = () => {
    btnOn.classList.toggle("btn-primary", state.on);
    btnAssets.classList.toggle("btn-primary", state.assets);
    btnTests.classList.toggle("btn-primary", state.tests);
  };

  const updateDebugState = () => {
    const debugExpressions = [];
    if (state.on || state.assets || state.tests) {
      if (state.assets) {
        debugExpressions.push("assets");
      } else if (!state.tests) {
        debugExpressions.push("1");
      }
      if (state.tests) {
        debugExpressions.push("tests");
      }
    } else {
      debugExpressions.push("0");
    }

    updateClasses();

    params.set("debug", debugExpressions.join(","));

    a.search = `?${params.toString()}`;
    chrome.tabs.update({ url: a.href });
  };

  updateClasses();
});
