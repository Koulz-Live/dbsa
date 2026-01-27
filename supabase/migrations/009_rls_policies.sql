-- Additional RLS policies and refinements
-- This migration adds any missing RLS policies and security enhancements

-- Add policy for public access to published content (for headless CMS API)
CREATE POLICY "Public can view published content"
  ON content_items
  FOR SELECT
  USING (
    status = 'Published'
    AND (unpublish_at IS NULL OR unpublish_at > NOW())
    AND (publish_at IS NULL OR publish_at <= NOW())
  );

-- Add policy for public access to published content versions
CREATE POLICY "Public can view published content versions"
  ON content_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = content_versions.content_id
      AND ci.status = 'Published'
      AND (ci.unpublish_at IS NULL OR ci.unpublish_at > NOW())
      AND (ci.publish_at IS NULL OR ci.publish_at <= NOW())
    )
  );

-- Add policy for public taxonomy access
CREATE POLICY "Public can view active taxonomy"
  ON taxonomy_terms
  FOR SELECT
  USING (is_active = true);

-- Add policy for public content taxonomy access
CREATE POLICY "Public can view published content taxonomy"
  ON content_taxonomy
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = content_taxonomy.content_id
      AND ci.status = 'Published'
      AND (ci.unpublish_at IS NULL OR ci.unpublish_at > NOW())
      AND (ci.publish_at IS NULL OR ci.publish_at <= NOW())
    )
  );

-- Add helper function to check content ownership
CREATE OR REPLACE FUNCTION is_content_owner(check_content_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM content_items
    WHERE id = check_content_id
    AND author_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helper function to check if content is editable
CREATE OR REPLACE FUNCTION can_edit_content(check_content_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_content content_items;
BEGIN
  SELECT * INTO v_content
  FROM content_items
  WHERE id = check_content_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Admins can edit anything
  IF has_role(auth.uid(), 'Admin') THEN
    RETURN true;
  END IF;

  -- Editors and Publishers can edit any content
  IF has_any_role(auth.uid(), 'Editor', 'Publisher') THEN
    RETURN true;
  END IF;

  -- Authors can only edit their own Draft content
  IF v_content.author_id = auth.uid() AND v_content.status = 'Draft' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helper function for scheduled publishing
CREATE OR REPLACE FUNCTION process_scheduled_publishing()
RETURNS void AS $$
BEGIN
  -- Publish content that's scheduled for now
  UPDATE content_items
  SET status = 'Published'
  WHERE status = 'Approved'
    AND publish_at IS NOT NULL
    AND publish_at <= NOW()
    AND (unpublish_at IS NULL OR unpublish_at > NOW());

  -- Unpublish content that's scheduled for unpublishing
  UPDATE content_items
  SET status = 'Unpublished'
  WHERE status = 'Published'
    AND unpublish_at IS NOT NULL
    AND unpublish_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get content with full details (for API)
CREATE OR REPLACE FUNCTION get_content_with_details(p_content_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  status content_status,
  author_email VARCHAR,
  department_name VARCHAR,
  content_type_name VARCHAR,
  taxonomy_terms JSONB,
  version_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.title,
    ci.slug,
    ci.status,
    u.email as author_email,
    d.name as department_name,
    ct.name as content_type_name,
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', tt.id,
          'name', tt.name,
          'type', tt.type
        )
      ) FILTER (WHERE tt.id IS NOT NULL),
      '[]'::jsonb
    ) as taxonomy_terms,
    (SELECT COUNT(*) FROM content_versions cv WHERE cv.content_id = ci.id) as version_count
  FROM content_items ci
  LEFT JOIN auth.users u ON u.id = ci.author_id
  LEFT JOIN departments d ON d.id = ci.department_id
  LEFT JOIN content_types ct ON ct.id = ci.content_type_id
  LEFT JOIN content_taxonomy ctx ON ctx.content_id = ci.id
  LEFT JOIN taxonomy_terms tt ON tt.id = ctx.taxonomy_term_id
  WHERE ci.id = p_content_id
  GROUP BY ci.id, u.email, d.name, ct.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_content_owner IS 'Check if current user owns the content';
COMMENT ON FUNCTION can_edit_content IS 'Check if current user can edit the content based on status and role';
COMMENT ON FUNCTION process_scheduled_publishing IS 'Process scheduled publish/unpublish operations (call from cron)';
COMMENT ON FUNCTION get_content_with_details IS 'Get content with related data for API responses';
