import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Calendar, Clock, Scissors, User, LayoutDashboard, ArrowRight, Settings, Loader2, Check, Ban, Key, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../lib/supabase';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { isAdminEmail, BUSINESS } from '../lib/business';

const STATUS_STYLE = {
  cancelled: 'bg-red-500/10 text-red-400',
  completed: 'bg-green-500/10 text-green-400',
  in_progress: 'bg-blue-500/15 text-blue-300',
  confirmed: 'bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]',
  pending: 'bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]',
};
const STATUS_LABEL_FN = (t) => ({ confirmed: t.dashboard.statusConfirmed, completed: t.dashboard.statusCompleted, cancelled: t.dashboard.statusCancelled, in_progress: t.dashboard.statusInProgress, pending: t.dashboard.statusPending });

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-ash)]">{label}</span>
      <input {...props} className="mt-1.5 w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-lg px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none transition-colors" />
    </label>
  );
}

export default function Account() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [tab, setTab] = useState('bookings');
  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => { if (loc.pathname === '/account') nav('/dashboard', { replace: true }); }, [loc.pathname]);
  useEffect(() => { if (!loading && !user) nav('/login'); }, [user, loading]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-ink)]"><Loader2 className="animate-spin text-[color:var(--color-gold)]" size={32} /></div>;

  const tabs = [
    { id: 'profile', label: t.dashboard.tabProfile, icon: User },
    { id: 'bookings', label: t.dashboard.tabBookings, icon: Calendar },
    { id: 'settings', label: t.dashboard.tabSettings, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--color-ink)] flex flex-col">
      {/* ===== HEADER (visible on mobile) ===== */}
      <header className="md:hidden sticky top-0 z-30 bg-[color:var(--color-charcoal)]/90 backdrop-blur-xl border-b border-[color:var(--color-line)] px-4 pt-4 pb-3 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center shrink-0">
              <User size={18} className="text-[color:var(--color-gold)]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[color:var(--color-bone)] truncate max-w-[160px]">{user.user_metadata?.full_name || user.email}</div>
              <div className="text-[10px] text-[color:var(--color-ash)] truncate max-w-[160px]">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && <Link to="/admin" className="text-[10px] uppercase tracking-wider text-[color:var(--color-gold)] border border-[color:var(--color-gold)]/30 rounded-full px-2.5 py-1">{t.nav.admin}</Link>}
            <Link to="/" className="text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] p-1.5"><ArrowRight size={18} className="rotate-180" /></Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 md:pt-0 pt-0">
        {/* ===== SIDEBAR (desktop only) ===== */}
        <aside className="hidden md:flex md:w-64 border-r border-[color:var(--color-line)] flex-col p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center">
              <User size={20} className="text-[color:var(--color-gold)]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[color:var(--color-bone)] truncate">{user.user_metadata?.full_name || user.email}</div>
              <div className="text-[11px] text-[color:var(--color-ash)] truncate">{user.email}</div>
            </div>
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${tab === tb.id ? 'bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)] font-medium' : 'text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] hover:bg-white/[0.03]'}`}>
                <tb.icon size={18} /> {tb.label}
              </button>
            ))}
          </nav>
          <div className="pt-6 border-t border-[color:var(--color-line)] space-y-2">
            <Link to="/" className="flex items-center gap-2 text-xs text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] transition"><ArrowRight size={13} className="rotate-180" /> {t.dashboard.backToSite}</Link>
            {isAdmin && <Link to="/admin" className="flex items-center gap-2 text-xs text-[color:var(--color-gold)]"><LayoutDashboard size={13} /> {t.nav.admin}</Link>}
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-xs text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] transition"><LogOut size={13} /> {t.dashboard.signOut}</button>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 pb-24 md:pb-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 md:p-8 max-w-3xl"
            >
              {tab === 'profile' && <ProfileTab user={user} />}
              {tab === 'bookings' && <BookingsTab user={user} />}
              {tab === 'settings' && <SettingsTab user={user} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ===== BOTTOM TAB BAR (mobile only) ===== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[color:var(--color-charcoal)]/95 backdrop-blur-xl border-t border-[color:var(--color-line)] safe-bottom">
        <div className="flex items-stretch">
          {tabs.map(tb => {
            const active = tab === tb.id;
            return (
              <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${active ? 'text-[color:var(--color-gold)]' : 'text-[color:var(--color-ash)]'}`}>
                <div className="relative">
                  <tb.icon size={20} strokeWidth={active ? 2.2 : 1.5} />
                  {active && <motion.div layoutId="tab-dot" className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[color:var(--color-gold)]" />}
                </div>
                <span className="text-[9px] uppercase tracking-wider mt-0.5">{tb.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ============================================================
   PROFILE TAB — info + avatar + security (password + 2FA)
   ============================================================ */
function ProfileTab({ user }) {
  const { t } = useLang();
  const [name, setName] = useState(user.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(user.user_metadata?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  // Password
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  // 2FA
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaSetup, setMfaSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSaving, setMfaSaving] = useState(false);

  // Load avatar
  useEffect(() => {
    if (user.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    } else {
      const path = `${user.id}/avatar.jpg`;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      if (data?.publicUrl) setAvatarUrl(data.publicUrl);
    }
  }, [user]);

  // Check 2FA status
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.mfa.listFactors();
        setMfaEnabled((data?.totp || []).some(f => f.status === 'verified'));
      } catch {}
      setMfaLoading(false);
    })();
  }, []);

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert(t.dashboard.imageMaxError); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = data?.publicUrl;
      if (url) {
        const bustUrl = url + '?t=' + Date.now();
        setAvatarUrl(bustUrl);
        await supabase.auth.updateUser({ data: { avatar_url: bustUrl } });
      }
    } catch (err) { alert(t.dashboard.uploadError + ': ' + err.message); }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name, phone } });
    if (!error) {
      await supabase.from('profiles').upsert({ id: user.id, full_name: name, phone }, { onConflict: 'id' });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.length < 6) { setPwMsg(t.dashboard.pwMinError); return; }
    if (pw !== pw2) { setPwMsg(t.dashboard.pwMismatch); return; }
    setPwSaving(true); setPwMsg('');
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) setPwMsg(error.message);
    else { setPwMsg('✓ ' + t.dashboard.pwUpdated); setPw(''); setPw2(''); }
    setPwSaving(false);
  };

  const startEnroll = async () => {
    setMfaError(''); setMfaSaving(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Haytem Barber' });
      if (error) throw error;
      setFactorId(data.id); setQrCode(data.totp.qr_code); setMfaSetup(true);
    } catch (err) { setMfaError(err.message); }
    setMfaSaving(false);
  };

  const confirmEnroll = async () => {
    if (mfaCode.length !== 6) { setMfaError(t.mfa.codeLengthError); return; }
    setMfaError(''); setMfaSaving(true);
    try {
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr) throw cErr;
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code: mfaCode.trim() });
      if (vErr) throw vErr;
      setMfaEnabled(true); setMfaSetup(false); setQrCode(''); setFactorId(''); setMfaCode('');
    } catch (err) { setMfaError(err.message || t.mfa.codeIncorrect); }
    setMfaSaving(false);
  };

  const disableMfa = async () => {
    if (!confirm(t.dashboard.mfaDisableConfirm)) return;
    setMfaSaving(true);
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const f = (data?.totp || []).find(f => f.status === 'verified');
      if (f) { await supabase.auth.mfa.unenroll({ factorId: f.id }); await supabase.auth.refreshSession(); }
      setMfaEnabled(false);
    } catch (err) { setMfaError(err.message); }
    setMfaSaving(false);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{t.dashboard.myProfile}</h1>

      {/* ---- Info card ---- */}
      <div className="luxe-card rounded-xl p-5 sm:p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-5 mb-6 pb-6 border-b border-[color:var(--color-line)]">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[color:var(--color-smoke)] border-2 border-[color:var(--color-gold)]/30 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <User size={36} className="text-[color:var(--color-gold)]" />
              )}
              {!avatarUrl && <User size={36} className="text-[color:var(--color-gold)] absolute" />}
            </div>
            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? <Loader2 size={22} className="text-white animate-spin" /> : <span className="text-white text-xs font-medium">{t.dashboard.photo}</span>}
              <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
            </label>
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="font-display text-lg font-semibold text-[color:var(--color-bone)]">{user.user_metadata?.full_name || t.dashboard.user}</div>
            <div className="text-sm text-[color:var(--color-ash)]">{user.email}</div>
            <p className="text-xs text-[color:var(--color-ash)]/50 mt-2">{t.dashboard.photoHint}</p>
          </div>
        </div>
        <div className="space-y-4">
          <Field label={t.dashboard.fullName} value={name} onChange={e => setName(e.target.value)} placeholder={t.dashboard.fullName} />
          <Field label={t.dashboard.phoneLabel} value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+213 ..." />
          <Field label={t.dashboard.emailLabel} value={user.email} disabled />
        </div>
        <button onClick={save} disabled={saving} className="mt-6 w-full sm:w-auto btn-gold px-8 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
          {saved ? t.dashboard.profileSaved : t.dashboard.saveProfile}
        </button>
      </div>

      {/* ---- Password card ---- */}
      <div className="luxe-card rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[color:var(--color-gold)]/10 flex items-center justify-center"><Key size={18} className="text-[color:var(--color-gold)]" /></div>
          <div><h2 className="font-display text-base font-semibold text-[color:var(--color-bone)]">{t.dashboard.changePwTitle}</h2><p className="text-xs text-[color:var(--color-ash)]">{t.dashboard.changePassword}</p></div>
        </div>
        <form onSubmit={changePw} className="space-y-4">
          <Field label={t.dashboard.newPassword} value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder={t.dashboard.pwPlaceholder} />
          <Field label={t.dashboard.confirmPassword} value={pw2} onChange={e => setPw2(e.target.value)} type="password" placeholder={t.dashboard.pwConfirmPlaceholder} />
          {pwMsg && <p className={`text-sm ${pwMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{pwMsg}</p>}
          <button disabled={pwSaving} className="w-full sm:w-auto btn-gold px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
            {pwSaving ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />} {t.dashboard.updatePassword}
          </button>
        </form>
      </div>

      {/* ---- 2FA card ---- */}
      <div className="luxe-card rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[color:var(--color-gold)]/10 flex items-center justify-center"><ShieldCheck size={18} className="text-[color:var(--color-gold)]" /></div>
          <div>
            <h2 className="font-display text-base font-semibold text-[color:var(--color-bone)]">{t.dashboard.mfaTitle}</h2>
            <p className="text-xs text-[color:var(--color-ash)]">{t.dashboard.mfaDesc}</p>
          </div>
        </div>

        {mfaLoading ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--color-ash)]"><Loader2 size={16} className="animate-spin" /> {t.dashboard.mfaChecking}</div>
        ) : mfaSetup ? (
          <div className="space-y-4">
            <div className="bg-[color:var(--color-smoke)] rounded-xl p-6 text-center">
              <p className="text-sm text-[color:var(--color-ash)] mb-4">{t.dashboard.mfaScanQR}</p>
              {qrCode && <img src={qrCode} alt="QR Code 2FA" className="mx-auto rounded-lg bg-white p-2" style={{ maxWidth: 200 }} />}
            </div>
            <div>
              <Field label={t.dashboard.mfaCodeLabel} value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} placeholder={t.dashboard.mfaCodePlaceholder} maxLength={6} />
            </div>
            {mfaError && <p className="text-sm text-red-400">{mfaError}</p>}
            <div className="flex gap-3">
              <button onClick={confirmEnroll} disabled={mfaSaving || mfaCode.length !== 6} className="btn-gold px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50">
                {mfaSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t.dashboard.mfaActivate}
              </button>
              <button onClick={() => { setMfaSetup(false); setQrCode(''); setFactorId(''); setMfaCode(''); setMfaError(''); }} className="border border-[color:var(--color-line)] text-[color:var(--color-ash)] px-5 py-3 rounded-lg text-sm uppercase tracking-wider">{t.dashboard.mfaCancel}</button>
            </div>
          </div>
        ) : mfaEnabled ? (
          <div className="flex items-center justify-between gap-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><ShieldCheck size={18} className="text-green-400" /></div>
              <div>
                <div className="text-sm font-medium text-green-400">{t.dashboard.mfaEnabled}</div>
                <div className="text-xs text-[color:var(--color-ash)]">{t.dashboard.mfaEnabledDesc}</div>
              </div>
            </div>
            <button onClick={disableMfa} disabled={mfaSaving} className="border border-red-400/30 text-red-400 px-4 py-2 rounded-lg text-xs font-medium hover:bg-red-400/10 transition">
              {mfaSaving ? <Loader2 size={14} className="animate-spin" /> : t.dashboard.mfaDeactivate}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 bg-[color:var(--color-smoke)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[color:var(--color-line)]/20 flex items-center justify-center"><ShieldCheck size={18} className="text-[color:var(--color-ash)]" /></div>
              <div>
                <div className="text-sm font-medium text-[color:var(--color-bone)]">{t.dashboard.mfaDisabled}</div>
                <div className="text-xs text-[color:var(--color-ash)]">{t.dashboard.mfaDisabledDesc}</div>
              </div>
            </div>
            <button onClick={startEnroll} disabled={mfaSaving} className="btn-gold px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              {mfaSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} {t.dashboard.mfaActivate}
            </button>
          </div>
        )}
        {mfaError && !mfaSetup && <p className="text-sm text-red-400 mt-3">{mfaError}</p>}
      </div>
    </div>
  );
}

/* ============================================================
   BOOKINGS TAB
   ============================================================ */
function BookingsTab({ user }) {
  const { t } = useLang();
  const STATUS_LABEL = STATUS_LABEL_FN(t);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('user_id', user.id).order('booking_date', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const cancel = async (id) => {
    if (!confirm(t.dashboard.cancelConfirm)) return;
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id).eq('user_id', user.id);
    load();
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return b.booking_date >= today && b.status !== 'cancelled' && b.status !== 'completed';
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  }).sort((a, b) => (b.booking_date + b.booking_time).localeCompare(a.booking_date + a.booking_time));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[color:var(--color-gold)]" size={28} /></div>;

  const filters = [['all', t.dashboard.filterAll], ['upcoming', t.dashboard.filterUpcoming], ['completed', t.dashboard.filterCompleted], ['cancelled', t.dashboard.filterCancelled]];

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{t.dashboard.reservations}</h1>
        <Link to="/book" className="inline-flex items-center gap-1.5 btn-gold px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0"><Calendar size={14} /> <span className="hidden sm:inline">{t.dashboard.newBooking}</span> +</Link>
      </div>
      {/* Filter chips — horizontal scroll on mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {filters.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${filter === id ? 'btn-gold border-transparent' : 'border-[color:var(--color-line)] text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]'}`}>{label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="luxe-card rounded-xl py-16 text-center">
          <Calendar className="mx-auto text-[color:var(--color-line)] mb-4" size={44} />
          <p className="text-[color:var(--color-ash)] mb-5">{t.dashboard.noBookings} {filter !== 'all' ? t.dashboard.noBookingsCategory : ''}.</p>
          <Link to="/book" className="inline-flex btn-gold px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider">{t.dashboard.bookNow}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="luxe-card rounded-xl p-4 sm:p-5">
              {/* Top row: service + status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[color:var(--color-gold)]/10 flex items-center justify-center shrink-0">
                    <Scissors size={16} className="text-[color:var(--color-gold)]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-[color:var(--color-bone)] text-sm block truncate">{b.service_name}</span>
                    <span className="font-mono text-[10px] text-[color:var(--color-gold)]">{b.reference}</span>
                  </div>
                </div>
                <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full shrink-0 font-medium ${STATUS_STYLE[b.status] || ''}`}>{STATUS_LABEL[b.status] || b.status}</span>
              </div>
              {/* Info row */}
              <div className="flex items-center gap-4 text-sm text-[color:var(--color-ash)] ml-[46px]">
                <span className="flex items-center gap-1.5"><Calendar size={13} /> {b.booking_date}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} /> {b.booking_time}</span>
              </div>
              {b.notes && <p className="text-xs text-[color:var(--color-ash)]/60 mt-2 ml-[46px] italic">"{b.notes}"</p>}
              {/* Actions */}
              {b.status === 'confirmed' && (
                <div className="mt-3 ml-[46px] pt-3 border-t border-[color:var(--color-line)]/50">
                  <button onClick={() => cancel(b.id)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-400/30 text-red-400 text-xs font-medium hover:bg-red-400/10 transition"><Ban size={13} /> {t.dashboard.cancelBooking}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SETTINGS TAB
   ============================================================ */
function SettingsTab({ user }) {
  const { t } = useLang();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaSetup, setMfaSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSaving, setMfaSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.mfa.listFactors();
        const verified = (data?.totp || []).some(f => f.status === 'verified');
        setMfaEnabled(verified);
      } catch {}
      setMfaLoading(false);
    })();
  }, []);

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.length < 6) { setMsg(t.dashboard.pwMinError); return; }
    if (pw !== pw2) { setMsg(t.dashboard.pwMismatch); return; }
    setSaving(true); setMsg('');
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) setMsg(error.message);
    else { setMsg(t.dashboard.pwUpdated); setPw(''); setPw2(''); }
    setSaving(false);
  };

  const startEnroll = async () => {
    setMfaError(''); setMfaSaving(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Haytem Barber' });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setMfaSetup(true);
    } catch (err) { setMfaError(err.message); }
    setMfaSaving(false);
  };

  const confirmEnroll = async () => {
    if (mfaCode.length !== 6) { setMfaError(t.mfa.codeLengthError); return; }
    setMfaError(''); setMfaSaving(true);
    try {
      const { data: challengeData, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr) throw cErr;
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challengeData.id, code: mfaCode.trim() });
      if (vErr) throw vErr;
      setMfaEnabled(true);
      setMfaSetup(false);
      setQrCode(''); setFactorId(''); setMfaCode('');
    } catch (err) { setMfaError(err.message || t.mfa.codeIncorrect); }
    setMfaSaving(false);
  };

  const disableMfa = async () => {
    if (!confirm(t.dashboard.mfaDisableConfirm)) return;
    setMfaSaving(true);
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const factor = (data?.totp || []).find(f => f.status === 'verified');
      if (factor) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
        await supabase.auth.refreshSession();
      }
      setMfaEnabled(false);
    } catch (err) { setMfaError(err.message); }
    setMfaSaving(false);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{t.dashboard.settings}</h1>

      <div className="luxe-card rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[color:var(--color-gold)]/10 flex items-center justify-center"><Key size={18} className="text-[color:var(--color-gold)]" /></div>
          <div><h2 className="font-display text-base font-semibold text-[color:var(--color-bone)]">{t.dashboard.changePwTitle}</h2><p className="text-xs text-[color:var(--color-ash)]">{t.dashboard.changePassword}</p></div>
        </div>
        <form onSubmit={changePw} className="space-y-4">
          <Field label={t.dashboard.newPassword} value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder={t.dashboard.pwPlaceholder} />
          <Field label={t.dashboard.confirmPassword} value={pw2} onChange={e => setPw2(e.target.value)} type="password" placeholder={t.dashboard.pwConfirmPlaceholder} />
          {msg && <p className={`text-sm ${msg.includes(t.dashboard.pwUpdated) ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
          <button disabled={saving} className="w-full sm:w-auto btn-gold px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />} {t.dashboard.updatePassword}
          </button>
        </form>
      </div>

      <div className="luxe-card rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[color:var(--color-gold)]/10 flex items-center justify-center"><ShieldCheck size={18} className="text-[color:var(--color-gold)]" /></div>
          <div>
            <h2 className="font-display text-base font-semibold text-[color:var(--color-bone)]">{t.dashboard.mfaTitle}</h2>
            <p className="text-xs text-[color:var(--color-ash)]">{t.dashboard.mfaDesc}</p>
          </div>
        </div>

        {mfaLoading ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--color-ash)]"><Loader2 size={16} className="animate-spin" /> {t.dashboard.mfaChecking}</div>
        ) : mfaSetup ? (
          <div className="space-y-4">
            <div className="bg-[color:var(--color-smoke)] rounded-xl p-6 text-center">
              <p className="text-sm text-[color:var(--color-ash)] mb-4">{t.dashboard.mfaScanQR}</p>
              {qrCode && <img src={qrCode} alt="QR Code 2FA" className="mx-auto rounded-lg bg-white p-2" style={{ maxWidth: 200 }} />}
            </div>
            <div className="text-center">
              <p className="text-xs text-[color:var(--color-ash)] mb-2">{t.dashboard.mfaOrManual}</p>
              <p className="text-sm font-mono text-[color:var(--color-gold)] bg-[color:var(--color-smoke)] rounded px-3 py-2 inline-block">{t.dashboard.mfaUseApp}</p>
            </div>
            <div>
              <Field label={t.dashboard.mfaCodeLabel} value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} placeholder={t.dashboard.mfaCodePlaceholder} maxLength={6} />
            </div>
            {mfaError && <p className="text-sm text-red-400">{mfaError}</p>}
            <div className="flex gap-3">
              <button onClick={confirmEnroll} disabled={mfaSaving || mfaCode.length !== 6} className="btn-gold px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50">
                {mfaSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t.dashboard.mfaActivate}
              </button>
              <button onClick={() => { setMfaSetup(false); setQrCode(''); setFactorId(''); setMfaCode(''); setMfaError(''); }} className="border border-[color:var(--color-line)] text-[color:var(--color-ash)] px-5 py-3 rounded-lg text-sm uppercase tracking-wider">{t.dashboard.mfaCancel}</button>
            </div>
          </div>
        ) : mfaEnabled ? (
          <div className="flex items-center justify-between gap-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><ShieldCheck size={18} className="text-green-400" /></div>
              <div>
                <div className="text-sm font-medium text-green-400">{t.dashboard.mfaEnabled}</div>
                <div className="text-xs text-[color:var(--color-ash)]">{t.dashboard.mfaEnabledDesc}</div>
              </div>
            </div>
            <button onClick={disableMfa} disabled={mfaSaving} className="border border-red-400/30 text-red-400 px-4 py-2 rounded-lg text-xs font-medium hover:bg-red-400/10 transition">
              {mfaSaving ? <Loader2 size={14} className="animate-spin" /> : t.dashboard.mfaDeactivate}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 bg-[color:var(--color-smoke)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[color:var(--color-line)]/20 flex items-center justify-center"><ShieldCheck size={18} className="text-[color:var(--color-ash)]" /></div>
              <div>
                <div className="text-sm font-medium text-[color:var(--color-bone)]">{t.dashboard.mfaDisabled}</div>
                <div className="text-xs text-[color:var(--color-ash)]">{t.dashboard.mfaDisabledDesc}</div>
              </div>
            </div>
            <button onClick={startEnroll} disabled={mfaSaving} className="btn-gold px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              {mfaSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} {t.dashboard.mfaActivate}
            </button>
          </div>
        )}
        {mfaError && !mfaSetup && <p className="text-sm text-red-400 mt-3">{mfaError}</p>}
      </div>

      <div className="luxe-card rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><LogOut size={18} className="text-red-400" /></div>
          <div><h2 className="font-display text-base font-semibold text-[color:var(--color-bone)]">{t.dashboard.signOutTitle}</h2><p className="text-xs text-[color:var(--color-ash)]">{t.dashboard.signOutDesc}</p></div>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="w-full inline-flex items-center justify-center gap-2 border border-red-400/30 text-red-400 px-5 py-3 rounded-lg text-sm font-medium hover:bg-red-400/10 transition">
          <LogOut size={16} /> {t.dashboard.signOutBtn}
        </button>
      </div>
    </div>
  );
}
