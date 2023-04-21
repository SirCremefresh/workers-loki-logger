import {formatErrorToString} from './error-formatter.js';
import {isNotNullOrUndefined} from './lib.js';

export interface LoggerReceiver {
  debug(...data: any[]): void;

  error(...data: any[]): void;

  info(...data: any[]): void;

  warn(...data: any[]): void;
}

type Fetch = (input: Request | string, init?: RequestInit) => Promise<Response>;

export interface LoggerConfig {
  lokiSecret: string;
  stream: { [p: string]: string };
  cloudflareContext?: {};
  lokiUrl?: string;
  fetch?: Fetch;
  mdc?: { [p: string]: string };
  logReceiver?: LoggerReceiver;
  getTimeNanoSeconds?: (callCount: number) => number;
}

export class Logger {
  private messages: {
    time: number;
    message: string;
    level: 'info' | 'warn' | 'error' | 'fatal';
  }[] = [];
  private mdcString: string | null = null;
  private getTimeNanoSecondsCallCount: number = 0;
  private readonly mdc: Map<string, string>;
  private readonly stream: { [p: string]: string };
  private readonly lokiSecret: string;
  private readonly lokiUrl: string;
  private readonly fetch: Fetch;
  private readonly cloudflareContext: {};
  private readonly loggerReceiver: LoggerReceiver;
  private readonly _getTimeNanoSeconds: (callCount: number) => number;

  constructor(
    loggerConfig: LoggerConfig
  ) {
    this.stream = loggerConfig.stream;
    this.lokiSecret = loggerConfig.lokiSecret;
    this.mdc = new Map(Object.entries(loggerConfig.mdc ?? {}));
    this.lokiUrl = loggerConfig.lokiUrl ?? 'https://logs-prod-eu-west-0.grafana.net';
    this.fetch = loggerConfig.fetch ?? ((input, init) => fetch(input, init));
    this.cloudflareContext = loggerConfig.cloudflareContext ?? {};
    this.loggerReceiver = loggerConfig.logReceiver ?? console;
    this._getTimeNanoSeconds = loggerConfig.getTimeNanoSeconds ?? ((count) => Date.now() * 1000000 + count);
  }

  private getTimeNanoSeconds(): number {
    return this._getTimeNanoSeconds(this.getTimeNanoSecondsCallCount++)
  }

  public mdcSet(key: string, value: string) {
    this.mdcString = null;
    this.mdc.set(key, value);
  }

  public mdcDelete(key: string) {
    this.mdcString = null;
    this.mdc.delete(key);
  }

  public mdcGet(key: string): string | undefined {
    return this.mdc.get(key);
  }

  public async flush() {
    if (this.messages.length === 0) {
      this.loggerReceiver.debug('logger has no messages to flush');
      return;
    }
    const mdcString = this.mdcFormatString();
    const request = {
      streams: [
        {
          stream: this.stream,
          values: this.messages.map((messageEntry) => [
            messageEntry.time.toString(),
            mdcString + 'level=' + messageEntry.level + ' ' + messageEntry.message,
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
    this.messages = [];
    if (isCloudflareContext(this.cloudflareContext)) {
      await this.cloudflareContext.waitUntil(saveLogsPromise);
    } else {
      await saveLogsPromise;
    }
  }

  public info(message: string) {
    this.messages.push({
      time: this.getTimeNanoSeconds(),
      message,
      level: 'info',
    });
    this.loggerReceiver.info(this.mdcFormatString() + message);
  }

  public error(message: string, error?: any) {
    if (isNotNullOrUndefined(error)) {
      message += ' ' + formatErrorToString(error);
    }
    this.messages.push({
      time: this.getTimeNanoSeconds(),
      message,
      level: 'error',
    });
    this.loggerReceiver.error(this.mdcFormatString() + message, error);
  }

  public fatal(message: string, error?: any) {
    if (isNotNullOrUndefined(error)) {
      message += ' ' + formatErrorToString(error);
    }
    this.messages.push({
      time: this.getTimeNanoSeconds(),
      message,
      level: 'fatal',
    });
    this.loggerReceiver.error(this.mdcFormatString() + message, error);
  }

  public warn(message: string, error?: any) {
    if (isNotNullOrUndefined(error)) {
      message += ' ' + formatErrorToString(error);
    }
    this.messages.push({
      time: this.getTimeNanoSeconds(),
      message,
      level: 'warn',
    });
    this.loggerReceiver.warn(this.mdcFormatString() + message, error);
  }

  public mdcFormatString() {
    if (isNotNullOrUndefined(this.mdcString)) {
      return this.mdcString;
    }
    let newMdcString = '';
    for (const entry of this.mdc.entries()) {
      newMdcString += entry[0] + '=' + entry[1] + ' ';
    }
    this.mdcString = newMdcString;
    return this.mdcString;
  }
}

function isCloudflareContext(context: any): context is { waitUntil: (promise: Promise<any>) => void } {
  return isNotNullOrUndefined(context) && Object.getPrototypeOf(context).hasOwnProperty('waitUntil');
}
