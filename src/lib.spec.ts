import {strict as assert} from 'node:assert';
import test from 'node:test';
import {isNotNullOrUndefined, isNullOrUndefined} from './lib.js';

test('isNullOrUndefined', async (t) => {
  for (let {input, output} of [{
    input: null,
    output: true
  }, {
    input: undefined,
    output: true
  }, {
    input: 0,
    output: false
  }, {
    input: false,
    output: false
  }, {
    input: true,
    output: false
  }, {
    input: '',
    output: false
  }, {
    input: 'some',
    output: false
  }, {
    input: {},
    output: false
  }]) {
    await t.test(`isNullOrUndefined should return ${output} for input ${input}`, async () => {
      assert.equal(isNullOrUndefined(input), output);
    });
  }
});

test('isNotNullOrUndefined', async (t) => {
  for (let {input, output} of [{
    input: null,
    output: false
  }, {
    input: undefined,
    output: false
  }, {
    input: 0,
    output: true
  }, {
    input: false,
    output: true
  }, {
    input: true,
    output: true
  }, {
    input: '',
    output: true
  }, {
    input: 'some',
    output: true
  }, {
    input: {},
    output: true
  }]) {
    await t.test(`isNotNullOrUndefined should return ${output} for input ${input}`, async () => {
      assert.equal(isNotNullOrUndefined(input), output);
    });
  }
});
