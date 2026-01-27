import { z } from "zod";

// Content item validation schema
export const contentItemSchema = z.object({
  content_type_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  hero_image_url: z.string().url().optional(),
  page_data: z
    .object({
      blocks: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          data: z.record(z.unknown()),
        }),
      ),
    })
    .optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  meta_keywords: z.array(z.string()).optional(),
  department_id: z.string().uuid().optional(),
  publish_at: z.string().datetime().optional(),
  unpublish_at: z.string().datetime().optional(),
});

export const contentItemUpdateSchema = contentItemSchema.partial();

// Workflow action schemas
export const workflowSubmitSchema = z.object({
  content_id: z.string().uuid(),
  comments: z.string().optional(),
});

export const workflowActionSchema = z.object({
  workflow_instance_id: z.string().uuid(),
  comments: z.string().optional(),
});

// Media upload schema
export const mediaUploadSchema = z.object({
  filename: z.string().min(1),
  mime_type: z.string(),
  alt_text: z.string().optional(),
  caption: z.string().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
