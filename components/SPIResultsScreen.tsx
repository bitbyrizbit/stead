/**
 * SPIResultsScreen — shown immediately after calibration.
 *
 * Displays:
 *  - The preset auto-selected ("We've set you to Strong steadying")
 *  - STEAD Precision Index before STEAD (estimated from calibration data)
 *  - A clear CTA into the live demo where they'll see the "after" number
 *
 * Design: calm, not flashy. Numbers are large and unambiguous.
 * Never shows minCutoff, beta, or any filter terminology.
 */

"use client";

import type { PresetKey } from "@/lib/sensitivityPresets";
import type { SPIResult } from "@/lib/steadPrecisionIndex";

interface SPIResultsScreenProps {
  presetKey: PresetKey;
  spiBeforeStead: SPIResult;
  onContinue: () => void;
}

const PRESET_DESCRIPTIONS: Record<PresetKey, string> = {
  light:  "We've set you to Light steadying",
  medium: "We've set you to Medium steadying",
  strong: "We've set you to Strong steadying",
};

const PRESET_DETAIL: Record<PresetKey, string> = {
  light:  "Gentle correction — for mild shakiness",
  medium: "Balanced correction — for moderate tremor",
  strong: "Strong correction — for significant tremor",
};

function StatBox({ label, value, sub, accent = false }: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={[
      "flex flex-col items-center gap-1 px-6 py-4 rounded-xl border",
      accent
        ? "border-green-400/30 bg-green-400/5"
        : "border-slate-800 bg-slate-900/60",
    ].join(" ")}>
      <span className={["text-3xl font-bold tabular-nums font-mono", accent ? "text-green-400" : "text-white"].join(" ")}>
        {value}
      </span>
      <span className="text-xs text-slate-500 font-mono text-center">{label}</span>
      {sub && <span className="text-[10px] text-slate-700 font-mono text-center">{sub}</span>}
    </div>
  );
}

export function SPIResultsScreen({ presetKey, spiBeforeStead, onContinue }: SPIResultsScreenProps) {
  const hitPct = Math.round(spiBeforeStead.hitRate * 100);
  const dev    = spiBeforeStead.avgDeviationPx.toFixed(1);
  const spiScore = spiBeforeStead.score;

  return (
    <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col items-center justify-center px-6 gap-8">

      {/* Corner marks */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-slate-800" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-slate-800" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-slate-800" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-slate-800" />

      {/* Preset announcement */}
      <div className="text-center animate-fade-up">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[11px] text-green-500 font-mono uppercase tracking-wider">
            Profile set
          </span>
        </div>
        <p className="text-2xl font-bold text-white tracking-tight">
          {PRESET_DESCRIPTIONS[presetKey]}
        </p>
        <p className="text-slate-500 text-sm mt-1">{PRESET_DETAIL[presetKey]}</p>
      </div>

      {/* SPI before STEAD */}
      <div className="animate-fade-up-delay w-full max-w-sm">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono text-center mb-3">
          Your movement baseline (without STEAD)
        </p>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Est. hit rate" value={`${hitPct}%`} />
          <StatBox label="Avg deviation" value={`${dev}px`} />
          <StatBox label="SPI score" value={`${spiScore}`} sub="higher = better" />
        </div>
        <p className="text-[10px] text-slate-700 font-mono text-center mt-2">
          STEAD Precision Index — see it improve live in the demo
        </p>
      </div>

      {/* CTA */}
      <div className="animate-fade-up-delay-2 flex flex-col items-center gap-2 w-full max-w-xs">
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-lg bg-green-400 hover:bg-green-300 text-slate-950 text-sm font-semibold transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(74,222,128,0.2)]"
        >
          See STEAD in action →
        </button>
      </div>
    </div>
  );
}
