"use client";
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Cursor() {
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const stableX = useSpring(rawX, { stiffness: 140, damping: 22, mass: 0.45 });
  const stableY = useSpring(rawY, { stiffness: 140, damping: 22, mass: 0.45 });

  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let phase = 0;

    const onMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);
      phase += 0.12;
      const amp = hovering ? 0.2 : 1.0;
      const tx = Math.sin(phase * 3.7) * amp + Math.sin(phase * 11.3) * amp * 0.4;
      const ty = Math.cos(phase * 4.1) * amp + Math.cos(phase * 9.7) * amp * 0.4;
      rawX.set(e.clientX + tx);
      rawY.set(e.clientY + ty);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovering(!!t.closest('a, button, [data-cursor="hover"], input'));
    };

    const onLeaveWindow = () => {
      setVisible(false);
    };

    const onEnterWindow = () => {
      setVisible(true);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeaveWindow);
    document.addEventListener('mouseenter', onEnterWindow);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeaveWindow);
      document.removeEventListener('mouseenter', onEnterWindow);
    };
  }, [rawX, rawY, visible, hovering]);

  if (!visible) return null;

  return (
    <>
      {/* Raw Tremor Ring */}
      <motion.div className="fixed top-0 left-0 z-[9999] pointer-events-none" style={{ x: rawX, y: rawY }}>
        <motion.div
          className="rounded-full border border-ember"
          animate={{
            width: hovering ? 44 : 22,
            height: hovering ? 44 : 22,
            opacity: visible ? 0.75 : 0,
          }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          style={{ x: '-50%', y: '-50%' }}
        />
      </motion.div>

      {/* Stabilized Cursor Core */}
      <motion.div className="fixed top-0 left-0 z-[9999] pointer-events-none" style={{ x: stableX, y: stableY }}>
        <motion.div
          className="rounded-full bg-ink"
          animate={{
            width: hovering ? 7 : 5,
            height: hovering ? 7 : 5,
            opacity: visible ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{ x: '-50%', y: '-50%' }}
        />
      </motion.div>
    </>
  );
}
