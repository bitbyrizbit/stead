"use client";
import { useState } from 'react';
import BrandMark from '@/components/BrandMark';
import Cursor from '@/components/Cursor';
import { sfx } from '@/lib/soundEffects';

export default function Docs() {
  const [activeSection, setActiveSection] = useState('philosophy');

  const navItems = [
    { id: 'philosophy', label: '01 — Philosophy' },
    { id: 'architecture', label: '02 — Architecture' },
    { id: 'kinematics', label: '03 — Kinematics' },
    { id: 'deployment', label: '04 — Deployment' },
  ];

  const scrollTo = (id: string) => {
    sfx.playClick(900);
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cream text-ink font-sans flex cursor-none grain">
      <Cursor />
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      
      {/* Sidebar Nav */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 border-r-2 border-ink/15 p-8 flex flex-col justify-between hidden md:flex z-40 bg-cream-paper/95 backdrop-blur-md">
        <div>
          <a href="/" className="inline-block" data-cursor="hover">
            <BrandMark size="nav" />
          </a>
          <div className="text-[10px] font-sans uppercase tracking-[0.16em] text-ink-muted mt-2 font-bold">
            Documentation & Architecture
          </div>
          
          <nav className="mt-14 flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                data-cursor="hover"
                className={`text-left text-xs font-sans uppercase tracking-[0.14em] font-semibold transition-colors ${
                  activeSection === item.id ? 'text-ember' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div>
          <a
            href="/"
            data-cursor="hover"
            className="text-xs text-ink-muted hover:text-ink font-sans uppercase tracking-wider font-semibold flex items-center gap-2"
          >
            ← Back to STEAD
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-0 md:ml-72 flex-1 px-8 py-20 md:py-28 lg:px-20 max-w-4xl relative z-10">
        
        <section id="philosophy" className="mb-28">
          <span className="font-sans text-xs text-ember uppercase tracking-[0.16em] font-bold">01 · Philosophy</span>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight mt-2 mb-8 leading-[1.05]">
            The hand is human.<br/>
            <span className="italic text-ember font-light">The cursor doesn&apos;t have to shake.</span>
          </h1>
          <p className="text-lg text-ink-soft leading-relaxed mb-6 font-serif">
            Digital interfaces demand micro-millimeter precision from a biological system that evolved for grasping and tool use. When biological tremor causes misclicks and fatigue, the software shouldn&apos;t punish the user—it should forgive and filter.
          </p>
          <div className="p-6 rounded-2xl bg-cream-paper border-2 border-ink/15 shadow-retro-sm my-6">
            <p className="text-sm text-ink-muted font-sans leading-relaxed">
              <strong className="text-ink font-bold">Primary Axiom:</strong> STEAD is an invisible accessibility companion. It runs completely offline on-device, storing zero telemetry and transmitting zero packets.
            </p>
          </div>
        </section>

        <section id="architecture" className="mb-28 border-t-2 border-ink/10 pt-16">
          <span className="font-sans text-xs text-moss uppercase tracking-[0.16em] font-bold">02 · Architecture</span>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight mt-2 mb-6">
            Sub-millisecond Pipeline
          </h2>
          <p className="text-base text-ink-soft leading-relaxed mb-6 font-sans">
            STEAD operates as an ultra-compact (14KB) WebAssembly micro-kernel sitting between the OS pointer event queue and the browser rendering compositor.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-5 rounded-xl bg-cream-paper border-2 border-ink/15 shadow-retro-sm">
              <div className="text-2xl font-serif text-ember font-bold mb-1">0.4ms</div>
              <div className="text-xs font-sans uppercase tracking-wider text-ink-muted font-semibold">Latency Overhead</div>
            </div>
            <div className="p-5 rounded-xl bg-cream-paper border-2 border-ink/15 shadow-retro-sm">
              <div className="text-2xl font-serif text-moss font-bold mb-1">14KB</div>
              <div className="text-xs font-sans uppercase tracking-wider text-ink-muted font-semibold">WASM Binary</div>
            </div>
            <div className="p-5 rounded-xl bg-cream-paper border-2 border-ink/15 shadow-retro-sm">
              <div className="text-2xl font-serif text-gold font-bold mb-1">0 Bytes</div>
              <div className="text-xs font-sans uppercase tracking-wider text-ink-muted font-semibold">Data Transmitted</div>
            </div>
          </div>
        </section>

        <section id="kinematics" className="mb-28 border-t-2 border-ink/10 pt-16">
          <span className="font-sans text-xs text-ember uppercase tracking-[0.16em] font-bold">03 · Kinematics</span>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight mt-2 mb-6">
            Adaptive One Euro Filtering & Magnetic Gravitation
          </h2>
          <p className="text-base text-ink-soft leading-relaxed mb-4 font-sans">
            Biological tremors predominantly manifest in the 4–12 Hz frequency band. STEAD dynamically modulates cutoff frequencies:
          </p>
          <ul className="space-y-3 font-sans text-sm text-ink-soft mb-6">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-ember mt-2 shrink-0" />
              <span><strong>Low-Velocity Stabilization:</strong> When pointer movement slows near targets, cutoff frequency decreases to eliminate micro-jitter completely.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-moss mt-2 shrink-0" />
              <span><strong>High-Velocity Tracking:</strong> During rapid ballistic movements, the filter adapts with zero perceived lag.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
              <span><strong>Gravitational Horizon Snap:</strong> Interactive elements cast a 60px invisible potential well that gently guides the cursor toward click targets.</span>
            </li>
          </ul>
        </section>

        <section id="deployment" className="mb-28 border-t-2 border-ink/10 pt-16">
          <span className="font-sans text-xs text-moss uppercase tracking-[0.16em] font-bold">04 · Deployment</span>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight mt-2 mb-6">
            Browser Extension & Universal Injection
          </h2>
          <p className="text-base text-ink-soft leading-relaxed font-sans mb-6">
            Available as a lightweight browser extension across Chrome, Firefox, Safari, Edge, Brave, and Arc with zero configuration requirements.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/"
              data-cursor="hover"
              className="px-6 py-3 rounded-xl bg-ink text-cream-paper text-sm font-semibold shadow-retro-sm hover:bg-ember transition-colors"
            >
              Get STEAD Free
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
