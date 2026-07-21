import { useEffect, useState } from 'react';
import { Phone, MessageCircle, Instagram, Facebook, Music2, MapPin, Mail, Clock, Send, Star, CheckCircle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { BUSINESS } from '../lib/business';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import supabase from '../lib/supabase';

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const [hours, setHours] = useState([]);
  const [content, setContent] = useState({});
  // reviews
  const [rv, setRv] = useState({ name: '', rating: 0, comment: '' });
  const [rvSent, setRvSent] = useState(false);

  useEffect(() => {
    supabase.from('availability_hours').select('*').order('day_of_week').then(({ data }) => setHours(data || [])).catch(() => {});
    supabase.from('site_content').select('*').then(({ data }) => {
      const m = {}; (data || []).forEach(r => m[r.key] = r.value); setContent(m);
    }).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!form.name.trim() || !form.message.trim()) { setErr(t.common.name + ' + ' + t.common.message); return; }
    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert(form);
      if (!error) { setSent(true); setForm({ name: '', phone: '', email: '', message: '' }); }
      else setErr('Error');
    } catch { setErr('Error'); } finally { setSending(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rv.name.trim() || !rv.rating) return;
    await supabase.from('reviews').insert(rv);
    setRvSent(true); setRv({ name: '', rating: 0, comment: '' });
  };

  const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const socials = [
    { icon: Phone, label: t.common.phone, value: BUSINESS.phone, href: `tel:${BUSINESS.phoneRaw}` },
    { icon: MessageCircle, label: 'WhatsApp', value: BUSINESS.phone, href: BUSINESS.whatsapp },
    { icon: Instagram, label: 'Instagram', value: '@haytem_br_1', href: BUSINESS.instagram },
    { icon: Facebook, label: 'Facebook', value: 'Haytem Mehazzem', href: BUSINESS.facebook },
    { icon: Music2, label: 'TikTok', value: '@haytemmehazzem', href: BUSINESS.tiktok },
    { icon: MapPin, label: t.sections.location, value: `${BUSINESS.city}, ${BUSINESS.country}`, href: BUSINESS.maps },
  ];

  return (
    <div className="pt-[92px]">
      <section className="py-20 px-6 sm:px-8 text-center border-b border-[color:var(--color-line)]">
        <SectionTitle overline={t.nav.contact} title={t.contact.title} subtitle={t.contact.sub} />
      </section>
      <section className="py-16 px-6 sm:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
        <Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {socials.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="luxe-card rounded-lg p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center shrink-0"><s.icon size={18} className="text-[color:var(--color-gold)]" /></div>
                <div className="min-w-0"><div className="text-[10px] tracking-luxe uppercase text-[color:var(--color-ash)]">{s.label}</div><div className="text-sm text-[color:var(--color-bone)] truncate">{s.value}</div></div>
              </a>
            ))}
            <div className="luxe-card rounded-lg p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center shrink-0"><Mail size={18} className="text-[color:var(--color-gold)]" /></div>
              <div className="min-w-0"><div className="text-[10px] tracking-luxe uppercase text-[color:var(--color-ash)]">{t.common.email}</div><div className="text-sm text-[color:var(--color-ash)]">{content.email || t.contact.emailEmpty}</div></div>
            </div>
          </div>
          <div className="luxe-card rounded-lg p-6 mt-4">
            <div className="flex items-center gap-2 mb-4"><Clock size={17} className="text-[color:var(--color-gold)]" /><h3 className="font-display text-lg font-semibold text-[color:var(--color-bone)]">{t.contact.hours}</h3></div>
            {hours.length === 0 ? <p className="text-sm text-[color:var(--color-ash)]">{t.contact.hoursEmpty}</p> : (
              <ul className="space-y-2">
                {hours.map(h => (
                  <li key={h.day_of_week} className="flex justify-between text-sm"><span className="text-[color:var(--color-ash)]">{days[h.day_of_week]}</span><span className="text-[color:var(--color-bone)]">{h.is_closed ? t.booking.closed : `${h.open_time || ''} — ${h.close_time || ''}`}</span></li>
                ))}
              </ul>
            )}
          </div>
          <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="luxe-card rounded-lg p-6 mt-4 flex items-center gap-4 hover:border-[color:var(--color-gold)]">
            <MapPin size={22} className="text-[color:var(--color-gold)]" /><div><div className="text-[color:var(--color-bone)] font-medium">{BUSINESS.city}, {BUSINESS.country}</div><div className="text-sm text-[color:var(--color-gold)]">Google Maps →</div></div>
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="luxe-card rounded-lg p-7">
            <h3 className="font-display text-2xl font-semibold text-[color:var(--color-bone)] mb-6">{t.contact.form}</h3>
            {sent ? (
              <div className="text-center py-10"><CheckCircle size={44} className="mx-auto text-[color:var(--color-gold)] mb-4" /><p className="text-[color:var(--color-bone)] font-medium">{t.contact.sent}</p><p className="text-sm text-[color:var(--color-ash)] mt-1">{t.contact.sentSub}</p></div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t.common.name} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t.common.phone} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={`${t.common.email} (${t.common.optional})`} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                </div>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t.common.message} rows={5} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" />
                {err && <p className="text-sm text-red-400">{err}</p>}
                <button disabled={sending} className="w-full btn-gold py-3.5 rounded-sm text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"><Send size={16} /> {t.common.send}</button>
              </form>
            )}
          </div>

          <div className="luxe-card rounded-lg p-7 mt-4">
            <h3 className="font-display text-xl font-semibold text-[color:var(--color-bone)] mb-2">{t.reviews.add}</h3>
            {rvSent ? (
              <p className="text-sm text-[color:var(--color-ash)] py-3">{t.reviews.thanks} {t.reviews.pending}</p>
            ) : (
              <form onSubmit={submitReview} className="space-y-4 mt-3">
                <input value={rv.name} onChange={e => setRv({ ...rv, name: e.target.value })} placeholder={t.reviews.yourName} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                <div className="flex gap-1">{[1,2,3,4,5].map(n => <button type="button" key={n} onClick={() => setRv({ ...rv, rating: n })}><Star size={26} className={n <= rv.rating ? 'text-[color:var(--color-gold)] fill-[color:var(--color-gold)]' : 'text-[color:var(--color-line)]'} /></button>)}</div>
                <textarea value={rv.comment} onChange={e => setRv({ ...rv, comment: e.target.value })} placeholder={t.reviews.yourReview} rows={3} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" />
                <button className="w-full border border-[color:var(--color-gold)] text-[color:var(--color-gold)] py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-[color:var(--color-gold)] hover:text-[color:var(--color-ink)] transition">{t.reviews.submit}</button>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
