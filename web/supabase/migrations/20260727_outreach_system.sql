-- Outreach System — Multi-Channel Lead Generation & Engagement
-- Each lead: 4+ emails + phone + multi-channel personalized messages

-- Leads table (enhanced)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type text default 'travel';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS emails text[] default '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_count integer default 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS agency text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_status text default 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_channels text[] default '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_sent_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_response text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enriched_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS signed_up_at timestamptz;

-- Outreach messages (email, SMS, WhatsApp)
CREATE TABLE IF NOT EXISTS outreach_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  campaign_id uuid,
  channel text not null check (channel in ('email', 'sms', 'whatsapp')),
  recipient text not null,
  sender text,
  subject text,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'queued', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked', 'replied')),
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  error text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('travel', 'agency', 'zenipay', 'dev', 'onboarding', 'proposals')),
  channel text not null check (channel in ('email', 'sms', 'whatsapp', 'multi')),
  target_countries text[] default '{}',
  total_leads integer default 0,
  sent_count integer default 0,
  open_count integer default 0,
  click_count integer default 0,
  reply_count integer default 0,
  status text default 'draft' check (status in ('draft', 'running', 'paused', 'completed', 'cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Add campaign_id to outreach_messages
ALTER TABLE outreach_messages ADD COLUMN IF NOT EXISTS campaign_id uuid references campaigns(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_outreach_status ON leads(outreach_status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_email_count ON leads(email_count);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_lead_id ON outreach_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_channel ON outreach_messages(channel);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_status ON outreach_messages(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
