/**
 * TremorInjector — Synthetic tremor noise generator
 *
 * Adds realistic Parkinsonian-band tremor (4–6 Hz) on top of clean pointer
 * input. Uses two slightly different frequencies on x/y axes and layers a
 * small amount of random jitter so the result doesn't look like a perfect
 * sine wave (real tremor isn't perfectly periodic).
 *
 * Pure TypeScript — no React, no browser globals except performance.now()
 * (which is polyfilled in Node for tests). Portable to a browser extension.
 */

export class TremorInjector {
  private freqX: number; // Hz
  private freqY: number; // Hz
  private amplitude: number; // pixels
  private phaseOffsetY = 1.3; // radians — keeps x/y out of phase for realism
  private startTime: number;

  /**
   * @param amplitude  Peak tremor displacement in pixels. Default: 8
   * @param freq       Base frequency in Hz (Parkinsonian band: 4–6). Default: 5
   */
  constructor(amplitude = 8, freq = 5) {
    this.amplitude = amplitude;
    this.freqX = freq;
    // Slightly different Y frequency makes the Lissajous-like path look organic
    this.freqY = freq * 0.9;
    // Use performance.now() if available (browser), otherwise Date.now() (Node/test)
    this.startTime =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  /**
   * Inject tremor noise into a clean {x, y} position.
   *
   * @param x         Clean pointer x coordinate
   * @param y         Clean pointer y coordinate
   * @param timestamp Current timestamp in ms (pass performance.now())
   */
  inject(x: number, y: number, timestamp: number): { x: number; y: number } {
    const t = (timestamp - this.startTime) / 1000; // seconds

    // Primary oscillation — sine wave at Parkinsonian frequency.
    const sinX = this.amplitude * Math.sin(2 * Math.PI * this.freqX * t);
    const sinY =
      this.amplitude *
      Math.sin(2 * Math.PI * this.freqY * t + this.phaseOffsetY);

    // High-frequency micro-jitter layered on top (30% of amplitude).
    // Makes it look less artificial in the demo.
    const jitterX = (Math.random() - 0.5) * this.amplitude * 0.3;
    const jitterY = (Math.random() - 0.5) * this.amplitude * 0.3;

    return {
      x: x + sinX + jitterX,
      y: y + sinY + jitterY,
    };
  }

  /** Update amplitude live (wired to slider in debug panel). */
  setAmplitude(a: number): void {
    this.amplitude = a;
  }

  /** Update frequency live. Resets the phase clock so the waveform
   *  restarts cleanly rather than jumping mid-oscillation. */
  setFrequency(hz: number): void {
    this.freqX = hz;
    this.freqY = hz * 0.9;
    // Reset start time so the waveform doesn't jump on freq change
    this.startTime =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  getParams(): { amplitude: number; freqX: number; freqY: number } {
    return { amplitude: this.amplitude, freqX: this.freqX, freqY: this.freqY };
  }
}
