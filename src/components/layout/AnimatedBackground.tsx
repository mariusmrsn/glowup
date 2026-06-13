"use client";

import { useRef, useId, useEffect } from "react";
import { animate, useMotionValue } from "framer-motion";
import type { AnimationPlaybackControls } from "framer-motion";

function mapRange(v: number, a: number, b: number, c: number, d: number) {
  return c + ((v - a) / (b - a)) * (d - c);
}

export function AnimatedBackground() {
  const uid = useId().replace(/:/g, "");
  const id = `glowup-bg-${uid}`;
  const feColorRef = useRef<SVGFEColorMatrixElement>(null);
  const hue = useMotionValue(0);
  const ctrlRef = useRef<AnimationPlaybackControls | null>(null);

  // speed=18 → duration ~28s cycle for a gentle, slow flow
  const speed = 18;
  const scale = 30;
  const displacementScale = mapRange(scale, 1, 100, 20, 100);
  const animDuration = mapRange(speed, 1, 100, 1000, 50) / 25;
  const freqX = mapRange(scale, 0, 100, 0.001, 0.0005);
  const freqY = mapRange(scale, 0, 100, 0.004, 0.002);

  useEffect(() => {
    ctrlRef.current?.stop();
    hue.set(0);
    ctrlRef.current = animate(hue, 360, {
      duration: animDuration,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear",
      onUpdate: (v) => {
        feColorRef.current?.setAttribute("values", String(v));
      },
    });
    return () => ctrlRef.current?.stop();
  }, [hue, animDuration]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Turbulence layer */}
      <div
        style={{
          position: "absolute",
          inset: -displacementScale,
          filter: `url(#${id}) blur(6px)`,
        }}
      >
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter id={id} colorInterpolationFilters="sRGB">
              <feTurbulence
                result="undulation"
                numOctaves={2}
                baseFrequency={`${freqX},${freqY}`}
                seed={3}
                type="turbulence"
              />
              <feColorMatrix
                ref={feColorRef}
                in="undulation"
                type="hueRotate"
                values="0"
              />
              <feColorMatrix
                in="dist"
                result="circulation"
                type="matrix"
                values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="circulation"
                scale={displacementScale}
                result="dist"
              />
              <feDisplacementMap
                in="dist"
                in2="undulation"
                scale={displacementScale}
                result="output"
              />
            </filter>
          </defs>
        </svg>

        {/* The gradient surface that gets distorted */}
        <div
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, oklch(0.75 0.06 280 / 0.18) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 80% 70%, oklch(0.72 0.07 260 / 0.14) 0%, transparent 55%),
              radial-gradient(ellipse 50% 50% at 50% 10%, oklch(0.78 0.04 250 / 0.10) 0%, transparent 50%),
              radial-gradient(ellipse 70% 40% at 30% 90%, oklch(0.73 0.05 270 / 0.12) 0%, transparent 55%)
            `,
          }}
        />
      </div>

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 dark:opacity-30 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}
