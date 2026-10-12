'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const TOTAL_FRAMES = 197;
const INITIAL_PRELOAD_DESKTOP = 8;
const INITIAL_PRELOAD_MOBILE = 4;
const PRELOAD_WINDOW = 10;
// Optimized WebP frames live on Vercel so the portfolio deployment stays light.
// Local JPEGs remain a resilient fallback if the asset host is unavailable.
const VERCEL_BASE = 'https://portfolio-assets-sigma.vercel.app/frames-webp/';
const LOCAL_BASE = '/frames/';

export const avatarSequencePerfConfig = {
  totalFrames: TOTAL_FRAMES,
  initialPreloadDesktop: INITIAL_PRELOAD_DESKTOP,
  initialPreloadMobile: INITIAL_PRELOAD_MOBILE,
  preloadWindow: PRELOAD_WINDOW,
  frameBaseUrl: VERCEL_BASE,
};

export function getAvatarFrameUrl(index: number) {
  const num = String(index + 1).padStart(3, '0');
  return `${VERCEL_BASE}ezgif-frame-${num}.webp`;
}

export function getAvatarFrameFallbackUrl(index: number) {
  const num = String(index + 1).padStart(3, '0');
  return `${LOCAL_BASE}ezgif-frame-${num}.jpg`;
}

export function getAvatarFrameTarget(current: number, scrollDelta: number) {
  if (!scrollDelta) return current;
  const direction = Math.sign(scrollDelta);
  const step = Math.min(12, Math.max(2, Math.abs(scrollDelta) / 12));
  return Math.max(0, Math.min(TOTAL_FRAMES - 1, current + direction * step));
}

export function shouldHoldAvatarScroll(
  scrollDelta: number,
  targetFrame: number,
  displayedFrame: number,
  loadedFrame: number
) {
  const atFinalFrame =
    targetFrame >= TOTAL_FRAMES - 1 &&
    displayedFrame >= TOTAL_FRAMES - 1 &&
    loadedFrame === TOTAL_FRAMES - 1;
  const atFirstFrame = targetFrame <= 0 && displayedFrame <= 0 && loadedFrame === 0;

  return (scrollDelta > 0 && !atFinalFrame) || (scrollDelta < 0 && !atFirstFrame);
}

const frames = Array.from({ length: TOTAL_FRAMES }, (_, i) => getAvatarFrameUrl(i));

const imageCache = new Map<number, HTMLImageElement>();
const pendingFrames = new Set<number>();

