-- Migration: Agency B2B tables
-- Created: 2026-03-30

-- ============================================================
-- 1. agencies table
-- ============================================================
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0f766e',
  secondary_color TEXT DEFAULT '#f0fdfa',
  contact_email TEXT,
  contact_phone TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  zenipay_merchant_id TEXT,
  is_active BOOLEAN DEFAULT true,
  setup_fee_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  config JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_owner_id ON agencies(owner_id);

-- ============================================================
-- 2. api_usage_logs table
-- ============================================================
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  action TEXT,
  unit_cost NUMERIC(10,4) DEFAULT 0,
  unit_price NUMERIC(10,4) DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_logs_agency_id ON api_usage_logs(agency_id);
CREATE INDEX idx_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX idx_usage_logs_service ON api_usage_logs(service);

-- ============================================================
-- 3. agency_pricing table
-- ============================================================
CREATE TABLE IF NOT EXISTS agency_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  price_per_unit NUMERIC(10,4) NOT NULL,
  cost_per_unit NUMERIC(10,4) NOT NULL,
  unit_label TEXT DEFAULT 'unit',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, service)
);

CREATE INDEX idx_agency_pricing_agency_id ON agency_pricing(agency_id);

-- ============================================================
-- 4. Default pricing (seeder function)
-- ============================================================
CREATE OR REPLACE FUNCTION seed_agency_pricing(p_agency_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO agency_pricing (agency_id, service, price_per_unit, cost_per_unit, unit_label)
  VALUES
    (p_agency_id, 'lina_ai',     0.25, 0.01, 'interaction'),
    (p_agency_id, 'sms_twilio',  0.03, 0.008, 'message'),
    (p_agency_id, 'whatsapp',    0.02, 0.005, 'message'),
    (p_agency_id, 'email',       0.01, 0.002, 'courriel'),
    (p_agency_id, 'api_search',  0.10, 0.03,  'requete')
  ON CONFLICT (agency_id, service) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. Add agency_id column to existing tables
-- ============================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;

-- Indexes on agency_id for existing tables
CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agency_id ON bookings(agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_agency_id ON leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_proposals_agency_id ON proposals(agency_id);
CREATE INDEX IF NOT EXISTS idx_invoices_agency_id ON invoices(agency_id);
CREATE INDEX IF NOT EXISTS idx_messages_agency_id ON messages(agency_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agency_id ON conversations(agency_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_agency_id ON dossiers(agency_id);
CREATE INDEX IF NOT EXISTS idx_listings_agency_id ON listings(agency_id);
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON profiles(agency_id);

-- ============================================================
-- 6. RLS policies
-- ============================================================
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_pricing ENABLE ROW LEVEL SECURITY;

-- Agency owners can view/edit their agency
CREATE POLICY agencies_owner_select ON agencies
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY agencies_owner_update ON agencies
  FOR UPDATE USING (owner_id = auth.uid());

-- Agency members can view their agency
CREATE POLICY agencies_member_select ON agencies
  FOR SELECT USING (
    id IN (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

-- Usage logs: agency members can view
CREATE POLICY usage_logs_agency_select ON api_usage_logs
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

-- Pricing: agency members can view
CREATE POLICY pricing_agency_select ON agency_pricing
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- 7. RPC: get_agency_usage_summary
-- ============================================================
CREATE OR REPLACE FUNCTION get_agency_usage_summary(
  p_agency_id UUID,
  p_month TEXT -- format: 'YYYY-MM'
)
RETURNS TABLE (
  service TEXT,
  quantity BIGINT,
  unit_price NUMERIC,
  total NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.service,
    SUM(u.quantity)::BIGINT AS quantity,
    COALESCE(MAX(u.unit_price), 0) AS unit_price,
    SUM(u.quantity * u.unit_price) AS total
  FROM api_usage_logs u
  WHERE u.agency_id = p_agency_id
    AND to_char(u.created_at, 'YYYY-MM') = p_month
  GROUP BY u.service
  ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
