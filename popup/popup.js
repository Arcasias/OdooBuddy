const cbDebugOff = document.getElementById("debug-off");
const cbDebugOn = document.getElementById("debug-on");
const cbDebugAssets = document.getElementById("debug-assets");
const cbDebugTests = document.getElementById("debug-tests");

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const a = Object.assign(document.createElement("a"), { href: tab.url });
  const params = new URLSearchParams(a.search);
  const initialState = params.get("debug");

  cbDebugOff.checked = !initialState;
  cbDebugAssets.checked = /assets/.test(initialState);
  cbDebugTests.checked = /tests/.test(initialState);
  cbDebugOn.checked = !cbDebugOff.checked && !cbDebugAssets.checked;

  cbDebugOff.onchange = () => {
    cbDebugOn.checked = !cbDebugOff.checked;
    cbDebugAssets.checked = !cbDebugOff.checked;
    cbDebugTests.checked = !cbDebugOff.checked;
    updateDebugState();
  };
  cbDebugOn.onchange = () => {
    cbDebugOff.checked = !cbDebugOn.checked;
    updateDebugState();
  };
  cbDebugAssets.onchange = () => {
    cbDebugOff.checked = !cbDebugAssets.checked;
    updateDebugState();
  };
  cbDebugTests.onchange = () => {
    cbDebugOff.checked = !cbDebugTests.checked;
    updateDebugState();
  };

  const updateDebugState = () => {
    const debugExpressions = [];
    if (!cbDebugOff.checked) {
      if (cbDebugAssets.checked) {
        debugExpressions.push("assets");
      } else if (!cbDebugTests.checked) {
        debugExpressions.push("1");
      }
      if (cbDebugTests.checked) {
        debugExpressions.push("tests");
      }
    } else {
      debugExpressions.push("0");
    }
    params.set("debug", debugExpressions.join(","));

    a.search = `?${params.toString()}`;
    chrome.tabs.update({ url: a.href });
  };
});
