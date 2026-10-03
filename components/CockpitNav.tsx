"use client";
import { motion } from 'framer-motion';
import { sfx } from '@/lib/soundEffects';

type DemoStep = 'landing' | 'calibration' | 'spi-results' | 'demo';

interface CockpitNavProps {
  step: DemoStep;
  onGoHome: () => void;
  onGoCalibration: () => void;
  onGoResults: () => void;
  onGoDemo: () => void;
}

const navItems = [
  { id: 'home', label: 'STEAD' },
  { id: 'calibration', label: 'Calibrate' },
  { id: 'spi-results', label: 'Results' },
  { id: 'demo', label: 'Live demo' },
];

export default function CockpitNav({
  step,
  onGoHome,
  onGoCalibration,
  onGoResults,
  onGoDemo,
}: CockpitNavProps) {
  const handleClick = (id: string) => {
    sfx.playClick(900);
    if (id === 'home') onGoHome();
    else if (id === 'calibration') onGoCalibration();
    else if (id === 'spi-results') onGoResults();
    else if (id === 'demo') onGoDemo();
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
    >
      {/* Console Pill Capsule */}
      <nav className="flex items-center gap-1.5 bg-[#1a1620]/95 backdrop-blur-md border-2 border-[#1a1620] rounded-full p-1.5 shadow-retro-sm">
        {navItems.map((item) => {
          const isActive = item.id === step;
          const isHome = item.id === 'home';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              data-cursor="hover"
              className={`relative px-4 py-1.5 rounded-full text-xs font-sans tracking-wider uppercase font-semibold transition-all duration-200 select-none ${
                isActive
                  ? 'bg-cream-paper text-ink shadow-sm'
                  : 'text-cream/60 hover:text-cream hover:bg-cream/10'
              }`}
            >
              {isHome ? (
                <span className="font-serif italic font-extrabold tracking-widest text-ember text-sm">
                  STEAD
                </span>
              ) : (
                item.label
              )}
            </button>
          );
        })}
      </nav>
    </motion.header>
  );
}
