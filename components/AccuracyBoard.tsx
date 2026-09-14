/**
 * AccuracyBoard — Live SPI display for the results slide.
 *
 * Shows STEAD-on vs STEAD-off SPI scores and hit rates.
 * The numbers update in real time as the user clicks targets.
 */

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
    <div className="absolute bottom-4 right-4 z-20 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-sm p-4 min-w-[220px] shadow-xl">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
        STEAD Precision Index
      </p>

      <div className="flex flex-col gap-3">
        {/* STEAD off */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-xs text-slate-400 font-mono">STEAD off</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-red-400 font-mono tabular-nums leading-none">
              {spiOff.clicks > 0 ? spiOff.score : "—"}
            </span>
            {spiOff.clicks > 0 && (
              <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                {Math.round(spiOff.hitRate * 100)}% hit rate
              </span>
            )}
          </div>
        </div>

        {/* STEAD on */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="text-xs text-slate-400 font-mono">STEAD on</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-green-400 font-mono tabular-nums leading-none">
              {spiOn.clicks > 0 ? spiOn.score : "—"}
            </span>
            {spiOn.clicks > 0 && (
              <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                {Math.round(spiOn.hitRate * 100)}% hit rate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Totals */}
      {(steadOnClicks.length > 0 || steadOffClicks.length > 0) && (
        <p className="text-[9px] text-slate-600 font-mono mt-3 text-right">
          {steadOffClicks.length} off · {steadOnClicks.length} on (clicks)
        </p>
      )}
    </div>
  );
}
