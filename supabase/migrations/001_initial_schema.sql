-- ============================================================
-- AI Writing Assistant — Initial Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────

create type rewrite_action as enum (
  'fix_grammar',
  'professional',
  'friendly',
  'concise',
  'persuasive',
  'executive',
  'recruiter',
  'follow_up',
  'expand',
  'shorten',
  'human',
  'custom'
);

create type platform_type as enum (
  'slack',
  'gmail',
  'linkedin',
  'notion',
  'generic'
);

create type tone_preference as enum (
  'professional',
  'friendly',
  'casual',
  'direct'
);

create type style_preference as enum (
  'concise',
  'detailed',
  'balanced'
);

create type theme_preference as enum (
  'light',
  'dark',
  'system'
);

-- ────────────────────────────────────────────────────────────
-- REWRITES
-- Stores every rewrite performed by a user.
-- ────────────────────────────────────────────────────────────

create table public.rewrites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  original_text text not null,
  rewritten_text text not null,
  action        rewrite_action not null,
  platform      platform_type not null default 'generic',
  created_at    timestamptz not null default now()
);

create index rewrites_user_id_created_at_idx on public.rewrites (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────
-- USER PREFERENCES
-- One row per user.
-- ────────────────────────────────────────────────────────────

create table public.user_preferences (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references auth.users(id) on delete cascade,
  tone              tone_preference not null default 'professional',
  style             style_preference not null default 'balanced',
  industry          text not null default '',
  signature         text not null default '',
  conciseness_level smallint not null default 3 check (conciseness_level between 1 and 5),
  theme             theme_preference not null default 'system',
  updated_at        timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────
-- PROMPT TEMPLATES
-- Saved custom prompts per user.
-- ────────────────────────────────────────────────────────────

create table public.prompt_templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  prompt      text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index prompt_templates_user_id_idx on public.prompt_templates (user_id);

-- ────────────────────────────────────────────────────────────
-- USAGE TRACKING
-- Anonymous aggregatable usage events.
-- ────────────────────────────────────────────────────────────

create table public.usage_tracking (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  action          rewrite_action not null,
  platform        platform_type not null default 'generic',
  character_count integer not null default 0,
  created_at      timestamptz not null default now()
);

create index usage_tracking_user_id_idx on public.usage_tracking (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Each user can only read/write their own rows.
-- ────────────────────────────────────────────────────────────

alter table public.rewrites          enable row level security;
alter table public.user_preferences  enable row level security;
alter table public.prompt_templates  enable row level security;
alter table public.usage_tracking    enable row level security;

-- Rewrites
create policy "Users can read own rewrites"
  on public.rewrites for select
  using (auth.uid() = user_id);

create policy "Users can insert own rewrites"
  on public.rewrites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own rewrites"
  on public.rewrites for delete
  using (auth.uid() = user_id);

-- User preferences
create policy "Users can read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Prompt templates
create policy "Users can read own templates"
  on public.prompt_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.prompt_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.prompt_templates for delete
  using (auth.uid() = user_id);

-- Usage tracking
create policy "Users can insert own usage"
  on public.usage_tracking for insert
  with check (auth.uid() = user_id);

create policy "Users can read own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id);
