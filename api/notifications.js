import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    // All notification access is admin-only
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('notifications').select('*').order('id', { ascending: false }).limit(100);
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      // mark one or all as read
      if (req.body.all) {
        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', req.body.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('notifications').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
