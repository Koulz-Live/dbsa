-- Create workflow tables for content approval process
-- Tracks the workflow state and approval steps

-- Workflow status enum
CREATE TYPE workflow_status AS ENUM ('Active', 'Completed', 'Cancelled');

-- Workflow step status enum
CREATE TYPE workflow_step_status AS ENUM ('Pending', 'InProgress', 'Completed', 'Skipped');

-- Workflow instances table
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  current_step VARCHAR(100) NOT NULL,
  status workflow_status NOT NULL DEFAULT 'Active',
  initiated_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Workflow steps table
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  status workflow_step_status NOT NULL DEFAULT 'Pending',
  comments TEXT,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow approvals table (tracks individual approvals)
CREATE TABLE workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  approved BOOLEAN NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_workflow_instances_content ON workflow_instances(content_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_created_at ON workflow_instances(created_at DESC);

CREATE INDEX idx_workflow_steps_instance ON workflow_steps(workflow_instance_id);
CREATE INDEX idx_workflow_steps_assigned_to ON workflow_steps(assigned_to);
CREATE INDEX idx_workflow_steps_status ON workflow_steps(status);

CREATE INDEX idx_workflow_approvals_step ON workflow_approvals(workflow_step_id);
CREATE INDEX idx_workflow_approvals_approved_by ON workflow_approvals(approved_by);

-- Enable RLS
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_instances

-- Users can view workflows for content they can access
CREATE POLICY "Users can view accessible workflows"
  ON workflow_instances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = workflow_instances.content_id
      AND (
        ci.author_id = auth.uid()
        OR has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin')
      )
    )
  );

-- Authors and above can create workflows
CREATE POLICY "Authors can create workflows"
  ON workflow_instances
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), 'Author', 'Editor', 'Approver', 'Publisher', 'Admin')
    AND initiated_by = auth.uid()
  );

-- Editors and above can update workflows
CREATE POLICY "Editors can update workflows"
  ON workflow_instances
  FOR UPDATE
  USING (has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin'));

-- RLS Policies for workflow_steps

-- Users can view steps for workflows they can access
CREATE POLICY "Users can view accessible workflow steps"
  ON workflow_steps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflow_instances wi
      JOIN content_items ci ON ci.id = wi.content_id
      WHERE wi.id = workflow_steps.workflow_instance_id
      AND (
        ci.author_id = auth.uid()
        OR assigned_to = auth.uid()
        OR has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin')
      )
    )
  );

-- System and editors can create steps
CREATE POLICY "System can create workflow steps"
  ON workflow_steps
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin')
  );

-- Assigned users and editors can update steps
CREATE POLICY "Assigned users can update workflow steps"
  ON workflow_steps
  FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin')
  );

-- RLS Policies for workflow_approvals

-- Users can view approvals for steps they can access
CREATE POLICY "Users can view accessible approvals"
  ON workflow_approvals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflow_steps ws
      JOIN workflow_instances wi ON wi.id = ws.workflow_instance_id
      JOIN content_items ci ON ci.id = wi.content_id
      WHERE ws.id = workflow_approvals.workflow_step_id
      AND (
        ci.author_id = auth.uid()
        OR ws.assigned_to = auth.uid()
        OR has_any_role(auth.uid(), 'Editor', 'Approver', 'Publisher', 'Admin')
      )
    )
  );

-- Approvers can create approvals
CREATE POLICY "Approvers can create approvals"
  ON workflow_approvals
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), 'Approver', 'Publisher', 'Admin')
    AND approved_by = auth.uid()
  );

-- Create updated_at trigger for workflow_instances
CREATE TRIGGER update_workflow_instances_updated_at
  BEFORE UPDATE ON workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE workflow_instances IS 'Tracks content approval workflow instances';
COMMENT ON TABLE workflow_steps IS 'Individual steps in a workflow with assignments';
COMMENT ON TABLE workflow_approvals IS 'Approval decisions made in workflow steps';
