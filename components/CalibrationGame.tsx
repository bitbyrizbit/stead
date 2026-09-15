/**
 * CalibrationGame — Phase 5 rewrite
 *
 * What changed:
 *  - Zero jargon: "calibration" is gone. UI says "let's see how you move."
 *  - Preset name shown on completion, never raw numbers.
 *  - SPI (STEAD Precision Index) computed from trajectories and returned
 *    to the parent via onComplete so the results screen can show it.
 *  - API persist still fire-and-forget, never blocks demo.
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
  getPresetLabel,
  getPresetParams,
  type PresetKey,
} from "@/lib/sensitivityPresets";
import { detectInputType, type InputType } from "@/lib/inputDetection";
import { estimateSPIFromDeviation, type SPIResult } from "@/lib/steadPrecisionIndex";
import { TremorInjector } from "@/lib/tremorInjector";

const TARGET_POSITIONS_NORM = [
  { x: 0.2,  y: 0.3  },
  { x: 0.75, y: 0.25 },
  { x: 0.5,  y: 0.55 },
  { x: 0.15, y: 0.7  },
  { x: 0.8,  y: 0.65 },
];

const TARGET_RADIUS = 28;

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
    /* fire-and-forget — never block */
  }
}

export interface CalibrationOutput {
  calibration: CalibrationResult;
  presetKey: PresetKey;
  spiBeforeStead: SPIResult;
  clickTimesMs: number[];
  inputType: InputType;
}

export interface CalibrationGameProps {
  injector?: TremorInjector;
  onComplete: (output: CalibrationOutput) => void;
  onSkip: () => void;
}

