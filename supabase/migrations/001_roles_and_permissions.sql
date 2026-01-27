-- Create user roles and permissions system
-- This migration establishes the RBAC foundation for the CMS

-- Create roles enum
CREATE TYPE user_role AS ENUM ('Author', 'Editor', 'Approver', 'Publisher', 'Admin');

-- Create user_roles table to assign roles to users
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Create index for faster role lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
-- Admins can manage all roles
CREATE POLICY "Admins can manage all user roles"
  ON user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'Admin'
    )
  );

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Create helper function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(check_user_id UUID, check_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = check_user_id
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get all user roles
CREATE OR REPLACE FUNCTION get_user_roles(check_user_id UUID)
RETURNS SETOF user_role AS $$
BEGIN
  RETURN QUERY
  SELECT role
  FROM user_roles
  WHERE user_id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION has_any_role(check_user_id UUID, VARIADIC check_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = check_user_id
    AND role = ANY(check_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE user_roles IS 'Stores user role assignments for RBAC';
COMMENT ON FUNCTION has_role IS 'Check if a user has a specific role';
COMMENT ON FUNCTION get_user_roles IS 'Get all roles assigned to a user';
COMMENT ON FUNCTION has_any_role IS 'Check if a user has any of the specified roles';
