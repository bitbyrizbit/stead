"use client";
import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import BrandMark from '@/components/BrandMark';

function WaveSVG() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-full" fill="none">
      <line x1="0" y1="90" x2="400" y2="90" stroke="#1a1620" strokeOpacity="0.06" strokeWidth="0.5" strokeDasharray="2 4" />
      <path
        d="M0,90 Q25,60 50,90 T100,90 T150,90 T200,90 T250,90 T300,90 T350,90 T400,90"
        stroke="#4a6438"
        strokeWidth="2"
      />
      <path
        d="M0,90 Q12,30 25,90 T50,90 Q62,150 75,90 T100,90 Q112,40 125,90 T150,90 Q162,140 175,90 T200,90 Q212,35 225,90 T250,90 Q262,145 275,90 T300,90 Q312,42 325,90 T350,90 Q362,135 375,90 T400,90"
        stroke="#e8542b"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

function MagneticSVG() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-full" fill="none">
      <motion.circle cx="200" cy="90" r="12" fill="#f6eed9" fillOpacity="0.9" stroke="#f6eed9" strokeWidth="1.5" animate={{ r: [12, 15, 12] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
      <circle cx="200" cy="90" r="5" fill="#f6eed9" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 200 + Math.cos(rad) * 70;
        const y2 = 90 + Math.sin(rad) * 70;
        return (
          <motion.line
            key={i}
            x1={x2}
            y1={y2}
            x2="200"
            y2="90"
            stroke="#f6eed9"
            strokeOpacity="0.34"
            strokeWidth="1.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: i * 0.08, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.5 }}
          />
        );
      })}
      <motion.circle
        cx="200" cy="90" r="40"
        stroke="#e8542b"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.1, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 1.5, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
        style={{ transformOrigin: '200px 90px' }}
      />
      <motion.circle
        cx="200" cy="90" r="65"
        stroke="#e8542b"
        strokeOpacity="0.32"
        strokeWidth="1"
        strokeDasharray="3 3"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.1, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
        style={{ transformOrigin: '200px 90px' }}
      />
    </svg>
  );
}

