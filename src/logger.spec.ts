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

