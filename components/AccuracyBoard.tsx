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
    <div className="absolute bottom-6 right-6 z-20 rounded-xl bg-zinc-900/50 backdrop-blur-md border border-white/10 p-5 min-w-[260px] shadow-2xl">
      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
        Observation Ledger
      </p>

      <div className="flex flex-col gap-4">
        {/* STEAD off */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-zinc-500 border-dashed shrink-0" />
            <span className="text-xs text-zinc-300 font-medium">Unassisted</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-zinc-300 tabular-nums leading-none">
              {spiOff.clicks > 0 ? spiOff.score : "—"}
            </span>
            {spiOff.clicks > 0 && (
              <span className="text-[10px] text-zinc-500 mt-1 font-medium">
                {Math.round(spiOff.hitRate * 100)}% accuracy
              </span>
            )}
          </div>
        </div>

        {/* STEAD on */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-xs text-zinc-300 font-medium">Active Filter</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-emerald-400 tabular-nums leading-none">
              {spiOn.clicks > 0 ? spiOn.score : "—"}
            </span>
            {spiOn.clicks > 0 && (
              <span className="text-[10px] text-emerald-500/70 mt-1 font-medium">
                {Math.round(spiOn.hitRate * 100)}% accuracy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Totals */}
      {(steadOnClicks.length > 0 || steadOffClicks.length > 0) && (
        <p className="text-[10px] text-zinc-500 mt-4 text-right pt-2 border-t border-white/10 uppercase tracking-wider font-semibold">
          {steadOffClicks.length} unassisted · {steadOnClicks.length} active (clicks)
        </p>
      )}
    </div>
  );
}
