'use strict';

const { test } = require('ava'),
  index = require('../'),
  objOps = require('../lib/objectOps');

test('exports the objOps function', t => t.is(index, objOps));
