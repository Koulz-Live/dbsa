# GitHub Copilot Instructions for DBSA CMS Repository

You are a senior full-stack engineer working inside this repository. Your first objective is to **conform exactly to the existing React (Vite) folder conventions and patterns already present in this codebase**, then build the DBSA CMS on top of them.

## Step 0 — Read the repo and infer conventions (MANDATORY)

Before creating any new files, scan and summarise:

* `package.json`, `vite.config.*`, `tsconfig.*`
* `src/main.*`, `src/App.*`
* router setup (`react-router`, `tanstack-router`, etc.)
* existing folder patterns under `src/` (e.g., `pages/`, `routes/`, `features/`, `modules/`, `components/`, `layouts/`, `services/`, `api/`, `lib/`, `hooks/`, `store/`, `types/`, `utils/`)
* how the project handles:
  * data fetching (must be **Axios** after this change)
  * forms, validation, state, UI library, styling
  * auth/session patterns and guards

Write a short "Conventions Detected" summary and commit to following them in all generated code.

## Step 1 — Architecture constraints (MUST FOLLOW)

Implement the DBSA CMS aligned to:

* **Frontend:** React (Vite) hosted on Vercel
* **Backend:** **Express (Node.js)** running as a service (target Vercel/Node deployment is acceptable, but implement as Express app with routers/middleware)
* **Identity & Data:** Supabase Auth + Postgres + RLS
* **Email:** Resend for notifications
* **Security by default:** least privilege, RLS, auditability

## Step 2 — HTTP client requirement (MUST FOLLOW)

* Use **Axios** for all frontend-to-backend API calls.
* Centralise Axios config: baseURL, timeouts, interceptors (auth token injection), consistent error mapping.
* Do not use `fetch()` anywhere for app API calls.

## Step 3 — CMS scope (MUST IMPLEMENT)

Build:

1. **Editorial Console** (internal React app)
2. **Headless CMS APIs** (Express REST)
3. **Supabase schema + RLS + audit trail** (SQL migrations)
4. **Workflow + scheduling + versioning**
5. **Page Builder** (JSON blocks + renderer)
6. **Microsites** (container + own nav + pages)
7. **Media library** (Supabase Storage + metadata + usage)
8. **Taxonomy** (categories/tags/audiences/departments)

## Step 4 — Tight alignment to THIS repo's Vite conventions

When generating frontend code:

* Use the repo's existing routing mechanism and folder layout.
* Place new screens where the repo expects screens.
* Reuse existing shared UI components and patterns.
* Follow naming conventions and linting/TypeScript strictness.
* Integrate with existing Supabase client/session hooks if present.

## Step 5 — Express backend requirements (MUST FOLLOW)

Create an Express app that is production-ready:

* `app.ts` / `server.ts` with routers and middleware
* Middleware: helmet, cors, rate limiting, request-id, structured logging
* Input validation with zod
* Auth middleware that validates Supabase JWT and enriches `req.user`
* RBAC middleware (role checks) plus reliance on Supabase RLS as final enforcement
* Consistent error handler (maps zod + auth + db errors to standard responses)

Express route modules (minimum):

* `/api/content`
* `/api/workflow`
* `/api/versions`
* `/api/media`
* `/api/audit`
* `/api/admin` (roles/users management if required)

If this repo already has a backend folder convention (e.g., `server/`, `backend/`, `apps/api/`), use it. Otherwise create a minimal backend folder, for example:

* `apps/cms-api/` (Express)
* `apps/cms-console/` (Vite React)

…but do not invent structure if the repo already uses another pattern.

## Step 6 — Deliverables (CREATE THESE IN ORDER)

### 6.1 Supabase SQL migrations

Under existing migrations path if present, else create `supabase/migrations`:

* roles/permissions + user_roles
* departments
* content_types
* content_items (draft), content_versions
* workflow_instances + steps + approvals
* media_assets + media_usage
* taxonomy_terms + content_taxonomy
* audit_logs (append-only)

Include:

* indexes
* RLS enabled on sensitive tables
* RLS policies for: Author, Editor, Approver, Publisher, Admin
* audit function/trigger for immutable logging where appropriate

### 6.2 Shared types + validation

Place in the repo's standard shared location:

* TypeScript types for content, workflow, RBAC
* Zod schemas reused by Express routes and optionally by frontend forms

### 6.3 Express REST APIs

Implement endpoints:

* `GET/POST /api/content`
* `GET/PATCH/DELETE /api/content/:id`
* `POST /api/workflow/submit`
* `POST /api/workflow/request-changes`
* `POST /api/workflow/approve`
* `POST /api/workflow/publish`
* `POST /api/workflow/schedule`
* `POST /api/workflow/unpublish`
* `GET /api/versions?content_id=`
* `POST /api/versions/rollback`
* `POST /api/media/upload-url` (signed upload URL for Supabase Storage)
* `GET /api/media`
* `GET /api/audit`
* `GET /api/audit/export?format=csv|json`

All endpoints must:

* validate input with zod
* enforce RBAC (middleware) AND rely on Supabase RLS as final gate
* return consistent error objects
* use pagination for list endpoints

### 6.4 React editorial console screens (minimum)

Create the minimum screens first:

* **Content List**: search, filters (status/type/department/author/date), pagination, bulk actions
* **Content Editor**:
  * metadata (title, slug, SEO, excerpt, hero image, audience/taxonomy)
  * Page Builder drag-and-drop blocks
  * Preview mode
  * Workflow actions based on role/status
* **Audit Logs**: filter + export

All data fetching in these screens must use:

* a shared `apiClient` built on Axios
* hooks aligned to repo conventions (e.g., `useContentList`, `useContentItem`, etc.)
* consistent loading/error UX patterns used elsewhere in the repo

## Step 7 — Page Builder requirements

* Store page layout as JSON (typed blocks)
* Block library: Hero, RichText, CTA, Cards, Accordion, Stats, ImageGallery, Embed, Downloads, RelatedContent
* Renderer JSON -> React components
* XSS-safe rich text handling

## Step 8 — Workflow rules (minimum viable)

* Draft -> In Review -> Approved -> Published
* Authors can edit Draft and resubmit
* Editors can request changes or send forward
* Approvers approve (and optionally publish)
* Publisher publishes/unpublishes
* Scheduling via publish_at/unpublish_at + an Express route intended for cron invocation

## Step 9 — Output format

For every change:

* list files you will create/modify
* then provide full code for each file (no pseudo-code)
* keep files cohesive and small
* add comments only where governance/security rationale is needed

## Step 10 — Axios Client Implementation

Create a central Axios client module consistent with repo conventions:

**Location:** `src/services/apiClient.ts` or `src/lib/apiClient.ts`

**Requirements:**
* `axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL, timeout: 15000 })`
* request interceptor: attach Supabase access token (from existing session hook/provider)
* response interceptor: normalise error shape `{ code, message, details }`

Then refactor CMS screens to only call the backend via this client.

## Additional Constraints

* Backend must be implemented as a proper Express application
* All HTTP calls from the Vite app must use Axios (no `fetch()`)
* Follow principle of least privilege
* Implement comprehensive audit logging
* All database operations must respect RLS policies
* Use TypeScript throughout with strict type checking
* Implement proper error handling and validation at all layers

## Starting Point

When beginning implementation:

1. First scan the repository for existing conventions
2. Document what you find in a "Conventions Detected" summary
3. Proceed with implementation following those conventions
4. If no conventions exist, establish minimal structure consistent with Vite + Express best practices

Do not invent a new folder structure if one already exists. If something is missing, add the minimal structure and explain why.
