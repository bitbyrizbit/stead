/**
 * Unit tests for OneEuroFilter — Casiez et al. (2012)
 *
 * Two assertions required by the Phase 1 spec:
 *
 * 1. Variance reduction: filtered output has lower variance than noisy input.
 * 2. Lag comparison: One Euro Filter introduces less lag than a naive
 *    exponential moving average (EMA) at equivalent smoothness.
 *
 * Test signal: a slow, clean ramp with 4–6 Hz sinusoidal tremor noise layered
 * on top, sampled at 120 Hz — matches the Parkinsonian tremor band the real
 * product targets.
 */

import { OneEuroFilter } from "../oneEuroFilter";

// ─── helpers ──────────────────────────────────────────────────────────────────

function variance(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
}

/**
 * Generate N samples of a slow ramp (intentional motion) + sine tremor noise.
 * @param n         Number of samples
 * @param hz        Sample rate in Hz
 * @param tremorHz  Tremor oscillation frequency in Hz
 * @param amp       Tremor amplitude in pixels
 */
function generateTremorSignal(
  n: number,
  hz: number,
  tremorHz: number,
  amp: number
): { values: number[]; timestamps: number[] } {
  const values: number[] = [];
  const timestamps: number[] = [];

  for (let i = 0; i < n; i++) {
    const t = i / hz; // seconds
    const clean = t * 50; // slow 50 px/s ramp (intentional motion)
    const noise = amp * Math.sin(2 * Math.PI * tremorHz * t);
    values.push(clean + noise);
    timestamps.push(t * 1000); // ms
  }

  return { values, timestamps };
}

/**
 * Naive exponential moving average with fixed alpha.
 * Used as the comparison baseline to prove One Euro Filter has less lag
 * at equivalent smoothness.
 */
function applyEMA(values: number[], alpha: number): number[] {
  const out: number[] = [];
  let prev = values[0];
  for (const v of values) {
    prev = alpha * v + (1 - alpha) * prev;
    out.push(prev);
  }
  return out;
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("OneEuroFilter", () => {
  const SAMPLE_HZ = 120;
  const N_SAMPLES = 600; // 5 seconds at 120 Hz
  const TREMOR_HZ = 5; // mid-band Parkinsonian tremor
  const TREMOR_AMP = 8; // pixels — realistic hand tremor

  const { values: noisySignal, timestamps } = generateTremorSignal(
    N_SAMPLES,
    SAMPLE_HZ,
    TREMOR_HZ,
    TREMOR_AMP
  );

  test("filtered output has lower variance than the noisy input", () => {
    const filter = new OneEuroFilter(1.0, 0.007);
    const filtered = noisySignal.map((v, i) => filter.filter(v, timestamps[i]));

    // Skip the first 60 samples (0.5 s) to let the filter warm up.
    const rawVar = variance(noisySignal.slice(60));
    const filteredVar = variance(filtered.slice(60));

    expect(filteredVar).toBeLessThan(rawVar);
  });

  test("first call returns the input value unchanged (no initial lag)", () => {
    const filter = new OneEuroFilter(1.0, 0.007);
    const result = filter.filter(42, 0);
    expect(result).toBe(42);
  });

  test("One Euro Filter lags less than a naive EMA at comparable smoothness", () => {
    /**
     * Strategy: drive both filters with a sudden step change (fast intentional
     * motion — e.g., the user snapping to a new target). Measure how many
     * samples it takes for each to reach 90% of the new value.
     *
     * One Euro Filter should converge faster because its beta parameter raises
     * the cutoff frequency when it detects fast motion.
     */
    const STEP = 200; // pixels — a large, deliberate movement
    const stepValues = Array.from({ length: 120 }, (_, i) => (i < 30 ? 0 : STEP));
    const stepTimestamps = Array.from({ length: 120 }, (_, i) => (i / SAMPLE_HZ) * 1000);

    // One Euro Filter
    const oef = new OneEuroFilter(1.0, 0.007);
    const oefOut = stepValues.map((v, i) => oef.filter(v, stepTimestamps[i]));

    // Naive EMA — alpha tuned to be similarly smooth on the tremor signal.
    // alpha=0.05 gives heavy smoothing comparable to minCutoff=1.0 at rest.
    const emaOut = applyEMA(stepValues, 0.05);

    function samplesTo90Pct(out: number[]): number {
      const target = STEP * 0.9;
      // start checking after the step at index 30
      for (let i = 30; i < out.length; i++) {
        if (out[i] >= target) return i - 30;
      }
      return out.length; // never reached
    }

    const oefLag = samplesTo90Pct(oefOut);
    const emaLag = samplesTo90Pct(emaOut);

    // OEF must converge to 90% of the step in fewer samples than the EMA.
    expect(oefLag).toBeLessThan(emaLag);
  });

  test("setParams updates filter behavior at runtime", () => {
    const filter = new OneEuroFilter(1.0, 0.007);
    const { minCutoff: mc1, beta: b1 } = filter.getParams();
    expect(mc1).toBe(1.0);
    expect(b1).toBe(0.007);

    filter.setParams(2.0, 0.05);
    const { minCutoff: mc2, beta: b2 } = filter.getParams();
    expect(mc2).toBe(2.0);
    expect(b2).toBe(0.05);
  });

  test("reset clears internal state so next sample starts fresh", () => {
    const filter = new OneEuroFilter(1.0, 0.007);
    filter.filter(100, 0);
    filter.filter(200, 16);

    filter.reset();

    // After reset, the first call should return the raw value (no history).
    const result = filter.filter(999, 1000);
    expect(result).toBe(999);
  });
});
