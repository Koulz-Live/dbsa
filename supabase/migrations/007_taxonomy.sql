-- Create taxonomy system for content categorization
-- Supports categories, tags, audiences, and custom taxonomies

-- Taxonomy type enum
CREATE TYPE taxonomy_type AS ENUM ('Category', 'Tag', 'Audience', 'Topic', 'Custom');

CREATE TABLE taxonomy_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  type taxonomy_type NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES taxonomy_terms(id) ON DELETE CASCADE,
  metadata JSONB, -- Additional custom fields
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(type, slug)
);

-- Content taxonomy relationship table (many-to-many)
CREATE TABLE content_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  taxonomy_term_id UUID NOT NULL REFERENCES taxonomy_terms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(content_id, taxonomy_term_id)
);

-- Create indexes
CREATE INDEX idx_taxonomy_terms_type ON taxonomy_terms(type);
CREATE INDEX idx_taxonomy_terms_slug ON taxonomy_terms(slug);
CREATE INDEX idx_taxonomy_terms_parent ON taxonomy_terms(parent_id);
CREATE INDEX idx_taxonomy_terms_is_active ON taxonomy_terms(is_active);
CREATE INDEX idx_taxonomy_terms_sort_order ON taxonomy_terms(sort_order);

CREATE INDEX idx_content_taxonomy_content ON content_taxonomy(content_id);
CREATE INDEX idx_content_taxonomy_term ON content_taxonomy(taxonomy_term_id);

-- Enable RLS
ALTER TABLE taxonomy_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_taxonomy ENABLE ROW LEVEL SECURITY;

-- RLS Policies for taxonomy_terms

-- All authenticated users can view active terms
CREATE POLICY "All users can view active taxonomy terms"
  ON taxonomy_terms
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_active = true
  );

-- Editors and above can manage taxonomy
CREATE POLICY "Editors can manage taxonomy terms"
  ON taxonomy_terms
  FOR ALL
  USING (has_any_role(auth.uid(), 'Editor', 'Publisher', 'Admin'));

-- RLS Policies for content_taxonomy

-- Users can view taxonomy for content they can access
CREATE POLICY "Users can view accessible content taxonomy"
  ON content_taxonomy
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = content_taxonomy.content_id
      AND (
        ci.author_id = auth.uid()
        OR ci.status = 'Published'
        OR has_any_role(auth.uid(), 'Editor', 'Publisher', 'Admin')
      )
    )
  );

-- Authors can manage taxonomy for their content
CREATE POLICY "Authors can manage own content taxonomy"
  ON content_taxonomy
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = content_taxonomy.content_id
      AND (
        ci.author_id = auth.uid()
        OR has_any_role(auth.uid(), 'Editor', 'Publisher', 'Admin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = content_taxonomy.content_id
      AND (
        ci.author_id = auth.uid()
        OR has_any_role(auth.uid(), 'Editor', 'Publisher', 'Admin')
      )
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_taxonomy_terms_updated_at
  BEFORE UPDATE ON taxonomy_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default taxonomy terms
INSERT INTO taxonomy_terms (name, slug, type, description) VALUES
  ('General', 'general', 'Category', 'General content'),
  ('Internal', 'internal', 'Audience', 'Internal staff only'),
  ('Public', 'public', 'Audience', 'Public-facing content'),
  ('Members', 'members', 'Audience', 'Member-only content'),
  ('Featured', 'featured', 'Tag', 'Featured content'),
  ('Announcement', 'announcement', 'Tag', 'Important announcements');

COMMENT ON TABLE taxonomy_terms IS 'Hierarchical taxonomy system for content categorization';
COMMENT ON TABLE content_taxonomy IS 'Links content to taxonomy terms (many-to-many)';
