/**
 * DebugPanel — polished laboratory controls with retro styling.
 */

"use client";

import { sfx } from "@/lib/soundEffects";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, unit = "", onChange }: SliderProps) {
  const decimals = step < 0.01 ? 3 : step < 1 ? 2 : 1;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-sans text-ink-muted uppercase tracking-[0.12em] font-medium">{label}</span>
        <span className="text-xs text-ink font-sans font-bold tnum">
          {value.toFixed(decimals)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange(val);
          sfx.playClick(700 + val * 20);
        }}
        className="w-full accent-ember"
        aria-label={label}
        data-cursor="hover"
      />
    </div>
  );
}

export interface DebugPanelProps {
  amplitude: number;
  frequency: number;
  minCutoff: number;
  beta: number;
  onAmplitudeChange: (v: number) => void;
  onFrequencyChange: (v: number) => void;
  onMinCutoffChange: (v: number) => void;
  onBetaChange: (v: number) => void;
}

export function DebugPanel({
  amplitude, frequency, minCutoff, beta,
  onAmplitudeChange, onFrequencyChange, onMinCutoffChange, onBetaChange,
}: DebugPanelProps) {
  return (
    <div className="absolute top-24 right-8 z-[80] w-64 rounded-2xl bg-cream-paper/95 border-2 border-ink/20 p-5 flex flex-col gap-5 shadow-retro-sm backdrop-blur-sm pointer-events-auto">

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-ink/10 pb-2">
        <span className="text-[11px] font-sans font-bold text-ink uppercase tracking-[0.16em]">
          Laboratory Controls
        </span>
        <div className="w-2 h-2 rounded-full bg-moss animate-pulse" />
      </div>

      {/* Tremor simulation */}
      <div className="flex flex-col gap-3">
        <p className="text-xs text-ember font-sans uppercase tracking-[0.14em] font-bold">
          Tremor Generator
        </p>
        <Slider label="Amplitude" value={amplitude} min={0} max={30} step={0.5} unit=" px" onChange={onAmplitudeChange} />
        <Slider label="Frequency" value={frequency} min={1} max={12} step={0.5} unit=" Hz" onChange={onFrequencyChange} />
      </div>

      <div className="border-t border-ink/10" />

      {/* Filter */}
      <div className="flex flex-col gap-3">
        <p className="text-xs text-moss font-sans uppercase tracking-[0.14em] font-bold">
          One Euro Dampener
        </p>
        <Slider label="minCutoff" value={minCutoff} min={0.1} max={5} step={0.1} unit=" Hz" onChange={onMinCutoffChange} />
        <Slider label="β (speed)" value={beta} min={0.0} max={0.1} step={0.001} onChange={onBetaChange} />
      </div>
    </div>
  );
}
