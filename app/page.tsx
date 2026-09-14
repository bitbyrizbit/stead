/**
 * STEAD — Phase 4 page.
 *
 * Flow:
 *   1. CalibrationGame (fullscreen overlay)
 *   2. After calibration completes (or is skipped), filter params update and
 *      the main comparison demo is shown.
 *
 * State:
 *   calibrated — whether the user has gone through calibration
 *   amplitude/frequency/minCutoff/beta — live filter/tremor params
 *   hits — click accuracy counters for AccuracyBoard
 */

"use client";

import { useState, useRef } from "react";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { DebugPanel } from "@/components/DebugPanel";
import { AccuracyBoard } from "@/components/AccuracyBoard";
import { ClickTargetLayer, ClickTargetLayerHandle, TARGET_LABELS } from "@/components/ClickTargetLayer";
import { CalibrationGame } from "@/components/CalibrationGame";
import { TremorInjector } from "@/lib/tremorInjector";
import type { CalibrationResult } from "@/lib/calibration";

const DEFAULTS = {
  amplitude: 8,
  frequency: 5,
  minCutoff: 1.0,
  beta: 0.007,
};

interface HitCounts {
  steadOnHits: number;
  steadOnTotal: number;
  steadOffHits: number;
  steadOffTotal: number;
}

export default function Home() {
  const [calibrated, setCalibrated] = useState(false);

  const [amplitude, setAmplitude] = useState(DEFAULTS.amplitude);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [minCutoff, setMinCutoff] = useState(DEFAULTS.minCutoff);
  const [beta, setBeta] = useState(DEFAULTS.beta);

  const [steadEnabled, setSteadEnabled] = useState(true);
  const [activeTarget, setActiveTarget] = useState<number | null>(null);
  const [hits, setHits] = useState<HitCounts>({
    steadOnHits: 0, steadOnTotal: 0,
    steadOffHits: 0, steadOffTotal: 0,
  });
  const [lastHit, setLastHit] = useState<string | null>(null);

  const targetLayerRef = useRef<ClickTargetLayerHandle>(null);

  // Shared injector instance passed to CalibrationGame so calibration uses
  // the same tremor settings as the main demo (amplitude slider applies).
  const injectorRef = useRef(new TremorInjector(amplitude, frequency));

  const handleCalibrationComplete = (result: CalibrationResult) => {
    setMinCutoff(result.minCutoff);
    setBeta(result.beta);
    setCalibrated(true);
  };

  const handleSkip = () => setCalibrated(true);

  const handleClickResolved = ({
    predictedIndex,
  }: {
    rawX: number;
    rawY: number;
    predictedIndex: number;
  }) => {
    if (activeTarget === null) return;

    const isHit = predictedIndex === activeTarget;
    setHits((prev) =>
      steadEnabled
        ? { ...prev, steadOnTotal: prev.steadOnTotal + 1, steadOnHits: prev.steadOnHits + (isHit ? 1 : 0) }
        : { ...prev, steadOffTotal: prev.steadOffTotal + 1, steadOffHits: prev.steadOffHits + (isHit ? 1 : 0) }
    );
    setLastHit(isHit ? "✓ Hit" : "✗ Miss");
    setTimeout(() => setLastHit(null), 800);
    setTimeout(
      () => setActiveTarget((i) => (i !== null ? (i + 1) % TARGET_LABELS.length : null)),
      400
    );
  };

  return (
    <main className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none">
      {/* Calibration overlay — shown first */}
      {!calibrated && (
        <CalibrationGame
          injector={amplitude > 0 ? injectorRef.current : undefined}
          onComplete={handleCalibrationComplete}
          onSkip={handleSkip}
        />
      )}

      {/* Main demo — shown after calibration */}
      {calibrated && (
        <>
          <ComparisonCanvas
            amplitude={amplitude}
            frequency={frequency}
            minCutoff={minCutoff}
            beta={beta}
            targetLayerRef={targetLayerRef}
            onClickResolved={steadEnabled ? handleClickResolved : undefined}
          />

          <ClickTargetLayer
            ref={targetLayerRef}
            activeTarget={activeTarget}
            onHit={(label, byPredictor) => {
              setLastHit(byPredictor ? `→ ${label}` : label);
              setTimeout(() => setLastHit(null), 800);
            }}
          />

          {/* Legend */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="mb-1">
              <p className="text-white font-semibold tracking-tight text-base">STEAD</p>
              <p className="text-slate-500 text-xs font-mono">Your intent, not your tremor.</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <span className="text-slate-300 text-xs font-mono">Raw + tremor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
              <span className="text-slate-300 text-xs font-mono">STEAD filtered</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-600 font-mono leading-snug">
              <p>tremor {frequency} Hz · {amplitude} px</p>
              <p>minCutoff={minCutoff} β={beta}</p>
              {minCutoff !== DEFAULTS.minCutoff && (
                <p className="text-green-600 mt-0.5">✓ personalised</p>
              )}
            </div>
          </div>

          {/* STEAD toggle + accuracy test — top-centre */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            <button
              onClick={() => setSteadEnabled((v) => !v)}
              className={[
                "px-4 py-1.5 rounded-full text-xs font-semibold font-mono border transition-all",
                steadEnabled
                  ? "bg-green-500/20 border-green-400 text-green-300"
                  : "bg-slate-800 border-slate-600 text-slate-400",
              ].join(" ")}
            >
              STEAD {steadEnabled ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => setActiveTarget((v) => (v === null ? 0 : null))}
              className={[
                "px-4 py-1 rounded-full text-[11px] font-mono border transition-all",
                activeTarget !== null
                  ? "bg-blue-500/20 border-blue-400 text-blue-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-500",
              ].join(" ")}
            >
              {activeTarget !== null ? "Stop accuracy test" : "Start accuracy test"}
            </button>

            <button
              onClick={() => setCalibrated(false)}
              className="text-[10px] text-slate-600 font-mono hover:text-slate-400 transition-colors"
            >
              re-calibrate
            </button>

            {lastHit && (
              <span className={["text-sm font-bold font-mono", lastHit.startsWith("✓") || lastHit.startsWith("→") ? "text-green-400" : "text-red-400"].join(" ")}>
                {lastHit}
              </span>
            )}
          </div>

          {/* Debug panel */}
          <DebugPanel
            amplitude={amplitude}
            frequency={frequency}
            minCutoff={minCutoff}
            beta={beta}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onMinCutoffChange={setMinCutoff}
            onBetaChange={setBeta}
          />

          {/* Accuracy board */}
          <AccuracyBoard
            steadOnHits={hits.steadOnHits}
            steadOnTotal={hits.steadOnTotal}
            steadOffHits={hits.steadOffHits}
            steadOffTotal={hits.steadOffTotal}
          />
        </>
      )}
    </main>
  );
}
