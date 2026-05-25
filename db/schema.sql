-- GlosarioIA schema
-- Funciona idéntico en Postgres local y Supabase.
-- Para inicializar:
--   Local:    psql "$DATABASE_URL" -f db/schema.sql
--   Supabase: pegar este archivo en el SQL editor

create extension if not exists "pgcrypto";

create table if not exists users (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  profession        text,
  profession_label  text,
  custom_profession text,
  sector            text,
  custom_sector     text,
  tone              text,
  created_at        timestamptz not null default now(),
  last_seen_at      timestamptz not null default now()
);

create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz
);

create index if not exists conversations_user_idx on conversations(user_id);

create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  tone            text,
  term_clicked    text,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx on messages(conversation_id);
create index if not exists messages_created_idx on messages(created_at desc);

create table if not exists reports (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid references messages(id) on delete set null,
  user_id      uuid not null references users(id) on delete cascade,
  reason       text not null,
  user_comment text,
  created_at   timestamptz not null default now()
);

create index if not exists reports_user_idx on reports(user_id);
create index if not exists reports_created_idx on reports(created_at desc);
