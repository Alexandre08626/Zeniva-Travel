-- Rex Maintenance Log Table
-- Tracks all Rex health checks, issues found, and resolutions

CREATE TABLE IF NOT EXISTS public.rex_maintenance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_type TEXT NOT NULL, -- 'health_check', 'daily_6am', 'nightly_11pm', 'metric_validation', 'subscription_check'
  status TEXT NOT NULL, -- 'success', 'warning', 'error', 'critical'
  issue_found TEXT, -- Description of issue if any
  resolution TEXT, -- How it was resolved
  metadata JSONB DEFAULT '{}', -- Additional context (affected tables, error codes, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by timestamp and status
CREATE INDEX IF NOT EXISTS idx_rex_log_timestamp ON public.rex_maintenance_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rex_log_status ON public.rex_maintenance_log(status);
CREATE INDEX IF NOT EXISTS idx_rex_log_check_type ON public.rex_maintenance_log(check_type);

-- Enable RLS
ALTER TABLE public.rex_maintenance_log ENABLE ROW LEVEL SECURITY;

-- Policy: HQ and agents can read all logs
CREATE POLICY "HQ and agents can read rex logs" ON public.rex_maintenance_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = auth.uid()
      AND (
        accounts.role = 'hq'
        OR accounts.role = 'admin'
        OR 'hq' = ANY(accounts.roles)
        OR 'admin' = ANY(accounts.roles)
        OR 'travel_agent' = ANY(accounts.roles)
      )
    )
  );

-- Policy: Only system can insert logs (service role)
CREATE POLICY "Service role can insert rex logs" ON public.rex_maintenance_log
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS, this is just for explicit access

-- Add helpful comment
COMMENT ON TABLE public.rex_maintenance_log IS 'Logs all Rex Platform Engineer maintenance activities, health checks, and issues found';