function TelemetrySVG() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-full" fill="none">
      <motion.rect
        x="120" y="40" width="160" height="100" rx="4"
        stroke="#f6eed9"
        strokeWidth="1.2"
        initial={{ pathLength: 0, opacity: 0.7 }}
        animate={{ pathLength: [0, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ pathLength: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }, opacity: { duration: 2, repeat: Infinity } }}
      />
      <text x="200" y="95" textAnchor="middle" fontSize="11" fill="#f6eed9" fillOpacity="0.5" fontFamily="Fraunces, serif" letterSpacing="1">
        stays on your screen
      </text>
      <motion.path
        d="M280,90 Q320,90 320,130 Q320,150 280,150 L140,150 Q120,150 120,130 Q120,90 140,90"
        stroke="#c99a3a"
        strokeWidth="1.2"
        strokeOpacity="0.6"
        strokeDasharray="3 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1], strokeDashoffset: [0, -24] }}
        transition={{ pathLength: { duration: 2, delay: 0.3, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.5 }, strokeDashoffset: { duration: 2, repeat: Infinity, ease: 'linear' } }}
        style={{ strokeDashoffset: 0 }}
      />
      <line x1="50" y1="90" x2="120" y2="90" stroke="#f6eed9" strokeOpacity="0.35" strokeWidth="1.2" />
      <motion.circle cx="50" cy="90" r="4" fill="#f6eed9" fillOpacity="0.6" animate={{ r: [4, 6, 4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
      <line x1="50" y1="40" x2="50" y2="140" stroke="#f6eed9" strokeOpacity="0.12" strokeWidth="0.5" strokeDasharray="2 3" />
      <text x="50" y="160" textAnchor="middle" fontSize="9" fill="#f6eed9" fillOpacity="0.4" fontFamily="Fraunces, serif" letterSpacing="1">
        you
      </text>
      <text x="200" y="160" textAnchor="middle" fontSize="9" fill="#f6eed9" fillOpacity="0.4" fontFamily="Fraunces, serif" letterSpacing="1">
        nothing leaves
      </text>
    </svg>
  );
}

const cards: { num: string; title: string; body: ReactNode; metric: string; label: string; visual: ReactNode; bg: string; border: string; fg: string; accent: string }[] = [
  {
    num: 'i',
    title: 'It hears the wobble',
    body: <>Your hand has a natural rhythm to its shake, somewhere between four and twelve times a second. <BrandMark size="inline" /> tunes in to that rhythm and smooths it out, so the cursor flows instead of stutters. You feel the difference the moment it kicks in. You never feel it working.</>,
    metric: '4 to 12 Hz',
    label: 'natural tremor range',
    visual: <WaveSVG />,
    bg: 'bg-cream',
    border: 'border-ink/20',
    fg: 'text-ink',
    accent: 'text-moss',
  },
  {
    num: 'ii',
    title: 'It lends a gentle hand',
    body: <>When your cursor drifts close to something clickable, <BrandMark size="inline" variant="dark" /> gives it a tiny, invisible nudge toward the center. The kind of help that feels like luck, not correction. Fiddly little targets become effortless, and you stop holding your breath every time you need to hit something small.</>,
    metric: '60px',
    label: 'gentle reach',
    visual: <MagneticSVG />,
    bg: 'bg-ink',
    border: 'border-cream/10',
    fg: 'text-cream',
    accent: 'text-ember-soft',
  },
  {
    num: 'iii',
    title: 'It keeps everything to itself',
    body: <>Everything <BrandMark size="inline" variant="dark" /> does, it does right there on your screen. Nothing about your hand, your cursor, or your clicks ever leaves your device. It is a tiny, quiet companion that asks for nothing and talks to no one. Free, transparent, and honest down to the last line.</>,
    metric: '14KB',
    label: 'small enough to trust',
    visual: <TelemetrySVG />,
    bg: 'bg-moss',
    border: 'border-cream/15',
    fg: 'text-cream',
    accent: 'text-gold-soft',
  },
];

function StackingCard({
  card,
  index,
  total,
  scrollYProgress,
}: {
  card: typeof cards[0];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const segmentStart = index / total;
  const segmentEnd = (index + 1) / total;

  const y = useTransform(scrollYProgress, [segmentStart, segmentEnd], ['100vh', '0vh']);

  const coverStart = segmentEnd;
  const coverEnd = Math.min(coverStart + 1 / total, 1);
  const scale = useTransform(scrollYProgress, [coverStart, coverEnd], [1, 0.94]);
  const dim = useTransform(scrollYProgress, [coverStart, coverEnd], [1, 0.5]);

  return (
    <motion.div
      style={{
        y: index === 0 ? undefined : y,
        scale: index === total - 1 ? 1 : scale,
        opacity: index === total - 1 ? 1 : dim,
        zIndex: index,
      }}
      className={`absolute inset-0 flex items-center justify-center ${card.bg}`}
    >
      <div className={`w-full max-w-[900px] mx-auto rounded-xl border-2 ${card.border} grain p-8 lg:p-12 shadow-retro`}>
        <div className="flex items-start justify-between mb-6">
          <span className={`font-serif text-5xl italic ${card.fg} opacity-30`}>{card.num}</span>
          <div className="text-right">
            <div className={`font-serif text-2xl ${card.accent} tnum tracking-tighter`}>{card.metric}</div>
            <div className={`text-[11px] ${card.fg} opacity-50 mt-0.5 tracking-widest font-mono`}>{card.label}</div>
          </div>
        </div>

        <div className="h-[180px] mb-6">
          {card.visual}
        </div>

        <h3 className={`font-serif text-2xl lg:text-3xl ${card.fg} tracking-tight mb-3`}>
          {card.title}
        </h3>
        <p className={`${card.fg} opacity-60 text-sm lg:text-base leading-relaxed max-w-lg`}>
          {card.body}
        </p>
      </div>
    </motion.div>
  );
}

export default function Technology() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section ref={ref} id="technology" className="relative bg-cream-dim" style={{ height: `${cards.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-10 pb-8 z-50 pointer-events-none">
          <div className="flex items-center gap-2">
            {cards.map((_, i) => {
              const start = i / cards.length;
              const end = (i + 1) / cards.length;
              return (
                <div key={i} className="flex-1 h-px bg-ink/10 relative overflow-hidden">
                  <CardProgress scrollYProgress={scrollYProgress} start={start} end={end} />
                </div>
              );
            })}
          </div>
        </div>

        {cards.map((card, i) => (
          <StackingCard
            key={i}
            card={card}
            index={i}
            total={cards.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

function CardProgress({
  scrollYProgress,
  start,
  end,
}: {
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const width = useTransform(scrollYProgress, [start, end], ['0%', '100%']);
  return (
    <motion.div className="absolute top-0 left-0 h-full bg-ember" style={{ width }} />
  );
}
