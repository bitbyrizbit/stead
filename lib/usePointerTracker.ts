/**
 * usePointerTracker
 *
 * Captures raw pointermove events and exposes both:
 *  - rawPos:      the latest unfiltered {x, y} position
 *  - filteredPos: the One Euro Filter output for the same position
 *
 * Capture and render are decoupled:
 *  - pointermove pushes into a ref (no re-render per event)
 *  - requestAnimationFrame drives state updates at display rate
 *
 * This keeps event handling off the critical render path and means
 * the filter always operates on the latest sample regardless of framerate.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { OneEuroFilter } from "@/lib/oneEuroFilter";

export interface PointerSample {
  x: number;
  y: number;
  t: number;
}

export interface PointerState {
  rawPos: { x: number; y: number } | null;
  filteredPos: { x: number; y: number } | null;
  /** Sliding window of recent raw samples (capped at MAX_SAMPLES). */
  samples: PointerSample[];
}

const MAX_SAMPLES = 500;

export interface UsePointerTrackerOptions {
  /** One Euro Filter minCutoff. Default 1.0 Hz */
  minCutoff?: number;
  /** One Euro Filter beta (speed coeff). Default 0.007 */
  beta?: number;
  /** Element to attach listeners to. Defaults to window. */
  targetRef?: React.RefObject<HTMLElement | null>;
}

export function usePointerTracker({
  minCutoff = 1.0,
  beta = 0.007,
  targetRef,
}: UsePointerTrackerOptions = {}): PointerState {
  // Latest raw sample — written in event handler, read in rAF callback.
  const latestSample = useRef<PointerSample | null>(null);

  // Sliding window (written in event handler, copied to state in rAF).
  const samplesBuffer = useRef<PointerSample[]>([]);

  // One Euro Filters for x and y — created once, params updated via setParams.
  const filterX = useRef(new OneEuroFilter(minCutoff, beta));
  const filterY = useRef(new OneEuroFilter(minCutoff, beta));

  // Keep filter params in sync if caller changes them.
  useEffect(() => {
    filterX.current.setParams(minCutoff, beta);
    filterY.current.setParams(minCutoff, beta);
  }, [minCutoff, beta]);

  const [state, setState] = useState<PointerState>({
    rawPos: null,
    filteredPos: null,
    samples: [],
  });

  const rafId = useRef<number | null>(null);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const sample: PointerSample = { x: e.clientX, y: e.clientY, t: performance.now() };
    latestSample.current = sample;

    const buf = samplesBuffer.current;
    buf.push(sample);
    if (buf.length > MAX_SAMPLES) buf.shift();
  }, []);

  useEffect(() => {
    const el = targetRef?.current ?? window;

    (el as EventTarget).addEventListener("pointermove", onPointerMove as EventListener);

    // rAF loop: read latest sample and push filtered state.
    const tick = () => {
      const sample = latestSample.current;
      if (sample) {
        const fx = filterX.current.filter(sample.x, sample.t);
        const fy = filterY.current.filter(sample.y, sample.t);

        setState({
          rawPos: { x: sample.x, y: sample.y },
          filteredPos: { x: fx, y: fy },
          samples: [...samplesBuffer.current],
        });
      }
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      (el as EventTarget).removeEventListener("pointermove", onPointerMove as EventListener);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [onPointerMove, targetRef]);

  return state;
}
