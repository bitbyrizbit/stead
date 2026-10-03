"use client";
import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import BrandMark from '@/components/BrandMark';

interface NavProps {
  onStart?: () => void;
}

export default function Nav({ onStart }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-cream-paper/95 backdrop-blur-sm border-b-2 border-ink/15' : 'bg-transparent'
      }`}
    >
      <div className="px-6 lg:px-10 py-4 flex items-center justify-between">
        <a href="#" data-cursor="hover" className="flex items-baseline gap-3">
          <BrandMark size="nav" />
        </a>

        <div className="hidden md:flex items-center gap-7 text-sm text-ink-soft">
          <a href="#manifesto" data-cursor="hover" className="hover:text-ember transition-colors">The idea</a>
          <a href="#technology" data-cursor="hover" className="hover:text-ember transition-colors">How it works</a>
          <a href="#playground" data-cursor="hover" className="hover:text-ember transition-colors">Try it</a>
          <a href="#extension" data-cursor="hover" className="hover:text-ember transition-colors">Get it</a>
        </div>

        <button
          onClick={onStart}
          className="group relative px-5 py-2 bg-ink text-cream-paper text-sm rounded-lg overflow-hidden shadow-retro-sm"
          data-cursor="hover"
        >
          <span className="relative z-10">Bring <BrandMark size="inline" variant="dark" /> home</span>
          <span className="absolute inset-0 bg-ember translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>
    </motion.nav>
  );
}
