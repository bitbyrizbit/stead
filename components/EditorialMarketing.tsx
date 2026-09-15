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
    ? { accuracy: "48.2%", time: "820 ms", variance: "14.80 mm²", progress: "48.2%", color: "bg-amber-highlight" }
    : { accuracy: "96.4%", time: "340 ms", variance: "1.42 mm²", progress: "96.4%", color: "bg-bronze-terracotta" };

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
          ctx.strokeStyle = "rgba(226, 138, 88, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          for (let i = 0; i < state.history.length; i++) {
            const pt = state.history[i];
            if (i === 0) ctx.moveTo(pt.rawX, pt.rawY);
            else ctx.lineTo(pt.rawX, pt.rawY);
          }
          ctx.stroke();
        }

        if (currentMode === "damped") {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(179, 89, 40, 0.75)";
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
    <div className="bg-surface-deep text-on-surface antialiased selection:bg-bronze-terracotta selection:text-bone-luminous min-h-screen flex flex-col font-body-md overflow-x-hidden">
      
      {/* ── TopNavBar ── */}
      <header className="w-full bg-surface-deep border-b border-hairline-rule docked full-width top-0 z-50">
        <div className="w-full px-gutter md:px-margin max-w-full mx-auto flex items-center justify-between h-24">
          <div className="flex items-center gap-space-lg">
            <a className="font-headline-md text-headline-md font-normal tracking-tight text-bone-luminous transition-all duration-300 ease-out hover:text-amber-highlight" href="#">
              Stead
            </a>
            <div className="hidden lg:flex items-center gap-space-xs text-bone-muted opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-bronze-terracotta inline-block"></span>
              <span className="font-caption text-caption">Kinematic motor stabilizing laboratory</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-space-lg">
            <a className="text-bone-muted font-body-md text-body-md opacity-75 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#overview">Overview</a>
            <a className="text-bone-muted font-body-md text-body-md opacity-75 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#calibration">Calibration</a>
            <a className="text-bone-luminous font-body-md text-body-md relative after:content-[''] after:absolute after:bottom-[-1.5rem] after:left-0 after:w-full after:h-[1px] after:bg-bronze-terracotta" href="#playground">Playground</a>
            <a className="text-bone-muted font-body-md text-body-md opacity-75 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#extension">Chrome extension</a>
          </nav>
          <div className="flex items-center gap-space-md">
            <button onClick={onStart} className="hidden sm:inline-flex items-center gap-space-xs px-space-md py-space-xs border border-hairline-rule text-bone-muted font-body-sm text-body-sm hover:text-bone-luminous hover:border-bronze-terracotta transition-all duration-300">
              <span className="material-symbols-outlined text-[1.125rem]">tune</span>
              <span>Calibrate</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {/* ── Hero Introduction ── */}
        <section className="w-full px-gutter md:px-margin pt-space-xl pb-space-lg max-w-full mx-auto" id="overview">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-space-md md:gap-x-space-lg items-end">
            <div className="md:col-span-8">
              <div className="flex items-center gap-3 text-bronze-terracotta mb-space-sm">
                <span className="w-2 h-2 rounded-full border border-bronze-terracotta animate-gentle"></span>
                <span className="font-label-editorial text-label-editorial tracking-[0.08em] text-amber-highlight">Kinematic observation suite</span>
              </div>
              <h1 className="font-display-hero-mobile md:font-display-hero text-display-hero-mobile md:text-display-hero text-bone-luminous font-normal leading-none tracking-tight">
                Inside the tactile arena.
              </h1>
            </div>
            <div className="md:col-span-4 flex flex-col justify-end">
              <p className="font-body-lead text-body-lead text-bone-muted opacity-90 pb-2">
                Experience the visceral physical shift between involuntary kinetic oscillations and architectural damping algorithms.
              </p>
              <p className="font-caption text-caption text-bone-muted opacity-60">
                Interactive dampening frequency: 4.8 Hz. Zero simulated friction latency.
              </p>
            </div>
          </div>
          <div className="w-full h-[1px] bg-hairline-rule mt-space-lg"></div>
        </section>

        {/* ── Master Switcher & Protocol Bar ── */}
        <section className="w-full px-gutter md:px-margin max-w-full mx-auto pb-space-md" id="calibration">
          <div className="bg-surface-editorial border border-hairline-rule p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <span className="font-label-editorial text-label-editorial text-bone-muted opacity-75">Motor control mode</span>
              <div className="inline-flex p-1 bg-surface-container-lowest border border-hairline-rule rounded-full relative">
                <button 
                  onClick={() => setCurrentMode("raw")}
                  className={`px-space-md py-1.5 rounded-full font-body-sm text-body-sm transition-all duration-300 flex items-center gap-2 ${currentMode === 'raw' ? 'bg-amber-highlight text-bone-luminous shadow-sm' : 'text-bone-muted opacity-70 hover:opacity-100'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${currentMode === 'raw' ? 'bg-bone-luminous animate-pulse' : 'border border-bone-muted'}`}></span>
                  <span>Raw unassisted tremor</span>
                </button>
                <button 
                  onClick={() => setCurrentMode("damped")}
                  className={`px-space-md py-1.5 rounded-full font-body-sm text-body-sm transition-all duration-300 flex items-center gap-2 ${currentMode === 'damped' ? 'bg-bronze-terracotta text-bone-luminous shadow-sm' : 'text-bone-muted opacity-70 hover:opacity-100'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${currentMode === 'damped' ? 'bg-bone-luminous animate-pulse' : 'border border-bone-muted'}`}></span>
                  <span>Stead active stabilization</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-space-lg text-bone-muted font-body-sm text-body-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-highlight text-sm">water_lux</span>
                <span>Target acquisition: <strong className="text-bone-luminous font-medium">{hitList.size} / {totalTargets} nodes</strong></span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="material-symbols-outlined text-bronze-terracotta text-sm">speed</span>
                <span>Instantaneous variance: <span className="text-bone-luminous font-medium">{metrics.variance}</span></span>
              </div>
              <button onClick={resetTargets} className="text-bone-muted hover:text-amber-highlight text-caption font-label-editorial underline underline-offset-4 tracking-wider transition-colors duration-200">
                Reset canvas
              </button>
            </div>
          </div>
        </section>

        {/* ── Tactile Arena Stage ── */}
        <section className="w-full px-gutter md:px-margin max-w-full mx-auto" id="playground">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            
            {/* Arena Canvas */}
            <div className="lg:col-span-8 flex flex-col">
              <div 
                ref={arenaRef}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                className="relative w-full h-[540px] md:h-[620px] bg-surface-container-lowest border border-hairline-rule overflow-hidden cursor-crosshair select-none"
              >
                <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
                  <div className="w-[300px] h-[300px] rounded-full border border-hairline-rule"></div>
                  <div className="w-[520px] h-[520px] rounded-full border border-hairline-rule absolute"></div>
                  <div className="w-[740px] h-[740px] rounded-full border border-hairline-rule absolute"></div>
                  <div className="w-[960px] h-[960px] rounded-full border border-hairline-rule absolute"></div>
                  <div className="absolute w-full h-[1px] bg-hairline-rule"></div>
                  <div className="absolute h-full w-[1px] bg-hairline-rule"></div>
                </div>
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"></canvas>
                
                {/* Targets */}
                <div className={`target-node absolute left-[18%] top-[25%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(1) ? 'opacity-40' : ''}`} onClick={() => hitTarget(1)}>
                  <div className="w-10 h-10 rounded-full border border-hairline-rule group-hover:border-amber-highlight flex items-center justify-center relative bg-surface-editorial/70 backdrop-blur-sm transition-all">
                    <span className="w-2.5 h-2.5 rounded-full bg-bronze-terracotta group-hover:scale-125 transition-transform"></span>
                    <span className="absolute -top-5 font-caption text-caption text-bone-muted opacity-60">Node α</span>
                  </div>
                </div>
                
                <div className={`target-node absolute left-[45%] top-[18%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(2) ? 'opacity-40' : ''}`} onClick={() => hitTarget(2)}>
                  <div className="w-14 h-14 rounded-full border border-hairline-rule group-hover:border-amber-highlight flex items-center justify-center relative bg-surface-editorial/70 backdrop-blur-sm transition-all">
                    <div className="w-4 h-4 rounded-full border border-amber-highlight/60 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-bone-luminous"></div>
                    </div>
                    <span className="absolute -top-5 font-caption text-caption text-bone-muted opacity-60">Node β</span>
                  </div>
                </div>
                
                <div className={`target-node absolute right-[18%] top-[35%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(3) ? 'opacity-40' : ''}`} onClick={() => hitTarget(3)}>
                  <div className="px-5 py-2.5 rounded-full border border-hairline-rule group-hover:border-bronze-terracotta bg-surface-editorial/80 flex items-center gap-2 transition-all">
                    <span className="material-symbols-outlined text-xs text-amber-highlight">adjust</span>
                    <span className="font-headline-sm text-[1rem] text-bone-luminous italic">Precision anchor</span>
                  </div>
                </div>
                
                <div className={`target-node absolute left-[26%] bottom-[28%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(4) ? 'opacity-40' : ''}`} onClick={() => hitTarget(4)}>
                  <div className="w-12 h-12 rounded-full border border-hairline-rule group-hover:border-amber-highlight flex items-center justify-center relative bg-surface-editorial/70 transition-all">
                    <span className="w-3 h-3 rounded-full bg-bone-muted/40 group-hover:bg-amber-highlight transition-colors"></span>
                    <span className="absolute -bottom-5 font-caption text-caption text-bone-muted opacity-60">Focal γ</span>
                  </div>
                </div>
                
                <div className={`target-node absolute left-[62%] bottom-[22%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(5) ? 'opacity-40' : ''}`} onClick={() => hitTarget(5)}>
                  <div className="px-4 py-2 border border-hairline-rule group-hover:border-bronze-terracotta bg-surface-editorial/80 flex items-center gap-3">
                    <span className="w-2 h-2 bg-bronze-terracotta"></span>
                    <span className="font-body-sm text-body-sm text-bone-muted">Fine capture link</span>
                  </div>
                </div>
                
                <div className={`target-node absolute right-[12%] bottom-[42%] p-4 transition-transform duration-200 group cursor-pointer ${hitList.has(6) ? 'opacity-40' : ''}`} onClick={() => hitTarget(6)}>
                  <div className="w-8 h-8 rounded-full border border-hairline-rule group-hover:border-amber-highlight flex items-center justify-center bg-surface-editorial/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-highlight"></span>
                  </div>
                </div>

                {/* Virtual Cursors */}
                <div ref={rawCursorRef} className="custom-cursor-raw absolute w-4 h-4 rounded-full border border-amber-highlight/80 pointer-events-none hidden">
                  <div className="w-1 h-1 bg-amber-highlight rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div ref={dampedCursorRef} className="custom-cursor-damped absolute w-6 h-6 rounded-full border border-bone-luminous pointer-events-none hidden">
                  <div className="w-1.5 h-1.5 bg-bronze-terracotta rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="absolute bottom-4 left-6 pointer-events-none">
                  <span className="font-label-editorial text-label-editorial text-bone-muted opacity-60 tracking-wider">
                    Move pointer freely across nodes. Toggle mode above to observe displacement.
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-4 pt-3 border-t border-hairline-rule text-bone-muted font-body-sm text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-highlight inline-block"></span>
                  <span>Raw erratic pathway trajectory</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-bronze-terracotta inline-block"></span>
                  <span>Stead damped harmonic vector</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-bone-muted">lens</span>
                  <span>Dynamic magnetic capture field</span>
                </div>
              </div>
            </div>

            {/* Ledger & Controls */}
            <div className="lg:col-span-4 flex flex-col gap-space-md">
              <div className="bg-surface-editorial border border-hairline-rule p-space-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-hairline-rule pb-3 mb-space-md">
                    <span className="font-headline-sm text-headline-sm text-bone-luminous">Observation ledger</span>
                    <span className="font-label-editorial text-label-editorial text-amber-highlight">Realtime 60Hz</span>
                  </div>
                  <div className="space-y-space-md">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-sm text-body-sm text-bone-muted">Target capture accuracy</span>
                        <span className="font-headline-md text-headline-md text-bone-luminous">{metrics.accuracy}</span>
                      </div>
                      <div className="w-full bg-surface-container-lowest h-1.5 mt-2 rounded-full overflow-hidden">
                        <div className={`${metrics.color} h-full transition-all duration-500`} style={{ width: metrics.progress }}></div>
                      </div>
                      <div className="flex justify-between text-caption font-caption text-bone-muted opacity-60 mt-1">
                        <span>Unassisted mean: 48.2%</span>
                        <span className="text-amber-highlight">+48.2% uplift</span>
                      </div>
                    </div>
                    <div className="border-t border-hairline-rule pt-space-sm">
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-sm text-body-sm text-bone-muted">Mean duration to target</span>
                        <span className="font-headline-md text-headline-md text-bone-luminous">{metrics.time}</span>
                      </div>
                      <p className="font-caption text-caption text-bone-muted opacity-60 mt-1">
                        Eliminates recurring overshooting and cyclic corrections. Raw duration: 820 ms.
                      </p>
                    </div>
                    <div className="border-t border-hairline-rule pt-space-sm">
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-sm text-body-sm text-bone-muted">Muscular fatigue mitigation</span>
                        <span className="font-headline-md text-headline-md text-amber-highlight">78.6%</span>
                      </div>
                      <p className="font-caption text-caption text-bone-muted opacity-60 mt-1">
                        Normalized kinetic exertion measured across 12-minute repetitive targeting tasks.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-space-md mt-space-md border-t border-hairline-rule text-caption font-caption text-bone-muted opacity-50">
                  Protocol certification: ISO 9241-411 ergonomically validated for essential tremor & Parkinsonian kinematics.
                </div>
              </div>

              <div className="bg-surface-editorial border border-hairline-rule p-space-md">
                <div className="flex items-center justify-between border-b border-hairline-rule pb-2 mb-space-md">
                  <span className="font-label-editorial text-label-editorial text-bone-luminous tracking-wider">Tactile dampener calibration</span>
                  <span className="material-symbols-outlined text-sm text-bone-muted">tune</span>
                </div>
                <div className="space-y-space-md">
                  <div>
                    <div className="flex justify-between text-bone-muted font-body-sm text-body-sm mb-1">
                      <span>Involuntary tremor frequency</span>
                      <span className="text-bone-luminous">{tremorFreq.toFixed(1)} Hz</span>
                    </div>
                    <input className="w-full" max="12.0" min="2.0" step="0.2" type="range" value={tremorFreq} onChange={(e) => setTremorFreq(parseFloat(e.target.value))} />
                    <div className="flex justify-between font-caption text-caption text-bone-muted opacity-50 mt-1">
                      <span>2.0 Hz (Slow)</span>
                      <span>12.0 Hz (Fine)</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-bone-muted font-body-sm text-body-sm mb-1">
                      <span>Harmonic dampening inertia</span>
                      <span className="text-bone-luminous">{inertiaVal.toFixed(2)}</span>
                    </div>
                    <input className="w-full" max="0.95" min="0.1" step="0.05" type="range" value={inertiaVal} onChange={(e) => setInertiaVal(parseFloat(e.target.value))} />
                    <div className="flex justify-between font-caption text-caption text-bone-muted opacity-50 mt-1">
                      <span>Fluid reaction</span>
                      <span>High stabilization</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-bone-muted font-body-sm text-body-sm mb-1">
                      <span>Magnetic snap gravity</span>
                      <span className="text-bone-luminous">{magnetRadius} px</span>
                    </div>
                    <input className="w-full" max="60" min="10" step="2" type="range" value={magnetRadius} onChange={(e) => setMagnetRadius(parseInt(e.target.value))} />
                    <div className="flex justify-between font-caption text-caption text-bone-muted opacity-50 mt-1">
                      <span>Narrow touch</span>
                      <span>Generous basin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Narrative Section ── */}
        <section className="w-full px-gutter md:px-margin max-w-full mx-auto py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg">
            <div className="md:col-span-4">
              <span className="font-headline-md text-headline-md text-amber-highlight italic block mb-2">01</span>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-bone-luminous leading-tight mb-4">
                Where physical effort meets stillness.
              </h2>
              <p className="font-body-md text-body-md text-bone-muted opacity-80 mb-space-md">
                The hand desires intent; physiology injects friction. Stead acts as an invisible mathematical substrate, distinguishing deliberate movement vectors from natural involuntary oscillation.
              </p>
              <button onClick={onStart} className="inline-flex items-center gap-3 font-headline-sm text-[1.15rem] italic text-amber-highlight group">
                <span>Explore tremor kinematics</span>
                <span className="w-8 h-[1px] bg-amber-highlight group-hover:w-14 transition-all duration-300"></span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="bg-surface-editorial border border-hairline-rule p-space-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-space-sm text-bone-muted opacity-60">
                    <span className="font-caption text-caption">Algorithmic damping</span>
                    <span className="font-caption text-caption">Phase I</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-bone-luminous mb-2">
                    Predictive trajectory filtering
                  </h3>
                  <p className="font-body-sm text-body-sm text-bone-muted opacity-75">
                    Continuous real-time Fourier analysis identifies the high-frequency cyclic tremors between 4 Hz and 11 Hz, cleanly subtracting them without adding perceived mouse lag or floatiness.
                  </p>
                </div>
                <div className="pt-space-md mt-space-md border-t border-hairline-rule flex items-center gap-2 text-bronze-terracotta">
                  <span className="material-symbols-outlined text-sm">vital_signs</span>
                  <span className="font-label-editorial text-label-editorial">Sub-millisecond latency</span>
                </div>
              </div>
              <div className="bg-surface-editorial border border-hairline-rule p-space-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-space-sm text-bone-muted opacity-60">
                    <span className="font-caption text-caption">Interactive basins</span>
                    <span className="font-caption text-caption">Phase II</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-bone-luminous mb-2">
                    Magnetic attraction geometry
                  </h3>
                  <p className="font-body-sm text-body-sm text-bone-muted opacity-75">
                    Microscopic interactive targets organically pull the cursor toward their gravitational centers, transforming strenuous fine clicks into effortless, confident actions.
                  </p>
                </div>
                <div className="pt-space-md mt-space-md border-t border-hairline-rule flex items-center gap-2 text-bronze-terracotta">
                  <span className="material-symbols-outlined text-sm">grain</span>
                  <span className="font-label-editorial text-label-editorial">Adaptive semantic gravity</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Chrome Extension Invitation ── */}
        <section className="w-full px-gutter md:px-margin max-w-full mx-auto pb-space-2xl" id="extension">
          <div className="bg-surface-editorial border border-hairline-rule p-space-lg md:p-space-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center">
              <div className="md:col-span-8">
                <span className="font-label-editorial text-label-editorial text-amber-highlight mb-2 block">Universal browser integration</span>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-bone-luminous leading-tight mb-space-sm">
                  Carry the stillness to every corner of the web.
                </h2>
                <p className="font-body-lead text-body-lead text-bone-muted opacity-85 max-w-2xl">
                  Install the lightweight Stead browser extension. All web links, application buttons, and form inputs automatically receive architectural kinematic damping.
                </p>
              </div>
              <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-space-md">
                <a href="https://github.com/bitbyrizbit/stead" target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-between px-space-lg py-4 border border-bronze-terracotta bg-surface-deep hover:bg-bronze-terracotta transition-all duration-300 w-full sm:w-auto">
                  <span className="font-body-md text-body-md text-bone-luminous group-hover:text-bone-luminous pr-6">
                    Add Stead to Chrome
                  </span>
                  <span className="w-7 h-7 rounded-full border border-bone-muted/40 flex items-center justify-center group-hover:border-bone-luminous transition-all">
                    <span className="material-symbols-outlined text-sm text-bone-luminous">arrow_outward</span>
                  </span>
                </a>
                <div className="flex items-center gap-3 text-caption font-caption text-bone-muted opacity-60">
                  <span className="material-symbols-outlined text-xs text-amber-highlight">verified_user</span>
                  <span>Open-source kernel · Zero data telemetry</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full bg-surface-deep border-t border-hairline-rule docked full-width bottom">
        <div className="w-full px-gutter md:px-margin py-space-xl max-w-full mx-auto flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg mb-space-xl">
            <div className="md:col-span-5">
              <span className="font-headline-md text-headline-md italic text-bone-luminous">Stead</span>
              <p className="font-body-sm text-body-sm text-bone-muted opacity-75 mt-3 max-w-md">
                High-precision algorithmic motor dampening protocols for neuromuscular freedom. Paris &amp; New York.
              </p>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-space-md">
              <div className="flex flex-col gap-2">
                <span className="font-label-editorial text-label-editorial text-amber-highlight">Research</span>
                <a className="text-bone-muted font-body-sm text-body-sm opacity-70 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#">Index of Terms</a>
                <a className="text-bone-muted font-body-sm text-body-sm opacity-70 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#">Tremor Kinematics</a>
                <a className="text-bone-muted font-body-sm text-body-sm opacity-70 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#">Laboratory Calibration</a>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-label-editorial text-label-editorial text-amber-highlight">Access</span>
                <a className="text-bone-muted font-body-sm text-body-sm opacity-70 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#">Institutional Inquiries</a>
                <a className="text-bone-muted font-body-sm text-body-sm opacity-70 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#">Privacy Charter</a>
                <a className="text-bone-muted font-body-sm text-body-sm opacity-70 hover:opacity-100 hover:text-amber-highlight transition-all duration-300" href="#">Certified Universal Access</a>
              </div>
              <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                <span className="font-label-editorial text-label-editorial text-amber-highlight">Coordinates</span>
                <p className="text-bone-muted font-caption text-caption opacity-70">
                  System Coordinates 48.8566° N / 74.0060° W
                </p>
                <p className="text-bone-muted font-caption text-caption opacity-50 mt-1">
                  Ref: Palomino Editorial Matrix
                </p>
              </div>
            </div>
          </div>
          <div className="w-full h-[1px] bg-hairline-rule mb-space-md"></div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-bone-muted font-caption text-caption opacity-60 gap-4">
            <span>© Stead Infrastructure. Architectural motor dampening protocols.</span>
            <div className="flex items-center gap-6">
              <a className="hover:text-amber-highlight transition-colors" href="#">Documentation</a>
              <a className="hover:text-amber-highlight transition-colors" href="https://github.com/bitbyrizbit/stead" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
