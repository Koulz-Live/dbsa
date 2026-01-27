-- Create departments table for organizational structure
-- Departments help organize content by business units

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_departments_slug ON departments(slug);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_is_active ON departments(is_active);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
-- All authenticated users can view active departments
CREATE POLICY "All authenticated users can view active departments"
  ON departments
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_active = true
  );

-- Admins can manage all departments
CREATE POLICY "Admins can manage departments"
  ON departments
  FOR ALL
  USING (has_role(auth.uid(), 'Admin'));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE departments IS 'Organizational departments for content categorization';
