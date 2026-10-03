"use client";
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BrandMark from '@/components/BrandMark';

function DemoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

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

    type Target = { x: number; y: number; r: number; progress: number; done: boolean; pulse: number };
    const targets: Target[] = [];
    let currentIdx = 0;
    let roundStart = 0;

    const spawnRound = () => {
      targets.length = 0;
      currentIdx = 0;
      roundStart = performance.now();
      const padding = 55;
      const usableW = w - padding * 2;
      const usableH = h - padding * 2;
      const positions = [
        { fx: 0.18, fy: 0.28 },
        { fx: 0.5, fy: 0.18 },
        { fx: 0.82, fy: 0.32 },
        { fx: 0.28, fy: 0.72 },
        { fx: 0.72, fy: 0.68 },
        { fx: 0.5, fy: 0.88 },
      ];
      for (const p of positions) {
        targets.push({
          x: padding + p.fx * usableW,
          y: padding + p.fy * usableH,
          r: 24,
          progress: 0,
          done: false,
          pulse: 0,
        });
      }
      setTotal(targets.length);
      setScore(0);
    };
    spawnRound();

    let rawX = w / 2, rawY = h / 2;
    let stableX = w / 2, stableY = h / 2;
    let phase = 0, inside = false;
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

      const amp = 3.5;
      const tremX = rawX + Math.sin(phase * 3.3) * amp + Math.sin(phase * 11.1) * amp * 0.35;
      const tremY = rawY + Math.cos(phase * 3.9) * amp + Math.cos(phase * 9.5) * amp * 0.35;

      const follow = 7;
      stableX += (tremX - stableX) * Math.min(follow * dt, 1);
      stableY += (tremY - stableY) * Math.min(follow * dt, 1);

      if (inside && currentIdx < targets.length) {
        const t = targets[currentIdx];
        const d = Math.hypot(t.x - stableX, t.y - stableY);
        if (d < 80) {
          const pull = (1 - d / 80) * 0.12;
          stableX += (t.x - stableX) * pull;
          stableY += (t.y - stableY) * pull;
        }
        if (d < t.r) {
          t.progress = Math.min(t.progress + dt * 1.8, 1);
          if (t.progress >= 1 && !t.done) {
            t.done = true;
            t.pulse = 1;
            setScore((s) => s + 1);
            currentIdx++;
            if (currentIdx >= targets.length) {
              const elapsed = (performance.now() - roundStart) / 1000;
              setBestTime((prev) => (prev === null ? elapsed : Math.min(prev, elapsed)));
              setTimeout(spawnRound, 900);
            }
          }
        } else if (t.progress > 0 && !t.done) {
          t.progress = Math.max(t.progress - dt * 0.8, 0);
        }
      }

      if (inside) {
        stableTrail.push({ x: stableX, y: stableY, age: 0 });
      }
      stableTrail.forEach((p) => (p.age += dt));
      while (stableTrail.length > 0 && stableTrail[0].age > 0.4) stableTrail.shift();

      ctx.clearRect(0, 0, w, h);

      // Guide lines
      if (targets.length > 1) {
        ctx.beginPath();
        ctx.moveTo(targets[0].x, targets[0].y);
        for (let i = 1; i < targets.length; i++) {
          ctx.lineTo(targets[i].x, targets[i].y);
        }
        ctx.strokeStyle = 'rgba(26,22,32,0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];

        if (t.pulse > 0) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r + t.pulse * 30, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(74,100,56,${t.pulse * 0.5})`;
          ctx.lineWidth = 2; ctx.stroke();
          t.pulse -= dt * 1.5;
        }

        if (t.done) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(74,100,56,0.15)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(74,100,56,0.45)';
          ctx.lineWidth = 1.5; ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(t.x - 8, t.y);
          ctx.lineTo(t.x - 2, t.y + 6);
          ctx.lineTo(t.x + 10, t.y - 8);
          ctx.strokeStyle = '#4a6438';
          ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
        } else if (i === currentIdx) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(232,84,43,0.07)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(26,22,32,0.2)';
          ctx.lineWidth = 1.5; ctx.stroke();

          if (t.progress > 0) {
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.r - 3, -Math.PI / 2, -Math.PI / 2 + t.progress * Math.PI * 2);
            ctx.strokeStyle = '#e8542b';
            ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#e8542b'; ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(26,22,32,0.08)';
          ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath();
          ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(26,22,32,0.1)'; ctx.fill();
        }
      }

      // Stabilized trail
      if (stableTrail.length > 1) {
        for (let i = 1; i < stableTrail.length; i++) {
          ctx.beginPath();
          ctx.moveTo(stableTrail[i - 1].x, stableTrail[i - 1].y);
          ctx.lineTo(stableTrail[i].x, stableTrail[i].y);
          const alpha = (1 - stableTrail[i].age / 0.4) * 0.4;
          ctx.strokeStyle = `rgba(74,100,56,${alpha})`;
          ctx.lineWidth = 2; ctx.stroke();
        }
      }

      if (inside) {
        ctx.beginPath(); ctx.arc(tremX, tremY, 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(232,84,43,0.4)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(stableX, stableY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#e8542b'; ctx.fill();
        ctx.beginPath(); ctx.arc(stableX, stableY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f6eed9'; ctx.fill();
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
    <div className="relative w-full max-w-[480px] mx-auto lg:mx-0">
      {/* CRT bezel frame */}
      <div className="relative rounded-2xl border-2 border-ink bg-ink p-2 shadow-retro-lg">
        {/* Top status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ember" />
            <span className="font-mono text-[9px] text-cream/60 tracking-wider">
              <BrandMark size="inline" variant="dark" /> · your intent, not your tremor
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] text-cream/40 tracking-wider">
            <span>your cursor</span>
            <span className="text-ember">{active ? '● steadying' : '○ waiting'}</span>
          </div>
        </div>

        {/* Screen */}
        <div
          ref={containerRef}
          className="relative w-full aspect-square rounded-lg bg-cream-warm overflow-hidden scanlines-strong"
          data-cursor="hover"
        >
          <canvas ref={canvasRef} className="absolute inset-0" />
          <div className="absolute top-4 left-4 flex items-center gap-2 text-[11px] text-ink-muted tracking-[0.08em]">
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-moss' : 'bg-ink-muted/40'} ${active ? 'animate-pulse' : ''}`} />
            {active ? 'hold steady inside each ring' : 'move around and watch'}
          </div>
          <div className="absolute top-4 right-4 text-[11px] text-ink-muted tnum tracking-[0.08em] font-mono">
            {score}/{total} steady
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[11px] text-ink-muted tracking-[0.08em]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-px bg-ember" /> shaky hand</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-px bg-moss" /> with <BrandMark size="inline" /></span>
          </div>
          {bestTime !== null && (
            <div className="absolute bottom-4 right-4 text-[11px] text-moss tnum tracking-[0.08em] font-mono">
              best: {bestTime.toFixed(1)}s
            </div>
          )}
        </div>

        {/* Bottom info bar */}
        <div className="flex items-center justify-between px-3 py-1.5 mt-1">
          <span className="font-mono text-[9px] text-cream/40 tracking-wider">Your cursor, made steadier</span>
          <span className="font-mono text-[9px] text-cream/40 tracking-wider">14KB · no data leaves your screen</span>
        </div>
      </div>
    </div>
  );
}

