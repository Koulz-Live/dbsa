# Security Testing Guide

This guide provides step-by-step instructions for testing the security features implemented in the DBSA CMS.

## Prerequisites

- Backend server running on `http://localhost:3001`
- Frontend running on `http://localhost:5173`
- A tool for making HTTP requests (curl, Postman, or Insomnia)
- Valid Supabase authentication credentials

## 1. Testing Rate Limiting

### Test 1.1: General API Rate Limit

**Objective**: Verify that the global API rate limit (100 requests per 15 minutes) is enforced.

**Steps**:

1. Open your terminal
2. Run the following script to make 101 requests quickly:

```bash
# macOS/Linux
for i in {1..101}; do
  curl -i http://localhost:3001/api/csrf-token
  echo "Request $i completed"
done
```

**Expected Result**:

- First 100 requests return `200 OK`
- 101st request returns `429 Too Many Requests`
- Response includes `Retry-After` header
- Response body: `{ "error": "Too many requests, please try again in 15 minutes" }`

**Verify Headers**:

```
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: [timestamp]
Retry-After: [seconds]
```

### Test 1.2: Authentication Rate Limit

**Objective**: Verify that login attempts are limited to 5 per 15 minutes.

**Steps**:

1. Create a test script to attempt login 6 times:

```bash
for i in {1..6}; do
  curl -i -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
  echo "\nAttempt $i completed\n"
done
```

**Expected Result**:

- First 5 requests return `401 Unauthorized` (wrong password)
- 6th request returns `429 Too Many Requests`
- Error message: "Too many login attempts. Please try again in 15 minutes."

