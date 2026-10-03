"use client";
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BrandMark from '@/components/BrandMark';
import HeroThreeCanvas from './HeroThreeCanvas';
import { sfx } from '@/lib/soundEffects';

interface HeroProps {
  onStart?: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen pt-28 pb-16 px-6 lg:px-10 overflow-hidden">
      <div className="absolute inset-0 retro-grid-lg opacity-30 pointer-events-none" />
      
      {/* Warm Ambient Orange & Ember Tint Glows */}
      <div className="absolute top-0 right-0 w-[750px] h-[750px] pointer-events-none opacity-[0.10]" style={{ background: 'radial-gradient(circle at 70% 30%, #e8542b 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 left-0 w-[650px] h-[650px] pointer-events-none opacity-[0.07]" style={{ background: 'radial-gradient(circle at 30% 70%, #e8542b 0%, transparent 60%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none opacity-[0.05]" style={{ background: 'radial-gradient(ellipse, #f07a52 0%, transparent 65%)' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] pointer-events-none opacity-[0.015] retro-grid rounded-full" />

      {/* Floating ambient shapes */}
      <motion.div className="absolute top-[20%] right-[8%] w-24 h-24 rounded-full border-2 border-ember/20 pointer-events-none" animate={{ y: [0, -20, 0], rotate: [0, 90, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[15%] left-[5%] w-16 h-16 pointer-events-none" animate={{ y: [0, 25, 0], rotate: [0, -180, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="w-full h-full border-2 border-ember/20 rotate-45" />
      </motion.div>
      <motion.div className="absolute top-[60%] right-[15%] w-3 h-3 rounded-full bg-gold/25 pointer-events-none" animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute top-[35%] left-[12%] w-2 h-2 rounded-full bg-ember/30 pointer-events-none" animate={{ y: [0, 20, 0], opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

      <motion.div style={{ y, opacity }} className="max-w-[1300px] mx-auto">
        <div className="mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.92] tracking-tighter text-ink"
          >
            Your intent,
            <br />
            <span className="inline-block pl-[1.5em]">not your{' '}<span className="italic font-light text-ember">tremor.</span></span>
          </motion.h1>
        </div>

        <div className="grid grid-cols-12 gap-8 mb-8 items-center">
          <div className="col-span-12 lg:col-span-6 flex justify-center lg:justify-start">
            <HeroThreeCanvas />
          </div>
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-between gap-6 lg:pt-4">
            <p className="font-serif text-lg lg:text-2xl leading-[1.38] tracking-tight text-ink-soft">
              <BrandMark size="inline" /> hears the difference between what you reached for and what your hand actually did. Then it quietly chooses the first one. Your cursor goes where you meant it to, not where your fingers sent it.
            </p>

            <div className="flex items-center gap-3 font-mono text-[11px] tracking-wider py-1">
              <span className="text-ember">{'>'}</span>
              <span className="text-ink-muted uppercase">3D Pointer Physics</span>
              <span className="text-ink tnum font-semibold">0.4ms</span>
              <span className="flex items-center gap-1.5 text-moss uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
                Active Deconvolution
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick(1000);
                  onStart?.();
                }}
                className="group relative px-6 py-3 bg-ink text-cream-paper text-sm rounded-lg overflow-hidden shadow-retro-sm"
                data-cursor="hover"
              >
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  Bring <BrandMark size="inline" variant="dark" /> home
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </span>
                <span className="absolute inset-0 bg-ember translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <a
                href="#technology"
                onClick={() => sfx.playClick(800)}
                className="text-sm text-ink-soft underline decoration-line decoration-1 underline-offset-4 hover:decoration-ember transition-colors font-medium"
                data-cursor="hover"
              >
                What it actually does
              </a>
            </div>

            {/* Mini spec badges with subtle 3D hover */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-ink/10">
              {[
                { k: '0.4ms', v: 'to respond' },
                { k: '94%', v: 'wobble removed' },
                { k: '14KB', v: 'to install' },
                { k: '0', v: 'data sent' },
              ].map((s) => (
                <div key={s.v} className="flex items-baseline gap-2 group" data-cursor="hover">
                  <span className="font-serif text-2xl text-ink tnum group-hover:text-ember transition-colors">{s.k}</span>
                  <span className="font-mono text-[10px] text-ink-muted tracking-wider uppercase font-medium">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
