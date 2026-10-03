"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import BrandMark from '@/components/BrandMark';
import { sfx } from '@/lib/soundEffects';

export default function SplitLensDemo() {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setSliderPos(pct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
    sfx.playClick(900);
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };
    const onPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        sfx.playClick(650);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <section className="relative py-28 lg:py-36 px-6 lg:px-10 bg-cream-warm grain overflow-hidden">
      <div className="max-w-[1300px] mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-12 gap-6 mb-12 items-end">
          <div className="col-span-12 lg:col-span-7">
            <span className="font-sans text-xs text-ember uppercase tracking-[0.14em] font-semibold">
              Interactive Precision Lens
            </span>
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-tighter text-ink mt-2">
              Drag the lens.
              <br />
              <span className="italic text-ember">See the tremor disappear.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <p className="text-base text-ink-soft leading-relaxed font-sans">
              Drag the central divider to inspect the raw biological noise on the left against the mathematically filtered trajectory on the right.
            </p>
          </div>
        </div>

        {/* Draggable Split Lens Arena */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          className="relative w-full h-[460px] rounded-3xl border-2 border-ink/20 bg-cream-paper overflow-hidden shadow-retro select-none cursor-ew-resize"
          data-cursor="hover"
        >
          {/* Base Layer: Unassisted (Left Context) */}
          <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between bg-[#ece3cf] scanlines">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-full bg-ember/15 border border-ember/30 text-ember font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                Unassisted · 6.5 Hz Tremor
              </span>
              <span className="font-sans text-xs text-ink-muted uppercase tracking-[0.14em] font-medium">68% Hit Accuracy</span>
            </div>

            <div className="max-w-xl my-auto space-y-5">
              <p className="font-serif text-2xl lg:text-4xl text-ink/80 tracking-tight leading-snug">
                Clicking small buttons shouldn&apos;t feel like defusing a bomb.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="px-5 py-2.5 rounded-xl border-2 border-ember/60 bg-ember/10 text-ember font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
                  Unsteady Target (Miss Risk)
                </div>
                <span className="font-sans text-xs text-ink-muted font-medium uppercase tracking-wider">±18.4px Jitter Noise</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-sans text-ink-muted uppercase tracking-wider font-medium">
              <span>● Rapid overshoot</span>
              <span>● Muscle fatigue</span>
              <span>● Accidental misclicks</span>
            </div>
          </div>

          {/* Clipped Layer: With STEAD (Right Context) */}
          <div
            className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between bg-[#fbf7ee] overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          >
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-full bg-moss/15 border border-moss/40 text-moss font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                With <BrandMark size="inline" /> · 0.4ms Damped
              </span>
              <span className="font-sans text-xs text-moss font-bold uppercase tracking-[0.14em]">99.4% Precision</span>
            </div>

            <div className="max-w-xl my-auto space-y-5">
              <p className="font-serif text-2xl lg:text-4xl text-ink tracking-tight leading-snug">
                Clicking small buttons shouldn&apos;t feel like defusing a bomb.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="px-5 py-2.5 rounded-xl bg-moss text-cream-paper font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cream-paper" />
                  Gravitational Lock Active
                </div>
                <span className="font-sans text-xs text-moss font-bold uppercase tracking-wider">±0.2px Drift · Steady</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-sans text-moss uppercase tracking-wider font-semibold">
              <span>✓ Zero latency drag</span>
              <span>✓ Magnetic button pull</span>
              <span>✓ 100% on-device</span>
            </div>
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-ink z-30 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Center Drag Pill Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-ink text-cream-paper border-2 border-cream-paper flex items-center justify-center shadow-lg font-bold text-sm">
              ↔
            </div>
          </div>

          {/* Bottom helper pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-4 py-1.5 rounded-full bg-ink/85 backdrop-blur-md text-cream text-[11px] font-sans tracking-wider uppercase font-medium">
            Drag divider to compare
          </div>
        </div>
      </div>
    </section>
  );
}