**Note**: Only **failed** login attempts count toward the limit (successful logins don't increment the counter).

### Test 1.3: Content Modification Rate Limit

**Objective**: Verify that content modifications are limited to 30 per 15 minutes.

**Steps**:

1. Get a valid authentication token (login first)
2. Make 31 POST requests to create content:

```bash
TOKEN="your_supabase_jwt_token"

for i in {1..31}; do
  curl -i -X POST http://localhost:3001/api/content \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: your_csrf_token" \
    -d '{"title":"Test Content '$i'","content_type_id":"uuid","status":"draft"}'
  echo "\nRequest $i completed\n"
done
```

**Expected Result**:

- First 30 requests succeed (201 Created or other success status)
- 31st request returns `429 Too Many Requests`

### Test 1.4: Upload Rate Limit

**Objective**: Verify that media uploads are limited to 10 per hour.

**Steps**:

1. Make 11 requests to the upload URL endpoint:

```bash
TOKEN="your_supabase_jwt_token"

for i in {1..11}; do
  curl -i -X POST http://localhost:3001/api/media/upload-url \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: your_csrf_token" \
    -d '{"filename":"test'$i'.jpg","contentType":"image/jpeg"}'
  echo "\nUpload request $i completed\n"
done
```

**Expected Result**:

- First 10 requests return upload URL (200 OK)
- 11th request returns `429 Too Many Requests`
- Error message mentions 1-hour wait time

### Test 1.5: Export Rate Limit

**Objective**: Verify that audit log exports are limited to 5 per 15 minutes.

**Steps**:

```bash
TOKEN="your_supabase_jwt_token"

for i in {1..6}; do
  curl -i -X POST http://localhost:3001/api/audit/export \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: your_csrf_token" \
    -d '{"format":"csv"}'
  echo "\nExport request $i completed\n"
done
```

**Expected Result**:

- First 5 requests return export data
- 6th request returns `429 Too Many Requests`

## 2. Testing CSRF Protection

### Test 2.1: Request Without CSRF Token (Should FAIL)

**Objective**: Verify that state-changing requests without a CSRF token are rejected.

**Steps**:

```bash
TOKEN="your_supabase_jwt_token"

curl -i -X POST http://localhost:3001/api/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Content","content_type_id":"uuid","status":"draft"}'
```

**Expected Result**:

- Status: `403 Forbidden`
- Response body: `{ "error": "Invalid CSRF token" }`

### Test 2.2: Request With Invalid CSRF Token (Should FAIL)

**Objective**: Verify that requests with an invalid token are rejected.

**Steps**:

```bash
TOKEN="your_supabase_jwt_token"

curl -i -X POST http://localhost:3001/api/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: invalid_token_12345" \
  -d '{"title":"Test Content","content_type_id":"uuid","status":"draft"}'
```

**Expected Result**:

- Status: `403 Forbidden`
- Response body: `{ "error": "Invalid CSRF token" }`

### Test 2.3: Get CSRF Token

**Objective**: Successfully retrieve a CSRF token from the server.

**Steps**:

```bash
curl -i -c cookies.txt http://localhost:3001/api/csrf-token
```

**Expected Result**:

- Status: `200 OK`
- Response body: `{ "csrfToken": "64_character_hex_string" }`
- Cookie set: `XSRF-TOKEN=same_64_character_hex_string`
- Cookie attributes: `SameSite=Strict; Path=/; Max-Age=86400`

### Test 2.4: Request With Valid CSRF Token (Should SUCCEED)

**Objective**: Verify that requests with a valid token are accepted.

**Steps**:

1. First, get the token:

```bash
CSRF_TOKEN=$(curl -s -c cookies.txt http://localhost:3001/api/csrf-token | jq -r '.csrfToken')
echo "CSRF Token: $CSRF_TOKEN"
```

2. Make a POST request with the token:

```bash
TOKEN="your_supabase_jwt_token"

curl -i -b cookies.txt -X POST http://localhost:3001/api/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{"title":"Test Content","content_type_id":"uuid","status":"draft"}'
```

**Expected Result**:

- Status: `201 Created` (or other success code depending on validation)
- Content created successfully

### Test 2.5: CSRF on Safe Methods (Should NOT Require Token)

**Objective**: Verify that GET requests don't require CSRF tokens.

**Steps**:

```bash
TOKEN="your_supabase_jwt_token"

curl -i http://localhost:3001/api/content \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**:

- Status: `200 OK`
- Returns content list
- No CSRF token required

## 3. Testing CSRF Integration in Frontend

### Test 3.1: Verify Token Initialization

**Objective**: Confirm that the frontend fetches a CSRF token on app load.

**Steps**:

1. Open the frontend in your browser: `http://localhost:5173`
2. Open DevTools (F12)
3. Go to **Application** → **Cookies** → `http://localhost:3001`
4. Look for `XSRF-TOKEN` cookie

**Expected Result**:

- `XSRF-TOKEN` cookie is present
- Cookie value is a 64-character hexadecimal string
- Cookie attributes: `SameSite=Strict`, `Path=/`

### Test 3.2: Verify Automatic Token Injection

**Objective**: Confirm that the apiClient automatically includes the CSRF token in requests.

**Steps**:

1. Open the frontend: `http://localhost:5173`
2. Login and navigate to **Content List**
3. Click "Create New Content"
4. Open DevTools → **Network** tab
5. Fill in the form and click "Save"
6. Click on the POST request to `/api/content`
7. Go to **Headers** → **Request Headers**

**Expected Result**:

- Request includes `x-csrf-token` header
- Header value matches the `XSRF-TOKEN` cookie

### Test 3.3: Test Form Submission

**Objective**: End-to-end test of creating content with CSRF protection.

**Steps**:

1. Login to the frontend
2. Navigate to "Create New Content"
3. Fill in the form:
   - Title: "CSRF Test Content"
   - Content Type: Select any
   - Status: "Draft"
4. Submit the form

**Expected Result**:

- Content is created successfully
- No CSRF errors in console
- User redirected to content list or editor

## 4. Testing Security Headers

### Test 4.1: Verify Content Security Policy

**Objective**: Confirm that CSP headers are set correctly.

**Steps**:

```bash
curl -I http://localhost:3001/api/csrf-token
```

**Expected Headers**:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-src 'none'
```

### Test 4.2: Verify Additional Security Headers

**Objective**: Check that all Helmet security headers are present.

**Steps**:

```bash
curl -I http://localhost:3001/api/csrf-token
```

**Expected Headers**:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
```

## 5. Testing Authentication & Authorization

### Test 5.1: Unauthenticated Request (Should FAIL)

**Objective**: Verify that protected endpoints require authentication.

**Steps**:

```bash
curl -i http://localhost:3001/api/content
```

**Expected Result**:

- Status: `401 Unauthorized`
- Response: `{ "error": "Authentication required" }`

### Test 5.2: Invalid Token (Should FAIL)

**Objective**: Verify that invalid tokens are rejected.

**Steps**:

```bash
curl -i http://localhost:3001/api/content \
  -H "Authorization: Bearer invalid_token_12345"
```

**Expected Result**:

- Status: `401 Unauthorized`
- Response: `{ "error": "Invalid or expired token" }`

### Test 5.3: Valid Token (Should SUCCEED)

**Objective**: Verify that valid tokens grant access.

**Steps**:

1. Login via Supabase to get a valid token
2. Make a request:

```bash
TOKEN="your_valid_supabase_jwt"

curl -i http://localhost:3001/api/content \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**:

- Status: `200 OK`
- Returns content list

## 6. Testing Audit Logging

### Test 6.1: Verify Failed Login Logged

**Objective**: Confirm that failed login attempts are logged.

**Steps**:

1. Attempt a failed login
2. Query the audit logs:

```bash
TOKEN="your_admin_token"

curl -i http://localhost:3001/api/audit?action=auth.login_failed&limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**:

- Returns audit log entries with `action: "auth.login_failed"`
- Includes timestamp, IP address, user agent

### Test 6.2: Verify Content Creation Logged

**Objective**: Confirm that content creation is logged.

**Steps**:

1. Create a piece of content
2. Check audit logs:

```bash
TOKEN="your_token"

curl -i http://localhost:3001/api/audit?action=content.create&limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**:

- Returns audit entry with `action: "content.create"`
- Includes `user_id`, `resource_id`, `metadata`

## 7. Load Testing

### Test 7.1: Concurrent Requests

**Objective**: Test rate limiting under concurrent load.

**Steps**:

1. Install Apache Bench (if not installed):

```bash
# macOS
brew install httpd

# Linux
sudo apt-get install apache2-utils
```

2. Run load test:

```bash
# 200 requests with concurrency of 10
ab -n 200 -c 10 http://localhost:3001/api/csrf-token
```

**Expected Result**:

- First ~100 requests succeed
- Remaining requests return 429
- Server remains responsive

## 8. Penetration Testing Checklist

### Manual Security Tests

- [ ] **SQL Injection**: Try injecting SQL in form fields
- [ ] **XSS**: Try injecting JavaScript in content fields
- [ ] **Path Traversal**: Try accessing files with `../` in URLs
- [ ] **CSRF**: Try making requests from different origin
- [ ] **Brute Force**: Try exceeding rate limits
- [ ] **Session Hijacking**: Try using someone else's token
- [ ] **Privilege Escalation**: Try accessing admin endpoints as regular user
- [ ] **Token Replay**: Try reusing old/expired tokens

### Automated Security Scanning

Use tools like:

- **OWASP ZAP**: Web application security scanner
- **Burp Suite**: Security testing platform
- **npm audit**: Check for vulnerable dependencies
- **Snyk**: Continuous security monitoring

```bash
# Run npm audit
npm audit

# Fix vulnerabilities
npm audit fix
```

## 9. Common Issues & Troubleshooting

### Issue: CSRF Token Not Found

**Symptoms**: 403 errors on POST requests

**Solution**:

1. Check that cookies are enabled in browser
2. Verify `withCredentials: true` in apiClient
3. Check CORS configuration allows credentials
4. Ensure `initializeCsrfToken()` is called on app load

### Issue: Rate Limit Too Strict

**Symptoms**: Legitimate requests being blocked

**Solution**:
Adjust rate limits in `server/src/middleware/rateLimiter.ts`:

```typescript
export const contentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Increase from 30 to 50
  // ...
});
```

### Issue: CORS Errors

**Symptoms**: Network errors in browser console

**Solution**:

1. Verify `CLIENT_URL` environment variable matches frontend URL
2. Check `withCredentials: true` in apiClient
3. Ensure server CORS config includes `credentials: true`

## 10. Security Testing Report Template

After completing tests, document results:

```markdown
# Security Test Report - DBSA CMS

