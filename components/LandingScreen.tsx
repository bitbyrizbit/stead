/**
 * LandingScreen — STEAD entry point.
 *
 * Design intent: calm, clinical-but-warm. No gradients, no gimmicks.
 * A judge should be able to read this in 5 seconds and understand exactly
 * what the product does and who it's for.
 *
 * Layout:
 *  - Full-viewport, vertically centred
 *  - Wordmark + tagline + one-sentence problem statement
 *  - Single primary CTA → calibration
 *  - Small footnote: what powers it (One Euro Filter citation)
 */

"use client";

interface LandingScreenProps {
  onStart: () => void;
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* Subtle background grid — clinical, not decorative */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Corner marks — suggests a measured, precise instrument */}
      <div className="absolute top-8 left-8 w-5 h-5 border-t border-l border-slate-700" />
      <div className="absolute top-8 right-8 w-5 h-5 border-t border-r border-slate-700" />
      <div className="absolute bottom-8 left-8 w-5 h-5 border-b border-l border-slate-700" />
      <div className="absolute bottom-8 right-8 w-5 h-5 border-b border-r border-slate-700" />

      {/* Main content */}
      <div className="relative flex flex-col items-center text-center max-w-lg gap-6">

        {/* Status chip */}
        <div className="animate-fade-up flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-900/60 text-xs text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
          Real-time · Browser-based · Free
        </div>

        {/* Wordmark */}
        <div className="animate-fade-up-delay flex flex-col items-center gap-2">
          <h1 className="text-7xl font-bold tracking-tighter text-white leading-none">
            STEAD
          </h1>
          <p className="text-slate-300 text-lg font-light tracking-wide">
            Your intent, not your tremor.
          </p>
        </div>

        {/* Problem statement — one sentence, no jargon */}
        <p className="animate-fade-up-delay-2 text-slate-400 text-sm leading-relaxed max-w-sm">
          Over <span className="text-slate-200 font-medium">10 million people</span> with Parkinson's,
          essential tremor, or post-stroke motor impairment fight their own cursor every day.
          STEAD filters the shake in real time — personalised to you, no hardware required.
        </p>

        {/* CTA */}
        <div className="animate-fade-up-delay-2 flex flex-col items-center gap-3 w-full max-w-xs">
          <button
            onClick={onStart}
            className="w-full py-3 rounded-lg bg-green-400 hover:bg-green-300 active:scale-[0.98] text-slate-950 text-sm font-semibold transition-all duration-150 shadow-[0_0_24px_rgba(74,222,128,0.2)]"
          >
            Start — takes 15 seconds
          </button>
          <p className="text-slate-500 text-xs font-mono">
            Quick calibration, then live demo
          </p>
        </div>

        {/* How it works — 3 steps inline */}
        <div className="animate-fade-up-delay-2 flex items-center gap-3 text-xs text-slate-400 font-mono mt-2">
          <span>Calibrate</span>
          <span className="text-slate-600">→</span>
          <span>Filter</span>
          <span className="text-slate-600">→</span>
          <span>Click accurately</span>
        </div>
      </div>

      {/* Footer — algorithm citation */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <p className="text-[11px] text-slate-500 font-mono text-center px-4">
          Powered by the One Euro Filter · Casiez, Roussel &amp; Vogel (2012) ·{" "}
          <span className="text-slate-400">MIT Licensed</span>
        </p>
      </div>
    </div>
  );
}
