# Environment Variables Guide

This document provides a comprehensive guide to all environment variables used in the DBSA CMS application.

## Frontend Environment Variables (.env in root)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
VITE_API_BASE_URL=http://localhost:3001
```

### Variable Descriptions

#### `VITE_SUPABASE_URL` (Required)

- **Description**: The URL of your Supabase project
- **Format**: `https://[project-id].supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL
- **Development**: Use your Supabase project URL
- **Production**: Same as development (Supabase handles production/staging environments)

#### `VITE_SUPABASE_ANON_KEY` (Required)

- **Description**: The anonymous/public key for client-side Supabase access
- **Format**: Long JWT string starting with `eyJ...`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Security**: Safe to expose in frontend code (has limited permissions via RLS)
- **Development**: Use your project's anon key
- **Production**: Use the same key (protected by RLS policies)

#### `VITE_API_BASE_URL` (Required)

- **Description**: The base URL for the Express backend API
- **Format**: `http://[host]:[port]` or `https://[domain]`
- **Development**: `http://localhost:3001`
- **Production**: `https://your-api.vercel.app` (or your deployment URL)
- **Important**: No trailing slash

---

## Backend Environment Variables (server/.env)

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Email Service
RESEND_API_KEY=your_resend_api_key

# Optional: Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
CONTENT_RATE_LIMIT_MAX=30
UPLOAD_RATE_LIMIT_MAX=10
UPLOAD_RATE_LIMIT_WINDOW_MS=3600000
EXPORT_RATE_LIMIT_MAX=5
```

### Variable Descriptions

#### `NODE_ENV` (Required)

- **Description**: The environment the application is running in
- **Allowed Values**: `development`, `production`, `test`
- **Development**: `development`
- **Production**: `production`
- **Impact**:
  - Enables/disables secure cookies (HTTPS-only in production)
  - Controls error verbosity
  - Affects logging detail

#### `PORT` (Optional)

- **Description**: The port the Express server listens on
- **Default**: `3001`
- **Development**: `3001`
- **Production**: Set by hosting platform (Vercel, Railway, etc.)
- **Note**: Some platforms set this automatically via `process.env.PORT`

#### `CLIENT_URL` (Required)

- **Description**: The URL of the frontend application (for CORS)
- **Format**: `http://[host]:[port]` or `https://[domain]`
- **Development**: `http://localhost:5173`
- **Production**: `https://your-frontend.vercel.app`
- **Important**: Must match exactly (including protocol and port)
- **Security**: Only requests from this origin can access the API with credentials

#### `SUPABASE_URL` (Required)

- **Description**: The URL of your Supabase project
- **Format**: `https://[project-id].supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL
- **Note**: Same as frontend `VITE_SUPABASE_URL`

#### `SUPABASE_SERVICE_ROLE_KEY` (Required)

- **Description**: The service role key for admin-level Supabase access
- **Format**: Long JWT string starting with `eyJ...`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
- **Security**: ⚠️ **CRITICAL** - Never expose this key in frontend code or public repositories
- **Permissions**: Bypasses Row Level Security (RLS) - use with caution
- **Use cases**: Server-side operations, admin actions, bypassing RLS when needed

#### `SUPABASE_JWT_SECRET` (Required)

- **Description**: The secret used to verify Supabase JWT tokens
- **Format**: Base64-encoded string
- **Where to find**: Supabase Dashboard → Settings → API → JWT Settings → JWT Secret
- **Purpose**: Verify that JWT tokens from clients are legitimate Supabase tokens
- **Security**: Keep this secret and never expose it

#### `RESEND_API_KEY` (Required)

- **Description**: API key for Resend email service
- **Format**: `re_[random_string]`
- **Where to find**: Resend Dashboard → API Keys
- **Purpose**: Send transactional emails (notifications, password resets, etc.)
- **Development**: Use test API key for development
- **Production**: Use production API key

#### `RATE_LIMIT_WINDOW_MS` (Optional)

- **Description**: Time window for rate limiting in milliseconds
- **Default**: `900000` (15 minutes)
- **Format**: Integer (milliseconds)
- **Example**:
  - 15 minutes = `900000`
  - 1 hour = `3600000`
  - 1 day = `86400000`

#### `RATE_LIMIT_MAX_REQUESTS` (Optional)

- **Description**: Maximum requests per window for general API endpoints
- **Default**: `100`
- **Recommendation**:
  - Development: 100-200
  - Production: 50-100 (adjust based on usage patterns)

#### `AUTH_RATE_LIMIT_MAX` (Optional)

- **Description**: Maximum authentication attempts per window
- **Default**: `5`
- **Recommendation**: Keep low (5-10) to prevent brute force attacks

#### `CONTENT_RATE_LIMIT_MAX` (Optional)

- **Description**: Maximum content modification requests per window
- **Default**: `30`
- **Recommendation**: 30-50 for typical editorial workflows

#### `UPLOAD_RATE_LIMIT_MAX` (Optional)

- **Description**: Maximum upload URL requests per window
- **Default**: `10`
- **Recommendation**: 10-20 (uploads are resource-intensive)

#### `UPLOAD_RATE_LIMIT_WINDOW_MS` (Optional)

- **Description**: Time window for upload rate limiting
- **Default**: `3600000` (1 hour)
- **Recommendation**: Keep at 1 hour to prevent storage abuse

#### `EXPORT_RATE_LIMIT_MAX` (Optional)

- **Description**: Maximum audit log export requests per window
- **Default**: `5`
- **Recommendation**: Keep low (5-10) as exports are resource-intensive

---

## Environment Variable Templates

### Development (.env.example for root)

```bash
# Frontend Environment Variables
# Copy this to .env and fill in your values

# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
VITE_API_BASE_URL=http://localhost:3001
```

### Development (server/.env.example)

```bash
# Backend Environment Variables
# Copy this to server/.env and fill in your values

# Server
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# Optional: Rate Limiting (uses defaults if not set)
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100
# AUTH_RATE_LIMIT_MAX=5
# CONTENT_RATE_LIMIT_MAX=30
# UPLOAD_RATE_LIMIT_MAX=10
# UPLOAD_RATE_LIMIT_WINDOW_MS=3600000
# EXPORT_RATE_LIMIT_MAX=5
```

### Production (.env for root - Vercel)

```bash
# Frontend Environment Variables (Vercel)
# Set these in Vercel Dashboard → Settings → Environment Variables

VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://your-api-domain.vercel.app
```

### Production (server/.env - Vercel/Railway/Render)

```bash
# Backend Environment Variables (Production)
# Set these in your hosting platform's dashboard

NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app

SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# Production rate limits (adjust based on traffic)
RATE_LIMIT_MAX_REQUESTS=50
AUTH_RATE_LIMIT_MAX=5
CONTENT_RATE_LIMIT_MAX=30
```

---

## Security Best Practices

### ✅ DO:

- Store environment variables in `.env` files (local development)
- Use environment variable management in hosting platforms (production)
- Keep `.env` files out of version control (add to `.gitignore`)
- Use different values for development and production
- Rotate secrets regularly (especially JWT secrets and API keys)
- Use strong, random values for secrets
- Validate environment variables on application startup

### ❌ DON'T:

- Commit `.env` files to Git
- Expose service role keys in frontend code
- Use production credentials in development
- Share `.env` files via email or messaging
- Hardcode secrets in source code
- Use weak or predictable secrets

---

## Getting Your Supabase Credentials

1. **Login to Supabase**: https://app.supabase.com
2. **Select Your Project**
3. **Navigate to Settings** (gear icon in sidebar)
4. **Go to API tab**
5. **Copy the following:**
   - **Project URL**: Use for `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **anon public key**: Use for `VITE_SUPABASE_ANON_KEY`
   - **service_role key**: Use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)
6. **Go to JWT Settings section**
7. **Copy JWT Secret**: Use for `SUPABASE_JWT_SECRET`

---

## Getting Your Resend API Key

1. **Sign up at**: https://resend.com
2. **Navigate to API Keys**
3. **Create a new API key**
4. **Copy the key**: Starts with `re_`
5. **Set permissions**: Full access for production, restricted for development
6. **Add to environment variables**: `RESEND_API_KEY`

---

## Validating Your Configuration

### Quick Check Script

Create `server/src/validateEnv.ts`:

```typescript
export function validateEnv() {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_JWT_SECRET",
    "RESEND_API_KEY",
    "CLIENT_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
}
```

Call in `server/src/index.ts`:

```typescript
import { validateEnv } from "./validateEnv";

validateEnv(); // Validate before starting server
```

---

## Troubleshooting

### Issue: "SUPABASE_URL is not defined"

**Cause**: Environment variables not loaded

**Solution**:

1. Check that `.env` file exists in the correct location
2. Verify file is named exactly `.env` (not `.env.txt`)
3. Restart your development server
4. In Vite, ensure variables start with `VITE_`

### Issue: "Invalid JWT token"

**Cause**: Wrong JWT secret or malformed token

**Solution**:

1. Verify `SUPABASE_JWT_SECRET` matches Supabase dashboard
2. Ensure no extra spaces or newlines in secret
3. Try regenerating the JWT secret in Supabase

### Issue: CORS errors in production

**Cause**: `CLIENT_URL` mismatch

**Solution**:

1. Ensure `CLIENT_URL` matches your frontend URL exactly
2. Include protocol (`https://`)
3. Don't include trailing slash
4. Verify in hosting platform environment variables

### Issue: Rate limiting too aggressive

**Cause**: Default limits too low for your traffic

**Solution**:

1. Add rate limit environment variables
2. Increase `RATE_LIMIT_MAX_REQUESTS`
3. Increase specific limits (`CONTENT_RATE_LIMIT_MAX`, etc.)
4. Monitor and adjust based on usage patterns

---

## Environment Variables Checklist

Before deploying:

- [ ] All required variables are set
- [ ] Production values differ from development
- [ ] Secrets are not committed to Git
- [ ] `.gitignore` includes `.env` files
- [ ] `CLIENT_URL` matches frontend domain
- [ ] `VITE_API_BASE_URL` points to production API
- [ ] `NODE_ENV=production` is set
- [ ] Secrets are strong and random
- [ ] Rate limits are appropriate for traffic
- [ ] Supabase credentials are correct
- [ ] Resend API key is valid
- [ ] Environment variables validated on startup

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Resend Documentation**: https://resend.com/docs
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html
- **OWASP Configuration Guide**: https://cheatsheetseries.owasp.org/cheatsheets/Configuration_Cheat_Sheet.html
