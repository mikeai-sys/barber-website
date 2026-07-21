import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { all } = req.query;
      if (all) {
        const auth = await requireAdmin(req);
        if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
        const { data, error } = await supabase.from('banners').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    if (req.method === 'POST') {
      const { data, error } = await supabase.from('banners').insert(req.body).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('banners').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('banners').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
