import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

// video_url is stored in a side table `service_videos` (keyed by service_id)
// because the base `services` table has no video_url column.
async function attachVideos(rows) {
  const ids = rows.map(r => r.id);
  if (ids.length === 0) return rows;
  const { data: vids } = await supabase.from('service_videos').select('*').in('service_id', ids);
  const map = {};
  (vids || []).forEach(v => { map[v.service_id] = v.url; });
  return rows.map(r => ({ ...r, video_url: map[r.id] || null }));
}

function clean(body) {
  const out = { ...body };
  ['price', 'duration', 'sort_order'].forEach(k => {
    if (out[k] === '' || out[k] === undefined) out[k] = null;
    else if (out[k] !== null) out[k] = Number(out[k]);
  });
  return out;
}

async function setVideo(serviceId, url) {
  if (url) {
    await supabase.from('service_videos').upsert({ service_id: serviceId, url }, { onConflict: 'service_id' });
  } else {
    await supabase.from('service_videos').delete().eq('service_id', serviceId);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('services').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
      if (error) throw error;
      const withVideos = await attachVideos(data || []);
      return res.status(200).json(withVideos);
    }
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    if (req.method === 'POST') {
      const { video_url, ...rest } = req.body;
      const { data, error } = await supabase.from('services').insert(clean(rest)).select().single();
      if (error) throw error;
      await setVideo(data.id, video_url);
      return res.status(201).json({ ...data, video_url: video_url || null });
    }
    if (req.method === 'PUT') {
      const { id, video_url, ...rest } = req.body;
      const { data, error } = await supabase.from('services').update(clean(rest)).eq('id', id).select().single();
      if (error) throw error;
      if (video_url !== undefined) await setVideo(id, video_url);
      return res.status(200).json({ ...data, video_url: video_url ?? null });
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('services').delete().eq('id', req.body.id);
      if (error) throw error;
      await supabase.from('service_videos').delete().eq('service_id', req.body.id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
