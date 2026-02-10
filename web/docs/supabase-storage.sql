-- Supabase storage tables for proposals, bookings, and documents

create table if not exists proposals (
  id text primary key,
  owner_email text not null,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  payload jsonb
);

create index if not exists proposals_owner_email_idx on proposals (owner_email);

create table if not exists bookings (
  id text primary key,
  owner_email text not null,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  payload jsonb
);

create index if not exists bookings_owner_email_idx on bookings (owner_email);

create table if not exists documents (
  id text primary key,
  owner_email text not null,
  trip_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  payload jsonb
);

create index if not exists documents_owner_email_idx on documents (owner_email);
create index if not exists documents_trip_id_idx on documents (trip_id);
