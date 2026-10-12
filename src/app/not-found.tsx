'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Gamepad2,
  Home,
  LockKeyhole,
  RotateCcw,
  Trophy,
  Zap,
} from 'lucide-react';

const COLUMNS = 11;
const ROWS = 7;
const START = { x: 1, y: 5 };
const EXIT = { x: 9, y: 1 };
const FRAGMENTS = new Set(['1,1', '5,1', '9,3', '7,5']);
const OBSTACLES = new Set([
  '3,0', '3,1', '3,2',
  '5,2', '6,2', '7,2',
  '1,3', '2,3',
  '7,4', '8,4', '9,4',
  '5,5', '5,6',
]);

type Direction = 'up' | 'down' | 'left' | 'right';

const directions: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const controls: Array<{ direction: Direction; label: string; icon: typeof ArrowUp }> = [
  { direction: 'up', label: 'Move up', icon: ArrowUp },
  { direction: 'left', label: 'Move left', icon: ArrowLeft },
  { direction: 'down', label: 'Move down', icon: ArrowDown },
  { direction: 'right', label: 'Move right', icon: ArrowRight },
];

const controlPlacement: Record<Direction, string> = {
  up: 'col-start-2 row-start-1',
  left: 'col-start-1 row-start-2',
  down: 'col-start-2 row-start-2',
  right: 'col-start-3 row-start-2',
};

const cellKey = (x: number, y: number) => `${x},${y}`;

export default function NotFound() {
  const router = useRouter();
  const [position, setPosition] = useState(START);
  const [collected, setCollected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [bump, setBump] = useState(false);

  const portalOnline = collected.length === FRAGMENTS.size;
  const score = collected.length * 250 + Math.max(0, 100 - moves * 2);

  const move = useCallback((direction: Direction) => {
    const offset = directions[direction];
    const next = { x: position.x + offset.x, y: position.y + offset.y };
    const nextKey = cellKey(next.x, next.y);
    const outsideGrid = next.x < 0 || next.x >= COLUMNS || next.y < 0 || next.y >= ROWS;

    if (outsideGrid || OBSTACLES.has(nextKey)) {
      setBump(true);
      window.setTimeout(() => setBump(false), 140);
      return;
    }

    setPosition(next);
    setMoves((current) => current + 1);
    if (FRAGMENTS.has(nextKey) && !collected.includes(nextKey)) {
      setCollected((current) => [...current, nextKey]);
    }

    if (next.x === EXIT.x && next.y === EXIT.y && portalOnline) {
      router.push('/');
    }
  }, [collected, portalOnline, position, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const directionByKey: Record<string, Direction> = {
        arrowup: 'up', w: 'up',
        arrowdown: 'down', s: 'down',
        arrowleft: 'left', a: 'left',
        arrowright: 'right', d: 'right',
      };
      const direction = directionByKey[event.key.toLowerCase()];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const restart = () => {
    setPosition(START);
    setCollected([]);
    setMoves(0);
    setBump(false);
  };

  return (
    <main data-theme-surface="dark" className="relative min-h-screen overflow-hidden bg-[#030303] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(220,38,38,0.18),transparent_28%),radial-gradient(circle_at_82%_80%,rgba(127,29,29,0.16),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(239,68,68,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.5)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] opacity-30" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-red-500/20 pb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
          <span className="flex items-center gap-2 text-red-400">
            <Gamepad2 size={15} aria-hidden="true" /> Lost Route Protocol
          </span>
          <span>Error code // 404</span>
        </header>

        <div className="grid items-center gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
          <section aria-labelledby="not-found-title">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.45em] text-red-500">Signal lost</p>
            <h1 id="not-found-title" className="font-display text-[clamp(6rem,19vw,13rem)] font-black italic leading-[0.7] tracking-[-0.08em] text-white">
              404
            </h1>
            <h2 className="mt-7 text-3xl font-black uppercase italic tracking-tight sm:text-5xl">Escape the void.</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/50 sm:text-base">
              This route fell outside the map. Collect all four energy fragments, activate the exit portal,
              and navigate back to Zubair&apos;s portfolio.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
                <Home size={15} aria-hidden="true" /> Skip to home
              </Link>
              <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition hover:border-red-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
                <RotateCcw size={15} aria-hidden="true" /> Restart
              </button>
            </div>
          </section>

          <section aria-label="404 escape game" className="rounded-[1.75rem] border border-red-500/25 bg-black/75 p-3 shadow-[0_0_80px_rgba(153,27,27,0.18)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 grid grid-cols-3 gap-2 font-mono text-[9px] uppercase tracking-[0.16em] sm:text-[10px]">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-white/35">Fragments</span><strong className="mt-1 block text-sm text-red-400">{collected.length}/4</strong>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-white/35">Moves</span><strong className="mt-1 block text-sm text-white">{moves}</strong>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-white/35">Score</span><strong className="mt-1 block text-sm text-white">{score}</strong>
              </div>
            </div>

            <div
              className={`relative grid overflow-hidden rounded-2xl border bg-[#050505] p-1 transition-colors ${bump ? 'border-red-400' : 'border-red-950'}`}
              style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: COLUMNS * ROWS }, (_, index) => {
                const x = index % COLUMNS;
                const y = Math.floor(index / COLUMNS);
                const key = cellKey(x, y);
                const isPlayer = position.x === x && position.y === y;
                const isExit = EXIT.x === x && EXIT.y === y;
                const isFragment = FRAGMENTS.has(key) && !collected.includes(key);
                const isObstacle = OBSTACLES.has(key);

                return (
                  <div key={key} className={`relative aspect-square border border-white/[0.035] ${isObstacle ? 'bg-red-950/35' : 'bg-white/[0.015]'}`}>
                    {isObstacle && <span className="absolute inset-[28%] rotate-45 border border-red-900/60" />}
                    {isFragment && <span className="absolute inset-[28%] rotate-45 animate-pulse bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)]" />}
                    {isExit && (
                      <span className={`absolute inset-[18%] grid place-items-center rounded-full border ${portalOnline ? 'animate-pulse border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.55)]' : 'border-white/15 bg-white/5 text-white/25'}`}>
                        {portalOnline ? <Trophy size="55%" /> : <LockKeyhole size="55%" />}
                      </span>
                    )}
                    {isPlayer && (
                      <span className="absolute inset-[18%] z-10 grid place-items-center rounded-md bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.75)] transition-transform">
                        <Zap size="60%" fill="currentColor" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35" aria-live="polite">
                {portalOnline ? 'Portal online — reach the green exit' : 'Use WASD, arrows, or controls'}
              </p>
              <div className="grid grid-cols-3 gap-2" aria-label="Touch controls">
                {controls.map(({ direction, label, icon: Icon }) => (
                  <button
                    key={direction}
                    type="button"
                    aria-label={label}
                    onClick={() => move(direction)}
                    className={`grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-white active:scale-90 ${controlPlacement[direction]}`}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
