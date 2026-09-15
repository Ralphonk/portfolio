'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Pause, Play, RotateCcw, Move3D, Box } from 'lucide-react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default function HeroScene() {
  const mount = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [accent, setAccent] = useState<'lime' | 'ice'>('lime');
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const controls = useRef({ paused: false, wireframe: false, accent: 'lime', turn: 0 });
  const redraw = useRef<() => void>(() => { });

  useEffect(() => {
    controls.current = { ...controls.current, paused: paused || !!reduced, wireframe, accent };
    redraw.current();
  }, [paused, reduced, wireframe, accent]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
    catch { setError(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setClearColor(0x151714, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 40);
    camera.position.set(0, 0, 8.5);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    room.dispose(); pmrem.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, .6));
    const key = new THREE.DirectionalLight(0xf1ffdb, 4); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(0xcfff69, 30, 12); rim.position.set(-3, -1, 3); scene.add(rim);
    const sculpture = new THREE.Group(); scene.add(sculpture);
    sculpture.rotation.set(.3, -.2, -.3);
    const chrome = new THREE.MeshPhysicalMaterial({ color: 0xc8d4b7, metalness: 1, roughness: .19, clearcoat: 1, clearcoatRoughness: .1 });
    const neon = new THREE.MeshPhysicalMaterial({ color: 0xcfff69, emissive: 0x7b9e22, emissiveIntensity: .25, metalness: .5, roughness: .25, clearcoat: 1 });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.03, .32, 180, 24, 2, 3), chrome);
    sculpture.add(knot);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.61, 1), neon); sculpture.add(core);
    const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xd5ff63, emissive: 0x97c73b, emissiveIntensity: .55, metalness: .7, roughness: .25 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, .011, 8, 160), ringMaterial);
    ringA.rotation.set(1.18, .15, -.35); sculpture.add(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.27, .007, 8, 160), chrome);
    ringB.rotation.set(.65, -.7, .6); sculpture.add(ringB);
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(.12, 20, 12), neon); sculpture.add(satellite);
    const satelliteB = new THREE.Mesh(new THREE.IcosahedronGeometry(.17, 0), chrome); sculpture.add(satelliteB);
    const points = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      const a = i * 2.399963; const radius = 2.7 + (i % 11) / 7;
      points[i * 3] = Math.cos(a) * radius; points[i * 3 + 1] = Math.sin(a) * radius; points[i * 3 + 2] = Math.sin(i * 1.7) * 1.3 - 1;
    }
    const pointGeometry = new THREE.BufferGeometry(); pointGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const dust = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color: 0xc3d1a6, size: .013, transparent: true, opacity: .65 })); scene.add(dust);
    let frame = 0, time = 0, previous = 0, visible = true, disposed = false;
    const pointer = { x: 0, y: 0 };
    const easedPointer = { x: 0, y: 0 };
    let scrollProgress = 0, easedScroll = 0;
    const render = (now: number) => {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const dt = Math.min((now - previous) / 1000 || 0, .04); previous = now;
      const state = controls.current;
      if (!state.paused) time += dt;
      const follow = 1 - Math.exp(-dt * 4.5);
      easedPointer.x += (pointer.x - easedPointer.x) * follow;
      easedPointer.y += (pointer.y - easedPointer.y) * follow;
      easedScroll += (scrollProgress - easedScroll) * follow;
      if (!state.paused) {
        camera.position.x = easedPointer.x * .85;
        camera.position.y = -easedPointer.y * .55 + easedScroll * .3;
        camera.position.z = 8.5 - easedScroll * .65;
        camera.lookAt(0, 0, 0);
      }
      const icy = state.accent === 'ice';
      neon.color.set(icy ? 0x83eafa : 0xcfff69); neon.emissive.set(icy ? 0x208b9e : 0x7b9e22);
      ringMaterial.color.copy(neon.color); ringMaterial.emissive.copy(neon.emissive); rim.color.copy(neon.color);
      chrome.wireframe = state.wireframe;
      sculpture.rotation.y = -.2 + time * .18 + easedPointer.x * .32 + state.turn;
      sculpture.rotation.x = .3 + easedPointer.y * .2 + easedScroll * .18;
      sculpture.position.y = state.paused ? 0 : Math.sin(time * .8) * .12;
      knot.rotation.z = time * .08;
      core.rotation.set(time * .3, time * .2, .4);
      satellite.position.set(Math.cos(time * .55) * 2.05, Math.sin(time * .55) * .8, Math.sin(time * .55) * 1.85);
      satelliteB.position.set(Math.sin(time * .4 + 2) * 2.27, Math.cos(time * .4 + 2) * 1.4, Math.cos(time * .4 + 2) * 1.6);
      dust.rotation.z = time * .015;
      dust.position.x = -easedPointer.x * .18;
      dust.position.y = easedPointer.y * .12;
      renderer.render(scene, camera);
      if (!state.paused) frame = requestAnimationFrame(render);
    };
    const requestRender = () => { if (!frame && !disposed) frame = requestAnimationFrame(render); };
    redraw.current = requestRender;
    const resize = () => { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); requestRender(); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { previous = performance.now(); requestRender(); } else { cancelAnimationFrame(frame); frame = 0; } }); intersection.observe(host);
    const move = (event: PointerEvent) => { if (event.pointerType !== 'mouse' || controls.current.paused) return; pointer.x = event.clientX / innerWidth - .5; pointer.y = event.clientY / innerHeight - .5; requestRender(); };
    const onScroll = () => { if (controls.current.paused) return; const hero = host.closest('.hero'); if (hero) { const bounds = hero.getBoundingClientRect(); scrollProgress = Math.max(0, Math.min(1, -bounds.top / bounds.height)); requestRender(); } };
    const leave = () => { pointer.x = 0; pointer.y = 0; requestRender(); };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { previous = performance.now(); requestRender(); } };
    const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; visible = false; setError(true); };
    window.addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerleave', leave); window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', visibility); renderer.domElement.addEventListener('webglcontextlost', lost);
    setReady(true); requestRender();
    return () => {
      disposed = true; cancelAnimationFrame(frame); redraw.current = () => { };
      observer.disconnect(); intersection.disconnect(); window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Points) object.geometry.dispose(); });
      chrome.dispose(); neon.dispose(); ringMaterial.dispose(); (dust.material as THREE.Material).dispose(); environment.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  return <div className={'scene-shell' + (accent === 'ice' ? ' scene-ice' : '')}>
    <div className="scene-coordinate scene-coordinate-top">Code. Create. Innovate.<span>VOL. 001</span></div>
    <div ref={mount} className="webgl-stage" role="img" aria-label="Interactive chrome knot with a luminous core and orbiting satellites" />
    {(!ready || error) && <div className="scene-fallback"><Box size={72} strokeWidth={1} /><p>{error ? 'The 3D view isn’t available in this browser.' : 'Loading the third dimension…'}</p></div>}
    <span className="scene-chip"><Move3D size={14} /> PLAY WITH PERSPECTIVE</span>
    <div className="scene-toolbar" aria-label="3D scene controls">
      <div className="scene-modes"><button type="button" disabled={error} aria-pressed={!wireframe} onClick={() => setWireframe(false)}>Solid</button><button type="button" disabled={error} aria-pressed={wireframe} onClick={() => setWireframe(true)}>Wireframe</button></div>
      <button type="button" className="scene-icon" disabled={error} aria-label="Rotate sculpture" onClick={() => { controls.current.turn += Math.PI / 4; redraw.current(); }}><RotateCcw size={16} /></button>
      {!reduced && <button type="button" className="scene-icon" disabled={error} aria-label={paused ? 'Play 3D animation' : 'Pause 3D animation'} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}
      <button type="button" className="scene-swatch" disabled={error} aria-label={accent === 'lime' ? 'Change accent to ice blue' : 'Change accent to lime'} onClick={() => setAccent(accent === 'lime' ? 'ice' : 'lime')} />
    </div>
    <span className="scene-footnote">{reduced ? 'STATIC VIEW · REDUCED MOTION' : 'MOVE YOUR CURSOR · CHANGE THE VIEW'}</span>
  </div>;
}
