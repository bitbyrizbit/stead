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
    <div className="absolute bottom-6 right-6 z-20 rounded-sm bg-paper-warm border border-line p-5 min-w-[260px] shadow-sm">
      <p className="text-[10px] font-mono font-medium text-ink uppercase tracking-[0.2em] mb-4 border-b border-line pb-2">
        Observation Ledger
      </p>

      <div className="flex flex-col gap-4">
        {/* STEAD off */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full border border-amber border-dashed shrink-0" />
            <span className="text-[11px] text-ink-soft font-mono uppercase tracking-[0.1em]">Unassisted</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-ink tnum leading-none">
              {spiOff.clicks > 0 ? spiOff.score : "—"}
            </span>
            {spiOff.clicks > 0 && (
              <span className="text-[10px] text-ink-muted mt-1 font-medium tnum">
                {Math.round(spiOff.hitRate * 100)}% accuracy
              </span>
            )}
          </div>
        </div>

        {/* STEAD on */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
            <span className="text-[11px] text-ink-soft font-mono uppercase tracking-[0.1em]">Active Filter</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-teal tnum leading-none">
              {spiOn.clicks > 0 ? spiOn.score : "—"}
            </span>
            {spiOn.clicks > 0 && (
              <span className="text-[10px] text-teal-soft mt-1 font-medium tnum">
                {Math.round(spiOn.hitRate * 100)}% accuracy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Totals */}
      {(steadOnClicks.length > 0 || steadOffClicks.length > 0) && (
        <p className="text-[10px] text-ink-muted mt-4 text-right pt-2 border-t border-line font-mono uppercase tracking-[0.15em]">
          {steadOffClicks.length} unassisted · {steadOnClicks.length} active
        </p>
      )}
    </div>
  );
}
