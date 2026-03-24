'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Only on pointer-fine devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%, -50%) scale(3)';
      if (ringRef.current) ringRef.current.style.opacity = '0.5';
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    document.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    function animate() {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot && ring) {
        dot.style.left = `${posRef.current.x}px`;
        dot.style.top = `${posRef.current.y}px`;

        ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.12;
        ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.12;
        ring.style.left = `${ringPosRef.current.x}px`;
        ring.style.top = `${ringPosRef.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
