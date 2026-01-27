import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import { requireRole } from "../middleware/rbac";
import { paginationSchema } from "../../../shared/validation";
import { z } from "zod";

const router = Router();

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

// GET /api/audit - Get audit logs with filtering (Publishers and Admins)
router.get(
  "/",
  requireRole("Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const {
        user_id,
        action,
        resource_type,
        resource_id,
        start_date,
        end_date,
      } = req.query;

      const offset = (page - 1) * limit;

      let query = supabase.from("audit_logs").select("*", { count: "exact" });

      // Apply filters
      if (user_id) query = query.eq("user_id", user_id);
      if (action) query = query.eq("action", action);
      if (resource_type) query = query.eq("resource_type", resource_type);
      if (resource_id) query = query.eq("resource_id", resource_id);
      if (start_date && typeof start_date === "string") {
        query = query.gte("created_at", start_date);
      }
      if (end_date && typeof end_date === "string") {
        query = query.lte("created_at", end_date);
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
      console.error("Error fetching audit logs:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to fetch audit logs",
      });
    }
  },
);

// GET /api/audit/:id - Get single audit log entry
router.get(
  "/:id",
  requireRole("Publisher", "Admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        res.status(404).json({
          code: "NOT_FOUND",
          message: "Audit log not found",
        });
        return;
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to fetch audit log",
      });
    }
  },
);

// GET /api/audit/export - Export audit logs (Admins only)
router.get(
  "/export",
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        format: z.enum(["csv", "json"]).default("json"),
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional(),
        action: z.string().optional(),
      });

      const { format, start_date, end_date, action } = schema.parse(req.query);

      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10000); // Max 10k records for export

      // Apply filters
      if (start_date) query = query.gte("created_at", start_date);
      if (end_date) query = query.lte("created_at", end_date);
      if (action) query = query.eq("action", action);

      const { data, error } = await query;

      if (error) throw error;

      if (format === "csv") {
        // Convert to CSV
        if (!data || data.length === 0) {
          res.status(200).send("");
          return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(",")];

        for (const row of data) {
          const values = headers.map((header) => {
            const value = row[header as keyof typeof row];
            // Escape quotes and wrap in quotes if contains comma
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value === null || value === undefined ? "" : String(value);
          });
          csvRows.push(values.join(","));
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=audit-logs-${Date.now()}.csv`,
        );
        res.send(csvRows.join("\n"));
      } else {
        // JSON format
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=audit-logs-${Date.now()}.json`,
        );
        res.json({
          exported_at: new Date().toISOString(),
          count: data?.length || 0,
          data,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: error.errors,
        });
        return;
      }
      console.error("Error exporting audit logs:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to export audit logs",
      });
    }
  },
);

// GET /api/audit/stats - Get audit statistics (Admins only)
router.get(
  "/stats",
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional(),
      });

      const { start_date, end_date } = schema.parse(req.query);

      // Get action counts
      let query = supabase.from("audit_logs").select("action");

      if (start_date) query = query.gte("created_at", start_date);
      if (end_date) query = query.lte("created_at", end_date);

      const { data, error } = await query;

      if (error) throw error;

      // Count actions
      const actionCounts: Record<string, number> = {};
      data?.forEach((log) => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      res.json({
        total_logs: data?.length || 0,
        action_counts: actionCounts,
        period: {
          start: start_date || "all",
          end: end_date || "all",
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
      console.error("Error fetching audit stats:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to fetch audit statistics",
      });
    }
  },
);

export default router;