export default function AvatarSequence() {
  const [isMobile, setIsMobile] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const targetFrameRef = useRef(0);
  const displayedFrameRef = useRef(0);
  const lastLoadedFrameRef = useRef(0);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const preloadFrame = useCallback((index: number) => {
    if (
      index < 0 ||
      index >= TOTAL_FRAMES ||
      imageCache.has(index) ||
      pendingFrames.has(index)
    ) return;

    const img = new Image();
    pendingFrames.add(index);
    const commitFrame = () => {
      pendingFrames.delete(index);
      imageCache.set(index, img);
      if (Math.round(targetFrameRef.current) === index && imgRef.current) {
        imgRef.current.dataset.frame = String(index);
        imgRef.current.style.opacity = '1';
        imgRef.current.src = img.src;
        lastLoadedFrameRef.current = index;
      }
    };
    img.onload = () => {
      void img.decode().catch(() => undefined).then(commitFrame);
    };
    img.onerror = () => {
      if (img.src !== new URL(getAvatarFrameFallbackUrl(index), window.location.href).href) {
        img.src = getAvatarFrameFallbackUrl(index);
      } else {
        pendingFrames.delete(index);
      }
    };
    img.src = frames[index];
  }, []);

  const handleFrameLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const element = event.currentTarget;
    const frameIndex = Number(element.dataset.frame || 0);
    if (!imageCache.has(frameIndex)) {
      const cachedFrame = new Image();
      cachedFrame.src = element.currentSrc || element.src;
      imageCache.set(frameIndex, cachedFrame);
    }
    element.style.opacity = '1';
    lastLoadedFrameRef.current = frameIndex;
  }, []);

  // Warm the opening frames, then decode the remaining CDN sequence in small
  // background batches so scrolling becomes smooth without blocking first paint.
  useEffect(() => {
    let cancelled = false;
    let backgroundTimer = 0;
    const initialTimer = window.setTimeout(() => {
      const batchSize = isMobile ? INITIAL_PRELOAD_MOBILE : INITIAL_PRELOAD_DESKTOP;
      for (let i = 0; i < batchSize; i++) {
        preloadFrame(i);
      }
    }, 250);

    let nextFrame = isMobile ? INITIAL_PRELOAD_MOBILE : INITIAL_PRELOAD_DESKTOP;
    const chunkSize = isMobile ? 3 : 6;
    const chunkDelay = isMobile ? 180 : 100;
    const preloadNextChunk = () => {
      if (cancelled || nextFrame >= TOTAL_FRAMES) return;
      const end = Math.min(nextFrame + chunkSize, TOTAL_FRAMES);
      while (nextFrame < end) preloadFrame(nextFrame++);
      backgroundTimer = window.setTimeout(preloadNextChunk, chunkDelay);
    };

    backgroundTimer = window.setTimeout(preloadNextChunk, 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearTimeout(backgroundTimer);
    };
  }, [preloadFrame, isMobile]);

  const paintFrame = useCallback((index: number) => {
    const frameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    if (frameIndex === lastLoadedFrameRef.current || !imgRef.current) return true;

    const cachedFrame = imageCache.get(frameIndex);
    if (!cachedFrame) return false;

    imgRef.current.dataset.frame = String(frameIndex);
    imgRef.current.dataset.fallback = 'false';
    imgRef.current.style.opacity = '1';
    imgRef.current.src = cachedFrame.src;
    lastLoadedFrameRef.current = frameIndex;
    return true;
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    const animateTowardsTarget = () => {
      const difference = targetFrameRef.current - displayedFrameRef.current;
      displayedFrameRef.current =
        Math.abs(difference) < 0.15
          ? targetFrameRef.current
          : displayedFrameRef.current + difference * 0.16;

      const desiredFrame = Math.round(displayedFrameRef.current);
      if (!paintFrame(desiredFrame)) preloadFrame(desiredFrame);

      if (Math.abs(targetFrameRef.current - displayedFrameRef.current) >= 0.15) {
        animationFrame = window.requestAnimationFrame(animateTowardsTarget);
      } else {
        paintFrame(targetFrameRef.current);
        animationFrame = 0;
      }
    };

    const startAnimation = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(animateTowardsTarget);
      }
    };

    const preloadAround = (frame: number) => {
      const roundedFrame = Math.round(frame);
      for (
        let i = Math.max(0, roundedFrame - PRELOAD_WINDOW);
        i < Math.min(roundedFrame + PRELOAD_WINDOW + 1, TOTAL_FRAMES);
        i++
      ) preloadFrame(i);
    };

    const advanceSequence = (delta: number) => {
      targetFrameRef.current = getAvatarFrameTarget(targetFrameRef.current, delta);
      preloadAround(targetFrameRef.current);
      startAnimation();
    };

    const getHeroGate = () => {
      const hero = document.getElementById('hero');
      if (!hero) return null;
      const top = hero.getBoundingClientRect().top;
      const tolerance = Math.min(120, window.innerHeight * 0.15);
      return top <= 8 && top >= -tolerance ? { top } : null;
    };

    const pinHero = (top: number) => {
      if (Math.abs(top) > 1) {
        window.scrollTo({ top: window.scrollY + top, behavior: 'auto' });
      }
    };

    const shouldHoldScroll = (delta: number) => {
      return shouldHoldAvatarScroll(
        delta,
        targetFrameRef.current,
        displayedFrameRef.current,
        lastLoadedFrameRef.current
      );
    };

    const handleWheel = (event: WheelEvent) => {
      if (!event.deltaY) return;
      const gate = getHeroGate();
      if (!gate || !shouldHoldScroll(event.deltaY)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      pinHero(gate.top);
      advanceSequence(event.deltaY);
    };

    let touchStartY = 0;
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - touchY;
      if (Math.abs(delta) < 2) return;

      const gate = getHeroGate();
      if (!gate || !shouldHoldScroll(delta)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      pinHero(gate.top);
      advanceSequence(delta * 1.5);
      touchStartY = touchY;
    };

    const hero = document.getElementById('hero');
    if (hero && hero.getBoundingClientRect().top < -120) {
      targetFrameRef.current = TOTAL_FRAMES - 1;
      displayedFrameRef.current = TOTAL_FRAMES - 1;
      preloadAround(TOTAL_FRAMES - 1);
      startAnimation();
    }

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheel, true);
      window.removeEventListener('touchstart', handleTouchStart, true);
      window.removeEventListener('touchmove', handleTouchMove, true);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [paintFrame, preloadFrame]);

  const handleFrameError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.dataset.fallback === 'true') {
      image.style.opacity = '0';
      return;
    }

    const frameIndex = Number(image.dataset.frame || targetFrameRef.current);
    image.dataset.fallback = 'true';
    image.src = getAvatarFrameFallbackUrl(frameIndex);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-visible">
      {/* DEVICE FRAME WRAPPER */}
      <motion.div
        initial={{ scale: 0.98, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full flex items-center justify-center"
      >
         {isMobile ? (
           /* MOBILE FRAME - Smartphone (hardware stays dark in both themes) */
            <div
              data-preserve-dark
              className="relative w-[240px] h-[500px] xs:w-[280px] xs:h-[580px] sm:w-[320px] sm:h-[640px] rounded-[3rem] border-[8px] overflow-hidden"
              style={{ background: '#0a0a0a', borderColor: '#1a1a1a', boxShadow: '0 24px 70px -18px rgba(15,18,30,0.55)' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-2xl z-20" style={{ background: '#1a1a1a' }} />
              <div
                className="w-full h-full relative p-2 bg-center bg-cover bg-no-repeat"
                style={{ backgroundColor: '#000', backgroundImage: `url(${getAvatarFrameFallbackUrl(0)})` }}
              >
                 <img
                   ref={imgRef}
                   src={frames[0]}
                   data-frame="0"
                   alt="Avatar Animation Mobile"
                   loading="eager"
                   fetchPriority="high"
                   decoding="async"
                   onLoad={handleFrameLoad}
                   onError={handleFrameError}
                   className="w-full h-full object-cover rounded-[2rem] select-none transition-opacity duration-150"
                 />
              </div>
           </div>
         ) : (
           /* LAPTOP FRAME - Premium ultrabook (hardware stays dark in both themes) */
           <div
             data-preserve-dark
             className="relative w-full max-w-[850px] aspect-[16/10] rounded-2xl border-[4px] p-4 flex flex-col gap-4 overflow-visible group"
             style={{ background: '#0d0d0d', borderColor: '#1f1f1f', boxShadow: '0 40px 100px -30px rgba(15,18,30,0.6), 0 10px 30px -12px rgba(15,18,30,0.35)' }}
           >
              <div
                className="relative flex-grow w-full h-full rounded-lg overflow-hidden bg-center bg-contain bg-no-repeat shadow-inner"
                style={{
                  backgroundColor: '#000',
                  backgroundImage: `url(${getAvatarFrameFallbackUrl(0)})`,
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
              >
                 <img
                   ref={imgRef}
                   src={frames[0]}
                   data-frame="0"
                   alt="Avatar Animation Desktop"
                   loading="eager"
                   fetchPriority="high"
                   decoding="async"
                   onLoad={handleFrameLoad}
                   onError={handleFrameError}
                   className="w-full h-full object-contain select-none transform scale-110 transition-opacity duration-150"
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
