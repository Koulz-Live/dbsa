import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import { requireRole } from "../middleware/rbac";
import {
  mediaUploadSchema,
  paginationSchema,
} from "../../../shared/validation";
import { z } from "zod";

const router = Router();

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

// POST /api/media/upload-url - Get signed upload URL for Supabase Storage
router.post(
  "/upload-url",
  requireRole("Author", "Editor", "Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const { filename, mime_type } = mediaUploadSchema.parse(req.body);

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${filename}`;
      const storagePath = `uploads/${req.user!.id}/${uniqueFilename}`;

      // Create signed upload URL (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from("media")
        .createSignedUploadUrl(storagePath);

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(storagePath);

      res.json({
        upload_url: data.signedUrl,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        token: data.token,
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
      console.error("Error creating upload URL:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to create upload URL",
      });
    }
  },
);

// POST /api/media - Confirm upload and create media asset record
router.post(
  "/",
  requireRole("Author", "Editor", "Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        filename: z.string(),
        original_filename: z.string(),
        mime_type: z.string(),
        storage_path: z.string(),
        url: z.string().url(),
        size_bytes: z.number().int().positive(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        alt_text: z.string().optional(),
        caption: z.string().optional(),
        department_id: z.string().uuid().optional(),
      });

      const validatedData = schema.parse(req.body);

      // Create media asset record
      const { data, error } = await supabase
        .from("media_assets")
        .insert({
          ...validatedData,
          uploaded_by: req.user!.id,
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "UPLOAD",
        p_resource_type: "media_asset",
        p_resource_id: data.id,
        p_resource_name: data.original_filename,
      });

      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid media data",
          details: error.errors,
        });
        return;
      }
      console.error("Error creating media asset:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to create media asset",
      });
    }
  },
);

// GET /api/media - List media assets with pagination and filtering
router.get("/", async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const { mime_type, department_id, search } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from("media_assets")
      .select("*, uploaded_by_user:auth.users(email), departments(name)", {
        count: "exact",
      });

    // Apply filters
    if (mime_type && typeof mime_type === "string") {
      query = query.ilike("mime_type", `${mime_type}%`);
    }
    if (department_id) query = query.eq("department_id", department_id);
    if (search && typeof search === "string") {
      query = query.or(
        `filename.ilike.%${search}%,original_filename.ilike.%${search}%,alt_text.ilike.%${search}%`,
      );
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
    console.error("Error fetching media:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch media",
    });
  }
});

// GET /api/media/:id - Get single media asset
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("media_assets")
      .select(
        "*, uploaded_by_user:auth.users(email), usage:media_usage(content_id, content_items(title))",
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "Media asset not found",
      });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching media asset:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch media asset",
    });
  }
});

// PATCH /api/media/:id - Update media metadata
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      alt_text: z.string().optional(),
      caption: z.string().optional(),
      is_public: z.boolean().optional(),
    });

    const validatedData = schema.parse(req.body);

    const { data, error } = await supabase
      .from("media_assets")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_action: "UPDATE",
      p_resource_type: "media_asset",
      p_resource_id: data.id,
      p_resource_name: data.original_filename,
    });

    res.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid media data",
        details: error.errors,
      });
      return;
    }
    console.error("Error updating media asset:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to update media asset",
    });
  }
});

// DELETE /api/media/:id - Delete media asset (Admins only)
router.delete(
  "/:id",
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Get media asset
      const { data: media, error: fetchError } = await supabase
        .from("media_assets")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !media) {
        res.status(404).json({
          code: "NOT_FOUND",
          message: "Media asset not found",
        });
        return;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([media.storage_path]);

      if (storageError) throw storageError;

      // Delete database record
      const { error: deleteError } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Create audit log
      await supabase.rpc("create_audit_log", {
        p_action: "DELETE",
        p_resource_type: "media_asset",
        p_resource_id: id,
        p_resource_name: media.original_filename,
      });

      res.json({ message: "Media asset deleted successfully" });
    } catch (error) {
      console.error("Error deleting media asset:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to delete media asset",
      });
    }
  },
);

export default router;
