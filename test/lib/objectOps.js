'use strict';

const sinon = require('sinon'),
  { test } = require('ava'),
  { ObjectOps } = require('../../lib/objectOps');

test('#constructor can initialize from another object', t => {
  t.deepEqual(
    Object.assign({}, new ObjectOps({ a: 1, b: { c: 2 } })),
    { a: 1, b: { c: 2 } }
  );
});

test('#clone returns a deep copy of the object', t => {
  const base = new ObjectOps({ a: 1, b: { c: 2 } });
  const clone = base.clone();

  t.deepEqual(base, clone);
  t.not(base, clone);
  t.not(base.b, clone.b);
});

test('#move copies the value from one path to another', t => {
  t.deepEqual(
    new ObjectOps({ a: 1, b: { c: 2 } }).move('b.c', 'b.d'),
    new ObjectOps({ a: 1, b: { d: 2 } })
  );
});

test('#move errors out if source path does not exist', t => {
  t.throws(
    () => new ObjectOps({ a: 1, b: { c: 2 } }).move('c.c', 'b.c'),
    TypeError,
    'Path is invalid at depth 0.'
  );
});

test('#move builds the new path as needed', t => {
  t.deepEqual(
    new ObjectOps({ a: 1, b: { c: 2 } }).move('b.c', 'c.b').c,
    { b: 2 }
  );
});

test('#move fails if destination path exists and is not traversable', t => {
  t.throws(
    () => new ObjectOps({ a: 1, b: { c: 2 } }).move('b.c', 'a.b'),
    TypeError,
    'Path not traversable on step "a". Expected Object, got "1".'
  );
});

test('#move removes the source value', t => {
  t.deepEqual(
    new ObjectOps({ a: 1, b: { c: 2 } }).move('b.c', 'c.b').b,
    {}
  );
});

test('#move leaves the object untouched if an error occurs', t => {
  const obj = new ObjectOps({ a: 1, b: { c: 2 } });

  try {
    obj.move('b.c', 'a.b');
  } catch (err) {
    t.deepEqual(obj, new ObjectOps({ a: 1, b: { c: 2 } }));
  }
});

test('#remove removes a path from the object', t => {
  t.deepEqual(
    new ObjectOps({ a: 1, b: { c: 2 } }).remove('b.c'),
    new ObjectOps({ a: 1, b: { } })
  );
});

test('#remove errors out if path doesn\'t exist', t => {
  t.throws(
    () => new ObjectOps({ a: 1, b: { c: 2 } }).remove('a.b'),
    TypeError,
    'Expected object, got "1".'
  );
});

test('#remove takes multiple paths', t => {
  t.deepEqual(
    new ObjectOps({ a: 1, b: { c: 2 } }).remove('a', 'b'),
    new ObjectOps()
  );
});

test('#transform calls a function with the value at path', t => {
  const spy = sinon.spy(() => {});
  new ObjectOps({ a: 1, b: { c: 2 } }).transform('b.c', spy);
  sinon.assert.calledWith(spy, 2);
  t.pass();
});

test('#transform sets the value returned from the function', t => {
  t.deepEqual(
    new ObjectOps({ a: 1, b: { c: 2 } }).transform('b.c', () => 3),
    new ObjectOps({ a: 1, b: { c: 3 } })
  );
});

test('#transform errors out if path doesn\'t exist', t => {
  t.throws(
    () => new ObjectOps({ a: 1, b: { c: 2 } }).transform('a.b', () => {}),
    TypeError,
    'Path is invalid at depth 0.'
  );
});
