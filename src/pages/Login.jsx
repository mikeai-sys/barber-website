import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle, isOAuthCallback } from '../lib/googleAuth';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import MFAChallenge from '../components/MFAChallenge';

export default function Login() {
  const { t } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('signin'); // signin | signup | forgot | recovery
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsMFA, setNeedsMFA] = useState(false);

  // Detect password-recovery link and OAuth callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        setMsg('Enter your new password below');
      }
    });
    
    // Also check URL hash for recovery type
    if (window.location.hash.includes('type=recovery')) {
      setMode('recovery');
      setMsg('Enter your new password below');
    }
    
    // Check if returning from OAuth
    if (isOAuthCallback()) {
      setGoogleLoading(true);
      // Clean up URL after a brief moment
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setGoogleLoading(false);
      }, 1000);
    }
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || mode === 'recovery') return;
    (async () => {
      try {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (data.nextLevel === 'aal2' && data.nextLevel !== data.currentLevel) {
          setNeedsMFA(true);
          return;
        }
      } catch {}
      nav('/dashboard');
    })();
  }, [user, mode]);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setErr(error.message);
        } else {
          // Check if email confirmation is required
          if (data?.user && !data?.session) {
            setMsg('Please check your email to confirm your account before signing in.');
          }
          // MFA check happens in useEffect if session exists
        }
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErr(error.message);
        // MFA check happens in useEffect on success
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { 
          redirectTo: window.location.origin + '/login' 
        });
        if (error) {
          setErr(error.message);
        } else {
          setMsg('Password reset link sent! Check your email to continue.');
          setEmail(''); // Clear email for security
        }
      } else if (mode === 'recovery') {
        if (password.length < 6) {
          setErr('Password must be at least 6 characters long');
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setErr(error.message);
        } else {
          setMsg('Password updated successfully! Redirecting...');
          setPassword(''); // Clear password
          setTimeout(() => nav('/dashboard'), 1500);
        }
      }
    } catch (e) { 
      setErr(e.message || 'An unexpected error occurred'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleSignIn = async () => {
    setErr('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // User will be redirected to Google, so no need to set loading to false
    } catch (error) {
      setErr(error.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  const title = mode === 'signup' ? t.auth.signup : mode === 'forgot' ? t.auth.resetTitle : mode === 'recovery' ? t.auth.resetTitle : t.auth.signin;

  if (needsMFA) return <MFAChallenge onBack={() => { setNeedsMFA(false); supabase.auth.signOut(); }} onVerified={() => setNeedsMFA(false)} />;

  return (
    <div className="pt-[92px] min-h-screen flex items-center justify-center px-6 py-16">
      <div className="luxe-card rounded-xl p-8 sm:p-10 max-w-md w-full">
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <h1 className="font-display text-2xl font-bold text-[color:var(--color-bone)] text-center">{title}</h1>
        <p className="text-center text-xs text-[color:var(--color-ash)] mt-2 mb-7">
          {mode === 'forgot' ? t.auth.resetSub : mode === 'recovery' ? t.auth.newPassword : t.auth.optional}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {mode !== 'recovery' && (
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-ash)]" />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder={t.auth.email} 
                className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md pl-10 pr-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" 
              />
            </div>
          )}
          {(mode === 'signin' || mode === 'signup' || mode === 'recovery') && (
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-ash)]" />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder={mode === 'recovery' ? t.auth.newPassword : t.auth.password}
                minLength={mode === 'recovery' ? 6 : undefined}
                className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md pl-10 pr-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" 
              />
            </div>
          )}
          {mode === 'signin' && (
            <div className="text-right rtl:text-left">
              <button 
                type="button" 
                onClick={() => { setMode('forgot'); setErr(''); setMsg(''); setEmail(''); setPassword(''); }} 
                className="text-xs text-[color:var(--color-gold)] hover:underline"
              >
                {t.auth.forgot}
              </button>
            </div>
          )}
          {err && <p className="text-sm text-red-400">{err}</p>}
          {msg && <p className="text-sm text-green-400">{msg}</p>}
          <button disabled={loading || googleLoading} className="w-full btn-gold py-3.5 rounded-sm text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signup' ? t.auth.signup : mode === 'forgot' ? t.auth.resetSend : mode === 'recovery' ? t.auth.updatePassword : t.auth.signin}
          </button>
        </form>

        {(mode === 'signin' || mode === 'signup') && (
          <>
            <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-[color:var(--color-line)]" /><span className="text-xs text-[color:var(--color-ash)] uppercase">{t.auth.or}</span><div className="flex-1 h-px bg-[color:var(--color-line)]" /></div>
            <button onClick={handleGoogleSignIn} disabled={googleLoading} className="w-full border border-[color:var(--color-line)] text-[color:var(--color-bone)] py-3 rounded-sm text-sm hover:border-[color:var(--color-gold)] transition flex items-center justify-center gap-2 disabled:opacity-60">
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 35.8 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
              )}
              {googleLoading ? 'Redirecting...' : t.auth.google}
            </button>
            <p className="text-center text-sm text-[color:var(--color-ash)] mt-6">{mode === 'signup' ? t.auth.hasAccount : t.auth.noAccount} <button onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="text-[color:var(--color-gold)]">{mode === 'signup' ? t.auth.signin : t.auth.signup}</button></p>
            <p className="text-center text-xs text-[color:var(--color-ash)]/60 mt-4"><Link to="/book" className="hover:text-[color:var(--color-gold)]">→ {t.booking.guestOrAccount}</Link></p>
          </>
        )}
        {(mode === 'forgot' || mode === 'recovery') && (
          <button 
            type="button"
            onClick={() => { 
              setMode('signin'); 
              setErr(''); 
              setMsg(''); 
              setEmail(''); 
              setPassword(''); 
            }} 
            className="w-full mt-5 text-sm text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> {t.auth.backSignin}
          </button>
        )}
      </div>
    </div>
  );
}
