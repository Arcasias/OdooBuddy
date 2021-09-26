import Storage from '../static/js/Storage.js';
import { suite } from './TestSuite.js';

function makeRelatedStorage(items = []) {
    return {
        items,
        getter: k => items[k],
        setter: (k, v) => items[k] = v,
        remover: k => delete items[k],
    };
}

suite.module("Storage");

suite.test("Default state", assert => {
    const dist = makeRelatedStorage({ 'odoo-buddy-a': '1' });
    const storage = new Storage(dist);
    assert.equal(Object.keys(storage.__cache).length, 0);
    assert.equal(storage.__empty, null);
});

suite.test("Getter: number", assert => {
    const dist = makeRelatedStorage({ 'odoo-buddy-a': '4' });
    const storage = new Storage(dist);
    assert.equal(storage.get('a'), 4);
    assert.equal(storage.__cache.a, 4);
    assert.equal(Object.keys(storage.__cache).length, 1);
});

suite.test("Getter: string", assert => {
    const dist = makeRelatedStorage({ 'odoo-buddy-a': '"oui"' });
    const storage = new Storage(dist);
    assert.equal(storage.get('a'), "oui");
    assert.equal(storage.__cache.a, "oui");
    assert.equal(Object.keys(storage.__cache).length, 1);
});

suite.test("Getter: boolean", assert => {
    const dist = makeRelatedStorage({ 'odoo-buddy-a': 'true' });
    const storage = new Storage(dist);
    assert.equal(storage.get('a'), true);
    assert.equal(storage.__cache.a, true);
    assert.equal(Object.keys(storage.__cache).length, 1);
});

suite.test("Getter: object", assert => {
    const dist = makeRelatedStorage({ 'odoo-buddy-a': '{ "foo": "bar" }' });
    const storage = new Storage(dist);
    assert.equal(storage.get('a').foo, "bar");
    assert.equal(storage.__cache.a.foo, "bar");
    assert.equal(Object.keys(storage.__cache).length, 1);
});

suite.test("Setter: number", assert => {
    const dist = makeRelatedStorage();
    const storage = new Storage(dist);
    assert.equal(storage.set('a', 2), 2);
    assert.equal(storage.__cache.a, 2);
    assert.equal(Object.keys(storage.__cache).length, 1);
    assert.equal(dist.items['odoo-buddy-a'], '2');
});

suite.test("Setter: string", assert => {
    const dist = makeRelatedStorage();
    const storage = new Storage(dist);
    assert.equal(storage.set('a', "oui"), "oui");
    assert.equal(storage.__cache.a, "oui");
    assert.equal(Object.keys(storage.__cache).length, 1);
    assert.equal(dist.items['odoo-buddy-a'], '"oui"');
});

suite.test("Setter: boolean", assert => {
    const dist = makeRelatedStorage();
    const storage = new Storage(dist);
    assert.equal(storage.set('a', false), false);
    assert.equal(storage.__cache.a, false);
    assert.equal(Object.keys(storage.__cache).length, 1);
    assert.equal(dist.items['odoo-buddy-a'], 'false');
});

suite.test("Setter: object", assert => {
    const dist = makeRelatedStorage();
    const storage = new Storage(dist);
    assert.equal(storage.set('a', { num: 4 }).num, 4);
    assert.equal(storage.__cache.a.num, 4);
    assert.equal(Object.keys(storage.__cache).length, 1);
    assert.equal(dist.items['odoo-buddy-a'], '{"num":4}');
});

suite.test("Remover", assert => {
    const dist = makeRelatedStorage({ 'odoo-buddy-a': '4' });
    const storage = new Storage(dist);
    storage.remove('a');
    assert.equal(storage.__cache.a, null);
    assert.notOk('odoo-buddy-a' in dist.items);
    assert.equal(Object.keys(storage.__cache).length, 1);
});

suite.test("Remover (default)", assert => {
    const dist = makeRelatedStorage({ 'odoo-buddy-a': '4' });
    delete dist.remover;
    const storage = new Storage(dist);
    storage.remove('a');
    assert.equal(storage.__cache.a, null);
    assert.equal(dist.items['odoo-buddy-a'], null);
    assert.equal(Object.keys(storage.__cache).length, 1);
});
