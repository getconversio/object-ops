# object-ops

Small lib for chainable, path-based operations in JavaScript Objects. An example:

```javascript
import * objOps from 'object-ops'

const someObject = {
  keyOne: {
    deepKey: {
      deeperKey: 42
    }
  },
  keyTwo: 24
};

objOps(someObject)
  .move('keyOne.deepKey.deeperKey', 'keyOne.secretDeepKey')
  .remove('keyOne.deepKey')
  .transform('keyTwo', val => val + 18)

console.log(someObject)
// {
//    keyOne: {
//      secretDeepKey: 42
//    },
//    keyTwo: 42
// }
```

## API

`move(source, dest)`

Moves the value at `source` path to the path at `dest`, creating it if it doesn't exist.

`remove(...paths)`

Removes any number of `paths` from the object.

`transform(path, fun)`

Calls `fun` with the value at `path` and sets the value that it returns.

`clone()`

Returns a new object, useful if you don't want to mutate the original.

## Contributing

PRs and Issues are welcome, make sure to add unit tests :)
