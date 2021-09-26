const { Component, hooks } = owl;
const { useExternalListener } = hooks;

const KEY_REGEX = /^(alt\s*\+\s*)?(ctrl\s*\+\s*)?(shift\s*\+\s*)?([a-z]+)$/i;

// Helpers

function title(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

function getKeyTitle(key) {
    return `(${key})`;
}

function keyToString({ altKey, ctrlKey, shiftKey, key }) {
    return JSON.stringify([altKey, ctrlKey, shiftKey, title(key)]);
}


/**
 * Keyboard navigation mixin
 *
 * @param {Component} ParentClass
 */
function KeynavMixin(ParentClass) {
    if (ParentClass !== Component && !(ParentClass.prototype instanceof Component)) {
        throw new Error("Keyboard navigation mixin can only be applied to components.");
    }
    return class KeynavMixin extends ParentClass {

        constructor() {
            super(...arguments);

            this.__accessKeys = {};

            useExternalListener(window, "keydown", this.__onKeydown);
        }

        mounted() {
            this.__updateAccessKeys();
        }

        patched() {
            this.__updateAccessKeys();
        }

        /**
         * @param {KeyboardEvent} ev
         */
        __onKeydown(ev) {
            const focused = document.activeElement;
            if (["INPUT", "SELECT", "TEXTAREA"].includes(focused.tagName)) {
                if (ev.key === "Escape") {
                    ev.preventDefault();
                    focused.blur();
                }
                return;
            }

            const accesskey = this.__accessKeys[keyToString(ev)];
            if (accesskey) {
                ev.preventDefault();
                accesskey.action();
            }
        }

        __updateAccessKeys() {
            for (const target of this.el.querySelectorAll(":scope [accesskey]")) {
                const keyTitle = getKeyTitle(target.accessKey);
                if (!target.title.includes(keyTitle)) {
                    const title = target.title ? `${target.title} ${keyTitle}` : keyTitle;
                    target.setAttribute("title", title);
                }
                const [_, alt, ctrl, shift, k] = KEY_REGEX.exec(target.accessKey);
                const key = {
                    altKey: Boolean(alt),
                    ctrlKey: Boolean(ctrl),
                    shiftKey: Boolean(shift),
                    key: title(k),
                };
                const accessKey = { key, target };
                const action = target.getAttribute("action") || "click";
                switch (action) {
                    case "click": accessKey.action = target.click.bind(target); break;
                    case "focus": accessKey.action = target.focus.bind(target); break;
                    default: accessKey.action = this[target.accesskeyAction].bind(this);
                }
                const keyString = keyToString(key);
                if (keyString in this.__accessKeys) {
                    console.warn("Duplicate access key with parameters:", key);
                }
                this.__accessKeys[keyString] = accessKey;
            }
        }
    };
}

export default KeynavMixin;
