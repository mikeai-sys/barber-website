import supabase from './supabase';

// Authenticated fetch — attaches the current session's access token so
// server-side admin checks (requireAdmin) succeed. Use for all admin mutations.
export async function authFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}
