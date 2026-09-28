import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Translates one API Gateway HTTP API (payload format 2.0) event into the
 * exact `(req, res)` shape every existing `api/newsroom/**` handler already
 * expects, calls the handler completely unmodified, then reads the
 * response back out. This is the same "build a mock VercelRequest/
 * VercelResponse, call the real handler, inspect what it did" technique
 * every Phase 1-5 test script already used against these handlers 113
 * times against real RDS/S3 — the only new thing here is that the request
 * now originates from a real API Gateway event instead of a hand-written
 * test fixture, and the response gets serialized back into API Gateway's
 * shape instead of just inspected in-process.
 */

/**
 * API Gateway v2's `event.headers` is already a flat `Record<string,
 * string>` (single value per header, keys lowercased) — directly
 * compatible with how `api/_lib/auth.ts` reads
 * `req.headers['x-newsroom-admin-key']` (it already handles both a plain
 * string and a string array, so a plain string here needs no adaptation).
 */
function buildRequest(event: APIGatewayProxyEventV2, path: string): VercelRequest {
  const method = event.requestContext.http.method;
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(event.queryStringParameters ?? {})) {
    if (value !== undefined) query[key] = value;
  }

  let body: unknown = {};
  if (event.body) {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    if (raw.trim().length > 0) {
      try {
        body = JSON.parse(raw);
      } catch {
        // Left as {} — the same shape requireJsonBody already rejects with a clean 400 for a non-object body, so a malformed JSON payload fails the same documented validation path a handler already has, not a new adapter-specific error format.
        body = {};
      }
    }
  }

  return {
    method,
    query,
    body,
    headers: event.headers ?? {},
  } as unknown as VercelRequest;
}

interface CapturedResponse {
  statusCode: number;
  headers: Record<string, string>;
  jsonBody?: unknown;
  rawBody?: Buffer | string;
}

/**
 * A `VercelResponse`-shaped object whose `.status()/.setHeader()/.json()/
 * .send()` calls accumulate into a plain record instead of writing to a
 * real Node `ServerResponse` — there is no live HTTP connection here to
 * write to; API Gateway wants one complete returned object instead.
 */
function buildResponse(): { res: VercelResponse; captured: CapturedResponse } {
  const captured: CapturedResponse = { statusCode: 200, headers: {} };
  const res = {
    status(code: number) {
      captured.statusCode = code;
      return res;
    },
    setHeader(name: string, value: string) {
      captured.headers[name] = value;
      return res;
    },
    json(body: unknown) {
      captured.jsonBody = body;
      return res;
    },
    send(body: Buffer | string) {
      captured.rawBody = body;
      return res;
    },
  } as unknown as VercelResponse;
  return { res, captured };
}

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

export async function invokeHandler(
  handler: Handler,
  event: APIGatewayProxyEventV2,
  path: string,
  pathParams: Record<string, string>,
): Promise<APIGatewayProxyStructuredResultV2> {
  const req = buildRequest(event, path);
  // Path params (from the route table, e.g. `:id`/`:slug`/`:imageId`) merge into `query` alongside real querystring params — exactly how Vercel's own dynamic-route folders (`[id]`) populate `req.query` today, so `requireIdParam`/`req.query.imageId`/etc. in every existing handler work completely unchanged.
  Object.assign(req.query as Record<string, string>, pathParams);

  const { res, captured } = buildResponse();
  await handler(req, res);

  if (captured.rawBody !== undefined) {
    // Binary/raw response path (currently only the public image proxy). API
    // Gateway HTTP API cannot carry raw binary bytes in a JSON-transported
    // Lambda response — it must be base64-encoded with `isBase64Encoded:
    // true` for API Gateway to decode and forward the real bytes to the
    // client untouched. A string body (none of today's handlers produce
    // one via `.send()`, but the type allows it) is also base64-encoded
    // for the same reason, so this path never accidentally double-encodes
    // JSON through the wrong branch.
    const buffer = Buffer.isBuffer(captured.rawBody) ? captured.rawBody : Buffer.from(captured.rawBody, 'utf8');
    return {
      statusCode: captured.statusCode,
      headers: captured.headers,
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  }

  return {
    statusCode: captured.statusCode,
    headers: { 'Content-Type': 'application/json', ...captured.headers },
    body: JSON.stringify(captured.jsonBody ?? null),
    isBase64Encoded: false,
  };
}
