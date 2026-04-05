"use client";

import React from "react";

/**
 * PremiumLoader - "Velocity Core" Edition
 * Optimized for maximum perceptual speed and extreme simplicity.
 * Zero-dependency, pure CSS, instant initialization.
 */
export default function PremiumLoader({ fullScreen = true }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
    : "relative w-full py-20 flex flex-col items-center justify-center rounded-2xl bg-[#080808] border border-white/5 overflow-hidden";

  return (
    <div className={containerClasses} id="premium-loader">
      <div className="relative flex flex-col items-center gap-12">

        {/* Core Spinner - High Speed */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Main fast ring */}
          <div
            className="absolute inset-0 border-2 border-transparent border-t-[var(--accent)] border-r-[var(--accent)]/30 rounded-full shadow-[0_0_20px_var(--accent)]"
            style={{ animation: 'fast-spin 0.4s linear infinite' }}
          />

          {/* Internal contrary ring */}
          <div
            className="absolute inset-4 border border-transparent border-b-white/40 rounded-full"
            style={{ animation: 'fast-spin 0.8s linear infinite reverse' }}
          />

          {/* Focal center */}
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white,0_0_30px_var(--accent)] animate-pulse" />
        </div>

        {/* Simplified Text Label */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black tracking-[0.6em] text-white uppercase opacity-40 animate-pulse">
            Loading
          </span>
          {/* Fast Scanning Bar */}
          <div className="w-32 h-[1px] bg-white/5 mt-4 relative overflow-hidden">
            <div
              className="absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
              style={{ animation: 'fast-scan 0.7s linear infinite' }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fast-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fast-scan {
          0% { left: -100%; }
          100% { left: 150%; }
        }
      `}</style>
    </div>
  );
}
