# DBSA CMS

A headless CMS built with React (Vite), Express, Supabase, and TypeScript.

## Architecture

- **Frontend:** React + Vite + TypeScript (Editorial Console)
- **Backend:** Express + Node.js (REST APIs)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Email:** Resend
- **Deployment:** Vercel

## Features

- ✅ Editorial Console with content management
- ✅ Headless CMS REST APIs
- ✅ Role-based access control (RBAC)
- ✅ Content workflow (Draft → Review → Approved → Published)
- ✅ Page Builder with drag-and-drop blocks
- ✅ Content versioning and rollback
- ✅ Media library with Supabase Storage
- ✅ Taxonomy system (categories, tags, audiences)
- ✅ Microsites support
- ✅ Comprehensive audit logging
- ✅ Row-level security (RLS) with Supabase

## Project Structure

```
dbsa/
├── src/                    # Frontend (React + Vite)
│   ├── pages/             # ✅ Screen components (2 complete)
│   │   ├── ContentList.tsx    # Content management list
│   │   └── ContentEditor.tsx  # Create/edit content
│   ├── components/        # Shared UI components (to be added)
│   ├── lib/               # Shared utilities
│   │   ├── apiClient.ts   # ✅ Axios client with interceptors
│   │   ├── supabase.ts    # ✅ Supabase client
│   │   └── auth/          # ✅ Auth context and guards
│   ├── App.tsx           # ✅ Router configuration
│   └── main.tsx          # ✅ App entry point
├── server/                # Backend (Express) - ✅ COMPLETE
│   └── src/
│       ├── middleware/    # ✅ Auth, RBAC, logging, errors
│       ├── routes/        # ✅ API route modules (6 modules)
│       │   ├── content.ts     # Content CRUD
│       │   ├── workflow.ts    # Workflow management
│       │   ├── versions.ts    # Version control
│       │   ├── media.ts       # Media library
│       │   ├── audit.ts       # Audit logs
│       │   └── admin.ts       # User/role management
│       ├── app.ts        # ✅ Express app (routes wired)
│       ├── index.ts      # ✅ Server entry point
│       └── config.ts     # ✅ Environment config
├── shared/               # Shared types & validation
│   ├── types.ts         # ✅ TypeScript interfaces
│   └── validation.ts    # ✅ Zod schemas
├── supabase/            # ✅ Database migrations (10 files)
│   └── migrations/
│       ├── 001_roles_and_permissions.sql
│       ├── 002_departments.sql
│       ├── 003_content_types.sql
│       ├── 004_content_items.sql
│       ├── 005_workflow.sql
│       ├── 006_media.sql
│       ├── 007_taxonomy.sql
│       ├── 008_audit_logs.sql
│       ├── 009_rls_policies.sql
│       └── 010_indexes.sql
└── .github/
    └── copilot-instructions.md  # GitHub Copilot guidelines

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Resend API key (for emails)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Koulz-Live/dbsa.git
cd dbsa
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase and Resend credentials:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
VITE_API_BASE_URL=http://localhost:3001

# Server (Backend)
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Resend
RESEND_API_KEY=your_resend_api_key
```

4. Run database migrations:

```bash
# Using Supabase CLI
supabase db reset

# Or apply migrations manually in Supabase Dashboard
# Navigate to SQL Editor and run each migration file in order (001-010)
```

### Development

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Frontend only (port 3000)
npm run dev:client

# Backend only (port 3001)
npm run dev:server
```

### Building for Production

```bash
npm run build
```

This builds both the frontend and backend.

## API Endpoints

All API endpoints require authentication except `/health`.

**📚 Full API documentation:** See [API_REFERENCE.md](./API_REFERENCE.md) for complete specifications.

### Health Check

- `GET /health` - Server health check

### Content Management (✅ Implemented)

- `GET /api/content` - List content items (paginated, searchable, filterable)
- `POST /api/content` - Create new content
- `GET /api/content/:id` - Get content by ID
- `PATCH /api/content/:id` - Update content (auto-versions)
- `DELETE /api/content/:id` - Soft delete content

### Workflow (✅ Implemented)

- `POST /api/workflow/submit` - Submit content for review
- `POST /api/workflow/request-changes` - Request changes
- `POST /api/workflow/approve` - Approve content
- `POST /api/workflow/publish` - Publish content immediately
- `POST /api/workflow/schedule` - Schedule publish/unpublish
- `POST /api/workflow/unpublish` - Unpublish content

### Versions (✅ Implemented)

- `GET /api/versions?content_id=<id>` - Get version history
- `GET /api/versions/:id` - Get specific version
- `POST /api/versions/rollback` - Rollback to previous version
- `GET /api/versions/compare` - Compare two versions

### Media (✅ Implemented)

- `POST /api/media/upload-url` - Get signed upload URL (Supabase Storage)
- `POST /api/media` - Create media asset record
- `GET /api/media` - List media assets (paginated, filterable)
- `GET /api/media/:id` - Get single media asset
- `PATCH /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete media asset

