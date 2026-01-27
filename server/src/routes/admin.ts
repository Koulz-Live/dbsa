import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import { requireRole } from "../middleware/rbac";
import { z } from "zod";

const router = Router();

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

// All routes require Admin role
router.use(requireRole("Admin"));

// GET /api/admin/users - List all users
router.get("/users", async (req: Request, res: Response) => {
  try {
    // Get users from Supabase Auth
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    // Get role assignments for all users
    const { data: roles } = await supabase.from("user_roles").select("*");

    // Combine user data with roles
    const usersWithRoles = users.map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      roles:
        roles?.filter((r) => r.user_id === user.id).map((r) => r.role) || [],
    }));

    res.json({ users: usersWithRoles });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch users",
    });
  }
});

// GET /api/admin/users/:id - Get single user with roles
router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(id);

    if (error) throw error;

    if (!user) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "User not found",
      });
      return;
    }

    // Get user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", id);

    res.json({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      roles: roles?.map((r) => r.role) || [],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch user",
    });
  }
});

// POST /api/admin/users/:id/roles - Assign role to user
router.post("/users/:id/roles", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      role: z.enum(["Author", "Editor", "Approver", "Publisher", "Admin"]),
    });

    const { role } = schema.parse(req.body);

    // Check if user exists
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(id);

    if (userError || !user) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "User not found",
      });
      return;
    }

    // Assign role
    const { data, error } = await supabase
      .from("user_roles")
      .insert({
        user_id: id,
        role,
        created_by: req.user!.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        res.status(409).json({
          code: "CONFLICT",
          message: "User already has this role",
        });
        return;
      }
      throw error;
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_action: "CREATE",
      p_resource_type: "user_role",
      p_resource_id: data.id,
      p_resource_name: `${user.email} - ${role}`,
    });

    res.status(201).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid role",
        details: error.errors,
      });
      return;
    }
    console.error("Error assigning role:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to assign role",
    });
  }
});

// DELETE /api/admin/users/:id/roles/:role - Remove role from user
router.delete("/users/:id/roles/:role", async (req: Request, res: Response) => {
  try {
    const { id, role } = req.params;

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", id)
      .eq("role", role);

    if (error) throw error;

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_action: "DELETE",
      p_resource_type: "user_role",
      p_resource_id: id,
      p_resource_name: `${id} - ${role}`,
    });

    res.json({ message: "Role removed successfully" });
  } catch (error) {
    console.error("Error removing role:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to remove role",
    });
  }
});

// GET /api/admin/stats - Get system statistics
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const [
      { count: totalUsers },
      { count: totalContent },
      { count: publishedContent },
      { count: draftContent },
      { count: totalMedia },
    ] = await Promise.all([
      supabase.from("user_roles").select("*", { count: "exact", head: true }),
      supabase
        .from("content_items")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("content_items")
        .select("*", { count: "exact", head: true })
        .eq("status", "Published"),
      supabase
        .from("content_items")
        .select("*", { count: "exact", head: true })
        .eq("status", "Draft"),
      supabase.from("media_assets").select("*", { count: "exact", head: true }),
    ]);

    res.json({
      users: totalUsers || 0,
      content: {
        total: totalContent || 0,
        published: publishedContent || 0,
        draft: draftContent || 0,
      },
      media: totalMedia || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch statistics",
    });
  }
});

// POST /api/admin/scheduled-publish - Manual trigger for scheduled publishing
router.post("/scheduled-publish", async (req: Request, res: Response) => {
  try {
    // Call the database function to process scheduled content
    const { error } = await supabase.rpc("process_scheduled_publishing");

    if (error) throw error;

    res.json({ message: "Scheduled publishing processed successfully" });
  } catch (error) {
    console.error("Error processing scheduled publish:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to process scheduled publishing",
    });
  }
});

export default router;
