"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  // Letters of STEAD in order
  const letters = ['S', 'T', 'E', 'A', 'D'];

  useEffect(() => {
    // Total writing duration: ~1.4s, then smoothly fade out
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-cream grain select-none pointer-events-auto"
        >
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute inset-0 retro-grid-lg opacity-25 pointer-events-none" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none opacity-[0.08]"
            style={{ background: 'radial-gradient(ellipse, #e8542b 0%, transparent 70%)' }}
          />

          {/* Centered Slanted STEAD Handwriting Container */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Slanted Container from top-left to bottom-right (-4 deg tilt) */}
            <div
              className="flex items-center justify-center tracking-[0.08em] select-none"
              style={{
                transform: 'rotate(-4deg)',
              }}
            >
              {letters.map((char, index) => (
                <motion.span
                  key={index}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    y: -10,
                    filter: 'blur(4px)',
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: 'blur(0px)',
                  }}
                  transition={{
                    duration: 0.38,
                    delay: 0.15 + index * 0.22, // Smooth, human-like cadence letter by letter
                    ease: [0.25, 1, 0.5, 1],
                  }}
                  className="font-serif italic font-extrabold text-ink leading-none text-[clamp(4.5rem,14vw,11rem)] inline-block"
                  style={{
                    textShadow: '3px 4px 0 #e8542b, 0 0 32px rgba(232,84,43,0.22)',
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Subtle Tagline Fade-in after word is written */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.45,
                ease: 'easeOut',
              }}
              className="font-sans text-xs sm:text-sm text-ink-muted uppercase tracking-[0.2em] font-semibold mt-4"
            >
              your intent, not your tremor
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
