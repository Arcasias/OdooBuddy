(() => {
  if (!window.odoo) return;

  const LOGIN_PATH = "/web/login";
  const TRACKER_ATTRIBUTE = "ob-key";

  const renderTemplate = (node, renderFn) => {
    let nextId = 1;
    let rendering = false;
    let setup = true;
    const registeredGlobalEvents = [];
    const rendererState = {};

    const render = async () => {
      if (rendering) return;
      rendering = true;
      await Promise.resolve();
      const finalizers = [];
      for (const [event, handler] of registeredGlobalEvents) {
        window.removeEventListener(event, handler);
      }
      const helpers = {
        render,
        makeState(state, onChange = () => {}) {
          if (setup) {
            Object.assign(rendererState, state);
          }
          return [
            rendererState,
            async (p, value) => {
              rendererState[p] = value;
              onChange(rendererState[p]);
              if (!setup) {
                render();
              }
            },
          ];
        },
        on(event, handler, global = false) {
          if (global) {
            window.addEventListener(event, handler);
            registeredGlobalEvents.push([event, handler]);
            return "";
          }
          const attr = `${TRACKER_ATTRIBUTE}="${nextId++}"`;
          finalizers.push(() => {
            const target = node.querySelector(`[${attr}]`);
            target.removeAttribute(TRACKER_ATTRIBUTE);
            target.addEventListener(event, handler);
          });
          return attr;
        },
      };
      node.innerHTML = renderFn(helpers);
      for (const finalizer of finalizers) {
        finalizer();
      }
      rendering = false;
      setup = false;
    };

    return render();
  };

  if (window.location.pathname === LOGIN_PATH) {
    const STORAGE_KEY = "odoo-buddy-user";
    const loginButtons = document.querySelector(".oe_login_buttons ");
    const btnContainer = document.createElement("div");
    btnContainer.className = "ob-button-container";

    const loginInput = document.querySelector("input[name=login]");
    const pwdInput = document.querySelector("input[name=password]");

    renderTemplate(btnContainer, ({ on, makeState }) => {
      const [state, setState] = makeState({ open: false });
      const [storage, setStorage] = makeState(
        { user: window.localStorage.getItem(STORAGE_KEY) },
        (value) => window.localStorage.setItem(STORAGE_KEY, value)
      );
      if (!storage.user) {
        setStorage("user", "admin");
      }
      const switchUser = async (user) => {
        await setStorage("user", user);
        loginInput.value = pwdInput.value = user;
        btnContainer.closest("form").submit();
      };
      on(
        "click",
        (ev) => {
          if (!ev.target.closest("#ob-toggle")) {
            setState("open", false);
          }
        },
        true
      );
      return /* xml */ `
        <button type="submit" class="btn btn-primary">
          Log in
        </button>
        <div class="btn-group">
          <button type="submit" class="btn btn-primary" ${on(
            "click",
            () => (loginInput.value = pwdInput.value = storage.user)
          )}>
            Log in as ${storage.user}
          </button>
          <button id="ob-toggle" type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" ${on(
            "click",
            () => setState("open", !state.open)
          )} />
          ${
            state.open
              ? /* xml */ `
          <ul class="dropdown-menu show">
            <li><a class="dropdown-item" href="#" ${on("click", () =>
              switchUser("admin", true)
            )}>Admin</a></li>
            <li><a class="dropdown-item" href="#" ${on("click", () =>
              switchUser("demo", true)
            )}>Demo</a></li>
            <li><a class="dropdown-item" href="#" ${on("click", () =>
              switchUser("portal", true)
            )}>Portal</a></li>
          </ul>
          `
              : ""
          }
        </div>`;
    });

    loginButtons.children[0].remove();
    loginButtons.prepend(btnContainer);
  }
  console.log("YESSSSSS");
})();