**Date**: [YYYY-MM-DD]
**Tester**: [Your Name]

## Test Results Summary

- Total Tests: X
- Passed: Y
- Failed: Z

## Rate Limiting Tests

| Test              | Status  | Notes                      |
| ----------------- | ------- | -------------------------- |
| General API Limit | ✅ Pass | 101st request returned 429 |
| Auth Limit        | ✅ Pass | 6th attempt blocked        |
| Content Limit     | ✅ Pass |                            |
| Upload Limit      | ✅ Pass |                            |
| Export Limit      | ✅ Pass |                            |

## CSRF Protection Tests

| Test          | Status  | Notes             |
| ------------- | ------- | ----------------- |
| No Token      | ✅ Pass | 403 Forbidden     |
| Invalid Token | ✅ Pass | 403 Forbidden     |
| Valid Token   | ✅ Pass | 201 Created       |
| Safe Methods  | ✅ Pass | No token required |

## Security Headers Tests

| Header                 | Present | Value   |
| ---------------------- | ------- | ------- |
| CSP                    | ✅      | [value] |
| X-Frame-Options        | ✅      | DENY    |
| X-Content-Type-Options | ✅      | nosniff |

## Issues Found

1. [Issue description]
   - **Severity**: High/Medium/Low
   - **Impact**: [description]
   - **Recommendation**: [fix]

## Recommendations

1. [Recommendation]
2. [Recommendation]
```

## Next Steps

After completing all tests:

1. ✅ Fix any issues found
2. ✅ Update rate limits if needed
3. ✅ Document any changes
4. ✅ Schedule regular security audits (monthly/quarterly)
5. ✅ Set up security monitoring alerts
6. ✅ Plan penetration testing with security professionals
