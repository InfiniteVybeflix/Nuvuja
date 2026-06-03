"use client";

import { motion } from "framer-motion";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="cursor-pointer"
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
      {/* Abstract aurora cloud */}
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
      {/* Code brackets inside */}
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

export function LogoFull() {
  return (
    <div className="flex items-center gap-3">
      <Logo size={36} />
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-purple-400 to-purple-300 bg-clip-text text-transparent">
          Nuvuja
        </span>
        <span className="text-[10px] text-slate-500 tracking-widest uppercase -mt-1">
          Cloud-Born Editor
        </span>
      </div>
    </div>
  );
}
