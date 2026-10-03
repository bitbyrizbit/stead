"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sfx } from '@/lib/soundEffects';

interface HeroThreeCanvasProps {
  onTargetHit?: (index: number) => void;
}

export default function HeroThreeCanvas({ onTargetHit }: HeroThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [score, setScore] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xf6eed9, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xe8542b, 4, 30);
    pointLight1.position.set(5, 5, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4a6438, 3, 30);
    pointLight2.position.set(-5, -4, 6);
    scene.add(pointLight2);

    // 4. Central 3D Kinematic Gyroscope Ring (Precision Metal Core)
    const gyroGroup = new THREE.Group();
    scene.add(gyroGroup);

    const outerTorusGeo = new THREE.TorusGeometry(3.6, 0.08, 24, 100);
    const outerTorusMat = new THREE.MeshStandardMaterial({
      color: 0x1a1620,
      metalness: 0.85,
      roughness: 0.25,
    });
    const outerTorus = new THREE.Mesh(outerTorusGeo, outerTorusMat);
    gyroGroup.add(outerTorus);

    const innerTorusGeo = new THREE.TorusGeometry(2.6, 0.06, 20, 80);
    const innerTorusMat = new THREE.MeshStandardMaterial({
      color: 0xe8542b,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0xe8542b,
      emissiveIntensity: 0.35,
    });
    const innerTorus = new THREE.Mesh(innerTorusGeo, innerTorusMat);
    gyroGroup.add(innerTorus);

    const fieldRingGeo = new THREE.RingGeometry(1.2, 1.28, 64);
    const fieldRingMat = new THREE.MeshBasicMaterial({
      color: 0x4a6438,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const fieldRing = new THREE.Mesh(fieldRingGeo, fieldRingMat);
    gyroGroup.add(fieldRing);

    // 5. 3D Particle Cloud (Micro-oscillating Tremor Stream)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleOriginals: { x: number; y: number; z: number; speed: number; phase: number }[] = [];

    const colorEmber = new THREE.Color(0xe8542b);
    const colorMoss = new THREE.Color(0x4a6438);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.8 + Math.random() * 2.2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 2;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const mixRatio = (Math.sin(angle * 2) + 1) / 2;
      const col = colorEmber.clone().lerp(colorMoss, mixRatio);
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;

      particleOriginals.push({
        x,
        y,
        z,
        speed: 0.5 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    gyroGroup.add(particleSystem);

    // 6. Interactive 3D Target Nodes
    const targets: { mesh: THREE.Mesh; ring: THREE.Mesh; pos: THREE.Vector3; hit: boolean; pulse: number }[] = [];
    const targetCount = 5;
    const roundStartRef = { current: performance.now() };
    let currentIdx = 0;

    const targetGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const targetRingGeo = new THREE.RingGeometry(0.35, 0.42, 32);

    const initTargets = () => {
      currentIdx = 0;
      roundStartRef.current = performance.now();
      targets.forEach((t) => gyroGroup.remove(t.mesh, t.ring));
      targets.length = 0;

      const angles = [0.2, 1.4, 2.7, 4.1, 5.3];
      for (let i = 0; i < targetCount; i++) {
        const rad = 2.4;
        const x = Math.cos(angles[i]) * rad;
        const y = Math.sin(angles[i]) * (rad * 0.75);
        const z = 0.2;

        const targetMat = new THREE.MeshStandardMaterial({
          color: i === 0 ? 0xe8542b : 0x1a1620,
          emissive: i === 0 ? 0xe8542b : 0x000000,
          emissiveIntensity: 0.5,
          metalness: 0.5,
          roughness: 0.2,
        });

        const ringMat = new THREE.MeshBasicMaterial({
          color: i === 0 ? 0xe8542b : 0x1a1620,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });

        const mesh = new THREE.Mesh(targetGeo, targetMat);
        mesh.position.set(x, y, z);

        const ring = new THREE.Mesh(targetRingGeo, ringMat);
        ring.position.set(x, y, z);

        gyroGroup.add(mesh);
        gyroGroup.add(ring);

        targets.push({ mesh, ring, pos: new THREE.Vector3(x, y, z), hit: false, pulse: 0 });
      }
      setScore(0);
    };

    initTargets();

    // 7. Mouse coordinates & 3D raycasting
    let mouse = new THREE.Vector2(0, 0);
    let targetRotationX = 0;
    let targetRotationY = 0;
    let rawPointerX = 0;
    let rawPointerY = 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;
    let isMouseInside = false;

    // Stabilized Pointer 3D Marker
    const pointerMarkerGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const pointerMarkerMat = new THREE.MeshBasicMaterial({ color: 0xe8542b });
    const pointerMarker = new THREE.Mesh(pointerMarkerGeo, pointerMarkerMat);
    scene.add(pointerMarker);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.x = (clientX / rect.width) * 2 - 1;
      mouse.y = -(clientY / rect.height) * 2 + 1;

      targetRotationY = mouse.x * 0.45;
      targetRotationX = -mouse.y * 0.45;

      // Project into world coordinates at z=0
      rawPointerX = mouse.x * 4.8;
      rawPointerY = mouse.y * 5.6;
      isMouseInside = true;
    };

    const handleMouseEnter = () => {
      setActive(true);
      isMouseInside = true;
    };

    const handleMouseLeave = () => {
      setActive(false);
      isMouseInside = false;
      targetRotationX = 0;
      targetRotationY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gyroscope subtle self-rotation
      gyroGroup.rotation.x += (targetRotationX - gyroGroup.rotation.x) * 0.08;
      gyroGroup.rotation.y += (targetRotationY - gyroGroup.rotation.y) * 0.08;
      innerTorus.rotation.z = time * 0.4;
      innerTorus.rotation.x = Math.sin(time * 0.3) * 0.2;
      outerTorus.rotation.z = -time * 0.2;

      // Dynamic lighting orbit
      pointLight1.position.x = Math.cos(time * 1.2) * 6;
      pointLight1.position.y = Math.sin(time * 0.9) * 5;
      pointLight2.position.x = Math.cos(time * 0.8 + Math.PI) * 6;
      pointLight2.position.y = Math.sin(time * 1.1 + Math.PI) * 5;

      // Simulate Tremor Frequency on raw pointer
      const tremorAmp = 0.22;
      const tremorX = rawPointerX + Math.sin(time * 35) * tremorAmp + Math.sin(time * 75) * (tremorAmp * 0.4);
      const tremorY = rawPointerY + Math.cos(time * 42) * tremorAmp + Math.cos(time * 88) * (tremorAmp * 0.4);

      // STEAD Damping Filter in 3D
      const dampingFactor = 9.0;
      smoothPointerX += (tremorX - smoothPointerX) * Math.min(dampingFactor * delta, 1);
      smoothPointerY += (tremorY - smoothPointerY) * Math.min(dampingFactor * delta, 1);

      // Target Magnetic Horizon Pull
      if (isMouseInside && currentIdx < targets.length) {
        const curTarget = targets[currentIdx];
        const dist = Math.hypot(curTarget.pos.x - smoothPointerX, curTarget.pos.y - smoothPointerY);
        if (dist < 1.4) {
          const pull = (1 - dist / 1.4) * 0.18;
          smoothPointerX += (curTarget.pos.x - smoothPointerX) * pull;
          smoothPointerY += (curTarget.pos.y - smoothPointerY) * pull;

          if (dist < 0.4 && !curTarget.hit) {
            curTarget.hit = true;
            curTarget.pulse = 1.0;
            sfx.playTargetHit(550 + currentIdx * 80);
            (curTarget.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x4a6438);
            (curTarget.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x4a6438);
            setScore((s) => s + 1);
            onTargetHit?.(currentIdx);
            currentIdx++;

            if (currentIdx < targets.length) {
              const nextT = targets[currentIdx];
              (nextT.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xe8542b);
              (nextT.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xe8542b);
            } else {
              const elapsed = (performance.now() - roundStartRef.current) / 1000;
              setBestTime((prev) => (prev === null ? elapsed : Math.min(prev, elapsed)));
              sfx.playRoundComplete();
              setTimeout(initTargets, 1000);
            }
          }
        }
      }

      pointerMarker.position.set(smoothPointerX, smoothPointerY, 0.4);
      pointerMarker.visible = isMouseInside;

      // Animate Target Pulses
      targets.forEach((t) => {
        if (t.pulse > 0) {
          t.ring.scale.setScalar(1 + (1 - t.pulse) * 1.5);
          (t.ring.material as THREE.MeshBasicMaterial).opacity = t.pulse * 0.8;
          t.pulse -= delta * 1.6;
        }
      });

      // Animate Particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const orig = particleOriginals[i];
        const distFromCenter = Math.hypot(orig.x, orig.y);

        const noiseFactor = Math.max(0, (distFromCenter - 1.2) / 3.0);
        const pNoiseX = Math.sin(time * 12 + orig.phase) * 0.08 * noiseFactor;
        const pNoiseY = Math.cos(time * 15 + orig.phase) * 0.08 * noiseFactor;

        const pAngle = Math.atan2(orig.y, orig.x) + orig.speed * delta * 0.4;
        const curRadius = distFromCenter + Math.sin(time * 2 + orig.phase) * 0.15;

        positions[i * 3] = Math.cos(pAngle) * curRadius + pNoiseX;
        positions[i * 3 + 1] = Math.sin(pAngle) * curRadius + pNoiseY;
        positions[i * 3 + 2] = orig.z + Math.sin(time * 3 + orig.phase) * 0.1;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onTargetHit]);

  return (
    <div className="relative w-full max-w-[460px] mx-auto lg:mx-0">
      {/* 3D Kinetic Chamber Chassis */}
      <div className="relative rounded-3xl border-2 border-ink/20 bg-cream-paper/95 p-3 shadow-retro-lg overflow-hidden">
        {/* Top telemetry bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-ink/10 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${active ? 'bg-moss animate-pulse' : 'bg-ember'}`} />
            <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">
              {active ? '3D Gravitational Field Active' : 'Standby Mode'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted text-[11px] font-medium">
            <span>{score}/5 LOCKED</span>
          </div>
        </div>

        {/* 3D WebGL Mount */}
        <div
          ref={mountRef}
          className="relative w-full aspect-[4/5] rounded-2xl bg-[#120f18] overflow-hidden cursor-none"
          data-cursor="hover"
        >
          {/* Obsidian Idle Screen (No overlapping center text) */}
          <div
            className={`absolute inset-0 bg-[#120f18] transition-opacity duration-500 z-10 flex flex-col items-center justify-between p-6 pointer-events-none ${
              active ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="flex items-center gap-2 text-cream/40 text-[10px] font-sans uppercase tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
              Sensor Array Primed
            </div>
            
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-cream/5 border border-cream/10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-cream/80 animate-ping" />
              </div>
              <p className="font-sans text-xs text-cream/70 uppercase tracking-[0.16em] font-medium">
                Move Inside to Test
              </p>
            </div>

            <div className="text-cream/30 text-[10px] font-sans uppercase tracking-[0.14em]">
              14KB · On-Device WebGL
            </div>
          </div>

          {/* Bottom live metrics chip when active */}
          <div
            className={`absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between px-3.5 py-2 rounded-xl bg-ink/90 backdrop-blur-md text-cream text-[11px] font-sans shadow-sm transition-opacity duration-300 ${
              active ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-ember-soft font-medium">
                <span className="w-2 h-2 rounded-full bg-ember" /> 3D Micro-Tremor
              </span>
              <span className="flex items-center gap-1.5 text-moss-soft font-medium">
                <span className="w-2 h-2 rounded-full bg-moss" /> 0.4ms Damped
              </span>
            </div>
            {bestTime !== null && (
              <span className="text-gold-soft font-bold tnum">
                Best: {bestTime.toFixed(2)}s
              </span>
            )}
          </div>
        </div>

        {/* Bottom Hardware Spec Bar */}
        <div className="flex items-center justify-between px-3 py-2 mt-1 text-[11px] font-sans text-ink-muted">
          <span className="tracking-wider uppercase font-medium">Interactive WebGL Physics</span>
          <span className="tracking-wider uppercase font-medium">Zero Lag · 100% Client-Side</span>
        </div>
      </div>
    </div>
  );
}
