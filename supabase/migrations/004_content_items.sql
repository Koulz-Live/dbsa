-- Create content items and versioning tables
-- Stores the actual content with full versioning support

-- Content status enum
CREATE TYPE content_status AS ENUM ('Draft', 'InReview', 'Approved', 'Published', 'Unpublished');

-- Main content items table (current/draft state)
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE RESTRICT,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  excerpt TEXT,
  hero_image_url TEXT,
  page_data JSONB, -- Page builder blocks
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  meta_keywords TEXT[],
  status content_status NOT NULL DEFAULT 'Draft',
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  publish_at TIMESTAMPTZ,
  unpublish_at TIMESTAMPTZ,
  published_version_id UUID, -- Reference to published version
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(content_type_id, slug)
);

-- Content versions table (immutable history)
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  excerpt TEXT,
  hero_image_url TEXT,
  page_data JSONB,
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  meta_keywords TEXT[],
  status content_status NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changes_summary TEXT, -- Summary of what changed
  UNIQUE(content_id, version_number)
);

-- Create indexes for content_items
CREATE INDEX idx_content_items_content_type ON content_items(content_type_id);
CREATE INDEX idx_content_items_slug ON content_items(slug);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_author ON content_items(author_id);
CREATE INDEX idx_content_items_department ON content_items(department_id);
CREATE INDEX idx_content_items_publish_at ON content_items(publish_at);
CREATE INDEX idx_content_items_unpublish_at ON content_items(unpublish_at);
CREATE INDEX idx_content_items_created_at ON content_items(created_at DESC);

-- Create indexes for content_versions
CREATE INDEX idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX idx_content_versions_version_number ON content_versions(content_id, version_number DESC);
CREATE INDEX idx_content_versions_created_at ON content_versions(created_at DESC);

-- Enable RLS
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_items

-- Authors can view their own content and published content
CREATE POLICY "Authors can view own and published content"
  ON content_items
  FOR SELECT
  USING (
    author_id = auth.uid()
    OR status = 'Published'
    OR has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin')
  );

-- Authors can create content
CREATE POLICY "Authors can create content"
  ON content_items
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), 'Author', 'Editor', 'Publisher', 'Admin')
    AND author_id = auth.uid()
  );

-- Authors can update their own Draft content
CREATE POLICY "Authors can update own draft content"
  ON content_items
  FOR UPDATE
  USING (
    author_id = auth.uid()
    AND status = 'Draft'
  );

-- Editors and above can update any content
CREATE POLICY "Editors can update any content"
  ON content_items
  FOR UPDATE
  USING (has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin'));

-- Only Admins can delete content
CREATE POLICY "Admins can delete content"
  ON content_items
  FOR DELETE
  USING (has_role(auth.uid(), 'Admin'));

-- RLS Policies for content_versions

-- Users can view versions of content they can access
CREATE POLICY "Users can view accessible content versions"
  ON content_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = content_versions.content_id
      AND (
        ci.author_id = auth.uid()
        OR ci.status = 'Published'
        OR has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin')
      )
    )
  );

-- System can insert versions (handled by trigger)
CREATE POLICY "System can create versions"
  ON content_versions
  FOR INSERT
  WITH CHECK (true);

-- Create trigger to auto-create version on content update
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM content_versions
  WHERE content_id = NEW.id;

  -- Insert new version
  INSERT INTO content_versions (
    content_id,
    version_number,
    title,
    slug,
    excerpt,
    hero_image_url,
    page_data,
    meta_title,
    meta_description,
    meta_keywords,
    status,
    created_by
  ) VALUES (
    NEW.id,
    next_version,
    NEW.title,
    NEW.slug,
    NEW.excerpt,
    NEW.hero_image_url,
    NEW.page_data,
    NEW.meta_title,
    NEW.meta_description,
    NEW.meta_keywords,
    NEW.status,
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER content_items_version_trigger
  AFTER INSERT OR UPDATE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION create_content_version();

-- Create updated_at trigger
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE content_items IS 'Main content storage with current/draft state';
COMMENT ON TABLE content_versions IS 'Immutable version history of all content changes';
