/**
 * AccuracyBoard — Live hit-rate display for the results slide.
 *
 * Shows STEAD-on vs STEAD-off accuracy as percentages and click counts.
 * The numbers update in real time as the user clicks targets.
 */

"use client";

interface AccuracyBoardProps {
  steadOnHits: number;
  steadOnTotal: number;
  steadOffHits: number;
  steadOffTotal: number;
}

function pct(hits: number, total: number): string {
  if (total === 0) return "—";
  return `${Math.round((hits / total) * 100)}%`;
}

export function AccuracyBoard({
  steadOnHits,
  steadOnTotal,
  steadOffHits,
  steadOffTotal,
}: AccuracyBoardProps) {
  return (
    <div className="absolute bottom-4 right-4 z-20 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-sm p-4 min-w-48 shadow-xl">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
        Click accuracy
      </p>

      <div className="flex flex-col gap-2">
        {/* STEAD off */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-xs text-slate-400 font-mono">STEAD off</span>
          </div>
          <span className="text-sm font-semibold text-red-400 font-mono tabular-nums">
            {pct(steadOffHits, steadOffTotal)}
          </span>
        </div>

        {/* STEAD on */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="text-xs text-slate-400 font-mono">STEAD on</span>
          </div>
          <span className="text-sm font-semibold text-green-400 font-mono tabular-nums">
            {pct(steadOnHits, steadOnTotal)}
          </span>
        </div>
      </div>

      {/* Totals */}
      {(steadOnTotal > 0 || steadOffTotal > 0) && (
        <p className="text-[10px] text-slate-600 font-mono mt-2 text-right">
          {steadOffTotal} off · {steadOnTotal} on
        </p>
      )}
    </div>
  );
}
