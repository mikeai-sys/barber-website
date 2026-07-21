import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import CylinderGallery from '../components/CylinderGallery';
import Reveal from '../components/Reveal';
import supabase from '../lib/supabase';

export default function Gallery() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    supabase.from('gallery').select('*').order('sort_order', { ascending: true })
      .then(({ data }) => setItems(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cats = ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div className="pt-[92px] overflow-hidden">
      <section className="py-16 px-6 sm:px-8 border-b border-[color:var(--color-line)]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-3">{t.nav.gallery}</div>
            <h1 className="paint-heading text-6xl sm:text-7xl md:text-8xl font-bold">{t.sections.gallery}</h1>
            <p className="mt-4 text-[color:var(--color-ash)] max-w-md">{t.sections.gallerySub}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
        {cats.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${filter === c ? 'btn-gold' : 'border border-[color:var(--color-line)] text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]'}`}>{c === 'all' ? t.common.all : c}</button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="shimmer rounded-2xl h-[520px]" />
        ) : filtered.length === 0 ? (
          <div className="luxe-card rounded-2xl py-24 text-center"><ImageIcon className="mx-auto text-[color:var(--color-line)] mb-4" size={44} /><p className="text-[color:var(--color-ash)]">{t.common.empty}</p></div>
        ) : (
          <CylinderGallery items={filtered} />
        )}
      </section>
    </div>
  );
}
