This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Variables de entorno

Usamos los **mismos nombres que Vercel auto-inyecta** al integrar Supabase, así no hay lógica condicional entre entornos.

- `OPENAI_API_KEY` — clave de OpenAI.
- `POSTGRES_URL` — connection string usada en runtime (pooled en Supabase, directo en local).
- `POSTGRES_URL_NON_POOLING` — usada por las migraciones (DDL puede fallar sobre PgBouncer).

**Local:** copia `.env.example` a `.env.local` (ambas apuntan al mismo Postgres local).

**Vercel:** al conectar el proyecto Supabase desde la integración, Vercel inyecta todas estas vars automáticamente. No hace falta añadirlas a mano (salvo `OPENAI_API_KEY`).

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
