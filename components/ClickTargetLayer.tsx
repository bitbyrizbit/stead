/**
 * ClickTargetLayer — Real DOM button overlay for Phase 3.
 *
 * Why real DOM instead of canvas rects?
 *   - getBoundingClientRect() works on them, so predictTarget can use their
 *     actual on-screen positions without manual coordinate bookkeeping.
 *   - click() dispatch works natively on them.
 *   - Visual feedback (flash on hit) just works via CSS/state.
 *
 * The buttons sit in an absolutely-positioned overlay above the canvas,
 * using the same layout constants as Phase 2's canvas drawing.
 * They are pointer-events:none by default — the ComparisonCanvas intercepts
 * pointerup and dispatches the corrected click programmatically.
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

const TARGET_W = 110; // px — keep in sync with ComparisonCanvas constants
const TARGET_H = 44;
const TARGET_GAP = 20;
const TARGET_Y_OFFSET = 80; // from bottom

export interface ClickTargetLayerHandle {
  /** Returns all button bounding rects — called by ComparisonCanvas on pointerup. */
  getRects(): DOMRect[];
  /** Programmatically trigger a click on button at index i. */
  click(index: number): void;
}

interface ClickTargetLayerProps {
  /** Index of the "active" target (highlighted) — used in accuracy test mode. */
  activeTarget?: number | null;
  /** Called when a button is clicked (either raw or predicted). */
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
      // Flash feedback
      setFlashIndex(index);
      setTimeout(() => setFlashIndex(null), 300);
      onHit?.(TARGET_LABELS[index], true);
    },
  }));

  const totalW =
    TARGET_LABELS.length * TARGET_W + (TARGET_LABELS.length - 1) * TARGET_GAP;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
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
              "flex items-center justify-center text-xs font-body-sm font-medium rounded-md border transition-all duration-150 shadow-sm",
              "text-zinc-700 border-zinc-300 bg-white",
              activeTarget === i
                ? "ring-2 ring-blue-500 border-blue-500 text-blue-700 bg-blue-50"
                : "",
              flashIndex === i
                ? "bg-emerald-100 border-emerald-500 text-emerald-700 scale-95 ring-2 ring-emerald-500"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              width: TARGET_W,
              height: TARGET_H,
              marginRight: i < TARGET_LABELS.length - 1 ? TARGET_GAP : 0,
              pointerEvents: "none", // ComparisonCanvas owns all pointer events
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
