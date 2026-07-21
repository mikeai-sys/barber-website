import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import supabase from '../lib/supabase';

export default function AdsBanner() {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true })
      .then(({ data }) => setBanners(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const iv = setInterval(() => setIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(iv);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const b = banners[idx];

  return (
    <section className="relative w-full overflow-hidden border-b border-[color:var(--color-line)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={b.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="relative h-48 sm:h-64 md:h-80"
        >
          {b.image_url && (
            <img src={b.image_url} alt={b.title || ''} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-ink)]/90 via-[color:var(--color-ink)]/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8 sm:px-16">
            <div className="max-w-lg">
              {b.title && <h3 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-bone)] mb-2">{b.title}</h3>}
              {b.subtitle && <p className="text-[color:var(--color-ash)] text-sm sm:text-base mb-4">{b.subtitle}</p>}
              {b.link_url && (
                <Link to={b.link_url} className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Découvrir
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[color:var(--color-ink)]/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[color:var(--color-bone)] hover:border-[color:var(--color-gold)] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setIdx(i => (i + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[color:var(--color-ink)]/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[color:var(--color-bone)] hover:border-[color:var(--color-gold)] transition-colors">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-[color:var(--color-gold)]' : 'bg-white/30'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
