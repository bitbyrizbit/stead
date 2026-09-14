/**
 * targetPredictor — Trajectory-based click target prediction
 *
 * Given a sliding window of recent filtered cursor positions and a list of
 * candidate element bounding boxes, returns the index of the element the user
 * most likely intended to click.
 *
 * Algorithm (Fitts's Law-informed heuristic):
 *   1. Compute the cursor's velocity vector from the last N samples.
 *   2. For each candidate, compute:
 *        alignment = dot(velocity_direction, to_target_direction)  → [-1, 1]
 *        score     = alignment * 100 − distance
 *   3. Return the index of the highest-scoring candidate within MAX_DIST px.
 *
 * The 100× weight on alignment vs. 1× on distance means "moving toward a
 * target" beats "being slightly closer but off to the side" — which matches
 * how intentional pointing actually works.
 *
 * Pure TypeScript — no React, no DOM APIs. Accepts DOMRect-shaped objects so
 * it's unit-testable without a browser and portable to a browser extension.
 */

export interface Point {
  x: number;
  y: number;
  t: number;
}

/** Minimum shape of a bounding box — matches DOMRect, but also plain objects. */
export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

/** Maximum distance in px from cursor to candidate centroid. */
const MAX_DIST = 200;

/**
 * Predict which candidate the user intended to click.
 *
 * @param trajectory  Recent filtered cursor samples, oldest first.
 * @param candidates  Bounding boxes of clickable elements (from getBoundingClientRect).
 * @param lookback    How many samples back to use for velocity direction. Default 5.
 * @returns           Index into `candidates` of the best match, or -1 if none
 *                    scores above MIN_SCORE_THRESHOLD.
 */
export function predictTarget(
  trajectory: Point[],
  candidates: BoundingBox[],
  lookback = 5
): number {
  if (trajectory.length < 2 || candidates.length === 0) return -1;

  const last = trajectory[trajectory.length - 1];
  // Look back `lookback` samples (or to the start of the buffer).
  const prev = trajectory[Math.max(0, trajectory.length - 1 - lookback)];

  const dx = last.x - prev.x;
  const dy = last.y - prev.y;
  const mag = Math.hypot(dx, dy) || 1;
  const dirX = dx / mag;
  const dirY = dy / mag;

  let bestScore = -Infinity;
  let bestIndex = -1;

  candidates.forEach((rect, i) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const toTargetX = cx - last.x;
    const toTargetY = cy - last.y;
    const dist = Math.hypot(toTargetX, toTargetY);

    // Reject anything too far — avoids snapping to a target across the screen.
    if (dist > MAX_DIST) return;

    const toTargetMag = dist || 1;
    // Cosine similarity between movement direction and direction to candidate.
    const alignment =
      (dirX * toTargetX + dirY * toTargetY) / toTargetMag; // -1 to 1

    // Score: reward alignment strongly, penalise distance.
    const score = alignment * 100 - dist;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  // Minimum score threshold — don't snap if nothing is a convincing winner.
  // Empirically calibrated: a score of -80 means a 80px-distant target with
  // moderate alignment — weak but acceptable. Anything below falls back to
  // the raw click position.
  const MIN_SCORE_THRESHOLD = -80;
  return bestScore >= MIN_SCORE_THRESHOLD ? bestIndex : -1;
}

/**
 * Hit-rate tracker — records STEAD-on and STEAD-off accuracy over a session.
 * Exported for the accuracy results panel on the demo screen.
 */
export class AccuracyTracker {
  private steadOnHits = 0;
  private steadOnTotal = 0;
  private steadOffHits = 0;
  private steadOffTotal = 0;

  record(hit: boolean, steadEnabled: boolean) {
    if (steadEnabled) {
      this.steadOnTotal++;
      if (hit) this.steadOnHits++;
    } else {
      this.steadOffTotal++;
      if (hit) this.steadOffHits++;
    }
  }

  get steadOnRate(): number | null {
    if (this.steadOnTotal === 0) return null;
    return this.steadOnHits / this.steadOnTotal;
  }

  get steadOffRate(): number | null {
    if (this.steadOffTotal === 0) return null;
    return this.steadOffHits / this.steadOffTotal;
  }

  get steadOnCount(): { hits: number; total: number } {
    return { hits: this.steadOnHits, total: this.steadOnTotal };
  }

  get steadOffCount(): { hits: number; total: number } {
    return { hits: this.steadOffHits, total: this.steadOffTotal };
  }

  reset() {
    this.steadOnHits = 0;
    this.steadOnTotal = 0;
    this.steadOffHits = 0;
    this.steadOffTotal = 0;
  }
}
