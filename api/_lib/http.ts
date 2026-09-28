import type { VercelRequest, VercelResponse } from '@vercel/node';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json').json(body);
}

/** Wraps a handler body: HttpError (and its AuthError subclass) becomes a clean `{ error }` JSON response at the right status; anything else is logged server-side and reduced to a generic 500 (never leaks internal error details/stack traces to the client). */
export async function withErrorHandling(res: VercelResponse, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    if (err instanceof HttpError) {
      sendJson(res, err.status, { error: err.message });
      return;
    }
    // eslint-disable-next-line no-console
    console.error('[newsroom-api] unhandled error', err);
    sendJson(res, 500, { error: 'Internal server error' });
  }
}

export function requireMethod(req: VercelRequest, allowed: string | string[]): void {
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!req.method || !allowedList.includes(req.method)) {
    throw new HttpError(405, `Method ${req.method ?? '(none)'} not allowed`);
  }
}

/** Vercel's `[id]` dynamic-segment folder naming surfaces the param via `req.query.id`. */
export function requireIdParam(req: VercelRequest): string {
  const id = req.query.id;
  if (typeof id !== 'string' || id.length === 0) {
    throw new HttpError(400, 'Missing article id in request path');
  }
  return id;
}

/** Vercel's Node runtime already parses a JSON request body into `req.body` for `Content-Type: application/json` — this just guards against a missing/non-object body rather than re-parsing. */
export function requireJsonBody(req: VercelRequest): Record<string, unknown> {
  const body = req.body;
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}
