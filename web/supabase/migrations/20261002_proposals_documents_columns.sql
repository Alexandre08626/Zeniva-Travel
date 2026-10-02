-- 2026-10-02 — Colonnes attendues par /api/proposals, /api/bookings et /api/documents.
-- En production, GET /api/proposals renvoyait « column proposals.trip_id does not exist » :
-- aucune proposition n'était sauvegardée, donc les liens partagés / checkout sur un autre
-- appareil affichaient « Trip not found ». Tout est « IF NOT EXISTS » : sans danger à relancer.

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS trip_id text;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS owner_email text;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS client_email text;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS destination text;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS proposals_trip_id_key ON proposals (trip_id);
CREATE INDEX IF NOT EXISTS proposals_owner_email_idx ON proposals (owner_email);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS owner_email text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS bookings_owner_email_idx ON bookings (owner_email);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS owner_email text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS trip_id text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS documents_owner_email_idx ON documents (owner_email);

-- Les routes passent par la clé service (serveur) : RLS activé, aucune politique publique.
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
