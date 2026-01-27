// User roles for RBAC
export type UserRole = "Author" | "Editor" | "Approver" | "Publisher" | "Admin";

// Content workflow statuses
export type ContentStatus =
  | "Draft"
  | "InReview"
  | "Approved"
  | "Published"
  | "Unpublished";

// Content item interface
export interface ContentItem {
  id: string;
  content_type_id: string;
  title: string;
  slug: string;
  excerpt?: string;
  hero_image_url?: string;
  page_data?: PageData;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  status: ContentStatus;
  author_id: string;
  department_id?: string;
  publish_at?: string;
  unpublish_at?: string;
  created_at: string;
  updated_at: string;
}

// Page builder data structure
export interface PageData {
  blocks: Block[];
}

export type BlockType =
  | "Hero"
  | "RichText"
  | "CTA"
  | "Cards"
  | "Accordion"
  | "Stats"
  | "ImageGallery"
  | "Embed"
  | "Downloads"
  | "RelatedContent";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

// Workflow interfaces
export interface WorkflowInstance {
  id: string;
  content_id: string;
  current_step: string;
  status: "Active" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_instance_id: string;
  step_name: string;
  assigned_to?: string;
  status: "Pending" | "InProgress" | "Completed" | "Skipped";
  completed_at?: string;
  comments?: string;
}

// Audit log interface
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Media asset interface
export interface MediaAsset {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  url: string;
  alt_text?: string;
  caption?: string;
  uploaded_by: string;
  created_at: string;
}
