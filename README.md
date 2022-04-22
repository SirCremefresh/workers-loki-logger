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

### Example with manually calling flush

```typescript
import {Logger} from 'workers-loki-logger';

function getLogger(context: ExecutionContext, lokiSecret: string) {
  return new Logger({
    cloudflareContext: context,
    lokiSecret,
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

### Example with wrapper function

```typescript
import {Logger} from 'workers-loki-logger';

function getLogger(context: ExecutionContext, lokiSecret: string) {
  return new Logger({
    cloudflareContext: context,
    lokiSecret,
    stream: {
      worker: 'esm-worker-simple',
      environment: 'development',
    }
  });
}

type Environment = {
  LOKI_SECRET: string
}

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

## Run tests

```sh
npm test
```

## Me

👤 **Donato Wolfisberg (donato@wolfibserg.dev) [@SirCremefresh](https://github.com/SirCremefresh)**
