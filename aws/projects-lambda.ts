import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { matchRoute, pathHasAnyMethod } from './projects-router';
import { invokeHandler } from './adapter';

/**
 * The `menasco-projects-api` Lambda's entrypoint — mirrors
 * aws/newsroom-lambda.ts's HTTP-routing path exactly, reusing the same
 * generic `invokeHandler` adapter (aws/adapter.ts, untouched, shared
 * infrastructure). No scheduled-worker/EventBridge second entry path
 * exists here — Projects has no publish-scheduling concept (draft/
 * published only, toggled directly), so there is nothing for a poller to
 * do. `api/_lib/*` and every `api/projects/**` handler are completely
 * unmodified by this file; it only strips the `/api/projects` prefix,
 * matches the remaining path against the Projects route table, and hands
 * off.
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext.http.method;
  const rawPath = event.requestContext.http.path;
  const path = rawPath.replace(/^\/api\/projects/, '') || '/';

  const matched = matchRoute(method, path);
  if (!matched) {
    const status = pathHasAnyMethod(path) ? 405 : 404;
    return {
      statusCode: status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: status === 405 ? `Method ${method} not allowed` : 'Not found' }),
      isBase64Encoded: false,
    };
  }

  try {
    const { default: handlerFn } = await matched.route.load();
    return await invokeHandler(handlerFn, event, path, matched.params);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[projects-lambda] unhandled adapter-level error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
      isBase64Encoded: false,
    };
  }
}
