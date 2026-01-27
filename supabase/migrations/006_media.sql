-- Create media management tables
-- Handles media assets stored in Supabase Storage

CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  storage_bucket VARCHAR(100) NOT NULL DEFAULT 'media',
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  metadata JSONB, -- Additional metadata (EXIF, etc.)
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  department_id UUID REFERENCES departments(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media usage tracking table
CREATE TABLE media_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  usage_context VARCHAR(100), -- e.g., 'hero_image', 'page_builder_block', 'gallery'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(media_asset_id, content_id, usage_context)
);

-- Create indexes
CREATE INDEX idx_media_assets_filename ON media_assets(filename);
CREATE INDEX idx_media_assets_mime_type ON media_assets(mime_type);
CREATE INDEX idx_media_assets_uploaded_by ON media_assets(uploaded_by);
CREATE INDEX idx_media_assets_department ON media_assets(department_id);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at DESC);
CREATE INDEX idx_media_assets_storage_path ON media_assets(storage_path);

CREATE INDEX idx_media_usage_asset ON media_usage(media_asset_id);
CREATE INDEX idx_media_usage_content ON media_usage(content_id);

-- Enable RLS
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_assets

-- All authenticated users can view public media
CREATE POLICY "All users can view public media"
  ON media_assets
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      is_public = true
      OR uploaded_by = auth.uid()
      OR has_any_role(auth.uid(), 'Editor', 'Publisher', 'Admin')
    )
  );

-- Authors and above can upload media
CREATE POLICY "Authors can upload media"
  ON media_assets
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), 'Author', 'Editor', 'Publisher', 'Admin')
    AND uploaded_by = auth.uid()
  );

-- Users can update their own media metadata
CREATE POLICY "Users can update own media metadata"
  ON media_assets
  FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR has_any_role(auth.uid(), 'Editor', 'Publisher', 'Admin')
  );

-- Admins can delete media
CREATE POLICY "Admins can delete media"
  ON media_assets
  FOR DELETE
  USING (has_role(auth.uid(), 'Admin'));

-- RLS Policies for media_usage

-- Users can view media usage for content they can access
CREATE POLICY "Users can view accessible media usage"
  ON media_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = media_usage.content_id
      AND (
        ci.author_id = auth.uid()
        OR ci.status = 'Published'
        OR has_any_role(auth.uid(), 'Editor', 'Publisher', 'Admin')
      )
    )
  );

-- System can track media usage
CREATE POLICY "System can track media usage"
  ON media_usage
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), 'Author', 'Editor', 'Publisher', 'Admin')
  );

-- System can remove media usage
CREATE POLICY "System can remove media usage"
  ON media_usage
  FOR DELETE
  USING (
    has_any_role(auth.uid(), 'Author', 'Editor', 'Publisher', 'Admin')
  );

-- Create updated_at trigger
CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track media usage automatically
CREATE OR REPLACE FUNCTION track_media_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract media URLs from page_data and hero_image_url
  -- This is a simplified version; extend based on your needs
  
  IF NEW.hero_image_url IS NOT NULL AND NEW.hero_image_url != OLD.hero_image_url THEN
    INSERT INTO media_usage (media_asset_id, content_id, usage_context)
    SELECT id, NEW.id, 'hero_image'
    FROM media_assets
    WHERE url = NEW.hero_image_url
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_content_media_usage
  AFTER INSERT OR UPDATE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION track_media_usage();

COMMENT ON TABLE media_assets IS 'Media files stored in Supabase Storage with metadata';
COMMENT ON TABLE media_usage IS 'Tracks where media assets are used in content';
