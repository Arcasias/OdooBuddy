(() => {
  if (!window.odoo) return;

  const LOGIN_PATH = "/web/login";

  const onClick = (handler) => {
    window[handler.name] = handler;
    return `onclick="${handler.name}()"`;
  };

  if (window.location.pathname === LOGIN_PATH) {
    const STORAGE_KEY = "odoo-buddy-user";
    const loginButtons = document.querySelector(".oe_login_buttons ");
    const btnContainer = document.createElement("div");
    btnContainer.className = "ob-button-container";

    const loginInput = document.querySelector("input[name=login]");
    const pwdInput = document.querySelector("input[name=password]");

    let user = window.localStorage.getItem(STORAGE_KEY);
    let dropdownOpen = false;

    const switchUser = (usr, login = false) => {
      user = usr;
      dropdownOpen = false;
      window.localStorage.setItem(STORAGE_KEY, user);
      if (login) {
        loginAs();
        btnContainer.closest("form").submit();
      }
      render();
    };

    const loginAs = () => {
      loginInput.value = user;
      pwdInput.value = user;
    };

    const toggleDropdown = () => {
      dropdownOpen = !dropdownOpen;
      render();
    };

    const toggleAdmin = () => switchUser("admin", true);
    const toggleDemo = () => switchUser("demo", true);
    const togglePortal = () => switchUser("portal", true);

    const render = () => {
      btnContainer.innerHTML = /* xml */ `
        <button type="submit" class="btn btn-primary">
          Log in
        </button>
        <div class="btn-group">
          <button type="submit" class="btn btn-primary" ${onClick(loginAs)}>
            Log in as ${user}
          </button>
          <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" ${onClick(
            toggleDropdown
          )} />
          ${
            dropdownOpen
              ? /* xml */ `
          <ul class="dropdown-menu show">
            <li><a class="dropdown-item" href="#" ${onClick(
              toggleAdmin
            )}>Admin</a></li>
            <li><a class="dropdown-item" href="#" ${onClick(
              toggleDemo
            )}>Demo</a></li>
            <li><a class="dropdown-item" href="#" ${onClick(
              togglePortal
            )}>Portal</a></li>
          </ul>
          `
              : ""
          }
        </div>
      `;
    };

    switchUser(user || "admin");

    loginButtons.children[0].remove();
    loginButtons.prepend(btnContainer);
  }
  console.log("YESSSSSS");
})();
