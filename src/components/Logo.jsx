export default function Logo({ size = 'md', onDark = true }) {
  const scale = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl';
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative flex items-center justify-center w-9 h-9 border border-[color:var(--color-gold)] rounded-sm">
        <span className="font-display font-bold text-[color:var(--color-bone)] leading-none">H</span>
      </div>
      <div className="leading-none">
        <div className={`font-display font-extrabold ${scale} tracking-wide ${onDark ? 'text-[color:var(--color-bone)]' : 'text-ink'}`}>HAYTEM</div>
        <div className="text-[9px] tracking-luxe text-[color:var(--color-gold)] font-medium mt-[2px]">BARBER</div>
      </div>
    </div>
  );
}
