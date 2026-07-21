import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Scissors, Clock, Tag, BarChart3, Calendar, ArrowLeft, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../contexts/LangContext';
import SectionTitle from '../components/SectionTitle';
import supabase from '../lib/supabase';

export default function HairstyleDetail() {
  const { id } = useParams();
  const { t, dir } = useLang();
  const [h, setH] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    supabase.from('hairstyles').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (data) {
          setH(data);
          // Load related hairstyles (same category, excluding this one)
          if (data.category) {
            supabase.from('hairstyles').select('*').eq('category', data.category).neq('id', id).limit(4)
              .then(({ data: rel }) => setRelated(rel || []));
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: h?.name || 'HAYTEM BARBER', url: shareUrl });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="pt-[92px] min-h-screen flex items-center justify-center">
        <div className="shimmer w-64 h-80 rounded-lg" />
      </div>
    );
  }

  if (notFound || !h) {
    return (
      <div className="pt-[92px] min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <Scissors className="mx-auto text-[color:var(--color-line)] mb-4" size={48} />
          <h2 className="font-display text-2xl font-bold text-[color:var(--color-bone)] mb-2">{t.common.empty}</h2>
          <Link to="/hairstyles" className="inline-flex items-center gap-2 text-sm text-[color:var(--color-gold)] mt-4">
            <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} /> {t.nav.hairstyles}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[92px]">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-6">
        <Link to="/hairstyles" className="inline-flex items-center gap-2 text-sm text-[color:var(--color-ash)] hover:text-[color:var(--color-gold)] transition-colors">
          <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} /> {t.nav.hairstyles}
        </Link>
      </div>

      {/* Main content */}
      <section className="py-10 px-6 sm:px-8 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Media */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {h.video_url ? (
              <div className="luxe-card rounded-xl overflow-hidden">
                <video
                  src={h.video_url}
                  controls
                  playsInline
                  className="w-full aspect-[4/5] object-cover"
                  poster={h.image_url || undefined}
                />
              </div>
            ) : h.image_url ? (
              <div className="luxe-card rounded-xl overflow-hidden">
                <img src={h.image_url} alt={h.name} className="w-full aspect-[4/5] object-cover" />
              </div>
            ) : (
              <div className="luxe-card rounded-xl aspect-[4/5] flex items-center justify-center">
                <Scissors className="text-[color:var(--color-line)]" size={64} />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            {h.category && (
              <div className="text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-3">{h.category}</div>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-bone)] leading-tight">{h.name}</h1>

            {h.description && (
              <p className="mt-5 text-[color:var(--color-ash)] leading-relaxed text-base">{h.description}</p>
            )}

            {/* Stats grid */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="border border-[color:var(--color-line)] rounded-lg p-4 text-center">
                <Tag size={18} className="mx-auto text-[color:var(--color-gold)] mb-2" />
                <div className="text-lg font-semibold text-[color:var(--color-bone)]">{h.price ? `${h.price} DA` : '—'}</div>
                <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-ash)] mt-0.5">{t.common.price}</div>
              </div>
              <div className="border border-[color:var(--color-line)] rounded-lg p-4 text-center">
                <Clock size={18} className="mx-auto text-[color:var(--color-gold)] mb-2" />
                <div className="text-lg font-semibold text-[color:var(--color-bone)]">{h.duration ? `${h.duration} min` : '—'}</div>
                <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-ash)] mt-0.5">{t.common.duration}</div>
              </div>
              <div className="border border-[color:var(--color-line)] rounded-lg p-4 text-center">
                <BarChart3 size={18} className="mx-auto text-[color:var(--color-gold)] mb-2" />
                <div className="text-lg font-semibold text-[color:var(--color-bone)]">{h.difficulty || '—'}</div>
                <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-ash)] mt-0.5">{t.common.difficulty}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/book?hairstyle=${h.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 btn-gold px-8 py-4 rounded-md text-sm font-bold uppercase tracking-wider"
              >
                <Calendar size={17} /> {t.hero.book}
              </Link>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 border border-[color:var(--color-line)] text-[color:var(--color-bone)] px-6 py-4 rounded-md text-sm font-semibold uppercase tracking-wider hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition"
              >
                {copied ? <Check size={17} className="text-green-400" /> : <Share2 size={17} />}
                {copied ? (dir === 'rtl' ? 'تم النسخ' : dir === 'en' ? 'Copied!' : 'Copié !') : (dir === 'rtl' ? 'مشاركة' : dir === 'en' ? 'Share' : 'Partager')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related hairstyles */}
      {related.length > 0 && (
        <section className="py-16 px-6 sm:px-8 max-w-7xl mx-auto border-t border-[color:var(--color-line)]">
          <SectionTitle
            overline={t.nav.hairstyles}
            title={dir === 'rtl' ? 'styles مشابهة' : dir === 'en' ? 'Similar Styles' : 'Styles similaires'}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {related.map((r, i) => (
              <Link key={r.id} to={`/hairstyle/${r.id}`} className="group block luxe-card rounded-lg overflow-hidden">
                <div className="aspect-[4/5] bg-[color:var(--color-smoke)] overflow-hidden relative">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={40} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-ink)] via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <div className="text-[9px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-1">{r.category}</div>
                    <h3 className="font-display text-base font-semibold text-[color:var(--color-bone)]">{r.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
