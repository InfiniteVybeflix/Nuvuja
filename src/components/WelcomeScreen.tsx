"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  Code2,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Keyboard,
  ChevronDown,
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
    glow: "shadow-sky-500/20",
  },
  {
    icon: Code2,
    title: "50+ Languages",
    subtitle: "Full support",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/20",
  },
  {
    icon: Zap,
    title: "AI Powered",
    subtitle: "Groq Intelligence",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20",
  },
  {
    icon: Shield,
    title: "Privacy First",
    subtitle: "Your code stays yours",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
  },
];

// Pre-defined star positions for the night sky
const stars = [
  { size: 2, left: "5%", top: "8%", delay: "0s", duration: "4s" },
  { size: 1, left: "12%", top: "15%", delay: "1s", duration: "5s" },
  { size: 3, left: "20%", top: "5%", delay: "2s", duration: "6s" },
  { size: 1, left: "28%", top: "20%", delay: "0.5s", duration: "4s" },
  { size: 2, left: "35%", top: "10%", delay: "3s", duration: "7s" },
  { size: 1, left: "42%", top: "25%", delay: "1.5s", duration: "5s" },
  { size: 3, left: "50%", top: "8%", delay: "0s", duration: "6s" },
  { size: 1, left: "58%", top: "18%", delay: "2.5s", duration: "4s" },
  { size: 2, left: "65%", top: "6%", delay: "1s", duration: "5s" },
  { size: 1, left: "72%", top: "22%", delay: "3.5s", duration: "6s" },
  { size: 3, left: "80%", top: "12%", delay: "0.5s", duration: "4s" },
  { size: 1, left: "88%", top: "28%", delay: "2s", duration: "5s" },
  { size: 2, left: "95%", top: "10%", delay: "1.5s", duration: "7s" },
  { size: 1, left: "8%", top: "35%", delay: "4s", duration: "5s" },
  { size: 2, left: "15%", top: "40%", delay: "0s", duration: "6s" },
  { size: 1, left: "25%", top: "45%", delay: "2s", duration: "4s" },
  { size: 3, left: "38%", top: "38%", delay: "1s", duration: "5s" },
  { size: 1, left: "48%", top: "42%", delay: "3s", duration: "6s" },
  { size: 2, left: "60%", top: "35%", delay: "0.5s", duration: "4s" },
  { size: 1, left: "70%", top: "48%", delay: "2.5s", duration: "5s" },
  { size: 2, left: "82%", top: "40%", delay: "1.5s", duration: "6s" },
  { size: 1, left: "92%", top: "50%", delay: "0s", duration: "4s" },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [showHint, setShowHint] = useState(false);
  const [shootingStar, setShootingStar] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") onStart();
    };
    window.addEventListener("keydown", handler);
    
    // Show scroll hint after 3 seconds
    const hintTimer = setTimeout(() => setShowHint(true), 3000);
    
    // Trigger shooting star periodically
    const starTimer = setInterval(() => {
      setShootingStar(true);
      setTimeout(() => setShootingStar(false), 2500);
    }, 8000);

    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(hintTimer);
      clearInterval(starTimer);
    };
  }, [onStart]);

  const scrollToFeatures = useCallback(() => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden bg-[#020617]">
      {/* AURORA BOREALIS BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0a0e27] to-[#020617]" />
        
        {/* Aurora blob 1 — Cyan */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(56,189,248,0.6) 0%, transparent 70%)",
            filter: "blur(80px)",
            top: "-10%",
            left: "-20%",
            animation: "aurora-blob-1 20s ease-in-out infinite",
          }}
        />
        
        {/* Aurora blob 2 — Purple */}
        <div 
          className="absolute w-[900px] h-[900px] rounded-full opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(167,139,250,0.6) 0%, transparent 70%)",
            filter: "blur(100px)",
            top: "20%",
            right: "-30%",
            animation: "aurora-blob-2 25s ease-in-out infinite",
          }}
        />
        
        {/* Aurora blob 3 — Pink/Sky blend */}
        <div 
          className="absolute w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(192,132,252,0.5) 0%, rgba(56,189,248,0.3) 50%, transparent 70%)",
            filter: "blur(90px)",
            bottom: "-10%",
            left: "30%",
            animation: "aurora-blob-3 22s ease-in-out infinite",
          }}
        />
        
        {/* Stars */}
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-float-particle"
            style={{
              width: star.size,
              height: star.size,
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
        
        {/* Shooting star */}
        <AnimatePresence>
          {shootingStar && (
            <motion.div
              initial={{ x: "100vw", y: "-10vh", opacity: 1 }}
              animate={{ x: "60vw", y: "40vh", opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute w-32 h-px bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ transform: "rotate(-45deg)" }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* HERO SECTION */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Logo — MUCH LARGER */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
            className="mb-10"
          >
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/20 to-purple-500/20 blur-3xl animate-breathe" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500/15 to-sky-500/15 blur-2xl animate-breathe" style={{ animationDelay: "1s" }} />
              
              {/* Logo image */}
              <img
                src="https://i.ibb.co/HLCTPTWm/icon-192.png"
                alt="Nuvuja"
                className="relative w-full h-full object-contain drop-shadow-[0_0_40px_rgba(192,132,252,0.6)]"
              />
            </div>
          </motion.div>

          {/* Title with shimmer effect */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-6xl sm:text-7xl md:text-8xl font-bold mb-4 tracking-tight"
          >
            <span 
              className="bg-gradient-to-r from-sky-300 via-purple-300 to-purple-400 bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% auto",
                animation: "text-shimmer 5s linear infinite",
              }}
            >
              Nuvuja
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-slate-400 text-xl sm:text-2xl mb-3 font-light tracking-wide"
          >
            Cloud-Born Code Editor
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="text-slate-500 text-sm sm:text-base mb-12 max-w-md mx-auto leading-relaxed"
          >
            AI-powered. Lightning-fast. Where code meets the northern sky.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168,85,247,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-purple-500 to-purple-600 text-white font-semibold text-lg shadow-xl shadow-purple-500/20 transition-all"
            >
              <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
              Enter the Cloud
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-2 text-slate-600 text-xs"
            >
              <Keyboard size={12} />
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono text-[10px] border border-slate-700">Enter</kbd> to start</span>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <AnimatePresence>
            {showHint && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={scrollToFeatures}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
              >
                <span className="text-[10px] uppercase tracking-widest">Discover</span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <div id="features" className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-200 mb-3">Built for the Future</h2>
            <p className="text-slate-500 text-sm">Everything you need, nothing you don't</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border ${feature.border} ${feature.bg} backdrop-blur-sm hover:shadow-lg ${feature.glow} transition-shadow duration-300`}
              >
                <div className={`p-3 rounded-xl ${feature.bg}`}>
                  <feature.icon size={24} className={feature.color} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-200">{feature.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{feature.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <ArrowRight size={16} />
              Launch Editor
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 text-center">
        <p className="text-[10px] text-slate-700 font-mono">Nuvuja v1.0.0 — ᓄᕙᔭ</p>
      </div>
    </div>
  );
}
