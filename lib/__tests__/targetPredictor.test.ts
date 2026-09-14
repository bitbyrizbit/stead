/**
 * Unit tests for targetPredictor — Phase 3 spec.
 *
 * Key scenario: cursor moving toward Button A, but tremor lands the click
 * physically on or near Button B. predictTarget should return Button A.
 *
 * Tests use plain BoundingBox objects so no browser DOM is required.
 */

import { predictTarget, AccuracyTracker, type Point, type BoundingBox } from "../targetPredictor";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Build a fake DOMRect-like bounding box centred at (cx, cy). */
function makeRect(cx: number, cy: number, w = 110, h = 44): BoundingBox {
  return {
    left: cx - w / 2,
    top: cy - h / 2,
    width: w,
    height: h,
    right: cx + w / 2,
    bottom: cy + h / 2,
  };
}

/**
 * Build a trajectory that starts at (fromX, fromY) and ends at (toX, toY)
 * with `n` linearly-interpolated samples.
 */
function makeLine(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  n = 15
): Point[] {
  return Array.from({ length: n }, (_, i) => ({
    x: fromX + ((toX - fromX) * i) / (n - 1),
    y: fromY + ((toY - fromY) * i) / (n - 1),
    t: i * 8, // ~120 Hz
  }));
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("predictTarget", () => {
  // Five buttons in a row, 130 px apart — like the demo screen targets.
  // Centres: 100, 230, 360, 490, 620  (all at y=500)
  const BUTTONS: BoundingBox[] = [
    makeRect(100, 500), // 0: Send Email
    makeRect(230, 500), // 1: Pay Bill
    makeRect(360, 500), // 2: Sign In
    makeRect(490, 500), // 3: Submit Form
    makeRect(620, 500), // 4: Download
  ];

  test("returns -1 when trajectory has fewer than 2 points", () => {
    const result = predictTarget([{ x: 300, y: 400, t: 0 }], BUTTONS);
    expect(result).toBe(-1);
  });

  test("returns -1 when no candidate is within MAX_DIST (200 px)", () => {
    // Cursor ends at (0, 0) — all buttons are far away.
    const traj = makeLine(0, 100, 0, 0);
    const result = predictTarget(traj, BUTTONS);
    expect(result).toBe(-1);
  });

  test("core: trajectory toward Button A wins even though tremor lands near Button B", () => {
    /**
     * Real-world tremor model:
     *   - The trajectory cleanly approaches Button 2 (Sign In @ 360, 500)
     *     across 20 samples.
     *   - Only the FINAL sample is displaced by tremor to (280, 510) —
     *     between Button 1 and Button 2, closer to Button 1.
     *   - The velocity computed from samples well before the endpoint still
     *     points at Button 2. predictTarget should pick Button 2.
     */
    const traj = makeLine(150, 350, 355, 498, 20); // 20 samples approaching Sign In
    // Tremor displaces only the final sample into the boundary zone.
    traj[traj.length - 1] = { x: 280, y: 510, t: traj.length * 8 };

    const result = predictTarget(traj, BUTTONS, 10); // lookback=10

    // Should pick Button 2 (Sign In), not Button 1 (Pay Bill).
    expect(result).toBe(2);
  });

  test("picks the nearest aligned target when trajectory is direct and clean", () => {
    // Clean straight line toward Button 3 (Submit Form @ 490, 500).
    const traj = makeLine(490, 200, 490, 460);
    const result = predictTarget(traj, BUTTONS);
    expect(result).toBe(3);
  });

  test("prefers alignment over proximity when they conflict", () => {
    /**
     * Cursor moves rightward along y=500 from x=350 toward Button 4 (620, 500).
     * Button 2 (360, 500) is much closer at the end point, but the trajectory
     * is moving away from it — alignment should win and pick Button 4.
     *
     * Note: both need to be within MAX_DIST (200 px) of the last point (540, 500).
     *   - Button 3 (490, 500): distance 50px, alignment ~0 (perpendicular-ish)
     *   - Button 4 (620, 500): distance 80px, alignment ~1 (directly ahead)
     */
    const traj = makeLine(350, 500, 540, 500); // moving right
    const result = predictTarget(traj, BUTTONS);
    // Should prefer Button 4 (moving toward it) over Button 3 (passed it already).
    expect(result).toBe(4);
  });

  test("returns -1 when no candidate is present", () => {
    const traj = makeLine(300, 400, 360, 500);
    expect(predictTarget(traj, [])).toBe(-1);
  });
});

// ─── AccuracyTracker ──────────────────────────────────────────────────────────

describe("AccuracyTracker", () => {
  test("tracks STEAD-on and STEAD-off rates separately", () => {
    const tracker = new AccuracyTracker();

    // STEAD off: 1 hit, 4 misses → 20%
    tracker.record(true, false);
    tracker.record(false, false);
    tracker.record(false, false);
    tracker.record(false, false);
    tracker.record(false, false);

    // STEAD on: 9 hits, 1 miss → 90%
    for (let i = 0; i < 9; i++) tracker.record(true, true);
    tracker.record(false, true);

    expect(tracker.steadOffRate).toBeCloseTo(0.2);
    expect(tracker.steadOnRate).toBeCloseTo(0.9);
  });

  test("returns null before any data is recorded for that mode", () => {
    const tracker = new AccuracyTracker();
    expect(tracker.steadOnRate).toBeNull();
    expect(tracker.steadOffRate).toBeNull();
  });

  test("reset clears all counters", () => {
    const tracker = new AccuracyTracker();
    tracker.record(true, true);
    tracker.record(false, false);
    tracker.reset();

    expect(tracker.steadOnRate).toBeNull();
    expect(tracker.steadOffRate).toBeNull();
  });
});
