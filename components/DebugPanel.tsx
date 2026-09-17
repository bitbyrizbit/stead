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
        <span className="text-[11px] font-mono text-ink-muted uppercase tracking-widest">{label}</span>
        <span className="text-[11px] text-ink font-mono tnum">
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
        className="w-full accent-teal"
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
    <div className="absolute top-6 right-6 z-20 w-64 rounded-sm bg-paper-warm border border-line p-5 flex flex-col gap-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-2">
        <span className="text-[10px] font-mono font-medium text-ink uppercase tracking-[0.2em]">
          Laboratory Controls
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
      </div>

      {/* Tremor simulation */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-teal font-mono uppercase tracking-[0.15em] font-medium">
          Tremor Generation
        </p>
        <Slider label="Amplitude" value={amplitude} min={0} max={30} step={0.5} unit=" px" onChange={onAmplitudeChange} />
        <Slider label="Frequency" value={frequency} min={1} max={12} step={0.5} unit=" Hz" onChange={onFrequencyChange} />
      </div>

      <div className="border-t border-line-soft" />

      {/* Filter */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-amber-soft font-mono uppercase tracking-[0.15em] font-medium">
          Algorithmic Dampener
        </p>
        <Slider label="minCutoff" value={minCutoff} min={0.1} max={5} step={0.1} unit=" Hz" onChange={onMinCutoffChange} />
        <Slider label="β (speed)" value={beta} min={0.0} max={0.1} step={0.001} onChange={onBetaChange} />
      </div>

      {amplitude === 0 && (
        <p className="text-[10px] text-teal pt-2 font-mono uppercase tracking-[0.1em]">
          ✓ Zero amplitude state detected
        </p>
      )}
    </div>
  );
}
