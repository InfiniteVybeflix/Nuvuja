"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Code2,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Keyboard,
} from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

const features = [
  {
    icon: Cloud,
    title: "Cloud Native",
    subtitle: "Works everywhere",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: Code2,
    title: "50+ Languages",
    subtitle: "Full support",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Zap,
    title: "AI Powered",
    subtitle: "Groq Intelligence",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Shield,
    title: "Privacy First",
    subtitle: "Your code stays yours",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

// Pre-defined particle positions — no Math.random() in render
const particles = [
  { size: 3, left: "10%", top: "20%", delay: "0s", duration: "6s" },
  { size: 2, left: "25%", top: "60%", delay: "1s", duration: "8s" },
  { size: 4, left: "40%", top: "15%", delay: "2s", duration: "5s" },
  { size: 2, left: "55%", top: "75%", delay: "0.5s", duration: "7s" },
  { size: 3, left: "70%", top: "30%", delay: "1.5s", duration: "6s" },
  { size: 2, left: "85%", top: "55%", delay: "3s", duration: "9s" },
  { size: 4, left: "15%", top: "80%", delay: "2.5s", duration: "5s" },
  { size: 2, left: "90%", top: "10%", delay: "1s", duration: "7s" },
  { size: 3, left: "50%", top: "45%", delay: "0s", duration: "8s" },
  { size: 2, left: "65%", top: "85%", delay: "4s", duration: "6s" },
  { size: 3, left: "30%", top: "35%", delay: "2s", duration: "7s" },
  { size: 2, left: "75%", top: "65%", delay: "1s", duration: "5s" },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        onStart();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onStart]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-sky-500/8 rounded-full blur-[100px]" />
      </div>

      {/* CSS Particles — zero JS overhead */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: p.top,
              background: i % 2 === 0 ? "rgba(56,189,248,0.4)" : "rgba(167,139,250,0.4)",
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl mx-auto px-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/30 to-purple-500/30 blur-2xl animate-pulse-slow" />
            <img
              src="https://i.ibb.co/HLCTPTWm/icon-192.png"
              alt="Nuvuja"
              className="relative w-full h-full object-contain drop-shadow-[0_0_30px_rgba(192,132,252,0.5)]"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl sm:text-6xl font-bold mb-3 tracking-tight"
        >
          <span className="bg-gradient-to-r from-sky-400 via-purple-400 to-purple-300 bg-clip-text text-transparent">
            Nuvuja
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-slate-400 text-lg sm:text-xl mb-2 font-medium"
        >
          Cloud-Born Code Editor
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="text-slate-500 text-sm sm:text-base mb-10 max-w-md mx-auto leading-relaxed"
        >
          AI-powered. Lightning-fast. Write, preview, and deploy — all in one cloud.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.08, duration: 0.4 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${feature.border} ${feature.bg} backdrop-blur-sm hover:scale-[1.02] transition-transform duration-200`}
            >
              <feature.icon size={20} className={feature.color} />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">{feature.title}</p>
                <p className="text-[11px] text-slate-500">{feature.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow animate-glow"
          >
            <Sparkles size={18} />
            Enter the Cloud
            <ArrowRight size={18} />
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center gap-2 text-slate-600 text-xs"
          >
            <Keyboard size={12} />
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700">Enter</kbd> to start</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Version badge */}
      <div className="absolute bottom-4 right-4 text-[10px] text-slate-700 font-mono">
        v1.0.0
      </div>
    </div>
  );
}
