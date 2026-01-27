-- Create content types table
-- Defines different types of content (Page, Article, News, etc.)

CREATE TABLE content_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Icon name for UI
  schema JSONB, -- Optional JSON schema for validation
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_content_types_slug ON content_types(slug);
CREATE INDEX idx_content_types_is_active ON content_types(is_active);

-- Enable RLS
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_types
-- All authenticated users can view active content types
CREATE POLICY "All authenticated users can view active content types"
  ON content_types
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_active = true
  );

-- Admins can manage content types
CREATE POLICY "Admins can manage content types"
  ON content_types
  FOR ALL
  USING (has_role(auth.uid(), 'Admin'));

-- Create updated_at trigger
CREATE TRIGGER update_content_types_updated_at
  BEFORE UPDATE ON content_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default content types
INSERT INTO content_types (name, slug, description, icon) VALUES
  ('Page', 'page', 'Standard web page', 'document'),
  ('Article', 'article', 'Article or blog post', 'newspaper'),
  ('News', 'news', 'News item', 'megaphone'),
  ('Event', 'event', 'Event listing', 'calendar');

COMMENT ON TABLE content_types IS 'Defines different types of content that can be created';
