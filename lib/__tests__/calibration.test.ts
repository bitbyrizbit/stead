/**
 * Unit tests for calibration.ts — Phase 4 spec.
 *
 * Required by spec:
 * 1. High tremor amplitude → different (more aggressive) params than low amplitude.
 * 2. Zero-deviation trajectory → minimal smoothing (high minCutoff, low beta).
 * 3. Sensible defaults returned for empty input.
 * 4. perpendicular deviation is computed correctly for known geometry.
 */

import {
  measureTrajectoryDeviation,
  deriveFilterParams,
  computeCalibration,
  type CalibrationPoint,
} from "../calibration";

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeStraightLine(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  n: number
): CalibrationPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    x: fromX + ((toX - fromX) * i) / (n - 1),
    y: fromY + ((toY - fromY) * i) / (n - 1),
    t: i * 8,
  }));
}

/** Add sinusoidal perpendicular tremor to a straight-line trajectory. */
function addTremor(
  line: CalibrationPoint[],
  amplitude: number,
  freqHz: number
): CalibrationPoint[] {
  return line.map((p, i) => ({
    ...p,
    // Displace perpendicular to direction of travel (add to y for a horizontal line)
    y: p.y + amplitude * Math.sin(2 * Math.PI * freqHz * (i / 120)),
  }));
}

// ─── measureTrajectoryDeviation ───────────────────────────────────────────────

describe("measureTrajectoryDeviation", () => {
  test("straight line → deviation is 0", () => {
    const traj = makeStraightLine(0, 0, 200, 0, 30);
    expect(measureTrajectoryDeviation(traj)).toBeCloseTo(0, 5);
  });

  test("trajectory with known perpendicular offset → deviation ≈ offset", () => {
    // Horizontal line from (0,0) to (200,0), all intermediate points at y=10
    const traj: CalibrationPoint[] = [
      { x: 0, y: 0, t: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({
        x: 20 + i * 20,
        y: 10,
        t: (i + 1) * 8,
      })),
      { x: 200, y: 0, t: 9 * 8 },
    ];
    // Perpendicular distance from y=10 to the line y=0 is exactly 10.
    expect(measureTrajectoryDeviation(traj)).toBeCloseTo(10, 1);
  });

  test("single-point trajectory → deviation is 0", () => {
    expect(measureTrajectoryDeviation([{ x: 0, y: 0, t: 0 }])).toBe(0);
  });

  test("higher tremor amplitude → higher measured deviation", () => {
    const base = makeStraightLine(0, 100, 400, 100, 60);
    const lowTremor = addTremor(base, 3, 5);
    const highTremor = addTremor(base, 15, 5);

    const lowDev = measureTrajectoryDeviation(lowTremor);
    const highDev = measureTrajectoryDeviation(highTremor);

    expect(highDev).toBeGreaterThan(lowDev);
  });
});

// ─── deriveFilterParams ───────────────────────────────────────────────────────

describe("deriveFilterParams", () => {
  test("zero deviation → high minCutoff, low beta (minimal smoothing)", () => {
    const { minCutoff, beta } = deriveFilterParams(0);
    expect(minCutoff).toBeGreaterThan(2);
    expect(beta).toBeLessThan(0.005);
  });

  test("high deviation (30px) → low minCutoff, high beta (aggressive smoothing)", () => {
    const { minCutoff, beta } = deriveFilterParams(30);
    expect(minCutoff).toBeLessThan(1);
    expect(beta).toBeGreaterThan(0.02);
  });

  test("clamped: deviation > 30 behaves the same as deviation = 30", () => {
    const at30 = deriveFilterParams(30);
    const at60 = deriveFilterParams(60);
    expect(at60.minCutoff).toEqual(at30.minCutoff);
    expect(at60.beta).toEqual(at30.beta);
  });

  test("monotonic: more deviation → lower minCutoff, higher beta", () => {
    const low = deriveFilterParams(5);
    const mid = deriveFilterParams(15);
    const high = deriveFilterParams(25);

    expect(mid.minCutoff).toBeLessThan(low.minCutoff);
    expect(high.minCutoff).toBeLessThan(mid.minCutoff);
    expect(mid.beta).toBeGreaterThan(low.beta);
    expect(high.beta).toBeGreaterThan(mid.beta);
  });
});

// ─── computeCalibration — the spec's key test ─────────────────────────────────

describe("computeCalibration", () => {
  test("spec: high-tremor and low-tremor runs produce meaningfully different params", () => {
    const base = makeStraightLine(100, 200, 600, 200, 60);

    // Low tremor run (simulates amplitude slider at ~3px)
    const lowTremorTrajectories = Array.from({ length: 5 }, () =>
      addTremor([...base], 3, 5)
    );

    // High tremor run (simulates amplitude slider at ~18px)
    const highTremorTrajectories = Array.from({ length: 5 }, () =>
      addTremor([...base], 18, 5)
    );

    const lowResult = computeCalibration(lowTremorTrajectories);
    const highResult = computeCalibration(highTremorTrajectories);

    // avgDeviation must differ meaningfully
    expect(highResult.avgDeviation).toBeGreaterThan(lowResult.avgDeviation * 2);

    // Filter params must differ meaningfully
    expect(highResult.minCutoff).toBeLessThan(lowResult.minCutoff);
    expect(highResult.beta).toBeGreaterThan(lowResult.beta);
  });

  test("empty input → sensible defaults (minCutoff=1.0, beta=0.007)", () => {
    const result = computeCalibration([]);
    expect(result.minCutoff).toBe(1.0);
    expect(result.beta).toBe(0.007);
  });
});
