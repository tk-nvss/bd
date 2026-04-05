"use client";

import { motion } from "framer-motion";
import {
  FiZap,
  FiShield,
  FiLock,
  FiClock,
  FiUsers,
  FiCpu
} from "react-icons/fi";

const HIGHLIGHTS = [
  {
    title: "INSTANT",
    subtitle: "DISPATCH",
    icon: FiZap,
  },
  {
    title: "100% SECURE",
    subtitle: "ENCRYPTED",
    icon: FiShield,
  },
  {
    title: "24/7 SUPPORT",
    subtitle: "SERVICE",
    icon: FiClock,
  },
];

export default function TrustHighlights() {
  return (
    <section className="py-8 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {HIGHLIGHTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="relative p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] group hover:border-[var(--accent)]/40 transition-all duration-300 overflow-hidden"
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="mb-3 text-[var(--accent)]">
                    <Icon size={20} />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] md:text-xs font-black text-[var(--foreground)] tracking-tight uppercase">
                      {item.title}
                    </span>
                    <p className="text-[8px] md:text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-70">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
