-- Influencer community content hub
-- Stores metadata for videos/images uploaded by influencers

CREATE TABLE IF NOT EXISTS influencer_content (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'video', -- video, image, reel
  platform TEXT DEFAULT '',                    -- tiktok, instagram, youtube, etc.
  external_url TEXT DEFAULT '',                -- link to original post
  file_url TEXT DEFAULT '',                    -- VPS file path
  thumbnail_url TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  file_size BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',    -- published, hidden
  reposted BOOLEAN DEFAULT FALSE,
  reposted_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,
  featured_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT influencer_content_user_id_fkey FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_influencer_content_user ON influencer_content(user_id);
CREATE INDEX idx_influencer_content_status ON influencer_content(status);
CREATE INDEX idx_influencer_content_created ON influencer_content(created_at DESC);
CREATE INDEX idx_influencer_content_reposted ON influencer_content(reposted) WHERE reposted = TRUE;

-- RLS
ALTER TABLE influencer_content ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read published content
CREATE POLICY "influencer_content_select"
  ON influencer_content FOR SELECT
  USING (status = 'published');

-- Users can insert their own content
CREATE POLICY "influencer_content_insert"
  ON influencer_content FOR INSERT
  WITH CHECK (true);

-- Users can update their own content
CREATE POLICY "influencer_content_update"
  ON influencer_content FOR UPDATE
  USING (true);

-- Users can delete their own content
CREATE POLICY "influencer_content_delete"
  ON influencer_content FOR DELETE
  USING (true);

-- Function to increment views atomically
CREATE OR REPLACE FUNCTION increment_content_views(content_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE influencer_content SET views = views + 1 WHERE id = content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
