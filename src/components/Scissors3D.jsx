import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Premium 3D-style barber scissors accent.
 *
 * If `splineUrl` is provided (a published Spline `.splinecode` URL set from the
 * admin Content tab under key `spline_scene`), it lazy-loads the Spline viewer
 * web component and shows the real 3D model. Otherwise it renders a hand-built
 * gold scissors that gently floats and rotates in 3D — fully on-brand and
 * dependency-free.
 */
export default function Scissors3D({ splineUrl }) {
  const [splineReady, setSplineReady] = useState(false);
  const tilt = useRef(null);

  // Load Spline viewer only when a real scene URL is configured.
  useEffect(() => {
    if (!splineUrl) return;
    const id = 'spline-viewer-script';
    if (document.getElementById(id)) { setSplineReady(true); return; }
    const s = document.createElement('script');
    s.type = 'module';
    s.id = id;
    s.src = 'https://unpkg.com/@splinetool/viewer@1.9.48/build/spline-viewer.js';
    s.onload = () => setSplineReady(true);
    document.head.appendChild(s);
  }, [splineUrl]);

  // Subtle pointer-driven parallax tilt for the SVG fallback.
  const onMove = (e) => {
    if (!tilt.current) return;
    const r = tilt.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / r.width;
    const y = (e.clientY - r.top - r.height / 2) / r.height;
    tilt.current.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
  };
  const onLeave = () => { if (tilt.current) tilt.current.style.transform = 'rotateY(0deg) rotateX(0deg)'; };

  if (splineUrl) {
    return (
      <div className="w-full h-full">
        {splineReady
          ? /* @ts-ignore */ <spline-viewer url={splineUrl} style={{ width: '100%', height: '100%', background: 'transparent' }} />
          : <div className="w-full h-full flex items-center justify-center"><div className="w-10 h-10 rounded-full border-2 border-[color:var(--color-gold)]/40 border-t-[color:var(--color-gold)] animate-spin" /></div>}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          ref={tilt}
          animate={{ rotateZ: [0, 3, 0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          style={{ transition: 'transform 0.3s ease-out', transformStyle: 'preserve-3d' }}
        >
          <svg width="300" height="300" viewBox="0 0 200 200" className="drop-shadow-[0_25px_45px_rgba(201,162,75,0.25)] w-52 h-52 sm:w-72 sm:h-72">
            <defs>
              <linearGradient id="gold1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f4e4b0" />
                <stop offset="45%" stopColor="#c9a24b" />
                <stop offset="100%" stopColor="#8a6d28" />
              </linearGradient>
              <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e9e4d8" />
                <stop offset="55%" stopColor="#b8b2a4" />
                <stop offset="100%" stopColor="#7d786c" />
              </linearGradient>
            </defs>

            {/* pivot screw */}
            <circle cx="100" cy="100" r="7" fill="url(#gold1)" stroke="#5c4a1c" strokeWidth="1.5" />

            {/* Blade 1 */}
            <path d="M100 100 L58 40 Q50 30 40 34 Q30 40 36 52 L96 104 Z" fill="url(#steel)" stroke="#6b665a" strokeWidth="1.2" />
            {/* Blade 2 */}
            <path d="M100 100 L142 40 Q150 30 160 34 Q170 40 164 52 L104 104 Z" fill="url(#steel)" stroke="#6b665a" strokeWidth="1.2" />

            {/* Handle 1 (gold ring) */}
            <path d="M100 100 L70 150" stroke="url(#gold1)" strokeWidth="7" strokeLinecap="round" fill="none" />
            <circle cx="58" cy="165" r="20" fill="none" stroke="url(#gold1)" strokeWidth="9" />
            {/* Handle 2 (gold ring) */}
            <path d="M100 100 L130 150" stroke="url(#gold1)" strokeWidth="7" strokeLinecap="round" fill="none" />
            <circle cx="142" cy="165" r="20" fill="none" stroke="url(#gold1)" strokeWidth="9" />

            {/* shine highlights */}
            <path d="M52 44 L92 100" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />
            <path d="M148 44 L108 100" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
