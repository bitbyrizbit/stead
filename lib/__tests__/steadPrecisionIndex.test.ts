import { computeSPI, estimateSPIFromDeviation, type SPIClick } from "../steadPrecisionIndex";

describe("computeSPI", () => {
  test("empty input → zero score", () => {
    const result = computeSPI([]);
    expect(result.score).toBe(0);
    expect(result.clicks).toBe(0);
  });

  test("all hits, zero deviation, fast → high score", () => {
    const clicks: SPIClick[] = Array.from({ length: 10 }, () => ({
      hit: true, deviationPx: 0, timeToClickMs: 500,
    }));
    const result = computeSPI(clicks);
    expect(result.score).toBeGreaterThan(80);
    expect(result.hitRate).toBe(1);
  });

  test("all misses, high deviation, slow → low score", () => {
    const clicks: SPIClick[] = Array.from({ length: 10 }, () => ({
      hit: false, deviationPx: 30, timeToClickMs: 4000,
    }));
    const result = computeSPI(clicks);
    expect(result.score).toBeLessThan(20);
    expect(result.hitRate).toBe(0);
  });

  test("score with STEAD ON > score with STEAD OFF for tremor-impaired input", () => {
    // "Filter off" — more deviation, lower hit rate
    const offClicks: SPIClick[] = Array.from({ length: 10 }, () => ({
      hit: Math.random() < 0.5,
      deviationPx: 18,
      timeToClickMs: 2800,
    }));

    // "Filter on" — less deviation, higher hit rate
    const onClicks: SPIClick[] = Array.from({ length: 10 }, () => ({
      hit: Math.random() < 0.9,
      deviationPx: 4,
      timeToClickMs: 1600,
    }));

    const spiOff = computeSPI(offClicks);
    const spiOn  = computeSPI(onClicks);

    expect(spiOn.score).toBeGreaterThan(spiOff.score);
  });

  test("hitRate, avgDeviationPx, avgTimeMs computed correctly", () => {
    const clicks: SPIClick[] = [
      { hit: true,  deviationPx: 10, timeToClickMs: 1000 },
      { hit: false, deviationPx: 20, timeToClickMs: 3000 },
    ];
    const r = computeSPI(clicks);
    expect(r.hitRate).toBeCloseTo(0.5);
    expect(r.avgDeviationPx).toBeCloseTo(15);
    expect(r.avgTimeMs).toBeCloseTo(2000);
  });
});

describe("estimateSPIFromDeviation", () => {
  test("zero deviation → high score", () => {
    const result = estimateSPIFromDeviation(0);
    expect(result.score).toBeGreaterThan(60);
  });

  test("high deviation (30px) → lower score than low deviation (2px)", () => {
    const low  = estimateSPIFromDeviation(2);
    const high = estimateSPIFromDeviation(30);
    expect(high.score).toBeLessThan(low.score);
  });
});
