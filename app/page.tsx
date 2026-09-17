/**
 * STEAD — main page.
 *
 * Four steps, one page, no routing:
 *   "landing"     → LandingScreen
 *   "calibration" → CalibrationGame (full-screen overlay)
 *   "spi-results" → SPIResultsScreen (shows baseline SPI and preset)
 *   "demo"        → ComparisonCanvas + all overlays
 *
 * The step state lives here and is the single source of truth for the flow.
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { EditorialMarketing } from "@/components/EditorialMarketing";
import { CalibrationGame, type CalibrationOutput } from "@/components/CalibrationGame";
import { SPIResultsScreen } from "@/components/SPIResultsScreen";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { DebugPanel } from "@/components/DebugPanel";
import { AccuracyBoard } from "@/components/AccuracyBoard";
import { ClickTargetLayer, ClickTargetLayerHandle, TARGET_LABELS } from "@/components/ClickTargetLayer";
import { TremorInjector } from "@/lib/tremorInjector";
import type { SPIClick } from "@/lib/steadPrecisionIndex";

type Step = "landing" | "calibration" | "spi-results" | "demo";

const DEFAULTS = { amplitude: 8, frequency: 5, minCutoff: 1.0, beta: 0.007 };

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [amplitude, setAmplitude] = useState(DEFAULTS.amplitude);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [minCutoff, setMinCutoff] = useState(DEFAULTS.minCutoff);
  const [beta, setBeta] = useState(DEFAULTS.beta);
  const [isPersonalised, setIsPersonalised] = useState(false);
  const [steadEnabled, setSteadEnabled] = useState(true);
  
  const [calibrationOutput, setCalibrationOutput] = useState<CalibrationOutput | null>(null);

  const [activeTarget, setActiveTarget] = useState<number | null>(null);
  const targetStartTimeRef = useRef<number>(0);

  const [steadOnClicks, setSteadOnClicks] = useState<SPIClick[]>([]);
  const [steadOffClicks, setSteadOffClicks] = useState<SPIClick[]>([]);
  const [lastHit, setLastHit] = useState<string | null>(null);

  const targetLayerRef = useRef<ClickTargetLayerHandle>(null);
  const injectorRef = useRef(new TremorInjector(DEFAULTS.amplitude, DEFAULTS.frequency));

  const handleCalibrationComplete = useCallback((output: CalibrationOutput) => {
    setMinCutoff(output.calibration.minCutoff);
    setBeta(output.calibration.beta);
    setIsPersonalised(true);
    setCalibrationOutput(output);
    setStep("spi-results");
  }, []);

  const handleSkip = useCallback(() => setStep("demo"), []);

  const handleClickResolved = useCallback(({ predictedIndex, deviationPx }: { rawX: number; rawY: number; predictedIndex: number; deviationPx: number }) => {
    if (activeTarget === null) return;
    const isHit = predictedIndex === activeTarget;
    const timeToClickMs = performance.now() - targetStartTimeRef.current;
    
    const clickData: SPIClick = { hit: isHit, deviationPx, timeToClickMs };

    if (steadEnabled) {
      setSteadOnClicks(prev => [...prev, clickData]);
    } else {
      setSteadOffClicks(prev => [...prev, clickData]);
    }
    
    setLastHit(isHit ? "✓ Hit" : "✗ Miss");
    setTimeout(() => setLastHit(null), 700);
    setTimeout(() => {
      setActiveTarget(i => {
        const next = i !== null ? (i + 1) % TARGET_LABELS.length : null;
        if (next !== null) targetStartTimeRef.current = performance.now();
        return next;
      });
    }, 350);
  }, [activeTarget, steadEnabled]);

  // Set start time when test begins
  useEffect(() => {
    if (activeTarget !== null) {
      targetStartTimeRef.current = performance.now();
    }
  }, [activeTarget]);

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none cursor-none bg-paper text-ink">

      {/* ── Step 1: Landing ── */}
      {step === "landing" && (
        <div className="absolute inset-0 z-50 overflow-y-auto">
          <EditorialMarketing onStart={() => setStep("calibration")} />
        </div>
      )}

      {/* ── Step 2: Calibration ── */}
      {step === "calibration" && (
        <CalibrationGame
          injector={amplitude > 0 ? injectorRef.current : undefined}
          onComplete={handleCalibrationComplete}
          onSkip={handleSkip}
        />
      )}

      {/* ── Step 3: SPI Results ── */}
      {step === "spi-results" && calibrationOutput && (
        <SPIResultsScreen
          presetKey={calibrationOutput.presetKey}
          spiBeforeStead={calibrationOutput.spiBeforeStead}
          onContinue={() => setStep("demo")}
        />
      )}

      {/* ── Step 4: Live demo ── */}
      {step === "demo" && (
        <>
          {/* Canvas layer */}
          <ComparisonCanvas
            amplitude={amplitude}
            frequency={frequency}
            minCutoff={minCutoff}
            beta={beta}
            rawMode={!steadEnabled} // Connect "Reset to raw" (STEAD OFF) directly to canvas rawMode
            targetLayerRef={targetLayerRef}
            onClickResolved={handleClickResolved} // Always track clicks, rawMode will pass them through
          />

          {/* DOM button targets */}
          <ClickTargetLayer
            ref={targetLayerRef}
            activeTarget={activeTarget}
            onHit={(label, byPredictor) => {
              setLastHit(byPredictor ? `✓ ${label}` : label);
              setTimeout(() => setLastHit(null), 700);
            }}
          />

          {/* ── Legend (top-left) ── */}
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-3 pointer-events-none">
            {/* Wordmark */}
            <div className="mb-2">
              <p className="font-serif text-2xl tracking-tighter text-ink font-medium leading-none">STEAD</p>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-muted mt-1">/ accessibility substrate</p>
            </div>

            {/* Cursor legend */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-amber border-dashed shrink-0" />
                <span className="text-ink-soft text-[10px] font-mono uppercase tracking-[0.1em]">Unassisted Pathway</span>
              </div>
              {!steadEnabled ? null : (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal shrink-0" />
                  <span className="text-ink-soft text-[10px] font-mono uppercase tracking-[0.1em]">Active Filter</span>
                </div>
              )}
            </div>

            {/* Live params */}
            <div className="mt-3 flex flex-col gap-1 text-[10px] text-ink-muted font-mono uppercase tracking-[0.1em]">
              <span>{frequency} Hz · {amplitude} px tremor</span>
              <span>minCutoff={minCutoff.toFixed(2)} β={beta.toFixed(3)}</span>
              {isPersonalised && (
                <span className="text-teal mt-1 font-medium">Profile Linked</span>
              )}
            </div>
          </div>

          {/* ── Top-centre controls ── */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
            {/* STEAD toggle */}
            <button
              onClick={() => setSteadEnabled(v => !v)}
              className={[
                "px-6 py-2 rounded-sm text-[11px] font-mono uppercase tracking-[0.1em] font-medium transition-all duration-200 border",
                steadEnabled
                  ? "bg-teal border-teal text-paper"
                  : "bg-paper-warm border-line text-ink-muted hover:bg-paper-dim",
              ].join(" ")}
            >
              STEAD Protocol {steadEnabled ? "ACTIVE" : "DISABLED"}
            </button>

            {/* Accuracy test toggle */}
            <button
              onClick={() => setActiveTarget(v => v === null ? 0 : null)}
              className={[
                "px-5 py-1.5 rounded-sm text-[11px] font-mono uppercase tracking-[0.1em] font-medium border transition-all duration-200",
                activeTarget !== null
                  ? "bg-amber-soft border-amber-soft text-ink"
                  : "bg-paper-warm border-line text-ink-muted hover:bg-paper-dim",
              ].join(" ")}
            >
              {activeTarget !== null ? "Halt diagnostic" : "Run diagnostic"}
            </button>

            {/* Re-calibrate */}
            <button
              onClick={() => { setStep("calibration"); setActiveTarget(null); }}
              className="text-[10px] text-ink-muted font-mono uppercase tracking-[0.15em] hover:text-ink transition-colors mt-1 underline decoration-line underline-offset-4"
            >
              Recalibrate
            </button>

            {/* Hit feedback */}
            {lastHit && (
              <span className={[
                "text-xs font-mono uppercase tracking-widest font-semibold transition-opacity mt-2",
                lastHit.startsWith("✓") ? "text-teal" : "text-ink-soft",
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
            steadOnClicks={steadOnClicks}
            steadOffClicks={steadOffClicks}
          />

          {/* ── Bottom hint ── */}
          {activeTarget === null && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10 pointer-events-none">
              <p className="text-[10px] text-ink-muted font-mono uppercase tracking-[0.15em]">
                Move your mouse · click the buttons below to test accuracy
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
