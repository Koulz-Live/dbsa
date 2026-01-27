-- Create performance indexes for optimal query performance
-- This migration adds indexes for common query patterns

-- Content items indexes (additional performance indexes)
CREATE INDEX idx_content_items_status_created ON content_items(status, created_at DESC);
CREATE INDEX idx_content_items_author_status ON content_items(author_id, status);
CREATE INDEX idx_content_items_type_status ON content_items(content_type_id, status);
CREATE INDEX idx_content_items_full_text ON content_items USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

-- Composite index for published content queries
CREATE INDEX idx_content_items_published_filtering ON content_items(status, publish_at, unpublish_at) 
WHERE status = 'Published';

-- Index for scheduled content
CREATE INDEX idx_content_items_scheduled_publish ON content_items(publish_at)
WHERE status = 'Approved' AND publish_at IS NOT NULL;

CREATE INDEX idx_content_items_scheduled_unpublish ON content_items(unpublish_at)
WHERE status = 'Published' AND unpublish_at IS NOT NULL;

-- Workflow indexes for assignment queries
CREATE INDEX idx_workflow_steps_assigned_status ON workflow_steps(assigned_to, status);
CREATE INDEX idx_workflow_instances_content_status ON workflow_instances(content_id, status);

-- Taxonomy indexes for filtering
CREATE INDEX idx_taxonomy_terms_type_active ON taxonomy_terms(type, is_active);
CREATE INDEX idx_content_taxonomy_composite ON content_taxonomy(content_id, taxonomy_term_id);

-- Media indexes for search and filtering
CREATE INDEX idx_media_assets_type_uploaded ON media_assets(mime_type, created_at DESC);
CREATE INDEX idx_media_assets_department_created ON media_assets(department_id, created_at DESC)
WHERE department_id IS NOT NULL;

-- Partial index for active media only
CREATE INDEX idx_media_assets_active ON media_assets(created_at DESC)
WHERE uploaded_by IS NOT NULL;

-- Audit log indexes for reporting
CREATE INDEX idx_audit_logs_user_action_date ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_resource_date ON audit_logs(resource_type, resource_id, created_at DESC);

-- User roles composite index
CREATE INDEX idx_user_roles_user_role_composite ON user_roles(user_id, role);

-- Version history index for rollback queries
CREATE INDEX idx_content_versions_content_version ON content_versions(content_id, version_number DESC);

-- Department hierarchy index
CREATE INDEX idx_departments_parent_active ON departments(parent_id, is_active);

-- Content type active index
CREATE INDEX idx_content_types_active_sort ON content_types(is_active, name);

-- Create GIN index for JSONB columns (page_data search)
CREATE INDEX idx_content_items_page_data ON content_items USING gin(page_data);
CREATE INDEX idx_content_versions_page_data ON content_versions USING gin(page_data);
CREATE INDEX idx_media_assets_metadata ON media_assets USING gin(metadata);
CREATE INDEX idx_audit_logs_changes ON audit_logs USING gin(changes);
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING gin(metadata);

-- Create statistics for query planner optimization
ANALYZE content_items;
ANALYZE content_versions;
ANALYZE workflow_instances;
ANALYZE workflow_steps;
ANALYZE media_assets;
ANALYZE taxonomy_terms;
ANALYZE content_taxonomy;
ANALYZE audit_logs;
ANALYZE user_roles;

COMMENT ON INDEX idx_content_items_full_text IS 'Full-text search index for content title and excerpt';
COMMENT ON INDEX idx_content_items_published_filtering IS 'Optimizes published content queries with date filtering';
COMMENT ON INDEX idx_content_items_page_data IS 'Enables fast JSONB queries on page builder data';
