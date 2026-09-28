import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { matchRoute, pathHasAnyMethod } from './router';
import { invokeHandler } from './adapter';
import { runScheduledPublishingWorker } from '../api/_lib/articles';

/**
 * The exact EventBridge Rule name the scheduled-publishing worker trusts —
 * must match `aws/template.yaml`'s `ScheduledPublishingRule` resource. A
 * plain "does this event lack an HTTP requestContext" check isn't enough:
 * that's true of many malformed/unexpected payloads, not just our own
 * rule's invocations. Checking for this specific rule's ARN substring in
 * `resources` means only a genuine invocation of THIS rule can ever reach
 * `runScheduledPublishingWorker` — a stray/misconfigured EventBridge rule
 * elsewhere in the same AWS account pointed at this Lambda by mistake would
 * not match and would be rejected below, not silently trigger publication
 * logic.
 */
const SCHEDULED_WORKER_RULE_NAME = 'menasco-newsroom-scheduled-publishing-worker';

interface EventBridgeScheduledEvent {
  source: 'aws.events';
  'detail-type': string;
  resources: string[];
}

function isScheduledWorkerInvocation(event: unknown): event is EventBridgeScheduledEvent {
  if (typeof event !== 'object' || event === null) return false;
  const e = event as Record<string, unknown>;
  if (e.source !== 'aws.events') return false;
  if (typeof e['detail-type'] !== 'string') return false;
  if (!Array.isArray(e.resources)) return false;
  return e.resources.some((resource) => typeof resource === 'string' && resource.includes(`rule/${SCHEDULED_WORKER_RULE_NAME}`));
}

/**
 * ONE Lambda function with two distinct entry paths (Phase 6: scheduled
 * publishing added the second one to the same function that already
 * existed for Phase 6A, for the same "simpler cold-start/IAM/deployment
 * story, one warm pool reused across invocations" reasoning):
 *
 * 1. API Gateway HTTP API's `ANY /api/newsroom/{proxy+}` route — the
 *    original, still-primary path. `api/_lib/*` and every
 *    `api/newsroom/**` handler are completely unmodified; this file only
 *    strips the `/api/newsroom` prefix, matches the remaining path against
 *    the route table, and hands off to `invokeHandler`.
 * 2. A once-a-minute EventBridge Rule invocation (`isScheduledWorkerInvocation`
 *    below) — runs `runScheduledPublishingWorker()` directly, entirely
 *    bypassing the HTTP-shaped routing/auth path above. Never reachable via
 *    API Gateway; IAM-authenticated by AWS itself (a resource-based Lambda
 *    permission scoped to the specific Rule's ARN), not by this Lambda's
 *    own `requireNewsroomAuth` admin-key check.
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2>;
export async function handler(
  event: unknown,
): Promise<APIGatewayProxyStructuredResultV2 | { ok: boolean; published?: number; unpublished?: number; error?: string }>;
export async function handler(
  event: unknown,
): Promise<APIGatewayProxyStructuredResultV2 | { ok: boolean; published?: number; unpublished?: number; error?: string }> {
  if (isScheduledWorkerInvocation(event)) {
    // Never HTTP-routed, never API-Gateway-shaped — EventBridge invokes this
    // Lambda directly via IAM (aws/template.yaml's
    // ScheduledPublishingRulePermission), so this path never touches
    // requireNewsroomAuth/x-newsroom-admin-key at all; the rule-name check
    // above is the only gate, and RDS's own status-guarded UPDATE WHERE
    // clauses (runScheduledPublishingWorker) are what's actually
    // authoritative. Result is only useful for CloudWatch Logs/manual
    // `aws lambda invoke` inspection — nothing consumes this return value.
    try {
      const result = await runScheduledPublishingWorker();
      return { ok: true, published: result.published, unpublished: result.unpublished };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[newsroom-lambda] scheduled-publishing worker failed', err);
      return { ok: false, error: 'Internal error' };
    }
  }

  const apiEvent = event as APIGatewayProxyEventV2;
  const method = apiEvent.requestContext.http.method;
  const rawPath = apiEvent.requestContext.http.path;
  const path = rawPath.replace(/^\/api\/newsroom/, '') || '/';

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
    return await invokeHandler(handlerFn, apiEvent, path, matched.params);
  } catch (err) {
    // A handler-level failure should already have been caught by that
    // handler's own `withErrorHandling` (every route wraps its body in
    // it) — this is a last-resort net for something going wrong in the
    // adapter/routing layer itself (a bad dynamic import, a truly
    // unexpected throw), never a substitute for that per-route error
    // handling. Never forwards the real error to the client.
    // eslint-disable-next-line no-console
    console.error('[newsroom-lambda] unhandled adapter-level error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
      isBase64Encoded: false,
    };
  }
}
