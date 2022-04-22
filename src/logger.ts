import {formatErrorToString} from './error-formatter';
import {isNotNullOrUndefined} from './lib';

export interface LogReceiver {
  debug(...data: any[]): void;

  error(...data: any[]): void;

  info(...data: any[]): void;

  warn(...data: any[]): void;
}

export interface LoggerConfig {
  lokiSecret: string;
  stream: { [p: string]: string };
  cloudflareContext?: {};
  lokiUrl?: string;
  fetch?: typeof fetch;
  mdc?: { [p: string]: string };
  logMdcToConsole?: boolean;
  logReceiver?: LogReceiver;
}

export class Logger {
  private messages: {
    time: number;
    message: string;
    level: 'info' | 'warn' | 'error' | 'fatal';
  }[] = [];
  private timeNanoSeconds = Date.now() * 1000000;
  private mdcString: string | null = null;
  private readonly mdc: Map<string, string>;
  private readonly stream: { [p: string]: string };
  private readonly lokiSecret: string;
  private readonly lokiUrl: string;
  private readonly fetch: typeof fetch;
  private readonly cloudflareContext: {};
  private readonly logMdcToConsole: boolean;
  private readonly logReceiver: LogReceiver;

  constructor(
    loggerConfig: LoggerConfig
  ) {
    this.stream = loggerConfig.stream;
    this.lokiSecret = loggerConfig.lokiSecret;
    this.mdc = new Map(Object.entries(loggerConfig.mdc ?? {}));
    this.lokiUrl = loggerConfig.lokiUrl ?? 'https://logs-prod-eu-west-0.grafana.net';
    this.fetch = loggerConfig.fetch ?? fetch;
    this.cloudflareContext = loggerConfig.cloudflareContext ?? {};
    this.logMdcToConsole = loggerConfig.logMdcToConsole ?? true;
    this.logReceiver = loggerConfig.logReceiver ?? console;
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

  async flush() {
    if (this.messages.length === 0) {
      console.debug('logger has no messages to flush');
      return;
    }
    const mdcString = this.getMdcString();
    if (this.logMdcToConsole) {
      console.info('flushing messages with mdc=' + mdcString);
    }
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
      this.cloudflareContext.waitUntil(saveLogsPromise);
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
    this.logReceiver.info(this.getMdcString() + message);
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
    this.logReceiver.error(this.getMdcString() + message, error);
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
    this.logReceiver.error(this.getMdcString() + message, error);
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
    this.logReceiver.warn(this.getMdcString() + message, error);
  }

  private getMdcString() {
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
