"use client";
import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Nav({ onStart }: { onStart?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled ? 'bg-bone/85 backdrop-blur-sm border-b border-line/60' : 'bg-transparent'
      }`}
    >
      <div className="px-6 lg:px-10 py-4 flex items-center justify-between">
        <a href="#" data-cursor="hover" className="flex items-baseline gap-2">
          <span className="font-serif text-xl tracking-tighter text-ink font-medium">Stead</span>
          <span className="text-[11px] text-ink-muted hidden sm:inline">accessibility substrate</span>
        </a>

        <div className="hidden md:flex items-center gap-7 text-sm text-ink-soft">
          <a href="#manifesto" data-cursor="hover" className="hover:text-copper transition-colors">Manifesto</a>
          <a href="#technology" data-cursor="hover" className="hover:text-copper transition-colors">Technology</a>
          <a href="#playground" data-cursor="hover" className="hover:text-copper transition-colors">Playground</a>
          <a href="#extension" data-cursor="hover" className="hover:text-copper transition-colors">Extension</a>
        </div>

        <button
          onClick={onStart}
          className="group relative px-5 py-2 bg-ink text-bone text-sm rounded-sm overflow-hidden"
          data-cursor="hover"
        >
          <span className="relative z-10">Get Stead</span>
          <span className="absolute inset-0 bg-copper translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
        </button>
      </div>
    </motion.nav>
  );
}
