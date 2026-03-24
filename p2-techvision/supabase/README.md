# Supabase Setup Guide

## 1. Run the Schema

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Copy the entire contents of `schema.sql` and paste it into the editor.
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter).

The script is idempotent — it uses `create table if not exists` and `on conflict ... do nothing`, so it is safe to run multiple times.

## 2. Get Environment Variables

After running the schema, collect these values from the Supabase dashboard:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → Project API keys → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → Project API keys → `service_role` `secret` |

Copy them into your `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Keep `SUPABASE_SERVICE_ROLE_KEY` secret — it bypasses RLS and must never be exposed to the browser.

## 3. Set Up an Admin User

The admin role is enforced via a JWT claim. Follow these steps:

1. **Create the user** — Go to **Authentication → Users** in the dashboard and click **Add user**. Enter an email and password.

2. **Set the admin role** — Open the **SQL Editor** and run:
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
   where email = 'your-admin@email.com';
   ```
   Replace `your-admin@email.com` with the email you just created.

3. **Verify** — The user's JWT will now include `"role": "admin"` in the `app_metadata` claim, which satisfies all admin RLS policies (e.g., `(auth.jwt() ->> 'role') = 'admin'`).

> Note: Changes to `app_metadata` take effect on the next login or token refresh. Ask the admin to sign out and back in after applying the role.

## 4. Storage Buckets

The schema SQL creates two public storage buckets automatically:

| Bucket | Purpose |
|---|---|
| `post-images` | Thumbnails and inline images for news/blog posts |
| `portfolio-images` | Project screenshots and thumbnails for portfolio items |

You can verify they were created under **Storage** in the dashboard. Both buckets are public (read) with admin-only upload policies.
