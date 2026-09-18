"use client";
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const text = `Every hand trembles. It is biology, not a flaw. The question was never whether to fix it, but whether software should listen to it. STEAD does not correct you. It hears the difference between what you reached for and what your hand did, and it chooses the former.`;

  const sentences = text.split('. ');

  return (
    <section ref={ref} id="manifesto" className="relative py-32 lg:py-44 px-6 lg:px-10 bg-bone-warm grain">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center gap-3 mb-12 text-[11px] text-ink-muted">
          <span>02</span>
          <span className="w-8 h-px bg-line" />
          <span>Manifesto</span>
        </div>

        <motion.div style={{ y }}>
          <p className="font-serif text-[clamp(1.5rem,4vw,3.2rem)] leading-[1.18] tracking-tight text-ink">
            {sentences.map((sentence, i) => {
              const isLast = i === sentences.length - 1;
              const isFormer = sentence.includes('the former');
              return (
                <motion.span
                  key={i}
                  className="inline"
                  initial={{ opacity: 0.1 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-12% 0px' }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
                >
                  {isFormer ? (
                    <span className="italic text-copper">{sentence}{isLast ? '.' : '. '}</span>
                  ) : (
                    <>{sentence}{isLast ? '.' : '. '}</>
                  )}
                </motion.span>
              );
            })}
          </p>
        </motion.div>

        <div className="mt-14 flex items-start gap-5">
          <div className="w-10 h-px bg-ink mt-3 shrink-0" />
          <p className="text-sm text-ink-muted max-w-md leading-relaxed">
            STEAD is an accessibility substrate, not a feature. It runs beneath the
            interface, asking nothing of the user and nothing of the network. It
            exists for the 6 million people living with essential tremor, and for
            anyone whose hand has ever missed what their eye aimed for.
          </p>
        </div>
      </div>
    </section>
  );
}
