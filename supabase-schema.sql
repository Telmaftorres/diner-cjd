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
  annule boolean default false
);

create index on inscriptions(date_id, annule);

alter table inscriptions enable row level security;