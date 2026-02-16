-- Create yacht listings for broker-managed inventory

create extension if not exists "pgcrypto";

create table if not exists public.yacht_listings (
  id uuid primary key default gen_random_uuid(),
  broker_user_id uuid not null,
  broker_email text,
  type text not null default 'yacht',
  title text not null,
  status text not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists yacht_listings_broker_idx on public.yacht_listings (broker_user_id);
create index if not exists yacht_listings_status_idx on public.yacht_listings (status);
create index if not exists yacht_listings_type_idx on public.yacht_listings (type);

alter table public.yacht_listings enable row level security;

create policy "yacht_listings_select_published"
  on public.yacht_listings
  for select
  using (status = 'published');

create policy "yacht_listings_select_own"
  on public.yacht_listings
  for select
  using (broker_user_id = auth.uid());

create policy "yacht_listings_insert_own"
  on public.yacht_listings
  for insert
  with check (broker_user_id = auth.uid());

create policy "yacht_listings_update_own"
  on public.yacht_listings
  for update
  using (broker_user_id = auth.uid())
  with check (broker_user_id = auth.uid());

create policy "yacht_listings_delete_own"
  on public.yacht_listings
  for delete
  using (broker_user_id = auth.uid());

create policy "yacht_listings_admin_all"
  on public.yacht_listings
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');
