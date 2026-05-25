import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

// Forza sslmode=no-verify en URLs de Supabase. Sin esto, pg v8 trata sslmode=require
// como verify-full y falla con "self-signed certificate in certificate chain"
// (la cadena interna de Supabase incluye un cert auto-firmado).
function patchSupabaseSsl(url: string): string {
  if (!/supabase\.(co|com|net)/.test(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("sslmode", "no-verify");
    return u.toString();
  } catch {
    return url;
  }
}

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
  return patchSupabaseSsl(url);
}

function buildPool(): Pool {
  return new Pool({
    connectionString: getConnectionString(),
    max: 5,
  });
}

export const db: Pool =
  global.__pgPool ?? (global.__pgPool = buildPool());
