"use client";

import { useEffect, useRef, useState } from "react";

interface BubbleData {
  x: number;
  y: number;
  move: number;
  color: string;
  radius: number;
}

// GlowUp color palette: deep indigo, violet, silver, midnight purple
const GLOWUP_COLORS = ["#6366f1", "#8b5cf6", "#4338ca", "#7c3aed", "#9090a8"];

export function BubbleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const bubblesRef = useRef<BubbleData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bubblesRef.current = Array.from({ length: 22 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        move: Math.random() * 5 - 10,
        color: GLOWUP_COLORS[Math.floor(Math.random() * GLOWUP_COLORS.length)]!,
        radius: Math.floor(Math.random() * 220) + 40,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const time = Date.now() * 0.0005;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(40px)";

      // Radial gradient background — dark indigo tones
      const cx = canvas.width / 2 + Math.cos(time + 100) * 300;
      const cy = canvas.height / 2 + Math.sin(time + 100) * 300;
      const grd = ctx.createRadialGradient(cx, cy, 0, canvas.width, canvas.height, canvas.width);
      grd.addColorStop(0, "#1e1b4b");
      grd.addColorStop(0.3, "#111118");
      grd.addColorStop(0.7, "#0d0d18");
      grd.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "lighter";
      for (const b of bubblesRef.current) {
        b.x -= Math.sin(time + b.move) * b.move;
        b.y += Math.cos(time - b.move) * b.move;
        ctx.beginPath();
        ctx.fillStyle = b.color;
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [mounted]);

  if (!mounted) return <div className="fixed inset-0 bg-[#0d0d18]" />;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
