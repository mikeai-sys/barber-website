import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Clock, Tag, Calendar } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import supabase from '../lib/supabase';

export default function Services() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('all');
  useEffect(() => {
    supabase.from('services').select('*').order('sort_order', { ascending: true })
      .then(({ data }) => setServices(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cats = ['all', ...Array.from(new Set(services.map(s => s.category).filter(Boolean)))];
  const filtered = cat === 'all' ? services : services.filter(s => s.category === cat);

  return (
    <div className="pt-[92px]">
      <section className="py-20 px-6 sm:px-8 text-center border-b border-[color:var(--color-line)]">
        <SectionTitle overline={t.nav.services} title={t.nav.services} subtitle={t.sections.servicesSub} />
      </section>
      <section className="py-16 px-6 sm:px-8 max-w-7xl mx-auto">
        {cats.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${cat === c ? 'btn-gold' : 'border border-[color:var(--color-line)] text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]'}`}>{c === 'all' ? t.common.all : c}</button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="shimmer rounded-lg h-72" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="luxe-card rounded-lg py-24 text-center"><Scissors className="mx-auto text-[color:var(--color-line)] mb-4" size={44} /><p className="text-[color:var(--color-ash)]">{t.common.empty}</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <Link to={`/service/${s.id}`} className="block luxe-card rounded-lg overflow-hidden h-full flex flex-col group">
                  <div className="aspect-video bg-[color:var(--color-smoke)] overflow-hidden">
                    {s.video_url ? <video src={s.video_url} controls playsInline className="w-full h-full object-cover" poster={s.image_url || undefined} />
                      : s.image_url ? <img src={s.image_url} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={40} /></div>}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-[color:var(--color-bone)]">{s.title}</h3>
                      {s.available === false && <span className="text-[10px] uppercase tracking-wide text-[color:var(--color-ash)] border border-[color:var(--color-line)] px-2 py-0.5 rounded">{t.common.comingSoon}</span>}
                    </div>
                    {s.category && <div className="text-[10px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-2">{s.category}</div>}
                    {s.description && <p className="text-sm text-[color:var(--color-ash)] leading-relaxed flex-1">{s.description}</p>}
                    <div className="mt-5 pt-5 border-t border-[color:var(--color-line)] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[color:var(--color-gold)] font-medium"><Tag size={14}/> {s.price ? `${s.price} DA` : t.common.priceOnRequest}</span>
                      {s.duration && <span className="flex items-center gap-1.5 text-xs text-[color:var(--color-ash)]"><Clock size={13}/> {s.duration} {t.common.minutes}</span>}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
        <div className="mt-14 text-center">
          <Link to="/book" className="inline-flex items-center gap-2 btn-gold px-8 py-4 rounded-sm text-sm font-semibold uppercase tracking-wider"><Calendar size={16}/> {t.hero.book}</Link>
        </div>
      </section>
    </div>
  );
}
