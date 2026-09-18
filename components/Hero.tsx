"use client";
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

function DemoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const targets: { x: number; y: number; r: number; hit: boolean; pulse: number }[] = [];
    const spawn = () => {
      targets.length = 0;
      const positions = [
        { x: 0.2, y: 0.25 }, { x: 0.5, y: 0.15 }, { x: 0.8, y: 0.3 },
        { x: 0.15, y: 0.65 }, { x: 0.45, y: 0.55 }, { x: 0.75, y: 0.7 },
        { x: 0.35, y: 0.82 }, { x: 0.65, y: 0.4 },
      ];
      for (const p of positions) {
        targets.push({ x: p.x * w, y: p.y * h, r: 12, hit: false, pulse: 0 });
      }
      setTotal(positions.length);
      setHitCount(0);
    };
    spawn();

    let rawX = w / 2, rawY = h / 2;
    let stableX = w / 2, stableY = h / 2;
    let phase = 0, inside = false;
    const rawTrail: { x: number; y: number; age: number }[] = [];
    const stableTrail: { x: number; y: number; age: number }[] = [];

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      rawX = e.clientX - rect.left; rawY = e.clientY - rect.top;
      inside = true;
    };
    const onEnter = () => { setActive(true); inside = true; };
    const onLeave = () => { setActive(false); inside = false; };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);

    let rafId = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      phase += dt * 7;

      const amp = 2.8;
      const tremX = rawX + Math.sin(phase * 3.3) * amp + Math.sin(phase * 11.1) * amp * 0.35;
      const tremY = rawY + Math.cos(phase * 3.9) * amp + Math.cos(phase * 9.5) * amp * 0.35;

      const follow = 7;
      stableX += (tremX - stableX) * Math.min(follow * dt, 1);
      stableY += (tremY - stableY) * Math.min(follow * dt, 1);

      if (inside) {
        let nearest: typeof targets[0] | null = null;
        let nearestDist = Infinity;
        for (const t of targets) {
          if (t.hit) continue;
          const d = Math.hypot(t.x - stableX, t.y - stableY);
          if (d < nearestDist) { nearestDist = d; nearest = t; }
        }
        if (nearest && nearestDist < 65) {
          const pull = (1 - nearestDist / 65) * 0.14;
          stableX += (nearest.x - stableX) * pull;
          stableY += (nearest.y - stableY) * pull;
          if (nearestDist < nearest.r + 6) {
            nearest.hit = true; nearest.pulse = 1;
            setHitCount((c) => c + 1);
          }
        }
      }

      if (inside) {
        rawTrail.push({ x: tremX, y: tremY, age: 0 });
        stableTrail.push({ x: stableX, y: stableY, age: 0 });
      }
      rawTrail.forEach((p) => (p.age += dt));
      stableTrail.forEach((p) => (p.age += dt));
      while (rawTrail.length > 0 && rawTrail[0].age > 0.45) rawTrail.shift();
      while (stableTrail.length > 0 && stableTrail[0].age > 0.45) stableTrail.shift();

      if (targets.every((t) => t.hit)) setTimeout(spawn, 600);

      ctx.clearRect(0, 0, w, h);

      for (const t of targets) {
        if (t.pulse > 0) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r + t.pulse * 28, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(91, 107, 90, ${t.pulse * 0.35})`;
          ctx.lineWidth = 1; ctx.stroke();
          t.pulse -= dt * 1.5;
        }
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        if (t.hit) {
          ctx.fillStyle = 'rgba(91, 107, 90, 0.12)'; ctx.fill();
          ctx.strokeStyle = 'rgba(91, 107, 90, 0.35)';
          ctx.beginPath();
          ctx.moveTo(t.x - 4, t.y); ctx.lineTo(t.x - 1, t.y + 3); ctx.lineTo(t.x + 5, t.y - 4);
          ctx.strokeStyle = '#5B6B5A'; ctx.lineWidth = 1.5; ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(26, 22, 18, 0.03)'; ctx.fill();
          ctx.strokeStyle = 'rgba(26, 22, 18, 0.12)'; ctx.lineWidth = 1; ctx.stroke();
        }
      }

      if (rawTrail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(rawTrail[0].x, rawTrail[0].y);
        for (let i = 1; i < rawTrail.length; i++) ctx.lineTo(rawTrail[i].x, rawTrail[i].y);
        ctx.strokeStyle = 'rgba(184, 115, 51, 0.25)'; ctx.lineWidth = 1; ctx.stroke();
      }
      if (stableTrail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(stableTrail[0].x, stableTrail[0].y);
        for (let i = 1; i < stableTrail.length; i++) ctx.lineTo(stableTrail[i].x, stableTrail[i].y);
        ctx.strokeStyle = 'rgba(91, 107, 90, 0.45)'; ctx.lineWidth = 1.5; ctx.stroke();
      }

      if (inside) {
        ctx.beginPath(); ctx.arc(tremX, tremY, 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(184, 115, 51, 0.45)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(stableX, stableY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#1A1612'; ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[clamp(380px,52vh,520px)] rounded-sm border border-line bg-bone-warm overflow-hidden"
      data-cursor="hover"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute top-4 left-4 flex items-center gap-2 text-[11px] text-ink-muted">
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-sage' : 'bg-ink-muted/40'} ${active ? 'animate-pulse' : ''}`} />
        {active ? 'Live · stabilizing' : 'Hover to activate'}
      </div>
      <div className="absolute top-4 right-4 text-[11px] text-ink-muted tnum">
        {hitCount}/{total} nodes reached
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-px bg-copper" /> Raw signal</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-px bg-sage" /> Stabilized</span>
      </div>
    </div>
  );
}

export default function Hero({ onStart }: { onStart?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen pt-28 pb-16 px-6 lg:px-10">
      <motion.div style={{ y, opacity }} className="max-w-[1300px] mx-auto">


        {/* Headline + demo interwoven */}
        <div className="mb-12">
          <h1 className="font-serif text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.92] tracking-tighter text-ink">
            Your intent,
            <br />
            not your{' '}
            <span className="italic font-light text-copper">tremor.</span>
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 lg:col-span-8">
            <DemoCanvas />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col justify-between gap-6">
            <p className="text-base lg:text-lg leading-relaxed text-ink-soft">
              An invisible mathematical substrate that filters biological
              oscillation, so the cursor moves where you mean it to, not where
              your hand sends it.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={onStart}
                className="group relative px-6 py-3 bg-ink text-bone text-sm rounded-sm overflow-hidden"
                data-cursor="hover"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Calibrate Profile
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </span>
                <span className="absolute inset-0 bg-copper translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
              </button>
              <a
                href="#technology"
                className="text-sm text-ink-soft underline decoration-line decoration-1 underline-offset-4 hover:decoration-copper transition-colors"
                data-cursor="hover"
              >
                How it works
              </a>
            </div>
          </div>
        </div>

        {/* Stats as a flowing prose line, not cards */}
        <div className="border-t border-line pt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3 text-sm text-ink-muted">
          <span className="text-ink">
            <span className="font-serif text-lg text-ink tnum">0.4ms</span> median latency
          </span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span className="text-ink">
            <span className="font-serif text-lg text-ink tnum">94.2%</span> tremor rejected
          </span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span className="text-ink">
            <span className="font-serif text-lg text-ink">Zero</span> telemetry, ever
          </span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span className="text-ink">
            <span className="font-serif text-lg text-ink tnum">14KB</span> gzipped
          </span>
        </div>
      </motion.div>
    </section>
  );
}

