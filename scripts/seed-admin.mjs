// Siembra el usuario administrador automáticamente (sin parámetros).
// Corre en cada build (ver "build" en package.json), también en Vercel.
// Lee la config de variables de entorno, no de argumentos:
//   ADMIN_USERNAME  (opcional, default "admin")
//   ADMIN_PASSWORD  (requerido para sembrar; si falta, se omite sin fallar)
//
// Es idempotente: crea el admin si no existe y deja su contraseña/estado
// alineados con las env vars en cada deploy.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import pg from "pg";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Cargar .env.local en local (Vercel ya inyecta las env vars del entorno).
const envPath = resolve(projectRoot, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!password) {
  console.warn("[seed-admin] ADMIN_PASSWORD no definida — se omite el seed del admin.");
  process.exit(0);
}

let url =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;
if (!url) {
  console.warn("[seed-admin] POSTGRES_URL no definida — se omite el seed del admin.");
  process.exit(0);
}
if (/supabase\.(co|com|net)/.test(url)) {
  try {
    const u = new URL(url);
    u.searchParams.set("sslmode", "no-verify");
    url = u.toString();
  } catch {}
}

const hash = await bcrypt.hash(password, 12);
const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  await client.query(
    `insert into users (email, password_hash, active)
     values ($1, $2, true)
     on conflict (email) do update set
       password_hash = excluded.password_hash,
       active        = true`,
    [username, hash]
  );
  console.log(`[seed-admin] Admin "${username}" listo (activo).`);

  // Solo en local (Vercel define VERCEL=1): un usuario normal de prueba.
  if (!process.env.VERCEL) {
    const testEmail = "sotero@danalyticspro.co";
    const testHash = await bcrypt.hash("123", 12);
    await client.query(
      `insert into users (email, password_hash, active)
       values ($1, $2, true)
       on conflict (email) do update set
         password_hash = excluded.password_hash,
         active        = true`,
      [testEmail, testHash]
    );
    console.log(`[seed-admin] Usuario de prueba "${testEmail}" listo (solo local).`);
  }
} catch (err) {
  console.error("[seed-admin] Error:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
