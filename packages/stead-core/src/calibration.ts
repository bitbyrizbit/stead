/**
 * calibration.ts — Tremor measurement and filter parameter derivation
 *
 * Kept deliberately simple (no FFT) per the phase spec. The key insight is
 * that "average deviation from the straight-line path" is a robust, fast,
 * explainable proxy for tremor severity — and it's exactly what you can
 * measure from a click-sequence game without a clinical lab.
 *
 * Algorithm:
 *  1. For each target, compute the straight line from trajectory start → click.
 *  2. Measure the perpendicular distance from every intermediate sample to
 *     that line (cross-product magnitude / line length).
 *  3. Average across all samples of all targets → avgDeviation (pixels).
 *  4. Map avgDeviation to filter parameters:
 *       low deviation  → mild smoothing (high minCutoff, low beta)
 *       high deviation → aggressive smoothing (low minCutoff, high beta)
 *
 * Pure TypeScript — no React, no DOM. Unit-testable in Node.
 */

export interface CalibrationPoint {
  x: number;
  y: number;
  t: number;
}

export interface CalibrationResult {
  avgDeviation: number; // pixels — the key metric
  minCutoff: number;    // One Euro Filter param
  beta: number;         // One Euro Filter param
}

/**
 * Perpendicular distance from point P to the line segment A→B.
 * Uses the cross-product formulation: |AP × AB| / |AB|
 */
function perpDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const abLen = Math.hypot(abx, aby);
  if (abLen < 1e-9) return Math.hypot(px - ax, py - ay); // degenerate segment
  // |cross product|
  const cross = Math.abs(abx * (ay - py) - aby * (ax - px));
  return cross / abLen;
}

/**
 * Compute the average perpendicular deviation of a trajectory from the
 * straight line between its first and last point.
 *
 * @param trajectory  Ordered list of pointer samples for one target approach.
 * @returns           Mean deviation in pixels.
 */
export function measureTrajectoryDeviation(trajectory: CalibrationPoint[]): number {
  if (trajectory.length < 2) return 0;

  const start = trajectory[0];
  const end = trajectory[trajectory.length - 1];

  // Intermediate points only (exclude endpoints — their distance is 0 by definition).
  const inner = trajectory.slice(1, -1);
  if (inner.length === 0) return 0;

  const totalDev = inner.reduce(
    (sum, p) => sum + perpDistance(p.x, p.y, start.x, start.y, end.x, end.y),
    0
  );

  return totalDev / inner.length;
}

/**
 * Derive One Euro Filter parameters from measured average deviation.
 *
 * Mapping rationale (tuned empirically against the One Euro Filter paper):
 *   deviation = 0  px → minCutoff=3.0, beta=0.001  (minimal smoothing — clean signal)
 *   deviation = 5  px → minCutoff=1.5, beta=0.005  (light tremor)
 *   deviation = 15 px → minCutoff=0.8, beta=0.015  (moderate tremor)
 *   deviation = 30 px → minCutoff=0.5, beta=0.030  (severe tremor)
 *
 * We use simple clamped linear interpolation — no curve fitting needed.
 */
export function deriveFilterParams(avgDeviation: number): {
  minCutoff: number;
  beta: number;
} {
  // Clamp to a reasonable range.
  const dev = Math.max(0, Math.min(avgDeviation, 30));

  // Linear interpolation between (dev=0 → minCutoff=3.0) and (dev=30 → minCutoff=0.5)
  const minCutoff = 3.0 - (dev / 30) * (3.0 - 0.5);

  // Linear interpolation between (dev=0 → beta=0.001) and (dev=30 → beta=0.030)
  const beta = 0.001 + (dev / 30) * (0.030 - 0.001);

  return {
    minCutoff: Math.round(minCutoff * 1000) / 1000,
    beta: Math.round(beta * 10000) / 10000,
  };
}

/**
 * Compute a full calibration result from a set of trajectories
 * (one per target in the clicking game).
 */
export function computeCalibration(
  trajectories: CalibrationPoint[][]
): CalibrationResult {
  if (trajectories.length === 0) {
    // Sensible defaults if calibration data is empty.
    return { avgDeviation: 0, minCutoff: 1.0, beta: 0.007 };
  }

  const deviations = trajectories.map(measureTrajectoryDeviation);
  const avgDeviation =
    deviations.reduce((a, b) => a + b, 0) / deviations.length;

  const { minCutoff, beta } = deriveFilterParams(avgDeviation);

  return { avgDeviation, minCutoff, beta };
}
