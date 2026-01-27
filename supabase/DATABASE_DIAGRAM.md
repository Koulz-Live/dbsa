# DBSA CMS Database Schema Diagram

## Entity Relationship Overview

```
┌─────────────────┐
│   auth.users    │
│   (Supabase)    │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐              ┌──────────────────┐
│   user_roles    │              │   departments    │
├─────────────────┤              ├──────────────────┤
│ • user_id       │              │ • id             │
│ • role (enum)   │              │ • name           │
│   - Author      │              │ • slug           │
│   - Editor      │              │ • parent_id (↻)  │
│   - Approver    │              └────────┬─────────┘
│   - Publisher   │                       │
│   - Admin       │                       │
└─────────────────┘                       │
                                          │
                                          ▼
         ┌────────────────────────────────────────────┐
         │                                            │
         ▼                                            ▼
┌──────────────────┐                        ┌──────────────────┐
│  content_types   │                        │  content_items   │
├──────────────────┤                        ├──────────────────┤
│ • id             │◄───────────────────────│ • id             │
│ • name           │  content_type_id       │ • title          │
│ • slug           │                        │ • slug           │
│ • schema (json)  │                        │ • status (enum)  │
└──────────────────┘                        │   - Draft        │
                                            │   - InReview     │
                                            │   - Approved     │
         ┌──────────────────────────────────│   - Published    │
         │                                  │   - Unpublished  │
         │                                  │ • author_id      │
         │                                  │ • department_id  │
         │                                  │ • page_data      │
         │                                  │ • publish_at     │
         │                                  │ • unpublish_at   │
         │                                  └────────┬─────────┘
         │                                           │
         │                                           │
         │         ┌─────────────────────────────────┼────────────────┐
         │         │                                 │                │
         │         ▼                                 ▼                ▼
         │  ┌──────────────────┐         ┌──────────────────┐  ┌────────────────┐
         │  │content_versions  │         │ workflow_        │  │ media_usage    │
         │  ├──────────────────┤         │ instances        │  ├────────────────┤
         │  │ • id             │         ├──────────────────┤  │ • content_id   │
         │  │ • content_id     │         │ • id             │  │ • media_       │
         │  │ • version_number │         │ • content_id     │  │   asset_id     │
         │  │ • title          │         │ • current_step   │  └────────┬───────┘
         │  │ • page_data      │         │ • status (enum)  │           │
         │  │ • status         │         └────────┬─────────┘           │
         │  │ • created_by     │                  │                     │
         │  └──────────────────┘                  │                     │
         │                                        ▼                     ▼
         │                             ┌──────────────────┐  ┌─────────────────┐
         │                             │ workflow_steps   │  │  media_assets   │
         │                             ├──────────────────┤  ├─────────────────┤
         │                             │ • id             │  │ • id            │
         │                             │ • workflow_      │  │ • filename      │
         │                             │   instance_id    │  │ • storage_path  │
         │                             │ • step_name      │  │ • url           │
         │                             │ • assigned_to    │  │ • mime_type     │
         │                             │ • status (enum)  │  │ • uploaded_by   │
         │                             └────────┬─────────┘  └─────────────────┘
         │                                      │
         │                                      ▼
         │                             ┌──────────────────┐
         │                             │ workflow_        │
         │                             │ approvals        │
         │                             ├──────────────────┤
         │                             │ • id             │
         │                             │ • workflow_      │
         │                             │   step_id        │
         │                             │ • approved_by    │
         │                             │ • approved (bool)│
         │                             └──────────────────┘
         │
         │
         ▼
┌──────────────────┐              ┌──────────────────┐
│ content_         │              │  taxonomy_terms  │
│ taxonomy         │◄─────────────├──────────────────┤
├──────────────────┤              │ • id             │
│ • content_id     │              │ • name           │
│ • taxonomy_      │              │ • slug           │
│   term_id        │              │ • type (enum)    │
└──────────────────┘              │   - Category     │
                                  │   - Tag          │
                                  │   - Audience     │
                                  │   - Topic        │
                                  │ • parent_id (↻)  │
                                  └──────────────────┘


┌────────────────────────────────────────────────────────┐
│                    audit_logs                          │
│                  (Immutable Trail)                     │
├────────────────────────────────────────────────────────┤
│ • user_id                                              │
│ • action (CREATE, UPDATE, DELETE, PUBLISH, ...)       │
│ • resource_type                                        │
│ • resource_id                                          │
│ • changes (JSONB)                                      │
│ • metadata (JSONB)                                     │
│ • ip_address                                           │
│ • created_at                                           │
└────────────────────────────────────────────────────────┘
```

## Key Relationships

### Content Hierarchy

```
content_types → content_items → content_versions
                      ↓
                departments
                      ↓
                 auth.users (author)
```

### Workflow

```
content_items → workflow_instances → workflow_steps → workflow_approvals
                                           ↓
                                    auth.users (assigned_to)
```

### Media

```
media_assets ← media_usage → content_items
     ↓
auth.users (uploaded_by)
```

### Taxonomy

```
taxonomy_terms (hierarchical) ← content_taxonomy → content_items
```

### RBAC

```
auth.users → user_roles (many-to-many with roles enum)
```

## Access Control Matrix

| Role      | View | Create | Edit Own | Edit Any | Approve | Publish | Delete | Admin |
| --------- | ---- | ------ | -------- | -------- | ------- | ------- | ------ | ----- |
| Author    | ✅   | ✅     | ✅ Draft | ❌       | ❌      | ❌      | ❌     | ❌    |
| Editor    | ✅   | ✅     | ✅       | ✅       | ❌      | ❌      | ❌     | ❌    |
| Approver  | ✅   | ✅     | ✅       | ✅       | ✅      | ❌      | ❌     | ❌    |
| Publisher | ✅   | ✅     | ✅       | ✅       | ✅      | ✅      | ❌     | ❌    |
| Admin     | ✅   | ✅     | ✅       | ✅       | ✅      | ✅      | ✅     | ✅    |

## Workflow States

```
┌───────┐
│ Draft │◄─┐
└───┬───┘  │
    │      │ (Request Changes)
    ▼      │
┌──────────┴─┐
│  In Review │
└─────┬──────┘
      │
      ▼
┌──────────┐
│ Approved │
└─────┬────┘
      │
      ▼
┌───────────┐      ┌──────────────┐
│ Published │─────►│ Unpublished  │
└───────────┘      └──────────────┘
```

## Data Flow

### Content Creation Flow

```
1. Author creates content_item (status: Draft)
2. Trigger creates content_version (v1)
3. Trigger creates audit_log entry
4. Author submits for review
5. System creates workflow_instance
6. System creates workflow_steps
7. Editor/Approver reviews
8. Approver creates workflow_approval
9. Publisher publishes (status: Published)
10. All changes logged in audit_logs
```

### Media Upload Flow

```
1. User requests signed upload URL (API)
2. User uploads to Supabase Storage
3. System creates media_asset record
4. Content references media via URL
5. Trigger creates media_usage record
6. Audit log created
```
