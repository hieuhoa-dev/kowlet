-- Base schema for Supabase
-- Paste into Supabase SQL Editor

create extension if not exists "pgcrypto";

-- ─── Tag Category (nhóm tag) ──────────────────────────────────
create table if not exists tag_category (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  icon       text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Tag ──────────────────────────────────────────────────────
create table if not exists tag (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  icon        text,
  category_id uuid references tag_category(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tag_category_idx on tag(category_id);

-- ─── Tech ─────────────────────────────────────────────────────
create table if not exists tech (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  description    text,
  github_url     text,
  url            text,
  og_image       text,
  og_title       text,
  og_description text,
  favicon        text,
  bookmark_count integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── Tag <-> Tech ─────────────────────────────────────────────
create table if not exists tag_tech (
  id      uuid primary key default gen_random_uuid(),
  tag_id  uuid not null references tag(id) on delete cascade,
  tech_id uuid not null references tech(id) on delete cascade,
  unique (tag_id, tech_id)
);

-- ─── Notification ─────────────────────────────────────────────
create table if not exists notification (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  status     text not null default 'pending',
  url        text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Bookmark ─────────────────────────────────────────────────
create table if not exists bookmark (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  tech_id    uuid not null references tech(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Profile ──────────────────────────────────────────────────
create table if not exists profile (
  id         uuid primary key,
  role       text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists bookmark_user_idx       on bookmark(user_id);
create index if not exists bookmark_tech_idx       on bookmark(tech_id);
create index if not exists tag_tech_tag_idx        on tag_tech(tag_id);
create index if not exists tag_tech_tech_idx       on tag_tech(tech_id);
create index if not exists notification_user_idx   on notification(user_id);
create index if not exists notification_status_idx on notification(status);