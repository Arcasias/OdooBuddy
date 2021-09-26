import KeynavMixin from "../KeynavMixin.js";
import AbstractAddon from "./addons/AbstractAddon.js";
import Settings from "./addons/Settings.js";

const { Component, hooks, tags } = owl;
const { useRef, useState } = hooks;

//-----------------------------------------------------------------------------
// Components
//-----------------------------------------------------------------------------

class Popup extends KeynavMixin(Component) {

    constructor() {
        super(...arguments);

        const firstAddon = Object.keys(this.addons)[0];
        this.state = useState({
            activeAddon: firstAddon,
            expandedItem: false,
            list: this.env.favorites[firstAddon],
        });
        this.invalid = useState({
            search: false,
            task: false,
        });
        this.listSearchRef = useRef("list-search");
    }

    //-------------------------------------------------------------------------
    // Getters
    //-------------------------------------------------------------------------

    /**
     * @returns {Object}
     */
    get activeAddon() {
        return this.constructor.addons[this.state.activeAddon];
    }

    /**
     * @returns {Object}
     */
    get addons() {
        return this.constructor.addons;
    }

    //-------------------------------------------------------------------------
    // Private
    //-------------------------------------------------------------------------

    /**
     * @private
     */
    __openTask() {
        const id = this.state.task;
        if (/^\d{7}$/.test(id)) {
            window.open(this.env.odooTaskUrl(id), "_blank");
        } else {
            this.invalid.task = true;
        }
    }

    /**
     * @private
     */
    __resetSearch() {
        this.invalid.search = false;
        this.state.expandedItem = false;
        this.state.list = this.env.favorites[this.state.activeAddon];
    }

    /**
     * @private
     * @returns {Promise}
     */
    async __search() {
        const query = this.listSearchRef.el.value;
        if (!query) {
            this.__resetSearch();
            return;
        }
        try {
            this.state.list = await this.activeAddon.search(query);
        } catch (err) {
            this.__resetSearch();
            this.invalid.search = err;
        }
    }

    /**
     * @private
     * @param {string} newAddonType
     */
    __switchTab(newAddonType) {
        if (this.state.activeAddon === newAddonType) {
            return;
        }
        if (this.listSearchRef.el) {
            this.listSearchRef.el.value = "";
        }
        this.state.activeAddon = newAddonType;
        this.__resetSearch();
    }

    //-------------------------------------------------------------------------
    // Handlers
    //-------------------------------------------------------------------------

    /**
     * @param {OwlEvent} ev
     */
    onRedirect(ev) {
        this.__switchTab(ev.detail);
    }

    /**
     * @param {KeyboardEvent} ev
     */
    onSearchKeydown(ev) {
        switch (ev.key) {
            case "Escape": {
                ev.preventDefault();
                this.listSearchRef.el.value = "";
                this.__resetSearch();
                break;
            }
            case "Enter": {
                this.__search();
                break;
            }
        }
    }

    /**
     *
     */
    onSearchInput() {
        this.invalid.search = false;
    }

    //-------------------------------------------------------------------------
    // Static
    //-------------------------------------------------------------------------

    /**
     * @param {AbstractAddon} Addon
     */
    static registerAddon(Addon) {
        if (!(Addon.prototype instanceof AbstractAddon)) {
            throw new Error("Registered addon must extend the AbstractAddon class");
        }
        this.addons[Addon.type] = Addon;
        this.env.favorites[Addon.type] = true;
    }
}

Popup.addons = {};
Popup.components = { Settings };
Popup.template = tags.xml`
    <div class="popup">
        <nav class="navbar navbar-dark bg-secondary">
            <a class="navbar-brand" href="https://www.odoo.com/web" target="_blank">Odoo Buddy</a>
            <form class="form-inline">
                <div class="input-group">
                    <input type="number"
                        accesskey="T"
                        action="focus"
                        class="form-control"
                        t-att-class="{ 'text-danger': invalid.task }"
                        placeholder="Odoo Task ID"
                        aria-label="Odoo Task ID"
                        aria-describedby="task-id"
                        t-model="state.task"
                        t-on-change.prevent="__openTask"
                    />
                    <div class="input-group-append">
                        <button type="button"
                            class="btn btn-primary"
                            title="Go to task"
                            t-on-click.prevent="__openTask"
                            >
                            Go
                        </button>
                    </div>
                </div>
            </form>
        </nav>
        <main class="container p-0">
            <nav class="nav nav-tabs mt-3 d-flex justify-content-between">
                <ul class="nav nav-tabs">
                    <li t-foreach="addons" t-as="type" t-key="type" class="nav-item">
                        <a class="nav-link"
                            t-att-accesskey="addons[type].title[0]"
                            href="#"
                            t-att-title="addons[type].title"
                            t-att-class="{ active: state.activeAddon === type }"
                            t-on-click.prevent="__switchTab(type)"
                            >
                            <i t-if="addons[type].icon" t-att-class="addons[type].icon"/>
                            <t t-else="" t-esc="addons[type].title"/>
                        </a>
                    </li>
                </ul>
                <div>
                    <a class="nav-link d-inline"
                        accesskey="S"
                        href="#"
                        title="Settings"
                        t-att-class="{ active: state.activeAddon === 'settings' }"
                        t-on-click.prevent="__switchTab('settings')"
                        >
                        <i class="fas fa-cog"/>
                    </a>
                </div>
            </nav>
            <div class="content card">
                <Settings t-if="state.activeAddon === 'settings'"/>
                <t t-else="">
                    <div class="card-header">
                        <div class="input-group">
                            <input type="text"
                                t-attf-class="form-control input"
                                t-att-class="{ 'text-danger': invalid.search }"
                                t-att-placeholder="activeAddon.description"
                                t-att-aria-label="activeAddon.description"
                                t-ref="list-search"
                                t-on-change="__search"
                                t-on-input="onSearchInput"
                                t-on-keydown="onSearchKeydown"
                            />
                            <button type="button"
                                class="btn btn-primary input-group-append"
                                title="Search"
                                t-on-click="__search"
                                >
                                <i class="fa fa-search"/>
                            </button>
                        </div>
                        <div t-if="invalid.search" class="small text-danger mt-2" t-transition="fade">
                            <strong>Error</strong>: <t t-esc="invalid.search.message"/>
                        </div>
                    </div>
                    <ul t-if="state.list.length" class="card-body list-items">
                        <li t-foreach="state.list" t-as="listItem" t-key="listItem.id" class="suggestion" t-on-redirect.stop="onRedirect">
                            <t t-component="activeAddon" t-props="listItem"/>
                        </li>
                    </ul>
                    <span t-else="" class="card-body text-center text-muted font-italic">
                        No results / favorites <i class="fas fa-heart-broken"/>
                    </span>
                </t>
            </div>
        </main>
    </div>`;

export default Popup;
