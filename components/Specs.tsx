"use client";
import { motion } from 'framer-motion';
import { Shield, Cpu, Lock, Feather, Globe, Heart } from 'lucide-react';
import BrandMark from '@/components/BrandMark';

const specs = [
  { icon: Cpu, label: 'Response time', value: '0.4ms', note: 'faster than a blink', accent: 'text-ember' },
  { icon: Feather, label: 'Install size', value: '14KB', note: 'smaller than a logo', accent: 'text-moss' },
  { icon: Lock, label: 'Data sent', value: '0 bytes', note: 'nothing, ever', accent: 'text-gold' },
  { icon: Shield, label: 'Wobble removed', value: '94%', note: 'of your tremor', accent: 'text-ember' },
  { icon: Globe, label: 'Works on', value: 'every site', note: 'across the whole web', accent: 'text-moss' },
  { icon: Heart, label: 'Price', value: 'free', note: 'for everyone, forever', accent: 'text-gold' },
];

export default function Specs() {
  return (
    <section className="relative py-28 lg:py-36 px-6 lg:px-10 bg-cream-paper grain overflow-hidden">
      <div className="absolute inset-0 retro-grid-lg opacity-40 pointer-events-none" />
      <div className="relative max-w-[1300px] mx-auto">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-7">
            <h2 className="font-serif text-[clamp(1.8rem,5vw,3.5rem)] leading-[1.05] tracking-tighter text-ink">
              Small enough to trust.
              <br />
              <span className="italic text-ember">Fast enough to feel.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:pt-3">
            <p className="text-base text-ink-soft leading-relaxed max-w-md">
              <BrandMark size="inline" /> is not a service. It is a single file that lives in your browser and asks for nothing. Here is exactly what it does, measured.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {specs.map((spec, i) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
              className="vintage-card rounded-xl p-6 relative overflow-hidden group"
              data-cursor="hover"
            >
              <div className={`w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center mb-4 vintage-inset`}>
                <spec.icon className={`w-5 h-5 ${spec.accent}`} strokeWidth={1.5} />
              </div>
              <div className="font-mono text-[10px] text-ink-muted tracking-widest mb-1">{spec.label}</div>
              <div className={`font-serif text-3xl ${spec.accent} tnum tracking-tighter mb-1`}>{spec.value}</div>
              <div className="text-sm text-ink-muted">{spec.note}</div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-ember scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>

        {/* Retro compatibility bar */}
        <div className="mt-12 flex flex-wrap items-center gap-4 px-6 py-4 rounded-xl border-2 border-ink/15 bg-cream-warm shadow-retro-sm">
          <span className="font-mono text-[10px] text-ink-muted tracking-widest">Works with</span>
          <div className="flex flex-wrap items-center gap-5">
            {['Chrome 90+', 'Firefox 88+', 'Safari 15+', 'Edge 90+', 'Brave', 'Arc'].map((b) => (
              <span key={b} className="font-mono text-xs text-ink-soft tracking-tight">{b}</span>
            ))}
          </div>
          <span className="ml-auto flex items-center gap-2 font-mono text-[10px] text-moss tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
            Ready to use in seconds
          </span>
        </div>
      </div>
    </section>
  );
}
