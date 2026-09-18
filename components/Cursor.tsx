"use client";
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Cursor() {
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const stableX = useSpring(rawX, { stiffness: 130, damping: 20, mass: 0.5 });
  const stableY = useSpring(rawY, { stiffness: 130, damping: 20, mass: 0.5 });

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
      setHovering(!!t.closest('a, button, [data-cursor="hover"]'));
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, [rawX, rawY, visible, hovering]);

  return (
    <>
      <motion.div className="fixed top-0 left-0 z-[9999] pointer-events-none" style={{ x: rawX, y: rawY }}>
        <motion.div
          className="rounded-full border border-copper/50"
          animate={{ width: hovering ? 48 : 24, height: hovering ? 48 : 24, opacity: visible ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          style={{ x: '-50%', y: '-50%' }}
        />
      </motion.div>
      <motion.div className="fixed top-0 left-0 z-[9999] pointer-events-none" style={{ x: stableX, y: stableY }}>
        <motion.div
          className="rounded-full bg-ink"
          animate={{ width: hovering ? 8 : 6, height: hovering ? 8 : 6, opacity: visible ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ x: '-50%', y: '-50%' }}
        />
      </motion.div>
    </>
  );
}

