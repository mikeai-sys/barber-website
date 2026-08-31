import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

function genRef() {
  return 'HB-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      // ?date=YYYY-MM-DD returns booked slots for that day; ?user_id returns user bookings; else all (admin)
      const { date, user_id } = req.query;
      if (date) {
        // public: only expose the times that are taken, not customer data
        const { data, error } = await supabase.from('bookings').select('booking_time').eq('booking_date', date).neq('status', 'cancelled');
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (user_id) {
        const { data, error } = await supabase.from('bookings').select('*').eq('user_id', user_id).order('booking_date', { ascending: true });
        if (error) throw error;
        return res.status(200).json(data);
      }
      const auth = await requireAdmin(req);
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
      const { data, error } = await supabase.from('bookings').select('*').order('booking_date', { ascending: true }).order('booking_time', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const b = req.body;
      if (!b.service_name || !b.booking_date || !b.booking_time || !b.customer_name || !b.customer_phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const d = new Date(b.booking_date + 'T00:00:00');
      const dow = d.getDay();
      const { data: closure } = await supabase.from('availability_closures').select('id').eq('closed_date', b.booking_date).limit(1);
      if (closure && closure.length > 0) return res.status(400).json({ error: 'Shop closed on this date' });
      const { data: hours } = await supabase.from('availability_hours').select('*').eq('day_of_week', dow).limit(1);
      const dh = hours && hours[0];
      if (dh) {
        if (dh.is_closed) return res.status(400).json({ error: 'Shop closed on this weekday' });
        if (dh.open_time && dh.close_time) {
          const t = b.booking_time.slice(0,5);
          if (t < dh.open_time.slice(0,5) || t >= dh.close_time.slice(0,5)) return res.status(400).json({ error: 'Time outside barber timetable' });
        }
      }
      const { data: existing } = await supabase.from('bookings').select('id').eq('booking_date', b.booking_date).eq('booking_time', b.booking_time).neq('status', 'cancelled');
      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Slot already booked' });
      }
      const row = { ...b, reference: genRef(), status: 'confirmed' };
      const { data, error } = await supabase.from('bookings').insert(row).select().single();
      if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Slot already booked' });
        throw error;
      }
      await supabase.from('notifications').insert({
        type: 'booking',
        title: 'Nouvelle réservation',
        body: `${data.customer_name} — ${data.service_name} le ${data.booking_date} à ${data.booking_time}`,
        phone: data.customer_phone,
        ref_id: data.id,
      });
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const targetId = req.body.id;
      const { status, user_id } = req.body;
      if (status === 'cancelled' && user_id) {
        const { data: booking } = await supabase.from('bookings').select('id, user_id').eq('id', targetId).single();
        if (booking && booking.user_id === user_id) {
          const { data, error } = await supabase.from('bookings').update({ status }).eq('id', targetId).select().single();
          if (error) throw error;
          return res.status(200).json(data);
        }
      }
      const auth = await requireAdmin(req);
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('bookings').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('bookings').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
