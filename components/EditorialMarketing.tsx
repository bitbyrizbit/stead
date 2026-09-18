"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SmoothScroll from "./SmoothScroll";
import Manifesto from "./Manifesto";
import Technology from "./Technology";
import Extension from "./Extension";
import Footer from "./Footer";

interface ModernMarketingProps {
  onStart: () => void;
}

export function EditorialMarketing({ onStart }: ModernMarketingProps) {
  const [navSolid, setNavSolid] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: containerRef });
  
  useEffect(() => {
    return scrollY.on("change", (v) => {
      setNavSolid(v > 40);
    });
  }, [scrollY]);

  // Canvas Logic for playground
  const arenaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [targetCount, setTargetCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const arena = arenaRef.current;
    const canvas = canvasRef.current;
    if (!arena || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = arena.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const targets: any[] = [];
    const spawnTargets = () => {
      targets.length = 0;
      const tCount = 5;
      for (let i = 0; i < tCount; i++) {
        targets.push({
          x: 60 + Math.random() * (width - 120),
          y: 60 + Math.random() * (height - 120),
          r: 14,
          hit: false,
          pulse: 0
        });
      }
      setTargetCount(tCount);
      setHitCount(0);
    };
    spawnTargets();

    let mouseX = width / 2;
    let mouseY = height / 2;
    let dampX = width / 2;
    let dampY = height / 2;
    let time = 0;
    let isActive = false;

    const rawHistory: any[] = [];
    const dampHistory: any[] = [];

    const onMove = (e: MouseEvent) => {
      const rect = arena.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isActive = true;
    };
    const onEnter = () => { setHovering(true); isActive = true; };
    const onLeave = () => { setHovering(false); isActive = false; };

    arena.addEventListener("mousemove", onMove);
    arena.addEventListener("mouseenter", onEnter);
    arena.addEventListener("mouseleave", onLeave);

    let rafId = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      time += dt * 8;

      const noiseScale = 2.8;
      const rawX = mouseX + Math.sin(time * 3.3) * noiseScale + Math.sin(time * 11.1) * noiseScale * 0.35;
      const rawY = mouseY + Math.cos(time * 3.9) * noiseScale + Math.cos(time * 9.5) * noiseScale * 0.35;
      
      const speed = 8;
      dampX += (rawX - dampX) * Math.min(speed * dt, 1);
      dampY += (rawY - dampY) * Math.min(speed * dt, 1);

      if (isActive) {
        let bestTarget = null;
        let bestDist = Infinity;
        for (const t of targets) {
          if (t.hit) continue;
          const dist = Math.hypot(t.x - dampX, t.y - dampY);
          if (dist < bestDist) {
            bestDist = dist;
            bestTarget = t;
          }
        }
        if (bestTarget && bestDist < 60) {
          const strength = (1 - bestDist / 60) * 0.15;
          dampX += (bestTarget.x - dampX) * strength;
          dampY += (bestTarget.y - dampY) * strength;
          if (bestDist < bestTarget.r + 6) {
            bestTarget.hit = true;
            bestTarget.pulse = 1;
            setHitCount(prev => prev + 1);
          }
        }
      }

      if (isActive) {
        rawHistory.push({ x: rawX, y: rawY, age: 0 });
        dampHistory.push({ x: dampX, y: dampY, age: 0 });
      }

      rawHistory.forEach(p => p.age += dt);
      dampHistory.forEach(p => p.age += dt);

      while (rawHistory.length > 0 && rawHistory[0].age > 0.5) rawHistory.shift();
      while (dampHistory.length > 0 && dampHistory[0].age > 0.5) dampHistory.shift();

      ctx.clearRect(0, 0, width, height);

      for (const t of targets) {
        if (t.pulse > 0) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r + t.pulse * 30, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(31, 93, 90, ${t.pulse * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          t.pulse -= dt * 1.5;
        }

        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        if (t.hit) {
          ctx.fillStyle = "rgba(31, 93, 90, 0.15)";
          ctx.fill();
          ctx.strokeStyle = "rgba(31, 93, 90, 0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(t.x - 5, t.y);
          ctx.lineTo(t.x - 1, t.y + 4);
          ctx.lineTo(t.x + 5, t.y - 4);
          ctx.strokeStyle = "#1F5D5A";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(20, 17, 15, 0.04)";
          ctx.fill();
          ctx.strokeStyle = "rgba(20, 17, 15, 0.15)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if (rawHistory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(rawHistory[0].x, rawHistory[0].y);
        for (let i = 1; i < rawHistory.length; i++) ctx.lineTo(rawHistory[i].x, rawHistory[i].y);
        ctx.strokeStyle = "rgba(184, 133, 74, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (dampHistory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(dampHistory[0].x, dampHistory[0].y);
        for (let i = 1; i < dampHistory.length; i++) ctx.lineTo(dampHistory[i].x, dampHistory[i].y);
        ctx.strokeStyle = "rgba(31, 93, 90, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (isActive) {
        ctx.beginPath();
        ctx.arc(rawX, rawY, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(184, 133, 74, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(dampX, dampY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#14110F";
        ctx.fill();
      }

      if (targets.every(t => t.hit)) {
        setTimeout(spawnTargets, 600);
      }

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      arena.removeEventListener("mousemove", onMove);
      arena.removeEventListener("mouseenter", onEnter);
      arena.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -10;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    setTiltStyle({ rotateX, rotateY });
  };
  const handleTiltLeave = () => {
    setTiltStyle({ rotateX: 0, rotateY: 0 });
  };

  return (
    <SmoothScroll>
      <div ref={containerRef} className="bg-bone text-ink min-h-screen font-sans selection:bg-sage selection:text-bone cursor-none">
      <div className="noise-overlay"></div>
      
      {/* Custom Global Cursor (Simplified fallback to normal cursor rules for now) */}

      {/* Nav */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${navSolid ? "bg-bone/80 backdrop-blur-md border-b border-line" : "bg-transparent"}`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-tighter text-ink font-medium">STEAD</span>
            <span className="text-[9px] font-mono  tracking-[0.2em] text-ink-muted hidden sm:inline">/ accessibility substrate</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-ink-soft">
            <a href="#playground" className="hover:text-sage transition-colors">Playground</a>
            <a href="#technology" className="hover:text-sage transition-colors">Technology</a>
            <a href="/docs" className="hover:text-sage transition-colors">Docs</a>
          </div>
          <button onClick={onStart} className="group relative px-4 py-2 bg-ink text-bone text-xs font-medium rounded-sm overflow-hidden">
            <span className="relative z-10">Get STEAD</span>
            <span className="absolute inset-0 bg-sage translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          </button>
        </div>
      </motion.nav>

      <main className="flex-grow w-full relative z-10">
        
        {/* Hero */}
        <section ref={heroRef} className="relative min-h-screen pt-32 pb-20 px-6 lg:px-12 flex flex-col justify-center">
          <motion.div style={{ y, opacity, scale }} className="max-w-[1400px] mx-auto w-full">
            <div className="flex items-center justify-between mb-16 lg:mb-24">
              <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.2em] text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-sage animate-pulse"></span>
                STEAD
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-16">
              <div className="col-span-12 lg:col-span-8">
                <h1 className="font-serif text-[clamp(2.8rem,8vw,7.5rem)] leading-[0.95] tracking-tighter text-ink">
                  Your intent,<br />not your <span className="italic font-light text-sage">tremor.</span>
                </h1>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:pt-4 flex flex-col justify-end">
                <p className="text-base lg:text-lg leading-relaxed text-ink-soft max-w-sm">
                  An invisible mathematical substrate that filters biological oscillation — so the cursor moves where you mean it to, not where your hand sends it.
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <button onClick={onStart} className="group relative px-6 py-3 bg-ink text-bone text-sm font-medium rounded-sm overflow-hidden shadow-2xl hover:shadow-sage/20 transition-shadow">
                    <span className="relative z-10 flex items-center gap-2">
                      Calibrate Profile
                      <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                    <span className="absolute inset-0 bg-sage translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Removed Marquee for cleaner UI */}

        <Manifesto />
        <Technology />

        {/* Playground */}
        <section id="playground" className="w-full px-6 lg:px-12 py-24 max-w-[1400px] mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4 flex flex-col gap-12">
              <h2 className="font-serif text-4xl tracking-tighter text-ink">The Engine</h2>
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-sm font-mono tracking-wider text-sage mb-3">01. Algorithmic Dampening</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Continuous real-time Fourier analysis identifies high-frequency cyclic tremors, cleanly subtracting them without adding perceived mouse lag.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-mono tracking-wider text-copper-soft mb-3">02. Magnetic Geometry</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Interactive nodes organically pull the cursor toward their gravitational centers, transforming strenuous fine clicks into effortless actions.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-8 perspective-[1500px]">
              <motion.div 
                className="relative transform-style-3d shadow-2xl"
                animate={{ rotateX: tiltStyle.rotateX, rotateY: tiltStyle.rotateY }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
                onMouseMove={handleTilt}
                onMouseLeave={handleTiltLeave}
              >
                <div ref={arenaRef} className="relative w-full h-[420px] rounded-sm border border-line bg-bone-warm overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                  <canvas ref={canvasRef} className="absolute inset-0"></canvas>
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-ink-muted">
                    <span className={`w-1.5 h-1.5 rounded-full ${hovering ? 'bg-sage animate-pulse' : 'bg-ink-muted/40'}`}></span>
                    {hovering ? 'Active' : 'Standby'}
                  </div>
                  
                  <div className="absolute top-4 right-4 text-[10px] font-mono tracking-[0.2em] text-ink-muted tnum">
                    {hitCount}/{targetCount} targets
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] font-mono tracking-[0.15em] text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-px bg-copper"></span> Unassisted
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-px bg-sage"></span> Corrected
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

          <Extension />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
