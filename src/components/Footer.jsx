import { Link } from 'react-router-dom';
import { Phone, MapPin, Instagram, Facebook, Music2, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import { useLang } from '../contexts/LangContext';
import { BUSINESS } from '../lib/business';

export default function Footer() {
  const { t } = useLang();
  const socials = [
    { icon: Instagram, href: BUSINESS.instagram, label: 'Instagram' },
    { icon: Facebook, href: BUSINESS.facebook, label: 'Facebook' },
    { icon: Music2, href: BUSINESS.tiktok, label: 'TikTok' },
    { icon: MessageCircle, href: BUSINESS.whatsapp, label: 'WhatsApp' },
  ];
  const links = [
    { to: '/about', label: t.nav.about },
    { to: '/services', label: t.nav.services },
    { to: '/hairstyles', label: t.nav.hairstyles },
    { to: '/store', label: t.nav.store },
    { to: '/gallery', label: t.nav.gallery },
    { to: '/contact', label: t.nav.contact },
  ];
  return (
    <footer className="border-t border-[color:var(--color-line)] bg-[color:var(--color-charcoal)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo size="lg" />
            <p className="mt-5 text-[color:var(--color-ash)] text-sm leading-relaxed max-w-sm">{t.footer.made}. {t.footer.legal}</p>
            <Link to="/book" className="inline-flex mt-6 btn-gold px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider">{t.hero.book}</Link>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-luxe text-[color:var(--color-gold)] mb-5">{t.footer.nav}</h4>
            <ul className="space-y-3">
              {links.map(l => (
                <li key={l.to}><Link to={l.to} className="text-sm text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-luxe text-[color:var(--color-gold)] mb-5">{t.sections.contact}</h4>
            <ul className="space-y-3 text-sm text-[color:var(--color-ash)]">
              <li><a href={`tel:${BUSINESS.phoneRaw}`} className="flex items-center gap-2 hover:text-[color:var(--color-bone)] transition-colors"><Phone size={14}/> {BUSINESS.phone}</a></li>
              <li><a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[color:var(--color-bone)] transition-colors"><MapPin size={14}/> {BUSINESS.city}, {BUSINESS.country}</a></li>
            </ul>
            <div className="flex gap-3 mt-5">
              {socials.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="icon-chip w-9 h-9 flex items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ash)] hover:text-[color:var(--color-gold)] hover:border-[color:var(--color-gold)]">
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-14 pt-7 border-t border-[color:var(--color-line)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[color:var(--color-ash)]">© {new Date().getFullYear()} {BUSINESS.name}. {t.footer.rights}</p>
          <p className="text-xs text-[color:var(--color-ash)]/60">{BUSINESS.city} · {BUSINESS.country}</p>
        </div>
      </div>
    </footer>
  );
}
