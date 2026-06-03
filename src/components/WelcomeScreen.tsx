"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Cloud, Code2, Zap, Shield } from "lucide-react";
import { Logo } from "./Logo";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${Math.random() > 0.5 ? "56, 189, 248" : "167, 139, 250"}, ${Math.random() * 0.3 + 0.1})`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="inline-block mb-8"
        >
          <div className="relative">
            <Logo size={80} />
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl font-bold mb-4"
        >
          <span className="bg-gradient-to-r from-sky-400 via-purple-400 to-purple-300 bg-clip-text text-transparent">
            Nuvuja
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-slate-400 text-lg mb-2"
        >
          Cloud-Born Code Editor
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-slate-600 text-sm mb-10 max-w-md mx-auto"
        >
          Where code meets consciousness. An AI-powered editor born from the sky, 
          designed to elevate your craft to art.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { icon: Cloud, label: "Cloud Native", desc: "Works everywhere" },
            { icon: Code2, label: "50+ Languages", desc: "Full support" },
            { icon: Zap, label: "AI Powered", desc: "Groq Intelligence" },
            { icon: Shield, label: "Privacy First", desc: "Your code stays yours" },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-purple-500/30 transition-colors"
            >
              <feature.icon size={20} className="text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">{feature.label}</p>
              <p className="text-xs text-slate-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
        >
          <Sparkles size={18} />
          Enter the Cloud
          <ArrowRight size={18} />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-xs text-slate-700 mt-6"
        >
          Press Enter to start
        </motion.p>
      </div>
    </div>
  );
}
