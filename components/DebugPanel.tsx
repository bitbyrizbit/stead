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
        <span className="text-[11px] text-slate-400 font-mono">{label}</span>
        <span className="text-[11px] text-slate-200 font-mono tabular-nums">
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
    <div className="absolute top-4 right-4 z-20 w-60 rounded-xl bg-slate-900/95 border border-slate-800 backdrop-blur-sm p-4 flex flex-col gap-4 shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Controls
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
      </div>

      {/* Tremor simulation */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-mono">
          Tremor simulation
        </p>
        <Slider label="Amplitude" value={amplitude} min={0} max={30} step={0.5} unit=" px" onChange={onAmplitudeChange} />
        <Slider label="Frequency" value={frequency} min={1} max={12} step={0.5} unit=" Hz" onChange={onFrequencyChange} />
      </div>

      <div className="border-t border-slate-800" />

      {/* Filter */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-mono">
          One Euro Filter
        </p>
        <Slider label="minCutoff" value={minCutoff} min={0.1} max={5} step={0.1} unit=" Hz" onChange={onMinCutoffChange} />
        <Slider label="β (speed)" value={beta} min={0.0} max={0.1} step={0.001} onChange={onBetaChange} />
      </div>

      {amplitude === 0 && (
        <p className="text-[10px] text-green-500/80 font-mono border-t border-slate-800 pt-2">
          ✓ Amplitude 0 — cursors converge
        </p>
      )}
    </div>
  );
}
