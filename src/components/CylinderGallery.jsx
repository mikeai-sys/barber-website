import { useState, useRef } from 'react';
import { Play, ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

/**
 * Lightweight horizontal-scroll gallery with CSS scroll-snap.
 * No 3D transforms, no requestAnimationFrame, no inertia physics.
 */
export default function CylinderGallery({ items = [], compact = false }) {
  const { t } = useLang();
  const [lightbox, setLightbox] = useState(null);
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir * w, behavior: 'smooth' });
  };

  if (!items.length) {
    return (
      <div className="luxe-card rounded-2xl py-24 text-center">
        <ImageIcon className="mx-auto text-[color:var(--color-line)] mb-4" size={44} />
        <p className="text-[color:var(--color-ash)]">{t.sections.galleryEmpty}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {items.length > 1 && (
        <>
          <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[color:var(--color-ink)]/80 border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-bone)] hover:border-[color:var(--color-gold)] transition hidden sm:flex">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[color:var(--color-ink)]/80 border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-bone)] hover:border-[color:var(--color-gold)] transition hidden sm:flex">
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 px-1"
        style={{ scrollPaddingInline: '1rem' }}
      >
        {items.map((item, i) => (
          <button
            key={item.id ?? i}
            onClick={() => setLightbox(item)}
            className="shrink-0 snap-center group relative rounded-xl overflow-hidden border border-[color:var(--color-line)] hover:border-[color:var(--color-gold)] transition-colors"
            style={{ width: compact ? 180 : 260, height: compact ? 240 : 360 }}
          >
            {item.type === 'video' ? (
              <video src={item.url} muted loop playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={item.url} alt="" draggable={false} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-ink)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {item.type === 'video' && (
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                <Play size={12} className="text-[color:var(--color-gold)] fill-[color:var(--color-gold)]" />
              </div>
            )}
            {item.category && (
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-[10px] tracking-luxe uppercase text-[color:var(--color-gold)]">{item.category}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Dots */}
      {items.length > 1 && items.length <= 20 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-line)]" />)}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-[color:var(--color-ink)]/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 w-11 h-11 rounded-full bg-[color:var(--color-graphite)] flex items-center justify-center text-[color:var(--color-bone)] z-10"><X size={20} /></button>
          <div className="max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {lightbox.type === 'video'
              ? <video src={lightbox.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg" />
              : <img src={lightbox.url} alt="" className="max-w-full max-h-[85vh] rounded-lg object-contain" />}
          </div>
        </div>
      )}
    </div>
  );
}
