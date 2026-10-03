/**
 * STEAD — main application page.
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { EditorialMarketing } from "@/components/EditorialMarketing";
import { CalibrationGame, type CalibrationOutput } from "@/components/CalibrationGame";
import { SPIResultsScreen } from "@/components/SPIResultsScreen";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import LoadingScreen from "@/components/LoadingScreen";
import { DebugPanel } from "@/components/DebugPanel";
import { AccuracyBoard } from "@/components/AccuracyBoard";
import Cursor from "@/components/Cursor";
import CockpitNav from "@/components/CockpitNav";
import BrandMark from "@/components/BrandMark";
import { ClickTargetLayer, ClickTargetLayerHandle, TARGET_LABELS } from "@/components/ClickTargetLayer";
import { TremorInjector } from "@/lib/tremorInjector";
import type { SPIClick, SPIResult } from "@/lib/steadPrecisionIndex";
import { sfx } from "@/lib/soundEffects";

type Step = "landing" | "calibration" | "spi-results" | "demo";

const DEFAULTS = { amplitude: 8, frequency: 5, minCutoff: 1.0, beta: 0.007 };

const DEFAULT_SPI_RESULT: SPIResult = {
  score: 72,
  hitRate: 0.8,
  avgDeviationPx: 8.5,
  avgTimeMs: 1400,
  clicks: 5,
};

export default function App() {
  const [step, setStep] = useState<Step>("landing");
  const [loading, setLoading] = useState(true);
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
    
    setLastHit(isHit ? "✓ Steady hit" : "Miss");
    setTimeout(() => setLastHit(null), 700);
    setTimeout(() => {
      setActiveTarget(i => {
        const next = i !== null ? (i + 1) % TARGET_LABELS.length : null;
        if (next !== null) targetStartTimeRef.current = performance.now();
        return next;
      });
    }, 350);
  }, [activeTarget, steadEnabled]);

  useEffect(() => {
    if (activeTarget !== null) {
      targetStartTimeRef.current = performance.now();
    }
  }, [activeTarget]);

  return (
    <>
      {/* Full-Screen Loading Curtain */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <main className={`relative w-screen select-none cursor-none bg-cream text-ink ${step === "landing" ? "min-h-screen" : "h-screen overflow-hidden"}`}>
        {/* Global Cursor */}
        <Cursor />

        {/* Floating Cockpit Nav in all steps */}
        {step !== "landing" && (
          <CockpitNav
            step={step}
            onGoHome={() => setStep("landing")}
            onGoCalibration={() => { setStep("calibration"); setActiveTarget(null); }}
            onGoResults={() => {
              if (calibrationOutput) {
                setStep("spi-results");
              } else {
                setStep("calibration");
              }
            }}
            onGoDemo={() => setStep("demo")}
          />
        )}

        {/* Step 1: Landing */}
        {step === "landing" && (
          <div className="relative z-40">
            <EditorialMarketing onStart={() => setStep("calibration")} />
          </div>
        )}

        {/* Step 2: Calibration */}
        {step === "calibration" && (
          <CalibrationGame
            injector={amplitude > 0 ? injectorRef.current : undefined}
            onComplete={handleCalibrationComplete}
            onSkip={handleSkip}
          />
        )}

        {/* Step 3: SPI Results */}
        {step === "spi-results" && (
          <SPIResultsScreen
            presetKey={calibrationOutput?.presetKey || "medium"}
            spiBeforeSTEAD={calibrationOutput?.spiBeforeSTEAD || DEFAULT_SPI_RESULT}
            onContinue={() => setStep("demo")}
          />
        )}

        {/* Step 4: Live demo */}
        {step === "demo" && (
          <>
            {/* Canvas layer */}
            <ComparisonCanvas
              amplitude={amplitude}
              frequency={frequency}
              minCutoff={minCutoff}
              beta={beta}
              rawMode={!steadEnabled}
              targetLayerRef={targetLayerRef}
              onClickResolved={handleClickResolved}
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

            {/* Legend (top-left) */}
            <div className="absolute top-28 left-8 z-[80] flex flex-col gap-3 pointer-events-auto">
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setStep("landing")}
                  className="text-left group"
                  data-cursor="hover"
                >
                  <BrandMark size="nav" />
                  <p className="text-[10px] font-sans tracking-[0.16em] text-ink-muted mt-1 uppercase font-semibold">
                    your intent, not your tremor
                  </p>
                </button>
              </div>

              {/* Cursor legend */}
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-ember border-dashed shrink-0" />
                  <span className="text-ink-soft text-xs font-sans uppercase tracking-[0.12em] font-medium">
                    unassisted pathway
                  </span>
                </div>
                {steadEnabled && (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-moss shrink-0" />
                    <span className="text-ink-soft text-xs font-sans uppercase tracking-[0.12em] font-medium">
                      active filter
                    </span>
                  </div>
                )}
              </div>

              {/* Live params */}
              <div className="mt-3 flex flex-col gap-1 text-[11px] text-ink-muted font-sans tracking-[0.12em] uppercase font-medium">
                <span>{frequency} Hz · {amplitude} px tremor</span>
                <span>minCutoff={minCutoff.toFixed(2)} β={beta.toFixed(3)}</span>
                {isPersonalised && (
                  <span className="text-moss mt-1 font-bold">profile linked</span>
                )}
              </div>
            </div>

            {/* Top-centre controls */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[90] pointer-events-auto flex flex-col items-center gap-3">
              {/* STEAD toggle */}
              <button
                type="button"
                onClick={() => {
                  sfx.playClick(steadEnabled ? 700 : 1100);
                  setSteadEnabled(v => !v);
                }}
                className={[
                  "px-7 py-2.5 rounded-xl text-xs font-sans tracking-[0.14em] font-bold transition-all duration-200 border-2 shadow-retro-sm uppercase",
                  steadEnabled
                    ? "bg-moss border-moss text-cream-paper shadow-retro-sm"
                    : "bg-cream-paper border-ink text-ink-muted hover:border-ink hover:text-ink",
                ].join(" ")}
                data-cursor="hover"
              >
                STEAD Protocol {steadEnabled ? "ACTIVE" : "OFF"}
              </button>

              {/* Accuracy test toggle */}
              <button
                type="button"
                onClick={() => {
                  sfx.playClick(900);
                  setActiveTarget(v => v === null ? 0 : null);
                }}
                className={[
                  "px-6 py-2 rounded-xl text-xs font-sans tracking-[0.14em] font-bold border-2 transition-all duration-200 shadow-retro-sm uppercase",
                  activeTarget !== null
                    ? "bg-ember border-ember text-cream-paper"
                    : "bg-cream-paper border-ink/40 text-ink hover:border-ink",
                ].join(" ")}
                data-cursor="hover"
              >
                {activeTarget !== null ? "Halt precision test" : "Run precision test"}
              </button>

              {/* Hit feedback */}
              {lastHit && (
                <span className={[
                  "text-xs font-sans tracking-widest font-bold transition-opacity mt-1 uppercase",
                  lastHit.startsWith("✓") ? "text-moss" : "text-ember",
                ].join(" ")}>
                  {lastHit}
                </span>
              )}
            </div>

            {/* Debug panel (top-right) */}
            <div className="z-[80] pointer-events-auto">
              <DebugPanel
                amplitude={amplitude} frequency={frequency}
                minCutoff={minCutoff} beta={beta}
                onAmplitudeChange={setAmplitude} onFrequencyChange={setFrequency}
                onMinCutoffChange={setMinCutoff} onBetaChange={setBeta}
              />
            </div>

            {/* Accuracy board (bottom-right) */}
            <div className="z-[80] pointer-events-auto">
              <AccuracyBoard
                steadOnClicks={steadOnClicks}
                steadOffClicks={steadOffClicks}
              />
            </div>

            {/* Bottom hint */}
            {activeTarget === null && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
                <p className="text-xs text-ink-muted font-sans tracking-[0.14em] uppercase font-medium">
                  Move cursor across target buttons to test precision
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
