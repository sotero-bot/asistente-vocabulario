// Aplica db/schema.sql contra Postgres.
// Idempotente (todo es CREATE ... IF NOT EXISTS) → seguro en cada build.
// Usa POSTGRES_URL_NON_POOLING (directo, no PgBouncer) porque DDL puede fallar
// sobre conexiones con transaction pooling.
// Funciona en local (lee .env.local) y en Vercel (lee env vars del entorno).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Cargar .env.local si existe (Vercel no lo tiene; ya inyecta vars del dashboard)
const envPath = resolve(projectRoot, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

let url =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!url) {
  console.warn(
    "[migrate] POSTGRES_URL_NON_POOLING/POSTGRES_URL no están definidas — saltando migración"
  );
  process.exit(0);
}

const isSupabase = /supabase\.(co|com|net)/.test(url);

// Forzar sslmode=no-verify en Supabase. Ver lib/db.ts para detalles.
if (isSupabase) {
  try {
    const u = new URL(url);
    u.searchParams.set("sslmode", "no-verify");
    url = u.toString();
  } catch {}
}

const client = new pg.Client({ connectionString: url });

const schemaPath = resolve(projectRoot, "db/schema.sql");
const sql = readFileSync(schemaPath, "utf8");

try {
  await client.connect();
  await client.query(sql);
  console.log(`[migrate] Schema aplicado en ${isSupabase ? "Supabase" : "Postgres local"}`);
} catch (err) {
  console.error("[migrate] Error aplicando schema:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
