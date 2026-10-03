"use client";

import { computeSPI, type SPIClick } from "@/lib/steadPrecisionIndex";

interface AccuracyBoardProps {
  steadOnClicks: SPIClick[];
  steadOffClicks: SPIClick[];
}

export function AccuracyBoard({ steadOnClicks, steadOffClicks }: AccuracyBoardProps) {
  const spiOn = computeSPI(steadOnClicks);
  const spiOff = computeSPI(steadOffClicks);

  return (
    <div className="absolute bottom-8 right-8 z-[80] rounded-2xl bg-cream-paper/95 border-2 border-ink/20 p-5 min-w-[270px] shadow-retro-sm backdrop-blur-sm pointer-events-auto select-none">
      <p className="text-[11px] font-sans font-bold text-ink uppercase tracking-[0.16em] mb-4 border-b-2 border-ink/10 pb-2">
        Observation Ledger
      </p>

      <div className="flex flex-col gap-4">
        {/* STEAD off */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full border border-ember border-dashed shrink-0" />
            <span className="text-xs text-ink-soft font-sans uppercase tracking-wider font-semibold">Unassisted</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-ink tnum leading-none">
              {spiOff.clicks > 0 ? spiOff.score : "—"}
            </span>
            {spiOff.clicks > 0 && (
              <span className="text-[10px] text-ink-muted mt-1 font-semibold tnum font-sans uppercase">
                {Math.round(spiOff.hitRate * 100)}% accuracy
              </span>
            )}
          </div>
        </div>

        {/* STEAD on */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-moss shrink-0" />
            <span className="text-xs text-moss font-sans uppercase tracking-wider font-bold">Active Filter</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-moss tnum leading-none">
              {spiOn.clicks > 0 ? spiOn.score : "—"}
            </span>
            {spiOn.clicks > 0 && (
              <span className="text-[10px] text-moss mt-1 font-semibold tnum font-sans uppercase">
                {Math.round(spiOn.hitRate * 100)}% accuracy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Totals */}
      {(steadOnClicks.length > 0 || steadOffClicks.length > 0) && (
        <p className="text-[10px] text-ink-muted mt-4 text-right pt-2 border-t border-ink/10 font-sans tracking-wider uppercase font-medium">
          {steadOffClicks.length} unassisted · {steadOnClicks.length} active
        </p>
      )}
    </div>
  );
}
