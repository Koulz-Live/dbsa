# DBSA CMS Backend API Reference

Complete REST API specification for the DBSA CMS headless backend.

---

## Base URL

```
http://localhost:3001/api
```

## Authentication

All endpoints (except `/health`) require a valid Supabase JWT in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Validation Error
- `401` - Unauthorized (invalid/missing JWT)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate slug)
- `500` - Internal Server Error

## Error Response Format

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {} // Optional additional context
}
```

---

## Health Check

### GET /health

**Auth:** None required

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Content Management

### GET /api/content

List content items with filtering and pagination.

**Auth:** Any authenticated user  
**Roles:** All

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `search` (string, optional) - Search in title, slug, excerpt
- `status` (string, optional) - Filter by status (Draft, In Review, Approved, Published)
- `content_type_id` (uuid, optional) - Filter by content type
- `department_id` (uuid, optional) - Filter by department
- `author_id` (uuid, optional) - Filter by author
- `start_date` (ISO datetime, optional) - Filter by created_at >= start_date
- `end_date` (ISO datetime, optional) - Filter by created_at <= end_date

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Content Title",
      "slug": "content-slug",
      "status": "Published",
      "content_type_id": "uuid",
      "department_id": "uuid",
      "author_id": "uuid",
      "metadata": {},
      "page_builder_data": {},
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "publish_at": null,
      "unpublish_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### GET /api/content/:id

Get single content item by ID.

**Auth:** Required  
**Roles:** All

**Response:**

```json
{
  "id": "uuid",
  "title": "Content Title",
  "slug": "content-slug",
  "excerpt": "Brief description",
  "content_type_id": "uuid",
  "department_id": "uuid",
  "author_id": "uuid",
  "status": "Published",
  "metadata": {
    "seo_title": "SEO Title",
    "seo_description": "SEO Description",
    "hero_image": "image-url"
  },
  "page_builder_data": {
    "blocks": []
  },
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /api/content

Create new content item.

**Auth:** Required  
**Roles:** Author, Editor, Approver, Publisher, Admin

**Request Body:**

```json
{
  "title": "Content Title",
  "slug": "content-slug",
  "excerpt": "Brief description",
  "content_type_id": "uuid",
  "department_id": "uuid",
  "metadata": {
    "seo_title": "SEO Title",
    "seo_description": "SEO Description"
  },
  "page_builder_data": {
    "blocks": []
  }
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "title": "Content Title",
  "slug": "content-slug",
  "status": "Draft",
  "author_id": "uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH /api/content/:id

Update content item (creates new version automatically).

**Auth:** Required  
**Roles:** Author (own content), Editor, Approver, Publisher, Admin

**Request Body:**

```json
{
  "title": "Updated Title",
  "excerpt": "Updated excerpt",
  "metadata": {
    "seo_title": "New SEO Title"
  },
  "page_builder_data": {
    "blocks": []
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Updated Title",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "version_number": 2
}
```

---

### DELETE /api/content/:id

Soft delete content item (sets deleted_at timestamp).

**Auth:** Required  
**Roles:** Author (own content), Editor, Approver, Publisher, Admin

**Response:**

```json
{
  "message": "Content deleted successfully"
}
```

---

## Workflow Management

### POST /api/workflow/submit

Submit content for review (Draft → In Review).

**Auth:** Required  
**Roles:** Author, Editor, Approver, Publisher, Admin

**Request Body:**

```json
{
  "content_id": "uuid"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "content_id": "uuid",
  "status": "In Review",
  "current_step": "review",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /api/workflow/request-changes

Request changes to content (In Review → Draft).

**Auth:** Required  
**Roles:** Editor, Approver, Publisher, Admin

**Request Body:**

```json
{
  "content_id": "uuid",
  "comments": "Please update the title and add more images"
}
```

**Response:**

```json
{
  "message": "Changes requested successfully",
  "workflow_id": "uuid",
  "status": "Draft"
}
```

---

### POST /api/workflow/approve

Approve content (In Review → Approved).

**Auth:** Required  
**Roles:** Approver, Publisher, Admin

**Request Body:**

```json
{
  "content_id": "uuid",
  "comments": "Looks good!"
}
```

**Response:**

```json
{
  "message": "Content approved successfully",
  "workflow_id": "uuid",
  "status": "Approved"
}
```

---

### POST /api/workflow/publish

Publish content immediately (Approved → Published).

**Auth:** Required  
**Roles:** Publisher, Admin

**Request Body:**

```json
{
  "content_id": "uuid"
}
```

**Response:**

```json
{
  "message": "Content published successfully",
  "content_id": "uuid",
  "status": "Published",
  "published_at": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /api/workflow/schedule

Schedule content to publish/unpublish at specific times.

**Auth:** Required  
**Roles:** Publisher, Admin

**Request Body:**

```json
{
  "content_id": "uuid",
  "publish_at": "2024-12-31T23:59:59.000Z",
  "unpublish_at": "2025-01-31T23:59:59.000Z" // Optional
}
```

**Response:**

```json
{
  "message": "Content scheduled successfully",
  "content_id": "uuid",
  "publish_at": "2024-12-31T23:59:59.000Z",
  "unpublish_at": "2025-01-31T23:59:59.000Z"
}
```

---

### POST /api/workflow/unpublish

Unpublish content (Published → Approved).

**Auth:** Required  
**Roles:** Publisher, Admin

**Request Body:**

```json
{
  "content_id": "uuid"
}
```

**Response:**

```json
{
  "message": "Content unpublished successfully",
  "content_id": "uuid",
  "status": "Approved"
}
```

---

## Version Management

### GET /api/versions

List version history for content.

**Auth:** Required  
**Roles:** All

**Query Parameters:**

- `content_id` (uuid, required) - Content item ID
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "content_id": "uuid",
      "version_number": 3,
      "title": "Content Title v3",
      "data": {},
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### GET /api/versions/:id

Get specific version.

**Auth:** Required  
**Roles:** All

**Response:**

```json
{
  "id": "uuid",
  "content_id": "uuid",
  "version_number": 2,
  "title": "Content Title v2",
  "data": {
    "title": "Content Title v2",
    "excerpt": "...",
    "metadata": {},
    "page_builder_data": {}
  },
  "created_by": "uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /api/versions/rollback

Rollback content to previous version.

**Auth:** Required  
**Roles:** Editor, Approver, Publisher, Admin

**Request Body:**

```json
{
  "content_id": "uuid",
  "version_id": "uuid"
}
```

**Response:**

```json
{
  "message": "Content rolled back successfully",
  "content_id": "uuid",
  "new_version_number": 4,
  "rolled_back_to_version": 2
}
```

---

### GET /api/versions/compare

Compare two versions.

**Auth:** Required  
**Roles:** All

**Query Parameters:**

- `version1_id` (uuid, required)
- `version2_id` (uuid, required)

**Response:**

```json
{
  "version1": {
    "id": "uuid",
    "version_number": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "version2": {
    "id": "uuid",
    "version_number": 2,
    "created_at": "2024-01-02T00:00:00.000Z"
  },
  "differences": {
    "title": {
      "old": "Old Title",
      "new": "New Title"
    },
    "excerpt": {
      "old": "Old excerpt",
      "new": "New excerpt"
    }
  }
}
```

---

## Media Management

### POST /api/media/upload-url

Get signed upload URL for Supabase Storage.

**Auth:** Required  
**Roles:** All

**Request Body:**

```json
{
  "file_name": "image.jpg",
  "content_type": "image/jpeg"
}
```

**Response:**

```json
{
  "upload_url": "https://...",
  "file_path": "uploads/uuid/image.jpg",
  "expires_in": 3600
}
```

**Usage:**

1. Call this endpoint to get signed URL
2. Upload file directly to Supabase Storage using the URL
3. Call `POST /api/media` to create database record

---

### POST /api/media

Create media asset record after upload.

**Auth:** Required  
**Roles:** All

**Request Body:**

```json
{
  "file_name": "image.jpg",
  "file_path": "uploads/uuid/image.jpg",
  "file_size": 1024000,
  "mime_type": "image/jpeg",
  "alt_text": "Description of image",
  "caption": "Image caption",
  "credits": "Photo by John Doe"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "file_name": "image.jpg",
  "file_path": "uploads/uuid/image.jpg",
  "public_url": "https://...",
  "uploaded_by": "uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/media

List media assets.

**Auth:** Required  
**Roles:** All

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional) - Search in file_name, alt_text
- `mime_type` (string, optional) - Filter by MIME type

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "file_name": "image.jpg",
      "file_path": "uploads/uuid/image.jpg",
      "public_url": "https://...",
      "mime_type": "image/jpeg",
      "file_size": 1024000,
      "alt_text": "Description",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### GET /api/media/:id

Get single media asset.

**Auth:** Required  
**Roles:** All

**Response:**

```json
{
  "id": "uuid",
  "file_name": "image.jpg",
  "file_path": "uploads/uuid/image.jpg",
  "public_url": "https://...",
  "mime_type": "image/jpeg",
  "file_size": 1024000,
  "alt_text": "Description",
  "caption": "Caption",
  "credits": "Credits",
  "uploaded_by": "uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH /api/media/:id

Update media metadata.

**Auth:** Required  
**Roles:** All (own uploads), Editor, Publisher, Admin (all)

**Request Body:**

```json
{
  "alt_text": "Updated description",
  "caption": "Updated caption",
  "credits": "Updated credits"
}
```

**Response:**

```json
{
  "id": "uuid",
  "alt_text": "Updated description",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### DELETE /api/media/:id

Delete media asset (Storage + database).

**Auth:** Required  
**Roles:** All (own uploads), Publisher, Admin (all)

**Response:**

```json
{
  "message": "Media asset deleted successfully"
}
```

---

## Audit Logs

### GET /api/audit

List audit logs with filtering.

**Auth:** Required  
**Roles:** Publisher, Admin

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 50)
- `user_id` (uuid, optional) - Filter by user
- `action` (string, optional) - Filter by action (CREATE, UPDATE, DELETE, etc.)
- `resource_type` (string, optional) - Filter by resource type
- `resource_id` (uuid, optional) - Filter by resource
- `start_date` (ISO datetime, optional)
- `end_date` (ISO datetime, optional)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "CREATE",
      "resource_type": "content_item",
      "resource_id": "uuid",
      "resource_name": "Content Title",
      "old_values": null,
      "new_values": {},
      "ip_address": "127.0.0.1",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

---

### GET /api/audit/:id

Get single audit log entry.

**Auth:** Required  
**Roles:** Publisher, Admin

**Response:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "action": "UPDATE",
  "resource_type": "content_item",
  "resource_id": "uuid",
  "resource_name": "Content Title",
  "old_values": { "title": "Old Title" },
  "new_values": { "title": "New Title" },
  "ip_address": "127.0.0.1",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/audit/export

Export audit logs to CSV or JSON.

**Auth:** Required  
**Roles:** Admin only

**Query Parameters:**

- `format` (enum: 'csv' | 'json', default: 'json')
- `start_date` (ISO datetime, optional)
- `end_date` (ISO datetime, optional)
- `action` (string, optional)

**Response (JSON format):**

```json
{
  "exported_at": "2024-01-01T00:00:00.000Z",
  "count": 1000,
  "data": [...]
}
```

**Response (CSV format):**

```csv
id,user_id,action,resource_type,resource_id,resource_name,created_at
uuid,uuid,CREATE,content_item,uuid,Content Title,2024-01-01T00:00:00.000Z
```

**Headers:**

- Content-Type: text/csv or application/json
- Content-Disposition: attachment; filename=audit-logs-{timestamp}.{ext}

---

### GET /api/audit/stats

Get audit statistics.

**Auth:** Required  
**Roles:** Admin only

**Query Parameters:**

- `start_date` (ISO datetime, optional)
- `end_date` (ISO datetime, optional)

**Response:**

```json
{
  "total_logs": 1000,
  "action_counts": {
    "CREATE": 300,
    "UPDATE": 500,
    "DELETE": 50,
    "PUBLISH": 100,
    "UNPUBLISH": 50
  },
  "period": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-12-31T23:59:59.000Z"
  }
}
```

---

## Admin Management

### GET /api/admin/users

List all users with their roles.

**Auth:** Required  
**Roles:** Admin only

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_sign_in_at": "2024-01-01T00:00:00.000Z",
      "roles": ["Author", "Editor"]
    }
  ]
}
```

---

### GET /api/admin/users/:id

Get single user with roles.

**Auth:** Required  
**Roles:** Admin only

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00.000Z",
  "last_sign_in_at": "2024-01-01T00:00:00.000Z",
  "roles": ["Author", "Editor"]
}
```

---

### POST /api/admin/users/:id/roles

Assign role to user.

**Auth:** Required  
**Roles:** Admin only

**Request Body:**

```json
{
  "role": "Editor"
}
```

**Allowed Roles:**

- Author
- Editor
- Approver
- Publisher
- Admin

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "role": "Editor",
  "created_by": "uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### DELETE /api/admin/users/:id/roles/:role

Remove role from user.

**Auth:** Required  
**Roles:** Admin only

**Response:**

```json
{
  "message": "Role removed successfully"
}
```

---

### GET /api/admin/stats

Get system statistics.

**Auth:** Required  
**Roles:** Admin only

**Response:**

```json
{
  "users": 50,
  "content": {
    "total": 1000,
    "published": 500,
    "draft": 300
  },
  "media": 2000
}
```

---

### POST /api/admin/scheduled-publish

Manually trigger scheduled publishing process.

**Auth:** Required  
**Roles:** Admin only

**Request Body:** None

**Response:**

```json
{
  "message": "Scheduled publishing processed successfully"
}
```

**Note:** This endpoint should normally be called by a cron job. Use it manually for testing or emergency publishing.

---

## Rate Limiting

Currently not implemented. Consider adding for production:

- 100 requests per minute per IP
- 1000 requests per hour per user
- Special limits for expensive operations (exports, bulk actions)

---

## CORS Configuration

**Allowed Origin:** `http://localhost:3000` (development)  
**Credentials:** Enabled  
**Methods:** GET, POST, PATCH, DELETE, OPTIONS

---

## Request ID Tracking

All requests receive a unique request ID in the response header:

```
X-Request-Id: uuid
```

Use this ID for debugging and log correlation.

---

## Pagination Standard

All list endpoints use consistent pagination:

**Request:**

```
?page=1&limit=20
```

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Timestamps

All timestamps are in ISO 8601 format with UTC timezone:

```
2024-01-01T00:00:00.000Z
```

---

## File Upload Flow

1. **Request signed upload URL:**

   ```
   POST /api/media/upload-url
   ```

2. **Upload file to Supabase Storage:**

   ```
   PUT {upload_url}
   Content-Type: {mime_type}
   Body: {file_binary}
   ```

3. **Create database record:**
   ```
   POST /api/media
   ```

---

**API Version:** 1.0  
**Last Updated:** 2024  
**Backend Status:** ✅ Production Ready
