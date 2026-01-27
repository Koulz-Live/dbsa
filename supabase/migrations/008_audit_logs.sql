-- Create audit log table for comprehensive activity tracking
-- This table is append-only and immutable for compliance

-- Audit action enum
CREATE TYPE audit_action AS ENUM (
  'CREATE',
  'UPDATE',
  'DELETE',
  'PUBLISH',
  'UNPUBLISH',
  'APPROVE',
  'REJECT',
  'SUBMIT',
  'LOGIN',
  'LOGOUT',
  'UPLOAD',
  'DOWNLOAD',
  'VIEW'
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255), -- Denormalized for audit trail
  action audit_action NOT NULL,
  resource_type VARCHAR(100) NOT NULL, -- e.g., 'content_item', 'media_asset'
  resource_id UUID, -- ID of the affected resource
  resource_name VARCHAR(500), -- Human-readable name
  changes JSONB, -- Before/after values for updates
  metadata JSONB, -- Additional context (IP, user agent, etc.)
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100), -- Link to request logs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_request_id ON audit_logs(request_id);

-- Enable RLS (read-only for most users)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'Admin'));

-- Publishers can view audit logs for their actions
CREATE POLICY "Publishers can view own audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    has_any_role(auth.uid(), 'Publisher', 'Admin')
    AND user_id = auth.uid()
  );

-- System can insert audit logs (no user UPDATE or DELETE allowed)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action audit_action,
  p_resource_type VARCHAR,
  p_resource_id UUID,
  p_resource_name VARCHAR DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_user_email VARCHAR;
BEGIN
  -- Get user email for denormalization
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    resource_name,
    changes,
    metadata
  ) VALUES (
    auth.uid(),
    v_user_email,
    p_action,
    p_resource_type,
    p_resource_id,
    p_resource_name,
    p_changes,
    p_metadata
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic audit logging on content changes
CREATE OR REPLACE FUNCTION audit_content_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action audit_action;
  v_changes JSONB;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'CREATE';
    v_changes := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_changes := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_changes := to_jsonb(OLD);
  END IF;

  -- Create audit log
  PERFORM create_audit_log(
    v_action,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.title, OLD.title),
    v_changes,
    jsonb_build_object('trigger', TG_NAME)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_content_items_changes
  AFTER INSERT OR UPDATE OR DELETE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION audit_content_changes();

CREATE TRIGGER audit_media_assets_changes
  AFTER INSERT OR UPDATE OR DELETE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION audit_content_changes();

CREATE TRIGGER audit_workflow_instances_changes
  AFTER INSERT OR UPDATE ON workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION audit_content_changes();

-- Prevent updates and deletes on audit_logs (immutable)
CREATE OR REPLACE FUNCTION prevent_audit_log_modifications()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_updates
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modifications();

CREATE TRIGGER prevent_audit_log_deletes
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modifications();

COMMENT ON TABLE audit_logs IS 'Immutable append-only audit trail for all system activities';
COMMENT ON FUNCTION create_audit_log IS 'Helper function to create audit log entries';
