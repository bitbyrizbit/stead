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
    <div className="absolute bottom-6 right-6 z-20 rounded-xl bg-white border border-zinc-200 p-5 min-w-[260px] shadow-lg shadow-zinc-200/50">
      <p className="text-xs font-semibold text-zinc-900 font-label-editorial uppercase tracking-widest mb-4 border-b border-zinc-100 pb-2">
        Observation Ledger
      </p>

      <div className="flex flex-col gap-4">
        {/* STEAD off */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-zinc-400 border-dashed shrink-0" />
            <span className="text-xs text-zinc-600 font-body-sm font-medium">Unassisted</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-zinc-900 font-headline-sm tabular-nums leading-none">
              {spiOff.clicks > 0 ? spiOff.score : "—"}
            </span>
            {spiOff.clicks > 0 && (
              <span className="text-[10px] text-zinc-500 font-body-sm mt-1">
                {Math.round(spiOff.hitRate * 100)}% accuracy
              </span>
            )}
          </div>
        </div>

        {/* STEAD on */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs text-zinc-600 font-body-sm font-medium">Active Filter</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-emerald-600 font-headline-sm tabular-nums leading-none">
              {spiOn.clicks > 0 ? spiOn.score : "—"}
            </span>
            {spiOn.clicks > 0 && (
              <span className="text-[10px] text-emerald-600/70 font-body-sm mt-1">
                {Math.round(spiOn.hitRate * 100)}% accuracy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Totals */}
      {(steadOnClicks.length > 0 || steadOffClicks.length > 0) && (
        <p className="text-[10px] text-zinc-400 font-caption mt-4 text-right pt-2 border-t border-zinc-100">
          {steadOffClicks.length} unassisted · {steadOnClicks.length} active (clicks)
        </p>
      )}
    </div>
  );
}
