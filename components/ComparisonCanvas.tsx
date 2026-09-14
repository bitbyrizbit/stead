/**
 * ComparisonCanvas — Phase 5 update
 *
 * Changes from Phase 3:
 *  - Safety clamp applied after One Euro Filter, before cursor draw.
 *  - "Reset to raw" prop — when true, bypasses all filtering instantly.
 *  - Filtered position exposed via onFilteredPos callback (used by SPI tracking).
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { OneEuroFilter } from "@/lib/oneEuroFilter";
import { TremorInjector } from "@/lib/tremorInjector";
import { predictTarget, type Point } from "@/lib/targetPredictor";
import { measureTrajectoryDeviation } from "@/lib/calibration";
import { applySafetyClamp } from "@/lib/safetyClamp";
import type { ClickTargetLayerHandle } from "./ClickTargetLayer";

const DOT_RADIUS = 9;
const TRAJECTORY_BUFFER_SIZE = 60;

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: string, label: string
) {
  ctx.beginPath();
  ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(label, x, y + DOT_RADIUS + 13);
}

export interface ComparisonCanvasProps {
  amplitude: number;
  frequency: number;
  minCutoff: number;
  beta: number;
  /** When true: bypass all filtering, show only raw tremor cursor. */
  rawMode?: boolean;
  targetLayerRef: React.RefObject<ClickTargetLayerHandle | null>;
  onClickResolved?: (params: { rawX: number; rawY: number; predictedIndex: number; deviationPx: number }) => void;
}

export function ComparisonCanvas({
  amplitude, frequency, minCutoff, beta,
  rawMode = false,
  targetLayerRef, onClickResolved,
}: ComparisonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rawPos = useRef({ x: 0, y: 0 });
  const filteredPos = useRef({ x: 0, y: 0 });
  const injectorRef = useRef(new TremorInjector(amplitude, frequency));
  const filterX = useRef(new OneEuroFilter(minCutoff, beta));
  const filterY = useRef(new OneEuroFilter(minCutoff, beta));
  const trajectoryRef = useRef<Point[]>([]);
  const rawModeRef = useRef(rawMode);

  // Sync params
  useEffect(() => {
    filterX.current.setParams(minCutoff, beta);
    filterY.current.setParams(minCutoff, beta);
  }, [minCutoff, beta]);

  useEffect(() => { injectorRef.current.setAmplitude(amplitude); }, [amplitude]);
  useEffect(() => { injectorRef.current.setFrequency(frequency); }, [frequency]);
  useEffect(() => { rawModeRef.current = rawMode; }, [rawMode]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    rawPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback((_e: PointerEvent) => {
    if (rawModeRef.current) return;
    const layer = targetLayerRef.current;
    if (!layer) return;
    const rects = layer.getRects();
    const traj = trajectoryRef.current;
    const predicted = predictTarget(traj, rects, 10);
    if (predicted !== -1) layer.click(predicted);
    
    // Compute deviation for SPI scoring
    const deviationPx = measureTrajectoryDeviation(traj);
    
    onClickResolved?.({
      rawX: filteredPos.current.x,
      rawY: filteredPos.current.y,
      predictedIndex: predicted,
      deviationPx
    });
  }, [targetLayerRef, onClickResolved]);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove as EventListener);
    window.addEventListener("pointerup", onPointerUp as EventListener);
    return () => {
      window.removeEventListener("pointermove", onPointerMove as EventListener);
      window.removeEventListener("pointerup", onPointerUp as EventListener);
    };
  }, [onPointerMove, onPointerUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    let rafId: number;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { rafId = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();
      const { x: rx, y: ry } = rawPos.current;
      const { x: tx, y: ty } = injectorRef.current.inject(rx, ry, now);

      if (rawModeRef.current) {
        // Raw mode: show only the tremor cursor, no green dot
        drawDot(ctx, tx, ty, "rgba(239, 68, 68, 0.9)", "Raw");
        filteredPos.current = { x: tx, y: ty };
      } else {
        // Normal mode: filter + safety clamp
        const fx = filterX.current.filter(tx, now);
        const fy = filterY.current.filter(ty, now);
        const clamped = applySafetyClamp({ x: tx, y: ty }, { x: fx, y: fy }, 40);
        filteredPos.current = clamped;

        const buf = trajectoryRef.current;
        buf.push({ x: clamped.x, y: clamped.y, t: now });
        if (buf.length > TRAJECTORY_BUFFER_SIZE) buf.shift();

        drawDot(ctx, tx, ty, "rgba(239, 68, 68, 0.9)", "Raw");
        drawDot(ctx, clamped.x, clamped.y, "rgba(34, 197, 94, 0.95)", "STEAD");
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: "none" }} />
  );
}
