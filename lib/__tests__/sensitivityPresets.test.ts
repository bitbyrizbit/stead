import { deviationToPreset, getPresetParams, getPresetLabel, SENSITIVITY_PRESETS } from "../sensitivityPresets";

describe("sensitivityPresets", () => {
  test("< 4px deviation → light preset", () => {
    expect(deviationToPreset(0)).toBe("light");
    expect(deviationToPreset(3.9)).toBe("light");
  });

  test("4–12px deviation → medium preset", () => {
    expect(deviationToPreset(4)).toBe("medium");
    expect(deviationToPreset(8)).toBe("medium");
    expect(deviationToPreset(11.9)).toBe("medium");
  });

  test("> 12px deviation → strong preset", () => {
    expect(deviationToPreset(12)).toBe("strong");
    expect(deviationToPreset(25)).toBe("strong");
  });

  test("getPresetParams returns correct filter values", () => {
    expect(getPresetParams("light").minCutoff).toBeGreaterThan(getPresetParams("strong").minCutoff);
    expect(getPresetParams("light").beta).toBeLessThan(getPresetParams("strong").beta);
  });

  test("getPresetLabel returns plain English, no numbers", () => {
    for (const key of Object.keys(SENSITIVITY_PRESETS) as Array<keyof typeof SENSITIVITY_PRESETS>) {
      const label = getPresetLabel(key);
      expect(label).not.toMatch(/\d/); // no numbers in the label
      expect(label.length).toBeGreaterThan(3);
    }
  });

  test("strong has lower minCutoff and higher beta than light (more smoothing)", () => {
    const { minCutoff: mc_light, beta: b_light } = getPresetParams("light");
    const { minCutoff: mc_strong, beta: b_strong } = getPresetParams("strong");
    expect(mc_strong).toBeLessThan(mc_light);
    expect(b_strong).toBeGreaterThan(b_light);
  });
});
