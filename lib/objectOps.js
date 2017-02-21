'use strict';

/**
 * @private
 *
 * Gets or sets a possibly nested value on an object. Accepts an object and a
 * string path (eg: 'a.b.c') and applies it to the object.
 *
 * If given a third argument, that value is set at the given path.
 *
 * When getting, expects all depths in path to exist. When setting, will create
 * path if it is free, i.e.: has no non-object values in path.
 *
 * @param  {Object}    obj  The object to traverse.
 * @param  {String}    path The path to follow.
 * @param  {[Any]}     set  The (optional) value to set.
 * @return {[Any]}          The value left at the given path.
 * @throws {TypeError}      If the path is not traversable or cannot be created.
 */
const deepValue = (obj, path, set) => {
  const steps = path.split('.');

  if (typeof set === 'undefined') {
    return steps.reduce((acc, step, idx) => {
      if (!acc || typeof acc !== 'object') {
        throw new TypeError(`Path is invalid at depth ${idx - 1}.`);
      }

      return acc[step];
    }, obj);
  }

  while (steps.length > 1) {
    const step = steps.shift();

    if (typeof obj[step] === 'undefined' || obj[step] === null) obj[step] = {};
    else if (typeof obj[step] !== 'object') {
      throw new TypeError(
        `Path not traversable on step "${step}". ` +
        `Expected Object, got "${obj[step]}".`
      );
    }

    obj = obj[step];
  }

  return (obj[steps[0]] = set);
};

const deepRemove = (obj, path) => {
  const recurse = (obj, steps) => {
    const key = steps.shift();
    if (typeof obj[key] === 'undefined' || obj[key] === null) return;
    if (steps.length === 0) return delete obj[key];
    if (typeof obj[key] !== 'object') {
      throw new TypeError(`Expected object, got "${obj[key]}".`);
    }

    recurse(obj[key], steps);
  };

  recurse(obj, path.split('.'));
};

/**
 * Wrap an object in this class to get chainable edit operations in the object.
 */
class ObjectOps {
  constructor(source = {}) {
    Object.assign(this, source);
  }

  /**
   * Returns a new copy of this object.
   *
   * @return {Object} The new copy.
   */
  clone() {
    return new ObjectOps(JSON.parse(JSON.stringify(this)));
  }

  /**
   * Moves the value at `sourcePath` onto `destPath`. The value is removed from
   * `sourcePath`.
   *
   * All depths of `sourcePath` must exist, otherwise an error is thrown.
   *
   * @param  {String} sourcePath The path to move. (eg: 'some.path')
   * @param  {String} destPath   The destination of the value. (eg: 'some.other.path')
   * @return {Object}            This object, altered.
   */
  move(sourcePath, destPath) {
    const value = deepValue(this, sourcePath);
    deepValue(this, destPath, value);
    this.remove(sourcePath);
    return this;
  }

  /**
   * Removes the values at each given path. All depths of paths must exist,
   * otherwise an error is thrown.
   *
   * @param  {...String} paths The paths to remove from the object.
   * @return {Object}          This object, altered.
   */
  remove(...paths) {
    paths.forEach(path => deepRemove(this, path));
    return this;
  }

  /**
   * Applies a transformation function to a `path`'s value. That function receives
   * the existing value as its first argument and should return the new value
   * to set at the same `path`.
   *
   * @param  {String}   path The path to transform.
   * @param  {Function} fun  The transformation function.
   * @return {Object}        This object, after function application.
   */
  transform(path, fun) {
    deepValue(this, path, fun(deepValue(this, path)));
    return this;
  }
}

const wrap = obj => new ObjectOps(obj);
const clone = obj => ObjectOps.prototype.clone.apply(obj);
const move = (obj, ...args) => ObjectOps.prototype.move.apply(obj, args);
const remove = (obj, ...args) => ObjectOps.prototype.remove.apply(obj, args);
const transform = (obj, ...args) => ObjectOps.prototype.transform.apply(obj, args);

module.exports = Object.assign(wrap, { clone, move, remove, transform, ObjectOps });
