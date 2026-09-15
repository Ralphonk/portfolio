'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | undefined;
    const syncLock = () => {
      if (!lenis) return;
      // Radix uses react-remove-scroll to lock the body while a dialog is open.
      if (document.hidden || document.body.hasAttribute('data-scroll-locked')) lenis.stop();
      else lenis.start();
    };
    const configure = () => {
      lenis?.destroy(); lenis = undefined;
      if (preference.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: .09,
        smoothWheel: true,
        syncTouch: false,
        anchors: { offset: -24 },
        prevent: node => node.hasAttribute('data-lenis-prevent') || node.tagName === 'TEXTAREA',
      });
      syncLock();
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
    preference.addEventListener('change', configure);
    document.addEventListener('visibilitychange', syncLock);
    configure();
    return () => { observer.disconnect(); preference.removeEventListener('change', configure); document.removeEventListener('visibilitychange', syncLock); lenis?.destroy(); };
  }, []);
  return null;
}
