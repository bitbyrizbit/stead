/**
 * CalibrationGame — Phase 5 rewrite
 * Full cream/paper aesthetic with generous mid-screen layout.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  computeCalibration,
  measureTrajectoryDeviation,
  type CalibrationPoint,
  type CalibrationResult,
} from "@/lib/calibration";
import {
  deviationToPreset,
  getPresetParams,
  type PresetKey,
} from "@/lib/sensitivityPresets";
import { detectInputType, type InputType } from "@/lib/inputDetection";
import { estimateSPIFromDeviation, type SPIResult } from "@/lib/steadPrecisionIndex";
import { TremorInjector } from "@/lib/tremorInjector";
import { sfx } from "@/lib/soundEffects";

const TARGET_POSITIONS_NORM = [
  { x: 0.2,  y: 0.38  },
  { x: 0.75, y: 0.34  },
  { x: 0.5,  y: 0.58 },
  { x: 0.22, y: 0.74  },
  { x: 0.78, y: 0.70 },
];

const TARGET_RADIUS = 30;

function makeSessionId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function persistCalibration(sessionId: string, result: CalibrationResult) {
  try {
    await fetch("/api/calibration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        minCutoff: result.minCutoff,
        beta: result.beta,
        avgDeviation: result.avgDeviation,
      }),
    });
  } catch {
    /* fire-and-forget */
  }
}

export interface CalibrationOutput {
  calibration: CalibrationResult;
  presetKey: PresetKey;
  spiBeforeSTEAD: SPIResult;
  clickTimesMs: number[];
  inputType: InputType;
}

interface CalibrationGameProps {
  injector?: TremorInjector;
  onComplete: (output: CalibrationOutput) => void;
  onSkip: () => void;
}

