"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface EditorialMarketingProps {
  onStart: () => void;
}

export function EditorialMarketing({ onStart }: EditorialMarketingProps) {
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

  const simState = useRef({
    mousePos: { x: -100, y: -100 },
    rawPos: { x: -100, y: -100 },
    dampedPos: { x: -100, y: -100 },
    history: [] as { rawX: number; rawY: number; dampedX: number; dampedY: number; life: number }[],
    time: 0
  });

  const totalTargets = 6;

  // Sync mode state for the metrics below the canvas
  const metrics = currentMode === "raw" 
    ? { accuracy: "48.2%", time: "820 ms", variance: "14.80 mm²", progress: "48.2%", color: "bg-zinc-400" }
    : { accuracy: "96.4%", time: "340 ms", variance: "1.42 mm²", progress: "96.4%", color: "bg-emerald-600" };

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
        // High frequency biological jitter simulating essential tremor
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
        if (state.history.length > 55) {
          state.history.shift();
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (state.history.length > 1) {
        if (currentMode === "raw") {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(161, 161, 170, 0.4)"; // zinc-400
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
          ctx.strokeStyle = "rgba(5, 150, 105, 0.85)"; // emerald-600
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
    <div className="bg-zinc-50 text-zinc-900 antialiased min-h-screen flex flex-col font-body-md overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* ── TopNavBar ── */}
      <header className="w-full bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
        <div className="w-full px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-between h-20">
          <div className="flex items-center gap-6">
            <a className="font-headline-md text-headline-md font-medium tracking-tight text-zinc-900 transition-colors hover:text-blue-600" href="#">
              Stead
            </a>
            <div className="hidden lg:flex items-center gap-2 text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="font-caption text-caption">Kinematic motor stabilizing protocol</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-zinc-600 font-body-sm text-body-sm hover:text-zinc-900 transition-colors" href="#overview">Overview</a>
            <a className="text-zinc-600 font-body-sm text-body-sm hover:text-zinc-900 transition-colors" href="#calibration">Calibration</a>
            <a className="text-blue-600 font-body-sm text-body-sm font-medium relative after:content-[''] after:absolute after:bottom-[-1.25rem] after:left-0 after:w-full after:h-[2px] after:bg-blue-600" href="#playground">Playground</a>
            <a className="text-zinc-600 font-body-sm text-body-sm hover:text-zinc-900 transition-colors" href="#extension">Extension</a>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={onStart} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 rounded-full text-zinc-700 font-body-sm text-body-sm hover:text-zinc-900 hover:border-zinc-400 hover:bg-white shadow-sm transition-all duration-200">
              <span className="material-symbols-outlined text-[1.125rem]">tune</span>
              <span>Calibrate</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {/* ── Hero Introduction ── */}
        <section className="w-full px-6 md:px-12 pt-20 pb-12 max-w-7xl mx-auto" id="overview">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-8">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-gentle"></span>
                <span className="font-label-editorial text-label-editorial tracking-[0.08em] uppercase">Interactive Laboratory</span>
              </div>
              <h1 className="font-display-hero-mobile md:font-display-hero text-display-hero-mobile md:text-display-hero text-zinc-900 font-medium leading-tight tracking-tight">
                Inside the tactile arena.
              </h1>
            </div>
            <div className="md:col-span-4 flex flex-col justify-end">
              <p className="font-body-lead text-body-lead text-zinc-600 pb-2">
                Experience the visceral physical shift between involuntary kinetic oscillations and architectural damping algorithms.
              </p>
              <p className="font-caption text-caption text-zinc-500">
                Interactive dampening frequency: 4.8 Hz. Zero simulated latency.
              </p>
            </div>
          </div>
          <div className="w-full h-[1px] bg-zinc-200 mt-12"></div>
        </section>

        {/* ── Master Switcher & Protocol Bar ── */}
        <section className="w-full px-6 md:px-12 max-w-7xl mx-auto pb-8" id="calibration">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <span className="font-label-editorial text-label-editorial text-zinc-500 uppercase tracking-wider">Motor Control Mode</span>
              <div className="inline-flex p-1 bg-zinc-50 border border-zinc-200 rounded-full relative">
                <button 
                  onClick={() => setCurrentMode("raw")}
                  className={`px-5 py-2 rounded-full font-body-sm text-body-sm font-medium transition-all duration-200 flex items-center gap-2 ${currentMode === 'raw' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${currentMode === 'raw' ? 'bg-zinc-400 animate-pulse' : 'border border-zinc-300'}`}></span>
                  <span>Unassisted Tremor</span>
                </button>
                <button 
                  onClick={() => setCurrentMode("damped")}
                  className={`px-5 py-2 rounded-full font-body-sm text-body-sm font-medium transition-all duration-200 flex items-center gap-2 ${currentMode === 'damped' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${currentMode === 'damped' ? 'bg-white animate-pulse' : 'border border-zinc-300'}`}></span>
                  <span>Active Stabilization</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-8 text-zinc-600 font-body-sm text-body-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-sm">water_lux</span>
                <span>Target acquisition: <strong className="text-zinc-900 font-semibold">{hitList.size} / {totalTargets}</strong></span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">speed</span>
                <span>Variance: <span className="text-zinc-900 font-semibold">{metrics.variance}</span></span>
              </div>
              <button onClick={resetTargets} className="text-zinc-500 hover:text-blue-600 text-caption font-label-editorial uppercase tracking-wider transition-colors duration-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-[1rem]">refresh</span> Reset
              </button>
            </div>
          </div>
        </section>

        {/* ── Tactile Arena Stage ── */}
        <section className="w-full px-6 md:px-12 max-w-7xl mx-auto" id="playground">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Arena Canvas */}
            <div className="lg:col-span-8 flex flex-col">
              <div 
                ref={arenaRef}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                className="relative w-full h-[540px] md:h-[620px] bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden cursor-crosshair select-none"
              >
                <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center">
                  <div className="w-[300px] h-[300px] rounded-full border border-zinc-200"></div>
                  <div className="w-[520px] h-[520px] rounded-full border border-zinc-200 absolute"></div>
                  <div className="w-[740px] h-[740px] rounded-full border border-zinc-200 absolute"></div>
                  <div className="absolute w-full h-[1px] bg-zinc-100"></div>
                  <div className="absolute h-full w-[1px] bg-zinc-100"></div>
                </div>
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"></canvas>
                
                {/* Targets */}
                <div className={`target-node absolute left-[18%] top-[25%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(1) ? 'opacity-40 scale-95' : ''}`} onClick={() => hitTarget(1)}>
                  <div className="w-10 h-10 rounded-full border border-zinc-200 group-hover:border-blue-400 group-hover:shadow-md flex items-center justify-center relative bg-white/80 backdrop-blur-sm transition-all">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 group-hover:scale-125 transition-transform"></span>
                  </div>
                </div>
                
                <div className={`target-node absolute left-[45%] top-[18%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(2) ? 'opacity-40 scale-95' : ''}`} onClick={() => hitTarget(2)}>
                  <div className="w-14 h-14 rounded-full border border-zinc-200 group-hover:border-blue-400 group-hover:shadow-md flex items-center justify-center relative bg-white/80 backdrop-blur-sm transition-all">
                    <div className="w-4 h-4 rounded-full border border-blue-400/60 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    </div>
                  </div>
                </div>
                
                <div className={`target-node absolute right-[18%] top-[35%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(3) ? 'opacity-40 scale-95' : ''}`} onClick={() => hitTarget(3)}>
                  <div className="px-5 py-2.5 rounded-full border border-zinc-200 group-hover:border-blue-400 group-hover:shadow-md bg-white flex items-center gap-2 transition-all">
                    <span className="material-symbols-outlined text-xs text-blue-600">adjust</span>
                    <span className="font-body-sm text-sm text-zinc-900 font-medium">Precision Anchor</span>
                  </div>
                </div>
                
                <div className={`target-node absolute left-[26%] bottom-[28%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(4) ? 'opacity-40 scale-95' : ''}`} onClick={() => hitTarget(4)}>
                  <div className="w-12 h-12 rounded-full border border-zinc-200 group-hover:border-blue-400 group-hover:shadow-md flex items-center justify-center relative bg-white/80 transition-all">
                    <span className="w-3 h-3 rounded-full bg-zinc-300 group-hover:bg-blue-500 transition-colors"></span>
                  </div>
                </div>
                
                <div className={`target-node absolute left-[62%] bottom-[22%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(5) ? 'opacity-40 scale-95' : ''}`} onClick={() => hitTarget(5)}>
                  <div className="px-4 py-2 border border-zinc-200 group-hover:border-blue-400 group-hover:shadow-md bg-white rounded-lg flex items-center gap-3 transition-all">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span className="font-body-sm text-sm text-zinc-800 font-medium">Capture Link</span>
                  </div>
                </div>
                
                <div className={`target-node absolute right-[12%] bottom-[42%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(6) ? 'opacity-40 scale-95' : ''}`} onClick={() => hitTarget(6)}>
                  <div className="w-8 h-8 rounded-full border border-zinc-200 group-hover:border-blue-400 group-hover:shadow-md flex items-center justify-center bg-white/80 transition-all">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  </div>
                </div>

                {/* Virtual Cursors */}
                <div ref={rawCursorRef} className="custom-cursor-raw absolute w-4 h-4 rounded-full border border-zinc-400 pointer-events-none hidden">
                  <div className="w-1 h-1 bg-zinc-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div ref={dampedCursorRef} className="custom-cursor-damped absolute w-6 h-6 rounded-full border-2 border-emerald-500 pointer-events-none hidden shadow-sm">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="absolute bottom-4 left-6 pointer-events-none">
                  <span className="font-label-editorial text-label-editorial text-zinc-400 tracking-wider uppercase">
                    Move pointer freely across nodes
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-zinc-600 font-body-sm text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-zinc-400 border-dashed inline-block"></span>
                  <span>Raw Tremor Pathway</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Active Filtered Vector</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-zinc-400">lens</span>
                  <span>Magnetic Capture Field</span>
                </div>
              </div>
            </div>

            {/* Ledger & Controls */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
                    <span className="font-headline-sm text-headline-sm text-zinc-900 font-semibold">Observation Ledger</span>
                    <span className="font-label-editorial text-label-editorial text-blue-600 uppercase">Realtime 60Hz</span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-sm text-body-sm text-zinc-500 font-medium">Target Acquisition</span>
                        <span className="font-headline-md text-headline-md text-zinc-900 font-medium">{metrics.accuracy}</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 mt-3 rounded-full overflow-hidden">
                        <div className={`${metrics.color} h-full transition-all duration-500 rounded-full`} style={{ width: metrics.progress }}></div>
                      </div>
                      <div className="flex justify-between text-caption font-caption text-zinc-500 mt-2">
                        <span>Unassisted mean: 48.2%</span>
                        <span className="text-emerald-600 font-medium">+48.2% uplift</span>
                      </div>
                    </div>
                    <div className="border-t border-zinc-100 pt-5">
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-sm text-body-sm text-zinc-500 font-medium">Mean Duration to Target</span>
                        <span className="font-headline-md text-headline-md text-zinc-900 font-medium">{metrics.time}</span>
                      </div>
                      <p className="font-caption text-caption text-zinc-500 mt-2 leading-relaxed">
                        Eliminates recurring overshooting and cyclic corrections.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
                  <span className="font-label-editorial text-label-editorial text-zinc-900 tracking-wider uppercase">Dampener Calibration</span>
                  <span className="material-symbols-outlined text-zinc-400">tune</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-zinc-700 font-body-sm text-sm font-medium mb-3">
                      <span>Involuntary Frequency</span>
                      <span className="text-blue-600">{tremorFreq.toFixed(1)} Hz</span>
                    </div>
                    <input className="w-full" max="12.0" min="2.0" step="0.2" type="range" value={tremorFreq} onChange={(e) => setTremorFreq(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-700 font-body-sm text-sm font-medium mb-3">
                      <span>Harmonic Inertia</span>
                      <span className="text-blue-600">{inertiaVal.toFixed(2)}</span>
                    </div>
                    <input className="w-full" max="0.95" min="0.1" step="0.05" type="range" value={inertiaVal} onChange={(e) => setInertiaVal(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-700 font-body-sm text-sm font-medium mb-3">
                      <span>Magnetic Snap Gravity</span>
                      <span className="text-blue-600">{magnetRadius} px</span>
                    </div>
                    <input className="w-full" max="60" min="10" step="2" type="range" value={magnetRadius} onChange={(e) => setMagnetRadius(parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Narrative Section ── */}
        <section className="w-full px-6 md:px-12 max-w-7xl mx-auto py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <span className="font-headline-md text-headline-md text-blue-600 italic block mb-4">01</span>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-zinc-900 leading-tight mb-6 font-medium tracking-tight">
                Where physical effort meets stillness.
              </h2>
              <p className="font-body-md text-body-md text-zinc-600 mb-8 leading-relaxed">
                The hand desires intent; physiology injects friction. Stead acts as an invisible mathematical substrate, distinguishing deliberate movement vectors from involuntary oscillation.
              </p>
              <button onClick={onStart} className="inline-flex items-center gap-3 font-body-md text-[1rem] font-medium text-blue-600 hover:text-blue-700 group transition-colors">
                <span>Calibrate your cursor now</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4 text-zinc-400">
                    <span className="font-label-editorial text-label-editorial uppercase tracking-wider">Phase I</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-zinc-900 font-medium mb-3">
                    Predictive Filtering
                  </h3>
                  <p className="font-body-sm text-body-sm text-zinc-600 leading-relaxed">
                    Continuous real-time Fourier analysis identifies high-frequency cyclic tremors, cleanly subtracting them without adding perceived mouse lag or floatiness.
                  </p>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4 text-zinc-400">
                    <span className="font-label-editorial text-label-editorial uppercase tracking-wider">Phase II</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-zinc-900 font-medium mb-3">
                    Magnetic Geometry
                  </h3>
                  <p className="font-body-sm text-body-sm text-zinc-600 leading-relaxed">
                    Microscopic interactive targets organically pull the cursor toward their gravitational centers, transforming strenuous fine clicks into effortless, confident actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Chrome Extension Invitation ── */}
        <section className="w-full px-6 md:px-12 max-w-7xl mx-auto pb-32" id="extension">
          <div className="bg-zinc-900 rounded-2xl p-10 md:p-16 relative overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-8">
                <span className="font-label-editorial text-label-editorial text-emerald-400 mb-3 block uppercase tracking-widest">Universal browser integration</span>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white leading-tight mb-6 font-medium">
                  Carry the stillness everywhere.
                </h2>
                <p className="font-body-lead text-body-lead text-zinc-300 max-w-2xl">
                  Install the lightweight Stead browser extension. All web links, application buttons, and form inputs automatically receive architectural kinematic damping.
                </p>
              </div>
              <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center gap-6">
                <a href="https://github.com/bitbyrizbit/stead" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors w-full sm:w-auto shadow-lg shadow-blue-900/50">
                  <span className="font-body-md text-white font-medium">Add Stead to Chrome</span>
                  <span className="material-symbols-outlined text-white text-sm">arrow_outward</span>
                </a>
                <div className="flex flex-col items-start md:items-end gap-2 text-caption font-caption text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-emerald-400">verified_user</span>
                    <span>Open-source kernel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-emerald-400">shield</span>
                    <span>Zero data telemetry</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="w-full px-6 md:px-12 py-16 max-w-7xl mx-auto flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            <div className="md:col-span-5">
              <span className="font-headline-md text-headline-md font-medium text-zinc-900">Stead</span>
              <p className="font-body-sm text-body-sm text-zinc-500 mt-4 max-w-sm leading-relaxed">
                High-precision algorithmic motor dampening protocols for universal accessibility.
              </p>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <span className="font-label-editorial text-label-editorial text-zinc-900 uppercase tracking-wider mb-2">Project</span>
                <a className="text-zinc-500 font-body-sm text-sm hover:text-blue-600 transition-colors" href="https://github.com/bitbyrizbit/stead" target="_blank" rel="noreferrer">GitHub Repository</a>
                <a className="text-zinc-500 font-body-sm text-sm hover:text-blue-600 transition-colors" href="#">Documentation</a>
                <a className="text-zinc-500 font-body-sm text-sm hover:text-blue-600 transition-colors" href="#">Technical Architecture</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-label-editorial text-label-editorial text-zinc-900 uppercase tracking-wider mb-2">Legal</span>
                <a className="text-zinc-500 font-body-sm text-sm hover:text-blue-600 transition-colors" href="#">Privacy Policy</a>
                <a className="text-zinc-500 font-body-sm text-sm hover:text-blue-600 transition-colors" href="#">MIT License</a>
              </div>
            </div>
          </div>
          <div className="w-full h-[1px] bg-zinc-200 mb-8"></div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-zinc-400 font-caption text-caption gap-4">
            <span>© {new Date().getFullYear()} Stead Open Source. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span>Open Source Accessibility Initiative</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