### Audit (✅ Implemented)

- `GET /api/audit` - Get audit logs (filtered, paginated)
- `GET /api/audit/:id` - Get single audit log
- `GET /api/audit/export?format=csv|json` - Export audit logs
- `GET /api/audit/stats` - Get audit statistics

### Admin (✅ Implemented)

- `GET /api/admin/users` - List all users with roles
- `GET /api/admin/users/:id` - Get single user
- `POST /api/admin/users/:id/roles` - Assign role to user
- `DELETE /api/admin/users/:id/roles/:role` - Remove role from user
- `GET /api/admin/stats` - System statistics
- `POST /api/admin/scheduled-publish` - Manual trigger for scheduled publishing

## User Roles

- **Author** - Create and edit own content
- **Editor** - Review and edit all content
- **Approver** - Approve content for publishing
- **Publisher** - Publish and unpublish content
- **Admin** - Full system access

## Workflow States

```
Draft → In Review → Approved → Published
   ↓        ↓
   ←────────┘ (request changes)
```

## Development Conventions

This project follows strict conventions defined in `.github/copilot-instructions.md`:

1. **Always use Axios** for HTTP calls (no `fetch()`)
2. **Follow existing folder patterns** when adding new features
3. **TypeScript strict mode** is enabled
4. **Zod validation** for all API inputs
5. **RLS policies** enforced at database level
6. **Audit logging** for all mutations

## Project Status

### ✅ Completed

- [x] Project foundation and configuration
- [x] Frontend structure with Axios client and Supabase integration
- [x] Backend Express API with full middleware stack
- [x] Database schema with 10 migrations (15 tables, 40+ RLS policies)
- [x] 30+ REST API endpoints across 6 route modules
- [x] RBAC with 5 roles (Author, Editor, Approver, Publisher, Admin)
- [x] Content workflow (Draft → Review → Approved → Published)
- [x] Version control with rollback capability
- [x] Media management with Supabase Storage
- [x] Comprehensive audit logging
- [x] User/role management
- [x] Content List screen with search, filters, and pagination
- [x] Content Editor screen with workflow actions
- [x] React Router integration with protected routes

### 🔄 In Progress

- [x] Frontend editorial console screens (2/4 complete)
  - ✅ Content List
  - ✅ Content Editor
  - ⏳ Page Builder component
  - ⏳ Audit Logs screen
- [ ] Media library UI
- [ ] Taxonomy management UI

### ⏳ Pending

- [ ] Microsites functionality
- [ ] Advanced search features
- [ ] Email notifications (Resend integration)
- [ ] Deployment configuration
- [ ] CI/CD pipelines

**📊 Current Metrics:**

- Total files: 75+
- Lines of code: ~11,000+
- API endpoints: 30+
- Database tables: 15
- RLS policies: 40+
- Frontend screens: 2/4 complete

**📚 Documentation:**

- [QUICK_START.md](./QUICK_START.md) - Quick reference and testing guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete project summary
- [FRONTEND_PROGRESS.md](./FRONTEND_PROGRESS.md) - Frontend development tracking
- [BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md) - Backend implementation overview
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API specification
- [SCHEMA_COMPLETE.md](./SCHEMA_COMPLETE.md) - Database schema reference
- [DATABASE_DIAGRAM.md](./DATABASE_DIAGRAM.md) - Entity relationships

## Contributing

Please read `.github/copilot-instructions.md` before contributing to ensure consistency with project conventions.

## License

MIT
