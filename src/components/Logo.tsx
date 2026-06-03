"use client";

import { motion } from "framer-motion";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="cursor-pointer shrink-0"
    >
      <defs>
        <linearGradient id="nuvujaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M20 60 Q30 30 50 35 Q70 40 80 60 Q85 75 70 80 Q50 85 30 80 Q15 75 20 60Z"
        fill="url(#nuvujaGradient)"
        filter="url(#glow)"
        opacity="0.9"
      />
      <path
        d="M25 55 Q35 25 55 30 Q75 35 85 55"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fill="white"
        fontSize="28"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
        opacity="0.95"
      >
        {"</>"}
      </text>
    </motion.svg>
  );
}

export function LogoFull({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Logo size={compact ? 24 : 28} />
      <div className="flex flex-col leading-none">
        <span className={cn(
          "font-bold tracking-tight bg-gradient-to-r from-sky-400 via-purple-400 to-purple-300 bg-clip-text text-transparent whitespace-nowrap",
          compact ? "text-base" : "text-lg"
        )}>
          Nuvuja
        </span>
        {!compact && (
          <span className="text-[9px] text-slate-500 tracking-widest uppercase">
            Cloud Editor
          </span>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
