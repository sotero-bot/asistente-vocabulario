This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Variables de entorno

Usamos los **mismos nombres que Vercel auto-inyecta** al integrar Supabase, así no hay lógica condicional entre entornos.

- `OPENAI_API_KEY` — clave de OpenAI.
- `POSTGRES_URL` — connection string usada en runtime (pooled en Supabase, directo en local).
- `POSTGRES_URL_NON_POOLING` — usada por las migraciones (DDL puede fallar sobre PgBouncer).
- `AUTH_SECRET` — secreto para firmar los JWT de sesión (`openssl rand -base64 32`).
- `AUTH_URL` — URL pública (`http://localhost:3000` local, dominio https en Vercel).
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — credenciales OAuth de Google.
- `AUTH_MICROSOFT_ENTRA_ID_ID` / `AUTH_MICROSOFT_ENTRA_ID_SECRET` / `AUTH_MICROSOFT_ENTRA_ID_ISSUER` — credenciales OAuth de Microsoft Entra ID.
- `ADMIN_EMAILS` — emails (separados por coma) con acceso al panel `/admin`.

**Local:** copia `.env.example` a `.env.local` (ambas apuntan al mismo Postgres local).

**Vercel:** al conectar el proyecto Supabase desde la integración, Vercel inyecta las vars de Postgres automáticamente. Las demás (`OPENAI_API_KEY`, `AUTH_*`, `ADMIN_EMAILS`) se añaden a mano.

## Autenticación y control de acceso

Login con **Google**, **Microsoft (Outlook/Entra ID)** y **email + contraseña** vía Auth.js (NextAuth v5), sesión por JWT en cookie.

### Login por contraseña y usuario admin

No hay registro de autoservicio. El usuario administrador se **siembra automáticamente** en cada build/deploy (no recibe parámetros, lee env vars):

- `ADMIN_USERNAME` — opcional, default `admin` (no es un correo).
- `ADMIN_PASSWORD` — requerido para sembrarlo; si falta, el seed se omite sin fallar.

El seed corre en el script `build` (`scripts/seed-admin.mjs`) tras la migración, tanto en local como en Vercel. Es idempotente: crea el admin si no existe y deja su contraseña/estado alineados con las env vars. También puedes correrlo a mano:

```bash
npm run seed-admin
```

El admin entra en `/login` con su usuario (`admin`) + contraseña, y es redirigido a `/admin`.



- La protección de rutas vive en `proxy.ts` (reemplaza a `middleware.ts` en Next 16): sin sesión → redirige a `/login`.
- Cada usuario tiene un flag `active` (por defecto `true`). Si está en `false`, no puede iniciar sesión ni usar el chat — se le envía a `/sin-acceso`.
- Las rutas `/api/*` derivan el `userId` de la sesión en el servidor (no confían en el cliente).
- Los admins definidos en `ADMIN_EMAILS` pueden activar/desactivar usuarios en `/admin`.

**Redirect URIs a registrar** en Google y Microsoft (segmentos `google` y `microsoft-entra-id` fijos de Auth.js):
- `http://localhost:3000/api/auth/callback/google` · `.../api/auth/callback/microsoft-entra-id`
- `https://<dominio>/api/auth/callback/google` · `.../api/auth/callback/microsoft-entra-id`

## Inicializar base de datos

Tablas: `users`, `conversations`, `messages`, `reports`. El schema vive en `db/schema.sql` y es idempotente — seguro re-ejecutar.

```bash
npm run db:migrate
```

En Vercel se ejecuta automáticamente en cada deploy (ver `build` en `package.json`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# asistente-vocabulario
