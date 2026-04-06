"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * PremiumLoader - "Cinematic Velocity" Edition
 * Ultra-fast, minimal, and theme-adaptive loading experience.
 */
export default function PremiumLoader({ fullScreen = true }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--background)] overflow-hidden"
    : "relative w-full py-20 flex flex-col items-center justify-center rounded-[2rem] bg-[var(--card)]/10 backdrop-blur-3xl border border-[var(--border)] overflow-hidden";

  return (
    <div className={containerClasses} id="premium-loader">
      {/* Subtle Depth Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--glow)_0%,transparent_70%)] opacity-30 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-10">
        
        {/* FAST SPINNING CORE */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          
          {/* Main Kinetic Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="opacity-20"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 0.3, 0.3, 0],
                pathOffset: [0, 0, 1, 1.2],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="drop-shadow-[0_0_8px_var(--accent)]"
            />
          </svg>

          {/* Centered Pulsing Spark */}
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 bg-[var(--accent)] rounded-full shadow-[0_0_15px_var(--accent)]"
          />
        </div>

        {/* Minimalist Info Group */}
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--foreground)] opacity-90">
              Initializing
            </span>
          </motion.div>
          
          {/* High-Velocity Scanner Bar */}
          <div className="w-40 h-[2px] bg-[var(--border)] rounded-full overflow-hidden relative opacity-50">
            <motion.div 
              animate={{ 
                x: ["-100%", "300%"],
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
