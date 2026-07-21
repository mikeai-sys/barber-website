import Reveal from './Reveal';

export default function SectionTitle({ overline, title, subtitle, center = true }) {
  return (
    <Reveal className={center ? 'text-center max-w-2xl mx-auto' : ''}>
      {overline && <div className="text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-4">{overline}</div>}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[color:var(--color-bone)] leading-[1.1]">{title}</h2>
      {subtitle && <p className="mt-4 text-[color:var(--color-ash)] text-base leading-relaxed">{subtitle}</p>}
    </Reveal>
  );
}
