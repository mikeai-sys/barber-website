// Admin accounts that can access the dashboard.
export const ADMIN_EMAILS = ['admin@haytembarber.com', 'abd2008ghafour@gmail.com'];
export const isAdminEmail = (email) => ADMIN_EMAILS.includes(email);
// Backward compat
export const ADMIN_EMAIL = ADMIN_EMAILS[0];

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
