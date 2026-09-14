/**
 * One Euro Filter — Casiez, Roussel & Vogel (2012)
 * https://cristal.univ-lille.fr/~casiez/1euro/
 *
 * Pure TypeScript. No React, no browser globals.
 * Portable to a browser extension without modification.
 *
 * Usage per axis:
 *   const f = new OneEuroFilter(1.0, 0.007);
 *   const smoothed = f.filter(rawValue, performance.now());
 */

/** Single-pole low-pass filter (exponential smoothing). */
class LowPassFilter {
  private y: number | null = null;

  filter(value: number, alpha: number): number {
    if (this.y === null) {
      this.y = value;
    } else {
      this.y = alpha * value + (1 - alpha) * this.y;
    }
    return this.y;
  }

  lastValue(): number | null {
    return this.y;
  }

  reset(): void {
    this.y = null;
  }
}

/**
 * Compute the smoothing factor alpha for a given dt and cutoff frequency.
 * Derived from the bilinear transform of a continuous-time RC filter.
 */
function smoothingFactor(dt: number, cutoff: number): number {
  const r = 2 * Math.PI * cutoff * dt;
  return r / (r + 1);
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;

  /** Filter applied to the position signal. */
  private xFilter = new LowPassFilter();
  /** Filter applied to the derivative (speed) of the signal. */
  private dxFilter = new LowPassFilter();

  private lastTime: number | null = null;
  private lastValue: number | null = null;

  /**
   * @param minCutoff  Minimum cutoff frequency in Hz (controls jitter at rest).
   *                   Lower → smoother at rest, more lag. Default: 1.0 Hz
   * @param beta       Speed coefficient (controls lag at high speed).
   *                   Higher → less lag during fast motion. Default: 0.007
   * @param dCutoff    Cutoff for the derivative filter (usually leave at 1.0).
   */
  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  /**
   * Filter a single scalar value at a given timestamp (ms).
   * Call once per axis per frame.
   */
  filter(value: number, timestamp: number): number {
    if (this.lastTime === null || this.lastValue === null) {
      this.lastTime = timestamp;
      this.lastValue = value;
      return value;
    }

    // dt in seconds; clamp to at most 120 Hz equivalent to avoid exploding
    // derivatives on the very first real sample after a pause.
    const dt = Math.max((timestamp - this.lastTime) / 1000, 1 / 120);
    this.lastTime = timestamp;

    // Estimate speed (derivative of input).
    const dx = (value - this.lastValue) / dt;

    // Smooth the derivative with its own low-pass filter.
    const edx = this.dxFilter.filter(dx, smoothingFactor(dt, this.dCutoff));

    // Speed-adaptive cutoff: faster movement → higher cutoff → less lag.
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);

    // Filter the position signal.
    const result = this.xFilter.filter(value, smoothingFactor(dt, cutoff));

    this.lastValue = value;
    return result;
  }

  /** Update tuning parameters at runtime (used by calibration). */
  setParams(minCutoff: number, beta: number): void {
    this.minCutoff = minCutoff;
    this.beta = beta;
  }

  /** Reset internal state (use when starting a new gesture / session). */
  reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
    this.lastValue = null;
  }

  getParams(): { minCutoff: number; beta: number } {
    return { minCutoff: this.minCutoff, beta: this.beta };
  }
}
