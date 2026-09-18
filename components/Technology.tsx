"use client";
import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

/** SVG illustration for Algorithmic Dampening — a waveform that separates into clean + noise */
function WaveSVG() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-full" fill="none">
      <motion.path
        d="M0,90 Q25,60 50,90 T100,90 T150,90 T200,90 T250,90 T300,90 T350,90 T400,90"
        stroke="#5B6B5A"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      <motion.path
        d="M0,90 Q12,30 25,90 T50,90 Q62,150 75,90 T100,90 Q112,40 125,90 T150,90 Q162,140 175,90 T200,90 Q212,35 225,90 T250,90 Q262,145 275,90 T300,90 Q312,42 325,90 T350,90 Q362,135 375,90 T400,90"
        stroke="#B87333"
        strokeWidth="0.8"
        strokeOpacity="0.4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
      />
      <line x1="0" y1="90" x2="400" y2="90" stroke="#1A1612" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="2 4" />
    </svg>
  );
}

/** SVG for Magnetic Geometry — radial pull lines toward a center node */
function MagneticSVG() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-full" fill="none">
      <circle cx="200" cy="90" r="8" fill="#5B6B5A" fillOpacity="0.2" stroke="#5B6B5A" strokeWidth="1" />
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
            stroke="#1A1612"
            strokeOpacity="0.12"
            strokeWidth="0.8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
          />
        );
      })}
      <motion.circle
        cx="200" cy="90" r="40"
        stroke="#B87333"
        strokeOpacity="0.2"
        strokeWidth="0.8"
        strokeDasharray="3 3"
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ transformOrigin: '200px 90px' }}
      />
      <motion.circle
        cx="200" cy="90" r="65"
        stroke="#B87333"
        strokeOpacity="0.1"
        strokeWidth="0.6"
        strokeDasharray="3 3"
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
        style={{ transformOrigin: '200px 90px' }}
      />
    </svg>
  );
}

/** SVG for Zero Telemetry — a closed loop, nothing leaves */
function TelemetrySVG() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-full" fill="none">
      <motion.rect
        x="120" y="40" width="160" height="100" rx="4"
        stroke="#E8E2D5"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      <text x="200" y="95" textAnchor="middle" fontSize="11" fill="#E8E2D5" fillOpacity="0.4" fontFamily="Inter">
        local Â· wasm
      </text>
      <motion.path
        d="M280,90 Q320,90 320,130 Q320,150 280,150 L140,150 Q120,150 120,130 Q120,90 140,90"
        stroke="#C89055"
        strokeWidth="0.8"
        strokeOpacity="0.4"
        strokeDasharray="3 3"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />
      <line x1="50" y1="90" x2="120" y2="90" stroke="#E8E2D5" strokeOpacity="0.2" strokeWidth="0.8" />
      <circle cx="50" cy="90" r="3" fill="#E8E2D5" fillOpacity="0.4" />
      <line x1="50" y1="40" x2="50" y2="140" stroke="#E8E2D5" strokeOpacity="0.1" strokeWidth="0.5" strokeDasharray="2 3" />
      <text x="50" y="160" textAnchor="middle" fontSize="9" fill="#E8E2D5" fillOpacity="0.35" fontFamily="Inter">
        input
      </text>
      <text x="200" y="160" textAnchor="middle" fontSize="9" fill="#E8E2D5" fillOpacity="0.35" fontFamily="Inter">
        nothing leaves
      </text>
    </svg>
  );
}

const cards = [
  {
    num: 'i',
    title: 'Algorithmic dampening',
    body: 'Continuous real-time Fourier analysis identifies high-frequency cyclic tremors in the 4–12 Hz band. The kernel subtracts these oscillations from the pointer stream without introducing perceptible lag — a critically damped second-order system running at native refresh.',
    metric: '4–12 Hz',
    label: 'tremor band',
    visual: <WaveSVG />,
    bg: 'bg-bone',
    border: 'border-line/50',
    fg: 'text-ink',
    accent: 'text-sage',
  },
  {
    num: 'ii',
    title: 'Magnetic geometry',
    body: 'Interactive nodes exert a radial gravitational pull on the stabilized cursor. As the pointer enters a node\'s influence radius, it is drawn organically toward the center — transforming strenuous fine-clicks into effortless gestures. The pull curve is configurable per element.',
    metric: '60px',
    label: 'influence radius',
    visual: <MagneticSVG />,
    bg: 'bg-ink',
    border: 'border-bone/10',
    fg: 'text-bone',
    accent: 'text-copper-soft',
  },
  {
    num: 'iii',
    title: 'Zero telemetry',
    body: 'All kinematic processing happens locally in real-time. No coordinate data ever leaves the device. The kernel is a single 14KB WASM module that runs in a Web Worker, isolated from the main thread. Auditable and mathematically guaranteed.',
    metric: '14KB',
    label: 'wasm module',
    visual: <TelemetrySVG />,
    bg: 'bg-sage',
    border: 'border-bone/15',
    fg: 'text-bone',
    accent: 'text-copper-pale',
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
  // Each card enters during its own segment of the scroll
  // Card 0 is always visible (starts at y=0)
  // Card i enters from below (y = 100vh) to y = 0 during segment [i/total, (i+1)/total]
  const segmentStart = index / total;
  const segmentEnd = (index + 1) / total;

  // Card slides up from below to cover the previous card
  const y = useTransform(
    scrollYProgress,
    [segmentStart, segmentEnd],
    ['100vh', '0vh']
  );

  // Previous card scales down and dims as the next card covers it
  // This applies to the CURRENT card when the NEXT card starts covering it
  const coverStart = segmentEnd;
  const coverEnd = Math.min(coverStart + 1 / total, 1);
  const scale = useTransform(
    scrollYProgress,
    [coverStart, coverEnd],
    [1, 0.94]
  );
  const dim = useTransform(
    scrollYProgress,
    [coverStart, coverEnd],
    [1, 0.5]
  );

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
      <div className={`w-full max-w-[900px] mx-auto rounded-sm border ${card.border} grain p-8 lg:p-12`}>
        <div className="flex items-start justify-between mb-6">
          <span className={`font-serif text-5xl italic ${card.fg} opacity-30`}>{card.num}</span>
          <div className="text-right">
            <div className={`font-serif text-2xl ${card.accent} tnum tracking-tighter`}>{card.metric}</div>
            <div className={`text-[11px] ${card.fg} opacity-40 mt-0.5`}>{card.label}</div>
          </div>
        </div>

        <div className="h-[140px] mb-6">
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
    <section ref={ref} id="technology" className="relative bg-bone-dim" style={{ height: `${cards.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Section label */}
        <div className="absolute top-0 left-0 right-0 px-6 lg:px-10 pt-12 z-50 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 text-[11px] text-ink-muted">
            <span>03</span>
            <span className="w-8 h-px bg-line" />
            <span>The substrate</span>
          </div>
          <div className="text-[11px] text-ink-muted">scroll to stack</div>
        </div>

        {/* Progress indicator */}
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
    <motion.div className="absolute top-0 left-0 h-full bg-copper" style={{ width }} />
  );
}

