"use client";

import type { PresetKey } from "@/lib/sensitivityPresets";
import type { SPIResult } from "@/lib/steadPrecisionIndex";
import { ArrowRight } from "lucide-react";

interface SPIResultsScreenProps {
  presetKey: PresetKey;
  spiBeforeStead: SPIResult;
  onContinue: () => void;
}

const PRESET_DESCRIPTIONS: Record<PresetKey, string> = {
  light:  "Light dampening profile assigned",
  medium: "Medium dampening profile assigned",
  strong: "Strong dampening profile assigned",
};

const PRESET_DETAIL: Record<PresetKey, string> = {
  light:  "Mild kinematic correction",
  medium: "Balanced kinematic correction",
  strong: "Significant kinematic correction",
};

function StatBox({ label, value, sub, accent = false }: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={[
      "flex flex-col items-center justify-center gap-1 px-4 py-6 rounded-xl border bg-zinc-900/50 backdrop-blur-md transition-all",
      accent
        ? "border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        : "border-white/10",
    ].join(" ")}>
      <span className={["text-3xl font-bold tracking-tight", accent ? "text-emerald-400" : "text-white"].join(" ")}>
        {value}
      </span>
      <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider text-center">{label}</span>
      {sub && <span className="text-[10px] text-zinc-500 text-center">{sub}</span>}
    </div>
  );
}

export function SPIResultsScreen({ presetKey, spiBeforeStead, onContinue }: SPIResultsScreenProps) {
  const hitPct = Math.round(spiBeforeStead.hitRate * 100);
  const dev    = spiBeforeStead.avgDeviationPx.toFixed(1);
  const spiScore = spiBeforeStead.score;

  return (
    <div className="absolute inset-0 z-30 bg-[#09090b] flex flex-col items-center justify-center px-6 gap-10 font-sans">

      {/* Preset announcement */}
      <div className="text-center animate-fade-up">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">
            Profile Active
          </span>
        </div>
        <h2 className="text-3xl text-white tracking-tight font-bold">
          {PRESET_DESCRIPTIONS[presetKey]}
        </h2>
        <p className="text-zinc-400 text-sm mt-2">{PRESET_DETAIL[presetKey]}</p>
      </div>

      {/* SPI before STEAD */}
      <div className="animate-fade-up-delay w-full max-w-md">
        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest text-center mb-4">
          Unassisted Kinematic Baseline
        </p>
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Est. accuracy" value={`${hitPct}%`} />
          <StatBox label="Avg variance" value={`${dev}px`} />
          <StatBox label="SPI score" value={`${spiScore}`} sub="Baseline metric" accent />
        </div>
        <p className="text-[11px] text-zinc-500 text-center mt-6 uppercase tracking-wider">
          STEAD Protocol will now initialize
        </p>
      </div>

      {/* CTA */}
      <div className="animate-fade-up-delay-2 flex flex-col items-center gap-2 w-full max-w-xs mt-4">
        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-semibold transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
        >
          <span>Enter Live Environment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
