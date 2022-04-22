import tap from 'tap';
import {Logger, LoggerReceiver} from './logger';

class MockLoggerReceiver implements LoggerReceiver {
  debugLogs: any[][] = [];
  errorLogs: any[][] = [];
  infoLogs: any[][] = [];
  warnLogs: any[][] = [];

  debug(...data: any[]): void {
    this.debugLogs.push(data);
  }

  error(...data: any[]): void {
    this.errorLogs.push(data);
  }

  info(...data: any[]): void {
    this.infoLogs.push(data);
  }

  warn(...data: any[]): void {
    this.warnLogs.push(data);
  }
}

await tap.test(`Should prefill mdc from config`, async (t) => {
  const logger = new Logger({
    lokiSecret: '',
    stream: {},
    mdc: {
      foo: 'bar',
      x: 'y',
    },
  });
  t.equal(logger.mdcGet('foo'), 'bar');
  t.equal(logger.mdcGet('some'), undefined);
  t.equal(logger.mdcFormatString(), 'foo=bar x=y ');
});

await tap.test(`Should set and override mdc`, async (t) => {
  const logger = new Logger({
    lokiSecret: '',
    stream: {},
    mdc: {
      foo: 'bar',
      x: 'y',
    },
  });
  logger.mdcSet('foo', 'baz');
  logger.mdcSet('don', 'joe');

  t.equal(logger.mdcGet('foo'), 'baz');
  t.equal(logger.mdcGet('don'), 'joe');
  t.equal(logger.mdcFormatString(), 'foo=baz x=y don=joe ');
});

