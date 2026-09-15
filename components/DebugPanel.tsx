/**
 * DebugPanel — polished version.
 * Same logic, refined layout — header row with icon, cleaner section labels.
 */

"use client";

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
        <span className="text-[11px] text-zinc-500 font-body-sm font-medium">{label}</span>
        <span className="text-[11px] text-zinc-900 font-body-sm font-semibold tabular-nums">
          {value.toFixed(decimals)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        aria-label={label}
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
    <div className="absolute top-6 right-6 z-20 w-64 rounded-xl bg-white border border-zinc-200 p-5 flex flex-col gap-5 shadow-lg shadow-zinc-200/50">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
        <span className="text-[10px] font-semibold text-zinc-900 font-label-editorial uppercase tracking-widest">
          Laboratory Controls
        </span>
        <div className="w-2 h-2 rounded-full bg-blue-600 animate-gentle" />
      </div>

      {/* Tremor simulation */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-caption">
          Tremor Generation Profile
        </p>
        <Slider label="Amplitude" value={amplitude} min={0} max={30} step={0.5} unit=" px" onChange={onAmplitudeChange} />
        <Slider label="Frequency" value={frequency} min={1} max={12} step={0.5} unit=" Hz" onChange={onFrequencyChange} />
      </div>

      <div className="border-t border-zinc-100" />

      {/* Filter */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-caption">
          Algorithmic Dampener
        </p>
        <Slider label="minCutoff" value={minCutoff} min={0.1} max={5} step={0.1} unit=" Hz" onChange={onMinCutoffChange} />
        <Slider label="I (speed)" value={beta} min={0.0} max={0.1} step={0.001} onChange={onBetaChange} />
      </div>

      {amplitude === 0 && (
        <p className="text-[10px] text-emerald-600 font-caption pt-2">
          o" Zero amplitude state detected
        </p>
      )}
    </div>
  );
}
