import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'POST') {
      const { name, phone, email, message } = req.body;
      if (!name || !message) return res.status(400).json({ error: 'Missing fields' });
      const { data, error } = await supabase.from('messages').insert({ name, phone, email, message, is_read: false }).select().single();
      if (error) throw error;
      await supabase.from('notifications').insert({
        type: 'message',
        title: 'Nouveau message',
        body: `${name}: ${(message || '').slice(0, 60)}`,
        phone: phone || null,
        ref_id: data.id,
      });
      return res.status(201).json(data);
    }
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('messages').select('*').order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('messages').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
