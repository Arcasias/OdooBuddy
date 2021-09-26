import AbstractAddon from "./AbstractAddon.js";

const TOKEN_REGEX = /^[a-zA-Z0-9]{40}$/;
const { hooks, tags } = owl;
const { useRef, useState } = hooks;

//-----------------------------------------------------------------------------
// Components
//-----------------------------------------------------------------------------

class Settings extends AbstractAddon {

    constructor() {
        super(...arguments);

        this.state = useState({
            edit: false,
        });
        this.invalid = useState({
            token: this.env.config.token && !TOKEN_REGEX.test(this.env.config.token),
        });
        this.tokenRef = useRef("token");
        this.customColor = useRef("custom-color");
    }

    mounted() {
        if (!this.env.color) {
            this.env.color = "#ff0080";
        }
        this.tokenRef.el.value = this.env.config.token;
        this.customColor.el.value = this.env.color;
    }

    //-------------------------------------------------------------------------
    // Handlers
    //-------------------------------------------------------------------------

    /**
     * @param {Event} ev
     */
    onColorChange(ev) {
        this.env.color = ev.target.value;
    }

    /**
     * @param {Event} ev
     */
    onRandColorsChange(ev) {
        this.env.config.randColors = ev.target.checked;
    }

    /**
     * @param {Event} ev
     */
    onRandNamesChange(ev) {
        this.env.config.randNames = ev.target.checked;
    }

    /**
     * @param {Event} ev
     */
    onTokenChange(ev) {
        this.env.config.token = ev.target.value;
    }

    /**
     * @param {InputEvent} ev
     */
    onTokenInput(ev) {
        ev.target.value = ev.target.value.trim().toLowerCase();
        this.invalid.token = ev.target.value && !TOKEN_REGEX.test(ev.target.value);
    }
}

Settings.template = tags.xml`
    <div class="settings">
        <div class="card-header text-muted font-weight-bold">Settings</div>
        <form class="card-body">
            <div class="form-group row">
                <div class="col-md-3">
                    <label for="github-token" class="col-form-label">Github token</label>
                </div>
                <div class="col-md-9">
                    <div class="input-group">
                        <input t-att-type="state.edit ? 'text' : 'password'"
                            id="github-token"
                            class="form-control"
                            t-att-class="{ 'text-danger': invalid.token }"
                            placeholder="Github token"
                            aria-label="Github token"
                            aria-describedby="github-token"
                            t-att-value="env.config.token"
                            t-att-readonly="!state.edit"
                            t-ref="token"
                            t-on-input="onTokenInput"
                            t-on-change="onTokenChange"
                        />
                        <button type="button"
                            class="btn btn-primary input-group-append"
                            t-att-title="state.edit ? 'Validate' : 'Edit token'"
                            t-on-click="state.edit = !state.edit"
                            >
                            <i t-attf-class="fa fa-{{ state.edit ? 'check' : 'pen' }}"/>
                        </button>
                    </div>
                    <div class="small text-primary mt-1">
                        <a class="text-primary"
                            href="https://github.com/settings/tokens"
                            target="_blank"
                            title="Go to your GitHub account"
                            aria-label="Go to your GitHub account"
                            >
                            Generate one
                        </a>
                        <a class="text-primary ml-2"
                            href="https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line"
                            target="_blank"
                            title="Get instructions to set up your personal access token"
                            aria-label="Get instructions to set up your personal access token"
                            >
                            Need help ?
                        </a>
                    </div>
                </div>
            </div>
            <div class="form-group row">
                <div class="col-md-3">
                    <label class="col-form-label">Random values</label>
                </div>
                <div class="col-md-9 d-flex align-items-center">
                    <div class="custom-control custom-checkbox mr-3">
                        <input type="checkbox"
                            class="custom-control-input"
                            id="random-names"
                            t-att-checked="env.config.randNames"
                            t-on-change="onRandNamesChange"
                        />
                        <label class="custom-control-label" for="random-names">names</label>
                    </div>
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox"
                            class="custom-control-input"
                            id="random-colors"
                            t-att-checked="env.config.randColors"
                            t-on-change="onRandColorsChange"
                        />
                        <label class="custom-control-label" for="random-colors">colors</label>
                    </div>
                </div>
            </div>
            <div class="form-group row">
                <div class="col-md-3">
                    <label for="custom-color" class="col-form-label">Custom color</label>
                </div>
                <div class="col-md-9">
                    <input type="text"
                        id="custom-color"
                        class="form-control"
                        t-ref="custom-color"
                        t-on-input="onColorChange"
                    />
                </div>
            </div>
        </form>
    </div>`;

export default Settings;
