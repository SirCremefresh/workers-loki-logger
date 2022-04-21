import tap from 'tap';
import {formatErrorToString} from './error-formatter';

await tap.test('top level test', async (t) => {
  const errorString = formatErrorToString(new Error('test'));
  t.match(errorString, /error=test, type=Error, stack=Error: test/);
  t.match(errorString, /at Test\.<anonymous> \(file.*error-formatter\.spec\.ts/);
});
