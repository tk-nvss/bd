"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * PremiumLoader - "Aurora Core" Edition
 * High-fidelity SVG-based drawing motion with neon aesthetics.
 */
export default function PremiumLoader({ fullScreen = true }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
    : "relative w-full py-28 flex flex-col items-center justify-center rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/5 overflow-hidden";

  return (
    <div className={containerClasses} id="premium-loader">
      {/* Background Aurora Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, 90, 0],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[var(--accent)]/10 via-purple-500/10 to-blue-500/10 rounded-full blur-[140px] pointer-events-none"
      />

      <div className="relative flex flex-col items-center gap-16">
        
        {/* SVG Drawing Core */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          
          {/* Main Laser SVG Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="white"
              strokeWidth="1"
              className="opacity-5"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 0.4, 0.4, 0],
                pathOffset: [0, 0, 0.6, 1],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="drop-shadow-[0_0_8px_var(--accent)]"
            />
          </svg>

          {/* Secondary Particle SVG Ring */}
          <svg className="absolute inset-4 w-24 h-24 rotate-45">
             <motion.circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4 8"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="opacity-20"
            />
          </svg>

          {/* Glowing Nucleus Sparkle */}
          <div className="relative w-4 h-4">
             <motion.div 
               animate={{ 
                 scale: [1, 2, 1],
                 opacity: [0.5, 1, 0.5],
                 boxShadow: [
                   "0 0 10px var(--accent)",
                   "0 0 40px var(--accent), 0 0 80px white",
                   "0 0 10px var(--accent)"
                 ]
               }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 bg-white rounded-full"
             />
             <div className="absolute inset-[-10px] border border-white/10 rounded-full animate-ping" />
          </div>
        </div>

        {/* Shimmering Text Label */}
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-sm font-black tracking-[1.5em] text-white uppercase ml-[1.5em] drop-shadow-[0_0_10px_white]">
              Loading
            </span>
          </motion.div>
          
          {/* Neon Scanner Bar */}
          <div className="w-56 h-[1px] bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              animate={{ 
                x: ["-100%", "200%"],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: [0.45, 0, 0.55, 1]
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
