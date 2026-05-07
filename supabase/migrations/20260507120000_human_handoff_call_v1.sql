-- Tables for the "Confirm with a human agent" handoff + browser call feature.
-- All writes go through service-role API routes; anon/authenticated clients
-- only need SELECT for Realtime subscriptions.

CREATE TABLE IF NOT EXISTS public.human_handoff_requests (
  id text PRIMARY KEY,
  client_id text,
  client_email text,
  client_name text,
  contact_method text NOT NULL CHECK (contact_method IN ('chat','call')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','claimed','active','completed','abandoned','no_agent')),
  cart_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_page text,
  locale text NOT NULL DEFAULT 'en',
  client_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_at timestamptz NOT NULL DEFAULT now(),
  claimed_by_agent_id text,
  claimed_at timestamptz,
  completed_at timestamptz,
  payment_link_url text
);

CREATE INDEX IF NOT EXISTS idx_handoff_status_requested
  ON public.human_handoff_requests (status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_handoff_agent
  ON public.human_handoff_requests (claimed_by_agent_id, status);

ALTER TABLE public.human_handoff_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "handoff_read_all"
  ON public.human_handoff_requests
  FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS public.agents_availability (
  agent_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('available','paused','offline')),
  last_active_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_availability_status
  ON public.agents_availability (status, last_active_at DESC);

ALTER TABLE public.agents_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_read_all"
  ON public.agents_availability
  FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS public.call_sessions (
  session_id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES public.human_handoff_requests(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  ended_by text CHECK (ended_by IN ('client','agent','network'))
);

CREATE INDEX IF NOT EXISTS idx_call_sessions_request
  ON public.call_sessions (request_id);

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_sessions_read_all"
  ON public.call_sessions
  FOR SELECT
  USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.human_handoff_requests;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.agents_availability;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.call_sessions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
