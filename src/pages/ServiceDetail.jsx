import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Scissors, Clock, Tag, Calendar, ArrowLeft, Share2, Check } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import SectionTitle from '../components/SectionTitle';
import supabase from '../lib/supabase';

export default function ServiceDetail() {
  const { id } = useParams();
  const { t, dir } = useLang();
  const [svc, setSvc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    (async () => {
      const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
      if (data) {
        const { data: vids } = await supabase.from('service_videos').select('url').eq('service_id', id).maybeSingle();
        setSvc({ ...data, video_url: vids?.url || null });
        if (data.category) {
          const { data: rel } = await supabase.from('services').select('*').neq('id', id).eq('category', data.category).limit(4);
          setRelated(rel || []);
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [id]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: svc?.title || 'HAYTEM BARBER', url: shareUrl }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
    }
  };

  if (loading) {
    return (
      <div className="pt-[92px] min-h-screen flex items-center justify-center">
        <div className="shimmer w-64 h-80 rounded-lg" />
      </div>
    );
  }

  if (notFound || !svc) {
    return (
      <div className="pt-[92px] min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <Scissors className="mx-auto text-[color:var(--color-line)] mb-4" size={48} />
          <h2 className="font-display text-2xl font-bold text-[color:var(--color-bone)] mb-2">{t.common.empty}</h2>
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-[color:var(--color-gold)] mt-4">
            <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} /> {t.nav.services}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[92px]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-6">
        <Link to="/services" className="inline-flex items-center gap-2 text-sm text-[color:var(--color-ash)] hover:text-[color:var(--color-gold)] transition-colors">
          <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} /> {t.nav.services}
        </Link>
      </div>

      <section className="py-10 px-6 sm:px-8 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="luxe-card rounded-xl overflow-hidden">
            {svc.video_url ? (
              <video src={svc.video_url} controls playsInline className="w-full aspect-[4/5] object-cover" poster={svc.image_url || undefined} />
            ) : svc.image_url ? (
              <img src={svc.image_url} alt={svc.title} className="w-full aspect-[4/5] object-cover" />
            ) : (
              <div className="aspect-[4/5] flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={64} /></div>
            )}
          </div>

          <div>
            {svc.category && (
              <div className="text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-3">{svc.category}</div>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-bone)] leading-tight">{svc.title}</h1>

            {svc.description && (
              <p className="mt-5 text-[color:var(--color-ash)] leading-relaxed text-base">{svc.description}</p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="border border-[color:var(--color-line)] rounded-lg p-4 text-center">
                <Tag size={18} className="mx-auto text-[color:var(--color-gold)] mb-2" />
                <div className="text-lg font-semibold text-[color:var(--color-bone)]">{svc.price ? `${svc.price} DA` : t.common.priceOnRequest}</div>
                <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-ash)] mt-0.5">{t.common.price}</div>
              </div>
              <div className="border border-[color:var(--color-line)] rounded-lg p-4 text-center">
                <Clock size={18} className="mx-auto text-[color:var(--color-gold)] mb-2" />
                <div className="text-lg font-semibold text-[color:var(--color-bone)]">{svc.duration ? `${svc.duration} min` : '—'}</div>
                <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-ash)] mt-0.5">{t.common.duration}</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/book?service=${svc.id}`}
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
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 px-6 sm:px-8 max-w-7xl mx-auto border-t border-[color:var(--color-line)]">
          <SectionTitle
            overline={t.nav.services}
            title={dir === 'rtl' ? 'خدمات مشابهة' : dir === 'en' ? 'Similar Services' : 'Services similaires'}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {related.map(r => (
              <Link key={r.id} to={`/service/${r.id}`} className="group block luxe-card rounded-lg overflow-hidden">
                <div className="aspect-[4/5] bg-[color:var(--color-smoke)] overflow-hidden relative">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={40} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-ink)] via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <div className="text-[9px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-1">{r.category}</div>
                    <h3 className="font-display text-base font-semibold text-[color:var(--color-bone)]">{r.title}</h3>
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
