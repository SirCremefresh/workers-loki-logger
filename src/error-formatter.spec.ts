import tap from 'tap';
import {formatErrorToString} from './error-formatter';

await tap.test('should format Error', async (t) => {
  const errorString = formatErrorToString(new Error('some-message'));
  t.match(errorString, /error=some-message, type=Error, stack=Error: some-message/);
  t.match(errorString, /at Test\.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await tap.test('should not throw formatting circular structure', async (t) => {
  const obj1 = {obj2: {}};
  const obj2 = {obj1};
  obj1.obj2 = obj2;
  const errorString = formatErrorToString(obj2);
  t.equal(errorString, 'error=Converting circular structure: [object Object], type=Object');
});

await tap.test('should format NullPointer', async (t) => {
  let error: any = null;
  try {
    (null as any).notExistingProperty();
  } catch (e) {
    error = e;
  }
  t.not(error, null);
  const errorString = formatErrorToString(error);
  t.match(errorString, /error=Cannot read properties of null \(reading 'notExistingProperty'\), type=TypeError, stack=TypeError: Cannot read properties of null \(reading 'notExistingProperty'\)/);
  t.match(errorString, /at Test\.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await tap.test('should format TypeError', async (t) => {
  const errorString = formatErrorToString(new TypeError('some-message'));
  t.match(errorString, /error=some-message, type=TypeError, stack=TypeError: some-message/);
  t.match(errorString, /at Test\.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await tap.test('should format CustomException', async (t) => {
  class CustomException extends Error {
  }

  const errorString = formatErrorToString(new CustomException('some-message'));
  t.match(errorString, /error=some-message, type=CustomException, stack=Error: some-message/);
  t.match(errorString, /at Test\.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await tap.test('should format null', async (t) => {
  const errorString = formatErrorToString(null);
  t.equal(errorString, 'error=null');
});

await tap.test('should format Promise', async (t) => {
  const errorString = formatErrorToString(new Promise(() => {
  }));
  t.equal(errorString, 'error={}, type=Promise');
});

await tap.test('should format undefined', async (t) => {
  const errorString = formatErrorToString(undefined);
  t.equal(errorString, 'error=undefined');
});

await tap.test('should format string', async (t) => {
  const errorString = formatErrorToString('some-string');
  t.equal(errorString, 'error=some-string, type=String');
});

await tap.test('should format number', async (t) => {
  const errorString = formatErrorToString(21);
  t.equal(errorString, 'error=21, type=Number');
});

await tap.test('should format object', async (t) => {
  const errorString = formatErrorToString({name: 'John'});
  t.equal(errorString, 'error={"name":"John"}, type=Object');
});

await tap.test('should format Map', async (t) => {
  const errorString = formatErrorToString(new Map([['name', 'John']]));
  t.equal(errorString, 'error={"name":"John"}, type=Map');
});

await tap.test('should format Set', async (t) => {
  const errorString = formatErrorToString(new Set(['John', 'Doe']));
  t.equal(errorString, 'error=["John","Doe"], type=Set');
});
