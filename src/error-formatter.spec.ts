import tap from 'tap';
import {formatErrorToString} from './error-formatter';

class CustomException extends Error {
}

await tap.test('should format Error object', async (t) => {
  const errorString = formatErrorToString(new Error('some-message'));
  t.match(errorString, /error=some-message, type=Error, stack=Error: some-message/);
  t.match(errorString, /at Test\.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await tap.test('should format TypeError', async (t) => {
  const errorString = formatErrorToString(new TypeError('some-message'));
  t.match(errorString, /error=some-message, type=TypeError, stack=TypeError: some-message/);
  t.match(errorString, /at Test\.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await tap.test('should format CustomException', async (t) => {
  const errorString = formatErrorToString(new CustomException('some-message'));
  t.match(errorString, /error=some-message, type=CustomException, stack=Error: some-message/);
  t.match(errorString, /at Test\.<anonymous> \(file.*error-formatter\.spec\.ts/);
});

await tap.test('should format null', async (t) => {
  const errorString = formatErrorToString(null);
  t.equal(errorString, 'error=null');
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
