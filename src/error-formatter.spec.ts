import tap from 'tap';
import {formatErrorToString} from './error-formatter';

await tap.test('should format Error object', async (t) => {
  const errorString = formatErrorToString(new Error('some-message'));
  t.match(errorString, /error=some-message, type=Error, stack=Error: some-message/);
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
