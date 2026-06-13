"use client";

import { motion } from "framer-motion";

const PATHS = [
  "M -60 180 C 120 80 380 320 620 160 S 980 -20 1300 120 S 1700 280 2000 140",
  "M -60 320 C 100 220 360 480 600 300 S 960 80 1280 240 S 1680 400 2000 260",
  "M -60 460 C 140 340 400 600 640 420 S 1000 180 1320 360 S 1700 540 2000 380",
  "M -60 80  C 200 -20 480 240 720 60  S 1080 -160 1400 20 S 1720 200 2000 40",
  "M -60 580 C 180 460 460 700 700 520 S 1060 280 1380 460 S 1720 640 2000 500",
  "M -60 700 C 160 580 440 820 680 640 S 1040 380 1360 560 S 1720 760 2000 620",
  "M -60 840 C 200 720 480 940 720 780 S 1080 520 1400 700 S 1740 880 2000 760",
  "M 0 0   C 240 140 560 -60 800 100 S 1160 280 1480 80 S 1760 -80 2000 60",
  "M -60 240 C 120 140 380 380 620 220 S 980 20  1300 180 S 1680 360 2000 200",
  "M -60 640 C 100 540 360 760 600 580 S 960 340 1280 520 S 1680 700 2000 560",
  "M 200 900 C 400 780 680 1000 920 820 S 1280 580 1600 780 S 1900 960 2200 840",
  "M -200 500 C 40 380 320 620 560 440 S 920 200 1240 400 S 1620 600 1940 440",
];

interface PathProps {
  d: string;
  index: number;
}

function AnimatedPath({ d, index }: PathProps) {
  const duration = 6 + (index % 5) * 1.4;
  const delay = index * 0.18;
  const opacity = 0.06 + (index % 4) * 0.025;

  return (
    <motion.path
      d={d}
      stroke="currentColor"
      strokeWidth={1.2}
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{
        pathLength: { duration, delay, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 1.5, delay },
      }}
    />
  );
}

export function FloatingPaths() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <svg
        viewBox="0 0 2000 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full text-neutral-900 dark:text-white"
      >
        {PATHS.map((d, i) => (
          <AnimatedPath key={i} d={d} index={i} />
        ))}
      </svg>
    </div>
  );
}
