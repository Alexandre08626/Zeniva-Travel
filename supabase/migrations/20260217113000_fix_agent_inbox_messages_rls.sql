-- Fix RLS policies for agent_inbox_messages to match current schema and allow
-- traveler/agent chat persistence with anon/authenticated clients.

alter table public.agent_inbox_messages enable row level security;

drop policy if exists "agent_inbox_messages_select_own" on public.agent_inbox_messages;
drop policy if exists "agent_inbox_messages_update_own" on public.agent_inbox_messages;
drop policy if exists "agent_inbox_messages_admin_all" on public.agent_inbox_messages;

drop policy if exists "agent_inbox_messages_select_all" on public.agent_inbox_messages;
drop policy if exists "agent_inbox_messages_insert_all" on public.agent_inbox_messages;
drop policy if exists "agent_inbox_messages_update_all" on public.agent_inbox_messages;
drop policy if exists "agent_inbox_messages_delete_all" on public.agent_inbox_messages;

create policy "agent_inbox_messages_select_all"
  on public.agent_inbox_messages
  for select
  using (true);

create policy "agent_inbox_messages_insert_all"
  on public.agent_inbox_messages
  for insert
  with check (true);

create policy "agent_inbox_messages_update_all"
  on public.agent_inbox_messages
  for update
  using (true)
  with check (true);

create policy "agent_inbox_messages_delete_all"
  on public.agent_inbox_messages
  for delete
  using (true);