export function CalibrationGame({
  injector,
  onComplete,
  onSkip,
}: CalibrationGameProps) {
  const [step, setStep] = useState<"intro" | "playing" | "done">("intro");
  const [targetIdx, setTargetIdx] = useState(0);
  const [vw, setVw] = useState(1200);
  const [vh, setVh] = useState(800);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef<number | null>(null);

  const currentTrajRef = useRef<CalibrationPoint[]>([]);
  const trajectoriesRef = useRef<CalibrationPoint[][]>([]);
  const clickTimesRef = useRef<number[]>([]);
  const rawPos = useRef({ x: 0, y: 0 });
  const targetStartTimeRef = useRef(0);
  const sessionId = useRef(makeSessionId());
  const inputTypeRef = useRef<InputType>("mouse");

  useEffect(() => {
    const handleResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const norm = TARGET_POSITIONS_NORM[targetIdx];
  const targetX = norm.x * vw;
  const targetY = norm.y * vh;
  const progress = targetIdx;

  const onPointerMove = useCallback((e: PointerEvent) => {
    rawPos.current = { x: e.clientX, y: e.clientY };
    inputTypeRef.current = detectInputType(e);
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove as EventListener);
    return () => window.removeEventListener("pointermove", onPointerMove as EventListener);
  }, [onPointerMove]);

  // Canvas drawing loop
  useEffect(() => {
    if (step !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = vw;
    canvas.height = vh;

    const tick = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { rafId.current = requestAnimationFrame(tick); return; }

      const now = performance.now();
      const { x: rx, y: ry } = rawPos.current;
      const { x, y } = injector ? injector.inject(rx, ry, now) : { x: rx, y: ry };
      currentTrajRef.current.push({ x, y, t: now });

      ctx.clearRect(0, 0, vw, vh);

      // Target ring
      const pulse = Math.sin(now / 250) * 4;
      ctx.beginPath();
      ctx.arc(targetX, targetY, TARGET_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(232, 84, 43, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "#e8542b";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(targetX, targetY, TARGET_RADIUS + 8 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(232, 84, 43, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Crosshair
      ctx.strokeStyle = "#e8542b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(targetX - 12, targetY); ctx.lineTo(targetX + 12, targetY);
      ctx.moveTo(targetX, targetY - 12); ctx.lineTo(targetX + 12, targetY);
      ctx.stroke();

      // Cursor dot
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1620";
      ctx.fill();
      ctx.strokeStyle = "#e8542b";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [step, targetX, targetY, vw, vh, injector]);

  const handleClick = useCallback(() => {
    if (step !== "playing") return;

    const traj = [...currentTrajRef.current];
    const clickTimeMs = performance.now() - targetStartTimeRef.current;
    trajectoriesRef.current.push(traj);
    clickTimesRef.current.push(clickTimeMs);
    currentTrajRef.current = [];

    sfx.playTargetHit(600 + targetIdx * 90);

    const next = targetIdx + 1;

    if (next >= TARGET_POSITIONS_NORM.length) {
      setStep("done");
      sfx.playRoundComplete();

      const calibration = computeCalibration(trajectoriesRef.current);
      const allDeviations = trajectoriesRef.current.map(measureTrajectoryDeviation);
      const avgDev = allDeviations.reduce((a, b) => a + b, 0) / allDeviations.length;
      const avgClickTime = clickTimesRef.current.reduce((a, b) => a + b, 0) / clickTimesRef.current.length;

      const presetKey = deviationToPreset(avgDev);
      const presetParams = getPresetParams(presetKey, inputTypeRef.current);

      const snappedCalibration: CalibrationResult = {
        ...calibration,
        minCutoff: presetParams.minCutoff,
        beta: presetParams.beta,
      };

      const spiBeforeSTEAD = estimateSPIFromDeviation(avgDev, avgClickTime);
      persistCalibration(sessionId.current, snappedCalibration);

      setTimeout(() => onComplete({
        calibration: snappedCalibration,
        presetKey,
        spiBeforeSTEAD,
        clickTimesMs: clickTimesRef.current,
        inputType: inputTypeRef.current,
      }), 700);

    } else {
      setTargetIdx(next);
      targetStartTimeRef.current = performance.now();
    }
  }, [step, targetIdx, onComplete]);

  useEffect(() => {
    if (step === "playing") targetStartTimeRef.current = performance.now();
  }, [targetIdx, step]);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  return (
    <div className="absolute inset-0 z-30 bg-cream grain flex flex-col items-center justify-center pt-28 pb-10 px-6 select-none overflow-y-auto">
      <div className="absolute inset-0 retro-grid-lg opacity-30 pointer-events-none" />

      {step === "playing" && (
        <>
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ cursor: "none" }} />
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3">
            <p className="text-ink text-xs font-sans uppercase tracking-[0.16em] font-semibold">
              Node {progress + 1} of {TARGET_POSITIONS_NORM.length} — Click to acquire
            </p>
            <div className="w-56 h-2 bg-cream-dim rounded-full overflow-hidden border border-ink/20">
              <div
                className="h-full bg-ember transition-all duration-300"
                style={{ width: `${((progress + 1) / TARGET_POSITIONS_NORM.length) * 100}%` }}
              />
            </div>
          </div>
        </>
      )}

      {step === "intro" && (
        <div className="relative z-40 flex flex-col items-center gap-8 text-center max-w-md w-full px-8 py-10 bg-cream-paper rounded-2xl border-2 border-ink shadow-retro">
          <div>
            <span className="font-sans text-xs text-ember uppercase tracking-[0.16em] font-bold">
              Kinematic Setup
            </span>
            <h2 className="text-3xl text-ink font-serif tracking-tighter mt-1 mb-3">
              Motor Diagnostic
            </h2>
            <p className="text-ink-soft text-sm leading-relaxed font-sans">
              Click the 5 circular target nodes as they appear across your screen. 
              This brief diagnostic computes your hand’s baseline tremor frequency and locks in your custom filter.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                sfx.playClick(1000);
                currentTrajRef.current = [];
                setStep("playing");
              }}
              data-cursor="hover"
              className="group relative w-full py-3.5 bg-ink text-cream-paper text-sm font-semibold rounded-xl overflow-hidden shadow-retro-sm"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Initiate Diagnostic
                <span>→</span>
              </span>
              <span className="absolute inset-0 bg-ember translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.playClick(600);
                onSkip();
              }}
              data-cursor="hover"
              className="w-full py-2 text-ink-muted text-xs hover:text-ink font-medium transition-colors uppercase tracking-wider font-sans"
            >
              Skip to live test
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="relative z-40 flex flex-col items-center gap-6 text-center max-w-md w-full px-8 py-10 bg-cream-paper rounded-2xl border-2 border-ink shadow-retro">
          <div className="w-16 h-16 rounded-full bg-moss/15 border-2 border-moss flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a6438" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <p className="text-ink font-serif tracking-tight text-3xl font-semibold">Profile Established</p>
            <p className="text-ink-muted text-xs uppercase tracking-wider mt-2 font-sans font-medium">Configuring real-time One Euro dampening...</p>
          </div>
        </div>
      )}
    </div>
  );
}
