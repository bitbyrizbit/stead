/**
 * sensitivityPresets.ts
 *
 * Maps the technical One Euro Filter parameters to three plain-language
 * presets that non-technical users ever see.
 *
 * The calibration flow picks a preset automatically based on measured
 * average deviation — the user only sees the preset name, never raw numbers.
 */

import type { InputType } from "./inputDetection";

export const SENSITIVITY_PRESETS = {
  light:  { minCutoff: 1.5, beta: 0.005, label: "Light steadying" },
  medium: { minCutoff: 1.0, beta: 0.007, label: "Medium steadying" },
  strong: { minCutoff: 0.5, beta: 0.012, label: "Strong steadying" },
} as const;

export type PresetKey = keyof typeof SENSITIVITY_PRESETS;

/**
 * Pick the appropriate preset from a measured average trajectory deviation.
 */
export function deviationToPreset(avgDeviationPx: number): PresetKey {
  if (avgDeviationPx < 4)  return "light";
  if (avgDeviationPx < 12) return "medium";
  return "strong";
}

/** 
 * Resolve a preset key to its filter parameters, applying input-specific tuning.
 * Trackpads produce tighter, more frequent deltas, requiring slightly different 
 * cutoff and beta curves to feel native.
 */
export function getPresetParams(key: PresetKey, inputType: InputType = "mouse") {
  const base = SENSITIVITY_PRESETS[key];
  if (inputType === "trackpad") {
    return {
      // Trackpads are more precise natively; we can afford slightly higher minCutoff (less base lag)
      // and higher beta (faster reaction to speed) to maintain cursor responsiveness.
      minCutoff: base.minCutoff * 1.2,
      beta: base.beta * 1.5,
    };
  }
  return base;
}

/** Human-readable label for UI — never shows raw numbers. */
export function getPresetLabel(key: PresetKey): string {
  return SENSITIVITY_PRESETS[key].label;
}
