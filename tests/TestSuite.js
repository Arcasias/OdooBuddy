import { expect } from '../static/js/utils.js';

const { Component } = owl;

class Assert {
    constructor() {
        this.__expected = null;
        this.__passed = 0;
        this.__failed = 0;
        this.__errors = [];
    }

    __test(actual, expected, fn) {
        if (fn(actual, expected)) {
            this.__passed++;
        } else {
            this.__failed++;
            this.__errors.push(`Assertion failed: expected "${expected}" and got "${actual}".`);
        }
    }

    ok(expected) {
        expect(arguments, 'any:expected');
        return this.__test(Boolean(expected), true, (a, b) => a === b);
    }

    notOk(expected) {
        expect(arguments, 'any:expected');
        return this.__test(Boolean(expected), false, (a, b) => a === b);
    }

    equal(actual, expected) {
        expect(arguments, 'any:actual', 'any:expected');
        return this.__test(actual, expected, (a, b) => a === b);
    }

    notEqual(actual, expected) {
        expect(arguments, 'any:actual', 'any:expected');
        return this.__test(actual, expected, (a, b) => a !== b);
    }

    finish() {
        return {
            failed: this.__failed,
            passed: this.__passed,
            errors: this.__errors,
        };
    }

    error(error) {
        this.__errors.push(error.message);
    }
}

class TestSuite extends Component {
    constructor() {
        super(...arguments);

        this.tests = {};
        this.currentModule = "Unnamed module";
    }

    module(module) {
        this.currentModule = module;
    }

    only() {
        this.hasOnly = true;
        expect(arguments, 'string:name', 'function:testFunction');
        const fullName = [this.currentModule, name].join(" > ");
        this.tests[fullName] = testFunction;
    }

    test(name, testFunction) {
        expect(arguments, 'string:name', 'function:testFunction');
        const fullName = [this.currentModule, name].join(" > ");
        this.tests[fullName] = testFunction;
    }

    async run() {
        const d = new Date();
        console.log(`Starting test suite at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()} with`, Object.keys(this.tests).length, `tests.`);
        expect(arguments);
        const globalErrors = [];
        const tests = this.hasOnly ? this.tests.slice(0, 1) : this.tests;
        const finished = [];
        let passed = 0;
        let failed = 0;
        for (const name in tests) {
            if (finished.includes(name)) {
                globalErrors.push(`Duplicate test "${name}".`);
            }
            finished.push(name);
            const assert = new Assert();
            try {
                await tests[name](assert);
            } catch (err) {
                console.error(err);
                assert.error(err);
            } finally {
                const result = assert.finish();
                passed += result.passed;
                failed += result.failed;
                if (result.errors.length) {
                    console.error(`Test "${name}" failed:`, result.errors);
                } else {
                    console.log(`Test "${name}" passed`, result.passed, `assertions.`);
                }
            }
        }
        const total = passed + failed;
        console.log(`Test suite finished:`, total, `total assertions,`, passed, ` passed and`, failed, `failed.`);
    }
}

const suite = new TestSuite();

export { TestSuite, suite };
