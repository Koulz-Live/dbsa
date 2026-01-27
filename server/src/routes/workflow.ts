import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import { requireRole } from "../middleware/rbac";
import {
  workflowSubmitSchema,
  workflowActionSchema,
} from "../../../shared/validation";
import { z } from "zod";

const router = Router();

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

// POST /api/workflow/submit - Submit content for review
router.post("/submit", async (req: Request, res: Response) => {
  try {
    const { content_id, comments } = workflowSubmitSchema.parse(req.body);

    // Check if content exists and user has permission
    const { data: content, error: contentError } = await supabase
      .from("content_items")
      .select("*")
      .eq("id", content_id)
      .single();

    if (contentError || !content) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "Content not found",
      });
      return;
    }

    // Check if content is in Draft status
    if (content.status !== "Draft") {
      res.status(400).json({
        code: "INVALID_STATE",
        message: "Content must be in Draft status to submit for review",
      });
      return;
    }

    // Update content status
    await supabase
      .from("content_items")
      .update({ status: "InReview" })
      .eq("id", content_id);

    // Create workflow instance
    const { data: workflow, error: workflowError } = await supabase
      .from("workflow_instances")
      .insert({
        content_id,
        current_step: "review",
        status: "Active",
        initiated_by: req.user!.id,
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    // Create workflow step for review
    await supabase.from("workflow_steps").insert({
      workflow_instance_id: workflow.id,
      step_name: "review",
      status: "Pending",
      comments,
    });

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_action: "SUBMIT",
      p_resource_type: "content_item",
      p_resource_id: content_id,
      p_resource_name: content.title,
      p_metadata: JSON.stringify({ workflow_id: workflow.id }),
    });

    res.json({
      message: "Content submitted for review",
      workflow,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: error.errors,
      });
      return;
    }
    console.error("Error submitting for review:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to submit content for review",
    });
  }
});

// POST /api/workflow/request-changes - Request changes (Editors and above)
router.post(
  "/request-changes",
  requireRole("Editor", "Approver", "Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const { workflow_instance_id, comments } = workflowActionSchema.parse(
        req.body,
      );

      // Get workflow instance
      const { data: workflow, error: workflowError } = await supabase
        .from("workflow_instances")
        .select("*, content_items(*)")
        .eq("id", workflow_instance_id)
        .single();

      if (workflowError || !workflow) {
        res.status(404).json({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
        return;
      }

      // Update content status back to Draft
      await supabase
        .from("content_items")
        .update({ status: "Draft" })
        .eq("id", workflow.content_id);

      // Update workflow instance
      await supabase
        .from("workflow_instances")
        .update({ status: "Cancelled" })
        .eq("id", workflow_instance_id);

      // Add workflow step
      await supabase.from("workflow_steps").insert({
        workflow_instance_id,
        step_name: "request_changes",
        status: "Completed",
        comments,
        completed_by: req.user!.id,
        completed_at: new Date().toISOString(),
      });

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "REJECT",
        p_resource_type: "content_item",
        p_resource_id: workflow.content_id,
        p_resource_name: workflow.content_items.title,
      });

      res.json({ message: "Changes requested successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.errors,
        });
        return;
      }
      console.error("Error requesting changes:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to request changes",
      });
    }
  },
);

// POST /api/workflow/approve - Approve content (Approvers and above)
router.post(
  "/approve",
  requireRole("Approver", "Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const { workflow_instance_id, comments } = workflowActionSchema.parse(
        req.body,
      );

      // Get workflow instance
      const { data: workflow, error: workflowError } = await supabase
        .from("workflow_instances")
        .select("*, content_items(*)")
        .eq("id", workflow_instance_id)
        .single();

      if (workflowError || !workflow) {
        res.status(404).json({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
        return;
      }

      // Update content status to Approved
      await supabase
        .from("content_items")
        .update({ status: "Approved" })
        .eq("id", workflow.content_id);

      // Update workflow instance
      await supabase
        .from("workflow_instances")
        .update({
          current_step: "approved",
          status: "Completed",
        })
        .eq("id", workflow_instance_id);

      // Add workflow step
      await supabase.from("workflow_steps").insert({
        workflow_instance_id,
        step_name: "approve",
        status: "Completed",
        comments,
        completed_by: req.user!.id,
        completed_at: new Date().toISOString(),
      });

      // Create approval record
      await supabase.from("workflow_approvals").insert({
        workflow_step_id: workflow_instance_id,
        approved_by: req.user!.id,
        approved: true,
        comments,
      });

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "APPROVE",
        p_resource_type: "content_item",
        p_resource_id: workflow.content_id,
        p_resource_name: workflow.content_items.title,
      });

      res.json({ message: "Content approved successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.errors,
        });
        return;
      }
      console.error("Error approving content:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to approve content",
      });
    }
  },
);

// POST /api/workflow/publish - Publish content (Publishers and above)
router.post(
  "/publish",
  requireRole("Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const { workflow_instance_id } = workflowActionSchema.parse(req.body);

      // Get workflow instance
      const { data: workflow, error: workflowError } = await supabase
        .from("workflow_instances")
        .select("*, content_items(*)")
        .eq("id", workflow_instance_id)
        .single();

      if (workflowError || !workflow) {
        res.status(404).json({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
        return;
      }

      // Update content status to Published
      await supabase
        .from("content_items")
        .update({
          status: "Published",
          publish_at: new Date().toISOString(),
        })
        .eq("id", workflow.content_id);

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "PUBLISH",
        p_resource_type: "content_item",
        p_resource_id: workflow.content_id,
        p_resource_name: workflow.content_items.title,
      });

      res.json({ message: "Content published successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.errors,
        });
        return;
      }
      console.error("Error publishing content:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to publish content",
      });
    }
  },
);

// POST /api/workflow/schedule - Schedule publishing
router.post(
  "/schedule",
  requireRole("Approver", "Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        content_id: z.string().uuid(),
        publish_at: z.string().datetime(),
        unpublish_at: z.string().datetime().optional(),
      });

      const { content_id, publish_at, unpublish_at } = schema.parse(req.body);

      // Update content with scheduled times
      const { data, error } = await supabase
        .from("content_items")
        .update({
          publish_at,
          unpublish_at,
        })
        .eq("id", content_id)
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "UPDATE",
        p_resource_type: "content_item",
        p_resource_id: content_id,
        p_resource_name: data.title,
        p_metadata: JSON.stringify({ publish_at, unpublish_at }),
      });

      res.json({ message: "Publishing scheduled successfully", data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.errors,
        });
        return;
      }
      console.error("Error scheduling publish:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to schedule publishing",
      });
    }
  },
);

// POST /api/workflow/unpublish - Unpublish content (Publishers and above)
router.post(
  "/unpublish",
  requireRole("Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        content_id: z.string().uuid(),
      });

      const { content_id } = schema.parse(req.body);

      // Get content
      const { data: content, error: contentError } = await supabase
        .from("content_items")
        .select("*")
        .eq("id", content_id)
        .single();

      if (contentError || !content) {
        res.status(404).json({
          code: "NOT_FOUND",
          message: "Content not found",
        });
        return;
      }

      // Update content status to Unpublished
      await supabase
        .from("content_items")
        .update({
          status: "Unpublished",
          unpublish_at: new Date().toISOString(),
        })
        .eq("id", content_id);

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "UNPUBLISH",
        p_resource_type: "content_item",
        p_resource_id: content_id,
        p_resource_name: content.title,
      });

      res.json({ message: "Content unpublished successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.errors,
        });
        return;
      }
      console.error("Error unpublishing content:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to unpublish content",
      });
    }
  },
);

export default router;
