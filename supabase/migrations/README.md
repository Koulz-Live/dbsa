# Supabase Migrations

This directory contains SQL migration files for the DBSA CMS database schema.

## Running Migrations

Migrations should be applied in order using the Supabase CLI or dashboard.

```bash
# Initialize Supabase locally (if not done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Migration Order

Migrations will be created in the following order:

1. `001_roles_and_permissions.sql` - User roles and RBAC setup
2. `002_departments.sql` - Department structure
3. `003_content_types.sql` - Content type definitions
4. `004_content_items.sql` - Main content table with versioning
5. `005_workflow.sql` - Workflow instances and steps
6. `006_media.sql` - Media assets and usage tracking
7. `007_taxonomy.sql` - Categories, tags, audiences
8. `008_audit_logs.sql` - Immutable audit trail
9. `009_rls_policies.sql` - Row-level security policies
10. `010_indexes.sql` - Performance indexes

## Schema Overview

### Core Tables

- `user_roles` - User role assignments (Author, Editor, Approver, Publisher, Admin)
- `departments` - Organizational departments
- `content_types` - Content type definitions (Page, Article, etc.)
- `content_items` - Main content storage (draft state)
- `content_versions` - Content version history
- `workflow_instances` - Active workflow tracking
- `workflow_steps` - Individual workflow step records
- `media_assets` - Media file metadata
- `media_usage` - Track where media is used
- `taxonomy_terms` - Categories, tags, audiences
- `content_taxonomy` - Link content to taxonomy terms
- `audit_logs` - Append-only audit trail

### Security

All tables have RLS enabled with policies based on user roles.

## Creating New Migrations

```bash
# Create a new migration file
supabase migration new migration_name
```

Migration files will be created automatically in this directory.
