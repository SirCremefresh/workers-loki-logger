import test from 'node:test';
import {strict as assert} from 'node:assert';
import {formatErrorToString} from './error-formatter';

await test('should format Error', async () => {
  const errorString = formatErrorToString(new Error('some-message'));
  assert.match(errorString, /error=some-message, type=Error, stack=Error: some-message/);
  assert.match(errorString, /at TestContext.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await test('should not throw formatting circular structure', async () => {
  const obj1 = {obj2: {}};
  const obj2 = {obj1};
  obj1.obj2 = obj2;
  const errorString = formatErrorToString(obj2);
  assert.equal(errorString, 'error=Converting circular structure: [object Object], type=Object');
});

await test('should format NullPointer', async () => {
  let error: any = null;
  try {
    (null as any).notExistingProperty();
  } catch (e) {
    error = e;
  }
  assert.notEqual(error, null);
  const errorString = formatErrorToString(error);
  assert.match(errorString, /error=Cannot read properties of null \(reading 'notExistingProperty'\), type=TypeError, stack=TypeError: Cannot read properties of null \(reading 'notExistingProperty'\)/);
  assert.match(errorString, /at TestContext.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await test('should format TypeError', async () => {
  const errorString = formatErrorToString(new TypeError('some-message'));
  assert.match(errorString, /error=some-message, type=TypeError, stack=TypeError: some-message/);
  assert.match(errorString, /at TestContext.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await test('should format CustomException', async () => {
  class CustomException extends Error {
  }

  const errorString = formatErrorToString(new CustomException('some-message'));
  assert.match(errorString, /error=some-message, type=CustomException, stack=Error: some-message/);
  assert.match(errorString, /at TestContext.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await test('should format null', async () => {
  const errorString = formatErrorToString(null);
  assert.equal(errorString, 'error=null');
});

await test('should format Promise', async () => {
  const errorString = formatErrorToString(new Promise(() => {
  }));
  assert.equal(errorString, 'error={}, type=Promise');
});

await test('should format undefined', async () => {
  const errorString = formatErrorToString(undefined);
  assert.equal(errorString, 'error=undefined');
});

await test('should format string', async () => {
  const errorString = formatErrorToString('some-string');
  assert.equal(errorString, 'error=some-string, type=String');
});

await test('should format number', async () => {
  const errorString = formatErrorToString(21);
  assert.equal(errorString, 'error=21, type=Number');
});

await test('should format object', async () => {
  const errorString = formatErrorToString({name: 'John'});
  assert.equal(errorString, 'error={"name":"John"}, type=Object');
});

await test('should format Map', async () => {
  const errorString = formatErrorToString(new Map([['name', 'John']]));
  assert.equal(errorString, 'error={"name":"John"}, type=Map');
});

await test('should format Set', async () => {
  const errorString = formatErrorToString(new Set(['John', 'Doe']));
  assert.equal(errorString, 'error=["John","Doe"], type=Set');
});
