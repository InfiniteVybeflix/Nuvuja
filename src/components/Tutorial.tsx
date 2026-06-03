"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Code, MessageSquare, Eye, FolderTree, Zap } from "lucide-react";

const steps = [
  {
    title: "Welcome to Nuvuja",
    description: "Nuvuja (ᓄᕙᔭ) means 'cloud' in Inuktitut. This is where code meets consciousness — an editor born from the sky, powered by AI.",
    icon: Sparkles,
    color: "text-purple-400",
  },
  {
    title: "Your Workspace",
    description: "The left panel is your file explorer. Create files and folders, organize your project structure. Everything is saved automatically to your browser's local storage.",
    icon: FolderTree,
    color: "text-sky-400",
  },
  {
    title: "The Editor",
    description: "The center panel is your code editor powered by Monaco (the same engine as VS Code). It supports 50+ languages with syntax highlighting, IntelliSense, and error detection.",
    icon: Code,
    color: "text-emerald-400",
  },
  {
    title: "Live Preview",
    description: "Click the Preview button to see your HTML/CSS/JS projects come to life instantly. For other languages, the output panel shows compilation results.",
    icon: Eye,
    color: "text-amber-400",
  },
  {
    title: "Nuvuja AI",
    description: "The right panel is your AI collaborator. Ask questions, request code reviews, get fixes, or let Nuvuja write code for you. Use /review, /fix, /explain, or /generate commands.",
    icon: MessageSquare,
    color: "text-rose-400",
  },
  {
    title: "Power Commands",
    description: "Nuvuja AI can read your editor and type directly into it. Just ask 'Write a function to...' or 'Review this code' and watch the magic happen. No character limits. Pure power.",
    icon: Zap,
    color: "text-purple-400",
  },
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const CurrentIcon = steps[step].icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CurrentIcon size={20} className={steps[step].color} />
                  <h2 className="text-lg font-semibold text-slate-100">
                    {steps[step].title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-slate-400 leading-relaxed mb-8">
                {steps[step].description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        i === step ? "bg-purple-400" : "bg-slate-700"
                      )}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                    Back
                  </button>
                  {step < steps.length - 1 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-all"
                    >
                      Start Coding
                      <Sparkles size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="h-1 bg-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-400 to-purple-400"
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
