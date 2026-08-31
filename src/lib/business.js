export async function checkIsAdmin(email) {
  if (!email) return false;
  try {
    const { supabase } = await import('./supabase');
    const norm = email.toLowerCase().trim();
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('email', norm)
      .eq('is_admin', true)
      .single();
    console.log('[checkIsAdmin]', norm, { data, error: error?.message, code: error?.code });
    return !error && data?.is_admin === true;
  } catch (e) {
    console.log('[checkIsAdmin] catch', e);
    return false;
  }
}

// Confirmed real business information ONLY. Do not invent.
export const BUSINESS = {
  name: 'HAYTEM BARBER',
  owner: 'Haytem Mehazzem',
  phone: '+213 675 16 11 87',
  phoneRaw: '213675161187',
  whatsapp: 'https://wa.me/213675161187',
  instagram: 'https://www.instagram.com/haytem_br_1',
  facebook: 'https://www.facebook.com/haytem.mehazzem.39',
  tiktok: 'https://www.tiktok.com/@haytemmehazzem',
  maps: 'https://maps.app.goo.gl/E11tAiMQUmmpSEc56',
  country: 'Algeria',
  city: 'Grarem Gouga',
};
