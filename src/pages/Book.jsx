import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Scissors, ChevronLeft, ChevronRight, Check, Clock, Calendar, CheckCircle2, Loader2, ArrowRight, ArrowLeft, MessageCircle, Info } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import SectionTitle from '../components/SectionTitle';
import { BUSINESS } from '../lib/business';
import supabase from '../lib/supabase';

const DEFAULT_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30'];

function ymd(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export default function Book() {
  const { t, dir, lang } = useLang();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const presetHairstyle = searchParams.get('hairstyle');
  const presetService = searchParams.get('service');
  const hasPreset = !!(presetHairstyle || presetService);
  const [step, setStep] = useState(hasPreset ? 0 : null);
  const [services, setServices] = useState([]);
  const [hairstyles, setHairstyles] = useState([]);
  const [avail, setAvail] = useState({ hours: [], closures: [] });
  const [monthOffset, setMonthOffset] = useState(0);
  const [selDate, setSelDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [sel, setSel] = useState({ service: null, time: null });
  const [info, setInfo] = useState({ name: '', phone: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase.from('services').select('*').order('sort_order', { ascending: true }).then(({ data }) => setServices(data || [])).catch(() => {});
    supabase.from('hairstyles').select('*').order('id', { ascending: true }).then(({ data }) => setHairstyles((data || []).map(h => ({ ...h, title: h.name })))).catch(() => {});
    Promise.all([
      supabase.from('availability_hours').select('*').order('day_of_week'),
      supabase.from('availability_closures').select('*').order('closed_date')
    ]).then(([h, c]) => setAvail({ hours: h.data || [], closures: c.data || [] })).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) setInfo(i => ({ ...i, email: user.email || i.email, name: i.name || user.user_metadata?.full_name || '' }));
  }, [user]);

  // Auto-select from URL param
  useEffect(() => {
    if (presetHairstyle && hairstyles.length > 0 && !sel.service) {
      const match = hairstyles.find(h => h.id === presetHairstyle);
      if (match) { setSel({ ...sel, service: match }); }
    }
  }, [presetHairstyle, hairstyles]);

  useEffect(() => {
    if (presetService && services.length > 0 && !sel.service) {
      const match = services.find(s => s.id === presetService);
      if (match) { setSel({ ...sel, service: match }); }
    }
  }, [presetService, services]);

  useEffect(() => {
    if (!selDate) return;
    supabase.from('bookings').select('booking_time').eq('booking_date', selDate).in('status', ['confirmed', 'in_progress'])
      .then(({ data }) => setBookedSlots((data || []).map(b => b.booking_time)))
      .catch(() => setBookedSlots([]));
  }, [selDate]);

  const closureSet = useMemo(() => new Set(avail.closures.map(c => c.closed_date)), [avail.closures]);
  const hoursByDay = useMemo(() => { const m = {}; avail.hours.forEach(h => m[h.day_of_week] = h); return m; }, [avail.hours]);

  const today = new Date(); today.setHours(0,0,0,0);
  const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

  const isBlocked = (d) => {
    if (d < today) return true;
    const key = ymd(d);
    if (closureSet.has(key)) return true;
    const dh = hoursByDay[d.getDay()];
    if (dh && dh.is_closed) return true;
    return false;
  };

  const slotsForDate = () => {
    if (!selDate) return [];
    const d = new Date(selDate + 'T00:00:00');
    const dh = hoursByDay[d.getDay()];
    if (dh && dh.is_closed) return [];
    let base = DEFAULT_SLOTS;
    if (dh && dh.open_time && dh.close_time) {
      base = DEFAULT_SLOTS.filter(s => s >= dh.open_time.slice(0, 5) && s < dh.close_time.slice(0, 5));
    }
    const now = new Date();
    const isToday = ymd(now) === selDate;
    if (isToday) {
      const cutoff = new Date(now.getTime() + 30 * 60000);
      const hh = String(cutoff.getHours()).padStart(2, '0') + ':' + String(cutoff.getMinutes()).padStart(2, '0');
      base = base.filter(s => s >= hh);
    }
    return base;
  };

  const availableSlots = () => slotsForDate().filter(s => !bookedSlots.includes(s));

  const monthLabel = monthDate.toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'en' ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' });
  const dow = lang === 'ar' ? ['أحد','إثن','ثلا','أرب','خمي','جمع','سبت'] : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

  const confirm = async () => {
    setErr('');
    if (!info.name.trim() || !info.phone.trim()) { setErr(t.common.name + ' + ' + t.common.phone); return; }
    setSubmitting(true);
    try {
      const ref = 'HTB-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.random().toString(36).slice(2, 5).toUpperCase();
      const { data, error } = await supabase.from('bookings').insert({
        reference: ref,
        service_name: sel.service.title, service_id: sel.service.id, booking_date: selDate, booking_time: sel.time,
        customer_name: info.name, customer_phone: info.phone, customer_email: info.email || null, notes: info.notes || null,
        barber_id: sel.service.barber_id || null, user_id: user?.id || null,
      }).select().single();
      if (!error) {
        setDone(data);
      } else {
        setErr(error.message || 'Error');
      }
    } catch { setErr('Error'); } finally { setSubmitting(false); }
  };

  const selectForBooking = (item) => {
    setSel({ ...sel, service: item });
    setStep(0);
  };

  if (done) {
    return (
      <div className="pt-[92px] min-h-screen flex items-center justify-center px-6">
        <div className="luxe-card rounded-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[color:var(--color-gold)]/15 flex items-center justify-center mb-6"><CheckCircle2 size={34} className="text-[color:var(--color-gold)]" /></div>
          <h2 className="font-display text-3xl font-bold text-[color:var(--color-bone)]">{t.booking.success}</h2>
          <p className="mt-3 text-[color:var(--color-ash)]">{t.booking.successSub}</p>
          <div className="mt-6 border border-[color:var(--color-line)] rounded-lg p-5 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-[color:var(--color-ash)]">{t.booking.ref}</span><span className="text-[color:var(--color-gold)] font-mono font-semibold">{done.reference}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[color:var(--color-ash)]">{t.booking.chooseService}</span><span className="text-[color:var(--color-bone)]">{done.service_name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[color:var(--color-ash)]">{t.booking.chooseDate}</span><span className="text-[color:var(--color-bone)]">{done.booking_date}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[color:var(--color-ash)]">{t.booking.chooseTime}</span><span className="text-[color:var(--color-bone)]">{done.booking_time}</span></div>
          </div>
          <a href={BUSINESS.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-[#062b16] py-3.5 rounded-sm text-sm font-bold uppercase tracking-wider hover:brightness-110 transition">
            <MessageCircle size={18} /> {t.booking.sendWhatsApp}
          </a>
          <div className="mt-6 flex gap-3">
            <button onClick={() => { setDone(null); setStep(null); setSelDate(null); setSel({ service: null, time: null }); }} className="flex-1 border border-[color:var(--color-line)] text-[color:var(--color-bone)] py-3 rounded-sm text-sm uppercase tracking-wider hover:border-[color:var(--color-gold)] transition">{t.booking.newBooking}</button>
            <Link to="/" className="flex-1 btn-gold py-3 rounded-sm text-sm uppercase tracking-wider text-center">{t.nav.home}</Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [t.booking.chooseDate, t.booking.chooseTime, t.booking.yourInfo];
  const canNext = (step === 0 && selDate) || (step === 1 && sel.time);

  return (
    <div className="pt-[92px]">
      <section className="py-16 px-6 sm:px-8 text-center border-b border-[color:var(--color-line)]">
        <SectionTitle overline={t.booking.title} title={t.booking.title} subtitle={t.booking.sub} />
      </section>
      <section className="py-12 px-6 sm:px-8 max-w-3xl mx-auto">
        {/* Services row */}
        {services.length > 0 && (
          <div className="mb-8">
            <h3 className="text-center text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-4">{t.booking.tabServices}</h3>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
              {services.map(s => (
                <div key={s.id} className="shrink-0 w-36 sm:w-44">
                  <button onClick={() => selectForBooking(s)} className={`w-full text-left group block luxe-card rounded-lg overflow-hidden transition-all ${sel.service?.id === s.id && sel.service?.title === s.title ? '!border-[color:var(--color-gold)] ring-1 ring-[color:var(--color-gold)]' : ''}`}>
                    <div className="aspect-[4/5] bg-[color:var(--color-smoke)] overflow-hidden relative">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={28} /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-ink)] via-transparent to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-3">
                        {s.category && <div className="text-[8px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-0.5">{s.category}</div>}
                        <h4 className="font-display text-sm font-semibold text-[color:var(--color-bone)] truncate">{s.title}</h4>
                      </div>
                      {sel.service?.id === s.id && sel.service?.title === s.title && (
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[color:var(--color-gold)] flex items-center justify-center"><Check size={12} className="text-[color:var(--color-ink)]" /></div>
                      )}
                    </div>
                  </button>
                  <Link to={`/service/${s.id}`} className="block text-center text-[10px] text-[color:var(--color-ash)] hover:text-[color:var(--color-gold)] py-1.5 transition-colors">
                    <Info size={11} className="inline mr-1 -mt-0.5" />{dir === 'rtl' ? 'التفاصيل' : dir === 'en' ? 'Details' : 'Détails'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hairstyles row */}
        {hairstyles.length > 0 && (
          <div className="mb-10">
            <h3 className="text-center text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-4">{t.booking.tabHairstyles}</h3>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
              {hairstyles.map(h => (
                <div key={h.id} className="shrink-0 w-36 sm:w-44">
                  <button onClick={() => selectForBooking(h)} className={`w-full text-left group block luxe-card rounded-lg overflow-hidden transition-all ${sel.service?.id === h.id && sel.service?.title === h.title ? '!border-[color:var(--color-gold)] ring-1 ring-[color:var(--color-gold)]' : ''}`}>
                    <div className="aspect-[4/5] bg-[color:var(--color-smoke)] overflow-hidden relative">
                      {h.image_url ? (
                        <img src={h.image_url} alt={h.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={28} /></div>
                      )}
                      {h.video_url && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[color:var(--color-ink)]/70 flex items-center justify-center"><span className="text-[8px] text-[color:var(--color-gold)] font-bold">▶</span></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-ink)] via-transparent to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-3">
                        {h.category && <div className="text-[8px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-0.5">{h.category}</div>}
                        <h4 className="font-display text-sm font-semibold text-[color:var(--color-bone)] truncate">{h.name}</h4>
                      </div>
                      {sel.service?.id === h.id && sel.service?.title === h.title && (
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[color:var(--color-gold)] flex items-center justify-center"><Check size={12} className="text-[color:var(--color-ink)]" /></div>
                      )}
                    </div>
                  </button>
                  <Link to={`/hairstyle/${h.id}`} className="block text-center text-[10px] text-[color:var(--color-ash)] hover:text-[color:var(--color-gold)] py-1.5 transition-colors">
                    <Info size={11} className="inline mr-1 -mt-0.5" />{dir === 'rtl' ? 'التفاصيل' : dir === 'en' ? 'Details' : 'Détails'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step indicators + stepper (only when item selected) */}
        {step !== null && sel.service && (
          <>
            <div className="flex items-center justify-between mb-10">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${i < step ? 'bg-[color:var(--color-gold)] text-[color:var(--color-ink)]' : i === step ? 'border-2 border-[color:var(--color-gold)] text-[color:var(--color-gold)]' : 'border border-[color:var(--color-line)] text-[color:var(--color-ash)]'}`}>{i < step ? <Check size={16} /> : i + 1}</div>
                    <span className="hidden sm:block text-[10px] uppercase tracking-wide mt-2 text-[color:var(--color-ash)] text-center max-w-[80px]">{s}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-[color:var(--color-gold)]' : 'bg-[color:var(--color-line)]'}`} />}
                </div>
              ))}
            </div>

            <div className="mb-6 luxe-card rounded-lg p-4 flex items-center gap-3 text-sm">
              <Scissors size={16} className="text-[color:var(--color-gold)] shrink-0" />
              <span className="text-[color:var(--color-bone)] font-medium">{sel.service.title}</span>
              {sel.service.price && <span className="text-[color:var(--color-gold)] ml-auto">{sel.service.price} DA</span>}
            </div>

            {/* STEP 0 — DATE */}
            {step === 0 && (
              <div className="luxe-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <button disabled={monthOffset === 0} onClick={() => setMonthOffset(m => Math.max(0, m - 1))} className="w-9 h-9 rounded-full border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-bone)] disabled:opacity-30"><ChevronLeft size={18} /></button>
                  <h3 className="font-display text-lg font-semibold text-[color:var(--color-bone)] capitalize">{monthLabel}</h3>
                  <button disabled={monthOffset >= 3} onClick={() => setMonthOffset(m => Math.min(3, m + 1))} className="w-9 h-9 rounded-full border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-bone)] disabled:opacity-30"><ChevronRight size={18} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">{dow.map(d => <div key={d} className="text-center text-[10px] uppercase tracking-wide text-[color:var(--color-ash)] py-1">{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), i + 1);
                    const key = ymd(d);
                    const blocked = isBlocked(d);
                    const active = selDate === key;
                    return (
                      <button key={key} disabled={blocked} onClick={() => { setSelDate(key); setSel(s => ({ ...s, time: null })); }}
                        className={`aspect-square rounded-md text-sm flex items-center justify-center transition-colors ${active ? 'btn-gold font-bold' : blocked ? 'text-[color:var(--color-line)] cursor-not-allowed line-through' : 'text-[color:var(--color-bone)] hover:bg-[color:var(--color-smoke)] border border-transparent hover:border-[color:var(--color-gold)]'}`}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[color:var(--color-ash)] mt-5 text-center">{t.booking.pickDate}</p>
              </div>
            )}

            {/* STEP 1 — TIME */}
            {step === 1 && (
              <div>
                {availableSlots().length === 0 ? (
                  <div className="luxe-card rounded-lg py-16 text-center"><Clock className="mx-auto text-[color:var(--color-line)] mb-3" size={40} /><p className="text-[color:var(--color-ash)]">{t.booking.noSlots}</p></div>
                ) : (
                  <>
                    <p className="text-center text-xs text-[color:var(--color-ash)] mb-5">{t.booking.onlyAvailable}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots().map(slot => {
                        const active = sel.time === slot;
                        return (
                          <button key={slot} onClick={() => setSel({ ...sel, time: slot })}
                            className={`py-3 rounded-md text-sm transition-colors ${active ? 'btn-gold font-semibold' : 'border border-[color:var(--color-line)] text-[color:var(--color-bone)] hover:border-[color:var(--color-gold)]'}`}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 2 — INFO */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="luxe-card rounded-lg p-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <span className="flex items-center gap-2 text-[color:var(--color-bone)]"><Scissors size={15} className="text-[color:var(--color-gold)]"/> {sel.service?.title}</span>
                  <span className="flex items-center gap-2 text-[color:var(--color-bone)]"><Calendar size={15} className="text-[color:var(--color-gold)]"/> {selDate}</span>
                  <span className="flex items-center gap-2 text-[color:var(--color-bone)]"><Clock size={15} className="text-[color:var(--color-gold)]"/> {sel.time}</span>
                </div>
                <input value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} placeholder={`${t.common.name} *`} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                <input value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} placeholder={`${t.common.phone} *`} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                <input value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} placeholder={`${t.common.email} (${t.common.optional})`} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                <textarea value={info.notes} onChange={e => setInfo({ ...info, notes: e.target.value })} placeholder={`${t.common.notes} (${t.common.optional})`} rows={3} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" />
                {!user && <p className="text-xs text-[color:var(--color-ash)] text-center">{t.auth.optional} <Link to="/login" className="text-[color:var(--color-gold)]">{t.auth.signin}</Link></p>}
                {err && <p className="text-sm text-red-400 text-center">{err}</p>}
              </div>
            )}

            {/* NAV */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <button onClick={() => { if (step === 0) { setStep(null); setSel({ ...sel, time: null }); } else setStep(s => s - 1); }} className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] transition">
                <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} /> {t.booking.back}
              </button>
              {step < 2 ? (
                <button onClick={() => canNext && setStep(s => s + 1)} disabled={!canNext} className="inline-flex items-center gap-2 btn-gold px-8 py-3.5 rounded-sm text-sm font-semibold uppercase tracking-wider disabled:opacity-40 transition">
                  {t.booking.next} <ArrowRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
              ) : (
                <button onClick={confirm} disabled={submitting} className="inline-flex items-center gap-2 btn-gold px-8 py-3.5 rounded-sm text-sm font-semibold uppercase tracking-wider disabled:opacity-60 transition">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t.booking.confirm}
                </button>
              )}
            </div>
          </>
        )}

        {/* Nothing selected — prompt */}
        {step === null && (
          <div className="text-center py-8">
            <p className="text-sm text-[color:var(--color-ash)]">{dir === 'rtl' ? 'اختر خدمة أو قصة من المعرض أعلاه للمتابعة' : dir === 'en' ? 'Select a service or hairstyle from the gallery above to continue' : 'Sélectionnez un service ou une coiffure dans la galerie ci-dessus pour continuer'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
