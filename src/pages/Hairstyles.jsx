import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, Play, Search } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import supabase from '../lib/supabase';

export default function Hairstyles() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  useEffect(() => {
    supabase.from('hairstyles').select('*').order('id', { ascending: true })
      .then(({ data }) => setItems(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cats = ['all', ...Array.from(new Set(items.map(s => s.category).filter(Boolean)))];
  const q = query.toLowerCase().trim();
  const filtered = (cat === 'all' ? items : items.filter(s => s.category === cat)).filter(s => !q || s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));

  return (
    <div className="pt-[92px]">
      <section className="py-20 px-6 sm:px-8 text-center border-b border-[color:var(--color-line)]">
        <SectionTitle overline={t.nav.hairstyles} title={t.nav.hairstyles} subtitle={t.sections.featuredSub} />
      </section>
      <section className="py-16 px-6 sm:px-8 max-w-7xl mx-auto">
        <div className="max-w-md mx-auto mb-8 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-ash)]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.common.search} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-full pl-11 pr-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
        </div>
        {cats.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${cat === c ? 'btn-gold' : 'border border-[color:var(--color-line)] text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]'}`}>{c === 'all' ? t.common.all : c}</button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{[...Array(8)].map((_, i) => <div key={i} className="shimmer rounded-lg aspect-[4/5]" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="luxe-card rounded-lg py-24 text-center"><Scissors className="mx-auto text-[color:var(--color-line)] mb-4" size={44} /><p className="text-[color:var(--color-ash)]">{t.common.empty}</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((h, i) => (
              <Reveal key={h.id} delay={(i % 8) * 0.05}>
                <div className="luxe-card rounded-lg overflow-hidden">
                  <Link to={`/hairstyle/${h.id}`} className="group block">
                    <div className="aspect-[4/5] bg-[color:var(--color-smoke)] overflow-hidden relative">
                      {h.image_url ? <img src={h.image_url} alt={h.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center"><Scissors className="text-[color:var(--color-line)]" size={40} /></div>}
                      {h.video_url && <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[color:var(--color-ink)]/70 flex items-center justify-center"><Play size={13} className="text-[color:var(--color-gold)] fill-[color:var(--color-gold)]" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-ink)] via-transparent to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-4">
                        <div className="text-[9px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-1">{h.category}</div>
                        <h3 className="font-display text-base font-semibold text-[color:var(--color-bone)]">{h.name}</h3>
                      </div>
                    </div>
                  </Link>
                  <Link to={`/book?hairstyle=${h.id}`} className="block w-full text-center btn-gold py-2.5 text-xs font-semibold uppercase tracking-wider mt-[-1px] rounded-b-lg"><Calendar size={13} className="inline mr-1.5 -mt-0.5" />{t.hero.book}</Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
