'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_FRAMES = 197;
const INITIAL_PRELOAD_DESKTOP = 8;
const INITIAL_PRELOAD_MOBILE = 4;
const PRELOAD_WINDOW = 10;
// Self-hosted frames (public/frames/*.jpg) — reliable, no external dependency.
// The old external host is kept only as a per-image onError fallback.
const LOCAL_BASE = "/frames/";
const VERCEL_BASE = "https://portfolio-assets-sigma.vercel.app/frames-webp/";

export const avatarSequencePerfConfig = {
  totalFrames: TOTAL_FRAMES,
  initialPreloadDesktop: INITIAL_PRELOAD_DESKTOP,
  initialPreloadMobile: INITIAL_PRELOAD_MOBILE,
  preloadWindow: PRELOAD_WINDOW,
  frameBaseUrl: LOCAL_BASE,
};

export function getAvatarFrameUrl(index: number) {
  const num = String(index + 1).padStart(3, '0');
  return `${LOCAL_BASE}ezgif-frame-${num}.jpg`;
}

// Fallback to the external host if a local frame ever fails to load.
export function getAvatarFrameFallbackUrl(index: number) {
  const num = String(index + 1).padStart(3, '0');
  return `${VERCEL_BASE}ezgif-frame-${num}.webp`;
}

const frames = Array.from({ length: TOTAL_FRAMES }, (_, i) => getAvatarFrameUrl(i));

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

  const handleInitialFrameLoad = useCallback(() => {
    if (imgRef.current && !imageCache.has(0)) {
      imageCache.set(0, imgRef.current);
    }
    setLoadedCount((prev) => Math.max(prev, 1));
    setIsReady(true);
  }, []);

  // Initial heavy preload — delayed to prevent blocking the website's initial load and LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      const batchSize = isMobile ? INITIAL_PRELOAD_MOBILE : INITIAL_PRELOAD_DESKTOP;
      for (let i = 0; i < batchSize; i++) {
        preloadFrame(i);
      }
    }, 800); // 0.8s delay gives priority to fonts, CSS, and main text

    return () => clearTimeout(timer);
  }, [preloadFrame, isMobile]);

  // Ready state logic
  useEffect(() => {
    const threshold = 1;
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
    const preloadWindow = PRELOAD_WINDOW;
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

  const criticalThreshold = isMobile ? INITIAL_PRELOAD_MOBILE : INITIAL_PRELOAD_DESKTOP;
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
                    className="absolute inset-y-0 left-0 bg-red-600 shadow-[0_0_20px_rgba(var(--brand-rgb-5),0.5)]"
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
           /* MOBILE FRAME - Smartphone (hardware stays dark in both themes) */
            <div
              className="relative w-[240px] h-[500px] xs:w-[280px] xs:h-[580px] sm:w-[320px] sm:h-[640px] rounded-[3rem] border-[8px] overflow-hidden"
              style={{ background: '#0a0a0a', borderColor: '#1a1a1a', boxShadow: '0 24px 70px -18px rgba(15,18,30,0.55)' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-2xl z-20" style={{ background: '#1a1a1a' }} />
              <div className="w-full h-full relative p-2" style={{ background: '#000', isolation: 'isolate' }}>
                 <img
                   ref={imgRef}
                   src={frames[0]}
                   alt="Avatar Animation Mobile"
                   loading="eager"
                   fetchPriority="high"
                   decoding="async"
                   onLoad={handleInitialFrameLoad}
                   onError={(e) => { const t = e.currentTarget; if (!t.dataset.fb) { t.dataset.fb = '1'; t.src = getAvatarFrameFallbackUrl(0); } }}
                   className="w-full h-full object-cover rounded-[2rem] mix-blend-screen select-none"
                   style={{ willChange: 'contents' }}
                 />
              </div>
           </div>
         ) : (
           /* LAPTOP FRAME - Premium ultrabook (hardware stays dark in both themes) */
           <div
             className="relative w-full max-w-[850px] aspect-[16/10] rounded-2xl border-[4px] p-4 flex flex-col gap-4 overflow-visible group"
             style={{ background: '#0d0d0d', borderColor: '#1f1f1f', boxShadow: '0 40px 100px -30px rgba(15,18,30,0.6), 0 10px 30px -12px rgba(15,18,30,0.35)' }}
           >
              {/* Screen Content — always black + isolated, so mix-blend-screen
                  composites against the black screen (not the page behind it).
                  Without isolation, screen-blend washes to white on a light page. */}
              <div className="relative flex-grow w-full h-full rounded-lg overflow-hidden shadow-inner" style={{ background: '#000', borderColor: 'rgba(255,255,255,0.06)', isolation: 'isolate' }}>
                 <img
                   ref={imgRef}
                   src={frames[0]}
                   alt="Avatar Animation Desktop"
                   loading="eager"
                   fetchPriority="high"
                   decoding="async"
                   onLoad={handleInitialFrameLoad}
                   onError={(e) => { const t = e.currentTarget; if (!t.dataset.fb) { t.dataset.fb = '1'; t.src = getAvatarFrameFallbackUrl(0); } }}
                   className="w-full h-full object-contain mix-blend-screen select-none transform scale-110"
                   style={{ willChange: 'contents' }}
                 />
                 {/* Glass reflection */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-30 pointer-events-none" />
              </div>

              {/* Laptop Base (Handle) */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[110%] h-4 rounded-b-xl shadow-2xl" style={{ background: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-[25%] h-1 rounded-full opacity-40" style={{ background: '#000' }} />
           </div>
         )}
      </motion.div>
    </div>
  );
}
