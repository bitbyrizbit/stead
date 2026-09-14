/**
 * safetyClamp.ts
 *
 * Prevents the One Euro Filter from over-smoothing fast intentional movement.
 *
 * Problem: if a user makes a sudden large deliberate movement (e.g., snapping
 * to a new target), the filter's inertia can keep the cursor "stuck" behind
 * for several frames. For a tremor filter this is the critical failure mode —
 * it must smooth tremor but never swallow intent.
 *
 * Solution: measure the drift between filtered and raw. If drift exceeds
 * `maxDriftPx`, blend the result back toward raw by exactly enough to
 * stay within the limit. The blend is continuous and smooth — no sudden jumps.
 *
 * Pure TypeScript — no React, no browser globals.
 */

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Apply a safety clamp to the filtered cursor position.
 *
 * @param raw        The unfiltered (+ tremor-injected) position.
 * @param filtered   The One Euro Filter output.
 * @param maxDriftPx Maximum allowed distance between filtered and raw.
 *                   Default 40 px — beyond this the filter is over-lagging.
 * @returns          The clamped position: filtered if within limit, or
 *                   blended back toward raw if outside.
 */
export function applySafetyClamp(
  raw: Point2D,
  filtered: Point2D,
  maxDriftPx = 40
): Point2D {
  const dx = raw.x - filtered.x;
  const dy = raw.y - filtered.y;
  const dist = Math.hypot(dx, dy);

  // Within limit — filtered position is fine as-is.
  if (dist <= maxDriftPx) return filtered;

  // Outside limit — blend back toward raw so drift = maxDriftPx exactly.
  // t = fraction of the (raw - filtered) vector to add back.
  const t = (dist - maxDriftPx) / dist;

  return {
    x: filtered.x + dx * t,
    y: filtered.y + dy * t,
  };
}
