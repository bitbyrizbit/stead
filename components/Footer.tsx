"use client";
import { motion } from 'framer-motion';
import BrandMark from '@/components/BrandMark';

export default function Footer() {
  return (
    <footer className="relative bg-cream-warm grain pt-20 pb-10 px-6 lg:px-10 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink/15 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none opacity-[0.03]" style={{ background: 'radial-gradient(ellipse, #e8542b 0%, transparent 70%)' }} />
      <div className="relative max-w-[1300px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <h2 className="leading-[0.85]">
            <BrandMark size="footer" />
          </h2>
        </motion.div>

        <div className="border-t border-ink/15 pt-10 mb-10">
          <p className="font-serif text-xl lg:text-2xl leading-[1.4] tracking-tight text-ink-soft max-w-[700px] mb-10">
            A quiet little companion for anyone whose hand has ever missed what their eye was aiming at. Built with care, given away freely.
          </p>

          <div className="space-y-3 text-sm text-ink-muted">
            <p>
              <span className="text-ink font-mono text-xs tracking-wider">Explore</span>
              {' — '}
              <a href="#extension" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">the extension</a>
              {', '}
              <a href="#playground" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">try it here</a>
              {', '}
              <a href="/docs" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">the guide</a>
              {', '}
              <a href="#technology" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">what changed lately</a>
            </p>
            <p>
              <span className="text-ink font-mono text-xs tracking-wider">Dig in</span>
              {' — '}
              <a href="https://github.com/bitbyrizbit/stead" target="_blank" rel="noopener noreferrer" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">the source code</a>
              {', '}
              <a href="/docs" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">the core</a>
              {', '}
              <a href="/docs" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">the security review</a>
              {', '}
              <a href="/docs" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">the license</a>
            </p>
            <p>
              <span className="text-ink font-mono text-xs tracking-wider">Say hello</span>
              {' — '}
              <a href="mailto:contact@stead.app" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">drop a note</a>
              {', '}
              <a href="/docs" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">the people behind it</a>
              {', '}
              <a href="#manifesto" data-cursor="hover" className="text-ink-soft hover:text-ember transition-colors">what we are building next</a>
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-ink/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-[10px] text-ink-muted tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
            running smoothly
          </div>
          <div className="flex items-center gap-5">
            <a href="/docs" data-cursor="hover" className="hover:text-ember transition-colors">your privacy</a>
            <a href="/docs" data-cursor="hover" className="hover:text-ember transition-colors">the fine print</a>
            <a href="/docs" data-cursor="hover" className="hover:text-ember transition-colors">our promise to you</a>
          </div>
          <div className="text-ink-muted/60">© 2026 — made with a steady hand</div>
        </div>
      </div>
    </footer>
  );
}
