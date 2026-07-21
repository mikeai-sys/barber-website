import supabase from './db-client.js';

export const ADMIN_EMAILS = ['admin@haytembarber.com', 'abd2008ghafour@gmail.com'];

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email);
}

export async function requireAdmin(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return { ok: false, status: 401, error: 'Unauthorized' };
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { ok: false, status: 401, error: 'Invalid token' };
  if (!isAdminEmail(user.email)) return { ok: false, status: 403, error: 'Forbidden — admin only' };
  return { ok: true, user };
}
