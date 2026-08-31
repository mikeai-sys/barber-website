import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext({ user: null, session: null, loading: true, needsMFA: false, mfaLoading: true, refreshMFA: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsMFA, setNeedsMFA] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);

  const checkMFA = useCallback(async (sess) => {
    if (!sess) { setNeedsMFA(false); setMfaLoading(false); return; }
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setNeedsMFA(data?.nextLevel === 'aal2' && data?.currentLevel !== data?.nextLevel);
    } catch { setNeedsMFA(false); }
    setMfaLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
      checkMFA(sess);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
      checkMFA(sess);
    });
    return () => subscription.unsubscribe();
  }, [checkMFA]);

  const refreshMFA = useCallback(() => checkMFA(session), [session, checkMFA]);

  return (
    <AuthContext.Provider value={{ user, session, loading, needsMFA, mfaLoading, refreshMFA }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
