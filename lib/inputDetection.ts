/**
 * inputDetection.ts
 *
 * Differentiates between mouse, trackpad, and touch input.
 * Trackpads produce a different signal profile (smaller, more frequent movementX/Y deltas)
 * compared to a physical mouse at the same visual cursor speed.
 */

export type InputType = "mouse" | "trackpad" | "touch";

export function detectInputType(event: PointerEvent): InputType {
  // Explicit touch events
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    return "touch";
  }
  
  // Heuristic for trackpad vs mouse:
  // Trackpads generally report smaller sub-pixel or low-integer deltas 
  // more frequently than a physical mouse moving at the same speed.
  // Note: Firefox doesn't always populate movementX/Y on every event perfectly,
  // but for the purposes of tuning the filter, a few frames of heuristic is enough.
  if (Math.abs(event.movementX) > 0 && Math.abs(event.movementX) < 2 && event.movementY !== 0) {
    return "trackpad";
  }
  
  return "mouse";
}
