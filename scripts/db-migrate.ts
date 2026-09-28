/**
 * Newsroom Phase 1 migration runner.
 *
 * Applies every .sql file in migrations/ (in filename order) that hasn't
 * already been recorded in the `schema_migrations` tracking table — safe to
 * re-run; already-applied files are skipped. Nothing runs automatically at
 * application startup; this is a deliberate, manually-invoked command:
 *
 *   npm run db:migrate
 *
 * Requires DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD in the environment
 * (e.g. via `node --env-file=.env.local` — see package.json's db:migrate
 * script). Connects with the same RDS CA-verified TLS as the application
 * pool (api/_lib/db.ts) but on its own dedicated connection with
 * `multipleStatements` enabled — deliberately NOT shared with the app pool,
 * since multi-statement execution is a SQL-injection-risk feature that has
 * no business existing on any connection that ever touches user input.
 */
import { createConnection } from 'mysql2/promise';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function main() {
  const migrationsDir = join(process.cwd(), 'migrations');
  const caPath = join(process.cwd(), 'api/_lib/certs/rds-global-bundle.pem');
  const ca = readFileSync(caPath, 'utf8');

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No .sql files found in migrations/ — nothing to do.');
    return;
  }

  const connection = await createConnection({
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 3306),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    ssl: { ca, rejectUnauthorized: true },
    multipleStatements: true,
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [rows] = await connection.query<import('mysql2').RowDataPacket[]>('SELECT id FROM schema_migrations');
    const applied = new Set(rows.map((row) => row.id as string));

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip (already applied): ${file}`);
        continue;
      }
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      console.log(`applying: ${file}`);
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (id) VALUES (?)', [file]);
      console.log(`applied: ${file}`);
    }

    console.log('Migrations complete.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exitCode = 1;
});
