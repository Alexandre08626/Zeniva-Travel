-- Migration: AI Agents table
-- Created: 2026-03-30

CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  tier TEXT NOT NULL DEFAULT 'agency',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO ai_agents (name, slug, role, description, tier, sort_order) VALUES
('Sofia', 'sofia', 'Operations Agent', 'Automates booking follow-ups, confirmations, document delivery, and reminders.', 'agent', 1),
('Luna', 'luna', 'Client Relationship Agent', 'Post-trip follow-ups, personalized suggestions, dormant client re-engagement.', 'agent', 2),
('Rex', 'rex', 'Research & Intelligence Agent', 'Destination trends, supplier price comparisons, real-time data feeds.', 'agent', 3),
('Ben', 'ben', 'Finance Agent', 'Automated invoicing, commission tracking, payment reconciliation.', 'agency', 4),
('Atlas', 'atlas', 'Analytics Agent', 'Performance dashboards, conversion tracking, revenue forecasting.', 'agency', 5),
('Mia', 'mia', 'Marketing Agent', 'Email campaigns, social media content, promotional materials.', 'agency', 6),
('Nova', 'nova', 'Document Agent', 'Contract generation, insurance tracking, travel document preparation.', 'agency', 7)
ON CONFLICT (slug) DO NOTHING;
