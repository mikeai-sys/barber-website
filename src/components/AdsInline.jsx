import { useState, useEffect } from 'react';
import { Tag, Copy, Check } from 'lucide-react';
import Reveal from './Reveal';
import supabase from '../lib/supabase';

export default function AdsInline() {
  const [ads, setAds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    supabase.from('ads').select('*').eq('is_active', true).eq('position', 'inline').order('sort_order', { ascending: true })
      .then(({ data }) => setAds(data || []))
      .catch(() => {});
  }, []);

  if (ads.length === 0) return null;

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {ads.slice(0, 2).map(ad => (
        <Reveal key={ad.id}>
          <div className="glass-card rounded-xl overflow-hidden border border-[color:var(--color-gold)]/20 hover:border-[color:var(--color-gold)]/40 transition-colors">
            <div className="flex flex-col sm:flex-row">
              {ad.image_url && (
                <div className="sm:w-1/3 shrink-0">
                  <img src={ad.image_url} alt="" className="w-full h-48 sm:h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} className="text-[color:var(--color-gold)]" />
                  <span className="text-[10px] uppercase tracking-luxe text-[color:var(--color-gold)]">Offre spéciale</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[color:var(--color-bone)]">{ad.title}</h3>
                {ad.description && <p className="text-sm text-[color:var(--color-ash)] mt-2 leading-relaxed">{ad.description}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {ad.discount_pct && (
                    <span className="text-[color:var(--color-gold)] font-bold text-2xl">{ad.discount_pct}% OFF</span>
                  )}
                  {ad.discount_code && (
                    <button onClick={() => copyCode(ad.id, ad.discount_code)} className="inline-flex items-center gap-2 bg-[color:var(--color-smoke)] border border-dashed border-[color:var(--color-gold)]/30 rounded-lg px-4 py-2 text-[color:var(--color-gold)] font-mono text-sm tracking-wider hover:bg-[color:var(--color-gold)]/5 transition-colors">
                      {copiedId === ad.id ? <><Check size={14} /> Copié</> : <><Copy size={14} /> {ad.discount_code}</>}
                    </button>
                  )}
                  {ad.link_url && (
                    <a href={ad.link_url} className="btn-gold px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Profiter
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
