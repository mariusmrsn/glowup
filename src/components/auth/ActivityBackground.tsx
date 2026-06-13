"use client";

import { motion } from "framer-motion";

function Float({ children, delay = 0, duration = 9 }: { children: React.ReactNode; delay?: number; duration?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

const SoccerBall = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="50" r="42" />
    <path d="M50 8 L62 28 L88 28 L78 50 L88 72 L62 72 L50 92 L38 72 L12 72 L22 50 L12 28 L38 28 Z" />
    <line x1="50" y1="8" x2="62" y2="28" />
    <line x1="50" y1="92" x2="62" y2="72" />
    <line x1="50" y1="8" x2="38" y2="28" />
    <line x1="50" y1="92" x2="38" y2="72" />
  </svg>
);

const Bicycle = () => (
  <svg viewBox="0 0 140 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="25" cy="72" r="22" />
    <circle cx="115" cy="72" r="22" />
    <path d="M25 72 L65 38 L115 72" />
    <path d="M65 38 L65 22" />
    <path d="M48 60 L65 38" />
    <path d="M104 35 L118 30 M104 35 L118 42" />
    <circle cx="65" cy="38" r="4" fill="currentColor" stroke="none" />
    <path d="M55 72 L65 38" />
  </svg>
);

const Dumbbell = () => (
  <svg viewBox="0 0 120 60" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="30" y1="30" x2="90" y2="30" />
    <rect x="6" y="14" width="18" height="32" rx="4" />
    <rect x="24" y="20" width="8" height="20" rx="2" />
    <rect x="96" y="14" width="18" height="32" rx="4" />
    <rect x="88" y="20" width="8" height="20" rx="2" />
  </svg>
);

const Trophy = () => (
  <svg viewBox="0 0 100 110" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M28 12 L72 12 L72 48 C72 65 61 76 50 78 C39 76 28 65 28 48 Z" />
    <path d="M14 12 L28 12 C28 12 26 42 16 44 C8 45 6 33 14 24 Z" />
    <path d="M86 12 L72 12 C72 12 74 42 84 44 C92 45 94 33 86 24 Z" />
    <line x1="50" y1="78" x2="50" y2="93" />
    <path d="M33 93 L67 93" />
    <path d="M28 100 L72 100" />
  </svg>
);

const TennisRacket = () => (
  <svg viewBox="0 0 90 130" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="42" cy="38" rx="28" ry="33" />
    <line x1="42" y1="5" x2="42" y2="71" strokeWidth="1.8" />
    <line x1="14" y1="38" x2="70" y2="38" strokeWidth="1.8" />
    <line x1="18" y1="18" x2="66" y2="58" strokeWidth="1.5" />
    <line x1="18" y1="58" x2="66" y2="18" strokeWidth="1.5" />
    <line x1="25" y1="10" x2="59" y2="66" strokeWidth="1.2" />
    <line x1="25" y1="66" x2="59" y2="10" strokeWidth="1.2" />
    <path d="M58 62 L78 98" strokeWidth="5" />
    <circle cx="68" cy="112" r="8" />
  </svg>
);

const RunningShoe = () => (
  <svg viewBox="0 0 130 80" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 62 C12 62 18 30 42 30 C54 30 60 42 72 42 C84 42 98 36 110 42 C122 48 118 62 110 64 L12 64 Z" />
    <path d="M42 30 C42 18 50 14 58 20" />
    <path d="M55 50 L88 44" strokeWidth="2.5" />
    <path d="M56 56 L90 50" strokeWidth="2.5" />
    <path d="M10 64 L122 64 C124 70 118 70 10 70" />
  </svg>
);

const Stopwatch = () => (
  <svg viewBox="0 0 100 110" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="65" r="38" />
    <path d="M44 22 L44 16 L56 16 L56 22" />
    <line x1="50" y1="20" x2="50" y2="28" />
    <line x1="38" y1="14" x2="30" y2="6" />
    <line x1="62" y1="14" x2="70" y2="6" />
    <line x1="50" y1="65" x2="50" y2="42" />
    <line x1="50" y1="65" x2="68" y2="74" strokeWidth="2.5" />
    <circle cx="50" cy="65" r="3" fill="currentColor" stroke="none" />
  </svg>
);

const Basketball = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="50" r="42" />
    <path d="M50 8 C50 8 30 30 30 50 C30 70 50 92 50 92" />
    <path d="M50 8 C50 8 70 30 70 50 C70 70 50 92 50 92" />
    <line x1="8" y1="50" x2="92" y2="50" />
  </svg>
);

