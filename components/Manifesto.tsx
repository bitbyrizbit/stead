"use client";
import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BrandMark from '@/components/BrandMark';

type Sentence = { node: ReactNode; highlight?: boolean };

const sentences: Sentence[] = [
  { node: 'Every hand shakes a little.' },
  { node: 'That is not a defect, it is just what hands do.' },
  { node: 'The question was never whether to fix it, but whether the things we build should be more forgiving of it.' },
  { node: <><BrandMark size="inline" /> does not correct you.</> },
  { node: 'It simply listens for the difference between what you reached for and what your fingers did,' },
  { node: <>and it gently chooses <span className="italic text-ember">the first one.</span></>, highlight: true },
];

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={ref} id="manifesto" className="relative py-32 lg:py-44 px-6 lg:px-10 bg-cream-warm grain overflow-hidden">
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full border-2 border-ember/20 pointer-events-none hidden lg:block" />
      <div className="absolute bottom-20 left-10 w-20 h-20 rounded-full border-2 border-moss/20 pointer-events-none hidden lg:block" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      <div className="w-full max-w-[900px] min-w-0 mx-auto overflow-hidden">
        <motion.div style={{ y }} className="min-w-0 max-w-full">
          <p className="font-serif text-[clamp(1.5rem,4vw,3.2rem)] leading-[1.18] tracking-tight text-ink break-words [overflow-wrap:anywhere]">
            {sentences.map((s, i) => (
              <motion.span
                key={i}
                className="inline break-words"
                initial={{ opacity: 0.1 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-12% 0px' }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
              >
                {s.node}{i < sentences.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </p>
        </motion.div>

        <div className="mt-14 flex items-start gap-5">
          <div className="w-10 h-px bg-ember/40 mt-3 shrink-0" />
          <p className="text-sm text-ink-muted max-w-md leading-relaxed">
            <BrandMark size="inline" /> is an accessibility companion, not a feature. It runs quietly beneath everything you do, asking nothing of you and nothing of your internet connection. It exists for the millions of people living with an unsteady hand, and for anyone whose finger has ever missed what their eye was aiming at.
          </p>
        </div>
      </div>
    </section>
  );
}