function SignalTicker() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const data = [
    { label: 'Tremor', value: '4–12 Hz', status: 'noticed' },
    { label: 'Damping', value: '0.4ms', status: 'working' },
    { label: 'Magnetic reach', value: '60px', status: 'ready' },
    { label: 'Privacy', value: '100%', status: 'on your device' },
  ];
  const current = data[tick % data.length];

  return (
    <div className="mt-6 flex items-center gap-3 font-mono text-[11px] tracking-wider">
      <span className="text-ember">{'>'}</span>
      <span className="text-ink-muted">{current.label}</span>
      <span className="text-ink tnum font-semibold">{current.value}</span>
      <span className="flex items-center gap-1.5 text-moss">
        <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
        {current.status}
      </span>
      <span className="text-ink-muted/30 animate-blink">_</span>
    </div>
  );
}

interface HeroProps {
  onStart?: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen pt-28 pb-16 px-6 lg:px-10 overflow-hidden">
      <div className="absolute inset-0 retro-grid-lg opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none opacity-[0.06]" style={{ background: 'radial-gradient(circle at 70% 30%, #e8542b 0%, transparent 55%)' }} />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none opacity-[0.04]" style={{ background: 'radial-gradient(circle at 30% 70%, #4a6438 0%, transparent 55%)' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] pointer-events-none opacity-[0.015] retro-grid rounded-full" />

