"use client";
import { motion } from 'framer-motion';
import BrandMark from '@/components/BrandMark';

interface ExtensionProps {
  onStart?: () => void;
}

function ChromeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  );
}

function DownloadIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Extension({ onStart }: ExtensionProps) {
  return (
    <section id="extension" className="relative py-32 lg:py-44 px-6 lg:px-10 bg-cream grain overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,84,43,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 retro-grid-lg opacity-30 pointer-events-none" />

      <div className="relative max-w-[1100px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-12">
          <div className="flex-1">
            <h2 className="font-serif text-[clamp(2rem,6vw,5rem)] leading-[1.0] tracking-tighter text-ink">
              One install.
              <br />
              <span className="italic text-ember">The whole web,</span>
              {' '}gentled.
            </h2>
          </div>

          <div className="flex-1 lg:pt-6">
            <p className="text-base lg:text-lg text-ink-soft leading-relaxed max-w-md">
              Add <BrandMark size="inline" /> to your browser once, and it quietly gets to work on every button, link, and form across the entire web. No settings to fiddle with. No account to create. No catch. Just a steadier hand, everywhere you go.
            </p>
          </div>
        </div>

        {/* Install cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: ChromeIcon, label: 'Add to Chrome', sub: 'Chrome Web Store', primary: true },
            { icon: DownloadIcon, label: 'Add to Firefox', sub: 'Firefox Add-ons', primary: false },
            { icon: DownloadIcon, label: 'Add to Safari', sub: 'Safari Extensions', primary: false },
          ].map((store, i) => (
            <motion.button
              key={store.label}
              onClick={onStart}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group text-left relative rounded-xl border-2 p-5 overflow-hidden transition-all ${
                store.primary
                  ? 'border-ember bg-ember text-cream-paper shadow-retro-ember'
                  : 'border-ink/15 bg-cream-paper text-ink shadow-retro-sm hover:border-ink'
              }`}
              data-cursor="hover"
            >
              <store.icon className="w-6 h-6 mb-3" />
              <div className="font-serif text-lg tracking-tight">{store.label}</div>
              <div className={`font-mono text-[10px] tracking-wider mt-1 ${store.primary ? 'text-cream/60' : 'text-ink-muted'}`}>
                {store.sub}
              </div>
              <span className="absolute top-4 right-4 text-xl transition-transform group-hover:translate-x-1">→</span>
            </motion.button>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-6 px-6 py-4 rounded-xl border-2 border-ink/15 bg-cream-paper shadow-retro-sm">
          <span className="flex items-center gap-2 text-sm text-ink-soft">
            <GithubIcon className="w-4 h-4 text-ink-muted" />
            <span className="font-mono text-xs tracking-tight">open source</span>
          </span>
          <span className="w-px h-4 bg-ink/10" />
          <span className="font-mono text-[10px] text-ink-muted tracking-widest">14KB · no permissions · free forever</span>
          <span className="ml-auto flex items-center gap-2 font-mono text-[10px] text-moss tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
            independently reviewed
          </span>
        </div>
      </div>
    </section>
  );
}
