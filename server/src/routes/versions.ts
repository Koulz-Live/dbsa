import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import { z } from "zod";

const router = Router();

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

// GET /api/versions - Get version history for content
router.get("/", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      content_id: z.string().uuid(),
      limit: z.coerce.number().int().min(1).max(100).default(50),
    });

    const { content_id, limit } = schema.parse(req.query);

    const { data, error } = await supabase
      .from("content_versions")
      .select("*, created_by_user:auth.users(email)")
      .eq("content_id", content_id)
      .order("version_number", { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ versions: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
        details: error.errors,
      });
      return;
    }
    console.error("Error fetching versions:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch version history",
    });
  }
});

// GET /api/versions/:version_id - Get specific version
router.get("/:version_id", async (req: Request, res: Response) => {
  try {
    const { version_id } = req.params;

    const { data, error } = await supabase
      .from("content_versions")
      .select("*, created_by_user:auth.users(email)")
      .eq("id", version_id)
      .single();

    if (error) throw error;

    if (!data) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "Version not found",
      });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching version:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch version",
    });
  }
});

// POST /api/versions/rollback - Rollback to a previous version
router.post("/rollback", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      content_id: z.string().uuid(),
      version_number: z.number().int().min(1),
    });

    const { content_id, version_number } = schema.parse(req.body);

    // Get the version to rollback to
    const { data: version, error: versionError } = await supabase
      .from("content_versions")
      .select("*")
      .eq("content_id", content_id)
      .eq("version_number", version_number)
      .single();

    if (versionError || !version) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "Version not found",
      });
      return;
    }

    // Check if user can edit this content
    const { data: canEdit } = await supabase.rpc("can_edit_content", {
      check_content_id: content_id,
    });

    if (!canEdit) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "You do not have permission to rollback this content",
      });
      return;
    }

    // Update content_item with version data
    const { data: updatedContent, error: updateError } = await supabase
      .from("content_items")
      .update({
        title: version.title,
        slug: version.slug,
        excerpt: version.excerpt,
        hero_image_url: version.hero_image_url,
        page_data: version.page_data,
        meta_title: version.meta_title,
        meta_description: version.meta_description,
        meta_keywords: version.meta_keywords,
      })
      .eq("id", content_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_action: "UPDATE",
      p_resource_type: "content_item",
      p_resource_id: content_id,
      p_resource_name: updatedContent.title,
      p_metadata: JSON.stringify({
        action: "rollback",
        rolled_back_to_version: version_number,
      }),
    });

    res.json({
      message: `Rolled back to version ${version_number}`,
      data: updatedContent,
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
    console.error("Error rolling back version:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to rollback version",
    });
  }
});

// GET /api/versions/compare - Compare two versions
router.get("/compare", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      version_id_1: z.string().uuid(),
      version_id_2: z.string().uuid(),
    });

    const { version_id_1, version_id_2 } = schema.parse(req.query);

    const [{ data: v1 }, { data: v2 }] = await Promise.all([
      supabase
        .from("content_versions")
        .select("*")
        .eq("id", version_id_1)
        .single(),
      supabase
        .from("content_versions")
        .select("*")
        .eq("id", version_id_2)
        .single(),
    ]);

    if (!v1 || !v2) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "One or both versions not found",
      });
      return;
    }

    res.json({
      version_1: v1,
      version_2: v2,
      differences: {
        title: v1.title !== v2.title,
        slug: v1.slug !== v2.slug,
        excerpt: v1.excerpt !== v2.excerpt,
        hero_image_url: v1.hero_image_url !== v2.hero_image_url,
        page_data:
          JSON.stringify(v1.page_data) !== JSON.stringify(v2.page_data),
        meta_title: v1.meta_title !== v2.meta_title,
        meta_description: v1.meta_description !== v2.meta_description,
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
    console.error("Error comparing versions:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to compare versions",
    });
  }
});

export default router;
