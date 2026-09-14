/**
 * CalibrationGame — Phase 4 onboarding component.
 *
 * A 5-target clicking game that:
 *  1. Shows targets one at a time across the screen.
 *  2. Records the full pointer trajectory from target appearance → click.
 *  3. After all targets, runs computeCalibration() on the trajectories.
 *  4. POSTs the result to /api/calibration (fire-and-forget, never blocks).
 *  5. Calls onComplete(result) so the parent can apply the new filter params.
 *
 * The tremor injector is optionally applied during calibration so the game
 * works with simulated tremor too (useful for the "high vs low amplitude"
 * testing requirement).
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  computeCalibration,
  type CalibrationPoint,
  type CalibrationResult,
} from "@/lib/calibration";
import { TremorInjector } from "@/lib/tremorInjector";

// ─── target layout ────────────────────────────────────────────────────────────

// Five positions spread across the viewport — top-left to bottom-right and
// back, so the trajectories test different movement directions.
const TARGET_POSITIONS_NORM = [
  { x: 0.2, y: 0.3 },
  { x: 0.75, y: 0.25 },
  { x: 0.5, y: 0.55 },
  { x: 0.15, y: 0.7 },
  { x: 0.8, y: 0.65 },
];

const TARGET_RADIUS = 28; // px — large enough to be hittable under tremor

// ─── session ID ───────────────────────────────────────────────────────────────

function makeSessionId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── API helper ───────────────────────────────────────────────────────────────

async function persistCalibration(
  sessionId: string,
  result: CalibrationResult
): Promise<void> {
  try {
    const res = await fetch("/api/calibration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        minCutoff: result.minCutoff,
        beta: result.beta,
        avgDeviation: result.avgDeviation,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      console.warn("[calibration] API returned fallback — using local result");
    }
  } catch (err) {
    // Never throw — API failure must not block the demo.
    console.warn("[calibration] API unavailable, continuing with local result", err);
  }
}

// ─── component ────────────────────────────────────────────────────────────────

export interface CalibrationGameProps {
  /** Optional tremor injector — if provided, injects tremor during calibration. */
  injector?: TremorInjector;
  onComplete: (result: CalibrationResult) => void;
  onSkip: () => void;
}

export function CalibrationGame({
  injector,
  onComplete,
  onSkip,
}: CalibrationGameProps) {
  const [step, setStep] = useState<"intro" | "playing" | "done">("intro");
  const [targetIdx, setTargetIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0–5 targets completed

  const sessionId = useRef(makeSessionId());
  const trajectoriesRef = useRef<CalibrationPoint[][]>([]);
  const currentTrajRef = useRef<CalibrationPoint[]>([]);
  const rawPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport size
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 720);

  useEffect(() => {
    const resize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const currentTarget = TARGET_POSITIONS_NORM[targetIdx] ?? null;
  const targetX = currentTarget ? currentTarget.x * vw : 0;
  const targetY = currentTarget ? currentTarget.y * vh : 0;

  // Pointer tracking
  const onPointerMove = useCallback((e: PointerEvent) => {
    rawPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove as EventListener);
    return () => window.removeEventListener("pointermove", onPointerMove as EventListener);
  }, [onPointerMove]);

  // rAF loop — record trajectory while playing
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

      // Optionally inject tremor
      const { x, y } = injector ? injector.inject(rx, ry, now) : { x: rx, y: ry };

      // Record sample
      currentTrajRef.current.push({ x, y, t: now });

      // Draw frame
      ctx.clearRect(0, 0, vw, vh);

      // Target circle
      ctx.beginPath();
      ctx.arc(targetX, targetY, TARGET_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
      ctx.fill();
      ctx.strokeStyle = "rgba(34, 197, 94, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulse ring
      const pulse = Math.sin(now / 300) * 4;
      ctx.beginPath();
      ctx.arc(targetX, targetY, TARGET_RADIUS + 6 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34, 197, 94, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crosshair inside target
      ctx.strokeStyle = "rgba(34, 197, 94, 0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(targetX - 10, targetY);
      ctx.lineTo(targetX + 10, targetY);
      ctx.moveTo(targetX, targetY - 10);
      ctx.lineTo(targetX, targetY + 10);
      ctx.stroke();

      // Current cursor dot (with injected tremor)
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
      ctx.fill();

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [step, targetX, targetY, vw, vh, injector]);

  // Click handler — advance to next target
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (step !== "playing") return;

      const traj = [...currentTrajRef.current];
      trajectoriesRef.current.push(traj);
      currentTrajRef.current = [];

      const next = targetIdx + 1;
      setProgress(next);

      if (next >= TARGET_POSITIONS_NORM.length) {
        // All done — compute and save
        setStep("done");
        const result = computeCalibration(trajectoriesRef.current);
        persistCalibration(sessionId.current, result); // fire-and-forget
        setTimeout(() => onComplete(result), 600);
      } else {
        setTargetIdx(next);
      }
    },
    [step, targetIdx, onComplete]
  );

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  return (
    <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col items-center justify-center">
      {/* Canvas for the game */}
      {step === "playing" && (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{ cursor: "none" }}
          />
          {/* Progress bar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            <p className="text-slate-400 text-xs font-mono">
              Target {progress + 1} of {TARGET_POSITIONS_NORM.length} — click the circle
            </p>
            <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 transition-all duration-300 rounded-full"
                style={{ width: `${(progress / TARGET_POSITIONS_NORM.length) * 100}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Intro screen */}
      {step === "intro" && (
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
          <div>
            <p className="text-2xl font-semibold text-white mb-1">Quick calibration</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Click 5 targets as they appear. Takes about 10 seconds.
              STEAD will tune itself to your specific movement pattern.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => { currentTrajRef.current = []; setStep("playing"); }}
              className="w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-black text-sm font-semibold transition-colors"
            >
              Start calibration
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 rounded-lg text-slate-500 text-xs hover:text-slate-400 transition-colors"
            >
              Skip — use defaults
            </button>
          </div>
        </div>
      )}

      {/* Done screen */}
      {step === "done" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-400 flex items-center justify-center">
            <span className="text-green-400 text-xl">✓</span>
          </div>
          <p className="text-white font-semibold">Calibrated</p>
          <p className="text-slate-400 text-xs font-mono">Applying your profile…</p>
        </div>
      )}
    </div>
  );
}
