import { useState } from 'react';
import { ShieldCheck, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import supabase from '../lib/supabase';
import Logo from './Logo';
import { useLang } from '../contexts/LangContext';

export default function MFAChallenge({ onBack, onVerified }) {
  const { t } = useLang();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { setError(t.mfa.codeLengthError); return; }
    setError(''); setLoading(true);
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const totpFactor = factorsData.totp?.[0];
      if (!totpFactor) throw new Error(t.mfa.noFactor);

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;
      (onVerified || onBack)();
      return;
    } catch (err) {
      setError(err.message || t.mfa.codeIncorrect);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[color:var(--color-ink)]">
      <div className="luxe-card rounded-xl p-8 sm:p-10 max-w-md w-full">
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center">
            <ShieldCheck size={24} className="text-[color:var(--color-gold)]" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-[color:var(--color-bone)] text-center">{t.mfa.verifyTitle}</h1>
        <p className="text-center text-sm text-[color:var(--color-ash)] mt-2 mb-7">
          {t.mfa.verifyDesc}
        </p>

        <form onSubmit={verify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-4 text-center text-2xl font-mono tracking-[0.4em] text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none transition-colors"
            autoFocus
          />
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 rounded-md px-3 py-2">
              <AlertTriangle size={15} /> {error}
            </div>
          )}
          <button disabled={loading || code.length !== 6} className="w-full btn-gold py-3.5 rounded-sm text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t.mfa.verifyBtn}
          </button>
        </form>

        {onBack && (
          <button onClick={onBack} className="w-full mt-5 text-sm text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={14} /> {t.common.close}
          </button>
        )}
      </div>
    </div>
  );
}
