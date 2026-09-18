"use client";
import { motion } from 'framer-motion';

export default function Extension() {
  return (
    <section id="extension" className="relative py-32 lg:py-44 px-6 lg:px-10 bg-bone grain overflow-hidden">
      {/* Soft radial â€” not glassmorphism, just a warm glow */}
      <motion.div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-[1100px] mx-auto">
        <div className="flex items-center gap-3 mb-12 text-[11px] text-ink-muted">
          <span>05</span>
          <span className="w-8 h-px bg-line" />
          <span>Universal access</span>
        </div>

        {/* Asymmetric layout â€” headline takes 60%, details flow alongside */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-12">
          <div className="flex-1">
            <h2 className="font-serif text-[clamp(2rem,6vw,5rem)] leading-[1.0] tracking-tighter text-ink">
              Install once.
              <br />
              <span className="italic text-copper">Everywhere</span>
              {' '}stabilized.
            </h2>
          </div>

          <div className="flex-1 lg:pt-6">
            <p className="text-base lg:text-lg text-ink-soft leading-relaxed max-w-md">
              The lightweight STEAD extension applies architectural kinematic
              damping to every button, link, and input across the web. One
              install. No configuration. No accounts.
            </p>
          </div>
        </div>

        {/* Install buttons as a horizontal strip */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <a
            href="#"
            className="group relative px-7 py-3.5 bg-ink text-bone text-sm rounded-sm overflow-hidden"
            data-cursor="hover"
          >
            <span className="relative z-10 flex items-center gap-2">
              Add to Chrome / 14KB
              <span className="inline-block transition-transform group-hover:translate-x-1">â†’</span>
            </span>
            <span className="absolute inset-0 bg-copper translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
          </a>
          <a
            href="#"
            className="px-5 py-3.5 text-ink-soft text-sm border border-line rounded-sm hover:border-ink hover:text-ink transition-colors"
            data-cursor="hover"
          >
            Firefox
          </a>
          <a
            href="#"
            className="px-5 py-3.5 text-ink-soft text-sm border border-line rounded-sm hover:border-ink hover:text-ink transition-colors"
            data-cursor="hover"
          >
            Safari
          </a>
        </div>

        {/* Specs as a single flowing line â€” no columns */}
        <div className="border-t border-line pt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3 text-sm text-ink-muted">
          <span className="text-ink"><span className="font-serif text-base text-ink">14KB</span> gzipped</span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span className="text-ink"><span className="font-serif text-base text-ink">No</span> permissions</span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span className="text-ink"><span className="font-serif text-base text-ink">GPL-3.0</span> Â· GitHub</span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span className="text-ink"><span className="font-serif text-base text-ink">Cure53</span> audited, 2026</span>
        </div>
      </div>
    </section>
  );
}

