import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../lib/supabase';

export default function AdsPopup() {
  const [ad, setAd] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem('hb_ad_popup');
    if (shown) return;
    supabase.from('ads').select('*').eq('is_active', true).eq('position', 'popup').order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAd(data[0]);
          sessionStorage.setItem('hb_ad_popup', '1');
        }
      })
      .catch(() => {});
  }, []);

  const close = () => setAd(null);
  const copyCode = () => {
    if (ad?.discount_code) {
      navigator.clipboard.writeText(ad.discount_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {ad && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card rounded-2xl overflow-hidden max-w-md w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={close} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[color:var(--color-ink)]/60 flex items-center justify-center text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] transition-colors">
              <X size={16} />
            </button>
            {ad.image_url && (
              <img src={ad.image_url} alt="" className="w-full aspect-video object-cover" />
            )}
            <div className="p-6">
              <h3 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{ad.title}</h3>
              {ad.discount_pct && (
                <div className="mt-3 inline-flex items-center gap-2 bg-[color:var(--color-gold)]/10 border border-[color:var(--color-gold)]/30 rounded-full px-4 py-2">
                  <span className="text-[color:var(--color-gold)] font-bold text-lg">{ad.discount_pct}% OFF</span>
                </div>
              )}
              {ad.description && <p className="text-sm text-[color:var(--color-ash)] mt-3 leading-relaxed">{ad.description}</p>}
              {ad.discount_code && (
                <button onClick={copyCode} className="mt-4 w-full flex items-center justify-center gap-2 bg-[color:var(--color-smoke)] border border-dashed border-[color:var(--color-gold)]/40 rounded-lg px-4 py-3 text-[color:var(--color-gold)] font-mono text-lg tracking-wider hover:bg-[color:var(--color-gold)]/5 transition-colors">
                  {copied ? <><Check size={16} /> Copié !</> : <><Copy size={16} /> {ad.discount_code}</>}
                </button>
              )}
              {ad.link_url && (
                <a href={ad.link_url} className="mt-4 block text-center btn-gold px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider">
                  Profiter
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
