import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import { requireRole } from "../middleware/rbac";
import {
  contentItemSchema,
  contentItemUpdateSchema,
  paginationSchema,
} from "../../../shared/validation";
import { z } from "zod";

const router = Router();

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

// GET /api/content - List content items with pagination and filtering
router.get("/", async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const { status, content_type_id, author_id, department_id, search } =
      req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from("content_items")
      .select(
        "*, content_types(name), departments(name), author:auth.users(email)",
        { count: "exact" },
      );

    // Apply filters
    if (status) query = query.eq("status", status);
    if (content_type_id) query = query.eq("content_type_id", content_type_id);
    if (author_id) query = query.eq("author_id", author_id);
    if (department_id) query = query.eq("department_id", department_id);

    // Search in title and excerpt
    if (search && typeof search === "string") {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
        details: error.errors,
      });
      return;
    }
    console.error("Error fetching content:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch content",
    });
  }
});

// GET /api/content/:id - Get single content item by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .rpc("get_content_with_details", { p_content_id: id })
      .single();

    if (error) throw error;

    if (!data) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "Content not found",
      });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch content",
    });
  }
});

// POST /api/content - Create new content (Authors and above)
router.post(
  "/",
  requireRole("Author", "Editor", "Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const validatedData = contentItemSchema.parse(req.body);

      const { data, error } = await supabase
        .from("content_items")
        .insert({
          ...validatedData,
          author_id: req.user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "CREATE",
        p_resource_type: "content_item",
        p_resource_id: data.id,
        p_resource_name: data.title,
      });

      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid content data",
          details: error.errors,
        });
        return;
      }
      console.error("Error creating content:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to create content",
      });
    }
  },
);

// PATCH /api/content/:id - Update content
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = contentItemUpdateSchema.parse(req.body);

    // Check if user can edit this content
    const { data: canEdit } = await supabase.rpc("can_edit_content", {
      check_content_id: id,
    });

    if (!canEdit) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "You do not have permission to edit this content",
      });
      return;
    }

    const { data, error } = await supabase
      .from("content_items")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_action: "UPDATE",
      p_resource_type: "content_item",
      p_resource_id: data.id,
      p_resource_name: data.title,
    });

    res.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid content data",
        details: error.errors,
      });
      return;
    }
    console.error("Error updating content:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to update content",
    });
  }
});

// DELETE /api/content/:id - Delete content (Admins only)
router.delete(
  "/:id",
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("content_items")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "DELETE",
        p_resource_type: "content_item",
        p_resource_id: id,
        p_resource_name: data.title,
      });

      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to delete content",
      });
    }
  },
);

export default router;
