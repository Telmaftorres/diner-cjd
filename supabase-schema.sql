create table inscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  prenom text not null,
  nom text not null,
  email text not null,
  tel text not null,
  date_id text not null,
  date_label text not null,
  cancel_token uuid not null unique,
  annule boolean default false,
  is_test boolean not null default false
);

create index on inscriptions(date_id, annule);

alter table inscriptions enable row level security;

-- Lieu / horaire de chaque dîner. Une ligne par date_id, créée à la demande.
-- admin_token : lien tokenisé envoyé à Baptiste (page /lieu/<token>).
create table diner_infos (
  date_id text primary key,
  lieu text,
  horaire text not null default '19h',
  admin_token uuid not null default gen_random_uuid(),
  rempli boolean not null default false,
  updated_at timestamptz default now()
);

alter table diner_infos enable row level security;

-- ────────────────────────────────────────────────────────────────
-- Migrations à appliquer sur une base existante (SQL Editor Supabase) :
--
-- alter table inscriptions add column if not exists is_test boolean not null default false;
--
-- create table if not exists diner_infos (
--   date_id text primary key,
--   lieu text,
--   horaire text not null default '19h',
--   admin_token uuid not null default gen_random_uuid(),
--   rempli boolean not null default false,
--   updated_at timestamptz default now()
-- );
-- alter table diner_infos enable row level security;
