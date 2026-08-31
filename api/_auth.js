import supabase from './db-client.js';

export async function isAdminEmail(email) {
  if (!email) return false;
  const { data } = await supabase.from('admin_users').select('id').eq('email', email.toLowerCase().trim()).eq('is_admin', true).limit(1);
  return data && data.length > 0;
}

export async function requireAdmin(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return { ok: false, status: 401, error: 'Unauthorized' };
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { ok: false, status: 401, error: 'Invalid token' };
  if (!await isAdminEmail(user.email)) return { ok: false, status: 403, error: 'Forbidden — admin only' };
  return { ok: true, user };
}
