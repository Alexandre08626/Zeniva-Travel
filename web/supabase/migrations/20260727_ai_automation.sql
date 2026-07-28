-- AI Automation System
-- Adds columns for automated agent processing

-- Travel AI: lead qualification
ALTER TABLE leads ADD COLUMN IF NOT EXISTS travel_ai_qualified boolean;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS travel_ai_analysis text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS travel_ai_qualified_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_generated boolean;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_id uuid references proposals(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_generated_at timestamptz;

-- Agency AI: agency onboarding
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_ai_analysis text;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_ai_checked_at timestamptz;

-- ZeniPay AI: transaction review
ALTER TABLE zenipay_transactions ADD COLUMN IF NOT EXISTS zenipay_ai_reviewed boolean default false;
ALTER TABLE zenipay_transactions ADD COLUMN IF NOT EXISTS zenipay_ai_analysis text;
ALTER TABLE zenipay_transactions ADD COLUMN IF NOT EXISTS zenipay_ai_flagged boolean default false;
ALTER TABLE zenipay_transactions ADD COLUMN IF NOT EXISTS zenipay_ai_reviewed_at timestamptz;

-- Dev AI: developer onboarding
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS dev_ai_welcomed boolean default false;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS dev_ai_welcome_message text;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS dev_ai_welcomed_at timestamptz;

-- Onboarding AI: agent activation
ALTER TABLE agents ADD COLUMN IF NOT EXISTS onboarding_ai_sent boolean default false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS onboarding_ai_sequence text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS onboarding_ai_sent_at timestamptz;

-- Alerts table for fraud flags and system alerts
CREATE TABLE IF NOT EXISTS alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null default 'medium',
  message text not null,
  metadata jsonb default '{}',
  resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Automation run log
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  status text not null,
  message text,
  details jsonb default '{}',
  created_at timestamptz default now()
);
