import STRINGS from "./strings.js";

const { QWeb } = owl;
const TRANSLATABLE = /[a-zA-Z]+/;
const defaultConfig = {
    token: "",
    randNames: true,
    randColors: false,
};

//-----------------------------------------------------------------------------
// Classes
//-----------------------------------------------------------------------------

class Environment {

    constructor(mode = "prod") {
        owl.config.mode = mode;

        this.favorites = {};
        this.qweb = null;
        this.qweb = new QWeb({ translateFn: this.translate.bind(this) });
    }

    /**
     * @see translate
     */
    _() {
        return this.translate(...arguments);
    }

    /**
     * @param {Object} config
     * @returns {Proxy}
     */
    createConfig(config) {
        return new Proxy(config, {
            get: (obj, key) => obj[key],
            set: (obj, key, value) => {
                obj[key] = value;
                this.storageSet("config", obj);
                return true;
            },
            has: (obj, key) => key in obj,
        });
    }

    /**
     * @param {Object} args
     * @param  {...any} params
     */
    expect(args, ...params) {
        if (params[params.length - 1].startsWith("...")) {
            const spreadParam = params.pop().slice(3);
            while (params.length < args.length) {
                params.push(spreadParam);
            }
        }
        if (args.length > params.length) {
            throw new SyntaxError(`Unexpected argument(s): ${args.slice(params.length)}.`);
        }
        if (args.length < params.length) {
            throw new SyntaxError(`Missing argument(s): ${params.slice(args.length)}.`);
        }
        for (let i = 0; i < args.length; i++) {
            const [type, name] = params[i].split(":");
            if (type !== "any" && typeof args[i] !== type) {
                throw new TypeError(`Expected argument ${name} to be of type "${type}" and got "${typeof args[i]}".`);
            }
        }
    }

    /**
     * @async
     * @param {string} url
     * @param {Object} [params={}]
     * @param {Object} [options={}]
     * @returns {Promise}
     */
    async getJSON(url, params = {}, options = {}) {
        const urlParams = [];
        for (const key in params) {
            urlParams.push(`${key}=${params[key]}`);
        }
        if (urlParams.length) {
            url = [url, urlParams.join("&")].join("?");
        }
        const response = await fetch(url, options);
        const json = await response.json();
        if (response.status === 200) {
            return json;
        } else {
            throw new Error(json.message);
        }
    }

    /**
     * @async
     * @returns {Promise}
     */
    async load() {
        const loadStyleSheet = new Promise(resolve => window.addEventListener("DOMContentLoaded", resolve)).then(
            this.stylesheet = [...document.styleSheets].find(sheet => /popup\.css/.test(sheet.href))
        );
        const loadConfig = this.storageDefault("config", defaultConfig).then(
            config => this.config = this.createConfig(config)
        );
        const promises = [loadStyleSheet, loadConfig];
        for (const type in this.favorites) {
            const prom = this.storageDefault(type, []).then(
                favorites => this.favorites[type] = favorites
            );
            promises.push(prom);
        }
        return Promise.all(promises);
    }

    /**
     * @param {string} id
     * @returns {string}
     */
    odooTaskUrl(id) {
        this.expect(arguments, "string:id");
        return `https://www.odoo.com/web#id=${id}&action=333&active_id=133&model=project.task&view_type=form&cids=1&menu_id=4720`;
    }

    /**
     * @async
     * @param {string} key
     * @param {any} defaultValue
     * @returns {Promise<any>}
     */
    async storageDefault(key, defaultValue) {
        this.expect(arguments, "string:key", "any:defaultValue");
        const result = await new Promise(resolve => chrome.storage.sync.get(key, resolve));
        if ([undefined, null].includes(result[key])) {
            await new Promise(resolve => chrome.storage.sync.set({ [key]: defaultValue }, resolve));
            return defaultValue;
        } else {
            return result[key];
        }
    }

    /**
     * @async
     * @param {string} key
     * @returns {Promise<any>}
     */
    async storageGet(key) {
        this.expect(arguments, "string:key");
        const result = await new Promise(resolve => chrome.storage.sync.get(key, resolve));
        return result[key];
    }

    /**
     * @async
     * @param {string} key
     * @param {any} value
     * @returns {Promise}
     */
    async storageSet(key, value) {
        this.expect(arguments, "string:key", "any:value");
        await new Promise(resolve => chrome.storage.sync.set({ [key]: value }, resolve));
    }

    /**
     * @async
     * @param {string} key
     * @returns {Promise}
     */
    async storageRemove(key) {
        this.expect(arguments, "string:key");
        await new Promise(resolve => chrome.storage.sync.remove(key, resolve));
    }

    /**
     * @param {string} text
     * @returns {string}
     */
    translate(text) {
        this.expect(arguments, "string:text");
        text = text.trim();
        if (text in STRINGS) {
            const val = STRINGS[text];
            if (Array.isArray(val)) {
                const valIndex = this.config.randNames ? Math.floor(Math.random() * val.length) : 0;
                return val[valIndex];
            } else {
                return val;
            }
        }
        return text;
    }
}

export default Environment;
