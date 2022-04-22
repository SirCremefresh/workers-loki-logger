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
