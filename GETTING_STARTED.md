# ✅ Database Migrations Complete - Next Steps

Great! Your database is now set up with all 10 migrations. Here's what to do next:

## 🎯 Current Status

✅ **Supabase URL**: Configured  
✅ **Supabase Anon Key**: Configured  
✅ **Supabase Service Role Key**: Configured  
✅ **Supabase JWT Secret**: Configured  
✅ **Database Migrations**: Completed (10/10)  
⚠️ **Resend API Key**: Not configured (optional - only needed for emails)

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

---

## 🚀 Step 2: Start the Application

You need to run both the backend and frontend servers.

### Option A: Run Both Servers Concurrently (Recommended)

```bash
npm run dev
```

This will start:

- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173`

### Option B: Run Servers Separately

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend (from project root):**

```bash
npm run dev
```

---

## 🔐 Step 3: Create Your First Admin User

1. **Open the frontend**: http://localhost:5173

2. **Sign Up** using Supabase Auth:
   - Click "Sign Up" or go to login page
   - Create an account with your email
   - Verify your email (check Supabase inbox if needed)

3. **Get your User ID**:
   - Go to: https://app.supabase.com/project/rkgfdygvjnpqbhraaxsk/editor
   - Open the `auth.users` table
   - Copy your `id` (UUID)

4. **Assign Admin Role** (run in Supabase SQL Editor):

```sql
-- Replace 'your-user-id-here' with your actual user ID
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-here', 'Admin');
```

5. **Refresh the app** - You now have full admin access! 🎉

---

## 🎨 Step 4: Explore the CMS

Once logged in as Admin, you can access:

### Dashboard (http://localhost:5173/dashboard)

- Content statistics
- Recent activity
- Workflow status
- User analytics

### Content Management (http://localhost:5173/content)

- View all content items
- Filter by status, type, author, date
- Search content
- Create new content

### Content Editor (http://localhost:5173/content/new)

- Create/edit content with metadata
- **Page Builder** - Drag-and-drop blocks:
  - Hero sections
  - Rich text content
  - Call-to-action buttons
  - Image galleries
  - Cards/grids
  - Accordions
  - Stats/metrics
  - Downloads
  - And more...
- Workflow actions (Submit, Approve, Publish)
- Content preview
- Version history

### Audit Logs (http://localhost:5173/audit-logs)

- View all system activity
- Filter by user, action, resource, date
- Export to CSV or JSON
- Security monitoring

---

## 🔍 Step 5: Verify Everything Works

### Check Backend Health

```bash
curl http://localhost:3001/health
```

Expected response: `{"status":"ok"}`

### Check CSRF Token

Open browser DevTools:

1. Go to http://localhost:5173
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Application** → **Cookies** → `http://localhost:3001`
4. Verify `XSRF-TOKEN` cookie exists ✅

### Test API Connection

```bash
# Get CSRF token
curl -i http://localhost:3001/api/csrf-token

# Should return 200 OK with token in response and cookie
```

---

## 📋 Database Tables Created

Your database now has these tables:

✅ **Core Tables:**

- `roles` - User roles (Author, Editor, Approver, Publisher, Admin)
- `permissions` - Role permissions
- `user_roles` - User role assignments
- `departments` - Organization departments

✅ **Content Tables:**

- `content_types` - Article, Page, News, etc.
- `content_items` - Main content storage
- `content_versions` - Version history with rollback

✅ **Workflow Tables:**

- `workflow_instances` - Workflow state tracking
- `workflow_steps` - Individual workflow steps
- Approval process and status tracking

✅ **Media Tables:**

- `media_assets` - File metadata and URLs
- `media_usage` - Track where media is used

✅ **Taxonomy Tables:**

- `taxonomy_terms` - Categories, tags, audiences, departments
- `content_taxonomy` - Content classification

✅ **Audit Tables:**

- `audit_logs` - Immutable activity log

✅ **Security:**

- Row-Level Security (RLS) enabled on all tables
- 40+ RLS policies enforcing permissions
- 50+ indexes for performance

---

## 🛠️ Troubleshooting

### Issue: "Cannot connect to backend"

**Check if backend is running:**

```bash
curl http://localhost:3001/health
```

If not running, start it:

```bash
cd server
npm run dev
```

### Issue: "Supabase connection error"

**Verify credentials in `.env`:**

- ✅ `VITE_SUPABASE_URL` matches your project URL
- ✅ `VITE_SUPABASE_ANON_KEY` is correct
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is correct
- ✅ `SUPABASE_JWT_SECRET` is correct

**Check Supabase project is active:**
https://app.supabase.com/project/rkgfdygvjnpqbhraaxsk

### Issue: "No admin access / Permission denied"

**Solution**: Make sure you inserted your user into `user_roles` table:

```sql
-- Check if your user has a role
SELECT * FROM user_roles WHERE user_id = 'your-user-id';

-- If empty, add Admin role
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'Admin');
```

### Issue: Port 3001 already in use

**Solution**: Kill the process or change the port:

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

---

## 📊 Test Your Security Features

### Test Rate Limiting

```bash
# Make 101 requests quickly (should hit limit)
for i in {1..101}; do
  curl http://localhost:3001/api/csrf-token
done

# Expected: First 100 succeed, 101st returns 429 Too Many Requests
```

### Test CSRF Protection

```bash
# Try POST without token (should fail)
curl -X POST http://localhost:3001/api/content \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# Expected: 403 Forbidden - Invalid CSRF token
```

Full testing guide: See `SECURITY_TESTING.md`

---

## 🎯 Quick Reference

| Service            | URL                                                   | Purpose                   |
| ------------------ | ----------------------------------------------------- | ------------------------- |
| Frontend           | http://localhost:5173                                 | Editorial Console         |
| Backend API        | http://localhost:3001                                 | REST API                  |
| Supabase Dashboard | https://app.supabase.com/project/rkgfdygvjnpqbhraaxsk | Database Management       |
| API Health Check   | http://localhost:3001/health                          | Verify backend is running |
| CSRF Token         | http://localhost:3001/api/csrf-token                  | Get security token        |

---

## 📚 Documentation

- **README.md** - Project overview and features
- **SECURITY.md** - Security features and configuration
- **SECURITY_TESTING.md** - Complete security testing guide
- **ENV_VARIABLES.md** - Environment variables guide
- **QUICK_START.md** - This file

---

## 🎉 You're Ready!

Everything is set up! To start developing:

1. ✅ Run `npm install`
2. ✅ Run `npm run dev` (both servers)
3. ✅ Open http://localhost:5173
4. ✅ Sign up / Login
5. ✅ Assign Admin role to your user
6. ✅ Start creating content!

**Next Steps:**

- Create your first content type
- Add some content items
- Test the Page Builder
- Explore the workflow system
- Check out the audit logs

Happy coding! 🚀
