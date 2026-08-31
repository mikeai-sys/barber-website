-- FIX_ADMIN_PANEL_DB_ONLY.sql
-- Run this in Supabase Dashboard > SQL Editor > New query
-- Makes abd2008ghafour@gmail.com admin and fixes adding other admins via panel (DB-only)

-- 1. Ensure table exists
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT true,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- 2. Bootstrap: disable RLS, insert required admin, enable RLS
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can add admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON admin_users;

INSERT INTO admin_users (email, is_admin)
VALUES ('abd2008ghafour@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET is_admin = true;

-- 3. is_admin() = DB only (panel-managed)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email() AND is_admin = true);
END; $$;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- 4. add_admin / remove_admin for the panel (SECURITY DEFINER so they work via RLS)
CREATE OR REPLACE FUNCTION add_admin(target_email TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  norm TEXT := lower(trim(target_email));
BEGIN
  IF NOT is_admin() THEN RETURN json_build_object('error','Unauthorized: only admins can add new admins'); END IF;
  IF norm !~ '^[^@]+@[^@]+\.[^@]+$' THEN RETURN json_build_object('error','Invalid email'); END IF;
  INSERT INTO admin_users (email, is_admin) VALUES (norm, true) ON CONFLICT (email) DO UPDATE SET is_admin = true;
  RETURN json_build_object('ok', true);
EXCEPTION WHEN others THEN RETURN json_build_object('error', SQLERRM);
END; $$;
GRANT EXECUTE ON FUNCTION add_admin(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION remove_admin(target_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN RETURN json_build_object('error','Unauthorized'); END IF;
  IF (SELECT count(*) FROM admin_users WHERE is_admin = true) <= 1 THEN RETURN json_build_object('error','Cannot remove last admin'); END IF;
  UPDATE admin_users SET is_admin = false WHERE id = target_id;
  RETURN json_build_object('ok', true);
END; $$;
GRANT EXECUTE ON FUNCTION remove_admin(UUID) TO authenticated;

-- 5. Re-enable RLS with DB-only policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT USING (is_admin());
CREATE POLICY "Admins can add admin users" ON admin_users FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update admin users" ON admin_users FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete admin users" ON admin_users FOR DELETE USING (is_admin());

-- 6. Verify
SELECT * FROM admin_users ORDER BY created_at;
