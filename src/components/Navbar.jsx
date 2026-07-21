import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, User, LayoutDashboard, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import LangSwitcher from './LangSwitcher';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { isAdminEmail } from '../lib/business';

export default function Navbar() {
  const { t } = useLang();
  const { user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/services', label: t.nav.services },
    { to: '/hairstyles', label: t.nav.hairstyles },
    { to: '/gallery', label: t.nav.gallery },
    { to: '/contact', label: t.nav.contact },
    { to: '/promos', label: t.nav.promos },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-6 pt-3 sm:pt-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`max-w-6xl mx-auto rounded-2xl border transition-all duration-500 ${scrolled
          ? 'bg-[color:var(--color-charcoal)]/80 backdrop-blur-xl border-[color:var(--color-line)] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)]'
          : 'bg-[color:var(--color-charcoal)]/40 backdrop-blur-md border-white/5 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.6)]'}`}
      >
        <div className={`px-4 sm:px-6 flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-14' : 'h-16'}`}>
          <Link to="/"><Logo /></Link>

          <div className="hidden lg:flex items-center gap-7">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-[13px] tracking-wide uppercase transition-colors relative group ${loc.pathname === l.to ? 'text-[color:var(--color-bone)]' : 'text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]'}`}>
                {l.label}
                <span className={`absolute -bottom-1.5 left-0 h-px bg-[color:var(--color-gold)] transition-all duration-300 ${loc.pathname === l.to ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LangSwitcher />
            {isAdmin && (
              <Link to="/admin" className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[color:var(--color-gold)] border border-[color:var(--color-gold)]/40 rounded-full px-3 py-1.5 hover:bg-[color:var(--color-gold)]/10 transition-colors">
                <LayoutDashboard size={13} /> {t.nav.admin}
              </Link>
            )}
            <Link to={user ? '/dashboard' : '/login'} className="icon-chip hidden sm:flex items-center justify-center w-9 h-9 rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] hover:border-[color:var(--color-gold)]">
              <User size={16} />
            </Link>
            <Link to="/book" className="hidden sm:inline-flex items-center gap-2 btn-gold px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:brightness-110 transition">
              <Calendar size={15} /> {t.nav.book}
            </Link>
            <button onClick={() => setOpen(o => !o)} className="lg:hidden text-[color:var(--color-bone)] p-1">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-[color:var(--color-line)]">
              <div className="px-5 py-4 flex flex-col gap-1">
                {links.map(l => (
                  <Link key={l.to} to={l.to} className={`py-3 text-sm uppercase tracking-wide border-b border-[color:var(--color-line)]/40 ${loc.pathname === l.to ? 'text-[color:var(--color-gold)]' : 'text-[color:var(--color-ash)]'}`}>{l.label}</Link>
                ))}
                <Link to={user ? '/dashboard' : '/login'} className="py-3 text-sm uppercase tracking-wide text-[color:var(--color-ash)] flex items-center gap-2"><User size={15}/> {user ? t.nav.account : t.auth.signin}</Link>
                {isAdmin && <Link to="/admin" className="py-3 text-sm uppercase tracking-wide text-[color:var(--color-gold)] flex items-center gap-2"><LayoutDashboard size={15}/> {t.nav.admin}</Link>}
                <Link to="/book" className="mt-3 btn-gold text-center py-3 rounded-full text-sm font-semibold uppercase tracking-wider">{t.nav.book}</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
