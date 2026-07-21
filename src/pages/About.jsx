import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Target, Eye, Award, BookOpen, Calendar, Instagram, User } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { BUSINESS } from '../lib/business';
import Reveal from '../components/Reveal';
import supabase from '../lib/supabase';

export default function About() {
  const { t } = useLang();
  const [content, setContent] = useState({});
  const [barbers, setBarbers] = useState([]);
  useEffect(() => {
    supabase.from('site_content').select('*').then(({ data }) => {
      const m = {}; (data || []).forEach(r => m[r.key] = r.value); setContent(m);
    }).catch(() => {});
    supabase.from('barbers').select('*').order('sort_order', { ascending: true }).then(({ data }) => setBarbers(data || [])).catch(() => {});
  }, []);

  const blocks = [
    { key: 'about_story', icon: BookOpen, title: t.about.story },
    { key: 'about_bio', icon: Scissors, title: t.about.bio },
    { key: 'about_experience', icon: Award, title: t.about.experience },
    { key: 'about_mission', icon: Target, title: t.about.mission },
    { key: 'about_vision', icon: Eye, title: t.about.vision },
  ];

  return (
    <div className="pt-[92px]">
      <section className="py-20 px-6 sm:px-8 text-center border-b border-[color:var(--color-line)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-4">{BUSINESS.name}</div>
          <h1 className="paint-heading text-5xl sm:text-7xl font-bold inline-block">{t.about.title}</h1>
        </div>
      </section>

      <section className="py-20 px-6 sm:px-8 max-w-4xl mx-auto space-y-8">
        {blocks.map((b, i) => (
          <Reveal key={b.key} delay={i * 0.05}>
            <div className="glass-card rounded-lg p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center shrink-0"><b.icon size={19} className="text-[color:var(--color-gold)]" /></div>
                <h2 className="font-display text-2xl font-semibold text-[color:var(--color-bone)]">{b.title}</h2>
              </div>
              <p className="text-[color:var(--color-ash)] leading-relaxed whitespace-pre-line">{content[b.key] || t.about.placeholder}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* TEAM — assistant barbers */}
      <section className="py-20 px-6 sm:px-8 max-w-6xl mx-auto border-t border-[color:var(--color-line)]">
        <Reveal className="text-center mb-14">
          <div className="text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-3">{t.about.teamSub}</div>
          <h2 className="paint-heading text-4xl sm:text-5xl font-bold inline-block">{t.about.team}</h2>
        </Reveal>
        {barbers.length === 0 ? (
          <div className="glass-card rounded-lg py-16 text-center max-w-lg mx-auto">
            <User className="mx-auto text-[color:var(--color-line)] mb-4" size={40} />
            <p className="text-[color:var(--color-ash)]">{t.about.teamEmpty}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.06}>
                <div className="glass-card rounded-xl overflow-hidden h-full">
                  <div className="aspect-[4/5] bg-[color:var(--color-smoke)] overflow-hidden">
                    {b.photo_url ? <img src={b.photo_url} alt={b.name} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="text-[color:var(--color-line)]" size={54} /></div>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold text-[color:var(--color-bone)]">{b.name}</h3>
                    {b.role && <div className="text-[11px] tracking-luxe uppercase text-[color:var(--color-gold)] mt-1">{b.role}</div>}
                    {b.bio && <p className="mt-3 text-sm text-[color:var(--color-ash)] leading-relaxed">{b.bio}</p>}
                    {b.instagram && <a href={b.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm text-[color:var(--color-gold)]"><Instagram size={15} /> Instagram</a>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
        <Reveal className="text-center pt-14">
          <Link to="/book" className="btn-3d inline-flex items-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-wider"><Calendar size={16}/> {t.hero.book}</Link>
        </Reveal>
      </section>
    </div>
  );
}
