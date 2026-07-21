import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

// Manages working hours, closed days and vacation dates
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const [hours, closures] = await Promise.all([
        supabase.from('working_hours').select('*').order('day_of_week', { ascending: true }),
        supabase.from('closures').select('*').order('closed_date', { ascending: true }),
      ]);
      if (hours.error) throw hours.error;
      if (closures.error) throw closures.error;
      return res.status(200).json({ hours: hours.data, closures: closures.data });
    }
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    if (req.method === 'PUT') {
      // update a working_hours row by day_of_week
      const { day_of_week, ...rest } = req.body;
      const { data, error } = await supabase.from('working_hours').upsert({ day_of_week, ...rest }, { onConflict: 'day_of_week' }).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      // add a closure/vacation
      const { closed_date, reason } = req.body;
      const { data, error } = await supabase.from('closures').insert({ closed_date, reason }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('closures').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
