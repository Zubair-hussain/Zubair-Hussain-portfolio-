'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_FRAMES = 197;
const CRITICAL_FRAMES_DESKTOP = 60;
const CRITICAL_FRAMES_MOBILE = 30;
const VERCEL_BASE = "https://portfolio-assets-sigma.vercel.app/frames-webp/";

const frames = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  return `${VERCEL_BASE}ezgif-frame-${num}.webp`;
});

const imageCache = new Map<number, HTMLImageElement>();

export default function AvatarSequence() {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const currentFrameRef = useRef(0);
  const lastLoadedFrameRef = useRef(0);
  const isLockedRef = useRef(true);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const preloadFrame = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_FRAMES || imageCache.has(index)) return;

    const img = new Image();
    img.src = frames[index];
    img.onload = () => {
      imageCache.set(index, img);
      setLoadedCount(prev => prev + 1);
    };
  }, []);

  // Initial heavy preload — delayed to prevent blocking the website's initial load and LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      const batchSize = isMobile ? 30 : (CRITICAL_FRAMES_DESKTOP + 20);
      for (let i = 0; i < batchSize; i++) {
        preloadFrame(i);
      }
    }, 800); // 0.8s delay gives priority to fonts, CSS, and main text

    return () => clearTimeout(timer);
  }, [preloadFrame, isMobile]);

  // Ready state logic
  useEffect(() => {
    const threshold = isMobile ? CRITICAL_FRAMES_MOBILE : CRITICAL_FRAMES_DESKTOP;
    if (loadedCount >= threshold) {
      setTimeout(() => setIsReady(true), 500);
    }
  }, [loadedCount, isMobile]);

  const setFrame = useCallback((index: number) => {
    const frameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
    if (frameIndex === currentFrameRef.current) return;

    currentFrameRef.current = frameIndex;

    if (imgRef.current) {
      if (imageCache.has(frameIndex)) {
        imgRef.current.src = frames[frameIndex];
        lastLoadedFrameRef.current = frameIndex;
      } else {
        imgRef.current.src = frames[lastLoadedFrameRef.current];
      }
    }

    // Proactive preloading
    const preloadWindow = 40;
    for (let i = frameIndex; i < Math.min(frameIndex + preloadWindow, TOTAL_FRAMES); i++) {
        preloadFrame(i);
    }
  }, [preloadFrame]);

  useEffect(() => {
    if (!isReady) return;

    const handleWheel = (e: WheelEvent) => {
       const delta = e.deltaY;
       if (Math.abs(delta) < 2) return;

       // UP SCROLL IS FREE: Never prevent default or lock
       if (delta < 0) {
          isLockedRef.current = false;
          if ((window as any).lenis) (window as any).lenis.start();
          return;
       }

       // DOWN SCROLL LOCKS: While in Hero and frames available
       if (isLockedRef.current && delta > 0) {
          const speedMultiplier = 4;
          const nextFrame = currentFrameRef.current + speedMultiplier;

          if (nextFrame < TOTAL_FRAMES) {
             e.preventDefault();
             setFrame(nextFrame);
             if ((window as any).lenis) (window as any).lenis.stop();
          } else {
             isLockedRef.current = false;
             if ((window as any).lenis) (window as any).lenis.start();
          }
       }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      if (Math.abs(deltaY) < 5) return;

      // UP SWIPE (Scroll Up) IS FREE
      if (deltaY < 0) {
         isLockedRef.current = false;
         if ((window as any).lenis) (window as any).lenis.start();
         return;
      }

      // DOWN SWIPE (Scroll Down) LOCKS
      if (isLockedRef.current && deltaY > 0) {
        // Increase touch speed multiplier significantly for mobile so it finishes on a single swipe
        const touchMultiplier = isMobile ? 8 : 4;
        const nextFrame = currentFrameRef.current + touchMultiplier;

        if (nextFrame < TOTAL_FRAMES) {
           if (e.cancelable) e.preventDefault();
           setFrame(nextFrame);
           touchStartY = touchY;
           if ((window as any).lenis) (window as any).lenis.stop();
        } else {
           isLockedRef.current = false;
           if ((window as any).lenis) (window as any).lenis.start();
        }
      }
    };

    const handleScroll = () => {
       const hero = document.getElementById('hero');
       if (!hero) return;
       const { top, bottom } = hero.getBoundingClientRect();
       
       const isAtEnd = currentFrameRef.current >= TOTAL_FRAMES - 1;
       const isAtVeryTop = top >= -5;

       if (top <= 0 && bottom >= window.innerHeight && !isAtEnd && !isAtVeryTop) {
          if (!isLockedRef.current) isLockedRef.current = true;
       }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      if ((window as any).lenis) (window as any).lenis.start();
    };
  }, [isReady, setFrame]);

  const criticalThreshold = isMobile ? CRITICAL_FRAMES_MOBILE : CRITICAL_FRAMES_DESKTOP;
  const progress = Math.min(100, Math.round((loadedCount / criticalThreshold) * 100));

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-visible">
      {/* PROFESSIONAL SPLASH SCREEN */}
      <AnimatePresence>
        {!isReady && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="relative flex flex-col items-center gap-12 w-full max-w-sm px-8">
               {/* Progress Text */}
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center gap-3"
               >
                 <span className="text-red-500 font-mono text-[10px] tracking-[0.5em] uppercase font-bold animate-pulse">
                   Initialising Essence
                 </span>
                 <h2 className="text-white text-5xl font-black italic tracking-tighter">
                   {progress}%
                 </h2>
               </motion.div>

               {/* Progress Bar Container */}
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="absolute inset-y-0 left-0 bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                  />
               </div>

               {/* Hint */}
               <p className="text-white/20 font-mono text-[8px] tracking-[0.2em] uppercase text-center mt-4">
                 Best experienced on Desktop for full fidelity
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEVICE FRAME WRAPPER */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={isReady ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full flex items-center justify-center"
      >
         {isMobile ? (
           /* MOBILE FRAME - Smartphone */
            <div className="relative w-[240px] h-[500px] xs:w-[280px] xs:h-[580px] sm:w-[320px] sm:h-[640px] bg-[#0a0a0a] rounded-[3rem] border-[8px] border-[#1a1a1a] shadow-[0_0_80px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.05)] overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-20" />
              <div className="w-full h-full relative p-2">
                 <img
                   ref={imgRef}
                   src={frames[0]}
                   alt="Avatar Animation Mobile"
                   className="w-full h-full object-cover rounded-[2rem] mix-blend-screen select-none"
                   style={{ willChange: 'contents' }}
                 />
              </div>
           </div>
         ) : (
           /* LAPTOP FRAME - Premium ultrabook */
           <div className="relative w-full max-w-[850px] aspect-[16/10] bg-[#0d0d0d] rounded-2xl border-[4px] border-[#1f1f1f] shadow-[0_0_100px_rgba(0,0,0,1),0_0_40px_rgba(239,68,68,0.1)] p-4 flex flex-col gap-4 overflow-visible group">
              {/* Screen Content */}
              <div className="relative flex-grow w-full h-full bg-black rounded-lg overflow-hidden border border-white/5 shadow-inner">
                 <img
                   ref={imgRef}
                   src={frames[0]}
                   alt="Avatar Animation Desktop"
                   className="w-full h-full object-contain mix-blend-screen select-none transform scale-110"
                   style={{ willChange: 'contents' }}
                 />
                 {/* Glass reflection */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-30 pointer-events-none" />
              </div>
              
              {/* Laptop Base (Handle) */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[110%] h-4 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-b-xl border-t border-white/10 shadow-2xl" />
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-[25%] h-1 bg-black rounded-full opacity-40" />
           </div>
         )}
      </motion.div>
    </div>
  );
}