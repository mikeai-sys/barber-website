import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'PUT') {
      const { id, full_name, phone } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing user id' });
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id, full_name, phone }, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'GET') {
      const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return res.status(401).json({ error: 'Invalid token' });
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
}
