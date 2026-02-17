-- Persistent agent-managed listings (hotels / homes)

create extension if not exists "pgcrypto";

create table if not exists public.agent_listings (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  status text not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  created_by_account_id uuid,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists agent_listings_status_idx on public.agent_listings (status);
create index if not exists agent_listings_type_idx on public.agent_listings (type);
create index if not exists agent_listings_created_by_idx on public.agent_listings (created_by_account_id);

alter table public.agent_listings enable row level security;

create policy "agent_listings_select_published"
  on public.agent_listings
  for select
  using (status = 'published');

create policy "agent_listings_select_own"
  on public.agent_listings
  for select
  using (created_by_account_id = auth.uid());

create policy "agent_listings_insert_own"
  on public.agent_listings
  for insert
  with check (created_by_account_id = auth.uid());

create policy "agent_listings_update_own"
  on public.agent_listings
  for update
  using (created_by_account_id = auth.uid())
  with check (created_by_account_id = auth.uid());

create policy "agent_listings_delete_own"
  on public.agent_listings
  for delete
  using (created_by_account_id = auth.uid());

create policy "agent_listings_admin_all"
  on public.agent_listings
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');
