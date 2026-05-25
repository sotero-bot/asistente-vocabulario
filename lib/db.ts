import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

// Runtime usa el pooler (PgBouncer en Supabase). En local apunta a Postgres directo.
function getConnectionString(): string {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!url) {
    throw new Error(
      "POSTGRES_URL no está definida. Configúrala en .env.local (local) o en Vercel (Supabase auto-inyecta esta var)."
    );
  }
  return url;
}

function buildPool(): Pool {
  const connectionString = getConnectionString();
  const isSupabase = /supabase\.(co|com|net)/.test(connectionString);
  return new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 5,
  });
}

export const db: Pool =
  global.__pgPool ?? (global.__pgPool = buildPool());
