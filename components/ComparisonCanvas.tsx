/**
 * ComparisonCanvas — Phase 3 (updated from Phase 2)
 *
 * Changes from Phase 2:
 *  - Maintains a ring buffer of filtered trajectory points (last 60 samples).
 *  - On pointerup: calls targetLayerRef.getRects(), runs predictTarget on
 *    the ring buffer, and dispatches the corrected click via targetLayerRef.click().
 *  - Falls back to the raw click if predictTarget returns -1.
 *  - Canvas-drawn target rects removed — real DOM buttons in ClickTargetLayer
 *    handle visuals and bounding rects.
 *
 * Cursor rendering (unchanged):
 *  🔴 Red  — raw pointer + tremor
 *  🟢 Green — tremor stream filtered by One Euro Filter
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { OneEuroFilter } from "@/lib/oneEuroFilter";
import { TremorInjector } from "@/lib/tremorInjector";
import { predictTarget, type Point } from "@/lib/targetPredictor";
import type { ClickTargetLayerHandle } from "./ClickTargetLayer";

const DOT_RADIUS = 9;
const TRAJECTORY_BUFFER_SIZE = 60; // ~0.5 s at 120 Hz

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string
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
  /** Ref to the ClickTargetLayer — used for bounding rect lookup and click dispatch. */
  targetLayerRef: React.RefObject<ClickTargetLayerHandle | null>;
  /** Called after a click resolves (predicted or raw). */
  onClickResolved?: (params: {
    rawX: number;
    rawY: number;
    predictedIndex: number;
  }) => void;
}

export function ComparisonCanvas({
  amplitude,
  frequency,
  minCutoff,
  beta,
  targetLayerRef,
  onClickResolved,
}: ComparisonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rawPos = useRef({ x: 0, y: 0 });
  const filteredPos = useRef({ x: 0, y: 0 });
  const injectorRef = useRef(new TremorInjector(amplitude, frequency));
  const filterX = useRef(new OneEuroFilter(minCutoff, beta));
  const filterY = useRef(new OneEuroFilter(minCutoff, beta));

  // Ring buffer of filtered trajectory points — written in rAF, read on pointerup.
  const trajectoryRef = useRef<Point[]>([]);

  // Sync filter params on slider change.
  useEffect(() => {
    filterX.current.setParams(minCutoff, beta);
    filterY.current.setParams(minCutoff, beta);
  }, [minCutoff, beta]);

  useEffect(() => {
    injectorRef.current.setAmplitude(amplitude);
  }, [amplitude]);

  useEffect(() => {
    injectorRef.current.setFrequency(frequency);
  }, [frequency]);

  // Pointer capture.
  const onPointerMove = useCallback((e: PointerEvent) => {
    rawPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Click interception — the key Phase 3 logic.
  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const layer = targetLayerRef.current;
      if (!layer) return;

      const rects = layer.getRects();
      const traj = trajectoryRef.current;

      const predicted = predictTarget(traj, rects, 10);

      if (predicted !== -1) {
        layer.click(predicted);
      }

      onClickResolved?.({
        rawX: filteredPos.current.x,
        rawY: filteredPos.current.y,
        predictedIndex: predicted,
      });
    },
    [targetLayerRef, onClickResolved]
  );

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove as EventListener);
    window.addEventListener("pointerup", onPointerUp as EventListener);
    return () => {
      window.removeEventListener("pointermove", onPointerMove as EventListener);
      window.removeEventListener("pointerup", onPointerUp as EventListener);
    };
  }, [onPointerMove, onPointerUp]);

  // rAF draw loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let rafId: number;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();
      const { x: rx, y: ry } = rawPos.current;

      // Inject tremor into raw position.
      const { x: tx, y: ty } = injectorRef.current.inject(rx, ry, now);

      // Filter the tremor-injected position.
      const fx = filterX.current.filter(tx, now);
      const fy = filterY.current.filter(ty, now);

      // Keep filtered position in ref for click interception.
      filteredPos.current = { x: fx, y: fy };

      // Update trajectory ring buffer.
      const buf = trajectoryRef.current;
      buf.push({ x: fx, y: fy, t: now });
      if (buf.length > TRAJECTORY_BUFFER_SIZE) buf.shift();

      // Draw cursors.
      drawDot(ctx, tx, ty, "rgba(239, 68, 68, 0.9)", "Raw");
      drawDot(ctx, fx, fy, "rgba(34, 197, 94, 0.95)", "STEAD");

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: "none" }}
    />
  );
}
