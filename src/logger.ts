import {formatErrorToString} from './error-formatter';
import {isNotNullOrUndefined} from './lib';

interface LoggerConfig {
  lokiSecret: string;
  stream: { [p: string]: string };
  context?: {};
  lokiUrl?: string;
  fetch?: typeof fetch;
  mdc?: { [p: string]: string };
  logMdcToConsole?: boolean;
}

export class Logger {
  private messages: {
    time: number;
    message: string;
    level: 'info' | 'warn' | 'error' | 'fatal';
  }[] = [];
  private timeNanoSeconds = Date.now() * 1000000;
  private readonly mdc: Map<string, string>;
  private readonly stream: { [p: string]: string };
  private readonly lokiSecret: string;
  private readonly lokiUrl: string;
  private readonly fetch: typeof fetch;
  private readonly context: {};
  private readonly logMdcToConsole: boolean;

  constructor(
    loggerConfig: LoggerConfig,
  ) {
    this.stream = loggerConfig.stream;
    this.lokiSecret = loggerConfig.lokiSecret;
    this.mdc = new Map(Object.entries(loggerConfig.mdc ?? {}));
    this.lokiUrl = loggerConfig.lokiUrl ?? 'https://logs-prod-eu-west-0.grafana.net';
    this.fetch = loggerConfig.fetch ?? fetch;
    this.context = loggerConfig.context ?? {};
    this.logMdcToConsole = loggerConfig.logMdcToConsole ?? true;
  }

  async flush() {
    if (this.messages.length === 0) {
      console.debug('logger has no messages to flush');
      return;
    }
    const mdcString = Array.from(this.mdc.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    if (this.logMdcToConsole) {
      console.info('flushing messages with mdc=' + mdcString);
    }
    const request = {
      streams: [
        {
          stream: this.stream,
          values: this.messages.map((messageEntry) => [
            messageEntry.time.toString(),
            mdcString + ' level=' + messageEntry.level + ' ' + messageEntry.message,
          ]),
        },
      ],
    };
    const saveLogsPromise = this.fetch(
      `${this.lokiUrl}/loki/api/v1/push`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.lokiSecret}`,
        },
        body: JSON.stringify(request),
      },
    );
    if (isCloudflareContext(this.context)) {
      this.context.waitUntil(saveLogsPromise);
    } else {
      await saveLogsPromise;
    }
  }

  info(message: string) {
    this.messages.push({
      time: ++this.timeNanoSeconds,
      message,
      level: 'info',
    });
    console.log(message);
  }

  error(message: string, error?: any) {
    if (isNotNullOrUndefined(error)) {
      message += formatErrorToString(error);
    }
    this.messages.push({
      time: ++this.timeNanoSeconds,
      message,
      level: 'error',
    });
    console.error(message);
  }

  fatal(message: string, error?: any) {
    if (isNotNullOrUndefined(error)) {
      message += formatErrorToString(error);
    }
    this.messages.push({
      time: ++this.timeNanoSeconds,
      message,
      level: 'fatal',
    });
    console.error(message);
  }

  warn(message: string, error?: any) {
    if (isNotNullOrUndefined(error)) {
      message += formatErrorToString(error);
    }
    this.messages.push({
      time: ++this.timeNanoSeconds,
      message,
      level: 'warn',
    });
    console.warn(message);
  }
}

function isCloudflareContext(context: any): context is { waitUntil: (promise: Promise<any>) => void } {
  return Object.getPrototypeOf(context).hasOwnProperty('waitUntil');
}
