# Conventions Detected Summary

## Current State: Fresh Repository

This is a **new repository** with no existing conventions. I have established the foundational structure following **Vite + Express + TypeScript best practices** aligned with the project requirements.

## Established Conventions

### 1. Project Structure

```
dbsa/
├── src/                    # Frontend (React + Vite + TypeScript)
├── server/                 # Backend (Express + TypeScript)
├── shared/                 # Shared types and validation (Zod schemas)
├── supabase/migrations/    # Database migrations
└── .github/                # GitHub configuration + Copilot instructions
```

### 2. Frontend (React + Vite)

**Router:** React Router DOM v6

- Routes defined in `src/App.tsx`
- Protected routes using `<ProtectedRoute>` wrapper

**Authentication:**

- Supabase Auth with React Context (`src/lib/auth/AuthProvider.tsx`)
- `useAuth()` hook for accessing user/session
- Auth guards with automatic redirect to `/login`

**HTTP Client:** Axios (REQUIRED)

- Centralized client: `src/lib/apiClient.ts`
- Base URL from environment: `VITE_API_BASE_URL`
- Request interceptor: Auto-inject Supabase access token
- Response interceptor: Normalize error shape `{ code, message, details, status }`

**Supabase Client:** `src/lib/supabase.ts`

- Initialized with environment variables
- Used for auth state management

**Folder Structure (to be followed):**

```
src/
├── lib/          # Core utilities (auth, API client, Supabase)
├── features/     # Feature modules (to be added)
├── components/   # Shared UI components (to be added)
├── hooks/        # Custom React hooks (to be added)
├── types/        # Frontend-specific types (to be added)
└── utils/        # Helper functions (to be added)
```

### 3. Backend (Express)

**Port:** 3001 (proxied from Vite dev server)

**Middleware Stack (in order):**

1. `helmet` - Security headers
2. `cors` - Cross-origin requests
3. `express.json()` - Body parsing
4. `requestId` - Request ID generation
5. `logger` - Structured logging
6. `authMiddleware` - JWT validation + user enrichment
7. `requireRole()` - RBAC enforcement

**Auth Pattern:**

- Validates Supabase JWT from `Authorization: Bearer <token>` header
- Enriches `req.user` with `{ id, email, role }`
- Returns 401 for missing/invalid tokens

**RBAC:**

- Roles: `Author`, `Editor`, `Approver`, `Publisher`, `Admin`
- Middleware: `requireRole(...roles)` for route protection
- RLS at database level as final enforcement

**Error Handling:**

- Zod validation errors → 400 with details
- Auth errors → 401
- RBAC errors → 403
- Generic errors → 500
- All errors include `requestId` for tracing

**Route Structure (to be implemented):**

```
server/src/routes/
├── content.ts
├── workflow.ts
├── versions.ts
├── media.ts
├── audit.ts
└── admin.ts
```

### 4. Shared Code

**Location:** `shared/`

**Types:** `shared/types.ts`

- TypeScript interfaces for domain models
- Used by both frontend and backend

**Validation:** `shared/validation.ts`

- Zod schemas for input validation
- Reused in Express routes and optionally in frontend forms

### 5. TypeScript Configuration

**Strict mode:** Enabled across all workspaces

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

**Path Aliases:**

- Frontend: `@/*` → `src/*`, `@shared/*` → `shared/*`
- Backend: `@shared/*` → `../shared/*`

### 6. Environment Variables

**Frontend (.env):**

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
```

**Backend (.env):**

```
PORT
NODE_ENV
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
RESEND_API_KEY
```

### 7. Development Scripts

```bash
npm run dev           # Run both frontend and backend
npm run dev:client    # Frontend only (port 3000)
npm run dev:server    # Backend only (port 3001)
npm run build         # Build both for production
npm run type-check    # TypeScript validation
npm run lint          # ESLint validation
```

### 8. Code Style

- **Linting:** ESLint with TypeScript rules
- **No semicolons** (based on ESLint config)
- **2-space indentation**
- **Arrow functions** preferred
- **Async/await** over promises

### 9. Security Principles

1. **Least Privilege:** Users can only access what their role permits
2. **Defense in Depth:** RBAC middleware + RLS policies
3. **Audit Trail:** All mutations logged immutably
4. **JWT Validation:** All protected endpoints validate Supabase tokens
5. **Input Validation:** All inputs validated with Zod schemas

### 10. Next Implementation Steps

Following the established conventions, the next tasks are:

1. ✅ **Supabase Migrations** - Create database schema with RLS
2. ✅ **API Routes** - Implement Express route modules
3. ✅ **Frontend Features** - Build editorial console screens
4. ✅ **Page Builder** - Implement block system
5. ✅ **Media Management** - Integrate with Supabase Storage

---

## Commitment

All future code generation will:

- ✅ Follow these exact folder structures
- ✅ Use Axios exclusively for HTTP calls
- ✅ Implement proper auth middleware
- ✅ Validate all inputs with Zod
- ✅ Include TypeScript types from `shared/`
- ✅ Log actions to audit trail
- ✅ Enforce RBAC + RLS
- ✅ Maintain consistent error handling
- ✅ Use strict TypeScript mode
- ✅ Follow established naming conventions
