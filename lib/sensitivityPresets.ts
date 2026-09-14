/**
 * sensitivityPresets.ts
 *
 * Maps the technical One Euro Filter parameters to three plain-language
 * presets that non-technical users ever see.
 *
 * The calibration flow picks a preset automatically based on measured
 * average deviation — the user only sees the preset name, never raw numbers.
 */

export const SENSITIVITY_PRESETS = {
  light:  { minCutoff: 1.5, beta: 0.005, label: "Light steadying" },
  medium: { minCutoff: 1.0, beta: 0.007, label: "Medium steadying" },
  strong: { minCutoff: 0.5, beta: 0.012, label: "Strong steadying" },
} as const;

export type PresetKey = keyof typeof SENSITIVITY_PRESETS;

/**
 * Pick the appropriate preset from a measured average trajectory deviation.
 *
 * Thresholds calibrated to the Parkinsonian tremor band:
 *   < 4 px   → light   (mild tremor or general shakiness)
 *   4–12 px  → medium  (moderate essential tremor)
 *   > 12 px  → strong  (severe Parkinsonian / post-stroke)
 */
export function deviationToPreset(avgDeviationPx: number): PresetKey {
  if (avgDeviationPx < 4)  return "light";
  if (avgDeviationPx < 12) return "medium";
  return "strong";
}

/** Resolve a preset key to its filter parameters. */
export function getPresetParams(key: PresetKey) {
  return SENSITIVITY_PRESETS[key];
}

/** Human-readable label for UI — never shows raw numbers. */
export function getPresetLabel(key: PresetKey): string {
  return SENSITIVITY_PRESETS[key].label;
}