const Medal = () => (
  <svg viewBox="0 0 90 120" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="45" cy="82" r="30" />
    <line x1="45" y1="68" x2="45" y2="96" strokeWidth="3" />
    <path d="M39" y1="74" x2="45" y2="68" strokeWidth="3" />
    <path d="M36 96 L54 96" strokeWidth="3" />
    <path d="M33 52 L22 18 L45 26 L68 18 L57 52" />
  </svg>
);

const Whistle = () => (
  <svg viewBox="0 0 110 80" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 30 L55 30 L68 50 C68 50 80 50 88 42 C96 34 94 18 82 16 C70 14 65 24 68 30" />
    <circle cx="35" cy="30" r="20" />
    <line x1="55" y1="22" x2="90" y2="8" />
  </svg>
);

type FigureItem = {
  Component: React.ComponentType;
  style: React.CSSProperties;
  width: number;
  opacity: number;
  rotate: number;
  delay: number;
  duration: number;
};

const FIGURES: FigureItem[] = [
  { Component: SoccerBall,   style: { top: "6%",    left: "5%"   }, width: 80,  opacity: 0.07, rotate: -8,  delay: 0,   duration: 9  },
  { Component: Bicycle,      style: { bottom: "8%", left: "2%"   }, width: 165, opacity: 0.06, rotate: 0,   delay: 1.5, duration: 11 },
  { Component: Basketball,   style: { top: "10%",   right: "4%"  }, width: 82,  opacity: 0.07, rotate: 10,  delay: 0.7, duration: 8  },
  { Component: Trophy,       style: { bottom: "5%", right: "4%"  }, width: 72,  opacity: 0.07, rotate: 3,   delay: 2,   duration: 10 },
  { Component: TennisRacket, style: { top: "42%",   right: "6%"  }, width: 65,  opacity: 0.07, rotate: 20,  delay: 1,   duration: 9  },
  { Component: Dumbbell,     style: { top: "38%",   left: "5%"   }, width: 110, opacity: 0.07, rotate: -5,  delay: 3,   duration: 10 },
  { Component: Stopwatch,    style: { top: "68%",   right: "12%" }, width: 65,  opacity: 0.06, rotate: 5,   delay: 0.5, duration: 8  },
  { Component: RunningShoe,  style: { bottom: "18%",left: "18%"  }, width: 100, opacity: 0.06, rotate: -3,  delay: 2.5, duration: 9  },
  { Component: Medal,        style: { top: "20%",   left: "20%"  }, width: 62,  opacity: 0.06, rotate: -6,  delay: 4,   duration: 11 },
  { Component: Whistle,      style: { bottom: "30%",right: "15%" }, width: 88,  opacity: 0.06, rotate: 12,  delay: 1.8, duration: 8  },
];

export function ActivityBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
      {/* Subtle center glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-indigo-600/[0.05] blur-[100px]" />
      </div>

      {FIGURES.map((fig, i) => (
        <div
          key={i}
          className="absolute text-foreground"
          style={{ ...fig.style, width: fig.width, opacity: fig.opacity }}
        >
          <Float delay={fig.delay} duration={fig.duration}>
            <div style={{ transform: `rotate(${fig.rotate}deg)` }}>
              <fig.Component />
            </div>
          </Float>
        </div>
      ))}
    </div>
  );
}
