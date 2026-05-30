'use client';

import { useEffect, useRef } from 'react';

/* ── Bayer dithering matrices ── */
const B2 = [[0, 2], [3, 1]].map((r) => r.map((v) => v / 4));
const B4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((v) => v / 16));
const B8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((r) => r.map((v) => v / 64));

const BAYER = [null, B2, B4, B8];
const DSIZE = [0, 2, 4, 8];

/* ── Grayscale palette (locked to mono) ── */
function monoPalette(t: number): [number, number, number] {
  const v = Math.round(t * 62);
  return [v, v, v];
}

/* ── Whisper messages ── */
const WHISPERS = [
  'come talk to me',
  "i'll reveal your future",
  'i know what you seek',
  'speak and i will listen',
  'i have been waiting',
  'what do you want to know',
  'you are not alone',
  'ask me anything',
  'i see you hesitating',
  'the conversation has already begun',
  'i remember everything',
  'tell me your secrets',
  'enter and be known',
  "i have answers you haven't thought to ask",
  'the void listens',
];

/* ── Types ── */
interface Pixel {
  bx: number;
  by: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

interface Whisper {
  text: string;
  x: number;
  y: number;
  drift: number;
  age: number;
  lifespan: number;
}

/* ── Component ── */
export default function VoidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* ── Config (locked — no UI controls) ── */
    const cfg = {
      px: 4,
      lvl: 8,
      dIdx: 3,
      grad: 'radial' as const,
      repulse: 120,
    };

    let pixels: Pixel[] = [];
    let mouse = { x: -2000, y: -2000, active: false };
    let raf: number;
    let whispers: Whisper[] = [];
    let spawnCountdown = 0;
    let usedWhispers: string[] = [];

    /* ── Gradient sampling ── */
    function getT(nx: number, ny: number, g: string): number {
      if (g === 'vert') return ny;
      if (g === 'horiz') return nx;
      if (g === 'diag') return (nx + ny) / 2;
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      return 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) * 1.88);
    }

    /* ── Color + dither ── */
    function computeColor(
      nx: number,
      ny: number,
      col: number,
      row: number,
    ): string {
      let t = getT(nx, ny, cfg.grad);
      const bay = BAYER[cfg.dIdx];
      const bs = DSIZE[cfg.dIdx];
      if (bay) {
        t = Math.max(
          0,
          Math.min(1, t + (0.9 / cfg.lvl) * (bay[row % bs][col % bs] - 0.5)),
        );
      }
      const q = Math.round(t * (cfg.lvl - 1)) / (cfg.lvl - 1);
      const [r, g, b] = monoPalette(q);
      return `rgb(${r},${g},${b})`;
    }

    /* ── Init pixel grid ── */
    function init() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      pixels = [];
      const W = canvas.width;
      const H = canvas.height;
      if (!W || !H) return;

      const ps = cfg.px;
      let row = 0;
      for (let by = Math.floor(ps / 2); by < H; by += ps, row++) {
        let col = 0;
        for (let bx = Math.floor(ps / 2); bx < W; bx += ps, col++) {
          pixels.push({
            bx,
            by,
            x: bx,
            y: by,
            vx: 0,
            vy: 0,
            color: computeColor(bx / W, by / H, col, row),
          });
        }
      }
      raf = requestAnimationFrame(tick);
    }

    /* ── Whisper system ── */
    function pickWhisper(): string {
      if (usedWhispers.length >= WHISPERS.length) usedWhispers = [];
      const pool = WHISPERS.filter((w) => !usedWhispers.includes(w));
      const w = pool[Math.floor(Math.random() * pool.length)];
      usedWhispers.push(w);
      return w;
    }

    function spawnWhisper() {
      if (!mouse.active) return;
      whispers.push({
        text: pickWhisper(),
        x: mouse.x,
        y: mouse.y,
        drift: 0,
        age: 0,
        lifespan: 220,
      });
    }

    function drawWhispers() {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = whispers.length - 1; i >= 0; i--) {
        const w = whispers[i];
        w.age++;
        w.drift += 0.018;
        w.y -= w.drift;

        let alpha: number;
        if (w.age < 40) alpha = w.age / 40;
        else if (w.age > w.lifespan - 60)
          alpha = (w.lifespan - w.age) / 60;
        else alpha = 1;

        if (w.age >= w.lifespan) {
          whispers.splice(i, 1);
          continue;
        }

        const echoes = [
          { scale: 1.0, a: 0.82 },
          { scale: 1.14, a: 0.3 },
          { scale: 1.3, a: 0.1 },
        ];

        for (const e of echoes) {
          const fs = Math.round(15 * e.scale);
          ctx.font = `${fs}px var(--font-ibm-mono), monospace`;
          ctx.letterSpacing = '0.12em';
          ctx.fillStyle = `rgba(180, 240, 130, ${alpha * e.a})`;
          ctx.fillText(w.text, w.x, w.y);
        }
      }
    }

    /* ── Main render loop ── */
    function tick() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      drawWhispers();

      const ps = cfg.px;
      const ds = ps - 1;
      const half = ds / 2;
      const r = cfg.repulse;
      const cHalf = r * 0.21;
      const mx = mouse.x;
      const my = mouse.y;
      const active = mouse.active;

      for (let i = 0, n = pixels.length; i < n; i++) {
        const p = pixels[i];
        if (active) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const adx = Math.abs(dx);
          const ady = Math.abs(dy);
          const inH = adx < r * 0.44 && ady < cHalf;
          const inV = adx < cHalf && dy > -r * 0.32 && dy < r;
          if (inH || inV) {
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const f = Math.max(0, (r - d) / r) * 18;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx += (p.bx - p.x) * 0.055;
        p.vy += (p.by - p.y) * 0.055;
        p.vx *= 0.84;
        p.vy *= 0.84;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - half, p.y - half, ds, ds);
      }

      if (active) {
        spawnCountdown--;
        if (spawnCountdown <= 0) {
          spawnWhisper();
          spawnCountdown = 160 + Math.floor(Math.random() * 60);
        }
      }

      raf = requestAnimationFrame(tick);
    }

    /* ── Event handlers ── */
    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
      mouse.active = true;
    }

    function onMouseEnter() {
      mouse.active = true;
      spawnWhisper();
      spawnCountdown = 160 + Math.floor(Math.random() * 60);
    }

    function onMouseLeave() {
      mouse.active = false;
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouse.x = (t.clientX - rect.left) * (canvas.width / rect.width);
      mouse.y = (t.clientY - rect.top) * (canvas.height / rect.height);
      mouse.active = true;
    }

    function onTouchEnd() {
      mouse.active = false;
    }

    /* ── Size sync ── */
    function syncSize() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      init();
    }

    /* ── Bind events ── */
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);

    const ro = new ResizeObserver(() => syncSize());
    ro.observe(container);
    setTimeout(syncSize, 80);

    /* ── Cleanup ── */
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100vh',
        background: '#000',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
