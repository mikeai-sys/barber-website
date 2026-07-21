import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { LANGS } from '../lib/i18n';

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-xs tracking-wide text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] transition-colors uppercase">
        <Globe size={15} />
        <span>{lang}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-36 bg-[color:var(--color-graphite)] border border-[color:var(--color-line)] rounded-md overflow-hidden z-50 shadow-2xl">
          {Object.entries(LANGS).map(([code, { label }]) => (
            <button key={code} onClick={() => { setLang(code); setOpen(false); }}
              className={`block w-full text-left rtl:text-right px-4 py-2.5 text-sm transition-colors ${lang === code ? 'text-[color:var(--color-gold)] bg-[color:var(--color-smoke)]' : 'text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] hover:bg-[color:var(--color-smoke)]'}`}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
