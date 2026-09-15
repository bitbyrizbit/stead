"use client";

import { useEffect, useState } from "react";

interface MarketingScreenProps {
  onStart: () => void;
}

export function MarketingScreen({ onStart }: MarketingScreenProps) {
  const [scrolled, setScrolled] = useState(false);

  // Add subtle header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-green-500/30 font-sans overflow-x-hidden">
      
      {/* ── Sticky Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-slate-950/80 backdrop-blur-md border-slate-800/50 py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter text-white">STEAD</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#problem" className="hidden sm:block text-slate-400 hover:text-white transition-colors">The Problem</a>
            <a href="#technology" className="hidden sm:block text-slate-400 hover:text-white transition-colors">Technology</a>
            <a href="#ecosystem" className="hidden sm:block text-slate-400 hover:text-white transition-colors">Extension</a>
            <button
              onClick={onStart}
              className="px-4 py-1.5 rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-colors font-semibold shadow-sm"
            >
              Try live demo
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700/60 bg-slate-800/40 text-xs text-green-400 font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            Browser-based · Free · Open Source
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[1.05] mb-8">
            Your intent, <br className="hidden md:block" />
            <span className="text-slate-500">not your tremor.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            A real-time, zero-latency software filter that smooths cursor tremors and predicts your clicks. 
            No hardware required. Just accessible browsing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-green-400 hover:bg-green-300 text-slate-950 font-semibold text-lg transition-all duration-200 active:scale-[0.98] shadow-[0_0_30px_rgba(74,222,128,0.2)]"
            >
              Start calibration demo
            </button>
            <a
              href="#ecosystem"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-medium text-lg transition-all duration-200"
            >
              Get Chrome Extension
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500 font-mono">Takes 15 seconds. Works purely in your browser.</p>
        </div>
      </section>

      {/* ── Video / Demo Preview Placeholder ── */}
      <section className="px-6 pb-24 md:pb-40">
        <div className="max-w-5xl mx-auto rounded-2xl md:rounded-[2.5rem] border border-slate-800 bg-slate-900/50 aspect-video shadow-2xl overflow-hidden relative flex items-center justify-center group cursor-pointer" onClick={onStart}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-60" />
          
          {/* Mock abstract UI representation */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-20 flex flex-col items-center transition-transform duration-500 group-hover:scale-105">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-white font-medium tracking-wide">Play interactive demo</p>
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section id="problem" className="py-24 md:py-32 bg-slate-950 px-6 border-t border-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-6">
            Built for the 10 million.
          </h2>
          <div className="h-1 w-12 bg-green-400 rounded-full mb-8" />
          <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-12">
            Hardware mice and operating systems assume a perfectly steady hand. 
            For over 10 million people worldwide with Parkinson's, essential tremor, or post-stroke motor impairments, 
            the cursor becomes an adversary. Targets are overshot. Clicks miss their mark. The web becomes frustratingly inaccessible.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Overshooting", desc: "Tremors cause users to drag the cursor past their intended target." },
              { title: "Accidental Clicks", desc: "Involuntary twitches cause double-clicks or clicking the wrong button." },
              { title: "Fatigue", desc: "Fighting the mouse requires immense concentration, leading to rapid digital fatigue." }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-2">{stat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Technology ── */}
      <section id="technology" className="py-24 md:py-32 bg-slate-900 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-6">
              Math, not magic.
            </h2>
            <p className="text-lg text-slate-400 font-light">
              STEAD doesn't rely on simple, laggy moving averages. It uses advanced kinematic filtering decoupled from the UI thread to deliver smooth, zero-latency 60fps performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <span className="text-green-400 font-bold">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Adaptive One Euro Filter</h3>
                <p className="text-slate-400 leading-relaxed">
                  Heavy smoothing when you are moving slowly to aim. Zero smoothing when you flick the mouse quickly. This eliminates the "dragging through mud" lag of traditional accessibility filters.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Target Prediction</h3>
                <p className="text-slate-400 leading-relaxed">
                  Smoothing the cursor isn't enough; the click itself must be stabilized. STEAD analyzes your trajectory vectors and automatically snaps your click to the most likely intended button.
                </p>
              </div>
            </div>
            
            {/* Abstract visual of filter */}
            <div className="relative aspect-square rounded-[3rem] bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-slate-950 to-slate-950" />
              
              {/* Tremor path */}
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 10 90 Q 25 70 20 50 T 40 40 T 60 60 T 80 20 T 90 10" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1 1" />
              </svg>
              {/* Smoothed path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 10 90 C 30 80, 50 60, 90 10" fill="none" stroke="#4ade80" strokeWidth="1.5" />
                <circle cx="90" cy="10" r="2" fill="#4ade80" />
              </svg>
              
              <div className="absolute bottom-8 left-8 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-800">
                <p className="text-xs font-mono text-slate-400"><span className="text-red-400">---</span> Raw trajectory</p>
                <p className="text-xs font-mono text-slate-400 mt-1"><span className="text-green-400">–––</span> STEAD filtered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ecosystem / Extension ── */}
      <section id="ecosystem" className="py-24 md:py-32 bg-slate-950 px-6 border-t border-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-6">
            Real infrastructure.
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-12">
            STEAD is not just a web demo. It is packaged as a lightweight Chrome Extension that works across the web, piercing iframes and shadow DOMs to steady your cursor on Gmail, banking sites, and anywhere else.
          </p>

          <div className="inline-flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/bitbyrizbit/stead" 
              target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
            <a 
              href="https://github.com/bitbyrizbit/stead" 
              target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-medium text-lg transition-colors flex items-center justify-center gap-2"
            >
              Install Extension Instructions
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-center px-6">
        <h3 className="text-2xl font-bold tracking-tighter text-white mb-2">STEAD</h3>
        <p className="text-slate-500 text-sm mb-6">Your intent, not your tremor.</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-slate-600 font-mono">
          <span>MIT Licensed</span>
          <span className="hidden md:inline">•</span>
          <span>Powered by the One Euro Filter (Casiez et al, 2012)</span>
        </div>
      </footer>

    </div>
  );
}
