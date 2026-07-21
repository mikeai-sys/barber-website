import { useState, useEffect } from 'react';
import { Tag, Copy, Check, Megaphone } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import Reveal from '../components/Reveal';
import supabase from '../lib/supabase';

export default function Promos() {
  const { t } = useLang();
  const [ads, setAds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    supabase.from('ads').select('*').eq('is_active', true).order('sort_order', { ascending: true })
      .then(({ data }) => setAds(data || []))
      .catch(() => {});
  }, []);

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pt-28 pb-20 px-6 sm:px-8 max-w-6xl mx-auto min-h-screen">
      <Reveal className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 border border-[color:var(--color-gold)]/30 rounded-full text-[10px] sm:text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-6 bg-[color:var(--color-gold)]/[0.04]">
          <Megaphone size={13} /> {t.promos?.tag || 'Offres & Promotions'}
        </div>
        <h1 className="paint-heading text-5xl sm:text-6xl md:text-7xl font-bold">{t.promos?.title || 'Offres spéciales'}</h1>
        <p className="text-[color:var(--color-ash)] mt-4 max-w-lg mx-auto">{t.promos?.sub || 'Profitez de nos offres exclusives et réductions.'}</p>
      </Reveal>

      {ads.length === 0 ? (
        <Reveal>
          <div className="glass-card rounded-xl py-20 text-center">
            <Megaphone size={48} className="text-[color:var(--color-line)] mx-auto mb-4" />
            <p className="text-[color:var(--color-ash)]">{t.promos?.empty || 'Aucune promotion pour le moment. Revenez bientôt !'}</p>
          </div>
        </Reveal>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {ads.map((ad, i) => (
            <Reveal key={ad.id} delay={i * 0.08}>
              <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col hover:border-[color:var(--color-gold)]/30 transition-colors">
                {ad.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={14} className="text-[color:var(--color-gold)]" />
                    <span className="text-[10px] uppercase tracking-luxe text-[color:var(--color-gold)]">Promotion</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{ad.title}</h2>
                  {ad.description && <p className="text-sm text-[color:var(--color-ash)] mt-2 leading-relaxed flex-1">{ad.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-[color:var(--color-line)]">
                    {ad.discount_pct && (
                      <span className="text-[color:var(--color-gold)] font-bold text-2xl">{ad.discount_pct}% OFF</span>
                    )}
                    {ad.discount_code && (
                      <button onClick={() => copyCode(ad.id, ad.discount_code)} className="inline-flex items-center gap-2 bg-[color:var(--color-smoke)] border border-dashed border-[color:var(--color-gold)]/30 rounded-lg px-4 py-2.5 text-[color:var(--color-gold)] font-mono text-sm tracking-wider hover:bg-[color:var(--color-gold)]/5 transition-colors">
                        {copiedId === ad.id ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> {ad.discount_code}</>}
                      </button>
                    )}
                    {ad.link_url && (
                      <a href={ad.link_url} className="ml-auto btn-gold px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                        Profiter
                      </a>
                    )}
                  </div>
                  {(ad.start_date || ad.end_date) && (
                    <div className="text-xs text-[color:var(--color-ash)]/60 mt-3">
                      {ad.start_date && `Du ${ad.start_date}`}
                      {ad.start_date && ad.end_date && ' '}
                      {ad.end_date && `au ${ad.end_date}`}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
