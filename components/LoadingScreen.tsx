"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import BrandMark from '@/components/BrandMark';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 800);
    }, 1400);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-cream grain"
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <BrandMark size="hero" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs font-sans tracking-[0.2em] text-ink-muted uppercase font-medium mt-2"
        >
          your intent, not your tremor
        </motion.div>
      </div>
    </motion.div>
  );
}
