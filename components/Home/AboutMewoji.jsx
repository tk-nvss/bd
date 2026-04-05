"use client";

import { motion } from "framer-motion";

export default function AboutMewoji() {
  return (
    <section className="py-4 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="relative p-6 md:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] transition-colors hover:border-accent/30 shadow-sm"
        >
          <div className="relative z-10 space-y-3">
            <h2 className="text-sm md:text-base font-black italic tracking-tight text-accent uppercase underline underline-offset-4 decoration-accent/20">
              Who is MEWOJI?
            </h2>
            
            <p className="text-[10px] md:text-xs font-bold text-[var(--muted)] leading-relaxed uppercase tracking-tight max-w-3xl">
              MEWOJI is a premium digital outlet dedicated to <span className="text-[var(--foreground)] font-black">instant gaming top-ups</span> and professional website services. We provide a secure bridge for players to access their favorite in-game currency with zero delay and maximum reliability.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