      <motion.div className="absolute top-[20%] right-[8%] w-24 h-24 rounded-full border-2 border-ember/15 pointer-events-none" animate={{ y: [0, -20, 0], rotate: [0, 90, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[15%] left-[5%] w-16 h-16 pointer-events-none" animate={{ y: [0, 25, 0], rotate: [0, -180, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="w-full h-full border-2 border-moss/15 rotate-45" />
      </motion.div>
      <motion.div className="absolute top-[60%] right-[15%] w-3 h-3 rounded-full bg-gold/20 pointer-events-none" animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute top-[35%] left-[12%] w-2 h-2 rounded-full bg-ember/25 pointer-events-none" animate={{ y: [0, 20, 0], opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

      <svg className="absolute top-[12%] left-[40%] pointer-events-none opacity-[0.08]" width="60" height="60" viewBox="0 0 60 60" fill="none">
        <motion.path d="M30 5 L55 52 L5 52 Z" stroke="#e8542b" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }} />
      </svg>
      <svg className="absolute bottom-[25%] right-[30%] pointer-events-none opacity-[0.06]" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <motion.circle cx="20" cy="20" r="15" stroke="#4a6438" strokeWidth="1.5" strokeDasharray="4 4" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '20px 20px' }} />
      </svg>

      <motion.div style={{ y, opacity }} className="max-w-[1300px] mx-auto">
        <div className="mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.92] tracking-tighter text-ink"
          >
            Your intent,
            <br />
            <span className="inline-block pl-[1.5em]">not your{' '}<span className="italic font-light text-ember">tremor.</span></span>
          </motion.h1>
        </div>

        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 lg:col-span-7">
            <DemoCanvas />
            <SignalTicker />
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-between gap-6 lg:pt-8">
            <p className="font-serif text-lg lg:text-xl leading-[1.4] tracking-tight text-ink-soft">
              <BrandMark size="inline" /> hears the difference between what you reached for and what your hand actually did. Then it quietly chooses the first one. Your cursor goes where you meant it to, not where your fingers sent it.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onStart}
                className="group relative px-6 py-3 bg-ink text-cream-paper text-sm rounded-lg overflow-hidden shadow-retro-sm"
                data-cursor="hover"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Bring <BrandMark size="inline" variant="dark" /> home
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </span>
                <span className="absolute inset-0 bg-ember translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <a
                href="#technology"
                className="text-sm text-ink-soft underline decoration-line decoration-1 underline-offset-4 hover:decoration-ember transition-colors"
                data-cursor="hover"
              >
                What it actually does
              </a>
            </div>

            {/* Mini spec badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-ink/10">
              {[
                { k: '0.4ms', v: 'to respond' },
                { k: '94%', v: 'wobble removed' },
                { k: '14KB', v: 'to install' },
                { k: '0', v: 'data sent' },
              ].map((s) => (
                <div key={s.v} className="flex items-baseline gap-2">
                  <span className="font-serif text-xl text-ink tnum">{s.k}</span>
                  <span className="font-mono text-[10px] text-ink-muted tracking-wider">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
