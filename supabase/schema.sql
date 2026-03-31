-- Neural Bridge — Supabase Schema
-- Run this once in your Supabase project:
-- https://app.supabase.com → SQL Editor → New Query → Paste → Run

-- ─────────────────────────────────────────
-- Table: project_configs
-- ─────────────────────────────────────────
create table if not exists project_configs (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null unique,
  rules         text[]      not null default '{}',
  blockers      text[]      not null default '{}',
  notes         text        not null default '',
  tech_stack    text[]      not null default '{}',
  custom_prompts jsonb      not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Auto-update updated_at on every UPDATE
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on project_configs;

create trigger set_updated_at
  before update on project_configs
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- Row Level Security
-- Currently open (no auth). Replace the
-- policy below with user-scoped policies
-- when authentication is added.
-- ─────────────────────────────────────────
alter table project_configs enable row level security;

drop policy if exists "Allow all operations" on project_configs;

create policy "Allow all operations"
  on project_configs
  for all
  using (true)
  with check (true);
