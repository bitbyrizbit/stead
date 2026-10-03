"use client";

import type { PresetKey } from "@/lib/sensitivityPresets";
import type { SPIResult } from "@/lib/steadPrecisionIndex";
import { Activity } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { sfx } from "@/lib/soundEffects";

interface SPIResultsScreenProps {
  presetKey: PresetKey;
  spiBeforeSTEAD: SPIResult;
  onContinue: () => void;
}

export function SPIResultsScreen({ presetKey, spiBeforeSTEAD, onContinue }: SPIResultsScreenProps) {
  const hitPct = Math.round(spiBeforeSTEAD.hitRate * 100);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pt-28 pb-10 px-6 bg-cream grain select-none overflow-y-auto">
      <div className="absolute inset-0 retro-grid-lg opacity-30 pointer-events-none" />

      <div className="relative z-40 flex flex-col items-center gap-6 text-center max-w-md w-full px-8 py-10 bg-cream-paper rounded-2xl border-2 border-ink shadow-retro">
        {/* Icon & Title */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-moss/15 border-2 border-moss flex items-center justify-center">
            <Activity className="w-8 h-8 text-moss" />
          </div>
          <div>
            <span className="font-sans text-xs text-moss uppercase tracking-[0.16em] font-bold">
              Analysis Complete
            </span>
            <h2 className="text-3xl text-ink font-serif tracking-tight mt-1 mb-1 font-semibold">
              Motor Baseline
            </h2>
            <p className="text-ink-soft text-sm font-sans">
              Your kinematic deviation has been calculated.
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="w-full grid grid-cols-2 border-y-2 border-ink/10 py-5 my-1 bg-cream-warm/40 rounded-xl">
          <div className="flex flex-col items-center border-r border-ink/10 pr-4">
            <span className="text-[11px] font-sans text-ink-muted uppercase tracking-[0.14em] font-semibold mb-1">
              Raw Accuracy
            </span>
            <span className="text-3xl text-ink font-serif font-bold tnum">
              {hitPct}%
            </span>
          </div>
          <div className="flex flex-col items-center pl-4">
            <span className="text-[11px] font-sans text-ink-muted uppercase tracking-[0.14em] font-semibold mb-1">
              Filter Profile
            </span>
            <span className="text-3xl text-moss font-serif font-bold uppercase tracking-wider">
              {presetKey}
            </span>
          </div>
        </div>

        <p className="text-xs text-ink-muted font-sans leading-relaxed">
          <BrandMark size="inline" /> is now calibrated to your hand rhythm. Step into the live testing arena to feel the stabilization in real time.
        </p>

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => {
            sfx.playClick(1000);
            onContinue();
          }}
          data-cursor="hover"
          className="group relative w-full py-3.5 bg-ink text-cream-paper text-sm font-semibold rounded-xl overflow-hidden shadow-retro-sm"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Enter Live Environment
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
          <span className="absolute inset-0 bg-ember translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
