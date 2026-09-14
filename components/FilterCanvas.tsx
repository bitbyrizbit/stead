/**
 * FilterCanvas — Phase 1 demo component
 *
 * Renders two cursors on a full-viewport canvas:
 *   - Raw dot   (red)      : unfiltered pointer position
 *   - Filtered dot (blue)  : One Euro Filter output
 *
 * The canvas is redrawn every rAF tick inside usePointerTracker,
 * so rendering is already decoupled from the event rate.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePointerTracker } from "@/lib/usePointerTracker";

interface FilterCanvasProps {
  minCutoff?: number;
  beta?: number;
}

const DOT_RADIUS = 8;

export function FilterCanvas({ minCutoff = 1.0, beta = 0.007 }: FilterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { rawPos, filteredPos } = usePointerTracker({ minCutoff, beta });

  // Draw both dots whenever positions update.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas resolution to CSS size.
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!rawPos && !filteredPos) return;

    // Raw cursor — red.
    if (rawPos) {
      ctx.beginPath();
      ctx.arc(rawPos.x, rawPos.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239, 68, 68, 0.85)"; // Tailwind red-500
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Filtered cursor — blue.
    if (filteredPos) {
      ctx.beginPath();
      ctx.arc(filteredPos.x, filteredPos.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59, 130, 246, 0.85)"; // Tailwind blue-500
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [rawPos, filteredPos]);

  // Keep canvas dimensions in sync with window resizes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: "none" }} // hide system cursor so the dots are the only visual
    />
  );
}
