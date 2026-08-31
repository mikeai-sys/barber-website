import { Link } from 'react-router-dom';
import { Calendar, Scissors, ArrowRight, ArrowUpRight, Star, Sparkles, ShieldCheck, Award, Heart, Instagram, Facebook, Music2, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '../contexts/LangContext';
import { BUSINESS } from '../lib/business';
import Reveal from '../components/Reveal';
import CylinderGallery from '../components/CylinderGallery';
import AdsBanner from '../components/AdsBanner';
import AdsInline from '../components/AdsInline';
import supabase from '../lib/supabase';

function useData(url) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const table = url.split('/api/')[1];
    supabase.from(table).select('*').then(({ data: d }) => setData(d || [])).catch(() => setData([]));
  }, [url]);
  return data;
}

function PaintTitle({ overline, title, className = '' }) {
  return (
    <Reveal className={className}>
      {overline && <div className="text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-2">{overline}</div>}
      <h2 className="paint-heading paint-underline text-5xl sm:text-6xl md:text-7xl font-bold">{title}</h2>
    </Reveal>
  );
}

export default function Home() {
  const { t, dir } = useLang();
  const services = useData('/api/services');
  const hairstyles = useData('/api/hairstyles');
  const gallery = useData('/api/gallery');
  const reviews = useData('/api/reviews');
  const [content, setContent] = useState({});
  useEffect(() => {
    supabase.from('site_content').select('*').then(({ data }) => {
      const m = {}; (data || []).forEach(r => m[r.key] = r.value); setContent(m);
    }).catch(() => {});
  }, []);
  const heroImg = content.hero_image || null;
  const barberImg = content.barber_photo || null;

  const featured = hairstyles.slice(0, 6);
  const popServices = services.slice(0, 4);

  // Parallax for hero
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 120]);
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.1]);

  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
          {heroImg && <img src={heroImg} alt="" className="w-full h-full object-cover opacity-40" />}
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-ink)] via-[color:var(--color-ink)]/85 to-[color:var(--color-ink)]/70" />
        </motion.div>

        {/* Decorative floating sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[color:var(--color-gold)] rounded-full opacity-20"
              style={{
                top: `${15 + i * 14}%`,
                left: `${10 + i * 16}%`,
                animation: `floaty ${4 + i * 1.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full pt-28 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 border border-[color:var(--color-gold)]/30 rounded-full text-[10px] sm:text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-8 bg-[color:var(--color-gold)]/[0.04]">
              <Sparkles size={13} /> {t.hero.tag}
            </div>
            <h1 className="font-display font-bold text-[color:var(--color-bone)] leading-[0.92] text-[14vw] sm:text-7xl md:text-8xl tracking-tight text-left rtl:text-right">
              <span className="block">{t.hero.title1}</span>
              <span className="block paint-heading pb-2" style={{ fontFamily: 'var(--font-hand)', fontSize: '1.15em' }}>{t.hero.title2}</span>
            </h1>
            <p className="mt-8 max-w-lg text-[color:var(--color-ash)] text-lg leading-relaxed text-left rtl:text-right">{t.hero.sub}</p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/book" className="btn-3d inline-flex items-center justify-center gap-2 px-9 py-4 text-sm font-bold uppercase tracking-wider">
                <Calendar size={17} /> {t.hero.book}
              </Link>
              <Link to="/hairstyles" className="inline-flex items-center justify-center gap-2 border border-white/15 text-[color:var(--color-bone)] px-8 py-4 rounded-md text-sm font-semibold uppercase tracking-wider hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition bg-white/[0.03]">
                {t.hero.explore} <ArrowRight size={17} className={dir === 'rtl' ? 'rotate-180' : ''} />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 inset-x-0 flex justify-center">
          <div className="w-5 h-9 border border-[color:var(--color-line)] rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-[color:var(--color-gold)] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      <AdsBanner />

      {/* ============ SALON ============ */}
      <section className="relative py-24 sm:py-28 px-6 sm:px-8 overflow-hidden border-b border-[color:var(--color-line)]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-left rtl:text-right order-2 lg:order-1">
            <PaintTitle overline={t.sections.salonOverline} title={t.sections.salonTitle} className="mb-5" />
            <p className="text-[color:var(--color-ash)] leading-relaxed max-w-md">{t.sections.salonText}</p>
            <Link to="/book" className="btn-3d inline-flex items-center gap-2 mt-8 px-8 py-3.5 text-sm font-bold uppercase tracking-wider"><Calendar size={16} /> {t.hero.book}</Link>
          </div>
          <div className="order-1 lg:order-2 relative flex justify-center">
            <img src="/salon-3d.png" alt="Salon" onError={e => e.target.style.display = 'none'} className="relative z-10 w-full max-w-xl drop-shadow-[0_50px_80px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
      </section>

      {/* ============ GALLERY ============ */}
      <section className="py-20 px-4 sm:px-8 border-b border-[color:var(--color-line)]">
        <div className="max-w-7xl mx-auto">
          <PaintTitle overline={t.sections.gallery} title={t.sections.gallery} className="text-left rtl:text-right mb-4" />
          <p className="text-[color:var(--color-ash)] max-w-md mb-8 text-left rtl:text-right">{t.sections.gallerySub}</p>
          <CylinderGallery items={gallery} compact />
          <div className="mt-8 text-left rtl:text-right">
            <Link to="/gallery" className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-[color:var(--color-gold)] hover:gap-3 transition-all">{t.common.viewAll} <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ============ FEATURED CUTS ============ */}
      <section className="py-24 px-6 sm:px-8 max-w-7xl mx-auto">
        <PaintTitle overline={t.sections.featured} title={t.sections.featured} className="mb-3" />
        <p className="text-[color:var(--color-ash)] mb-12">{t.sections.featuredSub}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.length === 0 ? (
            [...Array(3)].map((_, i) => <div key={i} className="glass-card rounded-lg aspect-[4/5] flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={40} /></div>)
          ) : featured.map((h, i) => (
            <Reveal key={h.id} delay={i * 0.08}>
              <Link to={`/hairstyle/${h.id}`} className="group block glass-card rounded-lg overflow-hidden">
                <div className="aspect-[4/5] overflow-hidden bg-[color:var(--color-smoke)] relative">
                  {h.image_url ? <img src={h.image_url} alt={h.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    : <div className="w-full h-full flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={48} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-ink)] via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <div className="text-[10px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-1">{h.category}</div>
                    <h3 className="font-display text-xl font-semibold text-[color:var(--color-bone)]">{h.name}</h3>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-left rtl:text-right">
          <Link to="/hairstyles" className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-[color:var(--color-gold)] hover:gap-3 transition-all">{t.common.viewAll} <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="py-24 px-6 sm:px-8 border-y border-[color:var(--color-line)]">
        <div className="max-w-7xl mx-auto">
          <PaintTitle overline={t.sections.services} title={t.sections.services} className="mb-3" />
          <p className="text-[color:var(--color-ash)] mb-12">{t.sections.servicesSub}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popServices.length === 0 ? (
              [...Array(4)].map((_, i) => <div key={i} className="glass-card rounded-lg p-8 h-56 flex items-center justify-center"><Sparkles className="text-[color:var(--color-line)]" size={32} /></div>)
            ) : popServices.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <div className="glass-card rounded-lg p-7 h-full flex flex-col">
                  <div className="w-11 h-11 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center mb-5"><Scissors size={18} className="text-[color:var(--color-gold)]" /></div>
                  <h3 className="font-display text-lg font-semibold text-[color:var(--color-bone)]">{s.title}</h3>
                  {s.description && <p className="mt-2 text-sm text-[color:var(--color-ash)] leading-relaxed flex-1">{s.description}</p>}
                  <div className="mt-5 pt-5 border-t border-[color:var(--color-line)] flex items-center justify-between">
                    <span className="text-[color:var(--color-gold)] font-medium text-sm">{s.price ? `${s.price} DA` : t.common.priceOnRequest}</span>
                    {s.duration && <span className="text-xs text-[color:var(--color-ash)]">{s.duration} {t.common.minutes}</span>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-left rtl:text-right">
            <Link to="/services" className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-[color:var(--color-gold)] hover:gap-3 transition-all">{t.common.viewAll} <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ============ ADS INLINE ============ */}
      <section className="py-12 px-6 sm:px-8 max-w-7xl mx-auto">
        <AdsInline />
      </section>

      {/* ============ WHY US ============ */}
      <section className="py-24 px-6 sm:px-8 border-y border-[color:var(--color-line)]">
        <div className="max-w-7xl mx-auto">
          <PaintTitle overline={t.sections.why} title={t.sections.why} className="mb-3" />
          <p className="text-[color:var(--color-ash)] mb-12">{t.sections.whySub}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Award, title: t.why.craft, d: t.why.craftD },
                { icon: ShieldCheck, title: t.why.hygiene, d: t.why.hygieneD },
                { icon: Sparkles, title: t.why.style, d: t.why.styleD },
                { icon: Heart, title: t.why.welcome, d: t.why.welcomeD },
              ].map((w, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="glass-card rounded-lg p-7 h-full">
                  <div className="w-14 h-14 rounded-full border border-[color:var(--color-gold)]/30 flex items-center justify-center mb-5"><w.icon size={22} className="text-[color:var(--color-gold)]" /></div>
                  <h3 className="font-display text-lg font-semibold text-[color:var(--color-bone)]">{w.title}</h3>
                  <p className="mt-2 text-sm text-[color:var(--color-ash)] leading-relaxed">{w.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ REVIEWS ============ */}
      <section className="py-24 px-6 sm:px-8 max-w-7xl mx-auto">
        <PaintTitle overline={t.sections.reviews} title={t.sections.reviews} className="mb-3" />
        <p className="text-[color:var(--color-ash)] mb-12">{t.sections.reviewsSub}</p>
        {reviews.length === 0 ? (
          <Reveal><div className="glass-card rounded-lg py-16 text-center max-w-lg">
            <div className="flex justify-center gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-[color:var(--color-line)]" />)}</div>
            <p className="text-[color:var(--color-ash)]">{t.reviews.empty}</p>
            <Link to="/contact" className="inline-flex mt-6 text-sm text-[color:var(--color-gold)] uppercase tracking-wider">{t.reviews.add}</Link>
          </div></Reveal>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((r, i) => (
              <Reveal key={r.id} delay={i * 0.08}>
                <div className="glass-card rounded-lg p-7 h-full">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} size={15} className={j < r.rating ? 'text-[color:var(--color-gold)] fill-[color:var(--color-gold)]' : 'text-[color:var(--color-line)]'} />)}</div>
                  {r.comment && <p className="text-[color:var(--color-ash)] text-sm leading-relaxed italic">"{r.comment}"</p>}
                  <div className="mt-5 font-display text-[color:var(--color-bone)] font-semibold">{r.name}</div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ============ INSTAGRAM ============ */}
      <section className="relative py-24 px-6 sm:px-8 border-t border-[color:var(--color-line)] overflow-hidden">
        <div className="max-w-lg mx-auto text-center">
          <PaintTitle overline={t.sections.follow} title={t.sections.follow} className="mb-4" />
          <p className="text-[color:var(--color-ash)] leading-relaxed mb-10 max-w-md mx-auto">{t.sections.followText}</p>
          <Reveal className="relative">
            <div className="relative glass-card rounded-2xl p-8 sm:p-10 max-w-md mx-auto">
              <div className="relative w-28 h-28 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[color:var(--color-gold)] via-[#f4e4b0] to-[color:var(--color-gold)] p-[3px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[color:var(--color-graphite)] flex items-center justify-center">
                    <img src="https://vcoukinlerisnlpfauxy.supabase.co/storage/v1/object/public/media/IMG_20260729_223802.jpg" alt={BUSINESS.owner} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{BUSINESS.owner}</h3>
              <div className="text-[color:var(--color-gold)] text-sm mt-1">@haytem_br_1</div>
              <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 btn-gold px-7 py-3 rounded-full text-sm font-semibold hover:brightness-110 transition">
                <Instagram size={17} /> {t.sections.followBtn}
              </a>
            </div>
          </Reveal>
          <div className="flex justify-center gap-4 mt-8">
            {[{ icon: Facebook, href: BUSINESS.facebook, label: 'Facebook' }, { icon: Music2, href: BUSINESS.tiktok, label: 'TikTok' }, { icon: MapPin, href: BUSINESS.maps, label: 'Maps' }, { icon: Phone, href: `tel:${BUSINESS.phoneRaw}`, label: 'Call' }].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="w-11 h-11 rounded-full glass-card flex items-center justify-center text-[color:var(--color-gold)] hover:border-[color:var(--color-gold)]/50 hover:scale-110 transition-transform">
                <s.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-28 px-6 overflow-hidden border-t border-[color:var(--color-line)]">

        <Reveal className="relative max-w-3xl mx-auto text-center">
          <h2 className="paint-heading text-5xl sm:text-6xl font-bold leading-tight">{t.footer.legal}</h2>
          <Link to="/book" className="btn-3d inline-flex items-center gap-2 mt-9 px-10 py-4 text-sm font-bold uppercase tracking-wider">
            <Calendar size={17} /> {t.hero.book}
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
