/**
 * ClickTargetLayer — Real DOM button overlay for Phase 3.
 * Styled with cream/paper/ink retro palette.
 */

"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export const TARGET_LABELS = [
  "Send Email",
  "Pay Bill",
  "Sign In",
  "Submit Form",
  "Download",
];

const TARGET_W = 120;
const TARGET_H = 46;
const TARGET_GAP = 18;
const TARGET_Y_OFFSET = 80;

export interface ClickTargetLayerHandle {
  getRects(): DOMRect[];
  click(index: number): void;
}

interface ClickTargetLayerProps {
  activeTarget?: number | null;
  onHit?: (label: string, byPredictor: boolean) => void;
}

export const ClickTargetLayer = forwardRef<
  ClickTargetLayerHandle,
  ClickTargetLayerProps
>(function ClickTargetLayer({ activeTarget = null, onHit }, ref) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    getRects() {
      return buttonRefs.current.map(
        (el) => el?.getBoundingClientRect() ?? new DOMRect()
      );
    },
    click(index: number) {
      const el = buttonRefs.current[index];
      if (!el) return;
      setFlashIndex(index);
      setTimeout(() => setFlashIndex(null), 300);
      onHit?.(TARGET_LABELS[index], true);
    },
  }));

  const totalW =
    TARGET_LABELS.length * TARGET_W + (TARGET_LABELS.length - 1) * TARGET_GAP;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      aria-hidden="true"
    >
      {/* Button row — centred horizontally, anchored from bottom */}
      <div
        className="absolute flex gap-0"
        style={{
          bottom: TARGET_Y_OFFSET,
          left: "50%",
          transform: "translateX(-50%)",
          width: totalW,
        }}
      >
        {TARGET_LABELS.map((label, i) => (
          <button
            key={label}
            ref={(el) => { buttonRefs.current[i] = el; }}
            tabIndex={-1}
            className={[
              "flex items-center justify-center text-xs font-sans tracking-wider uppercase font-bold rounded-xl border-2 transition-all duration-150",
              "text-ink border-ink/20 bg-cream-paper shadow-retro-sm",
              activeTarget === i
                ? "border-ember bg-ember/15 text-ember ring-2 ring-ember/40 scale-105"
                : "",
              flashIndex === i
                ? "bg-moss border-moss text-cream-paper scale-95 ring-2 ring-moss shadow-lg"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              width: TARGET_W,
              height: TARGET_H,
              marginRight: i < TARGET_LABELS.length - 1 ? TARGET_GAP : 0,
              pointerEvents: "none",
              cursor: "none",
            }}
            onClick={() => onHit?.(label, false)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});
