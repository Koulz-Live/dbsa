# DBSA CMS Security Documentation

## Overview

This document outlines the security features implemented in the DBSA CMS application to protect against common web vulnerabilities and attacks.

## Security Features

### 1. Rate Limiting

The application implements multiple rate limiters to protect against brute force attacks, API abuse, and denial-of-service attempts.

#### Global API Rate Limit

- **Limit**: 100 requests per 15 minutes per IP
- **Applies to**: All API endpoints
- **Status Code**: 429 (Too Many Requests)
- **Headers**: Returns `RateLimit-*` headers with current usage and reset time

#### Authentication Rate Limit

- **Limit**: 5 requests per 15 minutes per IP
- **Applies to**: `/api/auth/*` endpoints
- **Purpose**: Prevent brute force password attacks
- **Behavior**: Only counts failed authentication attempts
- **Status Code**: 429 with retry-after information

#### Content Modification Rate Limit

- **Limit**: 30 requests per 15 minutes per IP
- **Applies to**: `/api/content/*` state-changing operations (POST, PUT, PATCH, DELETE)
- **Purpose**: Prevent content spam and automated abuse
- **Status Code**: 429

#### Upload Rate Limit

- **Limit**: 10 requests per hour per IP
- **Applies to**: `/api/media/upload-url`
- **Purpose**: Prevent storage abuse and resource exhaustion
- **Status Code**: 429

#### Export Rate Limit

- **Limit**: 5 requests per 15 minutes per IP
- **Applies to**: `/api/audit/export`
- **Purpose**: Prevent resource exhaustion from expensive operations
- **Status Code**: 429

#### Bypassed Endpoints

- Health check endpoints (`/health`, `/api/health`) are excluded from rate limiting

### 2. CSRF Protection

The application implements CSRF (Cross-Site Request Forgery) protection using the **Double Submit Cookie** pattern.

#### How It Works

1. **Token Generation**: The server generates a cryptographically secure random token (32 bytes)
2. **Cookie Storage**: Token is stored in a cookie named `XSRF-TOKEN` with the following properties:
   - `httpOnly: false` - Allows JavaScript to read the token
   - `secure: true` - Cookie only sent over HTTPS in production
   - `sameSite: 'strict'` - Cookie not sent with cross-site requests
   - `maxAge: 24 hours` - Token expires after 24 hours

3. **Request Validation**: For state-changing requests (POST, PUT, PATCH, DELETE):
   - Client includes token in `x-csrf-token` header
   - Server validates that header matches cookie value
   - Request is rejected with 403 if validation fails

#### Client Integration

The frontend automatically handles CSRF tokens:

```typescript
// Token is fetched on app load
import { initializeCsrfToken } from "./lib/csrf";

useEffect(() => {
  initializeCsrfToken();
}, []);

// Token is automatically injected into requests by apiClient
// No manual intervention needed in application code
```

#### Getting a CSRF Token

- **Endpoint**: `GET /api/csrf-token`
- **Authentication**: Not required
- **Rate Limit**: 100 requests per 15 minutes (global API limit)
- **Response**: Sets `XSRF-TOKEN` cookie, returns token in JSON

#### Protected Methods

- ✅ POST, PUT, PATCH, DELETE - CSRF validation required
- ❌ GET, HEAD, OPTIONS - No CSRF validation (safe methods)

### 3. Content Security Policy (CSP)

The application enforces a strict Content Security Policy via Helmet middleware:

```javascript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for React
    styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
    imgSrc: ["'self'", "data:", "https:"], // Allow images from self, data URLs, HTTPS
    connectSrc: ["'self'"], // API calls to same origin
    fontSrc: ["'self'"],
    objectSrc: ["'none'"], // Disable plugins
    frameSrc: ["'none'"], // Disable iframes
    upgradeInsecureRequests: [], // Upgrade HTTP to HTTPS
  },
});
```

**Note**: Adjust `scriptSrc` and `styleSrc` to remove `'unsafe-inline'` once build process supports nonces or hashes.

