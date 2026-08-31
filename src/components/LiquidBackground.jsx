/*
 * Static background — pure CSS gradients, zero JS, zero blur.
 * No canvas, no requestAnimationFrame, no GPU-heavy filters.
 */
export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      {/* Warm gradient blobs */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 60% 50% at 20% 30%, rgba(184,115,51,0.15) 0%, transparent 70%),
          radial-gradient(ellipse 50% 60% at 80% 40%, rgba(207,155,94,0.12) 0%, transparent 70%),
          radial-gradient(ellipse 70% 50% at 50% 80%, rgba(120,78,30,0.10) 0%, transparent 70%),
          #060606
        `
      }} />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,6,6,0.5)_100%)]" />
    </div>
  );
}
