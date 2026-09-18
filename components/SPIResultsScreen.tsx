"use client";

import type { PresetKey } from "@/lib/sensitivityPresets";
import type { SPIResult } from "@/lib/steadPrecisionIndex";
import { Activity } from "lucide-react";

interface SPIResultsScreenProps {
  presetKey: PresetKey;
  spiBeforeStead: SPIResult;
  onContinue: () => void;
}

export function SPIResultsScreen({ presetKey, spiBeforeStead, onContinue }: SPIResultsScreenProps) {
  const hitPct = Math.round(spiBeforeStead.hitRate * 100);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-bone selection:bg-sage selection:text-bone cursor-none">
      <div className="flex flex-col items-center gap-8 text-center max-w-sm px-6 bg-bone p-10 rounded-sm border border-line shadow-sm cursor-none">
        
        {/* Icon & Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-sage-pale border border-sage flex items-center justify-center">
            <Activity className="w-8 h-8 text-sage" />
          </div>
          <div>
            <h2 className="text-2xl text-ink font-serif tracking-tighter mb-1">
              Diagnostic Complete
            </h2>
            <p className="text-ink-soft text-sm">
              Your kinematic profile has been analysed.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="w-full flex justify-around border-y border-line py-6 my-2">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-ink-muted  tracking-[0.2em] mb-1">Raw Accuracy</span>
            <span className="text-2xl text-ink font-mono tnum">
              {hitPct}%
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-line pl-8">
            <span className="text-[10px] font-mono text-ink-muted  tracking-[0.2em] mb-1">Profile</span>
            <span className="text-2xl text-sage font-mono tnum">
              {presetKey.toUpperCase()}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="group relative w-full py-3 bg-ink text-bone text-sm font-medium rounded-sm overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Enter Live Environment
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
          <span className="absolute inset-0 bg-sage translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        </button>
      </div>
    </div>
  );
}
