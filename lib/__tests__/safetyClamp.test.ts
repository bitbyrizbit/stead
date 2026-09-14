import { applySafetyClamp } from "../safetyClamp";

describe("applySafetyClamp", () => {
  test("within limit → returns filtered unchanged", () => {
    const raw      = { x: 100, y: 100 };
    const filtered = { x: 110, y: 110 }; // drift = ~14px, well under 40
    const result = applySafetyClamp(raw, filtered, 40);
    expect(result).toEqual(filtered);
  });

  test("exact limit → returns filtered unchanged", () => {
    const raw      = { x: 0, y: 0 };
    const filtered = { x: 40, y: 0 }; // drift = exactly 40px
    const result = applySafetyClamp(raw, filtered, 40);
    expect(result.x).toBeCloseTo(40);
    expect(result.y).toBeCloseTo(0);
  });

  test("over limit → result drift equals maxDriftPx exactly", () => {
    const raw      = { x: 0, y: 0 };
    const filtered = { x: 80, y: 0 }; // drift = 80px, twice the limit
    const result = applySafetyClamp(raw, filtered, 40);
    const drift = Math.hypot(result.x - raw.x, result.y - raw.y);
    expect(drift).toBeCloseTo(40, 1);
  });

  test("over limit diagonal → drift clamped correctly", () => {
    const raw      = { x: 0, y: 0 };
    const filtered = { x: 60, y: 80 }; // drift = 100px
    const result = applySafetyClamp(raw, filtered, 40);
    const drift = Math.hypot(result.x - raw.x, result.y - raw.y);
    expect(drift).toBeCloseTo(40, 1);
    // Direction preserved — result should be along the same vector
    expect(result.x / result.y).toBeCloseTo(60 / 80, 2);
  });

  test("zero drift → returns filtered as-is", () => {
    const pos = { x: 200, y: 150 };
    expect(applySafetyClamp(pos, pos, 40)).toEqual(pos);
  });
});
