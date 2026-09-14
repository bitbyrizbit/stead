// Inline OneEuroFilter
class LowPassFilter {
  private y: number | null = null;
  filter(value: number, alpha: number): number {
    this.y = this.y === null ? value : alpha * value + (1 - alpha) * this.y;
    return this.y;
  }
  reset() { this.y = null; }
}

function smoothingFactor(dt: number, cutoff: number): number {
  const r = 2 * Math.PI * cutoff * dt;
  return r / (r + 1);
}

class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private lastTime: number | null = null;
  private lastValue: number | null = null;

  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  filter(value: number, timestamp: number): number {
    if (this.lastTime === null || this.lastValue === null) {
      this.lastTime = timestamp;
      this.lastValue = value;
      return value;
    }
    const dt = Math.max((timestamp - this.lastTime) / 1000, 1 / 120);
    this.lastTime = timestamp;
    const dx = (value - this.lastValue) / dt;
    const edx = this.dxFilter.filter(dx, smoothingFactor(dt, this.dCutoff));
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    const result = this.xFilter.filter(value, smoothingFactor(dt, cutoff));
    this.lastValue = value;
    return result;
  }

  setParams(minCutoff: number, beta: number) {
    this.minCutoff = minCutoff;
    this.beta = beta;
  }

  reset() {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
    this.lastValue = null;
  }
}

// Inline safety clamp
function applySafetyClamp(
  raw: {x:number,y:number},
  filtered: {x:number,y:number},
  maxDriftPx = 40
): {x:number,y:number} {
  const dx = raw.x - filtered.x;
  const dy = raw.y - filtered.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= maxDriftPx) return filtered;
  const t = (dist - maxDriftPx) / dist;
  return { x: filtered.x + dx * t, y: filtered.y + dy * t };
}

// Preset params (loaded from storage, defaulting to medium)
const PRESETS: Record<string, {minCutoff:number,beta:number}> = {
  light:  { minCutoff: 1.5, beta: 0.005 },
  medium: { minCutoff: 1.0, beta: 0.007 },
  strong: { minCutoff: 0.5, beta: 0.012 },
};

// State
let enabled = true;
let currentPreset = "medium";
let filterX = new OneEuroFilter(1.0, 0.007);
let filterY = new OneEuroFilter(1.0, 0.007);
let filteredX = 0;
let filteredY = 0;
let rawX = 0;
let rawY = 0;

// Load settings from storage
if (typeof chrome !== "undefined" && chrome.storage) {
  chrome.storage.local.get(["steadEnabled", "steadPreset"], (result) => {
    enabled = result.steadEnabled !== false;
    currentPreset = result.steadPreset ?? "medium";
    const params = PRESETS[currentPreset];
    filterX.setParams(params.minCutoff, params.beta);
    filterY.setParams(params.minCutoff, params.beta);
  });

  // Listen for changes from popup
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.steadEnabled) enabled = changes.steadEnabled.newValue;
    if (changes.steadPreset) {
      currentPreset = changes.steadPreset.newValue;
      const params = PRESETS[currentPreset];
      filterX.setParams(params.minCutoff, params.beta);
      filterY.setParams(params.minCutoff, params.beta);
    }
  });
}

// Intercept pointermove — filter and update internal state
document.addEventListener("pointermove", (e: PointerEvent) => {
  rawX = e.clientX;
  rawY = e.clientY;

  if (!enabled) {
    filteredX = rawX;
    filteredY = rawY;
    return;
  }

  const now = performance.now();
  const fx = filterX.filter(rawX, now);
  const fy = filterY.filter(rawY, now);
  const clamped = applySafetyClamp({ x: rawX, y: rawY }, { x: fx, y: fy }, 40);
  filteredX = clamped.x;
  filteredY = clamped.y;
}, { capture: true, passive: true });

// Intercept click — redirect to filtered position element
document.addEventListener("click", (e: MouseEvent) => {
  if (!enabled) return;

  const dx = filteredX - e.clientX;
  const dy = filteredY - e.clientY;
  const drift = Math.hypot(dx, dy);

  // Only redirect if there is meaningful drift
  if (drift < 3) return;

  // Find element at filtered position
  const target = document.elementFromPoint(filteredX, filteredY);
  if (!target || target === e.target) return;

  // Prevent original click and re-dispatch at filtered position
  e.stopPropagation();
  e.preventDefault();

  const correctedClick = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    clientX: filteredX,
    clientY: filteredY,
  });
  target.dispatchEvent(correctedClick);
}, { capture: true });