-- Lina Training Turns
-- Persists every Lina exchange (prompt + reply + context) so it can be exported
-- as a fine-tuning dataset for the proprietary Lina model (see scripts/lina-dataset).

CREATE TABLE IF NOT EXISTS public.lina_training_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT NOT NULL,
  request_id TEXT,
  source TEXT NOT NULL, -- 'lina', 'lina-stream', 'chat'
  mode TEXT, -- 'client', 'agent', 'voice', 'partner', 'hq'
  provider TEXT, -- which LLM produced the reply (groq, openai-fallback, ...)
  agency_id UUID,
  agent_id UUID,
  system_prompt TEXT,
  history JSONB NOT NULL DEFAULT '[]', -- prior messages [{role, content}]
  prompt TEXT NOT NULL,
  reply TEXT NOT NULL,
  rating SMALLINT, -- human review: 1 = bad, 3 = ok, 5 = gold (NULL = not reviewed)
  reviewed_reply TEXT, -- corrected reply written by a human, used instead of `reply` when set
  exclude BOOLEAN NOT NULL DEFAULT FALSE, -- skip from dataset (spam, test, sensitive)
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_lina_training_turns_session ON public.lina_training_turns(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lina_training_turns_created ON public.lina_training_turns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lina_training_turns_rating ON public.lina_training_turns(rating) WHERE rating IS NOT NULL;

ALTER TABLE public.lina_training_turns ENABLE ROW LEVEL SECURITY;
-- Service role only (written from API routes with the admin client, read by the export script).
