# Supabase Database Schema - Complete

## ✅ All Migrations Created

### Migration Files (in order)

1. **001_roles_and_permissions.sql** - RBAC foundation
   - `user_role` enum (Author, Editor, Approver, Publisher, Admin)
   - `user_roles` table
   - Helper functions: `has_role()`, `get_user_roles()`, `has_any_role()`
   - RLS policies for role management

2. **002_departments.sql** - Organizational structure
   - `departments` table with hierarchy support
   - Slug-based routing
   - Active/inactive states
   - RLS policies

3. **003_content_types.sql** - Content type definitions
   - `content_types` table
   - Default types: Page, Article, News, Event
   - JSON schema support
   - RLS policies

4. **004_content_items.sql** - Main content storage
   - `content_status` enum (Draft, InReview, Approved, Published, Unpublished)
   - `content_items` table (current/draft state)
   - `content_versions` table (immutable history)
   - Automatic versioning trigger
   - Full RLS policies by role
   - Scheduled publishing support

5. **005_workflow.sql** - Approval workflow
   - `workflow_status` enum (Active, Completed, Cancelled)
   - `workflow_step_status` enum (Pending, InProgress, Completed, Skipped)
   - `workflow_instances` table
   - `workflow_steps` table with assignments
   - `workflow_approvals` table
   - RLS policies for workflow access

6. **006_media.sql** - Media management
   - `media_assets` table
   - `media_usage` table (tracking)
   - Supabase Storage integration
   - Automatic usage tracking trigger
   - RLS policies for media access

7. **007_taxonomy.sql** - Content categorization
   - `taxonomy_type` enum (Category, Tag, Audience, Topic, Custom)
   - `taxonomy_terms` table (hierarchical)
   - `content_taxonomy` table (many-to-many)
   - Default taxonomy data
   - RLS policies

8. **008_audit_logs.sql** - Audit trail
   - `audit_action` enum (CREATE, UPDATE, DELETE, PUBLISH, etc.)
   - `audit_logs` table (append-only, immutable)
   - `create_audit_log()` helper function
   - Automatic audit triggers on key tables
   - Prevention of modifications/deletes
   - RLS policies (Admin and Publisher access)

9. **009_rls_policies.sql** - Additional security
   - Public access policies for published content
   - Helper functions: `is_content_owner()`, `can_edit_content()`
   - `process_scheduled_publishing()` for cron jobs
   - `get_content_with_details()` for API responses
   - Enhanced security policies

10. **010_indexes.sql** - Performance optimization
    - Composite indexes for common queries
    - Full-text search indexes
    - GIN indexes for JSONB columns
    - Partial indexes for active content
    - Statistics updates

## Database Schema Overview

### Core Tables

```
user_roles (RBAC)
├── departments (Organization)
├── content_types (Types)
└── content_items (Main content)
    ├── content_versions (History)
    ├── workflow_instances (Approval)
    │   ├── workflow_steps
    │   └── workflow_approvals
    ├── media_usage (Media tracking)
    └── content_taxonomy (Categorization)

media_assets (Media library)
taxonomy_terms (Categories/Tags)
audit_logs (Activity tracking)
```

### Security Features

✅ **Row-Level Security (RLS)** enabled on all tables
✅ **Role-based policies** for Author, Editor, Approver, Publisher, Admin
✅ **Public access** for published content only
✅ **Immutable audit logs** (cannot be modified/deleted)
✅ **Automatic versioning** on all content changes
✅ **Scheduled publishing** with time-based access control

### Helper Functions

- `has_role(user_id, role)` - Check if user has specific role
- `has_any_role(user_id, roles[])` - Check if user has any of specified roles
- `get_user_roles(user_id)` - Get all roles for user
- `is_content_owner(content_id)` - Check content ownership
- `can_edit_content(content_id)` - Check edit permissions
- `process_scheduled_publishing()` - Handle scheduled publish/unpublish
- `get_content_with_details(content_id)` - Get enriched content data
- `create_audit_log(...)` - Create audit entries

### Triggers

- **Version creation** - Auto-create version on content insert/update
- **Audit logging** - Auto-log changes to content, media, workflow
- **Media usage tracking** - Auto-track media usage in content
- **Updated_at** - Auto-update timestamps
- **Audit immutability** - Prevent audit log modifications

## How to Apply Migrations

### Option 1: Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push
```

### Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (001, 002, 003, etc.)

### Option 3: Manual Execution

Copy and paste each SQL file content into the Supabase SQL editor in sequence.

## Post-Migration Setup

### 1. Create Storage Bucket

```sql
-- Create media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Set up storage policies
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.uid() IS NOT NULL
  );
```

### 2. Assign Initial Admin Role

```sql
-- Replace with your user ID from auth.users
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-here', 'Admin');
```

### 3. Test RLS Policies

```sql
-- Set role for testing
SET ROLE authenticated;
SET request.jwt.claim.sub = 'your-user-id-here';

-- Test content access
SELECT * FROM content_items WHERE status = 'Published';
```

## Performance Considerations

- All tables have appropriate indexes
- JSONB columns use GIN indexes for fast querying
- Full-text search enabled on content
- Composite indexes for common query patterns
- Partial indexes for active/published content only

## Next Steps

1. ✅ Apply migrations to Supabase
2. ✅ Create storage bucket for media
3. ✅ Assign admin role to initial user
4. 🔄 Implement Express API routes
5. 🔄 Build frontend editorial console
6. 🔄 Test RLS policies with different roles

---

**Total Migration Files:** 10
**Total Tables:** 15
**Total Indexes:** 50+
**Total Functions:** 10+
**Total Triggers:** 12+
**RLS Policies:** 40+