export function CalibrationGame({ injector, onComplete, onSkip }: CalibrationGameProps) {
  const [step, setStep] = useState<"intro" | "playing" | "done">("intro");
  const [targetIdx, setTargetIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const sessionId = useRef(makeSessionId());
  const trajectoriesRef = useRef<CalibrationPoint[][]>([]);
  const currentTrajRef = useRef<CalibrationPoint[]>([]);
  const clickTimesRef = useRef<number[]>([]);
  const targetStartTimeRef = useRef<number>(0);
  const rawPos = useRef({ x: 0, y: 0 });
  const inputTypeRef = useRef<InputType>("mouse");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef<number | null>(null);

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth  : 1280);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 720);

  useEffect(() => {
    const resize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const norm = TARGET_POSITIONS_NORM[targetIdx] ?? { x: 0.5, y: 0.5 };
  const targetX = norm.x * vw;
  const targetY = norm.y * vh;

  const onPointerMove = useCallback((e: PointerEvent) => {
    rawPos.current = { x: e.clientX, y: e.clientY };
    if (inputTypeRef.current === "mouse") {
      const detected = detectInputType(e);
      if (detected !== "mouse") inputTypeRef.current = detected;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove as EventListener);
    return () => window.removeEventListener("pointermove", onPointerMove as EventListener);
  }, [onPointerMove]);

  // rAF recording loop
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
      const pulse = Math.sin(now / 300) * 4;
      ctx.beginPath();
      ctx.arc(targetX, targetY, TARGET_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(37,99,235,0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(37,99,235,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(targetX, targetY, TARGET_RADIUS + 6 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(37,99,235,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crosshair
      ctx.strokeStyle = "rgba(37,99,235,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(targetX - 10, targetY); ctx.lineTo(targetX + 10, targetY);
      ctx.moveTo(targetX, targetY - 10); ctx.lineTo(targetX, targetY + 10);
      ctx.stroke();

      // Cursor dot
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(24,24,27,0.85)"; // zinc-900
      ctx.fill();

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

    const next = targetIdx + 1;
    setProgress(next);

    if (next >= TARGET_POSITIONS_NORM.length) {
      setStep("done");

      const trajectories = trajectoriesRef.current;
      const calibration = computeCalibration(trajectories);

      // Per-target deviations for SPI
      const perTargetDev = trajectories.map(measureTrajectoryDeviation);
      const avgDev = perTargetDev.reduce((a, b) => a + b, 0) / perTargetDev.length;
      const avgClickTime = clickTimesRef.current.reduce((a, b) => a + b, 0) / clickTimesRef.current.length;

      const presetKey = deviationToPreset(avgDev);
      const presetParams = getPresetParams(presetKey, inputTypeRef.current);

      // Override calibration params with the snapped preset
      const snappedCalibration: CalibrationResult = {
        ...calibration,
        minCutoff: presetParams.minCutoff,
        beta: presetParams.beta,
      };

      const spiBeforeStead = estimateSPIFromDeviation(avgDev, avgClickTime);

      persistCalibration(sessionId.current, snappedCalibration);

      setTimeout(() => onComplete({
        calibration: snappedCalibration,
        presetKey,
        spiBeforeStead,
        clickTimesMs: clickTimesRef.current,
        inputType: inputTypeRef.current,
      }), 800);

    } else {
      setTargetIdx(next);
      targetStartTimeRef.current = performance.now();
    }
  }, [step, targetIdx, onComplete]);

  // Reset start time when target changes
  useEffect(() => {
    if (step === "playing") targetStartTimeRef.current = performance.now();
  }, [targetIdx, step]);

  // Fallback timeout: If a user struggles for >10s on one target, they have severe tremor.
  // Don't leave them trapped. Auto-complete with the Strong preset.
  useEffect(() => {
    if (step !== "playing") return;
    const interval = setInterval(() => {
      const elapsed = performance.now() - targetStartTimeRef.current;
      if (elapsed > 10000) { // 10 seconds timeout
        setStep("done");
        const presetParams = getPresetParams("strong", inputTypeRef.current);
        const fallbackCalibration = { minCutoff: presetParams.minCutoff, beta: presetParams.beta, avgDeviation: 20 };
        const spiBeforeStead = estimateSPIFromDeviation(20, 10000);
        
        persistCalibration(sessionId.current, fallbackCalibration);
        setTimeout(() => onComplete({
          calibration: fallbackCalibration,
          presetKey: "strong",
          spiBeforeStead,
          clickTimesMs: [10000, 10000, 10000, 10000, 10000],
          inputType: inputTypeRef.current,
        }), 800);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [step, onComplete]);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  return (
    <div className="absolute inset-0 z-30 bg-zinc-50 flex flex-col items-center justify-center font-sans">

      {step === "playing" && (
        <>
          <canvas ref={canvasRef} className="absolute inset-0" style={{ cursor: "none" }} />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
            <p className="text-zinc-500 font-label-editorial text-[0.7rem] uppercase tracking-wider">
              {progress + 1} of {TARGET_POSITIONS_NORM.length} — acquire target
            </p>
            <div className="w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(progress / TARGET_POSITIONS_NORM.length) * 100}%` }}
              />
            </div>
          </div>
        </>
      )}

      {step === "intro" && (
        <div className="flex flex-col items-center gap-8 text-center max-w-sm px-6 bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <div>
            <h2 className="font-headline-md text-2xl text-zinc-900 tracking-tight mb-3">
              Kinematic Calibration
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed font-body-sm">
              Click the 5 circular nodes as they appear across the arena. 
              This 10-second diagnostic establishes your baseline motor profile.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => { currentTrajRef.current = []; setStep("playing"); }}
              className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-body-sm font-medium transition-all active:scale-[0.98] shadow-md shadow-blue-900/10"
            >
              Initiate diagnostic
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 text-zinc-400 text-sm hover:text-zinc-600 font-body-sm transition-colors"
            >
              Skip calibration
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-6 text-center px-6 bg-white p-10 rounded-2xl shadow-sm border border-zinc-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-emerald-600 text-3xl">check</span>
          </div>
          <div>
            <p className="text-zinc-900 font-headline-sm text-xl font-medium">Profile Established</p>
            <p className="text-zinc-500 font-body-sm text-sm mt-2">Configuring algorithmic dampening...</p>
          </div>
        </div>
      )}
    </div>
  );
}
