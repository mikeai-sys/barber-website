import { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';

export default function LoadingScreen({ onFinish }) {
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    const t = setTimeout(() => setPhase('done'), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => onFinish?.(), 400);
      return () => clearTimeout(t);
    }
  }, [phase, onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ backgroundColor: '#060606' }}>
      {/* Logo */}
      <div className="mb-8">
        <span className="font-display text-4xl sm:text-5xl font-bold text-[color:var(--color-bone)] tracking-wide">HAYTEM</span>
        <span className="font-display text-4xl sm:text-5xl font-bold text-[color:var(--color-gold)] ml-2">BARBER</span>
      </div>

      {/* Scissors cutting animation */}
      <div className="relative flex items-center gap-4 mb-6">
        <div className={`transition-transform duration-200 ${phase === 'loading' ? 'scale-y-[1]' : 'scale-y-[-1]'}`}>
          <Scissors size={32} className="text-[color:var(--color-gold)]" style={{
            animation: phase === 'loading' ? 'scissorsCut 0.4s ease-in-out infinite alternate' : 'none',
          }} />
        </div>
        <div className="w-24 h-0.5 bg-[color:var(--color-gold)]/30 relative overflow-hidden rounded">
          <div className="absolute inset-0 bg-[color:var(--color-gold)] rounded" style={{
            animation: phase === 'loading' ? 'cutLine 1.2s ease-in-out forwards' : 'none',
          }} />
        </div>
      </div>

      <p className="text-[color:var(--color-ash)] text-sm tracking-widest uppercase animate-pulse">Loading...</p>

      <style>{`
        @keyframes scissorsCut {
          0% { transform: rotate(-15deg) scaleX(1); }
          100% { transform: rotate(15deg) scaleX(-1); }
        }
        @keyframes cutLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}
