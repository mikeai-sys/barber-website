import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

// Chat between a customer (identified by phone) and the shop owner (admin) ONLY.
// Customers never message each other. sender is 'customer' or 'admin'.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // --- Admin: list all conversation threads (grouped by phone) ---
    if (req.method === 'GET' && req.query.threads === '1') {
      const auth = await requireAdmin(req);
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
      const { data, error } = await supabase.from('chat_messages').select('*').order('id', { ascending: true });
      if (error) throw error;
      // unread counts from notifications (chat, unread)
      const { data: notifs } = await supabase.from('notifications').select('phone').eq('type', 'chat').eq('is_read', false);
      const unreadByPhone = {};
      (notifs || []).forEach(n => { unreadByPhone[n.phone] = (unreadByPhone[n.phone] || 0) + 1; });
      const byPhone = {};
      (data || []).forEach(m => {
        if (!byPhone[m.phone]) byPhone[m.phone] = { phone: m.phone, customer_name: m.customer_name, last: m.body, last_sender: m.sender, unread: 0 };
        byPhone[m.phone].last = m.body;
        byPhone[m.phone].last_sender = m.sender;
        if (m.customer_name) byPhone[m.phone].customer_name = m.customer_name;
      });
      Object.keys(byPhone).forEach(p => { byPhone[p].unread = unreadByPhone[p] || 0; });
      return res.status(200).json(Object.values(byPhone).reverse());
    }

    // --- Admin: read one thread by phone ---
    if (req.method === 'GET' && req.query.phone) {
      const auth = await requireAdmin(req);
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
      const { data, error } = await supabase.from('chat_messages').select('*').eq('phone', req.query.phone).order('id', { ascending: true });
      if (error) throw error;
      // mark chat notifications for this phone as read
      await supabase.from('notifications').update({ is_read: true }).eq('type', 'chat').eq('phone', req.query.phone);
      return res.status(200).json(data);
    }

    // --- Send a message ---
    if (req.method === 'POST') {
      const { phone, customer_name, sender, body } = req.body;
      if (!phone || !body || !sender) return res.status(400).json({ error: 'Missing fields' });
      if (sender === 'admin') {
        const auth = await requireAdmin(req);
        if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
      }
      const row = { phone, customer_name, sender, body };
      const { data, error } = await supabase.from('chat_messages').insert(row).select().single();
      if (error) throw error;
      // create an admin notification for customer messages
      if (sender === 'customer') {
        try {
          await supabase.from('notifications').insert({ type: 'chat', title: `Message de ${customer_name || phone}`, body, phone, is_read: false });
        } catch {}
      }
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
