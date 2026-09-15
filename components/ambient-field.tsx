'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

type Particle = { u:number; v:number; depth:number; phase:number; x:number; y:number; vx:number; vy:number; size:number };

export default function AmbientField() {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const reduced=useReducedMotion();
  const [paused,setPaused]=useState(false);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas||reduced||paused)return;
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx)return;
    const fine=matchMedia('(pointer: fine)').matches;
    let width=innerWidth,height=innerHeight,frame=0,last=0,time=0,disposed=false;
    let scroll=window.scrollY,scrollTarget=window.scrollY;
    const pointer={x:-10000,y:-10000,dx:0,dy:0,active:false};
    const camera={x:0,y:0};
    let particles:Particle[]=[];
    let seed=431;
    const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    const resize=()=>{
      width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio,1.5);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      seed=431;
      const count=Math.min(fine?1050:260,Math.round(width*height/(fine?1500:3500)));
      particles=Array.from({length:count},()=>{
        const u=random(),v=random(),depth=.25+random()*.75;
        return {u,v,depth,phase:random()*Math.PI*2,x:u*width,y:v*height,vx:0,vy:0,size:.45+depth*1.25};
      });
    };
    const move=(event:PointerEvent)=>{
      if(event.pointerType!=='mouse')return;
      const wasActive=pointer.active;
      pointer.dx=wasActive?Math.max(-30,Math.min(30,event.clientX-pointer.x)):0;
      pointer.dy=wasActive?Math.max(-30,Math.min(30,event.clientY-pointer.y)):0;
      pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=true;
      wake();
    };
    const leave=()=>{pointer.active=false;pointer.dx=0;pointer.dy=0;};
    const onScroll=()=>{scrollTarget=window.scrollY;};
    const render=(now:number)=>{
      frame=0;if(disposed||document.hidden)return;
      if(last&&now-last<1000/40){frame=requestAnimationFrame(render);return;}
      const dt=Math.min((now-last)/16.667||1,2);last=now;time+=dt*.009;
      ctx.clearRect(0,0,width,height);
      scroll+=(scrollTarget-scroll)*.08*dt;
      const tx=pointer.active?(pointer.x/width-.5):0,ty=pointer.active?(pointer.y/height-.5):0;
      camera.x+=(tx-camera.x)*.05*dt;camera.y+=(ty-camera.y)*.05*dt;
      const radius=Math.min(175,width*.25);
      if(pointer.active){
        const glow=ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,radius*1.7);
        glow.addColorStop(0,'rgba(175,226,111,0.055)');glow.addColorStop(.45,'rgba(128,193,148,0.025)');glow.addColorStop(1,'rgba(128,193,148,0)');
        ctx.fillStyle=glow;ctx.fillRect(pointer.x-radius*1.7,pointer.y-radius*1.7,radius*3.4,radius*3.4);
      }
      for(const p of particles){
        const baseX=p.u*width+Math.sin(time*.28+p.phase)*12*p.depth+camera.x*45*p.depth;
        const scrollShift=(scroll*.09*p.depth)%(height+100);
        const baseY=((p.v*(height+100)-scrollShift+height+100)%(height+100))-50+Math.sin(p.u*7+time*.3+p.phase)*15*p.depth+camera.y*28*p.depth;
        // Wrap the field without streaking a particle across the viewport.
        if(Math.abs(p.y-baseY)>height*.7){p.y=baseY;p.vy=0;}
        p.vx+=(baseX-p.x)*.009*dt;p.vy+=(baseY-p.y)*.009*dt;
        const dx=p.x-pointer.x,dy=p.y-pointer.y,dist=Math.hypot(dx,dy);
        let energy=0;
        if(pointer.active&&dist<radius){
          energy=(1-dist/radius)**2;
          const angle=dist<1?p.phase:Math.atan2(dy,dx);
          p.vx+=(Math.cos(angle)*1.9+pointer.dx*.07)*energy*dt;
          p.vy+=(Math.sin(angle)*1.9+pointer.dy*.07)*energy*dt;
        }
        p.vx*=Math.pow(.91,dt);p.vy*=Math.pow(.91,dt);p.x+=p.vx*dt;p.y+=p.vy*dt;
        const opacity=.11+p.depth*.28+energy*.4;
        ctx.fillStyle=`rgba(${energy>.08?'208,255,134':'149,181,138'},${opacity})`;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size+energy*.7,0,Math.PI*2);ctx.fill();
        if(energy>.03){ctx.strokeStyle=`rgba(199,255,131,${energy*.22})`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*4,p.y-p.vy*4);ctx.stroke();}
      }
      pointer.dx*=.8;pointer.dy*=.8;
      frame=requestAnimationFrame(render);
    };
    function wake(){if(!frame&&!document.hidden&&!disposed){last=performance.now();frame=requestAnimationFrame(render);}}
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
    resize();wake();
    window.addEventListener('resize',resize);window.addEventListener('pointermove',move,{passive:true});window.addEventListener('scroll',onScroll,{passive:true});
    document.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);document.addEventListener('visibilitychange',visibility);
    return()=>{disposed=true;cancelAnimationFrame(frame);ctx.clearRect(0,0,width,height);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('scroll',onScroll);document.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);document.removeEventListener('visibilitychange',visibility);};
  },[paused,reduced]);
  return <><div className="ambient-field" aria-hidden="true"><canvas ref={canvasRef}/></div>{!reduced&&<button type="button" className="ambient-toggle" aria-label={paused?'Play background effects':'Pause background effects'} aria-pressed={!paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={12}/>:<Pause size={12}/>}<span>Background {paused?'off':'on'}</span></button>}</>;
}
