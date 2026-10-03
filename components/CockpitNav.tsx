"use client";
import { motion } from 'framer-motion';
import BrandMark from '@/components/BrandMark';

type DemoStep = 'calibration' | 'spi-results' | 'demo';

interface CockpitNavProps {
  step: DemoStep;
  onGoHome: () => void;
  onGoCalibration?: () => void;
  onGoDemo?: () => void;
}

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'calibration', label: 'Calibrate' },
  { id: 'results', label: 'Results' },
  { id: 'demo', label: 'Live demo' },
];

export default function CockpitNav({ step, onGoHome, onGoCalibration, onGoDemo }: CockpitNavProps) {
  const activeId =
    step === 'calibration' ? 'calibration'
    : step === 'spi-results' ? 'results'
    : 'demo';

  const handleClick = (id: string) => {
    if (id === 'home') onGoHome();
    else if (id === 'calibration' && onGoCalibration) onGoCalibration();
    else if (id === 'demo' && onGoDemo) onGoDemo();
  };

  return (
    <motion.div
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
    >
      {/* Pill container — inspired by the ss but rephrased for STEAD */}
      <div className="flex items-center gap-1 bg-ink/90 backdrop-blur-md border border-ink/20 rounded-full px-2 py-1.5 shadow-retro-sm">
        {navItems.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              data-cursor="hover"
              className={`relative px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
                isActive
                  ? 'bg-cream-paper text-ink font-semibold'
                  : 'text-cream/50 hover:text-cream/80'
              }`}
            >
              {item.id === 'home' ? <BrandMark size="inline" variant="dark" /> : item.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
