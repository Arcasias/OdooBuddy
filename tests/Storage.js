import { expect } from '../static/js/env.js';

const PREFIX = 'odoo-buddy-';

/**
 * ChromeStorage class
 *
 * Represents an abstraction layer set on an existing storage system. This is useful
 * for 2 things:
 * - a cache system allowing to call the related storage only when needed,
 * - a normalization of the values: the values given to the related storage are
 *   always stringified and the empty value is explicitely declared to have a proper
 *   key check mechanism.
 */
class ChromeStorage {
    /**
     * @param {Object} config
     * @param {Function} config.getter
     * @param {Function} config.setter
     * @param {Function} [config.remover]
     * @param {any} [config.emptyValue]
     */
    constructor(config) {
        expect(arguments, 'object:config');
        this.__cache = {};
        this.__getter = config.getter;
        this.__setter = config.setter;
        this.__remover = config.remover || this.__defaultRemover.bind(this);
        this.__empty = 'emptyValue' in config ? config.emptyValue : null;
    }

    //-------------------------------------------------------------------------
    // Public
    //-------------------------------------------------------------------------

    /**
     * Gets the value associated to the given key.
     * @param {string} key
     * @returns {any} value
     */
    get(key) {
        expect(arguments, 'string:key');
        if (!(key in this.__cache)) {
            const storageKey = PREFIX + key;
            chrome.storage.sync.get([storageKey], res => this.__cache[key] = res[storageKey]);
        }
        return this.__cache[key];
    }

    /**
     * Assigns the given value to the given key. Calls the remover instead of the
     * setter if the given value is the assumed empty value. Does nothing if the
     * given value is the same as the actual.
     * @param {string} key
     * @param {any} value
     * @returns {any} value
     */
    set(key, value) {
        expect(arguments, 'string:key', 'any:value');
        if (key in this.__cache && this.__cache[key] === value) {
            return value;
        }
        if (value === this.__empty) {
            this.__remover(PREFIX + key);
        } else {
            const stringValue = JSON.stringify(value);
            this.__setter(PREFIX + key, stringValue);
        }
        this.__cache[key] = value;
        return this.__cache[key];
    }

    /**
     * Returns `true` if the given key exists in the related storage. If the key
     * is not in the cache, it will be fetched.
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        expect(arguments, 'string:key');
        if (key in this.__cache) {
            return this.__cache[key] === this.__empty;
        } else {
            const storageKey = PREFIX + key;
            chrome.storage.sync.get([storageKey], res => this.__cache[key] = res[storageKey]);
            if (stringValue === this.__empty) {
                this.__cache[key] = this.__empty;
                return false;
            } else {
                this.__cache[key] = JSON.parse(stringValue);
                return true;
            }
        }
    }

    /**
     * Clears the related storage given the cached information.
     */
    clear() {
        expect(arguments);
        for (const key in this.__cache) {
            this.__remover(PREFIX + key);
            this.__cache[key] = this.__empty;
        }
    }

    /**
     * Removes the value associated to the given key.
     * @param {string} key
     */
    remove(key) {
        expect(arguments, 'string:key');
        this.__remover(PREFIX + key);
        this.__cache[key] = this.__empty;
    }

    /**
     * Ensures that a default value is set to the given key.
     * - If the key has an associated value: returns that value
     * - Else if not: sets the given `defaultValue` to the key and returns it.
     * @param {string} key
     * @param {any} defaultValue
     * @returns {any} existing value or given default value
     */
    default(key, defaultValue) {
        expect(arguments, 'string:key', 'any:defaultValue');
        if (!(key in this.__cache)) {
            let storageValue;
            chrome.storage.sync.get([PREFIX + key], result => {
                storageValue = result[PREFIX + key];
            });
            if (storageValue === this.__empty) {
                // Value is not in the related storage
                const stringValue = JSON.stringify(defaultValue);
                this.__setter(PREFIX + key, stringValue);
                this.__cache[key] = defaultValue;
            } else {
                const value = JSON.parse(storageValue);
                this.__cache[key] = value;
            }
        }
        return this.__cache[key];
    }

    //-------------------------------------------------------------------------
    // Private
    //-------------------------------------------------------------------------

    /**
     * Assigns the assumed empty value to the given key.
     * @private
     * @param {string} prefixedKey
     */
    __defaultRemover(prefixedKey) {
        this.__setter(prefixedKey, this.__empty);
    }
}

export default ChromeStorage;
