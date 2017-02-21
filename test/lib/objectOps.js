'use strict';

const should = require('should'),
  sinon = require('sinon'),
  test = require('ava').test,
  objOps = require('../../lib/objectOps');

const ObjectOps = objOps.ObjectOps;

test('#constructor can initialize from another object', () => {
  should(new ObjectOps({ a: 1, b: { c: 2 } }))
    .containEql({ a: 1, b: { c: 2 } });
});

test('#clone returns a deep copy of the object', () => {
  const base = new ObjectOps({ a: 1, b: { c: 2 } });
  const clone = base.clone();

  should(base).eql(clone);
  should(base).not.equal(clone);
  should(base.b).not.equal(clone.b);
});

test('#move copies the value from one path to another', () => {
  should(new ObjectOps({ a: 1, b: { c: 2 } }).move('b.c', 'b.d'))
    .eql(new ObjectOps({ a: 1, b: { d: 2 } }));
});

test('#move errors out if source path does not exist', () => {
  should(() => new ObjectOps({ a: 1, b: { c: 2 } }).move('c.c', 'b.c'))
    .throw(TypeError, { message: 'Path is invalid at depth 0.' });
});

test('#move builds the new path as needed', () => {
  should(new ObjectOps({ a: 1, b: { c: 2 } }).move('b.c', 'c.b'))
    .containEql({ c: { b: 2 } });
});

test('#move fails if destination path exists and is not traversable', () => {
  should(() => new ObjectOps({ a: 1, b: { c: 2 } }).move('b.c', 'a.b'))
    .throw(TypeError, { message: 'Path not traversable on step "a". Expected Object, got "1".' });
});

test('#move removes the source value', () => {
  should(new ObjectOps({ a: 1, b: { c: 2 } }).move('b.c', 'c.b'))
    .containEql({ b: {} });
});

test('#move leaves the object untouched if an error occurs', () => {
  const obj = new ObjectOps({ a: 1, b: { c: 2 } });

  try {
    obj.move('b.c', 'a.b');
  } catch (err) {
    should(obj).eql(new ObjectOps({ a: 1, b: { c: 2 } }));
  }
});

test('#remove removes a path from the object', () => {
  should(new ObjectOps({ a: 1, b: { c: 2 } }).remove('b.c'))
    .eql(new ObjectOps({ a: 1, b: { } }));
});

test('#remove errors out if path doesn\'t exist', () => {
  should(() => new ObjectOps({ a: 1, b: { c: 2 } }).remove('a.b'))
    .throw(TypeError, { message: 'Expected object, got "1".' });
});

test('#remove takes multiple paths', () => {
  should(new ObjectOps({ a: 1, b: { c: 2 } }).remove('a', 'b'))
    .eql(new ObjectOps());
});

test('#transform calls a function with the value at path', () => {
  const spy = sinon.spy(() => {});
  new ObjectOps({ a: 1, b: { c: 2 } }).transform('b.c', spy);
  sinon.assert.calledWith(spy, 2);
});

test('#transform sets the value returned from the function', () => {
  should(new ObjectOps({ a: 1, b: { c: 2 } }).transform('b.c', () => 3))
    .eql(new ObjectOps({ a: 1, b: { c: 3 } }));
});

test('#transform errors out if path doesn\'t exist', () => {
  should(() => new ObjectOps({ a: 1, b: { c: 2 } }).transform('a.b', () => {}))
    .throw(TypeError, { message: 'Path is invalid at depth 0.' });
});
