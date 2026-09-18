"use client";
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative bg-bone-warm grain pt-20 pb-10 px-6 lg:px-10">
      <div className="max-w-[1300px] mx-auto">
        {/* Giant wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <h2 className="font-serif text-[clamp(3.5rem,16vw,14rem)] leading-[0.85] tracking-tighter text-ink">
            STEAD
          </h2>
        </motion.div>

        {/* Flowing prose layout instead of columns */}
        <div className="border-t border-line pt-10 mb-10">
          <p className="font-serif text-xl lg:text-2xl leading-[1.4] tracking-tight text-ink-soft max-w-[700px] mb-10">
            An kinematic accessibility layer. Built for the 6 million
            people living with essential tremor — and anyone whose hand has
            ever missed what their eye aimed for.
          </p>

          {/* Links as inline flowing text, grouped by commas */}
          <div className="space-y-3 text-sm text-ink-muted">
            <p>
              <span className="text-ink">Product</span>
              {' — '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">extension</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">playground</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">documentation</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">changelog</a>
            </p>
            <p>
              <span className="text-ink">Source</span>
              {' — '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">GitHub</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">kernel (WASM)</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">audit report</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">GPL-3.0 license</a>
            </p>
            <p>
              <span className="text-ink">Community</span>
              {' — '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">Discord</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">contributors</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">roadmap</a>
              {', '}
              <a href="#" data-cursor="hover" className="text-ink-soft hover:text-copper transition-colors">contact</a>
            </p>
          </div>
        </div>

        {/* Bottom bar — single line */}
        <div className="pt-6 border-t border-line flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            STEAD // Kernel active
          </div>
          <div className="flex items-center gap-5">
            <a href="/docs" data-cursor="hover" className="hover:text-ink transition-colors">Documentation</a>
            <a href="#" data-cursor="hover" className="hover:text-ink transition-colors">Privacy</a>
            <a href="#" data-cursor="hover" className="hover:text-ink transition-colors">Terms</a>
            <a href="#" data-cursor="hover" className="hover:text-ink transition-colors">Accessibility statement</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

