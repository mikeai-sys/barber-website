import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

function genRef() { return 'CMD-' + Math.random().toString(36).slice(2, 7).toUpperCase(); }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    // Placing an order is open to everyone (guest checkout)
    if (req.method === 'POST') {
      const b = req.body;
      if (!b.customer_name || !b.customer_phone || !b.items || !b.items.length) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const row = { ...b, reference: genRef(), status: 'pending' };
      const { data, error } = await supabase.from('orders').insert(row).select().single();
      if (error) throw error;
      const itemsTxt = (data.items || []).map(i => `${i.name} ×${i.qty}`).join(', ');
      await supabase.from('notifications').insert({
        type: 'order',
        title: 'Nouvelle commande',
        body: `${data.customer_name} — ${itemsTxt} (${data.total} DA)`,
        phone: data.customer_phone,
        ref_id: data.id,
      });
      return res.status(201).json(data);
    }
    // Reading a user's own orders (by user_id) is allowed; reading ALL requires admin
    if (req.method === 'GET') {
      const { user_id } = req.query;
      if (user_id) {
        const { data, error } = await supabase.from('orders').select('*').eq('user_id', user_id).order('id', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      const auth = await requireAdmin(req);
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
      const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    // Updating / deleting orders is admin-only
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('orders').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('orders').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
