<!--suppress ALL -->
<h1 align="center">Welcome to Workers Loki Logger 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.7-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> A Logger for the Cloudflare workers environment that sends the logs to grafana loki

## Install

```sh
npm install workers-loki-logger
```

## Usage

When creating a logger and writing to it all logs are first stored in memory.
It is sent to loki when the flush method is called.   
It is recommended to use a wrapper function for the logger to ensure that the logs are flushed to loki.

[Example with wrapper function](#example-with-wrapper-function)

## Features

- Send logs to loki
- Format exceptions as string
- MDC to add additional information to the logs

## API

### new Logger()

> Creates a new logger

```typescript
import {Logger} from 'workers-loki-logger';

new Logger({
  cloudflareContext: context, // Cloudflare context if this option is set it will use the waitUntil function on flush
  lokiSecret: 'some-secret', // Secret for loki authentication
  lokiUrl: 'https://logs-prod-eu-west-0.grafana.net', // Url to loki
  stream: { // Stream options for loki
    worker: 'esm-worker-simple',
    environment: 'development',
  },
  mdc: { // If this option is set it will be used as the initial value for the MDC
    requestPath: '/some/path',
  }
});
```

### logger.{info,warn,error,fatal}()

> Write log

```typescript
import {Logger} from 'workers-loki-logger';

declare const logger: Logger;

logger.info('message');

logger.warn('message');
logger.warn('message', new Error('some error'));

logger.error('message');
logger.error('message', new Error('some error'));

logger.fatal('message');
logger.fatal('message', new Error('some error'));
```

### logger.flush()

> Write logs to loki

```typescript
import {Logger} from 'workers-loki-logger';

declare const logger: Logger;

await logger.flush();
```

## Example

### Example with wrapper function

```typescript
import {Logger} from 'workers-loki-logger';

function getLogger(context: ExecutionContext, lokiSecret: string) {
  return new Logger({
    cloudflareContext: context,
    lokiSecret,
    lokiUrl: 'https://logs-prod-eu-west-0.grafana.net',
    stream: {
      worker: 'esm-worker-simple',
      environment: 'development',
    }
  });
}

type Environment = {
  LOKI_SECRET: string
}

// This function could be moved to a separate file and imported by multiple workers
function onFetch(handler: (request: Request, environment: Environment, context: ExecutionContext, logger: Logger) => Promise<Response>) {
  return async (request: Request, environment: Environment, context: ExecutionContext) => {
    const logger = getLogger(context, environment.LOKI_SECRET);
    logger.mdcSet('requestUrl', request.url);
    let response;
    try {
      response = await handler(request, environment, context, logger);
    } catch (error) {
      logger.error('Caught error', error);
      response = new Response('Internal Server Error', {status: 500});
    } finally {
      await logger.flush();
    }
    return response;
  };
}

export default {
  fetch: onFetch(async (request, environment, context, logger) => {
    logger.info('Request received' + request.url);
    return await fetch(request);
  })
};
```

### Example with manually calling flush

```typescript
import {Logger} from 'workers-loki-logger';

function getLogger(context: ExecutionContext, lokiSecret: string) {
  return new Logger({
    cloudflareContext: context,
    lokiSecret,
    lokiUrl: 'https://logs-prod-eu-west-0.grafana.net',
    stream: {
      worker: 'esm-worker-simple',
      environment: 'development',
    }
  });
}

export default {
  async fetch(request: Request, environment: { LOKI_SECRET: string }, context: ExecutionContext) {
    const logger = getLogger(context, environment.LOKI_SECRET);
    logger.mdcSet('requestUrl', request.url);
    logger.info('Request received' + request.url);
    let response;
    try {
      response = await fetch(request);
    } catch (error) {
      logger.error('Caught error', error);
      response = new Response('Internal Server Error', {status: 500});
    } finally {
      await logger.flush();
    }
    return response;
  }
};
```

## Run tests

```sh
npm test
```

## Me

👤 **Donato Wolfisberg (donato@wolfibserg.dev) [@SirCremefresh](https://github.com/SirCremefresh)**
