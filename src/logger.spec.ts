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

await tap.test(`Should send logs to loggerReceiver`, async (t) => {
  const logReceiver = new MockLoggerReceiver();
  const logger = new Logger({
    lokiSecret: '',
    stream: {},
    mdc: {
      foo: 'bar',
    },
    logReceiver,
  });

  logger.info('info-message-1');
  logger.info('info-message-2');
  logger.warn('warn-message-1');
  logger.warn('warn-message-2', 'error-msg');
  logger.error('error-message-1');
  logger.error('error-message-2', 'error-msg');
  logger.fatal('fatal-message-1');
  logger.fatal('fatal-message-2', 'error-msg');

  const mockedInfoMessage = (message: string) => ['foo=bar ' + message];
  const mockedMessage = (message: string, error?: string) => [...mockedInfoMessage(message), error];

  t.same(logReceiver.infoLogs, [
    mockedInfoMessage('info-message-1'),
    mockedInfoMessage('info-message-2'),
  ]);
  t.same(logReceiver.warnLogs, [
    mockedMessage('warn-message-1'),
    mockedMessage('warn-message-2 error=error-msg, type=String', 'error-msg'),
  ]);
  t.same(logReceiver.errorLogs, [
    mockedMessage('error-message-1'),
    mockedMessage('error-message-2 error=error-msg, type=String', 'error-msg'),
    mockedMessage('fatal-message-1'),
    mockedMessage('fatal-message-2 error=error-msg, type=String', 'error-msg'),
  ]);
});

