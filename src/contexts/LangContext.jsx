import { createContext, useContext, useEffect, useState } from 'react';
import { translations, LANGS } from '../lib/i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('hb_lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('hb_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].dir;
  }, [lang]);

  const t = translations[lang];
  const dir = LANGS[lang].dir;

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
