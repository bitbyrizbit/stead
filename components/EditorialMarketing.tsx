"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Activity, Crosshair, Cpu, CheckCircle, ShieldCheck } from "lucide-react";

interface ModernMarketingProps {
  onStart: () => void;
}

export function EditorialMarketing({ onStart }: ModernMarketingProps) {
  const [currentMode, setCurrentMode] = useState<"raw" | "damped">("damped");
  const [hitList, setHitList] = useState<Set<number>>(new Set());
  
  // Slider state
  const [tremorFreq, setTremorFreq] = useState(4.8);
  const [inertiaVal, setInertiaVal] = useState(0.74);
  const [magnetRadius, setMagnetRadius] = useState(28);

  const arenaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rawCursorRef = useRef<HTMLDivElement>(null);
  const dampedCursorRef = useRef<HTMLDivElement>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const simState = useRef({
    mousePos: { x: -100, y: -100 },
    rawPos: { x: -100, y: -100 },
    dampedPos: { x: -100, y: -100 },
    history: [] as { rawX: number; rawY: number; dampedX: number; dampedY: number; life: number }[],
    time: 0
  });

  const totalTargets = 6;

  const hitTarget = (id: number) => {
    setHitList(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const resetTargets = () => {
    setHitList(new Set());
    simState.current.history = [];
  };

  // Canvas resize and render loop
  useEffect(() => {
    const arena = arenaRef.current;
    const canvas = canvasRef.current;
    if (!arena || !canvas) return;

    const resize = () => {
      canvas.width = arena.clientWidth;
      canvas.height = arena.clientHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;

    const getMagneticOffset = (x: number, y: number) => {
      if (currentMode === "raw") return { x, y };
      const targets = arena.querySelectorAll(".target-node");
      const rect = arena.getBoundingClientRect();

      for (let t of Array.from(targets)) {
        const tRect = t.getBoundingClientRect();
        const centerX = (tRect.left - rect.left) + tRect.width / 2;
        const centerY = (tRect.top - rect.top) + tRect.height / 2;
        const dist = Math.hypot(centerX - x, centerY - y);

        if (dist < magnetRadius) {
          const strength = (1 - dist / magnetRadius) * 0.45;
          return {
            x: x + (centerX - x) * strength,
            y: y + (centerY - y) * strength
          };
        }
      }
      return { x, y };
    };

    const renderLoop = () => {
      const state = simState.current;
      state.time += 0.05;

      if (state.mousePos.x > 0 && state.mousePos.y > 0) {
        // High frequency biological jitter
        const jitterIntensity = 7.5;
        const jitterX = Math.sin(state.time * tremorFreq * 2.2) * jitterIntensity + Math.cos(state.time * tremorFreq * 4.1) * (jitterIntensity * 0.45);
        const jitterY = Math.cos(state.time * tremorFreq * 2.5) * jitterIntensity + Math.sin(state.time * tremorFreq * 3.7) * (jitterIntensity * 0.45);

        state.rawPos.x = state.mousePos.x + jitterX;
        state.rawPos.y = state.mousePos.y + jitterY;

        const targetDamped = getMagneticOffset(state.mousePos.x, state.mousePos.y);
        const smoothSpeed = 1 - inertiaVal;
        state.dampedPos.x += (targetDamped.x - state.dampedPos.x) * smoothSpeed;
        state.dampedPos.y += (targetDamped.y - state.dampedPos.y) * smoothSpeed;

        if (rawCursorRef.current) {
          rawCursorRef.current.style.left = `${state.rawPos.x}px`;
          rawCursorRef.current.style.top = `${state.rawPos.y}px`;
        }
        if (dampedCursorRef.current) {
          dampedCursorRef.current.style.left = `${state.dampedPos.x}px`;
          dampedCursorRef.current.style.top = `${state.dampedPos.y}px`;
        }

        state.history.push({
          rawX: state.rawPos.x,
          rawY: state.rawPos.y,
          dampedX: state.dampedPos.x,
          dampedY: state.dampedPos.y,
          life: 1.0
        });
        if (state.history.length > 50) {
          state.history.shift();
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (state.history.length > 1) {
        if (currentMode === "raw") {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(239, 68, 68, 0.4)"; // red-500
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          for (let i = 0; i < state.history.length; i++) {
            const pt = state.history[i];
            if (i === 0) ctx.moveTo(pt.rawX, pt.rawY);
            else ctx.lineTo(pt.rawX, pt.rawY);
          }
          ctx.stroke();
        }

        if (currentMode === "damped") {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(16, 185, 129, 0.9)"; // emerald-500
          ctx.lineWidth = 2.0;
          ctx.setLineDash([]);
          for (let i = 0; i < state.history.length; i++) {
            const pt = state.history[i];
            if (i === 0) ctx.moveTo(pt.dampedX, pt.dampedY);
            else ctx.lineTo(pt.dampedX, pt.dampedY);
          }
          ctx.stroke();
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };
    
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [currentMode, tremorFreq, inertiaVal, magnetRadius]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    simState.current.mousePos.x = e.clientX - rect.left;
    simState.current.mousePos.y = e.clientY - rect.top;
    rawCursorRef.current?.classList.remove("hidden");
    dampedCursorRef.current?.classList.remove("hidden");
  }, []);

  const onMouseLeave = useCallback(() => {
    rawCursorRef.current?.classList.add("hidden");
    dampedCursorRef.current?.classList.add("hidden");
  }, []);

  return (
    <div ref={containerRef} className="bg-[#09090b] text-zinc-50 min-h-screen flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-50">
      
      {/* ── Background Glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="w-[1000px] h-[500px] rounded-[100%] bg-emerald-500/10 blur-[120px] -top-32 absolute"></div>
        <div className="w-[800px] h-[600px] rounded-[100%] bg-blue-600/5 blur-[120px] top-1/3 absolute left-[-200px]"></div>
      </div>

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <div className="w-full px-6 max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-lg tracking-tight text-white flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-emerald-500" /> STEAD
            </span>
            <div className="hidden lg:flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              v0.1.0 Kernel
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/bitbyrizbit/stead" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7.17A5.1 5.1 0 0 0 19 4.8 5 5 0 0 0 19 2s-1-.3-3 1.6a11.3 11.3 0 0 0-6 0C8 1.7 7 2 7 2a5 5 0 0 0 0 2.8 5.1 5.1 0 0 0-1.5 3.01c0 5.76 3.35 6.78 6.5 7.17A4.8 4.8 0 0 0 11 18v4"/><path d="M9 20a5 5 0 0 1-5-2 5 5 0 0 1-1-4"/></svg> 
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <button onClick={onStart} className="px-4 py-1.5 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 transition-colors text-sm font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2">
              Calibrate <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full z-10 relative mt-16">
        {/* ── Hero Section ── */}
        <section className="w-full px-6 pt-32 pb-24 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8"
          >
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-zinc-300">Infrastructure-Level Pointer Dampening</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white max-w-4xl leading-[1.05]"
          >
            Your intent,<br />not your tremor.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl font-medium"
          >
            An invisible mathematical substrate that filters biological oscillation. Experience sub-millisecond cursor stabilization directly in the browser.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="mt-10 flex items-center gap-4"
          >
            <button onClick={onStart} className="px-6 py-3 rounded-full bg-white text-zinc-950 font-semibold hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              Begin Diagnostic <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </section>

        {/* ── Architecture Sticky Layout ── */}
        <section className="w-full px-6 py-24 max-w-7xl mx-auto border-t border-white/10" id="playground">
          <div className="flex flex-col lg:flex-row gap-16 relative">
            
            {/* Left Col (Text) */}
            <div className="lg:w-1/3 flex flex-col gap-24 pt-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg">
                  <Cpu className="w-5 h-5 text-zinc-300" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Algorithmic Dampening</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Continuous real-time Fourier analysis identifies high-frequency cyclic tremors, cleanly subtracting them without adding perceived mouse lag.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg">
                  <Crosshair className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Magnetic Geometry</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Interactive nodes organically pull the cursor toward their gravitational centers, transforming strenuous fine clicks into effortless actions.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Zero Telemetry</h3>
                <p className="text-zinc-400 leading-relaxed">
                  All kinematic processing happens locally in real-time. No coordinate data ever leaves your device. Fully open-source kernel.
                </p>
              </motion.div>
            </div>

            {/* Right Col (Sticky Canvas) */}
            <div className="lg:w-2/3 lg:sticky lg:top-32 h-fit">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCurrentMode("raw")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${currentMode === 'raw' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      RAW TREMOR
                    </button>
                    <button 
                      onClick={() => setCurrentMode("damped")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${currentMode === 'damped' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${currentMode === 'damped' ? 'bg-emerald-400 animate-pulse' : 'bg-transparent'}`}></span>
                      STEAD ACTIVE
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
                    Target Score: <span className="text-white font-mono">{hitList.size}/{totalTargets}</span>
                  </div>
                </div>

                <div 
                  ref={arenaRef}
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                  className="relative w-full h-[400px] md:h-[500px] bg-zinc-950 border border-white/5 rounded-xl overflow-hidden cursor-crosshair select-none group shadow-inner"
                >
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300"></canvas>
                  
                  {/* Glowing background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                  {/* Targets */}
                  <div className={`target-node absolute left-[20%] top-[20%] p-4 transition-transform duration-200 cursor-pointer ${hitList.has(1) ? 'opacity-20 scale-95' : 'hover:scale-110'}`} onClick={() => hitTarget(1)}>
                    <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900/80 flex items-center justify-center relative overflow-hidden group/target">
                      <div className="absolute inset-0 bg-emerald-500/0 group-hover/target:bg-emerald-500/20 transition-colors"></div>
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 group-hover/target:bg-emerald-400 group-hover/target:shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all"></span>
                    </div>
                  </div>
                  
                  <div className={`target-node absolute left-[50%] top-[15%] p-4 transition-transform duration-200 cursor-pointer ${hitList.has(2) ? 'opacity-20 scale-95' : 'hover:scale-110'}`} onClick={() => hitTarget(2)}>
                    <div className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900/80 flex items-center justify-center relative overflow-hidden group/target">
                      <div className="absolute inset-0 bg-emerald-500/0 group-hover/target:bg-emerald-500/20 transition-colors"></div>
                      <div className="w-4 h-4 rounded-full border border-zinc-500 group-hover/target:border-emerald-400 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 group-hover/target:bg-emerald-400 transition-colors"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`target-node absolute right-[15%] top-[30%] p-4 transition-transform duration-200 cursor-pointer ${hitList.has(3) ? 'opacity-20 scale-95' : 'hover:scale-110'}`} onClick={() => hitTarget(3)}>
                    <div className="px-5 py-2 rounded-full border border-zinc-700 bg-zinc-900/80 flex items-center gap-2 group/target overflow-hidden relative">
                      <div className="absolute inset-0 bg-emerald-500/0 group-hover/target:bg-emerald-500/10 transition-colors"></div>
                      <span className="w-2 h-2 rounded-full bg-zinc-400 group-hover/target:bg-emerald-400 transition-colors"></span>
                      <span className="text-xs font-semibold text-zinc-300 group-hover/target:text-white transition-colors">Link</span>
                    </div>
                  </div>
                  
                  <div className={`target-node absolute left-[30%] bottom-[25%] p-4 transition-transform duration-200 cursor-pointer ${hitList.has(4) ? 'opacity-20 scale-95' : 'hover:scale-110'}`} onClick={() => hitTarget(4)}>
                    <div className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900/80 flex items-center justify-center relative overflow-hidden group/target">
                      <div className="absolute inset-0 bg-emerald-500/0 group-hover/target:bg-emerald-500/20 transition-colors"></div>
                      <span className="w-3 h-3 rounded-full bg-zinc-400 group-hover/target:bg-emerald-400 transition-colors"></span>
                    </div>
                  </div>
                  
                  <div className={`target-node absolute right-[35%] bottom-[20%] p-4 transition-transform duration-200 cursor-pointer ${hitList.has(5) ? 'opacity-20 scale-95' : 'hover:scale-110'}`} onClick={() => hitTarget(5)}>
                    <div className="px-4 py-2 border border-zinc-700 bg-zinc-900/80 rounded-lg flex items-center gap-3 group/target overflow-hidden relative">
                      <div className="absolute inset-0 bg-emerald-500/0 group-hover/target:bg-emerald-500/10 transition-colors"></div>
                      <span className="w-2 h-2 rounded-full bg-zinc-400 group-hover/target:bg-emerald-400 transition-colors"></span>
                      <span className="text-xs font-medium text-zinc-300 group-hover/target:text-white transition-colors">Select</span>
                    </div>
                  </div>
                  
                  <div className={`target-node absolute right-[10%] bottom-[40%] p-4 transition-transform duration-200 cursor-pointer ${hitList.has(6) ? 'opacity-20 scale-95' : 'hover:scale-110'}`} onClick={() => hitTarget(6)}>
                    <div className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900/80 flex items-center justify-center relative overflow-hidden group/target">
                      <div className="absolute inset-0 bg-emerald-500/0 group-hover/target:bg-emerald-500/20 transition-colors"></div>
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 group-hover/target:bg-emerald-400 transition-colors"></span>
                    </div>
                  </div>

                  {/* Virtual Cursors */}
                  <div ref={rawCursorRef} className="custom-cursor-raw absolute w-4 h-4 rounded-full border border-red-500/80 pointer-events-none hidden mix-blend-screen shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    <div className="w-1 h-1 bg-red-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  <div ref={dampedCursorRef} className="custom-cursor-damped absolute w-6 h-6 rounded-full border-2 border-emerald-400 pointer-events-none hidden mix-blend-screen shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-2">
                  <div>
                    <div className="flex justify-between text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
                      <span>Tremor Hz</span>
                      <span className="text-white">{tremorFreq.toFixed(1)}</span>
                    </div>
                    <input className="w-full" max="12.0" min="2.0" step="0.2" type="range" value={tremorFreq} onChange={(e) => setTremorFreq(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
                      <span>Dampening</span>
                      <span className="text-white">{inertiaVal.toFixed(2)}</span>
                    </div>
                    <input className="w-full" max="0.95" min="0.1" step="0.05" type="range" value={inertiaVal} onChange={(e) => setInertiaVal(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
                      <span>Magnetic Px</span>
                      <span className="text-white">{magnetRadius}</span>
                    </div>
                    <input className="w-full" max="60" min="10" step="2" type="range" value={magnetRadius} onChange={(e) => setMagnetRadius(parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Extension CTA ── */}
        <section className="w-full px-6 py-32 max-w-7xl mx-auto" id="extension">
          <div className="w-full rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px] -right-32 -bottom-32"></div>
            
            <div className="flex flex-col items-start z-10">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Browser Extension Available</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Universal Stabilization.
              </h2>
              <p className="text-zinc-400 max-w-lg mb-8">
                Install the lightweight STEAD extension to apply architectural kinematic damping to every button, link, and input on the web.
              </p>
              <div className="flex items-center gap-4">
                <button className="px-6 py-3 rounded-full bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Add to Chrome <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 aspect-square rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center relative shadow-inner z-10 overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]"></div>
              <Crosshair className="w-16 h-16 text-zinc-800 group-hover:text-emerald-500/50 transition-colors duration-500" />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full bg-zinc-950 border-t border-white/5 z-10 relative mt-auto">
        <div className="w-full px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-emerald-500" />
            <span className="font-bold tracking-tight text-white">STEAD</span>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            © {new Date().getFullYear()} STEAD Open Source. Universal accessibility initiative.
          </p>
        </div>
      </footer>
    </div>
  );
}
