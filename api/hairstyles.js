import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

// Convert empty strings to null for numeric columns so Postgres accepts them.
function clean(body) {
  const out = { ...body };
  ['price', 'duration', 'sort_order'].forEach(k => {
    if (out[k] === '' || out[k] === undefined) out[k] = null;
    else if (out[k] !== null) out[k] = Number(out[k]);
  });
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('hairstyles').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    if (req.method === 'POST') {
      const { data, error } = await supabase.from('hairstyles').insert(clean(req.body)).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('hairstyles').update(clean(rest)).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('hairstyles').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
