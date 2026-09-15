"use client";

import type { PresetKey } from "@/lib/sensitivityPresets";
import type { SPIResult } from "@/lib/steadPrecisionIndex";

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
      "flex flex-col items-center justify-center gap-1 px-4 py-6 rounded-xl border bg-white shadow-sm transition-all",
      accent
        ? "border-blue-200 bg-blue-50/50"
        : "border-zinc-200",
    ].join(" ")}>
      <span className={["font-headline-sm text-3xl font-medium tracking-tight", accent ? "text-blue-600" : "text-zinc-900"].join(" ")}>
        {value}
      </span>
      <span className="text-xs text-zinc-500 font-body-sm font-medium uppercase tracking-wider text-center">{label}</span>
      {sub && <span className="text-[10px] text-zinc-400 font-caption text-center">{sub}</span>}
    </div>
  );
}

export function SPIResultsScreen({ presetKey, spiBeforeStead, onContinue }: SPIResultsScreenProps) {
  const hitPct = Math.round(spiBeforeStead.hitRate * 100);
  const dev    = spiBeforeStead.avgDeviationPx.toFixed(1);
  const spiScore = spiBeforeStead.score;

  return (
    <div className="absolute inset-0 z-30 bg-zinc-50 flex flex-col items-center justify-center px-6 gap-10 font-sans">

      {/* Preset announcement */}
      <div className="text-center animate-fade-up">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-xs text-blue-600 font-label-editorial uppercase tracking-widest">
            Profile Active
          </span>
        </div>
        <h2 className="font-headline-md text-3xl text-zinc-900 tracking-tight">
          {PRESET_DESCRIPTIONS[presetKey]}
        </h2>
        <p className="text-zinc-500 text-sm mt-2 font-body-sm">{PRESET_DETAIL[presetKey]}</p>
      </div>

      {/* SPI before STEAD */}
      <div className="animate-fade-up-delay w-full max-w-md">
        <p className="text-[10px] text-zinc-400 font-label-editorial uppercase tracking-widest text-center mb-4">
          Unassisted Kinematic Baseline
        </p>
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Est. accuracy" value={`${hitPct}%`} />
          <StatBox label="Avg variance" value={`${dev}px`} />
          <StatBox label="SPI score" value={`${spiScore}`} sub="Baseline metric" accent />
        </div>
        <p className="text-[11px] text-zinc-400 font-caption text-center mt-6 uppercase tracking-wider">
          STEAD Protocol will now initialize
        </p>
      </div>

      {/* CTA */}
      <div className="animate-fade-up-delay-2 flex flex-col items-center gap-2 w-full max-w-xs mt-4">
        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-body-sm font-medium transition-all active:scale-[0.98] shadow-md shadow-blue-900/10 flex items-center justify-center gap-2"
        >
          <span>Enter Live Environment</span>
          <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
