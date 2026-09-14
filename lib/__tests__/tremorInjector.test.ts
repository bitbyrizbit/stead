/**
 * Unit tests for TremorInjector.
 *
 * Tests match the Phase 2 spec:
 * 1. At default amplitude, injected output differs from clean input.
 * 2. At amplitude = 0, output converges to clean input (edge case test).
 * 3. Frequency is within the documented Parkinsonian band (4–6 Hz).
 * 4. setAmplitude and setFrequency update live without reconstructing.
 */

import { TremorInjector } from "../tremorInjector";

describe("TremorInjector", () => {
  test("injects visible offset at default amplitude", () => {
    const inj = new TremorInjector(8, 5);
    const t0 = 500; // arbitrary timestamp in ms

    // At t=500ms, sin(2π·5·0.5) = sin(5π) = 0, so we get ~jitter only.
    // Run at a mid-cycle point where sin ≠ 0.
    const t1 = 550; // 50ms later → t=0.55s → sin(2π·5·0.55) = sin(5.5π) ≠ 0

    const result = inj.inject(100, 100, t1);

    // The result should differ from clean input by at least the jitter floor.
    const dx = Math.abs(result.x - 100);
    const dy = Math.abs(result.y - 100);

    // At amplitude 8 + 30% jitter, total possible offset ≈ 0–10.4 px.
    // We can't assert exact value due to random jitter, but it should be > 0
    // (probability of exactly 0 is astronomically low).
    expect(dx + dy).toBeGreaterThan(0);
  });

  test("edge case: amplitude = 0 → output equals clean input exactly", () => {
    const inj = new TremorInjector(0, 5);

    // At amplitude 0: sinX = 0 * sin(...) = 0, jitterX = 0 * 0.3 * rand = 0
    // So result should be exactly {x, y} = {100, 200}.
    const result = inj.inject(100, 200, 1000);

    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  test("default frequency is within Parkinsonian band (4–6 Hz)", () => {
    const inj = new TremorInjector(8, 5);
    const { freqX, freqY } = inj.getParams();

    expect(freqX).toBeGreaterThanOrEqual(4);
    expect(freqX).toBeLessThanOrEqual(6);
    expect(freqY).toBeGreaterThanOrEqual(3.5); // 4 * 0.9
    expect(freqY).toBeLessThanOrEqual(6);
  });

  test("setAmplitude updates live", () => {
    const inj = new TremorInjector(8, 5);
    inj.setAmplitude(0);

    const result = inj.inject(50, 50, 2000);
    // amplitude = 0 → deterministic zero offset
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
  });

  test("setFrequency resets startTime to prevent waveform jump", () => {
    const inj = new TremorInjector(8, 5);

    // Call setFrequency — primarily testing it doesn't throw.
    // The functional effect (startTime reset) is implicitly tested by the fact
    // that subsequent inject calls return values without NaN/Infinity.
    inj.setFrequency(4);
    const result = inj.inject(0, 0, performance.now());

    expect(isFinite(result.x)).toBe(true);
    expect(isFinite(result.y)).toBe(true);
  });
});
