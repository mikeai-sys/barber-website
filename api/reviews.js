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
        const { data, error } = await supabase.from('reviews').select('*').order('id', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('reviews').select('*').eq('approved', true).order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, rating, comment } = req.body;
      if (!name || !rating) return res.status(400).json({ error: 'Missing fields' });
      const { data, error } = await supabase.from('reviews').insert({ name, rating, comment, approved: false }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    const rAuth = await requireAdmin(req);
    if (!rAuth.ok) return res.status(rAuth.status).json({ error: rAuth.error });
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('reviews').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('reviews').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
