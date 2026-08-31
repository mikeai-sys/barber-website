import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Scissors, Sparkles, Image as ImageIcon, Star, FileText, Clock, LogOut, Plus, Trash2, Check, X, Loader2, Lock, ArrowLeft, Upload, Ban, Users, Bell, MessageCircle, Megaphone, Play, UserCog, ShoppingBag, Package } from 'lucide-react';
import supabase from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useToast } from '../contexts/ToastContext';
import Logo from '../components/Logo';

import { checkIsAdmin } from '../lib/business';

async function upload(file) {
  const path = `media/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type,
    upsert: true
  });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">{label}</span>
      <input {...props} className="mt-1 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
    </label>
  );
}

export default function Admin() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('[Admin] user', user?.email, 'loading', loading);
      if (user?.email) {
        const adminStatus = await checkIsAdmin(user.email);
        console.log('[Admin] isAdmin', adminStatus, 'for', user.email);
        setIsAdmin(adminStatus);
        setCheckingAdmin(false);
      } else {
        setIsAdmin(false);
        setCheckingAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  const login = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr(error.message);
    setBusy(false);
  };

  if (loading || checkingAdmin) return <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-ink)]"><Loader2 className="animate-spin text-[color:var(--color-gold)]" /></div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[color:var(--color-ink)]">
        <div className="luxe-card rounded-xl p-8 max-w-sm w-full">
          <div className="flex justify-center mb-6"><Logo size="lg" /></div>
          <div className="flex items-center justify-center gap-2 mb-6"><Lock size={16} className="text-[color:var(--color-gold)]" /><h1 className="font-display text-xl font-bold text-[color:var(--color-bone)]">{t.admin.title}</h1></div>
          <form onSubmit={login} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.auth.email} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder={t.auth.password} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
            {err && <p className="text-sm text-red-400">{err}</p>}
            {user && !isAdmin && <p className="text-xs text-red-400">Not authorized.</p>}
            <button disabled={busy} className="w-full btn-gold py-3 rounded-sm text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2">{busy && <Loader2 size={16} className="animate-spin" />} {t.auth.signin}</button>
          </form>
          <Link to="/" className="flex items-center justify-center gap-2 text-xs text-[color:var(--color-ash)] mt-5 hover:text-[color:var(--color-bone)]"><ArrowLeft size={13} /> {t.dashboard.backToSite}</Link>
        </div>
      </div>
    );
  }

  const primaryTabs = [
    { id: 'bookings', label: t.admin.bookings, icon: Calendar },
    { id: 'services', label: t.admin.services, icon: Scissors },
    { id: 'hairstyles', label: t.admin.hairstyles, icon: Sparkles },
    { id: 'products', label: t.admin.products, icon: ShoppingBag },
    { id: 'orders', label: t.admin.orders, icon: Package },
    { id: 'barbers', label: t.admin.team, icon: Users },
    { id: 'gallery', label: t.admin.gallery, icon: ImageIcon },
  ];
  const secondaryTabs = [
    { id: 'reviews', label: t.admin.reviews, icon: Star },
    { id: 'content', label: t.admin.content, icon: FileText },
    { id: 'availability', label: t.admin.availability, icon: Clock },
    { id: 'ads', label: 'Ads & Promos', icon: Megaphone },
    { id: 'users', label: t.admin.users, icon: UserCog },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[color:var(--color-ink)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-[color:var(--color-line)] md:p-6 md:min-h-screen">
        <div className="mb-8"><Logo /></div>
        <nav className="flex flex-col gap-1 flex-1">
          {[...primaryTabs, ...secondaryTabs].map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm whitespace-nowrap transition-colors ${tab === tb.id ? 'bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]' : 'text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]'}`}>
              <tb.icon size={17} /> {tb.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 pt-6 border-t border-[color:var(--color-line)] space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]"><ArrowLeft size={13} /> View site</Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-xs text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]"><LogOut size={13} /> Sign out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[color:var(--color-line)]">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="font-display text-base font-bold text-[color:var(--color-bone)]">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="w-9 h-9 rounded-full border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-ash)] hover:border-[color:var(--color-gold)]"><ArrowLeft size={16} /></Link>
          <button onClick={() => supabase.auth.signOut()} className="w-9 h-9 rounded-full border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-ash)] hover:text-red-400"><LogOut size={16} /></button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 overflow-x-hidden pb-24 md:pb-8">
        <div className="flex justify-end mb-4"><NotificationBar onOpenBookings={() => setTab('bookings')} /></div>
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'services' && <ServicesTab />}
        {tab === 'hairstyles' && <HairstylesTab />}
        {tab === 'barbers' && <BarbersTab />}
        {tab === 'gallery' && <GalleryTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'reviews' && <ReviewsTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'availability' && <AvailabilityTab />}
        {tab === 'ads' && <AdsTab />}
        {tab === 'users' && <UsersTab />}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[color:var(--color-charcoal)] border-t border-[color:var(--color-line)] px-1 pb-2">
        <div className="flex items-center justify-around">
          {primaryTabs.map(tb => (
            <button key={tb.id} onClick={() => { setTab(tb.id); setMoreOpen(false); }} className={`flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] uppercase tracking-wider transition-colors min-w-0 ${tab === tb.id ? 'text-[color:var(--color-gold)]' : 'text-[color:var(--color-ash)]'}`}>
              <tb.icon size={18} className={tab === tb.id ? 'text-[color:var(--color-gold)]' : ''} />
              <span className="truncate max-w-[60px]">{tb.label}</span>
            </button>
          ))}
          <div className="relative">
            <button onClick={() => setMoreOpen(o => !o)} className={`flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] uppercase tracking-wider transition-colors ${moreOpen ? 'text-[color:var(--color-gold)]' : 'text-[color:var(--color-ash)]'}`}>
              <span className={`text-lg font-bold leading-none ${moreOpen ? 'text-[color:var(--color-gold)]' : ''}`}>•••</span>
              <span>More</span>
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute bottom-14 right-0 luxe-card rounded-lg p-2 z-50 shadow-2xl min-w-[180px]">
                  {secondaryTabs.map(tb => (
                    <button key={tb.id} onClick={() => { setTab(tb.id); setMoreOpen(false); }} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm whitespace-nowrap transition-colors ${tab === tb.id ? 'bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]' : 'text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]'}`}>
                      <tb.icon size={17} /> {tb.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

function Header({ title, children }) {
  return <div className="flex items-center justify-between mb-6 flex-wrap gap-3"><h1 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{title}</h1>{children}</div>;
}

const WA_OWNER = '213675161187';

function NotificationBar({ onOpenBookings }) {
  const { t } = useLang();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const load = async () => {
    try {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) { console.warn('notifications:', error.message); return; }
      setNotifs(data || []);
    } catch {}
  };
  useEffect(() => {
    load();
    const channel = supabase.channel('admin-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        load();
        try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==').play().catch(() => {}); } catch {}
        if (window.Notification && Notification.permission === 'granted') {
          const n = payload.new;
          new Notification(n.title || 'HAYTEM BARBER', { body: n.body || '', icon: '/favicon.svg' });
        }
      }).subscribe();
    const iv = setInterval(load, 20000);
    if (window.Notification && Notification.permission === 'default') { try { Notification.requestPermission(); } catch {} }
    return () => { supabase.removeChannel(channel); clearInterval(iv); };
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;
  const markAll = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    load();
  };
  const goto = (n) => {
    setOpen(false);
    onOpenBookings();
  };

  return (
    <div className="flex justify-end mb-4 relative">
      <button onClick={() => { setOpen(o => !o); if (!open && unread) markAll(); }} className="relative w-11 h-11 rounded-full border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-bone)] hover:border-[color:var(--color-gold)] transition-colors">
        <Bell size={19} />
        {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-ink)] text-[11px] font-bold flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute top-13 right-0 mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto luxe-card rounded-lg z-50 shadow-2xl">
          <div className="p-3 border-b border-[color:var(--color-line)] flex items-center justify-between">
            <span className="text-sm font-medium text-[color:var(--color-bone)]">{t.admin.notifications}</span>
            {notifs.length > 0 && <button onClick={markAll} className="text-xs text-[color:var(--color-gold)]">{t.admin.markAllRead}</button>}
          </div>
          {notifs.length === 0 ? <div className="p-6 text-center text-sm text-[color:var(--color-ash)]">{t.admin.noNotifications}</div> : notifs.slice(0, 30).map(n => (
            <div key={n.id} className={`p-3 border-b border-[color:var(--color-line)]/50 flex items-start gap-3 ${!n.is_read ? 'bg-[color:var(--color-gold)]/[0.05]' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'message' ? 'bg-blue-500/10 text-blue-400' : 'bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]'}`}>
                {n.type === 'message' ? <Mail size={15} /> : <Calendar size={15} />}
              </div>
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => goto(n)}>
                <div className="text-sm text-[color:var(--color-bone)]">{n.title}</div>
                <div className="text-xs text-[color:var(--color-ash)] line-clamp-2">{n.body}</div>
                {n.phone && <a href={`https://wa.me/${n.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-[11px] text-green-400 mt-1"><MessageCircle size={11} /> WhatsApp</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_STYLE = {
  cancelled: 'bg-red-500/10 text-red-400',
  completed: 'bg-green-500/10 text-green-400',
  in_progress: 'bg-blue-500/15 text-blue-300',
  confirmed: 'bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]',
};

function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function BookingsTab() {
  const { t } = useLang();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const load = async () => {
    const { data } = await supabase.from('bookings').select('*').order('booking_date', { ascending: false });
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    load();
  };
  const del = async (id) => {
    await supabase.from('bookings').delete().eq('id', id);
    load();
  };
  if (loading) return <Loader2 className="animate-spin text-[color:var(--color-gold)]" />;

  const today = todayStr();
  const active = rows.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const todayRows = active.filter(b => b.booking_date === today).sort((a, b) => (a.booking_time || '').localeCompare(b.booking_time || ''));
  const upcoming = active.filter(b => b.booking_date > today).sort((a, b) => (a.booking_date + a.booking_time).localeCompare(b.booking_date + b.booking_time));
  const history = rows.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const list = tab === 'today' ? todayRows : tab === 'upcoming' ? upcoming : history;
  const inProgress = todayRows.find(b => b.status === 'in_progress');
  
  const STATUS_LABEL = { 
    cancelled: t.dashboard.statusCancelled, 
    completed: t.dashboard.statusCompleted, 
    in_progress: t.dashboard.statusInProgress, 
    confirmed: t.dashboard.statusConfirmed 
  };

  const Card = ({ b }) => (
    <div className={`luxe-card rounded-lg p-4 ${b.status === 'in_progress' ? '!border-blue-400/50' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-[color:var(--color-bone)]">{b.customer_name} <span className="text-[color:var(--color-ash)] text-sm">· {b.customer_phone}</span></div>
          <div className="text-sm text-[color:var(--color-ash)]">{b.service_name} — {b.booking_date} <span className="text-[color:var(--color-bone)] font-medium">{b.booking_time}</span> · <span className="font-mono text-[color:var(--color-gold)]">{b.reference}</span></div>
          {b.notes && <div className="text-xs text-[color:var(--color-ash)]/70 mt-1">{b.notes}</div>}
        </div>
        <span className={`text-[10px] uppercase px-2 py-1 rounded-full shrink-0 ${STATUS_STYLE[b.status] || STATUS_STYLE.confirmed}`}>{STATUS_LABEL[b.status] || b.status}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[color:var(--color-line)]">
        {b.status === 'confirmed' && (
          <button onClick={() => setStatus(b.id, 'in_progress')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-blue-400/40 text-blue-300 text-xs font-semibold uppercase tracking-wider hover:bg-blue-400/10 transition"><Play size={13} /> {t.admin.startSession}</button>
        )}
        {(b.status === 'confirmed' || b.status === 'in_progress') && (
          <button onClick={() => setStatus(b.id, 'completed')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-green-500/15 text-green-300 text-xs font-semibold uppercase tracking-wider hover:bg-green-500/25 transition"><Check size={13} /> {t.admin.completeSession}</button>
        )}
        {b.status !== 'cancelled' && b.status !== 'completed' && (
          <button onClick={() => setStatus(b.id, 'cancelled')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[color:var(--color-line)] text-red-400 text-xs uppercase tracking-wider hover:border-red-400 transition"><Ban size={13} /> {t.admin.cancel}</button>
        )}
        {(b.status === 'completed' || b.status === 'cancelled') && (
          <button onClick={() => setStatus(b.id, 'confirmed')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[color:var(--color-line)] text-[color:var(--color-ash)] text-xs uppercase tracking-wider hover:text-[color:var(--color-bone)] transition">{t.admin.reopen}</button>
        )}
        <button onClick={() => del(b.id)} className="ml-auto w-8 h-8 rounded-md border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-ash)] hover:text-red-400"><Trash2 size={15} /></button>
      </div>
    </div>
  );

  return (
    <div>
      <Header title={t.admin.bookings} />
      {inProgress && (
        <div className="luxe-card rounded-lg p-4 mb-5 !border-blue-400/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase tracking-luxe text-blue-300">{t.admin.inProgressNow}</div>
              <div className="font-medium text-[color:var(--color-bone)]">{inProgress.customer_name} · {inProgress.service_name} · {inProgress.booking_time}</div>
            </div>
          </div>
          <button onClick={() => setStatus(inProgress.id, 'completed')} className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-green-500/30 transition"><Check size={15} /> {t.admin.completeNow}</button>
        </div>
      )}
      <p className="text-xs text-[color:var(--color-ash)] mb-4">{t.admin.bookingNote}</p>
      <div className="inline-flex p-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-smoke)] mb-6">
        {[['today', `${t.admin.today} (${todayRows.length})`], ['upcoming', `${t.admin.upcoming} (${upcoming.length})`], ['history', `${t.admin.history} (${history.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${tab === id ? 'btn-gold font-semibold' : 'text-[color:var(--color-ash)]'}`}>{label}</button>
        ))}
      </div>
      {list.length === 0 ? <Empty text={t.admin.noBookings} /> : (
        <div className="space-y-3">{list.map(b => <Card key={b.id} b={b} />)}</div>
      )}
    </div>
  );
}

function Empty({ text }) { return <div className="luxe-card rounded-lg py-16 text-center text-[color:var(--color-ash)]">{text}</div>; }

function ServicesTab() {
  const { t } = useLang();
  const [rows, setRows] = useState([]); const [form, setForm] = useState(null); const [saving, setSaving] = useState(false);
  const load = async () => {
    const { data } = await supabase.from('services').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
    const ids = (data || []).map(r => r.id);
    if (ids.length > 0) {
      const { data: vids } = await supabase.from('service_videos').select('*').in('service_id', ids);
      const map = {};
      (vids || []).forEach(v => { map[v.service_id] = v.url; });
      setRows((data || []).map(r => ({ ...r, video_url: map[r.id] || null })));
    } else {
      setRows(data || []);
    }
  };
  useEffect(() => { load(); }, []);
  const blank = { title: '', description: '', price: '', duration: '', category: '', image_url: '', video_url: '', available: true };
  function clean(body) {
    const out = { ...body };
    ['price', 'duration', 'sort_order'].forEach(k => {
      if (out[k] === '' || out[k] === undefined) out[k] = null;
      else if (out[k] !== null) out[k] = Number(out[k]);
    });
    return out;
  }
  const save = async () => {
    setSaving(true);
    const { video_url, ...rest } = form;
    if (form.id) {
      await supabase.from('services').update(clean(rest)).eq('id', form.id);
      if (video_url !== undefined) {
        if (video_url) await supabase.from('service_videos').upsert({ service_id: form.id, url: video_url }, { onConflict: 'service_id' });
        else await supabase.from('service_videos').delete().eq('service_id', form.id);
      }
    } else {
      const { data, error } = await supabase.from('services').insert(clean(rest)).select().single();
      if (!error && data && video_url) await supabase.from('service_videos').insert({ service_id: data.id, url: video_url });
    }
    setForm(null); setSaving(false); load();
  };
  const del = async (id) => {
    await supabase.from('services').delete().eq('id', id);
    await supabase.from('service_videos').delete().eq('service_id', id);
    load();
  };
  return (
    <div>
      <Header title={t.admin.services}><button onClick={() => setForm(blank)} className="inline-flex items-center gap-2 btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"><Plus size={15} /> {t.admin.add}</button></Header>
      {form && <ItemForm form={form} setForm={setForm} save={save} saving={saving} fields={[[' title',t.admin.title],['category',t.admin.category],['price',t.admin.price],['duration',t.admin.duration]]} hasImage hasVideo hasDesc hasAvailable />}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {rows.map(s => (
          <div key={s.id} className="luxe-card rounded-lg overflow-hidden">
            {s.image_url && <img src={s.image_url} alt="" className="w-full aspect-video object-cover" />}
            <div className="p-4">
              <div className="flex justify-between items-start"><h3 className="font-medium text-[color:var(--color-bone)]">{s.title}</h3><span className="text-xs text-[color:var(--color-gold)]">{s.price ? `${s.price} DA` : '—'}</span></div>
              <p className="text-xs text-[color:var(--color-ash)] mt-1 line-clamp-2">{s.description}</p>
              <div className="flex gap-2 mt-3"><button onClick={() => setForm(s)} className="text-xs text-[color:var(--color-gold)]">{t.admin.edit}</button><button onClick={() => del(s.id)} className="text-xs text-red-400">{t.admin.delete}</button></div>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && !form && <Empty text={`${t.admin.services} - ${t.admin.clickAdd}`} />}
    </div>
  );
}

function AdsTab() {
  const { t } = useLang();
  const toast = useToast();
  const [ads, setAds] = useState([]);
  const [banners, setBanners] = useState([]);
  const [subTab, setSubTab] = useState('ads');
  const [adForm, setAdForm] = useState(null);
  const [bannerForm, setBannerForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadAds = async () => {
    const { data } = await supabase.from('ads').select('*').order('sort_order', { ascending: true });
    setAds(data || []);
  };
  const loadBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('sort_order', { ascending: true });
    setBanners(data || []);
  };
  useEffect(() => { loadAds(); loadBanners(); }, []);

  const saveAd = async () => {
    setSaving(true);
    if (adForm.id) {
      await supabase.from('ads').update(adForm).eq('id', adForm.id);
    } else {
      await supabase.from('ads').insert(adForm);
    }
    setAdForm(null); setSaving(false); loadAds();
  };
  const delAd = async (id) => {
    try {
      const { error } = await supabase.rpc('delete_ad', { ad_id: id });
      if (error) { toast(error.message, 'error'); return; }
      loadAds();
    } catch (e) { toast(e.message, 'error'); }
  };
  const toggleAd = async (id, is_active) => {
    await supabase.from('ads').update({ is_active }).eq('id', id);
    loadAds();
  };

  const saveBanner = async () => {
    setSaving(true);
    if (bannerForm.id) {
      await supabase.from('banners').update(bannerForm).eq('id', bannerForm.id);
    } else {
      await supabase.from('banners').insert(bannerForm);
    }
    setBannerForm(null); setSaving(false); loadBanners();
  };
  const delBanner = async (id) => {
    await supabase.from('banners').delete().eq('id', id);
    loadBanners();
  };

  const adBlank = { title: '', description: '', image_url: '', video_url: '', link_url: '', discount_code: '', discount_pct: '', start_date: '', end_date: '', is_active: true, position: 'inline', sort_order: 0 };
  const bannerBlank = { title: '', subtitle: '', image_url: '', link_url: '', is_active: true, sort_order: 0 };

  return (
    <div>
      <Header title={`${t.admin.promotions} & ${t.admin.banners}`} />
      <div className="inline-flex p-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-smoke)] mb-6">
        <button onClick={() => setSubTab('ads')} className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${subTab === 'ads' ? 'btn-gold font-semibold' : 'text-[color:var(--color-ash)]'}`}>{t.admin.promotions} ({ads.length})</button>
        <button onClick={() => setSubTab('banners')} className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${subTab === 'banners' ? 'btn-gold font-semibold' : 'text-[color:var(--color-ash)]'}`}>{t.admin.banners} ({banners.length})</button>
      </div>

      {subTab === 'ads' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setAdForm(adBlank)} className="inline-flex items-center gap-2 btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"><Plus size={15} /> {t.admin.newPromotion}</button>
          </div>
          {adForm && (
            <div className="luxe-card rounded-lg p-5 mb-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label={t.admin.title} value={adForm.title || ''} onChange={e => setAdForm({ ...adForm, title: e.target.value })} />
                <Field label={t.admin.discountCode} value={adForm.discount_code || ''} onChange={e => setAdForm({ ...adForm, discount_code: e.target.value })} />
                <Field label={t.admin.discountPct} value={adForm.discount_pct || ''} type="number" onChange={e => setAdForm({ ...adForm, discount_pct: e.target.value ? Number(e.target.value) : '' })} />
                <Field label={t.admin.linkUrl} value={adForm.link_url || ''} onChange={e => setAdForm({ ...adForm, link_url: e.target.value })} />
                <Field label={t.admin.startDate} value={adForm.start_date || ''} type="date" onChange={e => setAdForm({ ...adForm, start_date: e.target.value })} />
                <Field label={t.admin.endDate} value={adForm.end_date || ''} type="date" onChange={e => setAdForm({ ...adForm, end_date: e.target.value })} />
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">{t.admin.position}</span>
                  <select value={adForm.position || 'inline'} onChange={e => setAdForm({ ...adForm, position: e.target.value })} className="mt-1 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none">
                    <option value="banner">Banner (Top)</option>
                    <option value="popup">Popup</option>
                    <option value="inline">Inline (Content)</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </label>
                <Field label={t.admin.sortOrder} value={adForm.sort_order || 0} type="number" onChange={e => setAdForm({ ...adForm, sort_order: Number(e.target.value) })} />
                <label className="block sm:col-span-2">
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">{t.admin.description}</span>
                  <textarea value={adForm.description || ''} onChange={e => setAdForm({ ...adForm, description: e.target.value })} rows={2} className="mt-1 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" />
                </label>
                <UploadField label={t.admin.image} value={adForm.image_url} uploading={false} accept="image/*" onFile={async (file) => { if (!file) return; try { const url = await upload(file); setAdForm({ ...adForm, image_url: url }); } catch(e) { toast(e.message, 'error'); } }} />
                <UploadField label={t.admin.video} value={adForm.video_url} uploading={false} accept="video/*" isVideo onFile={async (file) => { if (!file) return; try { const url = await upload(file); setAdForm({ ...adForm, video_url: url }); } catch(e) { toast(e.message, 'error'); } }} />
                <label className="flex items-center gap-2 text-sm text-[color:var(--color-ash)] mt-2">
                  <input type="checkbox" checked={adForm.is_active !== false} onChange={e => setAdForm({ ...adForm, is_active: e.target.checked })} /> {t.admin.active}
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={saveAd} disabled={saving} className="btn-gold px-5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {t.admin.save}</button>
                <button onClick={() => setAdForm(null)} className="border border-[color:var(--color-line)] text-[color:var(--color-ash)] px-5 py-2 rounded-sm text-xs uppercase tracking-wider">{t.common.close}</button>
              </div>
            </div>
          )}
          {ads.length === 0 && !adForm ? <Empty text={`${t.admin.promotions} - ${t.admin.clickAdd}`} /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ads.map(a => (
                <div key={a.id} className="luxe-card rounded-lg overflow-hidden">
                  {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover" />}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-[color:var(--color-bone)] truncate">{a.title}</h3>
                      <span className={`text-[10px] uppercase px-2 py-1 rounded-full shrink-0 ${a.is_active ? 'bg-green-500/10 text-green-400' : 'bg-[color:var(--color-line)] text-[color:var(--color-ash)]'}`}>{a.is_active ? t.admin.active : 'Draft'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-[color:var(--color-ash)]">
                      <span className="bg-[color:var(--color-smoke)] px-2 py-0.5 rounded">{a.position}</span>
                      {a.discount_pct && <span className="bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)] px-2 py-0.5 rounded">{a.discount_pct}% OFF</span>}
                      {a.discount_code && <span className="bg-[color:var(--color-smoke)] px-2 py-0.5 rounded font-mono">{a.discount_code}</span>}
                    </div>
                    {a.description && <p className="text-xs text-[color:var(--color-ash)] mt-2 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[color:var(--color-line)]">
                      <button onClick={() => toggleAd(a.id, !a.is_active)} className="text-xs text-[color:var(--color-gold)]">{a.is_active ? t.admin.mfaDeactivate || 'Deactivate' : t.admin.mfaActivate || 'Activate'}</button>
                      <button onClick={() => setAdForm(a)} className="text-xs text-[color:var(--color-gold)]">{t.admin.edit}</button>
                      <button onClick={() => delAd(a.id)} className="text-xs text-red-400 ml-auto">{t.admin.delete}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {subTab === 'banners' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setBannerForm(bannerBlank)} className="inline-flex items-center gap-2 btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"><Plus size={15} /> {t.admin.banners}</button>
          </div>
          {bannerForm && (
            <div className="luxe-card rounded-lg p-5 mb-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label={t.admin.title} value={bannerForm.title || ''} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} />
                <Field label="Subtitle" value={bannerForm.subtitle || ''} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
                <Field label={t.admin.linkUrl} value={bannerForm.link_url || ''} onChange={e => setBannerForm({ ...bannerForm, link_url: e.target.value })} />
                <Field label={t.admin.sortOrder} value={bannerForm.sort_order || 0} type="number" onChange={e => setBannerForm({ ...bannerForm, sort_order: Number(e.target.value) })} />
                <UploadField label={t.admin.image} value={bannerForm.image_url} uploading={false} accept="image/*" onFile={async (file) => { if (!file) return; try { const url = await upload(file); setBannerForm({ ...bannerForm, image_url: url }); } catch(e) { toast(e.message, 'error'); } }} />
                <label className="flex items-center gap-2 text-sm text-[color:var(--color-ash)] mt-2">
                  <input type="checkbox" checked={bannerForm.is_active !== false} onChange={e => setBannerForm({ ...bannerForm, is_active: e.target.checked })} /> {t.admin.active}
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={saveBanner} disabled={saving} className="btn-gold px-5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {t.admin.save}</button>
                <button onClick={() => setBannerForm(null)} className="border border-[color:var(--color-line)] text-[color:var(--color-ash)] px-5 py-2 rounded-sm text-xs uppercase tracking-wider">{t.common.close}</button>
              </div>
            </div>
          )}
          {banners.length === 0 && !bannerForm ? <Empty text={`${t.admin.banners} - ${t.admin.clickAdd}`} /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map(b => (
                <div key={b.id} className="luxe-card rounded-lg overflow-hidden">
                  {b.image_url && <img src={b.image_url} alt="" className="w-full aspect-video object-cover" />}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[color:var(--color-bone)]">{b.title || 'Banner'}</h3>
                        {b.subtitle && <p className="text-xs text-[color:var(--color-ash)]">{b.subtitle}</p>}
                      </div>
                      <span className={`text-[10px] uppercase px-2 py-1 rounded-full shrink-0 ${b.is_active ? 'bg-green-500/10 text-green-400' : 'bg-[color:var(--color-line)] text-[color:var(--color-ash)]'}`}>{b.is_active ? t.admin.active : 'Off'}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setBannerForm(b)} className="text-xs text-[color:var(--color-gold)]">{t.admin.edit}</button>
                      <button onClick={() => delBanner(b.id)} className="text-xs text-red-400">{t.admin.delete}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


function HairstylesTab() {
  const { t } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState([]); const [form, setForm] = useState(null); const [saving, setSaving] = useState(false);
  const load = async () => {
    const { data } = await supabase.from('hairstyles').select('*').order('id', { ascending: true });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const blank = { name: '', description: '', price: '', duration: '', difficulty: '', category: '', image_url: '', video_url: '' };
  const pick = (body) => {
    const keys = ['name','description','price','duration','difficulty','category','image_url','video_url'];
    const out = {};
    keys.forEach(k => {
      if (body[k] === '' || body[k] === undefined) out[k] = null;
      else if (['price','duration'].includes(k)) out[k] = Number(body[k]) || null;
      else out[k] = body[k];
    });
    return out;
  };
  const save = async () => {
    setSaving(true);
    const payload = pick(form);
    if (form.id) {
      const { error } = await supabase.from('hairstyles').update(payload).eq('id', form.id);
      if (error) { toast(`${t.dashboard.uploadError || 'Error'}: ${error.message}`, 'error'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('hairstyles').insert(payload);
      if (error) { toast(`${t.dashboard.uploadError || 'Error'}: ${error.message}`, 'error'); setSaving(false); return; }
    }
    setForm(null); setSaving(false); load();
  };
  const del = async (id) => {
    if (!confirm(`${t.admin.delete}?`)) return;
    await supabase.from('hairstyles').delete().eq('id', id);
    load();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{t.admin.hairstyles}</h1>
          <p className="text-sm text-[color:var(--color-ash)] mt-1">{t.admin.hairstyles} — /hairstyles</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href="/hairstyles" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[color:var(--color-line)] text-[color:var(--color-ash)] px-3 py-2 rounded-sm text-xs uppercase tracking-wider hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition">{t.admin.viewSite}</a>
          <button onClick={() => setForm(blank)} className="inline-flex items-center gap-2 btn-gold px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"><Plus size={15} /> {t.admin.add}</button>
        </div>
      </div>
      <p className="text-xs text-[color:var(--color-ash)]/60 mb-5">{rows.length} {rows.length !== 1 ? t.admin.hairstyles : t.admin.hairstyles}</p>
      {form && (
        <div className="luxe-card rounded-lg p-5 mb-4">
          <h3 className="text-sm font-medium text-[color:var(--color-bone)] mb-3">{form.id ? t.admin.edit : t.admin.add}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={`${t.admin.title} *`} placeholder="ex: Skin Fade, Pompadour..." value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Field label={t.admin.category} placeholder="ex: Dégradé, Classique, Moderne..." value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
            <Field label={t.admin.price} placeholder="ex: 1000" value={form.price || ''} type="number" onChange={e => setForm({ ...form, price: e.target.value ? Number(e.target.value) : '' })} />
            <Field label={t.admin.duration} placeholder="ex: 30" value={form.duration || ''} type="number" onChange={e => setForm({ ...form, duration: e.target.value ? Number(e.target.value) : '' })} />
            <Field label={t.admin.difficulty} placeholder="Facile / Moyen / Avancé" value={form.difficulty || ''} onChange={e => setForm({ ...form, difficulty: e.target.value })} />
            <label className="block sm:col-span-2"><span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">{t.admin.description}</span><textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder={t.admin.description} className="mt-1 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" /></label>
            <UploadField label={t.admin.image} value={form.image_url} uploading={false} accept="image/*" onFile={async (file) => { if (!file) return; try { const url = await upload(file); setForm({ ...form, image_url: url }); } catch(e) { toast(e.message, 'error'); } }} />
            <UploadField label={`${t.admin.video} (${t.common.optional})`} value={form.video_url} uploading={false} accept="video/*" isVideo onFile={async (file) => { if (!file) return; try { const url = await upload(file); setForm({ ...form, video_url: url }); } catch(e) { toast(e.message, 'error'); } }} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving || !form.name} className="btn-gold px-5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {t.admin.save}</button>
            <button onClick={() => setForm(null)} className="border border-[color:var(--color-line)] text-[color:var(--color-ash)] px-5 py-2 rounded-sm text-xs uppercase tracking-wider">{t.common.close}</button>
          </div>
        </div>
      )}
      {rows.length === 0 && !form ? (
        <div className="luxe-card rounded-lg py-16 text-center">
          <Scissors className="mx-auto text-[color:var(--color-line)] mb-4" size={40} />
          <p className="text-[color:var(--color-ash)] mb-2">{t.common.empty}</p>
          <p className="text-sm text-[color:var(--color-ash)]/60 mb-5">{t.admin.clickAdd}</p>
          <button onClick={() => setForm(blank)} className="inline-flex items-center gap-2 btn-gold px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider"><Plus size={16} /> {t.admin.add}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {rows.map(h => (
            <div key={h.id} className="luxe-card rounded-lg overflow-hidden group">
              {h.image_url ? <div className="relative aspect-[4/5] overflow-hidden"><img src={h.image_url} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div> : <div className="w-full aspect-[4/5] flex items-center justify-center bg-[color:var(--color-smoke)]"><Scissors className="text-[color:var(--color-line)]" size={32} /></div>}
              <div className="p-3">
                <div className="text-[9px] uppercase tracking-wide text-[color:var(--color-gold)]">{h.category || t.admin.category}</div>
                <h3 className="text-sm font-medium text-[color:var(--color-bone)] truncate">{h.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-[color:var(--color-ash)]">
                  {h.price && <span>{h.price} DA</span>}
                  {h.duration && <span>· {h.duration}{t.common.minutes}</span>}
                  {h.difficulty && <span>· {h.difficulty}</span>}
                </div>
                <div className="flex gap-2 mt-2"><button onClick={() => setForm(h)} className="text-xs text-[color:var(--color-gold)]">{t.admin.edit}</button><button onClick={() => del(h.id)} className="text-xs text-red-400">{t.admin.delete}</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemForm({ form, setForm, save, saving, fields, nameKey, hasImage, hasVideo, hasDesc, hasAvailable, hasPhoto, hasBio }) {
  const { t } = useLang();
  const toast = useToast();
  const [uploading, setUploading] = useState('');
  const onUpload = async (key, file) => { if (!file) return; setUploading(key); try { const url = await upload(file); setForm({ ...form, [key]: url }); } catch (e) { toast(e.message, 'error'); } setUploading(''); };
  return (
    <div className="luxe-card rounded-lg p-5 mb-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map(([k, l]) => <Field key={k} label={l} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />)}
        {hasDesc && <label className="block sm:col-span-2"><span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">{t.admin.description}</span><textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" /></label>}
        {hasBio && <label className="block sm:col-span-2"><span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">Bio</span><textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="mt-1 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" /></label>}
        {hasImage && <UploadField label={t.admin.image} value={form.image_url} uploading={uploading === 'image_url'} accept="image/*" onFile={f => onUpload('image_url', f)} />}
        {hasPhoto && <UploadField label={t.dashboard.photo} value={form.photo_url} uploading={uploading === 'photo_url'} accept="image/*" onFile={f => onUpload('photo_url', f)} />}
        {hasVideo && <UploadField label={t.admin.video} value={form.video_url} uploading={uploading === 'video_url'} accept="video/*" onFile={f => onUpload('video_url', f)} isVideo />}
        {hasAvailable && <label className="flex items-center gap-2 text-sm text-[color:var(--color-ash)] mt-2"><input type="checkbox" checked={form.available !== false} onChange={e => setForm({ ...form, available: e.target.checked })} /> {t.admin.available}</label>}
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={save} disabled={saving} className="btn-gold px-5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {t.admin.save}</button>
        <button onClick={() => setForm(null)} className="border border-[color:var(--color-line)] text-[color:var(--color-ash)] px-5 py-2 rounded-sm text-xs uppercase tracking-wider">{t.common.close}</button>
      </div>
    </div>
  );
}

function UploadField({ label, value, uploading, accept, onFile, isVideo }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        {value && (isVideo ? <video src={value} className="w-14 h-14 rounded object-cover" /> : <img src={value} alt="" className="w-14 h-14 rounded object-cover" />)}
        <label className="cursor-pointer inline-flex items-center gap-2 border border-[color:var(--color-line)] rounded-md px-3 py-2 text-xs text-[color:var(--color-ash)] hover:border-[color:var(--color-gold)]">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {value ? 'Change' : 'Upload'}
          <input type="file" accept={accept} className="hidden" onChange={e => onFile(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}

function GalleryTab() {
  const { t } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState([]); const [category, setCategory] = useState(''); const [uploading, setUploading] = useState(false);
  const load = async () => {
    let q = supabase.from('gallery').select('*').order('sort_order', { ascending: true });
    if (category) q = q.eq('category', category);
    const { data } = await q;
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const add = async (url, type) => {
    await supabase.from('gallery').insert({ url, type, category: category || null });
    load();
  };
  const del = async (id) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    load();
  };
  return (
    <div>
      <Header title={t.admin.gallery}>
        <div className="flex items-center gap-2">
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder={`${t.admin.category} (${t.common.optional})`} className="bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-xs text-[color:var(--color-bone)] outline-none" />
          <label className="cursor-pointer inline-flex items-center gap-2 btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider">{uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />} {t.admin.add}<input type="file" accept="image/*,video/*" className="hidden" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; setUploading(true); try { const url = await upload(file); const type = file.type.startsWith('video') ? 'video' : 'image'; await add(url, type); } catch (err) { toast(err.message, 'error'); } setUploading(false); }} /></label>
        </div>
      </Header>
      {rows.length === 0 ? <Empty text={t.common.empty} /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {rows.map(g => (
            <div key={g.id} className="relative group rounded-lg overflow-hidden aspect-square bg-[color:var(--color-smoke)]">
              {g.type === 'video' ? <video src={g.url} className="w-full h-full object-cover" /> : <img src={g.url} alt="" className="w-full h-full object-cover" />}
              <button onClick={() => del(g.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[color:var(--color-ink)]/80 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsTab() {
  const { t } = useLang();
  const [rows, setRows] = useState([]);
  const load = async () => {
    const { data } = await supabase.from('reviews').select('*').order('id', { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const approve = async (id, approved) => {
    await supabase.from('reviews').update({ approved }).eq('id', id);
    load();
  };
  const del = async (id) => {
    await supabase.from('reviews').delete().eq('id', id);
    load();
  };
  return (
    <div>
      <Header title={t.admin.reviews} />
      {rows.length === 0 ? <Empty text={t.common.empty} /> : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.id} className="luxe-card rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2"><span className="font-medium text-[color:var(--color-bone)]">{r.name}</span><span className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'text-[color:var(--color-gold)] fill-[color:var(--color-gold)]' : 'text-[color:var(--color-line)]'} />)}</span></div>
                {r.comment && <p className="text-sm text-[color:var(--color-ash)] mt-1">{r.comment}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${r.approved ? 'bg-green-500/10 text-green-400' : 'bg-[color:var(--color-line)] text-[color:var(--color-ash)]'}`}>{r.approved ? t.admin.approved : t.admin.pending}</span>
                <button onClick={() => approve(r.id, !r.approved)} className="w-8 h-8 rounded-md border border-[color:var(--color-line)] flex items-center justify-center text-green-400 hover:border-green-400">{r.approved ? <X size={15} /> : <Check size={15} />}</button>
                <button onClick={() => del(r.id)} className="w-8 h-8 rounded-md border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-ash)] hover:text-red-400"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarbersTab() {
  const { t } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState([]); const [form, setForm] = useState(null); const [saving, setSaving] = useState(false);
  const load = async () => {
    const { data } = await supabase.from('barbers').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const blank = { name: '', role: '', bio: '', photo_url: '', instagram: '', sort_order: 0 };
  const save = async () => {
    setSaving(true);
    try {
      if (form.id) {
        await supabase.from('barbers').update(form).eq('id', form.id);
      } else {
        await supabase.from('barbers').insert(form);
      }
      setForm(null); load();
    } catch (err) { toast(err.message, 'error'); }
    setSaving(false);
  };
  const del = async (id) => {
    await supabase.from('barbers').delete().eq('id', id);
    load();
  };
  return (
    <div>
      <Header title={t.admin.barber || 'Team'}><button onClick={() => setForm(blank)} className="inline-flex items-center gap-2 btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"><Plus size={15} /> {t.admin.add}</button></Header>
      {form && <ItemForm form={form} setForm={setForm} save={save} saving={saving} fields={[['name',t.common.name || 'Name'],['role','Role / Title'],['instagram','Instagram URL']]} hasPhoto hasBio />}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {rows.map(b => (
          <div key={b.id} className="luxe-card rounded-lg overflow-hidden">
            {b.photo_url ? <img src={b.photo_url} alt="" className="w-full aspect-[4/5] object-cover" /> : <div className="w-full aspect-[4/5] flex items-center justify-center bg-[color:var(--color-smoke)]"><Users className="text-[color:var(--color-line)]" /></div>}
            <div className="p-3">
              <h3 className="text-sm font-medium text-[color:var(--color-bone)] truncate">{b.name}</h3>
              <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-gold)]">{b.role}</div>
              <div className="flex gap-2 mt-2"><button onClick={() => setForm(b)} className="text-xs text-[color:var(--color-gold)]">{t.admin.edit}</button><button onClick={() => del(b.id)} className="text-xs text-red-400">{t.admin.delete}</button></div>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && !form && <Empty text={`${t.admin.barber || 'Team'} - ${t.admin.clickAdd}`} />}
    </div>
  );
}

function ContentTab() {
  const { t } = useLang();
  const [content, setContent] = useState({}); const [saved, setSaved] = useState('');
  useEffect(() => {
    supabase.from('site_content').select('*').then(({ data }) => {
      const map = {};
      (data || []).forEach(r => { map[r.key] = r.value; });
      setContent(map);
    });
  }, []);
  const keys = [
    ['hero_image', 'Hero Background Image URL'], ['barber_photo', 'Barber Photo URL (Instagram profile)'],
    ['about_story', `${t.about.story}`], ['about_bio', `${t.about.bio}`], ['about_experience', `${t.about.experience}`],
    ['about_mission', `${t.about.mission}`], ['about_vision', `${t.about.vision}`], ['email', `${t.common.email}`],
    ['spline_scene', 'Spline 3D Scene URL (.splinecode)'],
  ];
  const save = async (key) => {
    await supabase.from('site_content').upsert({ key, value: content[key] || '' }, { onConflict: 'key' });
    setSaved(key); setTimeout(() => setSaved(''), 1500);
  };
  return (
    <div>
      <Header title={t.admin.content} />
      <div className="space-y-4 max-w-2xl">
        {keys.map(([k, l]) => (
          <div key={k} className="luxe-card rounded-lg p-4">
            <label className="text-[11px] uppercase tracking-wide text-[color:var(--color-gold)]">{l}</label>
            <textarea value={content[k] || ''} onChange={e => setContent({ ...content, [k]: e.target.value })} rows={k === 'email' ? 1 : 3} className="mt-2 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" />
            <button onClick={() => save(k)} className="mt-2 btn-gold px-4 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2">{saved === k ? <Check size={13} /> : null} {t.admin.save}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvailabilityTab() {
  const { t } = useLang();
  const [hours, setHours] = useState([]); const [closures, setClosures] = useState([]); const [newDate, setNewDate] = useState(''); const [reason, setReason] = useState('');
  const getDayName = (i) => {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t.admin[dayKeys[i]];
  };
  const load = async () => {
    const [hoursResult, closuresResult] = await Promise.all([
      supabase.from('availability_hours').select('*').order('day_of_week', { ascending: true }),
      supabase.from('availability_closures').select('*').order('closed_date', { ascending: true }),
    ]);
    const map = {};
    (hoursResult.data || []).forEach(h => map[h.day_of_week] = h);
    setHours([0,1,2,3,4,5,6].map((i) => map[i] || { day_of_week: i, open_time: '09:00', close_time: '19:00', is_closed: false }));
    setClosures(closuresResult.data || []);
  };
  useEffect(() => { load(); }, []);
  const saveHour = async (h) => {
    await supabase.from('availability_hours').upsert({ day_of_week: h.day_of_week, open_time: h.open_time, close_time: h.close_time, is_closed: h.is_closed }, { onConflict: 'day_of_week' });
    load();
  };
  const addClosure = async () => {
    if (!newDate) return;
    await supabase.from('availability_closures').insert({ closed_date: newDate, reason });
    setNewDate(''); setReason(''); load();
  };
  const delClosure = async (id) => {
    await supabase.from('availability_closures').delete().eq('id', id);
    load();
  };
  const upd = (i, patch) => setHours(hs => hs.map((h, idx) => idx === i ? { ...h, ...patch } : h));
  return (
    <div>
      <Header title={t.admin.availability} />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="luxe-card rounded-lg p-5">
          <h3 className="font-display text-lg font-semibold text-[color:var(--color-bone)] mb-4">{t.admin.workingHours}</h3>
          <div className="space-y-2">
            {hours.map((h, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <span className="w-24 text-sm text-[color:var(--color-ash)]">{getDayName(i)}</span>
                <label className="flex items-center gap-1 text-xs text-[color:var(--color-ash)]"><input type="checkbox" checked={!h.is_closed} onChange={e => upd(i, { is_closed: !e.target.checked })} /> {t.admin.open}</label>
                {!h.is_closed && <>
                  <input type="time" value={h.open_time || ''} onChange={e => upd(i, { open_time: e.target.value })} className="bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded px-2 py-1 text-xs text-[color:var(--color-bone)]" />
                  <input type="time" value={h.close_time || ''} onChange={e => upd(i, { close_time: e.target.value })} className="bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded px-2 py-1 text-xs text-[color:var(--color-bone)]" />
                </>}
                <button onClick={() => saveHour(h)} className="text-xs text-[color:var(--color-gold)] ml-auto">{t.admin.save}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="luxe-card rounded-lg p-5">
          <h3 className="font-display text-lg font-semibold text-[color:var(--color-bone)] mb-4">{t.admin.closedDays}</h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded px-3 py-2 text-sm text-[color:var(--color-bone)]" />
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder={t.common.notes} className="bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded px-3 py-2 text-sm text-[color:var(--color-bone)] flex-1 min-w-[100px]" />
            <button onClick={addClosure} className="btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase">{t.admin.add}</button>
          </div>
          {closures.length === 0 ? <p className="text-sm text-[color:var(--color-ash)]">{t.common.empty}</p> : (
            <div className="space-y-2">
              {closures.map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm border border-[color:var(--color-line)] rounded px-3 py-2">
                  <span className="text-[color:var(--color-bone)]">{c.closed_date} {c.reason && <span className="text-[color:var(--color-ash)]">· {c.reason}</span>}</span>
                  <button onClick={() => delClosure(c.id)} className="text-[color:var(--color-ash)] hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const { t } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState([]); const [form, setForm] = useState(null); const [saving, setSaving] = useState(false);
  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const blank = { name: '', description: '', price: '', category: '', image_url: '', video_url: '', stock: 0, available: true, sort_order: 0 };
  const clean = (body) => {
    const out = { ...body };
    ['price', 'stock', 'sort_order'].forEach(k => {
      if (out[k] === '' || out[k] === undefined) out[k] = null;
      else if (out[k] !== null) out[k] = Number(out[k]);
    });
    return out;
  };
  const save = async () => {
    setSaving(true);
    const body = clean(form);
    if (form.id) {
      await supabase.from('products').update(body).eq('id', form.id);
    } else {
      await supabase.from('products').insert(body);
    }
    setForm(null); setSaving(false); load();
  };
  const del = async (id) => {
    if (!confirm(t.admin.confirmDelete)) return;
    await supabase.from('products').delete().eq('id', id);
    load();
  };
  return (
    <div>
      <Header title={t.admin.products}><button onClick={() => setForm(blank)} className="inline-flex items-center gap-2 btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"><Plus size={15} /> {t.admin.add}</button></Header>
      {form && (
        <div className="luxe-card rounded-lg p-5 mb-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={t.admin.title} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Field label={t.admin.category} value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
            <Field label={t.admin.price} value={form.price || ''} type="number" onChange={e => setForm({ ...form, price: e.target.value ? Number(e.target.value) : '' })} />
            <Field label={t.admin.stock} value={form.stock ?? 0} type="number" onChange={e => setForm({ ...form, stock: e.target.value ? Number(e.target.value) : 0 })} />
            <Field label={t.admin.sortOrder} value={form.sort_order ?? 0} type="number" onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
            <label className="block sm:col-span-2">
              <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">{t.admin.description}</span>
              <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-3 py-2 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" />
            </label>
            <UploadField label={t.admin.image} value={form.image_url} uploading={false} accept="image/*" onFile={async (file) => { if (!file) return; try { const url = await upload(file); setForm({ ...form, image_url: url }); } catch(e) { toast(e.message, 'error'); } }} />
            <UploadField label={`${t.admin.video} (${t.common.optional})`} value={form.video_url} uploading={false} accept="video/*" isVideo onFile={async (file) => { if (!file) return; try { const url = await upload(file); setForm({ ...form, video_url: url }); } catch(e) { toast(e.message, 'error'); } }} />
            <label className="flex items-center gap-2 text-sm text-[color:var(--color-ash)] mt-2">
              <input type="checkbox" checked={form.available !== false} onChange={e => setForm({ ...form, available: e.target.checked })} /> {t.admin.available}
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="btn-gold px-5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {t.admin.save}</button>
            <button onClick={() => setForm(null)} className="border border-[color:var(--color-line)] text-[color:var(--color-ash)] px-5 py-2 rounded-sm text-xs uppercase tracking-wider">{t.dashboard.mfaCancel}</button>
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {rows.map(p => (
          <div key={p.id} className="luxe-card rounded-lg overflow-hidden">
            {p.image_url && <img src={p.image_url} alt="" className="w-full aspect-video object-cover" />}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-[color:var(--color-bone)]">{p.name}</h3>
                <span className="text-xs text-[color:var(--color-gold)]">{p.price ? `${p.price} DA` : '—'}</span>
              </div>
              <p className="text-xs text-[color:var(--color-ash)] mt-1 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-[color:var(--color-ash)]">
                <span>{t.admin.stock}: {p.stock ?? 0}</span>
                {p.available === false && <span className="text-red-400">{t.store.outStock}</span>}
              </div>
              <div className="flex gap-2 mt-3"><button onClick={() => setForm(p)} className="text-xs text-[color:var(--color-gold)]">{t.admin.edit}</button><button onClick={() => del(p.id)} className="text-xs text-red-400">{t.admin.delete}</button></div>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && !form && <Empty text={t.admin.noProducts} />}
    </div>
  );
}

const ORDER_STATUS_STYLE = {
  pending: 'bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]',
  confirmed: 'bg-blue-500/15 text-blue-300',
  completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

function OrdersTab() {
  const { t } = useLang();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const load = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    load();
  };
  const del = async (id) => {
    if (!confirm(t.admin.confirmDelete)) return;
    await supabase.from('orders').delete().eq('id', id);
    load();
  };
  if (loading) return <Loader2 className="animate-spin text-[color:var(--color-gold)]" />;

  const pending = rows.filter(o => o.status === 'pending');
  const confirmed = rows.filter(o => o.status === 'confirmed');
  const completed = rows.filter(o => o.status === 'completed');
  const cancelled = rows.filter(o => o.status === 'cancelled');
  const list = tab === 'pending' ? pending : tab === 'confirmed' ? confirmed : tab === 'completed' ? completed : cancelled;

  return (
    <div>
      <Header title={t.admin.orders} />
      <div className="inline-flex p-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-smoke)] mb-6 overflow-x-auto">
        {[['pending', `${t.admin.orderPending} (${pending.length})`], ['confirmed', `${t.admin.orderConfirmed} (${confirmed.length})`], ['completed', `${t.admin.orderCompleted} (${completed.length})`], ['cancelled', `${t.admin.orderCancelled} (${cancelled.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${tab === id ? 'btn-gold font-semibold' : 'text-[color:var(--color-ash)]'}`}>{label}</button>
        ))}
      </div>
      {list.length === 0 ? <Empty text={t.admin.noOrders} /> : (
        <div className="space-y-3">
          {list.map(o => (
            <div key={o.id} className="luxe-card rounded-lg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-[color:var(--color-bone)]">{o.customer_name} <span className="text-[color:var(--color-ash)] text-sm">· {o.customer_phone}</span></div>
                  <div className="text-sm text-[color:var(--color-ash)]">{t.booking.ref}: <span className="font-mono text-[color:var(--color-gold)]">{o.reference}</span> · {t.store.total}: <span className="text-[color:var(--color-bone)]">{o.total} DA</span></div>
                  {o.items && Array.isArray(o.items) && (
                    <div className="text-xs text-[color:var(--color-ash)]/70 mt-1">{o.items.map(i => i.name || 'Item').join(', ')}</div>
                  )}
                  {o.address && <div className="text-xs text-[color:var(--color-ash)]/70 mt-1">📍 {o.address}</div>}
                  {o.notes && <div className="text-xs text-[color:var(--color-ash)]/70 mt-1 italic">{o.notes}</div>}
                </div>
                <span className={`text-[10px] uppercase px-2 py-1 rounded-full shrink-0 ${ORDER_STATUS_STYLE[o.status] || ''}`}>{t.admin[`order${o.status.charAt(0).toUpperCase() + o.status.slice(1)}`] || o.status}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[color:var(--color-line)]">
                {o.status === 'pending' && (
                  <button onClick={() => setStatus(o.id, 'confirmed')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-blue-400/40 text-blue-300 text-xs font-semibold uppercase tracking-wider hover:bg-blue-400/10 transition"><Check size={13} /> {t.admin.orderConfirmed}</button>
                )}
                {(o.status === 'pending' || o.status === 'confirmed') && (
                  <button onClick={() => setStatus(o.id, 'completed')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-green-500/15 text-green-300 text-xs font-semibold uppercase tracking-wider hover:bg-green-500/25 transition"><Check size={13} /> {t.admin.orderCompleted}</button>
                )}
                {o.status !== 'cancelled' && o.status !== 'completed' && (
                  <button onClick={() => setStatus(o.id, 'cancelled')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[color:var(--color-line)] text-red-400 text-xs uppercase tracking-wider hover:border-red-400 transition"><X size={13} /> {t.admin.orderCancelled}</button>
                )}
                {(o.status === 'completed' || o.status === 'cancelled') && (
                  <button onClick={() => setStatus(o.id, 'pending')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[color:var(--color-line)] text-[color:var(--color-ash)] text-xs uppercase tracking-wider hover:text-[color:var(--color-bone)] transition">{t.admin.reopen}</button>
                )}
                <button onClick={() => del(o.id)} className="ml-auto w-8 h-8 rounded-md border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-ash)] hover:text-red-400"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const { t } = useLang();
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [addError, setAddError] = useState('');

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Load admins error:', error.message);
        setAdmins([]);
      } else {
        setAdmins(data || []);
      }
    } catch (err) {
      console.warn('Load admins exception:', err);
      setAdmins([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      // Search in bookings for customer emails
      const { data: bookings } = await supabase
        .from('bookings')
        .select('customer_email')
        .ilike('customer_email', `%${query}%`)
        .limit(10);
      
      const emails = new Set();
      (bookings || []).forEach(b => b.customer_email && emails.add(b.customer_email));

      // Try profiles table if it exists
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .ilike('email', `%${query}%`)
          .limit(10);
        (profiles || []).forEach(p => p.email && emails.add(p.email));
      } catch {
        // Profiles table might not exist, ignore
      }

      const results = Array.from(emails).map(email => ({ email }));
      
      // Filter out existing admins
      const adminEmails = new Set(admins.map(a => a.email));
      setSearchResults(results.filter(r => !adminEmails.has(r.email)));
    } catch (err) {
      console.warn('Search error:', err);
    }
    setSearching(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, admins]);

  const addAdmin = async (email) => {
    const clean = email.toLowerCase().trim();
    if (!clean.includes('@')) { setAddError('Invalid email'); return; }
    setAddError('');
    try {
      const { data, error } = await supabase.rpc('add_admin', { target_email: clean });
      if (!error && !data?.error) {
        setSearchQuery(''); setSearchResults([]); loadAdmins(); return;
      }
      const msg = error?.message || data?.error || '';
      if (msg && !msg.includes('not found')) {
        if (msg.includes('Unauthorized') || msg.includes('admin')) { setAddError(msg); return; }
      }
      const { error: insErr } = await supabase.from('admin_users').insert({ email: clean, is_admin: true });
      if (insErr) setAddError(insErr.message);
      else { setSearchQuery(''); setSearchResults([]); loadAdmins(); }
    } catch (err) {
      setAddError(err.message);
    }
  };

  const removeAdmin = async (id) => {
    if (!confirm('Remove admin privileges?')) return;
    try {
      const { data, error } = await supabase.rpc('remove_admin', { target_id: id });
      if (!error && !data?.error) { loadAdmins(); return; }
      const { error: delErr } = await supabase.from('admin_users').delete().eq('id', id);
      if (delErr) alert(delErr.message);
      else loadAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <Header title={t.admin.users} />
      
      {/* Add Admin Section */}
      <div className="luxe-card rounded-lg p-5 mb-6">
        <h3 className="text-sm font-medium text-[color:var(--color-bone)] mb-3">{t.admin.addAdminUser}</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="email"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.admin.searchUsers}
              className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none"
            />
            {searching && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[color:var(--color-ash)]" />
            )}
          </div>
          <button
            onClick={() => {
              if (searchQuery && searchQuery.includes('@')) {
                addAdmin(searchQuery);
              }
            }}
            className="btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
          >
            {t.admin.add}
          </button>
        </div>
        
        {addError && (
          <p className="text-xs text-red-400 mt-2">{addError}</p>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-3 border border-[color:var(--color-line)] rounded-md overflow-hidden">
            {searchResults.map((user, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 hover:bg-[color:var(--color-smoke)] border-b border-[color:var(--color-line)] last:border-b-0"
              >
                <span className="text-sm text-[color:var(--color-bone)]">{user.email}</span>
                <button
                  onClick={() => addAdmin(user.email)}
                  className="text-xs text-[color:var(--color-gold)] hover:underline"
                >
                  {t.admin.makeAdmin}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Users List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-[color:var(--color-gold)]" />
        </div>
      ) : admins.length === 0 ? (
        <Empty text={t.admin.noUsers} />
      ) : (
        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.id} className="luxe-card rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center shrink-0">
                  {admin.is_admin ? (
                    <UserCog size={18} className="text-[color:var(--color-gold)]" />
                  ) : (
                    <Users size={18} className="text-[color:var(--color-ash)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-[color:var(--color-bone)] truncate">{admin.email}</div>
                  <div className="text-xs text-[color:var(--color-ash)]">
                    {t.admin.adminSince}: {new Date(admin.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${admin.is_admin ? 'bg-green-500/10 text-green-400' : 'bg-[color:var(--color-line)] text-[color:var(--color-ash)]'}`}>
                  {admin.is_admin ? t.admin.active : 'User'}
                </span>
                {admin.is_admin && admins.length > 1 && (
                  <button
                    onClick={() => removeAdmin(admin.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    {t.admin.removeAdmin}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
