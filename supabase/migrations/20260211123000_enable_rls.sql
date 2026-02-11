-- Enable RLS and add minimal policies for user-scoped read/update and admin access.

-- accounts
alter table public.accounts enable row level security;

create policy "accounts_select_own"
  on public.accounts
  for select
  using (user_id = auth.uid());

create policy "accounts_update_own"
  on public.accounts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "accounts_admin_all"
  on public.accounts
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');

-- clients
alter table public.clients enable row level security;

create policy "clients_select_own"
  on public.clients
  for select
  using (user_id = auth.uid());

create policy "clients_update_own"
  on public.clients
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "clients_admin_all"
  on public.clients
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');

-- influencer_referrals
alter table public.influencer_referrals enable row level security;

create policy "influencer_referrals_select_own"
  on public.influencer_referrals
  for select
  using (user_id = auth.uid());

create policy "influencer_referrals_update_own"
  on public.influencer_referrals
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "influencer_referrals_admin_all"
  on public.influencer_referrals
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');

-- agent_inbox_messages
alter table public.agent_inbox_messages enable row level security;

create policy "agent_inbox_messages_select_own"
  on public.agent_inbox_messages
  for select
  using (user_id = auth.uid());

create policy "agent_inbox_messages_update_own"
  on public.agent_inbox_messages
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "agent_inbox_messages_admin_all"
  on public.agent_inbox_messages
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');

-- influencer_clicks
alter table public.influencer_clicks enable row level security;

create policy "influencer_clicks_select_own"
  on public.influencer_clicks
  for select
  using (user_id = auth.uid());

create policy "influencer_clicks_update_own"
  on public.influencer_clicks
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "influencer_clicks_admin_all"
  on public.influencer_clicks
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');

-- influencer_payouts
alter table public.influencer_payouts enable row level security;

create policy "influencer_payouts_select_own"
  on public.influencer_payouts
  for select
  using (user_id = auth.uid());

create policy "influencer_payouts_update_own"
  on public.influencer_payouts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "influencer_payouts_admin_all"
  on public.influencer_payouts
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');

-- agent_requests
alter table public.agent_requests enable row level security;

create policy "agent_requests_select_own"
  on public.agent_requests
  for select
  using (user_id = auth.uid());

create policy "agent_requests_update_own"
  on public.agent_requests
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "agent_requests_admin_all"
  on public.agent_requests
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');

-- commission_plans
alter table public.commission_plans enable row level security;

create policy "commission_plans_select_own"
  on public.commission_plans
  for select
  using (user_id = auth.uid());

create policy "commission_plans_update_own"
  on public.commission_plans
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "commission_plans_admin_all"
  on public.commission_plans
  for all
  using (auth.role() = 'admin')
  with check (auth.role() = 'admin');