### 4. Additional Security Headers

The application sets the following security headers via Helmet:

- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Enable XSS filter in older browsers
- `Referrer-Policy: no-referrer` - Don't leak referrer information
- `Permissions-Policy` - Restrict browser features

### 5. CORS Configuration

Cross-Origin Resource Sharing is configured to allow requests only from trusted origins:

```javascript
cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, // Allow cookies
});
```

**Production**: Set `CLIENT_URL` environment variable to your frontend domain.

### 6. Authentication & Authorization

#### Supabase Authentication

- All protected endpoints require a valid Supabase JWT token
- Token is validated via `supabase.auth.getUser()` on each request
- Invalid or expired tokens result in 401 Unauthorized

#### Role-Based Access Control (RBAC)

- User roles stored in `user_roles` table
- RBAC middleware checks user role against required roles
- Unauthorized access results in 403 Forbidden

#### Row-Level Security (RLS)

- Database operations protected by Supabase RLS policies
- Enforced at the database layer as a final security gate
- Policies based on user role and ownership

### 7. Input Validation

All request inputs are validated using Zod schemas:

- Type checking and coercion
- Format validation (email, URL, etc.)
- Range checks (min/max length, values)
- Custom validation rules
- Invalid input results in 400 Bad Request with detailed error messages

## Security Best Practices

### Environment Variables

**Required Production Variables:**

```bash
# Server
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-frontend.vercel.app

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Per window
```

### Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure `CLIENT_URL` to your frontend domain
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Review and adjust rate limits for your traffic patterns
- [ ] Remove `'unsafe-inline'` from CSP once nonces/hashes are implemented
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Enable database connection pooling
- [ ] Configure proper logging (structured logs, log levels)
- [ ] Set up security headers validation (securityheaders.com)

### Development vs Production

**Development:**

- Secure cookies disabled (allows HTTP)
- CORS allows localhost:5173
- More permissive rate limits
- Detailed error messages

**Production:**

- Secure cookies enabled (HTTPS only)
- CORS restricted to production domain
- Stricter rate limits
- Generic error messages (no stack traces)

## Vulnerability Reporting

If you discover a security vulnerability in this application:

1. **Do not** open a public GitHub issue
2. Email security concerns to: [your-security-email@domain.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and provide a timeline for fixes.

## Security Auditing

### Audit Logs

All security-relevant actions are logged to the `audit_logs` table:

- Authentication attempts (success/failure)
- Authorization failures
- Content modifications
- Role changes
- Configuration changes
- Data exports

#### Viewing Audit Logs

- **UI**: Navigate to `/audit-logs` in the editorial console
- **Export**: Click "Export" button (CSV or JSON)
- **API**: `GET /api/audit?limit=100&offset=0`

#### Audit Log Retention

- Logs are retained indefinitely
- Table is append-only (no updates or deletes)
- Indexed by `user_id`, `action`, `resource_type`, `created_at`

### Security Monitoring

Recommended monitoring:

- Rate limit violations (check for sustained attacks)
- CSRF token mismatches (potential attack attempts)
- Authentication failures (brute force attempts)
- Authorization failures (privilege escalation attempts)
- Abnormal data access patterns

## Compliance

This security implementation addresses:

- **OWASP Top 10**: Injection, broken authentication, sensitive data exposure, XML external entities, broken access control, security misconfiguration, XSS, insecure deserialization, components with known vulnerabilities, insufficient logging
- **CWE Top 25**: Most dangerous software weaknesses
- **GDPR**: Audit trails, data protection, user consent
- **SOC 2**: Access controls, logging, monitoring

## Regular Security Updates

**Monthly Tasks:**

- [ ] Review npm audit results: `npm audit`
- [ ] Update dependencies: `npm update`
- [ ] Review audit logs for anomalies
- [ ] Review rate limit configurations

**Quarterly Tasks:**

- [ ] Security penetration testing
- [ ] Dependency security audit
- [ ] Access control review
- [ ] Incident response plan testing

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Rate Limiting Guide](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
