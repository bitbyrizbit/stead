"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  // Letters of STEAD in order
  const letters = ['S', 'T', 'E', 'A', 'D'];

  useEffect(() => {
    // Total writing duration: ~1.4s, then smoothly trigger exit
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center bg-cream grain select-none overflow-hidden"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
        >
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute inset-0 retro-grid-lg opacity-25 pointer-events-none" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none opacity-[0.12]"
            style={{ background: 'radial-gradient(ellipse, #e8542b 0%, transparent 65%)' }}
          />

          {/* Centered Slanted Handwriting STEAD */}
          <div className="relative z-10 flex flex-col items-center justify-center -mt-4">
            {/* Slanted Container from top-left to bottom-right (-4 deg tilt) */}
            <div
              className="flex items-center justify-center tracking-[0.06em] select-none"
              style={{
                transform: 'rotate(-4deg)',
              }}
            >
              {letters.map((char, index) => (
                <motion.span
                  key={index}
                  initial={{
                    opacity: 0,
                    scale: 0.85,
                    y: -12,
                    filter: 'blur(4px)',
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: 'blur(0px)',
                  }}
                  transition={{
                    duration: 0.35,
                    delay: 0.2 + index * 0.22,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                  className="font-serif italic font-extrabold text-ink leading-none text-[clamp(5.5rem,16vw,13rem)] inline-block"
                  style={{
                    textShadow: '3.5px 4.5px 0 #e8542b, 0 0 36px rgba(232,84,43,0.25)',
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Subtitle smoothly reveals after word */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.45,
                ease: 'easeOut',
              }}
              className="font-sans text-xs sm:text-sm text-ink-muted uppercase tracking-[0.22em] font-semibold mt-6"
            >
              your intent, not your tremor
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
