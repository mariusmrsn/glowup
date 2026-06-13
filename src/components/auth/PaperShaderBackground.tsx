"use client";

import { useEffect, useRef } from "react";

export function PaperShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const orbs = [
      { x: 0.2,  y: 0.25, r: 0.55, color: "99, 102, 241",  speed: 0.35, phase: 0   },
      { x: 0.78, y: 0.65, r: 0.50, color: "139, 92, 246",  speed: 0.28, phase: 2.1 },
      { x: 0.5,  y: 0.85, r: 0.42, color: "168, 85, 247",  speed: 0.45, phase: 4.2 },
      { x: 0.85, y: 0.15, r: 0.38, color: "79, 70, 229",   speed: 0.22, phase: 1.5 },
    ];

    const draw = () => {
      t += 0.004;
      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = "#0d0d18";
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "screen";

      for (const orb of orbs) {
        const cx = W * (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.18);
        const cy = H * (orb.y + Math.cos(t * orb.speed * 0.75 + orb.phase) * 0.14);
        const radius = Math.min(W, H) * orb.r;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${orb.color}, 0.22)`);
        grad.addColorStop(0.5, `rgba(${orb.color}, 0.08)`);
        grad.addColorStop(1, `rgba(${orb.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* Animated gradient canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {/* Paper grain overlay via SVG noise */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.045,
        }}
      />
    </>
  );
}
