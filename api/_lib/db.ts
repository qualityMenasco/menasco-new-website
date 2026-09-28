import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// __dirname-relative (via import.meta.url, since this repo's package.json
// sets "type": "module") rather than process.cwd()-relative: Vercel's
// bundler traces literal fs.readFileSync paths built this way and includes
// the referenced file in the deployed function bundle automatically, and
// it's correct regardless of what the Lambda's actual working directory
// happens to be at runtime.
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Server-only MySQL access for the Newsroom backend (RDS MySQL 8.4).
 * Never imported from src/ — Vite never bundles this into the public site.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

let pool: mysql.Pool | null = null;
let cachedCa: string | null = null;

function loadRdsCaBundle(): string {
  if (cachedCa) return cachedCa;
  const caPath = join(__dirname, 'certs/rds-global-bundle.pem');
  cachedCa = readFileSync(caPath, 'utf8');
  return cachedCa;
}

/**
 * A cached pool at module scope, not a fresh connection per request: Vercel
 * reuses a "warm" Node process across invocations hitting the same lambda
 * instance, so this module-level singleton is reused across those warm
 * invocations instead of re-handshaking TLS to RDS every request. The pool
 * itself stays intentionally small — every concurrent lambda instance gets
 * its OWN pool (they don't share process memory), so a large per-instance
 * limit multiplied by many concurrent instances is exactly how you exhaust
 * RDS's max_connections under load. `queueLimit` bounds how many requests
 * can queue behind a full pool before failing fast instead of piling up.
 *
 * TLS uses the official AWS RDS CA bundle (api/_lib/certs/rds-global-bundle.pem,
 * fetched from https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
 * — a public file, safe to commit) with `rejectUnauthorized: true`. Never
 * relaxed to skip verification.
 */
/**
 * UTC contract, pinned explicitly at two independent layers rather than
 * relying on any ambient default — required for scheduled publishing
 * (Newsroom Phase 6) to be correct regardless of what machine this ever
 * runs on:
 *
 * 1. `timezone: 'Z'` — mysql2's own JS-Date<->wire-value conversion. Without
 *    this it defaults to `'local'`, i.e. the Node process's OS timezone.
 *    That happened to be harmless so far only because AWS Lambda's
 *    execution environment happens to run in UTC — an environmental
 *    coincidence, never a stated contract, and not true of every
 *    developer's local machine running the same code via `vercel dev`.
 * 2. `SET time_zone = '+00:00'` on every new physical connection — pins the
 *    MySQL *session's* own interpretation of TIMESTAMP columns, independent
 *    of whatever timezone this RDS instance happens to be configured with
 *    (typically SYSTEM/UTC, but never assumed here). MySQL TIMESTAMP values
 *    are always stored internally as UTC, but read/written according to the
 *    session's `time_zone` — leaving that ambient/unset is exactly the
 *    "MySQL server ambient timezone" risk this pins against.
 *
 * Together these guarantee: a JS `Date` written here is stored as that
 * exact UTC instant, and a TIMESTAMP column read back becomes a JS `Date`
 * representing that exact same UTC instant — no matter what machine, OS,
 * or RDS configuration this ever runs against.
 */
export function getPool(): mysql.Pool {
  if (pool) return pool;

  pool = mysql.createPool({
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 3306),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    waitForConnections: true,
    connectionLimit: 3,
    maxIdle: 3,
    idleTimeout: 30_000,
    queueLimit: 10,
    ssl: {
      ca: loadRdsCaBundle(),
      rejectUnauthorized: true,
    },
    namedPlaceholders: true,
    decimalNumbers: true,
    timezone: 'Z',
  });

  pool.on('connection', (connection) => {
    connection.query("SET time_zone = '+00:00'");
  });

  return pool;
}

/** Runs `fn` inside a single transaction on one dedicated connection — commits on success, rolls back and rethrows on any error. The connection is always released back to the pool. */
export async function withTransaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** MySQL's `ER_DUP_ENTRY` (errno 1062) — used to turn a unique-constraint violation (duplicate slug, duplicate (article_id, position)) into a clean 409 instead of a raw 500. */
export function isDuplicateEntryError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ER_DUP_ENTRY';
}
