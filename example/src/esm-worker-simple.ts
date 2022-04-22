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
