"use client";

import { motion } from "framer-motion";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="cursor-pointer shrink-0 relative"
      style={{ width: size, height: size }}
    >
      <img
        src="https://i.ibb.co/HLCTPTWm/icon-192.png"
        alt="Nuvuja"
        width={size}
        height={size}
        className="object-contain drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]"
      />
    </motion.div>
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
