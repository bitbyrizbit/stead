"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Docs() {
  const [activeSection, setActiveSection] = useState('philosophy');

  const navItems = [
    { id: 'philosophy', label: '01 — Philosophy' },
    { id: 'architecture', label: '02 — Architecture' },
    { id: 'kinematics', label: '03 — Kinematics' },
    { id: 'deployment', label: '04 — Deployment' },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bone text-ink font-sans selection:bg-sage selection:text-bone flex cursor-none">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50"></div>
      
      {/* Sidebar Nav */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-line p-8 flex flex-col justify-between hidden md:flex z-40 bg-bone">
        <div>
          <a href="/" className="font-serif text-2xl tracking-tighter text-ink font-medium hover:text-sage transition-colors">STEAD</a>
          <div className="text-[9px] font-mono tracking-[0.2em] text-ink-muted mt-2">DOCUMENTATION</div>
          
          <nav className="mt-16 flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-left text-xs font-mono tracking-wider transition-colors ${
                  activeSection === item.id ? 'text-copper font-semibold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="text-[10px] font-mono tracking-widest text-ink-muted uppercase">
          STEAD Documentation
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-0 md:ml-64 flex-1 px-6 py-24 md:py-32 lg:px-24 max-w-4xl relative z-10">
        
        <section id="philosophy" className="mb-32">
          <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mb-8 leading-none">
            The hand is human.<br/>
            <span className="italic text-sage font-light">The cursor is absolute.</span>
          </h1>
          <p className="text-lg text-ink-soft leading-relaxed mb-6">
            Interfaces demand surgical precision from an organ that evolved to throw rocks and grip branches. We built millions of pixels and then asked the biological hand to navigate them without shaking. That was our first mistake.
          </p>
          <p className="text-lg text-ink-soft leading-relaxed mb-10">
            STEAD is not a band-aid. It is a fundamental kinematic renegotiation between human biology and digital input. We do not fix the hand. We simply teach the machine to ignore the noise.
          </p>
          
          <div className="p-6 border border-line rounded-sm bg-bone-warm">
            <h3 className="font-mono text-xs tracking-widest text-copper mb-2">CORE TENET</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              If an interface cannot differentiate between a deliberate gesture and an involuntary tremor, the interface is broken—not the user.
            </p>
          </div>
        </section>

        <section id="architecture" className="mb-32">
          <h2 className="font-serif text-4xl tracking-tighter mb-6">02 — Architecture</h2>
          <p className="text-base text-ink-soft leading-relaxed mb-6">
            We stripped the stack down to the studs. Wrapping a heavy JavaScript layer over the browser's paint cycle introduces latency—and latency is the enemy of intent. STEAD operates entirely within a WebAssembly (WASM) kernel, compiled from Rust, executing directly against the browser's rendering thread.
          </p>
          <ul className="flex flex-col gap-4 mb-8">
            <li className="flex items-start gap-4">
              <span className="w-1.5 h-1.5 rounded-full bg-sage mt-2 shrink-0"></span>
              <div>
                <strong className="block text-sm font-medium mb-1">Sub-millisecond Execution</strong>
                <span className="text-sm text-ink-muted leading-relaxed">By bypassing the V8 garbage collector, the Fourier dampening algorithm executes in under 0.4ms.</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-1.5 h-1.5 rounded-full bg-copper mt-2 shrink-0"></span>
              <div>
                <strong className="block text-sm font-medium mb-1">Zero Telemetry</strong>
                <span className="text-sm text-ink-muted leading-relaxed">Input coordinate data is the most sensitive biometric signature you possess. STEAD processes it locally and discards it instantly. Nothing leaves the machine.</span>
              </div>
            </li>
          </ul>
        </section>

        <section id="kinematics" className="mb-32">
          <h2 className="font-serif text-4xl tracking-tighter mb-6">03 — Kinematics</h2>
          <p className="text-base text-ink-soft leading-relaxed mb-6">
            Tremors are not random; they are cyclic. Essential tremor typically manifests in the 4 to 12 Hz frequency band. STEAD runs a continuous Fast Fourier Transform (FFT) over the pointer delta, mathematically isolating these frequencies and cleanly subtracting them.
          </p>
          <div className="relative w-full h-48 bg-ink rounded-sm overflow-hidden mb-6 flex items-center justify-center p-8">
            <svg viewBox="0 0 400 100" className="w-full h-full" fill="none">
              <path d="M0,50 Q20,20 40,50 T80,50 T120,50 T160,50" stroke="#B87333" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M0,50 L400,50" stroke="#5B6B5A" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-bone opacity-50 tracking-widest">
              fig 1. frequency subtraction
            </div>
          </div>
          <p className="text-base text-ink-soft leading-relaxed">
            Complementing the algorithmic dampening is our Magnetic Geometry. Interactive nodes exert a localized gravitational pull. When the cursor breaches the event horizon of a button, it is pulled to the center—turning a strenuous micro-adjustment into a fluid gesture.
          </p>
        </section>

        <section id="deployment" className="mb-32">
          <h2 className="font-serif text-4xl tracking-tighter mb-6">04 — Deployment</h2>
          <p className="text-base text-ink-soft leading-relaxed mb-6">
            No bloated SDKs. No mandatory accounts. The engine is packaged as a standard Chrome Extension MV3, weighting precisely 14KB over the wire. It injects a shadow DOM overlay that intercepts and purifies `PointerEvents` before they hit the underlying webpage.
          </p>
          
          <div className="bg-ink p-6 rounded-sm text-bone font-mono text-sm leading-relaxed mb-8">
            <div className="text-copper-soft mb-2"># Install globally</div>
            <div className="mb-4">npm install @stead/core</div>
            <div className="text-sage-pale mb-2"># Initialize the substrate</div>
            <div>import {'{'} SteadEngine {'}'} from '@stead/core';</div>
            <div>const engine = new SteadEngine();</div>
            <div>engine.mount();</div>
          </div>

          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-bone text-sm font-medium rounded-sm group hover:shadow-xl transition-shadow cursor-none">
            Return to application
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </section>

      </main>
    </div>
  );
}
