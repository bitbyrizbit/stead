"use client";
import { useEffect, useRef, useState } from 'react';

function PlaygroundCanvas({
  amplitude,
  damping,
  magnetic,
}: {
  amplitude: number;
  damping: number;
  magnetic: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const initTargets = () => {
      targets.length = 0;
      const cols = 6, rows = 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          targets.push({
            x: (w / (cols + 1)) * (c + 1),
            y: (h / (rows + 1)) * (r + 1),
            r: 8, hit: false, pulse: 0,
          });
        }
      }
    };
    initTargets();

    let rawX = w / 2, rawY = h / 2;
    let stableX = w / 2, stableY = h / 2;
    let phase = 0, inside = false;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      rawX = e.clientX - rect.left; rawY = e.clientY - rect.top;
      inside = true;
    };
    const onLeave = () => { inside = false; };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    let rafId = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      phase += dt * 7;

      const amp = amplitude;
      const tremX = rawX + Math.sin(phase * 3.3) * amp + Math.sin(phase * 11.1) * amp * 0.35;
      const tremY = rawY + Math.cos(phase * 3.9) * amp + Math.cos(phase * 9.5) * amp * 0.35;

      const follow = damping;
      stableX += (tremX - stableX) * Math.min(follow * dt, 1);
      stableY += (tremY - stableY) * Math.min(follow * dt, 1);

      if (inside && magnetic) {
        for (const t of targets) {
          if (t.hit) continue;
          const d = Math.hypot(t.x - stableX, t.y - stableY);
          if (d < 45) {
            const pull = (1 - d / 45) * 0.1;
            stableX += (t.x - stableX) * pull;
            stableY += (t.y - stableY) * pull;
            if (d < t.r + 3) { t.hit = true; t.pulse = 1; }
          }
        }
      }

      if (targets.every((t) => t.hit)) setTimeout(initTargets, 500);

      ctx.clearRect(0, 0, w, h);

      for (const t of targets) {
        if (t.pulse > 0) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r + t.pulse * 20, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(184, 115, 51, ${t.pulse * 0.4})`;
          ctx.lineWidth = 1; ctx.stroke();
          t.pulse -= dt * 1.5;
        }
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        if (t.hit) {
          ctx.fillStyle = 'rgba(184, 115, 51, 0.1)'; ctx.fill();
          ctx.strokeStyle = 'rgba(184, 115, 51, 0.3)';
        } else {
          ctx.fillStyle = 'rgba(232, 226, 213, 0.02)'; ctx.fill();
          ctx.strokeStyle = 'rgba(232, 226, 213, 0.1)';
        }
        ctx.lineWidth = 1; ctx.stroke();
      }

      if (inside) {
        ctx.beginPath(); ctx.arc(tremX, tremY, 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(184, 115, 51, 0.35)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(stableX, stableY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#E8E2D5'; ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId);
    };
  }, [amplitude, damping, magnetic]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[clamp(320px,48vh,460px)] rounded-sm border border-bone/10 bg-ink overflow-hidden"
      data-cursor="hover"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute top-4 left-4 text-[11px] text-bone/40">
        Playground Â· 6Ã—4 grid
      </div>
    </div>
  );
}

export default function Playground() {
  const [amplitude, setAmplitude] = useState(3);
  const [damping, setDamping] = useState(7);
  const [magnetic, setMagnetic] = useState(true);

  return (
    <section id="playground" className="relative py-28 lg:py-36 px-6 lg:px-10 bg-ink grain">
      <div className="max-w-[1300px] mx-auto">
        <div className="flex items-center gap-3 mb-10 text-[11px] text-bone/40">
          <span>04</span>
          <span className="w-8 h-px bg-bone/20" />
          <span>Playground</span>
        </div>

        <div className="mb-10">
          <h2 className="font-serif text-[clamp(1.8rem,5vw,3.5rem)] leading-[1.05] tracking-tighter text-bone max-w-[700px]">
            Feel the{' '}
            <span className="italic text-copper-soft">difference</span>
            {' '}before you install.
          </h2>
        </div>

        <PlaygroundCanvas amplitude={amplitude} damping={damping} magnetic={magnetic} />

        <div className="mt-8 flex flex-wrap items-center gap-x-12 gap-y-6">
          <div className="flex items-center gap-4">
            <label className="text-[11px] text-bone/40">Tremor amplitude</label>
            <input
              type="range" min="0" max="10" step="0.5" value={amplitude}
              onChange={(e) => setAmplitude(parseFloat(e.target.value))}
              className="w-28 accent-copper"
              data-cursor="hover"
            />
            <span className="text-[11px] text-bone/60 tnum w-8">{amplitude.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-[11px] text-bone/40">Dampening</label>
            <input
              type="range" min="2" max="20" step="0.5" value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-28 accent-copper"
              data-cursor="hover"
            />
            <span className="text-[11px] text-bone/60 tnum w-8">{damping.toFixed(1)}</span>
          </div>

          <button
            onClick={() => setMagnetic(!magnetic)}
            className="flex items-center gap-3"
            data-cursor="hover"
          >
            <span className="text-[11px] text-bone/40">Magnetic pull</span>
            <span className={`w-9 h-5 rounded-full relative transition-colors ${magnetic ? 'bg-copper' : 'bg-bone/15'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-bone transition-transform ${magnetic ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
          </button>
        </div>

        <p className="mt-6 text-sm text-bone/40 max-w-md leading-relaxed">
          Adjust the tremor amplitude to simulate different severities. Toggle
          magnetic pull to feel the gravitational snap toward targets.
        </p>
      </div>
    </section>
  );
}

