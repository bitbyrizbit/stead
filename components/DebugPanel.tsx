/**
 * DebugPanel — Live slider controls for tremor simulation and filter params.
 *
 * Wired directly into the parent's useState — every slider drag updates props
 * passed into ComparisonCanvas in real time, no page reload.
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
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-slate-400 font-mono">{label}</span>
        <span className="text-xs text-slate-200 font-mono tabular-nums">
          {value.toFixed(step < 0.01 ? 3 : step < 1 ? 2 : 1)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-slate-700 accent-green-400"
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
  amplitude,
  frequency,
  minCutoff,
  beta,
  onAmplitudeChange,
  onFrequencyChange,
  onMinCutoffChange,
  onBetaChange,
}: DebugPanelProps) {
  return (
    <div className="absolute top-4 right-4 z-20 w-64 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-sm p-4 flex flex-col gap-4 shadow-xl">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Controls
      </p>

      {/* Tremor simulation section */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider">
          Tremor simulation
        </p>
        <Slider
          label="Amplitude"
          value={amplitude}
          min={0}
          max={30}
          step={0.5}
          unit=" px"
          onChange={onAmplitudeChange}
        />
        <Slider
          label="Frequency"
          value={frequency}
          min={1}
          max={12}
          step={0.5}
          unit=" Hz"
          onChange={onFrequencyChange}
        />
      </div>

      <div className="border-t border-slate-700/50" />

      {/* Filter section */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider">
          One Euro Filter
        </p>
        <Slider
          label="minCutoff"
          value={minCutoff}
          min={0.1}
          max={5}
          step={0.1}
          unit=" Hz"
          onChange={onMinCutoffChange}
        />
        <Slider
          label="β (speed coeff)"
          value={beta}
          min={0.0}
          max={0.1}
          step={0.001}
          onChange={onBetaChange}
        />
      </div>

      {/* Zero-amplitude hint */}
      {amplitude === 0 && (
        <p className="text-[11px] text-green-400/80 font-mono">
          ✓ Amplitude = 0 — cursors should converge
        </p>
      )}
    </div>
  );
}
