/**
 * STEAD — Phase 3 demo page.
 *
 * Wires ComparisonCanvas (cursor rendering + click interception),
 * ClickTargetLayer (real DOM buttons with bounding rects),
 * AccuracyBoard (live hit-rate), and DebugPanel (sliders).
 *
 * State lifted here:
 *  - Tremor/filter params → ComparisonCanvas + DebugPanel
 *  - STEAD toggle → determines if click correction is active
 *  - Hit counters → AccuracyBoard
 */

"use client";

import { useState, useRef } from "react";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { DebugPanel } from "@/components/DebugPanel";
import { AccuracyBoard } from "@/components/AccuracyBoard";
import {
  ClickTargetLayer,
  ClickTargetLayerHandle,
  TARGET_LABELS,
} from "@/components/ClickTargetLayer";

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
  const [amplitude, setAmplitude] = useState(DEFAULTS.amplitude);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [minCutoff, setMinCutoff] = useState(DEFAULTS.minCutoff);
  const [beta, setBeta] = useState(DEFAULTS.beta);

  // STEAD enabled/disabled toggle — affects click correction only (filter
  // still runs to show green dot, but click dispatch is bypassed when off).
  const [steadEnabled, setSteadEnabled] = useState(true);

  // Active target for accuracy test (null = free-aim mode).
  const [activeTarget, setActiveTarget] = useState<number | null>(null);

  const [hits, setHits] = useState<HitCounts>({
    steadOnHits: 0,
    steadOnTotal: 0,
    steadOffHits: 0,
    steadOffTotal: 0,
  });

  const [lastHit, setLastHit] = useState<string | null>(null);

  const targetLayerRef = useRef<ClickTargetLayerHandle>(null);

  const handleClickResolved = ({
    predictedIndex,
  }: {
    rawX: number;
    rawY: number;
    predictedIndex: number;
  }) => {
    if (activeTarget === null) return; // free-aim mode — don't score

    const isHit = predictedIndex === activeTarget;

    setHits((prev) =>
      steadEnabled
        ? {
            ...prev,
            steadOnTotal: prev.steadOnTotal + 1,
            steadOnHits: prev.steadOnHits + (isHit ? 1 : 0),
          }
        : {
            ...prev,
            steadOffTotal: prev.steadOffTotal + 1,
            steadOffHits: prev.steadOffHits + (isHit ? 1 : 0),
          }
    );

    setLastHit(isHit ? "✓ Hit" : "✗ Miss");
    setTimeout(() => setLastHit(null), 800);

    // Advance to next target after a short delay.
    setTimeout(
      () => setActiveTarget((i) => (i !== null ? (i + 1) % TARGET_LABELS.length : null)),
      400
    );
  };

  return (
    <main className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none">
      {/* Canvas — cursor rendering + click interception */}
      <ComparisonCanvas
        amplitude={amplitude}
        frequency={frequency}
        minCutoff={minCutoff}
        beta={beta}
        targetLayerRef={targetLayerRef}
        onClickResolved={steadEnabled ? handleClickResolved : undefined}
      />

      {/* Real DOM buttons — bounding rects + click dispatch targets */}
      <ClickTargetLayer
        ref={targetLayerRef}
        activeTarget={activeTarget}
        onHit={(label, byPredictor) => {
          setLastHit(byPredictor ? `→ ${label}` : label);
          setTimeout(() => setLastHit(null), 800);
        }}
      />

      {/* Legend — top-left */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="mb-1">
          <p className="text-white font-semibold tracking-tight text-base leading-none">
            STEAD
          </p>
          <p className="text-slate-500 text-xs mt-0.5 font-mono">
            Your intent, not your tremor.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <span className="text-slate-300 text-xs font-mono">Raw + tremor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-400 shrink-0" />
          <span className="text-slate-300 text-xs font-mono">STEAD filtered</span>
        </div>

        <div className="mt-2 text-[11px] text-slate-600 font-mono leading-snug">
          <p>tremor {frequency} Hz · {amplitude} px</p>
          <p>minCutoff={minCutoff} β={beta}</p>
        </div>
      </div>

      {/* STEAD toggle + test mode — top-centre */}
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
          onClick={() =>
            setActiveTarget((v) => (v === null ? 0 : null))
          }
          className={[
            "px-4 py-1 rounded-full text-[11px] font-mono border transition-all",
            activeTarget !== null
              ? "bg-blue-500/20 border-blue-400 text-blue-300"
              : "bg-slate-800/60 border-slate-700 text-slate-500",
          ].join(" ")}
        >
          {activeTarget !== null ? "Stop accuracy test" : "Start accuracy test"}
        </button>

        {lastHit && (
          <span
            className={[
              "text-sm font-bold font-mono transition-opacity",
              lastHit.startsWith("✓") || lastHit.startsWith("→")
                ? "text-green-400"
                : "text-red-400",
            ].join(" ")}
          >
            {lastHit}
          </span>
        )}
      </div>

      {/* Debug panel — top-right */}
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

      {/* Accuracy board — bottom-right */}
      <AccuracyBoard
        steadOnHits={hits.steadOnHits}
        steadOnTotal={hits.steadOnTotal}
        steadOffHits={hits.steadOffHits}
        steadOffTotal={hits.steadOffTotal}
      />
    </main>
  );
}
