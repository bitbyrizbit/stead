/**
 * STEAD — main page.
 *
 * Three steps, one page, no routing:
 *   "landing"     → LandingScreen
 *   "calibration" → CalibrationGame (full-screen overlay)
 *   "demo"        → ComparisonCanvas + all overlays
 *
 * The step state lives here and is the single source of truth for the flow.
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { LandingScreen } from "@/components/LandingScreen";
import { CalibrationGame } from "@/components/CalibrationGame";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { DebugPanel } from "@/components/DebugPanel";
import { AccuracyBoard } from "@/components/AccuracyBoard";
import { ClickTargetLayer, ClickTargetLayerHandle, TARGET_LABELS } from "@/components/ClickTargetLayer";
import { TremorInjector } from "@/lib/tremorInjector";
import type { CalibrationResult } from "@/lib/calibration";

type Step = "landing" | "calibration" | "demo";

const DEFAULTS = { amplitude: 8, frequency: 5, minCutoff: 1.0, beta: 0.007 };

interface Hits {
  steadOnHits: number; steadOnTotal: number;
  steadOffHits: number; steadOffTotal: number;
}

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [amplitude, setAmplitude] = useState(DEFAULTS.amplitude);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [minCutoff, setMinCutoff] = useState(DEFAULTS.minCutoff);
  const [beta, setBeta] = useState(DEFAULTS.beta);
  const [isPersonalised, setIsPersonalised] = useState(false);
  const [steadEnabled, setSteadEnabled] = useState(true);
  const [activeTarget, setActiveTarget] = useState<number | null>(null);
  const [hits, setHits] = useState<Hits>({ steadOnHits: 0, steadOnTotal: 0, steadOffHits: 0, steadOffTotal: 0 });
  const [lastHit, setLastHit] = useState<string | null>(null);

  const targetLayerRef = useRef<ClickTargetLayerHandle>(null);
  const injectorRef = useRef(new TremorInjector(DEFAULTS.amplitude, DEFAULTS.frequency));

  const handleCalibrationComplete = useCallback((result: CalibrationResult) => {
    setMinCutoff(result.minCutoff);
    setBeta(result.beta);
    setIsPersonalised(true);
    setStep("demo");
  }, []);

  const handleSkip = useCallback(() => setStep("demo"), []);

  const handleClickResolved = useCallback(({ predictedIndex }: { rawX: number; rawY: number; predictedIndex: number }) => {
    if (activeTarget === null) return;
    const isHit = predictedIndex === activeTarget;
    setHits(prev => steadEnabled
      ? { ...prev, steadOnTotal: prev.steadOnTotal + 1, steadOnHits: prev.steadOnHits + (isHit ? 1 : 0) }
      : { ...prev, steadOffTotal: prev.steadOffTotal + 1, steadOffHits: prev.steadOffHits + (isHit ? 1 : 0) }
    );
    setLastHit(isHit ? "✓ Hit" : "✗ Miss");
    setTimeout(() => setLastHit(null), 700);
    setTimeout(() => setActiveTarget(i => i !== null ? (i + 1) % TARGET_LABELS.length : null), 350);
  }, [activeTarget, steadEnabled]);

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none">

      {/* ── Step 1: Landing ── */}
      {step === "landing" && (
        <LandingScreen onStart={() => setStep("calibration")} />
      )}

      {/* ── Step 2: Calibration ── */}
      {step === "calibration" && (
        <CalibrationGame
          injector={amplitude > 0 ? injectorRef.current : undefined}
          onComplete={handleCalibrationComplete}
          onSkip={handleSkip}
        />
      )}

      {/* ── Step 3: Live demo ── */}
      {step === "demo" && (
        <>
          {/* Canvas layer */}
          <ComparisonCanvas
            amplitude={amplitude}
            frequency={frequency}
            minCutoff={minCutoff}
            beta={beta}
            targetLayerRef={targetLayerRef}
            onClickResolved={steadEnabled ? handleClickResolved : undefined}
          />

          {/* DOM button targets */}
          <ClickTargetLayer
            ref={targetLayerRef}
            activeTarget={activeTarget}
            onHit={(label, byPredictor) => {
              setLastHit(byPredictor ? `→ ${label}` : label);
              setTimeout(() => setLastHit(null), 700);
            }}
          />

          {/* ── Legend (top-left) ── */}
          <div className="absolute top-5 left-5 z-20 flex flex-col gap-2 pointer-events-none">
            {/* Wordmark */}
            <div className="mb-1">
              <p className="text-white font-bold text-xl tracking-tighter leading-none">STEAD</p>
              <p className="text-slate-600 text-[11px] font-mono mt-0.5">Your intent, not your tremor.</p>
            </div>

            {/* Cursor legend */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-slate-400 text-xs font-mono">Raw + tremor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" />
                <span className="text-slate-400 text-xs font-mono">STEAD filtered</span>
              </div>
            </div>

            {/* Live params */}
            <div className="mt-2 flex flex-col gap-0.5 text-[10px] text-slate-700 font-mono">
              <span>{frequency} Hz · {amplitude} px tremor</span>
              <span>minCutoff={minCutoff.toFixed(2)} β={beta.toFixed(3)}</span>
              {isPersonalised && (
                <span className="text-green-700 mt-0.5">✓ personalised profile</span>
              )}
            </div>
          </div>

          {/* ── Top-centre controls ── */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            {/* STEAD toggle */}
            <button
              onClick={() => setSteadEnabled(v => !v)}
              className={[
                "px-5 py-1.5 rounded-full text-xs font-semibold font-mono border transition-all duration-200",
                steadEnabled
                  ? "bg-green-400/10 border-green-400/60 text-green-300 shadow-[0_0_12px_rgba(74,222,128,0.15)]"
                  : "bg-slate-800/80 border-slate-700 text-slate-500",
              ].join(" ")}
            >
              STEAD {steadEnabled ? "ON" : "OFF"}
            </button>

            {/* Accuracy test toggle */}
            <button
              onClick={() => setActiveTarget(v => v === null ? 0 : null)}
              className={[
                "px-4 py-1 rounded-full text-[11px] font-mono border transition-all duration-200",
                activeTarget !== null
                  ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                  : "bg-slate-900/60 border-slate-800 text-slate-600 hover:text-slate-400",
              ].join(" ")}
            >
              {activeTarget !== null ? "Stop test" : "Accuracy test"}
            </button>

            {/* Re-calibrate */}
            <button
              onClick={() => { setStep("calibration"); setActiveTarget(null); }}
              className="text-[10px] text-slate-700 font-mono hover:text-slate-400 transition-colors"
            >
              re-calibrate
            </button>

            {/* Hit feedback */}
            {lastHit && (
              <span className={[
                "text-sm font-bold font-mono transition-opacity",
                lastHit.startsWith("✓") || lastHit.startsWith("→") ? "text-green-400" : "text-red-400",
              ].join(" ")}>
                {lastHit}
              </span>
            )}
          </div>

          {/* ── Debug panel (top-right) ── */}
          <DebugPanel
            amplitude={amplitude} frequency={frequency}
            minCutoff={minCutoff} beta={beta}
            onAmplitudeChange={setAmplitude} onFrequencyChange={setFrequency}
            onMinCutoffChange={setMinCutoff} onBetaChange={setBeta}
          />

          {/* ── Accuracy board (bottom-right) ── */}
          <AccuracyBoard
            steadOnHits={hits.steadOnHits} steadOnTotal={hits.steadOnTotal}
            steadOffHits={hits.steadOffHits} steadOffTotal={hits.steadOffTotal}
          />

          {/* ── Bottom hint (fades when accuracy test is running) ── */}
          {activeTarget === null && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10 pointer-events-none">
              <p className="text-[10px] text-slate-700 font-mono">
                Move your mouse · click the buttons below to test accuracy
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
