"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");
  const [mounted, setMounted] = useState(false);

  // Load stored theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
    setMounted(true);
  }, []);

  // Toggle theme handler
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <div className="relative z-[90]">
      <motion.button
        onClick={toggleTheme}
        className="
          relative w-12 h-6 flex items-center bg-[var(--card)]/80 border border-[var(--border)]
          rounded-full p-1 cursor-pointer overflow-hidden backdrop-blur-md transition-shadow duration-300
          hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]
        "
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-[10px] shadow-lg shadow-[var(--accent)]/30"
          animate={{
            x: theme === "light" ? 22 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "light" ? <FiSun size={8} /> : <FiMoon size={8} />}
            </motion.span>
          </AnimatePresence>
        </motion.div>
        
        {/* Subtle Ambient Icons in background */}
        <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none opacity-20">
          <FiMoon size={10} className={theme === "dark" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
          <FiSun size={10} className={theme === "light" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
        </div>
      </motion.button>

      <style jsx>{`
        button {
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
