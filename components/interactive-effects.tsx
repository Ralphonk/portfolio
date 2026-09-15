'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

export function ParallaxLayer({children,depth=1,className=''}:{children:ReactNode;depth?:number;className?:string}) {
  const ref=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion();
  const px=useMotionValue(0),py=useMotionValue(0);
  const x=useSpring(px,{stiffness:65,damping:22}),pointerY=useSpring(py,{stiffness:65,damping:22});
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']});
  const scrollY=useTransform(scrollYProgress,[0,1],[0,depth*65]);
  const smoothScroll=useSpring(scrollY,{stiffness:70,damping:24});
  const y=useTransform(()=>pointerY.get()+smoothScroll.get());
  useEffect(()=>{
    if(reduced||!matchMedia('(pointer: fine)').matches)return;
    const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;px.set((e.clientX/innerWidth-.5)*depth*22);py.set((e.clientY/innerHeight-.5)*depth*14);};
    const leave=()=>{px.set(0);py.set(0);};
    window.addEventListener('pointermove',move,{passive:true});window.addEventListener('blur',leave);document.addEventListener('pointerleave',leave);
    return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('blur',leave);document.removeEventListener('pointerleave',leave);};
  },[depth,reduced,px,py]);
  return <motion.div ref={ref} className={'parallax-layer '+className} style={reduced?undefined:{x,y}}>{children}</motion.div>;
}

export function PageProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="reading-progress" style={{scaleX:scrollYProgress}} aria-hidden="true"/>;
}

export function TiltCard({children}:{children:ReactNode}) {
  const reduced=useReducedMotion();
  const x=useMotionValue(0), y=useMotionValue(0);
  const rotateX=useSpring(x,{stiffness:160,damping:22}), rotateY=useSpring(y,{stiffness:160,damping:22});
  return <motion.div className="tilt-card" style={{rotateX,rotateY,transformPerspective:1200}} onPointerMove={e=>{if(reduced||e.pointerType!=='mouse')return;const b=e.currentTarget.getBoundingClientRect();x.set(-((e.clientY-b.top)/b.height-.5)*7);y.set(((e.clientX-b.left)/b.width-.5)*7);}} onPointerLeave={()=>{x.set(0);y.set(0);}}>{children}<span className="card-glint" aria-hidden="true"/></motion.div>;
}

export function Magnetic({children}:{children:ReactNode}) {
  const reduced=useReducedMotion();const x=useMotionValue(0),y=useMotionValue(0);
  const sx=useSpring(x,{stiffness:200,damping:18}),sy=useSpring(y,{stiffness:200,damping:18});
  return <motion.div className="magnetic" style={{x:sx,y:sy}} onPointerMove={e=>{if(reduced||e.pointerType!=='mouse')return;const b=e.currentTarget.getBoundingClientRect();x.set((e.clientX-b.left-b.width/2)*.13);y.set((e.clientY-b.top-b.height/2)*.2);}} onPointerLeave={()=>{x.set(0);y.set(0);}}>{children}</motion.div>;
}

export function RevealHeading() {
  const reduced=useReducedMotion();
  return <h1 aria-label="Good design. Great code. Real impact.">{['Good design.','Great code.','Real impact.'].map((line,i)=><span className={'headline-mask line-'+i} key={line} aria-hidden="true"><motion.span initial={reduced?false:{y:'115%',rotate:4}} animate={{y:0,rotate:0}} transition={{duration:.85,delay:.12+i*.16,ease:[.22,1,.36,1]}}>{line}</motion.span></span>)}</h1>;
}

export function CursorGlow() {
  const ref=useRef<HTMLDivElement>(null);const reduced=useReducedMotion();
  useEffect(()=>{if(reduced||!matchMedia('(pointer: fine)').matches)return;const el=ref.current;if(!el)return;
    const move=(e:PointerEvent)=>{el.style.transform=`translate(${e.clientX}px, ${e.clientY}px)`;el.style.opacity='1';};
    const leave=()=>{el.style.opacity='0';};window.addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);
    return()=>{window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);};
  },[reduced]);
  return <div ref={ref} className="cursor-glow" aria-hidden="true"/>;
}
