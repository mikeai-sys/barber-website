import { BUSINESS } from './business';

// Free notification channel for Algeria (no electronic payment / paid APIs):
// build a WhatsApp click-to-chat link to the barber's number with the
// booking/order details pre-filled. The customer taps "send" and it lands
// straight in the barber's WhatsApp. Also builds a mailto fallback.

function encode(text) {
  return encodeURIComponent(text);
}

export function bookingWhatsApp(b, lang = 'fr') {
  const L = {
    fr: { h: '📅 NOUVELLE RÉSERVATION — HAYTEM BARBER', ref: 'Référence', svc: 'Prestation', date: 'Date', time: 'Heure', name: 'Client', phone: 'Téléphone', notes: 'Notes' },
    ar: { h: '📅 حجز جديد — HAYTEM BARBER', ref: 'المرجع', svc: 'الخدمة', date: 'التاريخ', time: 'الوقت', name: 'الزبون', phone: 'الهاتف', notes: 'ملاحظات' },
    en: { h: '📅 NEW BOOKING — HAYTEM BARBER', ref: 'Reference', svc: 'Service', date: 'Date', time: 'Time', name: 'Client', phone: 'Phone', notes: 'Notes' },
  }[lang] || {};
  const lines = [
    L.h, '',
    `${L.ref}: ${b.reference || '-'}`,
    `${L.svc}: ${b.service_name}`,
    `${L.date}: ${b.booking_date}`,
    `${L.time}: ${b.booking_time}`,
    `${L.name}: ${b.customer_name}`,
    `${L.phone}: ${b.customer_phone}`,
    b.notes ? `${L.notes}: ${b.notes}` : '',
  ].filter(Boolean);
  return `https://wa.me/${BUSINESS.phoneRaw}?text=${encode(lines.join('\n'))}`;
}

export function orderWhatsApp(o, lang = 'fr') {
  const L = {
    fr: { h: '🛒 NOUVELLE COMMANDE — HAYTEM BARBER', ref: 'Référence', name: 'Client', phone: 'Téléphone', addr: 'Adresse', items: 'Articles', total: 'Total', notes: 'Notes' },
    ar: { h: '🛒 طلب جديد — HAYTEM BARBER', ref: 'المرجع', name: 'الزبون', phone: 'الهاتف', addr: 'العنوان', items: 'المنتجات', total: 'المجموع', notes: 'ملاحظات' },
    en: { h: '🛒 NEW ORDER — HAYTEM BARBER', ref: 'Reference', name: 'Client', phone: 'Phone', addr: 'Address', items: 'Items', total: 'Total', notes: 'Notes' },
  }[lang] || {};
  const itemLines = (o.items || []).map(i => `  • ${i.name} ×${i.qty} — ${i.price * i.qty} DA`).join('\n');
  const lines = [
    L.h, '',
    `${L.ref}: ${o.reference || '-'}`,
    `${L.name}: ${o.customer_name}`,
    `${L.phone}: ${o.customer_phone}`,
    o.address ? `${L.addr}: ${o.address}` : '',
    '',
    `${L.items}:`,
    itemLines,
    '',
    `${L.total}: ${o.total} DA`,
    o.notes ? `${L.notes}: ${o.notes}` : '',
  ].filter(Boolean);
  return `https://wa.me/${BUSINESS.phoneRaw}?text=${encode(lines.join('\n'))}`;
}

export function mailtoLink(email, subject, body) {
  if (!email) return null;
  return `mailto:${email}?subject=${encode(subject)}&body=${encode(body)}`;
}

// Opens the WhatsApp chat in a new tab (works inside preview iframes too).
export function openWhatsApp(url) {
  try { window.open(url, '_blank', 'noopener,noreferrer'); } catch { /* ignore */ }
}
